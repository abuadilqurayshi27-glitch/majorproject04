import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, BookOpen, Layers, Compass } from 'lucide-react';
import { ApiService } from '../../services/apiService.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePlayer } from '../../context/PlayerContext.js';
import { VideoCard } from '../video/VideoCard.js';

interface RecommendationsGridProps {
  studiedTopics: string[];
  weakTopics: string[];
  recentVideoTitles: string[];
  onSelectVideo: (videoId: string) => void;
}

export const RecommendationsGrid: React.FC<RecommendationsGridProps> = ({
  studiedTopics,
  weakTopics,
  recentVideoTitles,
  onSelectVideo,
}) => {
  const { profile } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    ApiService.getRecommendations({
      studiedTopics,
      weakTopics,
      recentVideoTitles,
      learningGoal: profile?.learningGoal,
      education: profile?.education,
      stream: profile?.stream,
      subjects: profile?.subjects,
      classLevel: profile?.classLevel,
      boardExam: profile?.boardExam,
    })
      .then((data) => {
        if (isMounted) {
          setRecommendations(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to load recommendations:', err);
        if (isMounted) setLoading(false);
      });

  }, [
    studiedTopics.length,
    weakTopics.length,
    recentVideoTitles.length,
    profile?.learningGoal,
    profile?.education,
    profile?.stream,
    profile?.classLevel,
    profile?.boardExam,
    profile?.subjects?.join(','),
  ]);

  if (loading) {
    return (
      <div className="p-8 text-center rounded-2xl bg-surface-card border border-surface-border space-y-3">
        <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-surface-muted">
          Synthesizing personalized recommendations from your learning history...
        </p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-400" />
            <span>Recommended Next Steps For You</span>
          </h3>
          <p className="text-xs text-surface-muted">
            Curated according to your watched lessons, topics studied, and quiz weak areas.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {recommendations.map((recGroup, gIdx) => (
          <div
            key={gIdx}
            className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4"
          >
            {/* Recommendation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-surface-border/60 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-950 text-brand-300 font-bold uppercase tracking-wider border border-brand-800/40">
                  Focus: {recGroup.subject}
                </span>
                <h4 className="text-sm font-bold text-white">
                  Next Step: {recGroup.topic}
                </h4>
              </div>
              <p className="text-xs text-brand-300/90 italic">
                {recGroup.reason}
              </p>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recGroup.recommendedVideos?.map((video: any, vIdx: number) => (
                <VideoCard
                  key={vIdx}
                  video={{
                    youtubeId: video.youtubeId,
                    title: video.title,
                    channel: video.channel,
                    thumbnail: video.thumbnail,
                    relevanceReason: video.relevanceReason,
                  }}
                  onSelect={onSelectVideo}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
