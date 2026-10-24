import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  Award,
  Bot,
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Share2,
  Bookmark,
  CheckCircle,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext.js';
import { YouTubePlayer } from '../components/video/YouTubePlayer.js';
import { SmartNotesView } from '../components/learning/SmartNotesView.js';
import { FlashcardsView } from '../components/learning/FlashcardsView.js';
import { QuizView } from '../components/learning/QuizView.js';
import { AiTutorView } from '../components/learning/AiTutorView.js';
import { TranscriptViewer } from '../components/video/TranscriptViewer.js';
import { VideoInputBar } from '../components/video/VideoInputBar.js';

interface LearnPageProps {
  onNavigate: (page: string) => void;
}

export const LearnPage: React.FC<LearnPageProps> = ({ onNavigate }) => {
  const {
    currentVideo,
    transcript,
    hasTranscript,
    smartNotes,
    flashcards,
    quiz,
    activeTab,
    setActiveTab,
    isAnalyzing,
    isVideoCompleted,
    markVideoCompleted,
  } = usePlayer();

  const [showFullDesc, setShowFullDesc] = useState(false);

  if (!currentVideo) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-brand-950/70 border border-brand-800 text-brand-400 mx-auto flex items-center justify-center shadow-lg shadow-brand-900/30">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">No Video Loaded in Study Room</h2>
          <p className="text-xs sm:text-sm text-surface-muted max-w-md mx-auto">
            Paste an educational YouTube video link below to start your AI-powered study session.
          </p>
        </div>
        <VideoInputBar onSuccess={() => {}} />
      </div>
    );
  }

  const tabs = [
    { id: 'notes', label: 'Smart Notes', icon: BookOpen, count: smartNotes?.topics.length },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, count: flashcards.length },
    { id: 'quiz', label: 'MCQ Quiz', icon: Award, count: quiz.length },
    { id: 'tutor', label: 'AI Tutor', icon: Bot, isSpecial: true },
    { id: 'transcript', label: 'Transcript', icon: FileText, count: transcript.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Split layout: Video + Learning Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Player & Video Info — sticky while notes scroll */}
        {/* top-6: 24px from top of <main> (navbar is outside scroll container) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          {/* YouTube Video Player */}
          <YouTubePlayer videoId={currentVideo.id} />

          {/* Video Metadata Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-surface-border space-y-3 shadow-xl">
            <h1 className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentVideo.title}
            </h1>

            <div className="flex items-center justify-between text-xs text-surface-muted border-b border-surface-border/60 pb-3">
              <span className="font-semibold text-slate-300 truncate max-w-[200px]">
                {currentVideo.channel}
              </span>
              <div className="flex items-center gap-2">
                {isVideoCompleted ? (
                  <button
                    onClick={() => onNavigate('analyze')}
                    className="px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 text-[10px] font-bold border border-purple-600/50 flex items-center gap-1 hover:bg-purple-900 transition-all shadow-sm shadow-purple-900/30"
                    title="100% video completed! Open Revision in Analyze"
                  >
                    <CheckCircle className="w-3 h-3 text-purple-400" />
                    <span>100% Done • Revise in Analyze →</span>
                  </button>
                ) : hasTranscript ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 text-[10px] font-bold border border-emerald-700/50 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Captions Analyzed</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 text-[10px] font-bold border border-amber-700/50">
                    Overview Grounded
                  </span>
                )}
              </div>
            </div>

            {/* Quick Session Stats */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-[#0E0E1B] border border-surface-border/50">
                <span className="text-[10px] text-surface-muted block uppercase">Topics</span>
                <span className="text-sm font-black text-brand-300">
                  {smartNotes?.topics.length || 0}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#0E0E1B] border border-surface-border/50">
                <span className="text-[10px] text-surface-muted block uppercase">Flashcards</span>
                <span className="text-sm font-black text-indigo-300">
                  {flashcards.length}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#0E0E1B] border border-surface-border/50">
                <span className="text-[10px] text-surface-muted block uppercase">MCQs</span>
                <span className="text-sm font-black text-amber-300">
                  {quiz.length}
                </span>
              </div>
            </div>

            {/* Description toggle */}
            {currentVideo.description && (
              <div className="pt-2 text-xs">
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="flex items-center gap-1 text-surface-muted hover:text-slate-200 font-semibold mb-1"
                >
                  <span>Video Description</span>
                  {showFullDesc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {showFullDesc && (
                  <p className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto p-2.5 rounded-xl bg-[#0E0E1B] border border-surface-border">
                    {currentVideo.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Learning Suite Tabs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tab Selection Header — horizontal scroll without visible scrollbar */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-surface-card border border-surface-border overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-surface-muted hover:text-white hover:bg-surface-cardHover'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${tab.isSpecial && !isActive ? 'text-brand-400 animate-pulse' : ''}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#0E0E1B] text-surface-muted'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Area — natural height, scrolls with page */}
          <div className="min-h-[400px]">
            {activeTab === 'notes' && smartNotes && (
              <SmartNotesView notes={smartNotes} quizQuestions={quiz} />
            )}

            {activeTab === 'flashcards' && (
              <FlashcardsView cards={flashcards} />
            )}

            {activeTab === 'quiz' && (
              <QuizView questions={quiz} />
            )}

            {activeTab === 'tutor' && (
              <AiTutorView />
            )}

            {activeTab === 'transcript' && (
              <TranscriptViewer segments={transcript} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
