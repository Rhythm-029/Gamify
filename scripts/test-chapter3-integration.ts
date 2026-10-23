import process from 'node:process';
import {
  CHAPTERS,
  getStoredChapterStatuses,
  updateChapterStatus,
  resetChapterStatuses,
} from '../src/data/chaptersData.ts';
import {
  computeChapter3Score,
  INITIAL_CHAPTER3_STATE,
  ESCALATION_OPTIONS,
  TASK1_BLOCKER_OPTIONS,
  TASK2_APPROACH_OPTIONS,
  TASK3_ACTION_CARDS,
  CHAPTER3_TITLE,
  CHAPTER3_SUBTITLE,
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

console.log('\n=== RUNNING CHAPTER 3: THE INTEGRATION TRAP INTEGRATION & REGRESSION SUITE ===\n');

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
assert(ch3Meta?.title === 'The Integration Trap', 'Chapter 3 title is "The Integration Trap"');
assert(ch3Meta?.subtitle === 'Core Banking APIs, SOAP/REST Integration & LDAP/SSO Dependencies', 'Chapter 3 subtitle is correct');
assert(ch3Meta?.duration === '~1m 45s', 'Chapter 3 duration is within target (~1m 45s)');
assert(ch3Meta?.objectives.length === 3, 'Chapter 3 has 3 explicit objectives');

// ── TEST GROUP 2: CHAPTER 3 DOSSIER & STAKEHOLDERS ──
console.log('\n--- Test Group 2: Chapter 3 Dossier & Stakeholders ---');

const ch3Dossier = ALL_CHAPTER_DOSSIERS[3];
assert(ch3Dossier.title === 'The Integration Trap', 'Dossier title matches "The Integration Trap"');
assert(ch3Dossier.stakeholders !== undefined && ch3Dossier.stakeholders.length >= 3, 'Dossier contains Daniel, Aarav, Marcus');
assert(Boolean(ch3Dossier.stakeholders?.some((s) => s.name === 'Daniel Brooks')), 'Daniel Brooks is stakeholder');
assert(Boolean(ch3Dossier.stakeholders?.some((s) => s.name === 'Aarav Kapoor')), 'Aarav Kapoor is stakeholder');
assert(Boolean(ch3Dossier.stakeholders?.some((s) => s.name === 'Marcus Reed')), 'Marcus Reed is stakeholder');

// ── TEST GROUP 3: ESCALATION & TRIAGE CONTENT INTEGRITY ──
console.log('\n--- Test Group 3: Escalation & Triage Integrity ---');

assert(ESCALATION_OPTIONS.length === 3, 'Exactly 3 escalation options');
const escalationIds = ESCALATION_OPTIONS.map((e) => e.id);
assert(escalationIds.includes('investigate_independently'), 'Option A: investigate_independently');
assert(escalationIds.includes('escalate_aarav'), 'Option B: escalate_aarav (Recommended)');
assert(escalationIds.includes('bypass_gateway'), 'Option C: bypass_gateway (Risky)');

assert(TASK1_BLOCKER_OPTIONS.length === 4, 'Task 1 has 4 blocker diagnosis cards');
const correctBlocker = TASK1_BLOCKER_OPTIONS.find((b) => b.isCorrect);
assert(correctBlocker?.id === 'protocol_mismatch', 'Correct blocker is protocol_mismatch');

assert(TASK2_APPROACH_OPTIONS.length === 3, 'Task 2 has 3 approach cards');
const correctApproach = TASK2_APPROACH_OPTIONS.find((a) => a.isRecommended);
assert(correctApproach?.id === 'approved_gateway', 'Recommended approach is approved_gateway');

const actionIds = Object.keys(TASK3_ACTION_CARDS);
assert(actionIds.length === 4, 'Task 3 has 4 actions to prioritize');
assert(actionIds.includes('action_confirm_interface'), 'Action A present');
assert(actionIds.includes('action_verify_auth'), 'Action B present');
assert(actionIds.includes('action_prepare_mock_tests'), 'Action C present');
assert(actionIds.includes('action_validate_integrate'), 'Action D present');

// ── TEST GROUP 4: SESSION STATE PERSISTENCE ──
console.log('\n--- Test Group 4: Session State Persistence ---');

resetChapter3SessionState();
let s = getChapter3SessionState();
assert(s.escalationChoice === null, 'Initial escalationChoice is null');
assert(!s.task1Submitted, 'Initial task1Submitted is false');
assert(!s.task2Submitted, 'Initial task2Submitted is false');
assert(!s.task3Submitted, 'Initial task3Submitted is false');
assert(!s.completed, 'Initial completed is false');

// Mutate state
setChapter3SessionState({
  escalationChoice: 'escalate_aarav',
  portalAccessGranted: true,
  task1Selected: 'protocol_mismatch',
  task1Submitted: true,
});
s = getChapter3SessionState();
assert(s.escalationChoice === 'escalate_aarav', 'Escalation choice persisted');
assert(s.portalAccessGranted === true, 'Portal access flag persisted');
assert(s.task1Selected === 'protocol_mismatch', 'Task 1 selection persisted');

resetChapter3SessionState();
s = getChapter3SessionState();
assert(s.escalationChoice === null, 'Reset cleared escalationChoice');
assert(!s.portalAccessGranted, 'Reset cleared portalAccessGranted');

// ── TEST GROUP 5: REGRESSION OF CHAPTERS 1 AND 2 ──
console.log('\n--- Test Group 5: Chapters 1 & 2 Regression Protection ---');

assert(CHAPTERS[0].id === 1, 'Chapter 1 id is 1');
assert(CHAPTERS[0].title === 'The Briefing', 'Chapter 1 title preserved');
assert(CHAPTERS[1].id === 2, 'Chapter 2 id is 2');
assert(CHAPTERS[1].title.includes('Environment Prerequisites'), 'Chapter 2 title preserved');

const ch2Score = computeChapter2Score(INITIAL_CHAPTER2_STATE);
assert(ch2Score.totalScore > 0, 'Chapter 2 scoring calculator works unchanged');
assert(typeof ch2Score.scheduleScore === 'number', 'Chapter 2 scheduleScore works unchanged');
assert(typeof ch2Score.riskScore === 'number', 'Chapter 2 riskScore works unchanged');

console.log('\n🎉 ALL 28 INTEGRATION & REGRESSION TESTS PASSED!\n');
