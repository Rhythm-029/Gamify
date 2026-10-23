import { computeChapter5Score, INITIAL_CHAPTER5_STATE } from '../src/data/chapter5Data';
import type { Chapter5State } from '../src/types/chapter5';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('--- Testing Chapter 5: The Launch Decision Evaluation Engine ---');

// Test Case 1: Ideal / Strong Plan
// Mandatory blockers selected, prerequisites properly placed, strict pilot controls, phased expansion
const idealState: Chapter5State = {
  ...INITIAL_CHAPTER5_STATE,
  selectedBlockers: [
    'blocker_performance_load',
    'blocker_security_approval',
    'blocker_rollback_procedure',
  ],
  prePilotActivities: {
    act_peak_load: 'pre_pilot_prerequisite',
    act_security_approval: 'pre_pilot_prerequisite',
    act_monitoring_alerts: 'pre_pilot_prerequisite',
    act_rollback_approval: 'pre_pilot_prerequisite',
    act_user_comms: 'during_pilot_continuous',
  },
  latencyTarget: 'strict_800ms',
  errorRateThreshold: 'strict_0_1_percent',
  feedbackChannel: 'in_app_daily_pulse',
  incidentOwner: 'daniel_oncall_aarav_lead',
  rollbackCondition: 'sev1_or_high_error_rate',
  widerRolloutDecision: 'expand_in_stages',
};

const idealScore = computeChapter5Score(idealState);
console.log('Ideal Play Total Score:', idealScore.totalScore, 'Outcome:', idealScore.outcomeType);
assert(idealScore.totalScore >= 85, 'Ideal play produces high total score >= 85');
assert(idealScore.outcomeType === 'strong', 'Ideal play outcome is strong');
assert(idealScore.riskScore >= 80, 'Risk score is well-governed (>= 80)');
assert(idealScore.governanceScore >= 85, 'Governance score is high (>= 85)');
assert(idealScore.scheduleScore >= 75, 'Schedule score is protected (>= 75)');
assert(idealScore.efficiencyScore >= 80, 'Efficiency score is high (>= 80)');
assert(idealScore.whatYouDidWell.length > 20, 'What you did well is populated');
assert(idealScore.whatToImprove.length > 10, 'What to improve is populated');

// Test Case 2: Reckless Play — Release immediately to all 80,000 employees without pilot
const recklessState: Chapter5State = {
  ...INITIAL_CHAPTER5_STATE,
  selectedBlockers: ['distractor_immediate_general'],
  widerRolloutDecision: 'release_immediate_all',
};

const recklessScore = computeChapter5Score(recklessState);
console.log('Reckless Play Total Score:', recklessScore.totalScore, 'Outcome:', recklessScore.outcomeType);
assert(recklessScore.outcomeType === 'incomplete', 'Reckless play outcome is incomplete/poor');
assert(recklessScore.riskScore <= 35, 'Risk score is heavily penalized (<= 35)');
assert(recklessScore.governanceScore <= 35, 'Governance score is heavily penalized (<= 35)');
assert(recklessScore.totalScore < 50, 'Total score is low (< 50)');

// Test Case 3: Distractor Blocker Selected (Phase 2 Backlog) delays schedule
const distractorState: Chapter5State = {
  ...idealState,
  selectedBlockers: [
    'blocker_performance_load',
    'blocker_security_approval',
    'blocker_rollback_procedure',
    'distractor_phase2_backlog',
  ],
};

const distractorScore = computeChapter5Score(distractorState);
console.log('Distractor State Score:', distractorScore.scheduleScore);
assert(distractorScore.scheduleScore < idealScore.scheduleScore, 'Selecting Phase 2 distractor penalizes schedule');

// Test Case 4: Responsible Alternative — Extend Pilot
const extendPilotState: Chapter5State = {
  ...idealState,
  widerRolloutDecision: 'extend_pilot',
};

const extendScore = computeChapter5Score(extendPilotState);
console.log('Extend Pilot Score:', extendScore.totalScore, 'Outcome:', extendScore.outcomeType);
assert(extendScore.outcomeType === 'strong', 'Responsible pilot extension when warranted remains a strong decision');
assert(extendScore.governanceScore >= 80, 'Governance remains high for disciplined pilot extension');

// Test Case 5: Missing Security and Rollback Blockers
const missingCriticalState: Chapter5State = {
  ...idealState,
  selectedBlockers: ['blocker_performance_load'], // Missing security and rollback
};

const missingCriticalScore = computeChapter5Score(missingCriticalState);
console.log('Missing Critical Blockers Score:', missingCriticalScore.totalScore, 'Outcome:', missingCriticalScore.outcomeType);
assert(missingCriticalScore.outcomeType !== 'strong', 'Missing security and rollback cannot produce strong outcome');
assert(missingCriticalScore.riskScore < idealScore.riskScore, 'Missing security heavily drops risk score');

// Test Case 6: Score Bounds (Clamping to [10, 100])
const worstState: Chapter5State = {
  ...INITIAL_CHAPTER5_STATE,
  selectedBlockers: ['distractor_immediate_general', 'distractor_phase2_backlog'],
  latencyTarget: 'unspecified',
  errorRateThreshold: 'manual_logs_only',
  feedbackChannel: 'no_proactive_feedback',
  incidentOwner: 'unassigned_channel',
  rollbackCondition: 'complete_server_crash_only',
  widerRolloutDecision: 'release_immediate_all',
};

const worstScore = computeChapter5Score(worstState);
console.log('Worst Case Score:', worstScore.totalScore);
assert(worstScore.scheduleScore >= 10, 'Schedule clamped to >= 10');
assert(worstScore.riskScore >= 10, 'Risk clamped to >= 10');
assert(worstScore.governanceScore >= 10, 'Governance clamped to >= 10');
assert(worstScore.efficiencyScore >= 10, 'Efficiency clamped to >= 10');
assert(worstScore.totalScore <= 100 && worstScore.totalScore >= 10, 'Total score properly bounded');

console.log('🎉 ALL CHAPTER 5 EVALUATION TESTS PASSED SUCCESSFULLY!\n');
