/**
 * chapter5.service.ts
 * Backend scoring and state persistence service for Chapter 5: The Launch Decision (Controlled User Group Rollout)
 */

import { readWorldState, mutateWorldState, logSignal } from '../engine/worldState.engine';

export interface Chapter5BackendState {
  selectedBlockers: string[];
  prePilotActivities: Record<string, string>;
  latencyTarget: string;
  errorRateThreshold: string;
  feedbackChannel: string;
  incidentOwner: string;
  rollbackCondition: string;
  widerRolloutDecision: string | null;
}

export interface Chapter5EvaluationResult {
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  outcomeType: 'strong' | 'mixed' | 'incomplete';
  outcomeText: string;
  whatYouDidWell: string;
  whatToImprove: string;
  keyTakeaway: string;
  explanations: {
    schedule: string;
    risk: string;
    governance: string;
    efficiency: string;
  };
}

export async function evaluateChapter5Submission(
  sessionId: string,
  state: Chapter5BackendState,
  ch4Baseline?: {
    scheduleScore?: number;
    riskScore?: number;
    governanceScore?: number;
    efficiencyScore?: number;
  }
): Promise<Chapter5EvaluationResult> {
  const baseSchedule = ch4Baseline?.scheduleScore ?? 75;
  const baseRisk = ch4Baseline?.riskScore ?? 75;
  const baseGov = ch4Baseline?.governanceScore ?? 75;
  const baseEff = ch4Baseline?.efficiencyScore ?? 75;

  let deltaSchedule = 0;
  let deltaRisk = 0;
  let deltaGov = 0;
  let deltaEff = 0;

  // 1. Stage 2: Selected Blockers
  const blockers = state.selectedBlockers || [];
  const hasLoad = blockers.includes('blocker_performance_load');
  const hasSec = blockers.includes('blocker_security_approval');
  const hasRollback = blockers.includes('blocker_rollback_procedure');
  const hasPhase2Distractor = blockers.includes('distractor_phase2_backlog');
  const hasImmediateGeneral = blockers.includes('distractor_immediate_general');

  if (hasLoad) {
    deltaRisk += 10;
    deltaSchedule += 5;
  } else {
    deltaRisk -= 20;
    deltaGov -= 15;
  }

  if (hasSec) {
    deltaRisk += 10;
    deltaGov += 10;
  } else {
    deltaRisk -= 25;
    deltaGov -= 20;
  }

  if (hasRollback) {
    deltaGov += 10;
    deltaRisk += 10;
  } else {
    deltaGov -= 20;
    deltaRisk -= 20;
  }

  if (hasPhase2Distractor) {
    deltaSchedule -= 15;
    deltaEff -= 10;
  }
  if (hasImmediateGeneral) {
    deltaRisk -= 30;
    deltaGov -= 25;
  }

  // 2. Stage 3A: Pre-pilot Sequencing
  const acts = state.prePilotActivities || {};
  const peakLoadPrereq = acts.act_peak_load === 'pre_pilot_prerequisite';
  const secPrereq = acts.act_security_approval === 'pre_pilot_prerequisite';
  const rollbackPrereq = acts.act_rollback_approval === 'pre_pilot_prerequisite';
  const monPrereq = acts.act_monitoring_alerts === 'pre_pilot_prerequisite';
  const commsDuring = acts.act_user_comms === 'during_pilot_continuous';

  if (peakLoadPrereq && secPrereq && rollbackPrereq && monPrereq) {
    deltaGov += 15;
    deltaRisk += 15;
  } else {
    deltaRisk -= 20;
    deltaGov -= 15;
  }

  if (commsDuring) {
    deltaEff += 10;
    deltaSchedule += 5;
  }

  // 3. Stage 3B: Pilot Controls
  if (state.latencyTarget === 'strict_800ms') {
    deltaEff += 10;
    deltaRisk += 5;
  } else if (state.latencyTarget === 'moderate_1500ms') {
    deltaEff += 5;
  } else {
    deltaEff -= 15;
    deltaGov -= 10;
  }

  if (state.errorRateThreshold === 'strict_0_1_percent') {
    deltaRisk += 10;
    deltaGov += 10;
  } else if (state.errorRateThreshold === 'lenient_1_percent') {
    deltaRisk += 5;
  } else {
    deltaRisk -= 20;
    deltaGov -= 15;
  }

  if (state.feedbackChannel === 'in_app_daily_pulse') {
    deltaEff += 10;
    deltaGov += 5;
  } else if (state.feedbackChannel === 'email_thread_only') {
    deltaEff += 0;
  } else {
    deltaEff -= 15;
  }

  if (state.incidentOwner === 'daniel_oncall_aarav_lead') {
    deltaGov += 10;
    deltaEff += 5;
  } else {
    deltaGov -= 15;
    deltaRisk -= 10;
  }

  if (state.rollbackCondition === 'sev1_or_high_error_rate') {
    deltaGov += 10;
    deltaRisk += 10;
  } else {
    deltaRisk -= 20;
    deltaGov -= 15;
  }

  // 4. Stage 3C: Wider Rollout Decision
  if (state.widerRolloutDecision === 'expand_in_stages') {
    deltaGov += 20;
    deltaRisk += 15;
    deltaSchedule += 10;
    deltaEff += 10;
  } else if (state.widerRolloutDecision === 'extend_pilot') {
    deltaRisk += 15;
    deltaGov += 10;
    deltaSchedule -= 5;
  } else if (state.widerRolloutDecision === 'release_immediate_all') {
    deltaRisk -= 35;
    deltaGov -= 30;
    deltaSchedule -= 15;
  }

  const clamp = (val: number) => Math.max(10, Math.min(100, Math.round(val)));

  const finalSchedule = clamp(baseSchedule + deltaSchedule);
  const finalRisk = clamp(baseRisk + deltaRisk);
  const finalGov = clamp(baseGov + deltaGov);
  const finalEff = clamp(baseEff + deltaEff);

  const totalScore = Math.round((finalSchedule + finalRisk + finalGov + finalEff) / 4);

  let outcomeType: 'strong' | 'mixed' | 'incomplete' = 'mixed';
  let outcomeText = 'Controlled Pilot Plan Submitted with Caveats';

  if (totalScore >= 80 && hasLoad && hasSec && hasRollback && state.widerRolloutDecision !== 'release_immediate_all') {
    outcomeType = 'strong';
    outcomeText = 'Controlled Pilot Plan Submitted & Authorized for Review';
  } else if (totalScore < 55 || state.widerRolloutDecision === 'release_immediate_all') {
    outcomeType = 'incomplete';
    outcomeText = 'Rollout Plan Incomplete — Critical Controls Missing';
  }

  let whatYouDidWell = 'You isolated mandatory release prerequisites from non-blocking activities and enforced controlled user boundaries.';
  if (outcomeType === 'strong') {
    whatYouDidWell = 'You established a balanced pilot plan: 500 users, strict telemetry alarms, verified rollback criteria, and phased expansion gates.';
  } else if (hasSec && hasRollback) {
    whatYouDidWell = 'You correctly recognized that security authorization and rollback approval cannot be bypassed.';
  }

  let whatToImprove = 'Ensure telemetry thresholds and incident ownership are explicitly defined prior to opening user access.';
  if (state.widerRolloutDecision === 'release_immediate_all') {
    whatToImprove = 'Never release to 80,000 employees directly without pilot validation; always expand in phased increments.';
  } else if (!hasLoad) {
    whatToImprove = 'Include peak-load benchmarking as a mandatory blocker to prevent service degradation during peak login hours.';
  } else if (hasPhase2Distractor) {
    whatToImprove = 'Avoid blocking current release milestones on future backlog enhancements that belong to later iterations.';
  } else if (state.errorRateThreshold === 'manual_logs_only') {
    whatToImprove = 'Implement automated error-rate paging rather than relying on manual end-of-day log review.';
  }

  const scheduleExp = finalSchedule >= 75
    ? 'Sequenced validation tasks to avoid unnecessary delay while protecting release milestones.'
    : 'Incurred schedule risk through premature general release or blocking on future scope.';

  const riskExp = finalRisk >= 75
    ? 'Enforced peak load validation, production security access, and verified rollback criteria.'
    : 'Exposed bank infrastructure to scale shock or unapproved identity directory access.';

  const govExp = finalGov >= 75
    ? 'Separated release prerequisites from pilot activities and established phased expansion gates.'
    : 'Failed to define formal acceptance thresholds or assigned vague incident accountability.';

  const effExp = finalEff >= 75
    ? 'Configured real-time telemetry, clear on-call ownership, and continuous pilot communication.'
    : 'Relied on manual log inspection or unstructured support channels that slow defect resolution.';

  // Attempt world state mutation and signal logging if session is tracked
  try {
    const ws = await readWorldState(sessionId);
    if (ws) {
      await mutateWorldState(sessionId, {
        metrics: {
          delivery_health: finalGov,
          budget_burn: ws.metrics?.budget_burn ?? 50,
          stakeholder_trust: finalRisk,
          team_morale: finalEff,
        },
      });
      await logSignal(sessionId, {
        category: 'governance',
        source: 'Chapter 5 Release Readiness Board',
        impact: totalScore >= 75 ? 'positive' : 'negative',
        summary: `Controlled rollout plan evaluated with outcome: ${outcomeText}`,
        scoreDelta: totalScore - 75,
      });
    }
  } catch (err) {
    // Non-fatal if session engine offline
  }

  return {
    scheduleScore: finalSchedule,
    riskScore: finalRisk,
    governanceScore: finalGov,
    efficiencyScore: finalEff,
    totalScore,
    outcomeType,
    outcomeText,
    whatYouDidWell,
    whatToImprove,
    keyTakeaway: 'Production readiness is demonstrated through evidence, not assumed from successful development.',
    explanations: {
      schedule: scheduleExp,
      risk: riskExp,
      governance: govExp,
      efficiency: effExp,
    },
  };
}
