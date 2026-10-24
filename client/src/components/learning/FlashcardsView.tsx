import React, { useState } from 'react';
import {
  RotateCw,
  CheckCircle,
  HelpCircle,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Layers,
  Clock,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flashcard } from '../../types/learning.js';
import { usePlayer } from '../../context/PlayerContext.js';

interface FlashcardsViewProps {
  cards: Flashcard[];
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ cards }) => {
  const { updateFlashcardStatus, seekToTimestamp } = usePlayer();
  const [deck, setDeck] = useState<Flashcard[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Filter deck
  const activeDeck = filterCategory === 'All'
    ? deck
    : deck.filter((c) => c.category === filterCategory);

  const currentCard = activeDeck[currentIndex] || activeDeck[0];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < activeDeck.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
  };

  const handleMarkStatus = (status: 'known' | 'review') => {
    if (!currentCard) return;
    updateFlashcardStatus(currentCard.id, status);

    // Update in local deck state
    setDeck((prev) =>
      prev.map((c) => (c.id === currentCard.id ? { ...c, userStatus: status } : c))
    );

    // If reached end, trigger confetti
    if (currentIndex === activeDeck.length - 1) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#10B981', '#3B82F6'],
      });
    }

    // Auto advance
    setTimeout(() => {
      handleNext();
    }, 250);
  };

  const knownCount = deck.filter((c) => c.userStatus === 'known').length;
  const reviewCount = deck.filter((c) => c.userStatus === 'review').length;
  const progressPercent = deck.length > 0 ? Math.round((knownCount / deck.length) * 100) : 0;

  const categories = ['All', ...Array.from(new Set(deck.map((c) => c.category)))];

  if (!currentCard) {
    return (
      <div className="p-12 text-center rounded-2xl bg-surface-card border border-surface-border">
        <Layers className="w-10 h-10 text-brand-400 mx-auto mb-2 opacity-50" />
        <h4 className="text-sm font-bold text-white">No flashcards found for this filter</h4>
        <button
          onClick={() => setFilterCategory('All')}
          className="mt-3 px-4 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Reset Filter
        </button>
      </div>
    );
  }

  const difficultyColors = {
    Easy: 'bg-emerald-950/70 text-emerald-400 border-emerald-700/40',
    Medium: 'bg-amber-950/70 text-amber-400 border-amber-700/40',
    Hard: 'bg-rose-950/70 text-rose-400 border-rose-700/40',
  }[currentCard.difficulty] || 'bg-brand-950 text-brand-300';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Bar: Progress and Stats */}
      <div className="p-4 rounded-2xl bg-surface-card border border-surface-border space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">
              Card {currentIndex + 1} of {activeDeck.length}
            </span>
            <span className="text-surface-muted">({deck.length} Total Cards)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{knownCount} Known</span>
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{reviewCount} Review</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#0E0E1B] h-2 rounded-full overflow-hidden border border-surface-border/50">
          <div
            className="bg-gradient-to-r from-brand-600 via-indigo-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Category Pills & Shuffle */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilterCategory(cat);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-surface-card text-surface-muted hover:text-white border border-surface-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={handleShuffle}
          className="p-1.5 rounded-xl bg-surface-card hover:bg-surface-cardHover border border-surface-border text-surface-muted hover:text-white text-xs flex items-center gap-1 shrink-0"
          title="Shuffle cards"
        >
          <Shuffle className="w-3.5 h-3.5 text-brand-400" />
          <span className="hidden sm:inline">Shuffle</span>
        </button>
      </div>

      {/* 3D Flip Flashcard */}
      <div
        className="w-full h-80 sm:h-96 perspective-1000 cursor-pointer select-none"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-preserve-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT: QUESTION */}
          <div className="absolute inset-0 backface-hidden p-6 sm:p-8 rounded-3xl bg-surface-card border-2 border-surface-border shadow-2xl flex flex-col justify-between hover:border-brand-500/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-950/80 text-brand-300 border border-brand-800/40">
                {currentCard.category}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${difficultyColors}`}
              >
                {currentCard.difficulty}
              </span>
            </div>

            <div className="text-center px-2">
              <span className="text-[11px] text-brand-400 font-bold uppercase tracking-wider block mb-2">
                Topic: {currentCard.topic}
              </span>
              <h3 className="text-base sm:text-xl font-bold text-white leading-relaxed">
                {currentCard.question}
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs text-surface-muted pt-2 border-t border-surface-border/50">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 text-brand-400" />
                <span>Tap card to reveal answer</span>
              </span>
              {currentCard.timestamp && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    seekToTimestamp(currentCard.timestampSeconds || 0);
                  }}
                  className="flex items-center gap-1 text-brand-300 hover:text-white"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{currentCard.timestamp}</span>
                </button>
              )}
            </div>
          </div>

          {/* BACK: ANSWER */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121225] via-surface-card to-[#15152c] border-2 border-brand-500/50 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-600 text-white">
                Answer & Explanation
              </span>
              <span className="text-xs text-brand-300 font-semibold">
                {currentCard.category}
              </span>
            </div>

            <div className="text-center px-2 py-4 overflow-y-auto max-h-48">
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
                {currentCard.answer}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-surface-muted pt-2 border-t border-surface-border/50">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 text-brand-400" />
                <span>Tap card to flip back</span>
              </span>
              <span className="text-slate-400">{currentCard.topic}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: Known / Review / Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-2xl bg-surface-card border border-surface-border text-surface-muted hover:text-white disabled:opacity-30 transition-colors"
          title="Previous card"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 flex-1 max-w-sm justify-center">
          <button
            onClick={() => handleMarkStatus('review')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
              currentCard.userStatus === 'review'
                ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/30'
                : 'bg-surface-card hover:bg-amber-950/30 text-amber-300 border-amber-500/30'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Need Review</span>
          </button>

          <button
            onClick={() => handleMarkStatus('known')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
              currentCard.userStatus === 'known'
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/30'
                : 'bg-surface-card hover:bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mastered</span>
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === activeDeck.length - 1}
          className="p-3 rounded-2xl bg-surface-card border border-surface-border text-surface-muted hover:text-white disabled:opacity-30 transition-colors"
          title="Next card"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
