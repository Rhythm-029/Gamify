import process from 'node:process';
import { computeChapter3Score, INITIAL_CHAPTER3_STATE } from '../src/data/chapter3Data.ts';
import type { Chapter3State } from '../src/types/chapter3.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('--- Testing Chapter 3: UAT Infrastructure Coordination Evaluation ---');

// Case 1: Ideal Play (Branch A: Identified gap independently, requested network access, forwarded v2)
{
  const stateFullCredit: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    step: 'assignment_completed',
    activeChatRecipient: 'daniel',
    emailSentAt: new Date().toISOString(),
    v1Delivered: true,
    firstForwardTarget: 'sophia_followup',
    playerFollowUpSent: true,
    playerFollowUpMessage: 'Could you also confirm the network access requirements for the development team, including firewall allowlisting and proxy configuration?',
    playerIdentifiedNetworkGap: true,
    v2Delivered: true,
    v2SentToDaniel: true,
    danielFinalConfirmed: true,
    aaravSummaryGiven: true,
    pathTaken: 'full_credit',
  };

  const scorecard = computeChapter3Score(stateFullCredit);
  console.log('Ideal Full Credit Play:', scorecard.totalScore, scorecard.outcomeType);
  assert(scorecard.totalScore >= 90, 'Full credit path gives score >= 90 (expected ~96)');
  assert(scorecard.outcomeType === 'strong', 'Full credit produces strong outcome');
  assert(scorecard.behaviours.requirementCompleteness.score === 100, 'Behavior A (Requirement completeness) is 100');
  assert(scorecard.behaviours.stakeholderCommunication.score === 100, 'Behavior B (Stakeholder communication) is 100');
  assert(scorecard.behaviours.deliveryCoordination.score === 95, 'Behavior C (Delivery coordination) is 95');
  assert(scorecard.personalizedTakeaway.length > 0, 'Personalized takeaway is generated');
}

// Case 2: Recovery Play (Branch B first, then prompted by Daniel, asked Sophia, sent v2)
{
  const stateRecovery: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    step: 'assignment_completed',
    activeChatRecipient: 'daniel',
    emailSentAt: new Date().toISOString(),
    v1Delivered: true,
    sentV1ToDaniel: true,
    danielPromptedForNetwork: true,
    firstForwardTarget: 'daniel',
    playerFollowUpSent: true,
    playerFollowUpMessage: 'Could you also confirm the network access requirements, firewall allowlisting, and proxy configuration?',
    playerIdentifiedNetworkGap: true,
    v2Delivered: true,
    v2SentToDaniel: true,
    danielFinalConfirmed: true,
    aaravSummaryGiven: true,
    pathTaken: 'recovery',
  };

  const scorecard = computeChapter3Score(stateRecovery);
  console.log('Recovery Play:', scorecard.totalScore, scorecard.outcomeType);
  assert(scorecard.totalScore >= 75 && scorecard.totalScore <= 88, 'Recovery path awards partial credit (around ~81)');
  assert(scorecard.outcomeType === 'partial', 'Recovery produces partial outcome');
  assert(scorecard.behaviours.requirementCompleteness.score === 75, 'Behavior A credits recovery with minor deduction');
  assert(scorecard.behaviours.stakeholderCommunication.score === 90, 'Behavior B is high due to polite recovery');
}

// Case 3: Incomplete Play (Branch B, sent v1 to Daniel, never followed up on network requirements)
{
  const stateIncomplete: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    step: 'assignment_completed',
    activeChatRecipient: 'daniel',
    emailSentAt: new Date().toISOString(),
    v1Delivered: true,
    sentV1ToDaniel: true,
    firstForwardTarget: 'daniel',
    playerFollowUpSent: false,
    v2Delivered: false,
    v2SentToDaniel: false,
    danielFinalConfirmed: false,
    aaravSummaryGiven: true,
    pathTaken: 'incomplete',
  };

  const scorecard = computeChapter3Score(stateIncomplete);
  console.log('Incomplete Play:', scorecard.totalScore, scorecard.outcomeType);
  assert(scorecard.totalScore < 65, 'Incomplete path awards low score (< 65)');
  assert(scorecard.outcomeType === 'poor', 'Incomplete path produces poor outcome');
  assert(scorecard.behaviours.requirementCompleteness.score === 50, 'Behavior A marked incomplete');
  assert(scorecard.behaviours.deliveryCoordination.score <= 60, 'Behavior C reflects missing prerequisite in handoff');
}

console.log('🎉 All Chapter 3 Evaluation Matrix tests passed!');
