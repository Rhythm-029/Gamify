import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  ArrowRight,
} from 'lucide-react';
import { CHAPTER_JOURNEY_MILESTONES } from '../../data/chapter12Data';
import { sound } from '../onboarding/SoundEngine';
import type { Chapter12Scorecard } from '../../types/chapter12';

interface Chapter12CinematicModalProps {
  scorecard: Chapter12Scorecard;
  onProceedToReport: () => void;
}

export const Chapter12CinematicModal: React.FC<Chapter12CinematicModalProps> = ({
  scorecard,
  onProceedToReport,
}) => {
  // Phase sequence:
  // 1: montage (cycles through the 12 chapters)
  // 2: dark_fade (dark screen text reveal in sequence)
  // 3: achievement_reveal (gold emblem, grade, and button to report)
  const [phase, setPhase] = useState<'montage' | 'dark_fade' | 'achievement_reveal'>('montage');
  const [montageIndex, setMontageIndex] = useState(0);
  const [darkTextStep, setDarkTextStep] = useState(1);

  // Play ambient chords on mount
  useEffect(() => {
    sound.playSystemClearance();
  }, []);

  // Montage auto-cycle (or user can skip)
  useEffect(() => {
    if (phase !== 'montage') return;

    const timer = setInterval(() => {
      setMontageIndex((prev) => {
        if (prev < CHAPTER_JOURNEY_MILESTONES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setPhase('dark_fade');
          return prev;
        }
      });
    }, 1800);

    return () => clearInterval(timer);
  }, [phase]);

  // Dark fade step sequence
  useEffect(() => {
    if (phase !== 'dark_fade') return;

    const t1 = setTimeout(() => setDarkTextStep(2), 2200);
    const t2 = setTimeout(() => setDarkTextStep(3), 4200);
    const t3 = setTimeout(() => {
      sound.playSystemClearance();
      setPhase('achievement_reveal');
    }, 6500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [phase]);

  const currentMilestone = CHAPTER_JOURNEY_MILESTONES[montageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none overflow-hidden font-sans">
      {/* ── PHASE 1: 12-CHAPTER JOURNEY MONTAGE ── */}
      {phase === 'montage' && (
        <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-12 text-center overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-black to-slate-950 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Progress Tracker */}
          <div className="relative z-10 w-full max-w-2xl flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
              12 Chapters. One Transformation.
            </span>
            <div className="flex items-center gap-1.5">
              {CHAPTER_JOURNEY_MILESTONES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === montageIndex
                      ? 'w-6 bg-amber-400'
                      : i < montageIndex
                      ? 'w-2 bg-indigo-500/60'
                      : 'w-2 bg-slate-800'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setPhase('dark_fade');
              }}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5 cursor-pointer"
            >
              Skip Montage
            </button>
          </div>

          {/* Center Card Animated */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMilestone.chapterId}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative z-10 max-w-xl mx-auto flex flex-col items-center p-8 rounded-3xl bg-slate-900/80 border border-indigo-500/30 shadow-2xl backdrop-blur-xl"
            >
              <div className="text-4xl mb-3">{currentMilestone.icon}</div>
              <span className="text-xs font-mono font-bold uppercase text-indigo-400 tracking-wider">
                Chapter {currentMilestone.chapterId} · {currentMilestone.theme}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                {currentMilestone.title}
              </h2>
              <blockquote className="text-sm sm:text-base italic text-slate-300 mt-4 text-center max-w-md leading-relaxed">
                {currentMilestone.quote}
              </blockquote>
              <span className="text-xs font-bold text-amber-400 mt-3 font-mono">
                — {currentMilestone.speaker}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Prompt */}
          <div className="relative z-10 text-xs text-slate-500 font-mono">
            {montageIndex + 1} / 12 Milestones Reviewed
          </div>
        </div>
      )}

      {/* ── PHASE 2: DARK SCREEN TEXT REVEAL ── */}
      {phase === 'dark_fade' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-black">
          <AnimatePresence>
            {darkTextStep >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="text-xs sm:text-sm font-mono tracking-[0.3em] uppercase text-indigo-400 font-black mb-6"
              >
                PROJECT AMIGO — COMPLETE
              </motion.div>
            )}

            {darkTextStep >= 2 && (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4"
              >
                You didn't just deliver a project.
              </motion.h1>
            )}

            {darkTextStep >= 3 && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-md"
              >
                You transformed an enterprise.
              </motion.h2>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── PHASE 3: FINAL ACHIEVEMENT REVEAL ── */}
      {phase === 'achievement_reveal' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative w-full max-w-2xl p-8 sm:p-12 mx-4 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/50 shadow-[0_0_80px_rgba(245,158,11,0.25)] flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Subtle Golden Particles / Glow Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Premium Gold Achievement Emblem */}
          <div className="relative mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-1 shadow-2xl shadow-amber-500/30 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center p-2 text-center">
                <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-amber-400 drop-shadow-md" />
                <span className="text-[10px] font-black font-mono text-amber-300 mt-1">
                  GRADE {scorecard.finalGrade}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
              ★
            </div>
          </div>

          <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-extrabold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
            THE ULTIMATE ACHIEVEMENT
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
            MASTER ENTERPRISE TRANSFORMATION DIRECTOR
          </h2>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-black text-amber-400 font-mono">
              GRADE {scorecard.finalGrade}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-300">
              12 Chapters. One Transformation.
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 mt-4 max-w-lg leading-relaxed">
            {scorecard.outcomeText}
          </p>

          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onProceedToReport();
              }}
              className="px-8 py-3 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <span>View Transformation Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
