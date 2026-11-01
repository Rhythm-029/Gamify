import process from 'node:process';
import {
  UAT_DETAILS_V1_DOC,
  UAT_DETAILS_V2_DOC,
  SOPHIA_FOLLOWUP_DRAFT,
  computeChapter3Score,
  INITIAL_CHAPTER3_STATE,
} from '../src/data/chapter3Data.ts';
import type { Chapter3State } from '../src/types/chapter3.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('=== TEST SUITE: CHAPTER 3 DOCUMENT & MESSAGING INSPECTION ===\n');

// 1. Verify Document v1 vs v2 structure
console.log('--- Test 1: Document Structure & Content ---');
assert(UAT_DETAILS_V1_DOC.filename === 'Project_Amigo_UAT_Details_v1.pdf', 'Document 1 filename matches spec');
assert(UAT_DETAILS_V2_DOC.filename === 'Project_Amigo_UAT_Details_v2.pdf', 'Document 2 filename matches spec');

assert(UAT_DETAILS_V1_DOC.items.length === 4, 'v1 has 4 items');
assert(UAT_DETAILS_V2_DOC.items.length === 5, 'v2 has 5 items');

assert(UAT_DETAILS_V1_DOC.note.includes('currently available'), 'v1 note contains expected client notice');
assert(UAT_DETAILS_V2_DOC.note.includes('currently available'), 'v2 note contains expected client notice');

// 2. Verify neutral follow-up draft
console.log('\n--- Test 2: Follow-up Draft Evaluation ---');
assert(SOPHIA_FOLLOWUP_DRAFT.toLowerCase().includes('network access'), 'Draft mentions network access requirements');
assert(SOPHIA_FOLLOWUP_DRAFT.toLowerCase().includes('firewall'), 'Draft mentions firewall allowlisting');
assert(SOPHIA_FOLLOWUP_DRAFT.toLowerCase().includes('proxy'), 'Draft mentions proxy configuration');

// 3. Verify message evaluation handles custom / alternate phrasing
const testCustomPhrasings = [
  'Could you also confirm the network access requirements for the development team, including firewall allowlisting and proxy configuration?',
  'Could you please share the network configuration and firewall details?',
  'Sophia, do we have proxy and firewall clearance for our developers?',
  'What about the network access requirements mentioned earlier?',
];

for (const msg of testCustomPhrasings) {
  const state: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    step: 'assignment_completed',
    v1Delivered: true,
    firstForwardTarget: 'sophia_followup',
    playerFollowUpSent: true,
    playerFollowUpMessage: msg,
    playerIdentifiedNetworkGap: true,
    v2Delivered: true,
    v2SentToDaniel: true,
    pathTaken: 'full_credit',
  };
  const score = computeChapter3Score(state);
  assert(score.behaviours.stakeholderCommunication.score >= 90, `Accepts natural phrasing: "${msg}" with score >= 90`);
}

console.log('\n🎉 ALL DOCUMENT & MESSAGING INSPECTION TESTS PASSED!');
