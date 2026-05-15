import { useState } from 'react';
import { useQuizStore } from '../store/quizStore';
import { 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  BrainCircuit, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
  Wallet, 
  Lock, 
  Mail, 
  UserCheck,
  Loader2,
  X
} from 'lucide-react';

export default function AuthPage() {
  const { 
    login, 
    loginWithGoogle, 
    isGooglePopupOpen, 
    setGooglePopup, 
    connectMockWallet, 
    wallet 
  } = useQuizStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [googleAuthStep, setGoogleAuthStep] = useState<'choose' | 'loading' | 'success'>('choose');
  const [selectedGoogleUser, setSelectedGoogleUser] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isSignUp && !name) {
      setError('Please enter your name.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    login(email, isSignUp ? name : email.split('@')[0]);
  };

  // Trigger mock OAuth Account Selection
  const handleGoogleSelectAccount = (userEmail: string, userName: string) => {
    setSelectedGoogleUser(userName);
    setGoogleAuthStep('loading');
    setTimeout(() => {
      setGoogleAuthStep('success');
      setTimeout(() => {
        setGooglePopup(false);
        login(userEmail, userName);
        setGoogleAuthStep('choose'); // Reset steps
      }, 800);
    }, 1800);
  };

  // Decentralized Wallet Authentication
  const handleWalletAuthentication = () => {
    // Connect the mock wallet if not connected
    if (!wallet.connected) {
      connectMockWallet('ethereum');
    }
    // Log them in using their decentralized identifier (DID)
    const mockAddr = wallet.address || '0x9E52A...43DF';
    login(`${mockAddr.toLowerCase()}@web3.academy`, `Web3 Scholar (${mockAddr.substring(0, 8)})`);
  };

  return (
    <div className="flex min-h-screen bg-[#0A0F1E] text-[#F0F4FF] overflow-hidden select-none">
      
      {/* Left Side - Brand Hero Banner */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden border-r border-slate-800/50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0A0F1E] to-black">
        {/* Background ambient lights */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px]" />

        {/* Header Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0A0F1E]">
              <BrainCircuit className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">Quiz<span className="text-blue-400">AI</span></span>
            <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-widest">DECENTRALIZED ACADEMY</span>
          </div>
        </div>

        {/* Main Marketing Slogan */}
        <div className="relative my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs font-medium text-blue-400 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
            Option A: Web3 Study Ledger & Google Auth
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight xl:text-5xl">
            Decentralize <br />
            Your Study Journey. <br />
            Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-emerald-300">Soulbound Badges</span>.
          </h1>
          <p className="text-base text-slate-400 leading-relaxed">
            Type any subject. Get immediate flashcards, quizzes, and summaries. Earn cryptographically secured **Soulbound Tokens (SBTs)** on Polygon or Arbitrum for passing scores!
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-800/60">
            <div className="flex gap-3 text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Google OAuth</h4>
                <p className="text-[11px] text-slate-400">Realistic popup authentication sandbox</p>
              </div>
            </div>
            <div className="flex gap-3 text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Web3 Ledger</h4>
                <p className="text-[11px] text-slate-400">Simulated SBT certificates explorer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="relative text-xs text-slate-500 flex justify-between items-center font-mono uppercase">
          <span>© 2026 QuizAI Studio. All rights reserved.</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> MOCK ETHEREUM CHAIN
          </span>
        </div>
      </div>

      {/* Right Side - Interactive Authentication Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-[#0D1326]">
        
        {/* Small logo for mobile */}
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-emerald-400 p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#0A0F1E]">
              <BrainCircuit className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <span className="text-lg font-bold text-white">Quiz<span className="text-blue-400">AI</span></span>
        </div>

        <div className="w-full max-w-md space-y-6 bg-[#111827]/60 p-6 sm:p-8 rounded-2xl border border-slate-800/60 backdrop-blur-xl shadow-2xl">
          {/* Heading */}
          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h2>
            <p className="text-xs text-slate-400">
              {isSignUp ? 'Register your details to begin studying' : 'Sign in to access your blockchain study dashboard'}
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={loginWithGoogle}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-[#0A0F1E] px-4 py-3 text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-lg cursor-pointer"
          >
            <svg className="h-4 w-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.54 0-6.42-2.87-6.42-6.42s2.88-6.42 6.42-6.42c1.54 0 2.92.55 4.01 1.58l3.01-3.01C18.99 2.21 15.75 1 12.24 1 6.05 1 1 6.05 1 12.24s5.05 11.24 11.24 11.24c6.19 0 11.24-5.05 11.24-11.24 0-.73-.08-1.43-.21-2.11l-11.03.005z"/>
            </svg>
            Continue with Google (OAuth Popup)
          </button>

          {/* Decentralized Wallet Sign In Button */}
          <button
            onClick={handleWalletAuthentication}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-950/10 px-4 py-3 text-xs font-bold text-emerald-400 hover:bg-emerald-950/20 hover:text-emerald-300 transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-lg cursor-pointer"
          >
            <Wallet className="h-4 w-4 shrink-0 text-emerald-400 animate-pulse" />
            Sign In with Web3 Wallet (Ethereum DId)
          </button>

          {/* Separator */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-[#111827]/90 px-3 text-[10px] text-slate-500 font-mono uppercase">Or with Email</span>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-rose-500/15 border border-rose-500/30 p-2.5 text-xs text-rose-400">
                {error}
              </div>
            )}

            {isSignUp && (
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#0A0F1E] px-4 py-3 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1" htmlFor="email">
                <Mail className="h-3 w-3 text-slate-500" /> Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="student@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#0A0F1E] px-4 py-3 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1" htmlFor="password">
                <Lock className="h-3 w-3 text-slate-500" /> Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#0A0F1E] px-4 py-3 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/15 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition active:scale-[0.98] cursor-pointer"
            >
              {isSignUp ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Free Account
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In to Academy
                </>
              )}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Toggle Login / Signup */}
          <div className="text-center pt-1 border-t border-slate-800/50">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-medium text-slate-400 hover:text-blue-400 transition duration-200"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account yet? Sign Up"}
            </button>
          </div>
        </div>
      </div>

      {/* Real Looking Google OAuth Simulator dialog popup */}
      {isGooglePopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setGooglePopup(false)} />
          
          {/* Google Account Selection box */}
          <div className="relative w-full max-w-md rounded-2xl border border-slate-850 bg-white text-slate-900 p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            
            {/* Dialog Close */}
            <button 
              onClick={() => setGooglePopup(false)}
              className="absolute top-4 right-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Head banner */}
            <div className="text-center space-y-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 mx-auto border border-slate-200">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-800">Sign in with Google</h3>
              <p className="text-[11px] text-slate-500">to proceed securely to **QuizAI Study Ledger**</p>
            </div>

            {googleAuthStep === 'choose' && (
              <div className="space-y-2.5">
                <span className="block text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider text-left mb-1">Select an account</span>
                
                {[
                  { name: 'Skyler Vance', email: 'skyler.vance@gmail.com', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
                  { name: 'Taylor Reese', email: 'taylor.reese@gmail.com', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
                  { name: 'Morgan Weaver', email: 'morgan.weaver@gmail.com', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' }
                ].map((gUser) => (
                  <button
                    key={gUser.email}
                    onClick={() => handleGoogleSelectAccount(gUser.email, gUser.name)}
                    className="w-full flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50 transition cursor-pointer"
                  >
                    <img src={gUser.img} alt={gUser.name} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-slate-800 leading-tight">{gUser.name}</span>
                      <span className="block text-[10px] text-slate-500 truncate">{gUser.email}</span>
                    </div>
                  </button>
                ))}

                <div className="pt-2 text-center">
                  <button 
                    onClick={() => handleGoogleSelectAccount('guest.learner@gmail.com', 'Guest Scholar')}
                    className="text-[11px] font-semibold text-blue-600 hover:underline transition"
                  >
                    Use another mock Google account
                  </button>
                </div>
              </div>
            )}

            {googleAuthStep === 'loading' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <div className="text-center">
                  <span className="block text-xs font-bold text-slate-800">Authenticating Skyler...</span>
                  <span className="block text-[10px] text-slate-500">Exchanging OAuth token with database</span>
                </div>
              </div>
            )}

            {googleAuthStep === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-800">Authentication Authorized!</span>
                  <p className="text-[10px] text-slate-500 max-w-xs mx-auto mt-1">
                    Successfully signed in as **{selectedGoogleUser}**. Transitioning to study desk.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-normal text-left flex gap-1.5">
              <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
              <span>This is a simulated OAuth 2.0 login vault. No real credentials are transmitted, maintaining immediate 100% safety.</span>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
