import { useState, useEffect } from 'react';
import { useQuizStore } from '../store/quizStore';
import { 
  Trophy, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  RotateCcw, 
  Home, 
  FileText, 
  Lightbulb,
  Wallet,
  Activity,
  Loader2,
  Compass,
  CheckCircle
} from 'lucide-react';
import { QuizConfig } from '../types';
import confetti from 'canvas-confetti';

export default function ResultsPage() {
  const { 
    currentSession, 
    navigateTo, 
    setConfig,
    wallet,
    connectMockWallet,
    disconnectMockWallet,
    switchNetwork,
    mintSBTForActiveQuiz,
    sbtList
  } = useQuizStore();

  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  
  // Web3 Console State
  const [mintingStatus, setMintingStatus] = useState<'idle' | 'checking' | 'signing' | 'broadcasting' | 'confirmed' | 'error'>('idle');
  const [explorerOpen, setExplorerOpen] = useState(false);

  // Celebrates if they get 80% or higher!
  useEffect(() => {
    if (currentSession && currentSession.score >= 80) {
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [currentSession]);

  if (!currentSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0F1E] text-white p-6 text-center space-y-4">
        <Trophy className="h-12 w-12 text-amber-400" />
        <h3 className="text-lg font-bold">No Completed Session</h3>
        <p className="text-xs text-slate-400">Launch a new study deck to view quiz achievements.</p>
        <button
          onClick={() => navigateTo('dashboard')}
          className="rounded-xl bg-blue-500 px-5 py-2.5 text-xs font-bold text-white transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const { score, questions, answers, subject, difficulty, flashNote } = currentSession;
  const correctCount = answers.filter(a => a.isCorrect).length;

  // Check if already minted this subject certificate
  const alreadyMinted = sbtList.find(s => s.subject === subject && s.score === score);

  // Grade mapping
  const getGradeDetails = () => {
    if (score >= 90) return { grade: 'A+', color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5', message: "Outstanding! You're a star! 🌟" };
    if (score >= 80) return { grade: 'A', color: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/5', message: "Fabulous job! You've mastered this! 💪" };
    if (score >= 70) return { grade: 'B', color: 'text-blue-400 border-blue-500/20 bg-blue-500/5', message: "Great job! Keep it up! 🚀" };
    if (score >= 50) return { grade: 'C', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5', message: "Good effort! Review the flashcards below 📚" };
    return { grade: 'F', color: 'text-rose-400 border-rose-500/20 bg-rose-500/5', message: "Don't give up! Let's study together 🤝" };
  };

  const gradeDetails = getGradeDetails();

  const toggleAccordion = (id: string) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };

  const handleRetakeQuiz = () => {
    const retakeConfig: QuizConfig = {
      subject,
      difficulty,
      questionCount: questions.length as any,
      questionType: 'mixed'
    };
    setConfig(retakeConfig);
    navigateTo('setup');
  };

  // Trigger simulated blockchain minting pipeline
  const handleMintSoulboundToken = async () => {
    if (!wallet.connected) return;
    setMintingStatus('checking');
    
    // Step 1: checking profile & score verification
    setTimeout(() => {
      setMintingStatus('signing');
      
      // Step 2: request cryptographic signature from Metamask
      setTimeout(async () => {
        setMintingStatus('broadcasting');
        
        try {
          await mintSBTForActiveQuiz();
          setMintingStatus('confirmed');
          
          // Trigger little mint success confetti
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 }
          });
        } catch (e) {
          setMintingStatus('error');
        }
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-[#F0F4FF] p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-8 pb-28 animate-in fade-in duration-300 select-none">
      
      {/* Score Hero Dashboard Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-gradient-to-r from-[#111827] to-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Left: Summary and motivating feedback */}
          <div className="space-y-3 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-bold text-emerald-400">
              <Trophy className="h-4.5 w-4.5 text-emerald-400 animate-bounce" /> Quiz Session Accomplished
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white capitalize">
              {subject}
            </h1>
            <p className="text-sm text-slate-400 max-w-md font-medium leading-relaxed">
              {gradeDetails.message}
            </p>
            <div className="text-xs text-slate-500 font-mono">
              Correct Answers: <strong className="text-white">{correctCount}</strong> out of <strong className="text-white">{questions.length}</strong> items
            </div>
          </div>

          {/* Right: Glowing Circular Score Meter and Grade */}
          <div className="flex items-center gap-6 shrink-0">
            <div className="relative h-28 w-28 flex items-center justify-center select-none">
              <svg className="absolute h-full w-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="#0F172A"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="url(#emeraldGradient)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={289}
                  strokeDashoffset={289 - (289 * score) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="text-center z-10">
                <span className="block text-2xl font-extrabold text-white font-mono">{score}%</span>
                <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-widest">PERCENT</span>
              </div>
            </div>

            <div className={`flex flex-col items-center justify-center h-24 w-20 rounded-2xl border shadow-lg ${gradeDetails.color}`}>
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400 mb-0.5">GRADE</span>
              <span className="text-4xl font-extrabold font-mono leading-none tracking-tighter">{gradeDetails.grade}</span>
            </div>
          </div>

        </div>
      </div>

      {/* WEB3 BLOCKCHAIN SBT MINTING CONSOLE */}
      {score >= 50 && (
        <div className="rounded-2xl border border-slate-800 bg-[#111827]/40 backdrop-blur-md p-5 shadow-xl text-left space-y-4 relative overflow-hidden">
          {/* Ambient Web3 aura */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-purple-500/5 blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/10 shrink-0">
                <Wallet className="h-5 w-5 text-purple-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">Web3 Proof-of-Knowledge SBT Vault</h3>
                <span className="block text-[10px] text-slate-400">Option A: Record verified achievements on decentralized public ledger</span>
              </div>
            </div>

            {/* Connected address / connect CTA */}
            {wallet.connected ? (
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="block text-[9px] text-slate-500 font-mono">ADDRESS</span>
                  <span className="block text-[11px] text-emerald-400 font-mono font-semibold">{wallet.address}</span>
                </div>
                <button 
                  onClick={disconnectMockWallet}
                  className="rounded-lg border border-slate-800 hover:border-rose-500/30 hover:bg-rose-950/10 px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:text-rose-400 transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => connectMockWallet('polygon')}
                className="flex items-center gap-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow transition"
              >
                <Wallet className="h-3.5 w-3.5" /> Connect Web3 Wallet
              </button>
            )}
          </div>

          {/* Mint console layout depending on state */}
          {!wallet.connected ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-[#0A0F1E]/40 p-5 text-center space-y-3">
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Connect a mock MetaMask browser wallet to unlock decentralized minting. You can issue customized, non-transferable **Soulbound Token (SBT) certificates** for your study records.
              </p>
              <button
                onClick={() => connectMockWallet('polygon')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:brightness-110 px-4 py-2 text-xs font-bold text-white shadow transition"
              >
                Link Metamask Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active wallet network & options */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A0F1E]/85 rounded-xl border border-slate-850 p-3 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="block text-[8px] text-slate-500 font-mono">CHAIN BALANCE</span>
                    <span className="font-bold text-white font-mono">{wallet.balance}</span>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div>
                    <span className="block text-[8px] text-slate-500 font-mono">METADATA IPFS</span>
                    <span className="font-mono text-[10px] text-slate-400">ipfs://QmXo...WyCa/meta.json</span>
                  </div>
                </div>

                {/* Network switcher */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-500 font-mono">NETWORK:</span>
                  <select 
                    value={wallet.network}
                    onChange={(e) => switchNetwork(e.target.value as any)}
                    className="bg-[#0D1326] border border-slate-800 text-xs text-slate-300 rounded px-2 py-1 focus:outline-none font-mono"
                  >
                    <option value="ethereum">Ethereum Mainnet</option>
                    <option value="polygon">Polygon PoS</option>
                    <option value="arbitrum">Arbitrum One</option>
                    <option value="solana">Solana Mainnet</option>
                  </select>
                </div>
              </div>

              {/* Action button or Minted Certificate detail */}
              {alreadyMinted ? (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-emerald-400" /> SBT CERTIFICATE RECORDED ON-CHAIN
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Your proof of knowledge for **{subject}** has already been minted in block height **#{alreadyMinted.blockNumber}**.
                    </p>
                    <div className="flex items-center gap-3 text-[10px] font-mono pt-1">
                      <span className="text-slate-500">Token ID: <strong className="text-white">{alreadyMinted.tokenId}</strong></span>
                      <span className="text-slate-500">Fee: <strong className="text-slate-300">{alreadyMinted.gasPaid}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => setExplorerOpen(!explorerOpen)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0A0F1E] hover:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 transition"
                  >
                    <Activity className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    {explorerOpen ? 'Hide Explorer' : 'View Block Receipt'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0A0F1E]/30 rounded-xl border border-slate-850 p-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-purple-400 font-mono uppercase flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" /> SBT Mint Pipeline Ready
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      You passed this subject with a verified **{score}%**! Tap mint to generate cryptographic proof.
                    </p>
                  </div>

                  {mintingStatus === 'idle' && (
                    <button
                      onClick={handleMintSoulboundToken}
                      className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:brightness-110 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/25 transition active:scale-[0.98]"
                    >
                      Mint Soulbound Badge 💎
                    </button>
                  )}

                  {mintingStatus === 'checking' && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold font-mono py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" /> Verifying Score Metadata...
                    </div>
                  )}

                  {mintingStatus === 'signing' && (
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono py-2 animate-pulse">
                      <Wallet className="h-4 w-4 text-amber-400" /> Sign transaction in Wallet...
                    </div>
                  )}

                  {mintingStatus === 'broadcasting' && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold font-mono py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-400" /> Broadcasting to Arbitrum zkRollup...
                    </div>
                  )}

                  {mintingStatus === 'confirmed' && (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono py-2">
                      <CheckCircle className="h-4.5 w-4.5" /> Mint Accomplished!
                    </div>
                  )}
                </div>
              )}

              {/* Block Explorer Sim panel details */}
              {explorerOpen && alreadyMinted && (
                <div className="rounded-xl border border-slate-850 bg-slate-950 p-4 space-y-3 text-xs font-mono animate-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between border-b border-slate-850 pb-2 text-slate-400 text-[10px]">
                    <span className="flex items-center gap-1"><Compass className="h-3.5 w-3.5 text-blue-400" /> Decentralized Block Explorer</span>
                    <span className="text-emerald-400 font-semibold">Transaction Confirmed</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-[11px]">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[9px] uppercase">Transaction Hash</span>
                      <span className="text-slate-300 break-all leading-normal flex items-center gap-1 select-text">
                        {alreadyMinted.txHash}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[9px] uppercase">Contract Address</span>
                      <span className="text-slate-300 break-all leading-normal flex items-center gap-1 select-text">
                        {alreadyMinted.contractAddress}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[9px] uppercase">Decentralized Network</span>
                      <span className="text-white">{alreadyMinted.network}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[9px] uppercase">IPFS metadata hash</span>
                      <span className="text-blue-400 hover:underline cursor-pointer truncate block select-text">{alreadyMinted.metadataUri}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[9px] uppercase">Block Height</span>
                      <span className="text-white">#{alreadyMinted.blockNumber}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[9px] uppercase">Gas Paid</span>
                      <span className="text-white">{alreadyMinted.gasPaid}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* Page Controls */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => navigateTo('flashcards')}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 px-4 text-xs font-bold text-white shadow-md hover:bg-blue-600 transition active:scale-[0.98] cursor-pointer"
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          Study Flashcards 🃏
        </button>
        <button
          onClick={handleRetakeQuiz}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#111827]/50 hover:bg-slate-850 py-3 px-4 text-xs font-bold text-slate-300 transition active:scale-[0.98] cursor-pointer"
        >
          <RotateCcw className="h-4 w-4 shrink-0" />
          Retake Quiz
        </button>
        <button
          onClick={() => navigateTo('dashboard')}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#111827]/50 hover:bg-slate-850 py-3 px-4 text-xs font-bold text-slate-300 transition active:scale-[0.98] cursor-pointer"
        >
          <Home className="h-4 w-4 shrink-0" />
          Dashboard
        </button>
      </div>

      {/* Results Panels: Accordion reviews on Left, Flash Notes summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns: Interactive Accordion Review */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-b border-slate-800 pb-2.5">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <BookOpen className="h-4.5 w-4.5 text-blue-400" /> Review Quiz Responses
            </h2>
          </div>

          <div className="space-y-3">
            {questions.map((q, index) => {
              const ansObj = answers.find(a => a.questionId === q.id);
              const isCorrect = ansObj?.isCorrect || false;
              const isExpanded = expandedQuestion === q.id;

              return (
                <div 
                  key={q.id}
                  className={`rounded-xl border bg-[#111827]/40 overflow-hidden transition duration-200 ${
                    isExpanded ? 'border-slate-700' : 'border-slate-850 hover:border-slate-800'
                  }`}
                >
                  {/* Clickable Header Accordion */}
                  <button
                    onClick={() => toggleAccordion(q.id)}
                    className="w-full flex items-center justify-between p-4 gap-3 text-left focus:outline-none"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="pt-0.5 shrink-0">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-rose-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-widest">Question {index + 1}</span>
                        <h4 className="text-sm font-bold text-white truncate mt-0.5 leading-relaxed">{q.question}</h4>
                      </div>
                    </div>

                    <div className="shrink-0 text-slate-500 hover:text-white p-0.5">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {/* Expanded review block */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-950/50 border-t border-slate-850/80 space-y-4 text-xs text-left animate-in slide-in-from-top-2 duration-200">
                      {/* Question complete prompt */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 font-mono uppercase">Full Question Prompt</span>
                        <p className="text-sm font-semibold text-white leading-relaxed">{q.question}</p>
                      </div>

                      {/* Answers compare */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg border border-slate-850 bg-[#0A0F1E] space-y-1">
                          <span className="text-[9px] text-slate-500 font-mono uppercase">Your submitted Answer</span>
                          <p className={`text-xs font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {ansObj?.userAnswer || '[NO RESPONSE]'}
                          </p>
                        </div>

                        <div className="p-3 rounded-lg border border-slate-850 bg-[#0A0F1E] space-y-1">
                          <span className="text-[9px] text-slate-500 font-mono uppercase">Expected Correct Answer</span>
                          <p className="text-xs font-bold text-emerald-400">
                            {q.correctAnswer}
                          </p>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="rounded-lg border border-blue-900/30 bg-blue-950/5 p-3.5 space-y-1.5 leading-relaxed">
                        <span className="text-[9px] font-bold text-blue-400 font-mono uppercase flex items-center gap-1">
                          <Lightbulb className="h-3.5 w-3.5 text-blue-400" /> Educator Clarification
                        </span>
                        <p className="text-[11px] text-slate-300">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Flash Notes Summary */}
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-2.5">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <FileText className="h-4.5 w-4.5 text-emerald-400" /> AI Summary & Notes
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111827]/30 p-5 space-y-5 shadow-lg text-left">
            {/* Summary */}
            <div className="space-y-2">
              <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-widest">Topic Overview</span>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {flashNote.summary || `A comprehensive evaluation focusing on the core principles, terminologies, and practical applications of ${subject}.`}
              </p>
            </div>

            {/* Bullet Points */}
            {flashNote.keyPoints && flashNote.keyPoints.length > 0 && (
              <div className="space-y-2 border-t border-slate-800/80 pt-4">
                <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-widest">Key Learning Takeaways</span>
                <ul className="space-y-2 text-xs text-slate-400 list-disc pl-4 leading-relaxed">
                  {flashNote.keyPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key terms mini table */}
            {flashNote.keyTerms && flashNote.keyTerms.length > 0 && (
              <div className="space-y-2.5 border-t border-slate-800/80 pt-4">
                <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-widest">Glossary Terms ({flashNote.keyTerms.length})</span>
                <div className="rounded-lg border border-slate-800 bg-slate-900/30 overflow-hidden divide-y divide-slate-850">
                  {flashNote.keyTerms.map((item, idx) => (
                    <div key={idx} className="p-2.5 text-[11px] leading-normal">
                      <strong className="text-blue-400 font-semibold block mb-0.5">{item.term}</strong>
                      <span className="text-slate-400">{item.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA to Study */}
            <div className="rounded-xl bg-emerald-950/10 border border-emerald-900/30 p-3 text-[11px] text-emerald-400 leading-relaxed">
              <span><strong>Study Hint:</strong> Want to memorize these glossary terms? Click the "Study Flashcards" button above to flip through customized card sets with spaced repetition!</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
