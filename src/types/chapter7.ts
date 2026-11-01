/**
 * chapter7.ts
 * Type definitions for Chapter 7: Attendance Sync Production Incident
 * Incident Response & Root Cause Analysis (RCA) Studio
 */

export type Chapter7Stage =
  | 'alert_meeting'
  | 'immediate_response'
  | 'build_rca'
  | 'incident_closure'
  | 'resolved';

export type ImmediateActionId =
  | 'deploy_hotfix'
  | 'monitor_recovery'
  | 'verify_branch_users'
  | 'close_immediately_trap';

export interface ImmediateAction {
  id: ImmediateActionId;
  label: string;
  description: string;
  isCorrect: boolean;
  explanation: string;
}

export type RcaSlotType = 'incident' | 'root_cause' | 'impact' | 'preventive_action';

export interface RcaCardItem {
  id: string;
  text: string;
  category: RcaSlotType;
  isCorrect: boolean;
  details: string;
}

export type ClosureConditionId =
  | 'cond_hotfix_verified'
  | 'cond_rca_documented'
  | 'cond_monitoring_updated'
  | 'cond_shared_with_leads'
  | 'cond_skip_documentation_trap';

export interface ClosureCondition {
  id: ClosureConditionId;
  label: string;
  description: string;
  isMandatory: boolean;
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
    closureScore: number;           // max 30
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
  currentStage: Chapter7Stage;
  activeTab: 'immediate' | 'rca' | 'closure';
  meetingCompleted: boolean;
  studioOpened: boolean;

  // Activity 1: Immediate Response
  selectedImmediateActions: ImmediateActionId[];
  immediateSubmitted: boolean;
  immediateValidationFeedback: string | null;

  // Activity 2: Build RCA
  rcaSlots: {
    incident: string | null;
    root_cause: string | null;
    impact: string | null;
    preventive_action: string | null;
  };
  rcaSubmitted: boolean;
  rcaValidationFeedback: string | null;

  // Activity 3: Final Incident Closure
  selectedClosureConditions: ClosureConditionId[];
  closureSubmitted: boolean;
  closureValidationFeedback: string | null;

  // Final State
  completed: boolean;
  closingChatShown: boolean;
  scorecard: Chapter7Scorecard;
}
