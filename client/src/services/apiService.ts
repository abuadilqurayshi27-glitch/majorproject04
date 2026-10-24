import { VideoMetadata, TranscriptSegment } from '../types/video.js';
import { SmartNotes, Flashcard, QuizQuestion, SmartNotesMode, SmartNotesLength } from '../types/learning.js';
import { TutorMessage } from '../types/tutor.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface AnalyzeVideoResponse {
  success: boolean;
  video: VideoMetadata;
  transcript: {
    segments: TranscriptSegment[];
    fullText: string;
    hasTranscript: boolean;
    error?: string;
  };
  smartNotes: SmartNotes;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  error?: string;
}

export class ApiService {
  /**
   * Fetch video metadata
   */
  public static async getVideoInfo(urlOrId: string): Promise<{ success: boolean; video: VideoMetadata; hasTranscript: boolean; error?: string }> {
    const res = await fetch(`${API_BASE}/api/video/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlOrId }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch video information');
    }
    return data;
  }

  /**
   * Analyze complete video (Smart Notes + Flashcards + Quiz), optionally personalized by student profile
   */
  public static async analyzeVideo(
    urlOrId: string,
    targetLanguage?: string,
    studentProfile?: {
      name?: string;
      age?: number;
      education?: string;
      stream?: string;
      course?: string;
      subjects?: string[];
      learningGoal?: string;
      learningLevel?: string;
    },
    mode?: SmartNotesMode,
    lengthOption?: SmartNotesLength
  ): Promise<AnalyzeVideoResponse> {
    const res = await fetch(`${API_BASE}/api/video/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlOrId, targetLanguage, studentProfile, mode, lengthOption }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to analyze video');
    }
    return data;
  }

  /**
   * Refresh Smart Notes: reprocess the video/transcript and update notes in-place (profile-personalized)
   */
  public static async refreshSmartNotes(
    urlOrId: string,
    targetLanguage?: string,
    studentProfile?: {
      name?: string;
      age?: number;
      education?: string;
      stream?: string;
      course?: string;
      subjects?: string[];
      learningGoal?: string;
      learningLevel?: string;
    },
    mode?: SmartNotesMode,
    lengthOption?: SmartNotesLength
  ): Promise<SmartNotes> {
    const res = await fetch(`${API_BASE}/api/video/refresh-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlOrId, targetLanguage, studentProfile, mode, lengthOption }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to refresh Smart Notes');
    }
    return data.smartNotes;
  }

  /**
   * Automatically identify and return ONLY the main topic taught in the video
   */
  public static async identifyTopic(urlOrId: string): Promise<{
    topic: string;
    mainTopic: string;
    videoTitle: string;
    detectedLanguage?: string;
    detectedLanguageCode?: string;
  }> {
    const res = await fetch(`${API_BASE}/api/video/identify-topic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlOrId }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to identify topic');
    }
    return {
      topic: data.topic,
      mainTopic: data.mainTopic,
      videoTitle: data.videoTitle,
      detectedLanguage: data.detectedLanguage,
      detectedLanguageCode: data.detectedLanguageCode,
    };
  }

  /**
   * AI Tutor chat
   */
  public static async sendTutorMessage(params: {
    message: string;
    quickAction?: string;
    videoTitle: string;
    notes?: SmartNotes;
    transcriptSnippet?: string;
    history: TutorMessage[];
    studentProfile?: any;
    weakTopics?: string[];
  }): Promise<{ reply: string; timestamp: string }> {
    const res = await fetch(`${API_BASE}/api/tutor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to communicate with AI Tutor');
    }
    return data;
  }

  /**
   * Voice Tutor speech response
   */
  public static async sendVoiceSpeech(params: {
    userSpeech: string;
    videoTitle?: string;
    notes?: SmartNotes;
    studentName?: string;
  }): Promise<{ reply: string }> {
    const res = await fetch(`${API_BASE}/api/tutor/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to process voice response');
    }
    return data;
  }

  /**
   * Get dynamic recommendations
   */
  public static async getRecommendations(params: {
    studiedTopics: string[];
    weakTopics: string[];
    recentVideoTitles: string[];
    learningGoal?: string;
    education?: string;
    stream?: string;
    subjects?: string[];
    classLevel?: string;
    boardExam?: string;
  }): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch recommendations');
    }
    return data.recommendations || [];
  }

  /**
   * Check backend status
   */
  public static async checkStatus(): Promise<{ hasGeminiKey: boolean; hasYouTubeKey: boolean; geminiModel: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/settings/status`);
      return await res.json();
    } catch {
      return { hasGeminiKey: false, hasYouTubeKey: false, geminiModel: 'gemini-1.5-flash' };
    }
  }

  /**
   * Update backend Gemini API key
   */
  public static async updateGeminiKey(apiKey: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/settings/gemini-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    const data = await res.json();
    return data.success;
  }
}
