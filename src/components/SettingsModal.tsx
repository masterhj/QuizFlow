import React, { useState } from 'react';
import { useQuizStore } from '../store/quizStore';
import { X, Sparkles, Key, AlertCircle, ShieldCheck, HelpCircle, Cpu } from 'lucide-react';

export default function SettingsModal() {
  const { 
    showSettingsModal, 
    toggleSettingsModal, 
    apiKey, 
    useGemini, 
    setSettings 
  } = useQuizStore();

  const [keyInput, setKeyInput] = useState(apiKey);
  const [geminiToggle, setGeminiToggle] = useState(useGemini);
  const [showKey, setShowKey] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!showSettingsModal) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(keyInput, geminiToggle);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      toggleSettingsModal(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={() => toggleSettingsModal(false)}
      />
      
      {/* Modal Body */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827]/95 backdrop-blur-xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
              <Cpu className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-bold text-white text-base">AI Engine Settings</h3>
          </div>
          <button 
            onClick={() => toggleSettingsModal(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Model Selector description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">Learning Engine</label>
            
            <div className="grid grid-cols-2 gap-3">
              
              {/* Option A Simulator */}
              <button
                type="button"
                onClick={() => setGeminiToggle(false)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition ${
                  !geminiToggle 
                    ? 'border-blue-500/80 bg-blue-500/5 text-white ring-2 ring-blue-500/20' 
                    : 'border-slate-800 bg-[#0A0F1E] text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1 mb-1">
                  <Sparkles className="h-3.5 w-3.5" /> OPTION A
                </span>
                <span className="text-[11px] leading-normal text-slate-400">Simulator engine with the polished dashboard, Google auth, and Web3 SBT vault.</span>
              </button>

              {/* Option B Gemini using the same dashboard UI */}
              <button
                type="button"
                onClick={() => setGeminiToggle(true)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition ${
                  geminiToggle 
                    ? 'border-purple-500/80 bg-purple-500/5 text-white ring-2 ring-purple-500/20' 
                    : 'border-slate-800 bg-[#0A0F1E] text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold text-purple-400 flex items-center gap-1 mb-1">
                  <Cpu className="h-3.5 w-3.5" /> OPTION B
                </span>
                <span className="text-[11px] leading-normal text-slate-400">Gemini API backend using the same Option A dashboard UI and SBT workflow.</span>
              </button>

            </div>
          </div>

          {/* API Key input (only shown/needed when Gemini toggle active, or always open for ease) */}
          {geminiToggle && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider" htmlFor="apikey">
                  Gemini API Key
                </label>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" /> Saved locally
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  id="apikey"
                  type={showKey ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#0A0F1E] pl-10 pr-16 py-2.5 text-sm text-white placeholder-slate-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition font-mono"
                  required={geminiToggle}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-slate-500 hover:text-slate-300 transition"
                >
                  {showKey ? 'HIDE' : 'SHOW'}
                </button>
              </div>

              {/* Warning box */}
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex gap-2 text-[11px] leading-relaxed text-amber-400">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <span><strong>CORS Note:</strong> Direct browser calls to Google Gemini require a valid API key. If blocked by browser headers, the engine automatically falls back to our gorgeous local simulator.</span>
                </div>
              </div>
            </div>
          )}

          {/* Information guide */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
              How do Option A and Option B share the dashboard?
            </div>
            <p className="text-slate-400 leading-normal">
              Option A uses the local simulator. Option B uses Google Gemini when a key is configured. Both now share the same polished dashboard interface, including Google-style auth, Web3 wallet status, quiz history, and SBT certificate ledger.
            </p>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 py-2.5 text-sm font-bold text-white hover:brightness-110 transition shadow-lg shadow-purple-500/10 active:scale-[0.98]"
          >
            {savedFeedback ? 'Configuration Saved!' : 'Apply Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
