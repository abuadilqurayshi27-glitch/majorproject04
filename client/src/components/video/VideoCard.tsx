import React from 'react';
import { Play, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { VideoMetadata } from '../../types/video.js';

interface VideoCardProps {
  video: {
    id?: string;
    youtubeId?: string;
    title: string;
    channel: string;
    thumbnail: string;
    duration?: string;
    relevanceReason?: string;
    isStudied?: boolean;
    lastScore?: number;
  };
  onSelect: (id: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect }) => {
  const videoId = video.id || video.youtubeId || '';

  return (
    <div
      onClick={() => onSelect(videoId)}
      className="group cursor-pointer rounded-2xl bg-surface-card border border-surface-border overflow-hidden hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Thumbnail container */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Play hover button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg shadow-brand-600/50 transform group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 ml-0.5 fill-white" />
            </div>
          </div>

          {/* Duration or badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono font-medium text-white flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-slate-400" />
              <span>{video.duration}</span>
            </div>
          )}

          {/* Studied badge */}
          {video.isStudied && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Studied</span>
              {video.lastScore !== undefined && (
                <span className="font-bold ml-0.5">({video.lastScore}%)</span>
              )}
            </div>
          )}
        </div>

        {/* Video metadata */}
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 group-hover:text-brand-300 transition-colors">
            {video.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-surface-muted">
            <span className="truncate">{video.channel}</span>
          </div>

          {/* AI Recommendation Reason */}
          {video.relevanceReason && (
            <div className="p-2 rounded-lg bg-brand-950/40 border border-brand-800/30 text-[11px] text-brand-300 flex items-start gap-1.5">
              <Sparkles className="w-3 h-3 text-brand-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{video.relevanceReason}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-3 pt-1">
        <button className="w-full py-1.5 px-3 bg-surface-cardHover group-hover:bg-brand-600 text-xs font-semibold text-slate-200 group-hover:text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-brand-400 group-hover:text-white" />
          <span>Launch AI Study Room</span>
        </button>
      </div>
    </div>
  );
};
