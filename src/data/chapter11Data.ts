/**
 * data/chapter11Data.ts
 * Master canon data, activities, and scoring engine for Chapter 11:
 * Operational Handover (From Project Delivery to Operational Ownership)
 */

import type {
  Chapter11State,
  Chapter11Scorecard,
  Chapter11OutcomeType,
  OperationalRequirementItem,
  AvailableResourceItem,
  IncidentResponseStep,
  TrainingWorkshopItem,
  HypercarePhase,
  HypercareResponsibilityCard,
} from '../types/chapter11';

export const CHAPTER11_TITLE = 'Operational Handover';
export const CHAPTER11_SUBTITLE = 'From Project Delivery to Operational Ownership';
export const CHAPTER11_PROJECT_NAME = 'Project Amigo — Enterprise HRMS';
export const CHAPTER11_LOCATION = 'IT Operations Handover Meeting Room';
export const CHAPTER11_TIMESTAMP_RANGE = '27:00 – 29:00';

export const CHAPTER11_KEY_TAKEAWAY =
  'A project is not complete simply because the software works. It is complete when the organization can independently operate, support, and maintain what has been delivered.';

export const CHAPTER11_CHARACTERS = {
  player: {
    name: 'You (Project Manager)',
    role: 'Lead Project Manager · Project Amigo Delivery',
    avatar: '',
  },
  aarav: {
    name: 'Aarav Kapoor',
    role: 'Senior PM · Leadership Mentor',
    avatar: '/character/AaravDP.png',
  },
  marcus: {
    name: 'Marcus',
    role: 'Head of IT Operations',
    avatar: '/character/marcus_reed/MarcusDP.png',
  },
  daniel: {
    name: 'Daniel',
    role: 'Lead Developer · Core Engineering',
    avatar: '/character/Daniel_Brooks/DanielDP.png',
  },
  martha: {
    name: 'Martha',
    role: 'Junior PM · Transition Coordination',
    avatar: '/character/Emma_Carter/EmmaDP.png',
  },
};

// ── STAGE 1: OPERATIONAL READINESS MATCHING ──
export const OPERATIONAL_REQUIREMENTS: OperationalRequirementItem[] = [
  {
    id: 'req_failures',
    requirement: 'Resolve common production failures',
    targetResourceId: 'res_runbook',
    category: 'Troubleshooting',
  },
  {
    id: 'req_escalation',
    requirement: 'Identify who handles each incident',
    targetResourceId: 'res_escalation',
    category: 'Governance',
  },
  {
    id: 'req_access',
    requirement: 'Manage employee access and permissions',
    targetResourceId: 'res_access',
    category: 'Access Control',
  },
  {
    id: 'req_health',
    requirement: 'Monitor uptime and service health',
    targetResourceId: 'res_monitoring',
    category: 'Observability',
  },
  {
    id: 'req_workarounds',
    requirement: 'Understand known bugs and workarounds',
    targetResourceId: 'res_known_bugs',
    category: 'Known Defect',
  },
  {
    id: 'req_maintenance',
    requirement: 'Perform routine maintenance',
    targetResourceId: 'res_sop',
    category: 'Maintenance',
  },
];

export const AVAILABLE_RESOURCES: AvailableResourceItem[] = [
  {
    id: 'res_runbook',
    name: 'Administrator runbook',
    description: 'Step-by-step diagnostic procedures, health check scripts, and service restart runbooks.',
    docFormat: 'Operational Runbook (.md)',
    iconName: 'BookOpen',
  },
  {
    id: 'res_escalation',
    name: 'Escalation matrix',
    description: 'Tier-1, Tier-2 application support, and Tier-3 engineering on-call rotation with SLAs.',
    docFormat: 'Support SLA & Contact Tree',
    iconName: 'GitBranch',
  },
  {
    id: 'res_access',
    name: 'Admin access guide',
    description: 'RBAC policies, role provisioning, security group hierarchy, and permission auditing.',
    docFormat: 'IAM Security Reference',
    iconName: 'ShieldCheck',
  },
  {
    id: 'res_monitoring',
    name: 'Monitoring dashboard guide',
    description: 'Grafana & Datadog telemetry widgets, APM latency alerts, and error budget thresholds.',
    docFormat: 'APM Observability Guide',
    iconName: 'Activity',
  },
  {
    id: 'res_known_bugs',
    name: 'Known issues register',
    description: 'Catalog of non-blocking legacy defects, temporary patches, and upcoming sprint fixes.',
    docFormat: 'Jira Defect Registry',
    iconName: 'FileText',
  },
  {
    id: 'res_sop',
    name: 'Maintenance SOP',
    description: 'Standard operating procedures for SSL rotations, database vacuuming, and scheduled backups.',
    docFormat: 'Standard Operating Procedure (SOP)',
    iconName: 'Wrench',
  },
];

// ── STAGE 2: KNOWLEDGE TRANSFER & INCIDENT RESPONSE ──
export const SIMULATED_INCIDENT = {
  ticketId: 'INC-0318',
  title: 'Employee login failures',
  usersAffected: 37,
  priority: 'High',
  status: 'LIVE SIMULATION',
  system: 'Project Amigo · Auth & SSO Service v1.0.0',
  description:
    'A group of employees across 3 branches cannot access the appraisal portal. The login service is returning authentication errors and 502 Bad Gateway intermittently.',
};

export const INCIDENT_RESPONSE_STEPS: IncidentResponseStep[] = [
  {
    id: 'step_access_check',
    stepNumber: 1,
    title: 'Verify User Permissions & Account Lockouts',
    actionText: 'Consult Admin Access Guide: verify LDAP sync status and check for multi-attempt security lockouts.',
    resourceName: 'Admin access guide',
    role: 'L1 Helpdesk Support',
  },
  {
    id: 'step_runbook_restart',
    stepNumber: 2,
    title: 'Execute Authentication Troubleshooting Procedure',
    actionText: 'Execute Administrator Runbook: verify Redis token cache, inspect auth pod memory limits, and restart worker node.',
    resourceName: 'Administrator runbook',
    role: 'L2 Application Support',
  },
  {
    id: 'step_escalation_route',
    stepNumber: 3,
    title: 'Escalate Unresolved SSO Gateway Blockers',
    actionText: 'Trigger Escalation Matrix: page on-call L3 Core Engineering if token refresh failure persists past 15-minute SLA.',
    resourceName: 'Escalation matrix',
    role: 'L3 Engineering Escalation',
  },
];

export const TRAINING_WORKSHOPS: TrainingWorkshopItem[] = [
  {
    id: 'ws_admin',
    title: 'Admin portal and user management',
    owner: 'Daniel',
    ownerRole: 'Lead Developer',
    duration: '60 mins',
    scheduled: true,
  },
  {
    id: 'ws_troubleshoot',
    title: 'Incident troubleshooting and runbooks',
    owner: 'IT Operations',
    ownerRole: 'Systems Lead',
    duration: '90 mins',
    scheduled: true,
  },
  {
    id: 'ws_monitoring',
    title: 'Monitoring and escalation procedures',
    owner: 'Engineering + IT Operations',
    ownerRole: 'Joint Dev & Ops Leads',
    duration: '45 mins',
    scheduled: true,
  },
];

// ── STAGE 3: HYPERCARE TIMELINE & RESPONSIBILITIES ──
export const HYPERCARE_PHASES: HypercarePhase[] = [
  {
    id: 'phase_intensive',
    label: 'Days 1–2 · Intensive Monitoring',
    daysRange: 'Days 1–2',
    ownershipModel: 'Delivery + IT Operations',
    focus: 'Daily health checks, active incident monitoring, rapid engineering escalation',
    assignedCardIds: ['card_health_monitoring'],
  },
  {
    id: 'phase_shared',
    label: 'Days 3–7 · Shared Ownership',
    daysRange: 'Days 3–7',
    ownershipModel: 'Joint Support',
    focus: 'IT handles routine incidents, delivery team assists with complex issues, daily stabilization reviews',
    assignedCardIds: ['card_shared_resolution'],
  },
  {
    id: 'phase_ops_led',
    label: 'Days 8–14 · Operations-Led Support',
    daysRange: 'Days 8–14',
    ownershipModel: 'IT Operations Leads',
    focus: 'IT independently manages incidents, delivery team remains available on-call, final readiness review',
    assignedCardIds: ['card_independent_management', 'card_final_acceptance'],
  },
];

export const HYPERCARE_CARDS: HypercareResponsibilityCard[] = [
  {
    id: 'card_health_monitoring',
    title: 'Daily production health monitoring',
    description: 'Continuous monitoring of telemetry, database locks, and user login success rate during initial rollout.',
    correctPhaseId: 'phase_intensive',
  },
  {
    id: 'card_shared_resolution',
    title: 'Shared incident resolution with engineering',
    description: 'IT Operations triages tickets with core development team standing by for real-time pairing.',
    correctPhaseId: 'phase_shared',
  },
  {
    id: 'card_independent_management',
    title: 'Independent IT incident management',
    description: 'Support engineers independently resolve Tier-1 & Tier-2 tickets using runbooks and knowledge base.',
    correctPhaseId: 'phase_ops_led',
  },
  {
    id: 'card_final_acceptance',
    title: 'Final operational acceptance review',
    description: 'Review of hypercare metrics, ticket resolution volume, and formal transfer of sole operational sign-off.',
    correctPhaseId: 'phase_ops_led',
  },
];

// ── FINAL DECISION OPTIONS (SCENE 11.2) ──
export const CHAPTER11_DECISION_OPTIONS = {
  choice_a: {
    id: 'choice_a' as const,
    title: 'Choice A · Incomplete Transition',
    subtitle: 'Hand over the codebase immediately without training or operational runbooks',
    quote: '"The system is live. IT can figure out the remaining details."',
    deliveryGovernanceDelta: -35,
    trustRiskDelta: -30,
    teamEfficiencyDelta: -15,
    consequence:
      'A few days later, a 2 AM production failure strikes the appraisal cluster. The on-call support engineer frantically searches for troubleshooting procedures but finds nothing. They try contacting Daniel directly, but he is already assigned to another project. Marcus escalates to executive leadership: "We have the application, but we cannot support it. Handover failed."',
  },
  choice_b: {
    id: 'choice_b' as const,
    title: 'Choice B · Formal Operational Handover Protocol (Recommended)',
    subtitle: 'Execute structured handover complete with admin runbooks, training workshops, and 2-week hypercare window',
    quote: '"Let\'s transfer ownership through a structured transition, with clear responsibilities and continued support until IT is ready to operate independently."',
    deliveryGovernanceDelta: +30,
    trustRiskDelta: +25,
    teamEfficiencyDelta: +15,
    consequence:
      'Marcus signs the operational acceptance certificate on behalf of IT Operations. The 14-day hypercare window launches smoothly with zero escalation chaos. Support engineers resolve tickets independently, Daniel and engineering can focus on future product cycles, and operational ownership is firmly established.',
  },
};

// ── DETERMINISTIC SCORING ENGINE ──
export function computeChapter11Score(
  state: Chapter11State,
  baselineScores = { schedule: 80, risk: 75, governance: 70, efficiency: 75 }
): Chapter11Scorecard {
  const isChoiceB = state.decisionChosen === 'choice_b';
  const isChoiceA = state.decisionChosen === 'choice_a';

  // Activity 1: Matching Bonus (1 pt per correct pair, up to 6 pts)
  let matchingBonus = 0;
  OPERATIONAL_REQUIREMENTS.forEach((req) => {
    if (state.matchedPairs[req.id] === req.targetResourceId) {
      matchingBonus += 1;
    }
  });

  // Activity 2: Incident Response sequence bonus (4 pts if correct order)
  const isIncidentCorrect =
    state.incidentSlots[0] === 'step_access_check' &&
    state.incidentSlots[1] === 'step_runbook_restart' &&
    state.incidentSlots[2] === 'step_escalation_route';
  const incidentBonus = isIncidentCorrect ? 4 : state.incidentValidated ? 2 : 0;

  // Activity 3: Hypercare Timeline bonus (5 pts if all 4 cards correctly placed)
  let hypercareMatches = 0;
  HYPERCARE_CARDS.forEach((card) => {
    if (state.phaseAssignments[card.id] === card.correctPhaseId) {
      hypercareMatches += 1;
    }
  });
  const hypercareBonus = hypercareMatches === 4 ? 5 : Math.round((hypercareMatches / 4) * 4);

  const totalBonus = matchingBonus + incidentBonus + hypercareBonus;

  let deltaGov = 0;
  let deltaRisk = 0;
  let deltaEff = 0;
  let deltaSched = 0;

  if (isChoiceB) {
    deltaGov = 30;
    deltaRisk = 25;
    deltaEff = 15 + Math.round(totalBonus * 0.5);
    deltaSched = 10;
  } else if (isChoiceA) {
    deltaGov = -35;
    deltaRisk = -30;
    deltaEff = -15;
    deltaSched = -10;
  }

  const finalGov = Math.min(100, Math.max(0, baselineScores.governance + deltaGov));
  const finalRisk = Math.min(100, Math.max(0, baselineScores.risk + deltaRisk));
  const finalEff = Math.min(100, Math.max(0, baselineScores.efficiency + deltaEff));
  const finalSched = Math.min(100, Math.max(0, baselineScores.schedule + deltaSched));

  const totalScore = Math.round(
    finalGov * 0.35 + finalRisk * 0.25 + finalEff * 0.2 + finalSched * 0.2
  );

  let outcomeType: Chapter11OutcomeType = 'strong';
  let outcomeTitle = 'OPERATIONAL HANDOVER RATIFIED';
  let outcomeText =
    'You successfully transferred Project Amigo from project delivery into independent operational ownership. With verified runbooks, trained support personnel, and a 14-day hypercare stabilization model, IT Operations can confidently operate and troubleshoot the system.';

  if (isChoiceA) {
    outcomeType = 'incomplete';
    outcomeTitle = 'OPERATIONAL TRANSITION COLLAPSE';
    outcomeText =
      'You attempted to walk away from the project without transferring operational capabilities. Unprepared support personnel cannot handle production failures, leading to immediate escalation chaos and critical developer distraction.';
  } else if (totalScore < 85) {
    outcomeType = 'mixed';
    outcomeTitle = 'TRANSITION ACCEPTED WITH OPERATIONAL GAPS';
    outcomeText =
      'Ownership was transferred, but incomplete hypercare planning and minor runbook ambiguities created friction during early incident triages.';
  }

  const whatYouDidWell = isChoiceB
    ? 'Aligned IT Operations with comprehensive runbooks; validated incident response sequences with Marcus; scheduled hands-on workshops; established progressive 14-day hypercare ownership.'
    : 'Maintained initial project schedule momentum.';

  const whatToImprove = isChoiceB
    ? 'Ensure automated runbook linters and quarterly refresher drills are established so knowledge remains current beyond hypercare.'
    : 'Never treat project handover as a simple code drop. Operations must have the tools, practice, and buffer period to own the platform.';

  const executiveFeedback = isChoiceB
    ? 'Marcus (Head of IT Operations): "On behalf of IT Operations, we officially accept ownership. The team has the runbooks, escalation clarity, and hypercare backing to run Amigo independently."'
    : 'Marcus (Head of IT Operations): "We cannot accept responsibility for an unmaintainable system. When incidents strike at 2 AM, your engineers will still have to wake up and fix it."';

  return {
    shown: true,
    scheduleScore: finalSched,
    riskScore: finalRisk,
    governanceScore: finalGov,
    efficiencyScore: finalEff,
    totalScore,
    bonusPoints: totalBonus,
    breakdown: {
      matchingBonus,
      incidentBonus,
      hypercareBonus,
      governanceScore: isChoiceB ? 30 : -35,
      trustRiskScore: isChoiceB ? 25 : -30,
      efficiencyScore: isChoiceB ? 15 : -15,
    },
    decisionChosen: state.decisionChosen || undefined,
    outcomeType,
    outcomeTitle,
    outcomeText,
    whatYouDidWell,
    whatToImprove,
    keyTakeaway: CHAPTER11_KEY_TAKEAWAY,
    executiveFeedback,
    achievementUnlocked: isChoiceB && totalBonus >= 10,
    achievementTitle: 'The Transition Leader',
    explanations: {
      governance: isChoiceB
        ? `Delivery Governance boosted by +30 pts. Formal operational handover and sign-off criteria reflect enterprise-grade PM execution.`
        : `Delivery Governance penalized by -35 pts. Bypassing operational handover violates fundamental ITIL release standards.`,
      risk: isChoiceB
        ? `Trust & Risk boosted by +25 pts. Operations can independently troubleshoot at 2 AM without relying on the original builders.`
        : `Trust & Risk penalized by -30 pts. Production outages will cause immediate operational deadlock.`,
      efficiency: isChoiceB
        ? `Team Efficiency & Velocity boosted by +${15 + Math.round(totalBonus * 0.5)} pts. Development engineers are fully unblocked to focus on future product cycles.`
        : `Team Efficiency penalized by -15 pts. Developers remain bogged down acting as ad-hoc support agents.`,
      schedule: isChoiceB
        ? `Schedule bolstered by +10 pts. Structured hypercare transitions allow clean project closure on Day 14.`
        : `Schedule penalized by -10 pts. Project closure is blocked by unresolved operational disputes.`,
    },
    aiEvaluated: false,
    evaluatedAt: new Date().toISOString(),
    evaluatorName: 'Marcus (Head of IT Operations) & Aarav Kapoor (Senior PM)',
    evaluatorRole: 'Operational Handover Review Board',
  };
}

// ── SESSION STATE HELPERS ──
const DEFAULT_CHAPTER11_STATE: Chapter11State = {
  currentStage: 'handover_briefing',
  timelineTimestamp: '27:00',
  selectedTab: 'readiness',
  callInitiated: false,
  meetingCompleted: false,
  callCompleted: false,
  consoleOpened: false,
  matchedPairs: {},
  matchingCompleted: false,
  incidentSlots: [null, null, null],
  incidentValidated: false,
  workshopsScheduled: false,
  phaseAssignments: {},
  hypercareCompleted: false,
  decisionChosen: null,
  completed: false,
};

let sessionChapter11State: Chapter11State = { ...DEFAULT_CHAPTER11_STATE };

export function getChapter11SessionState(): Chapter11State {
  try {
    const raw = localStorage.getItem('brained_chapter11_state');
    if (raw) {
      return { ...DEFAULT_CHAPTER11_STATE, ...JSON.parse(raw) };
    }
  } catch {}
  return { ...sessionChapter11State };
}

export function setChapter11SessionState(state: Chapter11State): void {
  sessionChapter11State = { ...state };
  try {
    localStorage.setItem('brained_chapter11_state', JSON.stringify(state));
  } catch {}
}

export function resetChapter11SessionState(): void {
  sessionChapter11State = { ...DEFAULT_CHAPTER11_STATE };
  try {
    localStorage.removeItem('brained_chapter11_state');
  } catch {}
}
