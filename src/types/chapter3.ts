export type Chapter3EscalationChoice =
  | 'investigate_independently' // Option A: Handle it without escalation
  | 'escalate_aarav'           // Option B: Bring Aarav into the meeting (Recommended)
  | 'bypass_gateway';           // Option C: Tell Daniel to bypass the gateway (Risky)

export type Chapter3BlockerChoice =
  | 'database_overload'       // A: The bank's database cannot handle the number of requests
  | 'protocol_mismatch'       // B: The HRMS expects JSON over REST, while legacy uses SOAP/XML (Correct)
  | 'expired_credentials'     // C: Employee passwords have expired
  | 'incorrect_ui';           // D: The HRMS screens are sending the wrong information

export type Chapter3ApproachChoice =
  | 'direct_database'         // Option A: Direct Database Connection (Risky)
  | 'custom_converter'        // Option B: Unapproved Custom Converter (Risky)
  | 'approved_gateway';       // Option C: Approved Integration Gateway (Correct reference)

export type Chapter3ActionId =
  | 'action_confirm_interface'   // Action A: Confirm the approved interface & validate schema
  | 'action_verify_auth'         // Action B: Verify LDAP/SSO authentication access
  | 'action_prepare_mock_tests'  // Action C: Prepare controlled integration tests with mock data
  | 'action_validate_integrate'; // Action D: Validate and integrate after dependencies confirmed

export type Chapter3OutcomeType = 'strong' | 'partial' | 'poor';

export interface Chapter3Scorecard {
  shown: boolean;
  scheduleScore: number;
  riskScore: number;
  governanceScore: number;
  efficiencyScore: number;
  totalScore: number;
  outcomeType: Chapter3OutcomeType;
  outcomeText: string;
  personalizedTakeaway: string;
  explanations: {
    schedule: string;
    risk: string;
    governance: string;
    efficiency: string;
  };
}

export interface Chapter3State {
  entered: boolean;
  meetingStatus:
    | 'calling'
    | 'connected'
    | 'screen_sharing'
    | 'decision_pending'
    | 'aarav_joined'
    | 'portal_unlocked'
    | 'reviewing_plan'
    | 'completed';
  escalationChoice: Chapter3EscalationChoice | null;
  escalationWarningShown: boolean;
  escalationRecovered: boolean;

  // Integration Portal & Triage status
  portalAccessGranted: boolean;
  currentTriageTask: 1 | 2 | 3;

  // Task 1: Blocker
  task1Selected: Chapter3BlockerChoice | null;
  task1Submitted: boolean;
  task1Feedback: string | null;

  // Task 2: Approach
  task2Selected: Chapter3ApproachChoice | null;
  task2Submitted: boolean;
  task2WarningShown: boolean;
  task2Recovered: boolean;

  // Task 3: Prioritization Action Order
  task3Order: Chapter3ActionId[];
  task3Submitted: boolean;

  // Final Meeting Review
  finalReviewComplete: boolean;

  // Scorecard
  scorecard: Chapter3Scorecard;
  completed: boolean;
}
