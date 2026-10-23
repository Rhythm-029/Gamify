import {
  TEMPORARY_CHAPTER_SKIP_ACTIVE,
  DEV_CHAPTERS,
  executeChapterJump,
  type DevChapterOption,
} from '../src/utils/devChapterSkip';
import { getStoredChapterStatuses, resetChapterStatuses } from '../src/data/chaptersData';
import { getChapter3SessionState } from '../src/data/chapter3Data';
import { getChapter4SessionState } from '../src/data/chapter4Data';
import { getChapter5SessionState } from '../src/data/chapter5Data';

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${msg}`);
  }
}

console.log('=== RUNNING TEMPORARY CHAPTER SKIP VERIFICATION SUITE ===\n');

// 1. Config & Flag check
assert(TEMPORARY_CHAPTER_SKIP_ACTIVE === true, 'TEMPORARY_CHAPTER_SKIP_ACTIVE is active');
assert(DEV_CHAPTERS.length === 5, 'Exactly 5 playable chapters registered in DEV_CHAPTERS');

// 2. Chapter definitions
const ids: number[] = DEV_CHAPTERS.map((c: DevChapterOption) => c.id);
assert(JSON.stringify(ids) === JSON.stringify([1, 2, 3, 4, 5]), 'DEV_CHAPTERS covers chapters 1 through 5');

// 3. Jump to Chapter 2
let jumpedTo: number | null = null;
executeChapterJump(2, (id: number) => { jumpedTo = id; });
assert(jumpedTo === 2, 'executeChapterJump(2) triggers start callback with 2');
let statuses = getStoredChapterStatuses();
assert(statuses[2] === 'unlocked', 'Chapter 2 is unlocked in stored statuses');

// 4. Jump to Chapter 3
executeChapterJump(3, (id: number) => { jumpedTo = id; });
assert(jumpedTo === 3, 'executeChapterJump(3) triggers start callback with 3');
statuses = getStoredChapterStatuses();
assert(statuses[3] === 'unlocked', 'Chapter 3 is unlocked in stored statuses');
const ch3State = getChapter3SessionState();
assert(ch3State.completed === false, 'Chapter 3 state was cleanly reset for fresh start');

// 5. Jump to Chapter 4
executeChapterJump(4, (id: number) => { jumpedTo = id; });
assert(jumpedTo === 4, 'executeChapterJump(4) triggers start callback with 4');
statuses = getStoredChapterStatuses();
assert(statuses[4] === 'unlocked', 'Chapter 4 is unlocked in stored statuses');
const ch4State = getChapter4SessionState();
assert(ch4State.completed === false, 'Chapter 4 state was cleanly reset for fresh start');

// 6. Jump to Chapter 5
executeChapterJump(5, (id: number) => { jumpedTo = id; });
assert(jumpedTo === 5, 'executeChapterJump(5) triggers start callback with 5');
statuses = getStoredChapterStatuses();
assert(statuses[5] === 'unlocked', 'Chapter 5 is unlocked in stored statuses');
const ch5State = getChapter5SessionState();
assert(ch5State.completed === false, 'Chapter 5 state was cleanly reset for fresh start');

// 7. Reset simulation
resetChapterStatuses();
statuses = getStoredChapterStatuses();
assert(statuses[1] === 'unlocked', 'After reset, Chapter 1 is unlocked');

console.log('\n🎉 ALL TEMPORARY CHAPTER SKIP TESTS PASSED SUCCESSFULLY!');
