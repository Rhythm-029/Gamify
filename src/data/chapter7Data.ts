/**
 * chapter7Data.ts
 * Master data, evaluation logic & session state for Chapter 7:
 * PRODUCTION ISSUES & ROOT CAUSE ANALYSIS (RCA) · INC-0241
 */

import type {
  Chapter7State,
  Chapter7Scorecard,
  Activity1Card,
  Activity1CardId,
  RcaFieldDefinition,
  PreventionActionCard,
  PreventionActionId,
  Chapter7OutcomeType,
  Chapter7DecisionChoice,
} from '../types/chapter7';

export const INCIDENT_ID = 'INC-0241';
export const INCIDENT_SEVERITY = 'SEV-2';
export const INCIDENT_SERVICE = 'Attendance Sync';
export const INCIDENT_ERROR = '504 Gateway Timeout';
export const INCIDENT_USERS_AFFECTED = 12;

export const CHAPTER7_TITLE = 'Production Issues & Root Cause Analysis (RCA)';
export const CHAPTER7_SUBTITLE = 'Emergency Incident War Room & Root Cause Analysis';
export const CHAPTER7_LEARNING_TAKEAWAY =
  'Fixing a production bug is only half the battle. Publishing a structured RCA ensures the underlying architectural flaw is permanently resolved and monitored.';

// ── DECISION CHOICES (Scene 7.1) ──
export interface Chapter7DecisionDefinition {
  id: Chapter7DecisionChoice;
  label: string;
  isRecommended: boolean;
  scoreImpact: {
    governance: number;
    risk: number;
    efficiency: number;
  };
  feedback: string;
}

export const CHAPTER7_DECISION_CHOICES: Record<Chapter7DecisionChoice, Chapter7DecisionDefinition> = {
  choice_a: {
    id: 'choice_a',
    label: 'Push the hotfix silently without logging an incident ticket or RCA.',
    isRecommended: false,
    scoreImpact: {
      governance: -30,
      risk: -25,
      efficiency: 0,
    },
    feedback:
      'Incorrect approach: Pushing patches silently bypasses engineering governance and leaves no incident ticket or RCA. When the memory leak returns, engineering will have no diagnostic trace or automated monitoring.',
  },
  choice_b: {
    id: 'choice_b',
    label:
      'Deploy the hotfix patch, publish a comprehensive RCA report to engineering leads, and update automated monitoring thresholds.',
    isRecommended: true,
    scoreImpact: {
      governance: 25,
      risk: 20,
      efficiency: 15,
    },
    feedback:
      'Recommended approach: Combines immediate service restoration with disciplined engineering governance, root cause diagnosis, and proactive recurrence prevention.',
  },
};

// ── ACTIVITY 1: RESTORE SERVICE CARDS ──
export const ACTIVITY_1_CARDS: Activity1Card[] = [
  {
    id: 'confirm_scope',
    letter: 'A',
    title: 'Confirm affected service and scope',
    description: 'Confirm the affected service and scope of the incident.',
  },
  {
    id: 'deploy_hotfix',
    letter: 'B',
    title: 'Deploy reviewed hotfix patch',
    description: 'Deploy the reviewed hotfix patch.',
  },
  {
    id: 'verify_sync',
    letter: 'C',
    title: 'Verify attendance sync and user login',
    description: 'Verify that attendance sync is working and affected users can log in.',
  },
  {
    id: 'confirm_recovery',
    letter: 'D',
    title: 'Confirm recovery before closing incident',
    description: 'Confirm service recovery before closing the incident.',
  },
];

// Correct sequence order for Activity 1
export const ACTIVITY_1_CORRECT_SEQUENCE: Activity1CardId[] = [
  'confirm_scope',
  'deploy_hotfix',
  'verify_sync',
  'confirm_recovery',
];

// ── ACTIVITY 2: BUILD THE ROOT CAUSE ANALYSIS (RCA) ──
export const RCA_FIELDS: RcaFieldDefinition[] = [
  {
    id: 'incident',
    question: '1. Incident Description',
    subtitle: 'Document the visible symptoms and affected service.',
    options: [
      {
        id: 'inc_opt_a',
        letter: 'A',
        text: 'Intermittent 504 Gateway Timeouts affecting the Attendance Sync microservice during morning login.',
        isCorrect: true,
        feedback: 'Correct: The Attendance Sync microservice timed out under morning load, returning 504 errors at the gateway.',
      },
      {
        id: 'inc_opt_b',
        letter: 'B',
        text: 'The Appraisal calculation module stopped calculating employee annual ratings.',
        isCorrect: false,
        feedback: 'Incorrect: The appraisal service was operating normally; the failure was isolated to Attendance Sync.',
      },
      {
        id: 'inc_opt_c',
        letter: 'C',
        text: 'A total bank datacenter outage caused all HRMS services to become completely unavailable.',
        isCorrect: false,
        feedback: 'Incorrect: The platform was fully operational outside of the Attendance Sync microservice container pods.',
      },
      {
        id: 'inc_opt_d',
        letter: 'D',
        text: "Branch officers experienced local workstation hardware and display failures.",
        isCorrect: false,
        feedback: 'Incorrect: Workstation hardware was functioning normally; the issue was backend microservice timeouts.',
      },
    ],
  },
  {
    id: 'rootCause',
    question: '2. Root Cause',
    subtitle: 'Identify the underlying technical flaw revealed by telemetry.',
    options: [
      {
        id: 'rc_opt_a',
        letter: 'A',
        text: 'A memory leak in the Attendance Sync microservice caused memory consumption to increase over time. (Further engineering investigation underway for code-level profiling).',
        isCorrect: true,
        feedback: 'Correct: The memory leak caused monotonic heap growth and eventual gateway timeouts. Deeper profiling will isolate the specific code-level leak.',
      },
      {
        id: 'rc_opt_b',
        letter: 'B',
        text: 'The host operating system ran completely out of disk storage due to employee photo uploads.',
        isCorrect: false,
        feedback: 'Incorrect: Disk metrics showed 41% free capacity; the failure was container RAM exhaustion.',
      },
      {
        id: 'rc_opt_c',
        letter: 'C',
        text: 'An unauthorized network firewall change blocked branch subnet IP ranges.',
        isCorrect: false,
        feedback: 'Incorrect: Firewall rules were unchanged. Requests reached the service gateway before timing out.',
      },
      {
        id: 'rc_opt_d',
        letter: 'D',
        text: 'An unhandled arithmetic calculation in the payroll bonus engine crashed worker nodes.',
        isCorrect: false,
        feedback: 'Incorrect: The payroll engine runs in an isolated service cluster and was not involved.',
      },
    ],
  },
  {
    id: 'impact',
    question: '3. Business Impact',
    subtitle: 'Accurately record the confirmed business blast radius.',
    options: [
      {
        id: 'imp_opt_a',
        letter: 'A',
        text: 'Twelve branch officers were affected during morning login and experienced attendance synchronisation problems.',
        isCorrect: true,
        feedback: 'Correct: Martha confirmed 12 retail branch officers encountered login timeouts during morning shift commencement.',
      },
      {
        id: 'imp_opt_b',
        letter: 'B',
        text: 'All 80,000 ICICI Bank employees were completely locked out of the enterprise system.',
        isCorrect: false,
        feedback: 'Incorrect: Exaggerating impact creates unnecessary panic. The issue was bounded strictly to 12 branch officers.',
      },
      {
        id: 'imp_opt_c',
        letter: 'C',
        text: 'Zero business impact; the error was only visible to internal dev monitoring.',
        isCorrect: false,
        feedback: 'Incorrect: Frontline retail branch staff were actively blocked from logging in.',
      },
      {
        id: 'imp_opt_d',
        letter: 'D',
        text: 'The monthly salary disbursement was cancelled.',
        isCorrect: false,
        feedback: 'Incorrect: Salary disbursements were unaffected.',
      },
    ],
  },
  {
    id: 'prevention',
    question: '4. Corrective and Preventive Actions',
    subtitle: 'Document the hotfix response and systemic controls to prevent recurrence.',
    options: [
      {
        id: 'prev_opt_a',
        letter: 'A',
        text: 'Deploy the reviewed hotfix patch, verify service recovery, and implement continuous memory monitoring, automated alert thresholds, and regression testing.',
        isCorrect: true,
        feedback: 'Correct: Pairs immediate hotfix deployment with verified recovery, proactive observability, alert thresholds, and automated regression testing.',
      },
      {
        id: 'prev_opt_b',
        letter: 'B',
        text: 'Increase the number of server containers without investigating or fixing the memory leak.',
        isCorrect: false,
        feedback: 'Incorrect: Adding server capacity may temporarily delay timeouts, but it does not fix the underlying memory leak.',
      },
      {
        id: 'prev_opt_c',
        letter: 'C',
        text: 'Disable the Attendance Sync microservice during morning peak hours.',
        isCorrect: false,
        feedback: 'Incorrect: Disabling essential services during peak business hours directly impacts bank operations.',
      },
      {
        id: 'prev_opt_d',
        letter: 'D',
        text: 'Silently close the incident ticket once the hotfix is applied without post-mortem documentation.',
        isCorrect: false,
        feedback: 'Incorrect: Failing to document the incident and establish monitoring guarantees future repeat failures.',
      },
    ],
  },
];

// ── ACTIVITY 3: PREVENT RECURRENCE CARDS ──
export const PREVENTION_ACTION_CARDS: PreventionActionCard[] = [
  {
    id: 'continuous_memory_monitoring',
    title: 'Continuous Memory Monitoring',
    description:
      'Track memory utilisation over time so abnormal growth can be detected before the service begins timing out.',
    isAppropriate: true,
    preferredPriorityRank: 1,
  },
  {
    id: 'alert_thresholds',
    title: 'Updated Automated Alert Thresholds',
    description:
      'Configure automated alerts when memory usage crosses defined warning and critical thresholds.',
    isAppropriate: true,
    preferredPriorityRank: 2,
  },
  {
    id: 'memory_regression_testing',
    title: 'Memory Regression Testing',
    description:
      'Add tests that help identify memory leaks and abnormal memory growth before future releases.',
    isAppropriate: true,
    preferredPriorityRank: 3,
  },
  {
    id: 'service_health_checks',
    title: 'Regular Service Health Checks',
    description:
      'Regularly validate service availability and response health so the team can detect failures early.',
    isAppropriate: true,
    preferredPriorityRank: 4,
  },
  {
    id: 'increase_number_of_servers',
    title: 'Increase the Number of Servers',
    description:
      'Add more server capacity to absorb memory bloat without fixing the underlying memory leak.',
    isAppropriate: false,
    inappropriateExplanation:
      'Adding servers may temporarily increase capacity, but it does not fix the underlying memory leak.',
    preferredPriorityRank: 99,
  },
  {
    id: 'ignore_monitoring_hotfix',
    title: 'Ignore Monitoring After the Hotfix',
    description:
      'Assume the issue is permanently resolved once the hotfix has been deployed.',
    isAppropriate: false,
    inappropriateExplanation:
      'Assuming the issue is permanently resolved without ongoing monitoring leaves the service vulnerable to regressions.',
    preferredPriorityRank: 99,
  },
];

export const APPROPRIATE_PREVENTION_IDS: PreventionActionId[] = [
  'continuous_memory_monitoring',
  'alert_thresholds',
  'memory_regression_testing',
  'service_health_checks',
];

// ── INITIAL STATE ──
export const INITIAL_CHAPTER7_STATE: Chapter7State = {
  alertNotificationShown: false,
  marthaChatViewed: false,
  callInitiated: false,
  callCompleted: false,
  meetingCompleted: false,
  screenShareViewed: false,
  aaravAssignmentViewed: false,
  studioUnlocked: false,
  studioOpened: false,
  activeTab: 'immediate',

  decisionChoice: null,
  decisionSubmitted: false,
  decisionFeedback: null,

  activity1Order: ['verify_sync', 'confirm_recovery', 'confirm_scope', 'deploy_hotfix'],
  activity1Attempts: 0,
  activity1Submitted: false,
  activity1Completed: false,
  activity1Feedback: null,

  activity2Answers: {
    incident: null,
    rootCause: null,
    impact: null,
    prevention: null,
  },
  activity2Attempts: 0,
  activity2Submitted: false,
  activity2Completed: false,
  rcaPublished: false,
  activity2Feedback: null,

  activity3Selected: [],
  activity3PriorityOrder: [],
  activity3Attempts: 0,
  activity3Submitted: false,
  activity3Completed: false,
  activity3Feedback: null,

  incidentStatus: 'investigating',
  alexHotfixConfirmed: false,
  danielHotfixConfirmed: false,
  marthaMonitoringConfirmed: false,
  janeClosureConfirmed: false,
  aaravClosingConfirmed: false,

  completed: false,
  closingChatShown: false,
  scorecard: {
    shown: false,
    scheduleScore: 0,
    riskScore: 0,
    governanceScore: 0,
    efficiencyScore: 0,
    totalScore: 0,
    breakdown: {
      immediateResponseScore: 0,
      rcaScore: 0,
      preventionScore: 0,
      decisionGovernanceDelta: 0,
      decisionRiskDelta: 0,
      decisionEfficiencyDelta: 0,
    },
    outcomeType: 'incomplete',
    outcomeText: '',
    whatYouDidWell: '',
    whatToImprove: '',
    keyTakeaway: CHAPTER7_LEARNING_TAKEAWAY,
    explanations: {
      schedule: '',
      risk: '',
      governance: '',
      efficiency: '',
    },
  },
};

// ── EVALUATION ENGINE ──
export function computeChapter7Score(state: Chapter7State): Chapter7Scorecard {
  // Baseline scores before decision impacts
  const baseGovernance = 55;
  const baseRisk = 55;
  const baseEfficiency = 55;
  const baseSchedule = 70;

  // Exact Decision Score Impacts as mandated:
  // Choice A: Delivery Governance -30, Trust & Risk Management -25, Team Efficiency: 0
  // Choice B: Delivery Governance +25, Trust & Risk Management +20, Team Efficiency +15
  let decGovDelta = 0;
  let decRiskDelta = 0;
  let decEffDelta = 0;

  if (state.decisionChoice === 'choice_b') {
    decGovDelta = 25;
    decRiskDelta = 20;
    decEffDelta = 15;
  } else if (state.decisionChoice === 'choice_a') {
    decGovDelta = -30;
    decRiskDelta = -25;
    decEffDelta = 0;
  }

  // ── ACTIVITY 1: RESTORE SERVICE (Max 30 pts) ──
  let immediateScore = 0;
  const order = state.activity1Order || [];
  const scopeIdx = order.indexOf('confirm_scope');
  const hotfixIdx = order.indexOf('deploy_hotfix');
  const verifyIdx = order.indexOf('verify_sync') !== -1 ? order.indexOf('verify_sync') : order.indexOf('verify_access');
  const confirmIdx = order.indexOf('confirm_recovery') !== -1 ? order.indexOf('confirm_recovery') : order.indexOf('close_prematurely');

  const scopeBeforeHotfix = scopeIdx !== -1 && hotfixIdx !== -1 && scopeIdx < hotfixIdx;
  const hotfixBeforeVerify = hotfixIdx !== -1 && verifyIdx !== -1 && hotfixIdx < verifyIdx;
  const verifyBeforeConfirm = verifyIdx !== -1 && confirmIdx !== -1 && verifyIdx < confirmIdx;
  const prematureClose = confirmIdx !== -1 && verifyIdx !== -1 && confirmIdx < verifyIdx;

  if (scopeBeforeHotfix) immediateScore += 10;
  if (hotfixBeforeVerify) immediateScore += 10;
  if (verifyBeforeConfirm) immediateScore += 10;
  if (prematureClose) immediateScore = Math.max(0, immediateScore - 15);

  if (state.activity1Attempts > 2) {
    immediateScore = Math.max(10, immediateScore - (state.activity1Attempts - 2) * 3);
  }

  // ── ACTIVITY 2: RCA (Max 40 pts, 10 per field) ──
  let rcaScore = 0;
  const answers = state.activity2Answers || { incident: null, rootCause: null, impact: null, prevention: null };
  const incCorrect = answers.incident === 'inc_opt_a';
  const rcCorrect = answers.rootCause === 'rc_opt_a';
  const impCorrect = answers.impact === 'imp_opt_a';
  const prevCorrect = answers.prevention === 'prev_opt_a';

  if (incCorrect) rcaScore += 10;
  if (rcCorrect) rcaScore += 10;
  if (impCorrect) rcaScore += 10;
  if (prevCorrect) rcaScore += 10;

  if (state.activity2Attempts > 2) {
    rcaScore = Math.max(15, rcaScore - (state.activity2Attempts - 2) * 4);
  }

  // ── ACTIVITY 3: PREVENT RECURRENCE (Max 30 pts) ──
  let preventionScore = 0;
  const selected = state.activity3Selected || [];
  const priority = state.activity3PriorityOrder || [];

  const selectedInappropriate = selected.some(
    (id) => id === 'increase_number_of_servers' || id === 'ignore_monitoring_hotfix'
  );

  const appropriateCount = selected.filter((id) => APPROPRIATE_PREVENTION_IDS.includes(id)).length;
  preventionScore += appropriateCount * 5; // up to 20 pts for 4 appropriate controls

  if (selectedInappropriate) {
    preventionScore = Math.max(0, preventionScore - 10);
  }

  // Prioritisation logic: reward placing continuous memory monitoring & alert thresholds high
  if (priority.length === 4 && !selectedInappropriate) {
    const monIdx = priority.indexOf('continuous_memory_monitoring');
    const alertIdx = priority.indexOf('alert_thresholds');
    if (monIdx !== -1 && monIdx <= 1) preventionScore += 5;
    if (alertIdx !== -1 && alertIdx <= 2) preventionScore += 5;
  }

  if (state.activity3Attempts > 2) {
    preventionScore = Math.max(10, preventionScore - (state.activity3Attempts - 2) * 3);
  }

  // ── 4 CORE METRICS COMPUTATION ──
  // Metric 1: Delivery Governance (+25 or -30 from decision, + RCA quality & prevention)
  const governanceScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        baseGovernance +
          decGovDelta +
          (rcaScore / 40) * 15 +
          (preventionScore / 30) * 5
      )
    )
  );

  // Metric 2: Trust & Risk Management (+20 or -25 from decision, + verified recovery & realistic blast radius)
  const riskScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        baseRisk +
          decRiskDelta +
          (verifyBeforeConfirm ? 15 : 0) +
          (impCorrect ? 10 : 0)
      )
    )
  );

  // Metric 3: Team Efficiency & Velocity (+15 or 0 from decision, + smooth sequencing & root-cause elimination)
  const efficiencyScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        baseEfficiency +
          decEffDelta +
          (scopeBeforeHotfix ? 15 : 0) +
          (preventionScore / 30) * 15
      )
    )
  );

  // Metric 4: Schedule / Timeline (Response speed and sequence correctness)
  const scheduleScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        baseSchedule +
          (immediateScore / 30) * 20 +
          (state.activity1Attempts <= 1 ? 10 : state.activity1Attempts === 2 ? 5 : 0)
      )
    )
  );

  // Combined Total Score
  const totalScore = Math.min(
    100,
    Math.max(0, Math.round((scheduleScore + riskScore + governanceScore + efficiencyScore) / 4))
  );

  const outcomeType: Chapter7OutcomeType =
    totalScore >= 80 ? 'strong' : totalScore >= 60 ? 'mixed' : 'incomplete';

  const outcomeText =
    outcomeType === 'strong'
      ? 'SEV-2 Incident INC-0241 successfully resolved with verified service recovery, published RCA, and updated monitoring thresholds.'
      : outcomeType === 'mixed'
      ? 'Hotfix deployed, but incident management exhibited minor governance or verification lapses.'
      : 'Incident management exhibited critical risks: silent patching without RCA or closing before recovery verification.';

  const whatYouDidWell =
    outcomeType === 'strong'
      ? "You insisted on a formal RCA before patching, confirmed scope before deploying Alex's hotfix, strictly verified branch access before closing, and prioritized continuous memory monitoring and alert thresholds."
      : 'You helped restore the Attendance Sync service and documented key elements of the outage.';

  const whatToImprove =
    outcomeType === 'strong'
      ? 'Maintain this operational rigor in future incidents: never push hotfixes silently, verify frontline access before declaring recovery, and pair hotfixes with automated monitoring thresholds.'
      : 'Remember that an incident ticket must never be marked closed until recovery has been verified with users, and adding server instances is never a substitute for eliminating a memory leak.';

  return {
    shown: true,
    scheduleScore,
    riskScore,
    governanceScore,
    efficiencyScore,
    totalScore,
    breakdown: {
      immediateResponseScore: immediateScore,
      rcaScore,
      preventionScore,
      decisionGovernanceDelta: decGovDelta,
      decisionRiskDelta: decRiskDelta,
      decisionEfficiencyDelta: decEffDelta,
    },
    outcomeType,
    outcomeText,
    whatYouDidWell,
    whatToImprove,
    keyTakeaway: CHAPTER7_LEARNING_TAKEAWAY,
    explanations: {
      schedule:
        scheduleScore >= 80
          ? 'Fast, disciplined incident response. Scope confirmed and hotfix deployed without unnecessary operational lag.'
          : 'Minor response delays due to repeated sequence re-ordering.',
      risk:
        riskScore >= 80
          ? 'Exceptional risk control: verified frontline branch officers before closure and published formal RCA.'
          : 'High risk: closing incidents before verifying user access or pushing silent patches risks recurrence.',
      governance:
        governanceScore >= 80
          ? 'Exemplary governance: Mandated formal RCA, avoided silent patches, and documented 4-part post-mortem.'
          : 'Governance lapse: Silent patching without ticket or incomplete RCA documentation.',
      efficiency:
        efficiencyScore >= 80
          ? 'Seamless technical coordination with Alex and Martha. Prioritised root-cause elimination over capacity bloat.'
          : 'Struggled to distinguish root-cause fixes from temporary server scaling.',
    },
  };
}

// ── SESSION STATE PERSISTENCE ──
let sessionChapter7State: Chapter7State = { ...INITIAL_CHAPTER7_STATE };

export function getChapter7SessionState(): Chapter7State {
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    const raw = globalThis.localStorage.getItem('brained_chapter7_state');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        sessionChapter7State = { ...INITIAL_CHAPTER7_STATE, ...parsed };
      } catch {
        // ignore
      }
    }
  }
  return { ...sessionChapter7State };
}

export function setChapter7SessionState(
  updater: Partial<Chapter7State> | ((prev: Chapter7State) => Chapter7State)
): Chapter7State {
  if (typeof updater === 'function') {
    sessionChapter7State = updater(sessionChapter7State);
  } else {
    sessionChapter7State = { ...sessionChapter7State, ...updater };
  }
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    try {
      globalThis.localStorage.setItem('brained_chapter7_state', JSON.stringify(sessionChapter7State));
    } catch {
      // ignore
    }
  }
  return { ...sessionChapter7State };
}

export function resetChapter7SessionState() {
  sessionChapter7State = {
    ...INITIAL_CHAPTER7_STATE,
    scorecard: { ...INITIAL_CHAPTER7_STATE.scorecard },
  };
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    try {
      globalThis.localStorage.removeItem('brained_chapter7_state');
    } catch {
      // ignore
    }
  }
}
