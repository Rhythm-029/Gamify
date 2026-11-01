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
  Volume2,
  FileCheck2,
  PhoneOff,
  Sparkles,
  Users,
  ShieldCheck,
  Award,
} from 'lucide-react';
import type { Chapter8State } from '../../types/chapter8';
import { sound } from '../onboarding/SoundEngine';

interface Chapter8MeetingAppProps {
  chapter8State: Chapter8State;
  onUpdateState: (updater: Partial<Chapter8State> | ((prev: Chapter8State) => Chapter8State)) => void;
  onOpenDesk?: () => void;
  onOpenHandoverDesk?: () => void;
  onCompleteMeeting?: () => void;
  onOpenScorecard?: () => void;
}

export const Chapter8MeetingApp: React.FC<Chapter8MeetingAppProps> = ({
  chapter8State,
  onUpdateState,
  onOpenDesk,
  onOpenHandoverDesk,
  onCompleteMeeting,
  onOpenScorecard,
}) => {
  // Call stages:
  // 'connecting' -> 'aarav_intro' -> 'aarav_mandate' -> 'aarav_assignment' -> 'call_ended'
  // Or if completed: 'closure_summary'
  const [stage, setStage] = useState<
    | 'connecting'
    | 'aarav_intro'
    | 'aarav_mandate'
    | 'aarav_assignment'
    | 'call_ended'
    | 'closure_summary'
  >(() => {
    if (chapter8State.completed) return 'closure_summary';
    if (chapter8State.reviewCallCompleted || chapter8State.deskUnlocked) return 'call_ended';
    return 'connecting';
  });

  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [subtitleText, setSubtitleText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    if (!cameraOff) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
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

  // Sync if completed
  useEffect(() => {
    if (chapter8State.completed) {
      setStage('closure_summary');
    }
  }, [chapter8State.completed]);

  // TTS helper
  const speakDialogue = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } catch {
        // ignore speech error
      }
    }
  };

  // Progression logic
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (stage === 'connecting') {
      sound.playMessagePing();
      timer = setTimeout(() => {
        setStage('aarav_intro');
        const text = "We're almost there, Jane. The production issue has been resolved, and the project has reached its final delivery stage.";
        setSubtitleText(text);
        speakDialogue(text);
      }, 1500);
    } else if (stage === 'aarav_intro') {
      timer = setTimeout(() => {
        setStage('aarav_mandate');
        sound.playMessagePing();
        const text = "But we can't close a project just because the system is running. We need evidence that the agreed scope is delivered, outstanding items are clearly accounted for, and the operations team knows how to take ownership.";
        setSubtitleText(text);
        speakDialogue(text);
      }, 6500);
    } else if (stage === 'aarav_mandate') {
      timer = setTimeout(() => {
        setStage('aarav_assignment');
        sound.playMessagePing();
        const text = "I've added Release & Handover Desk to your desktop. Use it to put together the final delivery package. Marcus will review the technical handover, and Sophia will review the Phase 1 delivery.";
        setSubtitleText(text);
        speakDialogue(text);
      }, 7500);
    } else if (stage === 'aarav_assignment') {
      timer = setTimeout(() => {
        setStage('call_ended');
        sound.playSystemClearance();
        setSubtitleText(
          "Call ended. Aarav has assigned you the final delivery package. Open Release & Handover Desk to complete Phase 1 handover."
        );
        onUpdateState({
          reviewCallCompleted: true,
          deskUnlocked: true,
        });
      }, 7500);
    }

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stage]);

  const handleLaunchDesk = () => {
    sound.playSystemClearance();
    onUpdateState({
      reviewCallCompleted: true,
      callCompleted: true,
      meetingCompleted: true,
      deskUnlocked: true,
      activeTab: 'evidence',
    });
    if (onCompleteMeeting) {
      onCompleteMeeting();
    } else if (onOpenHandoverDesk) {
      onOpenHandoverDesk();
    } else if (onOpenDesk) {
      onOpenDesk();
    }
  };

  const handleManualNext = () => {
    sound.playClick();
    if (stage === 'aarav_intro') {
      setStage('aarav_mandate');
      const text = "But we can't close a project just because the system is running. We need evidence that the agreed scope is delivered, outstanding items are clearly accounted for, and the operations team knows how to take ownership.";
      setSubtitleText(text);
      speakDialogue(text);
    } else if (stage === 'aarav_mandate') {
      setStage('aarav_assignment');
      const text = "I've added Release & Handover Desk to your desktop. Use it to put together the final delivery package. Marcus will review the technical handover, and Sophia will review the Phase 1 delivery.";
      setSubtitleText(text);
      speakDialogue(text);
    } else if (stage === 'aarav_assignment') {
      setStage('call_ended');
      sound.playSystemClearance();
      onUpdateState({
        reviewCallCompleted: true,
        deskUnlocked: true,
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0d18] text-slate-100 select-none overflow-hidden font-sans">
      {/* ── TEAMS TOP CALL BAR ── */}
      <div className="h-12 bg-[#12162a] border-b border-indigo-900/60 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded bg-[#4f52b2] flex items-center justify-center text-white font-bold text-xs shadow">
            T
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Project Amigo — Final Delivery & Handover Review</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                FINAL MILESTONE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Aarav Kapoor (Project Manager) · Jane (Project Lead) · Marcus Reed (CTO) · Sophia Bennett (Client HR)
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-2">
          {stage === 'closure_summary' ? (
            <button
              onClick={onOpenScorecard}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>View Final Project Scorecard</span>
            </button>
          ) : (
            <button
              onClick={handleLaunchDesk}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:opacity-95 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all cursor-pointer border border-indigo-400/40"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-100" />
              <span>Open Release & Handover Desk</span>
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN CALL STAGE ── */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden relative">
        {/* CENTER / MAIN SPEAKER: AARAV KAPOOR */}
        <div className="flex-1 bg-[#0f1322] border border-indigo-500/40 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
          {/* Header */}
          <div className="h-9 bg-[#161c33] border-b border-indigo-900/60 px-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-indigo-300 font-mono text-[11px] font-bold">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Aarav Kapoor — Project Delivery Alignment</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                Phase 1 Closing
              </span>
            </div>
          </div>

          {/* Video Feed / Avatar Stage */}
          <div className="flex-1 p-6 bg-gradient-to-b from-[#0b0e1a] to-[#080a13] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col items-center text-center space-y-4 max-w-lg z-10">
              <div className="relative">
                <img
                  src="/character/AaravDP.png"
                  alt="Aarav Kapoor"
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover border-2 border-indigo-400/60 shadow-[0_0_30px_rgba(99,102,241,0.35)]"
                />
                {isSpeaking && (
                  <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold flex items-center gap-1 shadow-lg border border-indigo-300">
                    <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-white">Aarav Kapoor</h3>
                <p className="text-xs font-mono text-indigo-300">Senior Consultant · Project Manager</p>
              </div>

              {/* Aarav Assignment Card when call finishes */}
              {stage === 'call_ended' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#151a30] border border-indigo-500/60 rounded-xl p-4 shadow-xl text-left space-y-2 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Final Handover Mandate
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed">
                    “Use Release & Handover Desk to assemble the evidence, classify deliverables, and establish support runbooks. Marcus will review the technical handover, and Sophia will review the Phase 1 delivery.”
                  </p>
                  <div className="pt-1">
                    <button
                      onClick={handleLaunchDesk}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 hover:opacity-95 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer border border-indigo-400/40"
                    >
                      <span>Launch Release & Handover Desk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Subtitles & Captions Bar */}
          <div className="p-3.5 bg-[#12162a] border-t border-indigo-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5 flex-1 pr-3">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shrink-0" />
              <div className="text-xs text-slate-200 leading-snug">
                <span className="font-bold text-indigo-300 mr-1.5 font-mono">[Aarav Kapoor]:</span>
                {subtitleText || 'Call in progress...'}
              </div>
            </div>

            {stage !== 'call_ended' && stage !== 'closure_summary' && (
              <button
                onClick={handleManualNext}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
              >
                Next »
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: PARTICIPANTS ROSTER */}
        <div className="w-full md:w-64 flex flex-col space-y-3 shrink-0">
          {/* Marcus Reed (CTO) */}
          <div className="rounded-xl bg-[#121628] border border-slate-800 p-3 flex flex-col justify-between">
            <div className="flex items-center space-x-2.5">
              <img
                src="/character/marcus_reed/MarcusDP.png"
                alt="Marcus"
                className="w-10 h-10 rounded-full border border-sky-400/40 object-cover shrink-0"
              />
              <div>
                <div className="text-xs font-bold text-white">Marcus Reed</div>
                <div className="text-[10px] text-sky-400 font-mono">Chief Technology Officer</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span>Technical Approver</span>
              <span className="text-indigo-400">Reviewing Handover</span>
            </div>
          </div>

          {/* Sophia Bennett (Client HR) */}
          <div className="rounded-xl bg-[#121628] border border-slate-800 p-3 flex flex-col justify-between">
            <div className="flex items-center space-x-2.5">
              <img
                src="/character/Sophia_bennett/SophiaDP.png"
                alt="Sophia"
                className="w-10 h-10 rounded-full border border-purple-400/40 object-cover shrink-0"
              />
              <div>
                <div className="text-xs font-bold text-white">Sophia Bennett</div>
                <div className="text-[10px] text-purple-300 font-mono">Head of HR · ICICI Bank</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span>Client Approver</span>
              <span className="text-purple-400">Phase 1 Acceptance</span>
            </div>
          </div>

          {/* Player Feed */}
          <div className="rounded-xl bg-[#121628] border border-slate-800 p-3 flex flex-col justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-500 flex items-center justify-center font-bold text-xs text-white">
                YOU
              </div>
              <div>
                <div className="text-xs font-bold text-white">Jane (Consultant)</div>
                <div className="text-[10px] text-slate-400 font-mono">Delivery Lead</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span>Muted: {micMuted ? 'Yes' : 'No'}</span>
              <span className="text-emerald-400 font-bold">Lead Owner</span>
            </div>
          </div>

          {/* Call Controls */}
          <div className="pt-2 flex items-center justify-center space-x-3 bg-[#0d101e] p-2.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setMicMuted(!micMuted)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                micMuted ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
              title={micMuted ? 'Unmute' : 'Mute'}
            >
              {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setCameraOff(!cameraOff)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                cameraOff ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
              title={cameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLaunchDesk}
              className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all cursor-pointer shadow"
              title="Leave Call & Open Handover Desk"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
