import type {
  Chapter3State,
  Chapter3EscalationChoice,
  Chapter3BlockerChoice,
  Chapter3ApproachChoice,
  Chapter3ActionId,
  Chapter3Scorecard,
  Chapter3OutcomeType,
} from '../types/chapter3';

export const INITIAL_CHAPTER3_STATE: Chapter3State = {
  entered: false,
  meetingStatus: 'calling',
  escalationChoice: null,
  escalationWarningShown: false,
  escalationRecovered: false,
  portalAccessGranted: false,
  currentTriageTask: 1,
  task1Selected: null,
  task1Submitted: false,
  task1Feedback: null,
  task2Selected: null,
  task2Submitted: false,
  task2WarningShown: false,
  task2Recovered: false,
  task3Order: [
    'action_confirm_interface',
    'action_verify_auth',
    'action_prepare_mock_tests',
    'action_validate_integrate',
  ],
  task3Submitted: false,
  finalReviewComplete: false,
  scorecard: {
    shown: false,
    scheduleScore: 0,
    riskScore: 0,
    governanceScore: 0,
    efficiencyScore: 0,
    totalScore: 0,
    outcomeType: 'partial',
    outcomeText: '',
    personalizedTakeaway: '',
    explanations: {
      schedule: '',
      risk: '',
      governance: '',
      efficiency: '',
    },
  },
  completed: false,
};

// ── LOG LINES DISPLAYED DURING DANIEL'S SCREEN SHARE ──
export interface ScreenShareLogLine {
  id: string;
  time: string;
  service: string;
  details: { key: string; value: string }[];
  status: string;
  severity: 'error' | 'pending' | 'info';
}

export const SCREEN_SHARE_LOGS: ScreenShareLogLine[] = [
  {
    id: 'log_appraisal',
    time: '09:41:02',
    service: 'AppraisalService',
    details: [
      { key: 'Expected', value: 'application/json' },
      { key: 'Received', value: 'text/xml' },
    ],
    status: '415 Unsupported Media Type',
    severity: 'error',
  },
  {
    id: 'log_attendance',
    time: '09:41:04',
    service: 'AttendanceService',
    details: [
      { key: 'Expected', value: 'REST/JSON' },
      { key: 'Received', value: 'SOAP/XML' },
    ],
    status: 'Protocol mismatch',
    severity: 'error',
  },
  {
    id: 'log_employee_auth',
    time: '09:41:08',
    service: 'EmployeeAuthService',
    details: [],
    status: 'LDAP/SSO access not verified',
    severity: 'pending',
  },
  {
    id: 'log_gateway',
    time: '09:41:11',
    service: 'Integration Gateway',
    details: [],
    status: 'Awaiting approved endpoint and schema validation',
    severity: 'pending',
  },
];

// ── DECISION: INVOLVE AARAV ──
export interface EscalationOptionConfig {
  id: Chapter3EscalationChoice;
  badge: string;
  label: string;
  quote: string;
  description: string;
  isRecommended: boolean;
  consequence: string;
}

export const ESCALATION_OPTIONS: EscalationOptionConfig[] = [
  {
    id: 'investigate_independently',
    badge: 'Option A',
    label: 'Handle it without escalation',
    quote: 'Ask Daniel to investigate independently and report back later.',
    description:
      'Keep the issue internal to engineering for now. Ask Daniel to inspect the logs further without pulling in project management.',
    isRecommended: false,
    consequence:
      'Daniel remains blocked on external bank dependencies. The team loses time without getting closer to the approved bank schema.',
  },
  {
    id: 'escalate_aarav',
    badge: 'Option B',
    label: 'Ask Aarav to join the call',
    quote:
      'Bring Aarav into the meeting so we can review the blocker, establish the approved approach, and access the integration documentation.',
    description:
      'Involve project management immediately to clarify enterprise boundaries, engage Bank IT, and unlock the official Integration Portal.',
    isRecommended: true,
    consequence:
      'Aarav joins the call, aligns with engineering constraints, and grants full access to the Project Amigo Integration Portal.',
  },
  {
    id: 'bypass_gateway',
    badge: 'Option C',
    label: 'Tell Daniel to bypass the gateway',
    quote: 'Ask Daniel to create a direct connection so development can continue immediately.',
    description:
      'Instruct engineering to circumvent the legacy ESB protocol mismatch by connecting directly to the database or an unapproved mock.',
    isRecommended: false,
    consequence:
      'Marcus (CTO) intervenes with a security violation alert. Direct database access violates ICICI Bank audit policy.',
  },
];

// ── INTEGRATION PORTAL EVIDENCE ──
export interface IntegrationEvidenceItem {
  service: string;
  currentStatus: string;
  protocol: string;
  state: 'blocked' | 'pending' | 'verified';
}

export const INTEGRATION_STATUS_EVIDENCE: IntegrationEvidenceItem[] = [
  {
    service: 'Appraisal Service',
    currentStatus: 'SOAP/XML and JSON/REST mismatch',
    protocol: 'REST / JSON expected',
    state: 'blocked',
  },
  {
    service: 'Attendance Service',
    currentStatus: 'SOAP/XML and JSON/REST mismatch',
    protocol: 'REST / JSON expected',
    state: 'blocked',
  },
  {
    service: 'LDAP / SSO Access',
    currentStatus: 'Access verification pending',
    protocol: 'LDAP / Enterprise SSO',
    state: 'pending',
  },
  {
    service: 'Approved Endpoint',
    currentStatus: 'Awaiting Bank IT confirmation',
    protocol: 'Bank ESB Gateway',
    state: 'pending',
  },
  {
    service: 'Schema Validation',
    currentStatus: 'Pending Bank IT WSDL/XSD formal confirmation',
    protocol: 'XML Schema Definition',
    state: 'pending',
  },
];

export const MARCUS_ARCHITECTURE_REQUIREMENT = {
  author: 'Marcus Reed',
  role: 'Chief Technology Officer · Brained',
  statement:
    'All integrations must use the bank-approved Enterprise Service Bus or an approved API gateway.\n\nNo direct database connections, undocumented middleware, or unapproved credential sharing.\n\nAny protocol translation must follow the approved interface and schema.',
};

export const PROJECT_CONSTRAINTS = [
  { label: 'Project Deadline', value: '90 days (Fixed Bank Go-Live)' },
  { label: 'Blocked Modules', value: '2 HRMS Services (Appraisal & Attendance)' },
  { label: 'Identity Dependency', value: 'LDAP/SSO access pending verification' },
  { label: 'Gateway Gate', value: 'Bank IT must confirm approved endpoint and schema' },
  { label: 'Security Boundary', value: 'Strict compliance: No direct DB bypass' },
];

// ── TASK 1: IDENTIFY THE BLOCKER ──
export interface BlockerOptionConfig {
  id: Chapter3BlockerChoice;
  badge: string;
  title: string;
  quote: string;
  isCorrect: boolean;
  explanation: string;
}

export const TASK1_BLOCKER_OPTIONS: BlockerOptionConfig[] = [
  {
    id: 'database_overload',
    badge: 'A',
    title: 'Database Overload',
    quote: "The bank's database cannot handle the number of requests.",
    isCorrect: false,
    explanation:
      "The logs indicate HTTP 415 and protocol mismatch during payload serialization, not high load or database timeouts.",
  },
  {
    id: 'protocol_mismatch',
    badge: 'B',
    title: 'Protocol Mismatch',
    quote: "The HRMS expects JSON over REST, while the bank's legacy integration uses SOAP/XML.",
    isCorrect: true,
    explanation:
      'DIAGNOSIS CONFIRMED: The logs identify a protocol mismatch. LDAP/SSO access remains a separate dependency that still needs verification.',
  },
  {
    id: 'expired_credentials',
    badge: 'C',
    title: 'Expired Employee Credentials',
    quote: 'Employee passwords have expired, preventing integration.',
    isCorrect: false,
    explanation:
      "Employee credentials have not expired. The log says 'LDAP/SSO access not verified', which is an unconfirmed network/entitlement dependency.",
  },
  {
    id: 'incorrect_ui',
    badge: 'D',
    title: 'Incorrect UI Configuration',
    quote: 'The HRMS screens are sending the wrong information.',
    isCorrect: false,
    explanation:
      'The UI screens are correctly requesting JSON payloads. The failure originates at the transport and schema layer with the bank ESB.',
  },
];

// ── TASK 2: CHOOSE THE INTEGRATION APPROACH ──
export interface ApproachOptionConfig {
  id: Chapter3ApproachChoice;
  badge: string;
  title: string;
  description: string;
  benefits: string[];
  risks: string[];
  isRecommended: boolean;
  warningText?: string;
}

export const TASK2_APPROACH_OPTIONS: ApproachOptionConfig[] = [
  {
    id: 'direct_database',
    badge: 'Option A',
    title: 'Direct Database Connection',
    description: "Connect directly to the bank's database to avoid the existing integration layer.",
    benefits: ['Appears fast to implement in the short term.'],
    risks: [
      'Bypasses the approved enterprise architecture.',
      'Introduces critical security, audit, and compliance risks.',
      'Direct DB write/read access is strictly forbidden by Bank InfoSec.',
    ],
    isRecommended: false,
    warningText:
      'CRITICAL SECURITY WARNING: Bypassing enterprise service boundaries to connect directly to core banking databases will fail compliance audits and triggers an immediate escalation from Marcus.',
  },
  {
    id: 'custom_converter',
    badge: 'Option B',
    title: 'Unapproved Custom Converter',
    description:
      'Build a standalone SOAP-to-JSON converter without first confirming the approved interface.',
    benefits: ['May temporarily address the format mismatch on local machines.'],
    risks: [
      'Approval and compatibility remain unresolved with Bank IT.',
      'High risk of heavy rework if Bank IT mandates a different schema.',
      'Lacks official enterprise monitoring and gateway governance.',
    ],
    isRecommended: false,
    warningText:
      'REWORK WARNING: Building custom converters before Bank IT approves schemas creates high rework risk. If Bank IT changes the WSDL contract, engineering time is wasted.',
  },
  {
    id: 'approved_gateway',
    badge: 'Option C',
    title: 'Approved Integration Gateway',
    description:
      'Use the bank-approved ESB or API gateway for protocol translation, with Bank IT validating the endpoint and schema.',
    benefits: [
      'Respects the approved enterprise architecture.',
      'Provides a controlled, auditable path for integration testing.',
      'Makes external dependencies explicit and trackable.',
    ],
    risks: ['Requires waiting for Bank IT validation and official schemas.'],
    isRecommended: true,
  },
];

// ── TASK 3: PRIORITIZE THE ACTIONS ──
export interface ActionCardConfig {
  id: Chapter3ActionId;
  code: 'Action A' | 'Action B' | 'Action C' | 'Action D';
  title: string;
  description: string;
  category: 'External Dependency' | 'Identity Dependency' | 'Parallel Engineering' | 'Final Validation';
}

export const TASK3_ACTION_CARDS: Record<Chapter3ActionId, ActionCardConfig> = {
  action_confirm_interface: {
    id: 'action_confirm_interface',
    code: 'Action A',
    title: 'Confirm the approved interface',
    description:
      'Request Bank IT to confirm the approved endpoint and validate the SOAP/XML schema required for the integration.',
    category: 'External Dependency',
  },
  action_verify_auth: {
    id: 'action_verify_auth',
    code: 'Action B',
    title: 'Verify authentication access',
    description:
      "Ask the bank's identity team to verify LDAP/SSO access separately.",
    category: 'Identity Dependency',
  },
  action_prepare_mock_tests: {
    id: 'action_prepare_mock_tests',
    code: 'Action C',
    title: 'Prepare controlled integration tests',
    description:
      'Have Daniel prepare the adapter and local test cases against the approved interface, using non-sensitive mock data while external validation is pending.',
    category: 'Parallel Engineering',
  },
  action_validate_integrate: {
    id: 'action_validate_integrate',
    code: 'Action D',
    title: 'Validate and integrate',
    description:
      'Once the endpoint, schema, and required access are confirmed, perform the controlled integration tests and review the results.',
    category: 'Final Validation',
  },
};

export const REFERENCE_ACTION_ORDER: Chapter3ActionId[] = [
  'action_confirm_interface',
  'action_verify_auth',
  'action_prepare_mock_tests',
  'action_validate_integrate',
];

// ── TAKEAWAYS & CONSTANTS ──
export const CHAPTER3_TITLE = 'The Integration Trap';
export const CHAPTER3_SUBTITLE =
  'Core Banking APIs, SOAP/REST Integration & LDAP/SSO Dependencies';

export const CHAPTER3_LEARNING_POINTS = [
  {
    title: 'Diagnose before acting',
    body: 'Use evidence to distinguish protocol mismatches from authentication issues.',
  },
  {
    title: 'Protect the integration boundary',
    body: 'Use approved interfaces and validate external dependencies rather than taking dangerous shortcuts.',
  },
  {
    title: 'Keep work moving safely',
    body: 'Prepare controlled tests with mock data while waiting for external approvals to protect velocity.',
  },
];

// ── SCORING ENGINE ──
export function computeChapter3Score(
  state: Chapter3State,
  ch2Baseline?: {
    scheduleScore?: number;
    riskScore?: number;
    governanceScore?: number;
    efficiencyScore?: number;
  }
): Chapter3Scorecard {
  const baseSchedule = ch2Baseline?.scheduleScore ?? 80;
  const baseRisk = ch2Baseline?.riskScore ?? 80;
  const baseGov = ch2Baseline?.governanceScore ?? 80;
  const baseEff = ch2Baseline?.efficiencyScore ?? 80;

  let deltaSchedule = 0;
  let deltaRisk = 0;
  let deltaGov = 0;
  let deltaEff = 0;

  // 1. Escalation Decision Evaluation
  if (state.escalationChoice === 'escalate_aarav') {
    deltaSchedule += 15;
    deltaGov += 20;
    deltaEff += 15;
    deltaRisk += 10;
  } else if (state.escalationChoice === 'investigate_independently') {
    deltaSchedule -= state.escalationRecovered ? 5 : 20;
    deltaEff -= state.escalationRecovered ? 10 : 25;
    deltaGov -= state.escalationRecovered ? 5 : 15;
  } else if (state.escalationChoice === 'bypass_gateway') {
    deltaRisk -= state.escalationRecovered ? 15 : 35;
    deltaGov -= state.escalationRecovered ? 10 : 30;
    deltaSchedule -= 15;
  }

  // 2. Task 1: Blocker Identification
  if (state.task1Selected === 'protocol_mismatch') {
    deltaGov += 20;
    deltaRisk += 15;
  } else {
    deltaGov -= 15;
    deltaRisk -= 10;
  }

  // 3. Task 2: Integration Approach
  if (state.task2Selected === 'approved_gateway') {
    deltaRisk += 25;
    deltaGov += 25;
    deltaSchedule += 10;
  } else if (state.task2Selected === 'direct_database') {
    deltaRisk -= state.task2Recovered ? 15 : 40;
    deltaGov -= state.task2Recovered ? 15 : 35;
    deltaSchedule -= 20;
  } else if (state.task2Selected === 'custom_converter') {
    deltaSchedule -= state.task2Recovered ? 10 : 25;
    deltaEff -= state.task2Recovered ? 10 : 25;
    deltaRisk -= 15;
  }

  // 4. Task 3: Sequencing & Nuance Evaluation
  const order = state.task3Order;
  const lastAction = order[order.length - 1];
  const isValidateLast = lastAction === 'action_validate_integrate';

  // Check parallel work recognition: Action C (mocks) before Action D (validation)
  const indexOfC = order.indexOf('action_prepare_mock_tests');
  const indexOfD = order.indexOf('action_validate_integrate');
  const isSafeParallelWorkEarly = indexOfC < indexOfD;

  // Check interface (A) and identity (B) checks placed before final validation
  const indexOfA = order.indexOf('action_confirm_interface');
  const indexOfB = order.indexOf('action_verify_auth');
  const areDependenciesBeforeValidation = indexOfA < indexOfD && indexOfB < indexOfD;

  if (isValidateLast && areDependenciesBeforeValidation) {
    deltaGov += 25;
    deltaRisk += 25;
  } else {
    deltaGov -= 35;
    deltaRisk -= 35;
  }

  if (isSafeParallelWorkEarly) {
    // Reward safe parallel work: keeping developers unblocked with mock tests
    deltaEff += 35;
    deltaSchedule += 15;
  } else {
    // Penalize developers sitting idle waiting for external validation
    deltaEff -= 35;
    deltaSchedule -= 20;
  }

  // Clamping to [10, 100]
  const clamp = (val: number) => Math.min(Math.max(Math.round(val), 10), 100);

  const finalSchedule = clamp(baseSchedule + deltaSchedule);
  const finalRisk = clamp(baseRisk + deltaRisk);
  const finalGov = clamp(baseGov + deltaGov);
  const finalEff = clamp(baseEff + deltaEff);

  const totalScore = Math.round((finalSchedule + finalRisk + finalGov + finalEff) / 4);

  // Outcome determination
  let outcomeType: Chapter3OutcomeType = 'poor';
  if (totalScore >= 85 && (state.task2Selected === 'approved_gateway' || state.task2Recovered) && isValidateLast) {
    outcomeType = 'strong';
  } else if (totalScore >= 65) {
    outcomeType = 'partial';
  } else {
    outcomeType = 'poor';
  }

  // Explanations
  const scheduleExplanation =
    finalSchedule >= 80
      ? 'You protected delivery velocity by running safe local mock tests in parallel with Bank IT approval cycles.'
      : 'Unnecessary delays occurred from either pausing developers completely or chasing unapproved workarounds.';

  const riskExplanation =
    finalRisk >= 80
      ? 'You adhered strictly to enterprise security boundaries, avoiding direct database hacks and unapproved converters.'
      : 'The project carried audit and compliance risk due to attempts to bypass enterprise gateway governance.';

  const governanceExplanation =
    finalGov >= 80
      ? 'You ensured the bank interface schema and LDAP/SSO access dependencies were formally validated before live testing.'
      : 'Governance was compromised by treating unverified dependencies as ready for integration testing.';

  const efficiencyExplanation =
    finalEff >= 80
      ? 'Daniel remained highly productive writing adapters and test suites against mock data while external teams reviewed schemas.'
      : 'Engineering velocity suffered because external dependencies were not separated from mock development.';

  const outcomeText =
    outcomeType === 'strong'
      ? 'The team successfully contained the integration blocker, selected the approved enterprise gateway, and scheduled parallel mock testing without violating bank security.'
      : outcomeType === 'partial'
      ? 'You identified the core integration problem, but experienced friction in dependency sequencing or initial escalation alignment.'
      : 'The integration approach risked enterprise compliance or stalled engineering velocity. Realigning on approved gateway standards is required.';

  // Personalized takeaway line based on player's choices
  let personalizedTakeaway = '';
  if (state.task1Selected === 'protocol_mismatch' && state.task2Selected === 'approved_gateway' && isSafeParallelWorkEarly) {
    personalizedTakeaway =
      'You identified the protocol mismatch and preserved engineering progress while keeping security requirements intact.';
  } else if (state.escalationChoice === 'bypass_gateway' || state.task2Selected === 'direct_database') {
    personalizedTakeaway =
      'You recognized the danger of bypassing enterprise controls and corrected your course before violating bank security policies.';
  } else if (state.escalationChoice === 'investigate_independently') {
    personalizedTakeaway =
      'You learned that technical blockers tied to enterprise architecture require prompt project management escalation rather than isolated developer investigation.';
  } else {
    personalizedTakeaway =
      'You navigated enterprise integration trade-offs, establishing that safe mocks can proceed while external gateway schemas are validated.';
  }

  return {
    shown: true,
    scheduleScore: finalSchedule,
    riskScore: finalRisk,
    governanceScore: finalGov,
    efficiencyScore: finalEff,
    totalScore,
    outcomeType,
    outcomeText,
    personalizedTakeaway,
    explanations: {
      schedule: scheduleExplanation,
      risk: riskExplanation,
      governance: governanceExplanation,
      efficiency: efficiencyExplanation,
    },
  };
}

// ── SESSION STORAGE HELPERS ──
let sessionChapter3State: Chapter3State = { ...INITIAL_CHAPTER3_STATE };

export function getChapter3SessionState(): Chapter3State {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('brained_chapter3_state');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        sessionChapter3State = { ...INITIAL_CHAPTER3_STATE, ...parsed };
      } catch {
        // ignore parse errors
      }
    }
  }
  return { ...sessionChapter3State };
}

export function setChapter3SessionState(
  updater: Partial<Chapter3State> | ((prev: Chapter3State) => Chapter3State)
) {
  if (typeof updater === 'function') {
    sessionChapter3State = updater(sessionChapter3State);
  } else {
    sessionChapter3State = { ...sessionChapter3State, ...updater };
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('brained_chapter3_state', JSON.stringify(sessionChapter3State));
    } catch {
      // ignore localStorage quota errors
    }
  }
}

export function resetChapter3SessionState() {
  sessionChapter3State = {
    ...INITIAL_CHAPTER3_STATE,
    task3Order: [...INITIAL_CHAPTER3_STATE.task3Order],
    scorecard: { ...INITIAL_CHAPTER3_STATE.scorecard },
  };
  if (typeof window !== 'undefined') {
    localStorage.removeItem('brained_chapter3_state');
  }
}
