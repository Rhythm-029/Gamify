import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  Lightbulb,
  Clock,
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { updateChapterStatus } from '../../data/chaptersData';
import type { Chapter3Scorecard } from '../../types/chapter3';
import { CHAPTER3_CLOSING_INSIGHT } from '../../data/chapter3Data';

interface Chapter3ScorecardModalProps {
  scorecardData: Chapter3Scorecard;
  onProceedToNextChapter: () => void;
  onReturnToChapterSelect?: () => void;
}

export const Chapter3ScorecardModal: React.FC<Chapter3ScorecardModalProps> = ({
  scorecardData,
  onProceedToNextChapter,
  onReturnToChapterSelect,
}) => {
  const handleProceed = () => {
    updateChapterStatus(3, 'completed');
    updateChapterStatus(4, 'unlocked');
    localStorage.setItem('brained_just_unlocked_chapter', '4');
    onProceedToNextChapter();
  };

  const getStatusBadge = () => {
    if (scorecardData.outcomeType === 'strong') {
      return {
        text: 'DATA DEFECT CONTAINED',
        className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      };
    }
    if (scorecardData.outcomeType === 'partial') {
      return {
        text: 'PARTIAL CONTAINMENT',
        className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      };
    }
    return {
      text: 'CONTAINMENT DEFICIT',
      className: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="fixed inset-0 z-[600] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans select-none">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        className="max-w-2xl w-full bg-[#0d1222] border border-sky-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(14,165,233,0.25)] space-y-5 relative overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pr-2">
          <div className="max-w-md">
            <div className="text-[10px] font-mono tracking-[0.22em] text-sky-400 font-bold uppercase mb-1">
              CHAPTER 3 COMPLETE
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight">
              The Data Integrity Crisis
            </h2>
            <div className="text-xs font-semibold text-slate-300 mt-0.5">
              Project Amigo · Prototype Validation & Containment Triage
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Total Score</div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {scorecardData.totalScore}%
            </div>
            <div className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold mt-0.5 inline-block ${statusBadge.className}`}>
              {statusBadge.text}
            </div>
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

        {/* Dynamic Chapter Outcome Card */}
        <div
          className={`p-3.5 rounded-2xl border flex items-start space-x-3 ${
            scorecardData.outcomeType === 'strong'
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : scorecardData.outcomeType === 'partial'
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
          }`}
        >
          {scorecardData.outcomeType === 'strong' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <div className="text-[10px] font-mono uppercase font-bold tracking-wider">
              {scorecardData.outcomeType === 'strong'
                ? 'Strong Outcome'
                : scorecardData.outcomeType === 'partial'
                ? 'Partial Containment'
                : 'Containment Gap'}
            </div>
            <p className="text-xs font-medium text-slate-100 leading-relaxed">
              {scorecardData.outcomeText}
            </p>
          </div>
        </div>

        {/* Aarav's Closing Teams Message */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start space-x-3 shadow-sm">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 shrink-0">
            <img src="/character/AaravDP.png" alt="Aarav Kapoor" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-xs">Aarav Kapoor</span>
              <span className="text-[10px] text-slate-400 font-mono">Project Manager · Teams</span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
              “Good delivery leadership is about surgical containment. You verified that the prototype interface works, but guarded against treating unverified data as ready. Daniel has clear investigative ownership, and the rest of the team continues building without interruption.”
            </p>
          </div>
        </div>

        {/* Takeaway Card */}
        <div className="rounded-2xl p-4 bg-gradient-to-r from-sky-500/15 via-[#101729] to-[#0d1222] border border-sky-500/35 flex items-start space-x-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center flex-shrink-0 text-sky-400 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-mono tracking-[0.2em] text-sky-400 font-bold uppercase">
              YOUR TAKEAWAY
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug">
              {CHAPTER3_CLOSING_INSIGHT}
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
            whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(14,165,233,0.6)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleProceed}
            className="ml-auto px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-[0_0_20px_rgba(14,165,233,0.45)] cursor-pointer transition-all"
          >
            <span>Complete Chapter 3 & Return to Hub</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
