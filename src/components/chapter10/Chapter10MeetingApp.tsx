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
  FolderGit2,
  FileCode,
  GitBranch,
  Layers,
  ShieldCheck,
  Volume2,
  Sparkles,
  MessageSquare,
  BookOpen,
  Terminal,
} from 'lucide-react';
import type { Chapter10State } from '../../types/chapter10';
import {
  CHAPTER10_LOCATION,
  CHAPTER10_PROJECT_NAME,
  CHAPTER10_CHARACTERS,
} from '../../data/chapter10Data';
import { sound } from '../onboarding/SoundEngine';

interface Chapter10MeetingAppProps {
  chapter10State: Chapter10State;
  onUpdateState: (updater: Partial<Chapter10State> | ((prev: Chapter10State) => Chapter10State)) => void;
  onOpenPortal?: () => void;
  onOpenScorecard?: () => void;
}

export const Chapter10MeetingApp: React.FC<Chapter10MeetingAppProps> = ({
  chapter10State,
  onUpdateState,
  onOpenPortal,
  onOpenScorecard,
}) => {
  // Conversational meeting stages:
  // 1. 'alex_reality': Alex explains that although the launch succeeded, docs are scattered & unversioned.
  // 2. 'player_inquiry': Player asks about developer onboarding & knowledge dependency.
  // 3. 'alex_repo_reveal': Alex shows the messy repository (temp files, duplicates, unversioned diagrams).
  // 4. 'player_mandate': Player establishes the release governance mandate.
  // 5. 'handoff_to_portal': Handoff to the Engineering Release Portal workspace.
  const [meetingStage, setMeetingStage] = useState<
    'alex_reality' | 'player_inquiry' | 'alex_repo_reveal' | 'player_mandate' | 'handoff_to_portal'
  >(() => {
    if (chapter10State.meetingCompleted || chapter10State.portalOpened) return 'handoff_to_portal';
    return 'alex_reality';
  });

  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<'alex' | 'player'>('alex');

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

  useEffect(() => {
    if (meetingStage === 'alex_reality' || meetingStage === 'alex_repo_reveal') {
      setActiveSpeaker('alex');
    } else {
      setActiveSpeaker('player');
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

  const handleNextStage = (nextStage: typeof meetingStage) => {
    sound.playMessagePing();
    setMeetingStage(nextStage);
  };

  const handleLaunchPortal = () => {
    sound.playSystemClearance();
    onUpdateState({
      meetingCompleted: true,
      callCompleted: true,
      portalOpened: true,
      currentStage: 'release_challenge',
      timelineTimestamp: '25:20',
    });

    if (onOpenPortal) {
      onOpenPortal();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#070b14] text-slate-100 font-sans select-none overflow-hidden">
      {/* ── TOP HEADER (TEAMS BRIEFING BAR) ── */}
      <header className="px-5 py-3 border-b border-slate-800 bg-[#0c1220]/90 backdrop-blur flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <FolderGit2 className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 font-bold">
                POST-LAUNCH STABILIZATION · SCENE 10.1
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                ENGINEERING STANDUP
              </span>
            </div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{CHAPTER10_LOCATION}</span>
              <span className="text-slate-400 text-xs font-normal">
                · {CHAPTER10_PROJECT_NAME} Release Governance Sync
              </span>
            </h1>
          </div>
        </div>

        {/* Status Pills & Action Button */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px]">25:00–25:20 Release Readiness Sync</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-[11px] font-bold">DEV LEAD CALL ACTIVE</span>
          </div>

          {onOpenPortal && (chapter10State.meetingCompleted || meetingStage === 'handoff_to_portal') && (
            <button
              onClick={handleLaunchPortal}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-950 flex items-center space-x-1.5 cursor-pointer border border-cyan-400/40 transition-all"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Open Release Portal</span>
            </button>
          )}

          {onOpenScorecard && chapter10State.completed && (
            <button
              onClick={onOpenScorecard}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 cursor-pointer border border-slate-700 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Scorecard</span>
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 flex flex-col justify-between max-w-5xl mx-auto w-full">
        {/* ── PARTICIPANTS GALLERY (ALEX & PLAYER) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
          {/* Alex (Dev Lead) */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              activeSpeaker === 'alex'
                ? 'bg-[#121c2d] border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                : 'bg-[#0f172a]/70 border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={CHAPTER10_CHARACTERS.alex.avatar}
                  alt={CHAPTER10_CHARACTERS.alex.name}
                  className="w-12 h-12 rounded-xl object-cover border border-cyan-500/50 shadow"
                />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">
                    {CHAPTER10_CHARACTERS.alex.name}
                  </span>
                  {activeSpeaker === 'alex' && (
                    <span className="text-cyan-400 text-[10px] font-mono flex items-center gap-1 font-bold">
                      <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-cyan-300/80 font-mono uppercase tracking-wider">
                  Developer · Engineering Lead
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Repository Maintainer</span>
                </div>
              </div>
            </div>
          </div>

          {/* Player Feed */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              activeSpeaker === 'player'
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
                  {activeSpeaker === 'player' && (
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
            {/* ── STAGE 1: Alex's Post-Launch Reality ── */}
            {meetingStage === 'alex_reality' && (
              <motion.div
                key="stage_alex_reality"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#101726] border border-cyan-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>25:00 · Post-Launch Reality on the Engineering Floor</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    EXECUTIVE STEERING COMMITTEE ROI APPROVED
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#132032] border border-cyan-500/40 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={CHAPTER10_CHARACTERS.alex.avatar}
                        alt="Alex"
                        className="w-9 h-9 rounded-xl object-cover border border-cyan-500/50"
                      />
                      <span className="font-bold text-cyan-300 text-sm">Alex (Dev Lead):</span>
                    </div>
                    <button
                      onClick={() =>
                        speakDialogue(
                          "The launch was successful and the code is stable. But there's something we haven't addressed. Our API documentation is scattered across temporary Markdown files, architecture diagrams are sitting in individual folders, and nobody knows which version of the technical specifications is final."
                        )
                      }
                      className="text-slate-400 hover:text-white p-1 rounded"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed italic">
                    "The launch was successful, and the code is stable across our pilot clusters. But there's something we haven't addressed: our API documentation is scattered across temporary Markdown files, architecture diagrams are sitting in individual folders, and nobody knows which version of the technical specifications is final."
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleNextStage('player_inquiry')}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer border border-cyan-400/40"
                  >
                    <span>Ask Alex About New Developer Onboarding</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STAGE 2: Player Inquiry on Onboarding & Dependency ── */}
            {meetingStage === 'player_inquiry' && (
              <motion.div
                key="stage_player_inquiry"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#101726] border border-indigo-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <span>25:10 · The Knowledge Dependency Threat</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    MAINTAINABILITY RISK IDENTIFIED
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#181a30] border border-indigo-500/40 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center font-mono text-xs">
                        YOU
                      </div>
                      <span className="font-bold text-indigo-300 text-sm">Player (Lead PM):</span>
                    </div>
                    <button
                      onClick={() =>
                        speakDialogue(
                          "Wait, Alex. So if a new developer joins tomorrow, how will they understand the system architecture or know which API specifications are actually approved?"
                        )
                      }
                      className="text-slate-400 hover:text-white p-1 rounded"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed italic">
                    "Wait, Alex. So if a new developer joins tomorrow, how will they understand the system architecture or know which API specifications are actually approved?"
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleNextStage('alex_repo_reveal')}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border border-cyan-400/40"
                  >
                    <span>Hear Alex's Answer & View Repository State</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STAGE 3: Alex Reveals the Hidden Technical Debt ── */}
            {meetingStage === 'alex_repo_reveal' && (
              <motion.div
                key="stage_alex_reveal"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#101726] border border-amber-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <FileCode className="w-4 h-4 text-amber-400" />
                    <span>25:20 · The Hidden Technical Debt</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    TRIBAL KNOWLEDGE IS NOT DOCUMENTATION
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#1c1b26] border border-amber-500/40 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={CHAPTER10_CHARACTERS.alex.avatar}
                        alt="Alex"
                        className="w-9 h-9 rounded-xl object-cover border border-amber-500/50"
                      />
                      <span className="font-bold text-amber-300 text-sm">Alex (Dev Lead):</span>
                    </div>
                    <button
                      onClick={() =>
                        speakDialogue(
                          "Honestly? They'll have to ask the developers who built it. We've been focusing on getting the product delivered. We never established a proper documentation and release management process."
                        )
                      }
                      className="text-slate-400 hover:text-white p-1 rounded"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed italic">
                    "Honestly? They'll have to ask the developers who built it. We've been focusing 100% on delivery deadlines. We have multiple versions of API documentation, unversioned diagrams, untracked changes, and no centralized developer portal."
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleNextStage('player_mandate')}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all cursor-pointer border border-amber-400/40"
                  >
                    <span>Issue Senior PM Governance Mandate</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STAGE 4: Player Mandate (Release Governance) ── */}
            {meetingStage === 'player_mandate' && (
              <motion.div
                key="stage_player_mandate"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#0f1d2a] border border-cyan-500/50 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>25:35 · Senior PM Release Governance Mandate</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    PROTECTING INSTITUTIONAL KNOWLEDGE
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#112435] border border-cyan-500/40 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white font-bold flex items-center justify-center font-mono text-xs">
                        YOU
                      </div>
                      <span className="font-bold text-cyan-300 text-sm">Player (Lead PM):</span>
                    </div>
                    <button
                      onClick={() =>
                        speakDialogue(
                          "We cannot let the entire system depend on individual developers remembering how everything works. Before we close this sprint, I want a properly versioned release and a centralized technical knowledge base."
                        )
                      }
                      className="text-slate-400 hover:text-white p-1 rounded"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed italic">
                    "We cannot let the entire bank HRMS depend on individual developers remembering how everything works. Before we close this sprint, I want an audited repository, a formally tagged release, and a centralized Internal Developer Portal."
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleNextStage('handoff_to_portal')}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer border border-cyan-400/40"
                  >
                    <span>Receive Engineering Release Challenge</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STAGE 5: Handoff to Portal Workspace ── */}
            {meetingStage === 'handoff_to_portal' && (
              <motion.div
                key="stage_handoff_portal"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#0f1d2a] border border-emerald-500/50 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>25:45 · Engineering Release Challenge Initiated</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    INTERNAL DEVELOPER PORTAL
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#13282b] border border-emerald-500/40 space-y-3">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={CHAPTER10_CHARACTERS.alex.avatar}
                      alt="Alex"
                      className="w-9 h-9 rounded-xl object-cover border border-emerald-400/50"
                    />
                    <div>
                      <span className="font-bold text-emerald-300 text-sm">Alex (Dev Lead):</span>
                      <div className="text-[11px] text-slate-400">Engineering Repository Workspace Ready</div>
                    </div>
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed italic">
                    "Okay, let's do it right. I've opened the repository audit suite on Brained OS. We have three governance tasks to complete: clean up the repository files, approve our semantic release tag, and publish the official documentation package to the enterprise wiki before our final release gate."
                  </p>
                </div>

                {/* 3 Core Tasks Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Task 1 · Repo Audit</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Identify authoritative documents and purge duplicate/scratch files (+5 bonus).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-purple-300 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Task 2 · SemVer Tag</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Choose between v0.9.9, v1.0.0, and v2.0.0 for initial production release (+5 bonus).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Task 3 · Wiki Catalog</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Publish complete Internal Developer Portal package to hit 100% coverage (+5 bonus).
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-emerald-300 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Briefing concluded. Engineering Portal unlocked on Brained OS.</span>
                  </div>

                  <button
                    onClick={handleLaunchPortal}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    <Terminal className="w-4 h-4 text-slate-950" />
                    <span>Enter Engineering Release Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── CONTROLS FOOTER ── */}
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
              {micMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-cyan-400" />}
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
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Microsoft Teams · Engineering Architecture Standup · TLS 1.3 Encrypted</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
