import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Shield,
  Zap,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { updateChapterStatus } from '../../data/chaptersData';
import type { Chapter8Scorecard } from '../../types/chapter8';
import { CHAPTER8_LEARNING_TAKEAWAY } from '../../data/chapter8Data';

interface Chapter8ScorecardModalProps {
  scorecardData: Chapter8Scorecard;
  onProceedToNextChapter: () => void;
  onReturnToChapterSelect?: () => void;
  onReplayChapter?: () => void;
}

export const Chapter8ScorecardModal: React.FC<Chapter8ScorecardModalProps> = ({
  scorecardData,
  onProceedToNextChapter,
  onReturnToChapterSelect,
  onReplayChapter,
}) => {
  const handleProceed = () => {
    updateChapterStatus(8, 'completed');
    localStorage.setItem('brained_project_amigo_completed', 'true');
    onProceedToNextChapter();
  };

  const getStatusBadge = () => {
    if (scorecardData.outcomeType === 'strong') {
      return {
        text: 'HANDOVER COMPLETE · PHASE 1 FORMALLY ACCEPTED',
        className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      };
    }
    if (scorecardData.outcomeType === 'mixed') {
      return {
        text: 'DELIVERY ACCEPTED WITH MINOR GOVERNANCE REVISIONS',
        className: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      };
    }
    return {
      text: 'HANDOVER OVERVIEW · GOVERNANCE GAPS OR MISSING EVIDENCE',
      className: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="fixed inset-0 z-[600] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans select-none">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        className="max-w-2xl w-full bg-[#0a1122] border border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.25)] space-y-5 relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pr-2">
          <div className="max-w-md">
            <div className="text-[10px] font-mono tracking-[0.22em] text-cyan-400 font-bold uppercase mb-1">
              CHAPTER 8 COMPLETE · FINAL STAGE CLOSURE
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              PRODUCTION STABILISATION & HANDOVER
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Project Amigo · ICICI Bank Enterprise HRMS Phase 1 Delivery
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-mono">
              {scorecardData.totalScore}
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
              FINAL RATING
            </div>
          </div>
        </div>

        {/* Status Badge Banner */}
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider ${statusBadge.className}`}
          >
            {statusBadge.text}
          </span>
        </div>

        {/* 4 Core Brained OS Corporate Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Schedule */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="text-[10px] font-mono uppercase">Timeline</span>
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-white font-mono">
                {scorecardData.scheduleScore}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">/100</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-1 line-clamp-2">
              {scorecardData.explanations.schedule}
            </div>
          </div>

          {/* Risk Management */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="text-[10px] font-mono uppercase">Trust & Risk</span>
              <Shield className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-white font-mono">
                {scorecardData.riskScore}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">/100</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-1 line-clamp-2">
              {scorecardData.explanations.risk}
            </div>
          </div>

          {/* Delivery Governance */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="text-[10px] font-mono uppercase">Governance</span>
              <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-white font-mono">
                {scorecardData.governanceScore}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">/100</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-1 line-clamp-2">
              {scorecardData.explanations.governance}
            </div>
          </div>

          {/* Team Efficiency */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="text-[10px] font-mono uppercase">Efficiency</span>
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-white font-mono">
                {scorecardData.efficiencyScore}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">/100</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-1 line-clamp-2">
              {scorecardData.explanations.efficiency}
            </div>
          </div>
        </div>

        {/* 4 Activity Subscore Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-2">
            Activity Points Breakdown
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">1. Evidence Match</div>
              <div className="text-cyan-300 font-bold mt-0.5">
                {scorecardData.breakdown.evidenceScore} / 25 pts
              </div>
            </div>
            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">2. Scope Classify</div>
              <div className="text-cyan-300 font-bold mt-0.5">
                {scorecardData.breakdown.statusScore} / 25 pts
              </div>
            </div>
            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">3. Handover Runbooks</div>
              <div className="text-cyan-300 font-bold mt-0.5">
                {scorecardData.breakdown.handoverScore} / 25 pts
              </div>
            </div>
            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">4. Package Review</div>
              <div className="text-cyan-300 font-bold mt-0.5">
                {scorecardData.breakdown.packageScore} / 25 pts
              </div>
            </div>
          </div>
        </div>

        {/* Qualitative Feedback */}
        <div className="space-y-2 text-xs">
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-3">
            <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              What You Did Well
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {scorecardData.whatYouDidWell}
            </p>
          </div>

          <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-3">
            <div className="text-cyan-400 font-bold text-[11px] flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Key Project Governance Takeaway
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed italic">
              "{CHAPTER8_LEARNING_TAKEAWAY}"
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {onReplayChapter && (
              <button
                onClick={onReplayChapter}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Handover Desk</span>
              </button>
            )}
            {onReturnToChapterSelect && (
              <button
                onClick={onReturnToChapterSelect}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
              >
                Chapter Select
              </button>
            )}
          </div>

          <button
            onClick={handleProceed}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            <span>Finish Project Amigo · View Transformation Room Results</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
