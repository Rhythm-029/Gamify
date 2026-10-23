/**
 * chapter4.service.ts
 * Backend scoring and state persistence service for Chapter 4: Change Request & Impact Analysis
 */

import { readWorldState, mutateWorldState, logSignal } from '../engine/worldState.engine';

export interface Chapter4BackendState {
  featurePlacement: Record<string, string>;
  assessmentSchedule: string | null;
  assessmentDependencies: string[];
  assessmentSecurity: string | null;
  assessmentBusinessValue: string | null;
  assessmentApproval: string | null;
  finalRecommendation: string | null;
  writtenJustification?: string;
}

export interface Chapter4EvaluationResult {
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  outcomeType: 'strong' | 'mixed' | 'weak';
  outcomeText: string;
  strongestMove: string;
  oneThingToImprove: string;
  leadershipTakeaway: string;
  explanations: {
    schedule: string;
    risk: string;
    governance: string;
    efficiency: string;
  };
}

export async function evaluateChapter4Submission(
  sessionId: string,
  state: Chapter4BackendState,
  ch3Baseline?: {
    scheduleScore?: number;
    riskScore?: number;
    governanceScore?: number;
    efficiencyScore?: number;
  }
): Promise<Chapter4EvaluationResult> {
  const baseSchedule = ch3Baseline?.scheduleScore ?? 80;
  const baseRisk = ch3Baseline?.riskScore ?? 80;
  const baseGov = ch3Baseline?.governanceScore ?? 80;
  const baseEff = ch3Baseline?.efficiencyScore ?? 80;

  let deltaSchedule = 0;
  let deltaRisk = 0;
  let deltaGov = 0;
  let deltaEff = 0;

  // 1. Release Plan Placement for CR-017
  const crPlacement = state.featurePlacement?.['CR-017'];
  if (crPlacement === 'phase_2') {
    deltaSchedule += 15;
    deltaRisk += 15;
    deltaGov += 10;
    await logSignal(sessionId, {
      dimension: 'schedule_timeline',
      signal_type: 'deferred_cr_to_protect_baseline',
      value: 15,
      description: 'Player protected the 90-day Phase 1 baseline by placing unestimated CR-017 into Phase 2.',
    });
  } else if (crPlacement === 'phase_1') {
    if (state.assessmentSchedule === 'confirmed_feasible') {
      deltaSchedule -= 25;
      deltaRisk -= 25;
      deltaGov -= 20;
      await logSignal(sessionId, {
        dimension: 'trust_risk_management',
        signal_type: 'reckless_scope_expansion',
        value: -25,
        description: 'Player added unestimated feature to Phase 1 and confirmed delivery without validation.',
      });
    } else {
      deltaSchedule -= 10;
      deltaRisk -= 5;
    }
  } else {
    deltaGov += 10;
    deltaSchedule += 5;
  }

  // 2. Schedule Feasibility Assessment
  if (state.assessmentSchedule === 'needs_validation') {
    deltaSchedule += 20;
    deltaGov += 15;
    await logSignal(sessionId, {
      dimension: 'schedule_timeline',
      signal_type: 'required_feasibility_validation',
      value: 20,
      description: 'Player recognized that feasibility must be validated by engineering before promising delivery.',
    });
  } else if (state.assessmentSchedule === 'not_feasible_current') {
    deltaSchedule += 15;
    deltaRisk += 10;
  } else if (state.assessmentSchedule === 'confirmed_feasible') {
    deltaSchedule -= 30;
    deltaRisk -= 25;
    deltaGov -= 20;
  }

  // 3. Technical Dependencies Checklist
  const deps = state.assessmentDependencies || [];
  const selectedRules = deps.includes('dep_regional_rules');
  const selectedPayroll = deps.includes('dep_payroll_integration');
  const selectedEstimate = deps.includes('dep_effort_estimate');
  const selectedImmediate = deps.includes('dep_immediate_start');
  const selectedAssumeApi = deps.includes('dep_assume_api');

  let validCount = 0;
  if (selectedRules) validCount++;
  if (selectedPayroll) validCount++;
  if (selectedEstimate) validCount++;

  deltaGov += validCount * 8;
  deltaEff += validCount * 8;

  if (validCount === 3) {
    await logSignal(sessionId, {
      dimension: 'delivery_governance',
      signal_type: 'identified_all_technical_dependencies',
      value: 20,
      description: 'Player explicitly required regional bonus rules, payroll integration, and engineering estimates.',
    });
  }

  if (selectedImmediate) {
    deltaEff -= 25;
    deltaRisk -= 25;
    deltaGov -= 20;
    await logSignal(sessionId, {
      dimension: 'team_efficiency',
      signal_type: 'premature_coding_without_dependencies',
      value: -25,
      description: 'Player attempted to code before resolving external dependency contracts.',
    });
  }

  if (selectedAssumeApi) {
    deltaRisk -= 25;
    deltaGov -= 20;
  }

  // 4. Security & Compliance Assessment
  if (state.assessmentSecurity === 'review_access_controls') {
    deltaRisk += 25;
    deltaGov += 20;
    await logSignal(sessionId, {
      dimension: 'trust_risk_management',
      signal_type: 'enforced_compensation_access_controls',
      value: 20,
      description: 'Player enforced role-based permissions and security review for sensitive bonus data.',
    });
  } else if (state.assessmentSecurity === 'confirm_approvals') {
    deltaRisk += 20;
    deltaGov += 25;
  } else if (state.assessmentSecurity === 'allow_all_hr_users') {
    deltaRisk -= 35;
    deltaGov -= 30;
  } else if (state.assessmentSecurity === 'reuse_existing') {
    deltaRisk -= 25;
    deltaGov -= 20;
  }

  // 5. Business Value Assessment
  if (state.assessmentBusinessValue === 'balance_and_evaluate') {
    deltaGov += 20;
    deltaRisk += 15;
    deltaEff += 15;
  } else if (state.assessmentBusinessValue === 'accept_immediately') {
    deltaSchedule -= 20;
    deltaRisk -= 20;
  } else if (state.assessmentBusinessValue === 'reject_outright') {
    deltaGov -= 15;
    deltaEff -= 10;
  } else if (state.assessmentBusinessValue === 'move_all_to_phase2') {
    deltaSchedule -= 30;
    deltaEff -= 30;
  }

  // 6. Approval & Governance Assessment
  if (state.assessmentApproval === 'record_cr_and_validate') {
    deltaGov += 25;
    deltaRisk += 15;
    await logSignal(sessionId, {
      dimension: 'delivery_governance',
      signal_type: 'enforced_change_control_governance',
      value: 25,
      description: 'Player formally recorded CR-017 and required impact analysis and approval gates.',
    });
  } else {
    deltaGov -= 25;
    deltaRisk -= 20;
  }

  // 7. Final Recommendation
  if (state.finalRecommendation === 'evaluate_without_compromise') {
    deltaGov += 25;
    deltaSchedule += 20;
    deltaRisk += 20;
    deltaEff += 20;
  } else if (state.finalRecommendation === 'defer_phase2') {
    deltaSchedule += 20;
    deltaRisk += 15;
    deltaGov += 10;
  } else if (state.finalRecommendation === 'commit_phase1') {
    if (state.assessmentSchedule === 'confirmed_feasible') {
      deltaSchedule -= 30;
      deltaRisk -= 30;
      deltaGov -= 20;
    } else {
      deltaSchedule -= 15;
      deltaRisk -= 10;
    }
  } else if (state.finalRecommendation === 'reject_request') {
    deltaGov -= 15;
    deltaRisk -= 10;
  }

  // 8. Written Justification Bonus Points
  const text = (state.writtenJustification || '').toLowerCase();
  const mentionsDeadline = text.includes('90') || text.includes('deadline') || text.includes('schedule') || text.includes('timeline');
  const mentionsDependencies = text.includes('depend') || text.includes('payroll') || text.includes('regional') || text.includes('rule');
  const mentionsEstimate = text.includes('estimate') || text.includes('effort') || text.includes('development') || text.includes('daniel');
  const mentionsApproval = text.includes('approval') || text.includes('governance') || text.includes('record') || text.includes('security');

  let justificationBonus = 0;
  if (mentionsDeadline) justificationBonus += 5;
  if (mentionsDependencies) justificationBonus += 5;
  if (mentionsEstimate) justificationBonus += 5;
  if (mentionsApproval) justificationBonus += 5;

  deltaSchedule += justificationBonus;
  deltaGov += justificationBonus;
  deltaRisk += justificationBonus;
  deltaEff += justificationBonus;

  // Clamping to [10, 100]
  const clamp = (val: number) => Math.max(10, Math.min(100, Math.round(val)));
  const finalSchedule = clamp(baseSchedule + deltaSchedule);
  const finalRisk = clamp(baseRisk + deltaRisk);
  const finalGov = clamp(baseGov + deltaGov);
  const finalEff = clamp(baseEff + deltaEff);

  const totalScore = Math.round((finalSchedule + finalRisk + finalGov + finalEff) / 4);

  let outcomeType: 'strong' | 'mixed' | 'weak' = 'mixed';
  let outcomeText = 'Further Assessment Required';
  if (totalScore >= 80) {
    outcomeType = 'strong';
    outcomeText = 'Impact Assessment in Progress';
  } else if (totalScore < 55) {
    outcomeType = 'weak';
    outcomeText = 'Assessment Incomplete';
  }

  // Strongest move & One thing to improve
  let strongestMove = 'You established that technical feasibility and effort estimates must precede delivery commitments.';
  if (state.finalRecommendation === 'evaluate_without_compromise' && selectedPayroll && selectedRules) {
    strongestMove = 'You balanced client value with technical reality, isolating payroll and regional rule dependencies without derailing the 90-day baseline.';
  } else if (state.assessmentSecurity === 'review_access_controls' || state.assessmentSecurity === 'confirm_approvals') {
    strongestMove = 'You identified that compensation calculations carry strict access control and security compliance requirements.';
  }

  let oneThingToImprove = 'Ensure all stakeholders sign off on the change ticket before communicating release commitments.';
  if (selectedImmediate || selectedAssumeApi) {
    oneThingToImprove = 'Avoid assuming API readiness or commencing development before external dependencies are confirmed.';
  } else if (state.assessmentSchedule === 'confirmed_feasible') {
    oneThingToImprove = 'Do not commit to release delivery dates when engineering estimates are still unvalidated.';
  } else if (state.finalRecommendation === 'reject_request') {
    oneThingToImprove = 'Avoid dismissing client requests outright; always record the change request and conduct a formal impact analysis.';
  }

  // Explanations
  const scheduleExp = finalSchedule >= 75
    ? 'Protected the 90-day delivery baseline and required engineering sizing prior to release commitment.'
    : 'Assumed delivery feasibility prematurely or allowed unestimated scope to threaten the Phase 1 target.';

  const riskExp = finalRisk >= 75
    ? 'Identified compensation data security boundaries and unconfirmed payroll integration points.'
    : 'Overlooked compensation access control risks or treated unvalidated dependencies as resolved.';

  const govExp = finalGov >= 75
    ? 'Recorded CR-017 formally and established structured business & IT approval gates.'
    : 'Treated informal stakeholder discussions as final release authorization without documented impact analysis.';

  const effExp = finalEff >= 75
    ? 'Prevented engineering rework by clarifying rules and integrations before writing code.'
    : 'Risked developer churn and wasted cycles by greenlighting unverified dependencies.';

  // Mutate World State
  try {
    await mutateWorldState(sessionId, (ws) => {
      if (!ws.variables) ws.variables = {};
      ws.variables['chapter4_completed'] = true;
      ws.variables['chapter4_outcome'] = outcomeType;
      ws.variables['chapter4_total_score'] = totalScore;
      ws.variables['cr017_status'] = outcomeText;
      ws.variables['chapter4_schedule_score'] = finalSchedule;
      ws.variables['chapter4_risk_score'] = finalRisk;
      ws.variables['chapter4_governance_score'] = finalGov;
      ws.variables['chapter4_efficiency_score'] = finalEff;
    });
  } catch (err) {
    console.warn('[Chapter4] Failed to mutate world state:', err);
  }

  return {
    scheduleScore: finalSchedule,
    riskScore: finalRisk,
    governanceScore: finalGov,
    efficiencyScore: finalEff,
    totalScore,
    outcomeType,
    outcomeText,
    strongestMove,
    oneThingToImprove,
    leadershipTakeaway:
      'Every new request deserves a fair assessment. Protecting delivery means understanding the impact before making a commitment.',
    explanations: {
      schedule: scheduleExp,
      risk: riskExp,
      governance: govExp,
      efficiency: effExp,
    },
  };
}
