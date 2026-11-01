/**
 * chapter7Data.ts
 * Master data, evaluation logic & session state for Chapter 7:
 * PRODUCTION INCIDENT: ATTENDANCE SYNC · Incident Response & RCA Studio
 */

import type {
  Chapter7State,
  Chapter7Scorecard,
  ImmediateAction,
  RcaCardItem,
  ClosureCondition,
  Chapter7OutcomeType,
} from '../types/chapter7';

export const CHAPTER7_TITLE = 'Production Incident: Attendance Sync';
export const CHAPTER7_SUBTITLE = 'Incident Response & Root Cause Analysis (RCA) Studio';
export const CHAPTER7_LEARNING_TAKEAWAY =
  "A production incident isn't resolved until the immediate problem is fixed, its root cause is understood, and recurrence is prevented.";

// ── ACTIVITY 1: IMMEDIATE ACTIONS ──
export const IMMEDIATE_ACTIONS: ImmediateAction[] = [
  {
    id: 'deploy_hotfix',
    label: 'Deploy the reviewed hotfix to production',
    description: 'Release Daniel\'s container hotfix patch PR #142 that releases unclosed HTTP connections and purges zombie buffers.',
    isCorrect: true,
    explanation: 'Essential: Deploying the peer-reviewed hotfix terminates the memory leak and restores microservice stability.',
  },
  {
    id: 'monitor_recovery',
    label: 'Monitor service recovery and telemetry in APM',
    description: 'Track memory consumption, HTTP error rates, and connection pool health in real-time to confirm the leak has ceased.',
    isCorrect: true,
    explanation: 'Essential: Continuous observability verifies whether the service stabilizes or continues degrading.',
  },
  {
    id: 'verify_branch_users',
    label: 'Verify that affected branch officers can log in again',
    description: 'Contact Martha and check branch terminal logs to ensure the 12 affected branch officers are successfully authenticated.',
    isCorrect: true,
    explanation: 'Essential: Engineering metrics mean nothing if real frontline users are still locked out. User verification is mandatory.',
  },
  {
    id: 'close_immediately_trap',
    label: 'Close the incident ticket immediately without user verification',
    description: 'Assume the container restart solved everything and resolve the incident ticket to improve MTTR stats.',
    isCorrect: false,
    explanation: 'Severe Antipattern: Closing incidents prematurely without confirming real user access or root cause leads to immediate re-opened Sev-1 tickets.',
  },
];

// ── ACTIVITY 2: RCA ITEMS ──
export const RCA_BANK_ITEMS: RcaCardItem[] = [
  // Correct items
  {
    id: 'rca_inc_correct',
    text: 'Intermittent HTTP 504 Gateway Timeouts in Attendance Sync',
    category: 'incident',
    isCorrect: true,
    details: 'During morning check-in spikes, requests to /api/v1/attendance/sync timed out after 30 seconds at the API gateway.',
  },
  {
    id: 'rca_root_correct',
    text: 'Memory leak in the Attendance Sync microservice (unclosed HTTP sockets)',
    category: 'root_cause',
    isCorrect: true,
    details: 'Third-party biometric client instances failed to release sockets in error blocks, accumulating uncollected heap buffers until container OOM.',
  },
  {
    id: 'rca_impact_correct',
    text: '12 branch officers across retail banking unable to clock in',
    category: 'impact',
    isCorrect: true,
    details: 'Frontline branch staff experienced intermittent authentication drops and failed biometric record syncs during morning rush.',
  },
  {
    id: 'rca_prev_correct',
    text: 'Automated memory leak profiling, container alerts at 80%, and regression tests',
    category: 'preventive_action',
    isCorrect: true,
    details: 'Enforce static socket leak linting in CI/CD, set Dynatrace container memory threshold alerts at 80%, and add load regression tests.',
  },

  // Distractors
  {
    id: 'rca_inc_distractor',
    text: 'General internet service provider outage in Mumbai datacenter',
    category: 'incident',
    isCorrect: false,
    details: 'Incorrect: The network gateway and datacenter links were operational; only Attendance Sync container instances failed.',
  },
  {
    id: 'rca_root_distractor',
    text: 'Branch officers entered invalid passwords repeatedly',
    category: 'root_cause',
    isCorrect: false,
    details: 'Incorrect: Invalid passwords return 401 Unauthorized, not 504 Gateway Timeouts and container memory exhaustion.',
  },
  {
    id: 'rca_impact_distractor',
    text: 'Entire 80,000 employee enterprise payroll database corrupted',
    category: 'impact',
    isCorrect: false,
    details: 'Incorrect: Payroll and database tables remained intact; the issue was localized to Attendance Sync microservice threads.',
  },
  {
    id: 'rca_prev_distractor',
    text: 'Disable all logging and schedule manual container restarts every night',
    category: 'preventive_action',
    isCorrect: false,
    details: 'Severe Antipattern: Nightly blind restarts mask memory leaks rather than fixing underlying socket leaks and telemetry.',
  },
];

// ── ACTIVITY 3: CLOSURE CONDITIONS ──
export const CLOSURE_CONDITIONS: ClosureCondition[] = [
  {
    id: 'cond_hotfix_verified',
    label: 'Hotfix deployed and verified in production',
    description: 'Hotfix PR #142 deployed and confirmed operating with zero 504 gateway errors for at least 30 minutes.',
    isMandatory: true,
  },
  {
    id: 'cond_rca_documented',
    label: 'Root Cause Analysis (RCA) documented with timeline and socket findings',
    description: 'Detailed post-mortem document completed with technical timeline, root cause breakdown, and stakeholder impact.',
    isMandatory: true,
  },
  {
    id: 'cond_monitoring_updated',
    label: 'Monitoring thresholds & memory leak alerting configured',
    description: 'Dynatrace/APM configured with proactive alerts if container heap exceeds 80% or open sockets exceed 150.',
    isMandatory: true,
  },
  {
    id: 'cond_shared_with_leads',
    label: 'Incident report and learnings shared with engineering leads & Aarav',
    description: 'Circulate post-incident learnings across backend engineering to prevent identical socket leaks in other microservices.',
    isMandatory: true,
  },
  {
    id: 'cond_skip_documentation_trap',
    label: 'Skip formal documentation to save developer time',
    description: 'Close the incident immediately to preserve Sprint velocity without writing an RCA.',
    isMandatory: false,
  },
];

// ── INITIAL STATE ──
export const INITIAL_CHAPTER7_STATE: Chapter7State = {
  currentStage: 'alert_meeting',
  activeTab: 'immediate',
  meetingCompleted: false,
  studioOpened: false,

  selectedImmediateActions: [],
  immediateSubmitted: false,
  immediateValidationFeedback: null,

  rcaSlots: {
    incident: 'rca_inc_correct', // prefilled incident per spec
    root_cause: null,
    impact: 'rca_impact_correct', // prefilled impact per spec
    preventive_action: null,
  },
  rcaSubmitted: false,
  rcaValidationFeedback: null,

  selectedClosureConditions: [],
  closureSubmitted: false,
  closureValidationFeedback: null,

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
      closureScore: 0,
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

// ── SCORING COMPUTATION ENGINE ──
export function computeChapter7Score(state: Chapter7State): Chapter7Scorecard {
  // Activity 1: Immediate Response (Max 30 pts)
  let immediateScore = 0;
  const hasDeploy = state.selectedImmediateActions.includes('deploy_hotfix');
  const hasMonitor = state.selectedImmediateActions.includes('monitor_recovery');
  const hasVerifyUsers = state.selectedImmediateActions.includes('verify_branch_users');
  const hasCloseTrap = state.selectedImmediateActions.includes('close_immediately_trap');

  if (hasDeploy) immediateScore += 10;
  if (hasMonitor) immediateScore += 10;
  if (hasVerifyUsers) immediateScore += 10;
  if (hasCloseTrap) immediateScore = Math.max(0, immediateScore - 15);

  // Activity 2: Build RCA (Max 40 pts)
  let rcaScore = 0;
  if (state.rcaSlots.incident === 'rca_inc_correct') rcaScore += 10;
  if (state.rcaSlots.root_cause === 'rca_root_correct') rcaScore += 10;
  if (state.rcaSlots.impact === 'rca_impact_correct') rcaScore += 10;
  if (state.rcaSlots.preventive_action === 'rca_prev_correct') rcaScore += 10;

  // Activity 3: Final Incident Closure (Max 30 pts)
  let closureScore = 0;
  const hasHotfixCond = state.selectedClosureConditions.includes('cond_hotfix_verified');
  const hasRcaCond = state.selectedClosureConditions.includes('cond_rca_documented');
  const hasMonCond = state.selectedClosureConditions.includes('cond_monitoring_updated');
  const hasShareCond = state.selectedClosureConditions.includes('cond_shared_with_leads');
  const hasSkipTrap = state.selectedClosureConditions.includes('cond_skip_documentation_trap');

  if (hasHotfixCond) closureScore += 8;
  if (hasRcaCond) closureScore += 8;
  if (hasMonCond) closureScore += 7;
  if (hasShareCond) closureScore += 7;
  if (hasSkipTrap) closureScore = Math.max(0, closureScore - 15);

  const totalScore = Math.min(100, immediateScore + rcaScore + closureScore);

  // Map to the 4 core metrics:
  // 1. Schedule / Timeline: Speed and prioritisation of incident recovery
  const scheduleScore = Math.min(
    100,
    Math.round((immediateScore / 30) * 55 + (hasHotfixCond ? 45 : 20))
  );

  // 2. Trust & Risk Management: Whether production stability and affected users are prioritised
  const riskScore = Math.min(
    100,
    Math.round((hasVerifyUsers ? 40 : 10) + (hasMonCond ? 35 : 10) + (!hasCloseTrap ? 25 : 0))
  );

  // 3. Delivery Governance: Proper RCA, incident documentation and sign-off
  const governanceScore = Math.min(
    100,
    Math.round((rcaScore / 40) * 60 + (hasRcaCond ? 25 : 10) + (!hasSkipTrap ? 15 : 0))
  );

  // 4. Team Efficiency & Velocity: Effective coordination between PM, developer, and ops
  const efficiencyScore = Math.min(
    100,
    Math.round((immediateScore / 30) * 45 + (closureScore / 30) * 55)
  );

  let outcomeType: Chapter7OutcomeType = 'incomplete';
  let outcomeText = '';
  if (totalScore >= 85) {
    outcomeType = 'strong';
    outcomeText = 'Incident Fully Resolved & Future Recurrence Prevented';
  } else if (totalScore >= 65) {
    outcomeType = 'mixed';
    outcomeText = 'Hotfix Deployed with Partial Governance Gaps';
  } else {
    outcomeType = 'incomplete';
    outcomeText = 'Premature Closure — Incomplete RCA and Verification';
  }

  let whatYouDidWell = '';
  if (outcomeType === 'strong') {
    whatYouDidWell =
      'You prioritized real user impact by verifying that the 12 branch officers could log in, oversaw hotfix deployment, established root cause analysis for socket leaks, and instituted preventive memory monitoring thresholds.';
  } else {
    whatYouDidWell =
      'You helped deploy the hotfix to stabilize the Attendance Sync microservice and restored core service availability.';
  }

  let whatToImprove = '';
  if (hasCloseTrap || !hasVerifyUsers) {
    whatToImprove =
      'Never close a production incident without directly verifying that affected frontline users can complete their transactions.';
  } else if (state.rcaSlots.root_cause !== 'rca_root_correct') {
    whatToImprove =
      'Distinguish between surface symptoms (504 timeouts) and architectural root causes (memory socket leaks).';
  } else if (!hasMonCond) {
    whatToImprove =
      'Ensure alert thresholds are updated in APM so future memory leaks trigger early warnings before impacting branch officers.';
  } else {
    whatToImprove =
      'Maintain strong post-mortem discipline: always share incident retrospectives across backend engineering teams.';
  }

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
      closureScore,
    },
    outcomeType,
    outcomeText,
    whatYouDidWell,
    whatToImprove,
    keyTakeaway: CHAPTER7_LEARNING_TAKEAWAY,
    explanations: {
      schedule:
        scheduleScore >= 75
          ? 'Fast-tracked hotfix deployment and verified service recovery without unnecessary delays.'
          : 'Delayed immediate triage or attempted to bypass verification.',
      risk:
        riskScore >= 75
          ? 'Prioritized frontline branch officers and prevented silent re-emergence through active monitoring.'
          : 'Risked customer-facing branch failures by neglecting user verification.',
      governance:
        governanceScore >= 75
          ? 'Produced a complete 4-part Root Cause Analysis and attached formal engineering signoffs.'
          : 'Failed to fully document the underlying socket leak or preventive actions.',
      efficiency:
        efficiencyScore >= 75
          ? 'Coordinated seamlessly between Daniel (engineering), Martha (branch ops), and Aarav.'
          : 'Coordination friction between immediate bug fixes and long-term prevention.',
    },
  };
}

// ── SESSION STORAGE HELPERS ──
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
