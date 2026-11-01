import { computeChapter7Score, INITIAL_CHAPTER7_STATE } from '../src/data/chapter7Data';
import type { Chapter7State } from '../src/types/chapter7';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('--- Testing Chapter 7: Production Issues & Root Cause Analysis Evaluation Engine ---');

// Test Case 1: Ideal / Disciplined Response
const idealState: Chapter7State = {
  ...INITIAL_CHAPTER7_STATE,
  // Activity 1: Confirm scope -> Deploy hotfix -> Verify access -> Close incident
  activity1Order: ['confirm_scope', 'deploy_hotfix', 'verify_access', 'close_prematurely'],
  activity1Attempts: 1,
  activity1Submitted: true,
  activity1Completed: true,

  // Activity 2: All 4 correct RCA fields
  activity2Answers: {
    incident: 'inc_opt_a',
    rootCause: 'rc_opt_a',
    impact: 'imp_opt_a',
    prevention: 'prev_opt_a',
  },
  activity2Attempts: 1,
  activity2Submitted: true,
  activity2Completed: true,

  // Activity 3: All 4 appropriate controls with proactive monitoring prioritized
  activity3Selected: [
    'continuous_memory_monitoring',
    'alert_thresholds',
    'memory_regression_testing',
    'service_health_checks',
  ],
  activity3PriorityOrder: [
    'continuous_memory_monitoring',
    'alert_thresholds',
    'memory_regression_testing',
    'service_health_checks',
  ],
  activity3Attempts: 1,
  activity3Submitted: true,
  activity3Completed: true,
  incidentStatus: 'resolved',
  completed: true,
};

const idealScore = computeChapter7Score(idealState);
console.log('Ideal Play Total Score:', idealScore.totalScore, 'Outcome:', idealScore.outcomeType);
assert(idealScore.totalScore >= 90, 'Ideal play produces high total score >= 90');
assert(idealScore.outcomeType === 'strong', 'Ideal play outcome is strong');
assert(idealScore.breakdown.immediateResponseScore === 30, 'Immediate response score is max 30');
assert(idealScore.breakdown.rcaScore === 40, 'RCA score is max 40');
assert(idealScore.breakdown.preventionScore === 30, 'Prevention score is max 30');
assert(idealScore.scheduleScore >= 85, 'Schedule score is protected (>= 85)');
assert(idealScore.riskScore >= 85, 'Risk score is strong (>= 85)');
assert(idealScore.governanceScore >= 85, 'Governance score is high (>= 85)');
assert(idealScore.efficiencyScore >= 85, 'Efficiency score is high (>= 85)');
assert(idealScore.keyTakeaway.includes('hotfix restores the service'), 'Key takeaway matches specification');

// Test Case 2: Premature Closure Trap (Card D before Card C in Activity 1)
const prematureClosureState: Chapter7State = {
  ...idealState,
  activity1Order: ['confirm_scope', 'deploy_hotfix', 'close_prematurely', 'verify_access'],
  activity1Attempts: 1,
};
const prematureScore = computeChapter7Score(prematureClosureState);
console.log('Premature Closure Total Score:', prematureScore.totalScore, 'Risk Score:', prematureScore.riskScore);
assert(prematureScore.breakdown.immediateResponseScore < idealScore.breakdown.immediateResponseScore, 'Immediate response score penalized for premature closure');
assert(prematureScore.riskScore < idealScore.riskScore, 'Risk score penalized for closing before verification');

// Test Case 3: Capacity Workaround Shortcut (Selecting "Increase Servers" instead of root cause fix)
const workaroundState: Chapter7State = {
  ...idealState,
  activity3Selected: [
    'continuous_memory_monitoring',
    'alert_thresholds',
    'increase_number_of_servers',
    'service_health_checks',
  ],
  activity3PriorityOrder: [
    'increase_number_of_servers',
    'continuous_memory_monitoring',
    'alert_thresholds',
    'service_health_checks',
  ],
};
const workaroundScore = computeChapter7Score(workaroundState);
console.log('Workaround Play Prevention Score:', workaroundScore.breakdown.preventionScore);
assert(workaroundScore.breakdown.preventionScore < idealScore.breakdown.preventionScore, 'Prevention score penalized for selecting capacity workaround');
assert(workaroundScore.governanceScore < idealScore.governanceScore, 'Governance score penalized for capacity bloat');

// Test Case 4: Multiple Retries / Correction Penalty
const retryState: Chapter7State = {
  ...idealState,
  activity1Attempts: 4,
  activity2Attempts: 4,
  activity3Attempts: 3,
};
const retryScore = computeChapter7Score(retryState);
console.log('Retry Play Total Score:', retryScore.totalScore);
assert(retryScore.totalScore < idealScore.totalScore, 'Total score reflects retries rather than blind full marks');

console.log('--- All Chapter 7 Evaluation Tests Passed Successfully! ---');
