import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Lightbulb, Compass, RotateCcw,
  Sparkles, CheckCircle2, ShieldCheck, Clock, Shield, AlertCircle
} from 'lucide-react';
import { updateChapterStatus } from '../../data/chaptersData';
import type { ScopeAssignmentResult } from './ProjectAmigoScopeAssignment';

interface Chapter1CompletionModalProps {
  assignmentResult?: ScopeAssignmentResult | null;
  onContinueToChapter2: () => void;
  onReturnToJourney?: () => void;
  onReplayChapter?: () => void;
}

export const Chapter1CompletionModal: React.FC<Chapter1CompletionModalProps> = ({
  assignmentResult,
  onContinueToChapter2,
  onReturnToJourney,
  onReplayChapter,
}) => {
  const handleProceed = () => {
    updateChapterStatus(1, 'completed');
    updateChapterStatus(2, 'unlocked');
    localStorage.setItem('brained_just_unlocked_chapter', '2');
    onContinueToChapter2();
  };

  const handleReturnToChapters = () => {
    updateChapterStatus(1, 'completed');
    updateChapterStatus(2, 'unlocked');
    localStorage.setItem('brained_just_unlocked_chapter', '2');
    if (onReturnToJourney) onReturnToJourney();
    else onContinueToChapter2();
  };

  const evalData = assignmentResult?.evaluation;
  const isAIEvaluated = evalData?.aiEvaluated ?? true;
  const totalScore = evalData?.score ?? 88;
  const outcomeTitle = evalData?.outcomeTitle || (totalScore >= 85 ? 'EXEMPLARY SCOPE GOVERNANCE' : 'BALANCED SCOPE WITH RISKS');

  const scheduleVal = evalData?.scheduleScore ? (evalData.scheduleScore > 25 ? evalData.scheduleScore : evalData.scheduleScore * 4) : 85;
  const riskVal = evalData?.riskScore ? (evalData.riskScore > 25 ? evalData.riskScore : evalData.riskScore * 4) : 85;
  const govVal = evalData?.governanceScore ? (evalData.governanceScore > 25 ? evalData.governanceScore : evalData.governanceScore * 4) : 85;
  const effVal = evalData?.efficiencyScore ? (evalData.efficiencyScore > 25 ? evalData.efficiencyScore : evalData.efficiencyScore * 4) : 85;

  return (
    <div className="fixed inset-0 z-[600] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans select-none">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        className="max-w-2xl w-full bg-[#0d1222] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.2)] space-y-5 relative overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between pr-2">
          <div className="max-w-md">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-mono tracking-[0.22em] text-amber-400 font-bold uppercase">
                CHAPTER 1 COMPLETE
              </span>
              {isAIEvaluated && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" />
                  Grok AI Evaluated
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight">
              {outcomeTitle}
            </h2>
            <div className="text-xs font-semibold text-slate-300 mt-0.5">
              Project Amigo · ICICI Bank HRMS Modernization
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Total Score</div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {totalScore}%
            </div>
            <div className="text-[9px] font-mono text-emerald-400 font-bold">
              {totalScore >= 85 ? 'EXECUTIVE APPROVED' : 'CONDITIONAL APPROVAL'}
            </div>
          </div>
        </div>

        {/* ── EXECUTIVE REVIEW NOTE FROM AARAV KAPOOR ── */}
        {evalData?.aaravResponse && (
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Aarav Kapoor · Lead Engagement Partner
            </div>
            <p className="text-slate-200 italic">
              "{evalData.aaravResponse}"
            </p>
          </div>
        )}

        {/* ── METRIC PERFORMANCE SUMMARY ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-center space-y-0.5">
            <div className="text-[9px] font-mono uppercase text-sky-400 font-bold flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> Schedule
            </div>
            <div className="text-base font-black text-white font-mono">{scheduleVal}%</div>
            <div className="text-[9px] text-slate-400">Timeline Feasibility</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-center space-y-0.5">
            <div className="text-[9px] font-mono uppercase text-amber-400 font-bold flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> Risk Mgmt
            </div>
            <div className="text-base font-black text-white font-mono">{riskVal}%</div>
            <div className="text-[9px] text-slate-400">LDAP & Security</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-center space-y-0.5">
            <div className="text-[9px] font-mono uppercase text-emerald-400 font-bold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Governance
            </div>
            <div className="text-base font-black text-white font-mono">{govVal}%</div>
            <div className="text-[9px] text-slate-400">Scope Gating</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-center space-y-0.5">
            <div className="text-[9px] font-mono uppercase text-indigo-400 font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Velocity
            </div>
            <div className="text-base font-black text-white font-mono">{effVal}%</div>
            <div className="text-[9px] text-slate-400">Team Momentum</div>
          </div>
        </div>

        {/* ── STRENGTHS & IMPROVEMENTS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
            <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              What You Did Well
            </div>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
              {(evalData?.strengths?.length ? evalData.strengths : [
                'Prioritized critical-path business modules aligned with appraisal cycle',
                'Handled LDAP dependency through explicit governance without stalling work',
              ]).slice(0, 2).map((item, idx) => (
                <li key={idx} className="leading-snug">{item}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
            <div className="text-[10px] font-mono text-amber-400 font-bold uppercase flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              Focus Areas for Sprint 1
            </div>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
              {(evalData?.improvements?.length ? evalData.improvements : [
                'Ensure peak 30k concurrent load validation is architected early',
                'Lock in formal written baseline before engineering commences',
              ]).slice(0, 2).map((item, idx) => (
                <li key={idx} className="leading-snug">{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── STRATEGIC TAKEAWAY ── */}
        <div className="rounded-2xl p-3.5 bg-gradient-to-r from-amber-500/15 via-[#1a1710] to-[#121622] border border-amber-500/40 flex items-start space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-amber-400 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-mono tracking-[0.2em] text-amber-400 font-bold uppercase">
              LEADERSHIP TAKEAWAY
            </div>
            <p className="text-xs font-bold text-white mt-0.5 leading-snug">
              {evalData?.leadershipCoaching || "A meeting clarifies what the client wants; delivery governance determines what the team can reliably commit to."}
            </p>
          </div>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          <div className="flex items-center space-x-2">
            {onReturnToJourney && (
              <button
                onClick={handleReturnToChapters}
                className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Back to Chapters
              </button>
            )}

            {onReplayChapter && (
              <button
                onClick={onReplayChapter}
                className="px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Chapter 1</span>
              </button>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(245,158,11,0.6)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleProceed}
            className="ml-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-[0_0_20px_rgba(245,158,11,0.45)] cursor-pointer transition-all"
          >
            <span>Proceed to Chapter 2</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
