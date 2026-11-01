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
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { updateChapterStatus } from '../../data/chaptersData';
import type { Chapter8Scorecard } from '../../types/chapter8';
import {
  CHAPTER8_TITLE,
  CHAPTER8_SUBTITLE,
  CHAPTER8_PROJECT_NAME,
  CHAPTER8_KEY_TAKEAWAY,
} from '../../data/chapter8Data';

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
        text: 'SECURITY COMPLIANCE VERIFIED · PORTAL SUSPENSION AVERTED',
        className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      };
    }
    if (scorecardData.outcomeType === 'mixed') {
      return {
        text: 'COMPLIANCE ACHIEVED WITH MINOR CONFIGURATION DELAYS',
        className: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      };
    }
    return {
      text: 'POLICY VIOLATION · INSUFFICIENT DEFENSE POSTURE',
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
        className="max-w-2xl w-full bg-[#08101e] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.2)] space-y-5 relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pr-2">
          <div className="max-w-md">
            <div className="text-[10px] font-mono tracking-[0.22em] text-emerald-400 font-bold uppercase mb-1">
              CHAPTER 8 EVALUATION · CYBERSECURITY COMPLIANCE
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {CHAPTER8_TITLE}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {CHAPTER8_PROJECT_NAME} · {CHAPTER8_SUBTITLE}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-mono">
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

        {/* Core 4 Dimensions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              <span>Timeline</span>
            </div>
            <div className="text-lg font-bold text-white mt-1 font-mono">
              {scorecardData.scheduleScore}
              <span className="text-[10px] text-slate-500">/100</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 text-rose-400" />
              <span>Risk & Trust</span>
            </div>
            <div className="text-lg font-bold text-white mt-1 font-mono">
              {scorecardData.riskScore}
              <span className="text-[10px] text-slate-500">/100</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Governance</span>
            </div>
            <div className="text-lg font-bold text-white mt-1 font-mono">
              {scorecardData.governanceScore}
              <span className="text-[10px] text-slate-500">/100</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Velocity</span>
            </div>
            <div className="text-lg font-bold text-white mt-1 font-mono">
              {scorecardData.efficiencyScore}
              <span className="text-[10px] text-slate-500">/100</span>
            </div>
          </div>
        </div>

        {/* Activity Breakdown (Investigate, Configure, Validate) */}
        <div className="bg-[#0b1424] border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
            Activity Performance Breakdown
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">1. Threat Investigation</div>
              <div className="text-emerald-400 font-bold mt-0.5 font-mono">
                {scorecardData.breakdown.investigationScore} / 25 pts
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">2. WAF & MFA Controls</div>
              <div className="text-emerald-400 font-bold mt-0.5 font-mono">
                {scorecardData.breakdown.controlsScore} / 50 pts
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">3. Readiness Validation</div>
              <div className="text-emerald-400 font-bold mt-0.5 font-mono">
                {scorecardData.breakdown.validationScore} / 25 pts
              </div>
            </div>
          </div>
        </div>

        {/* Qualitative Feedback & Key Takeaway */}
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

          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-3">
            <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              PM Leadership Lens Takeaway
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed italic">
              "{CHAPTER8_KEY_TAKEAWAY}"
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {onReplayChapter && (
              <button
                onClick={onReplayChapter}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Scenario</span>
              </button>
            )}
            {onReturnToChapterSelect && (
              <button
                onClick={onReturnToChapterSelect}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Chapter Select
              </button>
            )}
          </div>

          <button
            onClick={handleProceed}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <span>Proceed · View Final Progress</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
