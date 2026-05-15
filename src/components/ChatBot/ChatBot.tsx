import React, { useState, useRef, useEffect } from 'react';
import { useQuizStore } from '../../store/quizStore';
import { 
  MessageSquareText, 
  X, 
  Send, 
  Sparkles, 
  Eraser, 
  BrainCircuit, 
  ArrowRight
} from 'lucide-react';

export default function ChatBot() {
  const { 
    user, 
    chatMessages, 
    isChatOpen, 
    isChatTyping, 
    chatContext, 
    toggleChat, 
    clearChat, 
    sendChatMessage 
  } = useQuizStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll on new message or when chat opens
  useEffect(() => {
    if (isChatOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen, isChatTyping]);

  // Focus input when chat panel opens
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isChatOpen]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatTyping) return;

    const textToSend = input.trim();
    setInput('');
    await sendChatMessage(textToSend);
  };

  const handleSuggestedClick = async (promptText: string) => {
    if (isChatTyping) return;
    await sendChatMessage(promptText);
  };

  // Suggested prompts based on current context
  const getSuggestedPrompts = () => {
    const list = [];
    if (chatContext.currentQuestion) {
      list.push("Give me a hint on this question 💡");
      list.push("Explain the core concept behind this 🧠");
    }
    if (chatContext.subject) {
      list.push(`Summarize ${chatContext.subject} in simple words`);
      list.push(`What are the key terms of this topic?`);
    } else {
      list.push("How do I start a new quiz?");
      list.push("Give me a random study tip 📚");
    }
    return list.slice(0, 3);
  };

  const suggestions = getSuggestedPrompts();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none font-sans">
      
      {/* Chat bubble typing animations */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .dot-1 { animation: wave 1.2s infinite 0.1s; }
        .dot-2 { animation: wave 1.2s infinite 0.2s; }
        .dot-3 { animation: wave 1.2s infinite 0.3s; }
      `}</style>

      {/* Chat Panel Sheet */}
      {isChatOpen && (
        <div className="w-[350px] sm:w-[380px] h-[460px] rounded-2xl border border-slate-800 bg-[#111827]/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-6 duration-350">
          
          {/* Panel Header */}
          <div className="px-4 py-3 border-b border-slate-800/80 bg-[#0D1326] flex items-center justify-between">
            <div className="flex items-center gap-2 text-left">
              <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white font-mono uppercase tracking-wider">QuizAI Study Coach</h4>
                {chatContext.subject ? (
                  <span className="block text-[9px] text-emerald-400 truncate font-medium max-w-[180px]">
                    Context: {chatContext.subject}
                  </span>
                ) : (
                  <span className="block text-[9px] text-slate-500 font-mono uppercase">
                    Available to guide you
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Clear chat button */}
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 transition"
                title="Clear Conversation history"
              >
                <Eraser className="h-3.5 w-3.5" />
              </button>
              
              {/* Close panel button */}
              <button
                onClick={() => toggleChat(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/60 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Log Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/15 text-left">
            {chatMessages.map((msg, idx) => {
              const isAI = msg.role === 'assistant';
              return (
                <div 
                  key={idx}
                  className={`flex items-start gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
                >
                  {isAI && (
                    <div className="h-7 w-7 rounded-lg bg-[#111827] border border-slate-800 flex items-center justify-center text-xs shrink-0">
                      🎓
                    </div>
                  )}
                  
                  <div className={`max-w-[78%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                    isAI 
                      ? 'bg-[#1E293B]/80 border border-slate-800 text-slate-100' 
                      : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg'
                  }`}>
                    <p className="whitespace-pre-line font-medium">{msg.content}</p>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isChatTyping && (
              <div className="flex items-start gap-2.5 justify-start">
                <div className="h-7 w-7 rounded-lg bg-[#111827] border border-slate-800 flex items-center justify-center text-xs shrink-0">
                  🎓
                </div>
                <div className="rounded-xl bg-[#1E293B]/80 border border-slate-800 px-4 py-3 flex gap-1.5 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 dot-1" />
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 dot-2" />
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 dot-3" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom suggestion area + input */}
          <div className="p-3 border-t border-slate-800/80 bg-[#0D1326]/80 space-y-2.5">
            
            {/* Suggestion Chips */}
            {suggestions.length > 0 && chatMessages.length <= 2 && (
              <div className="flex flex-col gap-1.5">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedClick(sug)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-950 py-1.5 px-2.5 text-[10px] font-bold text-slate-300 hover:text-white transition text-left flex items-center justify-between"
                  >
                    <span className="truncate">{sug}</span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-slate-600" />
                  </button>
                ))}
              </div>
            )}

            {/* Input form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder={isChatTyping ? 'Coach is thinking...' : 'Ask me a study question...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition font-medium"
                disabled={isChatTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isChatTyping}
                className="h-8 w-8 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600 flex items-center justify-center text-white shadow transition shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Floating Action Action Button */}
      <button
        onClick={() => toggleChat()}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-2xl hover:scale-105 active:scale-95 transition duration-200 focus:outline-none select-none"
      >
        {/* Pulsing outer ring */}
        {!isChatOpen && (
          <span className="absolute inset-0 rounded-full bg-blue-500/35 animate-ping pointer-events-none" />
        )}
        
        {isChatOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquareText className="h-6 w-6" />
        )}

        {/* Active Context sparkles badge */}
        {chatContext.subject && !isChatOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] border-2 border-[#0A0F1E] shadow font-bold animate-bounce">
            <Sparkles className="h-2.5 w-2.5" />
          </span>
        )}
      </button>

    </div>
  );
}
