import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  Brain,
  History,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { usePlayer } from '../context/PlayerContext.js';
import { FirestoreService } from '../services/firestoreService.js';
import { StudentAnalytics, LearningHistoryItem } from '../types/learning.js';
import { ProgressCharts } from '../components/analytics/ProgressCharts.js';
import { RevisionSection } from '../components/analytics/RevisionSection.js';

interface AnalysisPageProps {
  onNavigate: (page: string) => void;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const { loadAndAnalyzeVideo } = usePlayer();
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [historyItems, setHistoryItems] = useState<LearningHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = user?.uid || 'demo_student_studymind_01';
    setLoading(true);

    Promise.all([
      FirestoreService.getStudentAnalytics(uid),
      FirestoreService.getUserLearningHistory(uid),
    ]).then(([analyticsData, hist]) => {
      setAnalytics(analyticsData);
      setHistoryItems(hist);
      setLoading(false);
    });
  }, [user]);

  const handleResumeVideo = async (videoId: string) => {
    const ok = await loadAndAnalyzeVideo(videoId);
    if (ok) {
      onNavigate('learn');
    }
  };

  if (loading || !analytics) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-surface-muted">
          Aggregating Firebase learning activity, quiz records & topic mastery...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-950/70 border border-brand-800 text-brand-300 text-xs font-semibold mb-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-brand-400" />
            <span>Real-time Learning Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {profile?.name || user?.displayName || 'Student'}'s Learning Analytics
          </h2>
          <p className="text-xs text-surface-muted">
            Track your study hours, flashcard mastery, and identified weak concepts across all YouTube lessons.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Day Streak & Today Status */}
          <div className="p-3 rounded-2xl bg-surface-card border border-surface-border text-left flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-950/60 text-orange-400">
              <Flame className={`w-4 h-4 ${analytics.dayStreak > 0 ? 'text-orange-400 fill-orange-400 animate-pulse' : 'text-surface-muted'}`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-surface-muted uppercase font-semibold">
                  Day Streak
                </span>
                {analytics.hasCompletedTodayActivity ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 font-bold border border-emerald-800/60">
                    Safe 🔥
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-400 font-bold border border-amber-800/60">
                    Pending
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-orange-300 block">
                {analytics.dayStreak} {analytics.dayStreak === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          </div>

          {/* Dynamically Learned Preferred Study Schedule */}
          <div className="p-3 rounded-2xl bg-surface-card border border-surface-border text-left flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/60 text-cyan-400">
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-[10px] text-surface-muted block uppercase font-semibold">
                Usual Study Time
              </span>
              <span className="text-xs font-bold text-cyan-300 block">
                {analytics.preferredStudyTimeFormatted || '7:00 PM'}
              </span>
            </div>
          </div>

          {/* Learning Score */}
          <div className="p-3 rounded-2xl bg-surface-card border border-surface-border text-left flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-950/60 text-brand-400">
              <Award className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <span className="text-[10px] text-surface-muted block uppercase font-semibold">
                Learning Score
              </span>
              <span className="text-xs font-bold text-brand-300 block">
                {analytics.learningScore}%
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-card border border-surface-border text-left hidden sm:block">
            <span className="text-[10px] text-surface-muted block uppercase font-semibold">
              Current Goal
            </span>
            <span className="text-xs font-bold text-slate-200 truncate max-w-xs block">
              {profile?.learningGoal || 'Deep Subject Mastery'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Charts & Metric Badges */}
      <ProgressCharts analytics={analytics} />

      {/* Learning Insights Callout Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-950/60 via-surface-card to-[#0E0E1B] border border-brand-800/40 space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-bold text-brand-300">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>AI Pedagogical & Consistency Insights</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {analytics.totalQuizzesTaken > 0 ? (
            <>
              Based on your real learning activity, your conceptual grasp across reviewed lessons is{' '}
              <strong className="text-brand-300">{analytics.averageQuizScore}% average</strong>.
              {analytics.weakTopics.length > 0 ? (
                <>
                  {' '}To improve exam readiness, dedicate extra practice to your target revision areas:{' '}
                  <strong className="text-amber-300">{analytics.weakTopics.join(', ')}</strong>.
                </>
              ) : (
                ' You have demonstrated solid retention across all tested topics with no weak areas detected.'
              )}
            </>
          ) : (
            'Complete video lessons and take quizzes to unlock personalized AI pedagogical insights and topic mastery tracking based on your real performance.'
          )}
        </p>
        <div className="pt-2 border-t border-brand-800/30 flex flex-wrap items-center gap-2 text-[11px] text-surface-muted">
          <span>⏰ Preferred study hour: <strong className="text-cyan-300">{analytics.preferredStudyTimeFormatted || '7:00 PM'}</strong> (dynamically learned from your learning timestamps).</span>
          <span className="text-slate-500">•</span>
          <span>{analytics.hasCompletedTodayActivity ? (
            <strong className="text-emerald-400">🔥 Today's learning goal completed — day streak preserved!</strong>
          ) : (
            <strong className="text-amber-400">⚡ Today's learning goal pending — study a video or complete a quiz to maintain your streak.</strong>
          )}</span>
        </div>
      </div>

      {/* Real-time Revision & Spaced Repetition Suite */}
      <RevisionSection
        historyItems={historyItems}
        onResumeVideo={handleResumeVideo}
      />

      {/* Detailed Learning History Table */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-brand-400" />
          <span>Completed Learning Sessions ({historyItems.length})</span>
        </h3>

        {historyItems.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface-card border border-surface-border">
            <BookOpen className="w-8 h-8 text-surface-muted mx-auto mb-2 opacity-40" />
            <p className="text-xs text-surface-muted">
              No sessions recorded yet. Start studying a video from the Home feed!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-surface-border bg-surface-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E0E1B] border-b border-surface-border text-surface-muted uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">Lesson Title</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Completion</th>
                  <th className="px-4 py-3">Study Time</th>
                  <th className="px-4 py-3">Last Quiz</th>
                  <th className="px-4 py-3">Topics Covered</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50 text-slate-300">
                {historyItems.map((item) => {
                  const isDone = item.isCompleted || (item.watchPercentage ?? 0) >= 100;
                  const pct = isDone ? 100 : (item.watchPercentage || 0);

                  return (
                    <tr key={item.id} className="hover:bg-surface-cardHover transition-colors">
                      <td className="px-4 py-3.5 font-medium text-white max-w-xs truncate">
                        {item.videoTitle}
                      </td>
                      <td className="px-4 py-3.5 text-surface-muted">{item.channel}</td>
                      <td className="px-4 py-3.5">
                        {isDone ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/50 text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>100% Complete</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-700/50 text-[10px] font-bold">
                            {pct}% Watched
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        {item.durationSeconds && item.durationSeconds >= 60
                          ? `${Math.round(item.durationSeconds / 60)} mins`
                          : item.durationSeconds && item.durationSeconds > 0
                          ? `${item.durationSeconds}s`
                          : '0 mins'}
                      </td>
                      <td className="px-4 py-3.5">
                        {item.lastQuizScore !== undefined ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.lastQuizScore >= 75
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                                : 'bg-amber-950 text-amber-300 border border-amber-700/50'
                            }`}
                          >
                            {item.lastQuizScore}%
                          </span>
                        ) : (
                          <span className="text-surface-muted text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-surface-muted">
                        {item.studiedTopics && item.studiedTopics.length > 0
                          ? item.studiedTopics.slice(0, 2).join(', ')
                          : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-surface-muted text-[11px] whitespace-nowrap">
                        {item.watchedAt ? new Date(item.watchedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleResumeVideo(item.videoId)}
                          className="px-3 py-1 bg-brand-600/30 hover:bg-brand-600 text-brand-300 hover:text-white rounded-lg text-xs font-semibold transition-all"
                        >
                          Study →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
