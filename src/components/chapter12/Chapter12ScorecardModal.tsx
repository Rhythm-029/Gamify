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
  Building2,
  Lightbulb,
  Award,
} from 'lucide-react';
import type { Chapter12Scorecard } from '../../types/chapter12';
import {
  CHAPTER12_TITLE,
  CHAPTER12_SUBTITLE,
  CHAPTER12_PROJECT_NAME,
  CHAPTER12_CHARACTERS,
} from '../../data/chapter12Data';

interface Chapter12ScorecardModalProps {
  scorecard: Chapter12Scorecard;
  onClose: () => void;
  onReset: () => void;
  onViewTransformationReport: () => void;
}

export const Chapter12ScorecardModal: React.FC<Chapter12ScorecardModalProps> = ({
  scorecard,
  onClose,
  onReset,
  onViewTransformationReport,
}) => {
  const getStatusBadge = () => {
    if (scorecard.outcomeType === 'strong' || scorecard.totalScore >= 85) {
      return {
        text: 'CR-024 UPGRADE AUTHORIZED · TRANSFORMATION MASTER',
        className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      };
    }
    return {
      text: 'STAGING MITIGATION REQUIRED · CONTROLLED ROLLOUT',
      className: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    };
  };

  const badge = getStatusBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl max-h-[90vh] bg-[#09121d] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
      >
        {/* HEADER SECTION (PINNED) */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/40 relative shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
                  {CHAPTER12_PROJECT_NAME} · Chapter 12
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${badge.className}`}>
                  {badge.text}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{CHAPTER12_TITLE} — Executive Performance Report</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {CHAPTER12_SUBTITLE}
              </p>
            </div>

            {/* TOTAL SCORE BADGE */}
            <div className="flex flex-col items-center justify-center bg-slate-950/70 border border-amber-500/40 px-5 py-3 rounded-2xl shadow-inner min-w-[110px] shrink-0">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Total Score
              </span>
              <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                {scorecard.totalScore}
                <span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[9px] font-mono text-amber-300 font-semibold">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Grok AI Evaluated</span>
              </div>
            </div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* EVALUATOR & OUTCOME SUMMARY */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-xl">👔</span>
                <div>
                  <span className="font-bold text-white">
                    {CHAPTER12_CHARACTERS.aarav.name} (Senior PM) & {CHAPTER12_CHARACTERS.marcus.name} (CTO)
                  </span>
                  <span className="text-slate-400 ml-2">
                    (Executive Steering Committee — ICICI Bank)
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                Evaluated: Steering Committee Review
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1">
                Executive Boardroom Summary
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {scorecard.executiveFeedback || scorecard.outcomeText}
              </p>
            </div>
          </div>

          {/* METRICS DIMENSION BREAKDOWN */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Executive Competency Breakdown
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* DELIVERY GOVERNANCE */}
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    Delivery Governance (35%)
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {scorecard.governanceScore}/100
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-500"
                    style={{ width: `${scorecard.governanceScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {scorecard.explanations?.governance || 'Evaluation of CR-024 scope management and change authority.'}
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
                    {scorecard.riskScore}/100
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-400 h-full transition-all duration-500"
                    style={{ width: `${scorecard.riskScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {scorecard.explanations?.risk || 'Evaluation of Blue-Green staging isolation and rollback safety.'}
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
                    {scorecard.scheduleScore}/100
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-400 h-full transition-all duration-500"
                    style={{ width: `${scorecard.scheduleScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {scorecard.explanations?.schedule || 'Progressive rollout cadence using granular feature flags.'}
                </p>
              </div>

              {/* OPERATIONAL EFFICIENCY */}
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    Operational Efficiency (20%)
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {scorecard.efficiencyScore}/100
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${scorecard.efficiencyScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {scorecard.explanations?.efficiency || 'Zero-downtime routing automation and capacity optimization.'}
                </p>
              </div>
            </div>
          </div>

          {/* STRENGTHS & IMPROVEMENTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                What You Did Well
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {scorecard.whatYouDidWell || scorecard.leadershipStrengths?.[0] || 'Architected disciplined zero-downtime release governance using Blue-Green routing.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                Executive Growth Opportunity
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {scorecard.whatToImprove || scorecard.areasToImprove?.[0] || 'Ensure earlier telemetry instrumentation for newly introduced background daemons.'}
              </p>
            </div>
          </div>

          {/* CORE LEARNING / KEY TAKEAWAY */}
          <div className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Senior PM Executive Takeaway
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-amber-500 pl-3">
              "{scorecard.keyTakeaway || 'Enterprise agility is not reckless speed; it is the discipline of controlled releases, blast-radius mitigation via feature flags, and isolated blue-green staging that protects operational trust while accelerating innovation.'}"
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS FOOTER (PINNED) */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={onReset}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Chapter 12</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer border border-slate-700"
            >
              <span>Mission Hub</span>
            </button>

            <button
              onClick={onViewTransformationReport}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 border border-amber-300/60 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Award className="w-4 h-4" />
              <span>View Final Transformation Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
