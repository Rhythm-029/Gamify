/**
 * chapter9Data.ts
 * Data, dialogues, telemetry benchmarks, deterministic scoring, and state helpers
 * for Chapter 9: ROI Validation (Executive Leadership Phase)
 */

import type {
  Chapter9State,
  Chapter9Scorecard,
  Chapter9DecisionChoice,
  RoiTelemetryData,
  RoiFinancialModel,
  PresentationSlide,
  BoardroomDialogue,
  Chapter9OutcomeType,
} from '../types/chapter9';

export const CHAPTER9_TITLE = 'ROI Validation';
export const CHAPTER9_SUBTITLE = 'Executive Leadership Phase — Financial & Operational Impact';
export const CHAPTER9_PROJECT_NAME = 'Project Amigo';
export const CHAPTER9_STAGE_LABEL = 'Presenting Financial & Operational Impact';
export const CHAPTER9_LOCATION = 'Executive Boardroom Presentation Suite';
export const CHAPTER9_TIMELINE = '23:00 – 25:00';

export const CHAPTER9_USP =
  'A project is not truly successful until its business value can be measured and communicated.';
export const CHAPTER9_KEY_TAKEAWAY =
  'Senior PMs do not stop at functional delivery or incident stability. True executive leadership requires translating technical telemetry into measurable financial ROI, operational capacity gains, and strategic justifications that defend capital investment.';

export const CHAPTER9_CHARACTERS = {
  sophia: {
    name: 'Sophia Bennett',
    role: 'Head of HR Operations · Executive Sponsor',
    avatar: '/character/Sophia_bennett/SophiaDP.png',
    affiliation: 'ICICI Bank Executive Leadership',
  },
  vikram: {
    name: 'Vikram Malhotra',
    role: 'Chief Financial Officer (CFO)',
    avatar: '', // Custom monogram in UI
    affiliation: 'ICICI Bank Executive Board',
  },
  marcus: {
    name: 'Marcus Reed',
    role: 'Chief Technology Officer (CTO)',
    avatar: '/character/marcus_reed/MarcusDP.png',
    affiliation: 'Enterprise Technology & Architecture',
  },
  martha: {
    name: 'Martha',
    role: 'Monitoring & Operations Telemetry Specialist',
    avatar: '/character/Emma_Carter/EmmaDP.png',
    affiliation: 'ICICI Bank Ops Telemetry',
  },
  player: {
    name: 'Player (You)',
    role: 'Lead Project Manager · Transformation Consultant',
    avatar: '',
    affiliation: 'Brained Consulting',
  },
  // Backward compatibility alias for any existing state references
  jane: {
    name: 'Player (You)',
    role: 'Lead Project Manager · Transformation Consultant',
    avatar: '',
    affiliation: 'Brained Consulting',
  },
  mark: {
    name: 'Sophia Bennett',
    role: 'Head of HR Operations · Executive Sponsor',
    avatar: '/character/Sophia_bennett/SophiaDP.png',
    affiliation: 'ICICI Bank Executive Leadership',
  },
};

export const ROI_TELEMETRY: RoiTelemetryData = {
  appraisalCycleDaysBefore: 21.0,
  appraisalCycleDaysAfter: 12.2,
  cycleReductionPct: 42.0,
  manHoursSaved: 15000,
  targetEmployeeCount: 80000,
  slaComplianceRate: 99.4,
  errorRateDropPct: 88.5,
  enpsImprovementPts: 28,
  onTimeSubmissionsPct: 96.8,
};

export function computeFinancialModel(
  hourlyRateINR: number = 650,
  phase1InvestmentINR: number = 5500000,
  manHoursSaved: number = 15000
): RoiFinancialModel {
  const totalSavingsINR = Math.round(manHoursSaved * hourlyRateINR);
  const netBenefitINR = totalSavingsINR - phase1InvestmentINR;
  const roiPercentage = Number(((netBenefitINR / phase1InvestmentINR) * 100).toFixed(1));
  const monthlyRunRateSavings = totalSavingsINR / 12;
  const paybackPeriodMonths = Number((phase1InvestmentINR / monthlyRunRateSavings).toFixed(1));

  return {
    hourlyCostRateINR: hourlyRateINR,
    totalSavingsINR,
    phase1InvestmentINR,
    netBenefitINR,
    roiPercentage,
    paybackPeriodMonths,
  };
}

export const PRESENTATION_SLIDES: PresentationSlide[] = [
  {
    id: 1,
    title: 'The Core Business Problem Solved',
    subtitle: 'From Manual Paper Bottlenecks to Automated Cloud Governance',
    category: 'Strategic',
    keyStat: '80,000 Employees',
    bulletPoints: [
      'Eliminated legacy paper appraisal latency across 4,800 retail branches.',
      'Unified attendance sync and biometric verification with zero data loss.',
      'Replaced fragmented offline spreadsheets with single-pane HRMS governance.',
      'Achieved zero compliance penalties under revised Indian Banking IT acts.',
    ],
    takeaway: 'Project Amigo transformed an administrative liability into an automated institutional asset.',
  },
  {
    id: 2,
    title: 'Operational Telemetry & Efficiency Gains',
    subtitle: 'Hard Operational Velocity Metrics Across Mumbai & Regional Hubs',
    category: 'Operational',
    keyStat: '42% Faster Cycle',
    bulletPoints: [
      'Appraisal cycle completion time collapsed from 21 days down to 12.2 days.',
      '15,000 verified operational man-hours saved across branch managers and HR officers.',
      '99.4% SLA adherence on review submissions (up from 61.2% in legacy system).',
      'eNPS (Employee Net Promoter Score) surged by +28 points in post-rollout audit.',
    ],
    takeaway: 'Operational capacity is now reinvested directly into branch customer service and loan underwriting.',
  },
  {
    id: 3,
    title: 'Financial ROI & Capital Justification',
    subtitle: 'Translating Operational Hours into Verifiable Balance Sheet Value',
    category: 'Financial',
    keyStat: '+77.3% Year 1 ROI',
    bulletPoints: [
      'Operational capacity savings: 15,000 hrs × ₹650 blended hourly rate = ₹97.5 Lakhs.',
      'Phase 1 Total Project Investment: ₹55.0 Lakhs (inclusive of infrastructure & rollout).',
      'Net direct financial benefit in Year 1: ₹42.5 Lakhs cash-equivalent productivity value.',
      'Capital Payback Period: Fully amortized in 6.8 months post-deployment.',
    ],
    takeaway: 'The project paid for itself in under 7 months, generating high positive return for shareholders.',
  },
  {
    id: 4,
    title: 'Phase 2 Strategic Roadmap & Recommendation',
    subtitle: 'Expanding Modernization from Foundation to High-Yield Predictive Analytics',
    category: 'Governance',
    keyStat: '6.8 Mo Payback',
    bulletPoints: [
      'Greenlight Phase 2: Dynamic Bonus Calculator & Predictive Attrition Analytics.',
      'Protect existing architectural wins with automated WAF bot mitigations and MFA policies.',
      'Maintain quarterly executive telemetry reporting to preserve audit trail.',
      'Expand self-service modules to eliminate an additional 8,500 manual HR hours in Q4.',
    ],
    takeaway: 'Demonstrated ROI earns executive confidence to fund Phase 2 without budget friction.',
  },
];

export const BOARDROOM_DIALOGUES: Record<string, BoardroomDialogue[]> = {
  telemetry_briefing: [
    {
      id: 'd1',
      speaker: 'Martha',
      role: 'Monitoring & Operations Telemetry Specialist',
      avatar: '/character/Emma_Carter/EmmaDP.png',
      timestamp: '23:05',
      text: 'Sophia, Player, I’ve just finished aggregating the post-rollout APM telemetry from our production clusters across Mumbai, Pune, Bangalore, and Delhi pilot branches.',
      sentiment: 'neutral',
    },
    {
      id: 'd2',
      speaker: 'Martha',
      role: 'Monitoring & Operations Telemetry Specialist',
      avatar: '/character/Emma_Carter/EmmaDP.png',
      timestamp: '23:18',
      text: 'The numbers are astounding: appraisal cycle completion dropped from 21 days down to 12.2 days — that’s a clean 42% reduction. More importantly, we clocked 15,000 verified operational man-hours saved across branch managers.',
      sentiment: 'positive',
    },
    {
      id: 'd3',
      speaker: 'Player',
      role: 'Lead Project Manager · Transformation Consultant',
      avatar: '',
      timestamp: '23:32',
      text: 'Phenomenal data, Martha. But CFO Vikram Malhotra and CTO Marcus Reed won’t release Phase 2 capital on operational hours alone. Vikram wants balance sheet cash-flow realization, and Marcus needs architectural scale assurance.',
      sentiment: 'executive',
    },
    {
      id: 'd4',
      speaker: 'Sophia',
      role: 'Head of HR Operations · Executive Sponsor',
      avatar: '/character/Sophia_bennett/SophiaDP.png',
      timestamp: '23:42',
      text: 'Exactly right. In 15 minutes, the Executive Steering Committee convenes. CFO Vikram Malhotra warned me that without concrete ROI proof, our Phase 2 budget will be frozen. Let us synthesize our financial defense.',
      sentiment: 'urgent',
    },
  ],
  roi_preparation: [
    {
      id: 'd5',
      speaker: 'Player',
      role: 'Lead Project Manager · Transformation Consultant',
      avatar: '',
      timestamp: '23:48',
      text: 'Let’s translate the operational win into financial reality: 15,000 hours saved across branch staff at ICICI’s blended ₹650/hr rate equals ₹97.5 Lakhs in annual capacity value.',
      sentiment: 'executive',
    },
    {
      id: 'd6',
      speaker: 'Martha',
      role: 'Monitoring & Operations Telemetry Specialist',
      avatar: '/character/Emma_Carter/EmmaDP.png',
      timestamp: '24:02',
      text: 'Against our ₹55 Lakh Phase 1 capital expenditure, that yields a Net Financial Benefit of ₹42.5 Lakhs in Year 1 alone!',
      sentiment: 'positive',
    },
    {
      id: 'd7',
      speaker: 'Player',
      role: 'Lead Project Manager · Transformation Consultant',
      avatar: '',
      timestamp: '24:14',
      text: 'Exactly. That is a +77.3% Net ROI with a full capital payback period of just 6.8 months. We have a waterproof business case to present to Vikram and Marcus.',
      sentiment: 'positive',
    },
  ],
  boardroom_decision: [
    {
      id: 'd8',
      speaker: 'Sophia',
      role: 'Head of HR Operations · Executive Sponsor',
      avatar: '/character/Sophia_bennett/SophiaDP.png',
      timestamp: '24:25',
      text: 'The Executive Boardroom doors are opening. CFO Vikram Malhotra and CTO Marcus Reed are taking their seats alongside the Committee. How do you want to lead this presentation?',
      sentiment: 'urgent',
    },
    {
      id: 'd9',
      speaker: 'Player',
      role: 'Lead Project Manager · Transformation Consultant',
      avatar: '',
      timestamp: '24:35',
      text: 'We have two approaches: some PMs skip formal ROI and assume technical delivery speaks for itself. Others present the rigorous business model and defend technical scale. It’s decision time.',
      sentiment: 'executive',
    },
  ],
  choice_b_reaction: [
    {
      id: 'd10',
      speaker: 'Sophia',
      role: 'Head of HR Operations · Executive Sponsor',
      avatar: '/character/Sophia_bennett/SophiaDP.png',
      timestamp: '24:45',
      text: 'Outstanding delivery! CFO Vikram Malhotra commended our commercial rigor, noting this was the first technology review where a PM spoke the language of EBITDA, payback velocity, and workforce productivity.',
      sentiment: 'positive',
    },
    {
      id: 'd11',
      speaker: 'Martha',
      role: 'Monitoring & Operations Telemetry Specialist',
      avatar: '/character/Emma_Carter/EmmaDP.png',
      timestamp: '24:52',
      text: 'CTO Marcus Reed and the Steering Committee ratified our 4-wave rollout across all 4,800 branches and formally approved the full Phase 2 budget without a single deduction!',
      sentiment: 'positive',
    },
  ],
  choice_a_reaction: [
    {
      id: 'd12',
      speaker: 'Sophia',
      role: 'Head of HR Operations · Executive Sponsor',
      avatar: '/character/Sophia_bennett/SophiaDP.png',
      timestamp: '24:45',
      text: 'That did not go well. Because we presented no quantitative financial justification, CFO Vikram Malhotra concluded Project Amigo was an expensive vanity project.',
      sentiment: 'urgent',
    },
    {
      id: 'd13',
      speaker: 'Sophia',
      role: 'Head of HR Operations · Executive Sponsor',
      avatar: '/character/Sophia_bennett/SophiaDP.png',
      timestamp: '24:55',
      text: 'They just placed Phase 2 under indefinite audit hold. Completing tickets isn’t enough if you cannot prove business value to the leaders writing the checks.',
      sentiment: 'urgent',
    },
  ],
};

export const CHAPTER9_DECISION_OPTIONS = {
  choice_a: {
    id: 'choice_a' as Chapter9DecisionChoice,
    title: 'Option A — Standard Delivery Overview',
    subtitle: 'Focus on project deployment completion without monetary modeling',
    riskLabel: 'Strategic Option A',
    description:
      'Present high-level slides indicating the system is live in production without showing hourly cost conversions or payback models.',
    scores: {
      schedule: 0,
      deliveryGovernance: -20,
      trustRisk: -15,
      efficiency: -10,
    },
    executiveConsequence:
      'The CFO questions the financial utility of Project Amigo. With zero verifiable ROI data, the executive board freezes Phase 2 funding and orders an independent capital audit.',
  },
  choice_b: {
    id: 'choice_b' as Chapter9DecisionChoice,
    title: 'Option B — Detailed Business Value Presentation',
    subtitle: 'Present operational telemetry translated into monetary ROI and payback models',
    riskLabel: 'Strategic Option B',
    description:
      'Present the complete executive ROI deck: 42% appraisal cycle drop, 15,000 man-hours converted into ₹97.5 Lakhs savings, +77.3% Net ROI, and 6.8-month capital payback period.',
    scores: {
      schedule: +15,
      deliveryGovernance: +25,
      trustRisk: +20,
      efficiency: +15,
    },
    executiveConsequence:
      'Unanimous executive endorsement. The Steering Committee applauds the financial acumen, ratifies Phase 1 business success, and immediately authorizes Phase 2 capital allocation.',
  },
};

/**
 * Deterministic scoring engine for Chapter 9
 * Hardcoded exact values as requested:
 * Choice A: Delivery Governance: -20, Trust & Risk Management: -15
 * Choice B: Schedule / Timeline: +15, Delivery Governance: +25, Trust & Risk Management: +20
 */
export function computeChapter9Score(
  state: Chapter9State,
  baselineScores: { schedule: number; risk: number; governance: number; efficiency: number } = {
    schedule: 70,
    risk: 65,
    governance: 65,
    efficiency: 70,
  }
): Chapter9Scorecard {
  const isChoiceB = state.decisionChosen === 'choice_b';
  const isChoiceA = state.decisionChosen === 'choice_a';

  let deltaSchedule = 0;
  let deltaGov = 0;
  let deltaRisk = 0;
  let deltaEff = 0;

  let telemetryScore = state.telemetryReviewed ? 25 : 15;
  let financialScore = state.financialModelReviewed ? 25 : 15;
  let decisionScore = 0;

  if (isChoiceB) {
    deltaSchedule = +15;
    deltaGov = +25;
    deltaRisk = +20;
    deltaEff = +15;
    decisionScore = 50;
  } else if (isChoiceA) {
    deltaSchedule = 0;
    deltaGov = -20;
    deltaRisk = -15;
    deltaEff = -10;
    decisionScore = 10;
  }

  const finalSchedule = Math.min(100, Math.max(0, baselineScores.schedule + deltaSchedule));
  const finalRisk = Math.min(100, Math.max(0, baselineScores.risk + deltaRisk));
  const finalGov = Math.min(100, Math.max(0, baselineScores.governance + deltaGov));
  const finalEff = Math.min(100, Math.max(0, baselineScores.efficiency + deltaEff));

  const totalScore = Math.round(
    finalGov * 0.35 + finalRisk * 0.25 + finalSchedule * 0.2 + finalEff * 0.2
  );

  let outcomeType: Chapter9OutcomeType = 'strong';
  let outcomeTitle = 'EXECUTIVE ROI VALIDATION ACCLAIM';
  let outcomeText =
    'Outstanding executive leadership. You proved that engineering execution translates directly into strategic balance-sheet value (+77.3% Net ROI), securing unanimous board backing.';

  if (isChoiceA) {
    outcomeType = 'incomplete';
    outcomeTitle = 'CRITICAL ROI COMMUNICATION FAILURE';
    outcomeText =
      'Delivery governance collapsed. Assuming leadership knows project value without hard financial evidence caused the Board to freeze Phase 2 and doubt the entire transformation.';
  } else if (totalScore < 85) {
    outcomeType = 'mixed';
    outcomeTitle = 'ACCEPTABLE BUSINESS VALUE WITH GAPS';
    outcomeText =
      'ROI validated with executive approval, but deeper telemetry modeling and faster presentation cadence could have strengthened your capital justification.';
  }

  const whatYouDidWell = isChoiceB
    ? 'Synthesized 15,000 operational hours into ₹97.5 Lakhs balance sheet capacity; articulated the 6.8-month payback period; defended the business case with confidence before the steering committee.'
    : 'Maintained operational stability and noted baseline telemetry metrics from Mumbai and Pune.';

  const whatToImprove = isChoiceB
    ? 'Continue monitoring post-Q3 branch adoption to verify that the 15,000 saved hours continue converting into retail revenue.'
    : 'Never assume leadership or the CFO inherently understands technical wins. Projects that cannot communicate financial ROI face budget cancellation.';

  const executiveFeedback = isChoiceB
    ? 'Sophia Bennett (Head of HR): "You demonstrated the mindset of a true business partner. Translating technical telemetry into financial EBITDA impact and addressing CFO Vikram Malhotra and CTO Marcus Reed gave the Board full confidence to fund Phase 2."'
    : 'Vikram Malhotra (CFO): "The executive committee refused to release Phase 2 capital. Technical delivery without quantifiable balance sheet impact is treated as operational overhead."';

  return {
    shown: true,
    scheduleScore: finalSchedule,
    riskScore: finalRisk,
    governanceScore: finalGov,
    efficiencyScore: finalEff,
    totalScore,
    breakdown: {
      telemetryAnalysisScore: telemetryScore,
      financialModelingScore: financialScore,
      executiveDecisionScore: decisionScore,
    },
    decisionChosen: state.decisionChosen || undefined,
    outcomeType,
    outcomeTitle,
    outcomeText,
    whatYouDidWell,
    whatToImprove,
    keyTakeaway: CHAPTER9_KEY_TAKEAWAY,
    executiveFeedback,
    explanations: {
      schedule: isChoiceB
        ? `Timeline accelerated by +15 pts. Executive clarity eliminates bureaucratic review delays for future sprints.`
        : `Schedule neutral (0 pts). Without ROI validation, future milestones stall in budget committees.`,
      governance: isChoiceB
        ? `Delivery Governance boosted by +25 pts. Rigorous financial translation sets the gold standard for PM leadership.`
        : `Delivery Governance penalized by -20 pts. Failure to report ROI violates fundamental PM governance standards.`,
      risk: isChoiceB
        ? `Trust & Risk boosted by +20 pts. Boardroom alignment de-risks future funding and organizational adoption.`
        : `Trust & Risk penalized by -15 pts. The project lost executive sponsor confidence.`,
      efficiency: isChoiceB
        ? `Efficiency elevated by +15 pts. Quantifying 15,000 hours saved unlocks ongoing operational optimization.`
        : `Efficiency dropped by -10 pts. Operational wins remained unharvested at the executive level.`,
    },
    aiEvaluated: false,
    evaluatedAt: new Date().toISOString(),
    evaluatorName: 'Sophia Bennett, Vikram Malhotra (CFO) & Marcus Reed (CTO)',
    evaluatorRole: 'Executive Steering Committee · ICICI Bank',
  };
}

export const INITIAL_CHAPTER9_STATE: Chapter9State = {
  currentStage: 'telemetry_briefing',
  timelineTimestamp: '23:00',
  selectedTab: 'telemetry',
  currentSlideIndex: 0,
  telemetryReviewed: false,
  telemetryVerified: false,
  financialModelReviewed: false,
  financialModelCommitted: false,
  financialScenario: 'base',
  slidesReviewed: false,
  slidesApproved: false,
  cfoDefenseAnswer: null,
  hourlyCostRateINR: 650,
  decisionChosen: null,
  boardroomRoomOpened: false,
  callInitiated: false,
  meetingCompleted: false,
  callCompleted: false,
  completed: false,
  auditResolution: 'deduct_delhi',
  auditedHours: 14150,
  reinvestmentStrategy: 'casa_cross_sell',
  executiveFraming: 'commercial_value',
  cfoChallengeAnswer: 'revenue_tied',
  cooChallengeAnswer: 'canary_sharding',
  scorecard: {
    shown: false,
    scheduleScore: 70,
    riskScore: 65,
    governanceScore: 65,
    efficiencyScore: 70,
    totalScore: 67,
    breakdown: {
      telemetryAnalysisScore: 0,
      financialModelingScore: 0,
      executiveDecisionScore: 0,
    },
    outcomeType: 'incomplete',
    outcomeTitle: 'PENDING EXECUTIVE BOARDROOM DECISION',
    outcomeText: 'Present the business impact of Project Amigo to the Executive Steering Committee.',
    whatYouDidWell: '',
    whatToImprove: '',
    keyTakeaway: CHAPTER9_KEY_TAKEAWAY,
    executiveFeedback: '',
    explanations: {
      schedule: 'Pending presentation.',
      risk: 'Pending presentation.',
      governance: 'Pending presentation.',
      efficiency: 'Pending presentation.',
    },
  },
};

const CHAPTER9_STORAGE_KEY = 'brained_os_chapter9_state_v1';

export function getChapter9SessionState(): Chapter9State {
  if (typeof window === 'undefined') return { ...INITIAL_CHAPTER9_STATE };
  try {
    const raw =
      sessionStorage.getItem(CHAPTER9_STORAGE_KEY) ||
      localStorage.getItem('brained_chapter9_state');
    if (!raw) return { ...INITIAL_CHAPTER9_STATE };
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_CHAPTER9_STATE,
      ...parsed,
      scorecard: {
        ...INITIAL_CHAPTER9_STATE.scorecard,
        ...(parsed.scorecard || {}),
        breakdown: {
          ...INITIAL_CHAPTER9_STATE.scorecard.breakdown,
          ...(parsed.scorecard?.breakdown || {}),
        },
      },
    };
  } catch (e) {
    console.error('Error loading Chapter 9 state:', e);
    return { ...INITIAL_CHAPTER9_STATE };
  }
}

export function setChapter9SessionState(state: Chapter9State): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CHAPTER9_STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem('brained_chapter9_state', JSON.stringify(state));
  } catch (e) {
    console.error('Error saving Chapter 9 state:', e);
  }
}

export function resetChapter9SessionState(): Chapter9State {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(CHAPTER9_STORAGE_KEY);
      localStorage.removeItem('brained_chapter9_state');
    } catch (e) {}
  }
  return { ...INITIAL_CHAPTER9_STATE };
}
