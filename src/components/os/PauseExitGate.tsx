/**
 * PauseExitGate — intercepts browser back, Escape, and OS close attempts.
 * Shows "Leave Transformation Room?" modal with pause option.
 * Calls GameContext pauseGame() when player chooses to exit.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, LogOut, AlertTriangle } from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface PauseExitGateProps {
  /** Called when player confirms they want to pause and exit */
  onConfirmExit: () => void;
}

export const PauseExitGate: React.FC<PauseExitGateProps> = ({ onConfirmExit }) => {
  const { state, pauseGame, resumeGame } = useGame();
  const [showModal, setShowModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Intercept browser back button
  useEffect(() => {
    if (state.phase === 'booting' || state.phase === 'report') return;

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      // Push state back so we stay on the page
      window.history.pushState(null, '', window.location.href);
      setShowModal(true);
    };

    // Push a dummy state so back button fires popstate
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [state.phase]);

  // Intercept page unload / tab close
  useEffect(() => {
    if (state.phase === 'booting' || state.phase === 'report') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.phase]);

  // Intercept Escape key
  useEffect(() => {
    if (state.phase === 'booting' || state.phase === 'report') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showModal) {
        setShowModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, showModal]);

  const handleContinue = () => {
    if (isPaused) {
      resumeGame();
      setIsPaused(false);
    }
    setShowModal(false);
  };

  const handlePauseAndExit = () => {
    pauseGame();
    setIsPaused(true);
    setShowModal(false);
    onConfirmExit();
  };

  if (!showModal && !isPaused) return null;

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="w-full max-w-md bg-slate-900/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Leave Transformation Room?</h2>
                  <p className="text-xs text-slate-400">Your simulation is currently running.</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-white/8 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Project Day</span>
                  <span className="text-white font-bold">Day {state.clock.day}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">In-Game Time</span>
                  <span className="text-white font-mono">
                    {String(state.clock.hour).padStart(2, '0')}:{String(state.clock.minute).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Board Deadline</span>
                  <span className={state.clock.day >= 12 ? 'text-red-400 font-bold' : 'text-white'}>
                    Day 14 — {14 - state.clock.day} day{14 - state.clock.day !== 1 ? 's' : ''} remaining
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Leaving will <strong className="text-amber-300">pause everything</strong> — the clock, incoming events, deadlines, and notifications. Your project state will be fully preserved.
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 space-y-3">
              <button
                onClick={handleContinue}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Continue Simulation</span>
              </button>

              <button
                onClick={handlePauseAndExit}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-white/8 hover:bg-white/12 border border-white/12 text-slate-300 font-semibold text-sm transition-all cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <LogOut className="w-4 h-4" />
                <span>Pause & Exit</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
