/**
 * types/chapter11.ts
 * Type definitions for Chapter 11: Operational Handover
 * (From Project Delivery to Operational Ownership)
 */

export type Chapter11PortalTab = 'readiness' | 'knowledge_transfer' | 'hypercare' | 'governance_gate';

export type Chapter11DecisionChoice = 'choice_a' | 'choice_b';

export type Chapter11OutcomeType = 'strong' | 'mixed' | 'incomplete';

export interface OperationalRequirementItem {
  id: string;
  requirement: string;
  targetResourceId: string;
  category: 'Troubleshooting' | 'Governance' | 'Access Control' | 'Observability' | 'Known Defect' | 'Maintenance';
}

export interface AvailableResourceItem {
  id: string;
  name: string;
  description: string;
  docFormat: string;
  iconName: string;
}

export interface IncidentResponseStep {
  id: string;
  stepNumber: number;
  title: string;
  actionText: string;
  resourceName: string;
  role: string;
}

export interface TrainingWorkshopItem {
  id: string;
  title: string;
  owner: string;
  ownerRole: string;
  duration: string;
  scheduled: boolean;
}

export interface HypercarePhase {
  id: string;
  label: string;
  daysRange: string;
  ownershipModel: string;
  focus: string;
  assignedCardIds: string[];
}

export interface HypercareResponsibilityCard {
  id: string;
  title: string;
  description: string;
  correctPhaseId: string;
}

export interface Chapter11Scorecard {
  shown: boolean;
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  bonusPoints: number; // up to +15 from 3 interactive activities
  breakdown: {
    matchingBonus: number;     // 0-6
    incidentBonus: number;     // 0-4
    hypercareBonus: number;    // 0-5
    governanceScore: number;   // -35 or +30
    trustRiskScore: number;    // -30 or +25
    efficiencyScore: number;   // 0 or +15
  };
  decisionChosen?: Chapter11DecisionChoice;
  outcomeType: Chapter11OutcomeType;
  outcomeTitle: string;
  outcomeText: string;
  whatYouDidWell: string;
  whatToImprove: string;
  keyTakeaway: string;
  executiveFeedback: string;
  explanations: {
    governance: string;
    risk: string;
    efficiency: string;
    schedule: string;
  };
  achievementUnlocked: boolean;
  achievementTitle?: string;
  aiEvaluated?: boolean;
  evaluatedAt?: string;
  evaluatorName?: string;
  evaluatorRole?: string;
}

export interface Chapter11State {
  currentStage: 'handover_briefing' | 'transition_console' | 'governance_decision' | 'chapter_complete';
  timelineTimestamp: string; // e.g. "27:00", "27:30", "28:15", "29:00"
  selectedTab: Chapter11PortalTab;
  callInitiated?: boolean;
  meetingCompleted: boolean;
  callCompleted: boolean;
  consoleOpened: boolean;

  // Stage 1: Resource Matching
  matchedPairs: Record<string, string>; // requirementId -> resourceId
  matchingCompleted: boolean;

  // Stage 2: Knowledge Transfer & Incident Simulation
  incidentSlots: (string | null)[]; // 3 step slot array
  incidentValidated: boolean;
  workshopsScheduled: boolean;

  // Stage 3: Hypercare Timeline
  phaseAssignments: Record<string, string>; // cardId -> phaseId
  hypercareCompleted: boolean;

  // Stage 4: Decision & Sign-off
  decisionChosen: Chapter11DecisionChoice | null;
  completed: boolean;
  scorecard?: Chapter11Scorecard;
}

