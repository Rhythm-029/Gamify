import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import type {
  Chapter6State,
  BottleneckOptionId,
  RecoveryActionId,
  ApprovalStatus,
} from '../../types/chapter6';
import {
  BOTTLENECK_OPTIONS,
  RECOVERY_ACTIONS,
  RETEST_METRIC_COMPARISONS,
  validateRecoverySequence,
  computeChapter6Score,
} from '../../data/chapter6Data';
import { requestChapterAIEvaluation } from '../../services/aiEvaluationService';
import { sound } from '../onboarding/SoundEngine';

interface PerformanceCommandCentreAppProps {
  chapter6State: Chapter6State;
  onUpdateState: (updater: Partial<Chapter6State> | ((prev: Chapter6State) => Chapter6State)) => void;
  onReturnToMeeting?: () => void;
  onOpenScorecard?: () => void;
  onNotifyDesktop?: (title: string, body: string) => void;
}

export const PerformanceCommandCentreApp: React.FC<PerformanceCommandCentreAppProps> = ({
  chapter6State,
  onUpdateState,
  onReturnToMeeting,
  onOpenScorecard,
  onNotifyDesktop,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'diagnose' | 'recovery' | 'approval'>(
    chapter6State.activeSection || 'diagnose'
  );

  // Local selection for Section A
  const [selectedBottleneck, setSelectedBottleneck] = useState<BottleneckOptionId | null>(
    chapter6State.selectedBottleneck
  );
  const [showDiagnosticFeedback, setShowDiagnosticFeedback] = useState<boolean>(
    chapter6State.diagnosisConfirmed
  );

  // Local sequence for Section B
  const [orderedActions, setOrderedActions] = useState<RecoveryActionId[]>(() => {
    if (chapter6State.recoverySequence && chapter6State.recoverySequence.length === 5) {
      return [...chapter6State.recoverySequence];
    }
    // Default shuffled/unordered initial state
    return ['retest_load', 'tune_redis', 'submit_approvals', 'optimize_db_pool', 'analyse_metrics'];
  });
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    score: number;
    feedback: string;
  } | null>(() => {
    if (chapter6State.sequenceValidated && chapter6State.recoverySequence.length === 5) {
      return validateRecoverySequence(chapter6State.recoverySequence);
    }
    return null;
  });

  // Section C State
  const [retestProgress, setRetestProgress] = useState<number>(
    chapter6State.retestCompleted ? 100 : 0
  );
  const [isRetesting, setIsRetesting] = useState<boolean>(chapter6State.retestRunning);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  // Synchronize active section
  useEffect(() => {
    if (chapter6State.activeSection) {
      setActiveTab(chapter6State.activeSection);
    }
  }, [chapter6State.activeSection]);

  // Handle Bottleneck Submission
  const handleSelectBottleneck = (id: BottleneckOptionId) => {
    setSelectedBottleneck(id);
    setShowDiagnosticFeedback(false);
  };

  const handleConfirmDiagnosis = () => {
    if (!selectedBottleneck) return;
    sound.playButtonSelect();
    const attempts = chapter6State.diagnosisAttempts + 1;
    const isCorrect = selectedBottleneck === 'db_pool_saturation';

    setShowDiagnosticFeedback(true);

    if (isCorrect) {
      sound.playSystemClearance();
      onUpdateState({
        selectedBottleneck,
        diagnosisConfirmed: true,
        diagnosisAttempts: attempts,
      });
    } else {
      sound.playPenaltyPing();
      onUpdateState({
        selectedBottleneck,
        diagnosisAttempts: attempts,
      });
    }
  };

  // Sequence Rearrangement Handlers
  const handleMoveAction = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= orderedActions.length) return;
    sound.playButtonSelect();

    const copy = [...orderedActions];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);
    setOrderedActions(copy);
    setValidationResult(null);
  };

  const handleValidateSequence = () => {
    sound.playButtonSelect();
    const attempts = chapter6State.sequenceAttemptCount + 1;
    const res = validateRecoverySequence(orderedActions);
    setValidationResult(res);

    if (res.isValid) {
      sound.playSystemClearance();
      onUpdateState({
        recoverySequence: orderedActions,
        sequenceValidated: true,
        sequenceValidationFeedback: res.feedback,
        sequenceAttemptCount: attempts,
        activeSection: 'approval',
      });
    } else {
      sound.playPenaltyPing();
      onUpdateState({
        recoverySequence: orderedActions,
        sequenceValidated: false,
        sequenceValidationFeedback: res.feedback,
        sequenceAttemptCount: attempts,
      });
    }
  };

  // Section C: Run Stress Retest Simulation
  const handleRunRetest = () => {
    if (isRetesting || chapter6State.retestCompleted) return;
    setIsRetesting(true);
    setRetestProgress(0);
    sound.playActionLaunch();

    onUpdateState({ retestRunning: true });

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setRetestProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setIsRetesting(false);
        sound.playSystemClearance();
        onUpdateState({
          retestRunning: false,
          retestCompleted: true,
          retestAnalyzed: true,
        });
      }
    }, 280);
  };

  // Approval Handlers
  const handleSignLead = () => {
    if (!chapter6State.retestCompleted) {
      sound.playPenaltyPing();
      setApprovalError('Engineering Lead signoff blocked: You must complete the 30,000-user retest first.');
      return;
    }
    sound.playSystemClearance();
    setApprovalError(null);
    onUpdateState({
      leadApprovalStatus: 'approved',
    });
  };

  const handleSignCTO = () => {
    if (!chapter6State.retestCompleted) {
      sound.playPenaltyPing();
      setApprovalError('CTO signoff blocked: Marcus will not authorize release without verified retest evidence.');
      return;
    }
    if (chapter6State.leadApprovalStatus !== 'approved') {
      sound.playPenaltyPing();
      setApprovalError('CTO signoff blocked: Technical signoff from Engineering Lead must precede CTO authorization.');
      return;
    }
    sound.playSystemClearance();
    setApprovalError(null);

    const finalState = {
      ...chapter6State,
      ctoApprovalStatus: 'approved' as ApprovalStatus,
      completed: true,
      closingChatShown: true,
    };
    const finalScore = computeChapter6Score(finalState);

    onUpdateState({
      ctoApprovalStatus: 'approved',
      completed: true,
      closingChatShown: true,
      scorecard: finalScore,
    });

    // Trigger Grok AI Evaluation for Chapter 6
    requestChapterAIEvaluation(6, {
      diagnosedRootCause: chapter6State.selectedBottleneck,
      remediationSequence: chapter6State.recoverySequence,
      retestCompleted: chapter6State.retestCompleted,
      retestLatencyMs: 180,
      leadApprovalStatus: 'approved',
      ctoApprovalStatus: 'approved',
      dualApproved: true,
    }, {
      ...finalScore,
      totalScore: finalScore.totalScore,
      whatYouDidWell: [finalScore.whatYouDidWell],
      whatToImprove: [finalScore.whatToImprove],
    }).then((aiScorecard) => {
      onUpdateState((prev) => ({
        ...prev,
        scorecard: {
          ...prev.scorecard,
          scheduleScore: aiScorecard.scheduleScore,
          riskScore: aiScorecard.riskScore,
          governanceScore: aiScorecard.governanceScore,
          efficiencyScore: aiScorecard.efficiencyScore,
          totalScore: aiScorecard.totalScore,
          outcomeType: aiScorecard.outcomeType as any,
          outcomeTitle: aiScorecard.outcomeTitle,
          outcomeText: aiScorecard.outcomeText,
          whatYouDidWell: aiScorecard.strengths?.[0] || prev.scorecard.whatYouDidWell,
          whatToImprove: aiScorecard.improvements?.[0] || prev.scorecard.whatToImprove,
          keyTakeaway: aiScorecard.leadershipCoaching || prev.scorecard.keyTakeaway,
          explanations: aiScorecard.explanations,
          aiEvaluated: aiScorecard.aiEvaluated,
        },
      }));
    }).catch(console.warn);

    if (onNotifyDesktop) {
      onNotifyDesktop(
        'Project Amigo — Performance Validation Record saved.',
        'Both mandatory signoffs obtained. Ready for release committee review.'
      );
    }
  };

  const handleCopySql = () => {
    const sqlText = `SELECT a.submission_id, a.employee_id, a.score, t.template_body
FROM appraisal_forms a
JOIN appraisal_templates t ON a.dept_id = t.dept_id
WHERE a.status = 'submitted'
ORDER BY a.submitted_at DESC LIMIT 50;`;
    navigator.clipboard?.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const currentBottleneckOption = BOTTLENECK_OPTIONS.find((o) => o.id === selectedBottleneck);

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] text-slate-100 select-none overflow-hidden font-sans">
      {/* ── TOP APM DASHBOARD NAVIGATION BAR ── */}
      <div className="h-14 bg-[#0d1428] border-b border-cyan-500/30 px-5 flex items-center justify-between z-30 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-black tracking-tight text-white uppercase">
                PERFORMANCE COMMAND CENTRE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                PROD-STG-CLUSTER-04
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
              <span>Project Amigo Enterprise HRMS</span>
              <span>•</span>
              <span className="text-cyan-400">Target Concurrency: 30,000 Employees</span>
            </div>
          </div>
        </div>

        {/* SECTION NAVIGATION TABS */}
        <div className="flex items-center bg-[#131b34] p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setActiveTab('diagnose')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'diagnose'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px] font-mono">
              A
            </span>
            <span>Diagnose Bottleneck</span>
            {chapter6State.diagnosisConfirmed && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 ml-1" />
            )}
          </button>

          <button
            onClick={() => {
              if (chapter6State.diagnosisConfirmed) setActiveTab('recovery');
            }}
            disabled={!chapter6State.diagnosisConfirmed}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              !chapter6State.diagnosisConfirmed
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeTab === 'recovery'
                ? 'bg-cyan-600 text-white shadow-md cursor-pointer'
                : 'text-slate-400 hover:text-white cursor-pointer'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px] font-mono">
              B
            </span>
            <span>Recovery Plan</span>
            {chapter6State.sequenceValidated && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 ml-1" />
            )}
          </button>

          <button
            onClick={() => {
              if (chapter6State.sequenceValidated) setActiveTab('approval');
            }}
            disabled={!chapter6State.sequenceValidated}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              !chapter6State.sequenceValidated
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : activeTab === 'approval'
                ? 'bg-cyan-600 text-white shadow-md cursor-pointer'
                : 'text-slate-400 hover:text-white cursor-pointer'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[10px] font-mono">
              C
            </span>
            <span>Retest & Approvals</span>
            {chapter6State.completed && (
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
              Back to Teams
            </button>
          )}
          {chapter6State.completed && onOpenScorecard && (
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

      {/* ── LIVE HIGH-LEVEL TELEMETRY STRIP (Visible Across All Tabs) ── */}
      <div className="bg-[#0e152c] border-b border-slate-800/80 px-6 py-2.5 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        {/* Metric 1 */}
        <div className="flex items-center space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Concurrent Users</span>
            <span className="text-sm font-bold text-white">30,000</span>
            <span className="text-[9px] text-emerald-400 ml-1.5 font-bold">[Target Reached]</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-2 h-2 rounded-full ${
              chapter6State.retestCompleted ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'
            }`}
          />
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">API Latency (P95)</span>
            <span
              className={`text-sm font-bold ${
                chapter6State.retestCompleted ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {chapter6State.retestCompleted ? '1.6 sec' : '4.2 sec'}
            </span>
            <span
              className={`text-[9px] ml-1.5 font-bold ${
                chapter6State.retestCompleted ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              [{chapter6State.retestCompleted ? 'SLA Passed <2s' : 'CRITICAL BREACH'}]
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-2 h-2 rounded-full ${
              chapter6State.retestCompleted ? 'bg-emerald-400' : 'bg-rose-500'
            }`}
          />
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">DB Connection Pool</span>
            <span
              className={`text-sm font-bold ${
                chapter6State.retestCompleted ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {chapter6State.retestCompleted ? '68% (136/200)' : '98% (196/200)'}
            </span>
            <span
              className={`text-[9px] ml-1.5 font-bold ${
                chapter6State.retestCompleted ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              [{chapter6State.retestCompleted ? 'Healthy Headroom' : 'CRITICAL SATURATION'}]
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-2 h-2 rounded-full ${
              chapter6State.retestCompleted ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">Redis Cache Hit Rate</span>
            <span
              className={`text-sm font-bold ${
                chapter6State.retestCompleted ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {chapter6State.retestCompleted ? '89%' : '42%'}
            </span>
            <span
              className={`text-[9px] ml-1.5 font-bold ${
                chapter6State.retestCompleted ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              [{chapter6State.retestCompleted ? 'Optimal Caching' : 'Needs Work (Misses)'}]
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* ========================================================= */}
        {/* SECTION A: DIAGNOSE THE BOTTLENECK                         */}
        {/* ========================================================= */}
        {activeTab === 'diagnose' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header info */}
            <div className="bg-[#0e162d] border border-cyan-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    SECTION A — ROOT CAUSE DIAGNOSIS
                  </div>
                  <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">
                    Identify the Primary System Bottleneck
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Under the 30,000-user stress test, the appraisal submission API slowed to 4.2 seconds.
                    Review the 4 performance indicators above and the APM trace breakdown below, then identify
                    what is driving this performance degradation.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">Section Weight</span>
                  <span className="text-xl font-mono font-bold text-cyan-300">20 Points</span>
                </div>
              </div>
            </div>

            {/* Simulated Live APM Panels (Matching User Image Mockup) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Slowest Query / Trace Details */}
              <div className="md:col-span-2 bg-[#0e152a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Slowest Endpoint: /api/v1/appraisal/submit (Latency: 4,210 ms)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    58% Cache Miss Rate
                  </span>
                </div>

                <div className="space-y-2 py-3 font-mono text-xs">
                  <div className="bg-[#131b34] p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[11px] text-slate-300 flex justify-between">
                      <span className="text-slate-400">Span 1: AuthGateway / SSO Role Verification</span>
                      <span className="text-emerald-400 font-bold">35 ms [OK]</span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex justify-between">
                      <span className="text-slate-400">Span 2: Redis Template Cache Lookup</span>
                      <span className="text-amber-400 font-bold">12 ms [MISS · 58% Fallthrough]</span>
                    </div>
                    <div className="text-[11px] text-rose-300 flex justify-between bg-rose-500/15 p-1.5 rounded border border-rose-500/30">
                      <span className="font-bold">Span 3: PostgresPool.acquireConnection()</span>
                      <span className="text-rose-400 font-extrabold">3,150 ms [THREAD STALLED · QUEUED]</span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex justify-between">
                      <span className="text-slate-400">Span 4: SELECT * FROM appraisal_forms WHERE dept_id = $1</span>
                      <span className="text-rose-400 font-bold">890 ms</span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex justify-between">
                      <span className="text-slate-400">Span 5: INSERT INTO appraisal_submissions...</span>
                      <span className="text-emerald-400 font-bold">123 ms</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Active DB Connections: 196 / 200 (98% Saturated)</span>
                    <span className="text-rose-400 font-bold">412 requests queued in connection backlog</span>
                  </div>
                </div>

                {/* SQL Query Details Panel */}
                <div className="bg-[#090d18] border border-slate-800 rounded-xl p-3 font-mono text-[11px] relative">
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center justify-between">
                    <span>SQL Query Details</span>
                    <button
                      onClick={handleCopySql}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                    </button>
                  </div>
                  <pre className="text-amber-300/90 whitespace-pre-wrap">
                    {`SELECT a.submission_id, a.employee_id, a.score, t.template_body
FROM appraisal_forms a
JOIN appraisal_templates t ON a.dept_id = t.dept_id
WHERE a.status = 'submitted'
ORDER BY a.submitted_at DESC LIMIT 50;`}
                  </pre>
                  <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between text-[10px] text-slate-400">
                    <span>Execution Time: 890 ms</span>
                    <span>Rows Returned: 50</span>
                    <span className="text-rose-400 font-bold">Held pool connection for 4.04s</span>
                  </div>
                </div>
              </div>

              {/* Card 2: System Performance & Resource Histogram */}
              <div className="bg-[#0e152a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-200">System Performance</span>
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-[#131b34] p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">CPU Usage</span>
                      <span className="text-base font-bold text-white font-mono">48%</span>
                      <span className="text-[9px] text-emerald-400 block mt-0.5">Normal capacity</span>
                    </div>
                    <div className="bg-[#131b34] p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Memory Usage</span>
                      <span className="text-base font-bold text-white font-mono">3.4 GB</span>
                      <span className="text-[9px] text-emerald-400 block mt-0.5">Stable headroom</span>
                    </div>
                  </div>
                </div>

                {/* Latency Distribution Histogram */}
                <div className="mt-4">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-2">
                    Latency Distribution (30k Requests)
                  </div>
                  <div className="flex items-end space-x-2 h-28 pt-2 pb-1 border-b border-slate-800">
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-emerald-500/50 rounded-t h-[20%]" />
                      <span className="text-[8px] font-mono text-slate-400">&lt;100ms</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-emerald-500/40 rounded-t h-[12%]" />
                      <span className="text-[8px] font-mono text-slate-400">100-300ms</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-amber-500/60 rounded-t h-[18%]" />
                      <span className="text-[8px] font-mono text-slate-400">300-500ms</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-rose-500/90 rounded-t h-[80%] animate-pulse" />
                      <span className="text-[8px] font-mono text-rose-400 font-bold">&gt;4,000ms</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-rose-400 font-mono mt-3 bg-rose-950/30 p-2 rounded-xl border border-rose-900/40">
                  Critical alert: 504 Gateway Timeout errors elevated (4.8%) due to connection wait queues.
                </div>
              </div>
            </div>

            {/* Diagnostic Selection Options */}
            <div className="bg-[#0e162d] border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wide font-mono">
                Select the Most Likely Bottleneck:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BOTTLENECK_OPTIONS.map((option) => {
                  const isSelected = selectedBottleneck === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectBottleneck(option.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-3 ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-500/30'
                          : 'bg-[#121932] border-slate-800 hover:border-slate-700 hover:bg-[#151d3b]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-white">{option.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{option.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Button & Feedback */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={handleConfirmDiagnosis}
                  disabled={!selectedBottleneck}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
                    !selectedBottleneck
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white cursor-pointer shadow-lg'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Verify Diagnosis</span>
                </button>

                {chapter6State.diagnosisConfirmed && (
                  <button
                    onClick={() => {
                      sound.playButtonSelect();
                      setActiveTab('recovery');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center space-x-2 shadow-lg"
                  >
                    <span>Proceed to Section B: Recovery Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Explanatory Feedback Box */}
              {showDiagnosticFeedback && currentBottleneckOption && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border mt-3 text-xs leading-relaxed ${
                    currentBottleneckOption.isCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  }`}
                >
                  <div className="font-bold flex items-center space-x-2 mb-1">
                    {currentBottleneckOption.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Diagnosis Verified (+20 Points)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Incorrect Diagnosis — Review the APM Data</span>
                      </>
                    )}
                  </div>
                  <div>{currentBottleneckOption.explanation}</div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION B: RECOVERY PLAN SEQUENCING                        */}
        {/* ========================================================= */}
        {activeTab === 'recovery' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header info */}
            <div className="bg-[#0e162d] border border-cyan-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    SECTION B — RECOVERY PLAN SEQUENCING
                  </div>
                  <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">
                    Arrange the Correct Recovery Sequence
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Now comes the engineering reasoning. Arrange the 5 recovery actions in the order you would execute them.
                    Remember the technical dependencies: you cannot retest without fixes, and you cannot seek approvals without evidence.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">Section Weight</span>
                  <span className="text-xl font-mono font-bold text-cyan-300">30 Points</span>
                </div>
              </div>
            </div>

            {/* Recovery Action Sequence Builder */}
            <div className="bg-[#0e152a] border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 uppercase font-mono">
                  Execution Order (Step 1 to 5)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Use the arrows to sequence actions
                </span>
              </div>

              <div className="space-y-2.5">
                {orderedActions.map((actionId, index) => {
                  const action = RECOVERY_ACTIONS.find((a) => a.id === actionId)!;
                  return (
                    <motion.div
                      key={actionId}
                      layout
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      className="bg-[#121932] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-3.5 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center space-x-3.5 flex-1 pr-3">
                        {/* Step Number Badge */}
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-mono font-black text-sm shrink-0">
                          {index + 1}
                        </div>

                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{action.label}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                              {action.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {action.description}
                          </div>
                        </div>
                      </div>

                      {/* Reorder Buttons */}
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => handleMoveAction(index, 'up')}
                          disabled={index === 0}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            index === 0
                              ? 'text-slate-600 cursor-not-allowed'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer'
                          }`}
                          title="Move Up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveAction(index, 'down')}
                          disabled={index === orderedActions.length - 1}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            index === orderedActions.length - 1
                              ? 'text-slate-600 cursor-not-allowed'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer'
                          }`}
                          title="Move Down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 mt-4">
                <button
                  onClick={() => {
                    sound.playButtonSelect();
                    // Set recommended order
                    setOrderedActions([
                      'tune_redis',
                      'optimize_db_pool',
                      'retest_load',
                      'analyse_metrics',
                      'submit_approvals',
                    ]);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center space-x-1 font-mono"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Suggested Baseline</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleValidateSequence}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Review Recovery Sequence</span>
                  </button>

                  {chapter6State.sequenceValidated && (
                    <button
                      onClick={() => {
                        sound.playButtonSelect();
                        setActiveTab('approval');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center space-x-2 shadow-lg"
                    >
                      <span>Proceed to Section C: Retest</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Validation Result Box */}
              {validationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border mt-3 text-xs leading-relaxed ${
                    validationResult.isValid
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  }`}
                >
                  <div className="font-bold flex items-center space-x-2 mb-1">
                    {validationResult.isValid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Valid Recovery Sequence (+{validationResult.score} Points)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Dependency Violation — Reorder Sequence</span>
                      </>
                    )}
                  </div>
                  <div>{validationResult.feedback}</div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION C: RETEST & PRODUCTION APPROVAL GATE              */}
        {/* ========================================================= */}
        {activeTab === 'approval' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header info */}
            <div className="bg-[#0e162d] border border-cyan-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    SECTION C — PRODUCTION APPROVAL GATE & RETEST
                  </div>
                  <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">
                    Execute Retest & Secure Dual Signoffs
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Passing the initial functional test is never sufficient. Simulate the 30,000-user retest to confirm
                    that Redis caching and connection pool tuning resolved the issue. Then, secure mandatory signoffs
                    from both the Engineering Lead and Marcus Reed (CTO).
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">Section Weight</span>
                  <span className="text-xl font-mono font-bold text-cyan-300">50 Points</span>
                </div>
              </div>
            </div>

            {/* Retest Simulation Banner */}
            <div className="bg-[#0e152a] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRetesting ? 'animate-spin' : ''}`} />
                    <span>30,000-User Stress Retest Execution</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Simulate 30,000 concurrent bank employee check-ins and appraisal submissions.
                  </div>
                </div>

                <button
                  onClick={handleRunRetest}
                  disabled={isRetesting || chapter6State.retestCompleted}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
                    chapter6State.retestCompleted
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : isRetesting
                      ? 'bg-cyan-600/50 text-cyan-200 cursor-wait'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white cursor-pointer shadow-lg'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>
                    {chapter6State.retestCompleted
                      ? 'Retest Passed Successfully'
                      : isRetesting
                      ? `Running Load (${retestProgress}%)`
                      : 'Execute 30,000-User Retest'}
                  </span>
                </button>
              </div>

              {/* Retest Progress Bar */}
              {(isRetesting || chapter6State.retestCompleted) && (
                <div className="space-y-1.5 pt-1">
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2.5 rounded-full"
                      style={{ width: `${retestProgress}%` }}
                      transition={{ ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Virtual Users: {Math.round((retestProgress / 100) * 30000).toLocaleString()} / 30,000</span>
                    <span className="text-cyan-400 font-bold">
                      {retestProgress === 100 ? 'BENCHMARK RUN COMPLETED' : 'INJECTING SYNTHETIC TRAFFIC'}
                    </span>
                  </div>
                </div>
              )}

              {/* Before vs After Telemetry Comparison Table */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="text-[11px] font-bold text-slate-300 uppercase font-mono mb-2.5">
                  Performance Telemetry Comparison (Initial vs Retest)
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                        <th className="py-2 px-3">Metric</th>
                        <th className="py-2 px-3">Initial Result (Failed)</th>
                        <th className="py-2 px-3">Retest Result (Tuned)</th>
                        <th className="py-2 px-3">Variance & Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {RETEST_METRIC_COMPARISONS.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 font-bold text-slate-200">{m.name}</td>
                          <td className="py-2.5 px-3 text-rose-400 font-bold">{m.initial}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`font-bold ${
                                chapter6State.retestCompleted ? 'text-emerald-400' : 'text-slate-500'
                              }`}
                            >
                              {chapter6State.retestCompleted ? m.retest : 'Pending Retest...'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[11px]">
                            <span
                              className={
                                chapter6State.retestCompleted ? 'text-cyan-300 font-bold' : 'text-slate-500'
                              }
                            >
                              {chapter6State.retestCompleted ? m.delta : 'Awaiting simulation run'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Production Dual Approval Cards */}
            <div className="bg-[#0e162d] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <div className="text-xs font-bold text-white uppercase font-mono">
                    Mandatory Production Release Approvals
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Dual gate governance: Engineering Lead and CTO must both authorize release with evidence.
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Dual Signoff Gate
                </span>
              </div>

              {approvalError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{approvalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Approval Card 1: Daniel Kapoor (Dev Lead) */}
                <div
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    chapter6State.leadApprovalStatus === 'approved'
                      ? 'bg-emerald-950/30 border-emerald-500/60'
                      : 'bg-[#121932] border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src="/character/Daniel_Brooks/DanielDP.png"
                          alt="Daniel"
                          className="w-9 h-9 rounded-full border border-cyan-400/50 object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <div className="text-xs font-bold text-white">Daniel Kapoor</div>
                          <div className="text-[10px] text-cyan-400 font-mono">Engineering Lead</div>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          chapter6State.leadApprovalStatus === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {chapter6State.leadApprovalStatus === 'approved'
                          ? 'Technical Retest Passed'
                          : 'Awaiting Verification'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 mt-3 leading-relaxed">
                      {chapter6State.leadApprovalStatus === 'approved'
                        ? 'Performance evidence reviewed. Verified that appraisal latency dropped to 1.6s and connection pool saturation resolved.'
                        : 'Technical signoff requires verified 30,000-user load test results showing latency < 2.0s.'}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">Role: Technical Gatekeeper</span>
                    <button
                      onClick={handleSignLead}
                      disabled={chapter6State.leadApprovalStatus === 'approved'}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        chapter6State.leadApprovalStatus === 'approved'
                          ? 'bg-emerald-600/30 text-emerald-300 cursor-default'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow'
                      }`}
                    >
                      {chapter6State.leadApprovalStatus === 'approved'
                        ? 'Signoff Granted ✓'
                        : 'Review & Grant Signoff'}
                    </button>
                  </div>
                </div>

                {/* Approval Card 2: Marcus Reed (CTO) */}
                <div
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    chapter6State.ctoApprovalStatus === 'approved'
                      ? 'bg-emerald-950/30 border-emerald-500/60'
                      : 'bg-[#121932] border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src="/character/marcus_reed/MarcusDP.png"
                          alt="Marcus"
                          className="w-9 h-9 rounded-full border border-rose-400/50 object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <div className="text-xs font-bold text-white">Marcus Reed</div>
                          <div className="text-[10px] text-rose-400 font-mono">Chief Technology Officer</div>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          chapter6State.ctoApprovalStatus === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {chapter6State.ctoApprovalStatus === 'approved'
                          ? 'Final Authorization Granted'
                          : 'Awaiting Authorization'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 mt-3 leading-relaxed">
                      {chapter6State.ctoApprovalStatus === 'approved'
                        ? 'Executive signoff authorized. Evidence and dual approval recorded. Project Amigo cleared for release review.'
                        : 'A system handling 80,000 employees cannot go live on assumptions. Requires attached retest evidence and Engineering Lead concurrence.'}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">Role: Executive Authorization</span>
                    <button
                      onClick={handleSignCTO}
                      disabled={chapter6State.ctoApprovalStatus === 'approved'}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        chapter6State.ctoApprovalStatus === 'approved'
                          ? 'bg-emerald-600/30 text-emerald-300 cursor-default'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow'
                      }`}
                    >
                      {chapter6State.ctoApprovalStatus === 'approved'
                        ? 'Authorized ✓'
                        : 'Submit Evidence to CTO'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Banner when both approved */}
              {chapter6State.completed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-950/50 border border-emerald-500/60 rounded-2xl p-5 shadow-2xl space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">
                        Performance Validation Complete — Ready for Release Review
                      </div>
                      <div className="text-xs text-emerald-300 font-medium mt-0.5">
                        Performance evidence recorded. Both mandatory approvals received.
                      </div>
                    </div>
                  </div>

                  {/* Closing scene Teams Dialogue */}
                  <div className="bg-[#0b1022] border border-emerald-500/30 rounded-xl p-3.5 space-y-2 text-xs font-sans">
                    <div className="text-slate-300">
                      <span className="font-bold text-cyan-400 font-mono">[Daniel Kapoor]: </span>
                      "Good work. The updated performance results look much better. We've documented the retest evidence and sent it to Marcus for final review."
                    </div>
                    <div className="text-slate-300">
                      <span className="font-bold text-rose-400 font-mono">[Marcus Reed — CTO]: </span>
                      "That's the standard I expect. A system handling 80,000 employees cannot go live on assumptions. Make sure the evidence and approvals are attached to the release record. We'll take the production decision through the release review."
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Project Amigo — Performance Validation Record saved.
                    </span>
                    {onOpenScorecard && (
                      <button
                        onClick={onOpenScorecard}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center space-x-2"
                      >
                        <span>View Final Performance Scorecard</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
