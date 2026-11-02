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
    title: 'Measuring Impact',
    subtitle: 'Proving the Value',
    act: 'IV',
    actLabel: 'Act IV — Value',
    day: 'Day 17–18',
    duration: '~25 mins',
    difficulty: 'Hard',
    xpReward: 450,
    description:
      'Post-launch. Now you need to prove it worked. The CFO demands ROI evidence. Adoption rates are lower than projected. Construct your measurement framework and tell the data story.',
    objectives: [
      { label: 'Build transformation impact dashboard', type: 'analysis' },
      { label: 'Respond to CFO ROI challenge', type: 'decision' },
      { label: 'Identify adoption gap remediation plan', type: 'delivery' },
    ],
    primaryColor: '#0ea5e9',
    secondaryColor: '#10b981',
    accentColor: '#38bdf8',
    backgroundIcon: '📊',
    status: 'locked',
  },
  {
    id: 11,
    slug: 'chapter-11',
    title: 'The Final Presentation',
    subtitle: 'Board-Level Stakes',
    act: 'IV',
    actLabel: 'Act IV — Value',
    day: 'Day 19',
    duration: '~30 mins',
    difficulty: 'Expert',
    xpReward: 600,
    description:
      `You present to the Board of Directors. Every stakeholder you've managed, every decision you've made, every signal you've sent — it all comes to the surface here. Deliver the knockout.`,
    objectives: [
      { label: 'Deliver board-level executive presentation', type: 'stakeholder' },
      { label: 'Handle hostile board member challenge', type: 'decision' },
      { label: 'Secure mandate for Phase 2', type: 'stakeholder' },
    ],
    primaryColor: '#7c3aed',
    secondaryColor: '#ec4899',
    accentColor: '#c084fc',
    backgroundIcon: '👔',
    status: 'locked',
  },
  {
    id: 12,
    slug: 'chapter-12',
    title: 'The Reckoning',
    subtitle: 'Your Legacy Score',
    act: 'IV',
    actLabel: 'Act IV — Value',
    day: 'Day 20',
    duration: '~20 mins',
    difficulty: 'Expert',
    xpReward: 750,
    description:
      'The simulation ends. Every choice evaluated. Every signal scored. Your transformation legacy is calculated. Your certificate generated. How did you do?',
    objectives: [
      { label: 'Review your complete decision history', type: 'analysis' },
      { label: 'Receive your Transformation Score', type: 'analysis' },
      { label: 'Earn your Brained Certification', type: 'delivery' },
    ],
    primaryColor: '#f59e0b',
    secondaryColor: '#dc2626',
    accentColor: '#fcd34d',
    backgroundIcon: '🏆',
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
  } catch {}
}


