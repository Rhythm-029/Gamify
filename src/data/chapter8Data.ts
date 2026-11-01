/**
 * chapter8Data.ts
 * Master data, evidence definitions, evaluation logic & session state for Chapter 8:
 * PRODUCTION STABILISATION & PROJECT HANDOVER · Final Delivery & Acceptance
 */

import type {
  Chapter8State,
  Chapter8Scorecard,
  DeliverableClaim,
  EvidenceItem,
  DeliveryStatusItem,
  DeliveryClassificationColumn,
  HandoverItem,
  Chapter8OutcomeType,
} from '../types/chapter8';

export const CHAPTER8_TITLE = 'Production Stabilisation & Project Handover';
export const CHAPTER8_SUBTITLE = 'Final Handover & Enterprise Acceptance';
export const CHAPTER8_PROJECT_NAME = 'Project Amigo';
export const CHAPTER8_STAGE_LABEL = 'Phase 1 Final Handover';
export const CHAPTER8_USERS_COUNT = 'Approximately 80,000';
export const CHAPTER8_LEARNING_TAKEAWAY =
  "A project isn't complete when the system goes live. It's complete when the delivery is validated, accepted, and ready to be owned by the people who will run it.";

// ── ACTIVITY 1: DELIVERABLE CLAIMS ──
export const DELIVERABLE_CLAIMS: DeliverableClaim[] = [
  {
    id: 'claim_scope_documented',
    label: 'Agreed Phase 1 scope is documented',
    description: 'Formal record defining the approved functional scope, user personas, and initial module boundaries.',
    expectedEvidenceId: 'phase1_scope_baseline',
  },
  {
    id: 'claim_ui_approved',
    label: 'User interface approval has been obtained',
    description: 'Documentation confirming stakeholder review and signoff on the UI design system and user workflows.',
    expectedEvidenceId: 'ui_ux_signoff',
  },
  {
    id: 'claim_infra_uat_ready',
    label: 'Infrastructure & UAT preparation completed',
    description: 'Verification that staging environments, network routing, and integration dependencies were validated.',
    expectedEvidenceId: 'infra_uat_readiness',
  },
  {
    id: 'claim_cr_assessed',
    label: 'Scope treatment for change request assessed',
    description: 'Formal analysis and agreed scope decision regarding the requested Dynamic Bonus Calculator.',
    expectedEvidenceId: 'cr_impact_assessment',
  },
  {
    id: 'claim_pilot_completed',
    label: 'Controlled pilot was completed',
    description: 'Recorded outcome and user telemetry from the initial 500-user Controlled User Group rollout.',
    expectedEvidenceId: 'cug_pilot_report',
  },
  {
    id: 'claim_performance_tested',
    label: 'Enterprise performance testing was completed',
    description: 'Telemetry and load results from the 30,000-user peak concurrency stress simulation.',
    expectedEvidenceId: 'concurrency_stress_report',
  },
  {
    id: 'claim_tech_approvals_recorded',
    label: 'Required technical approvals were recorded',
    description: 'Formal signoff from CTO Marcus Reed confirming performance stability and release readiness.',
    expectedEvidenceId: 'tech_cto_approval',
  },
  {
    id: 'claim_incident_rca_documented',
    label: 'Production incident was investigated and documented',
    description: 'Root Cause Analysis detailing the microservice socket memory leak and blast radius during INC-0241.',
    expectedEvidenceId: 'incident_rca_inc0241',
  },
  {
    id: 'claim_recovery_verified',
    label: 'Production recovery was verified',
    description: 'Confirmation that the container hotfix was deployed and branch user access was verified before closure.',
    expectedEvidenceId: 'recovery_confirmation',
  },
  {
    id: 'claim_monitoring_updated',
    label: 'Monitoring & preventive controls updated',
    description: 'Documentation of proactive APM threshold alerts (80%) and memory regression tests implemented.',
    expectedEvidenceId: 'monitoring_controls_update',
  },
];

// ── ACTIVITY 1: AVAILABLE EVIDENCE DOCUMENTS ──
export const EVIDENCE_DOCUMENTS: EvidenceItem[] = [
  {
    id: 'phase1_scope_baseline',
    title: 'Phase 1 Scope Baseline',
    category: 'Scope & Design',
    documentType: 'PDF Record',
    chapterOrigin: 'Chapter 1: The Briefing',
    description: 'Approved functional scope baseline for Attendance, Appraisals, and Core Leave modules for ICICI Bank.',
    matchingClaimId: 'claim_scope_documented',
  },
  {
    id: 'ui_ux_signoff',
    title: 'UI/UX Signoff Document',
    category: 'Scope & Design',
    documentType: 'Formal Signoff',
    chapterOrigin: 'Chapter 2: Environment Prerequisites',
    description: 'Signed approval from Martha and client representatives establishing the visual and interaction standards.',
    matchingClaimId: 'claim_ui_approved',
  },
  {
    id: 'infra_uat_readiness',
    title: 'Infrastructure & UAT Readiness Record',
    category: 'Testing & Pilot',
    documentType: 'PDF Record',
    chapterOrigin: 'Chapter 3: UAT Infrastructure Coordination',
    description: 'Technical record confirming Port 443 proxy configuration, LDAP integration, and UAT environment verification.',
    matchingClaimId: 'claim_infra_uat_ready',
  },
  {
    id: 'cr_impact_assessment',
    title: 'Change Request & Impact Assessment',
    category: 'Scope & Design',
    documentType: 'PDF Record',
    chapterOrigin: 'Chapter 4: Core Banking & Scope',
    description: 'Architectural evaluation of CR-017 (Dynamic Bonus Calculator) establishing agreed Phase 2 deferral.',
    matchingClaimId: 'claim_cr_assessed',
  },
  {
    id: 'cug_pilot_report',
    title: 'CUG Pilot Report (500 Users)',
    category: 'Testing & Pilot',
    documentType: 'PDF Record',
    chapterOrigin: 'Chapter 5: The Launch Decision',
    description: 'Operational findings, rollback parameters, and telemetry validation from the 500-user controlled rollout.',
    matchingClaimId: 'claim_pilot_completed',
  },
  {
    id: 'concurrency_stress_report',
    title: 'Concurrency Stress Test Report',
    category: 'Performance & Approval',
    documentType: 'APM Audit',
    chapterOrigin: 'Chapter 6: The 30,000-User Stress Test',
    description: 'Dynatrace performance metrics demonstrating sub-800ms response times and connection pool optimization under 30k load.',
    matchingClaimId: 'claim_performance_tested',
  },
  {
    id: 'tech_cto_approval',
    title: 'Engineering & CTO Test Approval',
    category: 'Performance & Approval',
    documentType: 'Formal Signoff',
    chapterOrigin: 'Chapter 6: Performance Command Centre',
    description: 'Executive technical release authorization signed by CTO Marcus Reed following verified load retesting.',
    matchingClaimId: 'claim_tech_approvals_recorded',
  },
  {
    id: 'incident_rca_inc0241',
    title: 'Production Incident RCA — INC-0241',
    category: 'Production & Reliability',
    documentType: 'Incident RCA',
    chapterOrigin: 'Chapter 7: Production Issues & Root Cause Analysis',
    description: 'Formal 4-part post-mortem identifying socket leak root cause, 12 affected officers, and corrective actions.',
    matchingClaimId: 'claim_incident_rca_documented',
  },
  {
    id: 'recovery_confirmation',
    title: 'Production Recovery Confirmation',
    category: 'Production & Reliability',
    documentType: 'Telemetry Log',
    chapterOrigin: 'Chapter 7: Incident Response Studio',
    description: 'Hotfix deployment verification, APM heap stabilization at 210MB, and verified branch check-in resumption.',
    matchingClaimId: 'claim_recovery_verified',
  },
  {
    id: 'monitoring_controls_update',
    title: 'Monitoring & Preventive Controls Update',
    category: 'Production & Reliability',
    documentType: 'PDF Record',
    chapterOrigin: 'Chapter 7: Prevent Recurrence Plan',
    description: 'APM 80% container heap alert rules, health check endpoints, and automated socket leak CI regression test suite.',
    matchingClaimId: 'claim_monitoring_updated',
  },
];

// ── ACTIVITY 2: DELIVERY STATUS ITEMS ──
export const DELIVERY_STATUS_ITEMS: DeliveryStatusItem[] = [
  {
    id: 'item_scope',
    title: 'Phase 1 Agreed Scope',
    description: 'Core Phase 1 requirements have been implemented and validated against the approved scope baseline.',
    expectedColumn: 'completed_verified',
    explanation: 'Core requirements have been built, tested, and validated against the original scope baseline.',
    chapterOrigin: 'Chapter 1: The Briefing',
  },
  {
    id: 'item_pilot',
    title: 'CUG Pilot (500 Users)',
    description: 'The controlled 500-user pilot was conducted and the results were recorded with zero critical defects.',
    expectedColumn: 'completed_verified',
    explanation: 'The controlled pilot was fully executed and documented in the pilot report.',
    chapterOrigin: 'Chapter 5: Launch Decision',
  },
  {
    id: 'item_stress',
    title: 'Enterprise Concurrency Testing',
    description: 'The 30,000-user load test was completed and the required technical approval was obtained from Marcus.',
    expectedColumn: 'completed_verified',
    explanation: 'Performance testing completed successfully with formal CTO signoff.',
    chapterOrigin: 'Chapter 6: 30k Stress Test',
  },
  {
    id: 'item_cr',
    title: 'Dynamic Bonus Calculator',
    description: 'The requested Dynamic Bonus Calculator was assessed through change request CR-017 and deferred to Phase 2.',
    expectedColumn: 'deferred_phase_2',
    explanation: 'A feature deferred through formal change control is not an unresolved defect; it is documented as Phase 2 deferred scope.',
    chapterOrigin: 'Chapter 4: Change Control',
  },
  {
    id: 'item_incident',
    title: 'Attendance Sync Production Incident',
    description: 'Production incident INC-0241 was resolved through hotfix deployment, verified recovery, and a complete RCA.',
    expectedColumn: 'completed_verified',
    explanation: 'The production incident is fully closed with documented root cause and verified user recovery.',
    chapterOrigin: 'Chapter 7: Incident Response',
  },
  {
    id: 'item_client_accept',
    title: 'Client Formal Acceptance',
    description: 'Formal client acceptance of the final Phase 1 delivery has not yet been recorded.',
    expectedColumn: 'completed_awaiting_approval',
    explanation: 'Do not mark an item as formally accepted before the client reviews the package. It is awaiting approval.',
    chapterOrigin: 'Chapter 8: Final Acceptance',
  },
  {
    id: 'item_handover',
    title: 'Operational Handover',
    description: 'Operational ownership and handover documentation must be prepared and reviewed by operations leads.',
    expectedColumn: 'unresolved_requires_action',
    explanation: 'Operational handover remains pending until the receiving support team is provided with full procedures in Activity 3.',
    chapterOrigin: 'Chapter 8: Operational Handover',
  },
];

// ── ACTIVITY 2: CLASSIFICATION COLUMNS ──
export interface ClassificationColumnDef {
  id: DeliveryClassificationColumn;
  title: string;
  description: string;
  badgeColor: string;
}

export const CLASSIFICATION_COLUMNS: ClassificationColumnDef[] = [
  {
    id: 'completed_verified',
    title: 'Completed & Verified',
    description: 'Fully built, tested, and validated against baseline with audit evidence.',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  },
  {
    id: 'completed_awaiting_approval',
    title: 'Completed — Awaiting Approval',
    description: 'Delivery is complete but pending formal review or client acceptance signoff.',
    badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  },
  {
    id: 'deferred_phase_2',
    title: 'Deferred to Phase 2',
    description: 'Formally assessed via Change Control and scheduled for post-Phase 1 release.',
    badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  },
  {
    id: 'unresolved_requires_action',
    title: 'Unresolved / Requires Action',
    description: 'Items requiring operational runbooks, pending remediation, or active ownership.',
    badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  },
];

// ── ACTIVITY 3: OPERATIONAL HANDOVER ITEMS ──
export const HANDOVER_ITEMS: HandoverItem[] = [
  // Section A: Monitoring & Service Health
  {
    id: 'mon_attendance_mem',
    section: 'monitoring_health',
    title: 'Attendance Sync Memory Monitoring',
    description: 'Continuous APM tracking of microservice container heap utilisation to detect abnormal growth early.',
    ownerRole: 'Engineering Operations',
    isMandatory: true,
  },
  {
    id: 'mon_alert_thresholds',
    section: 'monitoring_health',
    title: 'Alert Thresholds (80% Warning / 90% Critical)',
    description: 'Automated PagerDuty notifications triggered when container memory consumption crosses established limits.',
    ownerRole: 'Engineering Operations',
    isMandatory: true,
  },
  {
    id: 'mon_health_checks',
    section: 'monitoring_health',
    title: 'Service Availability Health Checks',
    description: 'Automated synthetic ping checks to /health and biometric synchronisation endpoints every 60 seconds.',
    ownerRole: 'Application Support',
    isMandatory: true,
  },
  {
    id: 'mon_error_rates',
    section: 'monitoring_health',
    title: 'Production Error & 504 Gateway Monitoring',
    description: 'Real-time dashboard monitoring HTTP 5xx error rates with automated escalation if errors exceed 0.5%.',
    ownerRole: 'Application Support',
    isMandatory: true,
  },

  // Section B: Incident & Escalation Process
  {
    id: 'esc_proc_doc',
    section: 'escalation_process',
    title: 'Documented Incident Escalation Procedure',
    description: 'Step-by-step severity classification (SEV-1 through SEV-4) and triage workflow for on-call engineers.',
    ownerRole: 'Project Delivery',
    isMandatory: true,
  },
  {
    id: 'esc_tech_contacts',
    section: 'escalation_process',
    title: 'Technical Contact & Ownership Directory',
    description: 'Roster of primary and secondary on-call engineers, database leads, and bank infrastructure contacts.',
    ownerRole: 'Application Support',
    isMandatory: true,
  },
  {
    id: 'esc_rca_workflow',
    section: 'escalation_process',
    title: 'Incident Reporting & RCA Workflow',
    description: 'Mandatory standard operating procedure requiring formal post-mortem RCA within 48 hours of any SEV-1/2 outage.',
    ownerRole: 'Engineering Operations',
    isMandatory: true,
  },
  {
    id: 'esc_verify_rules',
    section: 'escalation_process',
    title: 'Recovery Verification Before Closure Policy',
    description: 'Strict protocol prohibiting ticket closure until end-user access and telemetry stability are verified.',
    ownerRole: 'Project Delivery',
    isMandatory: true,
  },

  // Section C: Known Issues & Scope Boundaries
  {
    id: 'bnd_phase2_deferred',
    section: 'known_issues_boundaries',
    title: 'Features Deferred to Phase 2 Record',
    description: 'Formal disclosure that the Dynamic Bonus Calculator is slated for Phase 2 implementation.',
    ownerRole: 'Project Delivery',
    isMandatory: true,
  },
  {
    id: 'bnd_known_limits',
    section: 'known_issues_boundaries',
    title: 'Known Limitations & Concurrency Boundaries',
    description: 'Validated architecture thresholds (tested up to 30,000 concurrent sessions; requires Redis caching enabled).',
    ownerRole: 'Application Support',
    isMandatory: true,
  },
  {
    id: 'bnd_pending_approvals',
    section: 'known_issues_boundaries',
    title: 'Outstanding Approvals Audit Trail',
    description: 'Traceable documentation of all stakeholder milestones leading to final handover signoff.',
    ownerRole: 'Project Delivery',
    isMandatory: true,
  },
  {
    id: 'bnd_resolved_inc0241',
    section: 'known_issues_boundaries',
    title: 'Resolved Incident INC-0241 Status Record',
    description: 'Full record of the resolved memory leak hotfix so future engineers understand past microservice behaviour.',
    ownerRole: 'Engineering Operations',
    isMandatory: true,
  },

  // Section D: Recovery & Continuity
  {
    id: 'rec_approved_proc',
    section: 'recovery_continuity',
    title: 'Approved Disaster Recovery Procedure',
    description: 'Verified runbook for automated pod restarts, failover to secondary cluster, and connection pool reset.',
    ownerRole: 'Engineering Operations',
    isMandatory: true,
  },
  {
    id: 'rec_hotfix_log',
    section: 'recovery_continuity',
    title: 'Hotfix & Incident Recovery Record',
    description: 'Versioned container image repository tag and rollback manifest in case of unexpected regression.',
    ownerRole: 'Engineering Operations',
    isMandatory: true,
  },
  {
    id: 'rec_verify_steps',
    section: 'recovery_continuity',
    title: 'Frontline User Verification Steps',
    description: 'Standard protocol for verifying branch terminal clock-in functionality with Regional Operations.',
    ownerRole: 'Application Support',
    isMandatory: true,
  },
  {
    id: 'rec_escalation_path',
    section: 'recovery_continuity',
    title: 'Engineering Escalation Path for Reoccurrence',
    description: 'Direct escalation bridge to Brained development leads if socket leak anomalies resurface.',
    ownerRole: 'Project Delivery',
    isMandatory: true,
  },
];

// ── HANDOVER SECTIONS DIRECTORY ──
export interface HandoverSectionDef {
  id: 'monitoring_health' | 'escalation_process' | 'known_issues_boundaries' | 'recovery_continuity';
  title: string;
  description: string;
  roleOwner: 'Engineering Operations' | 'Application Support' | 'Project Delivery';
}

export const HANDOVER_SECTIONS: HandoverSectionDef[] = [
  {
    id: 'monitoring_health',
    title: 'Section A — Monitoring & Service Health',
    description: 'Proactive metrics, container heap monitoring, and automated synthetic availability alerts.',
    roleOwner: 'Engineering Operations',
  },
  {
    id: 'escalation_process',
    title: 'Section B — Incident & Escalation Process',
    description: 'Standard operating procedures for severity categorization, contact trees, and recovery validation.',
    roleOwner: 'Application Support',
  },
  {
    id: 'known_issues_boundaries',
    title: 'Section C — Known Issues & Scope Boundaries',
    description: 'Transparent disclosure of deferred Phase 2 scope, concurrency limits, and resolved incident records.',
    roleOwner: 'Project Delivery',
  },
  {
    id: 'recovery_continuity',
    title: 'Section D — Recovery & Continuity',
    description: 'Disaster recovery runbooks, verified container rollback manifests, and user verification steps.',
    roleOwner: 'Engineering Operations',
  },
];

// ── ACTIVITY EVALUATION FUNCTIONS ──

export interface EvidenceValidationResult {
  isComplete: boolean;
  matchedCount: number;
  correctCount: number;
  feedback: string;
}

export function evaluateEvidenceVerification(
  matches: Record<string, string | null>
): EvidenceValidationResult {
  const matchedCount = Object.values(matches).filter(Boolean).length;
  let correctCount = 0;

  DELIVERABLE_CLAIMS.forEach((claim) => {
    if (matches[claim.id] === claim.expectedEvidenceId) {
      correctCount += 1;
    }
  });

  if (matchedCount < DELIVERABLE_CLAIMS.length) {
    return {
      isComplete: false,
      matchedCount,
      correctCount,
      feedback: `You have matched ${matchedCount} of ${DELIVERABLE_CLAIMS.length} delivery claims. Please attach supporting audit documents to all delivery claims before validation.`,
    };
  }

  if (correctCount === DELIVERABLE_CLAIMS.length) {
    return {
      isComplete: true,
      matchedCount: 10,
      correctCount: 10,
      feedback: 'All 10 Phase 1 delivery claims have been substantiated with audit evidence.',
    };
  }

  // Provide specific pedagogical guidance for mismatches
  if (
    matches['claim_performance_tested'] === 'tech_cto_approval' ||
    matches['claim_tech_approvals_recorded'] === 'concurrency_stress_report'
  ) {
    return {
      isComplete: false,
      matchedCount,
      correctCount,
      feedback:
        'The performance test report confirms the load test was conducted, but the technical approval record is needed to demonstrate formal signoff.',
    };
  }

  if (
    matches['claim_incident_rca_documented'] === 'recovery_confirmation' ||
    matches['claim_recovery_verified'] === 'incident_rca_inc0241'
  ) {
    return {
      isComplete: false,
      matchedCount,
      correctCount,
      feedback:
        'The incident RCA explains what happened. The recovery confirmation is separate evidence that the service was restored.',
    };
  }

  return {
    isComplete: false,
    matchedCount,
    correctCount,
    feedback: `${correctCount} of 10 claims correctly backed. Some audit documents are linked to mismatched claims. Review the category and origin of each document.`,
  };
}

export interface StatusValidationResult {
  isComplete: boolean;
  correctCount: number;
  feedback: string;
}

export function evaluateDeliveryStatus(
  classifications: Record<string, DeliveryClassificationColumn>
): StatusValidationResult {
  let correctCount = 0;
  const total = DELIVERY_STATUS_ITEMS.length;

  // Check specific anti-patterns first
  if (classifications['item_client_accept'] === 'completed_verified') {
    return {
      isComplete: false,
      correctCount,
      feedback:
        'An item awaiting client acceptance should not be described as formally accepted. Keep delivery completion separate from stakeholder approval.',
    };
  }

  if (classifications['item_cr'] === 'unresolved_requires_action') {
    return {
      isComplete: false,
      correctCount,
      feedback:
        'A feature deferred through the change-request process is not an unresolved Phase 1 defect. Its status should reflect the agreed scope decision (Deferred to Phase 2).',
    };
  }

  if (classifications['item_handover'] === 'completed_verified') {
    return {
      isComplete: false,
      correctCount,
      feedback:
        'Operational handover cannot be marked completed and verified until operational runbooks and responsibilities are formally organized in Activity 3.',
    };
  }

  DELIVERY_STATUS_ITEMS.forEach((item) => {
    if (classifications[item.id] === item.expectedColumn) {
      correctCount += 1;
    }
  });

  if (correctCount === total) {
    return {
      isComplete: true,
      correctCount: total,
      feedback:
        'All deliverables and scope boundaries have been accurately classified according to enterprise governance standards.',
    };
  }

  return {
    isComplete: false,
    correctCount,
    feedback: `${correctCount} of ${total} deliverables accurately classified. Review items awaiting formal signoff versus approved baseline commitments.`,
  };
}

export interface HandoverValidationResult {
  isComplete: boolean;
  selectedCount: number;
  feedback: string;
}

export function evaluateOperationalHandover(
  selectedIds: string[]
): HandoverValidationResult {
  const selectedCount = selectedIds.length;
  const total = HANDOVER_ITEMS.length;

  const hasMonitoring =
    selectedIds.includes('mon_attendance_mem') &&
    selectedIds.includes('mon_alert_thresholds');
  const hasEscalation =
    selectedIds.includes('esc_proc_doc') &&
    selectedIds.includes('esc_verify_rules');
  const hasBoundaries =
    selectedIds.includes('bnd_phase2_deferred') &&
    selectedIds.includes('bnd_resolved_inc0241');
  const hasRecovery =
    selectedIds.includes('rec_approved_proc') &&
    selectedIds.includes('rec_verify_steps');

  if (!hasMonitoring) {
    return {
      isComplete: false,
      selectedCount,
      feedback:
        'The receiving team needs to know how to detect abnormal memory growth before it results in another service outage. Ensure all monitoring items are included.',
    };
  }

  if (!hasBoundaries) {
    return {
      isComplete: false,
      selectedCount,
      feedback:
        'Deferred functionality must be visible in the handover record so it is not mistaken for a completed Phase 1 deliverable.',
    };
  }

  if (!hasRecovery) {
    return {
      isComplete: false,
      selectedCount,
      feedback:
        'The receiving team requires verified recovery runbooks and frontline verification steps to maintain service continuity.',
    };
  }

  if (!hasEscalation) {
    return {
      isComplete: false,
      selectedCount,
      feedback:
        'The operational handover must document on-call escalation ownership and recovery verification procedures before closure.',
    };
  }

  if (selectedCount === total) {
    return {
      isComplete: true,
      selectedCount: total,
      feedback:
        'All operational handover runbooks, monitoring alert thresholds, escalation procedures, and recovery manifests are fully established.',
    };
  }

  return {
    isComplete: false,
    selectedCount,
    feedback: `${selectedCount} of ${total} handover runbooks selected. Ensure all mandatory items across all 4 operational domains are included.`,
  };
}

export interface PackageValidationResult {
  isReady: boolean;
  missingItems: string[];
}

export function evaluateFinalPackage(state: Chapter8State): PackageValidationResult {
  const missingItems: string[] = [];

  if (!state.evidenceValidated) {
    missingItems.push('Phase 1 delivery claims must be verified with audit evidence.');
  }

  if (!state.classificationValidated) {
    missingItems.push('Deliverables must be classified into accurate governance categories.');
  }

  if (!state.handoverValidated) {
    missingItems.push('Operational handover runbooks and support ownership must be completed.');
  }

  if (!state.deliveryExecutiveSummary || state.deliveryExecutiveSummary.trim().length < 50) {
    missingItems.push('A concise delivery executive summary must be provided.');
  }

  return {
    isReady: missingItems.length === 0,
    missingItems,
  };
}

// ── INITIAL STATE ──
export const INITIAL_CHAPTER8_STATE: Chapter8State = {
  marcusMessageRead: false,
  sophiaMessageRead: false,
  reviewCallCompleted: false,
  deskUnlocked: false,
  activeTab: 'evidence',

  evidenceMatches: {
    claim_scope_documented: null,
    claim_ui_approved: null,
    claim_infra_uat_ready: null,
    claim_cr_assessed: null,
    claim_pilot_completed: null,
    claim_performance_tested: null,
    claim_tech_approvals_recorded: null,
    claim_incident_rca_documented: null,
    claim_recovery_verified: null,
    claim_monitoring_updated: null,
  },
  evidenceAttempts: 0,
  evidenceValidated: false,
  evidenceFeedback: null,

  itemClassifications: {},
  classificationAttempts: 0,
  classificationValidated: false,
  classificationFeedback: null,

  selectedHandoverItems: [],
  handoverAttempts: 0,
  handoverValidated: false,
  handoverFeedback: null,

  deliveryExecutiveSummary:
    'Phase 1 of Project Amigo delivers core Attendance, Appraisal, and Leave management capabilities for ICICI Bank (~80,000 employees). Following rigorous CUG pilot validation, 30,000-user concurrency stress testing, and verified recovery of the Attendance Sync microservice, all agreed Phase 1 deliverables are verified. The Dynamic Bonus Calculator is formally documented as deferred to Phase 2. Operational monitoring and escalation runbooks have been transferred to Application Support and Engineering Operations.',
  packageSubmitted: false,
  packageValidationResults: null,

  marcusTechnicalApproved: false,
  sophiaClientAccepted: false,
  aaravClosureConfirmed: false,
  finalProjectDashboardShown: false,

  completed: false,
  scorecard: {
    shown: false,
    scheduleScore: 0,
    riskScore: 0,
    governanceScore: 0,
    efficiencyScore: 0,
    totalScore: 0,
    breakdown: {
      evidenceScore: 0,
      statusScore: 0,
      handoverScore: 0,
      packageScore: 0,
    },
    outcomeType: 'incomplete',
    outcomeText: '',
    whatYouDidWell: '',
    whatToImprove: '',
    keyTakeaway: CHAPTER8_LEARNING_TAKEAWAY,
    explanations: {
      schedule: '',
      risk: '',
      governance: '',
      efficiency: '',
    },
  },
};

// ── SCORING COMPUTATION ENGINE ──
export function computeChapter8Score(state: Chapter8State): Chapter8Scorecard {
  // Activity 1: Evidence Verification (Max 25 pts)
  let evidenceScore = 0;
  const matches = state.evidenceMatches || {};
  let correctMatches = 0;
  DELIVERABLE_CLAIMS.forEach((claim) => {
    if (matches[claim.id] === claim.expectedEvidenceId) {
      correctMatches += 1;
    }
  });
  evidenceScore = Math.round((correctMatches / DELIVERABLE_CLAIMS.length) * 25);
  if (state.evidenceAttempts > 2) {
    evidenceScore = Math.max(10, evidenceScore - (state.evidenceAttempts - 2) * 2);
  }

  // Activity 2: Delivery Status Classification (Max 25 pts)
  let statusScore = 0;
  const classifications = state.itemClassifications || {};
  let correctClassifications = 0;
  DELIVERY_STATUS_ITEMS.forEach((item) => {
    if (classifications[item.id] === item.expectedColumn) {
      correctClassifications += 1;
    }
  });
  statusScore = Math.round((correctClassifications / DELIVERY_STATUS_ITEMS.length) * 25);
  if (state.classificationAttempts > 2) {
    statusScore = Math.max(10, statusScore - (state.classificationAttempts - 2) * 2);
  }

  // Activity 3: Operational Handover (Max 25 pts)
  let handoverScore = 0;
  const selected = state.selectedHandoverItems || [];
  const mandatoryCount = HANDOVER_ITEMS.filter((i) => i.isMandatory).length;
  const selectedMandatory = selected.filter((id) =>
    HANDOVER_ITEMS.some((i) => i.id === id && i.isMandatory)
  ).length;
  handoverScore = Math.round((selectedMandatory / mandatoryCount) * 25);
  if (state.handoverAttempts > 2) {
    handoverScore = Math.max(10, handoverScore - (state.handoverAttempts - 2) * 2);
  }

  // Activity 4: Final Delivery Package & Acceptance (Max 25 pts)
  let packageScore = 0;
  if (state.packageSubmitted) packageScore += 10;
  if (state.marcusTechnicalApproved) packageScore += 7;
  if (state.sophiaClientAccepted) packageScore += 8;

  const totalScore = Math.min(100, Math.round(evidenceScore + statusScore + handoverScore + packageScore));

  // Map to the 4 Core Metrics
  // 1. Schedule / Timeline: prompt response, efficient completion of package, avoiding operational rework
  const scheduleScore = Math.min(
    100,
    Math.round(
      (evidenceScore / 25) * 40 +
        (state.evidenceAttempts <= 1 ? 30 : 20) +
        (packageScore / 25) * 30
    )
  );

  // 2. Trust & Risk Management: honest disclosure of deferred scope, complete continuity runbooks, separate stakeholder approvals
  const crHonest = classifications['item_cr'] === 'deferred_phase_2';
  const incidentHonest = classifications['item_incident'] === 'completed_verified';
  const riskScore = Math.min(
    100,
    Math.round(
      (crHonest ? 30 : 10) +
        (incidentHonest ? 30 : 15) +
        (handoverScore / 25) * 40
    )
  );

  // 3. Delivery Governance: evidence accuracy, status taxonomy, formal signoff records
  const governanceScore = Math.min(
    100,
    Math.round(
      (evidenceScore / 25) * 40 +
        (statusScore / 25) * 35 +
        (state.marcusTechnicalApproved && state.sophiaClientAccepted ? 25 : 10)
    )
  );

  // 4. Team Efficiency & Velocity: structured handover, role-based ownership, smooth transition
  const efficiencyScore = Math.min(
    100,
    Math.round(
      (handoverScore / 25) * 50 +
        (packageScore / 25) * 35 +
        (state.deliveryExecutiveSummary.length > 50 ? 15 : 0)
    )
  );

  const outcomeType: Chapter8OutcomeType =
    totalScore >= 80 ? 'strong' : totalScore >= 60 ? 'mixed' : 'incomplete';

  const outcomeText =
    outcomeType === 'strong'
      ? 'Project Amigo Phase 1 formally accepted by client leadership and technical operations with full evidence traceability and zero governance gaps.'
      : outcomeType === 'mixed'
      ? 'Phase 1 delivered and accepted with minor documentation delays or classification revisions during final audit.'
      : 'Handover package exhibited governance oversights: missing evidence, obscured deferred scope, or incomplete operational runbooks.';

  const whatYouDidWell =
    outcomeType === 'strong'
      ? 'You backed every delivery claim with verified project evidence, transparently documented the Phase 2 deferral of the Dynamic Bonus Calculator, and established robust operational runbooks for Engineering Operations and Application Support.'
      : 'You completed the handover package and secured final acceptance from Marcus and Sophia.';

  const whatToImprove =
    outcomeType === 'strong'
      ? 'Maintain this gold standard of enterprise delivery governance: never conflate system readiness with client acceptance, and always disclose deferred scope with full transparency.'
      : 'Ensure that deferred scope is clearly documented rather than marked unresolved, and always secure both technical and client approvals separately before declaring project closure.';

  return {
    shown: true,
    scheduleScore,
    riskScore,
    governanceScore,
    efficiencyScore,
    totalScore,
    breakdown: {
      evidenceScore,
      statusScore,
      handoverScore,
      packageScore,
    },
    outcomeType,
    outcomeText,
    whatYouDidWell,
    whatToImprove,
    keyTakeaway: CHAPTER8_LEARNING_TAKEAWAY,
    explanations: {
      schedule:
        scheduleScore >= 80
          ? 'Efficient package assembly and verification without operational lag or unnecessary clarification cycles.'
          : 'Minor delays during evidence matching and package validation.',
      risk:
        riskScore >= 80
          ? 'Exceptional risk control: complete transparency regarding the Phase 2 deferred bonus calculator and thorough support runbooks.'
          : 'Attempted to blur boundaries between completed deliverables and deferred scope.',
      governance:
        governanceScore >= 80
          ? 'Flawless delivery governance. All claims backed by audit records and dual approvals obtained from Marcus and Sophia.'
          : 'Incomplete evidence trail or premature declaration of acceptance.',
      efficiency:
        efficiencyScore >= 80
          ? 'Structured handover organized by operational roles (Engineering Ops, Application Support, Project Delivery).'
          : 'Unclear division of support responsibilities in the operational handover.',
    },
  };
}

// ── SESSION STATE PERSISTENCE ──
let sessionChapter8State: Chapter8State = { ...INITIAL_CHAPTER8_STATE };

export function getChapter8SessionState(): Chapter8State {
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    const raw = globalThis.localStorage.getItem('brained_chapter8_state');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        sessionChapter8State = { ...INITIAL_CHAPTER8_STATE, ...parsed };
      } catch {
        // ignore
      }
    }
  }
  return { ...sessionChapter8State };
}

export function setChapter8SessionState(
  updater: Partial<Chapter8State> | ((prev: Chapter8State) => Chapter8State)
): Chapter8State {
  if (typeof updater === 'function') {
    sessionChapter8State = updater(sessionChapter8State);
  } else {
    sessionChapter8State = { ...sessionChapter8State, ...updater };
  }
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    try {
      globalThis.localStorage.setItem('brained_chapter8_state', JSON.stringify(sessionChapter8State));
    } catch {
      // ignore
    }
  }
  return { ...sessionChapter8State };
}

export function resetChapter8SessionState() {
  sessionChapter8State = {
    ...INITIAL_CHAPTER8_STATE,
    scorecard: { ...INITIAL_CHAPTER8_STATE.scorecard },
  };
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
    try {
      globalThis.localStorage.removeItem('brained_chapter8_state');
    } catch {
      // ignore
    }
  }
}
