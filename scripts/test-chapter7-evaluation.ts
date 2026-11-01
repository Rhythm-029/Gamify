import {
  computeChapter7Score,
  INITIAL_CHAPTER7_STATE,
  CHAPTER7_DECISION_CHOICES,
  CHAPTER7_LEARNING_TAKEAWAY,
} from '../src/data/chapter7Data';
import type { Chapter7State } from '../src/types/chapter7';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('--- Testing Revised Chapter 7: Production Issues & Root Cause Analysis (RCA) ---');

// Test Suite 1: Decision Screen Impacts (Choice A vs Choice B)
console.log('\n[Suite 1: Decision Screen Impacts]');
const baseState: Chapter7State = {
  ...INITIAL_CHAPTER7_STATE,
};
const baseScore = computeChapter7Score(baseState);

// Choice A: Push hotfix silently without incident ticket or RCA
const choiceAState: Chapter7State = {
  ...INITIAL_CHAPTER7_STATE,
  decisionChoice: 'choice_a',
  decisionSubmitted: true,
};
const choiceAScore = computeChapter7Score(choiceAState);

console.log('Base Governance:', baseScore.governanceScore, '-> Choice A Governance:', choiceAScore.governanceScore);
console.log('Base Risk:', baseScore.riskScore, '-> Choice A Risk:', choiceAScore.riskScore);

assert(
  choiceAScore.governanceScore - baseScore.governanceScore === -30,
  'Choice A applies exactly -30 Delivery Governance'
);
assert(
  choiceAScore.riskScore - baseScore.riskScore === -25,
  'Choice A applies exactly -25 Trust & Risk Management'
);
assert(
  choiceAScore.efficiencyScore === baseScore.efficiencyScore,
  'Choice A applies no change to Team Efficiency & Velocity'
);

// Choice B: Deploy hotfix patch, publish comprehensive RCA, update automated monitoring thresholds
const choiceBState: Chapter7State = {
  ...INITIAL_CHAPTER7_STATE,
  decisionChoice: 'choice_b',
  decisionSubmitted: true,
};
const choiceBScore = computeChapter7Score(choiceBState);

console.log('Base Governance:', baseScore.governanceScore, '-> Choice B Governance:', choiceBScore.governanceScore);
console.log('Base Risk:', baseScore.riskScore, '-> Choice B Risk:', choiceBScore.riskScore);
console.log('Base Efficiency:', baseScore.efficiencyScore, '-> Choice B Efficiency:', choiceBScore.efficiencyScore);

assert(
  choiceBScore.governanceScore - baseScore.governanceScore === 25,
  'Choice B applies exactly +25 Delivery Governance'
);
assert(
  choiceBScore.riskScore - baseScore.riskScore === 20,
  'Choice B applies exactly +20 Trust & Risk Management'
);
assert(
  choiceBScore.efficiencyScore - baseScore.efficiencyScore === 15,
  'Choice B applies exactly +15 Team Efficiency & Velocity'
);

// Test Suite 2: Full Ideal Play with Choice B and 3 Activities
console.log('\n[Suite 2: Full Recommended Play (Choice B + 3 Activities)]');
const idealState: Chapter7State = {
  ...INITIAL_CHAPTER7_STATE,
  decisionChoice: 'choice_b',
  decisionSubmitted: true,

  // Activity 1: Confirm scope -> Deploy hotfix -> Verify sync -> Confirm recovery
  activity1Order: ['confirm_scope', 'deploy_hotfix', 'verify_sync', 'confirm_recovery'],
  activity1Attempts: 1,
  activity1Submitted: true,
  activity1Completed: true,

  // Activity 2: All 4 correct RCA fields + published
  activity2Answers: {
    incident: 'inc_opt_a',
    rootCause: 'rc_opt_a',
    impact: 'imp_opt_a',
    prevention: 'prev_opt_a',
  },
  activity2Attempts: 1,
  activity2Submitted: true,
  activity2Completed: true,
  rcaPublished: true,

  // Activity 3: All 4 appropriate controls with continuous monitoring prioritized
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

  // Confirmations
  incidentStatus: 'resolved',
  alexHotfixConfirmed: true,
  marthaMonitoringConfirmed: true,
  janeClosureConfirmed: true,
  completed: true,
};

const idealScore = computeChapter7Score(idealState);
console.log('Ideal Play Total Score:', idealScore.totalScore, 'Outcome:', idealScore.outcomeType);
assert(idealScore.totalScore >= 95, 'Ideal play produces high total score >= 95');
assert(idealScore.outcomeType === 'strong', 'Ideal play outcome is strong');
assert(idealScore.breakdown.immediateResponseScore === 30, 'Immediate response score is max 30');
assert(idealScore.breakdown.rcaScore === 40, 'RCA score is max 40');
assert(idealScore.breakdown.preventionScore === 30, 'Prevention score is max 30');
assert(idealScore.governanceScore === 100, 'Governance score reaches 100 with Choice B + RCA + Prevention');
assert(idealScore.riskScore === 100, 'Risk score reaches 100 with Choice B + Verified Recovery');
assert(idealScore.efficiencyScore === 100, 'Efficiency score reaches 100 with Choice B + Prevention');
assert(idealScore.scheduleScore === 100, 'Schedule score is protected on first attempt');
assert(
  idealScore.keyTakeaway === CHAPTER7_LEARNING_TAKEAWAY,
  'Key takeaway exactly matches mandated script'
);

// Test Suite 3: Premature Closure Trap in Activity 1
console.log('\n[Suite 3: Activity 1 Premature Closure]');
const prematureState: Chapter7State = {
  ...idealState,
  activity1Order: ['confirm_scope', 'deploy_hotfix', 'confirm_recovery', 'verify_sync'],
  activity1Attempts: 1,
};
const prematureScore = computeChapter7Score(prematureState);
assert(
  prematureScore.breakdown.immediateResponseScore < idealScore.breakdown.immediateResponseScore,
  'Immediate response penalized when confirming recovery before user verification'
);
assert(
  prematureScore.riskScore < idealScore.riskScore,
  'Risk score penalized when closing incident before verification'
);

// Test Suite 4: Capacity Workaround Trap in Activity 3
console.log('\n[Suite 4: Activity 3 Server Scaling Trap]');
const serverWorkaroundState: Chapter7State = {
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
const serverWorkaroundScore = computeChapter7Score(serverWorkaroundState);
assert(
  serverWorkaroundScore.breakdown.preventionScore < idealScore.breakdown.preventionScore,
  'Prevention score penalized for selecting server capacity workaround instead of root cause fix'
);

// Test Suite 5: Idempotency & Re-entry Safety (No Duplicate Points)
console.log('\n[Suite 5: Idempotency & Re-entry Safety]');
const scoreRun1 = computeChapter7Score(idealState);
const scoreRun2 = computeChapter7Score(idealState);
assert(
  scoreRun1.totalScore === scoreRun2.totalScore &&
  scoreRun1.governanceScore === scoreRun2.governanceScore &&
  scoreRun1.riskScore === scoreRun2.riskScore &&
  scoreRun1.efficiencyScore === scoreRun2.efficiencyScore &&
  scoreRun1.scheduleScore === scoreRun2.scheduleScore,
  'Re-evaluating or re-entering Chapter 7 produces identical scores (no duplicate point accumulation)'
);

// Test Suite 6: Score Clamping & Bounds ([0, 100])
console.log('\n[Suite 6: Score Clamping & Bounds]');
const worstCaseState: Chapter7State = {
  ...INITIAL_CHAPTER7_STATE,
  decisionChoice: 'choice_a',
  decisionSubmitted: true,
  activity1Order: ['confirm_recovery', 'verify_sync', 'deploy_hotfix', 'confirm_scope'],
  activity1Attempts: 10,
  activity2Answers: { incident: null, rootCause: null, impact: null, prevention: null },
  activity2Attempts: 10,
  activity3Selected: ['increase_number_of_servers', 'ignore_monitoring_hotfix'],
  activity3Attempts: 10,
};
const worstCaseScore = computeChapter7Score(worstCaseState);
assert(worstCaseScore.totalScore >= 0 && worstCaseScore.totalScore <= 100, 'Worst case total score bounded in [0, 100]');
assert(worstCaseScore.governanceScore >= 0 && worstCaseScore.governanceScore <= 100, 'Worst case governance bounded in [0, 100]');
assert(worstCaseScore.riskScore >= 0 && worstCaseScore.riskScore <= 100, 'Worst case risk bounded in [0, 100]');
assert(worstCaseScore.efficiencyScore >= 0 && worstCaseScore.efficiencyScore <= 100, 'Worst case efficiency bounded in [0, 100]');
assert(worstCaseScore.scheduleScore >= 0 && worstCaseScore.scheduleScore <= 100, 'Worst case schedule bounded in [0, 100]');

assert(idealScore.totalScore <= 100, 'Ideal score does not exceed 100');
assert(idealScore.governanceScore <= 100, 'Governance score does not exceed 100');
assert(idealScore.riskScore <= 100, 'Risk score does not exceed 100');
assert(idealScore.efficiencyScore <= 100, 'Efficiency score does not exceed 100');
assert(idealScore.scheduleScore <= 100, 'Schedule score does not exceed 100');

console.log('\n--- All Chapter 7 Evaluation & Script Verification Tests Passed Successfully! ---');
