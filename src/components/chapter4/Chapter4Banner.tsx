import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, SlidersHorizontal, ArrowRight, Clock } from 'lucide-react';

interface Chapter4BannerProps {
  onOpenMeeting?: () => void;
  onOpenStudio?: () => void;
  studioUnlocked?: boolean;
}

export const Chapter4Banner: React.FC<Chapter4BannerProps> = ({
  onOpenMeeting,
  onOpenStudio,
  studioUnlocked = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto w-[92%] max-w-4xl mt-2.5 z-30"
    >
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-purple-700/60 shadow-xl rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-purple-400">
                PROJECT AMIGO — CHANGE REQUEST & IMPACT ANALYSIS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Chapter 4 Active
              </span>
            </div>
            <div className="text-slate-300 font-medium text-[11px] mt-0.5 flex items-center gap-1.5">
              <span>CR-017 Dynamic Bonus Calculator · Scope Gating & Release Assessment</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenMeeting && (
            <button
              onClick={onOpenMeeting}
              className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Clock className="w-3 h-3 text-purple-400" />
              <span>Teams Meeting</span>
            </button>
          )}

          {studioUnlocked && onOpenStudio && (
            <button
              onClick={onOpenStudio}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 hover:text-white font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Ideate & Impact Studio</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
