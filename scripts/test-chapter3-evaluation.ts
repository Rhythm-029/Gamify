import { computeChapter3Score, INITIAL_CHAPTER3_STATE } from '../src/data/chapter3Data';
import type { Chapter3State } from '../src/types/chapter3';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('--- Testing Chapter 3 Evaluation Matrix & Edge Cases ---');

// Case 1: Ideal Play — Option C (Contain & validate) + All 3 actions
{
  const state: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    decision: 'contain_and_validate_affected',
    selectedActions: [
      'isolate_affected_records',
      'verify_source_mappings',
      'assign_owner_continue_unaffected_work',
    ],
    planSubmitted: true,
  };
  const scorecard = computeChapter3Score(state, { scheduleScore: 85, riskScore: 85, governanceScore: 85, efficiencyScore: 85 });
  console.log('Ideal Play:', scorecard.totalScore, scorecard.outcomeType);
  assert(scorecard.totalScore >= 95, 'Ideal play produces high score (>= 95)');
  assert(scorecard.outcomeType === 'strong', 'Ideal play produces strong outcome');
  assert(scorecard.explanations.risk.length > 0, 'Risk explanation populated');
  assert(scorecard.explanations.governance.length > 0, 'Governance explanation populated');
  assert(scorecard.explanations.schedule.length > 0, 'Schedule explanation populated');
  assert(scorecard.explanations.efficiency.length > 0, 'Efficiency explanation populated');
}

// Case 2: Poor Initial Decision (Option A) but Strong Operational Plan (All 3 actions)
{
  const state: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    decision: 'continue_demo_as_ready',
    selectedActions: [
      'isolate_affected_records',
      'verify_source_mappings',
      'assign_owner_continue_unaffected_work',
    ],
    planSubmitted: true,
  };
  const scorecard = computeChapter3Score(state, { scheduleScore: 80, riskScore: 80, governanceScore: 80, efficiencyScore: 80 });
  console.log('Option A + All 3 Actions:', scorecard.totalScore, scorecard.outcomeType);
  assert(scorecard.outcomeType === 'partial', 'Option A cannot receive strong outcome even with good plan');
  assert(scorecard.totalScore < 90, 'Score is depressed compared to Ideal Play');
  assert(scorecard.totalScore > 65, 'Operational follow-through recovers from worst possible penalties');
}

// Case 3: Strong Initial Decision (Option C) but Incomplete/Empty Operational Plan
{
  const stateEmptyPlan: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    decision: 'contain_and_validate_affected',
    selectedActions: [],
    planSubmitted: true,
  };
  const scorecardEmpty = computeChapter3Score(stateEmptyPlan, { scheduleScore: 80, riskScore: 80, governanceScore: 80, efficiencyScore: 80 });
  console.log('Option C + Empty Plan:', scorecardEmpty.totalScore, scorecardEmpty.outcomeType);
  assert(scorecardEmpty.outcomeType === 'poor', 'Empty plan produces poor outcome');
  assert(scorecardEmpty.totalScore < 75, 'Option C with empty plan produces depressed score');

  // Verify requirement: Selecting correct actions produces better result than simply choosing Option C in earlier decision alone
  const idealScore = computeChapter3Score({
    ...INITIAL_CHAPTER3_STATE,
    decision: 'contain_and_validate_affected',
    selectedActions: [
      'isolate_affected_records',
      'verify_source_mappings',
      'assign_owner_continue_unaffected_work',
    ],
    planSubmitted: true,
  }, { scheduleScore: 80, riskScore: 80, governanceScore: 80, efficiencyScore: 80 });
  assert(idealScore.totalScore > scorecardEmpty.totalScore + 20, 'Selecting actions produces far better result than Option C alone');
}

// Case 4: Continuing unaffected work WITHOUT isolating and validating (Critical Pitfall)
{
  const statePitfall: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    decision: 'contain_and_validate_affected',
    selectedActions: ['assign_owner_continue_unaffected_work'], // continuing safe work without isolation or verification
    planSubmitted: true,
  };
  const scorecardPitfall = computeChapter3Score(statePitfall, { scheduleScore: 80, riskScore: 80, governanceScore: 80, efficiencyScore: 80 });
  console.log('Continue work without isolate/verify:', scorecardPitfall.totalScore, scorecardPitfall.outcomeType);
  assert(scorecardPitfall.outcomeType === 'poor', 'Continuing work without isolate/verify produces poor outcome');
  assert(scorecardPitfall.riskScore < 80, 'Risk score penalized for uncontained defect');
  assert(scorecardPitfall.governanceScore < 80, 'Governance penalized for skipping containment gate');
}

// Case 5: Option B (Stop all development) + All 3 actions
{
  const stateOptionB: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    decision: 'stop_all_development',
    selectedActions: [
      'isolate_affected_records',
      'verify_source_mappings',
      'assign_owner_continue_unaffected_work',
    ],
    planSubmitted: true,
  };
  const scorecardB = computeChapter3Score(stateOptionB, { scheduleScore: 80, riskScore: 80, governanceScore: 80, efficiencyScore: 80 });
  console.log('Option B + All 3 Actions:', scorecardB.totalScore, scorecardB.outcomeType);
  assert(scorecardB.scheduleScore < 75, 'Schedule penalized for unnecessary team halt');
  assert(scorecardB.efficiencyScore < 70, 'Efficiency penalized for pausing unaffected developers');
  assert(scorecardB.riskScore >= 90, 'Risk credited for caution and complete plan');
}

// Case 6: Clamping between 10 and 100
{
  const extremeLowState: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    decision: 'continue_demo_as_ready',
    selectedActions: [],
    planSubmitted: true,
  };
  const extremeLow = computeChapter3Score(extremeLowState, { scheduleScore: 20, riskScore: 20, governanceScore: 20, efficiencyScore: 20 });
  assert(extremeLow.scheduleScore >= 10, 'Scores clamped to minimum 10');
  assert(extremeLow.riskScore >= 10, 'Scores clamped to minimum 10');
  assert(extremeLow.governanceScore >= 10, 'Scores clamped to minimum 10');
  assert(extremeLow.efficiencyScore >= 10, 'Scores clamped to minimum 10');
}

console.log('🎉 ALL CHAPTER 3 EVALUATION TESTS PASSED SUCCESSFULLY!');
