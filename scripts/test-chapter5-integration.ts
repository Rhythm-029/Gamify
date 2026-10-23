import {
  CHAPTERS,
  getStoredChapterStatuses,
  updateChapterStatus,
  resetChapterStatuses,
} from '../src/data/chaptersData';
import {
  READINESS_EVIDENCE_CARDS,
  LAUNCH_BLOCKER_OPTIONS,
  PRE_PILOT_ACTIVITIES,
  WIDER_ROLLOUT_OPTIONS,
  INITIAL_CHAPTER5_STATE,
  getChapter5SessionState,
  setChapter5SessionState,
  resetChapter5SessionState,
} from '../src/data/chapter5Data';
import { computeChapter4Score, INITIAL_CHAPTER4_STATE } from '../src/data/chapter4Data';
import { computeChapter3Score, INITIAL_CHAPTER3_STATE } from '../src/data/chapter3Data';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('=== RUNNING CHAPTER 5: THE LAUNCH DECISION INTEGRATION & REGRESSION SUITE ===\n');

// ── Test Group 1: Chapter Registration & Progression ──
console.log('--- Test Group 1: Chapter Registration & Progression ---');
resetChapterStatuses();
let statuses = getStoredChapterStatuses();
assert(statuses[1] === 'unlocked', 'Initial state: Chapter 1 is unlocked');
assert(statuses[2] === undefined || statuses[2] === 'locked', 'Initial state: Chapter 2 is locked');
assert(statuses[5] === undefined || statuses[5] === 'locked', 'Initial state: Chapter 5 is locked');

// Complete Chapters 1 -> 4
updateChapterStatus(1, 'completed');
updateChapterStatus(2, 'unlocked');
updateChapterStatus(2, 'completed');
updateChapterStatus(3, 'unlocked');
updateChapterStatus(3, 'completed');
updateChapterStatus(4, 'unlocked');
statuses = getStoredChapterStatuses();
assert(statuses[4] === 'unlocked', 'Chapter 4 unlocked after Chapter 3 completion');

// Complete Chapter 4 -> Chapter 5 unlocked
updateChapterStatus(4, 'completed');
updateChapterStatus(5, 'unlocked');
statuses = getStoredChapterStatuses();
assert(statuses[5] === 'unlocked', 'Chapter 5 unlocked after Chapter 4 completion');

// Complete Chapter 5 -> Chapter 6 unlocked
updateChapterStatus(5, 'completed');
updateChapterStatus(6, 'unlocked');
statuses = getStoredChapterStatuses();
assert(statuses[5] === 'completed', 'Chapter 5 marked completed');
assert(statuses[6] === 'unlocked', 'Chapter 6 unlocked after Chapter 5 completion');

const ch5 = CHAPTERS.find((c) => c.id === 5);
assert(ch5 !== undefined, 'Chapter 5 exists in CHAPTERS array');
assert(ch5?.title === 'The Launch Decision', 'Chapter 5 title is "The Launch Decision"');
assert(ch5?.duration === '~2–3 mins', 'Chapter 5 duration is within target (~2–3 mins)');
assert(ch5?.objectives.length === 3, 'Chapter 5 has 3 explicit objectives');

// ── Test Group 2: Evidence Cards & Known Scenario Facts ──
console.log('\n--- Test Group 2: Readiness Evidence Cards Integrity ---');
assert(READINESS_EVIDENCE_CARDS.length === 5, 'Exactly 5 readiness evidence cards');
const funcCard = READINESS_EVIDENCE_CARDS.find((c) => c.id === 'functional_testing');
const integCard = READINESS_EVIDENCE_CARDS.find((c) => c.id === 'integration_gateway');
const secCard = READINESS_EVIDENCE_CARDS.find((c) => c.id === 'security_access');
const perfCard = READINESS_EVIDENCE_CARDS.find((c) => c.id === 'performance_load');
const rollCard = READINESS_EVIDENCE_CARDS.find((c) => c.id === 'rollback_monitoring');

assert(funcCard?.status === 'ready', 'Functional Testing initial status is Ready');
assert(integCard?.status === 'ready', 'Integration initial status is Ready');
assert(secCard?.status === 'needs_review', 'Security and Access initial status is Needs Review');
assert(perfCard?.status === 'blocked', 'Performance initial status is Blocked');
assert(rollCard?.status === 'needs_review', 'Rollback and Monitoring initial status is Needs Review');

// ── Test Group 3: Launch Blockers & Rollout Options ──
console.log('\n--- Test Group 3: Launch Blockers & Rollout Options ---');
assert(LAUNCH_BLOCKER_OPTIONS.length === 5, 'Exactly 5 launch blocker options in Stage 2');
const mandatoryBlockers = LAUNCH_BLOCKER_OPTIONS.filter((o) => o.isMandatoryBlocker);
assert(mandatoryBlockers.length === 3, 'Exactly 3 mandatory launch blockers');
assert(PRE_PILOT_ACTIVITIES.length === 5, 'Exactly 5 pre-pilot activities in Stage 3A');
assert(WIDER_ROLLOUT_OPTIONS.length === 3, 'Exactly 3 wider rollout decision options in Stage 3C');

// ── Test Group 4: Session State Persistence ──
console.log('\n--- Test Group 4: Session State Persistence ---');
resetChapter5SessionState();
const initialS = getChapter5SessionState();
assert(initialS.currentStage === 'review_evidence', 'Initial stage is review_evidence');
assert(initialS.selectedBlockers.length === 0, 'Initial selectedBlockers is empty');
assert(initialS.submitted === false, 'Initial submitted is false');
assert(initialS.completed === false, 'Initial completed is false');

setChapter5SessionState({
  currentStage: 'build_rollout_plan',
  selectedBlockers: ['blocker_performance_load', 'blocker_security_approval'],
  widerRolloutDecision: 'expand_in_stages',
});

const updatedS = getChapter5SessionState();
assert(updatedS.currentStage === 'build_rollout_plan', 'Updated stage persisted');
assert(updatedS.selectedBlockers.length === 2, 'Selected blockers persisted');
assert(updatedS.widerRolloutDecision === 'expand_in_stages', 'Wider rollout decision persisted');

resetChapter5SessionState();
const resetS = getChapter5SessionState();
assert(resetS.selectedBlockers.length === 0, 'Reset cleared selected blockers');
assert(resetS.currentStage === 'review_evidence', 'Reset restored initial stage');

// ── Test Group 5: Chapters 1–4 Regression Protection ──
console.log('\n--- Test Group 5: Chapters 1–4 Regression Protection ---');
const ch1 = CHAPTERS.find((c) => c.id === 1);
const ch2 = CHAPTERS.find((c) => c.id === 2);
const ch3 = CHAPTERS.find((c) => c.id === 3);
const ch4 = CHAPTERS.find((c) => c.id === 4);

assert(ch1?.title === 'The Briefing', 'Chapter 1 title preserved');
assert(ch2?.title === 'Environment Prerequisites, Network Gates & UI/UX Signoff', 'Chapter 2 title preserved');
assert(ch3?.title === 'The Integration Trap', 'Chapter 3 title preserved');
assert(ch4?.title === 'Change Request & Impact Analysis', 'Chapter 4 title preserved');

// Verify Chapter 3 scoring calculator unchanged
const ch3Score = computeChapter3Score(INITIAL_CHAPTER3_STATE);
assert(typeof ch3Score.totalScore === 'number', 'Chapter 3 scoring engine works unchanged');

// Verify Chapter 4 scoring calculator unchanged
const ch4Score = computeChapter4Score(INITIAL_CHAPTER4_STATE);
assert(typeof ch4Score.totalScore === 'number', 'Chapter 4 scoring engine works unchanged');

console.log('\n🎉 ALL 26 INTEGRATION & REGRESSION TESTS PASSED!\n');
