import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Share2,
  Users,
  Terminal,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Lock,
  Volume2,
} from 'lucide-react';
import type {
  Chapter3State,
  Chapter3EscalationChoice,
  Chapter3Scorecard,
} from '../../types/chapter3';
import {
  ESCALATION_OPTIONS,
  SCREEN_SHARE_LOGS,
  computeChapter3Score,
} from '../../data/chapter3Data';
import { sound } from '../onboarding/SoundEngine';

interface Chapter3MeetingAppProps {
  chapter3State: Chapter3State;
  onUpdateState: (updater: Partial<Chapter3State> | ((prev: Chapter3State) => Chapter3State)) => void;
  onOpenPortal: () => void;
  onOpenScorecard: () => void;
}

export const Chapter3MeetingApp: React.FC<Chapter3MeetingAppProps> = ({
  chapter3State,
  onUpdateState,
  onOpenPortal,
  onOpenScorecard,
}) => {
  // Call connection states
  const [callPhase, setCallPhase] = useState<
    'connecting' | 'intro' | 'sharing_screen' | 'explanation' | 'decision' | 'aarav_joined' | 'portal_ready' | 'analyzing' | 'team_reaction' | 'concluded'
  >(() => {
    if (chapter3State.completed || chapter3State.finalReviewComplete) return 'team_reaction';
    if (chapter3State.task3Submitted) return 'analyzing';
    if (chapter3State.portalAccessGranted) return 'portal_ready';
    if (chapter3State.escalationChoice === 'escalate_aarav' || chapter3State.escalationRecovered) return 'aarav_joined';
    return 'connecting';
  });

  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState<'daniel' | 'aarav' | 'marcus' | 'player' | null>('daniel');
  const [subtitleText, setSubtitleText] = useState<string>('');
  const [highlightedLogIndex, setHighlightedLogIndex] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [analyzingProgress, setAnalyzingProgress] = useState<number>(0);

  const audioPlayedRef = useRef<boolean>(false);

  // ── SEQUENCE 1: Connection & Intro Dialogue ──
  useEffect(() => {
    if (callPhase === 'connecting') {
      sound.playMessagePing();
      const timer = setTimeout(() => {
        setCallPhase('intro');
        setActiveSpeaker('daniel');
        setSubtitleText(
          "Hey, we have a blocker. The Appraisal and Attendance integrations are failing. I'm sharing my screen—take a look at these logs."
        );
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [callPhase]);

  // Transition from Intro to Screen Sharing
  useEffect(() => {
    if (callPhase === 'intro') {
      const timer = setTimeout(() => {
        setCallPhase('sharing_screen');
        sound.playClick();
      }, 3800);
      return () => clearTimeout(timer);
    }
  }, [callPhase]);

  // Sequential Log Highlighting during screen share
  useEffect(() => {
    if (callPhase === 'sharing_screen') {
      const step1 = setTimeout(() => setHighlightedLogIndex(1), 800);
      const step2 = setTimeout(() => setHighlightedLogIndex(2), 1600);
      const step3 = setTimeout(() => setHighlightedLogIndex(3), 2400);
      const nextPhaseTimer = setTimeout(() => {
        setCallPhase('explanation');
        setActiveSpeaker('daniel');
        setSubtitleText(
          "Our services expect REST and JSON, but the bank's legacy system speaks SOAP and XML. We need an approved integration layer to translate between them. LDAP access is also still unverified."
        );
      }, 3200);

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
        clearTimeout(step3);
        clearTimeout(nextPhaseTimer);
      };
    }
  }, [callPhase]);

  // Transition from Explanation to Decision
  useEffect(() => {
    if (callPhase === 'explanation') {
      const pauseTimer = setTimeout(() => {
        setSubtitleText(
          "We could build a custom converter, but I don't want to waste time building something that Bank IT won't approve. Aarav needs to help us unblock this."
        );
      }, 3500);

      const decisionTimer = setTimeout(() => {
        setCallPhase('decision');
        setActiveSpeaker(null);
      }, 6500);

      return () => {
        clearTimeout(pauseTimer);
        clearTimeout(decisionTimer);
      };
    }
  }, [callPhase]);

  // Post-Triage Plan Analysis transition
  useEffect(() => {
    if (chapter3State.task3Submitted && !chapter3State.finalReviewComplete && callPhase === 'analyzing') {
      const interval = setInterval(() => {
        setAnalyzingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setCallPhase('team_reaction');
            sound.playSystemClearance();
            onUpdateState({ finalReviewComplete: true });
            return 100;
          }
          return prev + 25;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [chapter3State.task3Submitted, chapter3State.finalReviewComplete, callPhase, onUpdateState]);

  // ── HANDLERS ──
  const handleSelectEscalation = (choice: Chapter3EscalationChoice) => {
    sound.playClick();
    if (choice === 'investigate_independently') {
      onUpdateState({
        escalationChoice: 'investigate_independently',
        escalationWarningShown: true,
      });
      setShowWarningModal(true);
    } else if (choice === 'bypass_gateway') {
      onUpdateState({
        escalationChoice: 'bypass_gateway',
        escalationWarningShown: true,
      });
      setShowWarningModal(true);
    } else {
      // Option B: Escalate to Aarav (Recommended)
      onUpdateState({
        escalationChoice: 'escalate_aarav',
        portalAccessGranted: true,
      });
      triggerAaravJoinSequence();
    }
  };

  const handleRecoverToAarav = () => {
    sound.playClick();
    setShowWarningModal(false);
    onUpdateState({
      escalationChoice: 'escalate_aarav',
      escalationRecovered: true,
      portalAccessGranted: true,
    });
    triggerAaravJoinSequence();
  };

  const triggerAaravJoinSequence = () => {
    setCallPhase('aarav_joined');
    sound.playMessagePing();
    setActiveSpeaker('aarav');
    setSubtitleText(
      "Good call. Before we ask engineering to build anything, let's establish what the bank supports and what approvals we need."
    );

    setTimeout(() => {
      setActiveSpeaker('daniel');
      setSubtitleText(
        "Exactly. I can work with the approved interface, but I need the schema and endpoint details first."
      );
    }, 2800);

    setTimeout(() => {
      setActiveSpeaker('aarav');
      setSubtitleText(
        "I've enabled your access to the Project Amigo Integration Portal. Review the evidence, identify the blocker, and recommend the next steps. We need a decision the team can actually execute."
      );
      setCallPhase('portal_ready');
    }, 5600);
  };

  // Determine Team Reaction based on player's triage performance
  const scorecard = chapter3State.scorecard;
  const isStrongPlan = scorecard.outcomeType === 'strong';
  const isPartialPlan = scorecard.outcomeType === 'partial';
  const isRiskyPlan = scorecard.outcomeType === 'poor';

  return (
    <div className="flex-1 h-full flex flex-col bg-[#111318] text-slate-100 font-sans select-none overflow-hidden relative">
      {/* ── TOP TEAMS MEETING HEADER BAR ── */}
      <div className="h-12 bg-[#1f2129] border-b border-white/10 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-white">Project Amigo | Emergency Integration Call</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                Teams Live
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
              <span>Encrypted Banking Channel</span>
              <span>•</span>
              <span>3 Participants</span>
            </div>
          </div>
        </div>

        {/* Quick Portal Switcher */}
        {chapter3State.portalAccessGranted && (
          <button
            onClick={onOpenPortal}
            className="px-3 py-1.5 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-200 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Integration Portal & Triage</span>
          </button>
        )}
      </div>

      {/* ── MAIN MEETING STAGE ── */}
      <div className="flex-1 flex flex-col p-3 overflow-hidden relative">
        {/* Connecting Screen */}
        {callPhase === 'connecting' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin flex items-center justify-center">
              <Video className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-white tracking-wide">Connecting to Daniel Brooks...</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">Negotiating secure WebRTC session · Project Amigo</p>
            </div>
          </div>
        )}

        {/* Meeting Active: Video/Share Tiles Layout */}
        {callPhase !== 'connecting' && (
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            {/* Screen Share / Terminal or Main Video Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 min-h-0 relative">
              {/* Left / Center: Screen Sharing Terminal or Main Focus Area */}
              <div className="md:col-span-3 bg-[#0a0d14] rounded-2xl border border-white/10 p-4 flex flex-col overflow-hidden relative shadow-2xl">
                {/* Screen Share Indicator Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-200">
                      {callPhase === 'analyzing'
                        ? 'Automated Integration Triage Engine'
                        : 'Daniel Brooks is sharing their screen'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Terminal Output
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>ICICI Staging Gateway : 10.14.0.22</span>
                  </div>
                </div>

                {/* ── TERMINAL LOG DISPLAY ── */}
                {callPhase !== 'analyzing' && callPhase !== 'team_reaction' && (
                  <div className="flex-1 bg-black/80 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-3.5 border border-white/10">
                    <div className="text-sky-400 font-bold border-b border-slate-800 pb-2 flex items-center justify-between text-xs sm:text-[13px]">
                      <span>PROJECT AMIGO — INTEGRATION SERVICE LOG</span>
                      <span className="text-xs text-slate-400">FORMAT: ISO-8601/JSON-REST</span>
                    </div>

                    {SCREEN_SHARE_LOGS.map((log, idx) => {
                      const isHighlighted = idx <= highlightedLogIndex;
                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: isHighlighted ? 1 : 0.4, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`p-3 rounded-lg border transition-all ${
                            log.severity === 'error'
                              ? 'bg-rose-950/25 border-rose-500/40 text-rose-200'
                              : 'bg-amber-950/25 border-amber-500/40 text-amber-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-xs sm:text-[13px]">
                            <span className="text-slate-300">[{log.time}] {log.service}</span>
                            <span
                              className={`text-[11px] px-2.5 py-0.5 rounded font-bold uppercase ${
                                log.severity === 'error'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {log.status}
                            </span>
                          </div>

                          {log.details.length > 0 && (
                            <div className="mt-2 space-y-1 text-xs sm:text-[12.5px] text-slate-200 pl-2.5 border-l-2 border-white/15">
                              {log.details.map((d, dIdx) => (
                                <div key={dIdx} className="flex space-x-2">
                                  <span className="text-slate-400 w-20">{d.key}:</span>
                                  <span className={d.key === 'Received' ? 'text-rose-300 font-bold' : 'text-emerald-300 font-medium'}>
                                    {d.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}

                    <div className="pt-2.5 text-xs text-slate-400 border-t border-slate-800 flex items-center justify-between">
                      <span>Gateway Mode: Reverse Proxy · Protocol Translation Gate</span>
                      <span className="text-amber-400 font-semibold">⚠ Awaiting Interface Contract Approval</span>
                    </div>
                  </div>
                )}

                {/* ── ANALYZING STATE (POST-TRIAGE) ── */}
                {callPhase === 'analyzing' && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full border-4 border-sky-500/30 border-t-sky-400 animate-spin flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-sky-400" />
                    </div>
                    <div className="text-center space-y-1">
                      <div className="text-sm font-mono font-bold uppercase tracking-wider text-sky-400">
                        ANALYSING INTEGRATION PLAN...
                      </div>
                      <p className="text-xs text-slate-400">
                        Evaluating protocol compatibility, security boundaries, and dependency ordering
                      </p>
                    </div>
                    <div className="w-64 h-2 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${analyzingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* ── TEAM REACTION STATE ── */}
                {callPhase === 'team_reaction' && (
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {/* Compact Submitted Plan Summary */}
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-white/10 text-xs space-y-2">
                      <div className="text-[10px] font-mono uppercase text-sky-400 font-bold tracking-wider">
                        Submitted Plan Summary
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="p-2 rounded bg-black/40 border border-white/5">
                          <div className="text-[10px] text-slate-400">Primary Blocker</div>
                          <div className="font-bold text-white">
                            {chapter3State.task1Selected === 'protocol_mismatch'
                              ? 'Protocol Mismatch (SOAP/REST)'
                              : 'Identified with corrections'}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-black/40 border border-white/5">
                          <div className="text-[10px] text-slate-400">Selected Approach</div>
                          <div className="font-bold text-white">
                            {chapter3State.task2Selected === 'approved_gateway'
                              ? 'Approved Integration Gateway'
                              : chapter3State.task2Selected === 'direct_database'
                              ? 'Direct Database (Risky)'
                              : 'Custom Converter (Rework)'}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-black/40 border border-white/5">
                          <div className="text-[10px] text-slate-400">Execution Plan</div>
                          <div className="font-bold text-white">
                            {isStrongPlan ? 'Parallel Mocks & Gated Testing' : 'Plan Sequenced'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Character Reaction Dialogue Cards */}
                    <div className="space-y-3">
                      {/* Daniel Reaction */}
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-orange-500/35 flex items-start space-x-3.5 shadow-md">
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-orange-500/40 shrink-0">
                          <img src="/character/Daniel_Brooks/DanielDP.png" alt="Daniel" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-white">Daniel Brooks</span>
                            <span className="text-xs text-orange-400 font-mono">Lead Developer</span>
                          </div>
                          <p className="text-sm sm:text-[14.5px] text-slate-100 mt-1.5 leading-relaxed font-normal">
                            {isStrongPlan
                              ? "“That works. I'll prepare the adapter and local test cases against the approved interface while Bank IT validates the schema. I'll keep the LDAP access check separate.”"
                              : isPartialPlan
                              ? "“The gateway approach is sound, but we still need the approved schema and verified access before we can complete the integration tests.”"
                              : "“I was ready to build the custom adapter, but Marcus is right—if Bank IT rejects the schema, we lose all that work.”"}
                          </p>
                        </div>
                      </div>

                      {/* Aarav Reaction */}
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-yellow-500/35 flex items-start space-x-3.5 shadow-md">
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-yellow-500/40 shrink-0">
                          <img src="/character/AaravDP.png" alt="Aarav" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-white">Aarav Kapoor</span>
                            <span className="text-xs text-yellow-400 font-mono">Project Manager</span>
                          </div>
                          <p className="text-sm sm:text-[14.5px] text-slate-100 mt-1.5 leading-relaxed font-normal">
                            {isStrongPlan
                              ? "“Good. We've turned an unclear blocker into an actionable plan. I'll track the Bank IT confirmation and the identity-access dependency separately.”"
                              : isPartialPlan
                              ? "“We have a viable direction now. Let's make sure we track the Bank IT schema approval as a formal blocker on the board.”"
                              : "“Rework the plan around the approved gateway. We can lose some time correcting the approach now, or create a much larger problem later.”"}
                          </p>
                        </div>
                      </div>

                      {/* Marcus Reaction */}
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-sky-500/35 flex items-start space-x-3.5 shadow-md">
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-sky-500/40 shrink-0">
                          <img src="/character/marcus_reed/MarcusDP.png" alt="Marcus" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-white">Marcus Reed</span>
                            <span className="text-xs text-sky-400 font-mono">Chief Technology Officer</span>
                          </div>
                          <p className="text-sm sm:text-[14.5px] text-slate-100 mt-1.5 leading-relaxed font-normal">
                            {isStrongPlan || chapter3State.task2Recovered
                              ? "“Proceed only through the approved integration architecture. No production credentials or unapproved endpoints in local testing. Confirm the interface and access requirements before integration testing.”"
                              : "“Stop. That approach bypasses the approved integration boundary. We are not connecting directly to the bank's database or using an unapproved endpoint.”"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Button to Open Scorecard */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={onOpenScorecard}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/30 flex items-center space-x-2 cursor-pointer transition-all"
                      >
                        <span>View Chapter 3 Scorecard & Learnings</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Participant Tiles & Presence */}
              <div className="md:col-span-1 flex flex-col gap-2 min-h-0">
                {/* Daniel Brooks Tile */}
                <div
                  className={`flex-1 min-h-[100px] bg-[#1a1d26] rounded-xl border p-2.5 flex flex-col justify-between relative overflow-hidden transition-all ${
                    activeSpeaker === 'daniel' ? 'border-orange-500 ring-2 ring-orange-500/40' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 truncate">Daniel Brooks</span>
                    <span className="text-[9px] font-mono text-orange-400">Developer</span>
                  </div>
                  <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800">
                    <img src="/character/Daniel_Brooks/DanielDP.png" alt="Daniel" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Mic className="w-3 h-3 text-emerald-400" />
                      {activeSpeaker === 'daniel' && <span className="text-orange-400 animate-pulse font-bold">Speaking...</span>}
                    </span>
                    <VideoOff className="w-3 h-3 text-slate-500" />
                  </div>
                </div>

                {/* Aarav Kapoor Tile (Visible when joined) */}
                {(callPhase === 'aarav_joined' || callPhase === 'portal_ready' || callPhase === 'team_reaction' || callPhase === 'analyzing' || chapter3State.portalAccessGranted) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex-1 min-h-[100px] bg-[#1a1d26] rounded-xl border p-2.5 flex flex-col justify-between relative overflow-hidden transition-all ${
                      activeSpeaker === 'aarav' ? 'border-yellow-500 ring-2 ring-yellow-500/40' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-300 truncate">Aarav Kapoor</span>
                      <span className="text-[9px] font-mono text-yellow-400">Project Manager</span>
                    </div>
                    <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800">
                      <img src="/character/AaravDP.png" alt="Aarav" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mic className="w-3 h-3 text-emerald-400" />
                        {activeSpeaker === 'aarav' && <span className="text-yellow-400 animate-pulse font-bold">Speaking...</span>}
                      </span>
                      <VideoOff className="w-3 h-3 text-slate-500" />
                    </div>
                  </motion.div>
                )}

                {/* Marcus Reed Tile (CTO) */}
                <div
                  className={`flex-1 min-h-[100px] bg-[#1a1d26] rounded-xl border p-2.5 flex flex-col justify-between relative overflow-hidden transition-all ${
                    activeSpeaker === 'marcus' ? 'border-sky-500 ring-2 ring-sky-500/40' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 truncate">Marcus Reed</span>
                    <span className="text-[9px] font-mono text-sky-400">CTO</span>
                  </div>
                  <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800">
                    <img src="/character/marcus_reed/MarcusDP.png" alt="Marcus" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Mic className="w-3 h-3 text-slate-500" />
                      {activeSpeaker === 'marcus' && <span className="text-sky-400 animate-pulse font-bold">Speaking...</span>}
                    </span>
                    <VideoOff className="w-3 h-3 text-slate-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── SUBTITLE / CAPTIONS BAR ── */}
            {subtitleText && (
              <div className="p-3.5 bg-slate-950/95 border border-white/15 rounded-2xl flex items-start space-x-3.5 shadow-2xl backdrop-blur-md">
                <Volume2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-sky-300 uppercase font-mono text-xs tracking-wider mr-2">
                    {activeSpeaker === 'daniel' ? 'Daniel Brooks' : activeSpeaker === 'aarav' ? 'Aarav Kapoor' : 'Marcus Reed'}:
                  </span>
                  <span className="text-white font-medium text-sm sm:text-[15.5px] leading-relaxed">{subtitleText}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DECISION OVERLAY: INVOLVE AARAV ── */}
        {callPhase === 'decision' && !chapter3State.portalAccessGranted && (
          <div className="absolute inset-x-4 bottom-16 bg-[#0e1320]/95 backdrop-blur-xl border border-sky-500/50 rounded-2xl p-5 shadow-[0_0_50px_rgba(14,165,233,0.3)] z-30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold">
                  PROJECT AMIGO · DECISION GATE
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">What's your next move?</h3>
              </div>
              <span className="text-xs sm:text-sm text-slate-300 font-medium">Choose how to handle the integration blocker</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ESCALATION_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectEscalation(opt.id)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2.5 cursor-pointer ${
                    opt.isRecommended
                      ? 'bg-sky-950/40 hover:bg-sky-900/50 border-sky-500/50 hover:border-sky-400 ring-1 ring-sky-500/30'
                      : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/80 hover:border-slate-500'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-sky-400">{opt.badge}</span>
                      {opt.isRecommended && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-sm sm:text-[14.5px] font-bold text-white leading-snug">{opt.quote}</div>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-normal">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PORTAL UNLOCKED PROMPT BANNER ── */}
        {callPhase === 'portal_ready' && !chapter3State.task3Submitted && (
          <div className="p-3 bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/50 rounded-xl flex items-center justify-between shrink-0 shadow-lg mt-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  ACCESS GRANTED — PROJECT AMIGO INTEGRATION PORTAL
                </span>
                <p className="text-xs text-white font-semibold">
                  Aarav has unlocked the technical evidence, architecture constraints, and triage assignment.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenPortal}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center space-x-1.5 cursor-pointer transition-all"
            >
              <span>Launch Integration Triage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── BOTTOM MEETING CONTROLS BAR ── */}
      <div className="h-14 bg-[#1a1c24] border-t border-white/10 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
          <span>Project Amigo</span>
          <span>•</span>
          <span className="text-emerald-400">09:41 AM (In-Game)</span>
        </div>

        {/* Center Meeting Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMicMuted(!micMuted)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              micMuted ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
            }`}
            title={micMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setCameraOff(!cameraOff)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              cameraOff ? 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            }`}
            title="Camera Toggle"
          >
            {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenPortal}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 transition-all cursor-pointer"
            title="Share / Portal"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenScorecard}
            className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer shadow-md shadow-red-600/30"
            title="Leave Call"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          <span>Status: </span>
          <span className="text-sky-400 font-bold uppercase">{callPhase.replace('_', ' ')}</span>
        </div>
      </div>

      {/* ── RECOVERY WARNING MODAL (FOR OPTION A OR C) ── */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-[#0e1320] border border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center space-x-3 text-amber-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="font-extrabold text-white text-base">
                {chapter3State.escalationChoice === 'bypass_gateway'
                  ? 'Security & Architecture Policy Violation'
                  : 'Engineering Stagnation Alert'}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {chapter3State.escalationChoice === 'bypass_gateway'
                ? "Marcus Reed (CTO) interrupts: 'Stop. Direct database access is strictly prohibited under ICICI Bank enterprise security and audit standards. Any direct unapproved connection will fail compliance audits. You must route through the approved gateway.'"
                : "Daniel Brooks reports back: 'I checked our internal logs again, but without bank WSDL schemas and approved endpoints, I am spinning my wheels. We cannot unblock this without Aarav escalating to Bank IT.'"}
            </p>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={handleRecoverToAarav}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/30 flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revise Approach: Involve Aarav (Recommended)</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
