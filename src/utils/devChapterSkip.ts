/**
 * =========================================================================
 * TEMPORARY CHAPTER SKIP FEATURE - CAN BE REMOVED ON REQUEST
 * =========================================================================
 * 
 * Core logic & constants for skipping to any chapter.
 * =========================================================================
 */

import { updateChapterStatus, resetChapterSession } from '../data/chaptersData';

/** Global toggle flag for temporary chapter skipping */
export const TEMPORARY_CHAPTER_SKIP_ACTIVE = true;

export interface DevChapterOption {
  id: number;
  label: string;
  badge: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

export const DEV_CHAPTERS: DevChapterOption[] = [
  {
    id: 1,
    label: 'Chapter 01',
    badge: 'KICKOFF',
    title: 'The Briefing',
    subtitle: 'Project Kickoff Call & ReadMe AI MoM',
    icon: '🚀',
    color: '#3b82f6',
  },
  {
    id: 2,
    label: 'Chapter 02',
    badge: 'PREREQS',
    title: 'Environment Prerequisites',
    subtitle: 'Network Gates & UI/UX Signoff',
    icon: '🎯',
    color: '#f59e0b',
  },
  {
    id: 3,
    label: 'Chapter 03',
    badge: 'UAT COORDINATION',
    title: 'UAT Infrastructure Coordination',
    subtitle: 'Client Alignment & Environment Verification',
    icon: '🔌',
    color: '#6366f1',
  },
  {
    id: 4,
    label: 'Chapter 04',
    badge: 'ARCHITECTURE',
    title: 'Core Banking & Scope',
    subtitle: 'Ideate Studio & Scope Triage Matrix',
    icon: '📐',
    color: '#ec4899',
  },
  {
    id: 5,
    label: 'Chapter 05',
    badge: 'LAUNCH',
    title: 'The Launch Decision',
    subtitle: 'Controlled User Group (500) Rollout',
    icon: '🚢',
    color: '#10b981',
  },
  {
    id: 6,
    label: 'Chapter 06',
    badge: 'STRESS TEST',
    title: 'The 30,000-User Stress Test',
    subtitle: 'Performance Command Centre & Retest',
    icon: '⚡',
    color: '#06b6d4',
  },
  {
    id: 7,
    label: 'Chapter 07',
    badge: 'INCIDENT & RCA',
    title: 'Production Issues & Root Cause Analysis',
    subtitle: 'Incident Response & RCA Studio',
    icon: '🚨',
    color: '#ef4444',
  },
  {
    id: 8,
    label: 'Chapter 08',
    badge: 'SECURITY & POLICIES',
    title: 'Security Attacks, Policies & Compliance Acts',
    subtitle: 'Security Response Console · CISO SOC Liaison',
    icon: '🛡️',
    color: '#059669',
  },
  {
    id: 9,
    label: 'Chapter 09',
    badge: 'ROI VALIDATION',
    title: 'ROI Validation & Business Value',
    subtitle: 'Executive Boardroom Presentation Suite · Financial & Operational Impact',
    icon: '📈',
    color: '#10b981',
  },
  {
    id: 10,
    label: 'Chapter 10',
    badge: 'VERSIONING & DOCS',
    title: 'Engineering Release & Documentation',
    subtitle: 'Release Portal · Repo Audit · Technical Knowledge Base',
    icon: '📦',
    color: '#8b5cf6',
  },
  {
    id: 11,
    label: 'Chapter 11',
    badge: 'OPERATIONAL HANDOVER',
    title: 'Operational Handover',
    subtitle: 'Operations Transition Console · 14-Day Hypercare · Knowledge Transfer',
    icon: '🤝',
    color: '#f97316',
  },
];

/** Resets target chapter state and initiates transition */
export function executeChapterJump(
  targetChapterId: number,
  onStartChapter: (id: number) => void
) {
  // Ensure target chapter is registered as unlocked in memory
  try {
    updateChapterStatus(targetChapterId, 'unlocked');
  } catch {}

  // Cleanly reset the session state of the target chapter for a fresh test
  try {
    resetChapterSession(targetChapterId);
  } catch {}

  onStartChapter(targetChapterId);
}
