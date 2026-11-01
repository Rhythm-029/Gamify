/**
 * chapter8.ts
 * Type definitions for Chapter 8: Security Attacks, Policies & Compliance Acts
 * Scene 8.1: Defending Against Credential Stuffing
 */

export type Chapter8DecisionChoice = 'choice_a' | 'choice_b';

export type Chapter8Stage =
  | 'soc_threat_alert'
  | 'tech_tradeoff_discussion'
  | 'decision_screen'
  | 'console_investigation'
  | 'console_configuration'
  | 'console_validation'
  | 'closing_sequence'
  | 'chapter_complete';

export type ThreatTypeId =
  | 'credential_stuffing'
  | 'ordinary_login_failures'
  | 'normal_traffic_spike';

export type TargetSystemId =
  | 'employee_login_gateway'
  | 'attendance_database'
  | 'reporting_dashboard';

export type TrafficSourceId =
  | 'anomalous_bot_traffic'
  | 'internal_branch_users'
  | 'scheduled_batch_job';

export type SecurityAuthorityId =
  | 'bank_ciso'
  | 'hr_operations'
  | 'external_vendor';

export type Chapter8ConsoleTabId = 'investigate' | 'configure' | 'validate';

export type Chapter8OutcomeType = 'strong' | 'mixed' | 'incomplete';

export interface Chapter8Scorecard {
  shown: boolean;
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  breakdown: {
    investigationScore: number; // max 25
    controlsScore: number;      // max 50 (25 WAF + 25 MFA)
    validationScore: number;    // max 25
  };
  outcomeType: Chapter8OutcomeType;
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

export interface ThreatOption {
  id: ThreatTypeId;
  label: string;
  description: string;
  isCorrect: boolean;
  explanation: string;
}

export interface TargetSystemOption {
  id: TargetSystemId;
  label: string;
  description: string;
  isCorrect: boolean;
  explanation: string;
}

export interface TrafficSourceOption {
  id: TrafficSourceId;
  label: string;
  description: string;
  isCorrect: boolean;
  explanation: string;
}

export interface SecurityAuthorityOption {
  id: SecurityAuthorityId;
  label: string;
  description: string;
  isCorrect: boolean;
  explanation: string;
}

export interface SecurityReadinessChecklist {
  wafMitigationConfirmed: boolean;
  mfaRateLimitingConfirmed: boolean;
  legitimateAccessPreserved: boolean;
  responseDocumentedForCiso: boolean;
}

export interface Chapter8State {
  // Story Milestones & Meeting
  alertNotificationShown: boolean;
  socChannelOpened: boolean;
  threatDelivered: boolean;
  tradeoffDiscussed: boolean;
  meetingCompleted: boolean;
  callCompleted: boolean;
  deskUnlocked: boolean; // Controls whether Security Response Console is accessible

  // Decision (Scene 8.1 22:30–23:00)
  selectedDecision: Chapter8DecisionChoice | null;
  decisionScoreApplied: boolean;
  decisionFeedback: string | null;

  // Security Response Console Navigation
  activeTab: Chapter8ConsoleTabId;

  // Activity 1: Investigate Threat
  selectedThreatType: ThreatTypeId | null;
  selectedTargetSystem: TargetSystemId | null;
  selectedTrafficSource: TrafficSourceId | null;
  selectedSecurityAuthority: SecurityAuthorityId | null;
  investigationAttempts: number;
  investigationValidated: boolean;
  investigationFeedback: string | null;

  // Activity 2: Configure Security Response
  wafBotMitigationEnabled: boolean;
  mfaRateLimitingEnforced: boolean;
  controlsAttempts: number;
  controlsValidated: boolean;
  controlsFeedback: string | null;

  // Activity 3: Validate Security Readiness
  readinessChecklist: SecurityReadinessChecklist;
  validationAttempts: number;
  validationCompleted: boolean;
  validationFeedback: string | null;

  // Closing Sequence & Completion
  closingConfirmed: boolean;
  completed: boolean;
  scorecard: Chapter8Scorecard;

  // Legacy compatibility fields if referenced by UI
  reviewCallCompleted?: boolean;
  marcusMessageRead?: boolean;
  sophiaMessageRead?: boolean;
  aaravAssignmentViewed?: boolean;
}
