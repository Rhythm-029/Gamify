import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  FileCheck2,
  FileText,
  GripVertical,
  HelpCircle,
  Layers,
  RotateCcw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import type {
  Chapter7State,
  Activity1CardId,
  PreventionActionId,
  RcaFieldId,
} from '../../types/chapter7';
import {
  INCIDENT_ID,
  INCIDENT_SEVERITY,
  INCIDENT_SERVICE,
  INCIDENT_ERROR,
  INCIDENT_USERS_AFFECTED,
  ACTIVITY_1_CARDS,
  RCA_FIELDS,
  PREVENTION_ACTION_CARDS,
  APPROPRIATE_PREVENTION_IDS,
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
  // Active stage tab: 'immediate' | 'rca' | 'prevention' | 'resolved'
  const [activeTab, setActiveTab] = useState<'immediate' | 'rca' | 'prevention' | 'resolved'>(() => {
    if (chapter7State.incidentStatus === 'resolved' || chapter7State.completed) return 'resolved';
    if (chapter7State.activity2Completed) return 'prevention';
    if (chapter7State.activity1Completed) return 'rca';
    return chapter7State.activeTab || 'immediate';
  });

  // ─────────────────────────────────────────────────────────────
  // ACTIVITY 1: RESTORE SERVICE (Sequence Ordering)
  // ─────────────────────────────────────────────────────────────
  const [act1Order, setAct1Order] = useState<Activity1CardId[]>(() => {
    if (chapter7State.activity1Order && chapter7State.activity1Order.length === 4) {
      return chapter7State.activity1Order;
    }
    // Initial shuffled state
    return ['verify_access', 'close_prematurely', 'confirm_scope', 'deploy_hotfix'];
  });
  const [act1Feedback, setAct1Feedback] = useState<string | null>(chapter7State.activity1Feedback);
  const [act1DraggedIdx, setAct1DraggedIdx] = useState<number | null>(null);

  // Move card up or down
  const handleMoveAct1Card = (index: number, direction: 'up' | 'down') => {
    sound.playClick();
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= act1Order.length) return;
    const newOrder = [...act1Order];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(newIndex, 0, moved);
    setAct1Order(newOrder);
    setAct1Feedback(null);
  };

  // Drag and Drop handlers for Activity 1
  const handleAct1DragStart = (e: React.DragEvent, index: number) => {
    setAct1DraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleAct1Drop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (act1DraggedIdx === null || act1DraggedIdx === targetIndex) {
      setAct1DraggedIdx(null);
      return;
    }
    sound.playClick();
    const newOrder = [...act1Order];
    const [moved] = newOrder.splice(act1DraggedIdx, 1);
    newOrder.splice(targetIndex, 0, moved);
    setAct1Order(newOrder);
    setAct1DraggedIdx(null);
    setAct1Feedback(null);
  };

  const handleSubmitActivity1 = () => {
    sound.playClick();
    const attempts = (chapter7State.activity1Attempts || 0) + 1;
    const scopeIdx = act1Order.indexOf('confirm_scope');
    const hotfixIdx = act1Order.indexOf('deploy_hotfix');
    const verifyIdx = act1Order.indexOf('verify_access');
    const closeIdx = act1Order.indexOf('close_prematurely');

    // Rule 1: Confirm scope must precede hotfix deployment
    if (scopeIdx > hotfixIdx) {
      sound.playClick();
      const fb = 'Always confirm the affected service, error symptoms, and user blast radius before deploying changes into production.';
      setAct1Feedback(fb);
      onUpdateState({
        activity1Attempts: attempts,
        activity1Order: act1Order,
        activity1Feedback: fb,
        activity1FirstOrder: chapter7State.activity1FirstOrder || act1Order,
      });
      return;
    }

    // Rule 2: Premature closure trap (Card D before Card C)
    if (closeIdx < verifyIdx) {
      sound.playClick();
      const fb = 'Deploying a patch does not automatically confirm recovery. The affected service and user access must be verified before the incident can be closed.';
      setAct1Feedback(fb);
      onUpdateState({
        activity1Attempts: attempts,
        activity1Order: act1Order,
        activity1Feedback: fb,
        activity1FirstOrder: chapter7State.activity1FirstOrder || act1Order,
      });
      return;
    }

    // Rule 3: Hotfix must precede verification
    if (hotfixIdx > verifyIdx) {
      sound.playClick();
      const fb = 'You cannot verify service recovery before the hotfix addressing the memory leak has been deployed.';
      setAct1Feedback(fb);
      onUpdateState({
        activity1Attempts: attempts,
        activity1Order: act1Order,
        activity1Feedback: fb,
        activity1FirstOrder: chapter7State.activity1FirstOrder || act1Order,
      });
      return;
    }

    // Correct sequence validated: [confirm_scope, deploy_hotfix, verify_access, close_prematurely]
    sound.playSystemClearance();
    const fb = 'Service recovery sequence validated. The incident is not closed until recovery has been verified.';
    setAct1Feedback(fb);

    onUpdateState((prev) => ({
      ...prev,
      activity1Attempts: attempts,
      activity1Order: act1Order,
      activity1Submitted: true,
      activity1Completed: true,
      activity1Feedback: fb,
      activity1FirstOrder: prev.activity1FirstOrder || act1Order,
      incidentStatus: 'restoring',
    }));

    // Unlock and advance to Activity 2 after a brief celebration pause
    setTimeout(() => {
      setActiveTab('rca');
    }, 1200);
  };

  // ─────────────────────────────────────────────────────────────
  // ACTIVITY 2: BUILD THE ROOT CAUSE ANALYSIS (RCA)
  // ─────────────────────────────────────────────────────────────
  const [rcaAnswers, setRcaAnswers] = useState<{
    incident: string | null;
    rootCause: string | null;
    impact: string | null;
    prevention: string | null;
  }>(chapter7State.activity2Answers || { incident: null, rootCause: null, impact: null, prevention: null });

  const [rcaFeedback, setRcaFeedback] = useState<{
    incident?: { isCorrect: boolean; message: string };
    rootCause?: { isCorrect: boolean; message: string };
    impact?: { isCorrect: boolean; message: string };
    prevention?: { isCorrect: boolean; message: string };
    summary?: string;
  } | null>(chapter7State.activity2Feedback);

  const handleSelectRcaOption = (fieldId: RcaFieldId, optionId: string) => {
    sound.playClick();
    setRcaAnswers((prev) => ({
      ...prev,
      [fieldId]: optionId,
    }));
    setRcaFeedback(null);
  };

  const isRcaReadyToSubmit =
    Boolean(rcaAnswers.incident && rcaAnswers.rootCause && rcaAnswers.impact && rcaAnswers.prevention);

  const handleSubmitActivity2 = () => {
    sound.playClick();
    const attempts = (chapter7State.activity2Attempts || 0) + 1;
    const isIncCorrect = rcaAnswers.incident === 'inc_opt_a';
    const isRcCorrect = rcaAnswers.rootCause === 'rc_opt_a';
    const isImpCorrect = rcaAnswers.impact === 'imp_opt_a';
    const isPrevCorrect = rcaAnswers.prevention === 'prev_opt_a';

    const feedbackObj: {
      incident: { isCorrect: boolean; message: string };
      rootCause: { isCorrect: boolean; message: string };
      impact: { isCorrect: boolean; message: string };
      prevention: { isCorrect: boolean; message: string };
      summary: string;
    } = {
      incident: {
        isCorrect: isIncCorrect,
        message: isIncCorrect
          ? 'Accurate: Intermittent 504 Gateway Timeouts identified in Attendance Sync.'
          : 'Incorrect incident symptom: Review operational logs. The failure produced 504 errors in Attendance Sync.',
      },
      rootCause: {
        isCorrect: isRcCorrect,
        message: isRcCorrect
          ? 'Accurate: Unchecked memory growth causing container saturation identified as root cause.'
          : 'Incorrect root cause: APM telemetry clearly showed container heap memory increasing over time to saturation.',
      },
      impact: {
        isCorrect: isImpCorrect,
        message: isImpCorrect
          ? 'Accurate: Scope confirmed at 12 branch officers experiencing login / sync issues.'
          : 'The incident was limited to 12 branch officers. Do not describe it as a complete HRMS outage or internal bug.',
      },
      prevention: {
        isCorrect: isPrevCorrect,
        message: isPrevCorrect
          ? 'Accurate: Proactive observability, thresholds, regression tests, and health checks captured.'
          : 'Shortcuts like disabling features or ignoring monitoring will not prevent recurrence.',
      },
      summary: '',
    };

    const allCorrect = isIncCorrect && isRcCorrect && isImpCorrect && isPrevCorrect;

    if (allCorrect) {
      sound.playSystemClearance();
      feedbackObj.summary = 'RCA validated. The failure, root cause, business impact, and corrective response are clearly connected.';
      setRcaFeedback(feedbackObj);

      onUpdateState((prev) => ({
        ...prev,
        activity2Answers: rcaAnswers,
        activity2Attempts: attempts,
        activity2Submitted: true,
        activity2Completed: true,
        activity2Feedback: feedbackObj,
        activity2FirstAnswers: prev.activity2FirstAnswers || rcaAnswers,
        incidentStatus: 'rca_in_progress',
      }));

      // Unlock and advance to Activity 3
      setTimeout(() => {
        setActiveTab('prevention');
      }, 1200);
    } else {
      sound.playClick();
      feedbackObj.summary = 'Some elements of your RCA need revision. Review the highlighted mismatches and update your findings.';
      setRcaFeedback(feedbackObj);

      onUpdateState((prev) => ({
        ...prev,
        activity2Answers: rcaAnswers,
        activity2Attempts: attempts,
        activity2Feedback: feedbackObj,
        activity2FirstAnswers: prev.activity2FirstAnswers || rcaAnswers,
      }));
    }
  };

  // ─────────────────────────────────────────────────────────────
  // ACTIVITY 3: PREVENT RECURRENCE (Selection & Prioritisation)
  // ─────────────────────────────────────────────────────────────
  const [selectedPrevention, setSelectedPrevention] = useState<PreventionActionId[]>(
    chapter7State.activity3Selected || []
  );
  const [priorityOrder, setPriorityOrder] = useState<PreventionActionId[]>(
    chapter7State.activity3PriorityOrder || []
  );
  const [act3Feedback, setAct3Feedback] = useState<string | null>(chapter7State.activity3Feedback);
  const [act3DraggedIdx, setAct3DraggedIdx] = useState<number | null>(null);

  const handleTogglePreventionSelection = (id: PreventionActionId) => {
    sound.playClick();
    setAct3Feedback(null);
    if (selectedPrevention.includes(id)) {
      const nextSelected = selectedPrevention.filter((item) => item !== id);
      setSelectedPrevention(nextSelected);
      setPriorityOrder((prev) => prev.filter((item) => item !== id));
    } else {
      if (selectedPrevention.length >= 4) {
        sound.playClick();
        setAct3Feedback('You can select a maximum of 4 preventive controls for this plan.');
        return;
      }
      const nextSelected = [...selectedPrevention, id];
      setSelectedPrevention(nextSelected);
      setPriorityOrder((prev) => [...prev, id]);
    }
  };

  const handleMovePriorityItem = (index: number, direction: 'up' | 'down') => {
    sound.playClick();
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= priorityOrder.length) return;
    const newOrder = [...priorityOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(newIndex, 0, moved);
    setPriorityOrder(newOrder);
    setAct3Feedback(null);
  };

  const handlePriorityDragStart = (e: React.DragEvent, index: number) => {
    setAct3DraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handlePriorityDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (act3DraggedIdx === null || act3DraggedIdx === targetIndex) {
      setAct3DraggedIdx(null);
      return;
    }
    sound.playClick();
    const newOrder = [...priorityOrder];
    const [moved] = newOrder.splice(act3DraggedIdx, 1);
    newOrder.splice(targetIndex, 0, moved);
    setPriorityOrder(newOrder);
    setAct3DraggedIdx(null);
    setAct3Feedback(null);
  };

  const handleSubmitActivity3 = () => {
    sound.playClick();
    const attempts = (chapter7State.activity3Attempts || 0) + 1;

    if (selectedPrevention.length !== 4) {
      sound.playClick();
      setAct3Feedback('Please select exactly 4 appropriate preventive measures to include in the plan.');
      return;
    }

    // Check for inappropriate actions
    if (selectedPrevention.includes('increase_number_of_servers')) {
      sound.playClick();
      const fb = 'Adding servers may temporarily increase capacity, but it does not fix the underlying memory leak.';
      setAct3Feedback(fb);
      onUpdateState({
        activity3Attempts: attempts,
        activity3Selected: selectedPrevention,
        activity3PriorityOrder: priorityOrder,
        activity3Feedback: fb,
      });
      return;
    }

    if (selectedPrevention.includes('ignore_monitoring_hotfix')) {
      sound.playClick();
      const fb = 'Assuming the issue is permanently resolved without ongoing monitoring leaves the service vulnerable to regressions.';
      setAct3Feedback(fb);
      onUpdateState({
        activity3Attempts: attempts,
        activity3Selected: selectedPrevention,
        activity3PriorityOrder: priorityOrder,
        activity3Feedback: fb,
      });
      return;
    }

    // All 4 appropriate controls are selected!
    sound.playSystemClearance();
    const fb = 'Prevention plan validated. The proposed controls improve early detection, testing, and ongoing service health.';
    setAct3Feedback(fb);

    // Compute updated state and full scorecard
    onUpdateState((prev) => {
      const updated: Chapter7State = {
        ...prev,
        activity3Selected: selectedPrevention,
        activity3PriorityOrder: priorityOrder,
        activity3Attempts: attempts,
        activity3Submitted: true,
        activity3Completed: true,
        activity3Feedback: fb,
        activity3FirstSelected: prev.activity3FirstSelected || selectedPrevention,
        activity3FirstPriorityOrder: prev.activity3FirstPriorityOrder || priorityOrder,
        incidentStatus: 'prevention_planned',
      };
      const finalScorecard = computeChapter7Score(updated);
      return {
        ...updated,
        scorecard: finalScorecard,
      };
    });

    // Advance to final resolution sequence after brief pause
    setTimeout(() => {
      setActiveTab('resolved');
      triggerResolutionDialogue();
    }, 1200);
  };

  // ─────────────────────────────────────────────────────────────
  // RESOLUTION SEQUENCE (Daniel -> Martha -> Aarav)
  // ─────────────────────────────────────────────────────────────
  const [resolutionStep, setResolutionStep] = useState<number>(() => {
    if (chapter7State.completed || chapter7State.incidentStatus === 'resolved') return 3;
    return 0;
  });

  const triggerResolutionDialogue = () => {
    setResolutionStep(1);
    sound.playMessagePing();
    if (onNotifyDesktop) {
      onNotifyDesktop('Daniel Brooks', 'The hotfix is deployed. Memory utilisation is stable, and branch access is verified.');
    }

    setTimeout(() => {
      setResolutionStep(2);
      sound.playMessagePing();
      if (onNotifyDesktop) {
        onNotifyDesktop('Martha Vance', 'Monitoring thresholds updated. Incident report ready for engineering review.');
      }

      setTimeout(() => {
        setResolutionStep(3);
        sound.playSystemClearance();
        if (onNotifyDesktop) {
          onNotifyDesktop('Aarav Kapoor', 'Incident INC-0241 resolved. Ready for final post-mortem scorecard.');
        }

        onUpdateState((prev) => {
          const finalScorecard = computeChapter7Score({
            ...prev,
            incidentStatus: 'resolved',
            completed: true,
          });
          return {
            ...prev,
            incidentStatus: 'resolved',
            danielHotfixConfirmed: true,
            marthaMonitoringConfirmed: true,
            aaravClosingConfirmed: true,
            completed: true,
            scorecard: finalScorecard,
          };
        });
      }, 3500);
    }, 3500);
  };

  const isResolved = chapter7State.incidentStatus === 'resolved' || resolutionStep === 3;

  return (
    <div className="flex flex-col h-full bg-[#0a0710] text-slate-100 select-none overflow-hidden font-sans">
      {/* ── TOP HEADER ── */}
      <div className="h-14 bg-[#140c1d] border-b border-rose-900/60 px-5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-orange-600 to-amber-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide text-white uppercase">
                INCIDENT RESPONSE STUDIO
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                &lt;{INCIDENT_SEVERITY}&gt; Production Incident
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-mono font-semibold">
              {INCIDENT_ID} — Attendance Sync Failure
            </div>
          </div>
        </div>

        {/* Action Controls / Navigation */}
        <div className="flex items-center space-x-2">
          {onReturnToMeeting && (
            <button
              onClick={onReturnToMeeting}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>Back to Bridge</span>
            </button>
          )}

          {isResolved && onOpenScorecard && (
            <button
              onClick={onOpenScorecard}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:opacity-95 text-white text-xs font-extrabold flex items-center space-x-1.5 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer border border-emerald-400/40 animate-pulse"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>View RCA & Incident Scorecard</span>
            </button>
          )}
        </div>
      </div>

      {/* ── FOUR KEY INFORMATION CARDS ── */}
      <div className="px-5 py-3 bg-[#0e0817] border-b border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="bg-[#170e24] border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Affected Users</div>
            <div className="text-base font-bold text-white font-mono mt-0.5">{INCIDENT_USERS_AFFECTED} Branch Officers</div>
          </div>
          <Users className="w-4 h-4 text-rose-400" />
        </div>

        <div className="bg-[#170e24] border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Error</div>
            <div className="text-base font-bold text-rose-300 font-mono mt-0.5">{INCIDENT_ERROR}</div>
          </div>
          <AlertCircle className="w-4 h-4 text-amber-400" />
        </div>

        <div className="bg-[#170e24] border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Service</div>
            <div className="text-base font-bold text-sky-300 font-mono mt-0.5">{INCIDENT_SERVICE}</div>
          </div>
          <Cpu className="w-4 h-4 text-sky-400" />
        </div>

        <div className="bg-[#170e24] border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Status</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isResolved ? 'bg-emerald-400 animate-ping' : 'bg-rose-400 animate-pulse'
                }`}
              />
              <span
                className={`text-base font-extrabold font-mono uppercase ${
                  isResolved ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isResolved ? 'Resolved' : 'Investigating'}
              </span>
            </div>
          </div>
          <ShieldAlert className={`w-4 h-4 ${isResolved ? 'text-emerald-400' : 'text-rose-400'}`} />
        </div>
      </div>

      {/* ── THREE-STAGE PROGRESS INDICATOR ── */}
      <div className="px-5 py-2.5 bg-[#120a1f] border-b border-slate-800/80 flex items-center justify-between shrink-0 overflow-x-auto">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Stage 1 */}
          <button
            onClick={() => setActiveTab('immediate')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'immediate'
                ? 'bg-rose-500/25 text-rose-200 border border-rose-500/50 shadow-sm'
                : chapter7State.activity1Completed
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                chapter7State.activity1Completed
                  ? 'bg-emerald-500 text-white'
                  : activeTab === 'immediate'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {chapter7State.activity1Completed ? '✓' : '1'}
            </span>
            <span>1. Restore Service</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          {/* Stage 2 */}
          <button
            onClick={() => {
              if (chapter7State.activity1Completed) setActiveTab('rca');
            }}
            disabled={!chapter7State.activity1Completed}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !chapter7State.activity1Completed
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeTab === 'rca'
                ? 'bg-rose-500/25 text-rose-200 border border-rose-500/50 shadow-sm cursor-pointer'
                : chapter7State.activity2Completed
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 cursor-pointer'
                : 'text-slate-400 hover:text-slate-200 cursor-pointer'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                chapter7State.activity2Completed
                  ? 'bg-emerald-500 text-white'
                  : activeTab === 'rca'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {chapter7State.activity2Completed ? '✓' : '2'}
            </span>
            <span>2. Build RCA</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          {/* Stage 3 */}
          <button
            onClick={() => {
              if (chapter7State.activity2Completed) setActiveTab('prevention');
            }}
            disabled={!chapter7State.activity2Completed}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !chapter7State.activity2Completed
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeTab === 'prevention'
                ? 'bg-rose-500/25 text-rose-200 border border-rose-500/50 shadow-sm cursor-pointer'
                : chapter7State.activity3Completed
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 cursor-pointer'
                : 'text-slate-400 hover:text-slate-200 cursor-pointer'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                chapter7State.activity3Completed
                  ? 'bg-emerald-500 text-white'
                  : activeTab === 'prevention'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {chapter7State.activity3Completed ? '✓' : '3'}
            </span>
            <span>3. Prevent Recurrence</span>
          </button>
        </div>

        {isResolved && (
          <button
            onClick={() => setActiveTab('resolved')}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Incident Log & Resolutions</span>
          </button>
        )}
      </div>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-[#0e0817] to-[#07040d]">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ─────────────────────────────────────────────────────────────
              TAB 1: ACTIVITY 1 — RESTORE SERVICE
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'immediate' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Objective Banner */}
              <div className="bg-[#160d24] border border-rose-500/40 rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                      Activity 1 — Restore Service
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                      Before investigating long-term prevention, ensure that the affected service is safely restored and verified.
                    </p>
                    <div className="text-[11px] text-slate-400 font-mono mt-2">
                      Arrange the four immediate incident-response actions in the correct execution order (1 to 4). Use drag-and-drop or the arrow buttons.
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Cards List (Ordered) */}
              <div className="space-y-3">
                {act1Order.map((cardId, index) => {
                  const card = ACTIVITY_1_CARDS.find((c) => c.id === cardId)!;
                  return (
                    <motion.div
                      key={card.id}
                      layout
                      draggable
                      onDragStart={(e) => handleAct1DragStart(e as unknown as React.DragEvent, index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleAct1Drop(e as unknown as React.DragEvent, index)}
                      className={`p-4 rounded-2xl border transition-all flex items-start space-x-3.5 relative ${
                        act1DraggedIdx === index
                          ? 'opacity-40 border-dashed border-rose-400 bg-rose-950/20'
                          : 'bg-[#150e22] hover:bg-[#1b122c] border-slate-800 hover:border-rose-500/40 shadow-md'
                      }`}
                    >
                      {/* Drag Handle & Position Indicator */}
                      <div className="flex flex-col items-center space-y-1 shrink-0 pt-0.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center font-mono font-bold text-xs text-rose-300 shadow-inner">
                          #{index + 1}
                        </div>
                        <GripVertical className="w-4 h-4 text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-400" />
                      </div>

                      {/* Card Content */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Card {card.letter}
                          </span>
                          <h3 className="text-sm font-bold text-white tracking-tight">
                            {card.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {card.description}
                        </p>
                      </div>

                      {/* Accessible Up / Down Position Buttons */}
                      <div className="flex flex-col space-y-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveAct1Card(index, 'up')}
                          disabled={index === 0}
                          aria-label={`Move Card ${card.letter} up`}
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                            index === 0
                              ? 'opacity-25 border-slate-800 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-rose-400 cursor-pointer'
                          }`}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveAct1Card(index, 'down')}
                          disabled={index === act1Order.length - 1}
                          aria-label={`Move Card ${card.letter} down`}
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                            index === act1Order.length - 1
                              ? 'opacity-25 border-slate-800 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-rose-400 cursor-pointer'
                          }`}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Feedback Alert if any */}
              {act1Feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${
                    chapter7State.activity1Completed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  }`}
                >
                  {chapter7State.activity1Completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="leading-relaxed">
                    <span className="font-bold block text-white mb-0.5">
                      {chapter7State.activity1Completed ? 'Sequence Validated' : 'Sequence Order Feedback'}
                    </span>
                    {act1Feedback}
                  </div>
                </motion.div>
              )}

              {/* Submit Sequence Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-400 font-mono">
                  Attempts: <span className="font-bold text-slate-200">{chapter7State.activity1Attempts || 0}</span>
                </div>

                <div className="flex items-center space-x-3">
                  {chapter7State.activity1Completed && (
                    <button
                      onClick={() => setActiveTab('rca')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Continue to RCA</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={handleSubmitActivity1}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:opacity-95 text-white font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(244,63,94,0.35)] flex items-center space-x-2 cursor-pointer border border-rose-400/40"
                  >
                    <span>Submit Sequence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: ACTIVITY 2 — BUILD THE ROOT CAUSE ANALYSIS (RCA)
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'rca' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Objective Banner */}
              <div className="bg-[#160d24] border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                      Activity 2 — Build the RCA
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                      A service recovery is only one part of incident management. Document what happened, why it happened, who was affected, and what must change.
                    </p>
                    <div className="text-[11px] text-slate-400 font-mono mt-2">
                      Complete all four structured post-mortem fields. Select the correct finding for each field.
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Compact Fields */}
              <div className="space-y-5">
                {RCA_FIELDS.map((field, fieldIdx) => {
                  const selectedOptId = rcaAnswers[field.id];
                  const fieldFeedback = rcaFeedback ? rcaFeedback[field.id] : null;

                  return (
                    <div
                      key={field.id}
                      className="bg-[#140e21] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              Field {fieldIdx + 1} · {field.id.toUpperCase()}
                            </span>
                            {selectedOptId && (
                              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                                <Check className="w-3 h-3" /> Answered
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-white mt-1.5 tracking-tight">
                            {field.question}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">{field.subtitle}</p>
                        </div>
                      </div>

                      {/* Options List */}
                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {field.options.map((opt) => {
                          const isSelected = selectedOptId === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectRcaOption(field.id, opt.id)}
                              className={`p-3 rounded-xl border text-left transition-all flex items-start space-x-3 cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/40'
                                  : 'bg-[#100a1b] hover:bg-[#180f27] border-slate-800 text-slate-300'
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-amber-500 text-slate-950 font-black'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {opt.letter}
                              </div>
                              <div className="flex-1 text-xs leading-relaxed mt-0.5">
                                {opt.text}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Field-level Feedback if submitted */}
                      {fieldFeedback && (
                        <div
                          className={`p-2.5 rounded-xl border text-xs leading-relaxed flex items-start space-x-2 ${
                            fieldFeedback.isCorrect
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                              : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                          }`}
                        >
                          {fieldFeedback.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <span>{fieldFeedback.message}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* RCA Summary Feedback */}
              {rcaFeedback && rcaFeedback.summary && (
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start space-x-3 ${
                    chapter7State.activity2Completed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block mb-0.5">RCA Submission Status</span>
                    {rcaFeedback.summary}
                  </div>
                </div>
              )}

              {/* Submit RCA Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-400 font-mono">
                  Completed:{' '}
                  <span className="font-bold text-slate-200">
                    {[rcaAnswers.incident, rcaAnswers.rootCause, rcaAnswers.impact, rcaAnswers.prevention].filter(Boolean).length} / 4
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {chapter7State.activity2Completed && (
                    <button
                      onClick={() => setActiveTab('prevention')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Continue to Prevention</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={handleSubmitActivity2}
                    disabled={!isRcaReadyToSubmit}
                    className={`px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center space-x-2 border ${
                      isRcaReadyToSubmit
                        ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:opacity-95 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)] cursor-pointer border-amber-400/40'
                        : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Submit RCA</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3: ACTIVITY 3 — PREVENT RECURRENCE
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'prevention' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Objective Banner */}
              <div className="bg-[#160d24] border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                      Activity 3 — Prevent Recurrence
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                      The immediate issue is being addressed. Now decide which controls the team should prioritise to prevent another memory-related outage.
                    </p>
                    <div className="text-[11px] text-slate-400 font-mono mt-2">
                      Select the 4 useful preventive measures (exclude capacity-based workarounds). Then organise them into your preferred priority order.
                    </div>
                  </div>
                </div>
              </div>

              {/* Selection Bank (All 6 Cards) */}
              <div className="space-y-2.5">
                <div className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
                  <span>Available Preventive Measures (Select 4)</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedPrevention.length} / 4 Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PREVENTION_ACTION_CARDS.map((card) => {
                    const isSelected = selectedPrevention.includes(card.id);
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => handleTogglePreventionSelection(card.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-start space-x-3 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/30 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/30'
                            : 'bg-[#140e21] hover:bg-[#1b122c] border-slate-800 text-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950'
                              : 'border border-slate-700 bg-slate-900 text-transparent'
                          }`}
                        >
                          ✓
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white tracking-tight">
                            {card.title}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {card.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Ordering Section (Shown once cards are selected) */}
              {selectedPrevention.length > 0 && (
                <div className="bg-[#140e21] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-mono uppercase text-emerald-400 font-bold">
                        Priority Order of Selected Controls (1 = Highest Priority)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Drag to reorder or use the arrow buttons to position higher-priority controls at the top.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {priorityOrder.map((cardId, index) => {
                      const card = PREVENTION_ACTION_CARDS.find((c) => c.id === cardId)!;
                      return (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={(e) => handlePriorityDragStart(e as unknown as React.DragEvent, index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handlePriorityDrop(e as unknown as React.DragEvent, index)}
                          className="p-3 rounded-xl bg-[#0f0a1a] border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between space-x-3 transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-xs">
                              #{index + 1}
                            </div>
                            <GripVertical className="w-4 h-4 text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-400" />
                            <span className="text-xs font-bold text-white">{card.title}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleMovePriorityItem(index, 'up')}
                              disabled={index === 0}
                              aria-label={`Move ${card.title} up`}
                              className={`w-6 h-6 rounded border flex items-center justify-center ${
                                index === 0
                                  ? 'opacity-20 border-slate-800 text-slate-600 cursor-not-allowed'
                                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white cursor-pointer'
                              }`}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMovePriorityItem(index, 'down')}
                              disabled={index === priorityOrder.length - 1}
                              aria-label={`Move ${card.title} down`}
                              className={`w-6 h-6 rounded border flex items-center justify-center ${
                                index === priorityOrder.length - 1
                                  ? 'opacity-20 border-slate-800 text-slate-600 cursor-not-allowed'
                                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white cursor-pointer'
                              }`}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Feedback Alert */}
              {act3Feedback && (
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start space-x-3 ${
                    chapter7State.activity3Completed
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  }`}
                >
                  {chapter7State.activity3Completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold text-white block mb-0.5">
                      {chapter7State.activity3Completed ? 'Prevention Plan Validated' : 'Prevention Plan Feedback'}
                    </span>
                    {act3Feedback}
                  </div>
                </div>
              )}

              {/* Submit Prevention Plan Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-400 font-mono">
                  Selected Measures:{' '}
                  <span className="font-bold text-slate-200">{selectedPrevention.length} / 4</span>
                </div>

                <button
                  onClick={handleSubmitActivity3}
                  disabled={selectedPrevention.length !== 4}
                  className={`px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center space-x-2 border ${
                    selectedPrevention.length === 4
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-95 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer border-emerald-400/40'
                      : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Submit Prevention Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 4: INCIDENT RESOLVED & CLOSING CONFIRMATIONS
             ───────────────────────────────────────────────────────────── */}
          {activeTab === 'resolved' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Resolved Hero Card */}
              <div className="bg-[#101b17] border border-emerald-500/50 rounded-2xl p-5 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                          INCIDENT RESOLVED
                        </span>
                        <span className="text-xs font-mono text-slate-300">
                          INC-0241 — Attendance Sync Failure
                        </span>
                      </div>
                      <h2 className="text-lg font-black text-white mt-1">
                        Service Recovery & RCA Finalised
                      </h2>
                      <p className="text-xs text-emerald-200/90 mt-1">
                        Daniel's hotfix has restored container memory stability. Frontline user logins have been verified by Martha, and Aarav has signed off on the formal RCA and preventive alert plan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dashboard Summary Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-emerald-900/40 text-xs font-mono">
                  <div className="bg-[#0b1411] p-2.5 rounded-xl border border-emerald-900/60">
                    <span className="text-[10px] text-slate-400 block font-sans">Recovery</span>
                    <span className="text-emerald-400 font-bold">Verified</span>
                  </div>
                  <div className="bg-[#0b1411] p-2.5 rounded-xl border border-emerald-900/60">
                    <span className="text-[10px] text-slate-400 block font-sans">RCA</span>
                    <span className="text-emerald-400 font-bold">Completed</span>
                  </div>
                  <div className="bg-[#0b1411] p-2.5 rounded-xl border border-emerald-900/60">
                    <span className="text-[10px] text-slate-400 block font-sans">Prevention Plan</span>
                    <span className="text-emerald-400 font-bold">Submitted</span>
                  </div>
                  <div className="bg-[#0b1411] p-2.5 rounded-xl border border-emerald-900/60">
                    <span className="text-[10px] text-slate-400 block font-sans">Status</span>
                    <span className="text-emerald-300 font-bold">Resolved</span>
                  </div>
                </div>
              </div>

              {/* Three Stakeholder Live Confirmations */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase text-slate-400 font-bold">
                  Live Resolution Confirmations
                </div>

                {/* Daniel */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#140e21] border border-slate-800 rounded-xl p-3.5 flex items-start space-x-3"
                >
                  <img
                    src="/character/Daniel_Brooks/DanielDP.png"
                    alt="Daniel"
                    className="w-9 h-9 rounded-full border border-sky-400/40 object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">Daniel Brooks</span>
                      <span className="text-[10px] font-mono text-sky-400">Lead Developer</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      “The hotfix is deployed. Memory utilisation is stable, and the affected branches have successfully resumed attendance synchronisation.”
                    </p>
                  </div>
                </motion.div>

                {/* Martha */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-[#140e21] border border-slate-800 rounded-xl p-3.5 flex items-start space-x-3"
                >
                  <img
                    src="/character/Emma_Carter/EmmaDP.png"
                    alt="Martha"
                    className="w-9 h-9 rounded-full border border-rose-400/40 object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">Martha Vance</span>
                      <span className="text-[10px] font-mono text-rose-400">Regional Branch Operations</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      “I've updated the monitoring thresholds, and the incident report is ready for engineering review.”
                    </p>
                  </div>
                </motion.div>

                {/* Aarav */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-[#140e21] border border-slate-800 rounded-xl p-3.5 flex items-start space-x-3"
                >
                  <img
                    src="/character/AaravDP.png"
                    alt="Aarav"
                    className="w-9 h-9 rounded-full border border-amber-400/40 object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">Aarav Kapoor</span>
                      <span className="text-[10px] font-mono text-amber-400">Project Manager</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      “Good work. The immediate issue is resolved, and we now have a documented corrective action. Let's make sure the same issue doesn't come back.”
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* View Scorecard Button */}
              {onOpenScorecard && (
                <div className="pt-2 text-center">
                  <button
                    onClick={onOpenScorecard}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-95 text-white font-black text-sm tracking-wide shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer border border-emerald-400/50 inline-flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>View RCA & Incident Scorecard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
