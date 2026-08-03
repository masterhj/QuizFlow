import { useEffect, useRef, useState } from 'react';
import { useQuizStore, type TabType } from '../store/quizStore';
import { BrainCircuit, Settings, LogOut, LayoutGrid, Check, Flame } from 'lucide-react';
import { cn } from '../utils/cn';

/** Primary destinations. `matches` maps sub-routes onto their parent tab. */
const TABS: { label: string; tab: TabType; matches: TabType[] }[] = [
  { label: 'Overview', tab: 'dashboard', matches: ['dashboard'] },
  { label: 'Study', tab: 'setup', matches: ['setup', 'quiz', 'results'] },
  { label: 'Flashcards', tab: 'flashcards', matches: ['flashcards'] },
  { label: 'Credentials', tab: 'credentials', matches: ['credentials'] },
];

export default function Navbar() {
  const { user, logout, activeTab, navigateTo, toggleSettingsModal } = useQuizStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [menuOpen]);

  if (!user) return null;

  const initials = user.displayName
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[1200px] items-center justify-between gap-6 px-6">
        {/* Brand + primary tabs */}
        <div className="flex min-w-0 items-center gap-6">
          <button
            onClick={() => navigateTo('dashboard')}
            className="flex shrink-0 items-center gap-2 text-[13px] font-semibold tracking-[-0.01em] text-fg"
          >
            <BrainCircuit className="h-[18px] w-[18px] text-accent" />
            QuizAI
          </button>

          <nav className="hidden items-center gap-0.5 sm:flex">
            {TABS.map(({ label, tab, matches }) => {
              const active = matches.includes(activeTab);
              return (
                <button
                  key={label}
                  onClick={() => navigateTo(tab)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors',
                    active ? 'text-fg' : 'text-fg-muted hover:text-fg'
                  )}
                >
                  {label}
                  {/* Underline slides in on the active tab */}
                  <span
                    className={cn(
                      'absolute inset-x-1.5 -bottom-[11px] h-0.5 origin-left rounded-full bg-accent transition-transform duration-200',
                      active ? 'scale-x-100' : 'scale-x-0'
                    )}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Streak + account */}
        <div className="flex items-center gap-3">
          <span
            className="hidden items-center gap-1.5 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[12px] text-amber-300 md:inline-flex"
            title="Consecutive days studied"
          >
            <Flame className="h-3 w-3" />
            <span data-numeric className="font-medium">
              {user.studyStreak}
            </span>
            day streak
          </span>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-medium transition-all duration-150 hover:scale-105',
                menuOpen
                  ? 'border-accent bg-accent/15 text-accent-fg'
                  : 'border-line bg-raised text-fg-muted hover:border-accent-line hover:text-fg'
              )}
            >
              {initials || 'U'}
            </button>

            {menuOpen && (
              // Opaque on purpose: a translucent panel nested inside the
              // header's backdrop-blur cannot re-blur its own backdrop, so
              // the page text reads straight through it.
              <div
                role="menu"
                className="animate-rise-in absolute right-0 z-50 mt-1.5 w-60 overflow-hidden rounded-lg border border-line-strong bg-overlay shadow-xl shadow-black/40"
              >
                <div className="border-b border-line px-3 py-2.5">
                  <p className="truncate text-[13px] font-medium text-fg">
                    {user.displayName}
                  </p>
                  <p className="truncate text-[12px] text-fg-muted">{user.email}</p>
                </div>

                <div className="p-1">
                  <MenuItem
                    icon={<LayoutGrid className="h-3.5 w-3.5" />}
                    onClick={() => {
                      navigateTo('dashboard');
                      setMenuOpen(false);
                    }}
                  >
                    Overview
                  </MenuItem>
                  <MenuItem
                    icon={<Check className="h-3.5 w-3.5" />}
                    onClick={() => {
                      navigateTo('credentials');
                      setMenuOpen(false);
                    }}
                  >
                    Credentials
                  </MenuItem>
                  <MenuItem
                    icon={<Settings className="h-3.5 w-3.5" />}
                    onClick={() => {
                      toggleSettingsModal(true);
                      setMenuOpen(false);
                    }}
                  >
                    Settings
                  </MenuItem>
                </div>

                <div className="border-t border-line p-1">
                  <MenuItem
                    icon={<LogOut className="h-3.5 w-3.5" />}
                    tone="danger"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                  >
                    Sign out
                  </MenuItem>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs collapse below the brand on small screens */}
      <nav className="flex items-center gap-0.5 overflow-x-auto border-t border-line px-4 py-1.5 sm:hidden">
        {TABS.map(({ label, tab, matches }) => {
          const active = matches.includes(activeTab);
          return (
            <button
              key={label}
              onClick={() => navigateTo(tab)}
              className={cn(
                'shrink-0 rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors',
                active ? 'bg-raised text-fg' : 'text-fg-muted'
              )}
            >
              {label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

function MenuItem({
  icon,
  children,
  onClick,
  tone = 'default',
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left text-[13px] transition-colors',
        tone === 'danger'
          ? 'text-bad hover:bg-bad/10'
          : 'text-fg-muted hover:bg-raised hover:text-fg'
      )}
    >
      <span className="text-fg-subtle">{icon}</span>
      {children}
    </button>
  );
}
