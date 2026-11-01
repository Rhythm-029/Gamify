/**
 * chapter7.ts
 * Type definitions for Chapter 7: Production Issues & Root Cause Analysis
 * SEV-2 Production Incident INC-0241 (Attendance Sync Failure)
 */

export type Chapter7IncidentStatus =
  | 'investigating'
  | 'restoring'
  | 'rca_in_progress'
  | 'prevention_planned'
  | 'resolved';

export type Activity1CardId =
  | 'confirm_scope'
  | 'deploy_hotfix'
  | 'verify_access'
  | 'close_prematurely';

export interface Activity1Card {
  id: Activity1CardId;
  letter: 'A' | 'B' | 'C' | 'D';
  title: string;
  description: string;
  isTrap?: boolean;
}

export type RcaFieldId = 'incident' | 'rootCause' | 'impact' | 'prevention';

export interface RcaOption {
  id: string; // e.g. 'inc_a', 'inc_b', etc.
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface RcaFieldDefinition {
  id: RcaFieldId;
  question: string;
  subtitle: string;
  options: RcaOption[];
}

export type PreventionActionId =
  | 'continuous_memory_monitoring'
  | 'alert_thresholds'
  | 'memory_regression_testing'
  | 'service_health_checks'
  | 'increase_number_of_servers'
  | 'ignore_monitoring_hotfix';

export interface PreventionActionCard {
  id: PreventionActionId;
  title: string;
  description: string;
  isAppropriate: boolean;
  inappropriateExplanation?: string;
  preferredPriorityRank: number; // 1 = highest
}

export type Chapter7OutcomeType = 'strong' | 'mixed' | 'incomplete';

export interface Chapter7Scorecard {
  shown: boolean;
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  breakdown: {
    immediateResponseScore: number; // max 30
    rcaScore: number;               // max 40
    preventionScore: number;        // max 30
  };
  outcomeType: Chapter7OutcomeType;
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

export interface Chapter7State {
  // Story & workflow checkpoints
  alertNotificationShown: boolean;
  marthaChatViewed: boolean;
  callInitiated: boolean;
  callCompleted: boolean;
  meetingCompleted?: boolean; // legacy alias compatibility
  screenShareViewed: boolean;
  aaravAssignmentViewed: boolean;
  studioUnlocked: boolean;
  studioOpened?: boolean; // legacy alias compatibility
  activeTab: 'immediate' | 'rca' | 'prevention' | 'resolved';

  // Activity 1: Restore Service (Sequence Ordering)
  activity1Order: Activity1CardId[];
  activity1Attempts: number;
  activity1Submitted: boolean;
  activity1Completed: boolean;
  activity1Feedback: string | null;
  activity1FirstOrder?: Activity1CardId[];

  // Activity 2: Build the RCA (4 compact fields)
  activity2Answers: {
    incident: string | null;
    rootCause: string | null;
    impact: string | null;
    prevention: string | null;
  };
  activity2Attempts: number;
  activity2Submitted: boolean;
  activity2Completed: boolean;
  activity2Feedback: {
    incident?: { isCorrect: boolean; message: string };
    rootCause?: { isCorrect: boolean; message: string };
    impact?: { isCorrect: boolean; message: string };
    prevention?: { isCorrect: boolean; message: string };
    summary?: string;
  } | null;
  activity2FirstAnswers?: {
    incident: string | null;
    rootCause: string | null;
    impact: string | null;
    prevention: string | null;
  };

  // Activity 3: Prevent Recurrence (Selection & Prioritisation)
  activity3Selected: PreventionActionId[];
  activity3PriorityOrder: PreventionActionId[];
  activity3Attempts: number;
  activity3Submitted: boolean;
  activity3Completed: boolean;
  activity3Feedback: string | null;
  activity3FirstSelected?: PreventionActionId[];
  activity3FirstPriorityOrder?: PreventionActionId[];

  // Resolution sequence
  incidentStatus: Chapter7IncidentStatus;
  danielHotfixConfirmed: boolean;
  marthaMonitoringConfirmed: boolean;
  aaravClosingConfirmed: boolean;

  // Completion
  completed: boolean;
  closingChatShown: boolean;
  scorecard: Chapter7Scorecard;
}
