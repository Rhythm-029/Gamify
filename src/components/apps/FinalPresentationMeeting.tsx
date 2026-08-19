/**
 * FinalPresentationMeeting — Day 14 board presentation.
 *
 * Board: Marcus (CTO), Daniel (PM & Technical Lead), Emma (HR Specialist & Client Lead), Aarav (Mentor observer).
 * Sophia and Olivia do NOT appear here.
 *
 * - Camera + microphone required
 * - MediaRecorder records the player's presentation audio
 * - After presentation ends, recording is uploaded to backend → Whisper → evaluation
 * - No script — player speaks freely
 * - Board asks 3 follow-up questions based on World State
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, VideoOff, Mic, MicOff,
  Radio, Square, CheckCircle2, AlertTriangle,
  Clock, Users, Upload
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { API_BASE } from '../../context/GameContext';

// ── Characters ────────────────────────────────────────────────────────────────

const BOARD = {
  marcus: { name: 'Marcus Reed', role: 'CTO', dp: '/character/marcus_reed/MarcusDP.png', color: '#3b82f6' },
  daniel: { name: 'Daniel Brooks', role: 'Program Manager & Technical Lead', dp: '/character/Daniel_Brooks/DanielDP.png', color: '#f97316' },
  emma:   { name: 'Emma Carter', role: 'HR Specialist & Client Lead', dp: '/character/Emma_Carter/EmmaDP.png', color: '#10b981' },
  aarav:  { name: 'Aarav Kapoor', role: 'Senior Advisor (Observer)', dp: '/character/AaravDP.png', color: '#8b5cf6' },
};
type BoardMember = keyof typeof BOARD;

// ── Follow-up questions (world-state adaptive) ─────────────────────────────────

function buildFollowUpQuestions(
  _prototypeBuilt: boolean,
  danielContacted: boolean,
  hasAuditLogs: boolean,
  _hasDocUpload: boolean,
): Array<{ speaker: BoardMember; text: string }> {
  const qs: Array<{ speaker: BoardMember; text: string }> = [];

  // Q1 — Emma (client HR perspective, Sophia's old slot)
  qs.push({
    speaker: 'emma',
    text: "From the Titan HR team's perspective — if we deploy this tomorrow, what's the one thing an employee will immediately do differently because of this portal?",
  });

  // Q2 — Daniel (security/audit, Olivia's old slot)
  if (!danielContacted || !hasAuditLogs) {
    qs.push({
      speaker: 'daniel',
      text: "I want to understand the auditability of this system. If an employee's data is accessed incorrectly, what trace do we have? Is audit logging in scope?",
    });
  } else {
    qs.push({
      speaker: 'daniel',
      text: "We discussed audit logging earlier. Can you confirm that's been implemented and give us the scope of what's captured?",
    });
  }

  // Q3 — Marcus (overall risks)
  qs.push({
    speaker: 'marcus',
    text: "What are the top two risks you'd flag for the production rollout, and how would you recommend we mitigate them?",
  });

  return qs;
}

// ── Timer ─────────────────────────────────────────────────────────────────────

function useTimer(running: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setS((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return { time: `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`, seconds: s };
}

// ── Component ─────────────────────────────────────────────────────────────────

export const FinalPresentationMeeting: React.FC = () => {
  const { state, setPresentationDone, addSignal } = useGame();

  const hasFeature = (id: string) =>
    state.prototypeFeatures.find((f) => f.id === id)?.included ?? false;

  const followUpQuestions = buildFollowUpQuestions(
    state.prototypeBuilt,
    state.stakeholderContacted['daniel'] ?? false,
    hasFeature('req_audit_logs'),
    hasFeature('req_document_upload'),
  );

  type Stage = 'permission' | 'pre_brief' | 'presenting' | 'follow_up' | 'upload' | 'done';
  const [stage, setStage] = useState<Stage>('permission');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);
  const playerVideoRef = useRef<HTMLVideoElement | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDone, setUploadDone] = useState(false);

  const [fqIdx, setFqIdx] = useState(0);
  const [fqAnswers, setFqAnswers] = useState<string[]>([]);
  const [fqInput, setFqInput] = useState('');
  const [fqSubmitting, setFqSubmitting] = useState(false);
  const [fqFeedback, setFqFeedback] = useState<string | null>(null);

  const { time } = useTimer(stage === 'presenting');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [fqIdx, fqFeedback]);

  // ── Camera/Mic ────────────────────────────────────────────────────────────────

  const attachPlayerVideo = useCallback((node: HTMLVideoElement | null) => {
    playerVideoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(() => {});
    }
  }, []);

  const requestMedia = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setIsCameraOn(true);
      if (playerVideoRef.current) {
        playerVideoRef.current.srcObject = stream;
        playerVideoRef.current.play().catch(() => {});
      }
      return true;
    } catch { return false; }
  }, []);

  const toggleCamera = useCallback(() => {
    streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsCameraOn((p) => !p);
  }, []);

  const toggleMic = useCallback(() => {
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsMicOn((p) => !p);
  }, []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    recorderRef.current?.stop();
  }, []);

  const handleJoin = useCallback(async (withCamera: boolean) => {
    if (withCamera) {
      const ok = await requestMedia();
      if (!ok) addSignal('communication', 'Camera/mic permission denied for final presentation', -10);
    }
    setStage('pre_brief');
  }, [requestMedia, addSignal]);

  const startPresentation = useCallback(() => {
    if (!streamRef.current) addSignal('communication', 'No camera/mic during final presentation', -15);

    if (streamRef.current) {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      try {
        const recorder = new MediaRecorder(streamRef.current, { mimeType });
        chunksRef.current = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          setRecordingBlob(blob);
        };
        recorder.start(1000);
        recorderRef.current = recorder;
        setIsRecording(true);
      } catch { /* continue without recording */ }
    }

    addSignal('delivery_management', 'Started final presentation', 10);
    setStage('presenting');
  }, [addSignal]);

  const stopPresentation = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
      setIsRecording(false);
    }
    setStage('follow_up');
    addSignal('communication', 'Completed verbal presentation', 15);
  }, [addSignal]);

  // ── Follow-up Q&A ──────────────────────────────────────────────────────────

  const handleFqAnswer = useCallback(() => {
    if (!fqInput.trim() || fqSubmitting) return;
    setFqSubmitting(true);
    addSignal('communication', `Board Q${fqIdx + 1} answered`, fqInput.trim().length > 60 ? 10 : 4);
    setFqAnswers((prev) => [...prev, fqInput.trim()]);

    setTimeout(() => {
      setFqFeedback(generateBoardAck(followUpQuestions[fqIdx].speaker, fqInput.trim()));
      setFqSubmitting(false);

      setTimeout(() => {
        setFqFeedback(null);
        if (fqIdx >= followUpQuestions.length - 1) {
          uploadRecording();
        } else {
          setFqIdx((i) => i + 1);
          setFqInput('');
        }
      }, 2500);
    }, 1200);
  }, [fqInput, fqIdx, fqSubmitting, followUpQuestions, addSignal]); // eslint-disable-line

  function generateBoardAck(speaker: BoardMember, answer: string): string {
    const good = answer.length > 60;
    const acks: Record<BoardMember, string> = {
      emma:   good ? "That's helpful from the employee perspective. Thank you." : "I'd like to hear more specifics on the employee journey.",
      daniel: good ? "Good. That aligns with what I'd expect from a production-grade system." : "The security posture needs to be clearer. I'll follow up after this meeting.",
      marcus: good ? "Understood. Make sure that's documented before production." : "Too vague. The board needs concrete answers.",
      aarav:  good ? "Good. That's the level of thinking I'd expect." : "Keep developing this line of thinking.",
    };
    return acks[speaker];
  }

  const uploadRecording = useCallback(async () => {
    setStage('upload');
    const sid = localStorage.getItem('brained_session_id');

    if (!recordingBlob || !sid) {
      await simulateProgress();
      finalize(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('audio', recordingBlob, 'presentation.webm');
      formData.append('session_id', sid);
      formData.append('answers', JSON.stringify(fqAnswers));

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => { setUploadProgress(100); setUploadDone(true); finalize(true); };
      xhr.onerror = async () => { await simulateProgress(); finalize(false); };

      xhr.open('POST', `${API_BASE}/api/game/presentation/upload`);
      xhr.send(formData);
    } catch {
      await simulateProgress();
      finalize(false);
    }
  }, [recordingBlob, fqAnswers]); // eslint-disable-line

  async function simulateProgress() {
    for (let i = 10; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 300));
      setUploadProgress(i);
    }
    setUploadDone(true);
  }

  function finalize(uploaded: boolean) {
    addSignal('delivery_management', uploaded ? 'Presentation recording uploaded' : 'Presentation completed (no recording)', uploaded ? 20 : 10);
    setPresentationDone(isCameraOn);
    setTimeout(() => setStage('done'), 1500);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  if (stage === 'permission') {
    return (
      <div className="flex-1 flex flex-col bg-[#1a1a2e] text-white overflow-hidden">
        <div className="h-10 bg-[#6d28d9] px-4 flex items-center space-x-2 text-xs font-semibold border-b border-white/10 shrink-0">
          <Users className="w-4 h-4" />
          <span>Microsoft Teams — Project Titan · Final Presentation · Day 14</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-[#1e1e38]/95 rounded-2xl border border-purple-500/20 overflow-hidden shadow-2xl shadow-purple-500/10">
            <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 px-5 py-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Project Titan — Final Presentation</p>
                  <p className="text-[10px] text-slate-400">Marcus · Daniel · Emma · Aarav (Observer)</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Camera', val: isCameraOn ? 'Ready' : 'Required', ok: isCameraOn },
                  { label: 'Audio recording', val: 'Will be captured', ok: null },
                  { label: 'Prototype built', val: state.prototypeBuilt ? 'Yes' : 'No — high risk', ok: state.prototypeBuilt },
                ].map(({ label, val, ok }) => (
                  <div key={label} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                    <span className="text-slate-400">{label}</span>
                    <span className={`font-bold ${ok === null ? 'text-amber-400' : ok ? 'text-emerald-400' : 'text-red-400'}`}>{val}</span>
                  </div>
                ))}
              </div>

              {!state.prototypeBuilt && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">No prototype has been built. Expect very difficult questions from the board.</p>
                </div>
              )}

              <button onClick={() => handleJoin(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-purple-500/20">
                <Video className="w-4 h-4" />
                <span>Enable Camera & Join</span>
              </button>
              <button onClick={() => handleJoin(false)} className="w-full text-slate-500 hover:text-white text-xs cursor-pointer py-1 transition-colors">
                Join without camera (not recommended)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const CharGrid = ({ highlight }: { highlight?: boolean }) => (
    <div className="grid grid-cols-2 gap-2 p-3 flex-1 overflow-hidden">
      {Object.values(BOARD).map((char) => (
        <div key={char.name} className={`relative rounded-2xl overflow-hidden border ${highlight ? 'border-white/20' : 'border-white/10'} bg-slate-900/60`}>
          <img src={char.dp} alt={char.name} className="w-full h-full object-cover object-top aspect-video" />
          <div className="absolute bottom-2 left-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 text-[9px] font-bold text-white truncate">
            {char.name} <span className="text-slate-400 font-normal">· {char.role}</span>
          </div>
        </div>
      ))}
      {/* Player tile */}
      <div className={`relative rounded-2xl overflow-hidden border-2 ${highlight ? 'border-red-500/60' : 'border-purple-500/40'} bg-slate-900`}>
        {isCameraOn
          ? <video ref={attachPlayerVideo} autoPlay muted playsInline className="w-full aspect-video object-cover scale-x-[-1]" />
          : <div className="w-full aspect-video flex items-center justify-center bg-slate-800">
              {highlight ? <Mic className="w-8 h-8 text-red-400 animate-pulse" /> : <VideoOff className="w-8 h-8 text-slate-500" />}
            </div>}
        {highlight && (
          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-red-600/80 px-2 py-0.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[9px] font-bold text-white">REC {time}</span>
          </div>
        )}
        <div className="absolute bottom-2 left-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 text-[9px] font-bold text-purple-300">
          You {highlight ? '(Speaking)' : '(Presenting)'}
        </div>
      </div>
    </div>
  );

  if (stage === 'pre_brief') return (
    <div className="flex-1 flex flex-col bg-[#0f0f1e] text-white overflow-hidden">
      <div className="h-10 bg-[#6d28d9]/80 px-4 flex items-center space-x-2 text-xs font-semibold border-b border-white/10 shrink-0">
        <Users className="w-4 h-4" />
        <span>Final Presentation — Board is ready</span>
      </div>
      <CharGrid />
      <div className="p-5 border-t border-white/10 space-y-3 bg-[#0a0a18] shrink-0">
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-white">The board is waiting for your presentation.</p>
          <p className="text-xs text-slate-400">Speak clearly about the transformation journey, your prototype, key decisions, and outstanding risks. Your audio will be recorded and evaluated.</p>
        </div>
        <button onClick={startPresentation}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-purple-500/20">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>Start Presentation</span>
        </button>
      </div>
    </div>
  );

  if (stage === 'presenting') return (
    <div className="flex-1 flex flex-col bg-[#0f0f1e] text-white overflow-hidden">
      <div className="h-10 bg-[#6d28d9]/80 px-4 flex items-center justify-between text-xs font-semibold border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 font-bold">RECORDING</span>
        </div>
        <div className="flex items-center space-x-2 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-white font-bold">{time}</span>
        </div>
      </div>
      <CharGrid highlight />
      <div className="p-4 border-t border-white/10 space-y-3 bg-[#0a0a18] shrink-0">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-white">Speak to cover:</p>
          <div className="grid grid-cols-2 gap-1 text-slate-400">
            <span>✓ What the portal solves</span>
            <span>✓ Key design decisions</span>
            <span>✓ Feature coverage</span>
            <span>✓ Outstanding risks</span>
            <span>✓ Timeline achieved</span>
            <span>✓ Recommended next steps</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={toggleMic} className={`p-2.5 rounded-full border cursor-pointer ${isMicOn ? 'bg-white/10 border-white/20' : 'bg-red-600/80 border-red-500'}`}>
            {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
          <button onClick={toggleCamera} className={`p-2.5 rounded-full border cursor-pointer ${isCameraOn ? 'bg-white/10 border-white/20' : 'bg-slate-700 border-white/10 text-slate-400'}`}>
            {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>
          <button onClick={stopPresentation}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm cursor-pointer shadow-lg shadow-amber-500/20">
            <Square className="w-4 h-4" />
            <span>End Presentation — Board Q&A</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (stage === 'follow_up') {
    const currentFq = followUpQuestions[fqIdx];
    const currentBoardChar = BOARD[currentFq?.speaker ?? 'marcus'];

    return (
      <div className="flex-1 flex flex-col bg-[#0f0f1e] text-white overflow-hidden">
        <div className="h-10 bg-[#6d28d9]/80 px-4 flex items-center justify-between text-xs font-semibold border-b border-white/10 shrink-0">
          <span>Board Q&A — {fqIdx + 1} of {followUpQuestions.length}</span>
          <span className="text-slate-400">Presentation ended</span>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Mini character row */}
          <div className="w-32 border-r border-white/10 p-2 space-y-2 overflow-y-auto shrink-0">
            {Object.entries(BOARD).map(([key, char]) => {
              const isActive = currentFq?.speaker === key;
              return (
                <div key={key} className={`relative rounded-xl overflow-hidden border-2 transition-all ${isActive ? 'border-[var(--c)]' : 'border-white/10'}`}
                  style={{ '--c': char.color } as React.CSSProperties}>
                  <img src={char.dp} alt={char.name} className="w-full aspect-square object-cover object-top" />
                  <div className="absolute bottom-0.5 left-0.5 right-0.5 px-1 py-0.5 rounded bg-black/70 text-[8px] font-bold text-white truncate">
                    {char.name.split(' ')[0]}
                  </div>
                  {isActive && (
                    <div className="absolute top-1 right-1 flex space-x-0.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div key={i} className="w-0.5 h-2.5 rounded-full"
                          style={{ backgroundColor: char.color }}
                          animate={{ scaleY: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Q&A chat */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {followUpQuestions.slice(0, fqIdx).map((q, i) => {
                const char = BOARD[q.speaker];
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <img src={char.dp} alt={char.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      <div className="rounded-xl rounded-tl-none p-3 max-w-[80%] border text-xs" style={{ backgroundColor: `${char.color}10`, borderColor: `${char.color}30` }}>
                        <p className="font-bold mb-1" style={{ color: char.color }}>{char.name}</p>
                        <p className="text-slate-200">{q.text}</p>
                      </div>
                    </div>
                    {fqAnswers[i] && (
                      <div className="flex justify-end">
                        <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl rounded-tr-none p-3 max-w-[80%] text-xs">
                          <p className="font-bold text-purple-300 mb-1">You</p>
                          <p className="text-slate-200">{fqAnswers[i]}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {currentFq && (
                <AnimatePresence mode="wait">
                  <motion.div key={fqIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start space-x-2">
                    <img src={currentBoardChar.dp} alt={currentBoardChar.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                    <div className="rounded-xl rounded-tl-none p-3 max-w-[80%] border text-xs" style={{ backgroundColor: `${currentBoardChar.color}15`, borderColor: `${currentBoardChar.color}40` }}>
                      <p className="font-bold mb-1" style={{ color: currentBoardChar.color }}>{currentBoardChar.name}</p>
                      <p className="text-sm text-white leading-relaxed">{currentFq.text}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {fqFeedback && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start space-x-2">
                  <img src={currentBoardChar.dp} alt={currentBoardChar.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  <div className="bg-slate-800/50 rounded-xl rounded-tl-none p-3 max-w-[75%] border border-white/10 text-xs text-slate-300 italic">
                    "{fqFeedback}"
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-white/10 space-y-2 shrink-0">
              <textarea
                value={fqInput}
                onChange={(e) => setFqInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFqAnswer(); } }}
                disabled={!!fqFeedback || fqSubmitting}
                placeholder="Type your response… (Enter to send)"
                className="w-full bg-slate-800/60 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none disabled:opacity-40"
                rows={3}
              />
              <div className="flex justify-end">
                <button onClick={handleFqAnswer} disabled={!fqInput.trim() || !!fqFeedback || fqSubmitting}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold cursor-pointer">
                  <span>Send Response</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'upload') return (
    <div className="flex-1 flex items-center justify-center bg-[#0f0f1e] text-white">
      <div className="w-full max-w-sm space-y-6 text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto">
          <Upload className="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white mb-2">{uploadDone ? 'Evaluation in Progress…' : 'Uploading Presentation Recording'}</h2>
          <p className="text-xs text-slate-400">{uploadDone ? 'Your presentation is being analysed.' : 'Sending your recording to the evaluation pipeline…'}</p>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
              initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.4 }} />
          </div>
          <p className="text-xs text-slate-500 font-mono">{uploadProgress}%</p>
        </div>
        {uploadDone && (
          <div className="space-y-2 text-xs text-slate-400">
            {['Whisper transcription', 'World State cross-reference'].map((s) => (
              <div key={s} className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-xl">
                <span>{s}</span><span className="text-emerald-400">✓ Complete</span>
              </div>
            ))}
            <div className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-xl">
              <span>Generating final report…</span>
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="text-amber-400">Processing</motion.span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0f0f1e] text-white">
      <div className="text-center space-y-3">
        <CheckCircle2 className="w-12 h-12 text-purple-400 mx-auto" />
        <p className="font-bold text-lg">Presentation Complete</p>
        <p className="text-xs text-slate-400">Your final report is being prepared…</p>
      </div>
    </div>
  );
};
