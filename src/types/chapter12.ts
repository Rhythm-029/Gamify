/**
 * types/chapter12.ts
 * Type definitions for Chapter 12: The Next Evolution
 * (CR Upgrade & Phase 2 Evolution — The Grand Finale)
 */

export type Chapter12Stage =
  | 'status_briefing'
  | 'steering_meeting_intro'
  | 'evolution_control_center'
  | 'steering_final_decision'
  | 'approval_outcome'
  | 'cinematic_montage'
  | 'transformation_report'
  | 'complete';

export type EvolutionControlCenterTab =
  | 'upgrade_scope'
  | 'release_strategy'
  | 'deployment_validation';

export type UpgradeCategory = 'new_functionality' | 'core_platform_upgrade';

export interface UpgradeModuleItem {
  id: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  iconName: string;
}

export type FeatureFlagRollout = 0 | 5 | 25 | 50 | 100;

export interface FeatureFlagConfig {
  id: string;
  moduleId: string;
  name: string;
  flagKey: string;
  percentage: FeatureFlagRollout;
  stateLabel: string;
  status: 'disabled' | 'pilot' | 'limited' | 'expanded' | 'enabled';
}

export interface DeploymentActionCard {
  id: string;
  letter: 'A' | 'B' | 'C' | 'D';
  title: string;
  correctStep: number; // 1, 2, 3, 4
}

export type Chapter12DecisionChoice = 'choice_a' | 'choice_b';

export interface Chapter12Scorecard {
  shown: boolean;
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number; // Chapter 12 specific score
  cumulativeScore: number; // Final out of 10,000 (e.g. 9,480)
  finalGrade: 'S+' | 'S' | 'A+' | 'A' | 'B' | 'C';
  bonusPoints: number; // Up to +15 from 3 stages
  breakdown: {
    scopeBonus: number;       // +5
    featureFlagBonus: number; // +5
    blueGreenBonus: number;   // +5
    scheduleDelta: number;
    riskDelta: number;
    governanceDelta: number;
    efficiencyDelta: number;
  };
  decisionChosen?: Chapter12DecisionChoice;
  outcomeTitle: string;
  outcomeText: string;
  leadershipStrengths: string[];
  areasToImprove: string[];
  finalAchievementUnlocked: boolean;
  evaluatedAt: string;
}

export interface Chapter12State {
  currentStage: Chapter12Stage;
  timelineTimestamp: string; // e.g. "29:03", "30:42", "31:00"
  statusModalSeen: boolean;
  meetingInitiated: boolean;
  meetingIntroCompleted: boolean;
  controlCenterOpened: boolean;
  selectedTab: EvolutionControlCenterTab;

  // Stage 1: Upgrade Scope Categorization
  scopeAssignments: Record<string, UpgradeCategory>; // moduleId -> category
  scopeCompleted: boolean;
  scopeErrorCount: number;

  // Stage 2: Feature Flags & Framework Upgrade
  featureFlags: Record<string, FeatureFlagRollout>; // moduleId -> percentage
  frameworkConfigured: boolean;
  releaseStrategyCompleted: boolean;

  // Stage 3: Blue-Green Deployment Simulator
  deploymentSlots: (string | null)[]; // 4 slots for action card IDs
  greenPrepared: boolean;
  testsPassed: boolean;
  releaseValidated: boolean;
  trafficSwitchedToGreen: boolean;
  deploymentCompleted: boolean;

  // Stage 4: Final Steering Committee Decision & Outcomes
  decisionChosen: Chapter12DecisionChoice | null;
  outcomeAcknowledged: boolean;
  cinematicWatched: boolean;
  reportOpened: boolean;
  completed: boolean;
  scorecard?: Chapter12Scorecard;
}

