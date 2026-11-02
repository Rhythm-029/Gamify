/**
 * chapter9.ts
 * Type definitions for Chapter 9: ROI (Return on Investment) Validation
 * Executive Leadership Phase (23:00–25:00)
 * Scene 9.1: Presenting Financial and Operational Impact
 */

export type Chapter9DecisionChoice = 'choice_a' | 'choice_b';

export type Chapter9Stage =
  | 'telemetry_briefing'      // 23:00 - 23:45: Martha presents telemetry (42% cycle drop, 15,000 hrs saved)
  | 'roi_preparation'         // 23:45 - 24:20: Jane synthesizes operational data into monetary ROI
  | 'boardroom_decision'       // 24:20 - 25:00: Executive decision screen
  | 'presentation_delivered'  // Boardroom reaction & outcome
  | 'chapter_complete';

export type RoiMetricTab = 'telemetry' | 'financial' | 'slides' | 'governance';

export interface RoiTelemetryData {
  appraisalCycleDaysBefore: number;  // 21 days
  appraisalCycleDaysAfter: number;   // 12.2 days
  cycleReductionPct: number;          // 42%
  manHoursSaved: number;             // 15,000 hours
  targetEmployeeCount: number;       // 80,000 employees
  slaComplianceRate: number;         // 99.4%
  errorRateDropPct: number;          // 88.5%
  enpsImprovementPts: number;        // +28 points
  onTimeSubmissionsPct: number;      // 96.8%
}

export interface RoiFinancialModel {
  hourlyCostRateINR: number;         // Default ₹650 / hr
  totalSavingsINR: number;           // 15,000 * 650 = ₹97,50,000 (₹97.5 Lakhs)
  phase1InvestmentINR: number;       // ₹55,00,000 (₹55 Lakhs)
  netBenefitINR: number;             // ₹42,50,000 (₹42.5 Lakhs)
  roiPercentage: number;             // +77.3%
  paybackPeriodMonths: number;       // 6.8 months
}

export interface PresentationSlide {
  id: number;
  title: string;
  subtitle: string;
  category: 'Operational' | 'Financial' | 'Strategic' | 'Governance';
  keyStat: string;
  bulletPoints: string[];
  takeaway: string;
}

export type Chapter9OutcomeType = 'strong' | 'mixed' | 'incomplete';

export interface Chapter9Scorecard {
  shown: boolean;
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  breakdown: {
    telemetryAnalysisScore: number;  // max 25
    financialModelingScore: number;  // max 25
    executiveDecisionScore: number;  // max 50
  };
  decisionChosen?: Chapter9DecisionChoice;
  outcomeType: Chapter9OutcomeType;
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
  aiEvaluated?: boolean;
  evaluatedAt?: string;
  evaluatorName?: string;
  evaluatorRole?: string;
}

export interface BoardroomDialogue {
  id: string;
  speaker: 'Martha' | 'Jane' | 'Sophia' | 'Mark';
  role: string;
  avatar: string;
  timestamp: string; // e.g. "23:12"
  text: string;
  sentiment: 'neutral' | 'positive' | 'urgent' | 'executive';
}

export interface Chapter9State {
  currentStage: Chapter9Stage;
  timelineTimestamp: string; // e.g. "23:00", "23:45", "24:20", "25:00"
  selectedTab: RoiMetricTab;
  currentSlideIndex: number;
  telemetryReviewed: boolean;
  financialModelReviewed: boolean;
  slidesReviewed: boolean;
  hourlyCostRateINR: number;
  decisionChosen: Chapter9DecisionChoice | null;
  decisionTimestamp?: string;
  boardroomRoomOpened: boolean;
  callInitiated?: boolean;
  meetingCompleted?: boolean;
  callCompleted?: boolean;
  completed: boolean;
  scorecard: Chapter9Scorecard;
}
