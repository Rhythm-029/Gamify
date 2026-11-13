import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  Wifi,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Radio,
  FileCode,
  Terminal,
} from 'lucide-react';
import type { Chapter10State } from '../../types/chapter10';
import { sound } from '../onboarding/SoundEngine';

interface Chapter10MeetingAppProps {
  chapter10State: Chapter10State;
  onUpdateState: (updater: Partial<Chapter10State> | ((prev: Chapter10State) => Chapter10State)) => void;
  onOpenPortal?: () => void;
  onOpenScorecard?: () => void;
}

interface CharacterMeta {
  id: string;
  name: string;
  role: string;
  badge: string;
  dp: string;
  color: string;
  pitch: number;
  rate: number;
}

const CHARACTERS: Record<string, CharacterMeta> = {
  alex: {
    id: 'alex',
    name: 'Alex Chen',
    role: 'Lead Architect & Dev Lead',
    badge: 'Engineering Lead',
    dp: '/character/Daniel_Brooks/DanielDP.png',
    color: '#06b6d4',
    pitch: 1.05,
    rate: 1.0,
  },
  daniel: {
    id: 'daniel',
    name: 'Daniel Brooks',
    role: 'Program Manager · Brained',
    badge: 'Tech Architecture',
    dp: '/character/Daniel_Brooks/DanielDP.png',
    color: '#f97316',
    pitch: 1.0,
    rate: 1.0,
  },
  marcus: {
    id: 'marcus',
    name: 'Marcus Reed',
    role: 'Chief Technology Officer · Brained',
    badge: 'Enterprise Architecture',
    dp: '/character/marcus_reed/MarcusDP.png',
    color: '#38bdf8',
    pitch: 0.9,
    rate: 1.0,
  },
  aarav: {
    id: 'aarav',
    name: 'Aarav Kapoor',
    role: 'Senior PM · Leadership Mentor',
    badge: 'Lead Strategist',
    dp: '/character/AaravDP.png',
    color: '#eab308',
    pitch: 0.95,
    rate: 0.98,
  },
  player: {
    id: 'player',
    name: 'You (Lead PM)',
    role: 'Project Manager · Project Amigo',
    badge: 'DT Lead',
    dp: '',
    color: '#34d399',
    pitch: 1.0,
    rate: 1.0,
  },
};

interface MeetingDialogueLine {
  id: string;
  speaker: 'alex' | 'player' | 'daniel' | 'marcus' | 'aarav';
  text: string;
}

const MEETING_DIALOGUES: MeetingDialogueLine[] = [
  {
    id: 'line_1_alex',
    speaker: 'alex',
    text: "The launch was successful, and the code is stable across our pilot clusters. But our API documentation is scattered across temporary Markdown files, architecture diagrams have no version numbers, and nobody knows which version of the technical specifications is final.",
  },
  {
    id: 'line_2_player',
    speaker: 'player',
    text: "Wait, Alex. So if a new developer joins tomorrow, how will they understand the system architecture or know which API specifications are actually approved?",
  },
  {
    id: 'line_3_alex',
    speaker: 'alex',
    text: "Honestly? They'll have to ask the developers who built it. We never established a proper documentation and release management process.",
  },
  {
    id: 'line_4_daniel',
    speaker: 'daniel',
    text: "We've been focusing on delivery speed. But leaving technical debt like this means any future handover will be a nightmare.",
  },
  {
    id: 'line_5_aarav',
    speaker: 'aarav',
    text: "We cannot let the entire system depend on tribal knowledge. Before we close this sprint, I want a properly versioned release and a centralized technical knowledge base.",
  },
  {
    id: 'line_6_alex',
    speaker: 'alex',
    text: "I've unlocked the engineering repository. Let's audit the messy files, finalize the SemVer release, and publish the documentation portal.",
  },
];

export const Chapter10MeetingApp: React.FC<Chapter10MeetingAppProps> = ({
  chapter10State,
  onUpdateState,
  onOpenPortal,
  onOpenScorecard,
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(() => {
    return chapter10State.meetingCompleted ? MEETING_DIALOGUES.length - 1 : 0;
  });

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(24);

  const streamRef = useRef<MediaStream | null>(null);

  // Live timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mm = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const ss = String(elapsedSeconds % 60).padStart(2, '0');
  const meetingTimerStr = `${mm}:${ss}`;

  // Webcam request / teardown
  const toggleCamera = useCallback(async () => {
    sound.playClick();
    if (isCameraOn) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setIsCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        setIsCameraOn(true);
      } catch {
        setIsCameraOn(false);
      }
    }
  }, [isCameraOn]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const videoElementRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(() => {});
    }
  }, []);

  // Speech synthesis for talking immersion
  const speakCurrentLine = (line: MeetingDialogueLine) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const char = CHARACTERS[line.speaker];
        const utterance = new SpeechSynthesisUtterance(line.text);
        utterance.rate = char.rate || 1.0;
        utterance.pitch = char.pitch || 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // ignore synthesis errors
      }
    }
  };

  const currentLine = MEETING_DIALOGUES[currentLineIndex] || MEETING_DIALOGUES[0];
  const activeSpeaker = currentLine.speaker;
  const currentSpeakerMeta = CHARACTERS[activeSpeaker] || CHARACTERS.alex;

  // Trigger speech when line changes
  useEffect(() => {
    speakCurrentLine(currentLine);
  }, [currentLineIndex]);

  const handleNext = () => {
    sound.playClick();
    if (currentLineIndex < MEETING_DIALOGUES.length - 1) {
      setCurrentLineIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    sound.playClick();
    if (currentLineIndex > 0) {
      setCurrentLineIndex((i) => i - 1);
    }
  };

  const handleLaunchPortal = () => {
    sound.playSystemClearance();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onUpdateState({
      meetingCompleted: true,
      callCompleted: true,
      portalOpened: true,
      currentStage: 'release_challenge',
      timelineTimestamp: '25:20',
    });
    if (onOpenPortal) onOpenPortal();
  };

  const isAtLastLine = currentLineIndex === MEETING_DIALOGUES.length - 1;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0e17] text-white overflow-hidden relative select-none font-sans">
      {/* ── TOP WINDOW HEADER ── */}
      <div className="h-9 bg-[#171c2f] border-b border-white/10 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          <span className="text-[11px] text-slate-300 font-medium ml-2">
            Microsoft Teams — Engineering Release Sync
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active App</span>
        </div>
      </div>

      {/* ── SUBHEADER CALL HUD ── */}
      <div className="h-10 bg-[#121626]/95 border-b border-white/10 px-5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-white text-xs tracking-wide">
            Project Amigo · Engineering Standup
          </span>
          <span className="text-white/20">|</span>
          <span className="text-[11px] text-slate-400">Post-Launch Stabilization</span>
          <div className="flex items-center space-x-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
            <Users className="w-3 h-3 text-sky-400" />
            <span>5 / 5 In Call</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold">REC</span>
            <span>{meetingTimerStr}</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px]">HD 1080p</span>
          </div>
        </div>
      </div>

      {/* ── MAIN 5-TILE VIDEO GALLERY GRID ── */}
      <div className="flex-1 p-3 overflow-hidden flex flex-col justify-between relative">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-fr max-h-[calc(100%-80px)]">
          {/* Tile 1: ALEX CHEN (DEV LEAD) */}
          <div
            className={`relative rounded-2xl overflow-hidden bg-slate-900/90 border-2 transition-all duration-300 flex items-center justify-center ${
              activeSpeaker === 'alex'
                ? 'border-[#06b6d4] shadow-[0_0_25px_rgba(6,182,212,0.35)]'
                : 'border-white/10'
            }`}
          >
            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-900 to-slate-950">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-cyan-400/40 shadow-xl bg-slate-800 flex items-center justify-center">
                <img
                  src={CHARACTERS.alex.dp}
                  alt={CHARACTERS.alex.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-2">Engineering Lead</span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-bold text-white flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Alex Chen (Dev Lead)</span>
              </div>
              {activeSpeaker === 'alex' && (
                <div className="flex items-center space-x-0.5 bg-black/60 px-2 py-1 rounded-md">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full bg-cyan-400"
                      animate={{ height: [4, 14, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tile 2: DANIEL BROOKS (PROGRAM MANAGER / TECH ARCH) */}
          <div
            className={`relative rounded-2xl overflow-hidden bg-slate-900/90 border-2 transition-all duration-300 flex items-center justify-center ${
              activeSpeaker === 'daniel'
                ? 'border-[#f97316] shadow-[0_0_25px_rgba(249,115,22,0.35)]'
                : 'border-white/10'
            }`}
          >
            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-900 to-slate-950">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-orange-400/40 shadow-xl bg-slate-800 flex items-center justify-center">
                <img
                  src={CHARACTERS.daniel.dp}
                  alt={CHARACTERS.daniel.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-2">Tech Architecture</span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-bold text-white flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span>Daniel Brooks (PM)</span>
              </div>
              {activeSpeaker === 'daniel' && (
                <div className="flex items-center space-x-0.5 bg-black/60 px-2 py-1 rounded-md">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full bg-orange-400"
                      animate={{ height: [4, 14, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tile 3: MARCUS REED (CTO) */}
          <div
            className={`relative rounded-2xl overflow-hidden bg-slate-900/90 border-2 transition-all duration-300 flex items-center justify-center ${
              activeSpeaker === 'marcus'
                ? 'border-[#38bdf8] shadow-[0_0_25px_rgba(56,189,248,0.35)]'
                : 'border-white/10'
            }`}
          >
            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-900 to-slate-950">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-sky-400/40 shadow-xl bg-slate-800 flex items-center justify-center">
                <img
                  src={CHARACTERS.marcus.dp}
                  alt={CHARACTERS.marcus.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-2">Camera Off</span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-bold text-white flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Marcus Reed (CTO)</span>
              </div>
              {activeSpeaker === 'marcus' && (
                <div className="flex items-center space-x-0.5 bg-black/60 px-2 py-1 rounded-md">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full bg-sky-400"
                      animate={{ height: [4, 14, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tile 4: AARAV KAPOOR (SENIOR CONSULTANT / MENTOR) */}
          <div
            className={`relative rounded-2xl overflow-hidden bg-slate-900/90 border-2 transition-all duration-300 flex items-center justify-center ${
              activeSpeaker === 'aarav'
                ? 'border-[#eab308] shadow-[0_0_25px_rgba(234,179,8,0.35)]'
                : 'border-white/10'
            }`}
          >
            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-900 to-slate-950">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-amber-400/40 shadow-xl bg-slate-800 flex items-center justify-center">
                <img
                  src={CHARACTERS.aarav.dp}
                  alt={CHARACTERS.aarav.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-2">Lead Strategist</span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-bold text-white flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Aarav Kapoor (Senior Consultant)</span>
              </div>
              {activeSpeaker === 'aarav' && (
                <div className="flex items-center space-x-0.5 bg-black/60 px-2 py-1 rounded-md">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full bg-amber-400"
                      animate={{ height: [4, 14, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tile 5: PLAYER (YOU / DT LEAD) */}
          <div
            className={`relative rounded-2xl overflow-hidden bg-slate-900/90 border-2 transition-all duration-300 flex items-center justify-center ${
              activeSpeaker === 'player'
                ? 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.35)]'
                : 'border-white/10'
            }`}
          >
            {isCameraOn && streamRef.current ? (
              <video
                ref={videoElementRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-950 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xl shadow-xl">
                  DT
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-2">You (Camera Off)</span>
              </div>
            )}

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-bold text-white flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>You (DT Lead)</span>
              </div>
              {activeSpeaker === 'player' && (
                <div className="flex items-center space-x-0.5 bg-black/60 px-2 py-1 rounded-md">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full bg-emerald-400"
                      animate={{ height: [4, 14, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── LIVE CLOSED CAPTIONS & SUBTITLES BAR ── */}
        {captionsEnabled && (
          <div className="mt-2.5 px-4 py-3 rounded-2xl bg-black/90 backdrop-blur-md border border-white/15 flex items-start sm:items-center space-x-3 shrink-0 shadow-xl">
            <div
              className="text-xs font-black uppercase font-mono px-2.5 py-1 rounded-lg border shrink-0"
              style={{
                color: currentSpeakerMeta.color,
                borderColor: `${currentSpeakerMeta.color}40`,
                background: `${currentSpeakerMeta.color}15`,
              }}
            >
              {currentSpeakerMeta.name}
            </div>
            <p className="text-sm sm:text-[15px] text-white font-medium leading-relaxed flex-1">
              "{currentLine.text}"
            </p>
          </div>
        )}
      </div>

      {/* ── BOTTOM TEAMS CONTROL DOCK ── */}
      <div className="h-16 bg-[#121626]/95 border-t border-white/10 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>PROJECT AMIGO · STANDUP</span>
        </div>

        {/* Center Meeting Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              sound.playClick();
              setIsMicOn(!isMicOn);
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              !isMicOn
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
            }`}
            title={isMicOn ? 'Mute' : 'Unmute'}
          >
            {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              isCameraOn
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'
            }`}
            title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setCaptionsEnabled(!captionsEnabled);
            }}
            className={`px-3 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
              captionsEnabled
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-400'
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}
            title="Closed Captions"
          >
            CC
          </button>
        </div>

        {/* Right Navigation & App Launch Actions */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handlePrev}
            disabled={currentLineIndex === 0}
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer"
            title="Previous line"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-mono text-slate-400 px-1">
            {currentLineIndex + 1} / {MEETING_DIALOGUES.length}
          </span>

          {!isAtLastLine ? (
            <button
              onClick={handleNext}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleLaunchPortal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs flex items-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/40 cursor-pointer transition-all animate-pulse"
            >
              <Terminal className="w-4 h-4" />
              <span>Open Engineering Release Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {chapter10State.completed && onOpenScorecard && (
            <button
              onClick={onOpenScorecard}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700"
            >
              Scorecard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
