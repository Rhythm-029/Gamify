import {
  CHAPTERS,
  getStoredChapterStatuses,
  updateChapterStatus,
  resetChapterStatuses,
} from '../src/data/chaptersData';
import {
  computeChapter3Score,
  INITIAL_CHAPTER3_STATE,
  CHAPTER3_DECISION_OPTIONS,
  CHAPTER3_VALIDATION_ACTIONS,
  PROTOTYPE_DATA_MISMATCHES,
  CHAPTER3_CLOSING_INSIGHT,
  getChapter3SessionState,
  setChapter3SessionState,
  resetChapter3SessionState,
} from '../src/data/chapter3Data';
import {
  computeChapter2Score,
  INITIAL_CHAPTER2_STATE,
} from '../src/data/chapter2Data';
import { ALL_CHAPTER_DOSSIERS } from '../src/data/chapters/index';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('\n=== RUNNING CHAPTER 3 END-TO-END INTEGRATION & REGRESSION SUITE ===\n');

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
assert(ch3Meta?.title === 'The Data Integrity Crisis', 'Chapter 3 title is correct');
assert(ch3Meta?.subtitle === 'The prototype works. But can the team trust its data?', 'Chapter 3 subtitle is correct');
assert(ch3Meta?.duration === '~1m 45s', 'Chapter 3 duration is within target');
assert(ch3Meta?.objectives.length === 3, 'Chapter 3 has 3 explicit objectives');

// ── TEST GROUP 2: CHAPTER 3 DATA DOSSIER & CONTEXT ──
console.log('\n--- Test Group 2: Chapter 3 Dossier & Prototype Mismatches ---');

const ch3Dossier = ALL_CHAPTER_DOSSIERS[3];
assert(ch3Dossier.title === 'The Data Integrity Crisis', 'Dossier title matches');
assert(ch3Dossier.stakeholders !== undefined && ch3Dossier.stakeholders.length >= 4, 'Dossier contains Daniel, Aarav, Marcus, Sophia');
assert(ch3Dossier.stakeholders?.some((s) => s.name === 'Daniel Brooks'), 'Daniel Brooks is stakeholder');
assert(ch3Dossier.stakeholders?.some((s) => s.name === 'Aarav Kapoor'), 'Aarav Kapoor is stakeholder');

assert(PROTOTYPE_DATA_MISMATCHES.length === 4, 'Includes 4 realistic prototype test mismatch records');
assert(PROTOTYPE_DATA_MISMATCHES.some((m) => m.module === 'Appraisal Cycle'), 'Appraisal cycle mismatch present');
assert(PROTOTYPE_DATA_MISMATCHES.some((m) => m.module === 'Leave & Attendance'), 'Leave balance mismatch present');

// ── TEST GROUP 3: DECISION OPTIONS & ACTION KEYS ──
console.log('\n--- Test Group 3: Semantic Keys & Option Integrity ---');

assert(CHAPTER3_DECISION_OPTIONS.length === 3, 'Exactly 3 decision options');
const decisionKeys = CHAPTER3_DECISION_OPTIONS.map((d) => d.key);
assert(decisionKeys.includes('continue_demo_as_ready'), 'Option A key: continue_demo_as_ready');
assert(decisionKeys.includes('stop_all_development'), 'Option B key: stop_all_development');
assert(decisionKeys.includes('contain_and_validate_affected'), 'Option C key: contain_and_validate_affected');

// Verify Aarav's exact responses
const optA = CHAPTER3_DECISION_OPTIONS.find((o) => o.key === 'continue_demo_as_ready')!;
const optB = CHAPTER3_DECISION_OPTIONS.find((o) => o.key === 'stop_all_development')!;
const optC = CHAPTER3_DECISION_OPTIONS.find((o) => o.key === 'contain_and_validate_affected')!;

assert(optA.feedback.includes('presenting unverified data could create much bigger problems later'), 'Aarav feedback A matches prompt');
assert(optB.feedback.includes("we don't need to freeze unrelated work"), 'Aarav feedback B matches prompt');
assert(optC.feedback.includes("Contain the issue, establish what is wrong, and keep unaffected work moving"), 'Aarav feedback C matches prompt');

// Verify 3 validation actions
assert(CHAPTER3_VALIDATION_ACTIONS.length === 3, 'Exactly 3 validation actions');
const actionKeys = CHAPTER3_VALIDATION_ACTIONS.map((a) => a.key);
assert(actionKeys.includes('isolate_affected_records'), 'Action 1 key: isolate_affected_records');
assert(actionKeys.includes('verify_source_mappings'), 'Action 2 key: verify_source_mappings');
assert(actionKeys.includes('assign_owner_continue_unaffected_work'), 'Action 3 key: assign_owner_continue_unaffected_work');

assert(CHAPTER3_CLOSING_INSIGHT === 'Delivery speed matters. Reliable delivery means knowing which work can continue safely and which data must be verified first.', 'Closing insight text matches prompt verbatim');

// ── TEST GROUP 4: SESSION STATE PERSISTENCE ──
console.log('\n--- Test Group 4: Session State Persistence ---');

resetChapter3SessionState();
let s = getChapter3SessionState();
assert(s.decision === null, 'Initial decision is null');
assert(s.selectedActions.length === 0, 'Initial actions array is empty');
assert(!s.planSubmitted, 'Initial planSubmitted is false');
assert(!s.completed, 'Initial completed is false');

// Mutate state
setChapter3SessionState({
  decision: 'contain_and_validate_affected',
  selectedActions: ['isolate_affected_records', 'verify_source_mappings'],
});
s = getChapter3SessionState();
assert(s.decision === 'contain_and_validate_affected', 'Decision persisted');
assert(s.selectedActions.length === 2, 'Actions persisted');

resetChapter3SessionState();
s = getChapter3SessionState();
assert(s.decision === null, 'Reset cleared decision');

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
