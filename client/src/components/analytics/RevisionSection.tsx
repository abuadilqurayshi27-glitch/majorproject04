import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  Brain,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Clock,
  Flame,
  TrendingUp,
  BookOpen,
  Award,
  Target,
  HelpCircle,
  Eye,
  EyeOff,
  Play,
  Pause,
  RefreshCw,
  Zap,
  ChevronRight,
  ListOrdered,
  FileText,
  Calendar,
  Bell,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { FirestoreService } from '../../services/firestoreService.js';
import {
  LearningHistoryItem,
  SmartNotes,
  SmartNoteTopic,
  RevisionData,
  RevisionSessionAttempt,
  BlurtingLog,
  ActiveRecallLog,
  QuickRecallQuestion,
  RevisionNotification,
} from '../../types/learning.js';

interface RevisionSectionProps {
  historyItems: LearningHistoryItem[];
  onResumeVideo: (videoId: string) => void;
}

export const RevisionSection: React.FC<RevisionSectionProps> = ({
  historyItems,
  onResumeVideo,
}) => {
  const { user } = useAuth();
  const uid = user?.uid || 'demo_student_studymind_01';

  // Video selection state
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [notes, setNotes] = useState<SmartNotes | null>(null);
  const [revisionData, setRevisionData] = useState<RevisionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Active learning tab: recall | blurting | quick | weak | history
  const [activeTab, setActiveTab] = useState<'recall' | 'blurting' | 'quick' | 'weak' | 'history'>('recall');

  // Small-step revision session index
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(0);
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number>(0);

  // Active Recall state
  const [recallAnswer, setRecallAnswer] = useState<string>('');
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [sessionResults, setSessionResults] = useState<Array<{ topic: string; score: number }>>([]);

  // Blurting / Brain Dump state
  const [blurtingText, setBlurtingText] = useState<string>('');
  const [blurtingResult, setBlurtingResult] = useState<{
    accuracy: number;
    rememberedPoints: string[];
    missedPoints: string[];
    correctExplanation: string;
  } | null>(null);
  const [isAnalyzingBlurting, setIsAnalyzingBlurting] = useState<boolean>(false);

  // Quick recall questions state
  const [quickQuestions, setQuickQuestions] = useState<QuickRecallQuestion[]>([]);
  const [activeQuickQIdx, setActiveQuickQIdx] = useState<number>(0);
  const [revealedQuickAnswers, setRevealedQuickAnswers] = useState<Record<number, boolean>>({});

  // Focus Timer state (minutes)
  const [timerPreset, setTimerPreset] = useState<number>(5);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<any>(null);

  // Revision notifications state
  const [notifications, setNotifications] = useState<RevisionNotification[]>([]);
  const [dismissedNotifIds, setDismissedNotifIds] = useState<Record<string, boolean>>({});

  const fetchNotifications = async () => {
    try {
      const notifs = await FirestoreService.checkAndGenerateRevisionNotifications(uid);
      setNotifications(notifs);
    } catch (e) {
      console.warn('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [uid, selectedVideoId]);

  const handleDismissNotification = async (notifId: string) => {
    setDismissedNotifIds((prev) => ({ ...prev, [notifId]: true }));
    await FirestoreService.markNotificationAsRead(uid, notifId);
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
  };

  // Initialize selected video
  useEffect(() => {
    if (historyItems.length > 0 && !selectedVideoId) {
      // Default to first completed video, or fallback to first video in history
      const completedVid = historyItems.find((h) => h.isCompleted || (h.watchPercentage ?? 0) >= 100);
      setSelectedVideoId(completedVid ? completedVid.videoId : historyItems[0].videoId);
    }
  }, [historyItems, selectedVideoId]);

  // Load smart notes and revision data for selected video
  useEffect(() => {
    if (!selectedVideoId) return;

    let isMounted = true;
    setLoading(true);

    Promise.all([
      FirestoreService.getSmartNotes(uid, selectedVideoId),
      FirestoreService.getRevisionData(uid, selectedVideoId),
    ]).then(([smartNotes, revData]) => {
      if (!isMounted) return;
      setNotes(smartNotes);
      setRevisionData(revData);
      setLoading(false);

      // Reset session states
      setCurrentSessionIndex(0);
      setCurrentTopicIndex(0);
      setIsAnswerRevealed(false);
      setRecallAnswer('');
      setSessionCompleted(false);
      setSessionResults([]);
      setBlurtingText('');
      setBlurtingResult(null);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedVideoId, uid]);

  // Focus timer countdown
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const handleSetTimer = (minutes: number) => {
    setTimerPreset(minutes);
    setTimerSecondsLeft(minutes * 60);
    setIsTimerRunning(false);
  };

  const handleToggleTimer = () => {
    if (timerSecondsLeft === 0) {
      setTimerSecondsLeft(timerPreset * 60);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSecondsLeft(timerPreset * 60);
  };

  // Find currently selected video metadata in history
  const selectedVideo = historyItems.find((h) => h.videoId === selectedVideoId) || historyItems[0];
  const isVideo100Percent = Boolean(
    selectedVideo &&
      (selectedVideo.isCompleted === true || (selectedVideo.watchPercentage ?? 0) >= 100)
  );
  const watchPct = selectedVideo?.watchPercentage ?? (isVideo100Percent ? 100 : 0);

  // Group topics into small steps (2 topics per session for focused, non-overwhelming recall)
  const allTopics: SmartNoteTopic[] = notes?.topics || [];
  const sessionChunkSize = 2;
  const totalSessions = Math.max(1, Math.ceil(allTopics.length / sessionChunkSize));

  const currentSessionTopics = allTopics.slice(
    currentSessionIndex * sessionChunkSize,
    (currentSessionIndex + 1) * sessionChunkSize
  );

  const activeTopic = currentSessionTopics[currentTopicIndex] || currentSessionTopics[0];

  // Generate grounded Quick Recall Questions from real notes
  useEffect(() => {
    if (!notes || notes.topics.length === 0) return;
    const generated: QuickRecallQuestion[] = [];

    notes.topics.forEach((t) => {
      // 1. Questions discussed in video
      if (t.questionsDiscussedInVideo && t.questionsDiscussedInVideo.length > 0) {
        const firstQA = t.questionsDiscussedInVideo[0];
        const isObjectQA = typeof firstQA === 'object' && firstQA !== null && 'question' in firstQA;
        const qText = isObjectQA ? firstQA.question : String(firstQA);
        const aText = isObjectQA && firstQA.answer ? firstQA.answer : (t.simpleExplanation || t.importantPoints[0] || 'Discussed in depth in the lesson.');

        generated.push({
          id: `q_qa_${t.id}_0`,
          topic: t.title,
          question: qText,
          answer: aText,
          sourceType: 'qa',
        });
      }

      // 2. Definitions
      if (t.definitions && t.definitions.length > 0) {
        const d = t.definitions[0];
        generated.push({
          id: `q_def_${t.id}`,
          topic: t.title,
          question: `According to this lesson, define "${d.term}":`,
          answer: d.definition,
          sourceType: 'definition',
        });
      }

      // 3. Formulas
      if (t.formulas && t.formulas.length > 0) {
        const f = t.formulas[0];
        generated.push({
          id: `q_form_${t.id}`,
          topic: t.title,
          question: `What is the formula for "${f.name}" and how is it calculated?`,
          answer: `${f.formula} — ${f.explanation}`,
          sourceType: 'formula',
        });
      }

      // 4. Exam Revision Point
      if (t.examRevisionPoints && t.examRevisionPoints.length > 0) {
        generated.push({
          id: `q_exam_${t.id}`,
          topic: t.title,
          question: `Key Exam Checkpoint for ${t.title}:`,
          answer: t.examRevisionPoints[0],
          sourceType: 'takeaway',
        });
      }
    });

    setQuickQuestions(generated.slice(0, 10));
    setActiveQuickQIdx(0);
    setRevealedQuickAnswers({});
  }, [notes]);

  // Handle Active Recall Self-Assessment
  const handleRecallGrade = async (rating: 'mastered' | 'partial' | 'review') => {
    if (!activeTopic || !selectedVideo) return;

    const score = rating === 'mastered' ? 100 : rating === 'partial' ? 60 : 20;
    const newResults = [...sessionResults, { topic: activeTopic.title, score }];
    setSessionResults(newResults);

    // Record individual active recall log
    const recallLog: ActiveRecallLog = {
      id: `recall_${Date.now()}`,
      topic: activeTopic.title,
      studentAnswer: recallAnswer,
      selfAssessment: rating,
      revealedExplanation: activeTopic.simpleExplanation,
      completedAt: new Date().toISOString(),
    };
    await FirestoreService.saveActiveRecallLog(uid, selectedVideo.videoId, recallLog);

    // Advance to next topic in session or finalize session
    if (currentTopicIndex + 1 < currentSessionTopics.length) {
      setCurrentTopicIndex(currentTopicIndex + 1);
      setIsAnswerRevealed(false);
      setRecallAnswer('');
    } else {
      // Session finished! Calculate session metrics & persist
      setSessionCompleted(true);
      const totalScore = Math.round(
        newResults.reduce((acc, curr) => acc + curr.score, 0) / newResults.length
      );
      const sessionMastered = newResults.filter((r) => r.score >= 75).map((r) => r.topic);
      const sessionWeak = newResults.filter((r) => r.score < 65).map((r) => r.topic);

      const attempt: RevisionSessionAttempt = {
        id: `attempt_${Date.now()}`,
        date: new Date().toISOString(),
        sessionIndex: currentSessionIndex + 1,
        sessionTitle: `Step ${currentSessionIndex + 1}: ${currentSessionTopics.map((t) => t.title).join(' & ')}`,
        topicsReviewed: currentSessionTopics.map((t) => t.title),
        score: totalScore,
        accuracy: totalScore,
        totalItems: newResults.length,
        correctItems: newResults.filter((r) => r.score >= 60).length,
      };

      const updated = await FirestoreService.recordRevisionAttempt({
        userId: uid,
        videoId: selectedVideo.videoId,
        videoTitle: selectedVideo.videoTitle,
        attempt,
        newWeakTopics: sessionWeak,
        newMasteredTopics: sessionMastered,
      });

      setRevisionData(updated);

      // Mark any due notification as completed
      const matchingDue = notifications.find(
        (n) => n.videoId === selectedVideo.videoId && n.type === 'revision_due' && !n.isCompleted
      );
      if (matchingDue) {
        await FirestoreService.markNotificationAsCompleted(uid, matchingDue.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === matchingDue.id ? { ...n, isCompleted: true, isRead: true } : n))
        );
      }
    }
  };


  // Blurting / Brain Dump evaluation algorithm
  const handleEvaluateBlurting = async () => {
    if (!blurtingText.trim() || !activeTopic || !selectedVideo) return;
    setIsAnalyzingBlurting(true);

    // Extract core sentences from Smart Notes
    const groundTruthPoints: string[] = [
      ...(activeTopic.importantPoints || []),
      ...(activeTopic.definitions?.map((d) => `${d.term}: ${d.definition}`) || []),
      ...(activeTopic.stepByStep || []),
      ...(activeTopic.keyTakeaways || []),
    ];

    const inputLower = blurtingText.toLowerCase();

    // Check which ground-truth points match concepts in input
    const remembered: string[] = [];
    const missed: string[] = [];

    groundTruthPoints.forEach((point) => {
      const words = point
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .split(' ')
        .filter((w) => w.length > 3);

      const matchCount = words.filter((w) => inputLower.includes(w)).length;
      const matchRatio = words.length > 0 ? matchCount / words.length : 0;

      if (matchRatio >= 0.25 || words.some((w) => inputLower.includes(w) && w.length >= 6)) {
        remembered.push(point);
      } else {
        missed.push(point);
      }
    });

    const total = groundTruthPoints.length || 1;
    const accuracy = Math.min(100, Math.round((remembered.length / total) * 100));

    const result = {
      accuracy,
      rememberedPoints: remembered,
      missedPoints: missed,
      correctExplanation: activeTopic.simpleExplanation || activeTopic.whyImportant || '',
    };

    setBlurtingResult(result);

    // Save Blurting log
    const bLog: BlurtingLog = {
      id: `blurting_${Date.now()}`,
      topic: activeTopic.title,
      studentText: blurtingText,
      rememberedPoints: remembered,
      missedPoints: missed,
      correctExplanation: result.correctExplanation,
      accuracy,
      completedAt: new Date().toISOString(),
    };
    await FirestoreService.saveBlurtingLog(uid, selectedVideo.videoId, bLog);

    // Update revision attempt data
    const isWeak = accuracy < 65;
    const attempt: RevisionSessionAttempt = {
      id: `attempt_${Date.now()}`,
      date: new Date().toISOString(),
      sessionIndex: currentSessionIndex + 1,
      sessionTitle: `Brain Dump: ${activeTopic.title}`,
      topicsReviewed: [activeTopic.title],
      score: accuracy,
      accuracy,
      totalItems: total,
      correctItems: remembered.length,
    };

    const updated = await FirestoreService.recordRevisionAttempt({
      userId: uid,
      videoId: selectedVideo.videoId,
      videoTitle: selectedVideo.videoTitle,
      attempt,
      newWeakTopics: isWeak ? [activeTopic.title] : [],
      newMasteredTopics: !isWeak ? [activeTopic.title] : [],
    });
    setRevisionData(updated);

    // Mark any due notification as completed
    const matchingDue = notifications.find(
      (n) => n.videoId === selectedVideo.videoId && n.type === 'revision_due' && !n.isCompleted
    );
    if (matchingDue) {
      await FirestoreService.markNotificationAsCompleted(uid, matchingDue.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === matchingDue.id ? { ...n, isCompleted: true, isRead: true } : n))
      );
    }

    setIsAnalyzingBlurting(false);
  };


  const handleResetSession = () => {
    setCurrentTopicIndex(0);
    setIsAnswerRevealed(false);
    setRecallAnswer('');
    setSessionCompleted(false);
    setSessionResults([]);
  };

  const handleSwitchSession = (idx: number) => {
    setCurrentSessionIndex(idx);
    setCurrentTopicIndex(0);
    setIsAnswerRevealed(false);
    setRecallAnswer('');
    setSessionCompleted(false);
    setSessionResults([]);
    setBlurtingText('');
    setBlurtingResult(null);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (historyItems.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-surface-card border border-surface-border text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-950/70 border border-brand-800 text-brand-400 mx-auto flex items-center justify-center">
          <Brain className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Lessons Studied Yet</h3>
        <p className="text-xs text-surface-muted max-w-sm mx-auto">
          Study a YouTube video to 100% completion in the Study Room to unlock your personalized Spaced Repetition and Active Recall revision workspace.
        </p>
      </div>
    );
  }

  // Active notification banner logic

  const activeDueNotif = notifications.find(
    (n) => n.type === 'revision_due' && !n.isCompleted && !dismissedNotifIds[n.id]
  );
  const activeUnlockNotif = !activeDueNotif
    ? notifications.find(
        (n) => n.type === 'revision_unlocked' && n.videoId === selectedVideoId && !n.isRead && !dismissedNotifIds[n.id]
      )
    : null;
  const currentBannerNotif = activeDueNotif || activeUnlockNotif;

  return (

    <div className="space-y-6">
      {/* Video Selector Header Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-surface-card border border-surface-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-950/70 border border-purple-800 text-purple-400 flex items-center justify-center shadow-md">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Active Revision & Kaizen Suite</span>
                {isVideo100Percent ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 text-[10px] font-bold border border-emerald-700/50 flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 text-[10px] font-bold border border-amber-700/50 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Locked ({watchPct}%)</span>
                  </span>
                )}
              </h3>
            </div>
            <p className="text-xs text-surface-muted mt-1">
              Active Recall • Blurting / Brain Dump • Small-Step Sessions • Spaced Repetition (1d–30d)
            </p>
          </div>

          {/* Lesson Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-muted font-medium">Select Lesson:</span>
            <select
              value={selectedVideoId}
              onChange={(e) => setSelectedVideoId(e.target.value)}
              className="bg-[#0E0E1B] border border-surface-border rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-brand-500 max-w-[240px] truncate"
            >
              {historyItems.map((item) => {
                const completed = item.isCompleted || (item.watchPercentage ?? 0) >= 100;
                return (
                  <option key={item.videoId} value={item.videoId}>
                    {completed ? '✓ ' : '🔒 '}{item.videoTitle}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Revision Notification Banner */}
      {currentBannerNotif && (
        <div
          className={`p-4 sm:p-5 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 ${
            currentBannerNotif.type === 'revision_due'
              ? 'bg-gradient-to-r from-amber-950/70 via-[#191316] to-[#0E0E1B] border-amber-600/50'
              : 'bg-gradient-to-r from-purple-950/70 via-[#151128] to-[#0E0E1B] border-purple-600/50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-md ${
                currentBannerNotif.type === 'revision_due'
                  ? 'bg-amber-900/60 border border-amber-600/60 text-amber-300'
                  : 'bg-purple-900/60 border border-purple-600/60 text-purple-300'
              }`}
            >
              {currentBannerNotif.type === 'revision_due' ? (
                <Bell className="w-5 h-5 text-amber-300 animate-bounce" />
              ) : (
                <Unlock className="w-5 h-5 text-emerald-300" />
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-white">
                  {currentBannerNotif.type === 'revision_due' ? 'Your revision is due' : currentBannerNotif.title}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    currentBannerNotif.type === 'revision_due'
                      ? 'bg-amber-950 text-amber-400 border border-amber-700/60'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                  }`}
                >
                  {currentBannerNotif.type === 'revision_due' ? 'Scheduled Due' : 'Unlocked'}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
                {currentBannerNotif.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {currentBannerNotif.videoId && currentBannerNotif.videoId !== selectedVideoId ? (
              <button
                onClick={() => {
                  if (currentBannerNotif.videoId) setSelectedVideoId(currentBannerNotif.videoId);
                  handleDismissNotification(currentBannerNotif.id);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Revise Due Lesson →</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('recall');
                  handleDismissNotification(currentBannerNotif.id);
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Start Active Recall →</span>
              </button>
            )}

            <button
              onClick={() => handleDismissNotification(currentBannerNotif.id)}
              className="p-2 rounded-xl text-surface-muted hover:text-white hover:bg-white/10 transition-colors"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LOCKED STATE (When video is < 100% completed)                 */}
      {/* ------------------------------------------------------------- */}
      {!isVideo100Percent ? (

        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#120F26] via-surface-card to-[#0A0A14] border border-brand-900/50 text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Locked Icon & Progress Ring */}
          <div className="relative inline-flex items-center justify-center mx-auto">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="currentColor"
                strokeWidth="8"
                className="text-surface-border/40"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="currentColor"
                strokeWidth="8"
                className="text-brand-500 transition-all duration-1000 ease-out"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - Math.max(0.05, watchPct / 100))}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <Lock className="w-6 h-6 text-brand-400 mb-0.5" />
              <span className="text-xs font-black text-white">{watchPct}%</span>
            </div>
          </div>

          {/* Locked Description */}
          <div className="space-y-2 max-w-lg mx-auto">
            <h4 className="text-lg sm:text-xl font-black text-white">
              Revision Workspace is Locked
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Based on the science of memory consolidation, <strong>Active Recall</strong> and <strong>Blurting</strong> require your brain to have absorbed the entire lesson first. Once you complete <strong>100% of this video</strong>, Revision automatically unlocks.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-800 text-brand-300 text-xs font-medium">
              <span>Required: 100% watched</span>
              <span>•</span>
              <span className="text-amber-300">Currently: {watchPct}% completed</span>
            </div>
          </div>

          {/* Action button: Continue watching */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onResumeVideo(selectedVideo.videoId)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Continue Watching to Unlock 100% →</span>
            </button>

            {/* If there's an already unlocked video, offer quick switch */}
            {historyItems.some((h) => h.isCompleted || (h.watchPercentage ?? 0) >= 100) && (
              <button
                onClick={() => {
                  const unlocked = historyItems.find((h) => h.isCompleted || (h.watchPercentage ?? 0) >= 100);
                  if (unlocked) setSelectedVideoId(unlocked.videoId);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-surface-card border border-surface-border hover:bg-surface-cardHover text-slate-300 text-xs font-semibold transition-all"
              >
                Switch to an Unlocked Lesson
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* UNLOCKED STATE (100% Video Completed)                         */
        /* ------------------------------------------------------------- */
        <div className="space-y-6">
          {/* Spaced Repetition Schedule Banner & Kaizen Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Spaced Repetition Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-brand-950/70 via-surface-card to-[#0E0E1B] border border-brand-800/60 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Spaced Repetition</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-brand-900/60 border border-brand-700/60 text-[10px] font-mono font-bold text-brand-300">
                  Stage {revisionData?.spacedRepetitionStage || 1}/4
                </span>
              </div>
              <div className="text-xl font-black text-white">
                {revisionData?.spacedRepetitionIntervalDays || 1}-Day Interval
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Next review due:{' '}
                <strong className="text-emerald-400">
                  {revisionData?.nextRevisionDate
                    ? new Date(revisionData.nextRevisionDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Tomorrow'}
                </strong>
                . (Progression: 1d → 3d → 7d → 30d)
              </p>
            </div>

            {/* Kaizen Continuous Growth Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-surface-card border border-surface-border space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Kaizen Progress</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-[10px] font-mono font-bold text-emerald-300">
                  +{revisionData?.improvementPct || 15}% Growth
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-white">
                  {revisionData?.currentScore || 85}%
                </span>
                <span className="text-xs text-surface-muted line-through">
                  prev: {revisionData?.previousScore || 70}%
                </span>
              </div>
              <p className="text-[11px] text-surface-muted leading-snug">
                {revisionData?.topicsImproved?.length || 1} topics shifted to Mastered! Continuous small-step gains.
              </p>
            </div>

            {/* Streak & Mastery Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-surface-card border border-surface-border space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Revision Streak</span>
                </span>
                <span className="text-[10px] text-surface-muted">
                  {revisionData?.masteredTopics?.length || 2}/{allTopics.length || 3} Mastered
                </span>
              </div>
              <div className="text-xl font-black text-white flex items-center gap-2">
                <span>{revisionData?.revisionStreak || 1} Sessions</span>
                <span className="text-amber-400">🔥</span>
              </div>
              <p className="text-[11px] text-surface-muted leading-snug">
                {revisionData?.weakTopics?.length ? (
                  <span className="text-amber-300">
                    {revisionData.weakTopics.length} weak topics target prioritized
                  </span>
                ) : (
                  'All reviewed topics currently solid'
                )}
              </p>
            </div>
          </div>

          {/* Small-Step Sessions Stepper & Focus Session Timer Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-surface-card border border-surface-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border/60 pb-3">
              {/* Stepper info */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Small-Step Revision Sessions</span>
                </span>
                <p className="text-xs text-surface-muted">
                  Don't revise the whole lesson at once. Master small 2-topic steps:
                </p>
              </div>

              {/* Focus Timer Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-[#0E0E1B] border border-surface-border">
                  <Clock className="w-3.5 h-3.5 text-brand-400" />
                  <span className="font-mono text-xs font-bold text-white">
                    {formatTimer(timerSecondsLeft)}
                  </span>
                </div>

                <button
                  onClick={handleToggleTimer}
                  className={`p-2 rounded-xl text-xs font-bold transition-all ${
                    isTimerRunning
                      ? 'bg-amber-600 text-white'
                      : 'bg-brand-600 text-white hover:bg-brand-500'
                  }`}
                  title={isTimerRunning ? 'Pause Focus Timer' : 'Start Focus Timer'}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleResetTimer}
                  className="p-2 rounded-xl bg-surface-card border border-surface-border text-surface-muted hover:text-white transition-all"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Presets */}
                <div className="hidden sm:flex items-center gap-1 text-[10px]">
                  {[5, 10, 15].map((m) => (
                    <button
                      key={m}
                      onClick={() => handleSetTimer(m)}
                      className={`px-2 py-1 rounded-lg font-mono ${
                        timerPreset === m
                          ? 'bg-brand-900/60 text-brand-300 border border-brand-700/60'
                          : 'text-surface-muted hover:text-white'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Session Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {Array.from({ length: totalSessions }).map((_, idx) => {
                const sessionTopics = allTopics.slice(
                  idx * sessionChunkSize,
                  (idx + 1) * sessionChunkSize
                );
                const isSelected = currentSessionIndex === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSwitchSession(idx)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                        : 'bg-[#0E0E1B] text-slate-300 hover:bg-surface-cardHover border border-surface-border'
                    }`}
                  >
                    <span>Step {idx + 1}</span>
                    <span className="text-[10px] opacity-70">
                      ({sessionTopics.map((t) => t.title.slice(0, 15)).join(', ')}...)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Learning Mode Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-card border border-surface-border overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('recall')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'recall'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-surface-muted hover:text-white hover:bg-surface-cardHover'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>1. Active Recall</span>
            </button>

            <button
              onClick={() => setActiveTab('blurting')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'blurting'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-surface-muted hover:text-white hover:bg-surface-cardHover'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Blurting / Brain Dump</span>
            </button>

            <button
              onClick={() => setActiveTab('quick')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'quick'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-surface-muted hover:text-white hover:bg-surface-cardHover'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>3. Quick Questions ({quickQuestions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('weak')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'weak'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-surface-muted hover:text-white hover:bg-surface-cardHover'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Needs Revision ({revisionData?.weakTopics?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-surface-muted hover:text-white hover:bg-surface-cardHover'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Revision History</span>
            </button>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* TAB 1: ACTIVE RECALL                                          */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'recall' && (
            <div className="space-y-4">
              {sessionCompleted ? (
                /* Session Completion Card */
                <div className="p-8 rounded-3xl bg-gradient-to-br from-brand-950/60 via-surface-card to-[#0E0E1B] border border-brand-800/50 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-600 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-black text-white">Step Revision Completed!</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Great work consolidating your memory for <strong>Step {currentSessionIndex + 1}</strong>. Your Kaizen improvement metrics and Spaced Repetition schedule have been saved to your learning profile.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleResetSession}
                      className="px-4 py-2 rounded-xl bg-surface-card border border-surface-border text-xs font-bold text-slate-300 hover:text-white"
                    >
                      Repeat This Step
                    </button>

                    {currentSessionIndex + 1 < totalSessions && (
                      <button
                        onClick={() => handleSwitchSession(currentSessionIndex + 1)}
                        className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-lg shadow-brand-600/30 flex items-center gap-1.5"
                      >
                        <span>Start Step {currentSessionIndex + 2}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : activeTopic ? (
                /* Active Recall Challenge Card */
                <div className="p-6 rounded-3xl bg-surface-card border border-surface-border space-y-6 shadow-xl">
                  {/* Topic Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border/60 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                        Topic {currentTopicIndex + 1} of {currentSessionTopics.length} in Step {currentSessionIndex + 1}
                      </span>
                      <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                        {activeTopic.title}
                      </h4>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-brand-950/80 border border-brand-800 text-[10px] font-bold text-brand-300 self-start sm:self-auto">
                      {activeTopic.importance} Concept
                    </span>
                  </div>

                  {/* Recall Prompt */}
                  <div className="p-4 rounded-2xl bg-[#0E0E1B] border border-surface-border/70 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <HelpCircle className="w-4 h-4 text-brand-400" />
                      <span>Active Recall Challenge:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-brand-200 leading-relaxed">
                      "What do you remember about <strong>{activeTopic.title}</strong>? What are the key definitions, principles, formulas, and real-world uses explained in the video?"
                    </p>

                    {/* Student recall input */}
                    <textarea
                      value={recallAnswer}
                      onChange={(e) => setRecallAnswer(e.target.value)}
                      placeholder="Type what you remember from memory before revealing the answer (optional, or test yourself mentally)..."
                      rows={3}
                      className="w-full bg-[#131322] border border-surface-border rounded-xl p-3 text-xs text-white placeholder-surface-muted focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  {/* Reveal Answer Button */}
                  {!isAnswerRevealed ? (
                    <button
                      onClick={() => setIsAnswerRevealed(true)}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Reveal Grounded Answer & Compare Memory</span>
                    </button>
                  ) : (
                    /* Revealed Ground-Truth Answer Comparison */
                    <div className="space-y-4 pt-2">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#120F26] to-[#0E0E1B] border border-brand-800/60 space-y-4">
                        <div className="flex items-center justify-between border-b border-surface-border/60 pb-2">
                          <span className="text-xs font-bold text-brand-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                            <span>Grounded Video Ground-Truth:</span>
                          </span>
                          <span className="text-[10px] text-surface-muted">
                            Extracted directly from completed lesson
                          </span>
                        </div>

                        {/* Simple Explanation */}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-surface-muted">
                            Core Explanation:
                          </span>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {activeTopic.simpleExplanation}
                          </p>
                        </div>

                        {/* Key Definitions */}
                        {activeTopic.definitions && activeTopic.definitions.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] uppercase font-bold text-surface-muted">
                              Definitions:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {activeTopic.definitions.map((d, i) => (
                                <div key={i} className="p-2.5 rounded-xl bg-[#131322] border border-surface-border text-xs">
                                  <strong className="text-brand-300 block">{d.term}:</strong>
                                  <span className="text-slate-300 text-[11px]">{d.definition}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Important Points */}
                        {activeTopic.importantPoints && activeTopic.importantPoints.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] uppercase font-bold text-surface-muted">
                              Key Points & Principles:
                            </span>
                            <ul className="space-y-1 text-xs text-slate-300">
                              {activeTopic.importantPoints.map((pt, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Formulas */}
                        {activeTopic.formulas && activeTopic.formulas.length > 0 && (
                          <div className="p-3 rounded-xl bg-[#090912] border border-brand-900/60 space-y-1">
                            <span className="text-[10px] font-bold text-amber-400 uppercase">
                              Formula / Calculation:
                            </span>
                            {activeTopic.formulas.map((f, i) => (
                              <div key={i} className="text-xs">
                                <span className="font-mono text-amber-300 font-bold block">{f.formula}</span>
                                <span className="text-slate-400 text-[11px]">{f.explanation}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Self-Assessment Buttons */}
                      <div className="space-y-2 pt-2">
                        <span className="text-xs text-surface-muted font-bold block text-center">
                          How well did you recall this concept from memory?
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleRecallGrade('mastered')}
                            className="p-3 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-950/30"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span>Mastered (100%)</span>
                          </button>

                          <button
                            onClick={() => handleRecallGrade('partial')}
                            className="p-3 rounded-2xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/60 text-amber-300 font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-amber-950/30"
                          >
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Partially (60%)</span>
                          </button>

                          <button
                            onClick={() => handleRecallGrade('review')}
                            className="p-3 rounded-2xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/60 text-rose-300 font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-rose-950/30"
                          >
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                            <span>Need Review (20%)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: BLURTING / BRAIN DUMP                                  */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'blurting' && (
            <div className="p-6 rounded-3xl bg-surface-card border border-surface-border space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border/60 pb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Zap className="w-4 h-4" />
                    <span>Blurting / Brain Dump Technique</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                    Topic: {activeTopic?.title || 'Selected Concept'}
                  </h4>
                </div>
                <span className="text-xs text-surface-muted">
                  {blurtingText.split(/\s+/).filter(Boolean).length} words typed
                </span>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-2xl bg-[#0E0E1B] border border-surface-border/70 space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong>How Blurting works:</strong> Without opening your notes, type down <em>everything</em> you remember about this topic — definitions, mechanisms, real-world examples, and formulas. After submitting, StudyMind AI compares your memory against the video's actual notes to identify exactly what you retained and what you missed.
                </p>
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <textarea
                  value={blurtingText}
                  onChange={(e) => setBlurtingText(e.target.value)}
                  placeholder="Start brain dump... Write freely from memory..."
                  rows={6}
                  className="w-full bg-[#10101E] border border-surface-border rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-surface-muted focus:outline-none focus:border-brand-500 leading-relaxed"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-surface-muted">
                    No penalty for spelling. Dump raw thoughts.
                  </span>
                  <button
                    onClick={handleEvaluateBlurting}
                    disabled={!blurtingText.trim() || isAnalyzingBlurting}
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2"
                  >
                    {isAnalyzingBlurting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing Memory...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Submit Brain Dump →</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Blurting Results Breakdown */}
              {blurtingResult && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#120F26] to-[#0A0A14] border border-brand-800/60 space-y-6 pt-4">
                  {/* Score Gauge */}
                  <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-brand-400" />
                      <span>Blurting Recall Accuracy</span>
                    </span>
                    <span
                      className={`text-lg font-black ${
                        blurtingResult.accuracy >= 75
                          ? 'text-emerald-400'
                          : blurtingResult.accuracy >= 50
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {blurtingResult.accuracy}% Retained
                    </span>
                  </div>

                  {/* 3-Part Feedback as required by user prompt */}
                  <div className="space-y-4">
                    {/* 1. What you remembered */}
                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>1. What You Remembered:</span>
                      </div>
                      {blurtingResult.rememberedPoints.length > 0 ? (
                        <ul className="space-y-1.5 text-xs text-slate-200">
                          {blurtingResult.rememberedPoints.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-surface-muted italic">
                          None of the primary technical keywords matched. Review the explanation below.
                        </p>
                      )}
                    </div>

                    {/* 2. Important points you missed */}
                    <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>2. Important Points You Missed:</span>
                      </div>
                      {blurtingResult.missedPoints.length > 0 ? (
                        <ul className="space-y-1.5 text-xs text-slate-200">
                          {blurtingResult.missedPoints.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-emerald-300 font-semibold">
                          Impressive! You covered all the core points from the notes!
                        </p>
                      )}
                    </div>

                    {/* 3. Correct explanation */}
                    <div className="p-4 rounded-xl bg-brand-950/40 border border-brand-800/40 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-300">
                        <Sparkles className="w-4 h-4 text-brand-400" />
                        <span>3. Grounded Full Explanation:</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {blurtingResult.correctExplanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: QUICK RECALL QUESTIONS                                 */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              {quickQuestions.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-surface-card border border-surface-border text-xs text-surface-muted">
                  No quick questions available for this lesson.
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-surface-card border border-surface-border space-y-6 shadow-xl">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
                    <span className="text-xs font-bold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-brand-400" />
                      <span>Question {activeQuickQIdx + 1} of {quickQuestions.length}</span>
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#0E0E1B] border border-surface-border text-surface-muted font-mono">
                      {quickQuestions[activeQuickQIdx]?.topic}
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <div className="p-5 rounded-2xl bg-[#0E0E1B] border border-surface-border space-y-3">
                    <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                      {quickQuestions[activeQuickQIdx]?.question}
                    </h4>

                    {/* Reveal Button */}
                    {!revealedQuickAnswers[activeQuickQIdx] ? (
                      <button
                        onClick={() =>
                          setRevealedQuickAnswers({ ...revealedQuickAnswers, [activeQuickQIdx]: true })
                        }
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Reveal Grounded Answer</span>
                      </button>
                    ) : (
                      <div className="p-4 rounded-xl bg-brand-950/50 border border-brand-800/60 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-brand-400 block">
                          Verified Answer:
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {quickQuestions[activeQuickQIdx]?.answer}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setActiveQuickQIdx(Math.max(0, activeQuickQIdx - 1))}
                      disabled={activeQuickQIdx === 0}
                      className="px-3.5 py-2 rounded-xl bg-surface-card border border-surface-border disabled:opacity-40 text-xs font-semibold text-slate-300 hover:text-white"
                    >
                      ← Previous
                    </button>

                    <button
                      onClick={() =>
                        setActiveQuickQIdx(Math.min(quickQuestions.length - 1, activeQuickQIdx + 1))
                      }
                      disabled={activeQuickQIdx === quickQuestions.length - 1}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4: NEEDS REVISION (WEAK TOPICS)                           */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'weak' && (
            <div className="p-6 rounded-3xl bg-surface-card border border-surface-border space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Target Revision & Weak Concepts</span>
                </div>
                <span className="text-xs text-surface-muted">
                  Auto-updated from Recall & Blurting
                </span>
              </div>

              {!revisionData?.weakTopics || revisionData.weakTopics.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#0E0E1B] border border-surface-border space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
                  <p className="text-xs text-slate-300 font-semibold">
                    No active weak concepts detected!
                  </p>
                  <p className="text-[11px] text-surface-muted max-w-xs mx-auto">
                    You've maintained solid accuracy across tested areas. As you complete blurting and recall sessions, any missed points will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300">
                    The following topics scored below 65% in recent active recall or had core points omitted in Blurting sessions. Dedicate your next focus session to these:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {revisionData.weakTopics.map((topic, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-amber-300 block">{topic}</span>
                          <span className="text-[10px] text-surface-muted">
                            Prioritized for upcoming Spaced Repetition review
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            // Find topic in topics and jump to it in recall
                            const idx = allTopics.findIndex((t) => t.title === topic);
                            if (idx !== -1) {
                              const sIdx = Math.floor(idx / sessionChunkSize);
                              setCurrentSessionIndex(sIdx);
                              setCurrentTopicIndex(idx % sessionChunkSize);
                              setActiveTab('recall');
                              setIsAnswerRevealed(false);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white text-xs font-semibold transition-all shrink-0"
                        >
                          Revise Now →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 5: REVISION HISTORY                                       */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'history' && (
            <div className="p-6 rounded-3xl bg-surface-card border border-surface-border space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-surface-border/60 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-400" />
                  <span>Revision Session Log</span>
                </span>
                <span className="text-xs text-surface-muted">
                  {revisionData?.attempts?.length || 0} sessions recorded
                </span>
              </div>

              {!revisionData?.attempts || revisionData.attempts.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#0E0E1B] border border-surface-border text-xs text-surface-muted">
                  No revision sessions logged yet. Complete an Active Recall or Blurting session above!
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-surface-border bg-[#0E0E1B]">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-surface-border text-surface-muted uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Session Title</th>
                        <th className="px-4 py-3">Topics Tested</th>
                        <th className="px-4 py-3 text-right">Recall Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border/50 text-slate-300">
                      {revisionData.attempts.map((att) => (
                        <tr key={att.id} className="hover:bg-surface-cardHover transition-colors">
                          <td className="px-4 py-3 font-mono text-[11px] text-surface-muted">
                            {new Date(att.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-4 py-3 font-medium text-white">{att.sessionTitle}</td>
                          <td className="px-4 py-3 text-surface-muted text-[11px]">
                            {att.topicsReviewed.join(', ')}
                          </td>
                          <td className="px-4 py-3 text-right font-bold">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] ${
                                att.score >= 75
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                                  : 'bg-amber-950 text-amber-300 border border-amber-700/50'
                              }`}
                            >
                              {att.score}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
