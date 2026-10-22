/**
 * chaptersData.ts
 * Master data for all 12 chapters of Brained: The Transformation Room
 */

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
    title: 'The Data Integrity Crisis',
    subtitle: 'The prototype works. But can the team trust its data?',
    act: 'I',
    actLabel: 'Act I — Foundation',
    day: 'Day 3–4',
    duration: '~1m 45s',
    difficulty: 'Moderate',
    xpReward: 350,
    description:
      'During early validation of the Project Amigo prototype, inconsistencies appear in employee appraisal records and leave balances. Make a practical delivery decision: contain the defect, validate the mappings, and protect unaffected velocity.',
    objectives: [
      { label: 'Triage reported data inconsistencies in prototype test records', type: 'analysis' },
      { label: 'Decide containment approach without halting safe development', type: 'decision' },
      { label: 'Create and confirm the structured Data Validation Plan', type: 'delivery' },
    ],
    primaryColor: '#0284c7',
    secondaryColor: '#4f46e5',
    accentColor: '#38bdf8',
    backgroundIcon: '🛡️',
    status: 'locked',
  },
  {
    id: 4,
    slug: 'chapter-4',
    title: 'The Architecture',
    subtitle: 'Designing the Future State',
    act: 'II',
    actLabel: 'Act II — Design',
    day: 'Day 6–7',
    duration: '~30 mins',
    difficulty: 'Hard',
    xpReward: 400,
    description:
      'Blueprint the solution. Prioritize use cases. Define the technology stack. Every choice has trade-offs. The board meets in 7 days. Your architecture needs to hold.',
    objectives: [
      { label: 'Define To-Be solution architecture', type: 'delivery' },
      { label: 'Select and defend your tech choices', type: 'decision' },
      { label: 'Align architecture with business constraints', type: 'analysis' },
    ],
    primaryColor: '#8b5cf6',
    secondaryColor: '#ec4899',
    accentColor: '#a78bfa',
    backgroundIcon: '🏗️',
    status: 'locked',
  },
  {
    id: 5,
    slug: 'chapter-5',
    title: 'Build Sprint',
    subtitle: 'Prototype Under Fire',
    act: 'II',
    actLabel: 'Act II — Design',
    day: 'Day 8–10',
    duration: '~35 mins',
    difficulty: 'Hard',
    xpReward: 450,
    description:
      `Cera AI begins building. You manage scope, quality, and speed. A critical bug surfaces. A stakeholder demands a feature that wasn't scoped. Ship or slip?`,
    objectives: [
      { label: 'Direct Cera through sprint execution', type: 'delivery' },
      { label: 'Handle scope creep under deadline pressure', type: 'decision' },
      { label: 'Ensure prototype quality gates', type: 'delivery' },
    ],
    primaryColor: '#f97316',
    secondaryColor: '#eab308',
    accentColor: '#fb923c',
    backgroundIcon: '⚡',
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

import { resetChapter3SessionState } from './chapter3Data';

export function resetChapterStatuses() {
  sessionChapterStatuses = { 1: 'unlocked' };
  sessionChapter1Assignment = null;
  resetChapter3SessionState();
  try {
    localStorage.removeItem('brained_chapter_statuses');
    localStorage.removeItem('brained_just_unlocked_chapter');
    localStorage.removeItem('brained_chapter1_assignment');
    localStorage.removeItem('brained_chapter3_state');
  } catch {}
}


