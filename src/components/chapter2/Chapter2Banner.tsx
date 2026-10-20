import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Network, Sparkles } from 'lucide-react';

interface Chapter2BannerProps {
  onOpenWorkspace?: () => void;
}

export const Chapter2Banner: React.FC<Chapter2BannerProps> = ({ onOpenWorkspace }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto w-[92%] max-w-4xl mt-2.5 z-30"
    >
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-700/60 shadow-xl rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Network className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
                PROJECT AMIGO — SPRINT 1
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Chapter 2 Active
              </span>
            </div>
            <div className="text-slate-300 font-medium text-[11px] mt-0.5">
              Development kickoff · Environment checks in progress
            </div>
          </div>
        </div>

        {onOpenWorkspace && (
          <button
            onClick={onOpenWorkspace}
            className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 hover:text-white font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Project Amigo Workspace</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
