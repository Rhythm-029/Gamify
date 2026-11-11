/**
 * data/chapter12Data.ts
 * Master canon data, activities, dialogues, and deterministic scoring engine
 * for Chapter 12: The Next Evolution (CR Upgrade & Phase 2 Evolution)
 */

import type {
  Chapter12State,
  Chapter12Scorecard,
  UpgradeModuleItem,
  DeploymentActionCard,
  FeatureFlagRollout,
} from '../types/chapter12';

export const CHAPTER12_TITLE = 'The Next Evolution';
export const CHAPTER12_SUBTITLE = 'CR Upgrade & Phase 2 Evolution';
export const CHAPTER12_PROJECT_NAME = 'Project Amigo — Enterprise HRMS';
export const CHAPTER12_LOCATION = 'Steering Committee Review Meeting';
export const CHAPTER12_TIMESTAMP_RANGE = '29:03 – 31:00';

export const CHAPTER12_PROJECT_STATUS = {
  currentVersion: 'v1.0.0',
  phase1Status: 'Successfully Deployed',
  productionStatus: 'Stable',
  operationalOwnership: 'Transferred to IT Operations',
  nextMilestone: 'Phase 2 Evolution',
};

export const CHAPTER12_CHARACTERS = {
  marcus: {
    name: 'Marcus',
    role: 'Head of IT Operations · Steering Committee Lead',
    avatar: '/character/marcus_reed/MarcusDP.png',
  },
  aarav: {
    name: 'Aarav Kapoor',
    role: 'Senior PM · Leadership Mentor',
    avatar: '/character/AaravDP.png',
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

// ── SCREEN 1: UPGRADE SCOPE ──
export const UPGRADE_MODULES: UpgradeModuleItem[] = [
  {
    id: 'lms',
    name: 'Learning Management System (LMS)',
    description: 'Employee training, learning modules and course management.',
    category: 'new_functionality',
    iconName: 'GraduationCap',
  },
  {
    id: 'visiting_cards',
    name: 'Digital Visiting Cards',
    description: 'Digital employee identity and contact management.',
    category: 'new_functionality',
    iconName: 'Contact2',
  },
  {
    id: 'ai_chatbot',
    name: 'AI HR Chatbot',
    description: 'AI-powered employee HR assistance.',
    category: 'new_functionality',
    iconName: 'Bot',
  },
  {
    id: 'framework_upgrade',
    name: 'Core Framework Security Upgrade',
    description: 'Upgrade the existing application framework while maintaining compatibility with Phase 1 services.',
    category: 'core_platform_upgrade',
    iconName: 'ShieldAlert',
  },
];

// ── SCREEN 2: FEATURE FLAG RELEASE PLANNER ──
export interface FeatureFlagDefinition {
  id: string;
  moduleId: string;
  name: string;
  flagKey: string;
  description: string;
  defaultRollout: FeatureFlagRollout;
}

export const FEATURE_FLAG_DEFINITIONS: FeatureFlagDefinition[] = [
  {
    id: 'ff_lms',
    moduleId: 'lms',
    name: 'Learning Management System (LMS)',
    flagKey: 'FF_LMS',
    description: 'Enables enterprise training catalog, module tracking, and mandatory certification tests.',
    defaultRollout: 25,
  },
  {
    id: 'ff_visiting_cards',
    moduleId: 'visiting_cards',
    name: 'Digital Visiting Cards',
    flagKey: 'FF_VISIT_CARD',
    description: 'Enables digital NFC/vCard generation and corporate directory export.',
    defaultRollout: 5,
  },
  {
    id: 'ff_ai_chatbot',
    moduleId: 'ai_chatbot',
    name: 'AI HR Chatbot',
    flagKey: 'FF_HR_CHATBOT',
    description: 'Enables natural language HR policy queries and automated employee ticket routing.',
    defaultRollout: 0,
  },
];

export const ROLLOUT_PERCENTAGES: { value: FeatureFlagRollout; label: string; badge: string; color: string }[] = [
  { value: 0, label: 'Disabled', badge: '0% — Disabled', color: 'bg-slate-700 text-slate-300' },
  { value: 5, label: 'Internal Pilot', badge: '5% — Internal Pilot', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { value: 25, label: 'Limited Rollout', badge: '25% — Limited Rollout', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { value: 50, label: 'Expanded Rollout', badge: '50% — Expanded Rollout', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 100, label: 'Fully Enabled', badge: '100% — Fully Enabled', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
];

export const FRAMEWORK_UPGRADE_NOTE =
  'The framework upgrade modifies existing platform components. It requires compatibility checks, integration testing and controlled deployment through a separate environment.';

// ── SCREEN 3: BLUE-GREEN DEPLOYMENT SIMULATOR ──
export const DEPLOYMENT_ACTIONS: DeploymentActionCard[] = [
  {
    id: 'action_a',
    letter: 'A',
    title: 'Prepare the green environment with the new release.',
    correctStep: 1,
  },
  {
    id: 'action_b',
    letter: 'B',
    title: 'Run compatibility, security and integration tests.',
    correctStep: 2,
  },
  {
    id: 'action_c',
    letter: 'C',
    title: 'Validate the release before switching production traffic.',
    correctStep: 3,
  },
  {
    id: 'action_d',
    letter: 'D',
    title: 'Switch production traffic to green after approval while retaining blue for rollback.',
    correctStep: 4,
  },
];

// ── FINAL STEERING COMMITTEE DECISION OPTIONS ──
export const FINAL_DECISION_OPTIONS = {
  choice_a: {
    id: 'choice_a',
    title: 'Choice A — Monolithic Deployment',
    description: 'Push all Phase 2 features and framework updates into production in one massive deployment.',
    quote: '"The board wants everything together. Let\'s deploy it all at once."',
    scheduleDelta: +5,
    riskDelta: -40,
    governanceDelta: -35,
    efficiencyDelta: -10,
    consequence:
      'High risk alert. The combined deployment creates overlapping dependencies and an increased blast radius. Daniel raises concerns on production stability, requiring emergency isolation.',
  },
  choice_b: {
    id: 'choice_b',
    title: 'Choice B (Recommended) — Controlled Phased Upgrade',
    description:
      'Establish a formal CR-Upgrade pipeline. Use feature flags to roll out Phase 2 modules incrementally via blue-green staging environments.',
    quote: '"We\'ll release progressively, validate each upgrade, and preserve the ability to roll back safely."',
    scheduleDelta: +15,
    riskDelta: +30,
    governanceDelta: +30,
    efficiencyDelta: +20,
    consequence:
      'Formal CR-Upgrade pipeline authorized! Feature flags permit low-risk pilot testing while blue-green staging ensures zero downtime and immediate rollback readiness.',
  },
};

// ── MARCUS APPROVAL EMAIL ──
export const MARCUS_APPROVAL_EMAIL = {
  sender: 'Marcus <marcus.reed@amigobank.internal>',
  recipient: 'Aarav Kapoor <aarav.kapoor@amigobank.internal>, Project Lead',
  subject: 'Approval — Project Amigo Phase 2 Upgrade Roadmap',
  body: `Hi Aarav,

The steering committee has reviewed the proposed Phase 2 evolution strategy.

We approve the formal CR-Upgrade pipeline, including incremental feature-flag releases and blue-green staging validation.

The team can proceed with the phased upgrade roadmap while maintaining the stability of the existing Phase 1 environment.

Thank you for ensuring a controlled and sustainable approach to the platform's evolution.

Marcus
Enterprise Steering Committee`,
};

// ── 12-CHAPTER JOURNEY CINEMATIC TIMELINE ──
export interface ChapterJourneyMilestone {
  chapterId: number;
  title: string;
  theme: string;
  quote: string;
  speaker: string;
  icon: string;
}

export const CHAPTER_JOURNEY_MILESTONES: ChapterJourneyMilestone[] = [
  {
    chapterId: 1,
    title: 'The Briefing',
    theme: 'Initial Project Kickoff',
    quote: '"Welcome to Project Titan. The executive kickoff begins in 10 minutes."',
    speaker: 'Aarav Kapoor',
    icon: '🚀',
  },
  {
    chapterId: 2,
    title: 'Prerequisites & UI/UX Signoff',
    theme: 'Infrastructure & Integration',
    quote: '"Development cannot start without verified staging gates and UI approval."',
    speaker: 'Daniel',
    icon: '🎯',
  },
  {
    chapterId: 3,
    title: 'UAT Coordination',
    theme: 'Environment Verification',
    quote: '"Audit the bank\'s deliverables against developer prerequisites before sprint greenlight."',
    speaker: 'Martha',
    icon: '🔌',
  },
  {
    chapterId: 4,
    title: 'CR-017 Scope Analysis',
    theme: 'Change Request Management',
    quote: '"Scope expansion without impact analysis is the fastest way to derail a timeline."',
    speaker: 'Aarav Kapoor',
    icon: '⚖️',
  },
  {
    chapterId: 5,
    title: 'The Launch Decision',
    theme: 'Controlled User Group Rollout',
    quote: '"500 pilot users will stress our assumptions under real organizational load."',
    speaker: 'Marcus',
    icon: '🚢',
  },
  {
    chapterId: 6,
    title: 'The 30,000-User Stress Test',
    theme: 'Performance & APM Tuning',
    quote: '"Connection pool saturation resolved. Uptime stabilized under enterprise peak load."',
    speaker: 'Daniel',
    icon: '⚡',
  },
  {
    chapterId: 7,
    title: 'Production Incident Response',
    theme: 'Incident Triage & RCA',
    quote: '"Attendance sync deadlock diagnosed and patched. RCA submitted within SLA."',
    speaker: 'Martha',
    icon: '🚨',
  },
  {
    chapterId: 8,
    title: 'Security & Compliance Gate',
    theme: 'Security & Compliance',
    quote: '"Credential stuffing neutralized. Zero compliance infractions logged."',
    speaker: 'Marcus',
    icon: '🛡️',
  },
  {
    chapterId: 9,
    title: 'Executive ROI Validation',
    theme: 'Financial & Operational Value',
    quote: '"42% cycle reduction and 15,000 engineering hours saved annually."',
    speaker: 'Aarav Kapoor',
    icon: '📈',
  },
  {
    chapterId: 10,
    title: 'Engineering Release v1.0.0',
    theme: 'Versioning & Documentation',
    quote: '"SemVer v1.0.0 tagged. Enterprise architecture catalog formally published."',
    speaker: 'Daniel',
    icon: '📦',
  },
  {
    chapterId: 11,
    title: 'Operational Handover',
    theme: 'Operational Ownership Transfer',
    quote: '"A project is complete when operations can run it independently at 2 AM."',
    speaker: 'Marcus',
    icon: '🔄',
  },
  {
    chapterId: 12,
    title: 'The Next Evolution',
    theme: 'CR Upgrade & Blue-Green Release',
    quote: '"You didn\'t just deliver a project. You transformed an enterprise."',
    speaker: 'Aarav Kapoor',
    icon: '🏆',
  },
];

// ── DETERMINISTIC SCORING ENGINE FOR CHAPTER 12 & FULL JOURNEY ──
export function computeChapter12Score(
  state: Chapter12State,
  baseline = { schedule: 82, risk: 80, governance: 80, efficiency: 80 }
): Chapter12Scorecard {
  const isChoiceB = state.decisionChosen === 'choice_b';
  const isChoiceA = state.decisionChosen === 'choice_a';

  // Interactive Activity Bonuses
  let scopeBonus = 0;
  if (state.scopeCompleted) {
    scopeBonus = 5;
  }

  let featureFlagBonus = 0;
  if (state.releaseStrategyCompleted) {
    const flagValues = Object.values(state.featureFlags || {});
    const fullExposureCount = flagValues.filter((v) => v === 100).length;
    if (fullExposureCount === 0) {
      featureFlagBonus = 5;
    } else if (fullExposureCount < 3) {
      featureFlagBonus = 3;
    } else {
      featureFlagBonus = 1;
    }
  }

  let blueGreenBonus = 0;
  if (state.deploymentCompleted) {
    blueGreenBonus = 5;
  }

  const bonusPoints = scopeBonus + featureFlagBonus + blueGreenBonus;

  // Exact deltas requested in USER_REQUEST:
  // Choice A: Schedule +5, Risk -40, Governance -35
  // Choice B: Schedule +15, Risk +30, Governance +30, Efficiency +20
  const schedDelta = isChoiceB ? 15 : isChoiceA ? 5 : 0;
  const riskDelta = isChoiceB ? 30 : isChoiceA ? -40 : 0;
  const govDelta = isChoiceB ? 30 : isChoiceA ? -35 : 0;
  const effDelta = isChoiceB ? 20 : isChoiceA ? -15 : 0;

  const finalSchedule = Math.min(100, Math.max(0, baseline.schedule + schedDelta));
  const finalRisk = Math.min(100, Math.max(0, baseline.risk + riskDelta + (state.trafficSwitchedToGreen ? 2 : 0)));
  const finalGov = Math.min(100, Math.max(0, baseline.governance + govDelta + (state.scopeCompleted ? 2 : 0)));
  const finalEff = Math.min(100, Math.max(0, baseline.efficiency + effDelta + (state.releaseStrategyCompleted ? 2 : 0)));

  const ch12Score = Math.round(
    finalSchedule * 0.25 + finalRisk * 0.25 + finalGov * 0.25 + finalEff * 0.25
  );

  // Cumulative calculation across 12 chapters:
  // Target: S+ range (9,200 - 9,600 / 10,000) when Choice B and activities are completed
  const baseCumulative = isChoiceB ? 9350 : 7800;
  const cumulativeScore = Math.min(10000, baseCumulative + bonusPoints * 10);

  let finalGrade: 'S+' | 'S' | 'A+' | 'A' | 'B' | 'C' = 'A';
  if (cumulativeScore >= 9400) finalGrade = 'S+';
  else if (cumulativeScore >= 9000) finalGrade = 'S';
  else if (cumulativeScore >= 8500) finalGrade = 'A+';
  else if (cumulativeScore >= 8000) finalGrade = 'A';
  else if (cumulativeScore >= 7000) finalGrade = 'B';
  else finalGrade = 'C';

  const outcomeTitle = isChoiceB
    ? 'Phase 2 CR-Upgrade Authorized · Exemplary Enterprise Governance'
    : 'Monolithic Release High Risk Flagged · Requires Staging Isolation';

  const outcomeText = isChoiceB
    ? 'You successfully established a progressive feature-flag rollout backed by an isolated blue-green staging environment. The steering committee praised the strategy for protecting the stable Phase 1 system while delivering Phase 2 capabilities.'
    : 'Deploying all modules simultaneously without staging isolation exposed the stable production environment to avoidable risk. The steering committee requested formal rollback mechanisms before cutover.';

  const leadershipStrengths = [
    'Architected disciplined zero-downtime release governance using Blue-Green routing.',
    'Controlled blast radius with granular feature-flag rollout strategies.',
    'Defended long-term production stability against unilateral monolithic pressure.',
  ];

  const areasToImprove = [
    'Ensure earlier telemetry instrumentation for newly introduced background daemons.',
    'Pre-negotiate operational signoff windows with regional business unit leads.',
  ];

  return {
    shown: true,
    scheduleScore: finalSchedule,
    riskScore: finalRisk,
    governanceScore: finalGov,
    efficiencyScore: finalEff,
    totalScore: ch12Score,
    cumulativeScore,
    finalGrade,
    bonusPoints,
    breakdown: {
      scopeBonus,
      featureFlagBonus,
      blueGreenBonus,
      scheduleDelta: schedDelta,
      riskDelta: riskDelta,
      governanceDelta: govDelta,
      efficiencyDelta: effDelta,
    },
    decisionChosen: state.decisionChosen || undefined,
    outcomeTitle,
    outcomeText,
    leadershipStrengths,
    areasToImprove,
    finalAchievementUnlocked: isChoiceB && bonusPoints >= 10,
    evaluatedAt: new Date().toISOString(),
  };
}

// ── DEFAULT SESSION STATE & PERSISTENCE ──
const DEFAULT_CHAPTER12_STATE: Chapter12State = {
  currentStage: 'status_briefing',
  timelineTimestamp: '29:03',
  statusModalSeen: false,
  meetingInitiated: false,
  meetingIntroCompleted: false,
  controlCenterOpened: false,
  selectedTab: 'upgrade_scope',
  scopeAssignments: {},
  scopeCompleted: false,
  scopeErrorCount: 0,
  featureFlags: {
    lms: 25,
    visiting_cards: 5,
    ai_chatbot: 0,
  },
  frameworkConfigured: false,
  releaseStrategyCompleted: false,
  deploymentSlots: [null, null, null, null],
  greenPrepared: false,
  testsPassed: false,
  releaseValidated: false,
  trafficSwitchedToGreen: false,
  deploymentCompleted: false,
  decisionChosen: null,
  outcomeAcknowledged: false,
  cinematicWatched: false,
  reportOpened: false,
  completed: false,
};

let sessionChapter12State: Chapter12State = { ...DEFAULT_CHAPTER12_STATE };

export function getChapter12SessionState(): Chapter12State {
  try {
    const raw = localStorage.getItem('brained_chapter12_state');
    if (raw) {
      return { ...DEFAULT_CHAPTER12_STATE, ...JSON.parse(raw) };
    }
  } catch {}
  return { ...sessionChapter12State };
}

export function setChapter12SessionState(state: Chapter12State): void {
  sessionChapter12State = { ...state };
  try {
    localStorage.setItem('brained_chapter12_state', JSON.stringify(state));
  } catch {}
}

export function resetChapter12SessionState(): void {
  sessionChapter12State = { ...DEFAULT_CHAPTER12_STATE };
  try {
    localStorage.removeItem('brained_chapter12_state');
  } catch {}
}

