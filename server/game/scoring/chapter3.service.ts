/**
 * chapter3.service.ts
 * Backend scoring and state persistence service for Chapter 3: The Integration Trap
 */

import { readWorldState, mutateWorldState, logSignal } from '../engine/worldState.engine';

export interface Chapter3BackendState {
  pathTaken?: 'full_credit' | 'recovery' | 'incomplete';
  playerIdentifiedNetworkGap?: boolean;
  v2SentToDaniel?: boolean;
  escalationChoice?: 'investigate_independently' | 'escalate_aarav' | 'bypass_gateway' | null;
  escalationRecovered?: boolean;
  task1Selected?: 'database_overload' | 'protocol_mismatch' | 'expired_credentials' | 'incorrect_ui' | null;
  task2Selected?: 'direct_database' | 'custom_converter' | 'approved_gateway' | null;
  task2Recovered?: boolean;
  task3Order?: string[];
  uiDesignSelected?: 'design_1' | 'design_2' | 'design_3' | null;
  uiDesignJustification?: string;
}

export interface Chapter3EvaluationResult {
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  outcomeType: 'strong' | 'partial' | 'poor';
  outcomeText: string;
  personalizedTakeaway: string;
  explanations: {
    schedule: string;
    risk: string;
    governance: string;
    efficiency: string;
  };
}

export async function evaluateChapter3Submission(
  sessionId: string,
  state: Chapter3BackendState,
  ch2Baseline?: {
    scheduleScore?: number;
    riskScore?: number;
    governanceScore?: number;
    efficiencyScore?: number;
  }
): Promise<Chapter3EvaluationResult> {
  // UAT Infrastructure Coordination Evaluation
  if (state.pathTaken) {
    let scorecard: Chapter3EvaluationResult;
    if (state.pathTaken === 'full_credit') {
      scorecard = {
        scheduleScore: 96,
        riskScore: 95,
        governanceScore: 100,
        efficiencyScore: 95,
        totalScore: 96,
        outcomeType: 'strong',
        outcomeText: 'You cross-referenced developer prerequisites against client deliverables, caught the missing network configuration item before forwarding, and ensured the engineering team had full clarity on pending bank approvals.',
        personalizedTakeaway: 'By auditing Sophia\'s v1 delivery against Daniel\'s checklist, you prevented a premature integration attempt and saved the sprint from blocked connectivity cycles.',
        explanations: {
          schedule: 'Proactive requirement verification eliminated developer idle time and prevented false-start configuration cycles.',
          risk: 'Clarified firewall and proxy ownership upfront, preventing unapproved gateway circumvention.',
          governance: 'Maintained strict audit trail of client configuration items and distinguished confirmed specs from pending IT approvals.',
          efficiency: 'Achieved first-time-right handoff to engineering with all 5 environment prerequisites verified.',
        },
      };
      await logSignal(sessionId, {
        dimension: 'delivery_governance',
        signal_type: 'uat_prerequisites_fully_verified',
        value: 20,
        description: 'Audited Daniel\'s 5 requirements against Sophia\'s 4 confirmed items and identified missing network requirement.',
      });
    } else if (state.pathTaken === 'recovery') {
      scorecard = {
        scheduleScore: 82,
        riskScore: 78,
        governanceScore: 85,
        efficiencyScore: 78,
        totalScore: 81,
        outcomeType: 'partial',
        outcomeText: 'You forwarded the incomplete v1 document to Daniel first, but quickly recovered when prompted, contacted Sophia for the missing firewall details, and completed the delivery pack.',
        personalizedTakeaway: 'Good recovery upon developer feedback. In future sprints, conduct the prerequisite check before passing information to engineering to avoid unnecessary communication hops.',
        explanations: {
          schedule: 'A minor delay was introduced by forwarding v1 before verifying all 5 checklist items with Sophia.',
          risk: 'Risk was mitigated before implementation began, though developer intervention was needed to catch the omission.',
          governance: 'Document versioning and audit trail maintained, though recovery required additional communication round-trips.',
          efficiency: 'Additional communication cycles between Daniel, Sophia, and PM reduced team velocity.',
        },
      };
      await logSignal(sessionId, {
        dimension: 'team_efficiency',
        signal_type: 'uat_forwarded_incomplete_then_recovered',
        value: -5,
        description: 'Forwarded incomplete v1 to Daniel first, but recovered upon prompt and sent complete v2.',
      });
    } else {
      scorecard = {
        scheduleScore: 55,
        riskScore: 50,
        governanceScore: 60,
        efficiencyScore: 58,
        totalScore: 56,
        outcomeType: 'poor',
        outcomeText: 'You forwarded the incomplete environment document to Daniel without verifying the outstanding network access requirement, leaving engineering blocked.',
        personalizedTakeaway: 'Always cross-reference client technical documentation against developer prerequisites. Forwarding unconfirmed deliverables creates false assumptions and implementation stalls.',
        explanations: {
          schedule: 'Unconfirmed network access will cause immediate blockers when the team attempts integration testing.',
          risk: 'High probability of bank firewall rejection and security policy violation.',
          governance: 'Incomplete handoff pack violates enterprise infrastructure readiness standards.',
          efficiency: 'Developer time will be lost troubleshooting connectivity issues that could have been resolved upfront.',
        },
      };
      await logSignal(sessionId, {
        dimension: 'trust_and_risk',
        signal_type: 'uat_network_requirements_omitted',
        value: -20,
        description: 'Completed Chapter 3 without verifying network access or firewall configuration.',
      });
    }

    await mutateWorldState(sessionId, (ws) => ({
      ...ws,
      chapter3: {
        state,
        scorecard,
        completed_at: new Date(),
      },
    } as any));

    return scorecard;
  }

  const baseSchedule = ch2Baseline?.scheduleScore ?? 80;
  const baseRisk = ch2Baseline?.riskScore ?? 80;
  const baseGov = ch2Baseline?.governanceScore ?? 80;
  const baseEff = ch2Baseline?.efficiencyScore ?? 80;

  let deltaSchedule = 0;
  let deltaRisk = 0;
  let deltaGov = 0;
  let deltaEff = 0;

  // 1. Escalation Decision Evaluation
  if (state.escalationChoice === 'escalate_aarav') {
    deltaSchedule += 15;
    deltaGov += 20;
    deltaEff += 15;
    deltaRisk += 10;
    await logSignal(sessionId, {
      dimension: 'delivery_governance',
      signal_type: 'escalated_to_pm_promptly',
      value: 15,
      description: 'Player involved PM Aarav immediately upon discovering the integration blocker.',
    });
  } else if (state.escalationChoice === 'investigate_independently') {
    deltaSchedule -= state.escalationRecovered ? 5 : 20;
    deltaEff -= state.escalationRecovered ? 10 : 25;
    deltaGov -= state.escalationRecovered ? 5 : 15;
    await logSignal(sessionId, {
      dimension: 'team_efficiency',
      signal_type: 'isolated_developer_investigation',
      value: -10,
      description: 'Player initially failed to escalate external banking dependency.',
    });
  } else if (state.escalationChoice === 'bypass_gateway') {
    deltaRisk -= state.escalationRecovered ? 15 : 35;
    deltaGov -= state.escalationRecovered ? 10 : 30;
    deltaSchedule -= 15;
    await logSignal(sessionId, {
      dimension: 'trust_and_risk',
      signal_type: 'bypass_gateway_proposed',
      value: -20,
      description: 'Player proposed bypassing bank enterprise integration gateway.',
    });
  }

  // 2. Task 1: Blocker Identification
  if (state.task1Selected === 'protocol_mismatch') {
    deltaGov += 20;
    deltaRisk += 15;
    await logSignal(sessionId, {
      dimension: 'delivery_governance',
      signal_type: 'protocol_mismatch_diagnosed',
      value: 20,
      description: 'Accurately diagnosed JSON/REST vs SOAP/XML protocol mismatch from engineering logs.',
    });
  } else {
    deltaGov -= 15;
    deltaRisk -= 10;
  }

  // 3. Task 2: Integration Approach
  if (state.task2Selected === 'approved_gateway') {
    deltaRisk += 25;
    deltaGov += 25;
    deltaSchedule += 10;
    await logSignal(sessionId, {
      dimension: 'trust_and_risk',
      signal_type: 'approved_gateway_selected',
      value: 25,
      description: 'Selected the bank-approved ESB/API gateway path for protocol translation.',
    });
  } else if (state.task2Selected === 'direct_database') {
    deltaRisk -= state.task2Recovered ? 15 : 40;
    deltaGov -= state.task2Recovered ? 15 : 35;
    deltaSchedule -= 20;
  } else if (state.task2Selected === 'custom_converter') {
    deltaSchedule -= state.task2Recovered ? 10 : 25;
    deltaEff -= state.task2Recovered ? 10 : 25;
    deltaRisk -= 15;
  }

  // 4. Task 3: Sequencing & Nuance Evaluation
  const order = state.task3Order || [];
  const lastAction = order[order.length - 1];
  const isValidateLast = lastAction === 'action_validate_integrate';

  const indexOfC = order.indexOf('action_prepare_mock_tests');
  const indexOfD = order.indexOf('action_validate_integrate');
  const isSafeParallelWorkEarly = indexOfC < indexOfD;

  const indexOfA = order.indexOf('action_confirm_interface');
  const indexOfB = order.indexOf('action_verify_auth');
  const areDependenciesBeforeValidation = indexOfA < indexOfD && indexOfB < indexOfD;

  if (isValidateLast && areDependenciesBeforeValidation) {
    deltaGov += 25;
    deltaRisk += 25;
    await logSignal(sessionId, {
      dimension: 'delivery_governance',
      signal_type: 'validation_properly_gated',
      value: 25,
      description: 'Gated live integration testing until endpoint schema and LDAP/SSO access were confirmed.',
    });
  } else {
    deltaGov -= 35;
    deltaRisk -= 35;
  }

  if (isSafeParallelWorkEarly) {
    deltaEff += 35;
    deltaSchedule += 15;
    await logSignal(sessionId, {
      dimension: 'team_efficiency',
      signal_type: 'parallel_mock_tests_scheduled',
      value: 35,
      description: 'Recognized that local adapter and mock test cases can proceed safely in parallel.',
    });
  } else {
    deltaEff -= 35;
    deltaSchedule -= 20;
  }

  // 5. UI/UX Design Inspection Assignment (Chapter 3)
  if (state.uiDesignSelected === 'design_3') {
    deltaSchedule += 10;
    deltaRisk += 10;
    deltaGov += 10;
    deltaEff += 10;
    await logSignal(sessionId, {
      dimension: 'team_efficiency',
      signal_type: 'balanced_ui_design_selected',
      value: 10,
      description: 'Selected balanced UI design (Option 3) combining usability, clarity, and compliance.',
    });
  } else if (state.uiDesignSelected === 'design_1') {
    deltaSchedule -= 5;
    deltaRisk -= 10;
    deltaEff -= 15;
    await logSignal(sessionId, {
      dimension: 'team_efficiency',
      signal_type: 'visual_first_ui_selected',
      value: -10,
      description: 'Selected visually rich design (Option 1) that introduces friction to high-frequency HR operations.',
    });
  } else if (state.uiDesignSelected === 'design_2') {
    deltaGov += 5;
    deltaRisk += 5;
    deltaEff -= 10;
    await logSignal(sessionId, {
      dimension: 'team_efficiency',
      signal_type: 'functional_dense_ui_selected',
      value: -5,
      description: 'Selected dense enterprise design (Option 2) with high compliance but cluttered usability.',
    });
  }

  const clamp = (val: number) => Math.min(Math.max(Math.round(val), 10), 100);

  const finalSchedule = clamp(baseSchedule + deltaSchedule);
  const finalRisk = clamp(baseRisk + deltaRisk);
  const finalGov = clamp(baseGov + deltaGov);
  const finalEff = clamp(baseEff + deltaEff);

  const totalScore = Math.round((finalSchedule + finalRisk + finalGov + finalEff) / 4);

  let outcomeType: 'strong' | 'partial' | 'poor' = 'poor';
  if (totalScore >= 85 && (state.task2Selected === 'approved_gateway' || state.task2Recovered) && isValidateLast) {
    outcomeType = 'strong';
  } else if (totalScore >= 65) {
    outcomeType = 'partial';
  } else {
    outcomeType = 'poor';
  }

  const scheduleExplanation =
    finalSchedule >= 80
      ? 'You protected delivery velocity by running safe local mock tests in parallel with Bank IT approval cycles.'
      : 'Unnecessary delays occurred from either pausing developers completely or chasing unapproved workarounds.';

  const riskExplanation =
    finalRisk >= 80
      ? 'You adhered strictly to enterprise security boundaries, avoiding direct database hacks and unapproved converters.'
      : 'The project carried audit and compliance risk due to attempts to bypass enterprise gateway governance.';

  const governanceExplanation =
    finalGov >= 80
      ? 'You ensured the bank interface schema and LDAP/SSO access dependencies were formally validated before live testing.'
      : 'Governance was compromised by treating unverified dependencies as ready for integration testing.';

  const efficiencyExplanation =
    finalEff >= 80
      ? 'Daniel remained highly productive writing adapters and test suites against mock data while external teams reviewed schemas.'
      : 'Engineering velocity suffered because external dependencies were not separated from mock development.';

  const outcomeText =
    outcomeType === 'strong'
      ? 'The team successfully contained the integration blocker, selected the approved enterprise gateway, and scheduled parallel mock testing without violating bank security.'
      : outcomeType === 'partial'
      ? 'You identified the core integration problem, but experienced friction in dependency sequencing or initial escalation alignment.'
      : 'The integration approach risked enterprise compliance or stalled engineering velocity. Realigning on approved gateway standards is required.';

  let personalizedTakeaway = '';
  if (state.task1Selected === 'protocol_mismatch' && state.task2Selected === 'approved_gateway' && isSafeParallelWorkEarly) {
    personalizedTakeaway =
      'You identified the protocol mismatch and preserved engineering progress while keeping security requirements intact.';
  } else if (state.escalationChoice === 'bypass_gateway' || state.task2Selected === 'direct_database') {
    personalizedTakeaway =
      'You recognized the danger of bypassing enterprise controls and corrected your course before violating bank security policies.';
  } else if (state.escalationChoice === 'investigate_independently') {
    personalizedTakeaway =
      'You learned that technical blockers tied to enterprise architecture require prompt project management escalation rather than isolated developer investigation.';
  } else {
    personalizedTakeaway =
      'You navigated enterprise integration trade-offs, establishing that safe mocks can proceed while external gateway schemas are validated.';
  }

  const scorecard: Chapter3EvaluationResult = {
    scheduleScore: finalSchedule,
    riskScore: finalRisk,
    governanceScore: finalGov,
    efficiencyScore: finalEff,
    totalScore,
    outcomeType,
    outcomeText,
    personalizedTakeaway,
    explanations: {
      schedule: scheduleExplanation,
      risk: riskExplanation,
      governance: governanceExplanation,
      efficiency: efficiencyExplanation,
    },
  };

  // Mutate WorldState to persist results
  await mutateWorldState(sessionId, (ws) => ({
    ...ws,
    chapter3: {
      state,
      scorecard,
      completed_at: new Date(),
    },
  } as any));

  return scorecard;
}
