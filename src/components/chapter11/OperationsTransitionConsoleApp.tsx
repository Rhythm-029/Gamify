import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  BookOpen,
  GitBranch,
  Activity,
  FileText,
  Wrench,
  Calendar,
  CheckSquare,
  RotateCcw,
  Award,
  ArrowRight,
  UserCheck,
  AlertCircle,
  FileCheck2,
  Link2,
  Unlink2,
  ListOrdered,
  GraduationCap,
  BarChart3,
  XCircle,
  TrendingUp,
  Zap,
  Users,
  Network,
} from 'lucide-react';
import type {
  Chapter11State,
  Chapter11PortalTab,
  Chapter11DecisionChoice,
} from '../../types/chapter11';
import {
  CHAPTER11_TITLE,
  CHAPTER11_SUBTITLE,
  CHAPTER11_PROJECT_NAME,
  OPERATIONAL_REQUIREMENTS,
  AVAILABLE_RESOURCES,
  SIMULATED_INCIDENT,
  INCIDENT_RESPONSE_STEPS,
  TRAINING_WORKSHOPS,
  HYPERCARE_PHASES,
  HYPERCARE_CARDS,
  CHAPTER11_DECISION_OPTIONS,
  computeChapter11Score,
} from '../../data/chapter11Data';
import { sound } from '../onboarding/SoundEngine';

interface OperationsTransitionConsoleAppProps {
  chapter11State: Chapter11State;
  onUpdateState: (updater: Partial<Chapter11State> | ((prev: Chapter11State) => Chapter11State)) => void;
  onOpenScorecard: () => void;
  onNotifyDesktop?: (title: string, body: string) => void;
}

// Map resource icon names to lucide components
const RESOURCE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  BookOpen,
  GitBranch,
  ShieldCheck,
  Activity,
  FileText,
  Wrench,
};

// Phase color themes for Gantt-style view
const PHASE_THEMES: Record<string, { bg: string; border: string; badge: string; accent: string; dot: string }> = {
  phase_intensive: {
    bg: 'bg-rose-950/30',
    border: 'border-rose-500/40',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    accent: 'text-rose-300',
    dot: 'bg-rose-400',
  },
  phase_shared: {
    bg: 'bg-amber-950/30',
    border: 'border-amber-500/40',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accent: 'text-amber-300',
    dot: 'bg-amber-400',
  },
  phase_ops_led: {
    bg: 'bg-emerald-950/30',
    border: 'border-emerald-500/40',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    accent: 'text-emerald-300',
    dot: 'bg-emerald-400',
  },
};

export const OperationsTransitionConsoleApp: React.FC<OperationsTransitionConsoleAppProps> = ({
  chapter11State,
  onUpdateState,
  onOpenScorecard,
  onNotifyDesktop,
}) => {
  const [activeTab, setActiveTab] = useState<Chapter11PortalTab>(
    chapter11State.selectedTab || 'readiness'
  );

  // ── STAGE 1: MATCHING STATE ──
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>(
    chapter11State.matchedPairs || {}
  );
  const [matchingError, setMatchingError] = useState<string | null>(null);
  const [matchingSubmitted, setMatchingSubmitted] = useState<boolean>(
    Boolean(chapter11State.matchingCompleted)
  );

  // ── STAGE 2: INCIDENT SIMULATION & TRAINING STATE ──
  const [incidentSlots, setIncidentSlots] = useState<(string | null)[]>(
    chapter11State.incidentSlots || [null, null, null]
  );
  const [incidentValidated, setIncidentValidated] = useState<boolean>(
    Boolean(chapter11State.incidentValidated)
  );
  const [incidentValidationFeedback, setIncidentValidationFeedback] = useState<string | null>(null);
  const [workshopsScheduled, setWorkshopsScheduled] = useState<boolean>(
    Boolean(chapter11State.workshopsScheduled)
  );

  // ── STAGE 3: HYPERCARE ASSIGNMENTS STATE ──
  const [phaseAssignments, setPhaseAssignments] = useState<Record<string, string>>(
    chapter11State.phaseAssignments || {}
  );
  const [hypercareSubmitted, setHypercareSubmitted] = useState<boolean>(
    Boolean(chapter11State.hypercareCompleted)
  );
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // ── STAGE 4: FINAL GOVERNANCE DECISION STATE ──
  const [selectedDecision, setSelectedDecision] = useState<Chapter11DecisionChoice | null>(
    chapter11State.decisionChosen || null
  );
  const [decisionCommitted, setDecisionCommitted] = useState<boolean>(
    Boolean(chapter11State.completed)
  );

  // Helper for matching stage
  const handleSelectRequirement = (reqId: string) => {
    if (matchingSubmitted) return;
    sound.playClick();
    setSelectedReqId(reqId === selectedReqId ? null : reqId);
    setMatchingError(null);
  };

  const handleSelectResource = (resId: string) => {
    if (matchingSubmitted || !selectedReqId) return;
    const req = OPERATIONAL_REQUIREMENTS.find((r) => r.id === selectedReqId);
    if (!req) return;

    if (req.targetResourceId === resId) {
      sound.playSystemClearance();
      const updated = { ...matchedPairs, [selectedReqId]: resId };
      setMatchedPairs(updated);
      setSelectedReqId(null);
      setMatchingError(null);
      onUpdateState({ matchedPairs: updated });
    } else {
      sound.playClick();
      setMatchingError(`Resource does not match requirement. Review operational purpose.`);
      setTimeout(() => setMatchingError(null), 2500);
    }
  };

  const handleUnpair = (reqId: string) => {
    if (matchingSubmitted) return;
    sound.playClick();
    const updated = { ...matchedPairs };
    delete updated[reqId];
    setMatchedPairs(updated);
    onUpdateState({ matchedPairs: updated });
  };

  const handleSubmitMatching = () => {
    sound.playSystemClearance();
    setMatchingSubmitted(true);
    onUpdateState({
      matchingCompleted: true,
      currentStage: 'transition_console',
      selectedTab: 'knowledge_transfer',
    });
    setActiveTab('knowledge_transfer');
    if (onNotifyDesktop) {
      onNotifyDesktop(
        'Operational Readiness Validated',
        'Handover package verified. Marcus and IT Operations unlocked Stage 2.'
      );
    }
  };

  // Helper for Stage 2: Incident response sequence
  const handleAssignIncidentSlot = (stepId: string, slotIndex: number) => {
    if (incidentValidated) return;
    sound.playClick();
    const updated = [...incidentSlots];
    // Remove from other slots if already placed
    const existingIndex = updated.indexOf(stepId);
    if (existingIndex !== -1) {
      updated[existingIndex] = null;
    }
    updated[slotIndex] = stepId;
    setIncidentSlots(updated);
    onUpdateState({ incidentSlots: updated });
  };

  const handleClearIncidentSlot = (slotIndex: number) => {
    if (incidentValidated) return;
    sound.playClick();
    const updated = [...incidentSlots];
    updated[slotIndex] = null;
    setIncidentSlots(updated);
    onUpdateState({ incidentSlots: updated });
  };

  const handleValidateIncidentSequence = () => {
    const isCorrect =
      incidentSlots[0] === 'step_access_check' &&
      incidentSlots[1] === 'step_runbook_restart' &&
      incidentSlots[2] === 'step_escalation_route';

    if (isCorrect) {
      sound.playSystemClearance();
      setIncidentValidated(true);
      setIncidentValidationFeedback(
        'Response Sequence Validated: L1 triage verifies account lockouts, L2 restarts SSO pod, and L3 on-call handles SLA escalations.'
      );
      onUpdateState({ incidentValidated: true });
    } else {
      sound.playClick();
      setIncidentValidationFeedback(
        'Incorrect Sequence: Start with L1 Access Guide, follow with L2 Runbook restart, and reserve Escalation Matrix for SLA breaches.'
      );
    }
  };

  const handleScheduleWorkshops = () => {
    sound.playSystemClearance();
    setWorkshopsScheduled(true);
    onUpdateState({
      workshopsScheduled: true,
      selectedTab: 'hypercare',
    });
    setActiveTab('hypercare');
    if (onNotifyDesktop) {
      onNotifyDesktop(
        'Training Workshops Scheduled',
        'Martha booked 3 knowledge transfer sessions with IT Operations in transition calendar.'
      );
    }
  };

  // Helper for Stage 3: Hypercare timeline
  const handleAssignCardToPhase = (phaseId: string) => {
    if (!selectedCardId || hypercareSubmitted) return;
    sound.playClick();
    const updated = { ...phaseAssignments, [selectedCardId]: phaseId };
    setPhaseAssignments(updated);
    setSelectedCardId(null);
    onUpdateState({ phaseAssignments: updated });
  };

  const handleSubmitHypercare = () => {
    sound.playSystemClearance();
    setHypercareSubmitted(true);
    onUpdateState({
      hypercareCompleted: true,
      selectedTab: 'governance_gate',
    });
    setActiveTab('governance_gate');
    if (onNotifyDesktop) {
      onNotifyDesktop(
        'Hypercare Plan Locked',
        '14-day progressive ownership model ratified by Marcus and Aarav Kapoor.'
      );
    }
  };

  // Helper for Stage 4: Commit decision
  const handleCommitDecision = () => {
    if (!selectedDecision) return;
    sound.playSystemClearance();
    setDecisionCommitted(true);

    const scorecard = computeChapter11Score({
      ...chapter11State,
      matchedPairs,
      matchingCompleted: matchingSubmitted,
      incidentSlots,
      incidentValidated,
      workshopsScheduled,
      phaseAssignments,
      hypercareCompleted: hypercareSubmitted,
      decisionChosen: selectedDecision,
      completed: true,
    });

    onUpdateState({
      decisionChosen: selectedDecision,
      completed: true,
      scorecard,
      currentStage: 'chapter_complete',
      timelineTimestamp: '29:00',
    });

    if (onNotifyDesktop) {
      onNotifyDesktop(
        selectedDecision === 'choice_b'
          ? 'Operational Handover Approved'
          : 'Handover Failed — Operational Gaps',
        selectedDecision === 'choice_b'
          ? 'Marcus signed the operational acceptance certificate. Project Amigo transferred to IT Operations.'
          : 'Marcus refused handover. Unprepared support teams caused production deadlock.'
      );
    }
  };

  // Metrics computation
  const correctMatchesCount = OPERATIONAL_REQUIREMENTS.filter(
    (req) => matchedPairs[req.id] === req.targetResourceId
  ).length;

  const hypercareCorrectCount = HYPERCARE_CARDS.filter(
    (c) => phaseAssignments[c.id] === c.correctPhaseId
  ).length;

  // Tab config
  const tabs: { id: Chapter11PortalTab; label: string; shortLabel: string; icon: React.FC<{ className?: string }>; done: boolean }[] = [
    { id: 'readiness', label: 'Operational Readiness', shortLabel: 'Readiness', icon: ShieldCheck, done: matchingSubmitted },
    { id: 'knowledge_transfer', label: 'Knowledge Transfer & Incident Sim', shortLabel: 'Knowledge Transfer', icon: GraduationCap, done: workshopsScheduled },
    { id: 'hypercare', label: '14-Day Hypercare Window', shortLabel: 'Hypercare', icon: Activity, done: hypercareSubmitted },
    { id: 'governance_gate', label: 'Operational Acceptance', shortLabel: 'Acceptance', icon: FileCheck2, done: decisionCommitted },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-slate-100 select-none overflow-hidden font-sans">

      {/* ── TOP HEADER BAR ── */}
      <div className="bg-[#161b22] border-b border-[#30363d] px-5 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center">
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                Operations Transition Console
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                HRMS v1.0.0 · LIVE
              </span>
            </div>
            <h1 className="text-[13px] font-bold text-white leading-tight">
              {CHAPTER11_TITLE}{' '}
              <span className="text-slate-400 font-normal text-xs hidden sm:inline">
                — {CHAPTER11_SUBTITLE}
              </span>
            </h1>
          </div>
        </div>

        {/* Right: Telemetry Badges */}
        <div className="flex items-center gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d]">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span className="text-slate-400">Hypercare:</span>
            <span className="font-bold text-indigo-300">14 Days</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-400">Support:</span>
            <span className="font-bold text-emerald-300">24/7</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d]">
            <Layers className="w-3 h-3 text-purple-400" />
            <span className="text-slate-400">Status:</span>
            <span className={`font-bold ${decisionCommitted ? (selectedDecision === 'choice_b' ? 'text-emerald-300' : 'text-rose-300') : 'text-amber-300'}`}>
              {decisionCommitted
                ? selectedDecision === 'choice_b'
                  ? 'Handover Accepted'
                  : 'Handover Rejected'
                : 'Awaiting Validation'}
            </span>
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="bg-[#161b22] border-b border-[#30363d] px-4 flex items-stretch gap-0 overflow-x-auto shrink-0">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDone = tab.done;
          return (
            <button
              key={tab.id}
              onClick={() => { sound.playClick(); setActiveTab(tab.id); }}
              className={`relative flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-indigo-400 text-white bg-indigo-500/8'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/4'
              }`}
            >
              {/* Step pill */}
              <span className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${
                isDone
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : isActive
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-[#21262d] text-slate-500 border border-[#30363d]'
              }`}>
                {isDone ? <CheckCircle2 className="w-3 h-3" /> : `0${idx + 1}`}
              </span>
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400 rounded-t" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-y-auto bg-[#0d1117]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-5">

          {/* ════════════════════════════════════════════════════════════
              TAB 1: OPERATIONAL READINESS — MAPPING UI
          ════════════════════════════════════════════════════════════ */}
          {activeTab === 'readiness' && (
            <div className="space-y-5">
              {/* Stage header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                      Stage 01
                    </span>
                    <span className="text-[10px] text-slate-500">Resource Mapping</span>
                  </div>
                  <h2 className="text-sm font-bold text-white">Build the Operational Handover Package</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select a requirement on the left, then click its matching runbook on the right to establish the connection.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center px-4 py-2 rounded-lg bg-[#0d1117] border border-[#30363d]">
                    <div className="text-lg font-black text-indigo-300 leading-none">{correctMatchesCount}<span className="text-slate-500 text-xs font-normal">/6</span></div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Matched</div>
                  </div>
                </div>
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {matchingError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{matchingError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── MAPPING LAYOUT ── */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_48px_1fr] gap-0 md:gap-0 items-start">

                {/* LEFT: Requirements */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-1 pb-2 border-b border-[#21262d]">
                    <div className="w-1 h-4 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operational Requirements</span>
                  </div>
                  {OPERATIONAL_REQUIREMENTS.map((req) => {
                    const isMatched = Boolean(matchedPairs[req.id]);
                    const matchedResource = AVAILABLE_RESOURCES.find((r) => r.id === matchedPairs[req.id]);
                    const isSelected = selectedReqId === req.id;

                    return (
                      <div
                        key={req.id}
                        onClick={() => handleSelectRequirement(req.id)}
                        className={`group relative p-3.5 rounded-lg border transition-all cursor-pointer ${
                          isMatched
                            ? 'bg-emerald-950/20 border-emerald-500/35 opacity-80'
                            : isSelected
                            ? 'bg-indigo-950/40 border-indigo-400/70 shadow-[0_0_0_2px_rgba(99,102,241,0.2)]'
                            : 'bg-[#161b22] border-[#30363d] hover:border-indigo-500/40 hover:bg-[#1c2129]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Status indicator */}
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                            isMatched ? 'bg-emerald-400' : isSelected ? 'bg-indigo-400 animate-pulse' : 'bg-[#30363d]'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                isMatched
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                  : 'bg-[#21262d] text-slate-500 border-[#30363d]'
                              }`}>
                                {req.category}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-200">{req.requirement}</div>

                            {/* Matched resource pill */}
                            {isMatched && matchedResource && (
                              <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-mono">
                                  <Link2 className="w-3 h-3" />
                                  <span>{matchedResource.name}</span>
                                </div>
                                {!matchingSubmitted && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleUnpair(req.id); }}
                                    className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-0.5 transition-colors"
                                  >
                                    <Unlink2 className="w-2.5 h-2.5" />
                                    Unlink
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Interaction hint */}
                            {!isMatched && (
                              <div className={`mt-1 text-[10px] font-mono ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`}>
                                {isSelected ? '→ Now select a resource on the right' : 'Click to select'}
                              </div>
                            )}
                          </div>
                          {isMatched && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CENTER: Connector column */}
                <div className="hidden md:flex flex-col items-center pt-10 gap-[18px] px-2">
                  {OPERATIONAL_REQUIREMENTS.map((req) => {
                    const isMatched = Boolean(matchedPairs[req.id]);
                    return (
                      <div key={req.id} className="h-[66px] flex items-center justify-center">
                        <div className={`w-6 h-px transition-all ${isMatched ? 'bg-emerald-500/50' : 'bg-[#30363d]'}`} />
                      </div>
                    );
                  })}
                </div>

                {/* RIGHT: Resources */}
                <div className="space-y-2 mt-4 md:mt-0">
                  <div className="flex items-center gap-2 px-1 pb-2 border-b border-[#21262d]">
                    <div className="w-1 h-4 rounded-full bg-purple-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Runbooks & Resources</span>
                  </div>
                  {AVAILABLE_RESOURCES.map((res) => {
                    const isAlreadyPaired = Object.values(matchedPairs).includes(res.id);
                    const ResIcon = RESOURCE_ICONS[res.iconName] || FileText;
                    const isClickable = !!selectedReqId && !isAlreadyPaired && !matchingSubmitted;

                    return (
                      <div
                        key={res.id}
                        onClick={() => handleSelectResource(res.id)}
                        className={`p-3.5 rounded-lg border transition-all ${
                          isAlreadyPaired
                            ? 'bg-[#161b22] border-[#21262d] opacity-45 cursor-default'
                            : isClickable
                            ? 'bg-indigo-950/30 border-indigo-500/50 cursor-pointer hover:bg-indigo-950/50 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]'
                            : 'bg-[#161b22] border-[#30363d] cursor-default hover:border-[#444d56]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`mt-0.5 w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                            isAlreadyPaired
                              ? 'bg-[#21262d] border-[#30363d] text-slate-600'
                              : isClickable
                              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                              : 'bg-[#21262d] border-[#30363d] text-slate-500'
                          }`}>
                            <ResIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-200">{res.name}</span>
                              {isAlreadyPaired && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">{res.docFormat}</div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{res.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit bar */}
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  {correctMatchesCount === 6 ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      All 6 operational resources paired accurately — handover package complete.
                    </span>
                  ) : (
                    <span>Pair all <strong className="text-slate-200">6</strong> operational requirements to validate the handover package.</span>
                  )}
                </div>
                <button
                  disabled={correctMatchesCount < 6 || matchingSubmitted}
                  onClick={handleSubmitMatching}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                    correctMatchesCount === 6 && !matchingSubmitted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 cursor-pointer active:scale-95'
                      : 'bg-[#21262d] text-slate-500 border border-[#30363d] cursor-not-allowed'
                  }`}
                >
                  <span>{matchingSubmitted ? 'Handover Package Ratified ✓' : 'Lock Handover Package & Continue'}</span>
                  {!matchingSubmitted && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 2: KNOWLEDGE TRANSFER — WORKFLOW BUILDER
          ════════════════════════════════════════════════════════════ */}
          {activeTab === 'knowledge_transfer' && (
            <div className="space-y-6">

              {/* Live incident alert */}
              <div className="p-4 rounded-xl bg-[#1a0f0f] border border-rose-500/30 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 font-mono">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      {SIMULATED_INCIDENT.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200">{SIMULATED_INCIDENT.ticketId}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      ⚠ Priority: {SIMULATED_INCIDENT.priority}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-mono border border-rose-500/20">
                      {SIMULATED_INCIDENT.usersAffected} users affected
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{SIMULATED_INCIDENT.title}</h3>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{SIMULATED_INCIDENT.description}</p>
                  <div className="text-[10px] text-slate-500 font-mono">{SIMULATED_INCIDENT.system}</div>
                </div>
                <div className="shrink-0 p-3 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs min-w-[180px]">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Marcus's Challenge</div>
                  <div className="text-slate-200 font-medium leading-relaxed italic">"If this strikes at 2 AM, who handles what?"</div>
                </div>
              </div>

              {/* ── WORKFLOW BUILDER ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Incident Triage Workflow Builder
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {incidentValidated ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sequence Verified
                      </span>
                    ) : 'Click an action card below to place it in a step slot'}
                  </span>
                </div>

                {/* Step slots — workflow-style with arrows */}
                <div className="flex flex-col md:flex-row items-stretch gap-0">
                  {[0, 1, 2].map((slotIdx) => {
                    const assignedStepId = incidentSlots[slotIdx];
                    const stepItem = INCIDENT_RESPONSE_STEPS.find((s) => s.id === assignedStepId);
                    const isLast = slotIdx === 2;

                    return (
                      <React.Fragment key={slotIdx}>
                        <div className={`flex-1 p-4 rounded-xl border flex flex-col min-h-[160px] transition-all ${
                          stepItem
                            ? incidentValidated
                              ? 'bg-emerald-950/20 border-emerald-500/35'
                              : 'bg-[#161b22] border-indigo-500/40'
                            : 'bg-[#0d1117] border-dashed border-[#30363d]'
                        }`}>
                          {/* Step header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border ${
                                stepItem
                                  ? incidentValidated
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                  : 'bg-[#21262d] text-slate-500 border-[#30363d]'
                              }`}>
                                {slotIdx + 1}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Step {String(slotIdx + 1).padStart(2, '0')}
                              </span>
                            </div>
                            {stepItem && !incidentValidated && (
                              <button
                                onClick={() => handleClearIncidentSlot(slotIdx)}
                                className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-0.5 transition-colors"
                              >
                                <XCircle className="w-3 h-3" />
                                Clear
                              </button>
                            )}
                            {incidentValidated && stepItem && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </div>

                          {/* Content */}
                          {stepItem ? (
                            <div className="flex-1 space-y-2">
                              <div className="text-xs font-bold text-white">{stepItem.title}</div>
                              <div className="text-[11px] text-slate-300 leading-relaxed">{stepItem.actionText}</div>
                              <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-[#21262d]">
                                <Users className="w-3 h-3 text-indigo-400 shrink-0" />
                                <span className="text-[10px] text-indigo-300 font-mono font-semibold">{stepItem.role}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-[#161b22] border border-dashed border-[#30363d] flex items-center justify-center">
                                <span className="text-slate-600 text-lg">+</span>
                              </div>
                              <span className="text-[11px] text-slate-600">Drop action here</span>
                            </div>
                          )}
                        </div>

                        {/* Arrow connector between steps */}
                        {!isLast && (
                          <div className="hidden md:flex items-center justify-center w-8 shrink-0">
                            <ChevronRight className="w-4 h-4 text-[#30363d]" />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Action card pool */}
                <div className="pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    Available Response Actions — click to assign to next open slot
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {INCIDENT_RESPONSE_STEPS.map((stepItem) => {
                      const isPlaced = incidentSlots.includes(stepItem.id);
                      return (
                        <button
                          key={stepItem.id}
                          disabled={isPlaced || incidentValidated}
                          onClick={() => {
                            const firstEmptySlot = incidentSlots.findIndex((s) => s === null);
                            if (firstEmptySlot !== -1) {
                              handleAssignIncidentSlot(stepItem.id, firstEmptySlot);
                            }
                          }}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            isPlaced
                              ? 'bg-[#0d1117] border-[#21262d] opacity-40 cursor-not-allowed'
                              : incidentValidated
                              ? 'bg-[#161b22] border-[#30363d] opacity-60 cursor-not-allowed'
                              : 'bg-[#161b22] border-[#30363d] hover:border-indigo-400/50 hover:bg-[#1c2129] cursor-pointer active:scale-98'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border mt-0.5 ${
                              isPlaced
                                ? 'bg-[#21262d] border-[#30363d] text-slate-600'
                                : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                            }`}>
                              <ListOrdered className="w-3 h-3" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-200">{stepItem.title}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {stepItem.resourceName} · <span className="text-indigo-400">{stepItem.role}</span>
                              </div>
                            </div>
                          </div>
                          {isPlaced && (
                            <div className="mt-1.5 text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Placed in workflow
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Validation bar */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border ${
                  incidentValidated
                    ? 'bg-emerald-950/20 border-emerald-500/35'
                    : incidentValidationFeedback
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-[#161b22] border-[#30363d]'
                }`}>
                  <div className="text-xs">
                    {incidentValidationFeedback ? (
                      <span className={`flex items-start gap-2 ${incidentValidated ? 'text-emerald-300' : 'text-amber-300'}`}>
                        {incidentValidated
                          ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                          : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                        {incidentValidationFeedback}
                      </span>
                    ) : (
                      <span className="text-slate-400">Arrange the 3 steps in correct escalation order (L1 → L2 → L3), then validate with Marcus.</span>
                    )}
                  </div>
                  <button
                    disabled={incidentSlots.some((s) => s === null) || incidentValidated}
                    onClick={handleValidateIncidentSequence}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      !incidentSlots.some((s) => s === null) && !incidentValidated
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-95'
                        : 'bg-[#21262d] text-slate-500 border border-[#30363d] cursor-not-allowed'
                    }`}
                  >
                    {incidentValidated ? '✓ Sequence Verified' : 'Validate Response Sequence'}
                  </button>
                </div>
              </div>

              {/* ── WORKSHOPS SCHEDULE TABLE ── */}
              <div className="border-t border-[#21262d] pt-5 space-y-3">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Mandatory Operational Training Workshops</span>
                  </div>
                  <span className="text-[11px] text-purple-300 font-mono bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                    3 Sessions Prepared
                  </span>
                </div>

                {/* Workshop table */}
                <div className="rounded-xl border border-[#30363d] overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#161b22] border-b border-[#30363d]">
                        <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Session</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Session Leader</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Role</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Duration</th>
                        <th className="text-center px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TRAINING_WORKSHOPS.map((ws, i) => (
                        <tr
                          key={ws.id}
                          className={`border-b border-[#21262d] last:border-0 ${i % 2 === 0 ? 'bg-[#0d1117]' : 'bg-[#161b22]/40'}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-[9px] text-purple-400 font-bold shrink-0">
                                {i + 1}
                              </div>
                              <span className="font-semibold text-slate-200">{ws.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-300 font-medium">{ws.owner}</td>
                          <td className="px-4 py-3 text-slate-500">{ws.ownerRole}</td>
                          <td className="px-4 py-3 font-mono text-indigo-300">{ws.duration}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              workshopsScheduled
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            }`}>
                              {workshopsScheduled ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {workshopsScheduled ? 'Confirmed' : 'Prepared'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    disabled={!incidentValidated || workshopsScheduled}
                    onClick={handleScheduleWorkshops}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                      incidentValidated && !workshopsScheduled
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-900/30 cursor-pointer active:scale-95'
                        : 'bg-[#21262d] text-slate-500 border border-[#30363d] cursor-not-allowed'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>{workshopsScheduled ? 'Workshops Scheduled & Confirmed ✓' : 'Confirm Workshops & Advance to Hypercare'}</span>
                    {!workshopsScheduled && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 3: HYPERCARE — GANTT-STYLE PHASE VIEW
          ════════════════════════════════════════════════════════════ */}
          {activeTab === 'hypercare' && (
            <div className="space-y-5">
              {/* Stage header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">Stage 03</span>
                    <span className="text-[10px] text-slate-500">Progressive Ownership Transfer</span>
                  </div>
                  <h2 className="text-sm font-bold text-white">14-Day Stabilization Timeline & Progressive Ownership</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select a responsibility card below, then click the phase column to assign it. Build the progressive ownership model.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center px-4 py-2 rounded-lg bg-[#0d1117] border border-[#30363d]">
                    <div className="text-lg font-black text-indigo-300 leading-none">{hypercareCorrectCount}<span className="text-slate-500 text-xs font-normal">/4</span></div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Assigned</div>
                  </div>
                </div>
              </div>

              {/* ── GANTT-STYLE PHASE COLUMNS ── */}
              {/* Timeline bar */}
              <div className="relative">
                <div className="flex items-center gap-0 mb-1">
                  <div className="text-[9px] text-slate-600 uppercase tracking-widest mr-2 w-16 shrink-0">Days</div>
                  <div className="flex flex-1 gap-1">
                    {HYPERCARE_PHASES.map((phase, i) => {
                      const theme = PHASE_THEMES[phase.id];
                      const widths = ['w-[14%]', 'w-[36%]', 'w-[50%]'];
                      return (
                        <div key={phase.id} className={`${widths[i]} flex items-center gap-1`}>
                          <div className={`h-1.5 rounded-full flex-1 ${
                            i === 0 ? 'bg-rose-500/50' : i === 1 ? 'bg-amber-500/50' : 'bg-emerald-500/50'
                          }`} />
                          <span className={`text-[9px] font-mono font-bold whitespace-nowrap ${theme.accent}`}>{phase.daysRange}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {HYPERCARE_PHASES.map((phase) => {
                  const theme = PHASE_THEMES[phase.id];
                  const assignedCards = HYPERCARE_CARDS.filter((c) => phaseAssignments[c.id] === phase.id);
                  const isDropTarget = !!selectedCardId && !hypercareSubmitted;

                  return (
                    <div
                      key={phase.id}
                      onClick={() => handleAssignCardToPhase(phase.id)}
                      className={`rounded-xl border flex flex-col transition-all ${theme.bg} ${
                        isDropTarget
                          ? `${theme.border} shadow-[0_0_0_2px_rgba(99,102,241,0.15)] cursor-pointer scale-[1.01]`
                          : `${theme.border}`
                      }`}
                    >
                      {/* Phase header */}
                      <div className={`px-4 py-3 border-b ${theme.border} flex items-start gap-3`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${theme.dot}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${theme.badge}`}>
                              {phase.daysRange}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{phase.ownershipModel}</span>
                          </div>
                          <h3 className="text-xs font-bold text-white mt-1">{phase.label}</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{phase.focus}</p>
                        </div>
                      </div>

                      {/* Assigned cards */}
                      <div className="p-3 flex-1 space-y-2 min-h-[100px]">
                        {assignedCards.length > 0 ? (
                          assignedCards.map((card) => (
                            <div
                              key={card.id}
                              className="p-2.5 rounded-lg bg-[#0d1117]/60 border border-[#30363d] text-xs"
                            >
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>{card.title}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={`flex flex-col items-center justify-center h-full py-4 text-center transition-all rounded-lg border border-dashed ${
                            isDropTarget ? `${theme.border} bg-white/5` : 'border-[#30363d]'
                          }`}>
                            {isDropTarget ? (
                              <>
                                <span className="text-xs font-bold text-indigo-300">Click to assign</span>
                                <span className="text-[10px] text-slate-500 mt-0.5">selected card → this phase</span>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-600">No responsibilities assigned</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── RESPONSIBILITY CARD TRAY ── */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 pb-2 border-b border-[#21262d]">
                  <Network className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Responsibility Cards — Select a card, then click a phase above
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {HYPERCARE_CARDS.map((card) => {
                    const assignedPhaseId = phaseAssignments[card.id];
                    const isSelected = selectedCardId === card.id;
                    const assignedPhase = HYPERCARE_PHASES.find((p) => p.id === assignedPhaseId);
                    const phaseTheme = assignedPhaseId ? PHASE_THEMES[assignedPhaseId] : null;

                    return (
                      <div
                        key={card.id}
                        onClick={() => {
                          if (hypercareSubmitted) return;
                          sound.playClick();
                          setSelectedCardId(isSelected ? null : card.id);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/50 border-indigo-400/70 shadow-[0_0_0_2px_rgba(99,102,241,0.2)]'
                            : assignedPhaseId
                            ? `bg-[#161b22]/60 border-[#30363d] opacity-70`
                            : 'bg-[#161b22] border-[#30363d] hover:border-indigo-400/40 hover:bg-[#1c2129]'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            isSelected ? 'bg-indigo-400 animate-pulse' : assignedPhaseId ? 'bg-emerald-400' : 'bg-[#444d56]'
                          }`} />
                          <div>
                            <div className="text-[11px] font-bold text-white leading-tight">{card.title}</div>
                            <div className="text-[10px] text-slate-500 mt-1 leading-relaxed">{card.description}</div>
                            {assignedPhase && phaseTheme && (
                              <div className={`mt-2 text-[10px] font-mono font-semibold flex items-center gap-1 ${phaseTheme.accent}`}>
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                {assignedPhase.daysRange}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit bar */}
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  {hypercareCorrectCount === 4 ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      14-day transition model aligned with Marcus and IT Operations.
                    </span>
                  ) : (
                    <span>Assign all <strong className="text-slate-200">4</strong> responsibility cards into the correct timeline phases.</span>
                  )}
                </div>
                <button
                  disabled={hypercareCorrectCount < 4 || hypercareSubmitted}
                  onClick={handleSubmitHypercare}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                    hypercareCorrectCount === 4 && !hypercareSubmitted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 cursor-pointer active:scale-95'
                      : 'bg-[#21262d] text-slate-500 border border-[#30363d] cursor-not-allowed'
                  }`}
                >
                  <span>{hypercareSubmitted ? 'Hypercare Plan Approved ✓' : 'Lock Hypercare & Proceed to Acceptance'}</span>
                  {!hypercareSubmitted && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TAB 4: GOVERNANCE GATE — DECISION CARDS
          ════════════════════════════════════════════════════════════ */}
          {activeTab === 'governance_gate' && (
            <div className="space-y-6">
              {/* Gate header */}
              <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                    Scene 11.2 · Formal Operational Handover Decision
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">28:40 – 29:00</span>
                </div>
                <h2 className="text-base font-bold text-white">Operational Handover Approval Gate</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
                  The delivery team is preparing to close the project. Marcus and Aarav Kapoor await your leadership authorization. Choose your handover approach.
                </p>
              </div>

              {/* ── DECISION CARDS ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Choice A — Incomplete Transition */}
                <div
                  onClick={() => { if (decisionCommitted) return; sound.playClick(); setSelectedDecision('choice_a'); }}
                  className={`group relative rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                    decisionCommitted
                      ? 'cursor-default'
                      : 'cursor-pointer'
                  } ${
                    selectedDecision === 'choice_a'
                      ? 'border-rose-500/60 bg-rose-950/20 shadow-[0_0_30px_rgba(239,68,68,0.08)]'
                      : 'border-[#30363d] bg-[#161b22] hover:border-[#444d56] hover:bg-[#1c2129]'
                  }`}
                >
                  {/* Top accent stripe */}
                  <div className={`h-1 w-full ${selectedDecision === 'choice_a' ? 'bg-rose-500' : 'bg-[#30363d]'}`} />

                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-rose-400" />
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            {CHAPTER11_DECISION_OPTIONS.choice_a.title}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white leading-snug">
                          {CHAPTER11_DECISION_OPTIONS.choice_a.subtitle}
                        </h3>
                      </div>
                      {selectedDecision === 'choice_a' && !decisionCommitted && (
                        <div className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-rose-400" />
                        </div>
                      )}
                    </div>

                    {/* Quote */}
                    <div className="p-3 rounded-lg bg-[#0d1117] border-l-2 border-rose-500/40 border border-[#21262d]">
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        {CHAPTER11_DECISION_OPTIONS.choice_a.quote}
                      </p>
                    </div>

                    {/* Warning tags */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">⚠ No Runbooks</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">⚠ No Training</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">⚠ No Hypercare</span>
                    </div>

                    {/* Footer note */}
                    <div className="pt-3 border-t border-[#21262d] text-[11px] text-slate-500">
                      Bypasses structured runbooks and 14-day hypercare window.
                    </div>
                  </div>
                </div>

                {/* Choice B — Formal Handover */}
                <div
                  onClick={() => { if (decisionCommitted) return; sound.playClick(); setSelectedDecision('choice_b'); }}
                  className={`group relative rounded-2xl border-2 transition-all overflow-hidden ${
                    decisionCommitted
                      ? 'cursor-default'
                      : 'cursor-pointer'
                  } ${
                    selectedDecision === 'choice_b'
                      ? 'border-emerald-500/60 bg-emerald-950/15 shadow-[0_0_30px_rgba(16,185,129,0.06)]'
                      : 'border-[#30363d] bg-[#161b22] hover:border-indigo-400/40 hover:bg-[#1c2129]'
                  }`}
                >
                  {/* Top accent stripe */}
                  <div className={`h-1 w-full ${selectedDecision === 'choice_b' ? 'bg-emerald-500' : 'bg-[#30363d]'}`} />

                  {/* Recommended badge */}
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Recommended
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                            <Award className="w-4 h-4 text-emerald-400" />
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                            {CHAPTER11_DECISION_OPTIONS.choice_b.title}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white leading-snug pr-20">
                          {CHAPTER11_DECISION_OPTIONS.choice_b.subtitle}
                        </h3>
                      </div>
                      {selectedDecision === 'choice_b' && !decisionCommitted && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                      )}
                    </div>

                    {/* Quote */}
                    <div className="p-3 rounded-lg bg-[#0d1117] border-l-2 border-emerald-500/40 border border-[#21262d]">
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        {CHAPTER11_DECISION_OPTIONS.choice_b.quote}
                      </p>
                    </div>

                    {/* Feature tags */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓ 6 Runbooks</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓ Training Sessions</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓ 14-Day Hypercare</span>
                    </div>

                    {/* Footer note */}
                    <div className="pt-3 border-t border-[#21262d] text-[11px] text-slate-500">
                      Includes 6 operational runbooks, incident response verification, and 14-day hypercare support.
                    </div>
                  </div>
                </div>
              </div>

              {/* Commit button */}
              {!decisionCommitted ? (
                <div className="flex justify-end pt-1">
                  <button
                    disabled={!selectedDecision}
                    onClick={handleCommitDecision}
                    className={`px-7 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all ${
                      selectedDecision
                        ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white shadow-xl shadow-indigo-900/40 cursor-pointer active:scale-95'
                        : 'bg-[#21262d] text-slate-500 border border-[#30363d] cursor-not-allowed'
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Authorize Operational Handover</span>
                  </button>
                </div>
              ) : (
                /* ── POST-DECISION CONSEQUENCE PANEL ── */
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className={`p-5 rounded-2xl border ${
                    selectedDecision === 'choice_b'
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-rose-950/20 border-rose-500/40'
                  }`}>
                    {/* Outcome header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                          selectedDecision === 'choice_b'
                            ? 'bg-emerald-500/15 border-emerald-500/30'
                            : 'bg-rose-500/15 border-rose-500/30'
                        }`}>
                          <Award className={`w-5 h-5 ${selectedDecision === 'choice_b' ? 'text-emerald-400' : 'text-rose-400'}`} />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                            {selectedDecision === 'choice_b' ? 'Operational Acceptance Ratified' : 'Handover Dispute Incurred'}
                          </div>
                          <div className={`text-[10px] font-mono ${selectedDecision === 'choice_b' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {selectedDecision === 'choice_b' ? 'Approved by IT Operations' : 'Handover Rejected'}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                        selectedDecision === 'choice_b'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}>
                        {selectedDecision === 'choice_b' ? '✓ ACCEPTED' : '✕ REJECTED'}
                      </span>
                    </div>

                    {/* Consequence text */}
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {selectedDecision === 'choice_b'
                        ? CHAPTER11_DECISION_OPTIONS.choice_b.consequence
                        : CHAPTER11_DECISION_OPTIONS.choice_a.consequence}
                    </p>

                    {/* Certificate grid (Choice B) */}
                    {selectedDecision === 'choice_b' && (
                      <div className="mt-5 p-4 rounded-xl bg-[#0d1117] border border-emerald-500/25 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label: 'Receiving Team', value: 'IT Operations', color: 'text-white' },
                          { label: 'Hypercare Duration', value: '14 Days Window', color: 'text-indigo-300' },
                          { label: 'Release Version', value: 'HRMS v1.0.0', color: 'text-white' },
                          { label: 'Sign-Off Status', value: 'Transition Approved', color: 'text-emerald-400' },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</div>
                            <div className={`text-xs font-bold mt-0.5 ${item.color}`}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-[#21262d] flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-slate-400 italic max-w-md">
                        {selectedDecision === 'choice_b'
                          ? 'Aarav Kapoor: "You didn\'t just deliver a product. You made sure the organization is ready to own it."'
                          : <span className="text-rose-300">Marcus: "We cannot accept responsibility for an unmaintainable system."</span>}
                      </div>
                      <button
                        onClick={onOpenScorecard}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>View Transition Scorecard</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
