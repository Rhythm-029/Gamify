/**
 * chapter10.ts
 * Type definitions for Chapter 10: Versioning & Technical Documentation
 * Post-Launch Stabilization Phase (25:00–27:00)
 * Scene 10.1 & 10.2: Engineering Release & Documentation Challenge
 */

export type Chapter10DecisionChoice = 'choice_a' | 'choice_b';

export type Chapter10PortalTab = 'repo_audit' | 'versioning' | 'catalog' | 'governance';

export interface RepoFileItem {
  id: string;
  name: string;
  path: string;
  size: string;
  lastModified: string;
  author: string;
  status: 'needs_review' | 'duplicate_candidate' | 'needs_versioning' | 'obsolete_candidate' | 'unverified';
  category: 'api' | 'architecture' | 'database' | 'ops' | 'scratchpad';
  summary: string;
  contentSnippet: string;
  recommendedAction: 'retain' | 'deprecate' | 'archive';
}

export type SemVerChoice = 'v0.9.9' | 'v1.0.0' | 'v2.0.0';

export interface DocumentationSectionItem {
  id: string;
  title: string;
  description: string;
  category: string;
  required: boolean;
  docFormat: string;
}

export type Chapter10OutcomeType = 'strong' | 'mixed' | 'incomplete';

export interface Chapter10Scorecard {
  shown: boolean;
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  bonusPoints: number; // +15 max formative bonus
  breakdown: {
    repoAuditBonus: number;      // 0 or 5
    versioningBonus: number;     // 0 or 5
    catalogPublishBonus: number; // 0 or 5
    governanceScore: number;     // -30 or +30
  };
  decisionChosen?: Chapter10DecisionChoice;
  outcomeType: Chapter10OutcomeType;
  outcomeTitle: string;
  outcomeText: string;
  whatYouDidWell: string;
  whatToImprove: string;
  keyTakeaway: string;
  executiveFeedback: string;
  explanations: {
    schedule: string;
    risk: string;
    governance: string;
    efficiency: string;
  };
  achievementUnlocked: boolean;
  achievementTitle?: string;
  aiEvaluated?: boolean;
  evaluatedAt?: string;
  evaluatorName?: string;
  evaluatorRole?: string;
}

export interface Chapter10State {
  currentStage: 'tech_debt_briefing' | 'release_challenge' | 'final_governance' | 'chapter_complete';
  timelineTimestamp: string; // e.g. "25:00", "25:30", "26:15", "27:00"
  selectedTab: Chapter10PortalTab;
  callInitiated?: boolean;
  meetingCompleted: boolean;
  callCompleted: boolean;
  portalOpened: boolean;
  
  // Assignment 1: Repo Audit
  selectedRepoFiles: string[]; // ids of files chosen to retain
  repoAuditCompleted: boolean;
  
  // Assignment 2: SemVer
  selectedVersion: SemVerChoice | null;
  versionConfirmed: boolean;
  
  // Assignment 3: Enterprise Wiki Catalog
  selectedDocSections: string[];
  catalogPublished: boolean;
  documentationCoveragePct: number;
  
  // Assignment 4: Final Governance Decision
  decisionChosen: Chapter10DecisionChoice | null;
  completed: boolean;
  scorecard: Chapter10Scorecard;
}
