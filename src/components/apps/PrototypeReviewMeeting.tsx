/**
 * PrototypeReviewMeeting — Day 7 meeting.
 *
 * Format: hybrid Teams call + inline Q&A.
 * Participants: Marcus (CTO), Daniel (PM & Technical Lead), Emma (HR Specialist & Client Lead), Player.
 *
 * Sophia and Olivia do NOT appear in this component. Emma absorbs the client-side
 * HR perspective (Sophia's prior role). Daniel absorbs the security/architecture
 * questioning (Olivia's prior role).
 *
 * Questions dynamically adapt to the player's World State.
 * No LLM. Player types free-form text answers logged as signals.
 *
 * After 5 questions, meeting ends → setPrototypeReviewDone().
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff,
  Send, CheckCircle2, AlertTriangle, Users
} from 'lucide-react';
import { useGame } from '../../context/GameContext';

// ── Characters ────────────────────────────────────────────────────────────────

const CHARS = {
  marcus: { name: 'Marcus Reed', role: 'CTO', dp: '/character/marcus_reed/MarcusDP.png', color: '#3b82f6' },
  daniel: { name: 'Daniel Brooks', role: 'Program Manager & Technical Lead', dp: '/character/Daniel_Brooks/DanielDP.png', color: '#f97316' },
  emma:   { name: 'Emma Carter', role: 'HR Specialist & Client Lead', dp: '/character/Emma_Carter/EmmaDP.png', color: '#10b981' },
};
type CharId = keyof typeof CHARS;

// ── Dynamic Q&A engine ────────────────────────────────────────────────────────

interface Question {
  id: string;
  speaker: CharId;
  text: string;
  followUp?: (answer: string) => { speaker: CharId; text: string } | null;
  signalDimension: string;
  minLength: number; // minimum chars for a "good" answer signal
}

function buildQuestions(
  prototypeBuilt: boolean,
  hasDocumentUpload: boolean,
  hasAuditLogs: boolean,
  hasRBAC: boolean,
  danielContacted: boolean,
): Question[] {
  return [
    {
      id: 'q1',
      speaker: 'daniel',
      text: prototypeBuilt
        ? "Alright — let's start. Can you walk us through where the prototype is right now? What does the employee journey look like end-to-end?"
        : "We were expecting to see a prototype today. Can you explain where things stand and what's been completed so far?",
      signalDimension: 'communication',
      minLength: 80,
    },
    {
      id: 'q2',
      speaker: 'emma',
      text: "From the Titan HR team's perspective, my main concern is the employee experience. Will employees actually find this simpler than the current system? Walk me through a typical leave request.",
      signalDimension: 'business_understanding',
      minLength: 60,
    },
    {
      id: 'q3',
      speaker: 'marcus',
      text: hasRBAC
        ? "I saw you've included role-based access. Can you explain the access model? Who sees what, and how is that enforced?"
        : "I don't see any mention of an access model. Employees, managers and HR admin can't all have the same permissions. How are you handling that?",
      signalDimension: 'security_awareness',
      minLength: 60,
    },
    {
      id: 'q4',
      speaker: 'emma',
      text: hasDocumentUpload
        ? "I see you've included document upload — that's exactly what the HR team flagged. How does the upload flow work for a leave application?"
        : "One thing that's missing — employees need to be able to attach supporting documents to HR requests. This came directly from the plant HR team. Has this been captured?",
      signalDimension: 'requirement_management',
      minLength: 40,
    },
    {
      id: 'q5',
      speaker: 'daniel',
      text: danielContacted
        ? (hasAuditLogs
          ? "We discussed security requirements earlier. Are audit logs and access control part of the current build? Walk us through how that's addressed."
          : "We spoke about the security requirements earlier. I don't see audit logging in the prototype yet. What's the plan for that before production?")
        : "We need to confirm the security posture. Authentication, role-based access, and audit logging are non-negotiables before the board presentation. Where does each of those stand?",
      signalDimension: 'security_awareness',
      minLength: 40,
    },
  ];
}

// ── Timer ─────────────────────────────────────────────────────────────────────

function useTimer(running: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setS((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface PrototypeReviewMeetingProps {
  onClose?: () => void;
}

export const PrototypeReviewMeeting: React.FC<PrototypeReviewMeetingProps> = ({ onClose: _onClose }) => {
  const { state, setPrototypeReviewDone, addSignal } = useGame();

  const hasFeature = (id: string) =>
    state.prototypeFeatures.find((f) => f.id === id)?.included ?? false;

  const questions = buildQuestions(
    state.prototypeBuilt,
    hasFeature('req_document_upload'),
    hasFeature('req_audit_logs'),
    hasFeature('req_rbac'),
    state.stakeholderContacted['daniel'] ?? false,
  );

  const [stage, setStage] = useState<'permission' | 'in_call' | 'wrap_up' | 'ended'>('permission');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [showFollowUp, setShowFollowUp] = useState<{ speaker: CharId; text: string } | null>(null);

  const timer = useTimer(stage === 'in_call');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [questionIdx, feedbackMsg, showFollowUp]);

  // ── Camera ──────────────────────────────────────────────────────────────────

  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(() => {});
    }
  }, []);

  const requestCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setIsCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch {
      // denied — continue without camera
    }
  }, []);

  const joinCall = useCallback(async (withCamera: boolean) => {
    if (withCamera) await requestCamera();
    setStage('in_call');
    if (!withCamera) addSignal('communication', 'Joined prototype review without camera', -3);
  }, [requestCamera, addSignal]);

  const toggleCamera = useCallback(() => {
    if (!isCameraOn) {
      requestCamera();
    } else {
      streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = false; });
      setIsCameraOn(false);
    }
  }, [isCameraOn, requestCamera]);

  const toggleMic = useCallback(() => {
    setIsMicOn((prev) => {
      streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = prev; });
      return !prev;
    });
  }, []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  // ── Answer submission ────────────────────────────────────────────────────────

  const handleSubmitAnswer = useCallback(() => {
    if (!currentInput.trim() || submitting) return;
    const q = questions[questionIdx];
    setSubmitting(true);

    // Log signal
    const quality = currentInput.trim().length >= q.minLength ? 10 : 4;
    addSignal(q.signalDimension, `Prototype review Q${questionIdx + 1} answer`, quality);
    setAnswers((prev) => ({ ...prev, [q.id]: currentInput.trim() }));

    // Simulate character acknowledgement
    setTimeout(() => {
      setFeedbackMsg(generateAck(q.speaker, currentInput.trim(), q));
      setSubmitting(false);

      // After ack, advance to next question
      setTimeout(() => {
        setFeedbackMsg(null);
        setShowFollowUp(null);
        if (questionIdx >= questions.length - 1) {
          setStage('wrap_up');
        } else {
          setQuestionIdx((i) => i + 1);
          setCurrentInput('');
        }
      }, 2500);
    }, 1000);
  }, [currentInput, questionIdx, questions, submitting, addSignal]);

  const endMeeting = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setPrototypeReviewDone();
    setStage('ended');
  }, [setPrototypeReviewDone]);

  // ── Ack generator (deterministic) ────────────────────────────────────────────

  function generateAck(speaker: CharId, answer: string, q: Question): string {
    const isGood = answer.length >= q.minLength;
    const acks: Record<CharId, [string, string]> = {
      marcus: [
        "Understood. Document that and make sure it's reflected in the architecture.",
        "That's not specific enough. I need to see it documented, not explained verbally.",
      ],
      daniel: [
        "Good. Keep that level of clarity for the final presentation.",
        "We'll need more detail before Day 14. Make a note of that gap.",
      ],
      emma: [
        "That makes sense from an HR workflow perspective. Thank you.",
        "I'm not sure employees will find that intuitive. Think about the plant floor context.",
      ],
    };
    return acks[speaker as keyof typeof acks]?.[isGood ? 0 : 1] ?? "Understood. Thank you.";
    return acks[speaker][isGood ? 0 : 1];
  }

  const currentQ = questions[questionIdx];
  const currentChar = CHARS[currentQ?.speaker ?? 'daniel'];

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE: PERMISSION
  // ─────────────────────────────────────────────────────────────────────────

  if (stage === 'permission') {
    return (
      <div className="flex-1 flex flex-col bg-[#1a1a2e] text-white overflow-hidden">
        <div className="h-10 bg-[#3F4499] px-4 flex items-center space-x-2 text-xs font-semibold border-b border-white/10 shrink-0">
          <Video className="w-4 h-4" />
          <span>Microsoft Teams — Prototype Review · Day 7</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-[#252540]/90 rounded-2xl border border-white/10 overflow-hidden">
            <div className="bg-[#3F4499]/60 px-5 py-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <img src={CHARS.marcus.dp} alt="Marcus" className="w-9 h-9 rounded-full object-cover border-2 border-blue-400/60" />
                <div>
                  <p className="text-xs font-bold text-white">Prototype Review — 4 participants</p>
                  <p className="text-[10px] text-slate-400">Marcus, Daniel, Emma • Day 7</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                This is the mid-engagement prototype review. You'll be asked to walk through your current prototype and answer questions from the team.
              </p>
              {!state.prototypeBuilt && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">You haven't built a prototype yet. You can still attend, but expect difficult questions.</p>
                </div>
              )}
              <div className="space-y-2">
                <button onClick={() => joinCall(true)} className="w-full py-2.5 rounded-xl bg-[#3F4499] hover:bg-[#4a55b0] text-white font-bold text-sm flex items-center justify-center space-x-2 cursor-pointer">
                  <Video className="w-4 h-4" /><span>Join with Camera</span>
                </button>
                <button onClick={() => joinCall(false)} className="w-full py-2 text-slate-400 hover:text-white text-xs cursor-pointer transition-colors">
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
  // STAGE: WRAP_UP
  // ─────────────────────────────────────────────────────────────────────────

  if (stage === 'wrap_up') {
    const answered = Object.keys(answers).length;
    return (
      <div className="flex-1 flex flex-col bg-[#0f0f1e] text-white overflow-hidden">
        <div className="h-10 bg-[#3F4499]/80 px-4 flex items-center space-x-2 text-xs font-semibold border-b border-white/10 shrink-0">
          <Users className="w-4 h-4" /><span>Prototype Review — Wrap Up</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full space-y-5 text-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">Review Complete</h2>
            <div className="text-left space-y-3 bg-slate-800/50 rounded-2xl p-5 border border-white/10">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Daniel summarised:</p>
              <p className="text-sm text-slate-200 leading-relaxed">
                "Good session. There are a few open points — particularly around security and the amendment from Emma. Make sure everything is addressed before Day 14.
                {!hasFeature('req_document_upload') && ' Document upload is still an outstanding requirement.'}
                {!state.stakeholderContacted['daniel'] && ' Security and architecture review needs to happen urgently.'}
                {' '}Next checkpoint is the final presentation — board level."
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-800/60 rounded-xl p-3">
                <p className="text-slate-400 mb-1">Questions answered</p>
                <p className="text-2xl font-bold text-white">{answered}/{questions.length}</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3">
                <p className="text-slate-400 mb-1">Prototype built</p>
                <p className={`text-2xl font-bold ${state.prototypeBuilt ? 'text-emerald-400' : 'text-red-400'}`}>
                  {state.prototypeBuilt ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3">
                <p className="text-slate-400 mb-1">Days to deadline</p>
                <p className="text-2xl font-bold text-amber-400">{Math.max(0, 14 - state.clock.day)}</p>
              </div>
            </div>
            <button
              onClick={endMeeting}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm cursor-pointer flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Return to Workstation</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE: ENDED
  // ─────────────────────────────────────────────────────────────────────────

  if (stage === 'ended') {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0f0f1e] text-white">
        <div className="text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <p className="font-semibold">Prototype Review logged.</p>
          <p className="text-xs text-slate-400">Returning to workstation…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE: IN CALL
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f1e] text-white overflow-hidden">
      {/* Header */}
      <div className="h-10 bg-[#3F4499]/80 px-4 flex items-center justify-between text-xs font-semibold shrink-0 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <Users className="w-4 h-4 text-white/70" />
          <span>Prototype Review · Day 7</span>
          <span className="text-white/50">5 participants</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-white/10 px-2 py-0.5 rounded font-mono text-[10px]">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span>{timer}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Character tiles — left column */}
        <div className="w-40 border-r border-white/10 p-2 space-y-2 overflow-y-auto shrink-0">
          {Object.values(CHARS).map((char) => {
            const isActive = currentQ?.speaker === char.name.toLowerCase().split(' ')[0]
              || currentQ?.speaker === (char === CHARS.marcus ? 'marcus' : char === CHARS.daniel ? 'daniel' : 'emma');
            return (
              <div key={char.name} className={`relative rounded-xl overflow-hidden border-2 transition-all ${isActive ? 'border-[var(--c)]' : 'border-white/10'}`}
                style={{ '--c': char.color } as React.CSSProperties}>
                <img src={char.dp} alt={char.name} className="w-full aspect-square object-cover object-top" />
                <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white truncate">
                  {char.name.split(' ')[0]}
                </div>
                {isActive && (
                  <div className="absolute top-1 right-1 flex space-x-0.5">
                    {[0,1,2].map((i) => (
                      <motion.div key={i} className="w-1 h-3 rounded-full"
                        style={{ backgroundColor: char.color }}
                        animate={{ scaleY: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Player tile */}
          <div className="relative rounded-xl overflow-hidden border-2 border-sky-500/40">
            {isCameraOn && streamRef.current ? (
              <video ref={attachVideo} autoPlay muted playsInline className="w-full aspect-square object-cover scale-x-[-1]" />
            ) : (
              <div className="w-full aspect-square bg-slate-800 flex items-center justify-center">
                <VideoOff className="w-6 h-6 text-slate-500" />
              </div>
            )}
            <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-sky-300 truncate">You</div>
          </div>
        </div>

        {/* Q&A area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Progress */}
          <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center space-x-2">
              {questions.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${
                  i < questionIdx ? 'bg-emerald-400' : i === questionIdx ? 'bg-sky-400' : 'bg-white/20'
                }`} />
              ))}
            </div>
            <span className="text-slate-400">Question {questionIdx + 1} of {questions.length}</span>
          </div>

          {/* Chat log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Previously answered questions */}
            {questions.slice(0, questionIdx).map((q) => {
              const char = CHARS[q.speaker];
              return (
                <div key={q.id} className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <img src={char.dp} alt={char.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                    <div className="bg-slate-800/60 rounded-xl rounded-tl-none p-3 max-w-[80%]">
                      <p className="text-[10px] font-bold mb-1" style={{ color: char.color }}>{char.name}</p>
                      <p className="text-xs text-slate-200">{q.text}</p>
                    </div>
                  </div>
                  {answers[q.id] && (
                    <div className="flex justify-end">
                      <div className="bg-sky-600/30 border border-sky-500/30 rounded-xl rounded-tr-none p-3 max-w-[80%]">
                        <p className="text-[10px] font-bold text-sky-400 mb-1">You</p>
                        <p className="text-xs text-slate-200">{answers[q.id]}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Current question */}
            {currentQ && (
              <AnimatePresence mode="wait">
                <motion.div key={questionIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start space-x-2">
                  <img src={currentChar.dp} alt={currentChar.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  <div className="rounded-xl rounded-tl-none p-3 max-w-[80%] border"
                    style={{ backgroundColor: `${currentChar.color}15`, borderColor: `${currentChar.color}40` }}>
                    <p className="text-[10px] font-bold mb-1" style={{ color: currentChar.color }}>{currentChar.name}</p>
                    <p className="text-sm text-white leading-relaxed">{currentQ.text}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Character feedback */}
            {feedbackMsg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start space-x-2">
                <img src={currentChar.dp} alt={currentChar.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                <div className="bg-slate-800/40 rounded-xl rounded-tl-none p-3 max-w-[75%] border border-white/10">
                  <p className="text-xs text-slate-300 italic">"{feedbackMsg}"</p>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 space-y-2 shrink-0">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitAnswer(); } }}
              disabled={!!feedbackMsg || submitting}
              placeholder="Type your response… (Enter to send)"
              className="w-full bg-slate-800/60 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none disabled:opacity-40"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <span className={`text-[10px] ${currentInput.length >= (currentQ?.minLength ?? 80) ? 'text-emerald-400' : 'text-slate-500'}`}>
                {currentInput.length} / {currentQ?.minLength ?? 80} chars recommended
              </span>
              <button
                onClick={handleSubmitAnswer}
                disabled={!currentInput.trim() || !!feedbackMsg || submitting}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-14 bg-[#1a1a38]/80 border-t border-white/10 flex items-center justify-center space-x-3 shrink-0">
        <button onClick={toggleMic} className={`p-2.5 rounded-full border cursor-pointer transition-all ${isMicOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-600/80 border-red-500 text-white'}`}>
          {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
        <button onClick={toggleCamera} className={`p-2.5 rounded-full border cursor-pointer transition-all ${isCameraOn ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-700 border-white/10 text-slate-400'}`}>
          {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </button>
        <button onClick={endMeeting} className="p-2.5 rounded-full bg-red-600/80 hover:bg-red-600 border border-red-500 text-white cursor-pointer">
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
