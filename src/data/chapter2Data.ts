import type { Chapter2State, PrototypePreviewItem } from '../types/chapter2';

export const INITIAL_CHAPTER2_STATE: Chapter2State = {
  entered: false,
  activeBeat: 'incident',
  infrastructure: {
    initialDecision: null,
    recoveryRequired: false,
    recoveryCompleted: false,
    requestSent: false,
    bankITResolved: false,
    stagingVerified: false,
  },
  communication: {
    initialDecision: null,
    finalStructure: null,
    channelCreated: false,
    executiveReportingConfigured: false,
  },
  uiux: {
    initialDecision: null,
    recoveryRequired: false,
    signoffSent: false,
    approvalReceived: false,
    approvedVersions: ['Appraisal_Dashboard_v1', 'Leave_Request_Screen_v1', 'Form16_Downloader_v1'],
  },
  sprint: {
    readinessVerified: false,
    greenlightIssued: false,
  },
  scorecard: {
    shown: false,
    scheduleScore: 25,
    riskScore: 25,
    governanceScore: 25,
    efficiencyScore: 25,
    totalScore: 100,
    explanations: {
      schedule: 'You maintained delivery momentum and baseline alignment.',
      risk: 'You established a secure development path within enterprise boundaries.',
      governance: 'You established clear communication and formal design signoff.',
      efficiency: 'You kept engineering focused on unblocked work.',
    },
  },
  completed: false,
};

// ── PROTOTYPES METADATA ──
export const CHAPTER2_PROTOTYPES: PrototypePreviewItem[] = [
  {
    id: 'appraisal',
    title: 'Appraisal Dashboard',
    subtitle: 'Manager & Employee Performance Evaluation Flow',
    version: 'v1.0 (Baseline)',
    status: 'In Review',
    summary:
      'High-impact annual appraisal workflow designed for 80,000 ICICI Bank employees. Features goal evaluation, competency ratings, peer feedback summary, and one-click rating submission.',
    features: [
      'KPI Goal Alignment & Score Weights',
      'One-Click Appraisal Rating Submission for Managers',
      'Historical Performance Benchmark Graph',
      'Peer & Self-Review Summary Matrix',
    ],
  },
  {
    id: 'leave',
    title: 'Leave Request Screen',
    subtitle: 'Employee Absence Management & Holiday Calendar',
    version: 'v1.0 (Baseline)',
    status: 'In Review',
    summary:
      'Intuitive attendance and leave management interface supporting earned leave, casual leave, and sick leave balances with automated holiday calendar integration and manager approval queues.',
    features: [
      'Live Leave Balance Tracking (Privilege, Casual, Sick)',
      'Smart Date Range Selector & Holiday Sync',
      'Direct Manager Routing & Instant WhatsApp/Teams Notification Hook',
      'Half-Day & Work-From-Home Toggles',
    ],
  },
  {
    id: 'form16',
    title: 'Form 16 Downloader',
    subtitle: 'Annual Tax Deduction Certificate Portal',
    version: 'v1.0 (Baseline)',
    status: 'In Review',
    summary:
      'Secure fiscal year tax document portal providing one-click PDF generation, digital signature verification, and automated TDS breakdown for bank employees.',
    features: [
      'Financial Year & Assessment Year Selector (FY 2024-25)',
      'Digital Signature (e-Sign) Verification Status',
      'Encrypted PDF Download & Password Vault Guide',
      'Quarterly Part A & Part B Breakdown',
    ],
  },
];

// ── OFFICIAL EMAIL ARTIFACTS ──

export const EMAIL_INFRASTRUCTURE_PREREQ = {
  to: 'Bank IT / Infrastructure Support <it-support@icicibank.corp>',
  cc: 'Aarav Kapoor <aarav.kapoor@brained.io>; Daniel Brooks <daniel.brooks@brained.io>',
  subject: 'Urgent: Project Amigo — Staging Infrastructure Prerequisites',
  body: `Hi Team,

The Project Amigo engineering team is currently blocked from completing staging environment checks.

We need confirmation and resolution of the following prerequisites:

- Outbound port 443 connectivity to the approved staging endpoints.
- Required network proxy routes and whitelisting.
- Access to the staging LDAP sandbox for authentication integration and end-to-end testing.

Please confirm the responsible owner and expected resolution timeline.

Until the required access is provisioned and verified, the team will continue with independent offline unit tests and local mocks that do not require access to restricted bank systems.

We will not proceed with staging integration until the required network access and authentication dependencies have been verified.

Regards,
Digital Transformer
Project Amigo`,
};

export const EMAIL_UIUX_SIGNOFF = {
  to: 'Marcus Reed <marcus.reed@brained.io>',
  cc: 'Martha Vance <martha.vance@brained.io>; Aarav Kapoor <aarav.kapoor@brained.io>',
  subject: 'Project Amigo — UI/UX Prototype Review and Formal Signoff',
  attachments: [
    'Appraisal_Dashboard_v1.pdf',
    'Leave_Request_Screen_v1.pdf',
    'Form16_Downloader_v1.pdf',
  ],
  body: `Hi Marcus,

Thank you for reviewing the Project Amigo prototypes during our walkthrough.

Please review the attached exports for:

- Appraisal Dashboard.
- Leave Request Screen.
- Form 16 Downloader.

Could you please confirm written approval of the attached prototype versions, or share any changes that should be addressed before implementation?

We'll record the approved versions as the design baseline for the relevant development work. Any subsequent changes can then be reviewed and tracked through the project change process.

Regards,
Digital Transformer
Project Amigo`,
};

export const EMAIL_MARCUS_APPROVAL_REPLY = {
  from: 'Marcus Reed <marcus.reed@brained.io>',
  to: 'Digital Transformer <transformer@brained.io>',
  cc: 'Martha Vance <martha.vance@brained.io>; Aarav Kapoor <aarav.kapoor@brained.io>',
  subject: 'Re: Project Amigo — UI/UX Prototype Review and Formal Signoff',
  body: `Reviewed. I approve the attached prototype versions for the current design baseline. Please use these versions for implementation and route any subsequent changes through the agreed review process.

Regards,
Marcus Reed
CTO / Senior Stakeholder`,
};

export const EMAIL_SPRINT1_GREENLIGHT = {
  to: 'Project Amigo Engineering Team <amigo-dev-ops@brained.io>',
  cc: 'Aarav Kapoor <aarav.kapoor@brained.io>; Martha Vance <martha.vance@brained.io>',
  subject: 'Project Amigo — Sprint 1 Development Greenlight',
  body: `Hi Team,

The Sprint 1 readiness checks have been completed.

The staging environment has been verified, the required network and authentication dependencies have been confirmed, and the approved UI/UX prototypes are recorded as the current design baseline.

The team may now proceed with the development work covered by the approved sprint scope and design baseline.

Please continue to record blockers in the engineering operations channel and escalate material risks or scope changes through the agreed project governance process.

Regards,
Digital Transformer
Project Amigo`,
};

// ── EVALUATION & SCORING CALCULATOR ──

export function computeChapter2Score(
  state: Chapter2State,
  ch1Result?: any
): {
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  explanations: {
    schedule: string;
    risk: string;
    governance: string;
    efficiency: string;
  };
} {
  // Baseline from Chapter 1 (defaults to 25 each if not passed)
  const baseSchedule = ch1Result?.evaluation?.scheduleScore ?? 25;
  const baseRisk = ch1Result?.evaluation?.riskScore ?? 25;
  const baseGov = ch1Result?.evaluation?.governanceScore ?? 25;
  const baseEff = ch1Result?.evaluation?.efficiencyScore ?? 25;

  let deltaSchedule = 0;
  let deltaRisk = 0;
  let deltaGov = 0;
  let deltaEff = 0;

  // 1. Infrastructure decision impact
  let riskExplanation = '';
  if (state.infrastructure.initialDecision === 'unsafe') {
    deltaRisk -= 40;
    deltaGov -= 35;
    deltaEff -= 20;
    riskExplanation =
      'You initially proposed bypassing enterprise network controls. While you recovered by submitting the formal IT request, the initial risk remains noted.';
  } else if (state.infrastructure.initialDecision === 'wait') {
    deltaSchedule -= 20;
    deltaGov -= 10;
    deltaEff -= 30;
    riskExplanation =
      'You paused all engineering work waiting on IT. You recovered by identifying independent offline mocks, preventing indefinite paralysis.';
  } else {
    // 'secure'
    deltaRisk += 25;
    deltaGov += 25;
    deltaEff += 15;
    riskExplanation =
      'You established a secure development path without bypassing the bank\'s access controls, protecting enterprise security.';
  }

  // 2. Communication structure impact
  let govExplanation = '';
  if (state.communication.initialDecision === 'single-chat') {
    deltaGov -= 10;
    deltaEff -= 10;
    govExplanation =
      'You initially placed all stakeholders in a single chat, but wisely revised it to a dedicated engineering channel paired with executive dashboards.';
  } else {
    deltaSchedule += 15;
    deltaGov += 15;
    deltaEff += 20;
    govExplanation =
      'You separated engineering coordination from stakeholder reporting, creating a clearer route for technical issues and project-level decisions.';
  }

  // 3. UI/UX design signoff impact
  let scheduleExplanation = '';
  if (state.uiux.initialDecision === 'verbal') {
    deltaSchedule -= 10;
    deltaGov -= 10;
    scheduleExplanation =
      'You initially considered moving on verbal approval, but recovered by securing Marcus\'s formal written baseline approval before coding.';
  } else {
    deltaSchedule += 20;
    deltaGov += 20;
    deltaEff += 20;
    scheduleExplanation =
      'You recorded the approved design baseline in writing before implementation, eliminating avoidable rework and scope creep.';
  }

  // 4. Efficiency explanation
  const efficiencyExplanation =
    state.infrastructure.initialDecision === 'secure' && state.communication.finalStructure === 'dual-track'
      ? 'The team maintained steady velocity by pairing offline mocks with targeted communication, keeping developers unblocked.'
      : 'The team regained momentum after aligning on approved communication and unblocked offline mock development.';

  // Map to 0–100 scale (normalize baseline 25 + delta mapped to 0-100)
  // Chapter 1 provided 25 pts each (100 total). In Chapter 2, delta adjusts between -40 and +25.
  // We clamp each metric to [10, 100]
  const clamp = (val: number, min = 10, max = 100) => Math.min(Math.max(Math.round(val), min), max);

  const finalSchedule = clamp(baseSchedule * 3.5 + deltaSchedule);
  const finalRisk = clamp(baseRisk * 3.5 + deltaRisk);
  const finalGov = clamp(baseGov * 3.5 + deltaGov);
  const finalEff = clamp(baseEff * 3.5 + deltaEff);

  const totalScore = Math.round((finalSchedule + finalRisk + finalGov + finalEff) / 4);

  return {
    scheduleScore: finalSchedule,
    riskScore: finalRisk,
    governanceScore: finalGov,
    efficiencyScore: finalEff,
    totalScore,
    explanations: {
      schedule: scheduleExplanation,
      risk: riskExplanation,
      governance: govExplanation,
      efficiency: efficiencyExplanation,
    },
  };
}

// ── SESSION STORAGE HELPERS ──
let sessionChapter2State: Chapter2State = { ...INITIAL_CHAPTER2_STATE };

export function getChapter2SessionState(): Chapter2State {
  return { ...sessionChapter2State };
}

export function setChapter2SessionState(updater: Partial<Chapter2State> | ((prev: Chapter2State) => Chapter2State)) {
  if (typeof updater === 'function') {
    sessionChapter2State = updater(sessionChapter2State);
  } else {
    sessionChapter2State = { ...sessionChapter2State, ...updater };
  }
}

export function resetChapter2SessionState() {
  sessionChapter2State = {
    ...INITIAL_CHAPTER2_STATE,
    infrastructure: { ...INITIAL_CHAPTER2_STATE.infrastructure },
    communication: { ...INITIAL_CHAPTER2_STATE.communication },
    uiux: { ...INITIAL_CHAPTER2_STATE.uiux },
    sprint: { ...INITIAL_CHAPTER2_STATE.sprint },
    scorecard: { ...INITIAL_CHAPTER2_STATE.scorecard },
  };
}
