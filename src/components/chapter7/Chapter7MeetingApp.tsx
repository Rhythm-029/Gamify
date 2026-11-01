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
  AlertCircle,
  AlertTriangle,
  Users,
  Activity,
  Layers,
  Sparkles,
  Shield,
  Zap,
  Wrench,
  Check,
  ChevronRight,
} from 'lucide-react';
import type { Chapter7State, Chapter7DecisionChoice } from '../../types/chapter7';
import {
  INCIDENT_ID,
  INCIDENT_SEVERITY,
  INCIDENT_SERVICE,
  INCIDENT_ERROR,
  INCIDENT_USERS_AFFECTED,
  CHAPTER7_DECISION_CHOICES,
  computeChapter7Score,
} from '../../data/chapter7Data';
import { sound } from '../onboarding/SoundEngine';

interface Chapter7MeetingAppProps {
  chapter7State: Chapter7State;
  onUpdateState: (updater: Partial<Chapter7State> | ((prev: Chapter7State) => Chapter7State)) => void;
  onOpenStudio: () => void;
  onOpenScorecard: () => void;
}

export const Chapter7MeetingApp: React.FC<Chapter7MeetingAppProps> = ({
  chapter7State,
  onUpdateState,
  onOpenStudio,
  onOpenScorecard,
}) => {
  // Stage flow:
  // 'alert_martha' (19:00–19:40) -> 'alex_hotfix_jane_response' (19:40–20:20) -> 'decision_screen' (20:20–21:00) -> 'decision_confirmed' -> 'resolution_summary'
  const [stage, setStage] = useState<
    | 'connecting'
    | 'alert_martha'
    | 'alex_hotfix_jane_response'
    | 'decision_screen'
    | 'decision_confirmed'
    | 'resolution_summary'
  >(() => {
    if (chapter7State.completed || chapter7State.incidentStatus === 'resolved') return 'resolution_summary';
    if (chapter7State.decisionChoice === 'choice_b' && chapter7State.studioUnlocked) return 'decision_confirmed';
    if (chapter7State.decisionChoice) return 'decision_screen';
    return 'connecting';
  });

  const [selectedDecision, setSelectedDecision] = useState<Chapter7DecisionChoice | null>(
    chapter7State.decisionChoice || null
  );
  const [decisionFeedback, setDecisionFeedback] = useState<string | null>(
    chapter7State.decisionFeedback || null
  );

  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<'martha' | 'alex' | 'jane' | null>('martha');
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

  // Sync if chapter completes
  useEffect(() => {
    if (chapter7State.completed || chapter7State.incidentStatus === 'resolved') {
      setStage('resolution_summary');
    }
  }, [chapter7State.completed, chapter7State.incidentStatus]);

  // Speech synthesis helper
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
        setStage('alert_martha');
        setActiveSpeaker('martha');
        const text =
          'Jane! A minor memory leak in the attendance sync microservice caused intermittent 504 gateway timeouts for 12 branch officers during morning login.';
        setSubtitleText(text);
        speakDialogue(text);
      }, 1400);
    } else if (stage === 'alert_martha') {
      timer = setTimeout(() => {
        setStage('alex_hotfix_jane_response');
        setActiveSpeaker('alex');
        sound.playClick();
        const text =
          "Alex: I'm drafting a quick hotfix patch for the memory leak in the Attendance Sync microservice. I can push it straight to production to stop the timeouts.\n\nJane: Don't just push the patch quietly. We need a formal Root Cause Analysis (RCA) document to show why the memory leak occurred and how we prevent it from repeating.";
        setSubtitleText(text);
        speakDialogue(
          "Jane: Don't just push the patch quietly. We need a formal Root Cause Analysis (RCA) document to show why the memory leak occurred and how we prevent it from repeating."
        );
      }, 8000);
    } else if (stage === 'alex_hotfix_jane_response') {
      timer = setTimeout(() => {
        setStage('decision_screen');
        setActiveSpeaker(null);
        sound.playMessagePing();
      }, 9500);
    }

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stage]);

  const handleManualNext = () => {
    sound.playClick();
    if (stage === 'connecting' || stage === 'alert_martha') {
      setStage('alex_hotfix_jane_response');
      setActiveSpeaker('alex');
      const text =
        "Alex: I'm drafting a quick hotfix patch for the memory leak in the Attendance Sync microservice. I can push it straight to production to stop the timeouts.\n\nJane: Don't just push the patch quietly. We need a formal Root Cause Analysis (RCA) document to show why the memory leak occurred and how we prevent it from repeating.";
      setSubtitleText(text);
      speakDialogue(
        "Jane: Don't just push the patch quietly. We need a formal Root Cause Analysis (RCA) document to show why the memory leak occurred and how we prevent it from repeating."
      );
    } else if (stage === 'alex_hotfix_jane_response') {
      setStage('decision_screen');
      setActiveSpeaker(null);
    }
  };

  const handleSelectDecision = (choice: Chapter7DecisionChoice) => {
    sound.playClick();
    setSelectedDecision(choice);
    const def = CHAPTER7_DECISION_CHOICES[choice];
    setDecisionFeedback(def.feedback);

    if (choice === 'choice_b') {
      sound.playSystemClearance();
      onUpdateState((prev) => {
        const updated: Chapter7State = {
          ...prev,
          decisionChoice: 'choice_b',
          decisionSubmitted: true,
          decisionFeedback: def.feedback,
          studioUnlocked: true,
          callCompleted: true,
          meetingCompleted: true,
          aaravAssignmentViewed: true,
        };
        const updatedScorecard = computeChapter7Score(updated);
        return {
          ...updated,
          scorecard: updatedScorecard,
        };
      });
      setStage('decision_confirmed');
    } else {
      sound.playPenaltyPing();
      onUpdateState((prev) => {
        const updated: Chapter7State = {
          ...prev,
          decisionChoice: 'choice_a',
          decisionSubmitted: true,
          decisionFeedback: def.feedback,
        };
        const updatedScorecard = computeChapter7Score(updated);
        return {
          ...updated,
          scorecard: updatedScorecard,
        };
      });
    }
  };

  const handleLaunchStudio = () => {
    sound.playSystemClearance();
    onUpdateState((prev) => {
      const updated: Chapter7State = {
        ...prev,
        callCompleted: true,
        meetingCompleted: true,
        studioUnlocked: true,
        studioOpened: true,
        activeTab: 'immediate',
      };
      return {
        ...updated,
        scorecard: computeChapter7Score(updated),
      };
    });
    onOpenStudio();
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0713] text-slate-100 select-none overflow-hidden font-sans">
      {/* ── TOP WAR ROOM BAR ── */}
      <div className="h-12 bg-[#150d21] border-b border-rose-900/60 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-400 font-bold text-xs shadow">
            🚨
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Emergency Incident War Room · {INCIDENT_SERVICE} Outage</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                {INCIDENT_SEVERITY}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">19:00–21:00</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Jane (PM / Player) · Martha (Monitoring / Ops) · Alex (Developer)
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-2">
          {stage === 'resolution_summary' ? (
            <button
              onClick={onOpenScorecard}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>View RCA & Incident Scorecard</span>
            </button>
          ) : chapter7State.decisionChoice === 'choice_b' ? (
            <button
              onClick={handleLaunchStudio}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:opacity-95 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all cursor-pointer border border-rose-400/40"
            >
              <Wrench className="w-3.5 h-3.5 text-rose-200" />
              <span>Open Incident Response Studio</span>
              <ArrowRight className="w-3 h-3 text-rose-200" />
            </button>
          ) : (
            <div className="text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded">
              Decision Required
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT / CENTER: TELEMETRY DASHBOARD & STAGE SCREEN */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3.5">
          {/* Live Incident Telemetry Banner */}
          <div className="bg-[#12081d] border border-rose-500/40 rounded-2xl p-3.5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-32 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between border-b border-rose-900/40 pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wide">
                  Automated Monitoring Dashboard · Active Alert
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Source: Grafana / APM Cluster</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Affected Service</div>
                <div className="font-bold text-sky-300 text-[13px] mt-0.5">{INCIDENT_SERVICE}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Observed Error</div>
                <div className="font-bold text-rose-400 text-[13px] mt-0.5">{INCIDENT_ERROR}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Technical Root</div>
                <div className="font-bold text-amber-300 text-[13px] mt-0.5">Heap Memory Leak</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Impact Scope</div>
                <div className="font-bold text-purple-300 text-[13px] mt-0.5">{INCIDENT_USERS_AFFECTED} Branch Officers</div>
              </div>
            </div>
          </div>

          {/* SCENE PRESENTATION */}
          {stage === 'alert_martha' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#170e24] border border-slate-800 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 animate-pulse" />
                  19:00–19:40 · Production Alert Triggered
                </span>
                <button
                  onClick={handleManualNext}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-start space-x-3.5">
                <img
                  src="/character/Emma_Carter/EmmaDP.png"
                  alt="Martha"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-rose-500/60 shadow"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">Martha</span>
                    <span className="text-[11px] font-mono text-slate-400">Monitoring / Operations</span>
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-sm bg-[#221334] border border-rose-500/30 text-slate-100 text-sm leading-relaxed shadow">
                    “Jane! A minor memory leak in the attendance sync microservice caused intermittent 504 gateway timeouts for 12 branch officers during morning login.”
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">Incident scope identified:</span>
                <span className="font-semibold text-white">Attendance Sync · Memory Leak · 504 Gateway Timeouts · 12 Branch Officers</span>
              </div>
            </motion.div>
          )}

          {stage === 'alex_hotfix_jane_response' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#170e24] border border-slate-800 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-400" />
                  19:40–20:20 · Developer Prepares Hotfix
                </span>
                <button
                  onClick={handleManualNext}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Continue to Decision</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Alex line */}
              <div className="flex items-start space-x-3.5">
                <img
                  src="/character/Daniel_Brooks/DanielDP.png"
                  alt="Alex"
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-sky-500/60 shadow"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sky-300 text-sm">Alex</span>
                    <span className="text-[11px] font-mono text-slate-400">Developer</span>
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#162038] border border-sky-500/30 text-slate-100 text-sm leading-relaxed shadow">
                    “I'm drafting a quick hotfix patch for the memory leak in the Attendance Sync microservice. I can push it straight to production quietly to stop the timeouts.”
                  </div>
                </div>
              </div>

              {/* Jane response */}
              <div className="flex items-start space-x-3.5 pl-6">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 border-2 border-purple-400/60 flex items-center justify-center font-black text-white text-base shadow shrink-0">
                  J
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-purple-300 text-sm">Jane (You)</span>
                    <span className="text-[11px] font-mono text-slate-400">Project Manager / Player</span>
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#221338] border border-purple-500/40 text-purple-100 text-sm leading-relaxed shadow font-medium">
                    “Don't just push the patch quietly. We need a formal Root Cause Analysis (RCA) document to show why the memory leak occurred and how we prevent it from repeating.”
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {(stage === 'decision_screen' || stage === 'decision_confirmed') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#170e24] border border-rose-500/40 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    20:20–21:00 · Decision Screen
                  </span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    Select Your Engineering Governance & Remediation Strategy
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Choose carefully</span>
              </div>

              {/* Choices Grid */}
              <div className="grid grid-cols-1 gap-3">
                {/* Choice A */}
                <div
                  onClick={() => handleSelectDecision('choice_a')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedDecision === 'choice_a'
                      ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Choice A — Incorrect Approach
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-200">
                        "{CHAPTER7_DECISION_CHOICES.choice_a.label}"
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-mono font-bold text-rose-400">
                        Governance: -30
                      </div>
                      <div className="text-[11px] font-mono font-bold text-rose-400">
                        Trust & Risk: -25
                      </div>
                    </div>
                  </div>

                  {selectedDecision === 'choice_a' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-rose-900/60 text-xs text-rose-300 leading-relaxed space-y-2"
                    >
                      <p>{CHAPTER7_DECISION_CHOICES.choice_a.feedback}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDecision('choice_b');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow mt-2"
                      >
                        <span>Switch to Recommended Choice B</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Choice B */}
                <div
                  onClick={() => handleSelectDecision('choice_b')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedDecision === 'choice_b'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5 pr-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Choice B — Recommended Approach
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-emerald-100">
                        "{CHAPTER7_DECISION_CHOICES.choice_b.label}"
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-mono font-bold text-emerald-400">
                        Governance: +25
                      </div>
                      <div className="text-[11px] font-mono font-bold text-emerald-400">
                        Trust & Risk: +20
                      </div>
                      <div className="text-[11px] font-mono font-bold text-emerald-400">
                        Efficiency: +15
                      </div>
                    </div>
                  </div>

                  {selectedDecision === 'choice_b' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-emerald-900/60 text-xs text-emerald-200 leading-relaxed space-y-3"
                    >
                      <p>{CHAPTER7_DECISION_CHOICES.choice_b.feedback}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono text-[11px] text-emerald-300 font-bold">
                          ✓ Points awarded: +25 Gov, +20 Risk, +15 Velocity
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLaunchStudio();
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Proceed to 3 Incident Activities</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {stage === 'resolution_summary' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#121f1b] border border-emerald-500/50 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Incident INC-0241 Resolved & Post-Mortem Ready</span>
                </div>
                <button
                  onClick={onOpenScorecard}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow"
                >
                  <span>Open Final Scorecard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#172c25] border border-emerald-500/30 flex items-start space-x-2.5">
                  <span className="font-bold text-emerald-300 shrink-0">Alex:</span>
                  <span className="text-emerald-100">
                    “The hotfix has been deployed, and attendance sync has recovered. Memory utilization is stable and all 12 branch officers can log in without errors.”
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#172c25] border border-emerald-500/30 flex items-start space-x-2.5">
                  <span className="font-bold text-emerald-300 shrink-0">Martha:</span>
                  <span className="text-emerald-100">
                    “Monitoring thresholds have been updated on our dashboard, and the incident post-mortem report is ready for engineering review.”
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#1c332b] border border-emerald-500/40 flex items-start space-x-2.5">
                  <span className="font-bold text-emerald-200 shrink-0">Jane:</span>
                  <span className="text-emerald-50 font-medium">
                    “Incident INC-0241 resolved. We didn't just patch the bug—we established root cause and put automated monitoring in place so it never happens again.”
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT: PARTICIPANTS & CALL CONTROLS */}
        <div className="w-full md:w-72 bg-[#10091a] border-t md:border-t-0 md:border-l border-slate-800 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider">
              Bridge Participants (3)
            </div>

            {/* Martha Card */}
            <div
              className={`p-2.5 rounded-xl border flex items-center space-x-3 transition-all ${
                activeSpeaker === 'martha'
                  ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <img
                src="/character/Emma_Carter/EmmaDP.png"
                alt="Martha"
                className="w-9 h-9 rounded-xl object-cover border border-rose-500/40"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                  <span>Martha</span>
                  {activeSpeaker === 'martha' && isSpeaking && (
                    <Volume2 className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">Monitoring / Ops</div>
              </div>
            </div>

            {/* Alex Card */}
            <div
              className={`p-2.5 rounded-xl border flex items-center space-x-3 transition-all ${
                activeSpeaker === 'alex'
                  ? 'bg-sky-950/40 border-sky-500/60 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <img
                src="/character/Daniel_Brooks/DanielDP.png"
                alt="Alex"
                className="w-9 h-9 rounded-xl object-cover border border-sky-500/40"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                  <span>Alex</span>
                  {activeSpeaker === 'alex' && isSpeaking && (
                    <Volume2 className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">Developer</div>
              </div>
            </div>

            {/* Jane Card */}
            <div
              className={`p-2.5 rounded-xl border flex items-center space-x-3 transition-all ${
                activeSpeaker === 'jane'
                  ? 'bg-purple-950/40 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/50 flex items-center justify-center font-bold text-white text-xs">
                J
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                  <span>Jane (You)</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">Project Manager</div>
              </div>
            </div>
          </div>

          {/* Audio & Media Controls */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => {
                  sound.playClick();
                  setMicMuted(!micMuted);
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer ${
                  micMuted ? 'bg-rose-600/80 hover:bg-rose-500' : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={micMuted ? 'Unmute' : 'Mute'}
              >
                {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setCameraOff(!cameraOff);
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer ${
                  cameraOff ? 'bg-rose-600/80 hover:bg-rose-500' : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={cameraOff ? 'Turn Video On' : 'Turn Video Off'}
              >
                {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-center text-[10px] font-mono text-slate-500">
              SEV-2 Incident Channel · Encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
