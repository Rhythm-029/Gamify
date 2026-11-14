import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Users,
  Send,
  Loader2,
  FileCheck2,
  AlertCircle,
  Eye,
  Sparkles,
  ChevronDown,
  Check,
  Activity,
  HelpCircle,
  Gauge,
  MessageSquare,
  RotateCcw,
  Info,
} from 'lucide-react';
import type {
  Chapter5State,
  Chapter5Stage,
  ReadinessEvidenceCard,
  LaunchBlockerId,
  PrePilotActivityId,
  PilotActivityStage,
} from '../../types/chapter5';
import {
  READINESS_EVIDENCE_CARDS,
  LAUNCH_BLOCKER_OPTIONS,
  PRE_PILOT_ACTIVITIES,
  LATENCY_TARGET_OPTIONS,
  ERROR_RATE_OPTIONS,
  FEEDBACK_CHANNEL_OPTIONS,
  INCIDENT_OWNER_OPTIONS,
  ROLLBACK_CONDITION_OPTIONS,
  WIDER_ROLLOUT_OPTIONS,
  computeChapter5Score,
} from '../../data/chapter5Data';
import { sound } from '../onboarding/SoundEngine';

interface ReleaseReadinessBoardAppProps {
  chapter5State: Chapter5State;
  onUpdateState: (updater: Partial<Chapter5State> | ((prev: Chapter5State) => Chapter5State)) => void;
  onReturnToMeeting: () => void;
  onSubmitCompletePlan: () => void;
}

export const ReleaseReadinessBoardApp: React.FC<ReleaseReadinessBoardAppProps> = ({
  chapter5State,
  onUpdateState,
  onReturnToMeeting,
  onSubmitCompletePlan,
}) => {
  const [selectedCardDetail, setSelectedCardDetail] = useState<ReadinessEvidenceCard | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [marcusWarning, setMarcusWarning] = useState<string | null>(null);
  const [openDropdownActId, setOpenDropdownActId] = useState<PrePilotActivityId | null>(null);
  const [unassignedWarning, setUnassignedWarning] = useState(false);
  const [formValidationMessage, setFormValidationMessage] = useState<string | null>(null);

  // Auto-reset legacy cached state so nothing is pre-selected
  useEffect(() => {
    if (!chapter5State.submitted && !chapter5State.completed) {
      if (!chapter5State.version || chapter5State.version < 3) {
        onUpdateState({
          version: 3,
          latencyTarget: null,
          errorRateThreshold: null,
          feedbackChannel: null,
          incidentOwner: null,
          rollbackCondition: null,
          widerRolloutDecision: null,
          prePilotActivities: {
            act_peak_load: 'unassigned',
            act_security_approval: 'unassigned',
            act_monitoring_alerts: 'unassigned',
            act_rollback_approval: 'unassigned',
            act_user_comms: 'unassigned',
          },
        });
      }
    }
  }, []);

  const currentStage = chapter5State.currentStage;

  const handleSelectStage = (stage: Chapter5Stage) => {
    sound.playClick();
    setMarcusWarning(null);
    onUpdateState({ currentStage: stage });
  };

  const handleCardClick = (card: ReadinessEvidenceCard) => {
    sound.playClick();
    setSelectedCardDetail(card);
    if (!chapter5State.viewedEvidenceCards.includes(card.id)) {
      onUpdateState((prev) => ({
        ...prev,
        viewedEvidenceCards: [...prev.viewedEvidenceCards, card.id],
      }));
    }
  };

  const toggleBlocker = (blockerId: LaunchBlockerId) => {
    sound.playClick();
    setMarcusWarning(null);
    onUpdateState((prev) => {
      const exists = prev.selectedBlockers.includes(blockerId);
      const next = exists
        ? prev.selectedBlockers.filter((id) => id !== blockerId)
        : [...prev.selectedBlockers, blockerId];
      return { ...prev, selectedBlockers: next };
    });
  };

  const [showEvidenceTaskModal, setShowEvidenceTaskModal] = useState(false);
  const [selectedEvidenceForMarcus, setSelectedEvidenceForMarcus] = useState<string[]>([]);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  const handleValidateBlockersAndProceed = () => {
    sound.playClick();
    const hasLoad = chapter5State.selectedBlockers.includes('blocker_performance_load');
    const hasSec = chapter5State.selectedBlockers.includes('blocker_security_approval');
    const hasRollback = chapter5State.selectedBlockers.includes('blocker_rollback_procedure');
    const hasImmediate = chapter5State.selectedBlockers.includes('distractor_immediate_general');

    if (!hasLoad || !hasSec || !hasRollback || hasImmediate) {
      setMarcusWarning(
        "Before we authorize a pilot, show me the evidence that supports the decision. I need clear acceptance criteria, an approved access path and a recovery plan. We shouldn't confuse progress with readiness."
      );
      // Open interactive evidence task modal so player can present the proof to Marcus
      setShowEvidenceTaskModal(true);
      return;
    }

    setMarcusWarning(null);
    onUpdateState({ currentStage: 'build_rollout_plan' });
  };

  const handleConfirmEvidenceToMarcus = () => {
    sound.playClick();
    const requiredEvidence = ['card_load_test', 'card_security_signoff', 'card_rollback_plan'];
    const hasAll = requiredEvidence.every((id) => selectedEvidenceForMarcus.includes(id));

    if (!hasAll) {
      setEvidenceError('Select the Load Test Results, Security Signoff, and Rollback Procedure to satisfy Marcus.');
      return;
    }

    // Auto-align blockers properly and proceed to rollout plan
    setEvidenceError(null);
    setShowEvidenceTaskModal(false);
    setMarcusWarning(null);
    sound.playSystemClearance();
    onUpdateState((prev) => ({
      ...prev,
      selectedBlockers: ['blocker_performance_load', 'blocker_security_approval', 'blocker_rollback_procedure'],
      currentStage: 'build_rollout_plan',
    }));
  };

  const handleSelectActivityStage = (actId: PrePilotActivityId, stage: PilotActivityStage) => {
    sound.playClick();
    onUpdateState((prev) => ({
      ...prev,
      prePilotActivities: {
        ...prev.prePilotActivities,
        [actId]: stage,
      },
    }));
  };

  const unassignedCount = PRE_PILOT_ACTIVITIES.filter(
    (act) => !chapter5State.prePilotActivities?.[act.id] || chapter5State.prePilotActivities[act.id] === 'unassigned'
  ).length;

  const sectionBConfiguredCount = [
    chapter5State.latencyTarget,
    chapter5State.errorRateThreshold,
    chapter5State.feedbackChannel,
    chapter5State.incidentOwner,
    chapter5State.rollbackCondition,
  ].filter(Boolean).length;

  const handleOpenSubmitModal = () => {
    if (unassignedCount > 0) {
      sound.playClick();
      setFormValidationMessage(
        `Please assign a phase (Prerequisite or Continuous) to all 5 activities in Section A (${unassignedCount} remaining).`
      );
      return;
    }
    if (sectionBConfiguredCount < 5) {
      sound.playClick();
      setFormValidationMessage(
        `Please configure all 5 safeguards in Section B (${5 - sectionBConfiguredCount} remaining).`
      );
      return;
    }
    if (!chapter5State.widerRolloutDecision) {
      sound.playClick();
      setFormValidationMessage('Please choose a post-pilot strategy in Section C before submitting.');
      return;
    }
    setFormValidationMessage(null);
    setShowSubmitModal(true);
  };

  // Submit Rollout Plan
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      sound.playSystemClearance();
    } catch {
      // Audio safety
    }

    try {
      // Precompute local deterministic scorecard
      let evaluationResult = computeChapter5Score(chapter5State);

      // Attempt async backend evaluation
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const response = await fetch('/api/game/chapter5/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            session_id: 'current_session',
            state: {
              selectedBlockers: chapter5State.selectedBlockers,
              prePilotActivities: chapter5State.prePilotActivities,
              latencyTarget: chapter5State.latencyTarget,
              errorRateThreshold: chapter5State.errorRateThreshold,
              feedbackChannel: chapter5State.feedbackChannel,
              incidentOwner: chapter5State.incidentOwner,
              rollbackCondition: chapter5State.rollbackCondition,
              widerRolloutDecision: chapter5State.widerRolloutDecision,
            },
          }),
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data?.scorecard) {
            evaluationResult = data.scorecard;
          }
        }
      } catch (err) {
        console.warn('Backend evaluation call timed out or failed, using deterministic evaluation:', err);
      }

      onUpdateState({
        submitted: true,
        completed: true,
        currentStage: 'submitted',
        scorecard: {
          ...evaluationResult,
          shown: true,
        },
      });

      setIsSubmitting(false);
      setShowSubmitModal(false);
      onSubmitCompletePlan();
      onReturnToMeeting();
    } catch (err) {
      console.error('Fatal submission error:', err);
      const localResult = computeChapter5Score(chapter5State);
      onUpdateState({
        submitted: true,
        completed: true,
        currentStage: 'submitted',
        scorecard: {
          ...localResult,
          shown: true,
        },
      });
      setIsSubmitting(false);
      setShowSubmitModal(false);
      onSubmitCompletePlan();
      onReturnToMeeting();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: ReadinessEvidenceCard['status']) => {
    switch (status) {
      case 'ready':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Ready</span>
          </span>
        );
      case 'needs_review':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span>Needs Review</span>
          </span>
        );
      case 'blocked':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            <span>Blocked</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#f8fafc] text-slate-800 font-sans select-none overflow-hidden relative">
      {/* ── TOP HEADER / ENTERPRISE NAV BAR ── */}
      <div className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                Release Readiness Board
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Project Amigo · Phase 1
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              80,000 Employees · Bank HRMS Release Gate
            </div>
          </div>
        </div>

        {/* Global Release Status Badge */}
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold font-mono flex items-center space-x-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Release status: NOT READY FOR GENERAL AVAILABILITY</span>
          </div>

          <button
            onClick={onReturnToMeeting}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>Teams Meeting</span>
          </button>
        </div>
      </div>

      {/* ── 3-STAGE PROGRESS BAR ── */}
      <div className="h-11 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-6 text-xs font-semibold">
          <button
            onClick={() => handleSelectStage('review_evidence')}
            className={`flex items-center space-x-2 py-2.5 border-b-2 transition-all cursor-pointer ${
              currentStage === 'review_evidence'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold">
              1
            </span>
            <span>Review Readiness Evidence</span>
          </button>

          <button
            onClick={() => handleSelectStage('identify_blockers')}
            className={`flex items-center space-x-2 py-2.5 border-b-2 transition-all cursor-pointer ${
              currentStage === 'identify_blockers'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold">
              2
            </span>
            <span>Identify Launch Blockers</span>
          </button>

          <button
            onClick={() => handleSelectStage('build_rollout_plan')}
            className={`flex items-center space-x-2 py-2.5 border-b-2 transition-all cursor-pointer ${
              currentStage === 'build_rollout_plan'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold">
              3
            </span>
            <span>Build Controlled Rollout Plan</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Target Duration: ~2–3 mins
        </div>
      </div>

      {/* ── STAGE CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/70">
        {/* ══════════════════════════════════════════════════════════
            STAGE 1: REVIEW THE EVIDENCE
        ══════════════════════════════════════════════════════════ */}
        {currentStage === 'review_evidence' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Stage 1: Production Readiness Evidence
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review the 5 Phase 1 readiness domains. Click any card to inspect technical evidence and risk implications.
                </p>
              </div>

              <button
                onClick={() => handleSelectStage('identify_blockers')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Continue to Blockers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 5 Evidence Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {READINESS_EVIDENCE_CARDS.map((card) => {
                const isViewed = chapter5State.viewedEvidenceCards.includes(card.id);
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isViewed
                        ? 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        : 'border-emerald-300/80 shadow-xs ring-1 ring-emerald-300/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                            {card.category}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                            {card.title}
                          </h3>
                        </div>
                        {getStatusBadge(card.status)}
                      </div>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {card.evidence}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Owner: {card.owner}</span>
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STAGE 2: IDENTIFY LAUNCH BLOCKERS
        ══════════════════════════════════════════════════════════ */}
        {currentStage === 'identify_blockers' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Stage 2: Identify Launch Blockers
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select the controls that must be resolved or explicitly approved before the pilot can begin.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSelectStage('review_evidence')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                  Back
                </button>
                <button
                  onClick={handleValidateBlockersAndProceed}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Build Rollout Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Marcus Warning Banner if blocker validation fails */}
            {marcusWarning && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3 shadow-2xs"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-800 uppercase tracking-wider text-[10px] font-mono">
                    MARCUS (CTO) — READINESS REVIEW WARNING
                  </div>
                  <p className="leading-relaxed">{marcusWarning}</p>
                </div>
              </motion.div>
            )}

            {/* Blocker Options List */}
            <div className="space-y-2.5">
              {LAUNCH_BLOCKER_OPTIONS.map((opt) => {
                const isSelected = chapter5State.selectedBlockers.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleBlocker(opt.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                      isSelected
                        ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/50'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="text-xs font-bold text-slate-900 leading-snug">
                        {opt.label}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {opt.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STAGE 3: BUILD THE CONTROLLED ROLLOUT PLAN
        ══════════════════════════════════════════════════════════ */}
        {currentStage === 'build_rollout_plan' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Stage 3: Build Controlled Rollout Plan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure pre-pilot prerequisites, 500-user pilot safeguards, and evidence-based expansion conditions.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSelectStage('identify_blockers')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                  Blockers
                </button>
                <button
                  onClick={handleOpenSubmitModal}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Review & Submit Rollout Plan</span>
                </button>
              </div>
            </div>

            {/* Validation alert banner */}
            {formValidationMessage && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between shadow-2xs animate-shake">
                <div className="flex items-center space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-medium">{formValidationMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormValidationMessage(null)}
                  className="px-2.5 py-1 rounded-lg text-amber-800 hover:bg-amber-100 font-bold text-xs cursor-pointer shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* ── SECTION A: PRE-PILOT VALIDATION SEQUENCING ── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                    A. Validation Activity Sequencing
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Assign each operational task to its appropriate phase: mandatory prerequisite before pilot or continuous execution during pilot.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Select phase for each step
                </span>
              </div>

              {unassignedWarning && unassignedCount > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Please choose a phase from the dropdown for each validation activity ({unassignedCount} not set yet).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUnassignedWarning(false)}
                    className="text-amber-700 hover:text-amber-900 font-bold text-[11px] underline cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {PRE_PILOT_ACTIVITIES.map((act) => {
                  const currentStage: PilotActivityStage =
                    chapter5State.prePilotActivities?.[act.id] || 'unassigned';
                  const isPrereq = currentStage === 'pre_pilot_prerequisite';
                  const isContinuous = currentStage === 'during_pilot_continuous';
                  const isUnassigned = currentStage === 'unassigned';
                  const isOpen = openDropdownActId === act.id;

                  return (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all relative"
                    >
                      <div className="space-y-0.5 flex-1 pr-2">
                        <div className="font-bold text-slate-800">{act.title}</div>
                        <p className="text-[11px] text-slate-500 leading-normal">{act.description}</p>
                      </div>

                      {/* Dropdown Selector */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setOpenDropdownActId(isOpen ? null : act.id);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs transition-all border cursor-pointer flex items-center justify-between gap-2.5 min-w-[150px] shadow-2xs ${
                            isPrereq
                              ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 font-bold'
                              : isContinuous
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100 font-bold'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {isPrereq && (
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            )}
                            {isContinuous && (
                              <Activity className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            )}
                            {isUnassigned && (
                              <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span className="truncate">
                              {isPrereq
                                ? 'Prerequisite (Before Pilot)'
                                : isContinuous
                                ? 'Continuous (During Pilot)'
                                : 'Choose'}
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenDropdownActId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1.5 z-50 w-72 bg-white rounded-xl border border-slate-200 shadow-2xl p-1.5 space-y-1">
                              <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                Select Timing Phase
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  handleSelectActivityStage(act.id, 'pre_pilot_prerequisite');
                                  setOpenDropdownActId(null);
                                }}
                                className={`w-full text-left p-2.5 rounded-lg transition-colors cursor-pointer flex items-start gap-2.5 ${
                                  isPrereq
                                    ? 'bg-rose-50 text-rose-900 font-bold'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                <div className="flex-1">
                                  <div className="text-xs font-bold leading-tight">
                                    Prerequisite (Before Pilot)
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-normal mt-0.5 leading-normal">
                                    Mandatory gate that must be validated before opening traffic.
                                  </div>
                                </div>
                                {isPrereq && (
                                  <Check className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  handleSelectActivityStage(act.id, 'during_pilot_continuous');
                                  setOpenDropdownActId(null);
                                }}
                                className={`w-full text-left p-2.5 rounded-lg transition-colors cursor-pointer flex items-start gap-2.5 ${
                                  isContinuous
                                    ? 'bg-indigo-50 text-indigo-900 font-bold'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                <div className="flex-1">
                                  <div className="text-xs font-bold leading-tight">
                                    Continuous (During Pilot)
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-normal mt-0.5 leading-normal">
                                    Runs actively alongside the 500-user test cohort.
                                  </div>
                                </div>
                                {isContinuous && (
                                  <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                )}
                              </button>

                              {!isUnassigned && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSelectActivityStage(act.id, 'unassigned');
                                    setOpenDropdownActId(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer border-t border-slate-100 mt-1 flex items-center justify-between"
                                >
                                  <span>Clear selection (reset to Choose)</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── SECTION B: CONTROLLED USER GROUP PILOT SAFEGUARDS ── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-5 shadow-2xs">
              {/* Header */}
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                      Step 3B
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      B. Controlled User Group Pilot Configuration
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal max-w-xl">
                    Select one policy for each of the 5 operational safeguards below. These define how telemetry, incident response, feedback, and emergency rollbacks are managed during the 48-hour pilot.
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <div
                    className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold border flex items-center space-x-1.5 transition-colors ${
                      sectionBConfiguredCount === 5
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    <span>{sectionBConfiguredCount} of 5 Configured</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span>500 Users · 48h</span>
                  </div>
                </div>
              </div>

              {/* Progress Checklist Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pb-1">
                {[
                  { key: 'latency', label: '1. Latency SLA', done: !!chapter5State.latencyTarget },
                  { key: 'error', label: '2. Error Alarm', done: !!chapter5State.errorRateThreshold },
                  { key: 'feedback', label: '3. Feedback Loop', done: !!chapter5State.feedbackChannel },
                  { key: 'oncall', label: '4. On-Call Lead', done: !!chapter5State.incidentOwner },
                  { key: 'rollback', label: '5. Rollback Rule', done: !!chapter5State.rollbackCondition },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`p-2 rounded-xl border text-[10px] font-mono font-bold flex items-center justify-between transition-colors ${
                      item.done
                        ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {item.done ? (
                      <Check className="w-3 h-3 text-indigo-600 shrink-0 ml-1" />
                    ) : (
                      <span className="text-[9px] text-slate-400 font-normal shrink-0 ml-1">Pending</span>
                    )}
                  </div>
                ))}
              </div>

              {/* 5 Safeguards List */}
              <div className="space-y-4">
                {/* 1. Performance Latency SLA */}
                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-900">
                          Performance Latency SLA Target
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {chapter5State.latencyTarget ? '✓ Configured' : 'Needs Selection'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    What response time threshold must the pilot system maintain before sounding degradation alarms?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {LATENCY_TARGET_OPTIONS.map((opt) => {
                      const isSelected = chapter5State.latencyTarget === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            sound.playClick();
                            onUpdateState({ latencyTarget: opt.id });
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                            isSelected
                              ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-400/40 shadow-2xs'
                              : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70'
                          }`}
                        >
                          <div className="flex items-start space-x-2.5">
                            <div
                              className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-xs font-bold leading-snug ${
                                  isSelected ? 'text-indigo-950' : 'text-slate-800'
                                }`}
                              >
                                {opt.label}
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                                {opt.detail}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Error-Rate Threshold */}
                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-900">
                          Error-Rate & Telemetry Threshold
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {chapter5State.errorRateThreshold ? '✓ Configured' : 'Needs Selection'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    At what transaction error threshold should automated telemetry trigger incident response?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {ERROR_RATE_OPTIONS.map((opt) => {
                      const isSelected = chapter5State.errorRateThreshold === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            sound.playClick();
                            onUpdateState({ errorRateThreshold: opt.id });
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                            isSelected
                              ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-400/40 shadow-2xs'
                              : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70'
                          }`}
                        >
                          <div className="flex items-start space-x-2.5">
                            <div
                              className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-xs font-bold leading-snug ${
                                  isSelected ? 'text-indigo-950' : 'text-slate-800'
                                }`}
                              >
                                {opt.label}
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                                {opt.detail}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Feedback Collection */}
                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        3
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-900">
                          Pilot User Feedback Collection
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {chapter5State.feedbackChannel ? '✓ Configured' : 'Needs Selection'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    How will the 500 bank employees report usability friction, workflow blockers, and daily satisfaction?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {FEEDBACK_CHANNEL_OPTIONS.map((opt) => {
                      const isSelected = chapter5State.feedbackChannel === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            sound.playClick();
                            onUpdateState({ feedbackChannel: opt.id });
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                            isSelected
                              ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-400/40 shadow-2xs'
                              : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70'
                          }`}
                        >
                          <div className="flex items-start space-x-2.5">
                            <div
                              className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-xs font-bold leading-snug ${
                                  isSelected ? 'text-indigo-950' : 'text-slate-800'
                                }`}
                              >
                                {opt.label}
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                                {opt.detail}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4 & 5 Grid: Incident Owner & Rollback Trigger */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 4. Incident Owner */}
                  <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          4
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-xs font-bold text-slate-900">
                            Incident On-Call & Escalation
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {chapter5State.incidentOwner ? '✓ Configured' : 'Needs Selection'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Who is directly responsible for triaging technical bugs and managing incident escalation?
                    </p>

                    <div className="space-y-2">
                      {INCIDENT_OWNER_OPTIONS.map((opt) => {
                        const isSelected = chapter5State.incidentOwner === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => {
                              sound.playClick();
                              onUpdateState({ incidentOwner: opt.id });
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                              isSelected
                                ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-400/40 shadow-2xs'
                                : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-xs font-bold leading-snug ${
                                  isSelected ? 'text-indigo-950' : 'text-slate-800'
                                }`}
                              >
                                {opt.label}
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                                {opt.detail}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. Rollback Trigger */}
                  <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          5
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-xs font-bold text-slate-900">
                            Pause / Rollback Trigger Condition
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {chapter5State.rollbackCondition ? '✓ Configured' : 'Needs Selection'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Under what criteria should the pilot immediately abort and redirect traffic to legacy HRMS?
                    </p>

                    <div className="space-y-2">
                      {ROLLBACK_CONDITION_OPTIONS.map((opt) => {
                        const isSelected = chapter5State.rollbackCondition === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => {
                              sound.playClick();
                              onUpdateState({ rollbackCondition: opt.id });
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                              isSelected
                                ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-400/40 shadow-2xs'
                                : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-xs font-bold leading-snug ${
                                  isSelected ? 'text-indigo-950' : 'text-slate-800'
                                }`}
                              >
                                {opt.label}
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                                {opt.detail}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION C: WIDER ROLLOUT DECISION ── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
              <div className="border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  C. Wider Rollout Decision
                </h3>
                <p className="text-[11px] text-slate-500">
                  What should happen after the 48-hour pilot concludes?
                </p>
              </div>

              <div className="space-y-2.5">
                {WIDER_ROLLOUT_OPTIONS.map((opt) => {
                  const isSelected = chapter5State.widerRolloutDecision === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        sound.playClick();
                        onUpdateState({ widerRolloutDecision: opt.id });
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                        <p className="text-[11px] text-slate-600 leading-snug">{opt.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STAGE 4: SUBMITTED SUMMARY & CONFIRMATION
        ══════════════════════════════════════════════════════════ */}
        {currentStage === 'submitted' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">
                  GOVERNANCE STATUS CONFIRMED
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  PROJECT AMIGO — PILOT PLAN SUBMITTED
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  Your controlled user group rollout plan has been formally logged and routed to the ICICI Bank Release Steering Committee.
                </p>
              </div>

              {/* Status Points */}
              <div className="grid grid-cols-2 gap-3 text-left max-w-lg mx-auto pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                  <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">Pilot Group</div>
                  <div className="font-bold text-slate-800">500 Selected Users</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                  <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">Duration</div>
                  <div className="font-bold text-slate-800">48 Hours Fixed</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                  <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">Monitoring & Rollback</div>
                  <div className="font-bold text-slate-800">Defined & Tracked</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                  <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">General Availability</div>
                  <div className="font-bold text-slate-800">Pending Pilot Results</div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-center space-x-3">
                <button
                  onClick={onReturnToMeeting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <span>Return to Teams Debrief</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CARD DETAIL MODAL (STAGE 1 EVIDENCE INSPECTOR) ── */}
      <AnimatePresence>
        {selectedCardDetail && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    {selectedCardDetail.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedCardDetail.title}
                  </h3>
                </div>
                {getStatusBadge(selectedCardDetail.status)}
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-700 text-[11px] uppercase font-mono">
                    Staging Evidence
                  </div>
                  <p className="text-slate-600">{selectedCardDetail.evidence}</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 space-y-1">
                  <div className="font-bold text-amber-900 text-[11px] uppercase font-mono">
                    Production & Release Implications
                  </div>
                  <p className="text-amber-800">{selectedCardDetail.implications}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-500 font-mono">
                  <div>
                    <span className="block text-slate-400 uppercase text-[9px]">Owner</span>
                    <span className="font-semibold text-slate-700">{selectedCardDetail.owner}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 uppercase text-[9px]">Signoff Status</span>
                    <span className="font-semibold text-slate-700">{selectedCardDetail.signoffRequired}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedCardDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SUBMISSION CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 text-slate-800"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">
                  FINAL VERIFICATION
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Submit Controlled Rollout Plan for Authorization
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review your configured release gates before routing the plan to Aarav and Marcus.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Pilot Cohort & Window:</span>
                  <span className="font-bold text-slate-800">500 Users · 48 Hours</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Validation Sequencing:</span>
                  <span className="font-bold text-slate-800">
                    {Object.values(chapter5State.prePilotActivities || {}).filter(s => s === 'pre_pilot_prerequisite').length} Prerequisites · {Object.values(chapter5State.prePilotActivities || {}).filter(s => s === 'during_pilot_continuous').length} Continuous
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Latency & Error Threshold:</span>
                  <span className="font-bold text-slate-800">
                    {chapter5State.latencyTarget === 'strict_800ms'
                      ? '< 800ms'
                      : chapter5State.latencyTarget === 'moderate_1500ms'
                      ? '< 1500ms'
                      : 'Not Defined'},{' '}
                    {chapter5State.errorRateThreshold === 'strict_0_1_percent'
                      ? '< 0.1%'
                      : chapter5State.errorRateThreshold === 'lenient_1_percent'
                      ? '< 1%'
                      : 'Manual Logs'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Rollback Trigger:</span>
                  <span className="font-bold text-slate-800">
                    {chapter5State.rollbackCondition === 'sev1_or_high_error_rate'
                      ? 'Error > 0.5% or Sev-1 Defect'
                      : 'Complete Outage Only'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Post-Pilot Strategy:</span>
                  <span className="font-bold text-emerald-700">
                    {chapter5State.widerRolloutDecision === 'expand_in_stages' && 'Phased Expansion (5K → 80K)'}
                    {chapter5State.widerRolloutDecision === 'extend_pilot' && 'Extend Pilot Observation'}
                    {chapter5State.widerRolloutDecision === 'release_immediate_all' && 'Immediate 80K Release (Risky)'}
                    {!chapter5State.widerRolloutDecision && 'Expand in Stages (Default)'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-normal bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 text-amber-900">
                <strong>Release Governance Note:</strong> Submitting the plan documents your readiness gates and pilot parameters. General availability remains pending until the 500-user pilot meets its acceptance criteria.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel & Revise
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Validating Readiness Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Confirm & Route for Authorization</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── MODAL: PRESENT EVIDENCE TO MARCUS TASK ── */}
        {showEvidenceTaskModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 text-slate-900 font-sans"
            >
              <div className="flex items-start space-x-3.5 border-b border-slate-100 pb-3">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-amber-500/50 shrink-0">
                  <img src="/character/Marcus_Vance/marcusDP.png" alt="Marcus Reed" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600">
                    EXECUTIVE INTERACTION · CTO READINESS CHECK
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    Present Readiness Evidence to Marcus
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    “Show me the hard evidence that proves we can safely pilot. Which three artifacts establish our acceptance criteria, security clearance, and rollback protocol?”
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700">Select supporting artifacts (Select 3):</div>
                <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                  {[
                    { id: 'card_functional_test', title: 'Functional Test Suite (Core Banking)', subtitle: 'All HRMS modules functional verification', isKey: false },
                    { id: 'card_load_test', title: 'Performance Load Test Results', subtitle: 'Target 30K concurrent users & p95 latency under peak demand', isKey: true },
                    { id: 'card_security_signoff', title: 'Information Security & Data Protection Signoff', subtitle: 'Compliance approval for handling employee compensation records', isKey: true },
                    { id: 'card_rollback_plan', title: 'Rollback & Recovery Procedure', subtitle: 'Version restoration and data reconciliation procedures', isKey: true },
                    { id: 'card_pilot_criteria', title: 'Controlled Pilot Acceptance Criteria', subtitle: 'Target group definition and latency thresholds', isKey: false },
                  ].map((item) => {
                    const isSelected = selectedEvidenceForMarcus.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          sound.playClick();
                          setSelectedEvidenceForMarcus((prev) =>
                            prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                          );
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/50'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="text-xs font-bold text-slate-900">{item.title}</div>
                          <div className="text-[11px] text-slate-500 truncate">{item.subtitle}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-amber-600 pointer-events-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {evidenceError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{evidenceError}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowEvidenceTaskModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Review Board Again
                </button>
                <button
                  onClick={handleConfirmEvidenceToMarcus}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit Evidence to Marcus</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
