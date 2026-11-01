import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Play,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  Clock,
} from 'lucide-react';
import type {
  Chapter7State,
  ImmediateActionId,
  ClosureConditionId,
  RcaSlotType,
} from '../../types/chapter7';
import {
  IMMEDIATE_ACTIONS,
  RCA_BANK_ITEMS,
  CLOSURE_CONDITIONS,
  computeChapter7Score,
} from '../../data/chapter7Data';
import { sound } from '../onboarding/SoundEngine';

interface IncidentResponseStudioAppProps {
  chapter7State: Chapter7State;
  onUpdateState: (updater: Partial<Chapter7State> | ((prev: Chapter7State) => Chapter7State)) => void;
  onReturnToMeeting?: () => void;
  onOpenScorecard?: () => void;
  onNotifyDesktop?: (title: string, body: string) => void;
}

export const IncidentResponseStudioApp: React.FC<IncidentResponseStudioAppProps> = ({
  chapter7State,
  onUpdateState,
  onReturnToMeeting,
  onOpenScorecard,
  onNotifyDesktop,
}) => {
  const [activeTab, setActiveTab] = useState<'immediate' | 'rca' | 'closure'>(
    chapter7State.activeTab || 'immediate'
  );

  // Local state for Activity 1: Immediate Response
  const [selectedActions, setSelectedActions] = useState<ImmediateActionId[]>(
    chapter7State.selectedImmediateActions || []
  );
  const [actionFeedback, setActionFeedback] = useState<string | null>(
    chapter7State.immediateValidationFeedback
  );

  // Local state for Activity 2: RCA Slots
  const [rcaSlots, setRcaSlots] = useState<{
    incident: string | null;
    root_cause: string | null;
    impact: string | null;
    preventive_action: string | null;
  }>(chapter7State.rcaSlots);
  const [rcaFeedback, setRcaFeedback] = useState<string | null>(
    chapter7State.rcaValidationFeedback
  );

  // Local state for Activity 3: Closure Conditions
  const [selectedConditions, setSelectedConditions] = useState<ClosureConditionId[]>(
    chapter7State.selectedClosureConditions || []
  );
  const [closureFeedback, setClosureFeedback] = useState<string | null>(
    chapter7State.closureValidationFeedback
  );

  // Activity 1 Handlers
  const handleToggleAction = (id: ImmediateActionId) => {
    sound.playClick();
    setSelectedActions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setActionFeedback(null);
  };

  const handleValidateImmediate = () => {
    sound.playClick();
    const hasDeploy = selectedActions.includes('deploy_hotfix');
    const hasMonitor = selectedActions.includes('monitor_recovery');
    const hasVerify = selectedActions.includes('verify_branch_users');
    const hasTrap = selectedActions.includes('close_immediately_trap');

    if (hasTrap) {
      sound.playClick();
      const msg =
        'Critical Antipattern: Never close a production incident immediately without verifying telemetry or confirming that affected branch users are restored.';
      setActionFeedback(msg);
      return;
    }

    if (!hasDeploy || !hasMonitor || !hasVerify) {
      sound.playClick();
      const msg =
        'Incomplete Response: An effective immediate incident response requires all three: deploying the hotfix, observing service telemetry recovery, and validating user logins with Martha.';
      setActionFeedback(msg);
      return;
    }

    sound.playSystemClearance();
    setActionFeedback(
      'Immediate Response Verified: Hotfix PR #142 deployed, memory consumption stabilized at 210MB, and Martha confirmed 12 branch officers logged in successfully.'
    );
    onUpdateState({
      selectedImmediateActions: selectedActions,
      immediateSubmitted: true,
      immediateValidationFeedback:
        'Immediate Response Verified: Hotfix deployed and user access verified.',
      activeTab: 'rca',
    });
  };

  // Activity 2 Handlers
  const handleSelectRcaItem = (slot: RcaSlotType, itemId: string) => {
    sound.playClick();
    setRcaSlots((prev) => ({
      ...prev,
      [slot]: itemId,
    }));
    setRcaFeedback(null);
  };

  const handleValidateRca = () => {
    sound.playClick();
    const isRootCorrect = rcaSlots.root_cause === 'rca_root_correct';
    const isPrevCorrect = rcaSlots.preventive_action === 'rca_prev_correct';

    if (!rcaSlots.root_cause || !rcaSlots.preventive_action) {
      sound.playClick();
      setRcaFeedback('Please select both the Root Cause and Preventive Action to complete the RCA.');
      return;
    }

    if (!isRootCorrect || !isPrevCorrect) {
      sound.playClick();
      setRcaFeedback(
        'RCA Inaccurate: Review the microservice logs. The root cause is a memory socket leak, not client passwords or nightly reboots.'
      );
      return;
    }

    sound.playSystemClearance();
    setRcaFeedback(
      'Root Cause Analysis Complete: Correctly diagnosed memory leak in HTTP connection pooling and established automated monitoring & regression suite to prevent recurrence.'
    );
    onUpdateState({
      rcaSlots,
      rcaSubmitted: true,
      rcaValidationFeedback: 'RCA documented with socket leak findings and preventive monitoring.',
      activeTab: 'closure',
    });
  };

  // Activity 3 Handlers
  const handleToggleCondition = (id: ClosureConditionId) => {
    sound.playClick();
    setSelectedConditions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setClosureFeedback(null);
  };

  const handleSubmitClosure = () => {
    sound.playClick();
    const hasHotfix = selectedConditions.includes('cond_hotfix_verified');
    const hasRca = selectedConditions.includes('cond_rca_documented');
    const hasMon = selectedConditions.includes('cond_monitoring_updated');
    const hasShare = selectedConditions.includes('cond_shared_with_leads');
    const hasTrap = selectedConditions.includes('cond_skip_documentation_trap');

    if (hasTrap) {
      sound.playClick();
      setClosureFeedback(
        'Governance Violation: Skipping documentation violates ICICI Bank engineering standards and leaves teams blind to repeat incidents.'
      );
      return;
    }

    if (!hasHotfix || !hasRca || !hasMon || !hasShare) {
      sound.playClick();
      setClosureFeedback(
        'Missing Closure Gates: Formal incident closure requires verified hotfix, documented RCA, updated monitoring alerts, and sharing with leads.'
      );
      return;
    }

    sound.playSystemClearance();
    setClosureFeedback(
      'Incident Closure Authorized: All 4 mandatory gates fulfilled. Post-mortem report published.'
    );

    const finalState = {
      ...chapter7State,
      selectedClosureConditions: selectedConditions,
      closureSubmitted: true,
      completed: true,
      closingChatShown: true,
    };
    const finalScore = computeChapter7Score(finalState);

    onUpdateState({
      selectedClosureConditions: selectedConditions,
      closureSubmitted: true,
      completed: true,
      closingChatShown: true,
      scorecard: finalScore,
    });

    if (onNotifyDesktop) {
      onNotifyDesktop(
        'Project Amigo — Incident #INC-2849 Closed & RCA Published.',
        'Hotfix verified, 12 branch officers logged in, and preventive memory alerting configured.'
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0712] text-slate-100 select-none overflow-hidden font-sans">
      {/* ── TOP NAV BAR (StackGen / Aiden AI Style) ── */}
      <div className="h-14 bg-[#140e20] border-b border-rose-900/60 px-5 flex items-center justify-between z-30 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-black tracking-tight text-white uppercase">
                INCIDENT RESPONSE & RCA STUDIO
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                ACTIVE SEV-1
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
              <span>Attendance Sync Microservice</span>
              <span>•</span>
              <span className="text-rose-400">Incident #INC-2849</span>
            </div>
          </div>
        </div>

        {/* SECTION TABS */}
        <div className="flex items-center bg-[#1c1228] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('immediate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'immediate'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px] font-mono">
              1
            </span>
            <span>Immediate Response</span>
            {chapter7State.immediateSubmitted && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 ml-1" />
            )}
          </button>

          <button
            onClick={() => {
              if (chapter7State.immediateSubmitted) setActiveTab('rca');
            }}
            disabled={!chapter7State.immediateSubmitted}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              !chapter7State.immediateSubmitted
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeTab === 'rca'
                ? 'bg-rose-600 text-white shadow-md cursor-pointer'
                : 'text-slate-400 hover:text-white cursor-pointer'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px] font-mono">
              2
            </span>
            <span>Build RCA</span>
            {chapter7State.rcaSubmitted && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 ml-1" />
            )}
          </button>

          <button
            onClick={() => {
              if (chapter7State.rcaSubmitted) setActiveTab('closure');
            }}
            disabled={!chapter7State.rcaSubmitted}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              !chapter7State.rcaSubmitted
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeTab === 'closure'
                ? 'bg-rose-600 text-white shadow-md cursor-pointer'
                : 'text-slate-400 hover:text-white cursor-pointer'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px] font-mono">
              3
            </span>
            <span>Incident Closure</span>
            {chapter7State.completed && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 ml-1" />
            )}
          </button>
        </div>

        {/* ACTION BUTTON */}
        <div className="flex items-center space-x-2">
          {onReturnToMeeting && (
            <button
              onClick={onReturnToMeeting}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Back to Teams Call
            </button>
          )}
          {chapter7State.completed && onOpenScorecard && (
            <button
              onClick={onOpenScorecard}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center space-x-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Scorecard</span>
            </button>
          )}
        </div>
      </div>

      {/* ── QUICK STATS & ACTIVE INCIDENT STRIP (Matching StackGen Mockup) ── */}
      <div className="bg-[#110b1a] border-b border-rose-900/50 px-6 py-2.5 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Active Incidents</span>
            <span className="text-sm font-bold text-rose-300">1 (Sev-1)</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Avg. Resolution Time</span>
            <span className="text-sm font-bold text-white">18 mins</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Impact Scope</span>
            <span className="text-sm font-bold text-rose-400">12 Branch Officers</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Hotfix PR #142</span>
            <span
              className={`text-sm font-bold ${
                chapter7State.immediateSubmitted ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {chapter7State.immediateSubmitted ? 'Deployed ✓' : 'Ready for Deploy'}
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* ========================================================= */}
        {/* ACTIVITY 1: CHOOSE THE IMMEDIATE RESPONSE                 */}
        {/* ========================================================= */}
        {activeTab === 'immediate' && (
          <div className="space-y-5 max-w-5xl mx-auto">
            {/* Header info */}
            <div className="bg-[#140e22] border border-rose-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                    ACTIVITY 1 — IMMEDIATE RESPONSE
                  </div>
                  <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">
                    Select the Actions to Address the Active Incident
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Twelve branch officers are currently locked out with 504 errors. Daniel has created hotfix PR #142.
                    What immediate actions must be taken to safely remediate this incident?
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">Section Weight</span>
                  <span className="text-xl font-mono font-bold text-rose-300">30 Points</span>
                </div>
              </div>
            </div>

            {/* Action Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {IMMEDIATE_ACTIONS.map((action) => {
                const isSelected = selectedActions.includes(action.id);
                return (
                  <div
                    key={action.id}
                    onClick={() => handleToggleAction(action.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30'
                        : 'bg-[#150f24] border-slate-800 hover:border-slate-700 hover:bg-[#181128]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-rose-400 bg-rose-500 text-white'
                          : 'border-slate-600 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white">{action.label}</div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {action.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Validation & Feedback */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleValidateImmediate}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center space-x-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute Immediate Response</span>
              </button>

              {chapter7State.immediateSubmitted && (
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('rca');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center space-x-2 shadow-lg"
                >
                  <span>Proceed to Activity 2: Build RCA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {actionFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border mt-3 text-xs leading-relaxed ${
                  chapter7State.immediateSubmitted
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="font-bold flex items-center space-x-2 mb-1">
                  {chapter7State.immediateSubmitted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Immediate Remediation Verified (+30 Points)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Action Review Required</span>
                    </>
                  )}
                </div>
                <div>{actionFeedback}</div>
              </motion.div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* ACTIVITY 2: BUILD THE ROOT CAUSE ANALYSIS (RCA)           */}
        {/* ========================================================= */}
        {activeTab === 'rca' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header info */}
            <div className="bg-[#140e22] border border-rose-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    ACTIVITY 2 — ROOT CAUSE ANALYSIS (RCA)
                  </div>
                  <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">
                    Build the Formal Post-Mortem RCA
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Aarav insisted: <em>"I don't want us closing this incident just because the hotfix works. We need to understand why it happened and document how we're preventing a recurrence."</em>
                    Complete the 4 sections of the formal post-mortem below.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">Section Weight</span>
                  <span className="text-xl font-mono font-bold text-amber-300">40 Points</span>
                </div>
              </div>
            </div>

            {/* The 4 RCA Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Slot 1: Incident (Prefilled per spec) */}
              <div className="bg-[#150f24] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                    Section 1: Incident Description
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                    Prefilled Verified
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#0d0916] border border-slate-800 text-xs font-bold text-white">
                  504 Gateway Timeouts in Attendance Sync Microservice
                </div>
                <p className="text-[11px] text-slate-400">
                  During morning check-in spikes, requests to /api/v1/attendance/sync timed out after 30 seconds.
                </p>
              </div>

              {/* Slot 2: Impact (Prefilled per spec) */}
              <div className="bg-[#150f24] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                    Section 2: Stakeholder Impact
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                    Prefilled Verified
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#0d0916] border border-slate-800 text-xs font-bold text-white">
                  12 Branch Officers Affected Across Retail Banking
                </div>
                <p className="text-[11px] text-slate-400">
                  Frontline staff were intermittently unable to clock in or sync biometric authentication data.
                </p>
              </div>

              {/* Slot 3: Root Cause (Interactive selection) */}
              <div className="bg-[#150f24] border border-amber-500/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                    Section 3: Root Cause Identification
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-amber-500/20 text-amber-300">
                    Action Required
                  </span>
                </div>

                <div className="space-y-2">
                  {RCA_BANK_ITEMS.filter((i) => i.category === 'root_cause').map((item) => {
                    const isSelected = rcaSlots.root_cause === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectRcaItem('root_cause', item.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-500/30'
                            : 'bg-[#0d0916] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-white">{item.text}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{item.details}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Slot 4: Preventive Action (Interactive selection) */}
              <div className="bg-[#150f24] border border-amber-500/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                    Section 4: Long-Term Preventive Action
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.2 rounded bg-amber-500/20 text-amber-300">
                    Action Required
                  </span>
                </div>

                <div className="space-y-2">
                  {RCA_BANK_ITEMS.filter((i) => i.category === 'preventive_action').map((item) => {
                    const isSelected = rcaSlots.preventive_action === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectRcaItem('preventive_action', item.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-500/30'
                            : 'bg-[#0d0916] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-white">{item.text}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{item.details}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Validation & Feedback */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleValidateRca}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center space-x-2"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Submit Root Cause Analysis</span>
              </button>

              {chapter7State.rcaSubmitted && (
                <button
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('closure');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center space-x-2 shadow-lg"
                >
                  <span>Proceed to Activity 3: Final Closure</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {rcaFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border mt-3 text-xs leading-relaxed ${
                  chapter7State.rcaSubmitted
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="font-bold flex items-center space-x-2 mb-1">
                  {chapter7State.rcaSubmitted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>RCA Document Verified (+40 Points)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>RCA Review Required</span>
                    </>
                  )}
                </div>
                <div>{rcaFeedback}</div>
              </motion.div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* ACTIVITY 3: FINAL INCIDENT CLOSURE                        */}
        {/* ========================================================= */}
        {activeTab === 'closure' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header info */}
            <div className="bg-[#140e22] border border-rose-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    ACTIVITY 3 — FINAL INCIDENT CLOSURE GATES
                  </div>
                  <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">
                    Establish Mandatory Incident Closure Conditions
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    A production incident is only resolved when both the immediate problem is verified and recurrence is prevented.
                    Select the required conditions to formally close Incident #INC-2849.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">Section Weight</span>
                  <span className="text-xl font-mono font-bold text-emerald-300">30 Points</span>
                </div>
              </div>
            </div>

            {/* Closure Conditions Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {CLOSURE_CONDITIONS.map((cond) => {
                const isSelected = selectedConditions.includes(cond.id);
                return (
                  <div
                    key={cond.id}
                    onClick={() => handleToggleCondition(cond.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'bg-[#150f24] border-slate-800 hover:border-slate-700 hover:bg-[#181128]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                          : 'border-slate-600 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white">{cond.label}</div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {cond.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit & Closure Resolution */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleSubmitClosure}
                disabled={chapter7State.completed}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
                  chapter7State.completed
                    ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer shadow-lg'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {chapter7State.completed ? 'Incident Formally Resolved ✓' : 'Submit Final Incident Report'}
                </span>
              </button>

              {chapter7State.completed && onOpenScorecard && (
                <button
                  onClick={onOpenScorecard}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center space-x-2"
                >
                  <span>View Chapter 7 Scorecard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {closureFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border mt-3 text-xs leading-relaxed ${
                  chapter7State.completed
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="font-bold flex items-center space-x-2 mb-1">
                  {chapter7State.completed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Incident Resolved & RCA Documented (+30 Points)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Review Closure Conditions</span>
                    </>
                  )}
                </div>
                <div>{closureFeedback}</div>
              </motion.div>
            )}

            {/* Scene 7.4: Resolution Messages (Appears when completed) */}
            {chapter7State.completed && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#120a1c] border border-emerald-500/60 rounded-2xl p-5 space-y-3.5 shadow-2xl"
              >
                <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      Scene 7.4 — Incident Resolution & Stakeholder Confirmation
                    </div>
                    <div className="text-xs text-emerald-300 font-medium">
                      Hotfix verified, 12 branch officers logged in, and preventive memory alerting live.
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#180f24] border border-slate-800">
                    <span className="font-bold text-cyan-400 font-mono">[Daniel Kapoor — Lead Developer]: </span>
                    "The hotfix PR #142 has been deployed to the Attendance Sync microservice. Container memory has normalized at 210MB and connection socket leaks are eliminated."
                  </div>

                  <div className="p-3 rounded-xl bg-[#180f24] border border-slate-800">
                    <span className="font-bold text-rose-400 font-mono">[Martha — Regional Branch Operations]: </span>
                    "Confirmed! All 12 branch officers across the affected retail branches are logged in and clocking attendance without 504 timeouts."
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200">
                    <span className="font-bold text-amber-400 font-mono">[Aarav — Delivery Partner]: </span>
                    "Good recovery. More importantly, we've documented the underlying issue and put preventive monitoring in place. That's how we make sure the same incident doesn't become tomorrow's problem."
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
