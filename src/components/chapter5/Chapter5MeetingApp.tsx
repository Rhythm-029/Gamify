import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import type { Chapter5State } from '../../types/chapter5';
import { sound } from '../onboarding/SoundEngine';

interface Chapter5MeetingAppProps {
  chapter5State: Chapter5State;
  onUpdateState: (updater: Partial<Chapter5State> | ((prev: Chapter5State) => Chapter5State)) => void;
  onOpenBoard: () => void;
  onOpenScorecard: () => void;
}

export const Chapter5MeetingApp: React.FC<Chapter5MeetingAppProps> = ({
  chapter5State,
  onUpdateState,
  onOpenBoard,
  onOpenScorecard,
}) => {
  // Call stages:
  // 'connecting' -> 'daniel_1' -> 'aarav_1' -> 'marcus_1' -> 'daniel_2' -> 'transition_to_board'
  // Or if already submitted: 'outcome_reaction'
  const [stage, setStage] = useState<
    | 'connecting'
    | 'daniel_1'
    | 'aarav_1'
    | 'marcus_1'
    | 'daniel_2'
    | 'transition_to_board'
    | 'outcome_reaction'
  >(() => {
    if (chapter5State.completed || chapter5State.submitted) return 'outcome_reaction';
    if (chapter5State.meetingCompleted || chapter5State.boardOpened) return 'transition_to_board';
    return 'connecting';
  });

  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState<'daniel' | 'aarav' | 'marcus' | 'player' | null>('daniel');
  const [subtitleText, setSubtitleText] = useState<string>('');

  // Synchronize stage if submission state updates
  useEffect(() => {
    if (chapter5State.completed || chapter5State.submitted) {
      setStage('outcome_reaction');
    }
  }, [chapter5State.completed, chapter5State.submitted]);

  // ── Meeting Sequence ──
  useEffect(() => {
    if (stage === 'connecting') {
      sound.playMessagePing();
      const timer = setTimeout(() => {
        setStage('daniel_1');
        setActiveSpeaker('daniel');
        setSubtitleText(
          "Good news! The Phase 1 build is deployed to staging. Appraisals, Attendance and Leave have passed our initial functional tests. The integration team has also confirmed that the approved gateway connection is working."
        );
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Stage transitions with natural pacing
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (stage === 'daniel_1') {
      timer = setTimeout(() => {
        setStage('aarav_1');
        setActiveSpeaker('aarav');
        setSubtitleText(
          "Great progress. But before we release anything, I want to know whether we're ready for actual users. Functional tests passing doesn't necessarily mean production is safe."
        );
      }, 5500);
    } else if (stage === 'aarav_1') {
      timer = setTimeout(() => {
        setStage('marcus_1');
        setActiveSpeaker('marcus');
        setSubtitleText(
          "Exactly. We're expecting around 80,000 employees across the bank. We cannot simply open the system to everyone and hope it holds up. We need a controlled pilot first."
        );
      }, 5200);
    } else if (stage === 'marcus_1') {
      timer = setTimeout(() => {
        setStage('daniel_2');
        setActiveSpeaker('daniel');
        setSubtitleText(
          "I've prepared the release checklist. There are a few things we need to verify before we proceed."
        );
      }, 5000);
    } else if (stage === 'daniel_2') {
      timer = setTimeout(() => {
        setStage('transition_to_board');
        setActiveSpeaker(null);
        setSubtitleText(
          "PROJECT AMIGO — RELEASE READINESS CHECK REQUIRED. Review the readiness board to identify blockers and establish the controlled rollout plan."
        );
        onUpdateState({
          meetingCompleted: true,
        });
      }, 4200);
    }

    return () => clearTimeout(timer);
  }, [stage, onUpdateState]);

  const handleOpenBoardClick = () => {
    sound.playClick();
    onUpdateState({
      meetingCompleted: true,
      boardOpened: true,
    });
    onOpenBoard();
  };

  const scorecard = chapter5State.scorecard;
  const isStrong = scorecard?.outcomeType === 'strong';
  const isIncomplete = scorecard?.outcomeType === 'incomplete';

  return (
    <div className="flex-1 h-full flex flex-col bg-[#111318] text-slate-100 font-sans select-none overflow-hidden relative">
      {/* ── TOP TEAMS MEETING HEADER BAR ── */}
      <div className="h-12 bg-[#1f2129] border-b border-white/10 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs sm:text-sm text-white">
                Project Amigo — Sprint 1 Release Check
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                Teams Live
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
              <span>Production Readiness Review</span>
              <span>•</span>
              <span>4 Participants</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>80,000 Employees Scope</span>
          </span>
        </div>
      </div>

      {/* ── 4 PARTICIPANT VIDEO TILES ── */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-3 min-h-0 overflow-hidden">
        {/* DANIEL'S VIDEO TILE */}
        <div
          className={`relative rounded-2xl overflow-hidden bg-slate-900 border transition-all flex flex-col justify-end p-3 ${
            activeSpeaker === 'daniel'
              ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/50'
              : 'border-slate-800'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
          <img
            src="/character/Daniel_Brooks/DanielDP.png"
            alt="Daniel Kapoor"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-85"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wide">Daniel Kapoor</span>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/30">
                Developer Lead
              </span>
            </div>
            {activeSpeaker === 'daniel' && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
        </div>

        {/* AARAV'S VIDEO TILE */}
        <div
          className={`relative rounded-2xl overflow-hidden bg-slate-900 border transition-all flex flex-col justify-end p-3 ${
            activeSpeaker === 'aarav'
              ? 'border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.3)] ring-2 ring-sky-500/50'
              : 'border-slate-800'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
          <img
            src="/character/AaravDP.png"
            alt="Aarav Kapoor"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-85"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wide">Aarav Kapoor</span>
              <span className="text-[10px] font-mono text-sky-300 bg-sky-950/70 px-1.5 py-0.5 rounded border border-sky-500/30">
                Project Manager
              </span>
            </div>
            {activeSpeaker === 'aarav' && (
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
            )}
          </div>
        </div>

        {/* MARCUS'S VIDEO TILE */}
        <div
          className={`relative rounded-2xl overflow-hidden bg-slate-900 border transition-all flex flex-col justify-end p-3 ${
            activeSpeaker === 'marcus'
              ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-2 ring-amber-500/50'
              : 'border-slate-800'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
          <img
            src="/character/Marcus_Vance/marcusDP.png"
            alt="Marcus Reed"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-85"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wide">Marcus Reed</span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-500/30">
                Chief Technology Officer
              </span>
            </div>
            {activeSpeaker === 'marcus' && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
        </div>

        {/* PLAYER'S TILE */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-800 flex flex-col justify-between p-3.5">
          <div className="flex items-center justify-between z-20">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <span className="text-xs font-bold text-white">You (Release Coordinator)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              Lead Coordinator
            </span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-2 z-20 my-auto text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-base">
              PM
            </div>
            <p className="text-xs text-slate-300 max-w-[200px]">
              Assigned to evaluate Phase 1 evidence and prepare Controlled Rollout Plan
            </p>
          </div>

          <div className="text-[10px] font-mono text-slate-500 z-20">Audio Connected · Camera Standby</div>
        </div>
      </div>

      {/* ── SUBTITLES / DIALOGUE BANNER ── */}
      <div className="bg-[#181a20] border-t border-white/10 px-6 py-4 flex flex-col justify-center min-h-[105px] z-20">
        <AnimatePresence mode="wait">
          {stage === 'connecting' && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-3 text-slate-400"
            >
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Connecting to Daniel Kapoor, Aarav Kapoor, Marcus Reed...</span>
            </motion.div>
          )}

          {stage !== 'connecting' && stage !== 'outcome_reaction' && (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="space-y-1.5"
            >
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  {activeSpeaker === 'daniel' && 'DANIEL KAPOOR — Developer'}
                  {activeSpeaker === 'aarav' && 'AARAV KAPOOR — Project Manager'}
                  {activeSpeaker === 'marcus' && 'MARCUS REED — CTO'}
                  {activeSpeaker === null && 'SYSTEM TRANSITION'}
                </span>
                <span className="text-[10px] text-slate-500">Live Captions</span>
              </div>
              <p className="text-slate-100 font-medium text-sm sm:text-[15px] leading-relaxed">
                "{subtitleText}"
              </p>
            </motion.div>
          )}

          {/* Outcome reaction after submission */}
          {stage === 'outcome_reaction' && (
            <motion.div
              key="outcome"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PROJECT AMIGO — PILOT PLAN SUBMITTED</span>
                </span>
                <button
                  onClick={onOpenScorecard}
                  className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <span>View Chapter Insights</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {isStrong && (
                <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
                  <p className="text-slate-100">
                    <strong className="text-sky-300">AARAV:</strong> "Good work. You've separated release prerequisites from pilot activities and established clear conditions for expansion. I'll take the readiness evidence to the release review. We won't authorize a wider rollout until the required controls and approvals are in place."
                  </p>
                  <p className="text-slate-200">
                    <strong className="text-amber-300">MARCUS:</strong> "That's the approach I wanted. Start with the controlled group, measure the results, and let the evidence determine the next step."
                  </p>
                </div>
              )}

              {!isStrong && !isIncomplete && (
                <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
                  <p className="text-slate-100">
                    <strong className="text-sky-300">AARAV:</strong> "The pilot framework is defined, but a few operational safeguards need tightening before the release committee signs off. Let's make sure load testing and rollback verifications are complete."
                  </p>
                  <p className="text-slate-200">
                    <strong className="text-amber-300">MARCUS:</strong> "Controlled group rollout is sensible, but ensure telemetry alerts page on-call engineers automatically."
                  </p>
                </div>
              )}

              {isIncomplete && (
                <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
                  <p className="text-slate-100">
                    <strong className="text-emerald-300">DANIEL:</strong> "The rollout plan is almost there, but we still need an approved rollback procedure before we can authorize the pilot. Could you review the readiness board once more?"
                  </p>
                  <p className="text-slate-200">
                    <strong className="text-amber-300">MARCUS:</strong> "Before we authorize a pilot, show me the evidence that supports the decision. I need clear acceptance criteria, an approved access path and a recovery plan. We shouldn't confuse progress with readiness."
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM CALL CONTROL BAR & ACTION BUTTON ── */}
      <div className="h-16 bg-[#1f2129] border-t border-white/10 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMicMuted(!micMuted)}
            className={`p-2.5 rounded-full transition-all cursor-pointer ${
              micMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setCameraOff(!cameraOff)}
            className={`p-2.5 rounded-full transition-all cursor-pointer ${
              cameraOff ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>
        </div>

        {/* Action Button: Open Release Readiness Board */}
        {(stage === 'transition_to_board' || chapter5State.meetingCompleted) && !chapter5State.submitted && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleOpenBoardClick}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center space-x-2 cursor-pointer transition-all border border-emerald-400/40"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Open Release Readiness Board</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}

        {chapter5State.submitted && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenBoard}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              View Readiness Board
            </button>
            <button
              onClick={onOpenScorecard}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm tracking-wide flex items-center space-x-2 cursor-pointer transition-all shadow-md"
            >
              <span>View Scorecard & Takeaways</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center space-x-3 text-slate-400 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Sprint 1 · Release Check</span>
        </div>
      </div>
    </div>
  );
};
