export type Chapter4ReleasePhase = 'phase_1' | 'phase_2' | 'unscheduled';

export type Chapter4ScheduleAssessment =
  | 'confirmed_feasible'       // Premature commitment (Risky)
  | 'needs_validation'         // Feasibility needs validation (Recommended baseline)
  | 'not_feasible_current';    // Not feasible for current release (Defensible if reasoned)

export type Chapter4TechnicalDependency =
  | 'dep_regional_rules'       // Confirm the regional bonus calculation rules (Valid)
  | 'dep_payroll_integration'  // Validate whether payroll integration is required (Valid)
  | 'dep_effort_estimate'      // Ask development to estimate implementation effort (Valid)
  | 'dep_immediate_start'      // Begin implementation immediately and resolve dependencies later (Invalid)
  | 'dep_assume_api';          // Assume existing Appraisal API supports everything required (Invalid)

export type Chapter4SecurityAssessment =
  | 'review_access_controls'   // Review access controls and security requirements before implementation (Valid)
  | 'allow_all_hr_users'       // Allow all HR users to access the feature and review permissions later (Invalid)
  | 'reuse_existing'           // Reuse existing permissions without checking whether they are sufficient (Invalid)
  | 'confirm_approvals';       // Confirm the required approvals and data-access rules with appropriate stakeholders (Valid)

export type Chapter4BusinessValueAssessment =
  | 'reject_outright'          // Reject it because the project already has a deadline (Poor)
  | 'accept_immediately'       // Accept it immediately because the client considers it valuable (Poor)
  | 'balance_and_evaluate'     // Recognise its value and evaluate it against existing scope, effort, and dependencies (Recommended)
  | 'move_all_to_phase2';      // Move all existing Phase 1 work to Phase 2 to make room for it (Poor)

export type Chapter4ApprovalAssessment =
  | 'verbal_request_final'     // Treat Sophia's verbal request as final approval (Poor)
  | 'record_cr_and_validate'   // Record CR-017, complete technical impact assessment, obtain business & IT approvals (Recommended)
  | 'start_and_document_later' // Ask developers to start work and document the decision later (Poor)
  | 'reject_without_recording';// Reject the request without recording it (Poor)

export type Chapter4FinalRecommendation =
  | 'commit_phase1'            // A. Commit to Phase 1
  | 'defer_phase2'             // B. Defer to Phase 2
  | 'evaluate_without_compromise' // C. Keep the release commitment unchanged while evaluating CR-017 (Recommended baseline)
  | 'reject_request';          // D. Reject the request

export type Chapter4OutcomeType = 'strong' | 'mixed' | 'weak';

export interface Chapter4Scorecard {
  shown: boolean;
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  outcomeType: Chapter4OutcomeType;
  outcomeText: string;
  strongestMove: string;
  oneThingToImprove: string;
  leadershipTakeaway: string;
  explanations: {
    schedule: string;
    risk: string;
    governance: string;
    efficiency: string;
  };
}

export interface Chapter4State {
  entered: boolean;
  meetingStatus:
    | 'not_started'
    | 'calling'
    | 'connected'
    | 'sophia_speaking'
    | 'aarav_speaking'
    | 'daniel_speaking'
    | 'studio_unlocked'
    | 'concluded';

  studioAccessGranted: boolean;

  // Selected Change Request
  selectedChangeRequestId: string;
  cr017Status:
    | 'New'
    | 'Impact Assessment in Progress'
    | 'Further Assessment Required'
    | 'Assessment Incomplete';

  // Task 1: Release plan feature placement
  featurePlacement: Record<string, Chapter4ReleasePhase>;
  task1Complete: boolean;

  // Task 2: Impact Analysis assessments
  assessmentSchedule: Chapter4ScheduleAssessment | null;
  assessmentDependencies: Chapter4TechnicalDependency[];
  assessmentSecurity: Chapter4SecurityAssessment | null;
  assessmentBusinessValue: Chapter4BusinessValueAssessment | null;
  assessmentApproval: Chapter4ApprovalAssessment | null;
  task2Complete: boolean;

  // Task 3: Final Recommendation & Justification
  finalRecommendation: Chapter4FinalRecommendation | null;
  writtenJustification: string;
  task3Complete: boolean;

  // Submission & scoring status
  submitted: boolean;
  isEvaluating: boolean;
  scorecard: Chapter4Scorecard;
  completed: boolean;
  outcomeDialogueDelivered: boolean;
}
