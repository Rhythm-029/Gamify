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

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Console Navigation & Metrics Ribbon */}
      <div className="bg-slate-900/90 border-b border-indigo-500/20 px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3">
        {/* Left: App Title & Operational Meta */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <Server className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Operations Transition Console
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                HRMS Production v1.0.0
              </span>
            </div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              {CHAPTER11_TITLE}
              <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                | {CHAPTER11_SUBTITLE}
              </span>
            </h1>
          </div>
        </div>

        {/* Right: Operational Telemetry Metrics */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-slate-800 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 text-[11px]">Hypercare:</span>
            <span className="font-bold text-indigo-300">14 Days</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 text-[11px]">Support:</span>
            <span className="font-bold text-emerald-300">24/7 Enabled</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-slate-800 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400 text-[11px]">Status:</span>
            <span className="font-bold text-amber-300">
              {decisionCommitted
                ? selectedDecision === 'choice_b'
                  ? 'Handover Accepted'
                  : 'Handover Rejected'
                : 'Awaiting Validation'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 flex items-center gap-2 overflow-x-auto shrink-0">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('readiness');
          }}
          className={`py-2.5 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'readiness'
              ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-indigo-950 border border-indigo-400/40 text-[10px] flex items-center justify-center font-bold">
            01
          </span>
          <span>Operational Readiness</span>
          {matchingSubmitted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('knowledge_transfer');
          }}
          className={`py-2.5 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'knowledge_transfer'
              ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-indigo-950 border border-indigo-400/40 text-[10px] flex items-center justify-center font-bold">
            02
          </span>
          <span>Knowledge Transfer & Incident Sim</span>
          {workshopsScheduled && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('hypercare');
          }}
          className={`py-2.5 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'hypercare'
              ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-indigo-950 border border-indigo-400/40 text-[10px] flex items-center justify-center font-bold">
            03
          </span>
          <span>14-Day Hypercare Window</span>
          {hypercareSubmitted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('governance_gate');
          }}
          className={`py-2.5 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'governance_gate'
              ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-indigo-950 border border-indigo-400/40 text-[10px] flex items-center justify-center font-bold">
            04
          </span>
          <span>Operational Acceptance</span>
          {decisionCommitted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>
      </div>

      {/* Main Tab Content Canvas */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* ──────────────── TAB 1: OPERATIONAL READINESS MATCHING ──────────────── */}
          {activeTab === 'readiness' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    Stage 1 · Build the Operational Handover Package
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Match each operational requirement on the left to its authoritative runbook or resource on the right.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1 rounded-lg">
                    {correctMatchesCount} / 6 Matched
                  </span>
                </div>
              </div>

              {matchingError && (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{matchingError}</span>
                </div>
              )}

              {/* Two Column Matching Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Requirements */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    Operational Requirements
                  </div>
                  {OPERATIONAL_REQUIREMENTS.map((req) => {
                    const isMatched = Boolean(matchedPairs[req.id]);
                    const matchedResource = AVAILABLE_RESOURCES.find(
                      (r) => r.id === matchedPairs[req.id]
                    );
                    const isSelected = selectedReqId === req.id;

                    return (
                      <div
                        key={req.id}
                        onClick={() => handleSelectRequirement(req.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isMatched
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : isSelected
                            ? 'bg-indigo-950/40 border-indigo-400 ring-2 ring-indigo-400/30'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {req.category}
                          </span>
                          {isMatched ? (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Matched
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {isSelected ? 'Select resource →' : 'Click to pair'}
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-semibold text-slate-200 mt-1">
                          {req.requirement}
                        </div>

                        {/* Matched Pill */}
                        {isMatched && matchedResource && (
                          <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300">
                            <span className="font-mono font-medium">↳ {matchedResource.name}</span>
                            {!matchingSubmitted && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnpair(req.id);
                                }}
                                className="text-[10px] text-slate-400 hover:text-rose-400 underline ml-2"
                              >
                                Disconnect
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Right Column: Available Resources */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    Available Runbooks & Handover Resources
                  </div>
                  {AVAILABLE_RESOURCES.map((res) => {
                    const isAlreadyPaired = Object.values(matchedPairs).includes(res.id);

                    return (
                      <div
                        key={res.id}
                        onClick={() => handleSelectResource(res.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isAlreadyPaired
                            ? 'bg-slate-900/40 border-slate-800/80 opacity-60'
                            : selectedReqId
                            ? 'bg-slate-900 border-indigo-500/50 hover:bg-indigo-950/30 ring-1 ring-indigo-500/30'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                            {res.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {res.docFormat}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {res.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action submission bar */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  {correctMatchesCount === 6 ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> All 6 operational resources paired accurately.
                    </span>
                  ) : (
                    <span>Pair all 6 operational requirements to validate the handover package.</span>
                  )}
                </div>

                <button
                  disabled={correctMatchesCount < 6 || matchingSubmitted}
                  onClick={handleSubmitMatching}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    correctMatchesCount === 6 && !matchingSubmitted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 cursor-pointer active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                  }`}
                >
                  <span>{matchingSubmitted ? 'Handover Package Ratified' : 'Lock Handover Package & Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 2: KNOWLEDGE TRANSFER & INCIDENT SIMULATION ──────────────── */}
          {activeTab === 'knowledge_transfer' && (
            <div className="space-y-6">
              {/* Top: Live Incident Alert Header */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 font-mono">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      {SIMULATED_INCIDENT.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {SIMULATED_INCIDENT.ticketId}
                    </span>
                    <span className="text-[11px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Priority: {SIMULATED_INCIDENT.priority}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    {SIMULATED_INCIDENT.title} ({SIMULATED_INCIDENT.usersAffected} Users Affected)
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl">
                    {SIMULATED_INCIDENT.description}
                  </p>
                </div>
                <div className="shrink-0 text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="font-semibold text-slate-200">Marcus's Challenge:</div>
                  <div className="text-[11px]">"If this strikes at 2 AM, who handles what?"</div>
                </div>
              </div>

              {/* Three Horizontal Steps Assembly Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                    Construct the 3-Step Incident Triage Sequence
                  </span>
                  <span className="text-xs text-slate-500">
                    Click an action card below to place it into the open slot.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[0, 1, 2].map((slotIdx) => {
                    const assignedStepId = incidentSlots[slotIdx];
                    const stepItem = INCIDENT_RESPONSE_STEPS.find((s) => s.id === assignedStepId);

                    return (
                      <div
                        key={slotIdx}
                        className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all ${
                          stepItem
                            ? 'bg-slate-900 border-indigo-500/40 shadow-md'
                            : 'bg-slate-950/60 border-dashed border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                            STEP 0{slotIdx + 1}
                          </span>
                          {stepItem && !incidentValidated && (
                            <button
                              onClick={() => handleClearIncidentSlot(slotIdx)}
                              className="text-[10px] text-slate-400 hover:text-rose-400 underline"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {stepItem ? (
                          <div className="space-y-1 my-auto">
                            <div className="text-xs font-bold text-white">{stepItem.title}</div>
                            <div className="text-[11px] text-slate-300">{stepItem.actionText}</div>
                            <div className="text-[10px] text-indigo-400 font-mono mt-1 font-semibold">
                              Owner: {stepItem.role}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-xs text-slate-500 my-auto">
                            Slot empty · Click an action below
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Available Action Cards Pool */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Available Incident Response Actions
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
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isPlaced
                              ? 'bg-slate-900/30 border-slate-800/60 opacity-50 cursor-not-allowed'
                              : 'bg-slate-900 border-slate-700/80 hover:border-indigo-400 cursor-pointer active:scale-98'
                          }`}
                        >
                          <div className="text-xs font-semibold text-slate-200">
                            {stepItem.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {stepItem.resourceName} · <span className="text-indigo-400">{stepItem.role}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sequence Validation Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-300">
                    {incidentValidationFeedback ? (
                      <span className={incidentValidated ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                        {incidentValidationFeedback}
                      </span>
                    ) : (
                      <span>Arrange the 3 steps in logical escalation order to validate with Marcus.</span>
                    )}
                  </div>
                  <button
                    disabled={incidentSlots.some((s) => s === null) || incidentValidated}
                    onClick={handleValidateIncidentSequence}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      !incidentSlots.some((s) => s === null) && !incidentValidated
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-95'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                    }`}
                  >
                    <span>{incidentValidated ? 'Sequence Verified' : 'Validate Response Sequence'}</span>
                  </button>
                </div>
              </div>

              {/* Bottom: Mandatory Training Workshops Planner */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    Mandatory Operational Training Workshops
                  </span>
                  <span className="text-xs text-purple-300 font-mono">
                    3 Sessions Prepared
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TRAINING_WORKSHOPS.map((ws) => (
                    <div
                      key={ws.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-mono text-indigo-400">{ws.duration}</span>
                        <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Recorded
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white">{ws.title}</div>
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                        Session Leader: <strong className="text-slate-200">{ws.owner}</strong> ({ws.ownerRole})
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    disabled={!incidentValidated || workshopsScheduled}
                    onClick={handleScheduleWorkshops}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      incidentValidated && !workshopsScheduled
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg cursor-pointer active:scale-95'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                    }`}
                  >
                    <span>{workshopsScheduled ? 'Workshops Scheduled & Confirmed' : 'Confirm Workshops & Advance to Hypercare'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 3: HYPERCARE & OWNERSHIP TIMELINE ──────────────── */}
          {activeTab === 'hypercare' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Stage 3 · 14-Day Stabilization Timeline & Progressive Ownership
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Assign the 4 operational responsibility cards into their appropriate hypercare period.
                  </p>
                </div>
                <div className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1 rounded-lg">
                  {hypercareCorrectCount} / 4 Assigned Accurately
                </div>
              </div>

              {/* Three Hypercare Phases (Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {HYPERCARE_PHASES.map((phase) => {
                  const assignedCards = HYPERCARE_CARDS.filter(
                    (c) => phaseAssignments[c.id] === phase.id
                  );

                  return (
                    <div
                      key={phase.id}
                      onClick={() => handleAssignCardToPhase(phase.id)}
                      className={`p-4 rounded-xl border flex flex-col justify-between min-h-[220px] transition-all ${
                        selectedCardId && !hypercareSubmitted
                          ? 'border-indigo-400 bg-indigo-950/20 ring-2 ring-indigo-400/20 cursor-pointer'
                          : 'border-slate-800 bg-slate-900/80'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">
                            {phase.daysRange}
                          </span>
                          <span className="text-slate-400 font-mono">{phase.ownershipModel}</span>
                        </div>

                        <h3 className="text-xs font-bold text-white mt-2">{phase.label}</h3>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {phase.focus}
                        </p>
                      </div>

                      {/* Assigned Cards in this phase */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                        {assignedCards.length > 0 ? (
                          assignedCards.map((card) => (
                            <div
                              key={card.id}
                              className="p-2.5 rounded-lg bg-slate-950 border border-indigo-500/30 text-xs text-slate-200"
                            >
                              <div className="font-semibold text-white flex items-center justify-between">
                                <span>{card.title}</span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-[11px] text-slate-500 py-3">
                            {selectedCardId
                              ? 'Click this phase to assign selected card'
                              : 'No responsibilities assigned yet'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Responsibility Cards Tray */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Responsibility Cards (Select a card, then click target phase)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {HYPERCARE_CARDS.map((card) => {
                    const assignedPhaseId = phaseAssignments[card.id];
                    const isSelected = selectedCardId === card.id;

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
                            ? 'bg-indigo-950 border-indigo-400 ring-2 ring-indigo-400/40'
                            : assignedPhaseId
                            ? 'bg-slate-900/50 border-slate-800'
                            : 'bg-slate-900 border-slate-700/80 hover:border-slate-500'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{card.title}</div>
                        <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          {card.description}
                        </div>
                        {assignedPhaseId && (
                          <div className="text-[10px] text-emerald-400 font-mono font-semibold mt-2 pt-1.5 border-t border-slate-800">
                            Assigned: {HYPERCARE_PHASES.find((p) => p.id === assignedPhaseId)?.daysRange}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Hypercare Button */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-300">
                  {hypercareCorrectCount === 4 ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> 14-day transition model aligned with Marcus and IT Operations.
                    </span>
                  ) : (
                    <span>Assign all 4 responsibility cards into the timeline.</span>
                  )}
                </div>

                <button
                  disabled={hypercareCorrectCount < 4 || hypercareSubmitted}
                  onClick={handleSubmitHypercare}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    hypercareCorrectCount === 4 && !hypercareSubmitted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg cursor-pointer active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                  }`}
                >
                  <span>{hypercareSubmitted ? 'Hypercare Plan Approved' : 'Lock Hypercare & Proceed to Acceptance'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 4: OPERATIONAL ACCEPTANCE GATE (SCENE 11.2) ──────────────── */}
          {activeTab === 'governance_gate' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Scene 11.2 · Formal Operational Handover Decision
                  </span>
                  <span className="text-xs text-slate-400 font-mono">28:40 – 29:00</span>
                </div>
                <h2 className="text-base font-bold text-white mt-1">
                  Operational Handover Approval Gate
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  The delivery team is preparing to close the project. Marcus and Aarav Kapoor await your leadership authorization.
                </p>
              </div>

              {/* Two Decision Cards (Neutral presentation without spoiling point values) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Choice A */}
                <div
                  onClick={() => {
                    if (decisionCommitted) return;
                    sound.playClick();
                    setSelectedDecision('choice_a');
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedDecision === 'choice_a'
                      ? 'bg-slate-900 border-indigo-400 ring-2 ring-indigo-400/40 shadow-xl'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        {CHAPTER11_DECISION_OPTIONS.choice_a.title}
                      </span>
                      {selectedDecision === 'choice_a' && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      {CHAPTER11_DECISION_OPTIONS.choice_a.subtitle}
                    </h3>
                    <p className="text-xs text-slate-300 italic border-l-2 border-slate-700 pl-3">
                      {CHAPTER11_DECISION_OPTIONS.choice_a.quote}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    Bypasses structured runbooks and 14-day hypercare window.
                  </div>
                </div>

                {/* Choice B */}
                <div
                  onClick={() => {
                    if (decisionCommitted) return;
                    sound.playClick();
                    setSelectedDecision('choice_b');
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedDecision === 'choice_b'
                      ? 'bg-slate-900 border-indigo-400 ring-2 ring-indigo-400/40 shadow-xl'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                        {CHAPTER11_DECISION_OPTIONS.choice_b.title}
                      </span>
                      {selectedDecision === 'choice_b' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      {CHAPTER11_DECISION_OPTIONS.choice_b.subtitle}
                    </h3>
                    <p className="text-xs text-slate-300 italic border-l-2 border-indigo-500/50 pl-3">
                      {CHAPTER11_DECISION_OPTIONS.choice_b.quote}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    Includes 6 operational runbooks, incident response verification, and 14-day hypercare support.
                  </div>
                </div>
              </div>

              {/* Commit Decision Button */}
              {!decisionCommitted ? (
                <div className="flex justify-end pt-2">
                  <button
                    disabled={!selectedDecision}
                    onClick={handleCommitDecision}
                    className={`px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      selectedDecision
                        ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Authorize Operational Handover</span>
                  </button>
                </div>
              ) : (
                /* Post-Decision Live Consequence Dashboard */
                <div className="space-y-4 pt-2">
                  <div
                    className={`p-5 rounded-2xl border ${
                      selectedDecision === 'choice_b'
                        ? 'bg-slate-900 border-emerald-500/40'
                        : 'bg-rose-950/30 border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Award className={`w-5 h-5 ${selectedDecision === 'choice_b' ? 'text-emerald-400' : 'text-rose-400'}`} />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                          {selectedDecision === 'choice_b' ? 'Operational Acceptance Ratified' : 'Handover Dispute Incurred'}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${selectedDecision === 'choice_b' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {selectedDecision === 'choice_b' ? 'Approved by IT Operations' : 'Handover Rejected'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {selectedDecision === 'choice_b'
                        ? CHAPTER11_DECISION_OPTIONS.choice_b.consequence
                        : CHAPTER11_DECISION_OPTIONS.choice_a.consequence}
                    </p>

                    {/* Operational Certificate on Choice B */}
                    {selectedDecision === 'choice_b' && (
                      <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-emerald-500/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400">Receiving Team</div>
                          <div className="font-bold text-white mt-0.5">IT Operations</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Hypercare Duration</div>
                          <div className="font-bold text-indigo-300 mt-0.5">14 Days Window</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Release Version</div>
                          <div className="font-bold text-white mt-0.5">HRMS v1.0.0</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Sign-Off Status</div>
                          <div className="font-bold text-emerald-400 mt-0.5">Transition Approved</div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-slate-400">
                        {selectedDecision === 'choice_b' ? (
                          <span>Aarav Kapoor: "You didn't just deliver a product. You made sure the organization is ready to own it."</span>
                        ) : (
                          <span className="text-rose-300">Marcus: "We cannot accept responsibility for an unmaintainable system."</span>
                        )}
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
