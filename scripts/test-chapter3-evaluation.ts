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

console.log('--- Testing Chapter 3: The Integration Trap Evaluation Matrix & Nuances ---');

// Case 1: Ideal Play — Escalate to Aarav + Protocol Mismatch + Approved Gateway + Reference Sequence
{
  const state: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    escalationChoice: 'escalate_aarav',
    portalAccessGranted: true,
    task1Selected: 'protocol_mismatch',
    task1Submitted: true,
    task2Selected: 'approved_gateway',
    task2Submitted: true,
    task3Order: [
      'action_confirm_interface',
      'action_verify_auth',
      'action_prepare_mock_tests',
      'action_validate_integrate',
    ],
    task3Submitted: true,
  };
  const scorecard = computeChapter3Score(state, {
    scheduleScore: 85,
    riskScore: 85,
    governanceScore: 85,
    efficiencyScore: 85,
  });
  console.log('Ideal Play:', scorecard.totalScore, scorecard.outcomeType);
  assert(scorecard.totalScore >= 95, 'Ideal play produces high score (>= 95)');
  assert(scorecard.outcomeType === 'strong', 'Ideal play produces strong outcome');
  assert(scorecard.explanations.risk.length > 0, 'Risk explanation populated');
  assert(scorecard.explanations.governance.length > 0, 'Governance explanation populated');
  assert(scorecard.explanations.schedule.length > 0, 'Schedule explanation populated');
  assert(scorecard.explanations.efficiency.length > 0, 'Efficiency explanation populated');
  assert(scorecard.personalizedTakeaway.includes('protocol mismatch'), 'Personalized takeaway generated');
}

// Case 2: Parallel Work Nuance — Action B before Action A (both independent external dependencies)
{
  const stateParallel: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    escalationChoice: 'escalate_aarav',
    portalAccessGranted: true,
    task1Selected: 'protocol_mismatch',
    task1Submitted: true,
    task2Selected: 'approved_gateway',
    task2Submitted: true,
    task3Order: [
      'action_verify_auth',          // B first
      'action_confirm_interface',    // A second
      'action_prepare_mock_tests',   // C third (safe mocks)
      'action_validate_integrate',   // D last
    ],
    task3Submitted: true,
  };
  const scorecardParallel = computeChapter3Score(stateParallel, {
    scheduleScore: 85,
    riskScore: 85,
    governanceScore: 85,
    efficiencyScore: 85,
  });
  console.log('Parallel Independence (B before A):', scorecardParallel.totalScore, scorecardParallel.outcomeType);
  assert(scorecardParallel.outcomeType === 'strong', 'Parallel independence between A & B maintains strong outcome');
  assert(scorecardParallel.governanceScore >= 90, 'Governance not penalized for parallel independent dependencies');
  assert(scorecardParallel.efficiencyScore >= 95, 'Efficiency credited for safe parallel preparation');
}

// Case 3: Poor Initial Escalation (Option A: investigate independently) with recovery
{
  const stateRecovered: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    escalationChoice: 'investigate_independently',
    escalationRecovered: true,
    portalAccessGranted: true,
    task1Selected: 'protocol_mismatch',
    task1Submitted: true,
    task2Selected: 'approved_gateway',
    task2Submitted: true,
    task3Order: [
      'action_confirm_interface',
      'action_verify_auth',
      'action_prepare_mock_tests',
      'action_validate_integrate',
    ],
    task3Submitted: true,
  };
  const scorecardRecovered = computeChapter3Score(stateRecovered, {
    scheduleScore: 80,
    riskScore: 80,
    governanceScore: 80,
    efficiencyScore: 80,
  });
  console.log('Option A with recovery:', scorecardRecovered.totalScore, scorecardRecovered.outcomeType);
  assert(scorecardRecovered.totalScore >= 80, 'Player can recover from initial hesitation');
  assert(scorecardRecovered.outcomeType === 'strong', 'Strong outcome reachable upon full recovery and good plan');
}

// Case 4: Risky Approach (Direct Database) without recovery
{
  const stateRisky: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    escalationChoice: 'bypass_gateway',
    escalationRecovered: false,
    portalAccessGranted: true,
    task1Selected: 'database_overload', // incorrect diagnosis
    task1Submitted: true,
    task2Selected: 'direct_database',  // risky direct DB
    task2Submitted: true,
    task2Recovered: false,
    task3Order: [
      'action_validate_integrate',   // validating before dependencies
      'action_confirm_interface',
      'action_verify_auth',
      'action_prepare_mock_tests',
    ],
    task3Submitted: true,
  };
  const scorecardRisky = computeChapter3Score(stateRisky, {
    scheduleScore: 80,
    riskScore: 80,
    governanceScore: 80,
    efficiencyScore: 80,
  });
  console.log('Risky Play:', scorecardRisky.totalScore, scorecardRisky.outcomeType);
  assert(scorecardRisky.outcomeType === 'poor', 'Direct DB and invalid sequencing produces poor outcome');
  assert(scorecardRisky.riskScore < 50, 'Risk score heavily penalized for unapproved direct DB connection');
  assert(scorecardRisky.governanceScore < 50, 'Governance penalized for validating before approvals');
}

// Case 5: Action C (Mock Tests) delayed until after validation
{
  const stateDelayedMocks: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    escalationChoice: 'escalate_aarav',
    portalAccessGranted: true,
    task1Selected: 'protocol_mismatch',
    task1Submitted: true,
    task2Selected: 'approved_gateway',
    task2Submitted: true,
    task3Order: [
      'action_confirm_interface',
      'action_verify_auth',
      'action_validate_integrate', // validation placed before preparing mocks
      'action_prepare_mock_tests', // mocks delayed
    ],
    task3Submitted: true,
  };
  const scorecardDelayed = computeChapter3Score(stateDelayedMocks, {
    scheduleScore: 80,
    riskScore: 80,
    governanceScore: 80,
    efficiencyScore: 80,
  });
  console.log('Delayed Mock Tests:', scorecardDelayed.totalScore, scorecardDelayed.efficiencyScore);
  assert(scorecardDelayed.efficiencyScore < 75, 'Efficiency penalized when safe parallel mocks are delayed');
}

// Case 6: Clamping between 10 and 100
{
  const extremeLowState: Chapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    escalationChoice: 'bypass_gateway',
    escalationRecovered: false,
    portalAccessGranted: false,
    task1Selected: 'incorrect_ui',
    task1Submitted: true,
    task2Selected: 'direct_database',
    task2Submitted: true,
    task2Recovered: false,
    task3Order: ['action_validate_integrate'],
    task3Submitted: true,
  };
  const extremeLow = computeChapter3Score(extremeLowState, {
    scheduleScore: 20,
    riskScore: 20,
    governanceScore: 20,
    efficiencyScore: 20,
  });
  assert(extremeLow.scheduleScore >= 10, 'Scores clamped to minimum 10');
  assert(extremeLow.riskScore >= 10, 'Scores clamped to minimum 10');
  assert(extremeLow.governanceScore >= 10, 'Scores clamped to minimum 10');
  assert(extremeLow.efficiencyScore >= 10, 'Scores clamped to minimum 10');
}

console.log('🎉 ALL CHAPTER 3 EVALUATION TESTS PASSED SUCCESSFULLY!');
