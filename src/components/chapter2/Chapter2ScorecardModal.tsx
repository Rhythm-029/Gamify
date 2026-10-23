import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, ShieldCheck, ArrowRight, Lightbulb, MessageSquare,
  Clock, Shield, BarChart3, Zap, CheckCircle2
} from 'lucide-react';
import { updateChapterStatus } from '../../data/chaptersData';
import type { Chapter2State } from '../../types/chapter2';

interface Chapter2ScorecardModalProps {
  scorecardData: Chapter2State['scorecard'];
  onContinueToChapter3: () => void;
  onReturnToChapterSelect?: () => void;
}

export const Chapter2ScorecardModal: React.FC<Chapter2ScorecardModalProps> = ({
  scorecardData,
  onContinueToChapter3,
  onReturnToChapterSelect,
}) => {
  const handleProceed = () => {
    updateChapterStatus(2, 'completed');
    updateChapterStatus(3, 'unlocked');
    localStorage.setItem('brained_just_unlocked_chapter', '3');
    onContinueToChapter3();
  };

  return (
    <div className="fixed inset-0 z-[600] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans select-none">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        className="max-w-2xl w-full bg-[#0d1222] border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(37,99,235,0.2)] space-y-5 relative overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pr-2">
          <div className="max-w-md">
            <div className="text-[10px] font-mono tracking-[0.22em] text-blue-400 font-bold uppercase mb-1">
              CHAPTER 2 COMPLETE
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight">
              Environment Prerequisites, Network Gates & UI/UX Signoff
            </h2>
            <div className="text-xs font-semibold text-slate-300 mt-0.5">
              Project Amigo · Sprint 1 Governance & Development Greenlight
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Total Score</div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {scorecardData.totalScore}%
            </div>
            <div className="text-[9px] font-mono text-emerald-400 font-bold">SPRINT GREENLIT</div>
          </div>
        </div>

        {/* 4 Scorecard Metrics Cards with Dynamic Explanations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Schedule */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-sky-400 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Schedule / Timeline
              </span>
              <span className="font-mono text-xs font-black text-white">{scorecardData.scheduleScore}%</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {scorecardData.explanations.schedule}
            </p>
          </div>

          {/* Trust & Risk */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Trust & Risk Management
              </span>
              <span className="font-mono text-xs font-black text-white">{scorecardData.riskScore}%</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {scorecardData.explanations.risk}
            </p>
          </div>

          {/* Delivery Governance */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Delivery Governance
              </span>
              <span className="font-mono text-xs font-black text-white">{scorecardData.governanceScore}%</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {scorecardData.explanations.governance}
            </p>
          </div>

          {/* Team Efficiency */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                Team Efficiency & Velocity
              </span>
              <span className="font-mono text-xs font-black text-white">{scorecardData.efficiencyScore}%</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {scorecardData.explanations.efficiency}
            </p>
          </div>
        </div>

        {/* Aarav's Closing Teams Message */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-700 shrink-0">
            <img src="/character/AaravDP.png" alt="Aarav Kapoor" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-xs">Aarav Kapoor</span>
              <span className="text-[10px] text-slate-400 font-mono">Project Manager · Teams</span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              “Good work. We've established a secure development path, organized communication, and recorded the approved designs. The team can now begin the work covered by the greenlight. We still need to validate the full scope and delivery timeline before treating the 90-day target as a firm commitment.”
            </p>
          </div>
        </div>

        {/* Takeaway Card */}
        <div className="rounded-2xl p-4 bg-gradient-to-r from-blue-500/15 via-[#101729] to-[#0d1222] border border-blue-500/35 flex items-start space-x-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0 text-blue-400 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-mono tracking-[0.2em] text-blue-400 font-bold uppercase">
              YOUR TAKEAWAY
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug">
              A team can be ready to code before it is ready to access staging. Secure access, clear communication, and documented design approval create the conditions for controlled delivery.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          {onReturnToChapterSelect && (
            <button
              onClick={onReturnToChapterSelect}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              Back to Chapters
            </button>
          )}

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(59,130,246,0.6)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleProceed}
            className="ml-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-[0_0_20px_rgba(59,130,246,0.45)] cursor-pointer transition-all"
          >
            <span>Proceed to Chapter Select</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
