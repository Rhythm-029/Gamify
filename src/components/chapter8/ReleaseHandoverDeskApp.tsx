import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck2,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  Layers,
  Send,
  Building2,
  Server,
  Award,
  ExternalLink,
  HelpCircle,
  UserCheck,
  Check,
  Sparkles,
  FileText,
  Workflow,
  Lock,
  Eye,
  FileCode,
  CheckSquare,
  Activity,
  ListFilter,
} from 'lucide-react';
import type {
  Chapter8State,
  Chapter8TabId,
  DeliverableClaimId,
  EvidenceItemId,
  DeliveryStatusItemId,
  DeliveryClassificationColumn,
  HandoverItemId,
} from '../../types/chapter8';
import {
  CHAPTER8_TITLE,
  CHAPTER8_SUBTITLE,
  CHAPTER8_PROJECT_NAME,
  CHAPTER8_STAGE_LABEL,
  CHAPTER8_USERS_COUNT,
  DELIVERABLE_CLAIMS,
  EVIDENCE_DOCUMENTS,
  DELIVERY_STATUS_ITEMS,
  CLASSIFICATION_COLUMNS,
  HANDOVER_SECTIONS,
  HANDOVER_ITEMS,
  evaluateEvidenceVerification,
  evaluateDeliveryStatus,
  evaluateOperationalHandover,
  evaluateFinalPackage,
  computeChapter8Score,
} from '../../data/chapter8Data';
import { sound } from '../onboarding/SoundEngine';

interface ReleaseHandoverDeskAppProps {
  chapter8State: Chapter8State;
  onUpdateState: (updater: Partial<Chapter8State> | ((prev: Chapter8State) => Chapter8State)) => void;
  onOpenScorecard?: () => void;
  onNotifyDesktop?: (title: string, body: string) => void;
}

export const ReleaseHandoverDeskApp: React.FC<ReleaseHandoverDeskAppProps> = ({
  chapter8State,
  onUpdateState,
  onOpenScorecard,
  onNotifyDesktop,
}) => {
  const [activeTab, setActiveTab] = useState<Chapter8TabId>(chapter8State.activeTab || 'evidence');

  // Activity 1 local selection & drag state
  const [selectedEvidenceForAssign, setSelectedEvidenceForAssign] = useState<EvidenceItemId | null>(null);
  const [draggedEvidenceId, setDraggedEvidenceId] = useState<EvidenceItemId | null>(null);
  const [previewDocModal, setPreviewDocModal] = useState<EvidenceItemId | null>(null);

  // Activity 2 drag & drop state
  const [draggedStatusItemId, setDraggedStatusItemId] = useState<DeliveryStatusItemId | null>(null);

  // Activity 3 section expansion state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    monitoring: true,
    escalation: true,
    boundaries: true,
    recovery: true,
  });

  // Keep state tab in sync
  const handleTabChange = (tab: Chapter8TabId) => {
    setActiveTab(tab);
    onUpdateState({ activeTab: tab });
  };

  // ─────────────────────────────────────────────────────────────
  // ACTIVITY 1: EVIDENCE MATCHING HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleAssignEvidence = (claimId: DeliverableClaimId, evidenceId: EvidenceItemId) => {
    sound.playButtonSelect();
    onUpdateState((prev) => {
      const currentMatches = { ...prev.evidenceMatches };
      // If this evidence was assigned elsewhere, unassign it first
      Object.keys(currentMatches).forEach((cId) => {
        if (currentMatches[cId as DeliverableClaimId] === evidenceId) {
          currentMatches[cId as DeliverableClaimId] = null;
        }
      });
      currentMatches[claimId] = evidenceId;
      return {
        ...prev,
        evidenceMatches: currentMatches,
        evidenceFeedback: null, // clear previous feedback upon modification
      };
    });
    setSelectedEvidenceForAssign(null);
  };

  const handleClearEvidence = (claimId: DeliverableClaimId) => {
    sound.playButtonSelect();
    onUpdateState((prev) => ({
      ...prev,
      evidenceMatches: {
        ...prev.evidenceMatches,
        [claimId]: null,
      },
      evidenceFeedback: null,
    }));
  };

  const handleValidateEvidence = () => {
    sound.playActionLaunch();
    const result = evaluateEvidenceVerification(chapter8State.evidenceMatches);
    const newAttempts = chapter8State.evidenceAttempts + 1;

    onUpdateState((prev) => ({
      ...prev,
      evidenceAttempts: newAttempts,
      evidenceValidated: result.isComplete,
      evidenceFeedback: result.feedback,
    }));

    if (result.isComplete) {
      sound.playSuccessSound();
      onNotifyDesktop?.('Evidence Verified', 'All Phase 1 delivery claims have been substantiated with audit evidence.');
    } else {
      sound.playPenaltyPing();
    }
  };

  // ─────────────────────────────────────────────────────────────
  // ACTIVITY 2: DELIVERY STATUS CLASSIFICATION HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleMoveClassification = (itemId: DeliveryStatusItemId, columnId: DeliveryClassificationColumn) => {
    sound.playButtonSelect();
    onUpdateState((prev) => ({
      ...prev,
      itemClassifications: {
        ...prev.itemClassifications,
        [itemId]: columnId,
      },
      classificationFeedback: null,
    }));
  };

  const handleSubmitClassification = () => {
    sound.playActionLaunch();
    const result = evaluateDeliveryStatus(chapter8State.itemClassifications);
    const newAttempts = chapter8State.classificationAttempts + 1;

    onUpdateState((prev) => ({
      ...prev,
      classificationAttempts: newAttempts,
      classificationValidated: result.isComplete,
      classificationFeedback: result.feedback,
    }));

    if (result.isComplete) {
      sound.playSuccessSound();
      onNotifyDesktop?.('Delivery Status Classified', 'Scope baseline, deferred items, and pending signoffs correctly demarcated.');
    } else {
      sound.playPenaltyPing();
    }
  };

  // ─────────────────────────────────────────────────────────────
  // ACTIVITY 3: OPERATIONAL HANDOVER HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleToggleHandoverItem = (itemId: HandoverItemId) => {
    sound.playButtonSelect();
    onUpdateState((prev) => {
      const exists = prev.selectedHandoverItems.includes(itemId);
      const nextItems = exists
        ? prev.selectedHandoverItems.filter((id) => id !== itemId)
        : [...prev.selectedHandoverItems, itemId];
      return {
        ...prev,
        selectedHandoverItems: nextItems,
        handoverFeedback: null,
      };
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleValidateHandover = () => {
    sound.playActionLaunch();
    const result = evaluateOperationalHandover(chapter8State.selectedHandoverItems);
    const newAttempts = chapter8State.handoverAttempts + 1;

    onUpdateState((prev) => ({
      ...prev,
      handoverAttempts: newAttempts,
      handoverValidated: result.isComplete,
      handoverFeedback: result.feedback,
    }));

    if (result.isComplete) {
      sound.playSuccessSound();
      onNotifyDesktop?.('Operational Handover Ready', 'All monitoring, escalation, continuity runbooks, and scope boundaries selected.');
    } else {
      sound.playPenaltyPing();
    }
  };

  // ─────────────────────────────────────────────────────────────
  // ACTIVITY 4: FINAL DELIVERY PACKAGE SUBMISSION & VALIDATION
  // ─────────────────────────────────────────────────────────────
  const handleSubmitFinalPackage = () => {
    sound.playActionLaunch();
    const val = evaluateFinalPackage(chapter8State);

    onUpdateState((prev) => ({
      ...prev,
      packageValidationResults: val,
      packageSubmitted: val.isReady,
    }));

    if (val.isReady) {
      sound.playSuccessSound();
      onNotifyDesktop?.('Handover Package Submitted', 'Final handover package submitted for Marcus and Sophia stakeholder reviews.');

      // Trigger Marcus Technical Review after short interval
      setTimeout(() => {
        onUpdateState((prev) => ({
          ...prev,
          marcusTechnicalApproved: true,
        }));
        sound.playSystemClearance();
        onNotifyDesktop?.('Technical Handover Approved', 'Marcus Reed: Technical evidence, testing, and operational handover approved.');
      }, 1600);

      // Trigger Sophia Client Acceptance after another interval
      setTimeout(() => {
        onUpdateState((prev) => ({
          ...prev,
          sophiaClientAccepted: true,
        }));
        sound.playSystemClearance();
        onNotifyDesktop?.('Client Acceptance Granted', 'Sophia Bennett: Phase 1 delivery accepted on behalf of ICICI Bank HR.');
      }, 3400);

      // Trigger Aarav Concluding Closure after approvals
      setTimeout(() => {
        onUpdateState((prev) => {
          const updated = {
            ...prev,
            aaravClosureConfirmed: true,
            finalProjectDashboardShown: true,
            completed: true,
          };
          const scorecard = computeChapter8Score(updated);
          return {
            ...updated,
            scorecard,
          };
        });
        sound.playDownloadComplete();
      }, 5200);
    } else {
      sound.playPenaltyPing();
    }
  };

  // Helpers for matched evidence count
  const matchedClaimsCount = Object.values(chapter8State.evidenceMatches).filter(Boolean).length;
  const classifiedCount = Object.keys(chapter8State.itemClassifications).length;
  const handoverCount = chapter8State.selectedHandoverItems.length;

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] text-slate-100 font-sans select-none overflow-hidden">
      {/* ── TOP APPLICATION HEADER ── */}
      <div className="bg-[#0f172a]/95 border-b border-cyan-500/20 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-lg relative z-20">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <FileCheck2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                {CHAPTER8_PROJECT_NAME} · {CHAPTER8_STAGE_LABEL}
              </div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                RELEASE & HANDOVER DESK
                {chapter8State.aaravClosureConfirmed ? (
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Handover Complete
                  </span>
                ) : chapter8State.packageSubmitted ? (
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                    Pending Stakeholder Approvals
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    Preparing Handover
                  </span>
                )}
              </h1>
            </div>
          </div>
        </div>

        {/* 4 Project Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-1.5 min-w-[110px]">
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Project</div>
            <div className="text-xs font-bold text-white truncate">{CHAPTER8_PROJECT_NAME}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-1.5 min-w-[110px]">
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Delivery</div>
            <div className="text-xs font-bold text-cyan-300 truncate">Phase 1 Scope</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-1.5 min-w-[110px]">
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Users</div>
            <div className="text-xs font-bold text-white truncate">{CHAPTER8_USERS_COUNT}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-1.5 min-w-[110px]">
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Stage</div>
            <div className="text-xs font-bold text-amber-300 truncate">Final Handover</div>
          </div>
        </div>
      </div>

      {/* ── 4-STAGE PROGRESS TABS ── */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-2 flex items-center justify-between overflow-x-auto shrink-0 z-10">
        <div className="flex items-center space-x-2">
          {/* Tab 1 */}
          <button
            onClick={() => handleTabChange('evidence')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'evidence'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                chapter8State.evidenceValidated
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {chapter8State.evidenceValidated ? <Check className="w-3 h-3 stroke-[3]" /> : '1'}
            </span>
            <span>Evidence Verification</span>
            {chapter8State.evidenceValidated && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                Verified
              </span>
            )}
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          {/* Tab 2 */}
          <button
            onClick={() => handleTabChange('status')}
            disabled={!chapter8State.evidenceValidated}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'status'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : chapter8State.evidenceValidated
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                : 'text-slate-600 opacity-60 cursor-not-allowed'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                chapter8State.classificationValidated
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {chapter8State.classificationValidated ? <Check className="w-3 h-3 stroke-[3]" /> : '2'}
            </span>
            <span>Delivery Status</span>
            {chapter8State.classificationValidated && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                Classified
              </span>
            )}
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          {/* Tab 3 */}
          <button
            onClick={() => handleTabChange('handover')}
            disabled={!chapter8State.classificationValidated}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'handover'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : chapter8State.classificationValidated
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                : 'text-slate-600 opacity-60 cursor-not-allowed'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                chapter8State.handoverValidated
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {chapter8State.handoverValidated ? <Check className="w-3 h-3 stroke-[3]" /> : '3'}
            </span>
            <span>Operational Handover</span>
            {chapter8State.handoverValidated && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                Transferred
              </span>
            )}
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          {/* Tab 4 */}
          <button
            onClick={() => handleTabChange('package')}
            disabled={!chapter8State.handoverValidated}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'package'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : chapter8State.handoverValidated
                ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                : 'text-slate-600 opacity-60 cursor-not-allowed'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                chapter8State.aaravClosureConfirmed
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {chapter8State.aaravClosureConfirmed ? <Check className="w-3 h-3 stroke-[3]" /> : '4'}
            </span>
            <span>Final Delivery Package</span>
            {chapter8State.aaravClosureConfirmed && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                Approved
              </span>
            )}
          </button>
        </div>

        {/* View scorecard button if completed */}
        {chapter8State.finalProjectDashboardShown && onOpenScorecard && (
          <button
            onClick={onOpenScorecard}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 transition-all shrink-0"
          >
            <Award className="w-3.5 h-3.5" />
            <span>View Final Project Scorecard</span>
          </button>
        )}
      </div>

      {/* ── MAIN WORKSPACE CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ─────────────────────────────────────────────────────────────
            STAGE 1: EVIDENCE VERIFICATION
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'evidence' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-slate-900/90 to-slate-900/40 border border-slate-700/60 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                    ACTIVITY 1 · EVIDENCE VERIFICATION
                  </div>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    Substantiate Delivery Claims with Project Evidence
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Before requesting final acceptance, make sure every important delivery claim is backed by the right evidence.
                    Drag available audit documents onto each claim, or click to select and match.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Evidence Matched</div>
                    <div className="text-base font-black text-cyan-300">
                      {matchedClaimsCount} / {DELIVERABLE_CLAIMS.length}
                    </div>
                  </div>
                  <button
                    onClick={handleValidateEvidence}
                    disabled={matchedClaimsCount === 0}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                      matchedClaimsCount === DELIVERABLE_CLAIMS.length
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Validate Evidence</span>
                  </button>
                </div>
              </div>

              {/* Feedback Alert Banner */}
              {chapter8State.evidenceFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                    chapter8State.evidenceValidated
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  }`}
                >
                  {chapter8State.evidenceValidated ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold">
                      {chapter8State.evidenceValidated
                        ? 'Evidence Verification Successful'
                        : 'Evidence Matching Needs Attention'}
                    </div>
                    <div className="mt-0.5 text-slate-300">{chapter8State.evidenceFeedback}</div>
                  </div>
                  {chapter8State.evidenceValidated && (
                    <button
                      onClick={() => handleTabChange('status')}
                      className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400 transition-all shrink-0"
                    >
                      Proceed to Activity 2 →
                    </button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Split Workspace: Area A (Claims) vs Area B (Available Evidence) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* AREA A: PROJECT DELIVERABLES (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Area A · Delivery Claims Requiring Evidence</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">10 Formal Claims</span>
                </div>

                <div className="space-y-2.5">
                  {DELIVERABLE_CLAIMS.map((claim, idx) => {
                    const assignedDocId = chapter8State.evidenceMatches[claim.id];
                    const assignedDoc = assignedDocId
                      ? EVIDENCE_DOCUMENTS.find((d) => d.id === assignedDocId)
                      : null;

                    return (
                      <div
                        key={claim.id}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (draggedEvidenceId) {
                            handleAssignEvidence(claim.id, draggedEvidenceId);
                            setDraggedEvidenceId(null);
                          }
                        }}
                        className={`p-3.5 rounded-xl border transition-all ${
                          assignedDoc
                            ? 'bg-slate-900/90 border-cyan-500/40 shadow-sm'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                                #{idx + 1}
                              </span>
                              <h4 className="text-xs font-bold text-white">{claim.label}</h4>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {claim.description}
                            </p>
                          </div>

                          {/* Quick assign button if doc selected in Area B */}
                          {selectedEvidenceForAssign && !assignedDoc && (
                            <button
                              onClick={() =>
                                handleAssignEvidence(claim.id, selectedEvidenceForAssign)
                              }
                              className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500 hover:text-slate-950 text-[11px] font-bold transition-all shrink-0"
                            >
                              Attach Selected
                            </button>
                          )}
                        </div>

                        {/* Drop Target / Matched Document Slot */}
                        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80">
                          {assignedDoc ? (
                            <div className="flex items-center justify-between bg-slate-950/80 border border-cyan-500/30 rounded-lg p-2 text-xs">
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                                <div className="truncate">
                                  <div className="font-bold text-cyan-200 truncate">{assignedDoc.title}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {assignedDoc.documentType} · {assignedDoc.chapterOrigin}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => setPreviewDocModal(assignedDoc.id)}
                                  className="p-1 hover:text-cyan-300 text-slate-400 transition-colors"
                                  title="Inspect Document"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleClearEvidence(claim.id)}
                                  className="text-[10px] font-mono text-rose-400 hover:text-rose-300 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 transition-all"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                if (selectedEvidenceForAssign) {
                                  handleAssignEvidence(claim.id, selectedEvidenceForAssign);
                                }
                              }}
                              className={`border-2 border-dashed rounded-lg p-2 text-center text-xs cursor-pointer transition-all ${
                                selectedEvidenceForAssign
                                  ? 'border-cyan-500/60 bg-cyan-950/20 text-cyan-300 animate-pulse'
                                  : 'border-slate-800 text-slate-500 hover:border-slate-700'
                              }`}
                            >
                              {selectedEvidenceForAssign
                                ? 'Click to match selected document here'
                                : 'Drag an evidence document here, or select one from Area B'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AREA B: AVAILABLE EVIDENCE DOCUMENTS (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-blue-400" />
                    <span>Area B · Available Evidence Documents</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">10 Records</span>
                </div>

                <div className="space-y-2.5">
                  {EVIDENCE_DOCUMENTS.map((doc) => {
                    const isMatched = Object.values(chapter8State.evidenceMatches).includes(doc.id);
                    const isSelected = selectedEvidenceForAssign === doc.id;

                    return (
                      <div
                        key={doc.id}
                        draggable={!isMatched}
                        onDragStart={() => setDraggedEvidenceId(doc.id)}
                        onClick={() => {
                          if (!isMatched) {
                            setSelectedEvidenceForAssign(isSelected ? null : doc.id);
                          }
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                            : isMatched
                            ? 'bg-slate-900/30 border-slate-800 opacity-60'
                            : 'bg-slate-900/80 border-slate-700/60 hover:border-cyan-500/50 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded bg-slate-800 text-cyan-400">
                              <FileText className="w-3.5 h-3.5" />
                            </span>
                            <div>
                              <div className="text-xs font-bold text-white">{doc.title}</div>
                              <div className="text-[10px] font-mono text-cyan-300/80">
                                {doc.category} · {doc.documentType}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isMatched ? (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Matched
                              </span>
                            ) : isSelected ? (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold">
                                Ready to Link
                              </span>
                            ) : null}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewDocModal(doc.id);
                              }}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Preview Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">
                          {doc.description}
                        </p>

                        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>Origin: {doc.chapterOrigin}</span>
                          {!isMatched && (
                            <span className="text-cyan-400/80">Click or Drag to Match</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STAGE 2: DELIVERY STATUS CLASSIFICATION
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'status' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-slate-900/90 to-slate-900/40 border border-slate-700/60 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                    ACTIVITY 2 · DELIVERY STATUS CLASSIFICATION
                  </div>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    Classify Deliverables into Governance Categories
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Not every project item has the same delivery status. Classify each item accurately before requesting final acceptance.
                    Keep completed deliverables, deferred change requests, and items awaiting stakeholder approval strictly separated.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Items Classified</div>
                    <div className="text-base font-black text-cyan-300">
                      {classifiedCount} / {DELIVERY_STATUS_ITEMS.length}
                    </div>
                  </div>
                  <button
                    onClick={handleSubmitClassification}
                    disabled={classifiedCount === 0}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                      classifiedCount === DELIVERY_STATUS_ITEMS.length
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Classification</span>
                  </button>
                </div>
              </div>

              {/* Feedback Alert Banner */}
              {chapter8State.classificationFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                    chapter8State.classificationValidated
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  }`}
                >
                  {chapter8State.classificationValidated ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold">
                      {chapter8State.classificationValidated
                        ? 'Delivery Classification Accurate'
                        : 'Classification Requires Revision'}
                    </div>
                    <div className="mt-0.5 text-slate-300">
                      {chapter8State.classificationFeedback}
                    </div>
                  </div>
                  {chapter8State.classificationValidated && (
                    <button
                      onClick={() => handleTabChange('handover')}
                      className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400 transition-all shrink-0"
                    >
                      Proceed to Activity 3 →
                    </button>
                  )}
                </motion.div>
              )}
            </div>

            {/* 4 Classification Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {CLASSIFICATION_COLUMNS.map((col: any) => {
                const columnItems = DELIVERY_STATUS_ITEMS.filter(
                  (item) => chapter8State.itemClassifications[item.id] === col.id
                );

                return (
                  <div
                    key={col.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedStatusItemId) {
                        handleMoveClassification(draggedStatusItemId, col.id);
                        setDraggedStatusItemId(null);
                      }
                    }}
                    className="flex flex-col bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden min-h-[460px]"
                  >
                    {/* Column Header */}
                    <div className="p-3.5 border-b border-slate-800 bg-slate-900/90">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${col.badgeColor}`}>
                          {col.title}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {columnItems.length}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                        {col.description}
                      </p>
                    </div>

                    {/* Column Items Drop Area */}
                    <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                      {columnItems.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => setDraggedStatusItemId(item.id)}
                          className="p-3 rounded-xl bg-slate-950/80 border border-slate-700/60 hover:border-cyan-500/50 transition-all cursor-grab active:cursor-grabbing shadow-sm space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="text-xs font-bold text-white">{item.title}</h5>
                            <span className="text-[9px] font-mono text-slate-500">{item.chapterOrigin}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {item.description}
                          </p>

                          {/* Non-drag quick relocation buttons */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-mono">Move to:</span>
                            <div className="flex items-center gap-1">
                              {CLASSIFICATION_COLUMNS.filter((c: any) => c.id !== col.id).map((otherCol: any) => (
                                <button
                                  key={otherCol.id}
                                  onClick={() => handleMoveClassification(item.id, otherCol.id)}
                                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[9px] transition-colors"
                                  title={`Move to ${otherCol.title}`}
                                >
                                  {otherCol.id === 'completed_verified'
                                    ? 'Verified'
                                    : otherCol.id === 'completed_awaiting_approval'
                                    ? 'Approval'
                                    : otherCol.id === 'deferred_phase_2'
                                    ? 'Phase 2'
                                    : 'Action'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      {columnItems.length === 0 && (
                        <div className="h-44 border-2 border-dashed border-slate-800/80 rounded-xl flex items-center justify-center p-4 text-center text-xs text-slate-600">
                          Drag relevant deliverables here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Unclassified Items Tray if any items are not yet assigned */}
            {(() => {
              const unassignedItems = DELIVERY_STATUS_ITEMS.filter(
                (item) => !chapter8State.itemClassifications[item.id]
              );
              if (unassignedItems.length === 0) return null;

              return (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                  <div className="text-xs font-mono text-slate-300 font-bold uppercase mb-2 flex items-center gap-2">
                    <ListFilter className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Unclassified Deliverables ({unassignedItems.length} remaining)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {unassignedItems.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => setDraggedStatusItemId(item.id)}
                        className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 hover:border-cyan-400 cursor-grab active:cursor-grabbing space-y-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white">{item.title}</h5>
                          <span className="text-[9px] font-mono text-cyan-400">{item.chapterOrigin}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{item.description}</p>
                        <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 justify-end">
                          <span className="text-[10px] text-slate-500 font-mono mr-auto">Classify as:</span>
                          <button
                            onClick={() => handleMoveClassification(item.id, 'completed_verified')}
                            className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold hover:bg-emerald-500 hover:text-slate-950"
                          >
                            Verified
                          </button>
                          <button
                            onClick={() => handleMoveClassification(item.id, 'completed_awaiting_approval')}
                            className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold hover:bg-blue-500 hover:text-slate-950"
                          >
                            Approval
                          </button>
                          <button
                            onClick={() => handleMoveClassification(item.id, 'deferred_phase_2')}
                            className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold hover:bg-amber-500 hover:text-slate-950"
                          >
                            Phase 2
                          </button>
                          <button
                            onClick={() => handleMoveClassification(item.id, 'unresolved_requires_action')}
                            className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold hover:bg-rose-500 hover:text-slate-950"
                          >
                            Action
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STAGE 3: OPERATIONAL HANDOVER
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'handover' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-slate-900/90 to-slate-900/40 border border-slate-700/60 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                    ACTIVITY 3 · OPERATIONAL HANDOVER WORKSPACE
                  </div>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    Organise Support Runbooks, Monitoring, & Ownership
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    The project team is preparing to transfer responsibility. Make sure the receiving team knows what it is taking ownership of and how to respond when something goes wrong.
                    Select the required operational items across all four governance domains.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Items Selected</div>
                    <div className="text-base font-black text-cyan-300">
                      {handoverCount} / {HANDOVER_ITEMS.length}
                    </div>
                  </div>
                  <button
                    onClick={handleValidateHandover}
                    disabled={handoverCount === 0}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                      handoverCount === HANDOVER_ITEMS.length
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Validate Handover</span>
                  </button>
                </div>
              </div>

              {/* Feedback Alert Banner */}
              {chapter8State.handoverFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                    chapter8State.handoverValidated
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  }`}
                >
                  {chapter8State.handoverValidated ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold">
                      {chapter8State.handoverValidated
                        ? 'Operational Handover Plan Complete'
                        : 'Handover Requires Additional Runbooks'}
                    </div>
                    <div className="mt-0.5 text-slate-300">{chapter8State.handoverFeedback}</div>
                  </div>
                  {chapter8State.handoverValidated && (
                    <button
                      onClick={() => handleTabChange('package')}
                      className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400 transition-all shrink-0"
                    >
                      Proceed to Activity 4 →
                    </button>
                  )}
                </motion.div>
              )}
            </div>

            {/* 4 Handover Expandable Sections */}
            <div className="space-y-4">
              {HANDOVER_SECTIONS.map((section) => {
                const sectionItems = HANDOVER_ITEMS.filter((i) => i.section === section.id);
                const selectedCount = sectionItems.filter((i) =>
                  chapter8State.selectedHandoverItems.includes(i.id)
                ).length;
                const isAllSelected = selectedCount === sectionItems.length;
                const isExpanded = !!expandedSections[section.id];

                return (
                  <div
                    key={section.id}
                    className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-sm"
                  >
                    {/* Section Header */}
                    <div
                      onClick={() => toggleSection(section.id)}
                      className="p-4 bg-slate-900/90 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition-colors border-b border-slate-800/80"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isAllSelected
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isAllSelected ? <Check className="w-4 h-4 stroke-[3]" /> : selectedCount}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{section.title}</h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
                              Ownership: {section.roleOwner}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{section.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-mono font-bold ${
                            isAllSelected ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {selectedCount} / {sectionItems.length} Selected
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Section Items Grid */}
                    {isExpanded && (
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/40">
                        {sectionItems.map((item) => {
                          const isSelected = chapter8State.selectedHandoverItems.includes(item.id);

                          return (
                            <div
                              key={item.id}
                              onClick={() => handleToggleHandoverItem(item.id)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                                isSelected
                                  ? 'bg-cyan-950/30 border-cyan-500/50 shadow-sm'
                                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                                  isSelected
                                    ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                                    : 'border-slate-700 bg-slate-900 text-transparent'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>

                              <div className="space-y-1 flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                                  <span className="text-[9px] font-mono text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                                    {item.ownerRole}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STAGE 4: FINAL DELIVERY PACKAGE & STAKEHOLDER ACCEPTANCE
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'package' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Top Overview Banner */}
            <div className="bg-gradient-to-r from-slate-900/90 to-slate-900/40 border border-slate-700/60 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                    ACTIVITY 4 · FINAL DELIVERY PACKAGE & ACCEPTANCE
                  </div>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    Executive Delivery Package · Project Amigo Phase 1
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Bring the evidence, delivery classifications, and operational handover runbooks together into one final executive package.
                    Review the document preview, confirm governance completeness, and submit for CTO and Client acceptance.
                  </p>
                </div>

                {!chapter8State.packageSubmitted ? (
                  <button
                    onClick={handleSubmitFinalPackage}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg hover:brightness-110 transition-all shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Final Handover Package</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Package Submitted for Approval
                    </span>
                  </div>
                )}
              </div>

              {/* Validation Warning if incomplete */}
              {chapter8State.packageValidationResults && !chapter8State.packageValidationResults.isReady && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-200 text-xs space-y-2"
                >
                  <div className="font-bold flex items-center gap-2 text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Handover Package — Validation Required</span>
                  </div>
                  <p className="text-slate-300">
                    Your package is almost ready. The following items need attention before stakeholder review:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-200 pl-2">
                    {chapter8State.packageValidationResults.missingItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleTabChange('evidence')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold"
                    >
                      ← Review Evidence
                    </button>
                    <button
                      onClick={() => handleTabChange('status')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold"
                    >
                      ← Review Classifications
                    </button>
                    <button
                      onClick={() => handleTabChange('handover')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold"
                    >
                      ← Review Handover
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Split View: Left Document Preview (8 cols) vs Right Governance Status (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 5-SECTION DOCUMENT PREVIEW (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900/80 border border-slate-700/60 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        FORMAL PROJECT HANDOVER & CLOSURE REPORT
                      </h3>
                      <div className="text-[10px] font-mono text-slate-400">
                        ICICI Bank HRMS Transformation · Confidential Record
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    REF: AMIGO-P1-FINAL-2026
                  </span>
                </div>

                {/* Section 1: Project Delivery Overview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <span>1. Project Delivery Overview</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono">Platform</div>
                      <div className="font-bold text-white">Project Amigo</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono">Phase</div>
                      <div className="font-bold text-white">Phase 1 Delivery</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono">User Base</div>
                      <div className="font-bold text-white">~80,000 Employees</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono">Modules Live</div>
                      <div className="font-bold text-emerald-400">Attendance, Leave, Appraisals</div>
                    </div>
                  </div>
                </div>

                {/* Executive Summary Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Delivery Executive Summary</span>
                    <span className="text-[10px] font-mono text-slate-500">Structured Record</span>
                  </div>
                  <textarea
                    value={chapter8State.deliveryExecutiveSummary}
                    onChange={(e) =>
                      onUpdateState({ deliveryExecutiveSummary: e.target.value })
                    }
                    rows={4}
                    disabled={chapter8State.packageSubmitted}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 leading-relaxed font-sans resize-none"
                    placeholder="Enter final executive delivery summary..."
                  />
                </div>

                {/* Section 2: Delivery & Testing Evidence */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <span>2. Delivery & Testing Evidence</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({matchedClaimsCount}/10 claims substantiated)
                    </span>
                  </h4>
                  <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-3 space-y-2 text-xs">
                    {DELIVERABLE_CLAIMS.slice(0, 5).map((claim) => {
                      const docId = chapter8State.evidenceMatches[claim.id];
                      const doc = docId ? EVIDENCE_DOCUMENTS.find((d) => d.id === docId) : null;
                      return (
                        <div key={claim.id} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                          <span className="text-slate-300 text-[11px] truncate">{claim.label}</span>
                          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 shrink-0">
                            {doc?.title || 'Pending Evidence'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Production Stability Record */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    3. Production Stability & Incident Resolution
                  </h4>
                  <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          INC-0241
                        </span>
                        <span className="font-bold text-white">Attendance Sync Socket Memory Leak</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        Resolved & Verified
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Incident impact: 12 branch officers experienced intermittent 504 gateway timeouts.
                      Root cause isolated to lingering WebSocket connections under load.
                      Container hotfix deployed; zero memory regression detected post-release.
                      80% memory APM alert thresholds and automated leak regression tests activated.
                    </p>
                  </div>
                </div>

                {/* Section 4: Outstanding & Deferred Items */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    4. Outstanding & Deferred Scope
                  </h4>
                  <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          CR-017
                        </span>
                        <span className="font-bold text-white">Dynamic Bonus Calculator</span>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        Deferred to Phase 2
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Evaluated during Chapter 4 Change Request impact analysis. Formal scope decision placed this module outside Phase 1 release baseline.
                      Scheduled for Phase 2 architectural evaluation alongside regional payroll integration.
                      No unresolved blocker defects remain.
                    </p>
                  </div>
                </div>

                {/* Section 5: Operational Handover */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    5. Operational Handover & Support Ownership
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] font-mono text-blue-400 font-bold uppercase">Engineering Operations</div>
                      <div className="text-[11px] text-slate-300 mt-1">
                        Tier-3 microservice telemetry, container scaling policies, APM alert thresholds (80%), and hotfix deployment procedures.
                      </div>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] font-mono text-blue-400 font-bold uppercase">Application Support</div>
                      <div className="text-[11px] text-slate-300 mt-1">
                        Branch incident triage runbooks, 12-branch escalation matrix, user login verification protocols, and recovery signoffs.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDEBAR: STAKEHOLDER REVIEWS & PROJECT CLOSURE (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Dual Stakeholder Acceptance Status */}
                <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 space-y-4 shadow-xl">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Stakeholder Acceptance</span>
                  </h3>

                  {/* Marcus Technical Review Card */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    chapter8State.marcusTechnicalApproved
                      ? 'bg-emerald-950/20 border-emerald-500/50'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/character/marcus_reed/MarcusDP.png"
                          alt="Marcus"
                          className="w-7 h-7 rounded-full border border-sky-400/50 object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">Marcus Reed</div>
                          <div className="text-[10px] text-slate-400 font-mono">CTO · Technical Leadership</div>
                        </div>
                      </div>
                      {chapter8State.marcusTechnicalApproved ? (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Approved
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-500">Pending Review</span>
                      )}
                    </div>
                    {chapter8State.marcusTechnicalApproved && (
                      <p className="text-[11px] text-emerald-200 mt-2.5 italic leading-relaxed border-t border-emerald-500/20 pt-2">
                        "I've reviewed the technical evidence, testing records, and operational handover. The production recovery is documented, and the support information is in place. The technical handover is approved."
                      </p>
                    )}
                  </div>

                  {/* Sophia Client Acceptance Card */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    chapter8State.sophiaClientAccepted
                      ? 'bg-emerald-950/20 border-emerald-500/50'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/character/Sophia_bennett/SophiaDP.png"
                          alt="Sophia"
                          className="w-7 h-7 rounded-full border border-pink-400/50 object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">Sophia Bennett</div>
                          <div className="text-[10px] text-slate-400 font-mono">Head of HR Operations · ICICI Bank</div>
                        </div>
                      </div>
                      {chapter8State.sophiaClientAccepted ? (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Accepted
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-500">Pending Review</span>
                      )}
                    </div>
                    {chapter8State.sophiaClientAccepted && (
                      <p className="text-[11px] text-emerald-200 mt-2.5 italic leading-relaxed border-t border-emerald-500/20 pt-2">
                        "The Phase 1 delivery is clearly documented. I can see what has been completed, what has been validated, and what has been deferred. On behalf of the HR team, we accept the Phase 1 delivery."
                      </p>
                    )}
                  </div>

                  {/* Aarav Concluding Closure Card */}
                  {chapter8State.aaravClosureConfirmed && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-3.5 rounded-xl border border-cyan-500/50 bg-cyan-950/20 space-y-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/character/AaravDP.png"
                          alt="Aarav"
                          className="w-7 h-7 rounded-full border border-cyan-400/50 object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">Aarav Kapoor</div>
                          <div className="text-[10px] text-cyan-300 font-mono">Senior Consultant · Project Manager</div>
                        </div>
                      </div>
                      <p className="text-[11px] text-cyan-100 italic leading-relaxed border-t border-cyan-500/20 pt-2">
                        "That's it, Jane. Project Amigo has reached formal Phase 1 handover. We've delivered the agreed scope, validated the system, managed the production issue, and made sure the receiving team has what it needs. Well done."
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* FINAL PROJECT DASHBOARD CARD (When Handover Complete) */}
                {chapter8State.finalProjectDashboardShown && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/50 rounded-2xl p-4 space-y-3 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                        PROJECT AMIGO · PHASE 1
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                        Handover Complete
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                        <div className="text-slate-500 text-[9px]">Delivery Evidence</div>
                        <div className="text-emerald-400 font-bold">Validated</div>
                      </div>
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                        <div className="text-slate-500 text-[9px]">Scope Classification</div>
                        <div className="text-emerald-400 font-bold">Complete</div>
                      </div>
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                        <div className="text-slate-500 text-[9px]">Technical Approval</div>
                        <div className="text-emerald-400 font-bold">Approved</div>
                      </div>
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                        <div className="text-slate-500 text-[9px]">Operational Handover</div>
                        <div className="text-emerald-400 font-bold">Complete</div>
                      </div>
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                        <div className="text-slate-500 text-[9px]">Client Acceptance</div>
                        <div className="text-emerald-400 font-bold">Accepted</div>
                      </div>
                      <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                        <div className="text-slate-500 text-[9px]">INC-0241</div>
                        <div className="text-emerald-400 font-bold">Resolved</div>
                      </div>
                    </div>

                    {onOpenScorecard && (
                      <button
                        onClick={onOpenScorecard}
                        className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                      >
                        <Award className="w-4 h-4" />
                        <span>View Transformation Room Results</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── DOCUMENT PREVIEW MODAL ── */}
      <AnimatePresence>
        {previewDocModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4"
            >
              {(() => {
                const doc = EVIDENCE_DOCUMENTS.find((d) => d.id === previewDocModal);
                if (!doc) return null;

                return (
                  <>
                    <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                          {doc.category} · {doc.documentType}
                        </span>
                        <h3 className="text-base font-bold text-white mt-0.5">{doc.title}</h3>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Source: {doc.chapterOrigin}
                        </div>
                      </div>
                      <button
                        onClick={() => setPreviewDocModal(null)}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed font-sans space-y-2">
                      <div className="font-bold text-cyan-300 font-mono uppercase text-[10px]">
                        Audit Record Details
                      </div>
                      <p>{doc.description}</p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setPreviewDocModal(null)}
                        className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                      >
                        Close Preview
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
