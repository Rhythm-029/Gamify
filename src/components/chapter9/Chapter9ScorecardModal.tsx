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
  Lock,
  Building2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { updateChapterStatus } from '../../data/chaptersData';
import type { Chapter9Scorecard } from '../../types/chapter9';
import {
  CHAPTER9_TITLE,
  CHAPTER9_SUBTITLE,
  CHAPTER9_PROJECT_NAME,
  CHAPTER9_KEY_TAKEAWAY,
  CHAPTER9_CHARACTERS,
} from '../../data/chapter9Data';

interface Chapter9ScorecardModalProps {
  scorecardData: Chapter9Scorecard;
  onProceedToNextChapter: () => void;
  onReturnToChapterSelect?: () => void;
  onReplayChapter?: () => void;
}

export const Chapter9ScorecardModal: React.FC<Chapter9ScorecardModalProps> = ({
  scorecardData,
  onProceedToNextChapter,
  onReturnToChapterSelect,
  onReplayChapter,
}) => {
  const handleProceed = () => {
    updateChapterStatus(9, 'completed');
    localStorage.setItem('brained_just_unlocked_chapter', '10');
    onProceedToNextChapter();
  };

  const getStatusBadge = () => {
    if (scorecardData.outcomeType === 'strong') {
      return {
        text: 'UNANIMOUS BOARD APPROVAL · PHASE 2 CAPITAL UNLOCKED',
        className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      };
    }
    if (scorecardData.outcomeType === 'mixed') {
      return {
        text: 'ACCEPTABLE ROI JUSTIFICATION · CONDITIONAL PHASE 2 RELEASE',
        className: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      };
    }
    return {
      text: 'BOARDROOM SKEPTICISM · PHASE 2 BUDGET FROZEN',
      className: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
    };
  };

  const badge = getStatusBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-[#09121d] border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 my-8"
      >
        {/* HEADER SECTION */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  {CHAPTER9_PROJECT_NAME} · Chapter 9
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${badge.className}`}>
                  {badge.text}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{CHAPTER9_TITLE} — Executive Performance Report</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {CHAPTER9_SUBTITLE}
              </p>
            </div>

            {/* TOTAL SCORE BADGE */}
            <div className="flex flex-col items-center justify-center bg-slate-950/70 border border-emerald-500/40 px-5 py-3 rounded-2xl shadow-inner min-w-[110px]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Total Score
              </span>
              <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                {scorecardData.totalScore}
                <span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[9px] font-mono text-emerald-300 font-semibold">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Grok AI Evaluated</span>
              </div>
            </div>
          </div>
        </div>

        {/* EVALUATOR & OUTCOME SUMMARY */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">👔</span>
              <div>
                <span className="font-bold text-white">
                  {scorecardData.evaluatorName || CHAPTER9_CHARACTERS.mark.name}
                </span>
                <span className="text-slate-400 ml-2">
                  ({scorecardData.evaluatorRole || CHAPTER9_CHARACTERS.mark.role})
                </span>
              </div>
            </div>
            {scorecardData.evaluatedAt && (
              <span className="font-mono text-[10px] text-slate-500">
                Evaluated: {new Date(scorecardData.evaluatedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">
              Executive Boardroom Summary
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {scorecardData.executiveFeedback || scorecardData.outcomeText}
            </p>
          </div>
        </div>

        {/* METRICS DIMENSION BREAKDOWN */}
        <div className="p-6 border-b border-slate-800 space-y-4">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Executive Competency Breakdown
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* DELIVERY GOVERNANCE */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  Delivery Governance (35%)
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {scorecardData.governanceScore}/100
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${scorecardData.governanceScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {scorecardData.explanations?.governance || 'Evaluation of ROI communication.'}
              </p>
            </div>

            {/* TRUST & RISK MANAGEMENT */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  Trust & Risk Management (25%)
                </span>
                <span className="font-mono font-bold text-teal-400">
                  {scorecardData.riskScore}/100
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-400 h-full transition-all duration-500"
                  style={{ width: `${scorecardData.riskScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {scorecardData.explanations?.risk || 'Evaluation of boardroom trust and capital safety.'}
              </p>
            </div>

            {/* SCHEDULE / TIMELINE */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  Schedule / Timeline (20%)
                </span>
                <span className="font-mono font-bold text-sky-400">
                  {scorecardData.scheduleScore}/100
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-400 h-full transition-all duration-500"
                  style={{ width: `${scorecardData.scheduleScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {scorecardData.explanations?.schedule || 'Milestone and review cadence pacing.'}
              </p>
            </div>

            {/* OPERATIONAL EFFICIENCY */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Operational Efficiency (20%)
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {scorecardData.efficiencyScore}/100
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full transition-all duration-500"
                  style={{ width: `${scorecardData.efficiencyScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {scorecardData.explanations?.efficiency || 'Capacity harvesting across 80k bank staff.'}
              </p>
            </div>
          </div>
        </div>

        {/* STRENGTHS & IMPROVEMENTS */}
        <div className="p-6 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              What You Did Well
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {scorecardData.whatYouDidWell}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              Executive Growth Opportunity
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {scorecardData.whatToImprove}
            </p>
          </div>
        </div>

        {/* CORE LEARNING / KEY TAKEAWAY */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/30">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Senior PM Executive Takeaway
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-emerald-500 pl-3">
            "{scorecardData.keyTakeaway || CHAPTER9_KEY_TAKEAWAY}"
          </p>
        </div>

        {/* ACTION BUTTONS FOOTER */}
        <div className="p-6 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {onReplayChapter && (
            <button
              onClick={onReplayChapter}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Chapter 9</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {onReturnToChapterSelect && (
              <button
                onClick={onReturnToChapterSelect}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer border border-slate-700"
              >
                <span>Mission Hub</span>
              </button>
            )}

            <button
              onClick={handleProceed}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/50 border border-emerald-400/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Proceed to Chapter 10</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
