export type Chapter3OutcomeType = 'strong' | 'partial' | 'poor';

export type Chapter3Step =
  | 'daniel_initial_request'
  | 'email_sent_to_sophia'
  | 'sophia_typing_v1'
  | 'sophia_v1_delivered'
  | 'asking_sophia_more'
  | 'sophia_typing_v2'
  | 'sophia_v2_delivered'
  | 'v1_sent_to_daniel'
  | 'v2_sent_to_daniel'
  | 'assignment_completed';

export type Chapter3PathType = 'full_credit' | 'recovery' | 'incomplete';

export interface Chapter3UatItem {
  no: number;
  item: string;
  confirmedDetails: string;
  isConfirmed: boolean;
  notes?: string;
}

export interface Chapter3UatDocument {
  version: 'v1' | 'v2';
  filename: string;
  title: string;
  preparedBy: string;
  items: Chapter3UatItem[];
  note: string;
}

export interface Chapter3Scorecard {
  shown: boolean;
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  outcomeType: Chapter3OutcomeType;
  outcomeTitle: string;
  outcomeText: string;
  personalizedTakeaway: string;
  learningInsight: string;
  behaviours: {
    requirementCompleteness: {
      score: number;
      passed: boolean;
      feedback: string;
    };
    stakeholderCommunication: {
      score: number;
      passed: boolean;
      feedback: string;
    };
    deliveryCoordination: {
      score: number;
      passed: boolean;
      feedback: string;
    };
  };
  explanations: {
    schedule: string;
    risk: string;
    governance: string;
    efficiency: string;
  };
  aiEvaluated?: boolean;
  strengths?: string[];
  improvements?: string[];
  leadershipCoaching?: string;
  executiveSummary?: string;
}

export interface Chapter3State {
  step: Chapter3Step;
  pathTaken: Chapter3PathType | null;

  // Step 1: Daniel's request
  danielRequestRead: boolean;

  // Step 2: Email sent to Sophia
  emailSubject: string;
  emailBody: string;
  emailSentAt: string | null;

  // Step 3 & 4: Sophia's response & v1 doc
  sophiaTyping: boolean;
  v1Delivered: boolean;
  v1Document: Chapter3UatDocument;
  documentViewerOpen: boolean;
  currentViewingDoc: 'v1' | 'v2' | null;

  // Step 5 & 6: Follow-up & Branching
  firstForwardTarget: 'daniel' | 'sophia_followup' | null;
  playerFollowUpMessage: string;
  playerFollowUpSent: boolean;
  playerIdentifiedNetworkGap: boolean;

  // Branch A / v2
  v2Delivered: boolean;
  v2Document: Chapter3UatDocument;

  // Branch B
  sentV1ToDaniel: boolean;
  danielPromptedForNetwork: boolean;

  // Completion
  v2SentToDaniel: boolean;
  danielFinalConfirmed: boolean;
  aaravSummaryGiven: boolean;

  // Active chat contact in Teams / Messages
  activeChatRecipient: 'daniel' | 'sophia';

  // Legacy compatibility fields
  portalAccessGranted?: boolean;
  meetingStatus?: string;
  finalReviewComplete?: boolean;
  task3Submitted?: boolean;

  // Evaluation & Scorecard
  scorecard: Chapter3Scorecard;
  completed: boolean;
}
