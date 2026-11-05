import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ArrowRight, 
  GitBranch, 
  BookOpen, 
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import type { Chapter10Scorecard } from '../../types/chapter10';

interface Chapter10ScorecardModalProps {
  scorecard: Chapter10Scorecard;
  onClose: () => void;
  onReset: () => void;
  onProceedToNextChapter?: () => void;
}

export const Chapter10ScorecardModal: React.FC<Chapter10ScorecardModalProps> = ({
  scorecard,
  onClose,
  onReset,
  onProceedToNextChapter
}) => {
  const isGovChoice = scorecard.decisionChosen === 'choice_b';
  const govDelta = scorecard.breakdown.governanceScore;
  const riskDelta = isGovChoice ? 20 : -20;
  const effDelta = isGovChoice ? 10 + scorecard.bonusPoints : -10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl text-slate-100 flex flex-col">
        {/* Header / Achievement Splash */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900/60 border-b border-indigo-500/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Award className="w-9 h-9 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Chapter 10 Evaluated
                  </span>
                  <span className="text-xs text-slate-400">Project Amigo Release</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                  Release Architect
                </h2>
                <p className="text-sm text-slate-300 mt-0.5">
                  You established the foundational architecture specifications & release governance for long-term product maintainability.
                </p>
              </div>
            </div>

            {/* Total Performance Score */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto p-3 sm:p-0 rounded-xl bg-slate-950/60 sm:bg-transparent border sm:border-0 border-white/5">
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                Release Readiness Score
              </span>
              <div className="text-3xl font-black text-indigo-300 flex items-baseline gap-1">
                {scorecard.totalScore}
                <span className="text-sm font-medium text-slate-400">/ 100</span>
              </div>
              <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3" /> Includes +{scorecard.bonusPoints} Formative Bonus
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Key Competencies Impact Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Delivery Governance</div>
              <div className={`text-xl font-bold ${govDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {govDelta >= 0 ? `+${govDelta}` : govDelta} pts
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Release discipline</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Trust & Risk</div>
              <div className={`text-xl font-bold ${riskDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {riskDelta >= 0 ? `+${riskDelta}` : riskDelta} pts
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Knowledge redundancy</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Team Efficiency</div>
              <div className={`text-xl font-bold ${effDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {effDelta >= 0 ? `+${effDelta}` : effDelta} pts
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Onboarding friction</div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
              <div className="text-xs text-indigo-300 mb-1">Interactive Bonus</div>
              <div className="text-xl font-bold text-amber-300">
                +{scorecard.bonusPoints} pts
              </div>
              <div className="text-[10px] text-indigo-400 mt-1">Challenge tasks</div>
            </div>
          </div>

          {/* Core Foundations Pillars */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
              Four Pillars of Technical Release Governance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                <GitBranch className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">Version Control Discipline</div>
                  <div className="text-slate-400 mt-0.5">
                    Formal <strong>v1.0.0</strong> semantic tag established. Git history mirrors deployment artifacts.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">Centralized Knowledge Base</div>
                  <div className="text-slate-400 mt-0.5">
                    Consolidated <strong>6 / 6</strong> architectural domains published to the internal developer portal.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                <Layers className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">System Architecture Traceability</div>
                  <div className="text-slate-400 mt-0.5">
                    Obsolete diagrams archived; single source of truth created for upstream & downstream service contracts.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">Maintainability & Independence</div>
                  <div className="text-slate-400 mt-0.5">
                    Eliminated critical developer dependencies so new engineers onboard in days rather than reverse-engineering the codebase.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Qualitative Narrative Feedback */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Executive Post-Release Debrief
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${isGovChoice ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {scorecard.outcomeTitle}
              </span>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              {scorecard.outcomeText}
            </p>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">Executive Feedback:</span>
                <span className="italic">{scorecard.executiveFeedback}</span>
              </div>
            </div>
          </div>

          {/* PM Leadership Lesson Callout */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-amber-400">
                PM Leadership Lesson
              </div>
              <p className="text-sm font-medium text-amber-100 mt-0.5">
                "{scorecard.keyTakeaway}"
              </p>
            </div>
          </div>

          {/* Next Chapter Preview Teaser */}
          <div className="p-3.5 rounded-xl bg-indigo-950/50 border border-indigo-500/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-extrabold text-indigo-400">
                Coming Up: Chapter 11
              </div>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">
                Transition to Business-as-Usual (BAU) — The Operations Handover Crisis
              </div>
              <div className="text-[11px] text-slate-400">
                Transfer ownership, SLAs, escalation matrices, and incident response to permanent ops before the delivery team disbands.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Challenge</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              Close Scorecard
            </button>
          </div>

          {onProceedToNextChapter && (
            <button
              onClick={onProceedToNextChapter}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Continue to Chapter 11 (Handover Crisis)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
