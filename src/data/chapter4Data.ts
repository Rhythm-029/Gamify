import type {
  Chapter4State,
  Chapter4Scorecard,
  Chapter4ReleasePhase,
  Chapter4ScheduleAssessment,
  Chapter4TechnicalDependency,
  Chapter4SecurityAssessment,
  Chapter4BusinessValueAssessment,
  Chapter4ApprovalAssessment,
  Chapter4FinalRecommendation,
  Chapter4OutcomeType,
} from '../types/chapter4';

export const CHAPTER4_TITLE = 'Change Request & Impact Analysis';
export const CHAPTER4_SUBTITLE = 'Scope Gating, Release Planning & Technical Impact Assessment';

// ── CHANGE REQUESTS ──
export interface ChangeRequestItem {
  id: string;
  badge: 'NEW' | 'UNDER REVIEW' | 'APPROVED' | 'DEFERRED';
  badgeColor: string;
  title: string;
  description: string;
  requestedBy: string;
  timeAgo: string;
  iconType: 'calculator' | 'language' | 'upload';
  requestedRelease: string;
  projectDeadline: string;
  knownConcerns: string[];
  estimatedEffort: string;
  effortNote: string;
}

export const CHANGE_REQUESTS_LIST: ChangeRequestItem[] = [
  {
    id: 'CR-017',
    badge: 'NEW',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    title: 'Dynamic Bonus Calculator',
    description: 'Calculate proposed bonus based on appraisal rating with regional rules.',
    requestedBy: 'Sophia (Head of HR)',
    timeAgo: 'Today',
    iconType: 'calculator',
    requestedRelease: 'Phase 1',
    projectDeadline: '90 days',
    knownConcerns: [
      'Regional bonus rules have not been confirmed or documented.',
      'Payroll integration requirement is not yet validated with Core Banking.',
      'Development effort has not been estimated by engineering.',
      'Security and approval requirements for compensation data need review.',
    ],
    estimatedEffort: '3 – 5 weeks',
    effortNote: 'Actual effort to be confirmed by engineering',
  },
  {
    id: 'CR-018',
    badge: 'NEW',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    title: 'Multi-language Support',
    description: 'Add Hindi and regional language support for HR portal.',
    requestedBy: 'Regional HR - North',
    timeAgo: '2 days ago',
    iconType: 'language',
    requestedRelease: 'Phase 2',
    projectDeadline: '90 days',
    knownConcerns: [
      'Translation strings pending from regional localization committees.',
      'Font rendering compatibility in legacy desktop environments.',
    ],
    estimatedEffort: '2 – 3 weeks',
    effortNote: 'Requires localized content approval',
  },
  {
    id: 'CR-019',
    badge: 'UNDER REVIEW',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    title: 'Bulk Employee Upload',
    description: 'Allow bulk upload of employee data for new joinees.',
    requestedBy: 'HR Operations',
    timeAgo: '3 days ago',
    iconType: 'upload',
    requestedRelease: 'Phase 2',
    projectDeadline: '90 days',
    knownConcerns: [
      'CSV schema alignment with Core HR master tables.',
      'Bulk error rollback handling in case of validation failures.',
    ],
    estimatedEffort: '1 – 2 weeks',
    effortNote: 'Under technical feasibility review',
  },
];

// ── RELEASE PLAN CARDS ──
export interface ReleaseFeature {
  id: string;
  title: string;
  description: string;
  icon: 'appraisals' | 'attendance' | 'form16' | 'calculator';
  defaultPhase: Chapter4ReleasePhase;
  badge?: string;
}

export const INITIAL_RELEASE_FEATURES: ReleaseFeature[] = [
  {
    id: 'feat_appraisals',
    title: 'Appraisals',
    description: 'Performance reviews, ratings, feedback',
    icon: 'appraisals',
    defaultPhase: 'phase_1',
  },
  {
    id: 'feat_attendance',
    title: 'Attendance',
    description: 'Employee attendance and leave',
    icon: 'attendance',
    defaultPhase: 'phase_1',
  },
  {
    id: 'feat_form16',
    title: 'Form 16 Downloads',
    description: 'Annual tax statements (Form 16)',
    icon: 'form16',
    defaultPhase: 'phase_2',
  },
  {
    id: 'CR-017',
    title: 'Dynamic Bonus Calculator',
    description: 'Calculate proposed bonus based on appraisal rating with regional rules.',
    icon: 'calculator',
    defaultPhase: 'unscheduled',
    badge: 'NEW CHANGE REQUEST',
  },
];

// ── TASK 2: FIVE ASSESSMENT AREAS ──
export interface AssessmentOption<T> {
  id: T;
  label: string;
  description?: string;
  isRecommended?: boolean;
  isRisky?: boolean;
}

export const SCHEDULE_ASSESSMENT_OPTIONS: AssessmentOption<Chapter4ScheduleAssessment>[] = [
  {
    id: 'needs_validation',
    label: 'Feasibility needs validation',
    description: 'Engineering estimate unknown; dependencies unconfirmed before promising delivery.',
    isRecommended: true,
  },
  {
    id: 'not_feasible_current',
    label: 'Not feasible for the current release',
    description: '90-day deadline is fixed and cannot absorb 3–5 weeks of unestimated scope.',
  },
  {
    id: 'confirmed_feasible',
    label: 'Confirmed feasible',
    description: 'Commit delivery inside Phase 1 immediately without engineering estimation.',
    isRisky: true,
  },
];

export const TECHNICAL_DEPENDENCY_OPTIONS: AssessmentOption<Chapter4TechnicalDependency>[] = [
  {
    id: 'dep_regional_rules',
    label: 'Confirm the regional bonus calculation rules',
    description: 'Need exact formula documentation from regional HR heads before coding.',
    isRecommended: true,
  },
  {
    id: 'dep_payroll_integration',
    label: 'Validate whether payroll integration is required',
    description: 'Check if calculator must post financial records directly into Core Payroll ESB.',
    isRecommended: true,
  },
  {
    id: 'dep_effort_estimate',
    label: 'Ask development to estimate the implementation effort',
    description: 'Require Daniel and engineering team to size effort before promising dates.',
    isRecommended: true,
  },
  {
    id: 'dep_immediate_start',
    label: 'Begin implementation immediately and resolve dependencies later',
    description: 'Start coding UI prototypes and hope external dependencies resolve in flight.',
    isRisky: true,
  },
  {
    id: 'dep_assume_api',
    label: 'Assume the existing Appraisal API supports everything required',
    description: 'Treat legacy interfaces as already compatible without schema verification.',
    isRisky: true,
  },
];

export const SECURITY_ASSESSMENT_OPTIONS: AssessmentOption<Chapter4SecurityAssessment>[] = [
  {
    id: 'review_access_controls',
    label: 'Review access controls and security requirements before implementation',
    description: 'Compensation data is sensitive; enforce role-based permissions and audit logs.',
    isRecommended: true,
  },
  {
    id: 'confirm_approvals',
    label: 'Confirm the required approvals and data-access rules with appropriate stakeholders',
    description: 'Verify data visibility boundaries with ICICI Bank infosec and compliance teams.',
    isRecommended: true,
  },
  {
    id: 'reuse_existing',
    label: 'Reuse existing permissions without checking whether they are sufficient',
    description: 'Assume general manager permissions suffice for bonus calculations.',
    isRisky: true,
  },
  {
    id: 'allow_all_hr_users',
    label: 'Allow all HR users to access the feature and review permissions later',
    description: 'Grant broad access to expedite regional testing, deferring security gates.',
    isRisky: true,
  },
];

export const BUSINESS_VALUE_OPTIONS: AssessmentOption<Chapter4BusinessValueAssessment>[] = [
  {
    id: 'balance_and_evaluate',
    label: 'Recognise its value and evaluate it against existing scope, effort, and dependencies',
    description: 'Balance client excitement with realistic constraints; evaluate thoroughly.',
    isRecommended: true,
  },
  {
    id: 'accept_immediately',
    label: 'Accept it immediately because the client considers it valuable',
    description: 'Commit on the spot without impact analysis to please client leadership.',
    isRisky: true,
  },
  {
    id: 'reject_outright',
    label: 'Reject it because the project already has a deadline',
    description: 'Refuse to evaluate the request, alienating client regional stakeholders.',
    isRisky: true,
  },
  {
    id: 'move_all_to_phase2',
    label: 'Move all existing Phase 1 work to Phase 2 to make room for it',
    description: 'Disrupt committed core appraisal delivery to accommodate bonus tool.',
    isRisky: true,
  },
];

export const APPROVAL_ASSESSMENT_OPTIONS: AssessmentOption<Chapter4ApprovalAssessment>[] = [
  {
    id: 'record_cr_and_validate',
    label: 'Record CR-017, complete technical impact assessment, and obtain required approvals',
    description: 'Enforce formal governance before altering the baseline release commitment.',
    isRecommended: true,
  },
  {
    id: 'verbal_request_final',
    label: "Treat Sophia's verbal request as final approval",
    description: 'Bypass formal change control because client executive requested it.',
    isRisky: true,
  },
  {
    id: 'start_and_document_later',
    label: 'Ask the developers to start work and document the decision later',
    description: 'Sprint headfirst into development without an approved change order.',
    isRisky: true,
  },
  {
    id: 'reject_without_recording',
    label: 'Reject the request without recording it',
    description: 'Drop the ticket informally without audit trail or formal justification.',
    isRisky: true,
  },
];

// ── TASK 3: FINAL RECOMMENDATIONS ──
export interface RecommendationOption {
  id: Chapter4FinalRecommendation;
  letter: 'A' | 'B' | 'C' | 'D';
  title: string;
  description: string;
  isRecommended?: boolean;
}

export const FINAL_RECOMMENDATION_OPTIONS: RecommendationOption[] = [
  {
    id: 'evaluate_without_compromise',
    letter: 'C',
    title: 'Keep the release commitment unchanged while evaluating CR-017',
    description:
      'Record the request, validate its technical impact and dependencies, obtain the necessary approvals, and decide whether it can fit Phase 1 without compromising existing commitments.',
    isRecommended: true,
  },
  {
    id: 'defer_phase2',
    letter: 'B',
    title: 'Defer to Phase 2',
    description:
      'Move the feature to Phase 2 and evaluate it for a future release to protect the 90-day Phase 1 baseline.',
  },
  {
    id: 'commit_phase1',
    letter: 'A',
    title: 'Commit to Phase 1',
    description:
      'Accept the request and commit to delivering it within the current 90-day release.',
  },
  {
    id: 'reject_request',
    letter: 'D',
    title: 'Reject the request',
    description:
      'Decline the change because the existing scope is already committed.',
  },
];

// ── INITIAL STATE ──
export const INITIAL_CHAPTER4_STATE: Chapter4State = {
  entered: false,
  meetingStatus: 'not_started',
  studioAccessGranted: false,
  selectedChangeRequestId: 'CR-017',
  cr017Status: 'New',

  featurePlacement: {
    feat_appraisals: 'phase_1',
    feat_attendance: 'phase_1',
    feat_form16: 'phase_2',
    'CR-017': 'unscheduled',
  },
  task1Complete: false,

  assessmentSchedule: null,
  assessmentDependencies: [],
  assessmentSecurity: null,
  assessmentBusinessValue: null,
  assessmentApproval: null,
  task2Complete: false,

  finalRecommendation: null,
  writtenJustification: '',
  task3Complete: false,

  submitted: false,
  isEvaluating: false,
  scorecard: {
    shown: false,
    scheduleScore: 80,
    riskScore: 80,
    governanceScore: 80,
    efficiencyScore: 80,
    totalScore: 80,
    outcomeType: 'mixed',
    outcomeText: 'Assessment submitted',
    strongestMove: '',
    oneThingToImprove: '',
    leadershipTakeaway:
      'Every new request deserves a fair assessment. Protecting delivery means understanding the impact before making a commitment.',
    explanations: {
      schedule: '',
      risk: '',
      governance: '',
      efficiency: '',
    },
  },
  completed: false,
  outcomeDialogueDelivered: false,
};

// ── DETERMINISTIC SCORING ENGINE ──
export function computeChapter4Score(
  state: Chapter4State,
  initialScores?: {
    scheduleScore?: number;
    riskScore?: number;
    governanceScore?: number;
    efficiencyScore?: number;
  }
): Chapter4Scorecard {
  let schedule = initialScores?.scheduleScore ?? 75;
  let risk = initialScores?.riskScore ?? 75;
  let governance = initialScores?.governanceScore ?? 75;
  let efficiency = initialScores?.efficiencyScore ?? 75;

  let deltaSchedule = 0;
  let deltaRisk = 0;
  let deltaGov = 0;
  let deltaEff = 0;

  // 1. Release Plan Placement for CR-017
  const crPlacement = state.featurePlacement['CR-017'];
  if (crPlacement === 'phase_2') {
    // Prudent deferral protects baseline
    deltaSchedule += 15;
    deltaRisk += 15;
    deltaGov += 10;
  } else if (crPlacement === 'phase_1') {
    // Adding to Phase 1 requires strong conditions
    if (state.assessmentSchedule === 'confirmed_feasible') {
      // Reckless commitment
      deltaSchedule -= 25;
      deltaRisk -= 25;
      deltaGov -= 20;
    } else {
      // Conditional exploration
      deltaSchedule -= 10;
      deltaRisk -= 5;
    }
  } else {
    // Unscheduled / In-triage
    deltaGov += 10;
    deltaSchedule += 5;
  }

  // 2. Schedule & Timeline Assessment
  if (state.assessmentSchedule === 'needs_validation') {
    deltaSchedule += 20;
    deltaGov += 15;
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

  let validDepsCount = 0;
  if (selectedRules) validDepsCount++;
  if (selectedPayroll) validDepsCount++;
  if (selectedEstimate) validDepsCount++;

  deltaGov += validDepsCount * 8;
  deltaEff += validDepsCount * 8;

  if (selectedImmediate) {
    deltaEff -= 25;
    deltaRisk -= 25;
    deltaGov -= 20;
  }
  if (selectedAssumeApi) {
    deltaRisk -= 25;
    deltaGov -= 20;
  }

  // 4. Security & Compliance Assessment
  if (state.assessmentSecurity === 'review_access_controls') {
    deltaRisk += 25;
    deltaGov += 20;
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

  // 8. Written Justification Evaluation
  const text = (state.writtenJustification || '').toLowerCase();
  const mentionsDeadline = text.includes('90') || text.includes('deadline') || text.includes('schedule') || text.includes('timeline');
  const mentionsDependencies = text.includes('depend') || text.includes('payroll') || text.includes('regional') || text.includes('rule');
  const mentionsEstimate = text.includes('estimate') || text.includes('effort') || text.includes('development') || text.includes('daniel');
  const mentionsApproval = text.includes('approval') || text.includes('governance') || text.includes('record') || text.includes('security');

  let justificationPoints = 0;
  if (mentionsDeadline) justificationPoints += 5;
  if (mentionsDependencies) justificationPoints += 5;
  if (mentionsEstimate) justificationPoints += 5;
  if (mentionsApproval) justificationPoints += 5;

  deltaSchedule += justificationPoints;
  deltaGov += justificationPoints;
  deltaRisk += justificationPoints;
  deltaEff += justificationPoints;

  // Apply deltas and clamp to [10, 100]
  const clamp = (val: number) => Math.max(10, Math.min(100, Math.round(val)));

  const finalSchedule = clamp(schedule + deltaSchedule);
  const finalRisk = clamp(risk + deltaRisk);
  const finalGov = clamp(governance + deltaGov);
  const finalEff = clamp(efficiency + deltaEff);

  const totalScore = Math.round((finalSchedule + finalRisk + finalGov + finalEff) / 4);

  let outcomeType: Chapter4OutcomeType = 'mixed';
  let outcomeText = 'Further Assessment Required';
  if (totalScore >= 80) {
    outcomeType = 'strong';
    outcomeText = 'Impact Assessment in Progress';
  } else if (totalScore < 55) {
    outcomeType = 'weak';
    outcomeText = 'Assessment Incomplete';
  }

  // Strongest move & One thing to improve observations
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

  // Explanations for each metric
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

  return {
    shown: true,
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

// ── SESSION STORAGE HELPERS ──
let sessionChapter4State: Chapter4State = { ...INITIAL_CHAPTER4_STATE };

export function getChapter4SessionState(): Chapter4State {
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    const raw = globalThis.localStorage.getItem('brained_chapter4_state');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        sessionChapter4State = { ...INITIAL_CHAPTER4_STATE, ...parsed };
      } catch {
        // ignore parse errors
      }
    }
  }
  return { ...sessionChapter4State };
}

export function setChapter4SessionState(
  updater: Partial<Chapter4State> | ((prev: Chapter4State) => Chapter4State)
) {
  if (typeof updater === 'function') {
    sessionChapter4State = updater(sessionChapter4State);
  } else {
    sessionChapter4State = { ...sessionChapter4State, ...updater };
  }
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    try {
      globalThis.localStorage.setItem('brained_chapter4_state', JSON.stringify(sessionChapter4State));
    } catch {
      // ignore localStorage quota errors
    }
  }
}

export function resetChapter4SessionState() {
  sessionChapter4State = {
    ...INITIAL_CHAPTER4_STATE,
    featurePlacement: { ...INITIAL_CHAPTER4_STATE.featurePlacement },
    assessmentDependencies: [...INITIAL_CHAPTER4_STATE.assessmentDependencies],
    scorecard: { ...INITIAL_CHAPTER4_STATE.scorecard },
  };
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    try {
      globalThis.localStorage.removeItem('brained_chapter4_state');
    } catch {
      // ignore
    }
  }
}
