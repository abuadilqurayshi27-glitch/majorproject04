import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Award,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Hash,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion, QuizResult } from '../../types/learning.js';
import { usePlayer } from '../../context/PlayerContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { FirestoreService } from '../../services/firestoreService.js';

interface QuizViewProps {
  questions: QuizQuestion[];
}

export const QuizView: React.FC<QuizViewProps> = ({ questions }) => {
  const { currentVideo, setActiveTab, seekToTimestamp } = usePlayer();
  const { user } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
    if (selectedAnswers[currentIndex] !== undefined) return; // Already answered
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }));
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate final results
      finalizeQuiz();
    }
  };

  const finalizeQuiz = async () => {
    let correctCount = 0;
    const topicBreakdown: Record<string, { correct: number; total: number }> = {};
    const answersRecord: any[] = [];

    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx] ?? -1;
      const isCorrect = selected === q.correctAnswerIndex;
      if (isCorrect) correctCount++;

      if (!topicBreakdown[q.topic]) {
        topicBreakdown[q.topic] = { correct: 0, total: 0 };
      }
      topicBreakdown[q.topic].total++;
      if (isCorrect) topicBreakdown[q.topic].correct++;

      answersRecord.push({
        questionId: q.id,
        selectedIndex: selected,
        correctIndex: q.correctAnswerIndex,
        isCorrect,
        topic: q.topic,
      });
    });

    const percentage = Math.round((correctCount / questions.length) * 100);

    // Identify weak topics (< 65% accuracy)
    const weakTopics: string[] = [];
    Object.entries(topicBreakdown).forEach(([topic, stats]) => {
      if ((stats.correct / stats.total) < 0.65) {
        weakTopics.push(topic);
      }
    });

    const resultData: QuizResult = {
      id: `quiz_${Date.now()}`,
      videoId: currentVideo?.id || 'unknown',
      videoTitle: currentVideo?.title || 'Educational Lesson',
      score: correctCount,
      totalQuestions: questions.length,
      percentage,
      completedAt: new Date().toISOString(),
      topicBreakdown,
      weakTopics,
      answers: answersRecord,
    };

    setQuizResult(resultData);
    setIsCompleted(true);

    // Trigger celebration if passed well
    if (percentage >= 70) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#10B981', '#F59E0B'],
      });
    }

    // Save to Firestore
    if (user && currentVideo) {
      await FirestoreService.saveQuizResult(user.uid, resultData);
      await FirestoreService.recordLearningActivity({
        userId: user.uid,
        video: currentVideo,
        durationSeconds: 60,
        quizCompleted: true,
        lastQuizScore: percentage,
      });
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowExplanation(false);
    setIsCompleted(false);
    setQuizResult(null);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-surface-card border border-surface-border">
        <HelpCircle className="w-10 h-10 text-brand-400 mx-auto mb-2 opacity-50" />
        <h4 className="text-sm font-bold text-white">Generating Quiz Questions...</h4>
        <p className="text-xs text-surface-muted mt-1">
          MCQs are being extracted and grounded in the video topics.
        </p>
      </div>
    );
  }

  // Quiz Summary Screen
  if (isCompleted && quizResult) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in">
        {/* Score Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border-2 border-brand-500/40 text-center space-y-4 shadow-2xl">
          <div className="inline-flex p-3 rounded-2xl bg-brand-950/70 border border-brand-800 text-brand-400">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-white">Quiz Completed!</h3>
            <p className="text-xs text-surface-muted">
              {quizResult.percentage >= 80
                ? 'Outstanding mastery of the video concepts!'
                : quizResult.percentage >= 60
                ? 'Good effort! Review the notes to solidify your understanding.'
                : 'Keep practicing! Revisit the smart notes and weak topics.'}
            </p>
          </div>

          {/* Big Score Display */}
          <div className="py-4">
            <div className="text-5xl font-black bg-gradient-to-r from-brand-300 via-white to-emerald-400 bg-clip-text text-transparent">
              {quizResult.score} / {quizResult.totalQuestions}
            </div>
            <span className="text-sm font-bold text-slate-300">
              ({quizResult.percentage}% Accuracy)
            </span>
          </div>

          {/* Weak Topics Alert */}
          {quizResult.weakTopics.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Identified Weak Topics to Revise:</span>
              </div>
              <p className="text-[11px] text-surface-muted">
                These topics scored below 65% accuracy and have been added to your personalized study roadmap:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quizResult.weakTopics.map((wt, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-[#0E0E1B] border border-amber-700/50 text-xs font-medium text-amber-300"
                  >
                    • {wt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Topic Performance Breakdown */}
          <div className="space-y-2 text-left pt-2 border-t border-surface-border/60">
            <span className="text-xs font-bold text-white block">Topic Mastery Breakdown:</span>
            <div className="space-y-2">
              {Object.entries(quizResult.topicBreakdown).map(([topic, stats], idx) => {
                const pct = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium truncate max-w-xs">{topic}</span>
                      <span className="font-bold text-brand-300">{pct}% ({stats.correct}/{stats.total})</span>
                    </div>
                    <div className="w-full bg-[#0E0E1B] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct >= 75 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              onClick={handleRetake}
              className="flex-1 py-3 px-4 rounded-xl bg-surface-cardHover hover:bg-surface-border text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-surface-border"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-600/30"
            >
              <BookOpen className="w-4 h-4" />
              <span>Study Smart Notes</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedAnswer = selectedAnswers[currentIndex];
  const isAnswered = selectedAnswer !== undefined;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Quiz Header & Progress */}
      <div className="p-4 rounded-2xl bg-surface-card border border-surface-border space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-950 text-brand-300 border border-brand-800 font-semibold">
              {currentQ.topic}
            </span>
            {/* Board exam mark-type badge */}
            {currentQ.markType && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-0.5 ${
                currentQ.markType === '1-mark'
                  ? 'bg-sky-950/80 border-sky-800 text-sky-300'
                  : currentQ.markType === '3-mark'
                  ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                  : 'bg-rose-950/80 border-rose-800 text-rose-300'
              }`}>
                <Hash className="w-2.5 h-2.5" />
                {currentQ.markType}
              </span>
            )}
          </div>

          <span className="text-surface-muted font-medium">
            Difficulty: <strong className="text-brand-300">{currentQ.difficulty}</strong>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#0E0E1B] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-brand-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-surface-card border border-surface-border shadow-xl space-y-6">
        <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
          {currentQ.question}
        </h3>

        {/* 4 Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, optIdx) => {
            const isSelected = selectedAnswer === optIdx;
            const isCorrect = optIdx === currentQ.correctAnswerIndex;

            let optionStyle = 'bg-[#0E0E1B] border-surface-border/80 text-slate-200 hover:border-brand-500/50 hover:bg-surface-cardHover';

            if (isAnswered) {
              if (isCorrect) {
                optionStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold shadow-md shadow-emerald-950/50';
              } else if (isSelected) {
                optionStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 font-semibold';
              } else {
                optionStyle = 'bg-[#0E0E1B]/50 border-surface-border/40 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={optIdx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm transition-all flex items-start gap-3 ${optionStyle}`}
              >
                <span className="w-6 h-6 rounded-full bg-surface-card border border-surface-border flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 mt-0.5">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="flex-1 leading-relaxed">{option}</span>

                {isAnswered && isCorrect && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Grounded Video Explanation */}
        {showExplanation && (
          <div className="p-4 rounded-2xl bg-[#0E0E1B] border border-brand-800/40 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-300">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>Grounded Video Explanation:</span>
              </div>
              {currentQ.timestamp && (
                <button
                  type="button"
                  onClick={() => seekToTimestamp(currentQ.timestampSeconds || 0)}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-brand-950/80 hover:bg-brand-900 border border-brand-700/50 text-[10px] font-bold text-brand-300 transition-colors"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Jump to {currentQ.timestamp} in video</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Next Question / Finish Button */}
        {isAnswered && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleNextQuestion}
              className="py-3 px-6 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-600/30"
            >
              <span>{currentIndex === questions.length - 1 ? 'Finish & View Score' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
