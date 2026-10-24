import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Award,
  Mic,
  Brain,
  Layers,
  ArrowRight,
  TrendingUp,
  History,
} from 'lucide-react';
import { VideoInputBar } from '../components/video/VideoInputBar.js';
import { VideoCard } from '../components/video/VideoCard.js';
import { RecommendationsGrid } from '../components/analytics/RecommendationsGrid.js';
import { useAuth } from '../context/AuthContext.js';
import { usePlayer } from '../context/PlayerContext.js';
import { FirestoreService } from '../services/firestoreService.js';
import { LearningHistoryItem } from '../types/learning.js';
import { StudyMindLogo } from '../components/common/StudyMindLogo.js';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const { loadAndAnalyzeVideo } = usePlayer();
  const [historyItems, setHistoryItems] = useState<LearningHistoryItem[]>([]);

  useEffect(() => {
    if (user) {
      FirestoreService.getUserLearningHistory(user.uid).then(setHistoryItems);
    }
  }, [user]);

  const handleSelectVideo = async (videoId: string) => {
    const ok = await loadAndAnalyzeVideo(videoId);
    if (ok) {
      onNavigate('learn');
    }
  };

  // Derive studied topics and weak topics for recommendations
  const studiedTopics = Array.from(
    new Set(historyItems.flatMap((h) => h.studiedTopics || []))
  );

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Hero Header Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-800/60 text-brand-300 text-xs font-semibold shadow-md shadow-brand-900/20">
          <StudyMindLogo variant="icon-only" className="w-3.5 h-3.5 text-brand-400" />
          <span>AI-Powered YouTube Learning Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Turn Any YouTube Video into an{' '}
          <span className="bg-gradient-to-r from-brand-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
            Interactive Masterclass
          </span>
        </h1>

        <p className="text-sm sm:text-base text-surface-muted max-w-2xl mx-auto leading-relaxed">
          Paste any educational YouTube URL. StudyMind AI transcribes the video, generates timestamped Smart Notes, dynamic Flashcards, MCQ Quizzes, and acts as your personal 24/7 AI & Voice Tutor.
        </p>

        {/* Primary URL Input Bar */}
        <div className="pt-4">
          <VideoInputBar onSuccess={() => onNavigate('learn')} />
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border space-y-2 hover:border-brand-500/40 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-brand-950/80 border border-brand-800 flex items-center justify-center text-brand-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white">Smart Notes</h4>
          <p className="text-[11px] text-surface-muted leading-relaxed">
            Detailed formulas, definitions, and seekable timestamps grounded in video captions.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border space-y-2 hover:border-brand-500/40 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white">Dynamic Flashcards</h4>
          <p className="text-[11px] text-surface-muted leading-relaxed">
            Auto-generated concept, formula & definition cards with 3D flip and mastery tracking.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border space-y-2 hover:border-brand-500/40 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
            <Award className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white">Adaptive Quizzes</h4>
          <p className="text-[11px] text-surface-muted leading-relaxed">
            MCQs identify student weaknesses and pinpoint exact revision targets.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border space-y-2 hover:border-brand-500/40 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400">
            <Mic className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white">Voice & AI Tutor</h4>
          <p className="text-[11px] text-surface-muted leading-relaxed">
            Hands-free voice tutor speaks responses aloud with animated soundwaves.
          </p>
        </div>
      </section>

      {/* Continue Learning / Recently Studied Videos */}
      {historyItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-brand-400" />
              <span>Continue Learning (Your History)</span>
            </h3>
            <button
              onClick={() => onNavigate('analysis')}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              <span>View Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {historyItems.slice(0, 4).map((item) => (
              <VideoCard
                key={item.id}
                video={{
                  id: item.videoId,
                  title: item.videoTitle,
                  channel: item.channel,
                  thumbnail: item.thumbnail,
                  isStudied: true,
                  lastScore: item.lastQuizScore,
                }}
                onSelect={handleSelectVideo}
              />
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Personalized Recommendations */}
      <section>
        <RecommendationsGrid
          studiedTopics={studiedTopics}
          weakTopics={[]}
          recentVideoTitles={historyItems.map((h) => h.videoTitle)}
          onSelectVideo={handleSelectVideo}
        />
      </section>
    </div>
  );
};
