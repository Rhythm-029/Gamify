import React from 'react';
import { 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  BookOpen, 
  RotateCcw,
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import type { Chapter11Scorecard } from '../../types/chapter11';

interface Chapter11ScorecardModalProps {
  scorecard: Chapter11Scorecard;
  onClose: () => void;
  onReset: () => void;
  onProceedToNextChapter?: () => void;
}

export const Chapter11ScorecardModal: React.FC<Chapter11ScorecardModalProps> = ({
  scorecard,
  onClose,
  onReset,
  onProceedToNextChapter,
}) => {
  const isGovChoice = scorecard.decisionChosen === 'choice_b';
  const govDelta = scorecard.breakdown.governanceScore;
  const riskDelta = scorecard.breakdown.trustRiskScore;
  const effDelta = scorecard.breakdown.efficiencyScore;

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
                    Chapter 11 Evaluated · Second-Last Chapter
                  </span>
                  <span className="text-xs text-slate-400">Project Amigo Handover</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                  The Transition Leader
                </h2>
                <p className="text-sm text-slate-300 mt-0.5">
                  You successfully transferred the product from project delivery to operational ownership.
                </p>
              </div>
            </div>

            {/* Total Performance Score */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto p-3 sm:p-0 rounded-xl bg-slate-950/60 sm:bg-transparent border sm:border-0 border-white/5">
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                Operational Readiness Score
              </span>
              <div className="text-3xl font-black text-indigo-300 flex items-baseline gap-1">
                {scorecard.totalScore}
                <span className="text-sm font-medium text-slate-400">/ 100</span>
              </div>
              <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3" /> Includes +{scorecard.bonusPoints} Transition Bonus
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
              <div className="text-[10px] text-slate-400 mt-1">Formal handover sign-off</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Trust & Risk</div>
              <div className={`text-xl font-bold ${riskDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {riskDelta >= 0 ? `+${riskDelta}` : riskDelta} pts
              </div>
              <div className="text-[10px] text-slate-400 mt-1">2 AM operational triage</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Team Efficiency</div>
              <div className={`text-xl font-bold ${effDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {effDelta >= 0 ? `+${effDelta}` : effDelta} pts
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Engineering unblocked</div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
              <div className="text-xs text-indigo-300 mb-1">Interactive Bonus</div>
              <div className="text-xl font-bold text-amber-300">
                +{scorecard.bonusPoints} pts
              </div>
              <div className="text-[10px] text-indigo-400 mt-1">Runbooks & Hypercare</div>
            </div>
          </div>

          {/* Core Foundations Pillars */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
              Four Pillars of Operational Ownership
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">Runbooks & Documentation</div>
                  <div className="text-slate-400 mt-0.5">
                    Authoritative operational runbooks, escalation matrices, access guides, and SOPs organized into single source of truth.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">Knowledge Transfer & Incident Drills</div>
                  <div className="text-slate-400 mt-0.5">
                    Live INC-0318 incident sequence validated; 3 mandatory training workshops scheduled with recorded documentation.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">14-Day Hypercare Window</div>
                  <div className="text-slate-400 mt-0.5">
                    Stabilization support planned across Intensive Monitoring (Days 1–2), Shared Ownership (Days 3–7), and Ops-Led (Days 8–14).
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">Formal IT Operations Acceptance</div>
                  <div className="text-slate-400 mt-0.5">
                    Signed operational acceptance certificate by Marcus; clear separation between core delivery and permanent production support.
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
                Executive Transition Debrief
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
                <span className="font-semibold text-slate-200">Feedback:</span>
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

          {/* Final Chapter Teaser (Chapter 12) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-extrabold text-purple-400">
                Next: Chapter 12 · The Final Mile (Project Closure & Executive Sign-Off)
              </div>
              <p className="text-xs text-slate-200 mt-1 italic">
                AARAV KAPOOR: "The operations team has accepted ownership. The project is ready for formal closure. There's just one final meeting with the steering committee. Let's make sure we close this the right way."
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Handover</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
            >
              Close Scorecard
            </button>
          </div>

          {onProceedToNextChapter && (
            <button
              onClick={onProceedToNextChapter}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>Continue to Chapter 12 (The Final Mile)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

