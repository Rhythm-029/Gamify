import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, ShieldCheck, Gauge } from 'lucide-react';

interface Chapter6BannerProps {
  onOpenMeeting?: () => void;
  onOpenCommandCentre?: () => void;
  commandCentreUnlocked?: boolean;
}

export const Chapter6Banner: React.FC<Chapter6BannerProps> = ({
  onOpenMeeting,
  onOpenCommandCentre,
  commandCentreUnlocked = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto w-[92%] max-w-4xl mt-2.5 z-30"
    >
      <div className="bg-[#0b1329]/95 backdrop-blur-md border border-cyan-500/50 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-inner">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
                PROJECT AMIGO — 30,000-USER STRESS TEST
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Chapter 6 Active
              </span>
            </div>
            <div className="text-slate-300 font-medium text-[11px] mt-0.5 flex items-center gap-2">
              <span>Production Readiness Incident · Live Performance Command Centre</span>
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
              <span>Review Call</span>
            </button>
          )}

          {commandCentreUnlocked && onOpenCommandCentre && (
            <button
              onClick={onOpenCommandCentre}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/50 text-white font-extrabold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.35)]"
            >
              <Gauge className="w-3.5 h-3.5 text-cyan-200" />
              <span>Performance Command Centre</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
