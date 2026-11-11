import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  GraduationCap,
  Contact2,
  Bot,
  ShieldAlert,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  Mail,
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

export const Chapter12MeetingApp: React.FC<Chapter12MeetingAppProps> = ({
  chapter12State,
  onUpdateState,
  onOpenControlCenter,
  onWatchCinematic,
  onOpenReport,
}) => {
  // Determine dialogue flow step:
  // Step 1: Marcus opening congratulations
  // Step 2: Marcus introduces 3 deferred modules (presentation screen share activates)
  // Step 3: Marcus presents core framework security upgrade
  // Step 4: Daniel warns about shared DB and existing services
  // Step 5: Martha asks about Change Request
  // Step 6: Aarav Kapoor sets controlled upgrade mandate -> Launch Control Center button
  const [introStep, setIntroStep] = useState<number>(() => {
    return chapter12State.meetingIntroCompleted ? 6 : 1;
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Final Decision state (Part 3)
  const [selectedDecision, setSelectedDecision] = useState<Chapter12DecisionChoice>(
    chapter12State.decisionChosen || 'choice_b'
  );
  const [decisionSubmitted, setDecisionSubmitted] = useState<boolean>(
    Boolean(chapter12State.decisionChosen)
  );

  // Outcome dialogue step (Part 4)
  const [outcomeStep, setOutcomeStep] = useState<number>(1);

  // Is player in Phase 3 (Decision) or Phase 4 (Outcome)?
  const isPostControlCenter = chapter12State.deploymentCompleted;
  const isAuthorized = decisionSubmitted || chapter12State.decisionChosen !== null;

  const handleNextIntroStep = () => {
    sound.playClick();
    if (introStep < 6) {
      const nextStep = introStep + 1;
      setIntroStep(nextStep);
      if (nextStep === 6) {
        onUpdateState({
          meetingIntroCompleted: true,
          meetingInitiated: true,
          controlCenterOpened: true,
        });
      }
    }
  };

  const handleLaunchControlCenter = () => {
    sound.playSystemClearance();
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
    const updatedState: Partial<Chapter12State> = {
      decisionChosen: selectedDecision,
      currentStage: 'approval_outcome',
      timelineTimestamp: '30:55',
    };
    const scorecard = computeChapter12Score({
      ...chapter12State,
      decisionChosen: selectedDecision,
    });
    updatedState.scorecard = scorecard;
    setDecisionSubmitted(true);
    onUpdateState(updatedState);
  };

  const handleProceedCinematic = () => {
    sound.playSystemClearance();
    onUpdateState({
      currentStage: 'cinematic_montage',
      cinematicWatched: true,
      completed: true,
    });
    if (onWatchCinematic) onWatchCinematic();
  };

  // Determine current active speaker
  const getActiveSpeaker = () => {
    if (!isPostControlCenter) {
      if (introStep <= 3) return 'marcus';
      if (introStep === 4) return 'daniel';
      if (introStep === 5) return 'martha';
      return 'aarav';
    }
    if (!isAuthorized) return 'aarav';
    if (outcomeStep === 1) return 'marcus';
    if (outcomeStep === 2) return 'daniel';
    if (outcomeStep === 3) return 'martha';
    return 'aarav';
  };

  const activeSpeakerKey = getActiveSpeaker();

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* ── TOP TEAMS HEADER BAR ── */}
      <div className="bg-slate-900/95 border-b border-indigo-500/20 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Recording
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {isPostControlCenter ? '30:42 / 31:00' : '29:03 / 31:00'}
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              {isPostControlCenter
                ? 'Steering Committee — Final Authorization'
                : 'Project Amigo — Steering Committee Review'}
            </h1>
          </div>
        </div>

        {/* Right Status Button */}
        <div className="flex items-center gap-2">
          {chapter12State.completed ? (
            <button
              onClick={onOpenReport}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Final Report</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (chapter12State.meetingIntroCompleted && onOpenControlCenter) {
                  onOpenControlCenter();
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5"
            >
              <PhoneOff className="w-3.5 h-3.5 text-rose-400" />
              <span>Leave</span>
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN VIDEO AREA ── */}
      <div className="flex-1 flex flex-col lg:flex-row p-2.5 gap-2.5 overflow-hidden min-h-0">
        {/* ── LEFT: PRESENTATION AREA (~65%) OR FINAL DECISION PANEL ── */}
        <div className="flex-1 flex flex-col bg-slate-900/90 rounded-2xl border border-indigo-500/30 overflow-hidden shadow-2xl relative min-h-0">
          {!isPostControlCenter ? (
            /* SCENE 12.1: MARCUS PRESENTATION (Matches Panel 1 of reference image) */
            <div className="flex-1 flex flex-col justify-between p-3 sm:p-3.5 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40">
              <div>
                {/* Presentation Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded bg-[#B02A30] text-white font-extrabold text-xs tracking-wider">
                      ICICI Bank
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                      PROJECT AMIGO
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      Phase 1: Production Stable
                    </span>
                  </div>
                </div>

                {/* Presentation Slide Title */}
                <div className="mt-2 mb-2 shrink-0">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
                    Phase 2 Evolution — Upgrade Request
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Reactivation of deferred functional modules and enterprise framework security enhancement.
                  </p>
                </div>

                {/* 4 Feature Cards (Matches Panel 1) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0">
                  {/* CARD 1: LMS */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-indigo-500/30 flex items-start gap-2.5 hover:border-indigo-400/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white leading-tight">
                        Learning Management System (LMS)
                      </h3>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                        Employee training, learning modules and course management.
                      </p>
                    </div>
                  </motion.div>

                  {/* CARD 2: Digital Visiting Cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-indigo-500/30 flex items-start gap-2.5 hover:border-indigo-400/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                      <Contact2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white leading-tight">
                        Digital Visiting Cards
                      </h3>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                        Digital employee identity and contact management.
                      </p>
                    </div>
                  </motion.div>

                  {/* CARD 3: AI HR Chatbot */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-2.5 rounded-xl bg-slate-800/80 border border-indigo-500/30 flex items-start gap-2.5 hover:border-indigo-400/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-300 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white leading-tight">
                        AI HR Chatbot
                      </h3>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                        AI-powered employee HR assistance and automated query handling.
                      </p>
                    </div>
                  </motion.div>

                  {/* CARD 4: Core Framework Security Upgrade */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-2.5 rounded-xl bg-indigo-950/60 border border-amber-500/40 flex items-start gap-2.5 hover:border-amber-400/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-amber-300 leading-tight">
                          Core Framework Security Upgrade
                        </h3>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                          Platform
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                        Upgrade the existing application framework while maintaining compatibility with Phase 1 services.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Board Expectation Box (Matches Panel 1) */}
              <div className="mt-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 shrink-0">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Board Expectation & Directive
                </h4>
                <ul className="mt-1 space-y-0.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Reactivate deferred Phase 2 modules into production candidate.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Upgrade core framework for enhanced enterprise security and long-term support.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Provide a safe and controlled release roadmap that guarantees zero Phase 1 outage.</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : !isAuthorized ? (
            /* PART 3: FINAL DECISION SCREEN (Matches Panel 5 of reference image) */
            <div className="flex-1 flex flex-col justify-between p-3 sm:p-3.5 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/60">
              <div className="border-b border-white/10 pb-1.5 mb-2 shrink-0">
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold tracking-widest">
                  Steering Committee · Final Authorization
                </span>
                <h2 className="text-base sm:text-lg font-black text-white mt-0.5 leading-tight">
                  PHASE 2 RELEASE AUTHORIZATION
                </h2>
                <p className="text-xs text-slate-300">
                  How will you authorize the upgrade?
                </p>
              </div>

              {/* Two Decision Cards (Matches Panel 5) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-auto shrink-0">
                {/* CHOICE A: MONOLITHIC DEPLOYMENT */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setSelectedDecision('choice_a');
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedDecision === 'choice_a'
                      ? 'bg-rose-950/40 border-rose-500 shadow-xl shadow-rose-950/40 ring-1 ring-rose-500'
                      : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                        Choice A
                      </span>
                      <input
                        type="radio"
                        checked={selectedDecision === 'choice_a'}
                        onChange={() => setSelectedDecision('choice_a')}
                        className="accent-rose-500 w-4 h-4"
                      />
                    </div>
                    <h3 className="text-sm font-black text-white">
                      Monolithic Deployment
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">
                      Push all Phase 2 features and framework updates into production in one massive deployment.
                    </p>
                    <p className="text-[11px] italic text-slate-400 mt-1 border-l-2 border-rose-500/40 pl-2">
                      "The board wants everything together. Let's deploy it all at once."
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-white/10 space-y-0.5 text-xs font-mono">
                    <div className="flex justify-between text-emerald-400">
                      <span>Schedule / Timeline</span>
                      <span>+5</span>
                    </div>
                    <div className="flex justify-between text-rose-400 font-bold">
                      <span>Trust & Risk Management</span>
                      <span>-40</span>
                    </div>
                    <div className="flex justify-between text-rose-400 font-bold">
                      <span>Delivery Governance</span>
                      <span>-35</span>
                    </div>
                  </div>
                </div>

                {/* CHOICE B: CONTROLLED PHASED UPGRADE (RECOMMENDED) */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setSelectedDecision('choice_b');
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedDecision === 'choice_b'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500'
                      : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        Choice B
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold normal-case">
                          Recommended
                        </span>
                      </span>
                      <input
                        type="radio"
                        checked={selectedDecision === 'choice_b'}
                        onChange={() => setSelectedDecision('choice_b')}
                        className="accent-emerald-500 w-4 h-4"
                      />
                    </div>
                    <h3 className="text-sm font-black text-white">
                      Controlled Phased Upgrade
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">
                      Establish a formal CR-Upgrade pipeline. Use feature flags to roll out Phase 2 modules incrementally via blue-green staging environments.
                    </p>
                    <p className="text-[11px] italic text-slate-400 mt-1 border-l-2 border-emerald-500/40 pl-2">
                      "We'll release progressively, validate each upgrade, and preserve the ability to roll back safely."
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-white/10 space-y-0.5 text-xs font-mono">
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Schedule / Timeline</span>
                      <span>+15</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Trust & Risk Management</span>
                      <span>+30</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Delivery Governance</span>
                      <span>+30</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Team Efficiency & Velocity</span>
                      <span>+20</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authorize Button */}
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-end shrink-0">
                <button
                  onClick={handleAuthorizeDecision}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <span>Authorize Release Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* PART 4: FINAL OUTCOME (EMAIL & RESOLUTION) */
            <div className="flex-1 flex flex-col justify-between p-2.5 sm:p-3 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/60">
              {chapter12State.decisionChosen === 'choice_b' ? (
                /* CHOICE B OUTCOME */
                <div className="space-y-1.5">
                  <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Green Environment Validated & Approved</div>
                      <div className="text-[11px] text-emerald-400/80 leading-tight">
                        Zero-downtime routing operational with Blue rollback safeguard intact.
                      </div>
                    </div>
                  </div>

                  {/* Marcus Approval Email */}
                  <div className="p-2.5 rounded-xl bg-slate-800/90 border border-indigo-500/30 shadow-xl">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-1 mb-1">
                      <Mail className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-xs font-bold text-white">
                        {MARCUS_APPROVAL_EMAIL.subject}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-400 font-mono mb-1 flex flex-wrap gap-x-4">
                      <span>From: {MARCUS_APPROVAL_EMAIL.sender}</span>
                      <span>To: {MARCUS_APPROVAL_EMAIL.recipient}</span>
                    </div>
                    <div className="text-[11px] text-slate-200 leading-[1.3] whitespace-pre-line bg-slate-900/60 p-2 rounded-lg border border-white/5">
                      {MARCUS_APPROVAL_EMAIL.body}
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      onClick={handleProceedCinematic}
                      className="px-5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer font-extrabold"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Watch Final Transformation Cinematic</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* CHOICE A OUTCOME (HIGH RISK WARNING) */
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider">
                        High Risk Assessment — Monolithic Rollout Flagged
                      </div>
                      <div className="text-xs text-rose-200 mt-1">
                        Daniel and the architecture committee have flagged high operational blast radius.
                        Overlapping dependencies between LMS, Chatbot, and Core Framework require staged isolation.
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs text-slate-200 space-y-1.5">
                    <div className="font-bold text-white">Steering Committee Assessment:</div>
                    <p>
                      While monolithic release addresses immediate board speed expectations, it endangers the 99.9% uptime SLA established in Phase 1.
                      The team will initiate emergency blue-green test verification before authorizing full DNS traffic switch.
                    </p>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={handleProceedCinematic}
                      className="px-6 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Proceed to Final Transformation Summary</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: CHARACTER VIDEO TILES (Matches Panel 1 of reference image) ── */}
        <div className="w-full lg:w-72 flex flex-row lg:flex-col gap-2 shrink-0 overflow-x-auto lg:overflow-x-visible">
          {/* TILE 1: Marcus */}
          <div
            className={`relative rounded-xl border overflow-hidden flex flex-col justify-between p-2 flex-1 transition-all ${
              activeSpeakerKey === 'marcus'
                ? 'border-indigo-400 bg-indigo-950/40 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-400'
                : 'border-slate-800 bg-slate-900/80 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                {CHAPTER12_CHARACTERS.marcus.name}
                {activeSpeakerKey === 'marcus' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                Head of IT Ops
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center my-0.5">
              <img
                src={CHAPTER12_CHARACTERS.marcus.avatar}
                alt="Marcus"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-indigo-500/40 shadow-md"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Steering Committee</span>
              <Mic className="w-3 h-3 text-emerald-400" />
            </div>
          </div>

          {/* TILE 2: Aarav Kapoor */}
          <div
            className={`relative rounded-xl border overflow-hidden flex flex-col justify-between p-2 flex-1 transition-all ${
              activeSpeakerKey === 'aarav'
                ? 'border-indigo-400 bg-indigo-950/40 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-400'
                : 'border-slate-800 bg-slate-900/80 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                {CHAPTER12_CHARACTERS.aarav.name}
                {activeSpeakerKey === 'aarav' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                Senior PM
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center my-0.5">
              <img
                src={CHAPTER12_CHARACTERS.aarav.avatar}
                alt="Aarav"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-indigo-500/40 shadow-md"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Leadership Mentor</span>
              <Mic className="w-3 h-3 text-emerald-400" />
            </div>
          </div>

          {/* TILE 3: Daniel */}
          <div
            className={`relative rounded-xl border overflow-hidden flex flex-col justify-between p-2 flex-1 transition-all ${
              activeSpeakerKey === 'daniel'
                ? 'border-indigo-400 bg-indigo-950/40 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-400'
                : 'border-slate-800 bg-slate-900/80 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                {CHAPTER12_CHARACTERS.daniel.name}
                {activeSpeakerKey === 'daniel' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                Lead Dev
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center my-0.5">
              <img
                src={CHAPTER12_CHARACTERS.daniel.avatar}
                alt="Daniel"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-indigo-500/40 shadow-md"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Core Engineering</span>
              <Mic className="w-3 h-3 text-emerald-400" />
            </div>
          </div>

          {/* TILE 4: Martha */}
          <div
            className={`relative rounded-xl border overflow-hidden flex flex-col justify-between p-2 flex-1 transition-all ${
              activeSpeakerKey === 'martha'
                ? 'border-indigo-400 bg-indigo-950/40 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-400'
                : 'border-slate-800 bg-slate-900/80 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                {CHAPTER12_CHARACTERS.martha.name}
                {activeSpeakerKey === 'martha' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                Junior PM
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center my-0.5">
              <img
                src={CHAPTER12_CHARACTERS.martha.avatar}
                alt="Martha"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-indigo-500/40 shadow-md"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Transition Coordination</span>
              <Mic className="w-3 h-3 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM DIALOGUE & CONTROL BAR ── */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 shrink-0 flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Active Dialogue Subtitle Bar */}
        <div className="flex-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase text-indigo-400 tracking-wider shrink-0">
              {!isPostControlCenter
                ? introStep === 1
                  ? 'MARCUS:'
                  : introStep === 2 || introStep === 3
                  ? 'MARCUS:'
                  : introStep === 4
                  ? 'DANIEL:'
                  : introStep === 5
                  ? 'MARTHA:'
                  : 'AARAV KAPOOR:'
                : !isAuthorized
                ? 'AARAV KAPOOR:'
                : outcomeStep === 1
                ? 'MARCUS:'
                : outcomeStep === 2
                ? 'DANIEL:'
                : outcomeStep === 3
                ? 'MARTHA:'
                : 'AARAV KAPOOR:'}
            </span>
            <p className="text-xs text-slate-200 leading-snug">
              {!isPostControlCenter ? (
                introStep === 1 ? (
                  "\"First, congratulations. Phase 1 is stable, the operations team has accepted ownership, and the business is already seeing the benefits.\""
                ) : introStep === 2 ? (
                  "\"Now the board wants us to move forward. We have three deferred capabilities that need to come back into consideration.\""
                ) : introStep === 3 ? (
                  "\"The board wants all three modules, along with the framework security upgrade. They are expecting a roadmap for the next release.\""
                ) : introStep === 4 ? (
                  "\"Development isn't the biggest concern. These modules interact with existing services and database tables. If we push everything together, we could affect the stable Phase 1 environment.\""
                ) : introStep === 5 ? (
                  "\"So are we treating this as another Change Request?\""
                ) : (
                  "\"Yes. But this time, we need more than a feature list. We need a controlled upgrade strategy. I want you to take ownership of the release plan. Decide how these features should be introduced, how the new environment should be validated, and how we protect the production system.\""
                )
              ) : !isAuthorized ? (
                "\"This is your final leadership decision. Speed matters, but not at the cost of the system we've spent eleven chapters building.\""
              ) : outcomeStep === 1 ? (
                "\"Approved. Let's move forward with the phased roadmap. I want the existing platform to remain stable as we expand.\""
              ) : outcomeStep === 2 ? (
                "\"That's a much safer approach. We can evolve the system without putting the existing production environment at unnecessary risk.\""
              ) : outcomeStep === 3 ? (
                "\"All twelve chapters. We actually got this across the finish line.\""
              ) : (
                "\"You started this project with a meeting and a set of requirements. Along the way, you handled infrastructure blockers, integrations, changing requirements, production incidents, security, business value, and operational ownership. But the biggest achievement isn't that you got the product live. It's that you built something the organization can continue to grow. Congratulations. You've earned this.\""
              )}
            </p>
          </div>

          {/* Stepper Buttons */}
          <div className="shrink-0 flex items-center gap-2">
            {!isPostControlCenter ? (
              introStep < 6 ? (
                <button
                  onClick={handleNextIntroStep}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleLaunchControlCenter}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 shadow-lg shadow-sky-600/30 cursor-pointer animate-pulse"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Open Evolution Control Center</span>
                </button>
              )
            ) : isAuthorized && outcomeStep < 4 ? (
              <button
                onClick={() => {
                  sound.playClick();
                  setOutcomeStep(outcomeStep + 1);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Meeting Functional Controls (Mic, Video, Share, Leave) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isVideoOff
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
          >
            {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

