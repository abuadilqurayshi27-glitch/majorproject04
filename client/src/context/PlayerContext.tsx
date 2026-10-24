import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { VideoMetadata, TranscriptSegment } from '../types/video.js';
import { SmartNotes, Flashcard, QuizQuestion, SmartNotesMode, SmartNotesLength } from '../types/learning.js';
import { ApiService, AnalyzeVideoResponse } from '../services/apiService.js';
import { FirestoreService } from '../services/firestoreService.js';
import { useAuth } from './AuthContext.js';

type LearningTab = 'notes' | 'flashcards' | 'quiz' | 'tutor' | 'transcript';

interface PlayerContextType {
  currentVideo: VideoMetadata | null;
  transcript: TranscriptSegment[];
  hasTranscript: boolean;
  smartNotes: SmartNotes | null;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  activeTab: LearningTab;
  setActiveTab: (tab: LearningTab) => void;
  isAnalyzing: boolean;
  analysisStep: string;
  error: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isVideoCompleted: boolean;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  notesMode: SmartNotesMode;
  setNotesMode: (mode: SmartNotesMode) => void;
  notesLength: SmartNotesLength;
  setNotesLength: (length: SmartNotesLength) => void;
  loadAndAnalyzeVideo: (urlOrId: string, lang?: string) => Promise<boolean>;
  seekToTimestamp: (seconds: number) => void;
  registerPlayer: (player: any) => void;
  updateCurrentTime: (time: number) => void;
  updateDuration: (d: number) => void;
  recordLearningTime: (seconds: number) => void;
  flushLearningTime: () => void;
  markVideoCompleted: (videoId?: string) => Promise<void>;
  updateFlashcardStatus: (cardId: string, status: 'known' | 'review') => void;
  refreshSmartNotes: (lang?: string, mode?: SmartNotesMode, length?: SmartNotesLength) => Promise<boolean>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [currentVideo, setCurrentVideo] = useState<VideoMetadata | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [hasTranscript, setHasTranscript] = useState<boolean>(true);
  const [smartNotes, setSmartNotes] = useState<SmartNotes | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<LearningTab>('notes');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('original');
  const [notesMode, setNotesMode] = useState<SmartNotesMode>('deep');
  const [notesLength, setNotesLength] = useState<SmartNotesLength>('standard');

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isVideoCompleted, setIsVideoCompleted] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const accumulatedWatchSeconds = useRef<number>(0);

  const registerPlayer = (player: any) => {
    playerRef.current = player;
  };

  const seekToTimestamp = (seconds: number) => {
    setCurrentTime(seconds);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(seconds, true);
        playerRef.current.playVideo?.();
        setIsPlaying(true);
      } catch (e) {
        console.warn('Seek error:', e);
      }
    }
  };

  const updateCurrentTime = (time: number) => {
    setCurrentTime(time);
  };

  const updateDuration = (d: number) => {
    if (d > 0 && d !== duration) {
      setDuration(d);
    }
  };

  const markVideoCompleted = async (videoId?: string) => {
    const vid = videoId || currentVideo?.id;
    if (!vid) return;
    setIsVideoCompleted(true);
    if (user && currentVideo && currentVideo.id === vid) {
      flushLearningTime();
      await FirestoreService.recordLearningActivity({
        userId: user.uid,
        video: currentVideo,
        durationSeconds: 0,
        isCompleted: true,
        watchPercentage: 100,
        videoDuration: duration,
        studiedTopics: smartNotes?.topics.map((t) => t.title) || [],
      });

      await FirestoreService.saveNotification({
        id: `${user.uid}_unlocked_${currentVideo.id}`,
        userId: user.uid,
        videoId: currentVideo.id,
        videoTitle: currentVideo.title,
        type: 'revision_unlocked',
        title: '🎉 Revision Unlocked!',
        message: `You completed 100% of "${currentVideo.title}". Active Recall and Blurting revision are now ready!`,
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    }
  };

  const flushLearningTime = () => {
    if (user && currentVideo && accumulatedWatchSeconds.current > 0) {
      const watchPct = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;
      const completed = watchPct >= 100 || (currentTime >= duration - 3 && duration > 5);
      const secs = accumulatedWatchSeconds.current;
      accumulatedWatchSeconds.current = 0;
      FirestoreService.recordLearningActivity({
        userId: user.uid,
        video: currentVideo,
        durationSeconds: secs,
        studiedTopics: smartNotes?.topics.map((t) => t.title) || [],
        watchPercentage: watchPct,
        isCompleted: completed || isVideoCompleted,
        videoDuration: duration,
      });
    }
  };

  const recordLearningTime = (seconds: number) => {
    if (seconds <= 0) return;
    accumulatedWatchSeconds.current += seconds;
    const watchPct = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;
    const completed = watchPct >= 100 || (currentTime >= duration - 3 && duration > 5);

    if (completed && !isVideoCompleted) {
      setIsVideoCompleted(true);
    }

    if (user && currentVideo && (accumulatedWatchSeconds.current >= 30 || completed)) {
      const secs = accumulatedWatchSeconds.current;
      accumulatedWatchSeconds.current = 0;
      FirestoreService.recordLearningActivity({
        userId: user.uid,
        video: currentVideo,
        durationSeconds: secs,
        studiedTopics: smartNotes?.topics.map((t) => t.title) || [],
        watchPercentage: watchPct,
        isCompleted: completed || isVideoCompleted,
        videoDuration: duration,
      });
    }
  };

  const updateFlashcardStatus = (cardId: string, status: 'known' | 'review') => {
    setFlashcards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, userStatus: status } : c))
    );
    if (user && currentVideo) {
      FirestoreService.saveFlashcardStatus(user.uid, currentVideo.id, cardId, status);
      FirestoreService.recordLearningActivity({
        userId: user.uid,
        video: currentVideo,
        durationSeconds: 0,
        flashcardsStudied: 1,
      });
    }
  };

  const loadAndAnalyzeVideo = async (urlOrId: string, lang?: string): Promise<boolean> => {
    if (!urlOrId || !urlOrId.trim()) return false;
    setError(null);
    setIsAnalyzing(true);
    setAnalysisStep('Fetching video metadata and transcripts...');

    // Clear previous video data immediately to prevent cross-video bleeding
    setSmartNotes(null);
    setFlashcards([]);
    setQuiz([]);
    setTranscript([]);

    const targetLang = lang || selectedLanguage;

    try {
      setAnalysisStep('Consulting AI analysis engine (Gemini)...');
      const response: AnalyzeVideoResponse = await ApiService.analyzeVideo(
        urlOrId,
        targetLang,
        profile ?? undefined,
        notesMode,
        notesLength
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to analyze video');
      }

      setAnalysisStep('Extracting structured Smart Notes & Flashcards...');
      setCurrentVideo(response.video);
      setTranscript(response.transcript.segments || []);
      setHasTranscript(response.transcript.hasTranscript);
      setSmartNotes(response.smartNotes);
      setFlashcards(response.flashcards);
      setQuiz(response.quiz);
      setActiveTab('notes');

      // Persist all generated artifacts per video and user to prevent drift
      if (user) {
        const hist = await FirestoreService.getLearningHistoryItem(user.uid, response.video.id);
        setIsVideoCompleted(hist?.isCompleted || false);

        await FirestoreService.saveVideoMetadata(response.video);
        await FirestoreService.saveSmartNotes(user.uid, response.video.id, response.smartNotes);
        await FirestoreService.saveFlashcards(user.uid, response.video.id, response.flashcards);
        await FirestoreService.saveQuizQuestions(user.uid, response.video.id, response.quiz);
        await FirestoreService.recordLearningActivity({
          userId: user.uid,
          video: response.video,
          durationSeconds: 0,
          completedNotes: hist?.completedNotes || false,
          studiedTopics: response.smartNotes.topics.map((t) => t.title),
          isCompleted: hist?.isCompleted || false,
          watchPercentage: hist?.watchPercentage || 0,
        });
      }

      setIsAnalyzing(false);
      return true;
    } catch (err: any) {
      console.error('Error analyzing video:', err);
      // Reset state on failure so ungrounded/stale content is never shown
      setSmartNotes(null);
      setFlashcards([]);
      setQuiz([]);
      setTranscript([]);
      setError(err?.message || 'Unable to analyze video. Please check the URL or try again.');
      setIsAnalyzing(false);
      return false;
    }
  };

  const refreshSmartNotes = async (
    lang?: string,
    mode?: SmartNotesMode,
    length?: SmartNotesLength
  ): Promise<boolean> => {
    if (!currentVideo?.id) return false;
    const targetLang = lang || selectedLanguage;
    const targetMode = mode || notesMode;
    const targetLength = length || notesLength;
    if (mode) setNotesMode(mode);
    if (length) setNotesLength(length);

    try {
      const refreshedNotes = await ApiService.refreshSmartNotes(
        currentVideo.id,
        targetLang,
        profile ?? undefined,
        targetMode,
        targetLength
      );
      if (refreshedNotes && refreshedNotes.topics) {
        setSmartNotes(refreshedNotes);
        if (user) {
          await FirestoreService.saveSmartNotes(user.uid, currentVideo.id, refreshedNotes);
          // Update learning activity topics without resetting streak or adding duplicate rows
          await FirestoreService.recordLearningActivity({
            userId: user.uid,
            video: currentVideo,
            durationSeconds: 0,
            studiedTopics: refreshedNotes.topics.map((t) => t.title),
          });
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to refresh smart notes:', err);
      return false;
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentVideo,
        transcript,
        hasTranscript,
        smartNotes,
        flashcards,
        quiz,
        activeTab,
        setActiveTab,
        isAnalyzing,
        analysisStep,
        error,
        currentTime,
        duration,
        isPlaying,
        isVideoCompleted,
        selectedLanguage,
        setSelectedLanguage,
        notesMode,
        setNotesMode,
        notesLength,
        setNotesLength,
        loadAndAnalyzeVideo,
        seekToTimestamp,
        registerPlayer,
        updateCurrentTime,
        updateDuration,
        recordLearningTime,
        flushLearningTime,
        markVideoCompleted,
        updateFlashcardStatus,
        refreshSmartNotes,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};


export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};
