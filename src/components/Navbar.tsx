import { useQuizStore } from '../store/quizStore';
import { BrainCircuit, Flame, Sparkles, Settings, LogOut, ChevronRight, BookOpen } from 'lucide-react';
import { useState } from 'react';

type TabType = 'auth' | 'dashboard' | 'setup' | 'quiz' | 'results' | 'flashcards';

export default function Navbar() {
  const { 
    user, 
    logout, 
    activeTab, 
    navigateTo, 
    currentSession, 
    useGemini, 
    toggleSettingsModal 
  } = useQuizStore();

  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  // Breadcrumbs mapping
  const getBreadcrumbs = () => {
    const items: { label: string; tab: TabType }[] = [{ label: 'Dashboard', tab: 'dashboard' }];

    if (activeTab === 'setup') {
      items.push({ label: 'New Quiz Setup', tab: 'setup' });
    } else if (activeTab === 'quiz' && currentSession) {
      items.push({ label: `Quiz: ${currentSession.subject}`, tab: 'quiz' });
    } else if (activeTab === 'results' && currentSession) {
      items.push({ label: `${currentSession.subject} Results`, tab: 'results' });
    } else if (activeTab === 'flashcards' && currentSession) {
      items.push({ label: `${currentSession.subject} Flashcards`, tab: 'flashcards' });
    }

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/60 bg-[#0A0F1E]/80 backdrop-blur-md px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left side: Brand Logo & Dynamic Breadcrumbs */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigateTo('dashboard')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-emerald-400 p-0.5 transition duration-300 group-hover:rotate-6">
              <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#0A0F1E]">
                <BrainCircuit className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <span className="text-lg font-bold text-white group-hover:text-blue-400 transition">
              Quiz<span className="text-blue-400">AI</span>
            </span>
          </button>

          {/* Desktop Breadcrumbs */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 pl-4 border-l border-slate-800/80">
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="h-3 w-3" />}
                <button
                  onClick={() => navigateTo(crumb.tab)}
                  className={`hover:text-white transition font-medium font-mono uppercase tracking-wider ${
                    idx === breadcrumbs.length - 1 ? 'text-slate-200' : 'text-slate-500'
                  }`}
                  disabled={idx === breadcrumbs.length - 1}
                >
                  {crumb.label}
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Right side: Streaks, Engine indicators & Profile */}
        <div className="flex items-center gap-4">
          
          {/* Gamified Daily Study Streak */}
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 shadow-sm select-none" title="Consecutive Study Streak">
            <Flame className="h-4 w-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-amber-400 font-mono">{user.studyStreak}D Streak</span>
          </div>

          {/* Engine Badge Indicator */}
          <div 
            onClick={() => toggleSettingsModal(true)}
            className={`hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold cursor-pointer select-none transition ${
              useGemini 
                ? 'border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/15' 
                : 'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/15'
            }`}
            title="Click to change AI settings"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{useGemini ? 'Option B: Gemini UI' : 'Option A: Simulator UI'}</span>
          </div>

          {/* Profile Dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 focus:outline-none rounded-full hover:ring-2 hover:ring-blue-500/50 p-0.5 transition"
            >
              <img
                src={user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt={user.displayName}
                className="h-8 w-8 rounded-full object-cover border border-slate-700 bg-[#111827]"
              />
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowDropdown(false)} 
                />
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-[#111827]/95 backdrop-blur-lg p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2.5 border-b border-slate-800/80 text-left">
                    <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
                    <p className="text-xs text-slate-400 truncate font-mono mt-0.5">{user.email}</p>
                  </div>
                  
                  <div className="py-1 space-y-0.5">
                    <button
                      onClick={() => {
                        navigateTo('dashboard');
                        setShowDropdown(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition"
                    >
                      <BookOpen className="h-4 w-4 text-blue-400" />
                      My Study Dashboard
                    </button>

                    <button
                      onClick={() => {
                        toggleSettingsModal(true);
                        setShowDropdown(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition"
                    >
                      <Settings className="h-4 w-4 text-purple-400" />
                      AI Model Settings
                    </button>
                  </div>

                  <div className="pt-1.5 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
