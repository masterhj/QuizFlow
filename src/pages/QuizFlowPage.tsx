import { useState, useEffect } from 'react';
import { useQuizStore } from '../store/quizStore';
import { 
  Sparkles, 
  Clock, 
  MessageSquareText, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Trophy,
  AlertTriangle,
  TimerOff,
  Timer
} from 'lucide-react';

export default function QuizFlowPage() {
  const { 
    currentSession, 
    currentQuestionIndex, 
    userAnswers, 
    selectAnswer, 
    nextQuestion, 
    submitQuizSession, 
    toggleChat,
    navigateTo
  } = useQuizStore();

  const [shortAnswerInput, setShortAnswerInput] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timerActive, setTimerActive] = useState(true);
  const [isTimedOut, setIsTimedOut] = useState(false);

  if (!currentSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0F1E] text-white p-6 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-400" />
        <h3 className="text-lg font-bold">No Active Quiz Session</h3>
        <p className="text-xs text-slate-400 max-w-xs">Looks like you reloaded or don't have a quiz open yet.</p>
        <button
          onClick={() => navigateTo('dashboard')}
          className="rounded-xl bg-blue-500 px-5 py-2.5 text-xs font-bold text-white transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const questions = currentSession.questions;
  const activeQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  // Check if this question has already been answered
  const activeAnswer = userAnswers[activeQuestion.id];
  const isAnswered = activeAnswer !== undefined || isTimedOut;

  // Count down timer
  useEffect(() => {
    if (!timerActive || isAnswered) return;

    setTimerSeconds(30);
    setIsTimedOut(false);

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimedOut(true);
          // Register answer as timed out
          selectAnswer(activeQuestion.id, '[TIMED OUT] No answer provided within the 30-second limit.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, timerActive, isAnswered]);

  // Reset short answer input on question change
  useEffect(() => {
    setShortAnswerInput('');
    setIsTimedOut(false);
  }, [currentQuestionIndex]);

  // Handle option selection for MCQs & True/False
  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    selectAnswer(activeQuestion.id, option);
  };

  // Handle short answer confirmation
  const handleConfirmShortAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !shortAnswerInput.trim()) return;
    selectAnswer(activeQuestion.id, shortAnswerInput.trim());
  };

  // Triggers "💬 Ask AI Coach" on this exact question
  const handleAskAICoach = () => {
    // Set specific context for chatbot
    useQuizStore.setState({
      chatContext: {
        subject: currentSession.subject,
        currentQuestion: activeQuestion.question,
        currentQuestionId: activeQuestion.id
      }
    });
    toggleChat(true);
  };

  // Score color logic for choices
  const getChoiceStyle = (option: string) => {
    const isChosen = activeAnswer === option;
    
    if (!isAnswered) {
      return isChosen 
        ? 'border-blue-500 bg-blue-500/10 text-blue-200 ring-2 ring-blue-500/20' 
        : 'border-slate-850 bg-[#111827]/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60';
    }

    const isCorrect = option === activeQuestion.correctAnswer;
    if (isCorrect) {
      return 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-2 ring-emerald-500/25';
    }

    if (isChosen) {
      return 'border-rose-500 bg-rose-500/15 text-rose-300 ring-2 ring-rose-500/25';
    }

    return 'border-slate-850 bg-[#111827]/30 text-slate-500 opacity-60 pointer-events-none';
  };

  // Check correctness of active short answer
  const isShortAnswerCorrect = () => {
    if (!isAnswered || isTimedOut) return false;
    const cleanUser = (activeAnswer || '').toLowerCase().trim();
    const cleanCorrect = activeQuestion.correctAnswer.toLowerCase().trim();
    return cleanUser.includes(cleanCorrect) || cleanCorrect.includes(cleanUser);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-[#F0F4FF] p-4 sm:p-6 md:p-8 max-w-3xl mx-auto space-y-6 pb-28 animate-in fade-in duration-300">
      
      {/* Quiz Upper Row Context */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs text-blue-400 font-mono uppercase tracking-widest font-bold">Topic: {currentSession.subject}</span>
          <h2 className="text-lg font-extrabold text-white">Question {currentQuestionIndex + 1} of {questions.length}</h2>
        </div>

        {/* Timer indicator */}
        <div className="flex items-center gap-3">
          {/* Pause/Play timer */}
          <button
            onClick={() => setTimerActive(!timerActive)}
            className={`rounded-lg border p-1.5 text-xs transition ${
              timerActive 
                ? 'border-slate-800 text-slate-400 hover:text-white' 
                : 'border-amber-500/30 bg-amber-500/5 text-amber-400'
            }`}
            title={timerActive ? "Disable Timer" : "Enable Timer"}
          >
            {timerActive ? <Timer className="h-4 w-4" /> : <TimerOff className="h-4 w-4" />}
          </button>

          {timerActive && (
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-bold select-none ${
              timerSeconds <= 8 
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 animate-pulse' 
                : 'border-slate-800 bg-slate-900 text-slate-300'
            }`}>
              <Clock className={`h-3.5 w-3.5 ${timerSeconds <= 8 ? 'text-rose-400' : 'text-slate-400'}`} />
              <span>{timerSeconds > 0 ? `${timerSeconds}s Remaining` : 'Time Out'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
          style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
        />
      </div>

      {/* Active Question Box */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827]/60 backdrop-blur-md p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Question text and Badge */}
        <div className="space-y-2.5 text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-2.5 py-0.5 text-[10px] font-bold text-blue-400 font-mono uppercase">
            <Sparkles className="h-3 w-3 text-blue-400" />
            {activeQuestion.type === 'mcq' ? 'Multiple Choice' : activeQuestion.type === 'true-false' ? 'True/False' : 'Short Answer'}
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-white leading-normal">
            {activeQuestion.question}
          </h3>
        </div>

        {/* Choices or Input form */}
        {activeQuestion.type === 'mcq' && (
          <div className="grid grid-cols-1 gap-3 pt-2">
            {(activeQuestion.options || []).map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              return (
                <button
                  key={opt}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left text-sm font-semibold transition duration-200 focus:outline-none ${getChoiceStyle(opt)}`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800/70 text-xs font-bold text-white border border-slate-750 font-mono">
                      {letter}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isAnswered && opt === activeQuestion.correctAnswer && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && activeAnswer === opt && opt !== activeQuestion.correctAnswer && (
                    <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {activeQuestion.type === 'true-false' && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            {['True', 'False'].map((opt) => (
              <button
                key={opt}
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`flex flex-col items-center justify-center rounded-xl border p-6 text-center text-base font-extrabold transition duration-200 focus:outline-none ${getChoiceStyle(opt)}`}
              >
                <span className="mb-2">{opt}</span>
                {isAnswered && opt === activeQuestion.correctAnswer && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                )}
                {isAnswered && activeAnswer === opt && opt !== activeQuestion.correctAnswer && (
                  <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}

        {activeQuestion.type === 'short-answer' && (
          <div className="space-y-3 pt-2">
            {!isAnswered ? (
              <form onSubmit={handleConfirmShortAnswer} className="space-y-3">
                <textarea
                  rows={3}
                  placeholder="Type your descriptive answer here... (AI looks for semantic core terms to match)"
                  value={shortAnswerInput}
                  onChange={(e) => setShortAnswerInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-850 bg-[#0A0F1E] p-4 text-sm text-white placeholder-slate-650 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                  required
                />
                <button
                  type="submit"
                  disabled={!shortAnswerInput.trim()}
                  className="w-full rounded-xl bg-blue-500 hover:bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify Answer
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Response summary */}
                <div className={`rounded-xl border p-4 space-y-2 ${
                  isShortAnswerCorrect() 
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold font-mono uppercase">Your submitted text</span>
                    <span className="flex items-center gap-1 text-xs font-bold">
                      {isShortAnswerCorrect() ? (
                        <>Correct <CheckCircle2 className="h-4.5 w-4.5" /></>
                      ) : (
                        <>Incorrect <XCircle className="h-4.5 w-4.5" /></>
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium italic">"{activeAnswer}"</p>
                  
                  <div className="pt-3 border-t border-slate-800/50 space-y-1 text-xs text-slate-300">
                    <span>Expected Core Term:</span>
                    <p className="text-sm font-mono font-bold text-white capitalize">"{activeQuestion.correctAnswer}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instant Explanation Panel (slides in if answered) */}
        {isAnswered && (
          <div className="rounded-xl border border-blue-900/30 bg-[#0A0F1E] p-5 space-y-2.5 shadow-inner animate-in slide-in-from-bottom-4 duration-300 text-left">
            <span className="text-xs font-bold text-blue-400 font-mono uppercase flex items-center gap-1">
              <HelpCircle className="h-4 w-4 text-blue-400" />
              AI Explanation & Insights
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeQuestion.explanation}
            </p>
          </div>
        )}

      </div>

      {/* Active Footer Controls */}
      <div className="flex justify-between items-center pt-4 gap-4">
        {/* Ask AI Coach widget launcher */}
        <button
          onClick={handleAskAICoach}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#111827]/50 hover:bg-slate-850 px-4 py-3 text-xs font-bold text-slate-300 hover:text-white transition shadow-sm select-none"
        >
          <MessageSquareText className="h-4 w-4 text-blue-400 animate-bounce" />
          💬 Ask AI Coach
        </button>

        {isAnswered && (
          <button
            onClick={isLastQuestion ? submitQuizSession : nextQuestion}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-5 py-3 text-xs font-bold text-white shadow-lg hover:brightness-110 transition active:scale-[0.98]"
          >
            {isLastQuestion ? (
              <>
                Finish & Submit
                <Trophy className="h-4 w-4" />
              </>
            ) : (
              <>
                Next Question
                <ArrowRight className="h-4 w-4 animate-pulse" />
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
}
