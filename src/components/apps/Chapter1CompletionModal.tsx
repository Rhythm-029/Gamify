import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb, Compass } from 'lucide-react';
import { updateChapterStatus } from '../../data/chaptersData';
import type { ScopeAssignmentResult } from './ProjectAmigoScopeAssignment';

interface Chapter1CompletionModalProps {
  assignmentResult?: ScopeAssignmentResult | null;
  onContinueToChapter2: () => void;
  onReturnToJourney?: () => void;
}

export const Chapter1CompletionModal: React.FC<Chapter1CompletionModalProps> = ({
  assignmentResult,
  onContinueToChapter2,
  onReturnToJourney,
}) => {
  const handleProceed = () => {
    updateChapterStatus(1, 'completed');
    updateChapterStatus(2, 'unlocked');
    localStorage.setItem('brained_just_unlocked_chapter', '2');
    onContinueToChapter2();
  };

  const evalData = assignmentResult?.evaluation;

  return (
    <div className="fixed inset-0 z-[600] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans select-none">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        className="max-w-2xl w-full bg-[#0d1222] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.2)] space-y-6 relative overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between pr-2">
          <div className="max-w-md">
            <div className="text-[10px] font-mono tracking-[0.22em] text-amber-400 font-bold uppercase mb-1">
              CHAPTER 1 COMPLETE
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight">
              The Requirement Storm
            </h2>
            <div className="text-xs font-semibold text-slate-300 mt-0.5">
              Project Amigo · ICICI Bank HRMS Transformation
            </div>
          </div>

          <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 hidden sm:block shadow-lg">
            <img
              src="/assets/executive_skyline_bg.jpg"
              alt="Executive Skyline"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-2 select-none">
              <div className="text-[8px] font-mono font-bold tracking-wider text-slate-200 leading-tight italic">
                “CLEARER CONVERSATIONS STRONGER OUTCOMES.”
              </div>
              <div className="w-5 h-[1.5px] bg-amber-400 mt-0.5" />
            </div>
          </div>
        </div>

        {/* ── TAKEAWAY & NEXT CHALLENGE CARDS ── */}
        <div className="space-y-3">
          {/* Card 1: Your Takeaway */}
          <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-500/15 via-[#1a1710] to-[#121622] border border-amber-500/40 flex items-start space-x-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)] mt-0.5">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-mono tracking-[0.2em] text-amber-400 font-bold uppercase">
                YOUR TAKEAWAY
              </div>
              <p className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug">
                A meeting can clarify what the client wants, but it doesn't automatically establish what the team can deliver.
              </p>
            </div>
          </div>

          {/* Card 2: Your Next Challenge */}
          <div className="rounded-2xl p-4 bg-gradient-to-r from-sky-500/15 via-[#0e1726] to-[#0f1422] border border-sky-500/35 flex items-start space-x-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center flex-shrink-0 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.25)] mt-0.5">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-mono tracking-[0.2em] text-sky-400 font-bold uppercase">
                YOUR NEXT CHALLENGE
              </div>
              <p className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug">
                The team now needs to turn the proposed scope into something engineers can actually work on.
              </p>
            </div>
          </div>
        </div>

        {/* ── METRIC PERFORMANCE SUMMARY ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-center space-y-0.5">
            <div className="text-[9px] font-mono uppercase text-slate-400 font-bold">Schedule</div>
            <div className="text-base font-black text-sky-400">{evalData?.scheduleScore ?? 25}/25</div>
            <div className="text-[9px] text-slate-400">Timeline Feasibility</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-center space-y-0.5">
            <div className="text-[9px] font-mono uppercase text-slate-400 font-bold">Risk Mgmt</div>
            <div className="text-base font-black text-amber-400">{evalData?.riskScore ?? 25}/25</div>
            <div className="text-[9px] text-slate-400">LDAP & Concurrency</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-center space-y-0.5">
            <div className="text-[9px] font-mono uppercase text-slate-400 font-bold">Governance</div>
            <div className="text-base font-black text-emerald-400">{evalData?.governanceScore ?? 25}/25</div>
            <div className="text-[9px] text-slate-400">Scope Gating</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-center space-y-0.5">
            <div className="text-[9px] font-mono uppercase text-slate-400 font-bold">Velocity</div>
            <div className="text-base font-black text-indigo-400">{evalData?.efficiencyScore ?? 25}/25</div>
            <div className="text-[9px] text-slate-400">Team Momentum</div>
          </div>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          {onReturnToJourney && (
            <button
              onClick={onReturnToJourney}
              className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              Back to Chapters
            </button>
          )}

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(245,158,11,0.6)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleProceed}
            className="ml-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-[0_0_20px_rgba(245,158,11,0.45)] cursor-pointer transition-all"
          >
            <span>Continue to Chapter 2</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
