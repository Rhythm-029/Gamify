import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { updateChapterStatus } from '../../data/chaptersData';
import type { Chapter6Scorecard } from '../../types/chapter6';

interface Chapter6ScorecardModalProps {
  scorecardData: Chapter6Scorecard;
  onProceedToNextChapter: () => void;
  onReturnToChapterSelect?: () => void;
  onReplayChapter?: () => void;
}

export const Chapter6ScorecardModal: React.FC<Chapter6ScorecardModalProps> = ({
  scorecardData,
  onProceedToNextChapter,
  onReturnToChapterSelect,
  onReplayChapter,
}) => {
  const handleProceed = () => {
    updateChapterStatus(6, 'completed');
    updateChapterStatus(7, 'unlocked');
    localStorage.setItem('brained_just_unlocked_chapter', '7');
    onProceedToNextChapter();
  };

  const getStatusBadge = () => {
    if (scorecardData.outcomeType === 'strong') {
      return {
        text: 'PERFORMANCE BENCHMARKS VALIDATED — READY FOR RELEASE REVIEW',
        className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      };
    }
    if (scorecardData.outcomeType === 'mixed') {
      return {
        text: 'BENCHMARKS STABILIZED WITH REMEDIATION OVERHEAD',
        className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      };
    }
    return {
      text: 'CRITICAL BENCHMARKS OR APPROVALS MISSING',
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
        className="max-w-2xl w-full bg-[#0b1224] border border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.25)] space-y-5 relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pr-2">
          <div className="max-w-md">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-mono tracking-[0.22em] text-cyan-400 font-bold uppercase">
                CHAPTER 6 COMPLETE · PRODUCTION READINESS
              </span>
              {scorecardData.aiEvaluated !== false && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" />
                  Grok AI Evaluated
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {scorecardData.outcomeTitle || 'THE 30,000-USER STRESS TEST'}
            </h2>
            <div className="text-xs font-semibold text-slate-300 mt-0.5">
              Project Amigo · Performance Command Centre & Release Governance
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

        {/* Detailed Activity Breakdown (Matching spec: 20/30/20/30) */}
        <div className="p-3.5 rounded-2xl bg-[#0e162d] border border-cyan-500/30 space-y-2">
          <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
            Activity Points Breakdown
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-[#121932] p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Bottleneck Diagnosis</span>
              <span className="text-sm font-bold text-cyan-300">
                {scorecardData.breakdown.diagnosisScore} / 20
              </span>
            </div>
            <div className="bg-[#121932] p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Recovery Sequence</span>
              <span className="text-sm font-bold text-cyan-300">
                {scorecardData.breakdown.recoveryScore} / 30
              </span>
            </div>
            <div className="bg-[#121932] p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Retest Interpretation</span>
              <span className="text-sm font-bold text-cyan-300">
                {scorecardData.breakdown.retestScore} / 20
              </span>
            </div>
            <div className="bg-[#121932] p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Dual Approval Gate</span>
              <span className="text-sm font-bold text-cyan-300">
                {scorecardData.breakdown.approvalScore} / 30
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
            <span className="font-bold text-amber-400 block mb-0.5">What to Keep in Mind</span>
            {scorecardData.whatToImprove}
          </div>
        </div>

        {/* Key Learning Insight */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-start space-x-3">
          <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <div className="text-xs text-cyan-200 leading-relaxed">
            <span className="font-bold text-white block">Core Learning Principle:</span>
            {scorecardData.keyTakeaway}
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
                title="Replay Chapter 6"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>
            )}
          </div>

          <button
            onClick={handleProceed}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Proceed to Chapter 7</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
