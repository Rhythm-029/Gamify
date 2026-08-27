import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, ShieldAlert, Play, AlertOctagon, Terminal } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { BrainedLogoIcon } from '../common/BrainedLogoIcon';

interface FullscreenGateProps {
  children: React.ReactNode;
  onApplyPenalty?: (trustDelta: number, xpDelta: number) => void;
}

export const FullscreenGate: React.FC<FullscreenGateProps> = ({ children, onApplyPenalty }) => {
  const { pauseGame, resumeGame, addSignal, state } = useGame();
  
  const [hasEnteredOnce, setHasEnteredOnce] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [penaltyCount, setPenaltyCount] = useState(0);

  // Check fullscreen state change
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = !!document.fullscreenElement;
      setIsFullscreen(isFS);

      if (!isFS && hasEnteredOnce && state.phase !== 'report' && state.phase !== 'evaluating') {
        pauseGame();
        setShowPenaltyModal(true);
        applyInterruptionPenalty();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [hasEnteredOnce, state.phase]); // eslint-disable-line

  // Intercept window blur / tab switch / visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasEnteredOnce && state.phase !== 'report' && state.phase !== 'evaluating') {
        pauseGame();
        setShowPenaltyModal(true);
        applyInterruptionPenalty();
      }
    };

    const handleBlur = () => {
      if (hasEnteredOnce && state.phase !== 'report' && state.phase !== 'evaluating') {
        pauseGame();
        setShowPenaltyModal(true);
        applyInterruptionPenalty();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [hasEnteredOnce, state.phase]); // eslint-disable-line

  const applyInterruptionPenalty = () => {
    setPenaltyCount((prev) => prev + 1);
    if (onApplyPenalty) {
      onApplyPenalty(-10, 0);
    }
    addSignal('delivery_management', 'Workstation focus lost — left fullscreen or switched windows (-10 Trust)', -10);
  };

  const handleEnterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      setHasEnteredOnce(true);
      if (showPenaltyModal) {
        setShowPenaltyModal(false);
        resumeGame();
      }
    } catch (err) {
      console.warn('Fullscreen request failed or was denied:', err);
      // Fallback: allow progress if browser blocks native fullscreen API
      setIsFullscreen(true);
      setHasEnteredOnce(true);
      if (showPenaltyModal) {
        setShowPenaltyModal(false);
        resumeGame();
      }
    }
  };

  return (
    <>
      {/* PRE-BOOT FULLSCREEN ENTRY PROMPT (Must be clicked before entering OS!) */}
      {!hasEnteredOnce && (
        <div className="fixed inset-0 z-[500] bg-[#050711] text-white flex flex-col items-center justify-center p-6 select-none font-sans overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-900/20 via-purple-900/20 to-pink-900/20 pointer-events-none" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="max-w-md w-full bg-slate-900/90 border border-sky-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl text-center space-y-6 relative ring-1 ring-sky-500/20"
          >
            {/* Centered Brained Logo */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-pink-500 p-4 mx-auto shadow-2xl border border-white/20 flex items-center justify-center animate-pulse">
              <BrainedLogoIcon className="w-full h-full object-contain filter drop-shadow-xl" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-mono font-bold border border-sky-500/40 uppercase tracking-widest">
                Enterprise Workstation Environment
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Fullscreen Mode Required
              </h1>
              <p className="text-slate-300 text-xs leading-relaxed">
                To guarantee telemetry accuracy, security protocol compliance, and an immersive workstation simulation, <strong className="text-white">Brained OS must be run in Fullscreen mode</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-left space-y-2 text-xs font-mono">
              <div className="flex items-center space-x-2 text-sky-400 font-bold">
                <Terminal className="w-4 h-4" />
                <span>Simulation Compliance Rules:</span>
              </div>
              <ul className="text-slate-300 space-y-1 text-[11px] list-disc list-inside">
                <li>Fullscreen mode enforced throughout play</li>
                <li>Switching windows or leaving fullscreen pauses the game</li>
                <li>Workstation focus drops apply <span className="text-red-400 font-bold">-10 Trust Score</span> penalty</li>
              </ul>
            </div>

            <button
              onClick={handleEnterFullscreen}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-pink-600 hover:from-sky-400 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-sky-500/30 border border-white/25 flex items-center justify-center space-x-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Enter Fullscreen & Start Simulation</span>
            </button>
          </motion.div>
        </div>
      )}

      {/* FULLSCREEN PENALTY WARNING OVERLAY (Appears if user leaves fullscreen / switches screen!) */}
      <AnimatePresence>
        {hasEnteredOnce && (showPenaltyModal || (!isFullscreen && state.phase !== 'report')) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 select-none font-sans"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              className="max-w-lg w-full bg-slate-900 border-2 border-red-500/60 rounded-3xl p-7 shadow-2xl space-y-6 relative ring-4 ring-red-500/20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400 shadow-xl">
                <AlertOctagon className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-mono font-bold border border-red-500/40 uppercase">
                    ⚠️ Workstation Focus Lost • Game Paused
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Fullscreen Mode Interrupted
                </h2>
                <p className="text-slate-300 text-xs leading-relaxed">
                  You left fullscreen or switched windows during an active enterprise simulation session. Workstation telemetry has logged this distraction event.
                </p>
              </div>

              {/* Penalty Remark Card */}
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-red-400">
                  <span className="flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Telemetry Penalty Applied</span>
                  </span>
                  <span className="font-mono text-xs bg-red-500/30 px-2 py-0.5 rounded border border-red-500/40">
                    -10 Trust Score
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Negative Remark: <strong className="text-red-300">"Consultant abandoned active workstation telemetry. Trust score deducted."</strong> ({penaltyCount} infraction{penaltyCount > 1 ? 's' : ''} recorded).
                </p>
              </div>

              <button
                onClick={handleEnterFullscreen}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-pink-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-red-500/30 border border-white/20 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Return to Fullscreen & Resume Game</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main OS Canvas */}
      {children}
    </>
  );
};
