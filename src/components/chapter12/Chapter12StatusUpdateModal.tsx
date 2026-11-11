import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { CHAPTER12_PROJECT_STATUS } from '../../data/chapter12Data';
import { sound } from '../onboarding/SoundEngine';

interface Chapter12StatusUpdateModalProps {
  isOpen: boolean;
  onAcknowledge: () => void;
}

export const Chapter12StatusUpdateModal: React.FC<Chapter12StatusUpdateModalProps> = ({
  isOpen,
  onAcknowledge,
}) => {
  if (!isOpen) return null;

  const handleContinue = () => {
    sound.playClick();
    onAcknowledge();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        >
          {/* Top Header Badge */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-800 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                  System Status Telemetry
                </span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                Chapter 12 · Finale
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-2 flex items-center gap-2">
              <span>PROJECT AMIGO</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                {CHAPTER12_PROJECT_STATUS.currentVersion}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enterprise Human Resource Management System
            </p>
          </div>

          {/* Status Matrix List */}
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs font-medium text-slate-300">Phase 1 Delivery</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {CHAPTER12_PROJECT_STATUS.phase1Status}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs font-medium text-slate-300">Production Status</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {CHAPTER12_PROJECT_STATUS.productionStatus}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs font-medium text-slate-300">Operational Ownership</span>
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {CHAPTER12_PROJECT_STATUS.operationalOwnership}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
              <span className="text-xs font-medium text-indigo-300">Next Strategic Milestone</span>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {CHAPTER12_PROJECT_STATUS.nextMilestone}
              </span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Ready for executive steering review.
            </span>
            <button
              onClick={handleContinue}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <span>Acknowledge Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

