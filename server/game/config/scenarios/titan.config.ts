/**
 * TITAN MANUFACTURING SCENARIO CONFIG
 * Full scenario content per §1 of the spec.
 * This is the ONLY file that references "Titan Manufacturing", character names, etc.
 * All engine code resolves through ScenarioDef — no hardcoding elsewhere.
 */

import type { ScenarioDef } from './scenario.types';

export const TITAN_SCENARIO: ScenarioDef = {
  id: 'titan_manufacturing_v1',
  name: 'Project Titan — Enterprise HR Portal',
  client: 'Titan Manufacturing Ltd.',

  // ── Scoring weights (must sum to 1.0) ────────────────────────────────────
  scoringWeights: {
    decision_quality: 0.25,
    stakeholder_management: 0.20,
    communication_integrity: 0.20,
    documentation_execution: 0.15,
    business_security_understanding: 0.10,
    presentation_outcome: 0.10,
  },

  boardDeadlineIngame: 'Day 14',
  totalIngameDays: 14,

  // ── 13 Requirements (§1.3) ────────────────────────────────────────────────
  requirements: [
    {
      id: 'req_sso',
      label: 'Employee Login (SSO)',
      revealedVia: 'kickoff',
      owner: 'marcus',
      complianceGate: false,
    },
    {
      id: 'req_dashboard',
      label: 'Employee Dashboard',
      revealedVia: 'kickoff',
      owner: 'sophia',
      complianceGate: false,
    },
    {
      id: 'req_leave',
      label: 'Leave Management',
      revealedVia: 'kickoff',
      owner: 'emma',
      complianceGate: false,
    },
    {
      id: 'req_attendance',
      label: 'Attendance Management',
      revealedVia: 'kickoff',
      owner: 'emma',
      complianceGate: false,
    },
    {
      id: 'req_directory',
      label: 'Employee Directory',
      revealedVia: 'kickoff',
      owner: 'sophia',
      complianceGate: false,
    },
    {
      id: 'req_payroll',
      label: 'Payroll Integration',
      revealedVia: 'brief',
      owner: 'daniel',
      complianceGate: false,
    },
    {
      id: 'req_documents',
      label: 'Document Management',
      revealedVia: 'brief',
      owner: 'daniel',
      complianceGate: false,
    },
    {
      id: 'req_announcements',
      label: 'HR Announcements',
      revealedVia: 'brief',
      owner: 'daniel',
      complianceGate: false,
    },
    {
      id: 'req_approvals',
      label: 'Approval Workflow',
      revealedVia: 'brief',
      owner: 'daniel',
      complianceGate: false,
    },
    {
      id: 'req_notifications',
      label: 'Notification Centre',
      revealedVia: 'brief',
      owner: 'daniel',
      complianceGate: false,
    },
    {
      // Late-arriving, always fires via Emma at ~35% mark
      id: 'req_document_upload',
      label: 'Employee Document Upload',
      revealedVia: 'mid_event',
      owner: 'emma',
      complianceGate: false,
    },
    {
      // Surfaces when Daniel reviews architecture after first IDE run
      id: 'req_audit_logs',
      label: 'Audit Logs',
      revealedVia: 'mid_event',
      owner: 'daniel',
      complianceGate: true,
    },
    {
      // Raised by Marcus at kickoff; Daniel treats as hard compliance gate
      id: 'req_rbac',
      label: 'Role-Based Access Control (RBAC)',
      revealedVia: 'mid_event',
      owner: 'daniel',
      complianceGate: true,
    },
  ],

  // ── Characters (active post-kickoff) ────────────────────────────────────────
  // Sophia and Olivia appear in the frozen kickoff script only.
  // Post-kickoff, Emma absorbs client-side HR responsibilities (was Sophia).
  // Daniel absorbs security/architecture responsibilities (was Olivia).
  characters: [
    {
      id: 'marcus',
      name: 'Marcus Reed',
      role: 'Chief Technology Officer (CTO)',
      department: 'Technology & Engineering',
      badge: 'Technology Visionary',
      knowledgeScope: ['req_sso', 'req_rbac', 'req_dashboard', 'req_payroll'],
      initialTrust: 70,
      replyDelayMs: 7_000,   // Marcus replies fast — he's curt
      dp: '/character/marcus_reed/MarcusDP.png',
    },
    {
      id: 'daniel',
      name: 'Daniel Brooks',
      role: 'Transformation Program Manager & Technical Lead',
      department: 'Program Delivery',
      badge: 'Deadline Guardian',
      knowledgeScope: [
        'req_sso', 'req_dashboard', 'req_leave', 'req_attendance', 'req_directory',
        'req_payroll', 'req_documents', 'req_announcements', 'req_approvals', 'req_notifications',
        'req_audit_logs', 'req_rbac',
      ],
      initialTrust: 75,
      replyDelayMs: 9_000,   // Daniel is busy but responsive
      dp: '/character/Daniel_Brooks/DanielDP.png',
    },
    {
      id: 'emma',
      name: 'Emma Carter',
      role: 'HR Transformation Specialist & Client Lead',
      department: 'HR Transformation',
      badge: 'Employee Advocate',
      knowledgeScope: ['req_leave', 'req_attendance', 'req_directory', 'req_documents', 'req_announcements', 'req_document_upload'],
      initialTrust: 80,
      replyDelayMs: 12_000,   // Emma writes longer, more thoughtful messages
      dp: '/character/Emma_Carter/EmmaDP.png',
    },
    {
      id: 'aarav',
      name: 'Aarav Kapoor',
      role: 'Senior Transformation Advisor',
      department: 'Advisory',
      badge: 'Mentor',
      knowledgeScope: ['req_sso', 'req_dashboard', 'req_leave', 'req_attendance'],
      initialTrust: 85,
      replyDelayMs: 10_000,   // Aarav is thoughtful but not slow
      dp: '/character/AaravDP.png',
    },
  ],

  // ── Event Rules (§1.6) — data, not code ───────────────────────────────────
  eventRules: [
    {
      event_id: 'hr_amendment',
      label: 'Emma — Employee Document Upload amendment (with request to check Daniel)',
      trigger_type: 'always_at_time',
      condition_expr: 'progress >= 35',
      fires_once: true,
      sender_character_id: 'emma',
      delivery_channel: 'mail',
      message_template:
        "I spoke to a few of the plant HR leads this week, and one thing came up that I didn't flag at kickoff — they really need employees to be able to attach documents directly. ID proof, medical certs for leave, that kind of thing. It came up across three plants so it's not a one-off. Could you have a quick word with Daniel and let me know if Employee Document Upload is feasible for Phase 1? I don't want to push for something that breaks the timeline — just want to check before I go back to them.",
    },
    {
      event_id: 'daniel_document_upload_response',
      label: 'Daniel — Document Upload is Phase 2 (fires after player asks Daniel about Emma amendment)',
      trigger_type: 'conditional',
      // Fires if the player has messaged Daniel after the hr_amendment event fired
      condition_expr: `
        fired_events.includes('hr_amendment') &&
        !fired_events.includes('daniel_document_upload_response') &&
        conversation_threads.daniel?.some(m => m.role === 'player')
      `,
      fires_once: true,
      sender_character_id: 'daniel',
      delivery_channel: 'teams',
      message_template:
        "On the document upload thing — it's a reasonable feature, but adding it to Phase 1 now would push us. We've got payroll integration and RBAC still to lock in, and the build timeline is already tight. I'd recommend logging it as a confirmed Phase 2 item and letting Emma know directly — better she hears it with reasoning than just a no.",
    },
    {
      event_id: 'manager_checkin',
      label: 'Daniel — Progress update nudge',
      trigger_type: 'conditional',
      // Fires if player has sent Daniel nothing in the prior ~4 minutes of real time
      condition_expr: `
        !fired_events.includes('manager_checkin') &&
        !conversation_threads.daniel?.some(m => m.role === 'player') &&
        real_elapsed_ms > 240000
      `,
      fires_once: true,
      sender_character_id: 'daniel',
      delivery_channel: 'teams',
      message_template:
        "Quick check — where are we on the prototype? Board's asking me for a status line and I want to give them something real.",
    },
    {
      event_id: 'cto_security_nudge',
      label: 'Marcus — Security review nudge',
      trigger_type: 'conditional',
      condition_expr: `
        !fired_events.includes('cto_security_nudge') &&
        !fired_events.includes('daniel_security_review') &&
        !conversation_threads.daniel?.some(m => m.role === 'player') &&
        progress >= 40
      `,
      fires_once: true,
      sender_character_id: 'marcus',
      delivery_channel: 'teams',
      message_template:
        "Has the architecture been security-reviewed? I don't want RBAC and audit logging flagged the week before the board demo.",
    },
    {
      event_id: 'daniel_security_review',
      label: 'Daniel — InfoSec architecture review (fires on first IDE run)',
      trigger_type: 'conditional',
      condition_expr: `fired_events.includes('ide_first_run') && !fired_events.includes('daniel_security_review')`,
      fires_once: true,
      sender_character_id: 'daniel',
      delivery_channel: 'mail',
      message_template:
        "Now the prototype is taking shape, I need to flag three things before we go further. One: how is SSO being implemented — we need a documented auth flow, not just a placeholder. Two: RBAC — employees, managers and HR admins must have distinct permission sets, not the same login access. Three: Audit Logs — every access to employee data needs an immutable trail. Please document the access model before the prototype review.",
    },
    {
      event_id: 'emma_client_pressure',
      label: 'Emma — Client pressure for prototype',
      trigger_type: 'always_at_time',
      condition_expr: 'progress >= 50',
      fires_once: true,
      sender_character_id: 'emma',
      delivery_channel: 'mail',
      message_template:
        "The Titan HR team has been asking if there's anything they can see yet, even if it's rough. The employee experience side is what they care most about. Is there a prototype link I could share with them?",
    },
  ],

  // ── Project Brief PDF content (§1.5) ─────────────────────────────────────
  briefPdfContent: `BRAINED CONSULTING — PROJECT BRIEF
Client: Titan Manufacturing Ltd. | Engagement: Enterprise HR Portal Transformation
Prepared by: Daniel Brooks, Transformation Program Manager

1. Business Objective
Titan Manufacturing seeks to replace its fragmented legacy HR systems with a single, unified Employee Management Portal, improving employee experience and enabling centralized HR operations across all 7 country operations.

2. Project Scope (Phase 1)
• Employee Login (Single Sign-On)
• Employee Dashboard
• Leave Management
• Attendance Management
• Payroll Integration
• Document Management

3. Timeline
• Kickoff: Today
• Prototype review: Mid-engagement (internal milestone)
• Board Presentation: 2 weeks from kickoff
(Note: earlier informal communication referenced 3 weeks — confirmed 2 weeks per updated board calendar.)

4. Stakeholders
Marcus Reed (CTO, Brained) · Daniel Brooks (Program Manager & Technical Lead, Brained) · Emma Carter (HR Transformation Specialist & Client Lead, Brained)

5. Technology Stack
Cloud-native architecture, SSO via enterprise identity provider, REST-based integration layer for Payroll (existing Titan payroll system — API details TBD, see Known Constraints).

6. Expected Deliverables
Working prototype demonstrating core Phase 1 scope, ready for board walkthrough. Full production rollout is a separate, later phase.

7. Known Constraints
• Titan's existing payroll vendor API documentation is outdated; integration details should be confirmed directly with the vendor before development finalizes payroll scope.
• Employee data volume is large (18,000+ records) — any bulk data handling needs should be flagged early.

8. Out of Scope / Future Phase
HR Announcements module, Approval Workflow automation, and Notification Centre are being scoped for Phase 2 — flag with Daniel if the client expects any of these sooner.`,

  // ── Kickoff script (§1.4) — pre-recorded, shown as transcript ────────────
  kickoffScript: `MARCUS: Thanks for joining, everyone — let's keep this tight, I've got the architecture review after this. [player_name], you're picking up Project Titan. Titan Manufacturing, HR Portal replacement, board wants to see it in three weeks.

DANIEL: Two weeks, actually — the board review got moved up. I'll send you the brief right after this.

MARCUS: (slightly irritated) Two weeks. Fine. Point is, we need Single Sign-On sorted early, that's non-negotiable — I don't want auth bolted on at the end again.

SOPHIA: From our side — our employees don't even know where to log a leave request half the time. We've got three different portals doing three different things. Whatever you build, they need one dashboard, one login, and they need to be able to actually find each other — right now there's no working employee directory at all.

EMMA: (jumping in) And it's not just directory — leave and attendance are still half paper-based in two of the plants. If we don't fix that experience, nobody will adopt whatever we ship, no matter how good the backend is.

SOPHIA: Exactly. Make it easy to use, or it doesn't matter.

MARCUS: Understood. Daniel will loop in the rest of the requirements over email — I've got to jump, but [player_name], any blockers, come to me directly, not around me.

DANIEL: (fast) I'll have the brief in your inbox in the next few minutes. Read it properly, there's a lot in there. If anything's unclear, ask — I'd rather you ask twice than build the wrong thing once.

EMMA: I'll send over the employee survey findings separately too — good context on what people actually struggle with day to day.

MARCUS: (already leaving) Good call. Alright, I'm out — good luck.`,
};
