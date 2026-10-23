import React from 'react';
import { motion } from 'framer-motion';
import { Clock, FileCheck2 } from 'lucide-react';

interface Chapter5BannerProps {
  onOpenMeeting?: () => void;
  onOpenBoard?: () => void;
  boardUnlocked?: boolean;
}

export const Chapter5Banner: React.FC<Chapter5BannerProps> = ({
  onOpenMeeting,
  onOpenBoard,
  boardUnlocked = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto w-[92%] max-w-4xl mt-2.5 z-30"
    >
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-emerald-700/60 shadow-xl rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileCheck2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                PROJECT AMIGO — SPRINT 1 RELEASE READINESS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Chapter 5 Active
              </span>
            </div>
            <div className="text-slate-300 font-medium text-[11px] mt-0.5 flex items-center gap-1.5">
              <span>Controlled User Group Rollout · 80,000 Bank Employees Scope</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenMeeting && (
            <button
              onClick={onOpenMeeting}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Teams Meeting</span>
            </button>
          )}

          {boardUnlocked && onOpenBoard && (
            <button
              onClick={onOpenBoard}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 hover:text-white font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <FileCheck2 className="w-3 h-3 text-emerald-400" />
              <span>Release Board</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
