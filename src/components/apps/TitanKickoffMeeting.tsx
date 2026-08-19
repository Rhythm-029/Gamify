/**
 * TitanKickoffMeeting — Full 5-person scripted kickoff meeting.
 * Participants: Marcus (CTO), Daniel (PM), Emma (HR), Sophia (Client), Player.
 *
 * Rules:
 * - Scripted — no LLM
 * - Camera/mic state tracked
 * - Recording permission requested
 * - Meeting ends → GameContext.setKickoffDone()
 * - Hidden requirements (Bulk Upload, Audit Logs) NOT mentioned
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff,
  Users, MonitorUp, Wifi, CheckCircle2
} from 'lucide-react';
import { useGame } from '../../context/GameContext';

// ── Characters ────────────────────────────────────────────────────────────────

const CHARS = {
  marcus: {
    id: 'marcus', name: 'Marcus Reed', role: 'CTO', org: 'Brained',
    dp: '/character/marcus_reed/MarcusDP.png', color: '#3b82f6',
  },
  daniel: {
    id: 'daniel', name: 'Daniel Brooks', role: 'Program Manager', org: 'Brained',
    dp: '/character/Daniel_Brooks/DanielDP.png', color: '#f97316',
  },
  emma: {
    id: 'emma', name: 'Emma Carter', role: 'HR Transformation Specialist', org: 'Brained',
    dp: '/character/Emma_Carter/EmmaDP.png', color: '#10b981',
  },
  sophia: {
    id: 'sophia', name: 'Sophia Bennett', role: 'VP of HR', org: 'Titan Manufacturing',
    dp: '/character/Sophia_bennett/SophiaDP.png', color: '#a855f7',
  },
};

type CharId = keyof typeof CHARS;

// ── Meeting Script ────────────────────────────────────────────────────────────
// Verbatim from the spec. Hidden reqs (Bulk Upload, Audit Logs) are NOT here.

interface Line {
  speaker: CharId;
  text: string;
  pause?: number; // ms before next line
}

const SCRIPT: Line[] = [
  { speaker: 'marcus', text: "Alright, let's get started.", pause: 1200 },
  { speaker: 'marcus', text: "This is Project Titan.", pause: 1800 },
  { speaker: 'marcus', text: "Sophia, I'll let you frame the business problem.", pause: 2000 },
  { speaker: 'sophia', text: "Thanks, Marcus.", pause: 1000 },
  { speaker: 'sophia', text: "Titan has grown quickly over the last few years, but our HR systems haven't kept up.", pause: 3000 },
  { speaker: 'sophia', text: "Our employees still depend on spreadsheets, email and manual forms for things that should be straightforward.", pause: 3500 },
  { speaker: 'sophia', text: "Leave requests are one of our biggest pain points.", pause: 2000 },
  { speaker: 'sophia', text: "Employees submit requests through different channels, managers approve them manually, and HR ends up reconciling everything.", pause: 3500 },
  { speaker: 'emma', text: "The same thing happens with employee records.", pause: 2000 },
  { speaker: 'emma', text: "HR doesn't have one reliable view of employee information.", pause: 2500 },
  { speaker: 'emma', text: "We're constantly checking spreadsheets and shared folders.", pause: 2500 },
  { speaker: 'daniel', text: "Which is why we're proposing a centralised HR portal.", pause: 2500 },
  { speaker: 'marcus', text: "The initial scope is straightforward.", pause: 1500 },
  { speaker: 'marcus', text: "Employee access. Employee directory. Attendance. Leave management. And an HR dashboard.", pause: 4000 },
  { speaker: 'sophia', text: "I'd also like employees to be able to see the status of their requests.", pause: 2500 },
  { speaker: 'emma', text: "Yes. And managers need an approval workflow.", pause: 2000 },
  { speaker: 'daniel', text: "Timeline is tight.", pause: 1500 },
  { speaker: 'daniel', text: "We need a working prototype before the end of the week.", pause: 2500 },
  { speaker: 'marcus', text: "And we have a client presentation at the end of the engagement.", pause: 2500 },
  { speaker: 'sophia', text: "I don't need something technically impressive just for the sake of it.", pause: 2500 },
  { speaker: 'sophia', text: "I need something our employees can actually use.", pause: 2500 },
  { speaker: 'marcus', text: "Exactly.", pause: 1000 },
  { speaker: 'marcus', text: "Don't optimise for features. Optimise for the problem.", pause: 3000 },
  { speaker: 'daniel', text: "I'll send the project brief after this.", pause: 2000 },
  { speaker: 'emma', text: "I'll also send the employee survey data.", pause: 2000 },
  { speaker: 'marcus', text: "Good. Let's move.", pause: 1000 },
];

// ── Timer helper ──────────────────────────────────────────────────────────────

function useLiveTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const TitanKickoffMeeting: React.FC = () => {
  const { setKickoffDone, addSignal } = useGame();

  const [stage, setStage] = useState<'permission' | 'in_call' | 'ended'>('permission');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [camPermission, setCamPermission] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const streamRef = useRef<MediaStream | null>(null);

  const [lineIdx, setLineIdx] = useState(0);
  const [activeSpeaker, setActiveSpeaker] = useState<CharId>('marcus');

  const timer = useLiveTimer(stage === 'in_call');
  const lineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Script auto-advance ───────────────────────────────────────────────────

  useEffect(() => {
    if (stage !== 'in_call') return;
    if (lineIdx >= SCRIPT.length) return;

    const current = SCRIPT[lineIdx];
    setActiveSpeaker(current.speaker);
    const delay = current.pause ?? 3000;

    lineTimerRef.current = setTimeout(() => {
      setLineIdx((i) => i + 1);
    }, delay + 1200); // +1200 for reading time

    return () => {
      if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
    };
  }, [stage, lineIdx]);

  // ── Camera ────────────────────────────────────────────────────────────────

  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(() => {});
    }
  }, []);

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

  const joinCall = useCallback((withCamera: boolean) => {
    if (!withCamera) {
      addSignal('communication', 'Joined kickoff without camera', -5);
    }
    setStage('in_call');
  }, [addSignal]);

  const toggleCamera = useCallback(() => {
    if (!isCameraOn) {
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((t) => { t.enabled = true; });
        setIsCameraOn(true);
      } else {
        requestCamera();
      }
    } else {
      streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = false; });
      setIsCameraOn(false);
      addSignal('communication', 'Turned camera off during kickoff', -5);
    }
  }, [isCameraOn, requestCamera, addSignal]);

  const toggleMic = useCallback(() => {
    setIsMicOn((prev) => {
      streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = prev; });
      return !prev;
    });
  }, []);

  // ── End meeting ───────────────────────────────────────────────────────────

  const endMeeting = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStage('ended');
    setKickoffDone(isCameraOn, isMicOn);
  }, [isCameraOn, isMicOn, setKickoffDone]);

  // Auto-end after script finishes
  useEffect(() => {
    if (lineIdx >= SCRIPT.length && stage === 'in_call') {
      const timer = setTimeout(endMeeting, 2000);
      return () => clearTimeout(timer);
    }
  }, [lineIdx, stage, endMeeting]);

  // Cleanup
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (lineTimerRef.current) clearTimeout(lineTimerRef.current);
    };
  }, []);

  const isScriptDone = lineIdx >= SCRIPT.length;
  const currentLine = SCRIPT[Math.min(lineIdx, SCRIPT.length - 1)];
  const currentChar = CHARS[currentLine?.speaker ?? 'marcus'];

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE: PERMISSION
  // ─────────────────────────────────────────────────────────────────────────

  if (stage === 'permission') {
    return (
      <div className="flex-1 flex flex-col bg-[#1a1a2e] text-white font-sans overflow-hidden">
        {/* Teams header */}
        <div className="h-10 bg-[#3F4499] px-4 flex items-center justify-between text-xs font-semibold select-none border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-2">
            <Video className="w-4 h-4" />
            <span>Microsoft Teams — Project Titan Kickoff</span>
          </div>
          <div className="flex items-center space-x-1.5 font-mono bg-white/15 px-2 py-0.5 rounded">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>Connecting…</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#0f0f23] via-[#1a1a38] to-[#0f0f23] p-6">
          <div className="w-full max-w-md bg-[#252540]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="bg-[#3F4499]/60 px-6 py-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <img src="/character/marcus_reed/MarcusDP.png" alt="Marcus" className="w-9 h-9 rounded-full object-cover border-2 border-blue-400/60" />
                <div>
                  <p className="text-xs font-bold text-white">Project Titan Kickoff — 5 participants</p>
                  <p className="text-[10px] text-slate-400">Marcus Reed (CTO) has started the meeting</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                This meeting will include <strong className="text-white">Marcus, Daniel, Emma, Sophia,</strong> and you.
                Your camera and microphone will help maintain meeting professionalism.
              </p>

              {/* Camera preview */}
              {camPermission === 'granted' && streamRef.current && (
                <div className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-black">
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                </div>
              )}

              {camPermission === 'denied' && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                  Camera permission denied. You can still join — but camera-on is expected in meetings.
                </div>
              )}

              <div className="flex flex-col space-y-2 pt-2">
                {camPermission !== 'granted' ? (
                  <button
                    onClick={requestCamera}
                    disabled={camPermission === 'requesting'}
                    className="w-full py-3 rounded-xl bg-[#3F4499] hover:bg-[#4a55b0] text-white font-bold text-sm flex items-center justify-center space-x-2 cursor-pointer transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    <span>{camPermission === 'requesting' ? 'Requesting…' : 'Enable Camera & Join'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => joinCall(true)}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Join with Camera</span>
                  </button>
                )}
                <button
                  onClick={() => joinCall(false)}
                  className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer transition-colors"
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
  // STAGE: IN CALL
  // ─────────────────────────────────────────────────────────────────────────

  if (stage === 'in_call') {
    const chars = Object.values(CHARS);

    return (
      <div className="flex-1 flex flex-col bg-[#0f0f1e] text-white overflow-hidden">
        {/* Meeting header */}
        <div className="h-10 bg-[#3F4499]/80 px-4 flex items-center justify-between text-xs font-semibold shrink-0 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Users className="w-4 h-4 text-white/70" />
            <span className="text-white font-bold">Project Titan Kickoff</span>
            <span className="text-white/50">5 participants</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-white/10 px-2 py-0.5 rounded font-mono text-[10px]">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span>{timer}</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Main call grid */}
        <div className="flex-1 grid grid-cols-3 gap-2 p-3 overflow-hidden">
          {/* Character tiles */}
          {chars.map((char) => {
            const isSpeaking = activeSpeaker === char.id && !isScriptDone;
            return (
              <div
                key={char.id}
                className={`relative rounded-2xl overflow-hidden bg-slate-900/80 border-2 transition-all duration-300 ${
                  isSpeaking ? 'border-[var(--c)] shadow-lg' : 'border-white/10'
                }`}
                style={{ '--c': char.color } as React.CSSProperties}
              >
                <img
                  src={char.dp}
                  alt={char.name}
                  className="w-full h-full object-cover object-top"
                />
                {/* Speaking indicator */}
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 border-2 rounded-2xl pointer-events-none"
                    style={{ borderColor: char.color, boxShadow: `0 0 16px ${char.color}55` }}
                  />
                )}
                {/* Name tag */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <div className="px-2 py-1 rounded-lg bg-black/70 backdrop-blur text-[10px] font-bold text-white truncate">
                    {char.name}
                  </div>
                  {isSpeaking && (
                    <div className="flex items-center space-x-0.5 ml-1">
                      {[1, 2, 3].map((b) => (
                        <motion.div
                          key={b}
                          className="w-1 rounded-full"
                          style={{ backgroundColor: char.color, height: 12 }}
                          animate={{ scaleY: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.6, delay: b * 0.1, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Player tile */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-sky-500/30">
            {isCameraOn && streamRef.current ? (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="w-14 h-14 rounded-full bg-sky-600/30 border-2 border-sky-500/50 flex items-center justify-center">
                  <VideoOff className="w-6 h-6 text-sky-400" />
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div className="px-2 py-1 rounded-lg bg-black/70 text-[10px] font-bold text-sky-300 truncate">
                You (Consultant)
              </div>
            </div>
          </div>
        </div>

        {/* Active speech bubble */}
        <AnimatePresence mode="wait">
          {!isScriptDone && currentLine && (
            <motion.div
              key={lineIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mx-3 mb-2 p-3 rounded-xl border flex items-start space-x-3"
              style={{
                backgroundColor: `${currentChar.color}15`,
                borderColor: `${currentChar.color}40`,
              }}
            >
              <img src={currentChar.dp} alt={currentChar.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
              <div>
                <span className="text-[10px] font-bold" style={{ color: currentChar.color }}>
                  {currentChar.name}
                </span>
                <p className="text-sm text-white leading-snug mt-0.5">"{currentLine.text}"</p>
              </div>
            </motion.div>
          )}
          {isScriptDone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-3 mb-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center"
            >
              <p className="text-xs text-emerald-300 font-semibold">Meeting complete. Returning to workstation…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls bar */}
        <div className="h-16 bg-[#1a1a38]/80 border-t border-white/10 flex items-center justify-center space-x-4 shrink-0">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full border transition-all cursor-pointer ${
              isMicOn ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-red-600/80 border-red-500 text-white'
            }`}
          >
            {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-3 rounded-full border transition-all cursor-pointer ${
              isCameraOn ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-700/60 border-white/10 text-slate-400'
            }`}
          >
            {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          <button
            title="Screen Share (unavailable during kickoff)"
            className="p-3 rounded-full bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
          >
            <MonitorUp className="w-4 h-4" />
          </button>

          {isScriptDone && (
            <button
              onClick={endMeeting}
              className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept Mandate & Return to Workstation</span>
            </button>
          )}

          <button
            onClick={endMeeting}
            className="p-3 rounded-full bg-red-600/80 hover:bg-red-600 border border-red-500 text-white cursor-pointer transition-colors"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE: ENDED
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0f0f1e] text-white">
      <div className="text-center space-y-3">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <p className="text-lg font-bold">Kickoff Complete</p>
        <p className="text-xs text-slate-400">Returning to your workstation…</p>
      </div>
    </div>
  );
};
