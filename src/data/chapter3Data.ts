import type {
  Chapter3State,
  Chapter3Scorecard,
  Chapter3UatDocument,
  Chapter3PathType,
} from '../types/chapter3';

export const DANIEL_UAT_REQUEST_MESSAGE = `Hey, we're getting ready to set up the UAT environment for Project Amigo. Before I start configuring everything, I need a few details from the bank's IT team.

Could you get these five things confirmed?

1. UAT server IP address or hostname.
2. API base URL and gateway details.
3. Login API endpoint and authentication method.
4. UAT test-user accounts and access procedure.
5. Network access requirements, including firewall allowlisting and proxy configuration.

Can you coordinate with Sophia and send me the confirmed details? I'd rather get everything right before we start connecting things.`;

export const PREPOPULATED_EMAIL_TO_SOPHIA = {
  to: 'Sophia Bennett (Client Sponsor · ICICI Bank)',
  email: 'sophia.bennett@icici.example.in',
  subject: 'Project Amigo — UAT Setup Details',
  body: `Hi Sophia,

Our development team is preparing the UAT environment for Project Amigo. Could you please help us confirm the server details, API endpoints, login integration, test-user access, and network requirements?

We need these details to configure the environment and prepare for integration testing.

Thanks!`,
};

export const SOPHIA_FOLLOWUP_DRAFT =
  'Thanks, Sophia. Could you also confirm the network access requirements for the development team, including firewall allowlisting and proxy configuration?';

export const UAT_DETAILS_V1_DOC: Chapter3UatDocument = {
  version: 'v1',
  filename: 'Project_Amigo_UAT_Details_v1.pdf',
  title: 'PROJECT AMIGO — UAT ENVIRONMENT DETAILS',
  preparedBy: 'Client HR/IT Coordination Team',
  items: [
    {
      no: 1,
      item: 'UAT server',
      confirmedDetails: '10.24.16.20',
      isConfirmed: true,
      notes: 'Designated virtual application host in bank staging zone.',
    },
    {
      no: 2,
      item: 'API base URL',
      confirmedDetails: 'https://uat-api.icici.example.in/hrms/v1',
      isConfirmed: true,
      notes: 'Reverse proxy gateway routing to HRMS staging microservices.',
    },
    {
      no: 3,
      item: 'Login API',
      confirmedDetails: 'POST /auth/login; token-based authentication',
      isConfirmed: true,
      notes: 'Enterprise SSO payload returning bearer session tokens.',
    },
    {
      no: 4,
      item: 'Test-user access',
      confirmedDetails:
        'Test accounts will be provisioned through the bank\'s identity and access management team.',
      isConfirmed: true,
      notes: 'Synthetic sample accounts representing employee and branch manager roles.',
    },
  ],
  note: 'These are the details currently available from our team. Any access credentials will be shared through the bank\'s approved secure channel.',
};

export const UAT_DETAILS_V2_DOC: Chapter3UatDocument = {
  version: 'v2',
  filename: 'Project_Amigo_UAT_Details_v2.pdf',
  title: 'PROJECT AMIGO — UAT ENVIRONMENT DETAILS',
  preparedBy: 'Client HR/IT Coordination Team',
  items: [
    {
      no: 1,
      item: 'UAT server',
      confirmedDetails: '10.24.16.20',
      isConfirmed: true,
      notes: 'Designated virtual application host in bank staging zone.',
    },
    {
      no: 2,
      item: 'API base URL',
      confirmedDetails: 'https://uat-api.icici.example.in/hrms/v1',
      isConfirmed: true,
      notes: 'Reverse proxy gateway routing to HRMS staging microservices.',
    },
    {
      no: 3,
      item: 'Login API',
      confirmedDetails: 'POST /auth/login; token-based authentication',
      isConfirmed: true,
      notes: 'Enterprise SSO payload returning bearer session tokens.',
    },
    {
      no: 4,
      item: 'Test-user access',
      confirmedDetails:
        'Test accounts provisioned through the bank\'s identity and access management team.',
      isConfirmed: true,
      notes: 'Synthetic sample accounts representing employee and branch manager roles.',
    },
    {
      no: 5,
      item: 'Network access',
      confirmedDetails:
        'Bank IT must confirm the required firewall allowlisting and proxy configuration before connectivity testing.',
      isConfirmed: true,
      notes: 'Prerequisite gate assigned to Bank IT Infrastructure Security team.',
    },
  ],
  note: 'That\'s the complete set of setup details currently available. IT will confirm when the network access configuration is ready.',
};

export const INITIAL_CHAPTER3_SCORECARD: Chapter3Scorecard = {
  shown: false,
  scheduleScore: 0,
  riskScore: 0,
  governanceScore: 0,
  efficiencyScore: 0,
  totalScore: 0,
  outcomeType: 'partial',
  outcomeTitle: '',
  outcomeText: '',
  personalizedTakeaway: '',
  learningInsight: '',
  behaviours: {
    requirementCompleteness: {
      score: 0,
      passed: false,
      feedback: '',
    },
    stakeholderCommunication: {
      score: 0,
      passed: false,
      feedback: '',
    },
    deliveryCoordination: {
      score: 0,
      passed: false,
      feedback: '',
    },
  },
  explanations: {
    schedule: '',
    risk: '',
    governance: '',
    efficiency: '',
  },
};

export const INITIAL_CHAPTER3_STATE: Chapter3State = {
  step: 'daniel_initial_request',
  pathTaken: null,

  danielRequestRead: true,

  emailSubject: PREPOPULATED_EMAIL_TO_SOPHIA.subject,
  emailBody: PREPOPULATED_EMAIL_TO_SOPHIA.body,
  emailSentAt: null,

  sophiaTyping: false,
  v1Delivered: false,
  v1Document: UAT_DETAILS_V1_DOC,
  documentViewerOpen: false,
  currentViewingDoc: null,

  firstForwardTarget: null,
  playerFollowUpMessage: SOPHIA_FOLLOWUP_DRAFT,
  playerFollowUpSent: false,
  playerIdentifiedNetworkGap: false,

  v2Delivered: false,
  v2Document: UAT_DETAILS_V2_DOC,

  sentV1ToDaniel: false,
  danielPromptedForNetwork: false,

  v2SentToDaniel: false,
  danielFinalConfirmed: false,
  aaravSummaryGiven: false,

  activeChatRecipient: 'daniel',

  portalAccessGranted: false,
  meetingStatus: 'calling',
  finalReviewComplete: false,
  task3Submitted: false,

  scorecard: INITIAL_CHAPTER3_SCORECARD,
  completed: false,
};

const CHAPTER3_STORAGE_KEY = 'brained_chapter3_uat_session_state';
let sessionChapter3State: Chapter3State = { ...INITIAL_CHAPTER3_STATE };

export function getChapter3SessionState(): Chapter3State {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(CHAPTER3_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        sessionChapter3State = {
          ...INITIAL_CHAPTER3_STATE,
          ...parsed,
          v1Document: UAT_DETAILS_V1_DOC,
          v2Document: UAT_DETAILS_V2_DOC,
        };
      }
    } catch (err) {
      console.error('Failed to load Chapter 3 state from localStorage:', err);
    }
  }
  return sessionChapter3State;
}

export function setChapter3SessionState(state: Partial<Chapter3State>): void {
  sessionChapter3State = {
    ...sessionChapter3State,
    ...state,
  };
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(CHAPTER3_STORAGE_KEY, JSON.stringify(sessionChapter3State));
    } catch (err) {
      console.error('Failed to save Chapter 3 state to localStorage:', err);
    }
  }
}

/**
 * Evaluates the player's performance in Chapter 3 according to the 3 behaviors:
 * A. Requirement completeness (Compared 5 vs 4 items, found network gap)
 * B. Stakeholder communication (Asked Sophia professionally without vague demands)
 * C. Delivery coordination (Forwarded complete v2 & acknowledged IT network approval gate)
 */
export function computeChapter3Score(state: Chapter3State): Chapter3Scorecard {
  const isFullCredit = state.pathTaken === 'full_credit';
  const isRecovery = state.pathTaken === 'recovery';

  // Evaluate communication message quality
  const msgLower = (state.playerFollowUpMessage || '').toLowerCase();
  const mentionsNetwork =
    msgLower.includes('network') ||
    msgLower.includes('firewall') ||
    msgLower.includes('proxy') ||
    msgLower.includes('allowlist') ||
    msgLower.includes('port');
  const isProfessional = msgLower.length > 20 && !msgLower.includes('give me') && !msgLower.includes('hurry');

  if (isFullCredit) {
    return {
      shown: true,
      scheduleScore: 96,
      riskScore: 95,
      governanceScore: 100,
      efficiencyScore: 95,
      totalScore: 96,
      outcomeType: 'strong',
      outcomeTitle: 'Exemplary UAT Prerequisite Governance',
      outcomeText:
        'You cross-referenced developer prerequisites against client deliverables, caught the missing network configuration item before forwarding, and ensured the engineering team had full clarity on pending bank approvals.',
      personalizedTakeaway:
        'By auditing Sophia\'s v1 delivery against Daniel\'s checklist, you prevented a premature integration attempt and saved the sprint from blocked connectivity cycles.',
      learningInsight:
        'Never forward client technical packages directly to developers without auditing them against engineering prerequisites. Catching omissions early prevents downstream blockers and establishes professional authority.',
      behaviours: {
        requirementCompleteness: {
          score: 100,
          passed: true,
          feedback:
            'Independently audited Daniel\'s 5 requirements against Sophia\'s 4 confirmed items and identified the missing network access requirement.',
        },
        stakeholderCommunication: {
          score: mentionsNetwork && isProfessional ? 100 : mentionsNetwork ? 90 : 85,
          passed: true,
          feedback:
            'Sent a polite, targeted follow-up to Sophia requesting firewall allowlisting and proxy details without introducing ambiguity.',
        },
        deliveryCoordination: {
          score: 95,
          passed: true,
          feedback:
            'Delivered complete v2 specification to Daniel while explicitly noting that network clearance remains an active bank IT prerequisite.',
        },
      },
      explanations: {
        schedule:
          'Proactive requirement verification eliminated developer idle time and prevented false-start configuration cycles.',
        risk:
          'Clarified firewall and proxy ownership upfront, preventing unapproved gateway circumvention.',
        governance:
          'Maintained strict audit trail of client configuration items and distinguished confirmed specs from pending IT approvals.',
        efficiency:
          'Achieved first-time-right handoff to engineering with all 5 environment prerequisites verified.',
      },
    };
  }

  if (isRecovery) {
    return {
      shown: true,
      scheduleScore: 82,
      riskScore: 78,
      governanceScore: 85,
      efficiencyScore: 78,
      totalScore: 81,
      outcomeType: 'partial',
      outcomeTitle: 'Resolved with Developer Prompting',
      outcomeText:
        'You forwarded the incomplete v1 document to Daniel first, but quickly recovered when prompted, contacted Sophia for the missing firewall details, and completed the delivery pack.',
      personalizedTakeaway:
        'Good recovery upon developer feedback. In future sprints, conduct the prerequisite check before passing information to engineering to avoid unnecessary communication hops.',
      learningInsight:
        'Developer prompts are valuable safeguards, but relying on engineering to audit client inputs slows delivery velocity. The project manager should act as the primary quality filter.',
      behaviours: {
        requirementCompleteness: {
          score: 75,
          passed: true,
          feedback:
            'Initial forwarding omitted network access requirements. Corrected after Daniel flagged the gap in connectivity prerequisites.',
        },
        stakeholderCommunication: {
          score: mentionsNetwork && isProfessional ? 90 : 85,
          passed: true,
          feedback:
            'Follow-up message to Sophia was professional and secured the updated v2 document promptly.',
        },
        deliveryCoordination: {
          score: 82,
          passed: true,
          feedback:
            'Delivered v2 to Daniel successfully, though the additional handoff cycle added slight friction.',
        },
      },
      explanations: {
        schedule:
          'A minor delay was introduced by forwarding v1 before verifying all 5 checklist items with Sophia.',
        risk:
          'Risk was mitigated before implementation began, though developer intervention was needed to catch the omission.',
        governance:
          'Proper documentation was ultimately secured, but initial review lacked independent verification.',
        efficiency:
          'Additional communication cycles between Daniel, Sophia, and PM reduced team velocity.',
      },
    };
  }

  // Incomplete / Unresolved path
  return {
    shown: true,
    scheduleScore: 58,
    riskScore: 52,
    governanceScore: 55,
    efficiencyScore: 58,
    totalScore: 56,
    outcomeType: 'poor',
    outcomeTitle: 'Unresolved Infrastructure Blockers',
    outcomeText:
      'Configuration was initiated without confirming network access, firewall allowlisting, or proxy requirements, leaving engineering vulnerable to connectivity failures.',
    personalizedTakeaway:
      'Environment setup was greenlit without all five prerequisites confirmed. When testing begins, unapproved firewall gates will halt development.',
    learningInsight:
      'Technical prerequisites are gates, not suggestions. Greenlighting developer configuration without network and security clearances creates immediate sprint failure.',
    behaviours: {
      requirementCompleteness: {
        score: 50,
        passed: false,
        feedback:
          'Failed to cross-reference Daniel\'s 5 items with Sophia\'s response. Network access was never confirmed.',
      },
      stakeholderCommunication: {
        score: 60,
        passed: false,
        feedback:
          'Did not follow up with Sophia to request the missing firewall and proxy configuration.',
      },
      deliveryCoordination: {
        score: 55,
        passed: false,
        feedback:
          'Allowed engineering to proceed with an incomplete environment specification.',
      },
    },
    explanations: {
      schedule:
        'Unconfirmed network access will cause immediate blockers when the team attempts integration testing.',
      risk:
        'High probability of bank firewall rejection and security policy violation.',
      governance:
        'Incomplete handoff pack violates enterprise infrastructure readiness standards.',
      efficiency:
        'Developer time will be lost troubleshooting connectivity issues that could have been resolved upfront.',
    },
  };
}

export function resetChapter3SessionState(): void {
  sessionChapter3State = { ...INITIAL_CHAPTER3_STATE };
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(CHAPTER3_STORAGE_KEY);
      window.localStorage.removeItem('brained_chapter3_state');
    } catch (err) {
      console.error('Failed to reset Chapter 3 state:', err);
    }
  }
}

