/**
 * test-chapter12-evaluation.ts
 * Rigorous deterministic validation for Chapter 12: The Next Evolution
 */

import {
  computeChapter12Score,
  CHAPTER12_TITLE,
  CHAPTER12_SUBTITLE,
  FINAL_DECISION_OPTIONS,
  UPGRADE_MODULES,
  DEPLOYMENT_ACTIONS,
  resetChapter12SessionState,
  getChapter12SessionState,
  setChapter12SessionState,
} from '../src/data/chapter12Data';
import { CHAPTERS, resetChapterSession, resetChapterStatuses } from '../src/data/chaptersData';
import type { Chapter12State } from '../src/types/chapter12';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('--- Testing Chapter 12: The Next Evolution Evaluation Engine ---');

// 1. Verify Chapter 12 Metadata in CHAPTERS Master Data
const ch12 = CHAPTERS.find((c) => c.id === 12);
assert(Boolean(ch12), 'Chapter 12 is registered in CHAPTERS master data');
assert(ch12?.title === 'The Next Evolution', 'Chapter 12 title is "The Next Evolution"');
assert(ch12?.subtitle === 'CR Upgrade & Phase 2 Evolution', 'Chapter 12 subtitle is correct');
assert(ch12?.objectives.length === 4, 'Chapter 12 has 4 detailed objectives');

// 2. Verify Session Reset Helpers
resetChapter12SessionState();
const freshState = getChapter12SessionState();
assert(freshState.currentStage === 'status_briefing', 'Fresh state starts at status_briefing');
assert(!freshState.completed, 'Fresh state completed is false');

// 3. Test Case 1: Ideal Play (All 3 interactive activities completed + Choice B Recommended)
const idealState: Chapter12State = {
  ...freshState,
  statusModalSeen: true,
  meetingInitiated: true,
  meetingIntroCompleted: true,
  controlCenterOpened: true,
  selectedTab: 'deployment_validation',
  scopeAssignments: {
    lms: 'new_functionality',
    visiting_cards: 'new_functionality',
    ai_chatbot: 'new_functionality',
    framework_upgrade: 'core_platform_upgrade',
  },
  scopeCompleted: true,
  featureFlags: {
    lms: 25,
    visiting_cards: 5,
    ai_chatbot: 0,
  },
  frameworkConfigured: true,
  releaseStrategyCompleted: true,
  deploymentSlots: ['action_a', 'action_b', 'action_c', 'action_d'],
  greenPrepared: true,
  testsPassed: true,
  releaseValidated: true,
  trafficSwitchedToGreen: true,
  deploymentCompleted: true,
  decisionChosen: 'choice_b',
  completed: true,
};

const idealScore = computeChapter12Score(idealState);
console.log('Ideal Score:', {
  ch12Score: idealScore.totalScore,
  cumulativeScore: idealScore.cumulativeScore,
  finalGrade: idealScore.finalGrade,
  bonusPoints: idealScore.bonusPoints,
  schedule: idealScore.scheduleScore,
  risk: idealScore.riskScore,
  governance: idealScore.governanceScore,
  efficiency: idealScore.efficiencyScore,
});

assert(idealScore.bonusPoints === 15, 'Ideal play earns all +15 bonus points (5+5+5)');
assert(idealScore.breakdown.scheduleDelta === +15, 'Choice B schedule delta is exactly +15');
assert(idealScore.breakdown.riskDelta === +30, 'Choice B risk delta is exactly +30');
assert(idealScore.breakdown.governanceDelta === +30, 'Choice B governance delta is exactly +30');
assert(idealScore.breakdown.efficiencyDelta === +20, 'Choice B efficiency delta is exactly +20');
assert(idealScore.cumulativeScore >= 9400, 'Cumulative score reaches S+ threshold (>= 9400 / 10,000)');
assert(idealScore.finalGrade === 'S+', 'Final grade is S+');
assert(idealScore.finalAchievementUnlocked, 'Ultimate Transformation Director achievement unlocked');
assert(idealScore.leadershipStrengths.length === 3, 'Three leadership strengths populated');
assert(idealScore.areasToImprove.length === 2, 'Two areas to advance populated');

// 4. Test Case 2: Monolithic Choice A Decision
const monolithicState: Chapter12State = {
  ...idealState,
  decisionChosen: 'choice_a',
};

const monolithicScore = computeChapter12Score(monolithicState);
console.log('Monolithic Score:', {
  ch12Score: monolithicScore.totalScore,
  cumulativeScore: monolithicScore.cumulativeScore,
  finalGrade: monolithicScore.finalGrade,
  schedule: monolithicScore.scheduleScore,
  risk: monolithicScore.riskScore,
  governance: monolithicScore.governanceScore,
});

assert(monolithicScore.breakdown.scheduleDelta === +5, 'Choice A schedule delta is exactly +5');
assert(monolithicScore.breakdown.riskDelta === -40, 'Choice A risk delta is exactly -40');
assert(monolithicScore.breakdown.governanceDelta === -35, 'Choice A governance delta is exactly -35');
assert(monolithicScore.finalGrade !== 'S+', 'Monolithic rollout does not award S+');
assert(monolithicScore.outcomeTitle.includes('High Risk'), 'High risk title is displayed for monolithic');

// 5. Test Case 3: Upgrade Scope Categorization Rules
const lmsMod = UPGRADE_MODULES.find((m) => m.id === 'lms');
const frameworkMod = UPGRADE_MODULES.find((m) => m.id === 'framework_upgrade');
assert(lmsMod?.category === 'new_functionality', 'LMS categorized as new_functionality');
assert(frameworkMod?.category === 'core_platform_upgrade', 'Framework upgrade categorized as core_platform_upgrade');

// 6. Test Case 4: Blue-Green Sequence Correctness
const step1 = DEPLOYMENT_ACTIONS.find((a) => a.correctStep === 1);
const step2 = DEPLOYMENT_ACTIONS.find((a) => a.correctStep === 2);
const step3 = DEPLOYMENT_ACTIONS.find((a) => a.correctStep === 3);
const step4 = DEPLOYMENT_ACTIONS.find((a) => a.correctStep === 4);

assert(step1?.id === 'action_a', 'Step 1 is prepare green environment (action_a)');
assert(step2?.id === 'action_b', 'Step 2 is run tests (action_b)');
assert(step3?.id === 'action_c', 'Step 3 is validate release (action_c)');
assert(step4?.id === 'action_d', 'Step 4 is switch traffic to green after approval (action_d)');

// 7. Test Case 5: Progressive Rollout vs 100% Immediate Full Exposure
const progressivePilotState: Chapter12State = {
  ...idealState,
  featureFlags: { lms: 5, visiting_cards: 25, ai_chatbot: 50 },
};
const progressivePilotScore = computeChapter12Score(progressivePilotState);
assert(progressivePilotScore.breakdown.featureFlagBonus === 5, 'Alternative progressive config (5/25/50) earns full +5 feature flag bonus');

const fullExposureState: Chapter12State = {
  ...idealState,
  featureFlags: { lms: 100, visiting_cards: 100, ai_chatbot: 100 },
};
const fullExposureScore = computeChapter12Score(fullExposureState);
assert(fullExposureScore.breakdown.featureFlagBonus < 5, 'Immediate 100% exposure across all flags earns reduced feature flag bonus');

// 8. Test Case 6: Session Persistence Roundtrip
setChapter12SessionState(progressivePilotState);
const loadedState = getChapter12SessionState();
assert(loadedState.featureFlags.lms === 5 && loadedState.scopeCompleted, 'Session state roundtrip preserves assignments and feature flags');
resetChapterSession(12);
assert(!getChapter12SessionState().scopeCompleted, 'resetChapterSession(12) resets Chapter 12 state cleanly');
resetChapterStatuses();
assert(!getChapter12SessionState().completed, 'resetChapterStatuses() resets Chapter 12 completion');

console.log('🎉 ALL CHAPTER 12 TESTS PASSED SUCCESSFULLY!');

