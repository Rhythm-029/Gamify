import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Paperclip, X, Check, FileText } from 'lucide-react';
import { sound } from '../onboarding/SoundEngine';

interface EmailComposerModalProps {
  to: string;
  cc?: string;
  subject: string;
  body: string;
  attachments?: string[];
  buttonText?: string;
  onSend: (finalBody: string) => void;
  onClose?: () => void;
}

export const EmailComposerModal: React.FC<EmailComposerModalProps> = ({
  to,
  cc,
  subject,
  body: initialBody,
  attachments = [],
  buttonText = 'Send Email',
  onSend,
  onClose,
}) => {
  const [bodyText, setBodyText] = useState(initialBody);
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    setIsSending(true);
    sound.playClick();
    setTimeout(() => {
      sound.playSystemClearance();
      setIsSending(false);
      onSend(bodyText);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-[550] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Email Header Bar */}
        <div className="h-11 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-300 font-bold">
            <Mail className="w-4 h-4 text-sky-400" />
            <span>Corporate Mail Client · Compose Message</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Fields */}
        <div className="p-4 space-y-2.5 border-b border-slate-800/80 text-xs">
          <div className="flex items-center">
            <span className="w-16 font-mono text-slate-400 uppercase text-[10px]">To:</span>
            <span className="flex-1 font-semibold text-slate-200">{to}</span>
          </div>
          {cc && (
            <div className="flex items-center">
              <span className="w-16 font-mono text-slate-400 uppercase text-[10px]">CC:</span>
              <span className="flex-1 text-slate-300 font-mono text-[11px]">{cc}</span>
            </div>
          )}
          <div className="flex items-center">
            <span className="w-16 font-mono text-slate-400 uppercase text-[10px]">Subject:</span>
            <span className="flex-1 font-bold text-white text-xs">{subject}</span>
          </div>

          {attachments.length > 0 && (
            <div className="flex items-start pt-1">
              <span className="w-16 font-mono text-slate-400 uppercase text-[10px] flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                Files:
              </span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {attachments.map((att, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px]"
                  >
                    <FileText className="w-3 h-3 text-amber-400" />
                    <span>{att}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Body Textarea */}
        <div className="p-4 flex-1 overflow-y-auto">
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={12}
            className="w-full h-full min-h-[220px] bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-blue-500/50 resize-none"
          />
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pre-formatted enterprise artifact ready for dispatch</span>
          </div>

          <div className="flex items-center space-x-2">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSend}
              disabled={isSending}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{buttonText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
