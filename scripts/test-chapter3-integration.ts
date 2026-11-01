import process from 'node:process';
import {
  CHAPTERS,
  getStoredChapterStatuses,
  updateChapterStatus,
  resetChapterStatuses,
} from '../src/data/chaptersData.ts';
import {
  INITIAL_CHAPTER3_STATE,
  UAT_DETAILS_V1_DOC,
  UAT_DETAILS_V2_DOC,
  DANIEL_UAT_REQUEST_MESSAGE,
  PREPOPULATED_EMAIL_TO_SOPHIA,
  getChapter3SessionState,
  setChapter3SessionState,
  resetChapter3SessionState,
} from '../src/data/chapter3Data.ts';
import {
  computeChapter2Score,
  INITIAL_CHAPTER2_STATE,
} from '../src/data/chapter2Data.ts';
import { ALL_CHAPTER_DOSSIERS } from '../src/data/chapters/index.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('\n=== RUNNING CHAPTER 3: UAT INFRASTRUCTURE COORDINATION INTEGRATION SUITE ===\n');

// ── TEST GROUP 1: CHAPTER REGISTRATION & PROGRESSION ──
console.log('--- Test Group 1: Chapter Registration & Progression ---');

resetChapterStatuses();
let statuses = getStoredChapterStatuses();
assert(statuses[1] === 'unlocked', 'Initial state: Chapter 1 is unlocked');
assert(statuses[2] === undefined || statuses[2] === 'locked', 'Initial state: Chapter 2 is locked');
assert(statuses[3] === undefined || statuses[3] === 'locked', 'Initial state: Chapter 3 is locked');

// Complete Chapter 1 -> Unlock Chapter 2
updateChapterStatus(1, 'completed');
updateChapterStatus(2, 'unlocked');
statuses = getStoredChapterStatuses();
assert(statuses[1] === 'completed', 'Chapter 1 completed');
assert(statuses[2] === 'unlocked', 'Chapter 2 unlocked');
assert(statuses[3] === undefined || statuses[3] === 'locked', 'Chapter 3 still locked');

// Complete Chapter 2 -> Unlock Chapter 3
updateChapterStatus(2, 'completed');
updateChapterStatus(3, 'unlocked');
statuses = getStoredChapterStatuses();
assert(statuses[2] === 'completed', 'Chapter 2 completed');
assert(statuses[3] === 'unlocked', 'Chapter 3 unlocked');
assert(statuses[4] === undefined || statuses[4] === 'locked', 'Chapter 4 still locked');

// Complete Chapter 3 -> Unlock Chapter 4
updateChapterStatus(3, 'completed');
updateChapterStatus(4, 'unlocked');
statuses = getStoredChapterStatuses();
assert(statuses[3] === 'completed', 'Chapter 3 completed');
assert(statuses[4] === 'unlocked', 'Chapter 4 unlocked');
assert(statuses[5] === undefined || statuses[5] === 'locked', 'Chapter 5 still locked');

// Verify Chapter 3 in Master CHAPTERS registry
const ch3Meta = CHAPTERS.find((c) => c.id === 3);
assert(Boolean(ch3Meta), 'Chapter 3 exists in CHAPTERS array');
assert(Boolean(ch3Meta?.title.includes('UAT Infrastructure')), 'Chapter 3 title includes UAT Infrastructure');
assert(ch3Meta?.objectives.length === 3, 'Chapter 3 has 3 explicit objectives');

// ── TEST GROUP 2: CHAPTER 3 DOSSIER & STAKEHOLDERS ──
console.log('\n--- Test Group 2: Chapter 3 Dossier & Stakeholders ---');

const ch3Dossier = ALL_CHAPTER_DOSSIERS[3];
assert(Boolean(ch3Dossier), 'Dossier exists for Chapter 3');
assert(ch3Dossier.stakeholders !== undefined && ch3Dossier.stakeholders.length >= 3, 'Dossier contains Daniel, Sophia, Aarav');
assert(Boolean(ch3Dossier.stakeholders?.some((s) => s.name.includes('Daniel'))), 'Daniel is stakeholder');
assert(Boolean(ch3Dossier.stakeholders?.some((s) => s.name.includes('Sophia'))), 'Sophia is stakeholder');
assert(Boolean(ch3Dossier.stakeholders?.some((s) => s.name.includes('Aarav'))), 'Aarav is stakeholder');

// ── TEST GROUP 3: UAT DOCUMENTS INTEGRITY (V1 vs V2) ──
console.log('\n--- Test Group 3: Document V1 vs V2 Integrity ---');

assert(UAT_DETAILS_V1_DOC.items.length === 4, 'Document v1 contains exactly 4 confirmed items');
assert(!UAT_DETAILS_V1_DOC.items.some((i) => i.item.toLowerCase().includes('network')), 'Document v1 does NOT contain network access requirement');

assert(UAT_DETAILS_V2_DOC.items.length === 5, 'Document v2 contains all 5 items');
assert(UAT_DETAILS_V2_DOC.items.some((i) => i.item.toLowerCase().includes('network')), 'Document v2 contains network access requirement');
assert(UAT_DETAILS_V2_DOC.items[4].confirmedDetails.includes('Bank IT must confirm'), 'Document v2 states Bank IT must confirm rather than falsely claiming access granted');

assert(DANIEL_UAT_REQUEST_MESSAGE.includes('1. UAT server'), 'Daniel message contains item 1');
assert(DANIEL_UAT_REQUEST_MESSAGE.includes('5. Network access requirements'), 'Daniel message contains item 5');
assert(PREPOPULATED_EMAIL_TO_SOPHIA.subject.includes('UAT Setup Details'), 'Prepopulated email subject matches prompt');

// ── TEST GROUP 4: SESSION STATE PERSISTENCE ──
console.log('\n--- Test Group 4: Session State Persistence ---');

resetChapter3SessionState();
let s = getChapter3SessionState();
assert(s.step === 'daniel_initial_request', 'Initial step is daniel_initial_request');
assert(!s.v1Delivered, 'Initial v1Delivered is false');
assert(!s.v2SentToDaniel, 'Initial v2SentToDaniel is false');

// Mutate state
setChapter3SessionState({
  step: 'sophia_v1_delivered',
  v1Delivered: true,
  pathTaken: 'full_credit',
});
s = getChapter3SessionState();
assert(s.step === 'sophia_v1_delivered', 'Step persisted');
assert(s.v1Delivered === true, 'v1Delivered persisted');
assert(s.pathTaken === 'full_credit', 'pathTaken persisted');

resetChapter3SessionState();
s = getChapter3SessionState();
assert(s.step === 'daniel_initial_request', 'Reset cleared state');
assert(!s.v1Delivered, 'Reset cleared v1Delivered');

// ── TEST GROUP 5: REGRESSION OF CHAPTERS 1 AND 2 ──
console.log('\n--- Test Group 5: Chapters 1 & 2 Regression Protection ---');

assert(CHAPTERS[0].id === 1, 'Chapter 1 id is 1');
assert(CHAPTERS[0].title === 'The Briefing', 'Chapter 1 title preserved');
assert(CHAPTERS[1].id === 2, 'Chapter 2 id is 2');
assert(CHAPTERS[1].title.includes('Environment Prerequisites'), 'Chapter 2 title preserved');

const ch2Score = computeChapter2Score(INITIAL_CHAPTER2_STATE);
assert(ch2Score.totalScore > 0, 'Chapter 2 scoring calculator works unchanged');

console.log('\n🎉 ALL INTEGRATION TESTS PASSED!\n');
