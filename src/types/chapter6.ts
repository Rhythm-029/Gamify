/**
 * chapter6.ts
 * Type definitions for Chapter 6: The 30,000-User Stress Test
 * Production Readiness & Performance Command Centre
 */

export type Chapter6Stage =
  | 'meeting'
  | 'diagnose'
  | 'recovery_sequence'
  | 'retest_and_approval'
  | 'completed';

export type BottleneckOptionId =
  | 'frontend_rendering'
  | 'db_pool_saturation'
  | 'auth_failure'
  | 'ui_component_loading';

export interface BottleneckOption {
  id: BottleneckOptionId;
  label: string;
  description: string;
  isCorrect: boolean;
  explanation: string;
}

export type RecoveryActionId =
  | 'retest_load'           // Run the 30,000-user stress test again
  | 'tune_redis'            // Tune Redis caching and review cache invalidation rules
  | 'submit_approvals'      // Submit results for Engineering Lead and CTO approval
  | 'optimize_db_pool'      // Review and optimize database connection pooling
  | 'analyse_metrics';      // Analyse the new latency, error rate and resource utilization

export interface RecoveryAction {
  id: RecoveryActionId;
  label: string;
  description: string;
  category: 'caching' | 'database' | 'testing' | 'analysis' | 'governance';
}

export interface MetricComparison {
  name: string;
  initial: string;
  retest: string;
  initialStatus: 'critical' | 'warning' | 'ok';
  retestStatus: 'critical' | 'warning' | 'ok';
  delta: string;
}

export type ApprovalStatus = 'pending' | 'requested' | 'approved' | 'rejected';

export interface ApprovalCard {
  role: string;
  owner: string;
  title: string;
  status: ApprovalStatus;
  summary: string;
  signedAt?: string;
}

export type Chapter6OutcomeType = 'strong' | 'mixed' | 'incomplete';

export interface Chapter6Scorecard {
  shown: boolean;
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  breakdown: {
    diagnosisScore: number;      // max 20
    recoveryScore: number;       // max 30
    retestScore: number;         // max 20
    approvalScore: number;       // max 30
  };
  outcomeType: Chapter6OutcomeType;
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
  aiEvaluated?: boolean;
  outcomeTitle?: string;
}

export interface Chapter6State {
  // Navigation & stage tracking
  currentStage: Chapter6Stage;
  activeSection: 'diagnose' | 'recovery' | 'approval';
  meetingCompleted: boolean;
  commandCentreOpened: boolean;

  // Section A: Diagnosis
  selectedBottleneck: BottleneckOptionId | null;
  diagnosisConfirmed: boolean;
  diagnosisAttempts: number;

  // Section B: Recovery Plan
  recoverySequence: RecoveryActionId[];
  sequenceValidated: boolean;
  sequenceValidationFeedback: string | null;
  sequenceAttemptCount: number;

  // Section C: Retest & Production Approval Gate
  retestRunning: boolean;
  retestCompleted: boolean;
  retestAnalyzed: boolean;
  leadApprovalStatus: ApprovalStatus;
  ctoApprovalStatus: ApprovalStatus;
  approvalBlockedReason: string | null;

  // Final Scene & Scorecard
  closingChatShown: boolean;
  completed: boolean;
  scorecard: Chapter6Scorecard;
}
