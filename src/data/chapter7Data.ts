/**
 * chapter7Data.ts
 * Master data, evaluation logic & session state for Chapter 7:
 * PRODUCTION ISSUES & ROOT CAUSE ANALYSIS · INC-0241
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
} from '../types/chapter7';

export const INCIDENT_ID = 'INC-0241';
export const INCIDENT_SEVERITY = 'SEV-2';
export const INCIDENT_SERVICE = 'Attendance Sync';
export const INCIDENT_ERROR = '504 Gateway Timeout';
export const INCIDENT_USERS_AFFECTED = 12;

export const CHAPTER7_TITLE = 'Production Issues & Root Cause Analysis';
export const CHAPTER7_SUBTITLE = 'Incident Response & Root Cause Analysis (RCA) Studio';
export const CHAPTER7_LEARNING_TAKEAWAY =
  'A successful hotfix restores the service. A proper RCA helps prevent the same failure from returning.';

// ── ACTIVITY 1: RESTORE SERVICE CARDS ──
export const ACTIVITY_1_CARDS: Activity1Card[] = [
  {
    id: 'confirm_scope',
    letter: 'A',
    title: 'Confirm affected service and scope',
    description:
      'Identify the affected Attendance Sync service, review the reported 504 errors, and confirm the number of impacted users.',
  },
  {
    id: 'deploy_hotfix',
    letter: 'B',
    title: 'Deploy the reviewed hotfix',
    description:
      'Coordinate with Daniel to deploy the reviewed hotfix addressing the memory leak.',
  },
  {
    id: 'verify_access',
    letter: 'C',
    title: 'Verify attendance sync and user access',
    description:
      'Check service health, confirm memory utilisation is stable, and verify that affected branch officers can access attendance synchronisation.',
  },
  {
    id: 'close_prematurely',
    letter: 'D',
    title: 'Close the incident before verification',
    description:
      'Close the incident immediately after deployment without waiting for service verification.',
    isTrap: true,
  },
];

// Correct sequence order for Activity 1
export const ACTIVITY_1_CORRECT_SEQUENCE: Activity1CardId[] = [
  'confirm_scope',
  'deploy_hotfix',
  'verify_access',
  'close_prematurely',
];

// ── ACTIVITY 2: BUILD THE ROOT CAUSE ANALYSIS (RCA) ──
export const RCA_FIELDS: RcaFieldDefinition[] = [
  {
    id: 'incident',
    question: 'What happened?',
    subtitle: 'Identify the exact production failure reported in the operations alert.',
    options: [
      {
        id: 'inc_opt_a',
        letter: 'A',
        text: 'Attendance Sync experienced intermittent 504 Gateway Timeout errors.',
        isCorrect: true,
        feedback: 'Correct: The Attendance Sync microservice timed out under morning load, producing 504 errors at the gateway.',
      },
      {
        id: 'inc_opt_b',
        letter: 'B',
        text: 'The Appraisal module stopped calculating employee ratings.',
        isCorrect: false,
        feedback: 'Incorrect: The appraisal system was operating normally; the incident was specific to Attendance Sync.',
      },
      {
        id: 'inc_opt_c',
        letter: 'C',
        text: 'The entire HRMS platform became unavailable.',
        isCorrect: false,
        feedback: 'Incorrect: The failure was strictly localized to Attendance Sync microservice pods, not a total platform blackout.',
      },
      {
        id: 'inc_opt_d',
        letter: 'D',
        text: "The bank's network connection failed.",
        isCorrect: false,
        feedback: "Incorrect: ICICI Bank's internal network was operational; the failure stemmed from container memory exhaustion.",
      },
    ],
  },
  {
    id: 'rootCause',
    question: 'What caused the incident?',
    subtitle: 'Identify the underlying technical flaw revealed by telemetry.',
    options: [
      {
        id: 'rc_opt_a',
        letter: 'A',
        text: 'A memory leak in the Attendance Sync microservice caused memory consumption to increase over time.',
        isCorrect: true,
        feedback: 'Correct: Monotonic heap growth caused container memory saturation and gateway timeouts.',
      },
      {
        id: 'rc_opt_b',
        letter: 'B',
        text: 'The server ran out of disk storage because of employee document uploads.',
        isCorrect: false,
        feedback: 'Incorrect: Disk metrics were at 38% capacity; the bottleneck was RAM exhaustion in the container JVM.',
      },
      {
        id: 'rc_opt_c',
        letter: 'C',
        text: 'A firewall blocked all employee login requests.',
        isCorrect: false,
        feedback: 'Incorrect: Firewall policies were unchanged. Requests reached the microservice before timing out.',
      },
      {
        id: 'rc_opt_d',
        letter: 'D',
        text: 'An incorrect appraisal calculation caused the service to stop.',
        isCorrect: false,
        feedback: 'Incorrect: Appraisal calculations run in an independent service domain and had no role in this outage.',
      },
    ],
  },
  {
    id: 'impact',
    question: 'What was the impact?',
    subtitle: 'Accurately assess the business blast radius.',
    options: [
      {
        id: 'imp_opt_a',
        letter: 'A',
        text: 'Twelve branch officers experienced login or attendance synchronisation problems.',
        isCorrect: true,
        feedback: 'Correct: Martha confirmed 12 retail branch officers were locked out during morning shift commencement.',
      },
      {
        id: 'imp_opt_b',
        letter: 'B',
        text: 'All 80,000 employees lost access to the HRMS.',
        isCorrect: false,
        feedback: 'Incorrect: Exaggerating impact creates unnecessary panic. The issue was bounded to 12 branch officers.',
      },
      {
        id: 'imp_opt_c',
        letter: 'C',
        text: 'Only the development team experienced an internal testing issue.',
        isCorrect: false,
        feedback: 'Incorrect: This was a genuine production incident directly impacting frontline bank employees.',
      },
      {
        id: 'imp_opt_d',
        letter: 'D',
        text: 'The appraisal cycle was cancelled.',
        isCorrect: false,
        feedback: 'Incorrect: The appraisal cycle proceeded without interruption.',
      },
    ],
  },
  {
    id: 'prevention',
    question: 'What should be done to prevent this from recurring?',
    subtitle: 'Define comprehensive systemic controls rather than superficial shortcuts.',
    options: [
      {
        id: 'prev_opt_a',
        letter: 'A',
        text: 'Introduce memory monitoring, appropriate alert thresholds, regression testing, and service health checks.',
        isCorrect: true,
        feedback: 'Correct: Proactive observability, alerting, automated regression tests, and health checks provide layered defense.',
      },
      {
        id: 'prev_opt_b',
        letter: 'B',
        text: 'Increase the number of users allowed to access the service.',
        isCorrect: false,
        feedback: 'Incorrect: Increasing user concurrency without fixing memory leaks accelerates container crashes.',
      },
      {
        id: 'prev_opt_c',
        letter: 'C',
        text: 'Disable Attendance Sync during peak hours.',
        isCorrect: false,
        feedback: 'Incorrect: Turning off core features during business hours disrupts banking operations.',
      },
      {
        id: 'prev_opt_d',
        letter: 'D',
        text: 'Ignore the issue if the hotfix resolves it.',
        isCorrect: false,
        feedback: 'Incorrect: Relying solely on a hotfix without telemetry thresholds guarantees future repeat incidents.',
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
    title: 'Alert Thresholds',
    description:
      'Configure alerts when memory usage crosses defined warning and critical thresholds.',
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
    title: 'Service Health Checks',
    description:
      'Regularly validate service availability and response health so the team can detect failures early.',
    isAppropriate: true,
    preferredPriorityRank: 4,
  },
  {
    id: 'increase_number_of_servers',
    title: 'Increase the Number of Servers',
    description:
      'Add more servers without investigating or fixing the underlying memory leak.',
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

  activity1Order: ['confirm_scope', 'deploy_hotfix', 'verify_access', 'close_prematurely'],
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
  activity2Feedback: null,

  activity3Selected: [],
  activity3PriorityOrder: [],
  activity3Attempts: 0,
  activity3Submitted: false,
  activity3Completed: false,
  activity3Feedback: null,

  incidentStatus: 'investigating',
  danielHotfixConfirmed: false,
  marthaMonitoringConfirmed: false,
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
  // Activity 1 Scoring (Max 30 pts)
  let immediateScore = 0;
  const order = state.activity1Order || [];
  const scopeIdx = order.indexOf('confirm_scope');
  const hotfixIdx = order.indexOf('deploy_hotfix');
  const verifyIdx = order.indexOf('verify_access');
  const closeIdx = order.indexOf('close_prematurely');

  const scopeBeforeHotfix = scopeIdx !== -1 && hotfixIdx !== -1 && scopeIdx < hotfixIdx;
  const hotfixBeforeVerify = hotfixIdx !== -1 && verifyIdx !== -1 && hotfixIdx < verifyIdx;
  const verifyBeforeClose = verifyIdx !== -1 && closeIdx !== -1 && verifyIdx < closeIdx;
  const prematureClose = closeIdx !== -1 && verifyIdx !== -1 && closeIdx < verifyIdx;

  if (scopeBeforeHotfix) immediateScore += 10;
  if (hotfixBeforeVerify) immediateScore += 10;
  if (verifyBeforeClose) immediateScore += 10;
  if (prematureClose) immediateScore = Math.max(0, immediateScore - 15);

  // Slight deduction if it took more than 2 attempts
  if (state.activity1Attempts > 2) {
    immediateScore = Math.max(10, immediateScore - (state.activity1Attempts - 2) * 3);
  }

  // Activity 2 Scoring (Max 40 pts, 10 per field)
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

  // Activity 3 Scoring (Max 30 pts)
  let preventionScore = 0;
  const selected = state.activity3Selected || [];
  const priority = state.activity3PriorityOrder || [];

  const selectedInappropriate = selected.some(
    (id) => id === 'increase_number_of_servers' || id === 'ignore_monitoring_hotfix'
  );

  const appropriateCount = selected.filter((id) => APPROPRIATE_PREVENTION_IDS.includes(id)).length;
  preventionScore += appropriateCount * 5; // up to 20 pts for selecting 4 appropriate controls

  if (selectedInappropriate) {
    preventionScore = Math.max(0, preventionScore - 10);
  }

  // Prioritisation logic: reward placing continuous memory monitoring & alert thresholds high
  if (priority.length === 4 && !selectedInappropriate) {
    const monIdx = priority.indexOf('continuous_memory_monitoring');
    const alertIdx = priority.indexOf('alert_thresholds');
    if (monIdx <= 1) preventionScore += 5; // placed near top
    if (alertIdx <= 2) preventionScore += 5; // placed in top 3
  }

  if (state.activity3Attempts > 2) {
    preventionScore = Math.max(10, preventionScore - (state.activity3Attempts - 2) * 3);
  }

  const totalScore = Math.min(100, Math.round(immediateScore + rcaScore + preventionScore));

  // Core Metric 1: Schedule / Timeline (Speed & sequence of incident response)
  const scheduleScore = Math.min(
    100,
    Math.round(
      (immediateScore / 30) * 55 +
        (state.activity1Attempts <= 1 ? 30 : state.activity1Attempts === 2 ? 20 : 10) +
        (hotfixBeforeVerify ? 15 : 0)
    )
  );

  // Core Metric 2: Trust & Risk Management (Verification before closure, true impact reporting)
  const riskScore = Math.min(
    100,
    Math.round(
      (verifyBeforeClose ? 35 : 10) +
        (impCorrect ? 35 : 15) +
        (!selectedInappropriate ? 30 : 5)
    )
  );

  // Core Metric 3: Delivery Governance (RCA quality and preventive controls)
  const governanceScore = Math.min(
    100,
    Math.round(
      (rcaScore / 40) * 60 +
        (appropriateCount === 4 ? 30 : appropriateCount * 7) +
        (priority.length === 4 ? 10 : 0)
    )
  );

  // Core Metric 4: Team Efficiency & Velocity (Coordination, root cause diagnosis, practical actions)
  const efficiencyScore = Math.min(
    100,
    Math.round(
      (scopeBeforeHotfix ? 30 : 10) +
        (rcCorrect ? 35 : 10) +
        (preventionScore / 30) * 35
    )
  );

  const outcomeType: Chapter7OutcomeType =
    totalScore >= 80 ? 'strong' : totalScore >= 60 ? 'mixed' : 'incomplete';

  const outcomeText =
    outcomeType === 'strong'
      ? 'SEV-2 Incident INC-0241 successfully resolved with verified service recovery and disciplined post-mortem governance.'
      : outcomeType === 'mixed'
      ? 'Service restored, but incident response demonstrated minor governance or prioritisation lapses during triage.'
      : 'Incident response exhibited critical risks: premature closure or superficial root cause identification.';

  const whatYouDidWell =
    outcomeType === 'strong'
      ? 'You confirmed service scope before deploying Daniel\'s hotfix, strictly verified user access before closure, diagnosed the socket memory leak accurately, and prioritised proactive observability over temporary capacity workarounds.'
      : 'You helped restore the Attendance Sync service and documented key elements of the outage.';

  const whatToImprove =
    outcomeType === 'strong'
      ? 'Maintain this operational rigor in future production incidents: never close an incident before frontline verification, and always pair hotfixes with telemetry threshold alerts.'
      : 'Remember that an incident ticket must never be marked closed until recovery has been verified with end users, and adding server instances is never a substitute for eliminating a memory leak.';

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
          ? 'Exceptional risk control: verified frontline branch officers before closure and documented realistic blast radius.'
          : 'High risk: closing incidents before verifying user access risks immediate recurrence.',
      governance:
        governanceScore >= 80
          ? 'Complete RCA with accurate root cause, business impact, and 4-tier prevention controls documented.'
          : 'Partial post-mortem documentation; ensure all 4 RCA fields and preventive controls are fully captured.',
      efficiency:
        efficiencyScore >= 80
          ? 'Seamless technical coordination with Daniel and Martha. Prioritised root-cause elimination over capacity bloat.'
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
