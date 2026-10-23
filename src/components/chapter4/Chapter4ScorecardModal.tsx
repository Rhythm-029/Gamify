import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  Clock,
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Users,
} from 'lucide-react';
import { updateChapterStatus } from '../../data/chaptersData';
import type { Chapter4Scorecard } from '../../types/chapter4';

interface Chapter4ScorecardModalProps {
  scorecardData: Chapter4Scorecard;
  onProceedToNextChapter: () => void;
  onReturnToChapterSelect?: () => void;
}

export const Chapter4ScorecardModal: React.FC<Chapter4ScorecardModalProps> = ({
  scorecardData,
  onProceedToNextChapter,
  onReturnToChapterSelect,
}) => {
  const handleProceed = () => {
    updateChapterStatus(4, 'completed');
    updateChapterStatus(5, 'unlocked');
    localStorage.setItem('brained_just_unlocked_chapter', '5');
    onProceedToNextChapter();
  };

  const getStatusBadge = () => {
    if (scorecardData.outcomeType === 'strong') {
      return {
        text: 'IMPACT ASSESSMENT APPROVED',
        className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      };
    }
    if (scorecardData.outcomeType === 'mixed') {
      return {
        text: 'FURTHER ASSESSMENT REQUIRED',
        className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      };
    }
    return {
      text: 'ASSESSMENT INCOMPLETE',
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
        className="max-w-2xl w-full bg-[#0d1222] border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(168,85,247,0.25)] space-y-5 relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pr-2">
          <div className="max-w-md">
            <div className="text-[10px] font-mono tracking-[0.22em] text-purple-400 font-bold uppercase mb-1">
              CHAPTER 4 COMPLETE
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight">
              CHANGE REQUEST EVALUATED
            </h2>
            <div className="text-xs font-semibold text-slate-300 mt-0.5">
              Project Amigo · Change Request & Impact Analysis (CR-017)
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

        {/* 4 Scorecard Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Schedule */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-sky-400 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Schedule / Timeline
              </span>
              <span className="font-mono text-xs font-bold text-white">
                {scorecardData.scheduleScore}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${scorecardData.scheduleScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {scorecardData.explanations.schedule}
            </p>
          </div>

          {/* Risk */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Trust & Risk Management
              </span>
              <span className="font-mono text-xs font-bold text-white">
                {scorecardData.riskScore}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${scorecardData.riskScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {scorecardData.explanations.risk}
            </p>
          </div>

          {/* Governance */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-purple-400" />
                Delivery Governance
              </span>
              <span className="font-mono text-xs font-bold text-white">
                {scorecardData.governanceScore}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${scorecardData.governanceScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {scorecardData.explanations.governance}
            </p>
          </div>

          {/* Efficiency */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Team Velocity & Focus
              </span>
              <span className="font-mono text-xs font-bold text-white">
                {scorecardData.efficiencyScore}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${scorecardData.efficiencyScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {scorecardData.explanations.efficiency}
            </p>
          </div>
        </div>

        {/* Strongest Move & One Thing To Improve */}
        <div className="space-y-2 pt-1">
          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                Your Strongest Move
              </div>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                {scorecardData.strongestMove}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                One Thing to Improve
              </div>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                {scorecardData.oneThingToImprove}
              </p>
            </div>
          </div>
        </div>

        {/* Leadership Takeaway */}
        <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40">
          <div className="text-[10px] font-mono uppercase text-purple-300 font-bold mb-1">
            Leadership Takeaway
          </div>
          <p className="text-xs text-slate-200 italic leading-relaxed">
            "{scorecardData.leadershipTakeaway}"
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          {onReturnToChapterSelect && (
            <button
              onClick={onReturnToChapterSelect}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1"
            >
              Back to Chapter Select
            </button>
          )}

          <button
            onClick={handleProceed}
            className="ml-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg flex items-center space-x-2 cursor-pointer transition-all border border-purple-400/40"
          >
            <span>Continue to Chapter 5</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
