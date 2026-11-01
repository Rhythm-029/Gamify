/**
 * chapter8.ts
 * Type definitions for Chapter 8: Production Stabilisation & Project Handover
 * Project Amigo Final Handover & Enterprise Acceptance
 */

export type Chapter8Stage =
  | 'opening_messages'
  | 'aarav_review_call'
  | 'handover_desk'
  | 'stakeholder_review'
  | 'project_closure';

export type DeliverableClaimId =
  | 'claim_scope_documented'
  | 'claim_ui_approved'
  | 'claim_infra_uat_ready'
  | 'claim_cr_assessed'
  | 'claim_pilot_completed'
  | 'claim_performance_tested'
  | 'claim_tech_approvals_recorded'
  | 'claim_incident_rca_documented'
  | 'claim_recovery_verified'
  | 'claim_monitoring_updated';

export type EvidenceItemId =
  | 'phase1_scope_baseline'
  | 'ui_ux_signoff'
  | 'infra_uat_readiness'
  | 'cr_impact_assessment'
  | 'cug_pilot_report'
  | 'concurrency_stress_report'
  | 'tech_cto_approval'
  | 'incident_rca_inc0241'
  | 'recovery_confirmation'
  | 'monitoring_controls_update';

export interface EvidenceItem {
  id: EvidenceItemId;
  title: string;
  category: 'Scope & Design' | 'Testing & Pilot' | 'Performance & Approval' | 'Production & Reliability';
  description: string;
  chapterOrigin: string;
  matchingClaimId: DeliverableClaimId;
  documentType: 'PDF Record' | 'Formal Signoff' | 'APM Audit' | 'Incident RCA' | 'Telemetry Log';
}

export interface DeliverableClaim {
  id: DeliverableClaimId;
  label: string;
  description: string;
  expectedEvidenceId: EvidenceItemId;
}

export type Chapter8TabId = 'evidence' | 'status' | 'handover' | 'package' | 'closure';
export type DeliveryStatusItemId = string;
export type HandoverItemId = string;

export type DeliveryClassificationColumn =
  | 'completed_verified'
  | 'completed_awaiting_approval'
  | 'deferred_phase_2'
  | 'unresolved_requires_action';

export interface DeliveryStatusItem {
  id: DeliveryStatusItemId;
  title: string;
  description: string;
  expectedColumn: DeliveryClassificationColumn;
  explanation: string;
  chapterOrigin?: string;
}

export type HandoverSectionId =
  | 'monitoring_health'
  | 'escalation_process'
  | 'known_issues_boundaries'
  | 'recovery_continuity';

export interface HandoverItem {
  id: HandoverItemId;
  section: HandoverSectionId;
  title: string;
  description: string;
  ownerRole: 'Engineering Operations' | 'Application Support' | 'Project Delivery';
  isMandatory: boolean;
}

export type Chapter8OutcomeType = 'strong' | 'mixed' | 'incomplete';

export interface Chapter8Scorecard {
  shown: boolean;
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  breakdown: {
    evidenceScore: number;   // max 25
    statusScore: number;     // max 25
    handoverScore: number;   // max 25
    packageScore: number;    // max 25
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

export interface Chapter8State {
  // Story milestones
  marcusMessageRead: boolean;
  sophiaMessageRead: boolean;
  reviewCallCompleted: boolean;
  deskUnlocked: boolean;
  activeTab: 'evidence' | 'status' | 'handover' | 'package' | 'closure';

  // Activity 1: Evidence Verification
  evidenceMatches: Record<string, EvidenceItemId | null>;
  evidenceAttempts: number;
  evidenceValidated: boolean;
  evidenceFeedback: string | null;

  // Activity 2: Delivery Status Classification
  itemClassifications: Record<string, DeliveryClassificationColumn>;
  classificationAttempts: number;
  classificationValidated: boolean;
  classificationFeedback: string | null;

  // Activity 3: Operational Handover
  selectedHandoverItems: string[];
  handoverAttempts: number;
  handoverValidated: boolean;
  handoverFeedback: string | null;

  // Activity 4: Final Delivery Package
  deliveryExecutiveSummary: string;
  packageSubmitted: boolean;
  packageValidationResults: {
    isReady: boolean;
    missingItems: string[];
  } | null;

  // Story & Notification Flags
  alertNotificationShown?: boolean;
  callInitiated?: boolean;
  callCompleted?: boolean;
  meetingCompleted?: boolean;
  aaravAssignmentViewed?: boolean;

  // Stakeholder approvals & final closure
  marcusTechnicalApproved: boolean;
  sophiaClientAccepted: boolean;
  aaravClosureConfirmed: boolean;
  finalProjectDashboardShown: boolean;

  // Final evaluation
  completed: boolean;
  scorecard: Chapter8Scorecard;
}
