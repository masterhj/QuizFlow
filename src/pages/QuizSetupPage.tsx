import { useState, useEffect } from 'react';
import { useQuizStore } from '../store/quizStore';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  Sliders, 
  CheckCircle, 
  BrainCircuit,
  Clock,
  FileText,
  Trophy
} from 'lucide-react';
import { QuizConfig } from '../types';

const PRESETS = ['Photosynthesis', 'Quantum Mechanics', 'Periodic Table', 'World War II', 'Linear Equations', 'Data Structures'];

const LOADING_MESSAGES = [
  "Analyzing your subject parameters...",
  "Structuring pedagogical goals...",
  "Crafting custom quiz questions...",
  "Summarizing key study points...",
  "Generating flashcard decks...",
  "Polishing the explanations...",
  "Almost ready!"
];

export default function QuizSetupPage() {
  const { 
    currentConfig, 
    setConfig, 
    generateNewQuiz, 
    navigateTo 
  } = useQuizStore();

  // Local wizard state
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState(currentConfig?.subject || '');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(currentConfig?.difficulty || 'medium');
  const [questionCount, setQuestionCount] = useState<5 | 10 | 20>((currentConfig?.questionCount as any) || 5);
  const [questionType, setQuestionType] = useState<'mcq' | 'true-false' | 'short-answer' | 'mixed'>(currentConfig?.questionType || 'mixed');
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // Rotate loading messages
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1600);
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleNextStep = () => {
    if (step === 1 && !subject.trim()) return;
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleTriggerGeneration = async () => {
    const finalConfig: QuizConfig = {
      subject: subject.trim(),
      difficulty,
      questionCount,
      questionType
    };

    setConfig(finalConfig);
    setIsLoading(true);

    try {
      await generateNewQuiz();
    } catch (e) {
      alert("Failed to generate quiz. If using Live Claude, please check your API key inside Settings, or turn on Simulator mode in the top right settings drawer!");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-[#F0F4FF] p-6 md:p-8 max-w-3xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300">
      
      {/* Setup Wizard Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('dashboard')}
            className="rounded-lg border border-slate-800 bg-[#111827]/50 p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Back to Dashboard</span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-300">AI Study Deck</span>
        </h1>
        <p className="text-sm text-slate-400">
          Configure your customized study session. Our AI generates unique, instant learning guides tailored to your choices.
        </p>
      </div>

      {/* Wizard Progress Tracker */}
      <div className="relative rounded-2xl border border-slate-800 bg-[#111827]/40 p-4 flex justify-between items-center shadow-md font-mono text-xs select-none">
        <div className="flex items-center gap-2">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full font-bold ${
            step >= 1 ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'
          }`}>1</span>
          <span className={step === 1 ? 'text-blue-400 font-bold' : 'text-slate-400'}>Topic Selection</span>
        </div>
        <div className="hidden sm:block h-px w-8 bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full font-bold ${
            step >= 2 ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'
          }`}>2</span>
          <span className={step === 2 ? 'text-blue-400 font-bold' : 'text-slate-400'}>Configuration</span>
        </div>
        <div className="hidden sm:block h-px w-8 bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full font-bold ${
            step === 3 ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'
          }`}>3</span>
          <span className={step === 3 ? 'text-blue-400 font-bold' : 'text-slate-400'}>Review & Launch</span>
        </div>
      </div>

      {/* Step Containers */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827]/60 backdrop-blur-md p-6 md:p-8 shadow-2xl min-h-[280px] flex flex-col justify-between gap-8">
        
        {/* STEP 1: SUBJECT INPUT */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-3 text-center max-w-lg mx-auto">
              <Compass className="h-8 w-8 text-blue-400 mx-auto" />
              <h3 className="text-lg font-extrabold text-white">What do you want to study today?</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Type a broad curriculum subject or a hyper-specific academic topic. Our AI covers everything from grade school to postgraduate courses.
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="e.g., Photosynthesis, World War II, Python Programming, Ancient Rome..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-850 bg-[#0A0F1E] px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition font-semibold"
                maxLength={60}
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Be specific for better AI results</span>
                <span>{subject.length}/60 chars</span>
              </div>
            </div>

            {/* Preset chips */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">Popular Presets</span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSubject(p)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                      subject === p 
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300 shadow-md' 
                        : 'border-slate-850 bg-[#0A0F1E] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIGURATION */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <Sliders className="h-5 w-5 text-blue-400" />
              <h3 className="text-base font-extrabold text-white font-mono uppercase tracking-wider">Fine-tune Parameters</h3>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">Select Difficulty</span>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'easy' as const, title: 'Easy 🟢', desc: 'Fundamental terms' },
                  { id: 'medium' as const, title: 'Medium 🟡', desc: 'Core details & logic' },
                  { id: 'hard' as const, title: 'Hard 🔴', desc: 'Advanced concepts' }
                ].map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setDifficulty(diff.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      difficulty === diff.id 
                        ? 'border-blue-500 bg-blue-500/5 text-white ring-1 ring-blue-500/20' 
                        : 'border-slate-850 bg-[#0A0F1E] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-sm font-bold text-white mb-0.5">{diff.title}</span>
                    <span className="block text-[10px] text-slate-500 leading-tight">{diff.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count Segmented Control */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">Number of Questions</span>
              <div className="flex bg-[#0A0F1E] rounded-xl p-1 border border-slate-850">
                {([5, 10, 20] as const).map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                      questionCount === count 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Question Type Segmented Control */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">Question Types</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'mcq' as const, label: 'Multiple Choice' },
                  { id: 'true-false' as const, label: 'True/False' },
                  { id: 'short-answer' as const, label: 'Short Answer' },
                  { id: 'mixed' as const, label: 'Mixed Set' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setQuestionType(t.id)}
                    className={`py-2.5 px-3 text-[11px] font-bold rounded-xl border transition ${
                      questionType === t.id 
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300' 
                        : 'border-slate-850 bg-[#0A0F1E] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRM & GENERATE */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-extrabold text-white font-mono uppercase tracking-wider">Review & Launch</h3>
            </div>

            {/* Confirmation Summary Card */}
            <div className="rounded-xl border border-slate-800 bg-[#0A0F1E] p-5 space-y-4 shadow-inner">
              <div className="flex justify-between border-b border-slate-800/50 pb-3">
                <span className="text-xs text-slate-500 font-mono uppercase">Selected Topic</span>
                <span className="text-sm font-bold text-white">{subject}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-2 bg-slate-900/40 rounded-lg border border-slate-850/60">
                  <span className="block text-[10px] text-slate-500 font-mono uppercase mb-1">Difficulty</span>
                  <span className="text-xs font-bold text-white capitalize">{difficulty}</span>
                </div>
                <div className="p-2 bg-slate-900/40 rounded-lg border border-slate-850/60">
                  <span className="block text-[10px] text-slate-500 font-mono uppercase mb-1">Count</span>
                  <span className="text-xs font-bold text-white">{questionCount} items</span>
                </div>
                <div className="p-2 bg-slate-900/40 rounded-lg border border-slate-850/60">
                  <span className="block text-[10px] text-slate-500 font-mono uppercase mb-1">Format</span>
                  <span className="text-xs font-bold text-white capitalize">{questionType}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/50">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>Estimated Session Time: <strong>~{Math.round(questionCount * 1.5)} mins</strong></span>
              </div>
            </div>

            {/* Educational benefits notice */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 border border-slate-800/60 bg-slate-900/30 rounded-xl flex flex-col gap-1">
                <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                <strong className="text-white text-[11px] mt-0.5">Complete Quiz</strong>
                <span className="text-slate-400 leading-tight text-[10px]">Tailor-made questions with inline explanations.</span>
              </div>
              <div className="p-3 border border-slate-800/60 bg-slate-900/30 rounded-xl flex flex-col gap-1">
                <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
                <strong className="text-white text-[11px] mt-0.5">Flashcards Deck</strong>
                <span className="text-slate-400 leading-tight text-[10px]">A complete glossary of key concepts to master.</span>
              </div>
              <div className="p-3 border border-slate-800/60 bg-slate-900/30 rounded-xl flex flex-col gap-1">
                <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
                <strong className="text-white text-[11px] mt-0.5">Performance Score</strong>
                <span className="text-slate-400 leading-tight text-[10px]">Recalculated metrics automatically saved in history.</span>
              </div>
            </div>
          </div>
        )}

        {/* Button bar */}
        <div className="flex justify-between items-center border-t border-slate-850 pt-6 gap-4">
          {step > 1 ? (
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-2 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNextStep}
              disabled={!subject.trim()}
              className="flex items-center gap-2 rounded-xl bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-600 transition active:scale-[0.98]"
            >
              Next Step
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleTriggerGeneration}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/15 hover:brightness-110 transition active:scale-[0.98]"
            >
              <BrainCircuit className="h-4 w-4" />
              Generate My Quiz ✨
            </button>
          )}
        </div>

      </div>

      {/* Full Screen Generation Loader */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0F1E]/90 backdrop-blur-md p-6">
          <div className="relative max-w-sm w-full text-center space-y-6">
            {/* AI Spinning Core */}
            <div className="relative mx-auto h-24 w-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-400 border-b-emerald-400 border-l-slate-800 border-r-slate-800 animate-spin duration-1000" />
              <BrainCircuit className="h-8 w-8 text-blue-400 animate-pulse" />
            </div>

            <div className="space-y-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">Structuring study deck...</h2>
              <div className="h-7 overflow-hidden relative w-full">
                <span 
                  key={loadingMsgIdx}
                  className="block text-xs font-mono text-slate-400 animate-in slide-in-from-bottom-2 duration-300 absolute left-0 right-0 text-center"
                >
                  {LOADING_MESSAGES[loadingMsgIdx]}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-blue-900/30 bg-blue-950/10 p-3.5 text-xs text-slate-400 leading-normal">
              <span>Generating a complete suite: {questionCount} questions, standard definitions, and concise study glossaries. Ready in about 2 seconds!</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
