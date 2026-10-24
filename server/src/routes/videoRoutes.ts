import { Router, Request, Response } from 'express';
import { YouTubeService } from '../services/youtubeService.js';
import { GeminiService } from '../services/geminiService.js';
import { SmartNotesCorrection } from '../types/index.js';

export const videoRouter = Router();

// In-memory corrections registry for benchmark evaluation & quality tracking
const smartNotesCorrectionsStore: SmartNotesCorrection[] = [];

// In-memory tracking of in-progress video analyses to prevent duplicate stampeding requests
const pendingAnalyses = new Map<string, Promise<any>>();

/**
 * Fetch video metadata & check transcript availability
 */
videoRouter.post('/info', async (req: Request, res: Response) => {
  try {
    const { url, videoId: rawVideoId } = req.body;
    const videoId = rawVideoId || YouTubeService.extractVideoId(url);

    if (!videoId) {
      return res.status(400).json({ error: 'Invalid or missing YouTube URL/Video ID' });
    }

    const metadata = await YouTubeService.getVideoMetadata(videoId);
    const transcriptData = await YouTubeService.getTranscript(videoId);
    metadata.hasTranscript = transcriptData.hasTranscript;
    if (transcriptData.segments.length > 0) {
      metadata.transcriptSnippet = transcriptData.segments.slice(0, 3).map((s) => s.text).join(' ');
    }

    return res.json({
      success: true,
      video: metadata,
      hasTranscript: transcriptData.hasTranscript,
      transcriptSegmentCount: transcriptData.segments.length,
      transcriptError: transcriptData.error,
    });
  } catch (error: any) {
    console.error('Error fetching video info:', error);
    return res.status(500).json({ error: error?.message || 'Failed to fetch video information' });
  }
});

/**
 * Complete video analysis: fetches transcript, generates Smart Notes, Flashcards, and Quiz
 */
videoRouter.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { url, videoId: rawVideoId, targetLanguage, studentProfile, mode, lengthOption } = req.body;
    const videoId = rawVideoId || YouTubeService.extractVideoId(url);

    if (!videoId) {
      return res.status(400).json({ error: 'Invalid or missing YouTube URL/Video ID' });
    }

    const requestKey = `${videoId}_${targetLanguage || 'en'}_${mode || 'deep'}`;

    // If an analysis for this video is already in flight, wait for it to prevent duplicate requests
    if (pendingAnalyses.has(requestKey)) {
      console.log(`[VideoRouter] Reusing in-flight analysis promise for ${requestKey}`);
      const existingResult = await pendingAnalyses.get(requestKey);
      return res.json(existingResult);
    }

    const analysisPromise = (async () => {
      // 1. Fetch metadata & transcript (with targetLanguage translation if needed)
      const metadata = await YouTubeService.getVideoMetadata(videoId);
      const transcriptData = await YouTubeService.getTranscript(videoId, targetLanguage);
      metadata.hasTranscript = transcriptData.hasTranscript;

      // Honest rejection: never invent content or silently fall back to generic questions if transcript is missing
      if (!transcriptData.hasTranscript || !transcriptData.segments || transcriptData.segments.length === 0) {
        throw new Error('No transcript or closed captions available for this video. StudyMind AI requires an analyzed transcript to generate grounded Smart Notes, Flashcards, and Quizzes without inventing content.');
      }

      // 2. Generate Smart Notes grounded in the video (profile-personalized, English-only output)
      const detectedLang = transcriptData.detectedLanguage || metadata.detectedLanguage || 'English';
      console.log(`Analyzing video ${videoId}: "${metadata.title}" (Output Lang: English, Detected: ${detectedLang}, Level: ${studentProfile?.learningLevel || 'N/A'}, Goal: ${studentProfile?.learningGoal || 'N/A'}, Mode: ${mode || 'deep'}, Length: ${lengthOption || 'standard'})...`);
      const smartNotes = await GeminiService.generateSmartNotes(
        videoId,
        metadata.title,
        transcriptData.segments,
        metadata.description,
        'en',
        detectedLang,
        studentProfile,
        mode || 'deep',
        lengthOption || 'standard'
      );

      // 3. Generate dynamic Flashcards (profile-personalized difficulty, strictly grounded in English)
      const rawFlashcards = await GeminiService.generateFlashcards(smartNotes, transcriptData.segments, 'en', studentProfile);
      const flashcards = rawFlashcards.map(c => ({ ...c, videoId }));

      // 4. Generate dynamic MCQ Quiz (profile-personalized difficulty + interview mode, strictly grounded in English)
      const rawQuiz = await GeminiService.generateQuiz(smartNotes, transcriptData.segments, 'en', studentProfile);
      const quiz = rawQuiz.map(q => ({ ...q, videoId }));

      return {
        success: true,
        video: metadata,
        transcript: transcriptData,
        smartNotes,
        flashcards,
        quiz,
      };
    })();

    pendingAnalyses.set(requestKey, analysisPromise);
    try {
      const result = await analysisPromise;
      return res.json(result);
    } finally {
      pendingAnalyses.delete(requestKey);
    }
  } catch (error: any) {
    console.error('Error analyzing video:', error);
    return res.status(error?.message?.includes('No transcript') ? 400 : 500).json({
      success: false,
      error: error?.message || 'Failed to analyze video'
    });
  }
});

/**
 * Refresh Smart Notes: reprocesses the transcript and regenerates Smart Notes in-place
 */
videoRouter.post('/refresh-notes', async (req: Request, res: Response) => {
  try {
    const { url, videoId: rawVideoId, targetLanguage, studentProfile, mode, lengthOption } = req.body;
    const videoId = rawVideoId || YouTubeService.extractVideoId(url);

    if (!videoId) {
      return res.status(400).json({ error: 'Invalid or missing YouTube URL/Video ID' });
    }

    const metadata = await YouTubeService.getVideoMetadata(videoId);
    const transcriptData = await YouTubeService.getTranscript(videoId, targetLanguage);
    metadata.hasTranscript = transcriptData.hasTranscript;

    const detectedLang = transcriptData.detectedLanguage || metadata.detectedLanguage || 'English';
    console.log(`Refreshing Smart Notes for video ${videoId}: "${metadata.title}" (Output Lang: English, Detected: ${detectedLang}, Level: ${studentProfile?.learningLevel || 'N/A'}, Mode: ${mode || 'deep'}, Length: ${lengthOption || 'standard'})...`);
    const smartNotes = await GeminiService.generateSmartNotes(
      videoId,
      metadata.title,
      transcriptData.segments,
      metadata.description,
      'en',
      detectedLang,
      studentProfile,
      mode || 'deep',
      lengthOption || 'standard'
    );

    return res.json({
      success: true,
      video: metadata,
      smartNotes,
    });
  } catch (error: any) {
    console.error('Error refreshing Smart Notes:', error);
    return res.status(500).json({ error: error?.message || 'Failed to refresh Smart Notes' });
  }
});

/**
 * Automatically identify and return ONLY the main topic taught in the video
 */
videoRouter.post('/identify-topic', async (req: Request, res: Response) => {
  try {
    const { url, videoId: rawVideoId } = req.body;
    const videoId = rawVideoId || YouTubeService.extractVideoId(url);

    if (!videoId) {
      return res.status(400).json({ error: 'Invalid or missing YouTube URL/Video ID' });
    }

    // 1. Fetch metadata (actual title, description, detected language)
    const metadata = await YouTubeService.getVideoMetadata(videoId);

    // 2. Fetch transcript snippet if available
    let transcriptSnippet = '';
    try {
      const transcriptData = await YouTubeService.getTranscript(videoId);
      if (transcriptData.segments && transcriptData.segments.length > 0) {
        transcriptSnippet = transcriptData.segments.slice(0, 15).map((s) => s.text).join(' ');
      }
    } catch {
      // Transcript might not exist, proceed with title + description
    }

    // 3. Identify main topic using actual YouTube title first, then description/transcript
    const topicFormatted = await GeminiService.identifyMainTopic(
      metadata.title,
      metadata.description,
      transcriptSnippet
    );

    const mainTopic = topicFormatted.replace(/^Topic:\s*/i, '').trim();

    return res.json({
      success: true,
      topic: topicFormatted, // e.g. "Topic: SQL Database Indexing"
      mainTopic: mainTopic,
      videoTitle: metadata.title,
      videoId: videoId,
      detectedLanguage: metadata.detectedLanguage,
      detectedLanguageCode: metadata.detectedLanguageCode,
    });
  } catch (error: any) {
    console.error('Error identifying video topic:', error);
    return res.status(500).json({ error: error?.message || 'Failed to identify topic' });
  }
});

/**
 * Fetch raw transcript
 */
videoRouter.get('/:videoId/transcript', async (req: Request, res: Response) => {
  try {
    const videoId = Array.isArray(req.params.videoId) ? req.params.videoId[0] : req.params.videoId;
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    const transcriptData = await YouTubeService.getTranscript(videoId);
    return res.json({
      success: true,
      ...transcriptData,
    });
  } catch (error: any) {
    console.error('Error getting transcript:', error);
    return res.status(500).json({ error: error?.message || 'Failed to get transcript' });
  }
});

/**
 * Submit user-reviewed correction for Smart Notes
 */
videoRouter.post('/notes-correction', async (req: Request, res: Response) => {
  try {
    const correction: SmartNotesCorrection = req.body;
    if (!correction || !correction.videoId || !correction.correctedContent) {
      return res.status(400).json({ error: 'Valid correction payload with videoId and correctedContent is required' });
    }

    if (!correction.id) {
      correction.id = `corr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }
    if (!correction.createdAt) {
      correction.createdAt = new Date().toISOString();
    }
    correction.isApproved = true; // Mark as human-reviewed and verified

    // Store in-memory
    const existingIndex = smartNotesCorrectionsStore.findIndex(c => c.id === correction.id);
    if (existingIndex >= 0) {
      smartNotesCorrectionsStore[existingIndex] = correction;
    } else {
      smartNotesCorrectionsStore.push(correction);
    }

    console.log(`[SmartNotesCorrection] Stored verified correction ${correction.id} for video "${correction.videoTitle || correction.videoId}"`);
    return res.json({
      success: true,
      message: 'Correction stored successfully for benchmark evaluation',
      correction,
    });
  } catch (error: any) {
    console.error('Error saving Smart Notes correction:', error);
    return res.status(500).json({ error: error?.message || 'Failed to save correction' });
  }
});

/**
 * Get verified Smart Notes corrections
 */
videoRouter.get('/notes-corrections', async (req: Request, res: Response) => {
  try {
    const videoId = req.query.videoId as string | undefined;
    const corrections = videoId 
      ? smartNotesCorrectionsStore.filter(c => c.videoId === videoId)
      : smartNotesCorrectionsStore;

    return res.json({
      success: true,
      count: corrections.length,
      corrections,
    });
  } catch (error: any) {
    console.error('Error fetching Smart Notes corrections:', error);
    return res.status(500).json({ error: error?.message || 'Failed to fetch corrections' });
  }
});

