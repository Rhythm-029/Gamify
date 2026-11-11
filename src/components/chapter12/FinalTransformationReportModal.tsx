import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Calendar,
  Shield,
  Zap,
  CheckCircle2,
  Users,
  ArrowRight,
  BookOpen,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import type { Chapter12Scorecard } from '../../types/chapter12';
import { CHAPTER_JOURNEY_MILESTONES } from '../../data/chapter12Data';
import { sound } from '../onboarding/SoundEngine';

interface FinalTransformationReportModalProps {
  scorecard: Chapter12Scorecard;
  onReturnToDesktop: () => void;
}

export const FinalTransformationReportModal: React.FC<FinalTransformationReportModalProps> = ({
  scorecard,
  onReturnToDesktop,
}) => {
  const [isJourneyDrawerOpen, setIsJourneyDrawerOpen] = useState(false);

  const finalGrade = scorecard.finalGrade;
  const cumulativeScoreFormatted = scorecard.cumulativeScore.toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-xl select-none overflow-y-auto font-sans">
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-[#0a0f1d] via-[#0d1326] to-[#0a0f1d] border border-amber-500/30 rounded-3xl shadow-2xl p-4 sm:p-6 flex flex-col justify-between overflow-hidden my-auto">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ── TOP HEADER (PROJECT AMIGO — COMPLETE & ICICI BANK LOGO) ── */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-amber-400">
                PROJECT AMIGO — COMPLETE
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white mt-1 tracking-tight leading-tight">
              You didn't just deliver a project.
            </h1>
            <h2 className="text-lg sm:text-2xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent tracking-tight leading-tight">
              You transformed an enterprise.
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-[#B02A30] text-white font-extrabold text-xs sm:text-sm tracking-wider shadow-md">
              ICICI Bank
            </div>
          </div>
        </div>

        {/* ── MIDDLE GRID (LEFT: GOLD EMBLEM, RIGHT: YOUR TRANSFORMATION JOURNEY) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-4 items-center">
          {/* LEFT: PREMIUM GOLD SHIELD EMBLEM (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-900/60 border border-amber-500/30 shadow-xl relative overflow-hidden text-center">
            {/* Laurel Wreath / Shield Emblem */}
            <div className="relative mb-2.5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-1.5 shadow-[0_0_50px_rgba(245,158,11,0.35)] flex items-center justify-center">
                <div className="w-full h-full bg-[#0a0f1d] rounded-full flex flex-col items-center justify-center p-2">
                  <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight drop-shadow-md leading-none">
                    {finalGrade}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-widest mt-1">
                    CERTIFIED
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-extrabold mb-0.5">
              THE ULTIMATE ACHIEVEMENT
            </div>
            <h3 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug">
              MASTER ENTERPRISE TRANSFORMATION DIRECTOR
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              12 Chapters. One Transformation.
            </p>
          </div>

          {/* RIGHT: YOUR TRANSFORMATION JOURNEY CARD (7 cols) */}
          <div className="lg:col-span-7 flex flex-col bg-slate-900/80 rounded-3xl border border-white/10 p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-2.5">
              <span className="text-xs font-mono uppercase font-bold text-slate-300 tracking-wider">
                Your Transformation Journey
              </span>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 leading-none">Overall Score</div>
                  <div className="text-sm sm:text-base font-mono font-black text-white">
                    {cumulativeScoreFormatted} <span className="text-xs text-slate-500">/ 10,000</span>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-black text-sm">
                  {finalGrade}
                </div>
              </div>
            </div>

            {/* 4 Dimension Progress Bars (Matches Panel 6) */}
            <div className="space-y-2">
              {/* Schedule / Timeline */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    Schedule / Timeline
                  </span>
                  <span className="text-white font-mono font-bold">
                    {scorecard.scheduleScore}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scorecard.scheduleScore}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-400"
                  />
                </div>
              </div>

              {/* Trust & Risk Management */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Trust & Risk Management
                  </span>
                  <span className="text-white font-mono font-bold">
                    {scorecard.riskScore}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scorecard.riskScore}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  />
                </div>
              </div>

              {/* Delivery Governance */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                    Delivery Governance
                  </span>
                  <span className="text-white font-mono font-bold">
                    {scorecard.governanceScore}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scorecard.governanceScore}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                  />
                </div>
              </div>

              {/* Team Efficiency & Velocity */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Team Efficiency & Velocity
                  </span>
                  <span className="text-white font-mono font-bold">
                    {scorecard.efficiencyScore}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scorecard.efficiencyScore}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Leadership Strengths & Growth Areas */}
            <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/20">
                <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider block mb-0.5">
                  Leadership Strengths:
                </span>
                <ul className="space-y-0.5 text-slate-300 text-[11px] leading-snug">
                  {scorecard.leadershipStrengths.slice(0, 2).map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-amber-500/20">
                <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider block mb-0.5">
                  Areas to Advance:
                </span>
                <ul className="space-y-0.5 text-slate-300 text-[11px] leading-snug">
                  {scorecard.areasToImprove.slice(0, 2).map((a, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS ROW (Matches Panel 6: 12 Chapters | 4 Major Releases | 80,000+ Users) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-900/60 border border-white/10 mb-3 shrink-0 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 px-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-black text-white font-mono">12 Chapters</div>
              <div className="text-[11px] text-slate-400">Completed & Mastered</div>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2.5 px-2 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-black text-white font-mono">4 Major Releases</div>
              <div className="text-[11px] text-slate-400">Successfully Delivered</div>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2.5 px-2 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-black text-white font-mono">80,000+ Users</div>
              <div className="text-[11px] text-slate-400">Enterprise Scale Impacted</div>
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS (Matches Panel 6: Review My Journey & Return to Brained OS Desktop) ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setIsJourneyDrawerOpen(true);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Review My Journey</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onReturnToDesktop();
            }}
            className="w-full sm:w-auto px-7 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <span>Return to Brained OS Desktop</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── CHAPTER-BY-CHAPTER SUMMARY DRAWER / MODAL ── */}
      {isJourneyDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden text-slate-100"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-base font-black text-white">
                  Chapter-by-Chapter Journey Summary
                </h3>
                <p className="text-xs text-slate-400">
                  Every milestone, decision, and leadership signal across all 12 chapters.
                </p>
              </div>
              <button
                onClick={() => setIsJourneyDrawerOpen(false)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 my-4 pr-1">
              {CHAPTER_JOURNEY_MILESTONES.map((m) => (
                <div
                  key={m.chapterId}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{m.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-sky-400">
                          Chapter {m.chapterId}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs font-bold text-white">{m.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{m.theme}</p>
                      <p className="text-xs text-slate-300 italic mt-1.5">{m.quote}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shrink-0">
                    Mastered
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
              <button
                onClick={() => setIsJourneyDrawerOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
              >
                Close Summary
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

