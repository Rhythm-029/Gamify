/**
 * test-chapter8-evaluation.ts
 * Evaluation & regression test suite for Chapter 8: Security Attacks, Policies & Compliance Acts
 */

import {
  CHAPTER8_TITLE,
  CHAPTER8_SUBTITLE,
  CHAPTER8_USP,
  CHAPTER8_KEY_TAKEAWAY,
  CHAPTER8_CHARACTERS,
  CISO_EXACT_ALERT,
  SCENE_8_1_DIALOGUE,
  CHAPTER8_DECISIONS,
  THREAT_TYPE_OPTIONS,
  TARGET_SYSTEM_OPTIONS,
  TRAFFIC_SOURCE_OPTIONS,
  SECURITY_AUTHORITY_OPTIONS,
  SECURITY_CONTROLS_SPEC,
  READINESS_CHECKLIST_ITEMS,
  CLOSING_SEQUENCE_CONFIRMATIONS,
  evaluateThreatInvestigation,
  evaluateSecurityControls,
  evaluateReadinessValidation,
  computeChapter8Score,
  INITIAL_CHAPTER8_STATE,
} from '../src/data/chapter8Data';
import type { Chapter8State } from '../src/types/chapter8';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('--- Testing Chapter 8: Security Attacks, Policies & Compliance Acts ---\n');

// ── TEST SUITE 1: Scene & Dialogue Alignment ──
console.log('[Suite 1] Scene & Dialogue Alignment');

// 1.1 Exact CISO Dialogue
assert(
  CISO_EXACT_ALERT ===
    'Jane, we are seeing anomalous bot traffic slamming your new login portal. Under bank cybersecurity policies and IT acts, you must immediately enforce multi-factor authentication (MFA) rate-limiting or face portal suspension.',
  'CISO dialogue matches exact script verbatim'
);

// 1.2 Characters restricted to Jane, Alex, Bank CISO
const charKeys = Object.keys(CHAPTER8_CHARACTERS);
assert(charKeys.length === 3, 'Only 3 characters in Chapter 8');
assert(charKeys.includes('ciso'), 'Bank CISO character present');
assert(charKeys.includes('alex'), 'Alex character present');
assert(charKeys.includes('jane'), 'Jane character present');
assert(
  !charKeys.includes('aarav') &&
    !charKeys.includes('marcus') &&
    !charKeys.includes('sophia') &&
    !charKeys.includes('martha'),
  'No extraneous characters (Aarav, Marcus, Sophia, Martha) in scene'
);

// 1.3 Key Takeaway matches prompt
assert(
  CHAPTER8_KEY_TAKEAWAY ===
    'Institutional cybersecurity compliance is non-negotiable. Swift threat defense prevents portal suspension and preserves enterprise trust.',
  'Key Takeaway matches prompt verbatim'
);

// ── TEST SUITE 2: Decision Screen & Exact Score Impacts ──
console.log('\n[Suite 2] Decision Screen & Exact Score Impacts');

const choiceA = CHAPTER8_DECISIONS.choice_a;
const choiceB = CHAPTER8_DECISIONS.choice_b;

// 2.1 Decision texts
assert(
  choiceA.text === 'Ignore the CISO warning to avoid slowing down user login speeds.',
  'Choice A text matches prompt'
);
assert(
  choiceB.text ===
    'Immediately implement Web Application Firewall (WAF) bot mitigation rules and enforce strict MFA rate-limiting in compliance with bank security policies.',
  'Choice B text matches prompt'
);

// 2.2 Choice A score impact: Trust & Risk: -50, Delivery Governance: -40
assert(
  choiceA.scoreImpact.riskScore === -50,
  'Choice A applies exactly -50 Trust & Risk Management'
);
assert(
  choiceA.scoreImpact.governanceScore === -40,
  'Choice A applies exactly -40 Delivery Governance'
);

// 2.3 Choice B score impact: Trust & Risk: +30, Delivery Governance: +30
assert(
  choiceB.scoreImpact.riskScore === 30,
  'Choice B applies exactly +30 Trust & Risk Management'
);
assert(
  choiceB.scoreImpact.governanceScore === 30,
  'Choice B applies exactly +30 Delivery Governance'
);

// ── TEST SUITE 3: Activity 1 Threat Investigation ──
console.log('\n[Suite 3] Activity 1 Threat Investigation Tests');

// 3.1 Incomplete selection
const incompleteInvest = evaluateThreatInvestigation(null, null, null, null);
assert(!incompleteInvest.isComplete, 'Empty investigation fails completion');
assert(incompleteInvest.score === 0, 'Empty investigation yields 0 pts');

// 3.2 Incorrect classification (e.g., ordinary failures instead of credential stuffing)
const incorrectInvest = evaluateThreatInvestigation(
  'ordinary_login_failures',
  'employee_login_gateway',
  'anomalous_bot_traffic',
  'bank_ciso'
);
assert(!incorrectInvest.isComplete, 'Incorrect threat type fails completion');
assert(incorrectInvest.feedback.includes('credential stuffing'), 'Feedback guides on credential stuffing');

// 3.3 Perfect classification
const perfectInvest = evaluateThreatInvestigation(
  'credential_stuffing',
  'employee_login_gateway',
  'anomalous_bot_traffic',
  'bank_ciso'
);
assert(perfectInvest.isComplete, 'Accurate threat classification succeeds');
assert(perfectInvest.score === 25, 'Perfect threat investigation awards 25 pts');

// ── TEST SUITE 4: Activity 2 Security Controls Configuration ──
console.log('\n[Suite 4] Activity 2 Security Controls Configuration Tests');

// 4.1 Neither enabled
const neitherControls = evaluateSecurityControls(false, false);
assert(!neitherControls.isComplete, 'Neither control enabled fails');
assert(neitherControls.score === 0, 'Score is 0 when controls missing');

// 4.2 Only WAF enabled (missing MFA)
const wafOnly = evaluateSecurityControls(true, false);
assert(!wafOnly.isComplete, 'WAF alone fails (MFA rate-limiting is mandatory)');
assert(wafOnly.wafScore === 25, 'WAF subscore awarded 25 pts');
assert(wafOnly.mfaScore === 0, 'MFA subscore is 0 pts');
assert(wafOnly.feedback.includes('MFA rate-limiting'), 'Feedback indicates missing MFA rate-limiting');

// 4.3 Only MFA enabled (missing WAF)
const mfaOnly = evaluateSecurityControls(false, true);
assert(!mfaOnly.isComplete, 'MFA alone fails (WAF bot mitigation is mandatory)');
assert(mfaOnly.wafScore === 0, 'WAF subscore is 0 pts');
assert(mfaOnly.mfaScore === 25, 'MFA subscore awarded 25 pts');
assert(mfaOnly.feedback.includes('WAF bot mitigation'), 'Feedback indicates missing WAF bot mitigation');

// 4.4 Both enabled
const bothControls = evaluateSecurityControls(true, true);
assert(bothControls.isComplete, 'Both mandatory controls active succeeds');
assert(bothControls.score === 50, 'Both controls configured awards full 50 pts (25 WAF + 25 MFA)');

// ── TEST SUITE 5: Activity 3 Security Readiness Validation ──
console.log('\n[Suite 5] Activity 3 Security Readiness Validation Tests');

// 5.1 Validation cannot succeed if controls from Activity 2 are missing
const incompleteControlsChecklist = evaluateReadinessValidation(
  {
    wafMitigationConfirmed: true,
    mfaRateLimitingConfirmed: true,
    legitimateAccessPreserved: true,
    responseDocumentedForCiso: true,
  },
  false, // WAF not enabled
  true
);
assert(!incompleteControlsChecklist.isComplete, 'Validation fails if Activity 2 controls missing');
assert(incompleteControlsChecklist.score === 0, 'Score is 0 when prerequisites unconfigured');

// 5.2 Partial checklist fails
const partialChecklist = evaluateReadinessValidation(
  {
    wafMitigationConfirmed: true,
    mfaRateLimitingConfirmed: true,
    legitimateAccessPreserved: false,
    responseDocumentedForCiso: false,
  },
  true,
  true
);
assert(!partialChecklist.isComplete, 'Partial checklist fails validation');
assert(partialChecklist.feedback.includes('incomplete'), 'Feedback guides checklist completion');

// 5.3 Complete checklist succeeds
const completeChecklist = evaluateReadinessValidation(
  {
    wafMitigationConfirmed: true,
    mfaRateLimitingConfirmed: true,
    legitimateAccessPreserved: true,
    responseDocumentedForCiso: true,
  },
  true,
  true
);
assert(completeChecklist.isComplete, 'All 4 checklist items verified succeeds');
assert(completeChecklist.score === 25, 'Full readiness validation awards 25 pts');

// ── TEST SUITE 6: Full Scoring Engine & Persistence ──
console.log('\n[Suite 6] Full Scoring Engine & Bounds Clamping Tests');

// 6.1 Choice A run (Penalized)
const stateChoiceA: Chapter8State = {
  ...INITIAL_CHAPTER8_STATE,
  selectedDecision: 'choice_a',
  decisionScoreApplied: true,
  selectedThreatType: 'credential_stuffing',
  selectedTargetSystem: 'employee_login_gateway',
  selectedTrafficSource: 'anomalous_bot_traffic',
  selectedSecurityAuthority: 'bank_ciso',
  wafBotMitigationEnabled: false,
  mfaRateLimitingEnforced: false,
  completed: true,
};
const scoreA = computeChapter8Score(stateChoiceA);
assert(scoreA.riskScore < 50, 'Choice A results in severe risk penalty');
assert(scoreA.governanceScore < 50, 'Choice A results in severe governance penalty');
assert(scoreA.outcomeType === 'incomplete', 'Choice A outcome is incomplete/policy breach');

// 6.2 Choice B perfect run
const stateChoiceB: Chapter8State = {
  ...INITIAL_CHAPTER8_STATE,
  selectedDecision: 'choice_b',
  decisionScoreApplied: true,
  selectedThreatType: 'credential_stuffing',
  selectedTargetSystem: 'employee_login_gateway',
  selectedTrafficSource: 'anomalous_bot_traffic',
  selectedSecurityAuthority: 'bank_ciso',
  investigationValidated: true,
  wafBotMitigationEnabled: true,
  mfaRateLimitingEnforced: true,
  controlsValidated: true,
  readinessChecklist: {
    wafMitigationConfirmed: true,
    mfaRateLimitingConfirmed: true,
    legitimateAccessPreserved: true,
    responseDocumentedForCiso: true,
  },
  validationCompleted: true,
  closingConfirmed: true,
  completed: true,
};
const scoreB = computeChapter8Score(stateChoiceB);
assert(scoreB.totalScore === 100, 'Full compliant play yields total score of 100');
assert(scoreB.outcomeType === 'strong', 'Outcome type is strong');
assert(scoreB.breakdown.investigationScore === 25, 'Investigation subscore is 25');
assert(scoreB.breakdown.controlsScore === 50, 'Controls subscore is 50');
assert(scoreB.breakdown.validationScore === 25, 'Validation subscore is 25');
assert(scoreB.riskScore === 100, 'Trust & Risk score boosted to 100 (clamped)');
assert(scoreB.governanceScore === 100, 'Delivery Governance score boosted to 100 (clamped)');
assert(scoreB.scheduleScore <= 100 && scoreB.scheduleScore >= 0, 'Schedule score within [0, 100]');
assert(scoreB.efficiencyScore <= 100 && scoreB.efficiencyScore >= 0, 'Efficiency score within [0, 100]');

// 6.3 Idempotency
const scoreBRepeat = computeChapter8Score(stateChoiceB);
assert(scoreBRepeat.totalScore === scoreB.totalScore, 'Re-evaluating score is idempotent');
assert(scoreBRepeat.riskScore === scoreB.riskScore, 'Risk score is idempotent');
assert(scoreBRepeat.governanceScore === scoreB.governanceScore, 'Governance score is idempotent');

// ── TEST SUITE 7: Closing Confirmations ──
console.log('\n[Suite 7] Closing Sequence Verification');
assert(CLOSING_SEQUENCE_CONFIRMATIONS.length === 3, 'Closing sequence has 3 stakeholder confirmations');
assert(
  CLOSING_SEQUENCE_CONFIRMATIONS[0].text.includes('WAF bot mitigation rules are deployed') &&
    CLOSING_SEQUENCE_CONFIRMATIONS[0].text.includes('MFA rate-limiting is fully enforced'),
  'Alex confirms WAF & MFA technical enforcement'
);
assert(
  CLOSING_SEQUENCE_CONFIRMATIONS[1].text.includes('documented and submitted directly to the Bank SOC Liaison'),
  'Jane confirms security response documented for CISO'
);
assert(
  CLOSING_SEQUENCE_CONFIRMATIONS[2].text.includes('Portal suspension is averted'),
  'Bank CISO confirms portal suspension averted'
);

// ── TEST SUITE 8: CISO Closing Confirmation Gating & Re-entry Safety ──
console.log('\n[Suite 8] CISO Closing Confirmation Gating & Re-entry Verification');

// 8.1 Closing confirmation BLOCKED if WAF control is missing
const missingWafValidation = evaluateReadinessValidation(
  {
    wafMitigationConfirmed: true,
    mfaRateLimitingConfirmed: true,
    legitimateAccessPreserved: true,
    responseDocumentedForCiso: true,
  },
  false, // WAF missing
  true
);
assert(!missingWafValidation.isComplete, 'CISO closing confirmation strictly BLOCKED when WAF is missing');

// 8.2 Closing confirmation BLOCKED if MFA rate-limiting is missing
const missingMfaValidation = evaluateReadinessValidation(
  {
    wafMitigationConfirmed: true,
    mfaRateLimitingConfirmed: true,
    legitimateAccessPreserved: true,
    responseDocumentedForCiso: true,
  },
  true,
  false // MFA missing
);
assert(!missingMfaValidation.isComplete, 'CISO closing confirmation strictly BLOCKED when MFA is missing');

// 8.3 Closing confirmation BLOCKED if any checklist item is unchecked
const missingChecklistValidation = evaluateReadinessValidation(
  {
    wafMitigationConfirmed: true,
    mfaRateLimitingConfirmed: true,
    legitimateAccessPreserved: true,
    responseDocumentedForCiso: false, // Documentation missing
  },
  true,
  true
);
assert(!missingChecklistValidation.isComplete, 'CISO closing confirmation strictly BLOCKED when checklist is incomplete');

// 8.4 Closing confirmation ALLOWED only when both controls enabled AND all 4 checks verified
const permittedValidation = evaluateReadinessValidation(
  {
    wafMitigationConfirmed: true,
    mfaRateLimitingConfirmed: true,
    legitimateAccessPreserved: true,
    responseDocumentedForCiso: true,
  },
  true,
  true
);
assert(permittedValidation.isComplete, 'CISO closing confirmation ALLOWED when all controls & checklist pass');

// 8.5 Re-visiting Chapter 8 multiple times produces zero score inflation
let simulatedSession = { ...stateChoiceB };
const baselineScore = computeChapter8Score(simulatedSession).totalScore;
for (let visit = 1; visit <= 10; visit++) {
  const visitScore = computeChapter8Score(simulatedSession).totalScore;
  assert(visitScore === baselineScore, `Re-visiting Chapter 8 (visit ${visit}) yields identical score (${baselineScore})`);
}

console.log('\n🎉 ALL 30 CHAPTER 8 TESTS PASSED PERFECTLY!\n');
