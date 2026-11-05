/**
 * chapter10Data.ts
 * Master data, files manifest, SemVer rules, scoring engine, and session helpers
 * for Chapter 10: Versioning & Technical Documentation
 * Post-Launch Stabilization Phase (25:00–27:00)
 */

import type {
  Chapter10State,
  Chapter10Scorecard,
  Chapter10DecisionChoice,
  RepoFileItem,
  SemVerChoice,
  DocumentationSectionItem,
  Chapter10OutcomeType,
} from '../types/chapter10';

export const CHAPTER10_TITLE = 'Versioning & Technical Documentation';
export const CHAPTER10_SUBTITLE = 'Post-Launch Stabilization — Engineering Release & Documentation Challenge';
export const CHAPTER10_PROJECT_NAME = 'Project Amigo';
export const CHAPTER10_STAGE_LABEL = 'Locking Down System Architecture Specs';
export const CHAPTER10_LOCATION = 'Engineering Repository & Internal Developer Portal';
export const CHAPTER10_TIMELINE = '25:00 – 27:00';

export const CHAPTER10_USP =
  'Enforces formal software release versioning, traceable technical documentation, and centralized organizational knowledge.';

export const CHAPTER10_KEY_TAKEAWAY =
  'A successful product must be maintainable beyond its original development team. Documentation and version control protect institutional knowledge and enable future engineering teams to work independently.';

export const CHAPTER10_CHARACTERS = {
  alex: {
    name: 'Alex',
    role: 'Developer · Engineering Lead',
    avatar: '/character/Daniel_Brooks/DanielDP.png',
    affiliation: 'Core Engineering Team',
  },
  marcus: {
    name: 'Marcus Reed',
    role: 'Chief Technology Officer (CTO)',
    avatar: '/character/marcus_reed/MarcusDP.png',
    affiliation: 'Enterprise Technology & Architecture',
  },
  sophia: {
    name: 'Sophia Bennett',
    role: 'Head of HR Operations · Executive Sponsor',
    avatar: '/character/Sophia_bennett/SophiaDP.png',
    affiliation: 'ICICI Bank Executive Leadership',
  },
  player: {
    name: 'Player (You)',
    role: 'Lead Project Manager · Transformation Consultant',
    avatar: '',
    affiliation: 'Brained Consulting',
  },
};

// ── REPOSITORY FILES MANIFEST FOR ASSIGNMENT 1 ──
export const REPO_FILES_MANIFEST: RepoFileItem[] = [
  {
    id: 'api_spec_v1',
    name: 'API_Spec_v1.md',
    path: 'docs/api/API_Spec_v1.md',
    size: '142 KB',
    lastModified: '2 days ago',
    author: 'alex',
    status: 'needs_review',
    category: 'api',
    summary: 'Initial baseline REST & GraphQL API specifications covering Appraisal, Attendance Sync, and Biometric webhooks.',
    contentSnippet: `# Project Amigo API Specification v1.0
## Base URL: https://api.hrms.internal.bank/v1
- POST /auth/login (MFA enforced with rate limiting)
- GET /appraisals/cycle (Active appraisal cycle metrics)
- POST /appraisals/{id}/submit (Submission payload with SLA timestamps)
- POST /attendance/sync (Kafka partition key: branch_code)
[Verified against production gateways - single source of truth candidate]`,
    recommendedAction: 'retain',
  },
  {
    id: 'api_spec_final_final',
    name: 'API_Spec_final_FINAL.md',
    path: 'docs/api/scratch/API_Spec_final_FINAL.md',
    size: '156 KB',
    lastModified: '4 hours ago',
    author: 'contractor_dev',
    status: 'duplicate_candidate',
    category: 'api',
    summary: 'Unreviewed duplicate with messy naming. Contains unmerged WIP endpoints and conflicting schema payloads.',
    contentSnippet: `# API Spec FINAL FINAL - DO NOT EDIT (copied by contractor)
## NOTE: Contains draft bonus calculation endpoints that did not make Phase 1 release!
- POST /bonus/calc (UNVERIFIED - pending CR-017 Phase 2 approval)
- GET /temp/debug/branch-dump (DEBUG ENDPOINT - SECURITY RISK IF PUBLISHED)
[Warning: Duplicate file. Merge valid delta into API_Spec_v1.md and delete duplicate]`,
    recommendedAction: 'deprecate',
  },
  {
    id: 'system_architecture',
    name: 'System_Architecture.png',
    path: 'architecture/System_Architecture.png',
    size: '2.4 MB',
    lastModified: 'Yesterday',
    author: 'marcus_reed',
    status: 'needs_versioning',
    category: 'architecture',
    summary: 'Official C4 microservices architectural diagram showing API Gateway, Kafka cluster, Redis cache, and PostgreSQL read-replicas.',
    contentSnippet: `[Binary Image Data: System_Architecture.png]
Resolution: 3840x2160 · Layer 1: Ingress & Cloudflare WAF · Layer 2: Envoy API Gateway
Layer 3: Microservices (Appraisal, Attendance, Payroll Auth) · Layer 4: Kafka Event Bus
Layer 5: PostgreSQL Primary + 3 Read Replicas (Mumbai, Pune, Bangalore)
[Authoritative architectural design verified by CTO Marcus Reed - Requires formal version tag]`,
    recommendedAction: 'retain',
  },
  {
    id: 'architecture_old_backup',
    name: 'Architecture_old_backup.png',
    path: 'architecture/archive/Architecture_old_backup.png',
    size: '1.8 MB',
    lastModified: '3 weeks ago',
    author: 'marcus_reed',
    status: 'obsolete_candidate',
    category: 'architecture',
    summary: 'Obsolete pre-pilot architectural diagram depicting deprecated single-node Redis cache before cluster sharding.',
    contentSnippet: `[Binary Image Data: Architecture_old_backup.png]
Deprecation Notice: Depicts pre-stress-test monolithic database setup without connection pooler.
DO NOT USE for operational onboarding or production runbooks.
[Candidate for archival in /archive/v0.8-pre-pilot]`,
    recommendedAction: 'deprecate',
  },
  {
    id: 'database_schema',
    name: 'Database_Schema.md',
    path: 'docs/db/Database_Schema.md',
    size: '88 KB',
    lastModified: '3 days ago',
    author: 'alex',
    status: 'needs_review',
    category: 'database',
    summary: 'Complete DDL schemas, foreign key mappings, Kafka partitioning keys, and indexing strategy for 80,000 employees.',
    contentSnippet: `# Database Schema & Entity Relational Definitions
- Table: employees (id UUID PK, branch_code VARCHAR(10) INDEX, role VARCHAR(30))
- Table: appraisal_reviews (id UUID PK, employee_id FK, score NUMERIC(3,2), cycle_id INT)
- Table: attendance_punches (id UUID PK, punch_time TIMESTAMPTZ, biometric_verified BOOL)
Indexes: idx_branch_active (branch_code, is_active), idx_cycle_status (cycle_id, status)
Partitioning: Hash partitioned on branch_code for Kafka event ingestion.`,
    recommendedAction: 'retain',
  },
  {
    id: 'temp_notes',
    name: 'temp_notes.md',
    path: 'scratchpad/temp_notes.md',
    size: '12 KB',
    lastModified: '12 hours ago',
    author: 'alex',
    status: 'unverified',
    category: 'scratchpad',
    summary: 'Informal developer scratchpad containing raw curl commands, temporary staging tokens, and meeting notes.',
    contentSnippet: `# Alex's temporary scratch notes
- curl -X POST https://staging.hrms/debug -H "Authorization: Bearer test-token-xyz"
- Remember to ask Jane about pizza for deployment night
- Fixed race condition in punch queue by bumping timeout to 5000ms (check if needed in prod)
[Scratchpad notes must NOT be published in enterprise wiki catalog]`,
    recommendedAction: 'deprecate',
  },
  {
    id: 'deployment_guide',
    name: 'Deployment_Guide.md',
    path: 'docs/ops/Deployment_Guide.md',
    size: '64 KB',
    lastModified: 'Yesterday',
    author: 'alex',
    status: 'needs_review',
    category: 'ops',
    summary: 'Kubernetes Helm deployment instructions, environment variable manifest, healthcheck probes, and rollback procedures.',
    contentSnippet: `# Enterprise Production Deployment Runbook
1. Kubernetes Cluster Prerequisites: 16 nodes, minimum 64GB RAM per worker node.
2. Helm chart release command: helm upgrade --install amigo-hrms ./charts/amigo --namespace prod
3. Healthcheck Probes: Liveness /healthz (port 8080), Readiness /ready (port 8080)
4. Rollback procedure: helm rollback amigo-hrms 1 (restores last known good release in <60s)
5. PagerDuty escalation and SLA alert definitions.`,
    recommendedAction: 'retain',
  },
  {
    id: 'release_notes',
    name: 'Release_Notes.md',
    path: 'Release_Notes.md',
    size: '32 KB',
    lastModified: 'Yesterday',
    author: 'player',
    status: 'needs_review',
    category: 'ops',
    summary: 'Executive and technical changelog documenting verified features, SLA benchmarks, and security hardening for Phase 1.',
    contentSnippet: `# Project Amigo Official Release Changelog
## Scope Delivered:
- Automated Appraisal Review Workflow (42% cycle reduction verified across 4,800 branches)
- Realtime Attendance Sync with Kafka message queue resilience
- Bank Security Compliance: Perimeter WAF bot mitigation and mandatory MFA rate-limiting
- 15,000 verified operational man-hours saved
- Zero compliance audit findings under revised Banking IT acts.`,
    recommendedAction: 'retain',
  },
];

// Correct files to retain for official documentation package (5 authoritative files)
export const AUTHORITATIVE_REPO_FILE_IDS = [
  'api_spec_v1',
  'system_architecture',
  'database_schema',
  'deployment_guide',
  'release_notes',
];

// Files that should be excluded / deprecated from official publication
export const SCRATCH_DUPLICATE_FILE_IDS = [
  'api_spec_final_final',
  'architecture_old_backup',
  'temp_notes',
];

// ── SEMANTIC VERSIONING RULES FOR ASSIGNMENT 2 ──
export const SEMVER_OPTIONS = {
  'v0.9.9': {
    version: 'v0.9.9' as SemVerChoice,
    type: 'Pre-release Beta / RC',
    label: 'v0.9.9 — Pre-Release Beta Candidate',
    description: 'Signals to enterprise auditors and operations that the software is still in testing and not yet production-ready.',
    isCorrect: false,
    critique: 'Incorrect. Project Amigo is already live in production across 80,000 employees and validated by the Board. Calling it v0.9.9 undermines enterprise confidence.',
  },
  'v1.0.0': {
    version: 'v1.0.0' as SemVerChoice,
    type: 'Initial Stable Production Release',
    label: 'v1.0.0 — First Formal Stable Release',
    description: 'Signals the first stable, production-verified release with frozen baseline APIs, verified security gates, and SLA adherence.',
    isCorrect: true,
    critique: 'Spot on! In Semantic Versioning (SemVer), v1.0.0 marks the initial official production milestone. It establishes a traceable public API baseline for future maintenance.',
  },
  'v2.0.0': {
    version: 'v2.0.0' as SemVerChoice,
    type: 'Major Breaking Change Release',
    label: 'v2.0.0 — Major Breaking Release',
    description: 'Signals that backward compatibility is broken and external consumers must refactor their integration code.',
    isCorrect: false,
    critique: 'Incorrect. This is the first stable release of Project Amigo. Jumping directly to v2.0.0 is confusing because no v1 API ever existed to break compatibility with.',
  },
};

// ── ENTERPRISE DEVELOPER PORTAL (WIKI) CATALOG SECTIONS FOR ASSIGNMENT 3 ──
export const ENTERPRISE_CATALOG_SECTIONS: DocumentationSectionItem[] = [
  {
    id: 'api_specs',
    title: 'API endpoint specifications and request/response schemas',
    description: 'Enables external and internal developers to understand endpoints, authentication headers, error codes, and payload schemas.',
    category: 'API Catalog',
    required: true,
    docFormat: 'OpenAPI 3.0 / Swagger',
  },
  {
    id: 'system_architecture',
    title: 'System architecture diagrams and component interactions',
    description: 'Visualizes microservices boundaries, Envoy API Gateway routing, Kafka event queues, and database read-replicas.',
    category: 'Architecture',
    required: true,
    docFormat: 'C4 Model / Mermaid / Vector Diagram',
  },
  {
    id: 'database_schema',
    title: 'Database schema and data relationships',
    description: 'Documents PostgreSQL table relationships, foreign keys, partition keys for 4,800 branches, and indexing strategy.',
    category: 'Data Engineering',
    required: true,
    docFormat: 'Relational ERD & DDL Manifest',
  },
  {
    id: 'deployment_guide',
    title: 'Deployment and environment configuration guide',
    description: 'Runbooks for Kubernetes Helm charts, environment secrets, readiness probes, and disaster recovery rollback gates.',
    category: 'SRE & DevOps',
    required: true,
    docFormat: 'Runbook & Infrastructure as Code',
  },
  {
    id: 'release_notes',
    title: 'Release notes and version history',
    description: 'Tracks release versions, change logs, delivered scope, bug fixes, and operational performance improvements.',
    category: 'Release Governance',
    required: true,
    docFormat: 'SemVer Changelog (CHANGELOG.md)',
  },
  {
    id: 'adrs',
    title: 'Technical decisions and known limitations (ADRs)',
    description: 'Architecture Decision Records preserving the rationale behind Kafka queuing, connection pooler sizing, and WAF rate limits.',
    category: 'Institutional Knowledge',
    required: true,
    docFormat: 'Architecture Decision Records (ADR 001-008)',
  },
];

// ── FINAL RELEASE GOVERNANCE DECISION (SCENE 10.2) ──
export const CHAPTER10_DECISION_OPTIONS = {
  choice_a: {
    id: 'choice_a' as Chapter10DecisionChoice,
    title: 'Option A — Short-Term Feature Shortcut',
    subtitle: 'Leave documentation as-is and jump straight to next feature sprint',
    quote: '"The code is working. We can document everything later when we have spare time."',
    governanceDelta: -30,
    velocityDelta: -10,
    trustRiskDelta: -20,
    consequence:
      'A few weeks later, a new developer joins the engineering team. They discover conflicting API specifications and cannot identify the correct architecture diagram. Original developers have to spend countless hours explaining decisions that should have been documented, grinding sprint velocity to a halt.',
  },
  choice_b: {
    id: 'choice_b' as Chapter10DecisionChoice,
    title: 'Option B — Rigorous Release Governance & Knowledge Centralization',
    subtitle: 'Enforce strict version control tagging (v1.0.0) and publish comprehensive catalog to the Internal Developer Portal',
    quote: '"We need a traceable release, approved architecture specifications, and a centralized knowledge base before closing this sprint."',
    governanceDelta: +30,
    velocityDelta: +10,
    trustRiskDelta: +20,
    consequence:
      'Release v1.0.0 is officially tagged in git. The architecture specifications, API references, deployment runbook, and ADRs are published in the Internal Developer Portal. Future engineering teams onboard in days rather than weeks, and institutional knowledge is permanently protected.',
  },
};

// ── DETERMINISTIC SCORING ENGINE FOR CHAPTER 10 ──
export function computeChapter10Score(
  state: Chapter10State,
  baselineScores = { schedule: 75, risk: 70, governance: 65, efficiency: 70 }
): Chapter10Scorecard {
  const isChoiceB = state.decisionChosen === 'choice_b';
  const isChoiceA = state.decisionChosen === 'choice_a';

  // Formative bonus points (+5 for each completed assignment)
  let repoAuditBonus = 0;
  if (state.repoAuditCompleted) {
    // Check if player correctly selected authoritative files without unverified scratchpads
    const selected = new Set(state.selectedRepoFiles);
    const hasAuthoritative = AUTHORITATIVE_REPO_FILE_IDS.every((id) => selected.has(id));
    const hasNoScratch = SCRATCH_DUPLICATE_FILE_IDS.every((id) => !selected.has(id));
    repoAuditBonus = hasAuthoritative && hasNoScratch ? 5 : 3;
  }

  let versioningBonus = 0;
  if (state.versionConfirmed) {
    versioningBonus = state.selectedVersion === 'v1.0.0' ? 5 : 0;
  }

  let catalogPublishBonus = 0;
  if (state.catalogPublished) {
    catalogPublishBonus = state.selectedDocSections.length >= 6 ? 5 : 3;
  }

  const totalBonus = repoAuditBonus + versioningBonus + catalogPublishBonus;

  let deltaGov = 0;
  let deltaRisk = 0;
  let deltaEff = 0;
  let deltaSched = 0;

  if (isChoiceB) {
    deltaGov = +30;
    deltaRisk = +20;
    deltaEff = +10 + totalBonus;
    deltaSched = +10;
  } else if (isChoiceA) {
    deltaGov = -30;
    deltaRisk = -20;
    deltaEff = -10;
    deltaSched = 0;
  }

  const finalSchedule = Math.min(100, Math.max(0, baselineScores.schedule + deltaSched));
  const finalRisk = Math.min(100, Math.max(0, baselineScores.risk + deltaRisk));
  const finalGov = Math.min(100, Math.max(0, baselineScores.governance + deltaGov));
  const finalEff = Math.min(100, Math.max(0, baselineScores.efficiency + deltaEff));

  const totalScore = Math.round(
    finalGov * 0.35 + finalRisk * 0.25 + finalSchedule * 0.2 + finalEff * 0.2
  );

  let outcomeType: Chapter10OutcomeType = 'strong';
  let outcomeTitle = 'RELEASE GOVERNANCE ARCHITECT ACCLAIM';
  let outcomeText =
    'You established a traceable software release and centralized technical knowledge. The engineering organization can now maintain and evolve the product with complete independence.';

  if (isChoiceA) {
    outcomeType = 'incomplete';
    outcomeTitle = 'KNOWLEDGE MANAGEMENT & GOVERNANCE FAILURE';
    outcomeText =
      'You prioritized short-term feature development over long-term maintainability. Undocumented technical decisions increase onboarding time, create knowledge silos, and introduce unnecessary operational dependencies.';
  } else if (totalScore < 85) {
    outcomeType = 'mixed';
    outcomeTitle = 'SATISFACTORY RELEASE WITH DOCUMENTATION GAPS';
    outcomeText =
      'v1.0.0 tagged and published, but deeper catalog coverage and proactive repository pruning would have improved engineering velocity further.';
  }

  const whatYouDidWell = isChoiceB
    ? 'Audited repository files into a single source of truth; enforced SemVer v1.0.0 initial release standard; published a 100% complete developer wiki catalog; protected institutional knowledge against developer turnover.'
    : 'Maintained initial code delivery and identified basic repository files.';

  const whatToImprove = isChoiceB
    ? 'Establish automated CI/CD linting checks to ensure future pull requests update API schemas and release notes before merging.'
    : 'Never allow code to be released without authoritative version tagging and centralized technical documentation. Technical debt compounds exponentially.';

  const executiveFeedback = isChoiceB
    ? 'Marcus Reed (CTO): "Outstanding engineering stewardship. A great PM builds systems that outlast individual developers. Tagging v1.0.0 and centralizing our architecture specs ensures Project Amigo is maintainable for the bank long after this sprint closes."'
    : 'Marcus Reed (CTO): "We have created a critical institutional vulnerability. The next team cannot maintain or deploy this system without interrogating original developers. We cannot move to Phase 2 with undocumented technical debt."';

  return {
    shown: true,
    scheduleScore: finalSchedule,
    riskScore: finalRisk,
    governanceScore: finalGov,
    efficiencyScore: finalEff,
    totalScore,
    bonusPoints: totalBonus,
    breakdown: {
      repoAuditBonus,
      versioningBonus,
      catalogPublishBonus,
      governanceScore: isChoiceB ? 30 : -30,
    },
    decisionChosen: state.decisionChosen || undefined,
    outcomeType,
    outcomeTitle,
    outcomeText,
    whatYouDidWell,
    whatToImprove,
    keyTakeaway: CHAPTER10_KEY_TAKEAWAY,
    executiveFeedback,
    achievementUnlocked: isChoiceB && totalBonus >= 10,
    achievementTitle: 'Release Architect',
    explanations: {
      governance: isChoiceB
        ? `Delivery Governance elevated by +30 pts. Single source of truth and formal SemVer release establish elite PM governance.`
        : `Delivery Governance penalized by -30 pts. Skipping release documentation violates foundational software engineering practices.`,
      risk: isChoiceB
        ? `Trust & Risk Management boosted by +20 pts. Centralized documentation prevents catastrophic knowledge loss when engineers leave.`
        : `Trust & Risk penalized by -20 pts. The bank is now exposed to tribal knowledge dependencies.`,
      efficiency: isChoiceB
        ? `Team Efficiency & Maintainability elevated by +${10 + totalBonus} pts. Future onboarding cycles drop from weeks to hours.`
        : `Team Efficiency penalized by -10 pts. Developers will spend hours answering basic architectural questions.`,
      schedule: isChoiceB
        ? `Schedule boosted by +10 pts. Traceable releases streamline all future sprint handovers.`
        : `Schedule neutral (0 pts). Short-term gains are erased by future technical debt.`,
    },
    aiEvaluated: false,
    evaluatedAt: new Date().toISOString(),
    evaluatorName: 'Marcus Reed (CTO) & Alex (Dev Lead)',
    evaluatorRole: 'Engineering Steering & Architecture Board',
  };
}

// ── INITIAL STATE & PERSISTENCE HELPERS ──
export const INITIAL_CHAPTER10_STATE: Chapter10State = {
  currentStage: 'tech_debt_briefing',
  timelineTimestamp: '25:00',
  selectedTab: 'repo_audit',
  callInitiated: false,
  meetingCompleted: false,
  callCompleted: false,
  portalOpened: false,
  selectedRepoFiles: ['api_spec_v1', 'system_architecture', 'database_schema', 'deployment_guide', 'release_notes'],
  repoAuditCompleted: false,
  selectedVersion: null,
  versionConfirmed: false,
  selectedDocSections: ['api_specs', 'system_architecture', 'database_schema', 'deployment_guide', 'release_notes', 'adrs'],
  catalogPublished: false,
  documentationCoveragePct: 100,
  decisionChosen: null,
  completed: false,
  scorecard: {
    shown: false,
    scheduleScore: 75,
    riskScore: 70,
    governanceScore: 65,
    efficiencyScore: 70,
    totalScore: 70,
    bonusPoints: 0,
    breakdown: {
      repoAuditBonus: 0,
      versioningBonus: 0,
      catalogPublishBonus: 0,
      governanceScore: 0,
    },
    outcomeType: 'incomplete',
    outcomeTitle: 'PENDING RELEASE GOVERNANCE DECISION',
    outcomeText: 'Audit the repository, approve semantic versioning, and publish the enterprise documentation package.',
    whatYouDidWell: '',
    whatToImprove: '',
    keyTakeaway: CHAPTER10_KEY_TAKEAWAY,
    executiveFeedback: '',
    achievementUnlocked: false,
    explanations: {
      schedule: 'Pending release.',
      risk: 'Pending release.',
      governance: 'Pending release.',
      efficiency: 'Pending release.',
    },
  },
};

const CHAPTER10_STORAGE_KEY = 'brained_os_chapter10_state_v1';

export function getChapter10SessionState(): Chapter10State {
  if (typeof window === 'undefined') return { ...INITIAL_CHAPTER10_STATE };
  try {
    const raw =
      sessionStorage.getItem(CHAPTER10_STORAGE_KEY) ||
      localStorage.getItem('brained_chapter10_state');
    if (!raw) return { ...INITIAL_CHAPTER10_STATE };
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_CHAPTER10_STATE,
      ...parsed,
      scorecard: {
        ...INITIAL_CHAPTER10_STATE.scorecard,
        ...(parsed.scorecard || {}),
        breakdown: {
          ...INITIAL_CHAPTER10_STATE.scorecard.breakdown,
          ...(parsed.scorecard?.breakdown || {}),
        },
      },
    };
  } catch (e) {
    console.error('Error loading Chapter 10 state:', e);
    return { ...INITIAL_CHAPTER10_STATE };
  }
}

export function setChapter10SessionState(state: Chapter10State): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CHAPTER10_STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem('brained_chapter10_state', JSON.stringify(state));
  } catch (e) {
    console.error('Error saving Chapter 10 state:', e);
  }
}

export function resetChapter10SessionState(): Chapter10State {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(CHAPTER10_STORAGE_KEY);
      localStorage.removeItem('brained_chapter10_state');
    } catch (e) {}
  }
  return { ...INITIAL_CHAPTER10_STATE };
}
