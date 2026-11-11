/**
 * chaptersData.ts
 * Master data for all 12 chapters of Brained: The Transformation Room
 */
import { resetChapter2SessionState } from './chapter2Data';
import { resetChapter3SessionState } from './chapter3Data';
import { resetChapter4SessionState } from './chapter4Data';
import { resetChapter5SessionState } from './chapter5Data';
import { resetChapter6SessionState } from './chapter6Data';
import { resetChapter7SessionState } from './chapter7Data';
import { resetChapter8SessionState } from './chapter8Data';
import { resetChapter9SessionState } from './chapter9Data';
import { resetChapter10SessionState } from './chapter10Data';
import { resetChapter11SessionState } from './chapter11Data';
import { resetChapter12SessionState } from './chapter12Data';

export type ChapterStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';

export interface ChapterObjective {
  label: string;
  type: 'decision' | 'analysis' | 'stakeholder' | 'delivery' | 'communication';
}

export interface Chapter {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  act: 'I' | 'II' | 'III' | 'IV';
  actLabel: string;
  day: string; // e.g. "Day 1", "Day 3–5"
  duration: string; // e.g. "~25 mins"
  difficulty: 'Starter' | 'Moderate' | 'Hard' | 'Expert';
  xpReward: number;
  description: string;
  objectives: ChapterObjective[];
  primaryColor: string; // gradient from
  secondaryColor: string; // gradient to
  accentColor: string; // text/border accent
  backgroundIcon: string; // emoji icon
  status: ChapterStatus;
}

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    slug: 'chapter-1',
    title: 'The Briefing',
    subtitle: 'Project Titan Kickoff',
    act: 'I',
    actLabel: 'Act I — Foundation',
    day: 'Day 1',
    duration: '~20 mins',
    difficulty: 'Starter',
    xpReward: 250,
    description:
      `You've just joined Titan Manufacturing as a Digital Transformation Consultant. The executive kickoff call is in 10 minutes. Orient yourself, meet the stakeholders, make your first critical impression.`,
    objectives: [
      { label: 'Attend the Project Titan Kickoff Call', type: 'decision' },
      { label: 'Identify key stakeholders and power dynamics', type: 'stakeholder' },
      { label: 'Make your first strategic decision under pressure', type: 'decision' },
      { label: 'Document decisions in your ReadMe AI MoM', type: 'communication' },
    ],
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#60a5fa',
    backgroundIcon: '🚀',
    status: 'unlocked',
  },
  {
    id: 2,
    slug: 'chapter-2',
    title: 'Environment Prerequisites, Network Gates & UI/UX Signoff',
    subtitle: 'Act I — Sprint 1 Readiness',
    act: 'I',
    actLabel: 'Act I — Foundation',
    day: 'Day 2–3',
    duration: '~2 mins',
    difficulty: 'Moderate',
    xpReward: 300,
    description:
      'The engineering team is blocked on the staging environment. Establish a secure path forward, configure stakeholder communication channels, and secure formal written UI/UX signoff for Sprint 1.',
    objectives: [
      { label: 'Resolve staging environment blockers & security boundaries', type: 'decision' },
      { label: 'Configure dual-track stakeholder communication channels', type: 'communication' },
      { label: 'Secure written UI/UX prototype baseline signoff', type: 'decision' },
      { label: 'Verify prerequisite gates and issue development greenlight', type: 'delivery' },
    ],
    primaryColor: '#f59e0b',
    secondaryColor: '#ef4444',
    accentColor: '#fbbf24',
    backgroundIcon: '🎯',
    status: 'locked',
  },
  {
    id: 3,
    slug: 'chapter-3',
    title: 'UAT Infrastructure & Environment Coordination',
    subtitle: 'Client Coordination, Technical Prerequisites & Network Gate Verification',
    act: 'I',
    actLabel: 'Act I — Foundation',
    day: 'Day 3–4',
    duration: '~2 mins',
    difficulty: 'Moderate',
    xpReward: 350,
    description:
      'Coordinate with the client to secure UAT environment prerequisites for Project Amigo. Identify incomplete configuration items, confirm network access requirements, and ensure the engineering team has verified prerequisites before configuring integrations.',
    objectives: [
      { label: 'Audit client UAT deliverables against developer prerequisites', type: 'analysis' },
      { label: 'Coordinate stakeholder communication & identify network access gaps', type: 'communication' },
      { label: 'Ensure verified environment handoff & technical readiness', type: 'delivery' },
    ],
    primaryColor: '#0284c7',
    secondaryColor: '#4f46e5',
    accentColor: '#38bdf8',
    backgroundIcon: '🌐',
    status: 'locked',
  },
  {
    id: 4,
    slug: 'chapter-4',
    title: 'Change Request & Impact Analysis',
    subtitle: 'Scope Gating, Release Planning & Technical Impact Assessment',
    act: 'II',
    actLabel: 'Act II — Design',
    day: 'Day 6–7',
    duration: '~25 mins',
    difficulty: 'Moderate',
    xpReward: 400,
    description:
      'Sophia requests CR-017 (Dynamic Bonus Calculator) for Phase 1. Evaluate business value, dependencies, security, and release feasibility against the 90-day deadline.',
    objectives: [
      { label: 'Evaluate Change Request CR-017 and isolate technical risks', type: 'analysis' },
      { label: 'Organize release phases without compromising baseline commitments', type: 'delivery' },
      { label: 'Defend release recommendation with governance and access controls', type: 'decision' },
    ],
    primaryColor: '#8b5cf6',
    secondaryColor: '#6366f1',
    accentColor: '#a78bfa',
    backgroundIcon: '⚖️',
    status: 'locked',
  },
  {
    id: 5,
    slug: 'chapter-5',
    title: 'The Launch Decision',
    subtitle: 'Controlled User Group Rollout · Production Readiness & Pilot Assessment',
    act: 'II',
    actLabel: 'Act II — Design',
    day: 'Day 10–14',
    duration: '~2–3 mins',
    difficulty: 'Hard',
    xpReward: 450,
    description:
      'The Phase 1 build has passed functional tests in staging. Evaluate production readiness evidence across 80,000 bank employees, isolate critical launch blockers, configure a 500-user 48-hour pilot, and establish evidence-based expansion gates.',
    objectives: [
      { label: 'Review Phase 1 readiness evidence across functional, security, and load domains', type: 'analysis' },
      { label: 'Identify non-negotiable launch blockers and establish recovery acceptance criteria', type: 'decision' },
      { label: 'Build a controlled 500-user pilot rollout plan with monitoring and rollback gates', type: 'delivery' },
    ],
    primaryColor: '#10b981',
    secondaryColor: '#0d9488',
    accentColor: '#34d399',
    backgroundIcon: '🚀',
    status: 'locked',
  },
  {
    id: 6,
    slug: 'chapter-6',
    title: 'The 30,000-User Stress Test',
    subtitle: 'Production Readiness · Performance Command Centre',
    act: 'II',
    actLabel: 'Act II — Design',
    day: 'Day 11',
    duration: '~1 min 45 sec',
    difficulty: 'Hard',
    xpReward: 450,
    description:
      'A successful functional test does not mean a system is ready for production. Under a 30,000-user stress test, appraisal latency spikes to 4.2 seconds and the DB connection pool saturates. Diagnose the root cause, sequence technical remediation, verify the retest, and secure dual engineering approvals.',
    objectives: [
      { label: 'Diagnose database connection pool saturation and cache miss root causes', type: 'analysis' },
      { label: 'Sequence technical remediation across caching, pooling, and retest execution', type: 'decision' },
      { label: 'Verify retest telemetry and secure dual engineering approvals before release', type: 'delivery' },
    ],
    primaryColor: '#06b6d4',
    secondaryColor: '#2563eb',
    accentColor: '#22d3ee',
    backgroundIcon: '⚡',
    status: 'locked',
  },
  {
    id: 7,
    slug: 'chapter-7',
    title: 'Production Issues & Root Cause Analysis',
    subtitle: 'Incident Response & Root Cause Analysis (RCA) Studio',
    act: 'III',
    actLabel: 'Act III — Delivery',
    day: 'Day 12–13',
    duration: '~2 mins',
    difficulty: 'Hard',
    xpReward: 500,
    description:
      'A production issue occurs in the Attendance Sync microservice. Twelve branch officers experience intermittent 504 Gateway Timeouts. Restore the service, verify affected branch officers, document the Root Cause Analysis (RCA), and prioritise preventive controls.',
    objectives: [
      { label: 'Arrange immediate service restoration sequence & verify branch officers', type: 'decision' },
      { label: 'Build formal 4-part Root Cause Analysis connecting failure to root cause', type: 'analysis' },
      { label: 'Select and prioritise preventive measures to eliminate recurrence', type: 'delivery' },
    ],
    primaryColor: '#ef4444',
    secondaryColor: '#f97316',
    accentColor: '#f87171',
    backgroundIcon: '🚨',
    status: 'locked',
  },
  {
    id: 8,
    slug: 'chapter-8',
    title: 'Security Attacks, Policies & Compliance Acts',
    subtitle: 'PM Leadership Lens — Surya & Senior PM Perspective',
    act: 'III',
    actLabel: 'Act III — Delivery',
    day: 'Day 14',
    duration: '~20 mins',
    difficulty: 'Expert',
    xpReward: 500,
    description:
      'Respond to an active credential-stuffing attack on the employee login gateway. Implement mandatory WAF bot mitigation and strict MFA rate-limiting under institutional cybersecurity policies and IT acts.',
    objectives: [
      { label: 'Investigate anomalous bot traffic and classify the credential-stuffing threat', type: 'analysis' },
      { label: 'Implement mandatory WAF bot mitigation and strict MFA rate-limiting', type: 'decision' },
      { label: 'Validate security readiness and document compliance for the CISO', type: 'delivery' },
    ],
    primaryColor: '#059669',
    secondaryColor: '#0284c7',
    accentColor: '#10b981',
    backgroundIcon: '🛡️',
    status: 'locked',
  },
  {
    id: 9,
    slug: 'chapter-9',
    title: 'ROI Validation',
    subtitle: 'Executive Leadership Phase',
    act: 'III',
    actLabel: 'Act III — Delivery',
    day: 'Day 15–16 (23:00–25:00)',
    duration: '~20 mins',
    difficulty: 'Expert',
    xpReward: 600,
    description:
      'The system is live in production across 80,000 employees. Martha presents telemetry showing a 42% appraisal cycle drop and 15,000 man-hours saved. Translate operational telemetry into monetary ROI, audit regional anomalies, and defend Phase 2 investment before CFO Vikram Malhotra and CTO Marcus Reed.',
    objectives: [
      { label: 'Analyze telemetry: 42% cycle reduction and 15,000 man-hours saved', type: 'analysis' },
      { label: 'Model financial ROI converting capacity into ₹97.5 Lakhs savings', type: 'analysis' },
      { label: 'Deliver detailed executive presentation to secure Phase 2 investment', type: 'decision' },
    ],
    primaryColor: '#10b981',
    secondaryColor: '#0d9488',
    accentColor: '#34d399',
    backgroundIcon: '📈',
    status: 'locked',
  },
  {
    id: 10,
    slug: 'chapter-10',
    title: 'Versioning & Technical Documentation',
    subtitle: 'Post-Launch Stabilization',
    act: 'IV',
    actLabel: 'Act IV — Value & Sustainability',
    day: 'Day 19–20',
    duration: '25:00–27:00 (~20 mins)',
    difficulty: 'Hard',
    xpReward: 500,
    description:
      'The product is live and business ROI is proven, but can engineering maintain and upgrade the system without depending on original developers? Audit the messy repository, enforce Semantic Versioning (v1.0.0), publish enterprise developer portal specs, and lock down release governance.',
    objectives: [
      { label: 'Audit repository and eliminate duplicate/unverified technical assets', type: 'analysis' },
      { label: 'Tag official release using Semantic Versioning principles (v1.0.0)', type: 'decision' },
      { label: 'Publish 6-domain architecture catalog to enterprise developer portal', type: 'delivery' },
      { label: 'Enforce release governance gate against short-term shortcut pressures', type: 'decision' },
    ],
    primaryColor: '#6366f1',
    secondaryColor: '#3b82f6',
    accentColor: '#818cf8',
    backgroundIcon: '📦',
    status: 'locked',
  },
  {
    id: 11,
    slug: 'chapter-11',
    title: 'Operational Handover',
    subtitle: 'From Project Delivery to Operational Ownership',
    act: 'IV',
    actLabel: 'Act IV — Value & Sustainability',
    day: 'Day 21',
    duration: '27:00–29:00 (~20 mins)',
    difficulty: 'Expert',
    xpReward: 650,
    description:
      'Deploying a product is not the same as transferring operational ownership. Marcus and IT Operations refuse to accept ownership without verified administrator runbooks, incident response validation, and a mandatory 14-day hypercare window.',
    objectives: [
      { label: 'Build verified operational handover package matching 6 runbooks to requirements', type: 'analysis' },
      { label: 'Validate incident response sequence for INC-0318 employee login triage', type: 'delivery' },
      { label: 'Design 14-day progressive hypercare timeline across 3 operational phases', type: 'decision' },
      { label: 'Authorize formal operational handover protocol with IT Operations sign-off', type: 'decision' },
    ],
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    accentColor: '#a855f7',
    backgroundIcon: '🔄',
    status: 'locked',
  },
  {
    id: 12,
    slug: 'chapter-12',
    title: 'The Next Evolution',
    subtitle: 'CR Upgrade & Phase 2 Evolution',
    act: 'IV',
    actLabel: 'Act IV — Value',
    day: 'Day 20',
    duration: '~2 mins',
    difficulty: 'Expert',
    xpReward: 800,
    description:
      'Phase 1 is running smoothly in production. The Steering Committee requests the reactivation of deferred Phase 2 modules along with a core framework security upgrade. Architect the release strategy with feature flags and blue-green staging to earn your ultimate transformation legacy.',
    objectives: [
      { label: 'Categorize Phase 2 modules and isolate platform upgrade', type: 'analysis' },
      { label: 'Configure progressive feature-flag rollout strategy', type: 'delivery' },
      { label: 'Execute blue-green zero-downtime deployment sequence', type: 'delivery' },
      { label: 'Authorize formal CR-Upgrade pipeline with Steering Committee', type: 'decision' },
    ],
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    accentColor: '#38bdf8',
    backgroundIcon: '⚡',
    status: 'locked',
  },
];

export const ACTS = [
  { id: 'I', label: 'Act I', subtitle: 'Foundation', chapters: [1, 2, 3], color: '#3b82f6' },
  { id: 'II', label: 'Act II', subtitle: 'Design', chapters: [4, 5, 6], color: '#8b5cf6' },
  { id: 'III', label: 'Act III', subtitle: 'Delivery', chapters: [7, 8, 9], color: '#ef4444' },
  { id: 'IV', label: 'Act IV', subtitle: 'Value', chapters: [10, 11, 12], color: '#f59e0b' },
];

// Session-only chapter progression & assignment state (in-memory)
// Persistent database storage will be connected when authentication & user database are introduced.
let sessionChapterStatuses: Record<number, ChapterStatus> = { 1: 'unlocked' };
let sessionChapter1Assignment: any = null;

// Wipe any legacy localStorage data on initial load
try {
  localStorage.removeItem('brained_chapter_statuses');
  localStorage.removeItem('brained_just_unlocked_chapter');
  localStorage.removeItem('brained_chapter1_assignment');
} catch {}

export function getStoredChapterStatuses(): Record<number, ChapterStatus> {
  return { ...sessionChapterStatuses };
}

export function updateChapterStatus(chapterId: number, status: ChapterStatus) {
  sessionChapterStatuses[chapterId] = status;
}

export function getSessionAssignmentResult(): any {
  return sessionChapter1Assignment;
}

export function setSessionAssignmentResult(result: any) {
  sessionChapter1Assignment = result;
}

export function resetChapterSession(chapterId: number) {
  if (chapterId === 1) {
    sessionChapter1Assignment = null;
    try {
      localStorage.removeItem('brained_chapter1_assignment');
      localStorage.removeItem('brained_session_assignment');
    } catch {}
  } else if (chapterId === 2) {
    resetChapter2SessionState();
  } else if (chapterId === 3) {
    resetChapter3SessionState();
  } else if (chapterId === 4) {
    resetChapter4SessionState();
  } else if (chapterId === 5) {
    resetChapter5SessionState();
  } else if (chapterId === 6) {
    resetChapter6SessionState();
  } else if (chapterId === 7) {
    resetChapter7SessionState();
  } else if (chapterId === 8) {
    resetChapter8SessionState();
  } else if (chapterId === 9) {
    resetChapter9SessionState();
  } else if (chapterId === 10) {
    resetChapter10SessionState();
  } else if (chapterId === 11) {
    resetChapter11SessionState();
  } else if (chapterId === 12) {
    resetChapter12SessionState();
  }
}

export function resetChapterStatuses() {
  sessionChapterStatuses = { 1: 'unlocked' };
  sessionChapter1Assignment = null;
  resetChapter2SessionState();
  resetChapter3SessionState();
  resetChapter4SessionState();
  resetChapter5SessionState();
  resetChapter6SessionState();
  resetChapter7SessionState();
  resetChapter8SessionState();
  resetChapter9SessionState();
  resetChapter10SessionState();
  resetChapter11SessionState();
  resetChapter12SessionState();
  try {
    localStorage.removeItem('brained_chapter_statuses');
    localStorage.removeItem('brained_just_unlocked_chapter');
    localStorage.removeItem('brained_chapter1_assignment');
    localStorage.removeItem('brained_chapter2_state');
    localStorage.removeItem('brained_chapter3_state');
    localStorage.removeItem('brained_chapter4_state');
    localStorage.removeItem('brained_chapter5_state');
    localStorage.removeItem('brained_chapter6_state');
    localStorage.removeItem('brained_chapter7_state');
    localStorage.removeItem('brained_chapter8_state');
    localStorage.removeItem('brained_chapter9_state');
    localStorage.removeItem('brained_chapter10_state');
    localStorage.removeItem('brained_chapter11_state');
    localStorage.removeItem('brained_chapter12_state');
  } catch {}
}


