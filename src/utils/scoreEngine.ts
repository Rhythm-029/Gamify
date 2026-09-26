/**
 * scoreEngine.ts — Deterministic local scoring for Project Titan.
 *
 * 7 dimensions, 100 points total. Pure function of GameState.
 * No LLM. No network. Works fully offline.
 *
 * Called by FinalReportScreen to render the score breakdown.
 */

import type { GameState } from '../context/GameContext';

// ── Dimension weights (must sum to 100) ───────────────────────────────────────

export const DIMENSIONS = {
  kickoff_engagement:     { label: 'Kickoff Engagement',       weight: 10, icon: 'users' },
  stakeholder_management: { label: 'Stakeholder Management',   weight: 20, icon: 'network' },
  requirement_discovery:  { label: 'Requirement Discovery',    weight: 20, icon: 'file-search' },
  delivery_execution:     { label: 'Delivery & Execution',     weight: 20, icon: 'zap' },
  documentation:          { label: 'Documentation Quality',    weight: 10, icon: 'file-text' },
  communication:          { label: 'Communication & Speed',    weight: 10, icon: 'message-square' },
  security_awareness:     { label: 'Security Awareness',       weight: 10, icon: 'shield' },
} as const;

export type DimensionId = keyof typeof DIMENSIONS;

export interface DimensionScore {
  id: DimensionId;
  label: string;
  weight: number;
  rawScore: number;
  weightedScore: number;
  grade: 'excellent' | 'good' | 'developing' | 'missed';
  breakdown: string;
}

export interface ScoreReport {
  dimensions: DimensionScore[];
  totalScore: number;
  percentile: number;
  outcome: 'excellent' | 'strong' | 'developing' | 'needs_improvement';
  strengths: string[];
  areasToGrow: string[];
  requirementsFound: number;
  totalRequirements: number;
  stakeholdersEngaged: number;
}

// ── Main scoring function ─────────────────────────────────────────────────────

export function computeScore(state: GameState): ScoreReport {
  const signals = state.signals;
  const sigSum = (dim: string) =>
    signals.filter(s => s.dimension === dim).reduce((a, s) => a + s.value, 0);

  const features = state.prototypeFeatures;
  const discovered = features.filter(f => f.discovered);
  const included = features.filter(f => f.included);
  const totalFeatures = features.length;

  // 1. Kickoff Engagement (10 pts)
  let kickoffRaw = 0;
  if (state.meetingState.kickoffDone) {
    kickoffRaw = 40;
    if (state.meetingState.kickoffCameraOn) kickoffRaw += 30;
    if (state.meetingState.kickoffMicOn) kickoffRaw += 30;
  }
  kickoffRaw = Math.min(kickoffRaw, 100);

  // 2. Stakeholder Management (20 pts)
  const engagedCount = Object.values(state.stakeholderContacted).filter(Boolean).length;
  let stakeholderRaw = Math.round((engagedCount / 4) * 70);
  stakeholderRaw += Math.min(Math.max(sigSum('stakeholder_management'), 0), 30);
  stakeholderRaw = Math.min(stakeholderRaw, 100);

  // 3. Requirement Discovery (20 pts)
  let reqRaw = Math.round((discovered.length / totalFeatures) * 70);
  const inclusionPct = discovered.length > 0 ? included.length / discovered.length : 0;
  reqRaw += Math.round(inclusionPct * 30);
  reqRaw = Math.min(reqRaw, 100);

  // 4. Delivery & Execution (20 pts)
  let deliveryRaw = 0;
  if (state.prototypeBuilt) {
    deliveryRaw += 50;
    if (included.length >= 8) deliveryRaw += 30;
    else if (included.length >= 5) deliveryRaw += 20;
    else if (included.length >= 3) deliveryRaw += 10;
    if (state.meetingState.prototypeReviewDone) deliveryRaw += 20;
  }
  deliveryRaw = Math.min(deliveryRaw, 100);

  // 5. Documentation Quality (10 pts)
  let docRaw = 0;
  if (state.meetingState.momSubmitted) {
    const momLen = state.meetingState.momText.length;
    const keywords = ['requirement','feature','login','sso','dashboard','leave','payroll','rbac','attendance','approval','audit','daniel','marcus','emma','action'];
    const kw = keywords.filter(k => state.meetingState.momText.toLowerCase().includes(k)).length;
    docRaw += momLen > 400 ? 50 : momLen > 200 ? 35 : momLen > 80 ? 20 : 10;
    docRaw += Math.min(kw * 4, 50);
  }
  docRaw = Math.min(docRaw, 100);

  // 6. Communication & Speed (10 pts)
  const commRaw = Math.min(Math.max(sigSum('communication'), 0), 100);

  // 7. Security Awareness (10 pts)
  const rbacIncluded = features.find(f => f.id === 'req_rbac')?.included ?? false;
  const auditDiscovered = features.find(f => f.id === 'req_audit_logs')?.discovered ?? false;
  let securityRaw = 0;
  if (state.stakeholderContacted['daniel']) securityRaw += 30;
  if (rbacIncluded) securityRaw += 35;
  if (auditDiscovered) securityRaw += 35;
  securityRaw = Math.min(securityRaw, 100);

  function grade(raw: number): DimensionScore['grade'] {
    if (raw >= 75) return 'excellent';
    if (raw >= 50) return 'good';
    if (raw >= 20) return 'developing';
    return 'missed';
  }

  const dimensions: DimensionScore[] = [
    {
      id: 'kickoff_engagement', label: DIMENSIONS.kickoff_engagement.label, weight: DIMENSIONS.kickoff_engagement.weight,
      rawScore: kickoffRaw, weightedScore: Math.round(kickoffRaw * 10 / 100), grade: grade(kickoffRaw),
      breakdown: state.meetingState.kickoffDone
        ? (state.meetingState.kickoffCameraOn ? 'Attended with camera on. The team noticed.' : 'Attended but kept camera off. Camera presence signals commitment.')
        : 'Kickoff attendance not confirmed. A shaky start to any engagement.',
    },
    {
      id: 'stakeholder_management', label: DIMENSIONS.stakeholder_management.label, weight: DIMENSIONS.stakeholder_management.weight,
      rawScore: stakeholderRaw, weightedScore: Math.round(stakeholderRaw * 20 / 100), grade: grade(stakeholderRaw),
      breakdown: engagedCount >= 4 ? 'Engaged all four key stakeholders. Proactive relationship management throughout.'
        : engagedCount >= 2 ? `Engaged ${engagedCount} of 4 stakeholders. Some relationships were not built.`
        : `Only ${engagedCount} stakeholder(s) contacted. Significant coverage gaps.`,
    },
    {
      id: 'requirement_discovery', label: DIMENSIONS.requirement_discovery.label, weight: DIMENSIONS.requirement_discovery.weight,
      rawScore: reqRaw, weightedScore: Math.round(reqRaw * 20 / 100), grade: grade(reqRaw),
      breakdown: discovered.length >= 10 ? `Discovered ${discovered.length}/${totalFeatures} requirements including hidden ones. Excellent coverage.`
        : discovered.length >= 7 ? `Found ${discovered.length}/${totalFeatures} requirements. Some hidden requirements were missed.`
        : `Only ${discovered.length}/${totalFeatures} requirements uncovered. Key features were overlooked.`,
    },
    {
      id: 'delivery_execution', label: DIMENSIONS.delivery_execution.label, weight: DIMENSIONS.delivery_execution.weight,
      rawScore: deliveryRaw, weightedScore: Math.round(deliveryRaw * 20 / 100), grade: grade(deliveryRaw),
      breakdown: state.prototypeBuilt
        ? `Prototype built with ${included.length} features. ${state.meetingState.prototypeReviewDone ? 'Attended the prototype review.' : 'Prototype review was skipped.'}`
        : 'No prototype was built. This is the core deliverable of the engagement.',
    },
    {
      id: 'documentation', label: DIMENSIONS.documentation.label, weight: DIMENSIONS.documentation.weight,
      rawScore: docRaw, weightedScore: Math.round(docRaw * 10 / 100), grade: grade(docRaw),
      breakdown: state.meetingState.momSubmitted
        ? (state.meetingState.momText.length > 200 ? 'Meeting minutes submitted with good coverage.' : 'MOM submitted but thin. More depth expected.')
        : 'No meeting minutes submitted. Documentation is a non-negotiable consulting discipline.',
    },
    {
      id: 'communication', label: DIMENSIONS.communication.label, weight: DIMENSIONS.communication.weight,
      rawScore: commRaw, weightedScore: Math.round(commRaw * 10 / 100), grade: grade(commRaw),
      breakdown: commRaw >= 50 ? 'Actively communicated with the team throughout.'
        : commRaw > 0 ? 'Some activity but not proactive enough for this engagement.'
        : 'Very little communication initiated. Reactive throughout.',
    },
    {
      id: 'security_awareness', label: DIMENSIONS.security_awareness.label, weight: DIMENSIONS.security_awareness.weight,
      rawScore: securityRaw, weightedScore: Math.round(securityRaw * 10 / 100), grade: grade(securityRaw),
      breakdown: rbacIncluded && auditDiscovered ? 'RBAC and Audit Logging were addressed. Compliance gates handled correctly.'
        : (rbacIncluded || auditDiscovered) ? 'Partial security coverage. One of the two compliance gates was missed.'
        : 'RBAC and Audit Logging not addressed. These are board-level requirements.',
    },
  ];

  const totalScore = Math.min(dimensions.reduce((sum, d) => sum + d.weightedScore, 0), 100);

  const outcome: ScoreReport['outcome'] =
    totalScore >= 78 ? 'excellent'
    : totalScore >= 55 ? 'strong'
    : totalScore >= 35 ? 'developing'
    : 'needs_improvement';

  const strengths: string[] = [];
  const areasToGrow: string[] = [];
  dimensions.forEach(d => {
    if (d.grade === 'excellent') strengths.push(d.breakdown);
    else if (d.grade === 'missed' || d.grade === 'developing') areasToGrow.push(d.breakdown);
  });

  if (engagedCount === 4 && !strengths.some(s => s.includes('stakeholder'))) {
    strengths.push('Contacted all four stakeholders — Daniel, Emma, Marcus, and Aarav.');
  }
  if (!state.meetingState.momSubmitted) {
    areasToGrow.push('MOM is the paper trail of consulting. Missing it leaves the engagement undocumented.');
  }
  if (rbacIncluded && auditDiscovered) {
    strengths.push('Proactively addressed security compliance before the board review.');
  }

  const percentile = totalScore >= 80 ? 95 : totalScore >= 65 ? 80 : totalScore >= 50 ? 60 : totalScore >= 35 ? 35 : 15;

  return {
    dimensions, totalScore, percentile, outcome,
    strengths: strengths.slice(0, 5), areasToGrow: areasToGrow.slice(0, 4),
    requirementsFound: discovered.length, totalRequirements: totalFeatures, stakeholdersEngaged: engagedCount,
  };
}

// ── Character feedback ────────────────────────────────────────────────────────

export interface CharacterFeedback {
  characterId: string;
  name: string;
  avatar: string;
  role: string;
  quote: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export function getCharacterFeedback(report: ScoreReport, state: GameState): CharacterFeedback[] {
  const delivGrade = report.dimensions.find(d => d.id === 'delivery_execution')?.grade;
  const docGrade = report.dimensions.find(d => d.id === 'documentation')?.grade;
  const reqGrade = report.dimensions.find(d => d.id === 'requirement_discovery')?.grade;

  return [
    {
      characterId: 'marcus', name: 'Marcus Reed', avatar: '/character/marcus_reed/MarcusDP.png', role: 'CTO, Brained Consulting',
      quote: state.prototypeBuilt
        ? (delivGrade === 'excellent' ? 'Prototype is solid. Scope was managed. Board has something concrete to evaluate.'
          : 'Prototype exists — that is the baseline. Coverage and security depth were not where I wanted them.')
        : 'No prototype. That is the entire deliverable. I have nothing to show the board.',
      sentiment: state.prototypeBuilt && (delivGrade === 'excellent' || delivGrade === 'good') ? 'positive' : state.prototypeBuilt ? 'neutral' : 'negative',
    },
    {
      characterId: 'daniel', name: 'Daniel Brooks', avatar: '/character/Daniel_Brooks/DanielDP.png', role: 'Program Manager, Brained Consulting',
      quote: state.meetingState.momSubmitted
        ? (docGrade === 'excellent' ? 'Good documentation. MOM captured the right decisions. This is how it should go.'
          : 'MOM was there but lean. Action items and owners should be explicit next time.')
        : 'No MOM on file. That is a process gap. It goes in the engagement review.',
      sentiment: state.meetingState.momSubmitted ? (docGrade === 'excellent' ? 'positive' : 'neutral') : 'negative',
    },
    {
      characterId: 'emma', name: 'Emma Carter', avatar: '/character/Emma_Carter/EmmaDP.png', role: 'HR Specialist & Client Lead',
      quote: reqGrade === 'excellent' ? 'You actually listened to what employees need, not just what was in the brief. That is exactly the right approach.'
        : reqGrade === 'good' ? 'You got most of the requirements. A few things the plant leads raised did not make it in, but the core is there.'
        : 'The HR teams are the end users. A lot of what they flagged did not seem to reach the prototype.',
      sentiment: reqGrade === 'excellent' ? 'positive' : reqGrade === 'good' ? 'neutral' : 'negative',
    },
    {
      characterId: 'aarav', name: 'Aarav Kapoor', avatar: '/character/AaravDP.png', role: 'Senior Transformation Advisor',
      quote: report.totalScore >= 70 ? 'Solid consulting instincts on this one. Not perfect, but you asked the right questions and kept things moving.'
        : report.totalScore >= 45 ? 'You got through it, but the gaps tell a story. Next engagement, prioritise proactive discovery over reactive fixes.'
        : 'This was a learning experience. The instinct to wait — for information, for clarity, for someone to tell you what to do — that is what needs to change.',
      sentiment: report.totalScore >= 70 ? 'positive' : report.totalScore >= 45 ? 'neutral' : 'negative',
    },
  ];
}
