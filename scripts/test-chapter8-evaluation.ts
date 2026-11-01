import {
  evaluateEvidenceVerification,
  evaluateDeliveryStatus,
  evaluateOperationalHandover,
  evaluateFinalPackage,
  computeChapter8Score,
  INITIAL_CHAPTER8_STATE,
  DELIVERABLE_CLAIMS,
  EVIDENCE_DOCUMENTS,
  DELIVERY_STATUS_ITEMS,
  HANDOVER_ITEMS,
} from '../src/data/chapter8Data';
import type { Chapter8State } from '../src/types/chapter8';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('--- Testing Chapter 8: Production Stabilisation & Handover Evaluation Engine ---');

// ── TEST SUITE 1: Evidence Verification Evaluation ──
console.log('\n[Suite 1] Evidence Verification Tests');

// 1.1 Incomplete matches
const emptyMatches: Record<string, string | null> = {};
DELIVERABLE_CLAIMS.forEach((c) => {
  emptyMatches[c.id] = null;
});
const emptyEval = evaluateEvidenceVerification(emptyMatches);
assert(!emptyEval.isComplete, 'Empty evidence matches should fail verification');
assert(emptyEval.matchedCount === 0, 'Empty evidence matched count is 0');

// 1.2 Perfect matches
const perfectMatches: Record<string, string | null> = {};
DELIVERABLE_CLAIMS.forEach((c) => {
  perfectMatches[c.id] = c.expectedEvidenceId;
});
const perfectEval = evaluateEvidenceVerification(perfectMatches);
assert(perfectEval.isComplete, '10/10 correct matches succeeds verification');
assert(perfectEval.matchedCount === 10, '10 claims correctly matched');
assert(perfectEval.correctCount === 10, '10 claims verified correct');

// 1.3 Mismatched evidence
const mismatchedMatches = { ...perfectMatches };
mismatchedMatches['claim_performance_tested'] = 'tech_cto_approval';
mismatchedMatches['claim_tech_approvals_recorded'] = 'concurrency_stress_report';
const mismatchEval = evaluateEvidenceVerification(mismatchedMatches);
assert(!mismatchEval.isComplete, 'Swapped performance/approval records fails verification');
assert(mismatchEval.feedback.includes('performance test report') || mismatchEval.feedback.includes('approval'), 'Feedback explains nuance');

// ── TEST SUITE 2: Delivery Status Classification Tests ──
console.log('\n[Suite 2] Delivery Status Classification Tests');

// 2.1 Perfect classifications
const perfectClassifications: Record<string, any> = {
  item_scope: 'completed_verified',
  item_pilot: 'completed_verified',
  item_stress: 'completed_verified',
  item_cr: 'deferred_phase_2',
  item_incident: 'completed_verified',
  item_client_accept: 'completed_awaiting_approval',
  item_handover: 'unresolved_requires_action',
};
const classEval = evaluateDeliveryStatus(perfectClassifications);
assert(classEval.isComplete, 'Accurate governance classification succeeds');
assert(classEval.correctCount === 7, 'All 7 items correctly classified');

// 2.2 Mistake: marking client acceptance as already verified
const prematureAcceptance = { ...perfectClassifications, item_client_accept: 'completed_verified' } as any;
const prematureEval = evaluateDeliveryStatus(prematureAcceptance);
assert(!prematureEval.isComplete, 'Premature client acceptance fails classification');
assert(prematureEval.feedback.includes('acceptance'), 'Feedback explains stakeholder approval separation');

// 2.3 Mistake: marking deferred scope as unresolved defect
const misclassifiedCR = { ...perfectClassifications, item_cr: 'unresolved_requires_action' } as any;
const misclassifiedCREval = evaluateDeliveryStatus(misclassifiedCR);
assert(!misclassifiedCREval.isComplete, 'Misclassifying deferred CR as unresolved defect fails');
assert(misclassifiedCREval.feedback.includes('deferred'), 'Feedback explains deferred scope governance');

// ── TEST SUITE 3: Operational Handover Tests ──
console.log('\n[Suite 3] Operational Handover Tests');

// 3.1 Incomplete selection
const partialHandover = ['mon_memory_util', 'mon_thresholds'];
const partialHandoverEval = evaluateOperationalHandover(partialHandover as any);
assert(!partialHandoverEval.isComplete, 'Partial handover selection fails');

// 3.2 Complete selection (all 16 items)
const allHandover = HANDOVER_ITEMS.map((i) => i.id);
const allHandoverEval = evaluateOperationalHandover(allHandover);
assert(allHandoverEval.isComplete, 'Complete operational handover succeeds');
assert(allHandoverEval.selectedCount === 16, 'All 16 handover runbooks selected');

// ── TEST SUITE 4: Final Delivery Package Validation Tests ──
console.log('\n[Suite 4] Final Package Validation Tests');

const incompleteState: Chapter8State = {
  ...INITIAL_CHAPTER8_STATE,
  evidenceValidated: true,
  classificationValidated: false,
  handoverValidated: false,
};
const incompletePackageVal = evaluateFinalPackage(incompleteState);
assert(!incompletePackageVal.isReady, 'Incomplete package is flagged as not ready');
assert(incompletePackageVal.missingItems.length > 0, 'Incomplete package identifies missing items');

// ── TEST SUITE 5: Full Scoring Engine Tests ──
console.log('\n[Suite 5] Full Scoring Engine Tests');

const idealState: Chapter8State = {
  ...INITIAL_CHAPTER8_STATE,
  evidenceMatches: perfectMatches as any,
  evidenceAttempts: 1,
  evidenceValidated: true,

  itemClassifications: perfectClassifications,
  classificationAttempts: 1,
  classificationValidated: true,

  selectedHandoverItems: allHandover,
  handoverAttempts: 1,
  handoverValidated: true,

  deliveryExecutiveSummary:
    'Phase 1 of Project Amigo delivers core Attendance, Appraisal, and Leave management capabilities for ICICI Bank (~80,000 employees). Following rigorous CUG pilot validation, 30,000-user concurrency stress testing, and verified recovery of the Attendance Sync microservice, all agreed Phase 1 deliverables are verified. The Dynamic Bonus Calculator is formally documented as deferred to Phase 2. Operational monitoring and escalation runbooks have been transferred to Application Support and Engineering Operations.',
  packageSubmitted: true,
  marcusTechnicalApproved: true,
  sophiaClientAccepted: true,
  aaravClosureConfirmed: true,
  finalProjectDashboardShown: true,
  completed: true,
};

const idealScore = computeChapter8Score(idealState);
console.log('Ideal Play Total Score:', idealScore.totalScore, 'Outcome:', idealScore.outcomeType);
assert(idealScore.totalScore >= 95, 'Ideal play yields total score >= 95');
assert(idealScore.outcomeType === 'strong', 'Outcome type is strong');
assert(idealScore.breakdown.evidenceScore === 25, 'Evidence subscore is max 25');
assert(idealScore.breakdown.statusScore === 25, 'Status subscore is max 25');
assert(idealScore.breakdown.handoverScore === 25, 'Handover subscore is max 25');
assert(idealScore.breakdown.packageScore === 25, 'Package subscore is max 25');
assert(idealScore.governanceScore >= 95, 'Delivery Governance score >= 95');
assert(idealScore.riskScore >= 90, 'Trust & Risk Management score >= 90');
assert(idealScore.efficiencyScore >= 90, 'Team Efficiency score >= 90');
assert(idealScore.scheduleScore >= 90, 'Schedule / Timeline score >= 90');

console.log('\n🎉 ALL 18 CHAPTER 8 EVALUATION TESTS PASSED PERFECTLY!\n');
