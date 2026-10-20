/**
 * Master Chapter Directory Index
 * Exports data, metadata, and helper functions for Chapters 1 through 12
 */

import ch1 from './chapter-1/chapter.json';
import ch2 from './chapter-2/chapter.json';
import ch3 from './chapter-3/chapter.json';
import ch4 from './chapter-4/chapter.json';
import ch5 from './chapter-5/chapter.json';
import ch6 from './chapter-6/chapter.json';
import ch7 from './chapter-7/chapter.json';
import ch8 from './chapter-8/chapter.json';
import ch9 from './chapter-9/chapter.json';
import ch10 from './chapter-10/chapter.json';
import ch11 from './chapter-11/chapter.json';
import ch12 from './chapter-12/chapter.json';

import ch1Dialogues from './chapter-1/meeting_dialogues.json';
import ch1Assignment from './chapter-1/assignment_spec.json';

export interface ChapterDossier {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  act: string;
  actLabel: string;
  day: string;
  duration: string;
  difficulty: string;
  xpReward: number;
  description: string;
  stakeholders?: { name: string; role: string; agenda: string; avatar?: string }[];
  objectives: { label: string; type: string }[];
  deliverables?: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundIcon: string;
}

export const ALL_CHAPTER_DOSSIERS: Record<number, ChapterDossier> = {
  1: ch1 as unknown as ChapterDossier,
  2: ch2 as unknown as ChapterDossier,
  3: ch3 as unknown as ChapterDossier,
  4: ch4 as unknown as ChapterDossier,
  5: ch5 as unknown as ChapterDossier,
  6: ch6 as unknown as ChapterDossier,
  7: ch7 as unknown as ChapterDossier,
  8: ch8 as unknown as ChapterDossier,
  9: ch9 as unknown as ChapterDossier,
  10: ch10 as unknown as ChapterDossier,
  11: ch11 as unknown as ChapterDossier,
  12: ch12 as unknown as ChapterDossier,
};

export const CHAPTER_1_SPECS = {
  dialogues: ch1Dialogues,
  assignment: ch1Assignment,
};

export function getChapterDossier(chapterId: number): ChapterDossier | undefined {
  return ALL_CHAPTER_DOSSIERS[chapterId];
}

export function getAllChapterDossiers(): ChapterDossier[] {
  return Object.values(ALL_CHAPTER_DOSSIERS);
}
