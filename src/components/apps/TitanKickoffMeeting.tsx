/**
 * TitanKickoffMeeting — Project Amigo Executive Kickoff Meeting.
 * Participants: Marcus (CTO), Sophia (Client Lead), Daniel (PM), Aarav (Senior Consultant), Player (DT).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff,
  Users, Wifi, CheckCircle2, AlertTriangle,
  Sparkles, Radio, HelpCircle, ArrowRight, FileText,
  Pin, UserPlus
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ReadMeAIApp } from './ReadMeAIApp';
import { sound } from '../onboarding/SoundEngine';

// ── Characters Metadata ───────────────────────────────────────────────────────
const CHARS = {
  marcus: {
    id: 'marcus',
    name: 'Marcus Reed',
    role: 'Chief Technology Officer · Brained',
    dp: '/character/marcus_reed/MarcusDP.png',
    color: '#38bdf8',
    pitch: 0.9,
    rate: 1.0,
  },
  sophia: {
    id: 'sophia',
    name: 'Sophia Bennett',
    role: 'Head of HR Operations · ICICI Bank',
    dp: '/character/Sophia_bennett/SophiaDP.png',
    color: '#ec4899',
    pitch: 1.15,
    rate: 1.02,
  },
  daniel: {
    id: 'daniel',
    name: 'Daniel Brooks',
    role: 'Program Manager · Brained',
    dp: '/character/Daniel_Brooks/DanielDP.png',
    color: '#f97316',
    pitch: 1.0,
    rate: 1.0,
  },
  aarav: {
    id: 'aarav',
    name: 'Aarav Kapoor',
    role: 'Senior Consultant · Brained',
    dp: '/character/AaravDP.png',
    color: '#eab308',
    pitch: 0.95,
    rate: 0.98,
  },
  player: {
    id: 'player',
    name: 'You (Consultant)',
    role: 'Digital Transformation Lead',
    dp: '',
    color: '#34d399',
    pitch: 1.0,
    rate: 1.0,
  },
};

type CharId = keyof typeof CHARS;

interface MeetingLine {
  id: string;
  speaker: CharId;
  text: string;
  durationMs: number;
  isMarcusCameraOn?: boolean;
  audioSrc?: string;
}

// ── Master Script Definition ──────────────────────────────────────────────────
const SCRIPT_PART_1: MeetingLine[] = [
  {
    id: 'line_1_marcus',
    speaker: 'marcus',
    text: "This is Project Amigo: an HRMS transformation for 80,000 ICICI Bank employees.",
    durationMs: 10000,
    isMarcusCameraOn: true,
    audioSrc: undefined, // Native audio in /chapter1/chapter1-meet.mp4
  },
  {
    id: 'line_2_sophia',
    speaker: 'sophia',
    text: "We need 12 HRMS modules, including appraisals, attendance and leave. The appraisal cycle opens in 90 days, and everything is expected to be ready before then.",
    durationMs: 8000,
    isMarcusCameraOn: false,
    audioSrc: '/audio/chapter1/02_sophia_deadline_demand.mp3',
  },
  {
    id: 'line_3_marcus',
    speaker: 'marcus',
    text: "Twelve modules in 90 days? We need to establish what's actually feasible before we commit.",
    durationMs: 4500,
    isMarcusCameraOn: false,
    audioSrc: '/audio/chapter1/03_marcus_feasibility_challenge.mp3',
  },
];

const SCRIPT_PART_2: MeetingLine[] = [
  {
    id: 'line_5_marcus',
    speaker: 'marcus',
    text: "Peak traffic could reach 30,000 simultaneous logins. We haven't validated whether the legacy system can handle it.",
    durationMs: 6500,
    audioSrc: '/audio/chapter1/05_marcus_peak_traffic.mp3',
  },
  {
    id: 'line_6_daniel',
    speaker: 'daniel',
    text: "And we still lack the LDAP sandbox credentials needed to validate single sign-on end to end.",
    durationMs: 5500,
    audioSrc: '/audio/chapter1/06_daniel_ldap_credentials.mp3',
  },
  {
    id: 'line_7_aarav',
    speaker: 'aarav',
    text: "DT, review ReadMe AI's minutes, correct what it missed, and submit the official record before we commit to a plan.",
    durationMs: 6000,
    audioSrc: '/audio/chapter1/07_aarav_readme_instruction.mp3',
  },
];

interface TitanKickoffMeetingProps {
  onReturnToChapterSelect?: () => void;
  onMoMComplete?: () => void;
}

export const TitanKickoffMeeting: React.FC<TitanKickoffMeetingProps> = ({
  onReturnToChapterSelect,
  onMoMComplete,
}) => {
  const { setKickoffDone, addSignal } = useGame();

  const [stage, setStage] = useState<'permission' | 'in_call' | 'post_meeting_readme'>('permission');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [camPermission, setCamPermission] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const streamRef = useRef<MediaStream | null>(null);
  const marcusVideoRef = useRef<HTMLVideoElement | null>(null);

  // Script & Meeting state
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [scriptPart, setScriptPart] = useState<'part1' | 'mcq' | 'part2' | 'finished'>('part1');
  const [marcusCameraActive, setMarcusCameraActive] = useState(true);
  const [isMarcusPinned, setIsMarcusPinned] = useState(true);
  const [joinedParticipants, setJoinedParticipants] = useState<Set<CharId>>(new Set(['marcus', 'player']));
  const [joinToast, setJoinToast] = useState<{ name: string; role: string; dp: string } | null>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<CharId>('marcus');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedDecision, setSelectedDecision] = useState<'A' | 'B' | 'C' | null>(null);
  const [playerSpeechText, setPlayerSpeechText] = useState<string | null>(null);

  // Sound & Speech Synthesis with real MP3 audio file support
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const speakLine = (text: string, char: typeof CHARS[keyof typeof CHARS]) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = char.rate || 1.0;
      utterance.pitch = char.pitch || 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const playLineAudio = (line: MeetingLine, char: typeof CHARS[keyof typeof CHARS]) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    // Line 1 is spoken by Marcus directly through /chapter1/chapter1-meet.mp4
    if (line.id === 'line_1_marcus') {
      return;
    }

    if (line.audioSrc) {
      const audio = new Audio(line.audioSrc);
      currentAudioRef.current = audio;
      audio.play().catch(() => {
        // Fallback to speech synthesis if MP3 audio hasn't been placed yet
        speakLine(line.text, char);
      });
    } else {
      speakLine(line.text, char);
    }
  };

  // ── Meeting Timer (pauses during MCQ) ────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'in_call' || scriptPart === 'mcq') return;
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, scriptPart]);

  const mm = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const ss = String(elapsedSeconds % 60).padStart(2, '0');
  const meetingTimerStr = `${mm}:${ss}`;

  // ── Camera Handler ──────────────────────────────────────────────────────────
  const requestCamera = useCallback(async () => {
    setCamPermission('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setCamPermission('granted');
      setIsCameraOn(true);
    } catch {
      setCamPermission('denied');
    }
  }, []);

  const videoElementRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(() => {});
    }
  }, []);

  // ── Joining Sequence Timers (Sophia at 2.2s, Daniel at 4.8s, Aarav at 7.2s) ──
  useEffect(() => {
    if (stage !== 'in_call') return;

    // Start with Marcus (host) and Player (joined)
    setJoinedParticipants(new Set(['marcus', 'player']));

    const tSophia = setTimeout(() => {
      setJoinedParticipants((prev) => new Set([...prev, 'sophia']));
      setJoinToast({ name: CHARS.sophia.name, role: CHARS.sophia.role, dp: CHARS.sophia.dp });
      sound.playTeamsJoin();
      setTimeout(() => setJoinToast((curr) => (curr?.name === CHARS.sophia.name ? null : curr)), 2800);
    }, 2200);

    const tDaniel = setTimeout(() => {
      setJoinedParticipants((prev) => new Set([...prev, 'daniel']));
      setJoinToast({ name: CHARS.daniel.name, role: CHARS.daniel.role, dp: CHARS.daniel.dp });
      sound.playTeamsJoin();
      setTimeout(() => setJoinToast((curr) => (curr?.name === CHARS.daniel.name ? null : curr)), 2800);
    }, 4800);

    const tAarav = setTimeout(() => {
      setJoinedParticipants((prev) => new Set([...prev, 'aarav']));
      setJoinToast({ name: CHARS.aarav.name, role: CHARS.aarav.role, dp: CHARS.aarav.dp });
      sound.playTeamsJoin();
      setTimeout(() => setJoinToast((curr) => (curr?.name === CHARS.aarav.name ? null : curr)), 2800);
    }, 7200);

    return () => {
      clearTimeout(tSophia);
      clearTimeout(tDaniel);
      clearTimeout(tAarav);
    };
  }, [stage]);

  // ── Video Playback Volume Handler ───────────────────────────────────────────
  useEffect(() => {
    if (stage === 'in_call' && marcusCameraActive && marcusVideoRef.current) {
      marcusVideoRef.current.volume = 1.0;
      marcusVideoRef.current.play().catch(() => {
        if (marcusVideoRef.current) {
          marcusVideoRef.current.muted = true;
          marcusVideoRef.current.play();
        }
      });
    }
  }, [stage, marcusCameraActive]);

  // ── Meeting Flow Execution ──────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'in_call') return;

    if (scriptPart === 'part1') {
      const current = SCRIPT_PART_1[currentLineIndex];
      if (!current) {
        // Pause at 00:19 for MCQ
        setScriptPart('mcq');
        return;
      }

      setActiveSpeaker(current.speaker);
      const isMarcusIntro = current.speaker === 'marcus' && currentLineIndex === 0;
      setMarcusCameraActive(isMarcusIntro);
      setIsMarcusPinned(isMarcusIntro);
      playLineAudio(current, CHARS[current.speaker]);

      const timeout = setTimeout(() => {
        if (currentLineIndex + 1 < SCRIPT_PART_1.length) {
          setCurrentLineIndex((i) => i + 1);
        } else {
          setScriptPart('mcq');
        }
      }, current.durationMs);

      return () => clearTimeout(timeout);
    }

    if (scriptPart === 'part2') {
      const current = SCRIPT_PART_2[currentLineIndex];
      if (!current) {
        setScriptPart('finished');
        setTimeout(() => {
          setStage('post_meeting_readme');
          setKickoffDone(isCameraOn, isMicOn);
        }, 1500);
        return;
      }

      setActiveSpeaker(current.speaker);
      playLineAudio(current, CHARS[current.speaker]);

      const timeout = setTimeout(() => {
        if (currentLineIndex + 1 < SCRIPT_PART_2.length) {
          setCurrentLineIndex((i) => i + 1);
        } else {
          setScriptPart('finished');
          setTimeout(() => {
            setStage('post_meeting_readme');
            setKickoffDone(isCameraOn, isMicOn);
          }, 1500);
        }
      }, current.durationMs);

      return () => clearTimeout(timeout);
    }
  }, [stage, scriptPart, currentLineIndex, isCameraOn, isMicOn, setKickoffDone]);

  // ── MCQ Confirmation ────────────────────────────────────────────────────────
  const handleConfirmDecision = () => {
    if (!selectedDecision) return;

    let speech = '';
    const decisionAudioMap: Record<string, string> = {
      A: '/audio/chapter1/04a_player_decision_a.mp3',
      B: '/audio/chapter1/04b_player_decision_b.mp3',
      C: '/audio/chapter1/04c_player_decision_c.mp3',
    };

    if (selectedDecision === 'C') {
      addSignal('Strategic governance: Validated scope & dependencies before committing', 'governance', 25);
      speech = "Let's validate the scope, capacity, peak load and dependencies before agreeing on a realistic delivery plan.";
    } else if (selectedDecision === 'A') {
      addSignal('Premature delivery commitment made without technical validation', 'risk_management', -10);
      speech = "We can deliver everything in 90 days. Let's work out the details as we go.";
    } else if (selectedDecision === 'B') {
      addSignal('Premature refusal: Closed dialogue before architectural validation', 'stakeholder_management', -5);
      speech = "If engineering says it isn't feasible, we need to reject the deadline.";
    }

    setPlayerSpeechText(speech);
    playLineAudio(
      {
        id: 'player_decision',
        speaker: 'player',
        text: speech,
        durationMs: 5500,
        audioSrc: decisionAudioMap[selectedDecision],
      },
      CHARS.player
    );

    // Set player as active speaker briefly
    setActiveSpeaker('player');
    setScriptPart('part2');
    setCurrentLineIndex(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  // Current subtitle text
  const currentSubtitle = (() => {
    if (scriptPart === 'part1') return SCRIPT_PART_1[currentLineIndex]?.text;
    if (scriptPart === 'mcq') return "Meeting paused · Awaiting your response to the 90-day deadline challenge...";
    if (playerSpeechText && scriptPart === 'part2' && currentLineIndex === 0) return playerSpeechText;
    if (scriptPart === 'part2') return SCRIPT_PART_2[currentLineIndex]?.text;
    return "Meeting concluded. Launching ReadMe AI...";
  })();

  const currentSpeakerMeta = CHARS[activeSpeaker] || CHARS.marcus;

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 1: CAMERA PERMISSION / PRE-JOIN LOBBY
  // ─────────────────────────────────────────────────────────────────────────
  if (stage === 'permission') {
    return (
      <div className="flex-1 flex flex-col bg-[#0c0f1d] text-white font-sans overflow-hidden">
        {/* Header */}
        <div className="h-11 bg-[#1a1f36] px-5 flex items-center justify-between text-xs font-semibold select-none border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-2.5">
            <Video className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-white tracking-wide">Microsoft Teams · Project Amigo Kickoff</span>
          </div>
          <div className="flex items-center space-x-1.5 font-mono text-[10px] bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 px-2.5 py-0.5 rounded-full">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>SESSION READY</span>
          </div>
        </div>

        {/* Pre-Join Dialog */}
        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-[#070914] via-[#0d1224] to-[#070914]">
          <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-sky-950/60 via-indigo-950/60 to-purple-950/60 px-6 py-4 border-b border-white/10 flex items-center space-x-3.5">
              <img src="/character/marcus_reed/MarcusDP.png" alt="Marcus" className="w-10 h-10 rounded-full border border-sky-400/50 object-cover" />
              <div>
                <p className="text-sm font-bold text-white">Project Amigo Kickoff Call</p>
                <p className="text-[11px] text-slate-400">Marcus Reed (CTO) & Sophia Bennett (ICICI Bank) waiting</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-xs text-slate-300 leading-relaxed">
                You are joining the high-stakes Project Amigo kickoff for ICICI Bank's 80,000 employees. Your professional camera state and governance decisions will be evaluated.
              </p>

              {/* Camera Preview */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center">
                {camPermission === 'granted' && streamRef.current ? (
                  <video ref={videoElementRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                      <VideoOff className="w-6 h-6" />
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">Camera Off Preview</div>
                  </div>
                )}
              </div>

              {/* Join Action Buttons */}
              <div className="space-y-2 pt-1">
                {camPermission !== 'granted' ? (
                  <button
                    onClick={requestCamera}
                    disabled={camPermission === 'requesting'}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg cursor-pointer transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>{camPermission === 'requesting' ? 'Requesting Camera...' : 'Enable Camera & Join Call'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setStage('in_call')}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Join Meeting with Camera</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    addSignal('Joined kickoff without camera', 'communication', -5);
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

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 3: POST-MEETING README AI MOM APPLICATION
  // ─────────────────────────────────────────────────────────────────────────
  if (stage === 'post_meeting_readme') {
    return (
      <ReadMeAIApp
        onReturnToChapterSelect={onReturnToChapterSelect}
        onMoMSubmitted={onMoMComplete}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 2: IN LIVE CALL (REAL, PREMIUM, PROPORTIONAL TEAMS STAGE)
  // ─────────────────────────────────────────────────────────────────────────
  const participantList = [CHARS.marcus, CHARS.sophia, CHARS.daniel, CHARS.aarav];

  return (
    <div className="flex-1 flex flex-col bg-[#0b0e17] text-white overflow-hidden relative select-none">
      
      {/* ── TOP TEAMS HUD BAR ── */}
      <div className="h-11 bg-[#121626]/95 border-b border-white/10 px-5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-white text-xs tracking-wide">Project Amigo · Kickoff Meeting</span>
          <span className="text-white/20">|</span>
          <span className="text-[11px] text-slate-400">ICICI Bank Transformation</span>
          <div className="flex items-center space-x-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
            <Users className="w-3 h-3 text-sky-400" />
            <span>{joinedParticipants.size} / 5 In Call</span>
          </div>
        </div>

        {/* Live Call Telemetry */}
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

      {/* ── MAIN VIDEO TILES STAGE ── */}
      <div className="flex-1 p-3 overflow-hidden flex flex-col justify-between relative">
        
        {/* Teams Join Toast Alert */}
        <AnimatePresence>
          {joinToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
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

        {/* Dynamic Stage View: Pinned Spotlight (During video intro) vs Balanced Grid */}
        {isMarcusPinned ? (
          <div className="flex-1 flex flex-col md:flex-row gap-3 max-h-[calc(100%-80px)] overflow-hidden">
            
            {/* ── PINNED SPOTLIGHT TILE: MARCUS REED ── */}
            <div className="flex-[3] relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-[#38bdf8] shadow-[0_0_35px_rgba(56,189,248,0.35)] flex items-center justify-center min-h-[280px]">
              {marcusCameraActive ? (
                <video
                  ref={marcusVideoRef}
                  src="/chapter1/chapter1-meet.mp4"
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  onEnded={() => {
                    setMarcusCameraActive(false);
                    setIsMarcusPinned(false);
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-900 to-slate-950">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-sky-400/40 shadow-xl bg-slate-800 flex items-center justify-center">
                    <img src={CHARS.marcus.dp} alt="Marcus Reed" className="w-full h-full object-cover object-top" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-2">Camera Off</span>
                </div>
              )}

              {/* Spotlight / Pinned Indicator Badge */}
              <div className="absolute top-3 left-3 z-10 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-sky-400/50 text-sky-200 text-xs font-bold shadow-xl">
                <Pin className="w-3.5 h-3.5 text-sky-400" />
                <span>Spotlight · Marcus Reed</span>
              </div>

              {/* Marcus Bottom Info Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-xs font-bold text-white flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span>Marcus Reed (Chief Technology Officer · Brained)</span>
                </div>
                {activeSpeaker === 'marcus' && (
                  <div className="flex items-center space-x-0.5 bg-black/70 px-2.5 py-1.5 rounded-lg">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 rounded-full bg-sky-400"
                        animate={{ height: [4, 16, 4] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── COMPANION 2x2 SQUARE GRID: PARTICIPANTS JOINING 1-BY-1 ── */}
            <div className="w-full md:w-[280px] lg:w-[320px] grid grid-cols-2 grid-rows-2 gap-2.5 shrink-0 h-full overflow-y-auto">
              
              {/* Tile 1: Player (Always Present — Square) */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900/90 border border-white/10 flex flex-col items-center justify-center p-2.5 shadow-md aspect-square">
                {isCameraOn && streamRef.current ? (
                  <video ref={videoElementRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gradient-to-b from-slate-900 to-slate-950">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-950 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-sm shadow-md">
                      DT
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-2">Digital Transformer</span>
                  </div>
                )}
                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[9px] font-bold text-white flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>You</span>
                </div>
              </div>

              {/* Tile 2: Sophia Bennett (Joins at 2.2s — Square) */}
              {joinedParticipants.has('sophia') ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-2xl overflow-hidden bg-slate-900/90 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.15)] flex flex-col items-center justify-center p-2.5 aspect-square"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gradient-to-b from-slate-900 to-slate-950">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-pink-400/50 bg-slate-800 shadow-md">
                      <img src={CHARS.sophia.dp} alt="Sophia Bennett" className="w-full h-full object-cover object-top" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-2">Sophia Bennett</span>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[9px] font-bold text-white flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                    <span>Sophia (ICICI)</span>
                  </div>
                </motion.div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-slate-950/60 border border-dashed border-white/10 flex flex-col items-center justify-center p-2.5 aspect-square">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 bg-slate-800/80 opacity-30 filter grayscale">
                    <img src={CHARS.sophia.dp} alt="Sophia" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center space-x-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400/60 animate-ping" />
                    <span className="text-[10px] font-mono text-slate-400">Joining...</span>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-[9px] font-medium text-slate-500">
                    Sophia Bennett
                  </div>
                </div>
              )}

              {/* Tile 3: Daniel Brooks (Joins at 4.8s — Square) */}
              {joinedParticipants.has('daniel') ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-2xl overflow-hidden bg-slate-900/90 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)] flex flex-col items-center justify-center p-2.5 aspect-square"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gradient-to-b from-slate-900 to-slate-950">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-orange-400/50 bg-slate-800 shadow-md">
                      <img src={CHARS.daniel.dp} alt="Daniel Brooks" className="w-full h-full object-cover object-top" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-2">Daniel Brooks</span>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[9px] font-bold text-white flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    <span>Daniel (PM)</span>
                  </div>
                </motion.div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-slate-950/60 border border-dashed border-white/10 flex flex-col items-center justify-center p-2.5 aspect-square">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 bg-slate-800/80 opacity-30 filter grayscale">
                    <img src={CHARS.daniel.dp} alt="Daniel" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center space-x-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400/60 animate-ping" />
                    <span className="text-[10px] font-mono text-slate-400">Joining...</span>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-[9px] font-medium text-slate-500">
                    Daniel Brooks
                  </div>
                </div>
              )}

              {/* Tile 4: Aarav Kapoor (Joins at 7.2s — Square) */}
              {joinedParticipants.has('aarav') ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative rounded-2xl overflow-hidden bg-slate-900/90 border border-amber-500/30 shadow-[0_0_15px_rgba(234,179,8,0.15)] flex flex-col items-center justify-center p-2.5 aspect-square"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gradient-to-b from-slate-900 to-slate-950">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-amber-400/50 bg-slate-800 shadow-md">
                      <img src={CHARS.aarav.dp} alt="Aarav Kapoor" className="w-full h-full object-cover object-top" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-2">Aarav Kapoor</span>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[9px] font-bold text-white flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Aarav (Lead)</span>
                  </div>
                </motion.div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-slate-950/60 border border-dashed border-white/10 flex flex-col items-center justify-center p-2.5 aspect-square">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 bg-slate-800/80 opacity-30 filter grayscale">
                    <img src={CHARS.aarav.dp} alt="Aarav" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center space-x-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-ping" />
                    <span className="text-[10px] font-mono text-slate-400">Joining...</span>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-[9px] font-medium text-slate-500">
                    Aarav Kapoor
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          /* ── BALANCED 5-TILE GALLERY GRID (STANDARD MEETING STAGE) ── */
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-fr max-h-[calc(100%-80px)]">
            
            {/* Tile 1: MARCUS REED */}
            <div 
              className={`relative rounded-2xl overflow-hidden bg-slate-900/90 border-2 transition-all duration-300 flex items-center justify-center ${
                activeSpeaker === 'marcus' ? 'border-[#38bdf8] shadow-[0_0_25px_rgba(56,189,248,0.35)]' : 'border-white/10'
              }`}
            >
              <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-sky-400/40 shadow-xl bg-slate-800 flex items-center justify-center">
                  <img src={CHARS.marcus.dp} alt="Marcus Reed" className="w-full h-full object-cover object-top" />
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-2">Camera Off</span>
              </div>

              {/* Badge & Speaking Wave */}
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
                activeSpeaker === 'sophia' ? 'border-[#ec4899] shadow-[0_0_25px_rgba(236,72,153,0.35)]' : 'border-white/10'
              }`}
            >
              <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-pink-400/40 shadow-xl bg-slate-800 flex items-center justify-center">
                  <img src={CHARS.sophia.dp} alt="Sophia Bennett" className="w-full h-full object-cover object-top" />
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
                activeSpeaker === 'daniel' ? 'border-[#f97316] shadow-[0_0_25px_rgba(249,115,22,0.35)]' : 'border-white/10'
              }`}
            >
              <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-orange-400/40 shadow-xl bg-slate-800 flex items-center justify-center">
                  <img src={CHARS.daniel.dp} alt="Daniel Brooks" className="w-full h-full object-cover object-top" />
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

            {/* Tile 4: AARAV KAPOOR */}
            <div 
              className={`relative rounded-2xl overflow-hidden bg-slate-900/90 border-2 transition-all duration-300 flex items-center justify-center ${
                activeSpeaker === 'aarav' ? 'border-[#eab308] shadow-[0_0_25px_rgba(234,179,8,0.35)]' : 'border-white/10'
              }`}
            >
              <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-amber-400/40 shadow-xl bg-slate-800 flex items-center justify-center">
                  <img src={CHARS.aarav.dp} alt="Aarav Kapoor" className="w-full h-full object-cover object-top" />
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

            {/* Tile 5: PLAYER (YOU) */}
            <div 
              className={`relative rounded-2xl overflow-hidden bg-slate-900/90 border-2 transition-all duration-300 flex items-center justify-center ${
                activeSpeaker === 'player' ? 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.35)]' : 'border-white/10'
              }`}
            >
              {isCameraOn && streamRef.current ? (
                <video ref={videoElementRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-900 to-slate-950">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-950 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xl shadow-xl">
                    DT
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-2">Digital Transformer</span>
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
        )}

        {/* ── LIVE CLOSED CAPTIONS & SUBTITLES BAR ── */}
        {captionsEnabled && (
          <div className="mt-2.5 px-4 py-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 flex items-center space-x-3 shrink-0">
            <div 
              className="text-[11px] font-black uppercase font-mono px-2 py-0.5 rounded border"
              style={{ color: currentSpeakerMeta.color, borderColor: `${currentSpeakerMeta.color}40`, background: `${currentSpeakerMeta.color}15` }}
            >
              {currentSpeakerMeta.name}
            </div>
            <p className="text-xs text-white font-medium leading-relaxed truncate">
              "{currentSubtitle}"
            </p>
          </div>
        )}
      </div>

      {/* ── BOTTOM TEAMS CONTROL DOCK ── */}
      <div className="h-16 bg-[#121626]/95 border-t border-white/10 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>PROJECT AMIGO KICKOFF</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              isMicOn ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-red-500/80 border-red-400 text-white'
            }`}
          >
            {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              isCameraOn ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-800 border-white/10 text-slate-400'
            }`}
          >
            {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setCaptionsEnabled(!captionsEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              captionsEnabled ? 'bg-sky-500/20 border-sky-400/40 text-sky-300' : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            CC
          </button>
        </div>

        <button
          onClick={() => {
            setStage('post_meeting_readme');
            setKickoffDone(isCameraOn, isMicOn);
          }}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-2 cursor-pointer transition-colors shadow-lg"
        >
          <PhoneOff className="w-4 h-4" />
          <span>End Call</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          INTERACTIVE OVERLAY: DECISION 01 · LIVE MEETING MCQ
      ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {scriptPart === 'mcq' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 20 }}
              className="w-full max-w-2xl bg-[#0f1424] border border-amber-500/50 rounded-3xl p-7 shadow-2xl shadow-amber-500/10 text-white space-y-6"
            >
              {/* Overlay Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs font-mono font-black text-amber-400 tracking-[0.2em] uppercase">
                    DECISION 01 · LIVE MEETING
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  AUDIO & CLOCK PAUSED
                </div>
              </div>

              {/* Decision Prompt & Context */}
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  How do you respond to the deadline?
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Sophia expects delivery in 90 days. Marcus is questioning feasibility. What do you say?
                </p>
              </div>

              {/* 3 MCQ Options (A, B, C) */}
              <div className="space-y-3">
                {/* Option A */}
                <button
                  onClick={() => setSelectedDecision('A')}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedDecision === 'A'
                      ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-black font-mono text-amber-400">A — Promise first</span>
                    {selectedDecision === 'A' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">
                    "We can deliver everything in 90 days. Let's work out the details as we go."
                  </p>
                  <p className="text-xs text-slate-400 mt-1 italic">
                    Confident, but commits before validating feasibility.
                  </p>
                </button>

                {/* Option B */}
                <button
                  onClick={() => setSelectedDecision('B')}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedDecision === 'B'
                      ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-black font-mono text-amber-400">B — Reject the deadline</span>
                    {selectedDecision === 'B' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">
                    "If engineering says it isn't feasible, we need to reject the deadline."
                  </p>
                  <p className="text-xs text-slate-400 mt-1 italic">
                    Recognizes risk but closes the discussion too early.
                  </p>
                </button>

                {/* Option C */}
                <button
                  onClick={() => setSelectedDecision('C')}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedDecision === 'C'
                      ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-black font-mono text-amber-400">C — Validate before committing</span>
                    {selectedDecision === 'C' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">
                    "Let's validate the scope, capacity, peak load and dependencies before agreeing on a realistic delivery plan."
                  </p>
                  <p className="text-xs text-slate-400 mt-1 italic">
                    Balances business urgency with evidence and governance.
                  </p>
                </button>
              </div>

              {/* Confirm CTA */}
              <div className="pt-2">
                <button
                  onClick={handleConfirmDecision}
                  disabled={!selectedDecision}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
                    selectedDecision
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer'
                      : 'bg-white/10 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Confirm Response & Unfreeze Meeting</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
