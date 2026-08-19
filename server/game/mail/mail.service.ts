/**
 * Mail Service — dynamic mail system driven by World State.
 * All mails are stored in World State and pushed to the frontend via WebSocket.
 * No hardcoded mails at session start — everything fires from the clock timeline.
 */

import { mutateWorldState, readWorldState, logSignal } from '../engine/worldState.engine';
import { publishStateChanged } from '../engine/worldState.redis';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GameMail {
  id: string;
  from_character_id: string;
  sender_name: string;
  sender_role: string;
  sender_avatar: string;
  sender_email: string;
  subject: string;
  body: string;
  preview: string;
  timestamp_real: Date;
  timestamp_ingame: string; // "Day 1 — 10:48"
  read: boolean;
  starred: boolean;
  priority: 'High' | 'Normal' | 'Low';
  folder: 'Inbox' | 'Sent';
  attachment?: {
    name: string;
    size: string;
    type: string;
    content?: string; // PDF text content for in-app viewing
  };
  event_id: string; // links to the rule/event that triggered this
}

// ── Mail delivery ─────────────────────────────────────────────────────────────

/**
 * Deliver a mail to the player.
 * Writes to World State and emits a WebSocket notification.
 */
export async function deliverMail(sessionId: string, mail: GameMail): Promise<void> {
  const state = await readWorldState(sessionId);
  if (!state) return;

  // Append mail to World State
  const existingMails = (state as any).mails ?? [];
  await mutateWorldState(sessionId, () => ({
    mails: [...existingMails, mail],
  }), {
    type: 'mail_received',
    actor: mail.from_character_id,
    target: 'player',
    payload: {
      mail_id: mail.id,
      subject: mail.subject,
      event_id: mail.event_id,
    },
  });

  // Push real-time notification to frontend
  await publishStateChanged(sessionId, {
    type: 'new_mail',
    mail,
    notification: {
      app: 'Mail',
      title: `Mail • ${mail.sender_name}`,
      subtitle: mail.sender_name,
      body: mail.subject,
      actionText: 'Open Mail',
      onActionAppId: 'inbox',
    },
  });

  console.log(`[MAIL] Delivered "${mail.subject}" from ${mail.from_character_id} to session ${sessionId}`);
}

// ── Pre-built mail templates (scenario-specific) ─────────────────────────────

export function buildDanielBriefMail(ingameTime: string): GameMail {
  return {
    id: `mail_daniel_brief_${Date.now()}`,
    from_character_id: 'daniel',
    sender_name: 'Daniel Brooks',
    sender_role: 'Transformation Program Manager',
    sender_avatar: '/character/Daniel_Brooks/DanielDP.png',
    sender_email: 'daniel.brooks@brained.io',
    subject: 'Project Brief — Titan Manufacturing HR Portal',
    preview: 'As promised — full brief attached. Read it carefully, there\'s a lot in there...',
    body: `Hi,

As promised — full brief attached. Read it carefully, there's a lot in there.

Key things to note immediately:
• Timeline is two weeks from today, not three — I need to stop Marcus from confusing people on this.
• Payroll integration has an open constraint — the vendor API docs are outdated. Chase that early.
• HR Announcements, Approval Workflow, and Notification Centre are Phase 2 in the brief — but flag with me if Sophia's team expects them sooner.

Any questions, ask. I'd rather you ask twice than build the wrong thing once.

— Daniel`,
    timestamp_real: new Date(),
    timestamp_ingame: ingameTime,
    read: false,
    starred: false,
    priority: 'High',
    folder: 'Inbox',
    event_id: 'daniel_brief_mail',
    attachment: {
      name: 'Brained_Consulting_Project_Brief_Titan.pdf',
      size: '248 KB',
      type: 'PDF Document',
      content: `BRAINED CONSULTING — PROJECT BRIEF
Client: Titan Manufacturing Ltd. | Engagement: Enterprise HR Portal Transformation

1. BUSINESS OBJECTIVE
Titan Manufacturing seeks to replace its fragmented legacy HR systems with a single unified Employee Management Portal, improving employee experience and enabling centralized HR operations across all 7 country operations.

2. PROJECT SCOPE — PHASE 1
• Employee Login (Single Sign-On)
• Employee Dashboard
• Leave Management
• Attendance Management
• Payroll Integration
• Document Management

3. TIMELINE
• Kickoff: Today
• Prototype review: Mid-engagement (internal milestone — Day 7)
• Board Presentation: 2 weeks from kickoff (Day 14)
NOTE: Earlier informal communication referenced 3 weeks — confirmed 2 weeks per updated board calendar.

4. STAKEHOLDERS
• Marcus Reed — CTO, Brained (Project Sponsor)
• Daniel Brooks — Program Manager, Brained
• Emma Carter — HR Transformation Specialist, Brained
• Olivia Hayes — Head of Information Security, Brained
• Sophia Bennett — VP of HR, Titan Manufacturing (Client Sponsor)

5. TECHNOLOGY STACK
Cloud-native architecture, SSO via enterprise identity provider, REST-based integration layer for Payroll.

6. KNOWN CONSTRAINTS
• Titan's payroll vendor API documentation is outdated — integration details must be confirmed directly with vendor before development finalizes payroll scope.
• Employee data volume: 18,000+ records. Any bulk data handling must be flagged early.

7. OUT OF SCOPE — FUTURE PHASE
HR Announcements module, Approval Workflow automation, and Notification Centre are Phase 2.
Flag with Daniel if client expects any of these sooner.`,
    },
  };
}

export function buildEmmaSurveyMail(ingameTime: string): GameMail {
  return {
    id: `mail_emma_survey_${Date.now()}`,
    from_character_id: 'emma',
    sender_name: 'Emma Carter',
    sender_role: 'HR Transformation Specialist',
    sender_avatar: '/character/Emma_Carter/EmmaDP.png',
    sender_email: 'emma.carter@brained.io',
    subject: 'Employee Survey Findings — Titan Plant Teams',
    preview: 'Happy to share the employee experience research I ran last month — really useful context...',
    body: `Hi,

Happy to share the employee experience research I ran last month across 4 of the Titan plants. Really useful context for what we\'re building.

KEY FINDINGS:

Leave Management (critical pain point):
• 62% of plant-floor employees don't know how to file a leave request digitally
• Two plants are still fully paper-based for leave — Malaysia and Brazil
• Average leave approval time: 11 days (should be same-day for planned leave)

Attendance (medium pain):
• No central attendance visibility for team leads
• Overtime tracking is spreadsheet-based across 3 plants

Employee Directory (high demand):
• 78% of survey respondents said they can't find contact info for colleagues in other plants
• 0 plants have a working org-chart view

Document Access:
• Payslips, contracts, and ID documents are stored in at least 3 different systems
• Employees frequently contact HR just to get their own documents

General Sentiment:
• "One login, one place" is the most-requested feature across all plants
• Adoption will fail if the mobile experience isn't good — 64% of plant employees are mobile-first

Happy to jump on a call if you want to walk through any of this.

— Emma`,
    timestamp_real: new Date(),
    timestamp_ingame: ingameTime,
    read: false,
    starred: false,
    priority: 'Normal',
    folder: 'Inbox',
    event_id: 'emma_survey_mail',
  };
}

export function buildEmmaAmendmentMail(ingameTime: string): GameMail {
  return {
    id: `mail_emma_amendment_${Date.now()}`,
    from_character_id: 'emma',
    sender_name: 'Emma Carter',
    sender_role: 'HR Transformation Specialist',
    sender_avatar: '/character/Emma_Carter/EmmaDP.png',
    sender_email: 'emma.carter@brained.io',
    subject: 'Scope Amendment — Employee Document Upload (Action Required)',
    preview: 'One more thing — spoke to plant HR leads and Document Upload really can\'t be optional...',
    body: `Hi,

One more thing — I spoke to a few plant HR leads over the weekend, and Employee Document Upload really can't be optional. They need to attach ID proof and certifications directly through the portal.

Specifically, the use case is:
• New joiners uploading ID documents and certifications during onboarding
• HR staff requesting document re-submission (e.g. expired certifications)
• Audit compliance — some plants need a documented trail of document submissions

This wasn't in my original brief because it came up verbally, not in the initial scope document. I wanted to make sure you knew about it before you got too far into development.

Can we make sure this gets included? It would significantly affect adoption at the plant level if we miss it.

Let me know if you need more detail from the plant HR teams — I can get you on a call with the Malaysia lead.

— Emma`,
    timestamp_real: new Date(),
    timestamp_ingame: ingameTime,
    read: false,
    starred: false,
    priority: 'High',
    folder: 'Inbox',
    event_id: 'hr_amendment',
  };
}

export function buildSophiaPrototypeMail(ingameTime: string): GameMail {
  return {
    id: `mail_sophia_prototype_${Date.now()}`,
    from_character_id: 'sophia',
    sender_name: 'Sophia Bennett',
    sender_role: 'VP of HR, Titan Manufacturing',
    sender_avatar: '/character/Sophia_bennett/SophiaDP.png',
    sender_email: 'sophia.bennett@titanmfg.com',
    subject: 'Quick check-in — can we see something?',
    preview: 'Is there anything I could look at yet, even rough? I\'d love to bring something visual...',
    body: `Hi,

Hope the project is moving well from your end — we're excited to see where this goes.

Is there anything I could look at yet, even if it's rough? My exec team have been asking questions and I'd love to bring something visual to my next internal update — even a wireframe or a working dashboard view would help manage expectations on our side.

Also — just confirming — you have the employee directory and the leave management flow in scope, right? Those two are the most visible to our people and I want to make sure we're aligned.

Let me know when there's something to see.

Best,
Sophia Bennett
VP of HR — Titan Manufacturing`,
    timestamp_real: new Date(),
    timestamp_ingame: ingameTime,
    read: false,
    starred: false,
    priority: 'High',
    folder: 'Inbox',
    event_id: 'client_prototype_ask',
  };
}

export function buildOliviaReviewMail(ingameTime: string): GameMail {
  return {
    id: `mail_olivia_review_${Date.now()}`,
    from_character_id: 'olivia',
    sender_name: 'Olivia Hayes',
    sender_role: 'Head of Information Security',
    sender_avatar: '/character/Olivia_hayes/OliviaDP.png',
    sender_email: 'olivia.hayes@brained.io',
    subject: 'Architecture Review — Compliance Gaps (Action Required Before Board)',
    preview: 'I\'ve had a first look at what\'s been scoped. Audit Logs and RBAC are not present...',
    body: `Hi,

I\'ve had a first look at the scoped architecture. Two compliance gaps that are non-negotiable before I can sign off:

1. AUDIT LOGS — Not currently in scope
   Standard requirement under ISO 27001 and SOC2 Type II for any system handling employee personal data. Every data access event, modification, and deletion must be logged with user identity, timestamp, and action type. This is not optional for enterprise HR systems at Titan's scale.

2. ROLE-BASED ACCESS CONTROL (RBAC) — Not adequately specified
   "SSO is planned" is not sufficient. We need:
   • A documented access model (minimum: Employee, HR Manager, HR Admin, IT Admin roles)
   • Data segregation rules (employees can't see other employees' payslips, certifications, etc.)
   • NIST 800-207 alignment for access control
   This must be in the prototype, not deferred.

3. AUTHENTICATION — Needs documented approach
   The authentication flow needs a proper technical spec — not just "SSO." What identity provider? Token lifetime? Session management? MFA enforcement for HR Admin roles?

I'm happy to walk through any of these — but I will not sign off for the board review if these aren't addressed. This isn't about being difficult; it's about protecting Titan's 18,000 employees' data.

— Olivia Hayes
Head of Information Security`,
    timestamp_real: new Date(),
    timestamp_ingame: ingameTime,
    read: false,
    starred: false,
    priority: 'High',
    folder: 'Inbox',
    event_id: 'olivia_review',
  };
}

export function buildSophiaFollowUpMail(ingameTime: string): GameMail {
  return {
    id: `mail_sophia_followup_${Date.now()}`,
    from_character_id: 'sophia',
    sender_name: 'Sophia Bennett',
    sender_role: 'VP of HR, Titan Manufacturing',
    sender_avatar: '/character/Sophia_bennett/SophiaDP.png',
    sender_email: 'sophia.bennett@titanmfg.com',
    subject: 'Re: Project Status — My team is asking questions',
    preview: 'My exec team is asking me for an update. What can I tell them?',
    body: `Hi,

My exec team is now actively asking me for a project status update — the board presentation is coming up and I need to be able to tell them something concrete.

What can I share with them right now? Even a high-level summary of what's been built and what's coming would help.

Also — is the employee directory done? That was the one I promised them as the first visible win.

Best,
Sophia`,
    timestamp_real: new Date(),
    timestamp_ingame: ingameTime,
    read: false,
    starred: false,
    priority: 'High',
    folder: 'Inbox',
    event_id: 'sophia_follow_up',
  };
}
