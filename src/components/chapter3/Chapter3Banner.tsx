import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, FileText, CheckCircle2 } from 'lucide-react';
import type { Chapter3State } from '../../types/chapter3';

interface Chapter3BannerProps {
  chapter3State?: Chapter3State;
  onOpenDanielChat?: () => void;
  onOpenSophiaChat?: () => void;
  onOpenMail?: () => void;
  onOpenScorecard?: () => void;
}

export const Chapter3Banner: React.FC<Chapter3BannerProps> = ({
  chapter3State,
  onOpenDanielChat,
  onOpenSophiaChat,
  onOpenMail,
  onOpenScorecard,
}) => {
  const isCompleted = chapter3State?.completed || chapter3State?.step === 'assignment_completed';
  const hasSophiaMessage =
    chapter3State?.v1Delivered ||
    chapter3State?.step === 'sophia_typing_v1' ||
    chapter3State?.step === 'sophia_v1_delivered' ||
    chapter3State?.step === 'sophia_v2_delivered';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto w-[92%] max-w-4xl mt-2.5 z-30"
    >
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-sky-700/60 shadow-xl rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-sky-400">
                PROJECT AMIGO — UAT INFRASTRUCTURE COORDINATION
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Chapter 3 Active
              </span>
            </div>
            <div className="text-slate-300 font-medium text-[11px] mt-0.5 flex items-center gap-1.5">
              <span>Client Coordination · Technical Prerequisites · Network Gate Verification</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenDanielChat && (
            <button
              onClick={onOpenDanielChat}
              className="px-3 py-1.5 rounded-xl bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500/40 text-orange-200 hover:text-white font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3 h-3 text-orange-400" />
              <span>Daniel (Dev)</span>
            </button>
          )}

          {hasSophiaMessage && onOpenSophiaChat && (
            <button
              onClick={onOpenSophiaChat}
              className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3 h-3 text-purple-400" />
              <span>Sophia (Client)</span>
            </button>
          )}

          {isCompleted && onOpenScorecard && (
            <button
              onClick={onOpenScorecard}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Scorecard</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
