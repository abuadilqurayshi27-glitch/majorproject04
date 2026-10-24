import React, { useState } from 'react';
import { Search, Play, Clock, AlertCircle } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.js';
import { TranscriptSegment } from '../../types/video.js';

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ segments }) => {
  const { currentTime, seekToTimestamp, hasTranscript } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSegments = segments.filter((s) =>
    s.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!hasTranscript || segments.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-surface-card border border-surface-border space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white">Closed Captions Unavailable for This Video</h4>
        <p className="text-xs text-surface-muted max-w-md mx-auto">
          The video author has disabled captions or YouTube has not auto-transcribed it yet. StudyMind AI has generated structured Smart Notes, Flashcards, and Quiz based on the video context.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Filter Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-surface-muted" />
          <input
            type="text"
            placeholder="Search within video transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-card border border-surface-border rounded-xl text-xs text-white placeholder-surface-muted/60 focus:outline-none focus:border-brand-500"
          />
        </div>
        <span className="text-xs text-surface-muted shrink-0 font-medium">
          {filteredSegments.length} segments
        </span>
      </div>

      {/* Segments List — scrolls naturally with the page (no nested scroll container) */}
      <div className="space-y-2">
        {filteredSegments.map((segment, idx) => {
          const isActive =
            currentTime >= segment.start &&
            currentTime < segment.start + (segment.duration || 4);

          return (
            <div
              key={idx}
              onClick={() => seekToTimestamp(segment.start)}
              className={`group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                isActive
                  ? 'bg-brand-950/60 border-brand-500/60 text-white shadow-md shadow-brand-900/30'
                  : 'bg-surface-card hover:bg-surface-cardHover border-surface-border/50 text-slate-300'
              }`}
            >
              {/* Timestamp Seek Button */}
              <button
                type="button"
                className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold flex items-center gap-1 shrink-0 ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'bg-[#0E0E1B] text-brand-300 group-hover:bg-brand-900/50'
                }`}
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>{formatTime(segment.start)}</span>
              </button>

              {/* Segment Text */}
              <p className="text-xs leading-relaxed flex-1 pt-0.5">
                {segment.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
