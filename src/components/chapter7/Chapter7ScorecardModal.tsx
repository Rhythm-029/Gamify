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
} from 'lucide-react';
import { updateChapterStatus } from '../../data/chaptersData';
import type { Chapter7Scorecard } from '../../types/chapter7';
import { CHAPTER7_LEARNING_TAKEAWAY } from '../../data/chapter7Data';

interface Chapter7ScorecardModalProps {
  scorecardData: Chapter7Scorecard;
  onProceedToNextChapter: () => void;
  onReturnToChapterSelect?: () => void;
  onReplayChapter?: () => void;
}

export const Chapter7ScorecardModal: React.FC<Chapter7ScorecardModalProps> = ({
  scorecardData,
  onProceedToNextChapter,
  onReturnToChapterSelect,
  onReplayChapter,
}) => {
  const handleProceed = () => {
    updateChapterStatus(7, 'completed');
    updateChapterStatus(8, 'unlocked');
    localStorage.setItem('brained_just_unlocked_chapter', '8');
    onProceedToNextChapter();
  };

  const getStatusBadge = () => {
    if (scorecardData.outcomeType === 'strong') {
      return {
        text: 'INCIDENT RESOLVED · RCA & PREVENTIVE MONITORING ACTIVE',
        className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      };
    }
    if (scorecardData.outcomeType === 'mixed') {
      return {
        text: 'HOTFIX DEPLOYED WITH MINOR GOVERNANCE GAPS',
        className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      };
    }
    return {
      text: 'PREMATURE CLOSURE · MISSING USER VERIFICATION OR RCA',
      className: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    };
  };

  const statusBadge = getStatusBadge();
  const preventionPts =
    scorecardData.breakdown.preventionScore ??
    (scorecardData.breakdown as any).closureScore ??
    0;

  return (
    <div className="fixed inset-0 z-[600] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans select-none">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        className="max-w-2xl w-full bg-[#110b1a] border border-rose-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(244,63,94,0.25)] space-y-5 relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pr-2">
          <div className="max-w-md">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-mono tracking-[0.22em] text-rose-400 font-bold uppercase">
                CHAPTER 7 COMPLETE · INCIDENT MANAGEMENT
              </span>
              {scorecardData.aiEvaluated !== false && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" />
                  Grok AI Evaluated
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {scorecardData.outcomeTitle || 'ATTENDANCE SYNC PRODUCTION RECOVERY'}
            </h2>
            <div className="text-xs font-semibold text-slate-300 mt-0.5">
              Production Issues & Root Cause Analysis (INC-0241)
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Total Score</div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {scorecardData.totalScore}%
            </div>
            <div
              className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold mt-0.5 inline-block ${statusBadge.className}`}
            >
              {statusBadge.text}
            </div>
          </div>
        </div>

        {/* 4 Scorecard Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Schedule */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-sky-400 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Schedule / Timeline
              </span>
              <span className="text-sm font-mono font-bold text-white">
                {scorecardData.scheduleScore}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {scorecardData.explanations.schedule}
            </p>
          </div>

          {/* Trust & Risk */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Trust & Risk Management
              </span>
              <span className="text-sm font-mono font-bold text-white">
                {scorecardData.riskScore}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {scorecardData.explanations.risk}
            </p>
          </div>

          {/* Delivery Governance */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Delivery Governance
              </span>
              <span className="text-sm font-mono font-bold text-white">
                {scorecardData.governanceScore}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {scorecardData.explanations.governance}
            </p>
          </div>

          {/* Team Efficiency & Velocity */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Team Efficiency & Velocity
              </span>
              <span className="text-sm font-mono font-bold text-white">
                {scorecardData.efficiencyScore}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {scorecardData.explanations.efficiency}
            </p>
          </div>
        </div>

        {/* Detailed Activity Points Breakdown */}
        <div className="p-3.5 rounded-2xl bg-[#170e22] border border-rose-500/30 space-y-2">
          <div className="text-[10px] font-mono uppercase text-rose-400 font-bold">
            Activity Points Breakdown
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-[#1b1028] p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Immediate Response</span>
              <span className="text-sm font-bold text-rose-300">
                {scorecardData.breakdown.immediateResponseScore} / 30
              </span>
            </div>
            <div className="bg-[#1b1028] p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Root Cause Analysis</span>
              <span className="text-sm font-bold text-amber-300">
                {scorecardData.breakdown.rcaScore} / 40
              </span>
            </div>
            <div className="bg-[#1b1028] p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Prevention Plan</span>
              <span className="text-sm font-bold text-emerald-300">
                {preventionPts} / 30
              </span>
            </div>
          </div>
        </div>

        {/* Qualitative Feedback */}
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
            <span className="font-bold text-emerald-400 block mb-0.5">What You Did Well</span>
            {scorecardData.whatYouDidWell}
          </div>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200">
            <span className="font-bold text-amber-400 block mb-0.5">Key Learning for Future Incidents</span>
            {scorecardData.whatToImprove}
          </div>
        </div>

        {/* Core Learning Principle */}
        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start space-x-3">
          <Sparkles className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
          <div className="text-xs text-rose-200 leading-relaxed">
            <span className="font-bold text-white block">Core Learning Principle:</span>
            {CHAPTER7_LEARNING_TAKEAWAY}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {onReturnToChapterSelect && (
              <button
                onClick={onReturnToChapterSelect}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer text-center"
              >
                Chapter Select
              </button>
            )}

            {onReplayChapter && (
              <button
                onClick={onReplayChapter}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                title="Replay Chapter 7"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>
            )}
          </div>

          <button
            onClick={handleProceed}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-orange-600 to-amber-600 hover:opacity-95 text-white font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Proceed to Chapter 8</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
