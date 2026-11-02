import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ArrowRight,
  Clock,
  CheckCircle2,
  Users,
  TrendingUp,
  BarChart3,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Volume2,
  Sparkles,
  MessageSquare,
  FileSpreadsheet,
} from 'lucide-react';
import type { Chapter9State } from '../../types/chapter9';
import {
  CHAPTER9_TITLE,
  CHAPTER9_SUBTITLE,
  CHAPTER9_PROJECT_NAME,
  CHAPTER9_LOCATION,
  CHAPTER9_CHARACTERS,
  ROI_TELEMETRY,
} from '../../data/chapter9Data';
import { sound } from '../onboarding/SoundEngine';

interface Chapter9MeetingAppProps {
  chapter9State: Chapter9State;
  onUpdateState: (updater: Partial<Chapter9State> | ((prev: Chapter9State) => Chapter9State)) => void;
  onCompleteMeeting?: () => void;
  onOpenBoardroom?: () => void;
  onOpenScorecard?: () => void;
}

export const Chapter9MeetingApp: React.FC<Chapter9MeetingAppProps> = ({
  chapter9State,
  onUpdateState,
  onCompleteMeeting,
  onOpenBoardroom,
  onOpenScorecard,
}) => {
  // Conversational meeting stages:
  // 1. 'sophia_welcome': Sophia introduces the high-stakes Steering Committee context
  // 2. 'martha_telemetry': Martha presents verified 42% drop and 15,000 hrs saved
  // 3. 'jane_intervention': Player interactive dialogue choice (Senior PM monetizing hours vs basic graphs)
  // 4. 'sophia_guidance': Sophia's corporate reaction and financial mandate
  // 5. 'assignment_handoff': Handoff to Executive ROI Dashboard on the desktop
  const [meetingStage, setMeetingStage] = useState<
    'sophia_welcome' | 'martha_telemetry' | 'jane_intervention' | 'sophia_guidance' | 'assignment_handoff'
  >(() => {
    if (chapter9State.meetingCompleted || chapter9State.boardroomRoomOpened) return 'assignment_handoff';
    return 'sophia_welcome';
  });

  const [playerDialogueChoice, setPlayerDialogueChoice] = useState<'monetize_hours' | 'basic_graphs' | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<'sophia' | 'martha' | 'jane'>('sophia');

  const streamRef = useRef<MediaStream | null>(null);

  // Request or stop webcam video if available
  useEffect(() => {
    if (!cameraOff) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          streamRef.current = stream;
        })
        .catch(() => {
          setCameraOff(true);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraOff]);

  // Sync speaker with stage
  useEffect(() => {
    if (meetingStage === 'sophia_welcome' || meetingStage === 'sophia_guidance') {
      setActiveSpeaker('sophia');
    } else if (meetingStage === 'martha_telemetry') {
      setActiveSpeaker('martha');
    } else if (meetingStage === 'jane_intervention') {
      setActiveSpeaker('jane');
    } else {
      setActiveSpeaker('sophia');
    }
  }, [meetingStage]);

  const speakDialogue = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSophiaWelcomeNext = () => {
    sound.playMessagePing();
    setMeetingStage('martha_telemetry');
  };

  const handleMarthaTelemetryNext = () => {
    sound.playMessagePing();
    setMeetingStage('jane_intervention');
  };

  const handleSelectPlayerDialogue = (choice: 'monetize_hours' | 'basic_graphs') => {
    setPlayerDialogueChoice(choice);
    sound.playMessagePing();
    setMeetingStage('sophia_guidance');
  };

  const handleSophiaGuidanceNext = () => {
    sound.playMessagePing();
    setMeetingStage('assignment_handoff');
  };

  const handleLaunchDashboard = () => {
    sound.playSystemClearance();
    onUpdateState({
      meetingCompleted: true,
      callCompleted: true,
      boardroomRoomOpened: true,
      telemetryReviewed: true,
      currentStage: 'roi_preparation',
      timelineTimestamp: '23:45',
    });

    if (onOpenBoardroom) {
      onOpenBoardroom();
    } else if (onCompleteMeeting) {
      onCompleteMeeting();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#070b14] text-slate-100 font-sans select-none overflow-hidden">
      {/* ── TOP HEADER (TEAMS EXECUTIVE BRIEFING BAR) ── */}
      <header className="px-5 py-3 border-b border-slate-800 bg-[#0c1220]/90 backdrop-blur flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-bold">
                EXECUTIVE LEADERSHIP PHASE · SCENE 9.1
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                TEAMS EXECUTIVE SYNC
              </span>
            </div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{CHAPTER9_LOCATION}</span>
              <span className="text-slate-400 text-xs font-normal">
                · {CHAPTER9_PROJECT_NAME} Pre-Boardroom Briefing
              </span>
            </h1>
          </div>
        </div>

        {/* Status Pills & Action Button */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px]">23:00–23:45 Pre-Boardroom Sync</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] font-bold">EXECUTIVE VIDEO CALL ACTIVE</span>
          </div>

          {onOpenBoardroom && (chapter9State.meetingCompleted || meetingStage === 'assignment_handoff') && (
            <button
              onClick={handleLaunchDashboard}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center space-x-1.5 cursor-pointer border border-emerald-400/40 transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Enter Executive ROI Dashboard</span>
            </button>
          )}

          {onOpenScorecard && chapter9State.completed && (
            <button
              onClick={onOpenScorecard}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 cursor-pointer border border-slate-700 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scorecard</span>
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 flex flex-col justify-between max-w-6xl mx-auto w-full">
        {/* ── PARTICIPANTS GALLERY (SOPHIA BENNETT, MARTHA, JANE) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 shrink-0">
          {/* Sophia Bennett (Head of HR & Executive Sponsor) */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              activeSpeaker === 'sophia'
                ? 'bg-[#151c28] border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
                : 'bg-[#0f172a]/70 border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={CHAPTER9_CHARACTERS.sophia.avatar}
                  alt={CHAPTER9_CHARACTERS.sophia.name}
                  className="w-12 h-12 rounded-xl object-cover border border-amber-500/50 shadow"
                />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">
                    {CHAPTER9_CHARACTERS.sophia.name}
                  </span>
                  {activeSpeaker === 'sophia' && (
                    <span className="text-amber-400 text-[10px] font-mono flex items-center gap-1 font-bold">
                      <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-amber-300/80 font-mono uppercase tracking-wider">
                  Head of HR · Executive Sponsor
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Executive Steering Committee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Martha (Monitoring & Ops Telemetry Specialist) */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              activeSpeaker === 'martha'
                ? 'bg-[#101f28] border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                : 'bg-[#0f172a]/70 border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={CHAPTER9_CHARACTERS.martha.avatar}
                  alt={CHAPTER9_CHARACTERS.martha.name}
                  className="w-12 h-12 rounded-xl object-cover border border-cyan-500/50 shadow"
                />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">
                    {CHAPTER9_CHARACTERS.martha.name}
                  </span>
                  {activeSpeaker === 'martha' && (
                    <span className="text-cyan-400 text-[10px] font-mono flex items-center gap-1 font-bold">
                      <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-cyan-300/80 font-mono uppercase tracking-wider">
                  Monitoring & Ops Telemetry
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Production Telemetry Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Player Feed (Lead PM / Transformation Consultant) */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              activeSpeaker === 'jane'
                ? 'bg-[#181a30] border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/50'
                : 'bg-[#0f172a]/70 border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center font-bold text-white text-sm shadow-md border border-indigo-400/40 font-mono">
                  YOU
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">
                    Player (You)
                  </span>
                  {activeSpeaker === 'jane' && (
                    <span className="text-indigo-400 text-[10px] font-mono flex items-center gap-1 font-bold">
                      <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-indigo-300/80 font-mono uppercase tracking-wider">
                  Lead Project Manager (You)
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Brained Consulting · Delivery Lead</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONVERSATIONAL CENTER STAGE ── */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* ── TURN 1: Sophia Bennett Context & Welcome ── */}
            {meetingStage === 'sophia_welcome' && (
              <motion.div
                key="stage_welcome"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#101726] border border-amber-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>23:00 · Executive Briefing Call</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    CALL TIME REMAINING: 15 MINS
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#1b1c28] border border-amber-500/40 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={CHAPTER9_CHARACTERS.sophia.avatar}
                        alt="Sophia"
                        className="w-9 h-9 rounded-xl object-cover border border-amber-500/50"
                      />
                      <span className="font-bold text-amber-300 text-sm">Sophia Bennett (Head of HR):</span>
                    </div>
                    <button
                      onClick={() =>
                        speakDialogue(
                          "Thanks for hopping on. In 15 minutes, the Executive Steering Committee convenes with CFO Vikram Malhotra and CTO Marcus Reed. They want verified outcomes from Project Amigo before entertaining our Phase 2 expansion budget. Martha, what does the post-rollout telemetry tell us?"
                        )
                      }
                      className="text-slate-400 hover:text-white p-1 rounded"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed italic">
                    "Thanks for hopping on. In 15 minutes, the Executive Steering Committee convenes with CFO Vikram Malhotra and CTO Marcus Reed. They want verified outcomes from Project Amigo before entertaining our Phase 2 expansion budget. Martha, what does the post-rollout telemetry tell us?"
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSophiaWelcomeNext}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all cursor-pointer border border-amber-400/40"
                  >
                    <span>Hear Martha's Telemetry Briefing</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── TURN 2: Martha Vance Telemetry Summary ── */}
            {meetingStage === 'martha_telemetry' && (
              <motion.div
                key="stage_martha"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#101726] border border-cyan-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    <span>23:10 · Operations Telemetry Briefing</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    4,800 BRANCHES · PILOT TELEMETRY
                  </span>
                </div>

                {/* 4 Telemetry Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Appraisal Duration</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">42% Reduction</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">21.0 Days → 12.2 Days</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Man-Hours Saved</div>
                    <div className="text-sm font-bold text-white mt-0.5">15,000 Hours</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">Verified Capacity Gain</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Active Coverage</div>
                    <div className="text-sm font-bold text-amber-300 mt-0.5">80,000 Employees</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Mumbai, Pune & Regional</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">System Availability</div>
                    <div className="text-sm font-bold text-cyan-300 mt-0.5">99.4% SLA</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Zero Microservice Errors</div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#141d2d] border border-cyan-500/40 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={CHAPTER9_CHARACTERS.martha.avatar}
                        alt="Martha"
                        className="w-9 h-9 rounded-xl object-cover border border-cyan-500/50"
                      />
                      <span className="font-bold text-cyan-300 text-sm">Martha (Ops Telemetry):</span>
                    </div>
                    <button
                      onClick={() =>
                        speakDialogue(
                          "I’ve compiled the verified post-rollout APM telemetry from Mumbai, Pune, and regional branches. The appraisal completion cycle dropped from 21 days down to 12.2 days — a 42% reduction. Across 80,000 active branch employees, we clocked 15,000 verified operational man-hours saved with 99.4% SLA uptime."
                        )
                      }
                      className="text-slate-400 hover:text-white p-1 rounded"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed italic">
                    "I’ve compiled the verified post-rollout APM telemetry from Mumbai, Pune, and regional branches. The appraisal completion cycle dropped from 21 days down to 12.2 days — a 42% reduction. Across 80,000 active branch employees, we saved 15,000 operational man-hours with 99.4% SLA uptime."
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleMarthaTelemetryNext}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer border border-cyan-400/40"
                  >
                    <span>Your Lead PM Response</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── TURN 3: Interactive Senior PM Intervention ── */}
            {meetingStage === 'jane_intervention' && (
              <motion.div
                key="stage_intervention"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#101726] border border-indigo-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <span>23:18 · Strategic PM Intervention</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    HOW WILL YOU STEER THE BOARDROOM NARRATIVE?
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-sm sm:text-base font-black text-white">
                    Select your response to Martha's telemetry:
                  </h2>
                  <p className="text-xs text-slate-400">
                    A senior PM does not stop at engineering metrics. Choose how to frame the business outcome.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* OPTION 1: STRATEGIC FINANCIAL TRANSLATION */}
                  <div
                    onClick={() => handleSelectPlayerDialogue('monetize_hours')}
                    className="group cursor-pointer rounded-2xl p-5 border border-slate-700 bg-[#0d1322] hover:bg-slate-800/60 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 bg-slate-800 border border-slate-700">
                          Option A
                        </span>
                      </div>
                      <p className="text-white font-semibold text-xs sm:text-sm leading-relaxed">
                        "15,000 hours saved is a huge operational win, but CFO Vikram Malhotra and CTO Marcus Reed think in capital return, payback velocity, and architectural scale. We must monetize these hours at our blended workforce cost."
                      </p>
                      <p className="text-slate-400 text-xs">
                        Translates technical engineering metrics into balance sheet capacity and sets up a watertight financial defense for Phase 2.
                      </p>
                    </div>
                  </div>

                  {/* OPTION 2: OPERATIONAL METRICS ONLY */}
                  <div
                    onClick={() => handleSelectPlayerDialogue('basic_graphs')}
                    className="group cursor-pointer rounded-2xl p-5 border border-slate-700 bg-[#0d1322] hover:bg-slate-800/60 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 bg-slate-800 border border-slate-700">
                          Option B
                        </span>
                      </div>
                      <p className="text-white font-semibold text-xs sm:text-sm leading-relaxed">
                        "Let's just show them the 42% cycle reduction chart; surely engineering metrics alone will impress the CFO and Executive Committee."
                      </p>
                      <p className="text-slate-400 text-xs">
                        Assumes leadership understands the monetary value of software improvements without financial translation.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TURN 4: Sophia Bennett Corporate Mandate ── */}
            {meetingStage === 'sophia_guidance' && (
              <motion.div
                key="stage_guidance"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#101726] border border-amber-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>23:25 · Executive Corporate Alignment</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    BLENDED RATE: ₹650 / HOUR
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#1b1c28] border border-amber-500/40 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={CHAPTER9_CHARACTERS.sophia.avatar}
                        alt="Sophia"
                        className="w-9 h-9 rounded-xl object-cover border border-amber-500/50"
                      />
                      <span className="font-bold text-amber-300 text-sm">Sophia Bennett (Head of HR):</span>
                    </div>
                    <button
                      onClick={() =>
                        speakDialogue(
                          "Spot on! Operational hours alone won't convince CFO Vikram Malhotra. Our corporate finance rate for branch staff is ₹650 per hour. At ₹650/hr, 15,000 hours converts into ₹97.5 Lakhs in annual capacity value! Against our ₹55 Lakh Phase 1 capital spend, that yields a +77.3% Net ROI and a 6.8-month payback. But the CFO expects you to configure the financial model, verify regional branch data, and validate the corporate boardroom deck before the final vote."
                        )
                      }
                      className="text-slate-400 hover:text-white p-1 rounded"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed italic">
                    {playerDialogueChoice === 'monetize_hours'
                      ? '"Spot on! Operational hours alone will not satisfy CFO Vikram Malhotra. Our corporate finance blended rate for branch officers is ₹650 per hour. At ₹650/hr, 15,000 hours converts into ₹97.5 Lakhs in annual capacity value! Against our ₹55 Lakh Phase 1 capital spend, that’s +77.3% Net ROI and full payback in 6.8 months."'
                      : '"Careful! CFO Vikram Malhotra will dismiss raw operational charts as engineering overhead, and CTO Marcus Reed will question scale. We must monetize those 15,000 hours at our ₹650/hr branch rate into ₹97.5 Lakhs. Go into the Executive ROI Dashboard right now, model the numbers, and prepare the Boardroom Deck."'}
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSophiaGuidanceNext}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all cursor-pointer border border-amber-400/40"
                  >
                    <span>Receive Dashboard Assignment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── TURN 5: Assignment Handoff to ROI Dashboard ── */}
            {meetingStage === 'assignment_handoff' && (
              <motion.div
                key="stage_handoff"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#0f1d2a] border border-emerald-500/50 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>23:40 · Executive Dashboard Assignment</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    EXECUTIVE LEADERSHIP WORKSPACE
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#13282b] border border-emerald-500/40 space-y-3">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={CHAPTER9_CHARACTERS.martha.avatar}
                      alt="Martha"
                      className="w-9 h-9 rounded-xl object-cover border border-emerald-400/50"
                    />
                    <div>
                      <span className="font-bold text-emerald-300 text-sm">Martha (Ops Telemetry Specialist):</span>
                      <div className="text-[11px] text-slate-400">Ready on Brained OS</div>
                    </div>
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed italic">
                    "I've loaded the telemetry metrics, regional pilot breakdown (Mumbai, Pune, Bangalore, Delhi), and financial equations directly into your Executive ROI Dashboard. Complete the verification, calibrate the financial levers, and validate the slide deck before entering the Boardroom to face Vikram Malhotra and Marcus Reed."
                  </p>
                </div>

                {/* 3 Core Responsibilities */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <span>1. Telemetry Audit</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Reconcile 4,800 branch logs and verify 15,000 man-hours saved across clusters.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <span>2. Financial Modeling</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Calibrate ₹650/hr rate to prove ₹97.5L capacity gain, +77.3% ROI, and 6.8-month payback.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <span>3. Boardroom Defense</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Approve the deck and defend Phase 2 investment before the Steering Committee & CFO.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-emerald-300 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Executive Briefing concluded. Dashboard workspace ready.</span>
                  </div>

                  <button
                    onClick={handleLaunchDashboard}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <BarChart3 className="w-4 h-4 text-slate-950" />
                    <span>Open Executive ROI Dashboard & Begin Work</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── MEDIA / CONTROLS FOOTER ── */}
        <footer className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMicMuted((prev) => !prev)}
              className={`p-2 rounded-xl border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                micMuted
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {micMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="text-[11px] font-mono">{micMuted ? 'Muted' : 'Mic Live'}</span>
            </button>

            <button
              onClick={() => setCameraOff((prev) => !prev)}
              className={`p-2 rounded-xl border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                cameraOff
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cameraOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="text-[11px] font-mono">{cameraOff ? 'Cam Off' : 'Cam Feed'}</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Microsoft Teams · Executive Steering Committee Session · TLS 1.3 Encrypted</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
