/**
 * chapter6Data.ts
 * Master data, evaluation logic & session state for Chapter 6:
 * THE 30,000-USER STRESS TEST · Performance Command Centre
 */

import type {
  Chapter6State,
  Chapter6Scorecard,
  BottleneckOption,
  RecoveryAction,
  RecoveryActionId,
  MetricComparison,
  Chapter6OutcomeType,
} from '../types/chapter6';

export const CHAPTER6_TITLE = 'The 30,000-User Stress Test';
export const CHAPTER6_SUBTITLE = 'Production Readiness · Performance Command Centre';
export const CHAPTER6_LEARNING_TAKEAWAY =
  'A successful functional test does not mean a system is ready for production. Performance, infrastructure capacity and formal approvals must all be verified before release.';

// ── SECTION A: BOTTLENECK DIAGNOSTIC OPTIONS ──
export const BOTTLENECK_OPTIONS: BottleneckOption[] = [
  {
    id: 'frontend_rendering',
    label: 'Frontend rendering and DOM re-calculation',
    description: 'Heavy JavaScript bundles or browser repaint cycles slowing down the client application.',
    isCorrect: false,
    explanation:
      'Incorrect. Client-side rendering affects user perceived latency on browsers, but it cannot saturate the backend database connection pool or trigger server gateway 504 timeouts at 30,000 concurrent load.',
  },
  {
    id: 'db_pool_saturation',
    label: 'Database connection pool saturation (exacerbated by poor cache hit rate)',
    description: 'PostgreSQL connection pool maxed out at 98% utilization with queued requests, caused by a 42% Redis cache hit rate.',
    isCorrect: true,
    explanation:
      'Correct! The primary bottleneck is database connection pool saturation (98% utilization). Because the Redis cache hit rate is only 42%, 58% of appraisal submission requests bypass cache and slam the database directly. This exhausts all available connections, causing request queuing and a 4.2-second API latency spike.',
  },
  {
    id: 'auth_failure',
    label: 'User authentication and LDAP token verification failure',
    description: 'LDAP/SSO identity service rejects user credentials or drops sessions under load.',
    isCorrect: false,
    explanation:
      'Incorrect. The APM trace shows SSO token verification takes only 35ms with 200 OK responses. Users are successfully authenticating; the system slows down specifically at data submission.',
  },
  {
    id: 'ui_component_loading',
    label: 'UI component dynamic code splitting & lazy loading',
    description: 'Asset chunk loading delays causing slow screen transitions.',
    isCorrect: false,
    explanation:
      'Incorrect. Component chunking happens over static CDN assets and does not generate database connection pressure or 504 Gateway Timeouts on the appraisal submission endpoint.',
  },
];

// ── SECTION B: RECOVERY ACTIONS ──
export const RECOVERY_ACTIONS: RecoveryAction[] = [
  {
    id: 'tune_redis',
    label: 'Tune Redis caching and review cache invalidation rules',
    description: 'Fix TTL expiration rules and pre-warm appraisal templates so high-frequency queries do not touch the database.',
    category: 'caching',
  },
  {
    id: 'optimize_db_pool',
    label: 'Review and optimize database connection pooling',
    description: 'Tune maximum pool capacity, connection idle timeouts, and optimize statement execution to reduce connection hold time.',
    category: 'database',
  },
  {
    id: 'retest_load',
    label: 'Run the 30,000-user stress test again',
    description: 'Execute the automated load generator simulating 30,000 concurrent bank employees submitting appraisal forms.',
    category: 'testing',
  },
  {
    id: 'analyse_metrics',
    label: 'Analyse the new latency, error rate and resource utilization',
    description: 'Inspect the resulting telemetry in APM to verify if response time, DB pool headroom, and gateway errors meet production SLAs.',
    category: 'analysis',
  },
  {
    id: 'submit_approvals',
    label: 'Submit results for Engineering Lead and CTO approval',
    description: 'Package the retest performance evidence and submit formal signoff requests to Daniel Kapoor and Marcus Reed.',
    category: 'governance',
  },
];

// Reference ideal sequence:
// 1. Tune Redis caching
// 2. Optimize DB connection pooling (or vice-versa, both fixes before retest)
// 3. Run the 30,000-user stress test again
// 4. Analyse the new performance results
// 5. Obtain Engineering Lead and CTO signoffs
export interface SequenceValidationResult {
  isValid: boolean;
  score: number; // 0 to 30
  feedback: string;
}

export function validateRecoverySequence(sequence: RecoveryActionId[]): SequenceValidationResult {
  if (sequence.length !== 5) {
    return {
      isValid: false,
      score: 0,
      feedback: 'Please order all 5 recovery actions before submitting.',
    };
  }

  const idxRedis = sequence.indexOf('tune_redis');
  const idxDb = sequence.indexOf('optimize_db_pool');
  const idxRetest = sequence.indexOf('retest_load');
  const idxAnalyse = sequence.indexOf('analyse_metrics');
  const idxApprovals = sequence.indexOf('submit_approvals');

  // Check critical dependencies:
  // 1. Both technical fixes (Redis tuning & DB optimization) must be done BEFORE retesting!
  if (idxRetest < idxRedis || idxRetest < idxDb) {
    return {
      isValid: false,
      score: 10,
      feedback:
        'Dependency Error: You cannot re-run the 30,000-user stress test before applying the technical fixes (Redis tuning & DB connection pooling). Retesting without fixes will simply reproduce the 4.2-second failure.',
    };
  }

  // 2. Retest must be done BEFORE analyzing new metrics!
  if (idxAnalyse < idxRetest) {
    return {
      isValid: false,
      score: 12,
      feedback:
        'Dependency Error: You cannot analyze new performance results before running the stress test. There is no new retest telemetry to inspect.',
    };
  }

  // 3. Analysis must be done BEFORE submitting for approvals!
  if (idxApprovals < idxAnalyse) {
    return {
      isValid: false,
      score: 15,
      feedback:
        'Governance Error: Formal approvals require verified performance evidence. You must inspect and analyze the retest metrics before submitting signoff requests to Daniel and Marcus.',
    };
  }

  // If fixes come first, retest 3rd, analysis 4th, approvals 5th:
  // Whether Redis is first or DB pool is first, both are completely valid!
  if (
    (idxRedis === 0 && idxDb === 1) ||
    (idxDb === 0 && idxRedis === 1)
  ) {
    return {
      isValid: true,
      score: 30,
      feedback:
        'Optimal Recovery Sequence! You tuned caching and optimized connection pooling before re-running the 30,000-user load test, verified telemetry results, and secured governance signoffs with solid evidence.',
    };
  }

  // Reasonable alternative where fixes precede retest, but with slightly minor ordering
  return {
    isValid: true,
    score: 25,
    feedback:
      'Valid Recovery Sequence. The core dependencies (Fixes → Retest → Analysis → Approvals) are properly satisfied.',
  };
}

// ── SECTION C: RETEST TELEMETRY COMPARISON ──
export const RETEST_METRIC_COMPARISONS: MetricComparison[] = [
  {
    name: 'Appraisal API Response Time',
    initial: '4.2 sec',
    retest: '1.6 sec',
    initialStatus: 'critical',
    retestStatus: 'ok',
    delta: '-62% Latency Drop (Meets SLA < 2.0s)',
  },
  {
    name: 'DB Connection Pool Utilization',
    initial: '98% (Saturated)',
    retest: '68% (Healthy Headroom)',
    initialStatus: 'critical',
    retestStatus: 'ok',
    delta: '+32% Available Buffer for Traffic Spikes',
  },
  {
    name: 'Redis Cache Hit Rate',
    initial: '42% (High Miss Rate)',
    retest: '89% (Optimal Caching)',
    initialStatus: 'warning',
    retestStatus: 'ok',
    delta: '+47% Hits Served Directly from Memory',
  },
  {
    name: 'Gateway Timeout (504) Errors',
    initial: 'Elevated (4.8% of requests)',
    retest: 'Within Threshold (0.02%)',
    initialStatus: 'critical',
    retestStatus: 'ok',
    delta: 'Gateway Timeouts Eliminated',
  },
];

// ── INITIAL STATE ──
export const INITIAL_CHAPTER6_STATE: Chapter6State = {
  currentStage: 'meeting',
  activeSection: 'diagnose',
  meetingCompleted: false,
  commandCentreOpened: false,

  selectedBottleneck: null,
  diagnosisConfirmed: false,
  diagnosisAttempts: 0,

  recoverySequence: [],
  sequenceValidated: false,
  sequenceValidationFeedback: null,
  sequenceAttemptCount: 0,

  retestRunning: false,
  retestCompleted: false,
  retestAnalyzed: false,
  leadApprovalStatus: 'pending',
  ctoApprovalStatus: 'pending',
  approvalBlockedReason: null,

  closingChatShown: false,
  completed: false,
  scorecard: {
    shown: false,
    scheduleScore: 0,
    riskScore: 0,
    governanceScore: 0,
    efficiencyScore: 0,
    totalScore: 0,
    breakdown: {
      diagnosisScore: 0,
      recoveryScore: 0,
      retestScore: 0,
      approvalScore: 0,
    },
    outcomeType: 'incomplete',
    outcomeText: '',
    whatYouDidWell: '',
    whatToImprove: '',
    keyTakeaway: CHAPTER6_LEARNING_TAKEAWAY,
    explanations: {
      schedule: '',
      risk: '',
      governance: '',
      efficiency: '',
    },
  },
};

// ── SCORING COMPUTATION ENGINE ──
export function computeChapter6Score(state: Chapter6State): Chapter6Scorecard {
  // Activity 1: Correct Bottleneck Diagnosis (Max 20 pts)
  let diagnosisScore = 0;
  if (state.selectedBottleneck === 'db_pool_saturation') {
    if (state.diagnosisAttempts <= 1) diagnosisScore = 20;
    else if (state.diagnosisAttempts === 2) diagnosisScore = 15;
    else diagnosisScore = 10;
  }

  // Activity 2: Recovery Sequence (Max 30 pts)
  let recoveryScore = 0;
  if (state.sequenceValidated && state.recoverySequence.length === 5) {
    const res = validateRecoverySequence(state.recoverySequence);
    recoveryScore = res.score;
  }

  // Activity 3: Retest Interpretation (Max 20 pts)
  let retestScore = 0;
  if (state.retestCompleted && state.retestAnalyzed) {
    retestScore = 20;
  } else if (state.retestCompleted) {
    retestScore = 15;
  }

  // Activity 4: Approval Gate Management (Max 30 pts)
  let approvalScore = 0;
  if (state.leadApprovalStatus === 'approved' && state.ctoApprovalStatus === 'approved') {
    approvalScore = 30;
  } else if (state.leadApprovalStatus === 'approved') {
    approvalScore = 15;
  }

  const totalScore = Math.min(100, diagnosisScore + recoveryScore + retestScore + approvalScore);

  // Map to the 4 enterprise metrics:
  // 1. Schedule / Timeline (efficiency in resolving without circular delays)
  const scheduleScore = Math.min(
    100,
    Math.round(
      (diagnosisScore / 20) * 35 +
      (recoveryScore / 30) * 35 +
      (state.diagnosisAttempts === 1 ? 30 : 20)
    )
  );

  // 2. Trust & Risk Management (avoiding premature release, verifying evidence)
  const riskScore = Math.min(
    100,
    Math.round(
      (retestScore / 20) * 50 +
      (state.ctoApprovalStatus === 'approved' ? 50 : 20)
    )
  );

  // 3. Delivery Governance (following testing & dual-approval procedures)
  const governanceScore = Math.min(
    100,
    Math.round(
      (approvalScore / 30) * 60 +
      (recoveryScore / 30) * 40
    )
  );

  // 4. Team Efficiency & Velocity (prioritizing root technical fixes)
  const efficiencyScore = Math.min(
    100,
    Math.round(
      (recoveryScore / 30) * 50 +
      (diagnosisScore / 20) * 50
    )
  );

  let outcomeType: Chapter6OutcomeType = 'incomplete';
  let outcomeText = '';
  if (totalScore >= 85) {
    outcomeType = 'strong';
    outcomeText = 'Production Authorization Granted — Performance Benchmarks Proven';
  } else if (totalScore >= 65) {
    outcomeType = 'mixed';
    outcomeText = 'Performance Stabilized with Minor Sequencing Overhead';
  } else {
    outcomeType = 'incomplete';
    outcomeText = 'Release Validation Incomplete — Missing Critical Approvals';
  }

  let whatYouDidWell = '';
  if (outcomeType === 'strong') {
    whatYouDidWell =
      'You accurately diagnosed database connection saturation, logically sequenced caching and pool optimizations before the 30,000-user retest, and secured dual technical signoffs with conclusive APM evidence.';
  } else {
    whatYouDidWell =
      'You recognized that functional tests alone cannot validate production readiness and conducted performance remediation before opening to bank users.';
  }

  let whatToImprove = '';
  if (state.diagnosisAttempts > 1) {
    whatToImprove =
      'Look directly at the APM trace explorer and connection pool metrics to isolate backend pool saturation from frontend rendering.';
  } else if (recoveryScore < 30) {
    whatToImprove =
      'Ensure technical remediation (Redis caching + DB pool tuning) occurs strictly before executing load tests, and analyze metrics before seeking executive signoff.';
  } else {
    whatToImprove =
      'Maintain rigorous release discipline: ensure both Engineering Lead and CTO approvals have attached APM telemetry records.';
  }

  return {
    shown: true,
    scheduleScore,
    riskScore,
    governanceScore,
    efficiencyScore,
    totalScore,
    breakdown: {
      diagnosisScore,
      recoveryScore,
      retestScore,
      approvalScore,
    },
    outcomeType,
    outcomeText,
    whatYouDidWell,
    whatToImprove,
    keyTakeaway: CHAPTER6_LEARNING_TAKEAWAY,
    explanations: {
      schedule:
        scheduleScore >= 75
          ? 'Quickly identified the root cause and executed technical recovery without schedule slippage.'
          : 'Encountered delays or repeated attempts during bottleneck diagnosis and remediation sequencing.',
      risk:
        riskScore >= 75
          ? 'Prevented scale collapse by validating 30,000 concurrent load before authorizing production traffic.'
          : 'Risk of premature rollout without sufficient evidence of database headroom under peak loads.',
      governance:
        governanceScore >= 75
          ? 'Enforced mandatory dual signoff gate (Engineering Lead + CTO) backed by verified APM telemetry.'
          : 'Bypassed or attempted signoff before completing retest analysis.',
      efficiency:
        efficiencyScore >= 75
          ? 'Targeted high-leverage fixes (Redis caching & DB connection pooling) that eliminated latency spikes by 62%.'
          : 'Could improve technical triage velocity by reviewing database pool hold times first.',
    },
  };
}

// ── SESSION STORAGE HELPERS ──
let sessionChapter6State: Chapter6State = { ...INITIAL_CHAPTER6_STATE };

export function getChapter6SessionState(): Chapter6State {
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    const raw = globalThis.localStorage.getItem('brained_chapter6_state');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        sessionChapter6State = { ...INITIAL_CHAPTER6_STATE, ...parsed };
      } catch {
        // ignore parse error
      }
    }
  }
  return { ...sessionChapter6State };
}

export function setChapter6SessionState(
  updater: Partial<Chapter6State> | ((prev: Chapter6State) => Chapter6State)
): Chapter6State {
  if (typeof updater === 'function') {
    sessionChapter6State = updater(sessionChapter6State);
  } else {
    sessionChapter6State = { ...sessionChapter6State, ...updater };
  }
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    try {
      globalThis.localStorage.setItem('brained_chapter6_state', JSON.stringify(sessionChapter6State));
    } catch {
      // ignore storage quota error
    }
  }
  return { ...sessionChapter6State };
}

export function resetChapter6SessionState() {
  sessionChapter6State = {
    ...INITIAL_CHAPTER6_STATE,
    scorecard: { ...INITIAL_CHAPTER6_STATE.scorecard },
  };
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    try {
      globalThis.localStorage.removeItem('brained_chapter6_state');
    } catch {
      // ignore
    }
  }
}
