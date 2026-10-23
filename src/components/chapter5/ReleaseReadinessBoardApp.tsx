import React, { useState } from 'react';
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
      return;
    }

    setMarcusWarning(null);
    onUpdateState({ currentStage: 'build_rollout_plan' });
  };

  const handleToggleActivityStage = (actId: PrePilotActivityId) => {
    sound.playClick();
    onUpdateState((prev) => {
      const current = prev.prePilotActivities[actId];
      const nextStage: PilotActivityStage =
        current === 'pre_pilot_prerequisite' ? 'during_pilot_continuous' : 'pre_pilot_prerequisite';
      return {
        ...prev,
        prePilotActivities: {
          ...prev.prePilotActivities,
          [actId]: nextStage,
        },
      };
    });
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

                    {opt.isMandatoryBlocker && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        Critical Gate
                      </span>
                    )}
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
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Review & Submit Rollout Plan</span>
                </button>
              </div>
            </div>

            {/* ── SECTION A: PRE-PILOT VALIDATION SEQUENCING ── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                    A. Validation Activity Sequencing
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Distinguish mandatory pre-pilot release prerequisites from continuous activities that run during the pilot.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Click toggle to switch phase
                </span>
              </div>

              <div className="space-y-2">
                {PRE_PILOT_ACTIVITIES.map((act) => {
                  const currentStage = chapter5State.prePilotActivities[act.id];
                  const isPrereq = currentStage === 'pre_pilot_prerequisite';
                  return (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 flex-1">
                        <div className="font-bold text-slate-800">{act.title}</div>
                        <p className="text-[11px] text-slate-500">{act.description}</p>
                      </div>

                      <button
                        onClick={() => handleToggleActivityStage(act.id)}
                        className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all border cursor-pointer shrink-0 ${
                          isPrereq
                            ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                        }`}
                      >
                        {isPrereq ? 'Prerequisite (Before Pilot)' : 'Continuous (During Pilot)'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── SECTION B: CONTROLLED USER GROUP PILOT SAFEGUARDS ── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-2xs">
              <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                    B. Controlled User Group Pilot Configuration
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Define operational thresholds, feedback loops, and incident management for the 500-user test cohort.
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>500 Users · 48 Hours Fixed</span>
                </div>
              </div>

              {/* Pilot Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Latency Target */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Performance Latency SLA
                  </label>
                  <div className="space-y-1.5">
                    {LATENCY_TARGET_OPTIONS.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => {
                          sound.playClick();
                          onUpdateState({ latencyTarget: opt.id });
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          chapter5State.latencyTarget === opt.id
                            ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold text-slate-800">{opt.label}</div>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{opt.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Error Rate Threshold */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Error-Rate & Telemetry Threshold
                  </label>
                  <div className="space-y-1.5">
                    {ERROR_RATE_OPTIONS.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => {
                          sound.playClick();
                          onUpdateState({ errorRateThreshold: opt.id });
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          chapter5State.errorRateThreshold === opt.id
                            ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold text-slate-800">{opt.label}</div>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{opt.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Feedback Collection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Pilot User Feedback Collection
                  </label>
                  <div className="space-y-1.5">
                    {FEEDBACK_CHANNEL_OPTIONS.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => {
                          sound.playClick();
                          onUpdateState({ feedbackChannel: opt.id });
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          chapter5State.feedbackChannel === opt.id
                            ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold text-slate-800">{opt.label}</div>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{opt.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Incident Owner & Rollback Trigger */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Incident On-Call & Escalation
                    </label>
                    {INCIDENT_OWNER_OPTIONS.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => {
                          sound.playClick();
                          onUpdateState({ incidentOwner: opt.id });
                        }}
                        className={`p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          chapter5State.incidentOwner === opt.id
                            ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold text-slate-800 text-[11px]">{opt.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Pause / Rollback Trigger Condition
                    </label>
                    {ROLLBACK_CONDITION_OPTIONS.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => {
                          sound.playClick();
                          onUpdateState({ rollbackCondition: opt.id });
                        }}
                        className={`p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          chapter5State.rollbackCondition === opt.id
                            ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold text-slate-800 text-[11px]">{opt.label}</div>
                      </div>
                    ))}
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
                  <span className="text-slate-500">Latency & Error Threshold:</span>
                  <span className="font-bold text-slate-800">
                    {chapter5State.latencyTarget === 'strict_800ms' ? '< 800ms' : '< 1500ms'},{' '}
                    {chapter5State.errorRateThreshold === 'strict_0_1_percent' ? '< 0.1%' : '< 1%'}
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
      </AnimatePresence>
    </div>
  );
};
