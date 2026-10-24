import React from 'react';
import { VoiceTutorView } from '../components/learning/VoiceTutorView.js';
import { usePlayer } from '../context/PlayerContext.js';
import { BookOpen, Sparkles } from 'lucide-react';

interface VoiceTutorPageProps {
  onNavigate: (page: string) => void;
}

export const VoiceTutorPage: React.FC<VoiceTutorPageProps> = ({ onNavigate }) => {
  const { currentVideo } = usePlayer();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Active context card if video loaded */}
      {currentVideo ? (
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentVideo.thumbnail}
              alt={currentVideo.title}
              className="w-16 h-11 rounded-lg object-cover border border-surface-border shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block">
                Active Study Context
              </span>
              <p className="text-xs font-bold text-white truncate">
                {currentVideo.title}
              </p>
              <p className="text-[11px] text-surface-muted truncate">
                {currentVideo.channel}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('learn')}
            className="px-3 py-1.5 rounded-xl bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white text-xs font-semibold whitespace-nowrap transition-colors"
          >
            Open Notes →
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-surface-muted">
            <BookOpen className="w-4 h-4 text-brand-400" />
            <span>No video actively selected. The Voice Tutor will answer general academic questions!</span>
          </div>
          <button
            onClick={() => onNavigate('home')}
            className="px-3 py-1.5 rounded-xl bg-surface-cardHover hover:bg-brand-600 text-slate-200 text-xs font-semibold whitespace-nowrap transition-colors"
          >
            Pick a Video
          </button>
        </div>
      )}

      {/* Main Voice Visualizer Component */}
      <VoiceTutorView />
    </div>
  );
};
