import { VideoMetadata, TranscriptSegment } from '../types/video.js';
import { SmartNotes, Flashcard, QuizQuestion, SmartNotesMode, SmartNotesLength } from '../types/learning.js';
import { TutorMessage } from '../types/tutor.js';

const rawApiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim();
const API_BASE = rawApiBase.replace(/\/+$/, '');

/**
 * Robust fetch wrapper that produces friendly error messages
 * when the backend API is unreachable or blocked by CORS / mixed-content
 */
async function apiRequest<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  let res: Response;

  try {
    res = await fetch(url, options);
  } catch (err: any) {
    if (err instanceof TypeError || (err?.message && err.message.toLowerCase().includes('fetch'))) {
      if (API_BASE.includes('localhost')) {
        throw new Error(
          'Cannot connect to backend server at localhost:5000. If you are viewing on Vercel, please deploy the backend server (e.g. on Render) and set the VITE_API_URL environment variable in your Vercel Project Settings.'
        );
      }
      throw new Error(
        `Unable to reach backend server at ${API_BASE}. Please verify your backend is running, awake, and accessible.`
      );
    }
    throw err;
  }

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON response
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

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
    return apiRequest('/api/video/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlOrId }),
    });
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
    return apiRequest('/api/video/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlOrId, targetLanguage, studentProfile, mode, lengthOption }),
    });
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
    const data = await apiRequest('/api/video/refresh-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlOrId, targetLanguage, studentProfile, mode, lengthOption }),
    });

    if (!data.success) {
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
    const data = await apiRequest('/api/video/identify-topic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlOrId }),
    });

    if (!data.success) {
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
    return apiRequest('/api/tutor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
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
    return apiRequest('/api/tutor/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
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
    const data = await apiRequest('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return data.recommendations || [];
  }

  /**
   * Check backend status
   */
  public static async checkStatus(): Promise<{ hasGeminiKey: boolean; hasYouTubeKey: boolean; geminiModel: string }> {
    try {
      return await apiRequest('/api/settings/status');
    } catch {
      return { hasGeminiKey: false, hasYouTubeKey: false, geminiModel: 'gemini-1.5-flash' };
    }
  }

  /**
   * Update backend Gemini API key
   */
  public static async updateGeminiKey(apiKey: string): Promise<boolean> {
    const data = await apiRequest('/api/settings/gemini-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    return data.success;
  }
}
