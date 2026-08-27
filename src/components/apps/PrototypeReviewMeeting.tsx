/**
 * PrototypeReviewMeeting — Day 7 milestone meeting.
 *
 * Participants: Marcus Reed (CTO), Daniel Brooks (PM), Emma Carter (HR Specialist).
 *
 * Flow:
 * 1. Marcus asks for the live prototype link.
 * 2. If Prototype IS Built:
 *    - A prominent "🔗 Share Prototype Link (http://localhost:5173)" button appears.
 *    - Marcus confirms receipt: "Link received! http://localhost:5173 looks great."
 *    - Marcus & Emma ask 2 clear, non-techy strategic questions with selectable options.
 *    - Options give scored marks (+15 best, +10 good, +2 poor) logged to GameContext signals.
 *    - Positive remarks & ready for Day 14 presentation.
 * 3. If Prototype IS NOT Built:
 *    - Marcus & Daniel express disappointment and apply -15 Trust Score penalty.
 *    - Urge player to open Cera IDE immediately.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff,
  Send, CheckCircle2, AlertTriangle, Users, ExternalLink, Link2, Sparkles, Check
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { getCeraState } from '../apps/cera/ceraStore';

// ── Characters ────────────────────────────────────────────────────────────────

const CHARS = {
  marcus: { name: 'Marcus Reed', role: 'CTO', dp: '/character/marcus_reed/MarcusDP.png', color: '#3b82f6' },
  daniel: { name: 'Daniel Brooks', role: 'Program Manager', dp: '/character/Daniel_Brooks/DanielDP.png', color: '#f97316' },
  emma:   { name: 'Emma Carter', role: 'HR Transformation Lead', dp: '/character/Emma_Carter/EmmaDP.png', color: '#10b981' },
};
type CharId = keyof typeof CHARS;

interface StrategicQuestion {
  id: string;
  speaker: CharId;
  question: string;
  options: {
    id: string;
    label: string;
    description: string;
    marks: number;
    feedback: string;
  }[];
}

const STRATEGIC_QUESTIONS: StrategicQuestion[] = [
  {
    id: 'sq1',
    speaker: 'emma',
    question: 'From an HR operations perspective, how did you prioritize employee leave approvals versus supporting document uploads for plant supervisors?',
    options: [
      {
        id: 'sq1_opt_a',
        label: 'Prioritized 1-click leave approvals first for plant floor managers, with document uploads deferred to Sprint 2.',
        description: 'Recommended strategy matching Daniel Brooks\' approved brief.',
        marks: 15,
        feedback: 'Excellent strategic choice! Shift supervisors need fast 1-click approvals without getting bogged down by attachments.',
      },
      {
        id: 'sq1_opt_b',
        label: 'Built both approvals and document upload simultaneously into the core leave workflow.',
        description: 'Comprehensive scope approach.',
        marks: 10,
        feedback: 'Good balance. Document upload is useful, though keeping the core approval flow fast was the main priority.',
      },
      {
        id: 'sq1_opt_c',
        label: 'Focused only on payroll data calculation and skipped leave workflows.',
        description: 'Non-aligned scope choice.',
        marks: 2,
        feedback: 'That leaves a major gap for plant floor supervisors who need daily leave approval tools.',
      },
    ],
  },
  {
    id: 'sq2',
    speaker: 'marcus',
    question: 'How will plant floor workers on night shifts access this HR portal easily without getting blocked by complex password resets?',
    options: [
      {
        id: 'sq2_opt_a',
        label: 'Implemented Enterprise Single Sign-On (SSO) with shared terminal quick-switch for plant shifts.',
        description: 'CTO Marcus Reed\'s recommended enterprise identity model.',
        marks: 15,
        feedback: 'Spot on! Enterprise SSO eliminates password reset overhead while maintaining strict audit logging for shift workers.',
      },
      {
        id: 'sq2_opt_b',
        label: 'Standard email and password authentication for every worker.',
        description: 'Basic password authentication.',
        marks: 8,
        feedback: 'Acceptable, though shift workers on shared terminals may face password lockouts during night shifts.',
      },
      {
        id: 'sq2_opt_c',
        label: 'No authentication required — public access on plant floor terminals.',
        description: 'Unsecured access model.',
        marks: 0,
        feedback: 'That creates a critical security risk for employee personal data and GDPR compliance.',
      },
    ],
  },
];

function useTimer(running: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setS((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

interface ChatLogMessage {
  id: string;
  sender: 'marcus' | 'daniel' | 'emma' | 'player';
  text: string;
  isLink?: boolean;
}

export const PrototypeReviewMeeting: React.FC = () => {
  const { state, setPrototypeReviewDone, addSignal } = useGame();
  const cera = getCeraState();

  const isPrototypeReady = state.prototypeBuilt || cera.isBuildFinished || cera.generatedFiles.length > 0;

  const [stage, setStage] = useState<'permission' | 'in_call' | 'wrap_up' | 'ended'>('permission');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Call state
  const [linkShared, setLinkShared] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [chatLogs, setChatLogs] = useState<ChatLogMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [meetingScore, setMeetingScore] = useState(0);

  const timer = useTimer(stage === 'in_call');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs, stage]);

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

    // Initialize call conversation
    if (isPrototypeReady) {
      setChatLogs([
        {
          id: 'msg-1',
          sender: 'marcus',
          text: 'Welcome everyone to the Day 7 Prototype Review. I see the Project Titan prototype build is complete in Cera IDE. Please share the live link for your prototype so we can test it.',
        },
      ]);
    } else {
      setChatLogs([
        {
          id: 'msg-1',
          sender: 'marcus',
          text: 'Welcome everyone to the Day 7 Prototype Review. We were expecting a live prototype link today, but no prototype has been generated yet.',
        },
        {
          id: 'msg-2',
          sender: 'daniel',
          text: 'We cannot present to the Board of Directors on Day 14 without a working prototype. Please get into Cera IDE today and finish vibe coding immediately.',
        },
      ]);
      addSignal('delivery_management', 'Missed prototype delivery for Day 7 review', -15);
    }
  }, [isPrototypeReady, requestCamera, addSignal]);

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

  const handleShareLink = () => {
    if (linkShared) return;
    setLinkShared(true);

    const newLogs: ChatLogMessage[] = [
      ...chatLogs,
      {
        id: `msg-user-link-${Date.now()}`,
        sender: 'player',
        text: 'Shared live prototype link: http://localhost:5173',
        isLink: true,
      },
      {
        id: `msg-marcus-ack-${Date.now()}`,
        sender: 'marcus',
        text: 'Link received! Opening http://localhost:5173... The interface and real-time dashboard look impressive. Let\'s ask 2 quick strategic questions before signing off.',
      },
    ];

    setChatLogs(newLogs);
    addSignal('delivery_management', 'Shared live prototype link (http://localhost:5173) in Day 7 review', 15);
  };

  const handleSelectAnswerOption = (optId: string) => {
    setSelectedOptionId(optId);
  };

  const handleSubmitQuestionAnswer = () => {
    const q = STRATEGIC_QUESTIONS[currentQuestionIdx];
    if (!q) return;

    const chosenOpt = q.options.find((o) => o.id === selectedOptionId) || q.options[0];
    const marks = chosenOpt.marks;

    setMeetingScore((prev) => prev + marks);
    addSignal('requirement_management', `Day 7 Review Q${currentQuestionIdx + 1} Answer (${chosenOpt.label.slice(0, 40)}...)`, marks);

    const updatedLogs: ChatLogMessage[] = [
      ...chatLogs,
      {
        id: `msg-player-ans-${Date.now()}`,
        sender: 'player',
        text: `Answer: ${chosenOpt.label}`,
      },
      {
        id: `msg-speaker-feedback-${Date.now()}`,
        sender: q.speaker,
        text: chosenOpt.feedback,
      },
    ];

    setSelectedOptionId('');

    if (currentQuestionIdx < STRATEGIC_QUESTIONS.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setChatLogs(updatedLogs);
    } else {
      // Completed both questions
      updatedLogs.push({
        id: `msg-marcus-[#final]`,
        sender: 'marcus',
        text: 'Excellent work today! The prototype is well-aligned with our transformation brief. We are ready for the Day 14 Board of Directors presentation.',
      });
      setChatLogs(updatedLogs);
      setTimeout(() => setStage('wrap_up'), 3000);
    }
  };

  const handleSendTextMessage = () => {
    if (!textInput.trim()) return;
    const text = textInput.trim();
    setTextInput('');

    if (!linkShared && (text.includes('http') || text.includes('5173') || text.includes('link') || text.includes('prototype'))) {
      handleShareLink();
    } else {
      setChatLogs((prev) => [
        ...prev,
        { id: `msg-txt-${Date.now()}`, sender: 'player', text },
      ]);
    }
  };

  const endMeeting = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setPrototypeReviewDone();
    setStage('ended');
  }, [setPrototypeReviewDone]);

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE: PERMISSION
  // ─────────────────────────────────────────────────────────────────────────

  if (stage === 'permission') {
    return (
      <div className="flex-1 flex flex-col bg-[#1a1a2e] text-white overflow-hidden font-sans">
        <div className="h-10 bg-[#3F4499] px-4 flex items-center space-x-2 text-xs font-semibold border-b border-white/10 shrink-0">
          <Video className="w-4 h-4" />
          <span>Microsoft Teams — Prototype Review · Day 7</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-[#252540]/90 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="bg-[#3F4499]/60 px-5 py-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <img src={CHARS.marcus.dp} alt="Marcus" className="w-10 h-10 rounded-full object-cover border-2 border-blue-400/60" />
                <div>
                  <p className="text-xs font-bold text-white">Project Titan Prototype Review</p>
                  <p className="text-[10px] text-slate-400">Marcus Reed (CTO), Daniel Brooks, Emma Carter • Day 7</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                This is the mid-engagement milestone review. You will demonstrate your live prototype and answer 2 key strategic questions from CTO Marcus and Emma.
              </p>
              {isPrototypeReady ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Prototype Ready (http://localhost:5173)</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2 text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Prototype is not built yet in Cera IDE. Expect negative remarks from Marcus.</span>
                </div>
              )}
              <div className="space-y-2 pt-2">
                <button onClick={() => joinCall(true)} className="w-full py-2.5 rounded-xl bg-[#3F4499] hover:bg-[#4a55b0] text-white font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg">
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
  // STAGE: WRAP_UP / ENDED
  // ─────────────────────────────────────────────────────────────────────────

  if (stage === 'wrap_up' || stage === 'ended') {
    return (
      <div className="flex-1 flex flex-col bg-[#0f0f1e] text-white overflow-hidden font-sans">
        <div className="h-10 bg-[#3F4499]/80 px-4 flex items-center space-x-2 text-xs font-semibold border-b border-white/10 shrink-0">
          <Users className="w-4 h-4" /><span>Prototype Review — Summary</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Day 7 Milestone Complete</h2>
            <div className="text-left space-y-2 bg-slate-800/60 rounded-2xl p-5 border border-white/10 text-xs">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Marcus Reed (CTO) Feedback:</div>
              <p className="text-slate-200 leading-relaxed">
                {isPrototypeReady
                  ? '"Great job presenting the live prototype today. Your strategic choices around SSO and approvals align well with our enterprise goals."'
                  : '"We expected the prototype to be completed by Day 7. Please make sure to finish vibe coding in Cera IDE before our Day 14 Board presentation."'
                }
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/60 rounded-xl p-3 border border-white/5">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Prototype Status</p>
                <p className={`text-lg font-extrabold mt-1 ${isPrototypeReady ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPrototypeReady ? 'Ready & Shared' : 'Not Built'}
                </p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3 border border-white/5">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Review Score</p>
                <p className="text-lg font-extrabold text-amber-400 mt-1">+{meetingScore} Marks</p>
              </div>
            </div>

            <button
              onClick={endMeeting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs cursor-pointer shadow-lg flex items-center justify-center space-x-2"
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
  // STAGE: IN CALL
  // ─────────────────────────────────────────────────────────────────────────

  const currentQ = STRATEGIC_QUESTIONS[currentQuestionIdx];

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f1e] text-white overflow-hidden font-sans">
      {/* Header */}
      <div className="h-10 bg-[#3F4499]/80 px-4 flex items-center justify-between text-xs font-semibold shrink-0 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <Users className="w-4 h-4 text-white/70" />
          <span>Prototype Review · Day 7</span>
          <span className="text-white/50">• 4 participants</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-white/10 px-2.5 py-0.5 rounded-full font-mono text-[10px]">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span>{timer}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Character video tiles — left column */}
        <div className="w-44 border-r border-white/10 p-2 space-y-2 overflow-y-auto shrink-0 bg-[#121324]">
          {Object.values(CHARS).map((char) => (
            <div key={char.name} className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-900 shadow-md">
              <img src={char.dp} alt={char.name} className="w-full aspect-square object-cover object-top" />
              <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white truncate">
                {char.name.split(' ')[0]}
              </div>
            </div>
          ))}

          {/* Player tile */}
          <div className="relative rounded-xl overflow-hidden border-2 border-sky-500/40 bg-slate-900">
            {isCameraOn && streamRef.current ? (
              <video ref={(node) => {
                if (node && streamRef.current) {
                  node.srcObject = streamRef.current;
                  node.play().catch(() => {});
                }
              }} autoPlay muted playsInline className="w-full aspect-square object-cover scale-x-[-1]" />
            ) : (
              <div className="w-full aspect-square bg-slate-800 flex flex-col items-center justify-center text-slate-500 space-y-1">
                <VideoOff className="w-5 h-5" />
                <span className="text-[9px]">Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-sky-300 truncate">You</div>
          </div>
        </div>

        {/* Q&A / Action area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0b14]">
          {/* Messages & Conversation Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {chatLogs.map((msg) => {
              const char = msg.sender !== 'player' ? CHARS[msg.sender] : null;
              return (
                <div key={msg.id} className={`flex items-start space-x-2 ${msg.sender === 'player' ? 'justify-end' : ''}`}>
                  {char && (
                    <img src={char.dp} alt={char.name} className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/20" />
                  )}
                  <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    msg.sender === 'player'
                      ? 'bg-gradient-to-r from-pink-600/30 to-purple-600/30 border border-pink-500/40 text-white'
                      : 'bg-[#15182a] border border-white/10 text-slate-200'
                  }`}>
                    <div className="font-bold text-[10px] mb-1" style={{ color: char ? char.color : '#38bdf8' }}>
                      {char ? char.name : 'You'}
                    </div>
                    {msg.isLink ? (
                      <div className="flex items-center space-x-2 font-mono text-pink-300 font-bold bg-pink-500/10 p-2 rounded-xl border border-pink-500/30">
                        <Link2 className="w-4 h-4 text-pink-400" />
                        <span>{msg.text}</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-auto text-pink-400" />
                      </div>
                    ) : (
                      <div>{msg.text}</div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Interactive Q&A Card (shown after link is shared and if prototype is ready) */}
            {isPrototypeReady && linkShared && currentQ && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-br from-[#18132e] to-[#0f0c1e] border-2 border-pink-500/50 rounded-2xl space-y-3 my-2 shadow-2xl"
              >
                <div className="flex items-center space-x-2 text-pink-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>Question {currentQuestionIdx + 1} of 2 — {CHARS[currentQ.speaker].name} ({CHARS[currentQ.speaker].role})</span>
                </div>
                <p className="text-white text-xs font-medium leading-relaxed">
                  "{currentQ.question}"
                </p>

                <div className="space-y-2 pt-1">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectAnswerOption(opt.id)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-pink-500/25 border-pink-400 text-white font-semibold shadow-md ring-1 ring-pink-400/50'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-pink-200">
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-pink-400 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-normal">{opt.description}</p>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleSubmitQuestionAnswer}
                  disabled={!selectedOptionId}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Answer & Continue</span>
                </button>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Action Bar (Share Prototype Link & Input) */}
          <div className="p-3 border-t border-white/10 space-y-2 bg-[#0d0e1b]">
            {isPrototypeReady && !linkShared && (
              <motion.button
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleShareLink}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-xl shadow-pink-500/25 border border-pink-400/40 flex items-center justify-center space-x-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Link2 className="w-4 h-4 text-pink-300 animate-pulse" />
                <span>🔗 Share Prototype Link (http://localhost:5173)</span>
              </motion.button>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendTextMessage(); }}
                placeholder={!linkShared && isPrototypeReady ? "Click 'Share Prototype Link' above or type a response..." : "Type a response..."}
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={handleSendTextMessage}
                disabled={!textInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-14 bg-[#141528] border-t border-white/10 flex items-center justify-center space-x-3 shrink-0">
        <button onClick={toggleMic} className={`p-2.5 rounded-full border cursor-pointer transition-all ${isMicOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-600/80 border-red-500 text-white'}`}>
          {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
        <button onClick={toggleCamera} className={`p-2.5 rounded-full border cursor-pointer transition-all ${isCameraOn ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-700 border-white/10 text-slate-400'}`}>
          {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </button>
        <button onClick={endMeeting} className="p-2.5 rounded-full bg-red-600 hover:bg-red-500 border border-red-400 text-white cursor-pointer shadow-lg" title="End Call">
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
