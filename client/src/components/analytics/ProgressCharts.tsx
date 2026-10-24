import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  Clock,
  Video,
  BookOpen,
  Award,
  CheckCircle,
  AlertTriangle,
  Flame,
  TrendingUp,
} from 'lucide-react';
import { StudentAnalytics } from '../../types/learning.js';

interface ProgressChartsProps {
  analytics: StudentAnalytics;
}

export const ProgressCharts: React.FC<ProgressChartsProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Learning Time */}
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-surface-muted">
            <span>Study Time</span>
            <div className="p-2 rounded-xl bg-brand-950/70 text-brand-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {analytics.totalLearningMinutes}{' '}
            <span className="text-xs text-surface-muted font-normal">mins</span>
            {analytics.totalLearningHours > 0 && (
              <span className="text-xs text-brand-400 font-normal ml-1">
                ({analytics.totalLearningHours}h)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {analytics.weeklyGrowthPct >= 0 ? `+${analytics.weeklyGrowthPct}%` : `${analytics.weeklyGrowthPct}%`} this week
            </span>
          </div>
        </div>

        {/* Videos Watched / Completed */}
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-surface-muted">
            <span>Lessons Completed</span>
            <div className="p-2 rounded-xl bg-purple-950/70 text-purple-400">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {analytics.completedVideosCount}{' '}
            <span className="text-xs text-surface-muted font-normal">
              / {analytics.totalVideosWatched}
            </span>
          </div>
          <div className="text-[11px] text-surface-muted">
            {analytics.topicsStudiedCount} topics covered
          </div>
        </div>

        {/* Average Quiz Score */}
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-surface-muted">
            <span>Average Quiz Score</span>
            <div className="p-2 rounded-xl bg-amber-950/70 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {analytics.averageQuizScore}%
          </div>
          <div className="text-[11px] text-surface-muted">
            Across {analytics.totalQuizzesTaken} quizzes taken
          </div>
        </div>

        {/* Flashcards Mastered & Revision */}
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-surface-muted">
            <span>Cards Mastered</span>
            <div className="p-2 rounded-xl bg-emerald-950/70 text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {analytics.flashcardsMasteredCount}
          </div>
          <div className="text-[11px] text-amber-400 font-medium">
            {analytics.flashcardsReviewCount} cards to review
            {analytics.totalRevisionSessions > 0 && (
              <span className="text-surface-muted"> • {analytics.totalRevisionSessions} revisions</span>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Study Time Area Chart */}
        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-400" />
              <span>Daily Study Time (Minutes)</span>
            </h4>
            <span className="text-[11px] text-surface-muted">Past 7 Days</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.studyTimeByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252542" />
                <XAxis dataKey="day" stroke="#8E8EA8" fontSize={11} />
                <YAxis stroke="#8E8EA8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#131322',
                    borderColor: '#252542',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#timeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quiz Score Trend Line Chart */}
        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Quiz Accuracy Trend (%)</span>
            </h4>
            <span className="text-[11px] text-surface-muted">
              {analytics.quizScoreTrend.length > 0 ? 'Recent Sessions' : 'No Attempts Yet'}
            </span>
          </div>

          <div className="h-60 w-full">
            {analytics.quizScoreTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.quizScoreTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252542" />
                  <XAxis dataKey="date" stroke="#8E8EA8" fontSize={11} />
                  <YAxis stroke="#8E8EA8" domain={[0, 100]} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#131322',
                      borderColor: '#252542',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10B981' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 rounded-xl border border-surface-border/40 bg-surface-card/30">
                <Award className="w-8 h-8 text-surface-muted/40 mb-2" />
                <p className="text-xs text-white font-medium">No quiz attempts yet</p>
                <p className="text-[11px] text-surface-muted max-w-xs mt-1">
                  Complete quizzes inside any lesson to record and visualize your accuracy trend.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Strong & Weak Topics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span>Mastered / Strong Topics (Accuracy ≥ 75%)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {analytics.strongTopics.length > 0 ? (
              analytics.strongTopics.map((topic, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-600/30 text-xs font-medium text-emerald-300 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{topic}</span>
                </span>
              ))
            ) : (
              <p className="text-xs text-surface-muted italic">
                No strong topics detected yet. Complete quizzes or revision sessions with ≥ 75% accuracy.
              </p>
            )}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Target Revision Areas (Accuracy &lt; 65%)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {analytics.weakTopics.length > 0 ? (
              analytics.weakTopics.map((topic, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-600/30 text-xs font-medium text-amber-300 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{topic}</span>
                </span>
              ))
            ) : (
              <p className="text-xs text-surface-muted italic">
                {analytics.totalQuizzesTaken > 0
                  ? 'No weak topics identified! All reviewed concepts have healthy retention.'
                  : 'Take quizzes to identify concepts needing additional revision.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
