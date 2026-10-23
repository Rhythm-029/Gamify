import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';
import { updateChapterStatus } from '../../data/chaptersData';
import type { Chapter5Scorecard } from '../../types/chapter5';

interface Chapter5ScorecardModalProps {
  scorecardData: Chapter5Scorecard;
  onProceedToNextChapter: () => void;
  onReturnToChapterSelect?: () => void;
}

export const Chapter5ScorecardModal: React.FC<Chapter5ScorecardModalProps> = ({
  scorecardData,
  onProceedToNextChapter,
  onReturnToChapterSelect,
}) => {
  const handleProceed = () => {
    updateChapterStatus(5, 'completed');
    updateChapterStatus(6, 'unlocked');
    localStorage.setItem('brained_just_unlocked_chapter', '6');
    onProceedToNextChapter();
  };

  const getStatusBadge = () => {
    if (scorecardData.outcomeType === 'strong') {
      return {
        text: 'CONTROLLED PILOT AUTHORIZED FOR REVIEW',
        className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      };
    }
    if (scorecardData.outcomeType === 'mixed') {
      return {
        text: 'PILOT PLAN SUBMITTED WITH CAVEATS',
        className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      };
    }
    return {
      text: 'CRITICAL CONTROLS MISSING — REVISION REQUIRED',
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
        className="max-w-2xl w-full bg-[#0d1222] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.25)] space-y-5 relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pr-2">
          <div className="max-w-md">
            <div className="text-[10px] font-mono tracking-[0.22em] text-emerald-400 font-bold uppercase mb-1">
              CHAPTER 5 COMPLETE
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight">
              THE CONTROLLED LAUNCH
            </h2>
            <div className="text-xs font-semibold text-slate-300 mt-0.5">
              Project Amigo · Sprint 1 Release Decision & Pilot Governance
            </div>
          </div>

          <div className="text-right">
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
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Schedule / Timeline
              </span>
              <span className="font-mono font-bold text-sm text-white">
                {scorecardData.scheduleScore}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {scorecardData.explanations.schedule}
            </p>
          </div>

          {/* Risk */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-rose-400 font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                Trust & Risk Management
              </span>
              <span className="font-mono font-bold text-sm text-white">
                {scorecardData.riskScore}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {scorecardData.explanations.risk}
            </p>
          </div>

          {/* Governance */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                Delivery Governance
              </span>
              <span className="font-mono font-bold text-sm text-white">
                {scorecardData.governanceScore}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {scorecardData.explanations.governance}
            </p>
          </div>

          {/* Efficiency */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Team Efficiency & Velocity
              </span>
              <span className="font-mono font-bold text-sm text-white">
                {scorecardData.efficiencyScore}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {scorecardData.explanations.efficiency}
            </p>
          </div>
        </div>

        {/* ── WHAT YOU DID WELL & WHAT TO IMPROVE ── */}
        <div className="space-y-2">
          {/* What you did well */}
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                What You Did Well
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {scorecardData.whatYouDidWell}
              </p>
            </div>
          </div>

          {/* What to improve */}
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                What to Improve
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {scorecardData.whatToImprove}
              </p>
            </div>
          </div>
        </div>

        {/* ── PROJECT AMIGO STATUS SUMMARY ── */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Project Amigo Transformation Status
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="text-slate-300">
              <span className="text-slate-500 block text-[9px] uppercase font-mono">Phase 1 Scope</span>
              Baseline established
            </div>
            <div className="text-slate-300">
              <span className="text-slate-500 block text-[9px] uppercase font-mono">Integrations</span>
              Validated in staging
            </div>
            <div className="text-slate-300">
              <span className="text-slate-500 block text-[9px] uppercase font-mono">Change Requests</span>
              Governed (CR-017)
            </div>
            <div className="text-slate-300">
              <span className="text-slate-500 block text-[9px] uppercase font-mono">Release Plan</span>
              Pilot plan submitted
            </div>
            <div className="text-emerald-400 col-span-2">
              <span className="text-slate-500 block text-[9px] uppercase font-mono">General Availability</span>
              Awaiting pilot results and authorization
            </div>
          </div>
        </div>

        {/* ── KEY TAKEAWAY ── */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-center">
          <div className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold mb-0.5">
            Key Leadership Takeaway
          </div>
          <p className="text-xs sm:text-[13px] font-serif italic text-slate-100">
            "{scorecardData.keyTakeaway}"
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {onReturnToChapterSelect && (
            <button
              onClick={() => {
                updateChapterStatus(5, 'completed');
                updateChapterStatus(6, 'unlocked');
                localStorage.setItem('brained_just_unlocked_chapter', '6');
                onReturnToChapterSelect();
              }}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Return to Chapter Hub
            </button>
          )}

          <button
            onClick={handleProceed}
            className="ml-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center space-x-2 transition-all cursor-pointer"
          >
            <span>Complete Chapter & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
