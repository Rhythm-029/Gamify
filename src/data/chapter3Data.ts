import type {
  Chapter3State,
  Chapter3DecisionKey,
  Chapter3ActionKey,
  Chapter3OutcomeType,
  DataMismatchRecord,
  Chapter3Scorecard,
} from '../types/chapter3';

export const INITIAL_CHAPTER3_STATE: Chapter3State = {
  entered: false,
  activeBeat: 'warning',
  decision: null,
  decisionFeedback: null,
  selectedActions: [],
  planSubmitted: false,
  scorecard: {
    shown: false,
    scheduleScore: 0,
    riskScore: 0,
    governanceScore: 0,
    efficiencyScore: 0,
    totalScore: 0,
    outcomeType: 'partial',
    outcomeText: '',
    explanations: {
      schedule: '',
      risk: '',
      governance: '',
      efficiency: '',
    },
  },
  completed: false,
};

export interface DecisionOptionConfig {
  key: Chapter3DecisionKey;
  label: string;
  badge: string;
  description: string;
  feedback: string;
  quality: 'poor' | 'suboptimal' | 'optimal';
}

export const CHAPTER3_DECISION_OPTIONS: DecisionOptionConfig[] = [
  {
    key: 'continue_demo_as_ready',
    badge: 'Option A',
    label: 'Continue and demonstrate the prototype as ready',
    description:
      'Keep development moving and address the mismatches later, once the business team has reviewed the demo.',
    feedback:
      'We might save a few minutes now, but presenting unverified data could create much bigger problems later. Think about what we can safely validate before sign-off.',
    quality: 'poor',
  },
  {
    key: 'stop_all_development',
    badge: 'Option B',
    label: 'Stop all development until every record is manually checked',
    description:
      'Pause the entire team and validate every employee record before allowing any further development.',
    feedback:
      'Validation matters, but we don\'t need to freeze unrelated work. Can we isolate the affected records and keep the rest of the team productive?',
    quality: 'suboptimal',
  },
  {
    key: 'contain_and_validate_affected',
    badge: 'Option C',
    label: 'Contain the issue and validate affected records',
    description:
      'Isolate the affected test records, verify the employee-ID mapping and leave-balance source, assign Daniel to investigate, and continue unaffected development.',
    feedback:
      'Exactly. Contain the issue, establish what is wrong, and keep unaffected work moving. Let\'s make the validation plan explicit.',
    quality: 'optimal',
  },
];

export interface ValidationActionConfig {
  key: Chapter3ActionKey;
  label: string;
  description: string;
  role: 'Containment' | 'Validation' | 'Accountability';
}

export const CHAPTER3_VALIDATION_ACTIONS: ValidationActionConfig[] = [
  {
    key: 'isolate_affected_records',
    label: 'Isolate affected records',
    description:
      'Keep the suspect appraisal records and leave-balance entries out of the ready-for-sign-off set.',
    role: 'Containment',
  },
  {
    key: 'verify_source_mappings',
    label: 'Verify source mappings',
    description:
      'Compare employee IDs against the authoritative employee data and reconcile leave balances against their approved source.',
    role: 'Validation',
  },
  {
    key: 'assign_owner_continue_unaffected_work',
    label: 'Assign Daniel and continue safe work',
    description:
      'Make Daniel accountable for investigating the mismatches while other developers continue unaffected tasks.',
    role: 'Accountability',
  },
];

export const PROTOTYPE_DATA_MISMATCHES: DataMismatchRecord[] = [
  {
    id: 'MISMATCH-01',
    module: 'Appraisal Cycle',
    employeeId: 'EMP-84021',
    employeeName: 'Rohan Verma',
    field: 'Appraisal Reviewer ID & Rating Map',
    prototypeValue: 'Rating: Exceeds Expectations (Linked to EMP-84099)',
    authoritativeSourceValue: 'Linked to MGR-1042 (Priya Sharma)',
    severity: 'Critical',
    status: 'Flagged',
  },
  {
    id: 'MISMATCH-02',
    module: 'Appraisal Cycle',
    employeeId: 'EMP-61204',
    employeeName: 'Aditi Rao',
    field: 'Appraisal Band & Cycle Eligibility',
    prototypeValue: 'Band C · Mid-Cycle Active (Mapped to EMP-61900)',
    authoritativeSourceValue: 'Band B · Probationary Ineligible',
    severity: 'High',
    status: 'Flagged',
  },
  {
    id: 'MISMATCH-03',
    module: 'Leave & Attendance',
    employeeId: 'EMP-10492',
    employeeName: 'Vikram Joshi',
    field: 'Casual Leave Available Balance',
    prototypeValue: '24.0 Days Displayed',
    authoritativeSourceValue: '12.0 Days in ICICI Authoritative DB',
    severity: 'Critical',
    status: 'Flagged',
  },
  {
    id: 'MISMATCH-04',
    module: 'Leave & Attendance',
    employeeId: 'EMP-33918',
    employeeName: 'Ananya Desai',
    field: 'Privilege Leave Accrual Computation',
    prototypeValue: '-3.0 Days (Underflow Display Error)',
    authoritativeSourceValue: '15.0 Days in ICICI Authoritative DB',
    severity: 'High',
    status: 'Flagged',
  },
];

export const CHAPTER3_CLOSING_INSIGHT =
  'Delivery speed matters. Reliable delivery means knowing which work can continue safely and which data must be verified first.';

// ── EVALUATION & SCORING CALCULATOR ──

export function computeChapter3Score(
  state: Chapter3State,
  ch2Scorecard?: any
): Chapter3Scorecard {
  // Use Chapter 2 scorecard as prior baseline if available, or fall back to 80
  const baseSchedule = ch2Scorecard?.scheduleScore && ch2Scorecard.scheduleScore > 0 ? ch2Scorecard.scheduleScore : 80;
  const baseRisk = ch2Scorecard?.riskScore && ch2Scorecard.riskScore > 0 ? ch2Scorecard.riskScore : 80;
  const baseGov = ch2Scorecard?.governanceScore && ch2Scorecard.governanceScore > 0 ? ch2Scorecard.governanceScore : 80;
  const baseEff = ch2Scorecard?.efficiencyScore && ch2Scorecard.efficiencyScore > 0 ? ch2Scorecard.efficiencyScore : 80;

  let deltaSchedule = 0;
  let deltaRisk = 0;
  let deltaGov = 0;
  let deltaEff = 0;

  // 1. Initial Decision Impact
  let scheduleDecisionPart = '';
  let riskDecisionPart = '';
  let govDecisionPart = '';
  let effDecisionPart = '';

  if (state.decision === 'continue_demo_as_ready') {
    deltaSchedule -= 15;
    deltaRisk -= 35;
    deltaGov -= 30;
    deltaEff -= 15;
    scheduleDecisionPart = 'Presenting unverified data created substantial risk of stakeholder rejection and subsequent rework.';
    riskDecisionPart = 'You chose to demonstrate unvalidated prototype records, knowingly exposing executive sign-off to data errors.';
    govDecisionPart = 'Demonstrating unverified records directly violated delivery gate criteria.';
    effDecisionPart = 'Premature demo of corrupted data causes reactive fire-drills that destroy engineering momentum.';
  } else if (state.decision === 'stop_all_development') {
    deltaSchedule -= 25;
    deltaRisk += 10;
    deltaGov += 10;
    deltaEff -= 30;
    scheduleDecisionPart = 'Freezing the entire team for an isolated prototype defect created unnecessary schedule delay.';
    riskDecisionPart = 'Halting work demonstrated risk awareness, but stopping unrelated tracks showed disproportionate caution.';
    govDecisionPart = 'Prioritizing data integrity recognized governance importance, though shutting down all development was overly broad.';
    effDecisionPart = 'Pausing unaffected developers severely damaged team velocity without accelerating root-cause resolution.';
  } else if (state.decision === 'contain_and_validate_affected') {
    deltaSchedule += 15;
    deltaRisk += 20;
    deltaGov += 20;
    deltaEff += 15;
    scheduleDecisionPart = 'Controlled containment protected the appraisal timeline while preventing avoidable rework.';
    riskDecisionPart = 'You immediately isolated suspect records, establishing proactive risk management without hiding defects.';
    govDecisionPart = 'Exemplary delivery governance: defect boundaries were defined and unverified data kept out of release sets.';
    effDecisionPart = 'You preserved engineering velocity by keeping unaffected developers active while Daniel investigated.';
  } else {
    // No decision chosen (edge case fallback)
    deltaRisk -= 20;
    deltaGov -= 20;
    riskDecisionPart = 'No containment decision was recorded.';
  }

  // 2. Operational Validation Plan Impact
  const hasIsolate = state.selectedActions.includes('isolate_affected_records');
  const hasVerify = state.selectedActions.includes('verify_source_mappings');
  const hasAssign = state.selectedActions.includes('assign_owner_continue_unaffected_work');

  let outcomeType: Chapter3OutcomeType = 'partial';
  let outcomeText = '';
  let schedulePlanPart = '';
  let riskPlanPart = '';
  let govPlanPart = '';
  let effPlanPart = '';

  const totalActionsCount = (hasIsolate ? 1 : 0) + (hasVerify ? 1 : 0) + (hasAssign ? 1 : 0);

  if (totalActionsCount === 3) {
    // Full operational response
    deltaSchedule += 15;
    deltaRisk += 20;
    deltaGov += 20;
    deltaEff += 15;

    outcomeType = state.decision === 'continue_demo_as_ready' ? 'partial' : 'strong';
    outcomeText =
      'Data issue contained. Daniel is investigating the affected records, source validation is underway, and unaffected development can continue.';

    schedulePlanPart = 'The complete validation plan ensured targeted verification without slowing down clean delivery tracks.';
    riskPlanPart = 'Suspect appraisal and leave records were quarantined while source reconciliation removed data ambiguity.';
    govPlanPart = 'Clear technical ownership and explicit containment boundaries established high-standard delivery discipline.';
    effPlanPart = 'Assigning Daniel to investigate while others continued safe tasks maintained optimal velocity.';
  } else if (hasAssign && !hasIsolate && !hasVerify) {
    // Critical pitfall: continuing work WITHOUT isolating or verifying
    deltaSchedule -= 15;
    deltaRisk -= 30;
    deltaGov -= 30;
    deltaEff += 5;

    outcomeType = 'poor';
    outcomeText =
      'The data inconsistencies remain insufficiently controlled. The team needs a clear containment and validation plan before affected modules can be considered ready.';

    schedulePlanPart = 'Allowing unaffected work to proceed without quarantining bad records creates unavoidable future rework.';
    riskPlanPart = 'Failing to isolate defective test data left unverified numbers in the sign-off pipeline.';
    govPlanPart = 'Continuing development without containment or source verification compromised release readiness.';
    effPlanPart = 'Developers continued coding, but without containment gates, the output rests on questionable data.';
  } else if (totalActionsCount > 0) {
    // Partial operational response
    if (hasIsolate) {
      deltaRisk += 10;
      deltaGov += 10;
    }
    if (hasVerify) {
      deltaGov += 10;
      deltaSchedule += 5;
    }
    if (hasAssign) {
      deltaEff += 10;
      deltaSchedule += 5;
    }

    outcomeType = 'partial';
    outcomeText =
      'The team has recognized the data risk, but the validation plan still has gaps. Unverified records must remain outside sign-off.';

    const missing: string[] = [];
    if (!hasIsolate) missing.push('record isolation');
    if (!hasVerify) missing.push('authoritative source verification');
    if (!hasAssign) missing.push('ownership assignment with unaffected continuation');

    schedulePlanPart = `Partial validation was planned, but omitting ${missing.join(' and ')} creates potential delivery drag.`;
    riskPlanPart = hasIsolate
      ? 'Suspect records were quarantined, though validation gaps still remain.'
      : 'Records were not formally isolated, leaving unverified numbers at risk of accidental promotion.';
    govPlanPart = hasVerify
      ? 'Source mapping verification was captured, but delivery governance remains incomplete without all three controls.'
      : 'Authoritative data reconciliation was omitted from the response plan.';
    effPlanPart = hasAssign
      ? 'Accountability was assigned, but the incomplete plan leaves team velocity subject to future disruptions.'
      : 'Engineering ownership was unassigned, leaving resolution coordination diffuse.';
  } else {
    // Empty plan submitted — complete lack of operational follow-through
    deltaSchedule -= 25;
    deltaRisk -= 35;
    deltaGov -= 35;
    deltaEff -= 25;

    outcomeType = 'poor';
    outcomeText =
      'The data inconsistencies remain insufficiently controlled. The team needs a clear containment and validation plan before affected modules can be considered ready.';

    schedulePlanPart = 'With no validation plan confirmed, timeline integrity remains exposed to data failure.';
    riskPlanPart = 'No operational risk mitigations were applied to the flagged test records.';
    govPlanPart = 'Zero containment or validation controls were enacted.';
    effPlanPart = 'Lack of operational clarity leaves engineering stalled and uncoordinated.';
  }

  // Normalize and clamp to 10–100 scale
  const clamp = (val: number, min = 10, max = 100) => Math.min(Math.max(Math.round(val), min), max);

  const finalSchedule = clamp(baseSchedule + deltaSchedule);
  const finalRisk = clamp(baseRisk + deltaRisk);
  const finalGov = clamp(baseGov + deltaGov);
  const finalEff = clamp(baseEff + deltaEff);

  const totalScore = Math.round((finalSchedule + finalRisk + finalGov + finalEff) / 4);

  return {
    shown: true,
    scheduleScore: finalSchedule,
    riskScore: finalRisk,
    governanceScore: finalGov,
    efficiencyScore: finalEff,
    totalScore,
    outcomeType,
    outcomeText,
    explanations: {
      schedule: `${scheduleDecisionPart} ${schedulePlanPart}`.trim(),
      risk: `${riskDecisionPart} ${riskPlanPart}`.trim(),
      governance: `${govDecisionPart} ${govPlanPart}`.trim(),
      efficiency: `${effDecisionPart} ${effPlanPart}`.trim(),
    },
  };
}

// ── SESSION STORAGE HELPERS ──

let sessionChapter3State: Chapter3State = loadInitialChapter3State();

function loadInitialChapter3State(): Chapter3State {
  try {
    const raw = localStorage.getItem('brained_chapter3_state');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...INITIAL_CHAPTER3_STATE,
          ...parsed,
          scorecard: {
            ...INITIAL_CHAPTER3_STATE.scorecard,
            ...(parsed.scorecard || {}),
          },
        };
      }
    }
  } catch {}
  return {
    ...INITIAL_CHAPTER3_STATE,
    scorecard: { ...INITIAL_CHAPTER3_STATE.scorecard },
  };
}

export function getChapter3SessionState(): Chapter3State {
  return { ...sessionChapter3State };
}

export function setChapter3SessionState(
  updater: Partial<Chapter3State> | ((prev: Chapter3State) => Chapter3State)
) {
  if (typeof updater === 'function') {
    sessionChapter3State = updater(sessionChapter3State);
  } else {
    sessionChapter3State = { ...sessionChapter3State, ...updater };
  }
  try {
    localStorage.setItem('brained_chapter3_state', JSON.stringify(sessionChapter3State));
  } catch {}
}

export function resetChapter3SessionState() {
  sessionChapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    scorecard: { ...INITIAL_CHAPTER3_STATE.scorecard },
  };
  try {
    localStorage.removeItem('brained_chapter3_state');
  } catch {}
}
