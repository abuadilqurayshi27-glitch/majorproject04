import { Router, Request, Response } from 'express';
import { GeminiService } from '../services/geminiService.js';

export const tutorRouter = Router();

/**
 * AI Tutor multi-turn chat endpoint
 */
tutorRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      quickAction,
      videoTitle,
      notes,
      transcriptSnippet,
      history = [],
      studentProfile,
      weakTopics = [],
    } = req.body;

    if (!message && !quickAction) {
      return res.status(400).json({ error: 'Message or quickAction is required' });
    }

    const reply = await GeminiService.answerTutorQuery({
      message: message || `Can you please: ${quickAction}?`,
      quickAction,
      videoTitle: videoTitle || 'Educational Lesson',
      notes,
      transcriptSnippet,
      history,
      studentProfile,
      weakTopics,
    });

    return res.json({
      success: true,
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Tutor chat error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to process tutor query' });
  }
});

/**
 * Voice Tutor conversational response endpoint
 */
tutorRouter.post('/voice', async (req: Request, res: Response) => {
  try {
    const { userSpeech, videoTitle, notes, studentName } = req.body;

    if (!userSpeech) {
      return res.status(400).json({ error: 'Speech text is required' });
    }

    const reply = await GeminiService.answerVoiceTutor({
      userSpeech,
      videoTitle,
      notes,
      studentName,
    });

    return res.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error('Voice tutor error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to process voice tutor query' });
  }
});
