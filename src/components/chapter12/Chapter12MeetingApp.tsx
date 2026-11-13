import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  Wifi,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Radio,
  Sliders,
  CheckCircle2,
  Award,
  Sparkles,
  Mail,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import type { Chapter12State, Chapter12DecisionChoice } from '../../types/chapter12';
import {
  CHAPTER12_CHARACTERS,
  MARCUS_APPROVAL_EMAIL,
  computeChapter12Score,
} from '../../data/chapter12Data';
import { sound } from '../onboarding/SoundEngine';

interface Chapter12MeetingAppProps {
  chapter12State: Chapter12State;
  onUpdateState: (
    updater: Partial<Chapter12State> | ((prev: Chapter12State) => Chapter12State)
  ) => void;
  onOpenControlCenter?: () => void;
  onWatchCinematic?: () => void;
  onOpenReport?: () => void;
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
    role: 'Head of IT Operations · Steering Committee Lead',
    badge: 'Steering Lead',
    dp: '/character/marcus_reed/MarcusDP.png',
    color: '#38bdf8',
    pitch: 0.9,
    rate: 1.0,
  },
  sophia: {
    id: 'sophia',
    name: 'Sophia Bennett',
    role: 'Head of HR Operations · ICICI Bank',
    badge: 'Client Sponsor',
    dp: '/character/Sophia_bennett/SophiaDP.png',
    color: '#ec4899',
    pitch: 1.15,
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
    role: 'Transformation Director · Brained',
    badge: 'DT Lead',
    dp: '',
    color: '#34d399',
    pitch: 1.0,
    rate: 1.0,
  },
};

interface MeetingDialogueLine {
  id: string;
  speaker: 'marcus' | 'player' | 'daniel' | 'sophia' | 'aarav';
  text: string;
}

const INTRO_DIALOGUES: MeetingDialogueLine[] = [
  {
    id: 'line_1_marcus',
    speaker: 'marcus',
    text: "Phase 1 is running smoothly, operations has accepted ownership, and the business is seeing measurable value. Now the board wants us to move forward with deferred Phase 2 capabilities.",
  },
  {
    id: 'line_2_marcus',
    speaker: 'marcus',
    text: "They want three modules back on the table: Learning Management System (LMS), Digital Visiting Cards, and the AI HR Chatbot. Alongside a mandatory Core Framework Security Upgrade.",
  },
  {
    id: 'line_3_daniel',
    speaker: 'daniel',
    text: "Development isn't the biggest concern. These modules interact with existing database tables and services. If we push everything together, we could destabilize the live Phase 1 environment.",
  },
  {
    id: 'line_4_sophia',
    speaker: 'sophia',
    text: "The executive committee is eager to see Phase 2 live, but customer security and banking uptime cannot be compromised. We need a controlled roadmap.",
  },
  {
    id: 'line_5_aarav',
    speaker: 'aarav',
    text: "We need more than a feature list. We need a controlled upgrade strategy. Jane, take ownership of the release plan. Decide how features roll out, validate the staging environment, and protect the production system.",
  },
];

const OUTCOME_DIALOGUES: MeetingDialogueLine[] = [
  {
    id: 'out_1_marcus',
    speaker: 'marcus',
    text: "Approved. Let's move forward with the phased roadmap. I want the existing platform to remain stable as we expand.",
  },
  {
    id: 'out_2_daniel',
    speaker: 'daniel',
    text: "That's a much safer approach. We can evolve the system without putting the existing production environment at unnecessary risk.",
  },
  {
    id: 'out_3_sophia',
    speaker: 'sophia',
    text: "All twelve chapters. We actually brought a complete enterprise digital transformation across the finish line.",
  },
  {
    id: 'out_4_aarav',
    speaker: 'aarav',
    text: "You didn't just deliver a project. You transformed an enterprise and built a foundation the organization can continue to grow. Congratulations.",
  },
];

export const Chapter12MeetingApp: React.FC<Chapter12MeetingAppProps> = ({
  chapter12State,
  onUpdateState,
  onOpenControlCenter,
  onWatchCinematic,
  onOpenReport,
}) => {
  const isPostControlCenter = chapter12State.deploymentCompleted;

  const [currentLineIndex, setCurrentLineIndex] = useState<number>(() => {
    if (isPostControlCenter) return 0;
    return chapter12State.meetingIntroCompleted ? INTRO_DIALOGUES.length - 1 : 0;
  });

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(54);

  // Decision state for Part 3
  const [selectedDecision, setSelectedDecision] = useState<Chapter12DecisionChoice>(
    chapter12State.decisionChosen || 'choice_b'
  );
  const [decisionSubmitted, setDecisionSubmitted] = useState<boolean>(
    Boolean(chapter12State.decisionChosen)
  );
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);

  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mm = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const ss = String(elapsedSeconds % 60).padStart(2, '0');
  const meetingTimerStr = `${mm}:${ss}`;

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

  // Determine active dialogues array
  const activeDialogues = isPostControlCenter && decisionSubmitted ? OUTCOME_DIALOGUES : INTRO_DIALOGUES;
  const currentLine = activeDialogues[currentLineIndex] || activeDialogues[0];
  const activeSpeaker = currentLine.speaker;
  const currentSpeakerMeta = CHARACTERS[activeSpeaker] || CHARACTERS.marcus;

  const speakCurrentLine = (line: MeetingDialogueLine) => {
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
  };

  useEffect(() => {
    if (!isPostControlCenter || decisionSubmitted) {
      speakCurrentLine(currentLine);
    }
  }, [currentLineIndex, decisionSubmitted, isPostControlCenter]);

  const handleNext = () => {
    sound.playClick();
    if (currentLineIndex < activeDialogues.length - 1) {
      setCurrentLineIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    sound.playClick();
    if (currentLineIndex > 0) {
      setCurrentLineIndex((i) => i - 1);
    }
  };

  const handleLaunchControlCenter = () => {
    sound.playSystemClearance();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onUpdateState({
      meetingIntroCompleted: true,
      meetingInitiated: true,
      controlCenterOpened: true,
      currentStage: 'evolution_control_center',
      timelineTimestamp: '29:45',
    });
    if (onOpenControlCenter) onOpenControlCenter();
  };

  const handleAuthorizeDecision = () => {
    sound.playSystemClearance();
    const scorecard = computeChapter12Score({
      ...chapter12State,
      decisionChosen: selectedDecision,
    });
    setDecisionSubmitted(true);
    setCurrentLineIndex(0);
    onUpdateState({
      decisionChosen: selectedDecision,
      currentStage: 'approval_outcome',
      timelineTimestamp: '30:55',
      scorecard,
    });
  };

  const handleProceedCinematic = () => {
    sound.playSystemClearance();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onUpdateState({
      currentStage: 'cinematic_montage',
      cinematicWatched: true,
      completed: true,
    });
    if (onWatchCinematic) onWatchCinematic();
  };

  const isAtLastLine = currentLineIndex === activeDialogues.length - 1;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0e17] text-white overflow-hidden relative select-none font-sans">
      {/* ── TOP WINDOW HEADER ── */}
      <div className="h-9 bg-[#171c2f] border-b border-white/10 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          <span className="text-[11px] text-slate-300 font-medium ml-2">
            Microsoft Teams — Steering Committee Review
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
            Project Amigo · Steering Committee
          </span>
          <span className="text-white/20">|</span>
          <span className="text-[11px] text-slate-400">Phase 2 Evolution & CR Upgrade</span>
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
              <span className="text-[10px] font-mono text-slate-500 mt-2">Steering Committee</span>
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

          {/* Tile 2: SOPHIA BENNETT */}
          <div
            className={`relative rounded-2xl overflow-hidden bg-slate-900/90 border-2 transition-all duration-300 flex items-center justify-center ${
              activeSpeaker === 'sophia'
                ? 'border-[#ec4899] shadow-[0_0_25px_rgba(236,72,153,0.35)]'
                : 'border-white/10'
            }`}
          >
            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-900 to-slate-950">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-pink-400/40 shadow-xl bg-slate-800 flex items-center justify-center">
                <img
                  src={CHARACTERS.sophia.dp}
                  alt={CHARACTERS.sophia.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-2">Client Sponsor</span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-bold text-white flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                <span>Sophia Bennett (ICICI Bank)</span>
              </div>
              {activeSpeaker === 'sophia' && (
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
          </div>

          {/* Tile 3: DANIEL BROOKS */}
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
          </div>

          {/* Tile 4: AARAV KAPOOR */}
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

        {/* ── FLOATING FINAL DECISION MODAL (FOR POST-ECC GOVERNANCE GATE) ── */}
        <AnimatePresence>
          {isPostControlCenter && !decisionSubmitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-x-4 top-4 bottom-20 z-40 bg-slate-950/95 backdrop-blur-2xl border border-indigo-500/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                        Phase 2 Release Authorization
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Steering Committee Governance Decision
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    MANDATORY SIGN-OFF
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  The executive steering committee is evaluating your proposed release strategy. How will you authorize the deployment of Phase 2 capabilities and the Core Framework Security Upgrade?
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CHOICE A */}
                  <div
                    onClick={() => {
                      sound.playClick();
                      setSelectedDecision('choice_a');
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedDecision === 'choice_a'
                        ? 'bg-slate-900 border-indigo-400 shadow-lg'
                        : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                        Option A · Monolithic Deployment
                      </span>
                      <input
                        type="radio"
                        checked={selectedDecision === 'choice_a'}
                        onChange={() => {}}
                        className="cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      Push all Phase 2 features and framework updates into production in one massive deployment.
                    </p>
                    <div className="text-[11px] text-slate-400 italic bg-black/40 p-2.5 rounded-xl border border-white/5">
                      "The board wants everything together. Let's deploy it all at once to maintain the schedule."
                    </div>
                  </div>

                  {/* CHOICE B */}
                  <div
                    onClick={() => {
                      sound.playClick();
                      setSelectedDecision('choice_b');
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedDecision === 'choice_b'
                        ? 'bg-slate-900 border-indigo-400 shadow-lg'
                        : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                        Option B · Controlled Phased Upgrade
                      </span>
                      <input
                        type="radio"
                        checked={selectedDecision === 'choice_b'}
                        onChange={() => {}}
                        className="cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      Establish a formal CR-Upgrade pipeline. Use feature flags to roll out Phase 2 modules incrementally via blue-green staging environments.
                    </p>
                    <div className="text-[11px] text-slate-400 italic bg-black/40 p-2.5 rounded-xl border border-white/5">
                      "We'll release progressively, validate each upgrade, and preserve the ability to roll back safely."
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  onClick={handleAuthorizeDecision}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs flex items-center space-x-2 shadow-xl cursor-pointer transition-all border border-indigo-400/30"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize Release Strategy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LIVE CLOSED CAPTIONS & SUBTITLES BAR ── */}
        {captionsEnabled && (!isPostControlCenter || decisionSubmitted) && (
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

      {/* ── MARCUS APPROVAL EMAIL POP-OVER ── */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-slate-900 border border-sky-400/40 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2.5">
                  <Mail className="w-5 h-5 text-sky-400" />
                  <span className="font-bold text-white text-xs">
                    {MARCUS_APPROVAL_EMAIL.subject}
                  </span>
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 bg-white/5 rounded"
                >
                  ✕ Close
                </button>
              </div>

              <div className="text-xs space-y-1 text-slate-400 font-mono">
                <div>From: <span className="text-white">{MARCUS_APPROVAL_EMAIL.sender}</span></div>
                <div>To: <span className="text-white">{MARCUS_APPROVAL_EMAIL.recipient}</span></div>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                {MARCUS_APPROVAL_EMAIL.body}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer"
                >
                  Acknowledge & Continue
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM TEAMS CONTROL DOCK ── */}
      <div className="h-16 bg-[#121626]/95 border-t border-white/10 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>PROJECT AMIGO · STEERING COMMITTEE</span>
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
          {!isPostControlCenter ? (
            <>
              <button
                onClick={handlePrev}
                disabled={currentLineIndex === 0}
                className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer"
                title="Previous line"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-[11px] font-mono text-slate-400 px-1">
                {currentLineIndex + 1} / {activeDialogues.length}
              </span>

              {!isAtLastLine ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleLaunchControlCenter}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center space-x-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] border border-sky-400/40 cursor-pointer transition-all animate-pulse"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Open Evolution Control Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : decisionSubmitted ? (
            <>
              <button
                onClick={() => setShowEmailModal(true)}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>View Approval</span>
              </button>

              <button
                onClick={handlePrev}
                disabled={currentLineIndex === 0}
                className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer"
                title="Previous line"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-[11px] font-mono text-slate-400 px-1">
                {currentLineIndex + 1} / {activeDialogues.length}
              </span>

              {!isAtLastLine ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleProceedCinematic}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-amber-300/60 cursor-pointer transition-all animate-pulse"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Begin Transformation Cinematic</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <div className="text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
              Governance Decision Pending
            </div>
          )}

          {chapter12State.completed && onOpenReport && (
            <button
              onClick={onOpenReport}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
            >
              Final Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
