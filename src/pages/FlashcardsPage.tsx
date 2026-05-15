import { useState, useEffect } from 'react';
import { useQuizStore } from '../store/quizStore';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  HelpCircle, 
  RotateCcw, 
  Shuffle, 
  GraduationCap,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FlashcardsPage() {
  const { 
    currentSession, 
    studyFlashcards, 
    toggleFlashcardMastery, 
    shuffleFlashcards, 
    resetFlashcardMastery, 
    navigateTo 
  } = useQuizStore();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Celebrate when all cards are mastered
  const totalCards = studyFlashcards.length;
  const masteredCount = studyFlashcards.filter(c => c.mastered).length;
  const isAllMastered = totalCards > 0 && masteredCount === totalCards;

  useEffect(() => {
    if (isAllMastered) {
      // Side-to-side confetti cannon burst
      const end = Date.now() + (1.5 * 1000);
      const colors = ['#60a5fa', '#34d399', '#a78bfa'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [isAllMastered]);

  if (totalCards === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0F1E] text-white p-6 text-center space-y-4">
        <GraduationCap className="h-12 w-12 text-blue-400" />
        <h3 className="text-lg font-bold">No Flashcards Loaded</h3>
        <p className="text-xs text-slate-400 max-w-xs">First generate a quiz to load custom vocabulary study cards.</p>
        <button
          onClick={() => navigateTo('dashboard')}
          className="rounded-xl bg-blue-500 px-5 py-2.5 text-xs font-bold text-white transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const activeCard = studyFlashcards[activeIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % totalCards);
    }, 100);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
    }, 100);
  };

  const handleMastered = () => {
    toggleFlashcardMastery(activeCard.id);
    
    // Automatically advance to next card on mark-as-mastered after a small latency, for great UX
    setTimeout(() => {
      if (activeIndex < totalCards - 1) {
        handleNext();
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-[#F0F4FF] p-4 sm:p-6 md:p-8 max-w-3xl mx-auto space-y-6 pb-28 animate-in fade-in duration-300">
      
      {/* 3D Perspective CSS injected directly */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Flashcards Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs text-blue-400 font-mono uppercase tracking-widest font-bold">
            Subject: {currentSession?.subject || 'Custom Deck'}
          </span>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            Vocabulary Flashcards
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1">
          Mastery progress: <strong className="text-emerald-400 font-bold pl-1">{masteredCount}</strong>/{totalCards} cards
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
          style={{ width: `${(masteredCount / totalCards) * 100}%` }}
        />
      </div>

      {/* Main 3D interactive Card */}
      <div className="flex flex-col items-center justify-center gap-6">
        
        {/* Perspective container */}
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full h-72 cursor-pointer perspective-1000 group relative select-none"
        >
          {/* Rotatable card box */}
          <div className={`w-full h-full rounded-3xl border preserve-3d transition-transform duration-500 shadow-2xl flex items-center justify-center relative ${
            isFlipped ? 'rotate-y-180 border-blue-500/40 bg-[#0F172A]' : 'border-slate-800 bg-[#111827]/75 hover:border-slate-700'
          }`}>
            
            {/* Mastered badge in card */}
            {activeCard.mastered && (
              <div className="absolute top-4 right-4 z-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 p-1 text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> MASTERED
              </div>
            )}

            {/* CARD FRONT FACE */}
            <div className="absolute inset-0 backface-hidden p-6 flex flex-col justify-between text-center rounded-3xl">
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest pt-2">Card {activeIndex + 1} of {totalCards}</span>
              
              <div className="my-auto space-y-3">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white px-4">
                  {activeCard.term}
                </h3>
              </div>

              <div className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1.5 pb-2">
                <HelpCircle className="h-3.5 w-3.5 text-blue-400 animate-pulse" /> Tap to reveal definition
              </div>
            </div>

            {/* CARD BACK FACE (Rotated 180 degrees initially) */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 flex flex-col justify-between text-center rounded-3xl">
              <span className="text-[9px] text-blue-400 font-mono uppercase tracking-widest pt-2">DEFINITION & GLOSSARY</span>
              
              <div className="my-auto px-4">
                <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                  {activeCard.definition}
                </p>
              </div>

              <div className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1.5 pb-2">
                <Info className="h-3.5 w-3.5 text-slate-400" /> Click to flip card back
              </div>
            </div>

          </div>
        </div>

        {/* Deck Controls (Previous, Mastery toggling, Next) */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-6">
          {/* Previous button */}
          <button
            onClick={handlePrev}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#111827]/50 hover:bg-slate-850 py-2.5 px-4 text-xs font-bold text-slate-300 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Prev Card
          </button>

          {/* Mastery decisions */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            <button
              onClick={() => handleMastered()}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition border ${
                !activeCard.mastered 
                  ? 'border-slate-800 bg-slate-900 text-slate-400 pointer-events-none' 
                  : 'border-rose-500/30 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10'
              }`}
              disabled={!activeCard.mastered}
            >
              Still Learning 🔄
            </button>
            
            <button
              onClick={() => handleMastered()}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition border ${
                activeCard.mastered 
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15' 
                  : 'border-emerald-500 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 shadow-md shadow-emerald-500/10'
              }`}
            >
              {activeCard.mastered ? 'Mastered!' : 'Got It ✅'}
            </button>
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#111827]/50 hover:bg-slate-850 py-2.5 px-4 text-xs font-bold text-slate-300 transition"
          >
            Next Card <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Utility bar: Shuffle and reset */}
        <div className="w-full flex justify-between items-center gap-4 font-mono text-xs text-slate-400 pt-2">
          <button
            onClick={shuffleFlashcards}
            className="flex items-center gap-1.5 hover:text-white transition"
          >
            <Shuffle className="h-3.5 w-3.5 text-blue-400" /> Shuffle Deck
          </button>

          <button
            onClick={resetFlashcardMastery}
            className="flex items-center gap-1.5 hover:text-white transition"
          >
            <RotateCcw className="h-3.5 w-3.5 text-rose-400" /> Reset Mastery Progress
          </button>
        </div>

        {/* Deck Grid List */}
        <div className="w-full space-y-3 pt-4 text-left">
          <span className="block text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">Deck Glossary Index</span>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {studyFlashcards.map((card, idx) => (
              <button
                key={card.id}
                onClick={() => {
                  setIsFlipped(false);
                  setActiveIndex(idx);
                }}
                className={`rounded-xl border p-3 text-left text-xs font-semibold transition duration-200 flex items-center justify-between gap-2 ${
                  activeIndex === idx 
                    ? 'border-blue-500 bg-blue-500/10 text-blue-200 ring-1 ring-blue-500/10' 
                    : card.mastered 
                      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400/90'
                      : 'border-slate-850 bg-[#111827]/40 text-slate-400 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <span className="truncate pr-1">{card.term}</span>
                {card.mastered && (
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Celebration Dialog */}
        {isAllMastered && (
          <div className="w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-2 text-center animate-in zoom-in-95 duration-300">
            <span className="text-xl">🏆</span>
            <h4 className="font-extrabold text-white text-sm">Vocab Deck Mastered!</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Phenomenal study session! You have successfully flipped through and mastered every single term in this subject deck.
            </p>
            <button
              onClick={() => navigateTo('dashboard')}
              className="mt-2 inline-flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 py-1.5 px-3.5 text-xs font-bold text-white shadow transition"
            >
              Return to Dashboard
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
