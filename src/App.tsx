import { useQuizStore } from './store/quizStore';
import Navbar from './components/Navbar';
import SettingsModal from './components/SettingsModal';
import ChatBot from './components/ChatBot/ChatBot';

// Pages imports
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import QuizSetupPage from './pages/QuizSetupPage';
import QuizFlowPage from './pages/QuizFlowPage';
import ResultsPage from './pages/ResultsPage';
import FlashcardsPage from './pages/FlashcardsPage';

export default function App() {
  const { activeTab, user } = useQuizStore();

  // Protected Route redirection simulator
  const renderActivePage = () => {
    if (!user) {
      return <AuthPage />;
    }

    switch (activeTab) {
      case 'auth':
        return <AuthPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'setup':
        return <QuizSetupPage />;
      case 'quiz':
        return <QuizFlowPage />;
      case 'results':
        return <ResultsPage />;
      case 'flashcards':
        return <FlashcardsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-[#F0F4FF] selection:bg-blue-500/30 selection:text-blue-200 relative flex flex-col font-sans antialiased">
      
      {/* Navigation Header (shown only if logged in) */}
      {user && <Navbar />}

      {/* Main Stage content container */}
      <main className="flex-1">
        {renderActivePage()}
      </main>

      {/* Global Floating Overlay Panels */}
      {user && (
        <>
          {/* Context Aware Study Companion chatbot widget */}
          <ChatBot />
          
          {/* settings modal drawer */}
          <SettingsModal />
        </>
      )}

      {/* Global subtle decorative background grids */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Custom subtle bottom footer credit */}
      {user && (
        <footer className="w-full border-t border-slate-800/40 py-4 text-center text-[10px] text-slate-600 font-mono select-none uppercase tracking-widest bg-[#0A0F1E] shrink-0">
          Created by Himanshu Jaiswal · QuizAI Learning Systems · Driven by Google Gemini 1.5
        </footer>
      )}
      
    </div>
  );
}
