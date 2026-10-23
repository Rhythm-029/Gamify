export type Chapter5Stage = 'review_evidence' | 'identify_blockers' | 'build_rollout_plan' | 'submitted';

export type ReadinessCardId =
  | 'functional_testing'
  | 'integration_gateway'
  | 'security_access'
  | 'performance_load'
  | 'rollback_monitoring';

export type ReadinessStatus = 'ready' | 'needs_review' | 'blocked';

export interface ReadinessEvidenceCard {
  id: ReadinessCardId;
  title: string;
  category: string;
  status: ReadinessStatus;
  evidence: string;
  implications: string;
  owner: string;
  signoffRequired: string;
}

export type LaunchBlockerId =
  | 'blocker_performance_load'      // Complete performance testing against agreed load target (Mandatory)
  | 'blocker_security_approval'      // Obtain production security and access approval (Mandatory)
  | 'blocker_rollback_procedure'     // Approve and verify rollback procedure & confirm monitoring readiness (Mandatory)
  | 'distractor_phase2_backlog'      // Complete functional testing of future Phase 2 backlog items (Distractor)
  | 'distractor_immediate_general';  // Immediately deploy to all 80,000 users without load validation (Distractor/Antipattern)

export type PrePilotActivityId =
  | 'act_peak_load'          // Complete peak-load testing (Prerequisite)
  | 'act_security_approval'  // Obtain production security and access approval (Prerequisite)
  | 'act_monitoring_alerts'  // Confirm monitoring and alert thresholds (Prerequisite)
  | 'act_rollback_approval'  // Approve and verify the rollback procedure (Prerequisite)
  | 'act_user_comms';        // Publish the user communication plan (During pilot / Comms)

export type PilotActivityStage = 'pre_pilot_prerequisite' | 'during_pilot_continuous';

export type LatencyTarget = 'strict_800ms' | 'moderate_1500ms' | 'unspecified';
export type ErrorRateThreshold = 'strict_0_1_percent' | 'lenient_1_percent' | 'manual_logs_only';
export type FeedbackChannel = 'in_app_daily_pulse' | 'email_thread_only' | 'no_proactive_feedback';
export type IncidentOwner = 'daniel_oncall_aarav_lead' | 'unassigned_channel';
export type RollbackCondition = 'sev1_or_high_error_rate' | 'complete_server_crash_only';

export type WiderRolloutDecision =
  | 'release_immediate_all'   // 1. Release to all 80,000 employees immediately (Heavy penalty)
  | 'expand_in_stages'        // 2. Expand in stages after meeting acceptance criteria and approval (Recommended)
  | 'extend_pilot';           // 3. Extend pilot if results are inconclusive or defects remain (Responsible alternative)

export type Chapter5OutcomeType = 'strong' | 'mixed' | 'incomplete';

export interface Chapter5Scorecard {
  shown: boolean;
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  outcomeType: Chapter5OutcomeType;
  outcomeText: string;
  whatYouDidWell: string;
  whatToImprove: string;
  keyTakeaway: string;
  explanations: {
    schedule: string;
    risk: string;
    governance: string;
    efficiency: string;
  };
}

export interface Chapter5State {
  // Navigation & current stage
  currentStage: Chapter5Stage;
  meetingCompleted: boolean;
  boardOpened: boolean;

  // Stage 1: Evidence cards viewed
  viewedEvidenceCards: ReadinessCardId[];

  // Stage 2: Selected blockers
  selectedBlockers: LaunchBlockerId[];
  blockerValidationMessage: string | null;

  // Stage 3: Rollout plan configuration
  prePilotActivities: Record<PrePilotActivityId, PilotActivityStage>;
  latencyTarget: LatencyTarget;
  errorRateThreshold: ErrorRateThreshold;
  feedbackChannel: FeedbackChannel;
  incidentOwner: IncidentOwner;
  rollbackCondition: RollbackCondition;
  widerRolloutDecision: WiderRolloutDecision | null;

  // Submission & Review
  submitted: boolean;
  completed: boolean;
  submissionRevisionNeeded: boolean;
  revisionReason: string | null;

  // Scorecard
  scorecard: Chapter5Scorecard;
}
