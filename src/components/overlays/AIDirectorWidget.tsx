import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send } from 'lucide-react';

interface AIDirectorWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: (appId: string) => void;
}

export const AIDirectorWidget: React.FC<AIDirectorWidgetProps> = ({
  isOpen,
  onClose,
  onSelectApp,
}) => {
  const [messages, setMessages] = useState([
    {
      sender: 'AI Director',
      text: "I noticed you haven't shared the official MOM with CISO David Knox yet.",
      actionLabel: "Open Notion MOM Editor",
      appId: "notes"
    },
    {
      sender: 'AI Director',
      text: "This may affect stakeholder trust before tomorrow's steering gate. Need help drafting the project charter?",
      actionLabel: "View Project Charter",
      appId: "documents"
    }
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages((prev) => [
      ...prev,
      { sender: 'You', text: inputText, actionLabel: '', appId: '' },
      {
        sender: 'AI Director',
        text: "Understood. I have optimized your transformation timeline. Stakeholder alignment remains at 84%.",
        actionLabel: "Check Stakeholders",
        appId: "stakeholders"
      }
    ]);
    setInputText('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 w-96 glass-panel rounded-3xl border border-purple-500/40 shadow-2xl p-5 z-50 flex flex-col bg-slate-950/90 backdrop-blur-xl"
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">AI Director Assistant</h3>
              <p className="text-[10px] text-purple-300">Executive Advisor Active</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="h-64 overflow-y-auto space-y-3 pr-1 mb-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl ${
                m.sender === 'You'
                  ? 'bg-blue-600 text-white ml-8 text-right'
                  : 'bg-slate-900 border border-white/10 text-slate-200 mr-4'
              }`}
            >
              <div className="font-bold text-[10px] text-purple-400 mb-1">{m.sender}</div>
              <p className="leading-relaxed">{m.text}</p>

              {m.actionLabel && (
                <button
                  onClick={() => {
                    onSelectApp(m.appId);
                    onClose();
                  }}
                  className="mt-2 text-[10px] bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-500/30 font-semibold block text-left cursor-pointer"
                >
                  → {m.actionLabel}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="flex items-center bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI Director for advice..."
            className="flex-1 bg-transparent text-white focus:outline-none"
          />
          <button type="submit" className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-500 cursor-pointer">
            <Send className="w-3 h-3" />
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};
