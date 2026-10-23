/**
 * =========================================================================
 * TEMPORARY CHAPTER SKIP FEATURE - CAN BE REMOVED ON REQUEST
 * =========================================================================
 * 
 * Core logic & constants for skipping to any chapter.
 * =========================================================================
 */

import { resetChapter2SessionState } from '../data/chapter2Data';
import { resetChapter3SessionState } from '../data/chapter3Data';
import { resetChapter4SessionState } from '../data/chapter4Data';
import { resetChapter5SessionState } from '../data/chapter5Data';
import { updateChapterStatus } from '../data/chaptersData';

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
    badge: 'INTEGRATION',
    title: 'The Integration Trap',
    subtitle: 'Core Banking APIs (SOAP/REST Gateway)',
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
    if (targetChapterId === 2) resetChapter2SessionState();
    else if (targetChapterId === 3) resetChapter3SessionState();
    else if (targetChapterId === 4) resetChapter4SessionState();
    else if (targetChapterId === 5) resetChapter5SessionState();
  } catch {}

  onStartChapter(targetChapterId);
}
