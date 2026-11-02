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
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Activity,
  PhoneOff,
  Sparkles,
  Users,
  Terminal,
  Volume2,
  FileCheck2,
} from 'lucide-react';
import type { Chapter8State, Chapter8DecisionChoice } from '../../types/chapter8';
import {
  CHAPTER8_TITLE,
  CHAPTER8_SUBTITLE,
  CHAPTER8_STAGE_LABEL,
  CHAPTER8_CHARACTERS,
  CISO_EXACT_ALERT,
  SCENE_8_1_DIALOGUE,
  CHAPTER8_DECISIONS,
  computeChapter8Score,
} from '../../data/chapter8Data';
import { sound } from '../onboarding/SoundEngine';

interface Chapter8MeetingAppProps {
  chapter8State: Chapter8State;
  onUpdateState: (updater: Partial<Chapter8State> | ((prev: Chapter8State) => Chapter8State)) => void;
  onCompleteMeeting?: () => void;
  onOpenHandoverDesk?: () => void;
}

export const Chapter8MeetingApp: React.FC<Chapter8MeetingAppProps> = ({
  chapter8State,
  onUpdateState,
  onCompleteMeeting,
  onOpenHandoverDesk,
}) => {
  // Meeting stages:
  // 1. 'threat_alert': 21:00–21:45 CISO threat alert
  // 2. 'tech_tradeoff': 21:45–22:30 Alex & Jane trade-off discussion
  // 3. 'decision': 22:30–23:00 Decision screen (Choice A vs Choice B)
  // 4. 'decision_feedback': Feedback and unlock Security Response Console
  const [stage, setStage] = useState<
    'threat_alert' | 'tech_tradeoff' | 'decision' | 'decision_feedback'
  >(() => {
    if (chapter8State.deskUnlocked || chapter8State.selectedDecision === 'choice_b') {
      return 'decision_feedback';
    }
    if (chapter8State.tradeoffDiscussed) return 'decision';
    if (chapter8State.threatDelivered) return 'tech_tradeoff';
    return 'threat_alert';
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

  // Sync subtitle with current stage
  useEffect(() => {
    if (stage === 'threat_alert') {
      setSubtitleText(CISO_EXACT_ALERT);
    } else if (stage === 'tech_tradeoff') {
      setSubtitleText(SCENE_8_1_DIALOGUE[1].text);
    }
  }, [stage]);

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
      } catch (e) {
        console.warn('TTS not supported or failed:', e);
      }
    }
  };

  const handleNextStage = () => {
    sound.playClick();
    if (stage === 'threat_alert') {
      onUpdateState({ threatDelivered: true });
      setStage('tech_tradeoff');
      speakDialogue(SCENE_8_1_DIALOGUE[1].text);
    } else if (stage === 'tech_tradeoff') {
      onUpdateState({ tradeoffDiscussed: true });
      setStage('decision');
    }
  };

  const handleSelectDecision = (choice: Chapter8DecisionChoice) => {
    sound.playClick();
    const decisionConfig = CHAPTER8_DECISIONS[choice];

    onUpdateState((prev) => {
      const nextState: Chapter8State = {
        ...prev,
        selectedDecision: choice,
        decisionScoreApplied: true,
        decisionFeedback: decisionConfig.explanation,
        deskUnlocked: choice === 'choice_b' ? true : prev.deskUnlocked,
        callCompleted: true,
        meetingCompleted: true,
      };

      // Recalculate scorecard with the new decision impact
      const updatedScorecard = computeChapter8Score(nextState);
      return {
        ...nextState,
        scorecard: updatedScorecard,
      };
    });

    if (choice === 'choice_b') {
      sound.playSystemClearance();
    } else {
      sound.playMessagePing();
    }
    setStage('decision_feedback');
  };

  const handleOpenConsole = () => {
    sound.playClick();
    onUpdateState({ deskUnlocked: true, activeTab: 'investigate' });
    if (onCompleteMeeting) {
      onCompleteMeeting();
    } else if (onOpenHandoverDesk) {
      onOpenHandoverDesk();
    }
  };

  const selectedDecisionData = chapter8State.selectedDecision
    ? CHAPTER8_DECISIONS[chapter8State.selectedDecision]
    : null;

  return (
    <div className="h-full flex flex-col bg-[#070b14] text-slate-100 font-sans select-none overflow-hidden">
      {/* Top SOC Liaison Header */}
      <header className="px-5 py-3 border-b border-slate-800 bg-[#0c1220]/90 backdrop-blur flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-rose-400 font-bold">
                INCIDENT RESPONSE · SCENE 8.1
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                CRITICAL THREAT
              </span>
            </div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Bank Security Operations Center (SOC) Liaison Channel</span>
              <span className="text-slate-400 text-xs font-normal">· Defending Against Credential Stuffing</span>
            </h1>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-mono text-[11px]">
              {stage === 'threat_alert'
                ? '21:00–21:45'
                : stage === 'tech_tradeoff'
                ? '21:45–22:30'
                : '22:30–23:00'}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span className="font-mono text-[11px] font-bold">LIVE THREAT FEED ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 flex flex-col justify-between max-w-6xl mx-auto w-full">
        {/* Participants Row (Jane, Alex, Bank CISO) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 shrink-0">
          {/* Bank CISO Card */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            stage === 'threat_alert'
              ? 'bg-[#151226] border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/50'
              : 'bg-[#0f172a]/70 border-slate-800'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={CHAPTER8_CHARACTERS.ciso.avatar}
                  alt={CHAPTER8_CHARACTERS.ciso.name}
                  className="w-12 h-12 rounded-xl object-cover border border-rose-500/50 shadow"
                />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white truncate">{CHAPTER8_CHARACTERS.ciso.name}</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                </div>
                <div className="text-[10px] text-rose-300/80 font-mono uppercase tracking-wider">
                  Security Authority · CISO
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>SOC Liaison Feed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alex Card */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            stage === 'tech_tradeoff'
              ? 'bg-[#151b2e] border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
              : 'bg-[#0f172a]/70 border-slate-800'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={CHAPTER8_CHARACTERS.alex.avatar}
                  alt={CHAPTER8_CHARACTERS.alex.name}
                  className="w-12 h-12 rounded-xl object-cover border border-cyan-500/50 shadow"
                />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white truncate">{CHAPTER8_CHARACTERS.alex.name}</span>
                  <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                </div>
                <div className="text-[10px] text-cyan-300/80 font-mono uppercase tracking-wider">
                  Developer · Engineering Lead
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Technical Evaluation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Jane (Player) Card */}
          <div className="p-3.5 rounded-2xl border bg-[#0f172a]/70 border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={CHAPTER8_CHARACTERS.jane.avatar}
                  alt={CHAPTER8_CHARACTERS.jane.name}
                  className="w-12 h-12 rounded-xl object-cover border border-indigo-500/50 shadow"
                />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white truncate">{CHAPTER8_CHARACTERS.jane.name}</span>
                  <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                </div>
                <div className="text-[10px] text-indigo-300/80 font-mono uppercase tracking-wider">
                  Project Manager (You)
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Governance & Delivery Lead</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Center Stage */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* STAGE 1: 21:00–21:45 Security threat detected */}
            {stage === 'threat_alert' && (
              <motion.div
                key="stage_threat_alert"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#111628] border border-rose-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
                    <span>21:00–21:45 · Automated Threat Feed Alert</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    BANK CISO MANDATE
                  </span>
                </div>

                {/* Threat Incident Overview Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Threat Vector</div>
                    <div className="text-xs font-bold text-rose-400 mt-0.5">Credential Stuffing</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Target Endpoint</div>
                    <div className="text-xs font-bold text-white mt-0.5">Employee Login Gateway</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Traffic Pattern</div>
                    <div className="text-xs font-bold text-amber-300 mt-0.5">Anomalous Bot Streams</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Regulatory Impact</div>
                    <div className="text-xs font-bold text-rose-300 mt-0.5">Imminent Portal Suspension</div>
                  </div>
                </div>

                {/* CISO Exact Dialogue Box */}
                <div className="p-5 rounded-2xl bg-[#1b1528] border border-rose-500/40 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={CHAPTER8_CHARACTERS.ciso.avatar}
                        alt="CISO"
                        className="w-8 h-8 rounded-lg object-cover border border-rose-500/50"
                      />
                      <span className="font-bold text-rose-300 text-sm">Bank CISO:</span>
                    </div>
                    <button
                      onClick={() => speakDialogue(CISO_EXACT_ALERT)}
                      className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                      title="Read dialogue"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-white text-sm sm:text-base font-medium leading-relaxed italic">
                    "{CISO_EXACT_ALERT}"
                  </p>
                </div>

                {/* Player Context Guidance */}
                <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
                  <span className="font-bold text-slate-200">Incident Context:</span> High-frequency bot traffic is attempting credential stuffing against the newly launched employee portal. The Bank CISO requires immediate mitigation under institutional policies and IT compliance acts.
                </div>

                {/* Next Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextStage}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    <span>Proceed to Technical Discussion</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 2: 21:45–22:30 Technical impact discussion */}
            {stage === 'tech_tradeoff' && (
              <motion.div
                key="stage_tech_tradeoff"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#111628] border border-cyan-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>21:45–22:30 · Technical Impact & PM Trade-off</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    ENGINEERING & GOVERNANCE ALIGNMENT
                  </span>
                </div>

                {/* Dialogue Exchange */}
                <div className="space-y-4">
                  {/* Alex Dialogue */}
                  <div className="p-4 rounded-2xl bg-[#141b2d] border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={CHAPTER8_CHARACTERS.alex.avatar}
                          alt="Alex"
                          className="w-7 h-7 rounded-lg object-cover border border-cyan-500/50"
                        />
                        <span className="font-bold text-cyan-300 text-xs">Alex (Developer):</span>
                      </div>
                      <button
                        onClick={() => speakDialogue(SCENE_8_1_DIALOGUE[1].text)}
                        className="text-slate-400 hover:text-white p-1 rounded"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                      "{SCENE_8_1_DIALOGUE[1].text}"
                    </p>
                  </div>

                  {/* Jane Dialogue */}
                  <div className="p-4 rounded-2xl bg-[#181a30] border border-indigo-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={CHAPTER8_CHARACTERS.jane.avatar}
                          alt="Jane"
                          className="w-7 h-7 rounded-lg object-cover border border-indigo-500/50"
                        />
                        <span className="font-bold text-indigo-300 text-xs">Jane (Project Manager):</span>
                      </div>
                      <button
                        onClick={() => speakDialogue(SCENE_8_1_DIALOGUE[2].text)}
                        className="text-slate-400 hover:text-white p-1 rounded"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                      "{SCENE_8_1_DIALOGUE[2].text}"
                    </p>
                  </div>
                </div>

                {/* Project Management Principle */}
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed">
                  <span className="font-bold text-cyan-300">PM Leadership Lens:</span> Institutional cybersecurity compliance is non-negotiable. Avoiding user login friction or minor support calls is never a valid rationale to bypass active threat defenses.
                </div>

                {/* Next Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextStage}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
                  >
                    <span>Proceed to Decision Screen</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 3: 22:30–23:00 Decision Screen */}
            {stage === 'decision' && (
              <motion.div
                key="stage_decision"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#111628] border border-indigo-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                  <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-bold tracking-wider uppercase">
                    <ShieldAlert className="w-4 h-4 text-indigo-400" />
                    <span>22:30–23:00 · Strategic Decision Screen</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    BANK CYBERSECURITY POLICY DIRECTIVE
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-black text-white">
                    Select Your Approach to the Credential-Stuffing Attack
                  </h2>
                  <p className="text-xs text-slate-400">
                    Evaluate whether to compromise security compliance for login speed or enforce mandatory threat mitigation.
                  </p>
                </div>

                {/* Choices Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* CHOICE A */}
                  <div
                    onClick={() => handleSelectDecision('choice_a')}
                    className="group cursor-pointer rounded-2xl p-5 border border-slate-700 bg-[#0d1322] hover:bg-slate-800/60 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 bg-slate-800 border border-slate-700">
                          Option A
                        </span>
                      </div>
                      <p className="text-white font-semibold text-xs sm:text-sm leading-relaxed">
                        "{CHAPTER8_DECISIONS.choice_a.text}"
                      </p>
                    </div>
                  </div>

                  {/* CHOICE B */}
                  <div
                    onClick={() => handleSelectDecision('choice_b')}
                    className="group cursor-pointer rounded-2xl p-5 border border-slate-700 bg-[#0d1322] hover:bg-slate-800/60 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 bg-slate-800 border border-slate-700">
                          Option B
                        </span>
                      </div>
                      <p className="text-white font-semibold text-xs sm:text-sm leading-relaxed">
                        "{CHAPTER8_DECISIONS.choice_b.text}"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STAGE 4: Decision Feedback & Launch Security Console */}
            {stage === 'decision_feedback' && selectedDecisionData && (
              <motion.div
                key="stage_feedback"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden bg-[#0e1424]"
              >
                <div className="flex items-center justify-between border-b pb-3 border-slate-800">
                  <div className="flex items-center space-x-2 font-mono text-xs font-bold tracking-wider uppercase text-cyan-400">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Decision Confirmed · Engineering Strategy Recorded</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedDecisionData.label}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    "{selectedDecisionData.text}"
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedDecisionData.explanation}
                  </p>
                </div>

                {/* Action Row */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Strategy locked. Security Response Console is ready for deployment.</span>
                  </div>

                  <button
                    onClick={handleOpenConsole}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <FileCheck2 className="w-4 h-4 text-slate-950" />
                    <span>Launch Security Response Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Media / Controls Footer */}
        <footer className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMicMuted((prev) => !prev)}
              className={`p-2 rounded-xl border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                micMuted
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {micMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="text-[11px] font-mono">{micMuted ? 'Muted' : 'Mic Live'}</span>
            </button>

            <button
              onClick={() => setCameraOff((prev) => !prev)}
              className={`p-2 rounded-xl border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                cameraOff
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cameraOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="text-[11px] font-mono">{cameraOff ? 'Cam Off' : 'Cam Feed'}</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bank SOC Liaison Bridge · TLS 1.3 Encrypted</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
