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
  RotateCcw,
  Sparkles,
  Award,
} from 'lucide-react';
import { updateChapterStatus } from '../../data/chaptersData';
import type { Chapter3Scorecard } from '../../types/chapter3';

interface Chapter3ScorecardModalProps {
  scorecardData: Chapter3Scorecard;
  onProceedToNextChapter: () => void;
  onReturnToChapterSelect?: () => void;
  onReplayChapter?: () => void;
}

export const Chapter3ScorecardModal: React.FC<Chapter3ScorecardModalProps> = ({
  scorecardData,
  onProceedToNextChapter,
  onReturnToChapterSelect,
  onReplayChapter,
}) => {
  const handleProceed = () => {
    updateChapterStatus(3, 'completed');
    updateChapterStatus(4, 'unlocked');
    localStorage.setItem('brained_just_unlocked_chapter', '4');
    onProceedToNextChapter();
  };

  const handleReturnToChapters = () => {
    updateChapterStatus(3, 'completed');
    updateChapterStatus(4, 'unlocked');
    localStorage.setItem('brained_just_unlocked_chapter', '4');
    if (onReturnToChapterSelect) onReturnToChapterSelect();
    else onProceedToNextChapter();
  };

  const getStatusBadge = () => {
    if (scorecardData.outcomeType === 'strong') {
      return {
        text: 'EXEMPLARY UAT COORDINATION',
        className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      };
    }
    if (scorecardData.outcomeType === 'partial') {
      return {
        text: 'RESOLVED WITH DEVELOPER PROMPT',
        className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      };
    }
    return {
      text: 'INCOMPLETE INFRASTRUCTURE CLEARANCE',
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
        className="max-w-3xl w-full bg-[#0d1222] border border-sky-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(14,165,233,0.25)] space-y-5 relative overflow-hidden my-auto"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pr-2 border-b border-white/10 pb-4">
          <div className="max-w-md">
            <div className="text-[10px] font-mono tracking-[0.22em] text-sky-400 font-bold uppercase mb-1">
              CHAPTER 3 COMPLETE · PERFORMANCE ASSESSMENT
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight">
              {scorecardData.outcomeTitle || 'UAT INFRASTRUCTURE COORDINATION'}
            </h2>
            <div className="text-xs font-semibold text-slate-300 mt-0.5">
              Project Amigo · Client Handoff, Technical Prerequisites & Network Gates
            </div>
          </div>

          <div className="text-right shrink-0">
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
              <span className="font-mono text-xs font-black text-white">{scorecardData.scheduleScore}%</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {scorecardData.explanations?.schedule}
            </p>
          </div>

          {/* Trust & Risk */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Trust & Risk Management
              </span>
              <span className="font-mono text-xs font-black text-white">{scorecardData.riskScore}%</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {scorecardData.explanations?.risk}
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
              {scorecardData.explanations?.governance}
            </p>
          </div>

          {/* Team Efficiency & Velocity */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Team Efficiency & Velocity
              </span>
              <span className="font-mono text-xs font-black text-white">{scorecardData.efficiencyScore}%</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {scorecardData.explanations?.efficiency}
            </p>
          </div>
        </div>

        {/* 3 Core Evaluated Behaviours */}
        {scorecardData.behaviours && (
          <div className="p-3.5 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-sky-400" />
              <span>Evaluated Professional Behaviours</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start space-x-2">
                {scorecardData.behaviours.requirementCompleteness?.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="text-white text-xs">A. Requirement Completeness:</strong>{' '}
                  <span className="text-slate-300 text-[11.5px]">
                    {scorecardData.behaviours.requirementCompleteness?.feedback}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                {scorecardData.behaviours.stakeholderCommunication?.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="text-white text-xs">B. Stakeholder Communication:</strong>{' '}
                  <span className="text-slate-300 text-[11.5px]">
                    {scorecardData.behaviours.stakeholderCommunication?.feedback}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                {scorecardData.behaviours.deliveryCoordination?.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="text-white text-xs">C. Delivery Coordination:</strong>{' '}
                  <span className="text-slate-300 text-[11.5px]">
                    {scorecardData.behaviours.deliveryCoordination?.feedback}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Learning Insight Box */}
        {scorecardData.learningInsight && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-purple-950/40 border border-sky-500/30 flex items-start space-x-3 text-xs">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold block">
                Key Transformation Insight
              </span>
              <p className="text-slate-200 text-xs leading-relaxed">
                {scorecardData.learningInsight}
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {onReplayChapter ? (
            <button
              onClick={onReplayChapter}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Chapter 3</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            {onReturnToChapterSelect && (
              <button
                onClick={handleReturnToChapters}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-all cursor-pointer"
              >
                Return to Hub
              </button>
            )}

            <button
              onClick={handleProceed}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold text-xs tracking-wide transition-all shadow-[0_0_25px_rgba(14,165,233,0.35)] flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Proceed to Chapter 4</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
