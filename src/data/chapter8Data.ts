/**
 * chapter8Data.ts
 * Master data, dialogue scripts, evaluation logic & session state for Chapter 8:
 * SECURITY ATTACKS, POLICIES & COMPLIANCE ACTS
 * Scene 8.1: Defending Against Credential Stuffing
 */

import type {
  Chapter8State,
  Chapter8Scorecard,
  Chapter8DecisionChoice,
  ThreatOption,
  TargetSystemOption,
  TrafficSourceOption,
  SecurityAuthorityOption,
  SecurityReadinessChecklist,
  Chapter8OutcomeType,
} from '../types/chapter8';

export const CHAPTER8_TITLE = 'Security Attacks, Policies & Compliance Acts';
export const CHAPTER8_SUBTITLE = 'PM Leadership Lens — Surya & Senior PM Perspective';
export const CHAPTER8_PROJECT_NAME = 'Project Amigo';
export const CHAPTER8_STAGE_LABEL = 'Defending Against Credential Stuffing';
export const CHAPTER8_USP =
  'Implements immediate Web Application Firewall (WAF) bot mitigation and strict multi-factor authentication (MFA) rate-limiting.';
export const CHAPTER8_KEY_TAKEAWAY =
  'Institutional cybersecurity compliance is non-negotiable. Swift threat defense prevents portal suspension and preserves enterprise trust.';

// ── CHARACTERS ──
export const CHAPTER8_CHARACTERS = {
  ciso: {
    name: 'Bank CISO',
    role: 'Security Authority · Chief Information Security Officer',
    avatar: '/character/Olivia_hayes/OliviaDP.png',
  },
  alex: {
    name: 'Alex',
    role: 'Developer · Engineering Lead',
    avatar: '/character/Daniel_Brooks/DanielDP.png',
  },
  jane: {
    name: 'Jane',
    role: 'Project Manager (You)',
    avatar: '/character/Emma_Carter/EmmaDP.png',
  },
};

// ── SCENE 8.1 SCRIPT & DIALOGUE ──
export const CISO_EXACT_ALERT =
  'Jane, we are seeing anomalous bot traffic slamming your new login portal. Under bank cybersecurity policies and IT acts, you must immediately enforce multi-factor authentication (MFA) rate-limiting or face portal suspension.';

export const SCENE_8_1_DIALOGUE = [
  {
    speaker: 'ciso',
    name: 'Bank CISO',
    role: 'Security Authority',
    time: '21:00–21:45',
    text: CISO_EXACT_ALERT,
  },
  {
    speaker: 'alex',
    name: 'Alex',
    role: 'Developer',
    time: '21:45–22:05',
    text: 'Jane, turning on strict MFA rate-limiting and perimeter bot filtering right now will introduce extra friction during morning rush logins. If legitimate branch employees trigger verification challenges or delays, support queues might spike.',
  },
  {
    speaker: 'jane',
    name: 'Jane',
    role: 'Project Manager',
    time: '22:05–22:30',
    text: 'Avoiding login inconvenience is not a valid reason to ignore an active security threat. Under bank policies and IT compliance, enterprise protection comes first. We must enforce WAF bot mitigation and MFA rate-limiting immediately without compromising security.',
  },
];

// ── DECISION CHOICES (Scene 8.1 22:30–23:00) ──
export const CHAPTER8_DECISIONS: Record<
  Chapter8DecisionChoice,
  {
    id: Chapter8DecisionChoice;
    label: string;
    text: string;
    isRecommended: boolean;
    scoreImpact: {
      scheduleScore: number;
      riskScore: number;
      governanceScore: number;
      efficiencyScore: number;
    };
    explanation: string;
  }
> = {
  choice_a: {
    id: 'choice_a',
    label: 'Option A',
    text: 'Ignore the CISO warning to avoid slowing down user login speeds.',
    isRecommended: false,
    scoreImpact: {
      scheduleScore: 0,
      riskScore: -50,
      governanceScore: -40,
      efficiencyScore: 0,
    },
    explanation:
      'Ignoring institutional security warnings to preserve login speed violates bank cybersecurity policies and IT acts. The portal faces imminent suspension by the SOC and severe vulnerability to account takeover.',
  },
  choice_b: {
    id: 'choice_b',
    label: 'Option B',
    text: 'Immediately implement Web Application Firewall (WAF) bot mitigation rules and enforce strict MFA rate-limiting in compliance with bank security policies.',
    isRecommended: true,
    scoreImpact: {
      scheduleScore: 0,
      riskScore: 30,
      governanceScore: 30,
      efficiencyScore: 0,
    },
    explanation:
      'Implements non-negotiable security controls in accordance with bank cybersecurity policies and IT acts. Filters malicious bot traffic at the perimeter while protecting user accounts with enforced rate-limiting.',
  },
};

// ── ACTIVITY 1: THREAT INVESTIGATION OPTIONS ──
export const THREAT_TYPE_OPTIONS: ThreatOption[] = [
  {
    id: 'credential_stuffing',
    label: 'Credential Stuffing',
    description: 'Automated bot traffic attempting stolen authentication credentials against the portal endpoint.',
    isCorrect: true,
    explanation: 'Correct. The SOC automated feed specifically flagged credential stuffing carried out by anomalous bot networks.',
  },
  {
    id: 'ordinary_login_failures',
    label: 'Ordinary Login Failures',
    description: 'Occasional human typing errors and misplaced employee passwords under standard portal traffic.',
    isCorrect: false,
    explanation: 'Incorrect. Human password errors do not produce anomalous high-volume bot patterns slamming the gateway.',
  },
  {
    id: 'normal_traffic_spike',
    label: 'Normal Traffic Spike',
    description: 'Routine peak login traffic coinciding with standard bank shift changeover.',
    isCorrect: false,
    explanation: 'Incorrect. The CISO feed confirmed anomalous automated bot traffic, not legitimate employee shift volume.',
  },
];

export const TARGET_SYSTEM_OPTIONS: TargetSystemOption[] = [
  {
    id: 'employee_login_gateway',
    label: 'Employee Login Gateway',
    description: 'The authentication entry point portal allowing bank employees to access enterprise applications.',
    isCorrect: true,
    explanation: 'Correct. The login gateway is the primary target facing bot slamming.',
  },
  {
    id: 'attendance_database',
    label: 'Attendance Timesheet Database',
    description: 'Internal relational database storing historical shift check-in records.',
    isCorrect: false,
    explanation: 'Incorrect. The attack is targeting the perimeter login gateway, not internal database storage.',
  },
  {
    id: 'reporting_dashboard',
    label: 'Executive Reporting Dashboard',
    description: 'Read-only business analytics application for operational managers.',
    isCorrect: false,
    explanation: 'Incorrect. The threat is directed at the employee login portal.',
  },
];

export const TRAFFIC_SOURCE_OPTIONS: TrafficSourceOption[] = [
  {
    id: 'anomalous_bot_traffic',
    label: 'Anomalous Bot Traffic',
    description: 'High-frequency automated bot clusters attempting repeated credential validation.',
    isCorrect: true,
    explanation: 'Correct. Automated bot streams are generating anomalous volume on the authentication endpoints.',
  },
  {
    id: 'internal_branch_users',
    label: 'Internal Branch Users',
    description: 'Legitimate tellers and branch operations staff logging in at their desks.',
    isCorrect: false,
    explanation: 'Incorrect. Legitimate staff do not generate anomalous automated bot volume.',
  },
  {
    id: 'scheduled_batch_job',
    label: 'Scheduled Batch Sync Job',
    description: 'Background cron process synchronizing directory profiles at predetermined intervals.',
    isCorrect: false,
    explanation: 'Incorrect. This is an external automated bot attack, not a scheduled internal sync job.',
  },
];

export const SECURITY_AUTHORITY_OPTIONS: SecurityAuthorityOption[] = [
  {
    id: 'bank_ciso',
    label: 'Bank CISO (Chief Information Security Officer)',
    description: 'Executive security authority managing the SOC liaison and institutional IT compliance mandates.',
    isCorrect: true,
    explanation: 'Correct. The Bank CISO flagged the incident and mandated immediate mitigation under bank policies.',
  },
  {
    id: 'hr_operations',
    label: 'HR Operations Lead',
    description: 'Business stakeholder managing shift policies and attendance rosters.',
    isCorrect: false,
    explanation: 'Incorrect. HR Operations does not oversee security operations or cyber compliance acts.',
  },
  {
    id: 'external_vendor',
    label: 'Third-Party Hardware Vendor',
    description: 'External provider responsible for physical server rack provisioning.',
    isCorrect: false,
    explanation: 'Incorrect. Institutional cybersecurity directives originate from the Bank CISO.',
  },
];

// ── ACTIVITY 2: SECURITY CONTROLS SPECIFICATION ──
export const SECURITY_CONTROLS_SPEC = {
  waf: {
    id: 'waf_bot_mitigation',
    title: '1. Web Application Firewall (WAF) Bot Mitigation',
    description:
      'Enable bot mitigation rules at the application perimeter to filter anomalous automated bot traffic while preserving access for legitimate bank employees.',
    mandatoryReason:
      'Filters high-frequency automated credential-stuffing streams before they reach authentication servers.',
  },
  mfa: {
    id: 'mfa_rate_limiting',
    title: '2. Multi-Factor Authentication (MFA) Strict Rate-Limiting',
    description:
      'Enforce strict MFA rate-limiting to prevent repeated automated authentication attempts, satisfying the mandatory Bank CISO policy mandate.',
    mandatoryReason:
      'Prevents automated bots from continuously cycling stolen credentials and avoids imminent portal suspension.',
  },
};

// ── ACTIVITY 3: SECURITY READINESS CHECKLIST ──
export const READINESS_CHECKLIST_ITEMS = [
  {
    id: 'wafMitigationConfirmed' as keyof SecurityReadinessChecklist,
    label: 'WAF bot mitigation rules are enabled and filtering perimeter traffic',
    description: 'Automated bot traffic is filtered at the application perimeter while preserving employee access.',
  },
  {
    id: 'mfaRateLimitingConfirmed' as keyof SecurityReadinessChecklist,
    label: 'Strict MFA rate-limiting is enforced on authentication attempts',
    description: 'Repeated automated authentication attempts are blocked in accordance with CISO compliance.',
  },
  {
    id: 'legitimateAccessPreserved' as keyof SecurityReadinessChecklist,
    label: 'Employee login gateway remains accessible for legitimate users',
    description: 'Legitimate bank employees can authenticate without unauthorized lockout or service failure.',
  },
  {
    id: 'responseDocumentedForCiso' as keyof SecurityReadinessChecklist,
    label: 'Security mitigation response is formally documented for the Bank CISO',
    description: 'Compliance verification log and policy actions are transmitted to Bank SOC liaison.',
  },
];

// ── CLOSING SEQUENCE CONFIRMATIONS ──
export const CLOSING_SEQUENCE_CONFIRMATIONS = [
  {
    speaker: 'alex',
    name: 'Alex',
    role: 'Developer',
    text: 'WAF bot mitigation rules are deployed and filtering perimeter traffic. MFA rate-limiting is fully enforced across all login endpoints. Legitimate staff logins are proceeding normally.',
  },
  {
    speaker: 'jane',
    name: 'Jane',
    role: 'Project Manager',
    text: 'The security incident report and compliance audit record have been documented and submitted directly to the Bank SOC Liaison channel.',
  },
  {
    speaker: 'ciso',
    name: 'Bank CISO',
    role: 'Security Authority',
    text: 'Implementation confirmed. Anomalous bot traffic has dropped to zero at the application perimeter, and MFA rate-limiting satisfies our institutional policies and IT compliance acts. Portal suspension is averted. Excellent response, Jane.',
  },
];

// ── EVALUATION LOGIC ──

/**
 * Activity 1: Investigate Threat
 */
export function evaluateThreatInvestigation(
  threat: string | null,
  target: string | null,
  source: string | null,
  authority: string | null
): {
  isComplete: boolean;
  score: number; // max 25
  feedback: string;
} {
  const isThreatCorrect = threat === 'credential_stuffing';
  const isTargetCorrect = target === 'employee_login_gateway';
  const isSourceCorrect = source === 'anomalous_bot_traffic';
  const isAuthorityCorrect = authority === 'bank_ciso';

  let correctCount = 0;
  if (isThreatCorrect) correctCount++;
  if (isTargetCorrect) correctCount++;
  if (isSourceCorrect) correctCount++;
  if (isAuthorityCorrect) correctCount++;

  if (correctCount === 4) {
    return {
      isComplete: true,
      score: 25,
      feedback:
        'Incident correctly classified: Credential stuffing targeting the Employee Login Gateway originated from anomalous bot traffic and was escalated by the Bank CISO.',
    };
  }

  const errors: string[] = [];
  if (!isThreatCorrect) errors.push('attack type');
  if (!isTargetCorrect) errors.push('target gateway');
  if (!isSourceCorrect) errors.push('traffic source');
  if (!isAuthorityCorrect) errors.push('mandating authority');

  const awardedScore = Math.max(5, Math.round((correctCount / 4) * 20));

  return {
    isComplete: true,
    score: awardedScore,
    feedback: `Investigation classified (+${awardedScore}/25 pts). Deductions applied for: ${errors.join(', ')}.`,
  };
}

/**
 * Activity 2: Configure Security Response
 * Controls are scored proportionally; both configured yields 50, otherwise marks are deducted.
 */
export function evaluateSecurityControls(
  wafEnabled: boolean,
  mfaRateLimitingEnforced: boolean
): {
  isComplete: boolean;
  score: number; // max 50
  wafScore: number; // max 25
  mfaScore: number; // max 25
  feedback: string;
} {
  const wafScore = wafEnabled ? 25 : 0;
  const mfaScore = mfaRateLimitingEnforced ? 25 : 0;
  const totalScore = wafScore + mfaScore;

  if (totalScore === 50) {
    return {
      isComplete: true,
      score: 50,
      wafScore,
      mfaScore,
      feedback:
        'Both security controls deployed: WAF bot mitigation filters malicious requests at the perimeter, and strict MFA rate-limiting secures authentication.',
    };
  }

  const missing: string[] = [];
  if (!wafEnabled) missing.push('WAF bot mitigation disabled');
  if (!mfaRateLimitingEnforced) missing.push('MFA rate-limiting disabled');

  return {
    isComplete: true,
    score: totalScore,
    wafScore,
    mfaScore,
    feedback: `Security controls deployed (+${totalScore}/50 pts). Deductions applied: ${missing.join(', ')}.`,
  };
}

/**
 * Activity 3: Validate Security Readiness
 */
export function evaluateReadinessValidation(
  checklist: SecurityReadinessChecklist | undefined,
  wafEnabled: boolean,
  mfaRateLimitingEnforced: boolean
): {
  isComplete: boolean;
  score: number; // max 25
  feedback: string;
} {
  const safeChecklist: SecurityReadinessChecklist = checklist || {
    wafMitigationConfirmed: false,
    mfaRateLimitingConfirmed: false,
    legitimateAccessPreserved: false,
    responseDocumentedForCiso: false,
  };

  const {
    wafMitigationConfirmed,
    mfaRateLimitingConfirmed,
    legitimateAccessPreserved,
    responseDocumentedForCiso,
  } = safeChecklist;

  let checkedCount = 0;
  if (wafMitigationConfirmed) checkedCount++;
  if (mfaRateLimitingConfirmed) checkedCount++;
  if (legitimateAccessPreserved) checkedCount++;
  if (responseDocumentedForCiso) checkedCount++;

  let baseScore = Math.round((checkedCount / 4) * 25);
  if (!wafEnabled || !mfaRateLimitingEnforced) {
    baseScore = Math.max(5, baseScore - 10);
  }

  if (checkedCount === 4 && wafEnabled && mfaRateLimitingEnforced) {
    return {
      isComplete: true,
      score: 25,
      feedback:
        'Security posture verified: WAF active, MFA enforced, legitimate employee access preserved, and documentation transmitted to Bank CISO.',
    };
  }

  return {
    isComplete: true,
    score: baseScore,
    feedback: `Compliance transmission completed (+${baseScore}/25 pts). Audit checklist completed with ${checkedCount}/4 verified items.`,
  };
}

/**
 * Compute the full Chapter 8 scorecard
 */
export function computeChapter8Score(state: Chapter8State): Chapter8Scorecard {
  const investEval = evaluateThreatInvestigation(
    state.selectedThreatType,
    state.selectedTargetSystem,
    state.selectedTrafficSource,
    state.selectedSecurityAuthority
  );

  const controlsEval = evaluateSecurityControls(
    state.wafBotMitigationEnabled,
    state.mfaRateLimitingEnforced
  );

  const validationEval = evaluateReadinessValidation(
    state.readinessChecklist,
    state.wafBotMitigationEnabled,
    state.mfaRateLimitingEnforced
  );

  // Activity performance sum (max 100)
  const activityScore = investEval.score + controlsEval.score + validationEval.score;

  // Decision Score Impacts
  // Choice A: Risk -50, Gov -40
  // Choice B: Risk +30, Gov +30
  let decisionRiskDelta = 0;
  let decisionGovDelta = 0;

  if (state.selectedDecision === 'choice_a') {
    decisionRiskDelta = -50;
    decisionGovDelta = -40;
  } else if (state.selectedDecision === 'choice_b') {
    decisionRiskDelta = 30;
    decisionGovDelta = 30;
  }

  // Baseline metric scores derived from activities
  // Schedule / Timeline: base 90 + activity completion bonus
  let scheduleScore = 80 + Math.round((activityScore / 100) * 15);
  // Team Efficiency & Velocity: base 85 + activity completion
  let efficiencyScore = 80 + Math.round((activityScore / 100) * 15);
  // Trust & Risk Management: base 60 + activities + decision impact
  let riskScore = 40 + Math.round((activityScore / 100) * 30) + decisionRiskDelta;
  // Delivery Governance: base 60 + activities + decision impact
  let governanceScore = 40 + Math.round((activityScore / 100) * 30) + decisionGovDelta;

  // Clamp within permitted bounds [0, 100]
  scheduleScore = Math.max(0, Math.min(100, scheduleScore));
  efficiencyScore = Math.max(0, Math.min(100, efficiencyScore));
  riskScore = Math.max(0, Math.min(100, riskScore));
  governanceScore = Math.max(0, Math.min(100, governanceScore));

  // Overall Total Score calculation
  let totalScore: number;
  if (state.selectedDecision === 'choice_a') {
    // Serious policy failure severely caps total score
    totalScore = Math.max(0, Math.min(45, Math.round(activityScore * 0.4)));
  } else {
    totalScore = Math.max(0, Math.min(100, activityScore));
  }

  let outcomeType: Chapter8OutcomeType = 'incomplete';
  let outcomeText = 'Mitigation Incomplete';

  if (state.selectedDecision === 'choice_b' && activityScore >= 90) {
    outcomeType = 'strong';
    outcomeText = 'EXEMPLARY DEFENSE & COMPLIANCE';
  } else if (state.selectedDecision === 'choice_b' && activityScore >= 60) {
    outcomeType = 'mixed';
    outcomeText = 'COMPLIANCE ACHIEVED WITH MINOR GAPS';
  } else {
    outcomeType = 'incomplete';
    outcomeText = 'SECURITY POLICY VIOLATION OR INCOMPLETE MITIGATION';
  }

  const whatYouDidWell =
    state.selectedDecision === 'choice_b'
      ? 'You prioritized institutional compliance over login convenience, implemented mandatory WAF bot mitigation and strict MFA rate-limiting, and successfully documented the incident for the Bank CISO.'
      : 'You investigated elements of the threat environment, but bypassing CISO directives placed enterprise systems at high risk of credential stuffing and portal suspension.';

  const whatToImprove =
    state.selectedDecision === 'choice_b'
      ? 'Continue maintaining active threat intelligence feeds and reviewing perimeter rate-limits during high-volume production windows.'
      : 'Never ignore active CISO security warnings or compromise cyber compliance to avoid minor user friction.';

  return {
    shown: true,
    scheduleScore,
    riskScore,
    governanceScore,
    efficiencyScore,
    totalScore,
    breakdown: {
      investigationScore: investEval.score,
      controlsScore: controlsEval.score,
      validationScore: validationEval.score,
    },
    outcomeType,
    outcomeText,
    whatYouDidWell,
    whatToImprove,
    keyTakeaway: CHAPTER8_KEY_TAKEAWAY,
    explanations: {
      schedule: 'Threat response executed within the incident response SLA window.',
      risk:
        state.selectedDecision === 'choice_b'
          ? 'Trust & Risk boosted (+30) by immediate threat mitigation and compliance enforcement.'
          : 'Trust & Risk severely penalized (-50) for ignoring active CISO threat warning.',
      governance:
        state.selectedDecision === 'choice_b'
          ? 'Delivery Governance boosted (+30) through adherence to bank cybersecurity policies and IT acts.'
          : 'Delivery Governance penalized (-40) for policy breach and risking portal suspension.',
      efficiency: 'Cross-functional alignment between Developer (Alex) and CISO completed without delay.',
    },
  };
}

// ── INITIAL STATE ──
export const INITIAL_CHAPTER8_STATE: Chapter8State = {
  alertNotificationShown: false,
  socChannelOpened: false,
  threatDelivered: false,
  tradeoffDiscussed: false,
  meetingCompleted: false,
  callCompleted: false,
  deskUnlocked: false,

  selectedDecision: null,
  decisionScoreApplied: false,
  decisionFeedback: null,

  activeTab: 'investigate',

  selectedThreatType: null,
  selectedTargetSystem: null,
  selectedTrafficSource: null,
  selectedSecurityAuthority: null,
  investigationAttempts: 0,
  investigationValidated: false,
  investigationFeedback: null,

  wafBotMitigationEnabled: false,
  mfaRateLimitingEnforced: false,
  controlsAttempts: 0,
  controlsValidated: false,
  controlsFeedback: null,

  readinessChecklist: {
    wafMitigationConfirmed: false,
    mfaRateLimitingConfirmed: false,
    legitimateAccessPreserved: false,
    responseDocumentedForCiso: false,
  },
  validationAttempts: 0,
  validationCompleted: false,
  validationFeedback: null,

  closingConfirmed: false,
  completed: false,
  scorecard: {
    shown: false,
    scheduleScore: 0,
    riskScore: 0,
    governanceScore: 0,
    efficiencyScore: 0,
    totalScore: 0,
    breakdown: {
      investigationScore: 0,
      controlsScore: 0,
      validationScore: 0,
    },
    outcomeType: 'incomplete',
    outcomeText: '',
    whatYouDidWell: '',
    whatToImprove: '',
    keyTakeaway: CHAPTER8_KEY_TAKEAWAY,
    explanations: {
      schedule: '',
      risk: '',
      governance: '',
      efficiency: '',
    },
  },
};

const CHAPTER8_STORAGE_KEY = 'brained_os_chapter8_state_v2';

export function getChapter8SessionState(): Chapter8State {
  if (typeof window === 'undefined') return { ...INITIAL_CHAPTER8_STATE };
  try {
    const raw =
      sessionStorage.getItem(CHAPTER8_STORAGE_KEY) ||
      localStorage.getItem('brained_chapter8_state');
    if (!raw) return { ...INITIAL_CHAPTER8_STATE };
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_CHAPTER8_STATE,
      ...parsed,
      readinessChecklist: {
        ...INITIAL_CHAPTER8_STATE.readinessChecklist,
        ...(parsed.readinessChecklist || {}),
      },
      scorecard: {
        ...INITIAL_CHAPTER8_STATE.scorecard,
        ...(parsed.scorecard || {}),
        breakdown: {
          ...INITIAL_CHAPTER8_STATE.scorecard.breakdown,
          ...(parsed.scorecard?.breakdown || {}),
        },
      },
    };
  } catch (err) {
    console.error('Failed to parse Chapter 8 session state:', err);
    return { ...INITIAL_CHAPTER8_STATE };
  }
}

export function setChapter8SessionState(state: Chapter8State): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CHAPTER8_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist Chapter 8 session state:', err);
  }
}

export function resetChapter8SessionState(): Chapter8State {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(CHAPTER8_STORAGE_KEY);
      localStorage.removeItem('brained_chapter8_state');
      localStorage.removeItem('brained_os_chapter8_state_v2');
    } catch {}
  }
  return { ...INITIAL_CHAPTER8_STATE };
}
