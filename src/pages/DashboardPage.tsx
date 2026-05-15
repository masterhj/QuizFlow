import { useEffect, useState } from 'react';
import { useQuizStore } from '../store/quizStore';
import { 
  Sparkles, 
  GraduationCap, 
  Trophy, 
  History, 
  PlusCircle, 
  Calendar, 
  Flame, 
  TrendingUp, 
  ArrowRight, 
  Trash2, 
  BookMarked, 
  HelpCircle,
  Shield,
  Compass,
  Wallet,
  Cpu,
  KeyRound,
  Code2,
  NotebookText,
  RefreshCw,
  Radio,
  Newspaper,
  BrainCircuit
} from 'lucide-react';
import { QuizConfig, QuizSession } from '../types';

const SUGGESTED_SUBJECTS = [
  { name: 'Biology', icon: '🧬', color: 'from-emerald-500/10 to-emerald-500/5 text-emerald-400 border-emerald-500/20' },
  { name: 'Chemistry', icon: '🧪', color: 'from-sky-500/10 to-sky-500/5 text-sky-400 border-sky-500/20' },
  { name: 'Physics', icon: '🌌', color: 'from-blue-500/10 to-blue-500/5 text-blue-400 border-blue-500/20' },
  { name: 'History', icon: '⏳', color: 'from-amber-500/10 to-amber-500/5 text-amber-400 border-amber-500/20' },
  { name: 'Computer Science', icon: '💻', color: 'from-purple-500/10 to-purple-500/5 text-purple-400 border-purple-500/20' },
  { name: 'Mathematics', icon: '📐', color: 'from-rose-500/10 to-rose-500/5 text-rose-400 border-rose-500/20' },
  { name: 'Geography', icon: '🗺️', color: 'from-teal-500/10 to-teal-500/5 text-teal-400 border-teal-500/20' },
  { name: 'Literature', icon: '📚', color: 'from-indigo-500/10 to-indigo-500/5 text-indigo-400 border-indigo-500/20' }
];

const DSA_TRACKS = [
  'Arrays and Strings',
  'Linked Lists',
  'Trees and Graphs',
  'Dynamic Programming',
  'Greedy Algorithms',
  'Sorting and Searching'
];

type TechUpdate = {
  id: string;
  title: string;
  url: string;
  source: string;
  createdAt: string;
};

const FALLBACK_UPDATES: TechUpdate[] = [
  {
    id: 'local-ai-agents',
    title: 'AI agents, coding copilots, and small models continue reshaping developer workflows',
    url: 'https://news.ycombinator.com/',
    source: 'Live fallback feed',
    createdAt: new Date().toISOString()
  },
  {
    id: 'local-vector-db',
    title: 'Vector search, RAG pipelines, and memory layers remain key AI app architecture trends',
    url: 'https://news.ycombinator.com/',
    source: 'Live fallback feed',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString()
  },
  {
    id: 'local-web3-proof',
    title: 'Web3 credentials and verifiable learning records gain traction in education demos',
    url: 'https://news.ycombinator.com/',
    source: 'Live fallback feed',
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString()
  }
];

export default function DashboardPage() {
  const { 
    user, 
    quizHistory, 
    navigateTo, 
    setConfig, 
    deleteHistoryItem,
    sbtList,
    wallet,
    connectMockWallet,
    useGemini,
    apiKey,
    setSettings,
    toggleSettingsModal
  } = useQuizStore();

  const [activeDashboardTab, setActiveDashboardTab] = useState<'quizzes' | 'sbts'>('quizzes');
  const [activeSbtExplorer, setActiveSbtExplorer] = useState<string | null>(null);
  const [selectedDsaTrack, setSelectedDsaTrack] = useState(DSA_TRACKS[0]);
  const [collegeNotes, setCollegeNotes] = useState(() => localStorage.getItem('quiz_platform_college_notes') || 'Paste your lecture notes here. Example: Operating Systems scheduling, DBMS normalization, or DSA graph traversal notes.');
  const [aiRevision, setAiRevision] = useState('');
  const [isRevising, setIsRevising] = useState(false);
  const [techUpdates, setTechUpdates] = useState<TechUpdate[]>(FALLBACK_UPDATES);
  const [isUpdatesLoading, setIsUpdatesLoading] = useState(false);
  const [lastUpdateRefresh, setLastUpdateRefresh] = useState(new Date());

  const fetchTechUpdates = async () => {
    setIsUpdatesLoading(true);
    try {
      const response = await fetch('https://hn.algolia.com/api/v1/search_by_date?query=AI%20OR%20artificial%20intelligence%20OR%20developer%20tools&tags=story&hitsPerPage=5');
      const data = await response.json();
      const mapped = (data.hits || []).slice(0, 5).map((item: any, index: number) => ({
        id: item.objectID || `hn-${index}`,
        title: item.title || item.story_title || 'Untitled technology update',
        url: item.url || item.story_url || 'https://news.ycombinator.com/',
        source: `Hacker News${item.points ? ` · ${item.points} pts` : ''}`,
        createdAt: item.created_at || new Date().toISOString()
      }));
      setTechUpdates(mapped.length ? mapped : FALLBACK_UPDATES);
      setLastUpdateRefresh(new Date());
    } catch (error) {
      setTechUpdates(FALLBACK_UPDATES);
      setLastUpdateRefresh(new Date());
    } finally {
      setIsUpdatesLoading(false);
    }
  };

  useEffect(() => {
    fetchTechUpdates();
    const interval = window.setInterval(fetchTechUpdates, 1000 * 60 * 2);
    return () => window.clearInterval(interval);
  }, []);

  if (!user) return null;

  const engineLabel = useGemini ? 'Option B: Gemini Direct' : 'Option A: AI Simulator';
  const engineTone = useGemini ? 'text-purple-400 border-purple-500/20 bg-purple-500/5' : 'text-blue-400 border-blue-500/20 bg-blue-500/5';
  const engineDescription = useGemini
    ? 'You are using the same polished Option A dashboard UI, now powered by the Option B Gemini generation pipeline.'
    : 'You are using the polished Option A dashboard UI with local AI generation, Google auth simulation, and Web3 SBT records.';

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Formats the ISO completed time
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  // Pre-selects a subject chip and pushes them to Step 2 of Setup Wizard
  const handleSelectSuggested = (subject: string) => {
    const newConfig: QuizConfig = {
      subject,
      difficulty: 'medium',
      questionCount: 5,
      questionType: 'mixed'
    };
    setConfig(newConfig);
    navigateTo('setup');
  };

  const handleStartDsaQuiz = () => {
    setConfig({
      subject: `Data Structures and Algorithms - ${selectedDsaTrack}`,
      difficulty: selectedDsaTrack === 'Dynamic Programming' || selectedDsaTrack === 'Trees and Graphs' ? 'hard' : 'medium',
      questionCount: 10,
      questionType: 'mixed'
    });
    navigateTo('setup');
  };

  const handleReviseNotes = () => {
    localStorage.setItem('quiz_platform_college_notes', collegeNotes);
    setIsRevising(true);
    window.setTimeout(() => {
      const cleaned = collegeNotes.replace(/\s+/g, ' ').trim();
      const words = cleaned.split(' ').filter(Boolean);
      const preview = words.slice(0, 34).join(' ');
      setAiRevision([
        `Quick summary: ${preview}${words.length > 34 ? '...' : ''}`,
        'Revision plan: convert headings into flashcards, recall definitions without looking, then solve one application-style question per topic.',
        'Likely exam focus: definitions, compare-and-contrast points, implementation steps, edge cases, and real-world examples.',
        `AI prompt to ask next: "Quiz me from these notes in 5 short-answer questions."`
      ].join('\n\n'));
      setIsRevising(false);
    }, 900);
  };

  // Loads a completed session for full review
  const handleReviewSession = (session: QuizSession) => {
    useQuizStore.setState({
      currentSession: session,
      studyFlashcards: session.flashcards
    });
    navigateTo('results');
  };

  // Calculate average score visual color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 70) return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
    if (score >= 50) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-[#F0F4FF] p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300 select-none">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-gradient-to-r from-[#111827] to-slate-950 p-6 md:p-8 shadow-2xl">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono uppercase tracking-widest">
              <Calendar className="h-3.5 w-3.5 text-blue-400" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              <span className={`ml-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${engineTone}`}>
                {useGemini ? <Cpu className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                {engineLabel}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-300">{user.displayName}</span>!
            </h1>
            <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
              {engineDescription} Type any subject or select one of the popular courses below to generate a personalized AI quiz instantly.
            </p>
          </div>

          <button
            onClick={() => {
              setConfig({ subject: '', difficulty: 'medium', questionCount: 5, questionType: 'mixed' });
              navigateTo('setup');
            }}
            className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:brightness-115 transition active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <PlusCircle className="h-5 w-5" />
            Start New Quiz
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Row Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Stat Card: Streak */}
        <div className="relative rounded-2xl border border-slate-800 bg-[#111827]/50 backdrop-blur-md p-4 md:p-5 shadow-xl flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 shadow-inner">
            <Flame className="h-6 w-6 fill-amber-500/20" />
          </div>
          <div className="min-w-0 text-left">
            <span className="block text-xs text-slate-400 font-mono uppercase tracking-wider">Study Streak</span>
            <span className="text-xl md:text-2xl font-bold text-white font-mono leading-tight">{user.studyStreak} Days</span>
          </div>
        </div>

        {/* Stat Card: Quizzes taken */}
        <div className="relative rounded-2xl border border-slate-800 bg-[#111827]/50 backdrop-blur-md p-4 md:p-5 shadow-xl flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="min-w-0 text-left">
            <span className="block text-xs text-slate-400 font-mono uppercase tracking-wider">Quizzes Taken</span>
            <span className="text-xl md:text-2xl font-bold text-white font-mono leading-tight">{user.totalQuizzes} Sessions</span>
          </div>
        </div>

        {/* Stat Card: Avg Score */}
        <div className="relative rounded-2xl border border-slate-800 bg-[#111827]/50 backdrop-blur-md p-4 md:p-5 shadow-xl flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="min-w-0 text-left">
            <span className="block text-xs text-slate-400 font-mono uppercase tracking-wider">Average Score</span>
            <span className="text-xl md:text-2xl font-bold text-white font-mono leading-tight">{user.averageScore}%</span>
          </div>
        </div>

        {/* Stat Card: Subjects tried */}
        <div className="relative rounded-2xl border border-slate-800 bg-[#111827]/50 backdrop-blur-md p-4 md:p-5 shadow-xl flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="min-w-0 text-left">
            <span className="block text-xs text-slate-400 font-mono uppercase tracking-wider">Topics Explored</span>
            <span className="text-xl md:text-2xl font-bold text-white font-mono leading-tight">{user.subjectsTried.length} Subjects</span>
          </div>
        </div>

      </div>

      {/* New Option Features: DSA Quiz, Notes Revision, Live Tech Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Structures and Algorithms Quiz Launcher */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827]/40 p-5 space-y-4 text-left shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">DSA Quiz Track</h2>
              <p className="text-[10px] text-slate-500">Placement-ready algorithm practice</p>
            </div>
          </div>

          <select
            value={selectedDsaTrack}
            onChange={(e) => setSelectedDsaTrack(e.target.value)}
            className="relative w-full rounded-xl border border-slate-800 bg-[#0A0F1E] px-3 py-2.5 text-xs font-bold text-slate-300 focus:border-blue-500 focus:outline-none"
          >
            {DSA_TRACKS.map((track) => (
              <option key={track} value={track}>{track}</option>
            ))}
          </select>

          <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
            <div className="rounded-lg border border-slate-800 bg-[#0A0F1E]/80 p-2">
              <span className="block text-slate-500">LEVEL</span>
              <strong className="text-white">Medium+</strong>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#0A0F1E]/80 p-2">
              <span className="block text-slate-500">COUNT</span>
              <strong className="text-white">10 Qs</strong>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#0A0F1E]/80 p-2">
              <span className="block text-slate-500">MODE</span>
              <strong className="text-white">Mixed</strong>
            </div>
          </div>

          <button
            onClick={handleStartDsaQuiz}
            className="relative w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/10 hover:brightness-110 transition active:scale-[0.98]"
          >
            Start DSA Quiz
          </button>
        </div>

        {/* College Notes AI Revision Hub */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827]/40 p-5 space-y-4 text-left shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <NotebookText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">College Notes Hub</h2>
              <p className="text-[10px] text-slate-500">Save notes and revise with AI</p>
            </div>
          </div>

          <textarea
            value={collegeNotes}
            onChange={(e) => setCollegeNotes(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-slate-800 bg-[#0A0F1E] p-3 text-xs text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none resize-none"
            placeholder="Paste DBMS, OS, CN, DSA, AI/ML, or class notes here..."
          />

          {aiRevision && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] leading-relaxed text-emerald-100 whitespace-pre-line">
              {aiRevision}
            </div>
          )}

          <button
            onClick={handleReviseNotes}
            disabled={isRevising || collegeNotes.trim().length < 10}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/10 hover:brightness-110 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRevising ? 'AI is revising notes...' : 'Revise Notes with AI'}
          </button>
        </div>

        {/* Real-time Tech and AI Updates */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827]/40 p-5 space-y-4 text-left shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                <Newspaper className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">Tech & AI Live</h2>
                <p className="text-[10px] text-slate-500">Auto-refreshing tech signal feed</p>
              </div>
            </div>
            <button
              onClick={fetchTechUpdates}
              className="rounded-lg border border-slate-800 bg-[#0A0F1E] p-2 text-slate-400 hover:text-white transition"
              title="Refresh updates"
            >
              <RefreshCw className={`h-4 w-4 ${isUpdatesLoading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[10px] font-bold text-emerald-400 font-mono w-fit">
            <Radio className="h-3 w-3 animate-pulse" />
            Last refresh {lastUpdateRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {techUpdates.map((update) => (
              <a
                key={update.id}
                href={update.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-slate-800 bg-[#0A0F1E]/70 p-3 hover:border-purple-500/30 hover:bg-slate-950 transition"
              >
                <span className="block text-[11px] font-bold text-slate-200 leading-snug">{update.title}</span>
                <span className="mt-1 block text-[9px] text-slate-500 font-mono">
                  {update.source} · {formatDate(update.createdAt)}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Split: Suggested & Recent history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Columns: Recent History OR SBT Vault Portfolio */}
        <div className="lg:col-span-2 space-y-6">
          {/* Website context panel to balance the area beside Suggested Subjects */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#111827]/80 via-[#0D1326]/90 to-slate-950 p-5 shadow-xl text-left">
            <div className="absolute -top-16 right-10 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-md space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-[10px] font-bold text-blue-400 font-mono uppercase tracking-wider">
                  <BrainCircuit className="h-3.5 w-3.5" /> QuizAI Study Flow
                </span>
                <h2 className="text-xl font-extrabold tracking-tight text-white">One workspace for quizzes, notes, AI revision, and verified learning records.</h2>
                <p className="text-xs leading-relaxed text-slate-400">
                  Generate a custom quiz, ask the AI coach for hints, revise your college notes, then mint a Web3 proof-of-knowledge badge when you complete a session.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:min-w-[310px]">
                {[
                  { label: 'Generate', value: 'AI Quiz', icon: Sparkles, tone: 'text-blue-400 border-blue-500/20 bg-blue-500/5' },
                  { label: 'Revise', value: 'College Notes', icon: NotebookText, tone: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
                  { label: 'Practice', value: 'DSA Track', icon: Code2, tone: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5' },
                  { label: 'Credential', value: 'SBT Badge', icon: Shield, tone: 'text-purple-400 border-purple-500/20 bg-purple-500/5' }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className={`rounded-xl border p-3 ${item.tone}`}>
                      <Icon className="h-4 w-4 mb-2" />
                      <span className="block text-[9px] font-mono font-bold uppercase tracking-widest opacity-80">{item.label}</span>
                      <strong className="block text-xs text-white mt-0.5">{item.value}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Toggles Tab Menu */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveDashboardTab('quizzes')}
                className={`text-base font-extrabold flex items-center gap-2 font-mono uppercase tracking-wider pb-1 border-b-2 transition cursor-pointer ${
                  activeDashboardTab === 'quizzes' 
                    ? 'border-blue-500 text-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <History className="h-4.5 w-4.5" /> My History
              </button>

              <button
                onClick={() => setActiveDashboardTab('sbts')}
                className={`text-base font-extrabold flex items-center gap-2 font-mono uppercase tracking-wider pb-1 border-b-2 transition cursor-pointer ${
                  activeDashboardTab === 'sbts' 
                    ? 'border-purple-500 text-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Shield className="h-4.5 w-4.5 text-purple-400" /> SBT Ledger ({sbtList.length})
              </button>
            </div>

            <span className="text-xs text-slate-500 font-mono">
              {activeDashboardTab === 'quizzes' ? `${quizHistory.length} sessions` : `${sbtList.length} verified badges`}
            </span>
          </div>

          {/* TAB 1: QUIZZES HISTORY */}
          {activeDashboardTab === 'quizzes' && (
            quizHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-[#111827]/20 p-12 text-center space-y-4 animate-in fade-in duration-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                  <BookMarked className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white">No Quiz History Yet</h3>
                  <p className="text-sm text-slate-500 max-w-xs">Your study logs will appear here once you complete your first generated AI session.</p>
                </div>
                <button
                  onClick={() => navigateTo('setup')}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white transition"
                >
                  Launch Setup Wizard
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                {quizHistory.map((session) => {
                  const grade = session.score >= 90 ? 'A+' : session.score >= 80 ? 'B' : session.score >= 70 ? 'C' : session.score >= 50 ? 'D' : 'F';
                  return (
                    <div 
                      key={session.id}
                      className="group relative rounded-xl border border-slate-800 bg-[#111827]/40 hover:border-slate-700/80 p-5 shadow-lg hover:shadow-blue-500/[0.02] transition duration-200 flex flex-col justify-between gap-4 text-left"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-[#0A0F1E] px-2.5 py-0.5 text-[10px] font-semibold text-slate-400 capitalize">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              session.difficulty === 'easy' ? 'bg-emerald-400' : session.difficulty === 'medium' ? 'bg-amber-400' : 'bg-rose-400'
                            }`} />
                            {session.difficulty}
                          </span>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteHistoryItem(session.id);
                            }}
                            className="text-slate-600 hover:text-rose-400 p-1 rounded transition cursor-pointer"
                            title="Delete record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <h3 className="font-extrabold text-white text-base truncate">{session.subject}</h3>
                        <p className="text-xs text-slate-500 font-mono">{formatDate(session.completedAt)}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg border text-base font-extrabold font-mono ${getScoreColor(session.score)}`}>
                            {grade}
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-mono">Score achieved</span>
                            <span className="text-sm font-bold text-white font-mono">{session.score}%</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleReviewSession(session)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0A0F1E] hover:bg-slate-900 hover:text-white px-3 py-1.5 text-xs font-bold text-slate-300 transition cursor-pointer"
                        >
                          Review
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* TAB 2: WEB3 SOULBOUND TOKEN EXPLORER VAULT */}
          {activeDashboardTab === 'sbts' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Web3 connection status banner */}
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <Wallet className="h-5 w-5 text-purple-400" />
                  <div className="text-left">
                    <span className="block text-xs font-bold text-white font-mono">WEB3 VAULT LEDGER</span>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {wallet.connected ? `Linked Wallet: ${wallet.address}` : 'Wallet disconnected. Connect metamask to issue new verified SBT certificates!'}
                    </p>
                  </div>
                </div>

                {!wallet.connected && (
                  <button
                    onClick={() => connectMockWallet('polygon')}
                    className="rounded-lg bg-purple-500 hover:bg-purple-600 px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>

              {/* SBT Cards Grid */}
              {sbtList.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-[#111827]/20 p-12 text-center space-y-3">
                  <Shield className="h-10 w-10 text-slate-600" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm">No Soulbound Certs Earned</h3>
                    <p className="text-xs text-slate-500 max-w-xs leading-normal">Pass active quizzes with score &ge; 50% to mint cryptographically verified Proof-of-Knowledge tokens!</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sbtList.map((sbt) => {
                    const isExpanded = activeSbtExplorer === sbt.tokenId;
                    return (
                      <div 
                        key={sbt.tokenId}
                        className={`rounded-xl border p-4 space-y-3.5 transition duration-200 text-left ${
                          isExpanded 
                            ? 'border-purple-500/80 bg-purple-950/10 shadow-lg shadow-purple-500/[0.03]' 
                            : 'border-slate-850 bg-[#111827]/40 hover:border-slate-800 hover:bg-[#111827]/60'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <span className="block text-[8px] font-mono text-purple-400 tracking-widest uppercase">{sbt.network}</span>
                            <h3 className="text-sm font-bold text-white truncate capitalize">{sbt.subject} Proof</h3>
                          </div>
                          <span className="rounded bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[9px] font-bold font-mono text-purple-300">
                            {sbt.tokenId}
                          </span>
                        </div>

                        {/* Specs row */}
                        <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
                          <div className="bg-[#0A0F1E]/80 rounded p-1 border border-slate-850">
                            <span className="block text-[8px] text-slate-500 uppercase">GRADE</span>
                            <span className="font-bold text-white">{sbt.score}%</span>
                          </div>
                          <div className="bg-[#0A0F1E]/80 rounded p-1 border border-slate-850">
                            <span className="block text-[8px] text-slate-500 uppercase">LEVEL</span>
                            <span className="font-bold text-white capitalize">{sbt.difficulty}</span>
                          </div>
                          <div className="bg-[#0A0F1E]/80 rounded p-1 border border-slate-850">
                            <span className="block text-[8px] text-slate-500 uppercase">BLOCK</span>
                            <span className="font-bold text-white">#{sbt.blockNumber}</span>
                          </div>
                        </div>

                        {/* Toggle block explorer explorer */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                          <span className="text-[9px] text-slate-500 font-mono">Issued: {formatDate(sbt.mintedAt)}</span>
                          
                          <button
                            onClick={() => setActiveSbtExplorer(isExpanded ? null : sbt.tokenId)}
                            className="text-[10px] font-bold font-mono text-purple-400 hover:text-purple-300 flex items-center gap-0.5 cursor-pointer"
                          >
                            {isExpanded ? 'Hide Explorer' : 'Explore Ledger'}
                          </button>
                        </div>

                        {/* Explorer details panel */}
                        {isExpanded && (
                          <div className="rounded-lg bg-slate-950 p-3 space-y-2.5 font-mono text-[10px] text-slate-400 border border-slate-850 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                              <span className="flex items-center gap-1 text-[9px]"><Compass className="h-3 w-3 text-blue-400" /> Web3 Ledger Explorer</span>
                              <span className="text-emerald-400 font-bold">Verified</span>
                            </div>
                            <div className="space-y-1 leading-normal text-[10px]">
                              <div className="flex justify-between">
                                <span className="text-slate-500 uppercase text-[8px]">Tx Hash:</span>
                                <span className="text-slate-300 truncate max-w-[160px] select-text" title={sbt.txHash}>{sbt.txHash}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 uppercase text-[8px]">Contract:</span>
                                <span className="text-slate-300 truncate max-w-[160px] select-text" title={sbt.contractAddress}>{sbt.contractAddress}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 uppercase text-[8px]">IPFS Meta:</span>
                                <span className="text-blue-400 truncate max-w-[160px] hover:underline select-text">{sbt.metadataUri}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 uppercase text-[8px]">Gas paid:</span>
                                <span className="text-slate-300">{sbt.gasPaid}</span>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Right Column: Suggested Course Subjects */}
        <div className="space-y-6">
          {/* Shared Option A UI applied to Option B engine controller */}
          <div className="rounded-2xl border border-slate-800 bg-[#111827]/30 p-5 space-y-4 shadow-lg text-left relative overflow-hidden">
            <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl pointer-events-none ${useGemini ? 'bg-purple-500/10' : 'bg-blue-500/10'}`} />

            <div className="flex items-start justify-between gap-3 relative">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${engineTone}`}>
                  {useGemini ? <Cpu className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">Shared AI Dashboard</h2>
                  <p className="text-[10px] text-slate-500 leading-tight">Option A interface mapped into Option B</p>
                </div>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold font-mono ${engineTone}`}>
                {useGemini ? 'OPTION B LIVE' : 'OPTION A ACTIVE'}
              </span>
            </div>

            <p className="relative text-xs text-slate-400 leading-relaxed">
              Both engines now share the same dashboard shell: study history, Web3 SBT ledger, wallet status, score summaries, and subject launcher. Option B only swaps the generation backend to Gemini.
            </p>

            <div className="grid grid-cols-2 gap-2 relative">
              <button
                onClick={() => setSettings(apiKey, false)}
                className={`rounded-xl border px-3 py-2 text-left transition ${
                  !useGemini ? 'border-blue-500/70 bg-blue-500/10 text-blue-300' : 'border-slate-800 bg-[#0A0F1E] text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="block text-[10px] font-bold font-mono uppercase">Option A</span>
                <span className="block text-[10px] leading-tight">Simulator UI</span>
              </button>
              <button
                onClick={() => setSettings(apiKey, true)}
                className={`rounded-xl border px-3 py-2 text-left transition ${
                  useGemini ? 'border-purple-500/70 bg-purple-500/10 text-purple-300' : 'border-slate-800 bg-[#0A0F1E] text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="block text-[10px] font-bold font-mono uppercase">Option B</span>
                <span className="block text-[10px] leading-tight">Gemini + same UI</span>
              </button>
            </div>

            <div className="relative rounded-xl border border-slate-800 bg-[#0A0F1E]/70 p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500">GEMINI KEY</span>
                <span className={apiKey ? 'text-emerald-400' : 'text-amber-400'}>{apiKey ? 'Configured' : 'Not configured'}</span>
              </div>
              <button
                onClick={() => toggleSettingsModal(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 hover:bg-slate-900 px-3 py-2 text-[11px] font-bold text-slate-300 transition"
              >
                <KeyRound className="h-3.5 w-3.5 text-purple-400" />
                {apiKey ? 'Manage Gemini API Key' : 'Add Gemini API Key'}
              </button>
            </div>
          </div>

          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                <Sparkles className="h-5 w-5 text-emerald-400" /> Suggested Subjects
              </h2>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[10px] font-bold text-emerald-400 font-mono">
                2 x 4 Grid
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111827]/30 p-5 space-y-4 shadow-lg">
            <p className="text-xs text-slate-400 leading-relaxed">
              Select one of these fundamental school subjects to generate a preset test immediately. Clicking a subject opens the Setup step for that topic.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {SUGGESTED_SUBJECTS.map((sub) => (
                <button
                  key={sub.name}
                  onClick={() => handleSelectSuggested(sub.name)}
                  className={`group flex min-h-24 flex-col items-start justify-between rounded-xl border bg-gradient-to-br px-3 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] focus:outline-none active:scale-[0.99] ${sub.color} cursor-pointer`}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className="text-2xl leading-none">{sub.icon}</span>
                    <ArrowRight className="h-4 w-4 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-80" />
                  </div>
                  <span className="font-extrabold text-white text-sm leading-tight">{sub.name}</span>
                </button>
              ))}
            </div>

            {/* Custom subject tip */}
            <div className="rounded-xl bg-blue-950/15 border border-blue-900/30 p-3 flex items-start gap-2.5 text-[11px] leading-normal text-blue-400 text-left">
              <HelpCircle className="h-4 w-4 shrink-0 text-blue-400" />
              <span><strong>Tip:</strong> Want something custom? Tap the "Start New Quiz" button at the top and type in *any* niche topic like "Blockchain", "Photosynthesis Grade 10", or "Ancient Egyptian Dynasties"!</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
