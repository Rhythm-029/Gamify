import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Clock, FileCheck2, Sparkles } from 'lucide-react';
import type { Chapter8State } from '../../types/chapter8';
import { CHAPTER8_PROJECT_NAME, CHAPTER8_STAGE_LABEL } from '../../data/chapter8Data';

interface Chapter8BannerProps {
  chapter8State?: Chapter8State;
  onOpenMeeting?: () => void;
  onOpenDesk?: () => void;
  onOpenHandoverDesk?: () => void;
  deskUnlocked?: boolean;
  onOpenScorecard?: () => void;
}

export const Chapter8Banner: React.FC<Chapter8BannerProps> = ({
  chapter8State,
  onOpenMeeting,
  onOpenDesk,
  onOpenHandoverDesk,
  deskUnlocked = false,
  onOpenScorecard,
}) => {
  const handleOpenConsole = onOpenHandoverDesk || onOpenDesk;
  const isUnlocked = deskUnlocked || chapter8State?.deskUnlocked;
  const isCompleted = chapter8State?.completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto w-[92%] max-w-4xl mt-2.5 z-30"
    >
      <div className="bg-[#0c1220]/95 backdrop-blur-md border border-rose-500/40 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 shadow-inner">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
                {CHAPTER8_PROJECT_NAME} — {CHAPTER8_STAGE_LABEL.toUpperCase()}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-200 border border-rose-500/40 font-mono">
                Security Incident
              </span>
            </div>
            <div className="text-slate-300 font-medium text-[11px] mt-0.5 flex items-center gap-2">
              <span>WAF Bot Mitigation · Strict MFA Rate-Limiting · Compliance Acts</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenMeeting && (
            <button
              onClick={onOpenMeeting}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Clock className="w-3 h-3 text-rose-400" />
              <span>SOC Liaison Channel</span>
            </button>
          )}

          {isUnlocked && handleOpenConsole && (
            <button
              onClick={handleOpenConsole}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 border border-emerald-400/50 text-white font-extrabold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.35)]"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-100" />
              <span>Security Response Console</span>
            </button>
          )}

          {isCompleted && onOpenScorecard && (
            <button
              onClick={onOpenScorecard}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scorecard</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
