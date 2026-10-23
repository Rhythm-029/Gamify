import type {
  Chapter5State,
  Chapter5Scorecard,
  ReadinessEvidenceCard,
  LaunchBlockerId,
  PrePilotActivityId,
  LatencyTarget,
  ErrorRateThreshold,
  FeedbackChannel,
  IncidentOwner,
  RollbackCondition,
  WiderRolloutDecision,
  Chapter5OutcomeType,
} from '../types/chapter5';

export const CHAPTER5_TITLE = 'The Launch Decision';
export const CHAPTER5_SUBTITLE = 'Controlled User Group Rollout · Production Readiness & Pilot Assessment';

// ── 5 EVIDENCE CARDS (Exact Scenario Facts) ──
export const READINESS_EVIDENCE_CARDS: ReadinessEvidenceCard[] = [
  {
    id: 'functional_testing',
    title: 'Functional Testing',
    category: 'Core Modules',
    status: 'ready',
    evidence: 'Core Phase 1 workflows (Appraisals, Attendance, and Leave) passed initial functional tests in staging.',
    implications: 'Basic UI/UX and calculation logic are verified for single users and test batches. However, functional validation alone does not guarantee stability under enterprise bank concurrency.',
    owner: 'Daniel Kapoor (Dev Lead)',
    signoffRequired: 'QA Lead Signoff (Granted)',
  },
  {
    id: 'integration_gateway',
    title: 'Integration',
    category: 'Architecture & Connectivity',
    status: 'ready',
    evidence: 'The approved API gateway connection works in staging, translating SOAP/XML legacy services to REST.',
    implications: 'The integration architecture successfully handles test transactions. Gateway failover and rate limits must be monitored closely during live user activity.',
    owner: 'Core Banking Integration Team',
    signoffRequired: 'Architecture Review Signoff (Granted)',
  },
  {
    id: 'security_access',
    title: 'Security and Access',
    category: 'InfoSec & Compliance',
    status: 'needs_review',
    evidence: 'LDAP/SSO works for test accounts, but production access approval is still pending with Information Security.',
    implications: 'Releasing to actual bank employees without formal production access clearance violates ICICI Bank security compliance and risks unauthorized directory data exposure.',
    owner: 'InfoSec & Identity Team',
    signoffRequired: 'Production Access Authorization (Pending)',
  },
  {
    id: 'performance_load',
    title: 'Performance',
    category: 'Scalability & Reliability',
    status: 'blocked',
    evidence: 'Functional tests passed, but peak-load testing against the expected 80,000-user volume is incomplete.',
    implications: 'Morning check-ins and appraisal submission spikes create intense concurrency. Opening to users without knowing the breaking threshold invites immediate server collapse.',
    owner: 'Performance Engineering Team',
    signoffRequired: 'Peak Load Benchmark Validation (Incomplete)',
  },
  {
    id: 'rollback_monitoring',
    title: 'Rollback and Monitoring',
    category: 'Operational Readiness',
    status: 'needs_review',
    evidence: 'Monitoring is configured in staging, but the rollback procedure has not been formally approved or dry-run.',
    implications: 'If a critical defect or data corruption occurs during live use, the team lacks an authorized, verified rollback script to restore service without data loss.',
    owner: 'DevOps & Site Reliability Team',
    signoffRequired: 'Formal Rollback Procedure Approval (Pending)',
  },
];

// ── STAGE 2: LAUNCH BLOCKER OPTIONS ──
export interface LaunchBlockerOption {
  id: LaunchBlockerId;
  label: string;
  description: string;
  isMandatoryBlocker: boolean;
  category: 'performance' | 'security' | 'operations' | 'distractor';
}

export const LAUNCH_BLOCKER_OPTIONS: LaunchBlockerOption[] = [
  {
    id: 'blocker_performance_load',
    label: 'Complete performance testing against an agreed load target',
    description: 'Verify service response times and database connection pools under simulated pilot and peak loads before opening access.',
    isMandatoryBlocker: true,
    category: 'performance',
  },
  {
    id: 'blocker_security_approval',
    label: 'Obtain production security and access approval',
    description: 'Secure formal InfoSec signoff and verified production LDAP/SSO role mappings for pilot bank participants.',
    isMandatoryBlocker: true,
    category: 'security',
  },
  {
    id: 'blocker_rollback_procedure',
    label: 'Approve and verify the rollback procedure and confirm monitoring readiness',
    description: 'Establish a tested, signed-off fallback mechanism and active alert thresholds before exposing actual user data.',
    isMandatoryBlocker: true,
    category: 'operations',
  },
  {
    id: 'distractor_phase2_backlog',
    label: 'Complete functional testing of all future Phase 2 backlog items',
    description: 'Block the pilot until post-Phase-1 roadmap enhancements (e.g. mobile app biometric sync) are fully coded and tested.',
    isMandatoryBlocker: false,
    category: 'distractor',
  },
  {
    id: 'distractor_immediate_general',
    label: 'Bypass pilot gates and immediately deploy to all 80,000 employees',
    description: 'Assume passing functional tests in staging guarantee readiness and proceed to general availability without a pilot.',
    isMandatoryBlocker: false,
    category: 'distractor',
  },
];

// ── STAGE 3A: PRE-PILOT VALIDATION ACTIVITIES ──
export interface PrePilotActivityItem {
  id: PrePilotActivityId;
  title: string;
  description: string;
  recommendedStage: 'pre_pilot_prerequisite' | 'during_pilot_continuous';
}

export const PRE_PILOT_ACTIVITIES: PrePilotActivityItem[] = [
  {
    id: 'act_peak_load',
    title: 'Complete peak-load testing',
    description: 'Simulate concurrent user transactions to validate database pool sizing and latency SLAs.',
    recommendedStage: 'pre_pilot_prerequisite',
  },
  {
    id: 'act_security_approval',
    title: 'Obtain production security and access approval',
    description: 'Secure formal written authorization from InfoSec for the 500 pilot employee user directory group.',
    recommendedStage: 'pre_pilot_prerequisite',
  },
  {
    id: 'act_monitoring_alerts',
    title: 'Confirm monitoring and alert thresholds',
    description: 'Set real-time latency alarms, error-rate telemetry, and paging integration before opening traffic.',
    recommendedStage: 'pre_pilot_prerequisite',
  },
  {
    id: 'act_rollback_approval',
    title: 'Approve and verify the rollback procedure',
    description: 'Document and dry-run step-by-step database downgrade and blue/green traffic redirection.',
    recommendedStage: 'pre_pilot_prerequisite',
  },
  {
    id: 'act_user_comms',
    title: 'Publish the user communication plan',
    description: 'Send onboarding guides, pilot FAQ, and daily feedback channels to the 500 pilot participants.',
    recommendedStage: 'during_pilot_continuous',
  },
];

// ── STAGE 3B: CONTROLLED USER GROUP PILOT OPTIONS ──
export const LATENCY_TARGET_OPTIONS = [
  {
    id: 'strict_800ms' as LatencyTarget,
    label: 'p95 Latency < 800ms',
    detail: 'Strict bank SLA under pilot load — alerts on degradation before users experience lag.',
    score: 'strong',
  },
  {
    id: 'moderate_1500ms' as LatencyTarget,
    label: 'p95 Latency < 1,500ms',
    detail: 'Moderate baseline — acceptable for initial pilot but provides less buffer.',
    score: 'acceptable',
  },
  {
    id: 'unspecified' as LatencyTarget,
    label: 'No Latency SLA Defined',
    detail: 'Subjective evaluation — high risk of undetected user frustration.',
    score: 'poor',
  },
];

export const ERROR_RATE_OPTIONS = [
  {
    id: 'strict_0_1_percent' as ErrorRateThreshold,
    label: 'Error Rate < 0.1% with Automated Alerts',
    detail: 'Continuous telemetry trigger notifying on-call engineers within 60 seconds.',
    score: 'strong',
  },
  {
    id: 'lenient_1_percent' as ErrorRateThreshold,
    label: 'Error Rate < 1.0%',
    detail: 'Higher tolerance threshold — catches major service disruptions but masks edge errors.',
    score: 'acceptable',
  },
  {
    id: 'manual_logs_only' as ErrorRateThreshold,
    label: 'Manual Daily Log Inspection',
    detail: 'No real-time alarms — delays critical incident discovery until end-of-day.',
    score: 'poor',
  },
];

export const FEEDBACK_CHANNEL_OPTIONS = [
  {
    id: 'in_app_daily_pulse' as FeedbackChannel,
    label: 'In-App Feedback Widget + End-of-Day Pulse Survey',
    detail: 'Captures in-the-moment friction and structured daily sentiment from 500 users.',
    score: 'strong',
  },
  {
    id: 'email_thread_only' as FeedbackChannel,
    label: 'Ad-hoc Email Thread to Support Inbox',
    detail: 'Unstructured email replies — difficult to triage and synthesize under a 48h pilot.',
    score: 'acceptable',
  },
  {
    id: 'no_proactive_feedback' as FeedbackChannel,
    label: 'Passive Support Tickets Only (No Proactive Survey)',
    detail: 'Assumes silence implies success — misses critical UX confusion and workflow drops.',
    score: 'poor',
  },
];

export const INCIDENT_OWNER_OPTIONS = [
  {
    id: 'daniel_oncall_aarav_lead' as IncidentOwner,
    label: 'Daniel (Dev Lead On-Call) + Aarav (PM Incident Escalation)',
    detail: 'Clear technical accountability with 15-minute response SLA and executive stakeholder bridge.',
    score: 'strong',
  },
  {
    id: 'unassigned_channel' as IncidentOwner,
    label: 'Unassigned / Shared General Support Queue',
    detail: 'Shared bystander effect — unclear who has authorization to pause or roll back.',
    score: 'poor',
  },
];

export const ROLLBACK_CONDITION_OPTIONS = [
  {
    id: 'sev1_or_high_error_rate' as RollbackCondition,
    label: 'Error Rate > 0.5% or Any Sev-1 Data Discrepancy',
    detail: 'Triggers immediate pilot pause and rollback evaluation to protect banking records.',
    score: 'strong',
  },
  {
    id: 'complete_server_crash_only' as RollbackCondition,
    label: 'Roll Back Only on Total Service Outage (HTTP 500)',
    detail: 'Allows subtle data defects and localized corruption to persist undetected.',
    score: 'poor',
  },
];

// ── STAGE 3C: WIDER ROLLOUT DECISION OPTIONS ──
export const WIDER_ROLLOUT_OPTIONS = [
  {
    id: 'release_immediate_all' as WiderRolloutDecision,
    label: '1. Release to all 80,000 employees immediately',
    description: 'Open general availability bank-wide directly after the 48-hour pilot concludes without phased gating.',
    assessment: 'Risky / Heavy Penalty: Exposes the entire bank to unmitigated scale shock and operational risks without verified pilot review.',
  },
  {
    id: 'expand_in_stages' as WiderRolloutDecision,
    label: '2. Expand in stages after the pilot meets its acceptance criteria and receives necessary approval',
    description: 'Progressively ramp from 500 to 5,000 to full bank deployment upon formal review of pilot metrics and stakeholder signoff.',
    assessment: 'Recommended / Strong: Follows evidence-based enterprise governance, isolating residual risk while advancing the release safely.',
  },
  {
    id: 'extend_pilot' as WiderRolloutDecision,
    label: '3. Extend the pilot if results are inconclusive or defects remain unresolved',
    description: 'Keep the 500-user boundary in place and run a second 48-hour observation window if telemetry identifies anomalies.',
    assessment: 'Responsible Fallback / Defensible: Demonstrates disciplined restraint when pilot data shows latency spikes or unresolved defects.',
  },
];

// ── INITIAL STATE ──
export const INITIAL_CHAPTER5_STATE: Chapter5State = {
  currentStage: 'review_evidence',
  meetingCompleted: false,
  boardOpened: false,

  viewedEvidenceCards: ['functional_testing'],
  selectedBlockers: [],
  blockerValidationMessage: null,

  prePilotActivities: {
    act_peak_load: 'pre_pilot_prerequisite',
    act_security_approval: 'pre_pilot_prerequisite',
    act_monitoring_alerts: 'pre_pilot_prerequisite',
    act_rollback_approval: 'pre_pilot_prerequisite',
    act_user_comms: 'during_pilot_continuous',
  },
  latencyTarget: 'strict_800ms',
  errorRateThreshold: 'strict_0_1_percent',
  feedbackChannel: 'in_app_daily_pulse',
  incidentOwner: 'daniel_oncall_aarav_lead',
  rollbackCondition: 'sev1_or_high_error_rate',
  widerRolloutDecision: null,

  submitted: false,
  completed: false,
  submissionRevisionNeeded: false,
  revisionReason: null,

  scorecard: {
    shown: false,
    scheduleScore: 75,
    riskScore: 75,
    governanceScore: 75,
    efficiencyScore: 75,
    totalScore: 75,
    outcomeType: 'mixed',
    outcomeText: 'Review in Progress',
    whatYouDidWell: 'Initiated structured release readiness assessment across all Phase 1 modules.',
    whatToImprove: 'Ensure all launch blockers are explicitly tied to verifiable acceptance gates.',
    keyTakeaway: 'Production readiness is demonstrated through evidence, not assumed from successful development.',
    explanations: {
      schedule: 'Sequenced validation tasks to avoid unnecessary delay while protecting release milestones.',
      risk: 'Identified critical security, load, and operational vulnerabilities before exposing users.',
      governance: 'Enforced formal signoffs, rollback procedures, and evidence-based decision criteria.',
      efficiency: 'Allowed non-blocking pilot communication activities to proceed in parallel.',
    },
  },
};

// ── DETERMINISTIC SCORING ENGINE ──
export function computeChapter5Score(
  state: Chapter5State,
  initialScores?: {
    scheduleScore?: number;
    riskScore?: number;
    governanceScore?: number;
    efficiencyScore?: number;
  }
): Chapter5Scorecard {
  let schedule = initialScores?.scheduleScore ?? 75;
  let risk = initialScores?.riskScore ?? 75;
  let governance = initialScores?.governanceScore ?? 75;
  let efficiency = initialScores?.efficiencyScore ?? 75;

  let deltaSchedule = 0;
  let deltaRisk = 0;
  let deltaGov = 0;
  let deltaEff = 0;

  // 1. Evaluate Stage 2 Blockers
  const hasLoadBlocker = state.selectedBlockers.includes('blocker_performance_load');
  const hasSecurityBlocker = state.selectedBlockers.includes('blocker_security_approval');
  const hasRollbackBlocker = state.selectedBlockers.includes('blocker_rollback_procedure');
  const hasPhase2Distractor = state.selectedBlockers.includes('distractor_phase2_backlog');
  const hasImmediateGeneralDistractor = state.selectedBlockers.includes('distractor_immediate_general');

  // Reward identifying the 3 mandatory blockers
  if (hasLoadBlocker) {
    deltaRisk += 10;
    deltaSchedule += 5;
  } else {
    deltaRisk -= 20;
    deltaGov -= 15;
  }

  if (hasSecurityBlocker) {
    deltaRisk += 10;
    deltaGov += 10;
  } else {
    deltaRisk -= 25;
    deltaGov -= 20;
  }

  if (hasRollbackBlocker) {
    deltaGov += 10;
    deltaRisk += 10;
  } else {
    deltaGov -= 20;
    deltaRisk -= 20;
  }

  // Penalize distractors
  if (hasPhase2Distractor) {
    // Unnecessary blocker on Phase 2 backlog delays Phase 1 release
    deltaSchedule -= 15;
    deltaEff -= 10;
  }
  if (hasImmediateGeneralDistractor) {
    // Attempting general release without pilot is reckless
    deltaRisk -= 30;
    deltaGov -= 25;
  }

  // 2. Evaluate Stage 3A Pre-pilot Validation Sequencing
  const peakLoadAsPrereq = state.prePilotActivities.act_peak_load === 'pre_pilot_prerequisite';
  const securityAsPrereq = state.prePilotActivities.act_security_approval === 'pre_pilot_prerequisite';
  const rollbackAsPrereq = state.prePilotActivities.act_rollback_approval === 'pre_pilot_prerequisite';
  const monitoringAsPrereq = state.prePilotActivities.act_monitoring_alerts === 'pre_pilot_prerequisite';
  const userCommsDuringPilot = state.prePilotActivities.act_user_comms === 'during_pilot_continuous';

  if (peakLoadAsPrereq && securityAsPrereq && rollbackAsPrereq && monitoringAsPrereq) {
    deltaGov += 15;
    deltaRisk += 15;
  } else {
    // Moved mandatory prerequisites into pilot phase
    deltaRisk -= 20;
    deltaGov -= 15;
  }

  if (userCommsDuringPilot) {
    // Correctly separated communication activities so they run during pilot preparation
    deltaEff += 10;
    deltaSchedule += 5;
  }

  // 3. Evaluate Stage 3B Controlled Pilot Controls
  // Latency Target
  if (state.latencyTarget === 'strict_800ms') {
    deltaEff += 10;
    deltaRisk += 5;
  } else if (state.latencyTarget === 'moderate_1500ms') {
    deltaEff += 5;
  } else {
    deltaEff -= 15;
    deltaGov -= 10;
  }

  // Error Rate
  if (state.errorRateThreshold === 'strict_0_1_percent') {
    deltaRisk += 10;
    deltaGov += 10;
  } else if (state.errorRateThreshold === 'lenient_1_percent') {
    deltaRisk += 5;
  } else {
    deltaRisk -= 20;
    deltaGov -= 15;
  }

  // Feedback Channel
  if (state.feedbackChannel === 'in_app_daily_pulse') {
    deltaEff += 10;
    deltaGov += 5;
  } else if (state.feedbackChannel === 'email_thread_only') {
    deltaEff += 0;
  } else {
    deltaEff -= 15;
  }

  // Incident Owner
  if (state.incidentOwner === 'daniel_oncall_aarav_lead') {
    deltaGov += 10;
    deltaEff += 5;
  } else {
    deltaGov -= 15;
    deltaRisk -= 10;
  }

  // Rollback Condition
  if (state.rollbackCondition === 'sev1_or_high_error_rate') {
    deltaGov += 10;
    deltaRisk += 10;
  } else {
    deltaRisk -= 20;
    deltaGov -= 15;
  }

  // 4. Evaluate Stage 3C Wider Rollout Decision
  if (state.widerRolloutDecision === 'expand_in_stages') {
    deltaGov += 20;
    deltaRisk += 15;
    deltaSchedule += 10;
    deltaEff += 10;
  } else if (state.widerRolloutDecision === 'extend_pilot') {
    // Defensible / responsible alternative
    deltaRisk += 15;
    deltaGov += 10;
    deltaSchedule -= 5;
  } else if (state.widerRolloutDecision === 'release_immediate_all') {
    // Reckless general release
    deltaRisk -= 35;
    deltaGov -= 30;
    deltaSchedule -= 15;
  }

  // Clamp deltas to [10, 100]
  const clamp = (val: number) => Math.max(10, Math.min(100, Math.round(val)));

  const finalSchedule = clamp(schedule + deltaSchedule);
  const finalRisk = clamp(risk + deltaRisk);
  const finalGov = clamp(governance + deltaGov);
  const finalEff = clamp(efficiency + deltaEff);

  const totalScore = Math.round((finalSchedule + finalRisk + finalGov + finalEff) / 4);

  let outcomeType: Chapter5OutcomeType = 'mixed';
  let outcomeText = 'Controlled Pilot Plan Submitted with Caveats';

  if (totalScore >= 80 && hasLoadBlocker && hasSecurityBlocker && hasRollbackBlocker && state.widerRolloutDecision !== 'release_immediate_all') {
    outcomeType = 'strong';
    outcomeText = 'Controlled Pilot Plan Submitted & Authorized for Review';
  } else if (totalScore < 55 || state.widerRolloutDecision === 'release_immediate_all') {
    outcomeType = 'incomplete';
    outcomeText = 'Rollout Plan Incomplete — Critical Controls Missing';
  }

  // What you did well
  let whatYouDidWell = 'You isolated mandatory release prerequisites from non-blocking activities and enforced controlled user boundaries.';
  if (outcomeType === 'strong') {
    whatYouDidWell = 'You established a balanced pilot plan: 500 users, strict telemetry alarms, verified rollback criteria, and phased expansion gates.';
  } else if (hasSecurityBlocker && hasRollbackBlocker) {
    whatYouDidWell = 'You correctly recognized that security authorization and rollback approval cannot be bypassed.';
  }

  // What to improve
  let whatToImprove = 'Ensure telemetry thresholds and incident ownership are explicitly defined prior to opening user access.';
  if (state.widerRolloutDecision === 'release_immediate_all') {
    whatToImprove = 'Never release to 80,000 employees directly without pilot validation; always expand in phased increments.';
  } else if (!hasLoadBlocker) {
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

  return {
    shown: true,
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

// ── SESSION STORAGE HELPERS ──
let sessionChapter5State: Chapter5State = { ...INITIAL_CHAPTER5_STATE };

export function getChapter5SessionState(): Chapter5State {
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    const raw = globalThis.localStorage.getItem('brained_chapter5_state');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        sessionChapter5State = { ...INITIAL_CHAPTER5_STATE, ...parsed };
      } catch {
        // ignore parse errors
      }
    }
  }
  return { ...sessionChapter5State };
}

export function setChapter5SessionState(
  updater: Partial<Chapter5State> | ((prev: Chapter5State) => Chapter5State)
): Chapter5State {
  if (typeof updater === 'function') {
    sessionChapter5State = updater(sessionChapter5State);
  } else {
    sessionChapter5State = { ...sessionChapter5State, ...updater };
  }
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    try {
      globalThis.localStorage.setItem('brained_chapter5_state', JSON.stringify(sessionChapter5State));
    } catch {
      // ignore quota errors
    }
  }
  return { ...sessionChapter5State };
}

export function resetChapter5SessionState() {
  sessionChapter5State = {
    ...INITIAL_CHAPTER5_STATE,
    viewedEvidenceCards: ['functional_testing'],
    selectedBlockers: [],
    prePilotActivities: { ...INITIAL_CHAPTER5_STATE.prePilotActivities },
    scorecard: { ...INITIAL_CHAPTER5_STATE.scorecard },
  };
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    try {
      globalThis.localStorage.removeItem('brained_chapter5_state');
    } catch {
      // ignore
    }
  }
}
