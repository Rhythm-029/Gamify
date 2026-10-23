/**
 * chaptersData.ts
 * Master data for all 12 chapters of Brained: The Transformation Room
 */
import { resetChapter3SessionState } from './chapter3Data';
import { resetChapter4SessionState } from './chapter4Data';
import { resetChapter5SessionState } from './chapter5Data';

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
    title: 'The Integration Trap',
    subtitle: 'Core Banking APIs, SOAP/REST Integration & LDAP/SSO Dependencies',
    act: 'I',
    actLabel: 'Act I — Foundation',
    day: 'Day 3–4',
    duration: '~1m 45s',
    difficulty: 'Moderate',
    xpReward: 350,
    description:
      'The player is managing Project Amigo, an HRMS implementation for ICICI Bank involving 80,000 employees and a 90-day deadline. The team is now attempting to integrate the HRMS with the bank\'s existing systems. Services expect JSON over REST, while the legacy ESB uses SOAP/XML. Triage the blocker, choose the safe integration gateway, and sequence dependencies.',
    objectives: [
      { label: 'Triage protocol mismatch & analyze engineering logs', type: 'analysis' },
      { label: 'Decide integration architecture without bypassing bank controls', type: 'decision' },
      { label: 'Prioritize & sequence dependency resolution and safe parallel testing', type: 'delivery' },
    ],
    primaryColor: '#0284c7',
    secondaryColor: '#4f46e5',
    accentColor: '#38bdf8',
    backgroundIcon: '🔌',
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
    title: 'The Prototype Review',
    subtitle: 'Defending Your Build',
    act: 'II',
    actLabel: 'Act II — Design',
    day: 'Day 11',
    duration: '~25 mins',
    difficulty: 'Hard',
    xpReward: 400,
    description:
      'Your prototype goes live with the review committee. The CTO finds a gap. The CHRO says adoption will fail. The business sponsor loves it. Defend, adapt, persuade.',
    objectives: [
      { label: 'Present prototype to review committee', type: 'stakeholder' },
      { label: 'Handle critical technical challenge', type: 'decision' },
      { label: 'Document revised scope in MoM', type: 'communication' },
    ],
    primaryColor: '#06b6d4',
    secondaryColor: '#3b82f6',
    accentColor: '#22d3ee',
    backgroundIcon: '🎬',
    status: 'locked',
  },
  {
    id: 7,
    slug: 'chapter-7',
    title: 'The Resistance',
    subtitle: 'Change Management Crisis',
    act: 'III',
    actLabel: 'Act III — Delivery',
    day: 'Day 12–13',
    duration: '~30 mins',
    difficulty: 'Expert',
    xpReward: 500,
    description:
      'The workforce is pushing back. A union rep files a concern. Middle management sabotages the training sessions. This is where most transformations die. How do you lead through resistance?',
    objectives: [
      { label: 'De-escalate the union concern', type: 'stakeholder' },
      { label: 'Design a targeted change program', type: 'delivery' },
      { label: 'Turn a resistant manager into an advocate', type: 'stakeholder' },
    ],
    primaryColor: '#ef4444',
    secondaryColor: '#f97316',
    accentColor: '#f87171',
    backgroundIcon: '🔥',
    status: 'locked',
  },
  {
    id: 8,
    slug: 'chapter-8',
    title: 'The Pivot',
    subtitle: 'When the Plan Breaks',
    act: 'III',
    actLabel: 'Act III — Delivery',
    day: 'Day 14',
    duration: '~25 mins',
    difficulty: 'Expert',
    xpReward: 500,
    description:
      'Midway through rollout, a regulatory compliance issue surfaces. The entire deployment plan must be re-evaluated in 48 hours. Your credibility is on the line.',
    objectives: [
      { label: 'Assess compliance risk impact', type: 'analysis' },
      { label: 'Propose and defend the pivot strategy', type: 'decision' },
      { label: 'Maintain stakeholder confidence', type: 'stakeholder' },
    ],
    primaryColor: '#dc2626',
    secondaryColor: '#7c3aed',
    accentColor: '#f43f5e',
    backgroundIcon: '⚠️',
    status: 'locked',
  },
  {
    id: 9,
    slug: 'chapter-9',
    title: 'The Launch',
    subtitle: 'Go-Live Day',
    act: 'III',
    actLabel: 'Act III — Delivery',
    day: 'Day 15–16',
    duration: '~30 mins',
    difficulty: 'Expert',
    xpReward: 550,
    description:
      'Go-live. Systems are live. Users are logging in. Something breaks in production. The executive team is watching. Support queues are flooding. Lead the war room.',
    objectives: [
      { label: 'Manage live production incident', type: 'delivery' },
      { label: 'Coordinate cross-functional war room', type: 'stakeholder' },
      { label: 'Communicate status to executive team', type: 'communication' },
    ],
    primaryColor: '#16a34a',
    secondaryColor: '#0891b2',
    accentColor: '#4ade80',
    backgroundIcon: '🌐',
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

export function resetChapterStatuses() {
  sessionChapterStatuses = { 1: 'unlocked' };
  sessionChapter1Assignment = null;
  resetChapter3SessionState();
  resetChapter4SessionState();
  resetChapter5SessionState();
  try {
    localStorage.removeItem('brained_chapter_statuses');
    localStorage.removeItem('brained_just_unlocked_chapter');
    localStorage.removeItem('brained_chapter1_assignment');
    localStorage.removeItem('brained_chapter3_state');
    localStorage.removeItem('brained_chapter4_state');
    localStorage.removeItem('brained_chapter5_state');
  } catch {}
}


