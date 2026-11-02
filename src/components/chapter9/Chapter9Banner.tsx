import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Award, Sparkles, Presentation } from 'lucide-react';
import type { Chapter9State } from '../../types/chapter9';
import {
  CHAPTER9_PROJECT_NAME,
  CHAPTER9_STAGE_LABEL,
  CHAPTER9_TIMELINE,
} from '../../data/chapter9Data';

interface Chapter9BannerProps {
  chapter9State?: Chapter9State;
  onOpenBoardroom?: () => void;
  onOpenScorecard?: () => void;
}

export const Chapter9Banner: React.FC<Chapter9BannerProps> = ({
  chapter9State,
  onOpenBoardroom,
  onOpenScorecard,
}) => {
  const isCompleted = chapter9State?.completed;
  const decisionChosen = chapter9State?.decisionChosen;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto w-[92%] max-w-4xl mt-2.5 z-30"
    >
      <div className="bg-[#0b141e]/95 backdrop-blur-md border border-emerald-500/40 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-inner">
            <TrendingUp className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                {CHAPTER9_PROJECT_NAME} — {CHAPTER9_STAGE_LABEL.toUpperCase()}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-mono">
                {CHAPTER9_TIMELINE}
              </span>
            </div>
            <div className="text-slate-300 font-medium text-[11px] mt-0.5 flex items-center gap-2">
              <span>Executive Leadership Phase · 42% Cycle Drop · 15k Man-Hours Saved</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenBoardroom && (
            <button
              onClick={onOpenBoardroom}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 hover:text-white font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Presentation className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isCompleted ? 'Review Boardroom Presentation' : 'Open Executive Boardroom'}</span>
            </button>
          )}

          {isCompleted && onOpenScorecard && (
            <button
              onClick={onOpenScorecard}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-emerald-200" />
              <span>Boardroom Scorecard</span>
              <Sparkles className="w-3 h-3 text-emerald-300" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
