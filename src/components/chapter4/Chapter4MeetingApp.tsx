import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Clock,
  Briefcase,
} from 'lucide-react';
import type { Chapter4State } from '../../types/chapter4';
import { sound } from '../onboarding/SoundEngine';

interface Chapter4MeetingAppProps {
  chapter4State: Chapter4State;
  onUpdateState: (updater: Partial<Chapter4State> | ((prev: Chapter4State) => Chapter4State)) => void;
  onOpenStudio: () => void;
  onOpenScorecard: () => void;
}

export const Chapter4MeetingApp: React.FC<Chapter4MeetingAppProps> = ({
  chapter4State,
  onUpdateState,
  onOpenStudio,
  onOpenScorecard,
}) => {
  // Call stages:
  // 'connecting' -> 'sophia_1' -> 'sophia_2' -> 'aarav_1' -> 'sophia_3' -> 'daniel_1' -> 'daniel_2' -> 'aarav_2' -> 'aarav_turn_to_player' -> 'studio_unlocked'
  // Or if already submitted: 'outcome_reaction'
  const [stage, setStage] = useState<
    | 'connecting'
    | 'sophia_1'
    | 'sophia_2'
    | 'aarav_1'
    | 'sophia_3'
    | 'daniel_1'
    | 'daniel_2'
    | 'aarav_2'
    | 'aarav_turn_to_player'
    | 'studio_unlocked'
    | 'outcome_reaction'
  >(() => {
    if (chapter4State.completed || chapter4State.submitted) return 'outcome_reaction';
    if (chapter4State.studioAccessGranted) return 'studio_unlocked';
    return 'connecting';
  });

  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState<'sophia' | 'aarav' | 'daniel' | 'player' | null>('sophia');
  const [subtitleText, setSubtitleText] = useState<string>('');

  // ── Meeting Sequence ──
  useEffect(() => {
    if (stage === 'connecting') {
      sound.playMessagePing();
      const timer = setTimeout(() => {
        setStage('sophia_1');
        setActiveSpeaker('sophia');
        setSubtitleText(
          "Thanks for joining. The regional HR heads have requested a Dynamic Bonus Calculator inside the Appraisal module. They want managers to estimate proposed bonuses using appraisal ratings and regional bonus rules."
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Stage transitions with timed natural pauses
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (stage === 'sophia_1') {
      timer = setTimeout(() => {
        setStage('sophia_2');
        setActiveSpeaker('sophia');
        setSubtitleText(
          "They believe it will make the appraisal process much more useful. Can we include it in the current release? They are hoping it will be ready alongside the other Phase 1 features."
        );
      }, 5200);
    } else if (stage === 'sophia_2') {
      timer = setTimeout(() => {
        setStage('aarav_1');
        setActiveSpeaker('aarav');
        setSubtitleText(
          "It's a valuable request, but we're already working against the 90-day deadline. We need to understand what this adds before promising anything."
        );
      }, 5000);
    } else if (stage === 'aarav_1') {
      timer = setTimeout(() => {
        setStage('sophia_3');
        setActiveSpeaker('sophia');
        setSubtitleText(
          "Understood, but the regional teams are expecting an answer. I don't want us to dismiss the request without evaluating it properly."
        );
      }, 4800);
    } else if (stage === 'sophia_3') {
      timer = setTimeout(() => {
        setStage('daniel_1');
        setActiveSpeaker('daniel');
        setSubtitleText(
          "There's one thing we need to clarify first. The calculator depends on regional bonus rules, and we haven't confirmed how those rules will be provided or validated. We also need to check whether the feature requires a new payroll integration."
        );
      }, 4600);
    } else if (stage === 'daniel_1') {
      timer = setTimeout(() => {
        setStage('daniel_2');
        setActiveSpeaker('daniel');
        setSubtitleText(
          "I can't give you a reliable estimate until we understand those dependencies. Calling it a two-day feature right now would be a guess."
        );
      }, 5400);
    } else if (stage === 'daniel_2') {
      timer = setTimeout(() => {
        setStage('aarav_2');
        setActiveSpeaker('aarav');
        setSubtitleText(
          "Exactly. We need to protect the existing release while giving Sophia a clear answer."
        );
      }, 4400);
    } else if (stage === 'aarav_2') {
      timer = setTimeout(() => {
        setStage('aarav_turn_to_player');
        setActiveSpeaker('aarav');
        setSubtitleText(
          "Let's handle this properly. Open Ideate & Impact Studio. Review the request, check its impact, and prepare a release recommendation. We need to explain what we can commit to, what needs investigation, and what requires approval."
        );
        onUpdateState({
          studioAccessGranted: true,
          meetingStatus: 'studio_unlocked',
        });
      }, 3800);
    }

    return () => clearTimeout(timer);
  }, [stage, onUpdateState]);

  // When stage reaches studio_unlocked
  const handleOpenStudioApp = () => {
    sound.playClick();
    onUpdateState({
      studioAccessGranted: true,
      meetingStatus: 'studio_unlocked',
    });
    onOpenStudio();
  };

  // Outcome reaction handling
  const scorecard = chapter4State.scorecard;
  const isStrong = scorecard?.outcomeType === 'strong';
  const isMixed = scorecard?.outcomeType === 'mixed';
  const isWeak = scorecard?.outcomeType === 'weak';

  return (
    <div className="flex-1 h-full flex flex-col bg-[#111318] text-slate-100 font-sans select-none overflow-hidden relative">
      {/* ── TOP TEAMS MEETING HEADER BAR ── */}
      <div className="h-12 bg-[#1f2129] border-b border-white/10 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs sm:text-sm text-white">Project Amigo | Scope & Change Request Discussion</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                Teams Live
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
              <span>Encrypted Banking Channel</span>
              <span>•</span>
              <span>4 Participants</span>
            </div>
          </div>
        </div>

        {/* Quick Studio Switcher */}
        {chapter4State.studioAccessGranted && (
          <button
            onClick={onOpenStudio}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm hover:text-white"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ideate & Impact Studio</span>
          </button>
        )}
      </div>

      {/* ── MAIN VIDEO GRID ── */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-3 min-h-0 bg-[#0d0f14]">
        {/* SOPHIA'S VIDEO TILE */}
        <div
          className={`relative rounded-2xl overflow-hidden bg-slate-900 border transition-all flex flex-col justify-end p-3 ${
            activeSpeaker === 'sophia'
              ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-2 ring-purple-500/50'
              : 'border-slate-800'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
          <img
            src="/character/Sophia_bennett/sophiaDP.png"
            alt="Sophia Bennett"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-85"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wide">Sophia Bennett</span>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-950/70 px-1.5 py-0.5 rounded border border-purple-500/30">
                Head of HR · Client
              </span>
            </div>
            {activeSpeaker === 'sophia' && (
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
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
            alt="Daniel Brooks"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-85"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wide">Daniel Brooks</span>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/30">
                Dev & Operations
              </span>
            </div>
            {activeSpeaker === 'daniel' && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
        </div>

        {/* PLAYER'S TILE */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-800 flex flex-col justify-between p-3.5">
          <div className="flex items-center justify-between z-20">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-white">You (Project Manager)</span>
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
              Assigned to evaluate CR-017 and prepare release recommendation
            </p>
          </div>

          <div className="text-[10px] font-mono text-slate-500 z-20">Audio Connected · Camera Standby</div>
        </div>
      </div>

      {/* ── SUBTITLES / DIALOGUE BANNER (Enhanced readability) ── */}
      <div className="bg-[#181a20] border-t border-white/10 px-6 py-4 flex flex-col justify-center min-h-[96px] z-20">
        <AnimatePresence mode="wait">
          {stage === 'connecting' && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-3 text-slate-400"
            >
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Connecting to Sophia Bennett, Aarav Kapoor, Daniel Brooks...</span>
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
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-purple-400">
                  {activeSpeaker === 'sophia' && 'SOPHIA — Head of HR'}
                  {activeSpeaker === 'aarav' && 'AARAV — Project Manager'}
                  {activeSpeaker === 'daniel' && 'DANIEL — Developer and Operations'}
                </span>
                <span className="text-[10px] text-slate-500">Live Captions</span>
              </div>
              <p className="text-slate-100 font-medium text-sm sm:text-[15.5px] leading-relaxed">
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
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  ASSESSMENT COMPLETED · TEAM REACTION
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
                <div className="space-y-2">
                  <p className="text-slate-100 text-sm sm:text-[15.5px] leading-relaxed">
                    <strong className="text-sky-300">AARAV:</strong> "Good call. We've acknowledged the business value without making a delivery promise we cannot support. Daniel can validate the technical dependencies, and we'll confirm the release decision once the impact assessment is complete."
                  </p>
                  <p className="text-slate-200 text-sm sm:text-[15.5px] leading-relaxed">
                    <strong className="text-purple-300">SOPHIA:</strong> "That works. Please keep the request moving and let me know what the team needs from HR to complete the assessment."
                  </p>
                </div>
              )}

              {isMixed && (
                <div className="space-y-2">
                  <p className="text-slate-100 text-sm sm:text-[15.5px] leading-relaxed">
                    <strong className="text-sky-300">AARAV:</strong> "We've made a start, but a few important questions remain unresolved. Before we communicate a firm release commitment, let's close the gaps in the technical estimate and approval requirements."
                  </p>
                </div>
              )}

              {isWeak && (
                <div className="space-y-2">
                  <p className="text-slate-100 text-sm sm:text-[15.5px] leading-relaxed">
                    <strong className="text-emerald-300">DANIEL:</strong> "I've reviewed the proposed plan. We still don't have a confirmed estimate or validated payroll and regional-rule dependencies. I can't give the team a reliable implementation commitment yet."
                  </p>
                  <p className="text-slate-200 text-sm sm:text-[15.5px] leading-relaxed">
                    <strong className="text-sky-300">AARAV:</strong> "We need to revisit the assessment before communicating a firm delivery date. Let's make sure the release decision is supported by the technical facts."
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

        {/* Action Button: Open Ideate & Impact Studio */}
        {(stage === 'aarav_turn_to_player' || stage === 'studio_unlocked') && !chapter4State.submitted && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleOpenStudioApp}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(99,102,241,0.4)] flex items-center space-x-2 cursor-pointer transition-all border border-indigo-400/40"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Open Ideate & Impact Studio</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}

        {chapter4State.submitted && (
          <button
            onClick={onOpenScorecard}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm tracking-wide flex items-center space-x-2 cursor-pointer transition-all shadow-md"
          >
            <span>View Scorecard & Takeaways</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center space-x-3 text-slate-400 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Sprint 1 · Day 4</span>
        </div>
      </div>
    </div>
  );
};
