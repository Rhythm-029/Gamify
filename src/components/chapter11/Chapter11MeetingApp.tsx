import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  Wifi,
  ArrowRight,
  Radio,
  Server,
  FastForward,
  RotateCcw,
} from 'lucide-react';
import type { Chapter11State } from '../../types/chapter11';
import { sound } from '../onboarding/SoundEngine';

interface Chapter11MeetingAppProps {
  chapter11State: Chapter11State;
  onUpdateState: (updater: Partial<Chapter11State> | ((prev: Chapter11State) => Chapter11State)) => void;
  onOpenConsole?: () => void;
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
  marcus: {
    id: 'marcus',
    name: 'Marcus Reed',
    role: 'Head of IT Operations · Brained',
    badge: 'IT Operations Head',
    dp: '/character/marcus_reed/MarcusDP.png',
    color: '#38bdf8',
    pitch: 0.9,
    rate: 1.0,
  },
  martha: {
    id: 'martha',
    name: 'Martha',
    role: 'Junior PM · Transition Coordination',
    badge: 'Transition Ops',
    dp: '/character/Emma_Carter/EmmaDP.png',
    color: '#ec4899',
    pitch: 1.12,
    rate: 1.02,
  },
  daniel: {
    id: 'daniel',
    name: 'Daniel Brooks',
    role: 'Lead Developer · Core Engineering',
    badge: 'Tech Architecture',
    dp: '/character/Daniel_Brooks/DanielDP.png',
    color: '#f97316',
    pitch: 1.0,
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
  speaker: 'marcus' | 'player' | 'daniel' | 'martha' | 'aarav';
  text: string;
  durationMs: number;
}

const MEETING_DIALOGUES: MeetingDialogueLine[] = [
  {
    id: 'line_1_marcus',
    speaker: 'marcus',
    text: "First of all, congratulations on getting the platform live. The business is happy, and the deployment looks stable. But your team built this platform. My team has to support it at 2 AM when something breaks. We cannot take ownership just because the project team is ready to move on.",
    durationMs: 8500,
  },
  {
    id: 'line_2_player',
    speaker: 'player',
    text: "Fair point, Marcus. What exactly does your operations team need before accepting the transition?",
    durationMs: 5500,
  },
  {
    id: 'line_3_marcus',
    speaker: 'marcus',
    text: "Three things: operational runbooks, actual knowledge transfer with simulated incident handling, and a clearly defined 14-day hypercare escalation structure with immediate post-handover support.",
    durationMs: 8000,
  },
  {
    id: 'line_4_daniel',
    speaker: 'daniel',
    text: "Marcus, the architecture and API documentation are already published in the wiki, and monitoring is in place.",
    durationMs: 5500,
  },
  {
    id: 'line_5_martha',
    speaker: 'martha',
    text: "He's right, Daniel. We have the technical documents, but we haven't actually tested whether the operations team can independently handle an incident under pressure.",
    durationMs: 6500,
  },
  {
    id: 'line_6_aarav',
    speaker: 'aarav',
    text: "This is where project delivery becomes operational ownership. Don't just send them files. Make sure they can actually run the system.",
    durationMs: 6500,
  },
  {
    id: 'line_7_marcus',
    speaker: 'marcus',
    text: "I've unlocked the Operations Transition Console. Match the runbooks, run the incident workshop, and lock down the 14-day hypercare roster.",
    durationMs: 6000,
  },
];

export const Chapter11MeetingApp: React.FC<Chapter11MeetingAppProps> = ({
  chapter11State,
  onUpdateState,
  onOpenConsole,
  onOpenScorecard,
}) => {
  const [stage, setStage] = useState<'permission' | 'in_call'>(() => {
    return chapter11State.meetingCompleted ? 'in_call' : 'permission';
  });

  const [currentLineIndex, setCurrentLineIndex] = useState<number>(() => {
    return chapter11State.meetingCompleted ? MEETING_DIALOGUES.length - 1 : 0;
  });

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [joinedParticipants, setJoinedParticipants] = useState<Set<string>>(new Set(['marcus', 'player']));
  const [joinToast, setJoinToast] = useState<{ name: string; dp: string } | null>(null);
  const [isDialogueFinished, setIsDialogueFinished] = useState<boolean>(() => {
    return Boolean(chapter11State.meetingCompleted);
  });

  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (stage !== 'in_call') return;
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [stage]);

  const mm = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const ss = String(elapsedSeconds % 60).padStart(2, '0');
  const meetingTimerStr = `${mm}:${ss}`;

  const enableCameraAndJoin = useCallback(async () => {
    sound.playClick();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setIsCameraOn(true);
      setStage('in_call');
    } catch {
      setIsCameraOn(false);
      setStage('in_call');
    }
  }, []);

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

  // Timed participant joining sequence
  useEffect(() => {
    if (stage !== 'in_call') return;

    setJoinedParticipants(new Set(['marcus', 'player']));

    const tDaniel = setTimeout(() => {
      setJoinedParticipants((prev) => new Set([...prev, 'daniel']));
      setJoinToast({ name: CHARACTERS.daniel.name, dp: CHARACTERS.daniel.dp });
      sound.playTeamsJoin();
      setTimeout(() => setJoinToast(null), 2500);
    }, 1800);

    const tMartha = setTimeout(() => {
      setJoinedParticipants((prev) => new Set([...prev, 'martha']));
      setJoinToast({ name: CHARACTERS.martha.name, dp: CHARACTERS.martha.dp });
      sound.playTeamsJoin();
      setTimeout(() => setJoinToast(null), 2500);
    }, 3500);

    const tAarav = setTimeout(() => {
      setJoinedParticipants((prev) => new Set([...prev, 'aarav']));
      setJoinToast({ name: CHARACTERS.aarav.name, dp: CHARACTERS.aarav.dp });
      sound.playTeamsJoin();
      setTimeout(() => setJoinToast(null), 2500);
    }, 5000);

    return () => {
      clearTimeout(tDaniel);
      clearTimeout(tMartha);
      clearTimeout(tAarav);
    };
  }, [stage]);

  const speakLine = useCallback((line: MeetingDialogueLine) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const char = CHARACTERS[line.speaker];
        const utterance = new SpeechSynthesisUtterance(line.text);
        utterance.rate = char.rate || 1.0;
        utterance.pitch = char.pitch || 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {}
    }
  }, []);

  // Automatic realistic dialogue progression
  useEffect(() => {
    if (stage !== 'in_call') return;
    const current = MEETING_DIALOGUES[currentLineIndex];
    if (!current) return;

    speakLine(current);

    const timer = setTimeout(() => {
      if (currentLineIndex + 1 < MEETING_DIALOGUES.length) {
        setCurrentLineIndex((i) => i + 1);
      } else {
        setIsDialogueFinished(true);
      }
    }, current.durationMs);

    return () => clearTimeout(timer);
  }, [stage, currentLineIndex, speakLine]);

  const currentLine = MEETING_DIALOGUES[currentLineIndex] || MEETING_DIALOGUES[0];
  const activeSpeaker = currentLine.speaker;
  const currentSpeakerMeta = CHARACTERS[activeSpeaker] || CHARACTERS.marcus;

  const handleLaunchConsole = () => {
    sound.playSystemClearance();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onUpdateState({
      meetingCompleted: true,
      callCompleted: true,
      consoleOpened: true,
      currentStage: 'transition_console',
      timelineTimestamp: '27:45',
    });
    if (onOpenConsole) onOpenConsole();
  };

  const handleFastForward = () => {
    sound.playClick();
    setCurrentLineIndex(MEETING_DIALOGUES.length - 1);
    setIsDialogueFinished(true);
  };

  const handleReplay = () => {
    sound.playClick();
    setCurrentLineIndex(0);
    setIsDialogueFinished(false);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 1: PRE-JOIN LOBBY & CAMERA PERMISSION SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (stage === 'permission') {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#0c0f1d] text-white font-sans select-none overflow-hidden">
        {/* Teams Header */}
        <div className="h-11 bg-[#1a1f36] px-5 flex items-center justify-between text-xs font-semibold select-none border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-2.5">
            <Video className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-white tracking-wide">
              Microsoft Teams · IT Operations Handover Meeting
            </span>
          </div>
          <div className="flex items-center space-x-1.5 font-mono text-[10px] bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 px-2.5 py-0.5 rounded-full">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>SESSION READY</span>
          </div>
        </div>

        {/* Pre-Join Dialog Card */}
        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-[#070914] via-[#0d1224] to-[#070914]">
          <div className="w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-sky-950/70 via-indigo-950/70 to-purple-950/70 px-6 py-4 border-b border-white/10 flex items-center space-x-3.5">
              <img
                src={CHARACTERS.marcus.dp}
                alt="Marcus"
                className="w-10 h-10 rounded-full border border-sky-400/50 object-cover"
              />
              <div>
                <p className="text-sm font-bold text-white">IT Operations Handover Review</p>
                <p className="text-[11px] text-sky-300">Marcus Reed (Head of Ops) requested formal review</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-xs text-slate-300 leading-relaxed">
                Marcus from IT Operations has requested operational runbooks, hands-on incident simulations, and an escalation structure before his team accepts 2 AM production support responsibility.
              </p>

              {/* Camera Preview */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center">
                {isCameraOn && streamRef.current ? (
                  <video
                    ref={videoElementRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                      <VideoOff className="w-6 h-6" />
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">Camera Off Preview</div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={enableCameraAndJoin}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg cursor-pointer transition-all border border-indigo-400/30"
                >
                  <Video className="w-4 h-4" />
                  <span>Enable Camera &amp; Join Meeting</span>
                </button>

                <button
                  onClick={() => {
                    setIsCameraOn(false);
                    setStage('in_call');
                  }}
                  className="w-full py-2.5 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer transition-colors"
                >
                  Join without camera
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 2: IN LIVE CALL (5-PERSON BALANCED TEAMS VIDEO GRID)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0e17] text-white overflow-hidden relative select-none font-sans">
      {/* ── TOP WINDOW HEADER ── */}
      <div className="h-9 bg-[#171c2f] border-b border-white/10 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          <span className="text-[11px] text-slate-300 font-medium ml-2">
            Microsoft Teams — IT Operations Handover Meeting
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
            Project Amigo · IT Operations Handover
          </span>
          <span className="text-white/20">|</span>
          <span className="text-[11px] text-slate-400">Operational Ownership Transition</span>
          <div className="flex items-center space-x-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
            <Users className="w-3 h-3 text-sky-400" />
            <span>{joinedParticipants.size} / 5 In Call</span>
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
        <AnimatePresence>
          {joinToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-slate-900/95 border border-sky-400/40 text-white shadow-2xl backdrop-blur-xl pointer-events-none"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-sky-400/50 bg-slate-800 shrink-0">
                <img src={joinToast.dp} alt={joinToast.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="font-bold text-sky-300">{joinToast.name}</span>
                <span className="text-slate-300">joined the meeting</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-fr max-h-[calc(100%-80px)]">
          {/* Tile 1: MARCUS REED */}
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
              <span className="text-[10px] font-mono text-slate-500 mt-2">IT Operations Head</span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-bold text-white flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Marcus Reed (Head of Ops)</span>
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

          {/* Tile 2: MARTHA */}
          {joinedParticipants.has('martha') ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative rounded-2xl overflow-hidden bg-slate-900/90 border-2 transition-all duration-300 flex items-center justify-center ${
                activeSpeaker === 'martha'
                  ? 'border-[#ec4899] shadow-[0_0_25px_rgba(236,72,153,0.35)]'
                  : 'border-white/10'
              }`}
            >
              <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-pink-400/40 shadow-xl bg-slate-800 flex items-center justify-center">
                  <img
                    src={CHARACTERS.martha.dp}
                    alt={CHARACTERS.martha.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-2">Transition Coordination</span>
              </div>

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-bold text-white flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                  <span>Martha (Ops Coordinator)</span>
                </div>
                {activeSpeaker === 'martha' && (
                  <div className="flex items-center space-x-0.5 bg-black/60 px-2 py-1 rounded-md">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 rounded-full bg-pink-400"
                        animate={{ height: [4, 14, 4] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950/60 border border-dashed border-white/10 flex flex-col items-center justify-center p-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 bg-slate-800/80 opacity-40 grayscale">
                <img src={CHARACTERS.martha.dp} alt="Martha" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center space-x-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400/60 animate-ping" />
                <span className="text-[11px] font-mono text-slate-400">Martha connecting...</span>
              </div>
            </div>
          )}

          {/* Tile 3: DANIEL BROOKS */}
          {joinedParticipants.has('daniel') ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
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
                <span className="text-[10px] font-mono text-slate-500 mt-2">Core Engineering</span>
              </div>

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-bold text-white flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span>Daniel Brooks (Lead Dev)</span>
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
            </motion.div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950/60 border border-dashed border-white/10 flex flex-col items-center justify-center p-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 bg-slate-800/80 opacity-40 grayscale">
                <img src={CHARACTERS.daniel.dp} alt="Daniel" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center space-x-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400/60 animate-ping" />
                <span className="text-[11px] font-mono text-slate-400">Daniel connecting...</span>
              </div>
            </div>
          )}

          {/* Tile 4: AARAV KAPOOR */}
          {joinedParticipants.has('aarav') ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
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
                  <span>Aarav Kapoor (Senior PM)</span>
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
            </motion.div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950/60 border border-dashed border-white/10 flex flex-col items-center justify-center p-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 bg-slate-800/80 opacity-40 grayscale">
                <img src={CHARACTERS.aarav.dp} alt="Aarav" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center space-x-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-ping" />
                <span className="text-[11px] font-mono text-slate-400">Aarav connecting...</span>
              </div>
            </div>
          )}

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
          <span>PROJECT AMIGO · HANDOVER</span>
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

        {/* Right Action: Replay / Fast-Forward / Launch Console */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleReplay}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs flex items-center space-x-1 cursor-pointer transition-colors"
            title="Replay dialogue"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {!isDialogueFinished ? (
            <button
              onClick={handleFastForward}
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center space-x-1 cursor-pointer transition-all"
              title="Skip to end of handover meeting"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Skip Dialogue</span>
            </button>
          ) : (
            <button
              onClick={handleLaunchConsole}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center space-x-2 shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-400/40 cursor-pointer transition-all animate-pulse"
            >
              <Server className="w-4 h-4" />
              <span>Open Operations Transition Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {chapter11State.completed && onOpenScorecard && (
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
