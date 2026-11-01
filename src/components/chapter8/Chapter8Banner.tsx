import React from 'react';
import { motion } from 'framer-motion';
import { Award, Clock, FileCheck2, Sparkles } from 'lucide-react';
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
  const handleOpenDesk = onOpenHandoverDesk || onOpenDesk;
  const isUnlocked = deskUnlocked || chapter8State?.deskUnlocked;
  const isCompleted = chapter8State?.aaravClosureConfirmed || chapter8State?.finalProjectDashboardShown;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto w-[92%] max-w-4xl mt-2.5 z-30"
    >
      <div className="bg-[#12162a]/95 backdrop-blur-md border border-cyan-500/50 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
            <Award className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">
                {CHAPTER8_PROJECT_NAME} — {CHAPTER8_STAGE_LABEL.toUpperCase()}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-mono">
                Final Chapter
              </span>
            </div>
            <div className="text-slate-300 font-medium text-[11px] mt-0.5 flex items-center gap-2">
              <span>Evidence Verification · Operational Handover · Dual Acceptance</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenMeeting && (
            <button
              onClick={onOpenMeeting}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Project Review Call</span>
            </button>
          )}

          {isUnlocked && handleOpenDesk && (
            <button
              onClick={handleOpenDesk}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 border border-cyan-400/50 text-white font-extrabold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.35)]"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-cyan-100" />
              <span>Release & Handover Desk</span>
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
