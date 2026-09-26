/**
 * GameContext — central frontend game state.
 *
 * Key responsibilities:
 * - Session ID management
 * - In-game clock (drives all timed events on frontend)
 * - Discovered requirements (controls what IDE shows)
 * - Prototype state
 * - Meeting state
 * - Player behaviour signals (for evaluation)
 * - Pause/resume
 * - FrontendEventScheduler — delivers mails, Slack messages, and OS notifications
 *   at exact realElapsedMs offsets. Works fully offline. Backend delivers the same
 *   events via WebSocket; deduplication prevents double-delivery.
 *
 * Characters: marcus, daniel, emma, aarav.
 * Sophia and Olivia DO NOT exist in this context (they appear only in the
 * frozen kickoff script which is not driven by GameContext).
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export { API_BASE };

// ── Types ─────────────────────────────────────────────────────────────────────

export type GamePhase =
  | 'booting'
  | 'kickoff'
  | 'open_play'
  | 'prototype_review'
  | 'final_prep'
  | 'presentation'
  | 'evaluating'
  | 'report';

export type RequirementId =
  | 'req_login'
  | 'req_dashboard'
  | 'req_directory'
  | 'req_leave'
  | 'req_attendance'
  | 'req_approval_workflow'
  | 'req_hr_dashboard'
  | 'req_rbac'
  | 'req_document_upload'
  | 'req_payroll'
  | 'req_audit_logs'
  | 'req_bulk_import';

export interface PrototypeFeature {
  id: RequirementId;
  label: string;
  description: string;
  included: boolean;
  discovered: boolean;
  screen: string;
}

export interface PlayerSignal {
  id: string;
  dimension: string;
  description: string;
  value: number;
  timestamp: Date;
}

export interface InGameClock {
  day: number;
  hour: number;
  minute: number;
  realElapsedMs: number;
  paused: boolean;
}

/** A mail item delivered by the frontend scheduler */
export interface ScheduledMail {
  id: string;
  fromCharacterId: string;
  senderName: string;
  senderRole: string;
  senderEmail: string;
  senderAvatar: string;
  subject: string;
  body: string;
  preview: string;
  priority: 'High' | 'Normal' | 'Low';
  folder: 'Inbox';
  read: boolean;
  starred: boolean;
  ingameTimestamp: string;
  attachment?: { name: string; size: string; type: string };
  eventId: string;
}

/** A Slack message delivered by the frontend scheduler */
export interface ScheduledSlackMsg {
  id: string;
  characterId: string;
  senderName: string;
  senderAvatar: string;
  channel: 'dm-daniel' | 'dm-emma' | 'dm-marcus' | 'dm-aarav' | 'ch-general' | 'ch-titan';
  channelName: string;
  content: string;
  timestamp: string;
  read: boolean;
  eventId: string;
  /** When set, reading this message automatically discovers this requirement */
  discoversRequirement?: RequirementId;
}

/** An OS notification pending delivery */
export interface PendingNotification {
  id: string;
  app: string;
  title: string;
  subtitle?: string;
  body: string;
  timestamp: string;
  actionText?: string;
  onActionAppId?: string;
  isCall?: boolean;
}

export interface GameState {
  sessionId: string | null;
  phase: GamePhase;
  clock: InGameClock;
  discoveredRequirements: Set<RequirementId>;
  prototypeFeatures: PrototypeFeature[];
  meetingState: {
    kickoffDone: boolean;
    kickoffCameraOn: boolean;
    kickoffMicOn: boolean;
    momSubmitted: boolean;
    momText: string;
    prototypeReviewDone: boolean;
    presentationDone: boolean;
    presentationCameraOn: boolean;
  };
  // Only active characters: marcus, daniel, emma, aarav
  stakeholderContacted: Record<'marcus' | 'daniel' | 'emma' | 'aarav', boolean>;
  prototypeBuilt: boolean;
  signals: PlayerSignal[];
  paused: boolean;
  // Delivered items from the frontend scheduler
  deliveredMails: ScheduledMail[];
  deliveredSlackMessages: ScheduledSlackMsg[];
  pendingNotifications: PendingNotification[];
}

// ── Initial state ─────────────────────────────────────────────────────────────

const INITIAL_CLOCK: InGameClock = {
  day: 1, hour: 9, minute: 0, realElapsedMs: 0, paused: false,
};

const CORE_FEATURES: PrototypeFeature[] = [
  { id: 'req_login', label: 'Employee Login (SSO)', description: 'Secure single sign-on for all employees', included: false, discovered: true, screen: 'Login' },
  { id: 'req_dashboard', label: 'Employee Dashboard', description: 'Personalized employee home view', included: false, discovered: true, screen: 'Dashboard' },
  { id: 'req_directory', label: 'Employee Directory', description: 'Searchable org chart and contact finder', included: false, discovered: true, screen: 'Directory' },
  { id: 'req_leave', label: 'Leave Management', description: 'Request, track and view leave balances', included: false, discovered: true, screen: 'Leave' },
  { id: 'req_attendance', label: 'Attendance Tracking', description: 'Clock in/out and attendance records', included: false, discovered: true, screen: 'Attendance' },
  { id: 'req_approval_workflow', label: 'Manager Approval Workflow', description: 'Team leave requests with approve/reject', included: false, discovered: true, screen: 'Approvals' },
  { id: 'req_hr_dashboard', label: 'HR Admin Dashboard', description: 'HR team operations and reporting view', included: false, discovered: true, screen: 'HR Dashboard' },
  { id: 'req_rbac', label: 'Role-Based Access Control', description: 'Employee / Manager / HR / Admin permissions', included: false, discovered: true, screen: 'Access Model' },
  // Hidden — only when discovered
  { id: 'req_document_upload', label: 'Employee Document Upload', description: 'Upload supporting documents for HR requests', included: false, discovered: false, screen: 'Documents' },
  { id: 'req_payroll', label: 'Payroll Integration', description: 'API-based payroll system integration', included: false, discovered: false, screen: 'Payroll' },
  { id: 'req_audit_logs', label: 'Audit Logging', description: 'Full audit trail for all HR data access', included: false, discovered: false, screen: 'Audit Logs' },
  { id: 'req_bulk_import', label: 'Bulk Employee Import', description: 'CSV-based mass employee onboarding', included: false, discovered: false, screen: 'Bulk Import' },
];

const INITIAL_GAME_STATE: GameState = {
  sessionId: localStorage.getItem('brained_session_id'),
  phase: 'booting',
  clock: INITIAL_CLOCK,
  discoveredRequirements: new Set<RequirementId>([
    'req_login', 'req_dashboard', 'req_directory',
    'req_leave', 'req_attendance', 'req_approval_workflow',
    'req_hr_dashboard', 'req_rbac',
  ]),
  prototypeFeatures: CORE_FEATURES,
  meetingState: {
    kickoffDone: false, kickoffCameraOn: false, kickoffMicOn: true,
    momSubmitted: false, momText: '',
    prototypeReviewDone: false, presentationDone: false, presentationCameraOn: false,
  },
  stakeholderContacted: { marcus: false, daniel: false, emma: false, aarav: false },
  prototypeBuilt: false,
  signals: [],
  paused: false,
  deliveredMails: [],
  deliveredSlackMessages: [],
  pendingNotifications: [],
};

// ── Context ───────────────────────────────────────────────────────────────────

interface GameContextValue {
  state: GameState;
  setPhase: (phase: GamePhase) => void;
  discoverRequirement: (id: RequirementId) => void;
  togglePrototypeFeature: (id: RequirementId) => void;
  buildPrototype: () => void;
  setKickoffDone: (cameraOn: boolean, micOn: boolean) => void;
  submitMOM: (text: string) => Promise<void>;
  setPrototypeReviewDone: () => void;
  setPresentationDone: (cameraOn: boolean) => void;
  markStakeholderContacted: (id: 'marcus' | 'daniel' | 'emma' | 'aarav') => void;
  addSignal: (dimension: string, description: string, value: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  setSessionId: (id: string) => void;
  dismissNotification: (id: string) => void;
  markMailRead: (id: string) => void;
  markSlackRead: (channelId: string) => void;
  clock: InGameClock;
}

const GameContext = createContext<GameContextValue | null>(null);

// ── Real→InGame time conversion ───────────────────────────────────────────────

const REAL_MS_PER_INGAME_DAY = 60_000; // 60s real = 1 in-game day
const INGAME_START_HOUR = 9;

function msToInGameClock(elapsedMs: number): Omit<InGameClock, 'paused' | 'realElapsedMs'> {
  const day = Math.min(15, Math.floor(elapsedMs / REAL_MS_PER_INGAME_DAY) + 1);
  const msIntoDay = elapsedMs % REAL_MS_PER_INGAME_DAY;
  const ingameMinutesIntoDay = Math.floor((msIntoDay / REAL_MS_PER_INGAME_DAY) * 1440);
  const startMinutes = INGAME_START_HOUR * 60;
  const totalIngameMinutes = (startMinutes + ingameMinutesIntoDay) % 1440;
  const hour = Math.floor(totalIngameMinutes / 60);
  const minute = totalIngameMinutes % 60;
  return { day, hour, minute };
}

// ── Frontend Event Table ──────────────────────────────────────────────────────
// All events keyed by event_id. fireAtMs = realElapsedMs from clock start (0 = kickoff end).
// condition: receives current GameState snapshot, returns bool.

export type FrontendEventChannel = 'mail' | 'slack' | 'notification' | 'calendar' | 'signal';

interface FrontendEvent {
  event_id: string;
  fireAtMs: number; // real ms from clock start (after kickoff)
  channel: FrontendEventChannel;
  condition?: (state: GameState) => boolean;
  build: (state: GameState) => ScheduledMail | ScheduledSlackMsg | PendingNotification | { dimension: string; description: string; value: number };
}

// ── Character helpers ─────────────────────────────────────────────────────────

const CHAR_META = {
  daniel: { name: 'Daniel Brooks', role: 'Program Manager', avatar: '/character/Daniel_Brooks/DanielDP.png', email: 'daniel.brooks@brained.co' },
  emma:   { name: 'Emma Carter', role: 'HR Specialist & Client Lead', avatar: '/character/Emma_Carter/EmmaDP.png', email: 'emma.carter@brained.co' },
  marcus: { name: 'Marcus Reed', role: 'Chief Technology Officer', avatar: '/character/marcus_reed/MarcusDP.png', email: 'marcus.reed@brained.co' },
  aarav:  { name: 'Aarav Kapoor', role: 'Senior Transformation Advisor', avatar: '/character/AaravDP.png', email: 'aarav.kapoor@brained.co' },
};

function makeMail(id: string, char: keyof typeof CHAR_META, subject: string, body: string, preview: string, priority: 'High' | 'Normal' | 'Low', ingameDay: number, ingameTime: string, attachment?: ScheduledMail['attachment']): ScheduledMail {
  const c = CHAR_META[char];
  return {
    id, fromCharacterId: char,
    senderName: c.name, senderRole: c.role, senderEmail: c.email, senderAvatar: c.avatar,
    subject, body, preview, priority, folder: 'Inbox',
    read: false, starred: false,
    ingameTimestamp: `Day ${ingameDay}, ${ingameTime}`,
    attachment, eventId: id,
  };
}

function makeSlack(id: string, char: keyof typeof CHAR_META, channel: ScheduledSlackMsg['channel'], channelName: string, content: string, ingameTime: string, discoversRequirement?: RequirementId): ScheduledSlackMsg {
  const c = CHAR_META[char];
  return {
    id, characterId: char,
    senderName: c.name, senderAvatar: c.avatar,
    channel, channelName, content,
    timestamp: ingameTime, read: false, eventId: id, discoversRequirement,
  };
}

function makeNotif(id: string, app: string, title: string, body: string, opts?: Partial<PendingNotification>): PendingNotification {
  return { id, app, title, body, timestamp: 'Just now', ...opts };
}

// ── THE EVENT TABLE ───────────────────────────────────────────────────────────

const TITAN_EVENTS: FrontendEvent[] = [

  // ── Day 1 · 09:00 — Desktop visible, game begins ──────────────────────────
  // Player gets ~12 seconds to orient on the desktop before anything arrives.

  // 0:12 — Aarav welcome Slack
  {
    event_id: 'aarav_welcome_slack',
    fireAtMs: 12_000,
    channel: 'slack',
    build: () => makeSlack(
      'aarav_welcome_slack', 'aarav', 'dm-aarav', 'Aarav Kapoor',
      `Morning! Hope you survived the kickoff meeting.

A quick heads up on how to get started:

Check your email inbox first. Daniel sent over the initial project brief with the scope list.

Your main workspace here is the Ideate and Impact Studio. It is the purple app icon in your dock. That is where you will define the solution scope, configure your system connectors, and trigger the prototype build when ready.

Daniel is lead dev on this, so he is waiting on your scope decisions before he can write the backend integration code.

Good luck with everything! Let me know if you hit any roadblocks.`,
      'Day 1 · 09:02',
    ),
  },

  // 0:14 — Notification for Aarav welcome
  {
    event_id: 'notify_aarav_welcome',
    fireAtMs: 14_000,
    channel: 'notification',
    build: () => makeNotif('notif_aarav_welcome', 'Slack', 'Aarav Kapoor', 'Morning! Quick orientation before you dive in...', { subtitle: 'Direct Message' }),
  },

  // 0:30 — Daniel's project brief mail
  {
    event_id: 'daniel_brief_mail',
    fireAtMs: 30_000,
    channel: 'mail',
    build: () => makeMail(
      'daniel_brief_mail', 'daniel',
      'Project Titan — Transformation Brief and Requirements List',
      `Hi,

I am Lead Developer for Project Titan. I will be building out the HR portal implementation based on what we agree on for the transformation strategy.

Below is the initial draft requirement list for sprint 1. Please review these in the Ideate and Impact Studio so we can lock in the tech scope.

APPROVED FEATURE SCOPE (DRAFT)

1. Enterprise Single Sign-On (SSO / OIDC)
Mandatory corporate identity authentication. Marcus brought this up as top priority during kickoff.

2. Employee Dashboard
Central portal dashboard displaying key metrics and quick links for employees.

3. Employee Directory
Searchable team directory across company divisions.

4. Leave Management and Requests
Self-service leave logging. Plant staff need a fast workflow under 3 clicks.

5. Shift Attendance and Clock-in
Terminal clock-in for factory floors. Needs SSO configured first.

6. Manager Approval Workflow
One-click approval interface for team leads and managers.

7. Role-Based Access Control (RBAC)
Permission hierarchy separating regular staff, managers, and HR admins.

8. Payroll Integration (SAP Workday)
API integration for payroll processing. I have the Workday connector ready, but you need to activate it in the studio canvas for me to wire it up.

9. Document Upload
Not in the initial brief, but Emma noted staff currently email attachments for leave requests. Let me know if we are including this.

NEXT STEPS:
Please open the Ideate and Impact Studio from your dock, set the connectors and scope status, and hit Launch and Build Prototype once you are ready.

Prototype review is set for Day 7.

Best,
Daniel Brooks
Lead Developer`,
      'Official requirements brief. Action needed in Ideate & Impact Studio.',
      'High', 1, '09:05',
      { name: 'Project_Titan_Scope_v1.pdf', size: '1.8 MB', type: 'pdf' }
    ),
  },

  // 0:32 — Notification for Daniel's brief mail
  {
    event_id: 'notify_daniel_brief_mail',
    fireAtMs: 32_000,
    channel: 'notification',
    build: () => makeNotif('notif_daniel_brief_mail', 'Mail', 'Daniel Brooks', 'Project Titan — Official Brief (Read First)', { subtitle: 'High Priority · Attachment included' }),
  },

  // 1:00 — Emma survey mail
  {
    event_id: 'emma_survey_mail',
    fireAtMs: 60_000,
    channel: 'mail',
    build: () => makeMail(
      'emma_survey_mail', 'emma',
      'HR Survey Findings — Plant Floor Requirements',
      `Hi,

Here are the key notes from the survey I ran with plant floor supervisors last week:

1. Nearly 70% of staff do not know where to submit leave requests in the current system.
2. Approvals currently take more than two working days because managers handle them manually.
3. Night shift employees share computer terminals and run into login locks easily. Keep auth simple.
4. Supervisors mentioned that staff regularly email medical certificates and paper forms as attachments. Having a document upload feature in the portal would save hours of manual admin.

I think document upload should be in scope for phase 1, but check with Daniel on dev bandwidth.

Emma Carter
HR Transformation Lead`,
      'Survey results from plant employees regarding leave and document upload.',
      'High', 1, '09:14',
    ),
  },

  // 1:02 — Notification for Emma's survey
  {
    event_id: 'notify_emma_survey_mail',
    fireAtMs: 62_000,
    channel: 'notification',
    build: () => makeNotif('notif_emma_survey', 'Mail', 'Emma Carter', 'HR Survey Findings — Plant Floor Requirements', { subtitle: 'High Priority' }),
  },

  // 1:20 — Daniel Slack DM
  {
    event_id: 'daniel_ideate_nudge_slack',
    fireAtMs: 80_000,
    channel: 'slack',
    build: () => makeSlack(
      'daniel_ideate_nudge_slack', 'daniel', 'dm-daniel', 'Daniel Brooks',
      `Hey, just checking if you saw my email.

I am working on auth scaffolding right now, but I have two quick blockers on scope:

First, Payroll integration (SAP Workday). If we include this, the architecture is completely different.
Second, Document Upload. If it is in scope, I need to setup storage bucket parameters today.

Could you open the Ideate and Impact Studio app, toggle the connectors, and set the scope status? Once you do that, I can get moving on the backend.`,
      'Day 1 · 09:22',
      'req_payroll'
    ),
  },

  // 1:22 — Notification for Daniel's Slack
  {
    event_id: 'notify_daniel_slack_ideate',
    fireAtMs: 82_000,
    channel: 'notification',
    build: () => makeNotif('notif_daniel_slack_ideate', 'Slack', 'Daniel Brooks', 'Blocked on two scope decisions. Need input.', { subtitle: 'Direct Message' }),
  },

  // 1:40 — Aarav guide Slack
  {
    event_id: 'aarav_ideate_impact_guide',
    fireAtMs: 100_000,
    channel: 'slack',
    build: () => makeSlack(
      'aarav_ideate_impact_guide', 'aarav', 'dm-aarav', 'Aarav Kapoor',
      `Hey, just wanted to explain how the studio canvas works in case you haven't used it before:

Connectors tab: Enable system integrations like SSO, Payroll, and InfoSec. Daniel's dev build reads these directly.

Requirements tab: Your functional scope table. Mark items as In Scope or Deferred.

Stakeholder Dialogues tab: Notes and direct feedback from Marcus, Emma, and Daniel.

Launch and Build Prototype button: Triggers the build pipeline once you are happy with the setup.

Start by enabling SSO first, since Marcus will definitely look for that in the review.`,
      'Day 1 · 09:40',
    ),
  },

  // 1:42 — Notification for Aarav's guide
  {
    event_id: 'notify_aarav_ideate_guide',
    fireAtMs: 102_000,
    channel: 'notification',
    build: () => makeNotif('notif_aarav_ideate_guide', 'Slack', 'Aarav Kapoor', 'Overview of the Ideate and Impact Studio workflow', { subtitle: 'Direct Message' }),
  },

  // 1:55 — Calendar notification
  {
    event_id: 'prototype_review_calendar',
    fireAtMs: 115_000,
    channel: 'notification',
    build: () => makeNotif('notif_calendar_review', 'Calendar', 'Calendar — Prototype Review added', 'Day 7 · 10:00 AM · Marcus, Daniel, Emma', { subtitle: 'Day 7 · 10:00 AM', onActionAppId: 'calendar' }),
  },

  // ── Day 2 ─────────────────────────────────────────────────────────────────────

  // 2:00 — Marcus Teams notification
  {
    event_id: 'marcus_day2_teams',
    fireAtMs: 120_000,
    channel: 'notification',
    build: () => makeNotif('notif_marcus_day2', 'Teams', 'Marcus Reed (CTO)', "Make sure Enterprise SSO is active in your scope setup. Security comes first.", { subtitle: 'Direct Message · Day 2' }),
  },

  // 2:20 — Daniel Day 2 standup Slack
  {
    event_id: 'daniel_day2_morning_slack',
    fireAtMs: 140_000,
    channel: 'slack',
    build: () => makeSlack(
      'daniel_day2_morning_slack', 'daniel', 'dm-daniel', 'Daniel Brooks',
      `Morning update on dev progress:

Auth scaffolding is underway and leave management DB schema is drafted.

Still waiting on your scope decisions for Payroll integration and Document Upload in the studio so I can finish the API configuration.

Once you confirm scope in Ideate and Impact, I can proceed with the rest.`,
      'Day 2 · 09:00',
      'req_payroll'
    ),
  },

  // 2:22 — Notification for Daniel's day 2 slack
  {
    event_id: 'notify_daniel_day2_slack',
    fireAtMs: 142_000,
    channel: 'notification',
    build: () => makeNotif('notif_daniel_day2', 'Slack', 'Daniel Brooks', 'Morning dev status update', { subtitle: 'Direct Message' }),
  },

  // 2:40 — Aarav day 2 Slack
  {
    event_id: 'aarav_day2_nudge',
    fireAtMs: 160_000,
    channel: 'slack',
    condition: (s) => !s.prototypeBuilt,
    build: () => makeSlack(
      'aarav_day2_nudge', 'aarav', 'dm-aarav', 'Aarav Kapoor',
      `Checking in. Don't worry too much about perfection right now. The goal is to make clear trade-offs, get connectors enabled, and give Daniel a clear scope to build against.

Prototype review is coming up on Day 7, so try to lock in the initial scope soon.`,
      'Day 2 · 09:45',
    ),
  },

  // ── Day 3 ─────────────────────────────────────────────────────────────────────

  // 3:00 — Marcus steering mail
  {
    event_id: 'marcus_steering_mail',
    fireAtMs: 180_000,
    channel: 'mail',
    build: () => makeMail(
      'marcus_steering_mail', 'marcus',
      'Project Titan — Architecture Priorities',
      `Hi,

A few key priorities for the prototype review next week:

1. SSO identity provider integration must be fully configured. Plant workers cannot be stuck with separate passwords.
2. Role-based access control must be strictly defined so staff only see appropriate data.
3. Audit logging for employee records is mandatory for compliance.

We will review the functional prototype live on Day 7.

Marcus Reed
Chief Technology Officer`,
      'CTO priorities regarding SSO, RBAC, and audit logging.',
      'High', 3, '09:30',
    ),
  },

  // 3:02 — Notification for Marcus steering mail
  {
    event_id: 'notify_marcus_steering',
    fireAtMs: 182_000,
    channel: 'notification',
    build: () => makeNotif('notif_marcus_steering', 'Mail', 'Marcus Reed (CTO)', 'Project Titan — Architecture Priorities', { subtitle: 'High Priority' }),
  },

  // 3:20 — Board presentation calendar notification
  {
    event_id: 'board_presentation_calendar',
    fireAtMs: 200_000,
    channel: 'notification',
    build: () => makeNotif('notif_calendar_board', 'Calendar', 'Calendar — Board Presentation added', 'Day 14 · 09:00 AM · All stakeholders', { subtitle: 'Day 14 · 09:00 AM' }),
  },

  // ── Day 4 ─────────────────────────────────────────────────────────────────────

  // 4:00 — Emma mail on Document Upload
  {
    event_id: 'emma_document_upload_mail',
    fireAtMs: 240_000,
    channel: 'mail',
    build: () => makeMail(
      'emma_document_upload_mail', 'emma',
      'Scope Note — Document Upload Requirement',
      `Hi,

Following up on site conversations with HR leads this week. Staff currently have to email medical certificates and ID verification documents manually.

If we do not support document attachments in the portal, employees will still rely on heavy email threads.

If bandwidth allows, I strongly recommend marking Document Upload as In Scope for phase 1.

Let me know what you decide.

Emma Carter`,
      'Document upload requirement feedback from plant supervisors.',
      'High', 4, '10:00',
    ),
  },

  // 4:02 — Notification
  {
    event_id: 'notify_emma_doc_upload',
    fireAtMs: 242_000,
    channel: 'notification',
    build: () => makeNotif('notif_emma_doc_upload', 'Mail', 'Emma Carter', 'Scope Note — Document Upload Requirement', { subtitle: 'High Priority' }),
  },

  // 4:15 — Daniel Slack on Document Upload
  {
    event_id: 'daniel_doc_upload_slack',
    fireAtMs: 255_000,
    channel: 'slack',
    build: () => makeSlack(
      'daniel_doc_upload_slack', 'daniel', 'dm-daniel', 'Daniel Brooks',
      `Saw Emma's note regarding document uploads.

If we include document upload in scope, I will provision storage buckets and upload microservice handling today. If we defer it, I will spend the extra time refining leave approvals.

Update the item status in the Requirements tab of Ideate and Impact whenever you are ready so I know which path to take.`,
      'Day 4 · 11:00',
      'req_document_upload'
    ),
  },

  // 4:17 — Notification for Daniel's doc slack
  {
    event_id: 'notify_daniel_doc_slack',
    fireAtMs: 257_000,
    channel: 'notification',
    build: () => makeNotif('notif_daniel_doc_slack', 'Slack', 'Daniel Brooks', 'Architecture decision needed on Document Upload.', { subtitle: 'Direct Message' }),
  },

  // 4:35 — Emma in #project-titan channel
  {
    event_id: 'emma_plant_hr_slack',
    fireAtMs: 275_000,
    channel: 'slack',
    build: () => makeSlack(
      'emma_plant_hr_slack', 'emma', 'ch-titan', '#project-titan',
      `Quick note from the site visit: current leave requests take 8 clicks from login to completion. We should aim for 3 clicks or less so plant workers can submit leave quickly during shifts.`,
      'Day 4 · 14:30',
      'req_document_upload'
    ),
  },

  // ── Day 5 ─────────────────────────────────────────────────────────────────────

  // 5:00 — Daniel Slack: Payroll reminder
  {
    event_id: 'daniel_payroll_reminder_slack',
    fireAtMs: 300_000,
    channel: 'slack',
    condition: (s) => !s.prototypeBuilt,
    build: () => makeSlack(
      'daniel_payroll_reminder_slack', 'daniel', 'dm-daniel', 'Daniel Brooks',
      `Quick reminder on Payroll integration. If you want Workday sync in the prototype demo, make sure the Workday connector is enabled in Ideate and Impact. Otherwise I will set up a static fallback.`,
      'Day 5 · 09:00',
    ),
  },

  // 5:02 — Notification for Daniel's payroll reminder
  {
    event_id: 'notify_daniel_payroll_reminder',
    fireAtMs: 302_000,
    channel: 'notification',
    condition: (s) => !s.prototypeBuilt,
    build: () => makeNotif('notif_daniel_payroll_reminder', 'Slack', 'Daniel Brooks', 'Pending decision on Payroll connector', { subtitle: 'Direct Message' }),
  },

  // 5:20 — Marcus Teams ping
  {
    event_id: 'marcus_rbac_reminder',
    fireAtMs: 320_000,
    channel: 'notification',
    build: () => makeNotif('notif_marcus_rbac', 'Teams', 'Marcus Reed (CTO)', "Checking in to ensure role-based permissions are set up before the prototype demo.", { subtitle: 'Direct Message' }),
  },

  // 5:40 — Aarav day 5 check-in
  {
    event_id: 'aarav_day5_checkin',
    fireAtMs: 340_000,
    channel: 'slack',
    condition: (s) => !s.prototypeBuilt,
    build: () => makeSlack(
      'aarav_day5_checkin', 'aarav', 'dm-aarav', 'Aarav Kapoor',
      `We are getting close to Day 7. Make sure your core connectors are active and hit the Launch and Build Prototype button when you feel the scope is ready. Daniel will take care of the rest.`,
      'Day 5 · 10:00',
    ),
  },

  // ── Day 6 ─────────────────────────────────────────────────────────────────────

  // 6:00 — Emma mail: progress check
  {
    event_id: 'emma_client_pressure_mail',
    fireAtMs: 360_000,
    channel: 'mail',
    build: () => makeMail(
      'emma_client_pressure_mail', 'emma',
      'Status Check — Portal Prototype Progress',
      `Hi,

The HR stakeholders asked for a quick update on prototype progress. They are eager to see the leave request flow in action during tomorrow's review meeting.

Let me know if everything is on track for tomorrow morning.

Emma`,
      'HR stakeholders asking for a prototype status update.',
      'Normal', 6, '09:00',
    ),
  },

  // 6:05 — Notification for Emma mail
  {
    event_id: 'notify_emma_pressure_mail',
    fireAtMs: 365_000,
    channel: 'notification',
    build: () => makeNotif('notif_emma_pressure', 'Mail', 'Emma Carter', 'Status Check — Portal Prototype Progress', { subtitle: 'Normal Priority' }),
  },

  // 6:15 — Daniel Day 6 Slack
  {
    event_id: 'daniel_day6_urgent_slack',
    fireAtMs: 375_000,
    channel: 'slack',
    condition: (s) => !s.prototypeBuilt,
    build: () => makeSlack(
      'daniel_day6_urgent_slack', 'daniel', 'dm-daniel', 'Daniel Brooks',
      `Prototype review is tomorrow at 10:00 AM. Dev build items are ready on my side.

As soon as you click Launch and Build Prototype in Ideate and Impact, the build will finalize so we have a live demo ready for Marcus and Emma.`,
      'Day 6 · 09:30',
    ),
  },

  // 6:17 — Notification for Daniel day 6 urgent
  {
    event_id: 'notify_daniel_day6_urgent',
    fireAtMs: 377_000,
    channel: 'notification',
    condition: (s) => !s.prototypeBuilt,
    build: () => makeNotif('notif_daniel_day6', 'Slack', 'Daniel Brooks', 'Dev side is ready — launch prototype build when ready.', { subtitle: 'Direct Message' }),
  },

  // 6:30 — Aarav final push
  {
    event_id: 'aarav_day6_pressure',
    fireAtMs: 390_000,
    channel: 'slack',
    condition: (s) => !s.prototypeBuilt,
    build: () => makeSlack(
      'aarav_day6_pressure', 'aarav', 'dm-aarav', 'Aarav Kapoor',
      `Tomorrow is the Day 7 review. Open Ideate and Impact, review your connectors and requirements, and launch the prototype build when ready. You've got this!`,
      'Day 6 · 16:12',
    ),
  },

  // 6:50 — Marcus 10-minute warning
  {
    event_id: 'marcus_prototype_10min_warning',
    fireAtMs: 410_000,
    channel: 'notification',
    condition: (s) => s.meetingState.kickoffDone,
    build: () => makeNotif('notif_marcus_10min', 'Teams', 'Marcus Reed (CTO)', "Prototype review starts in 10 minutes. See you in the meeting.", { subtitle: 'Direct Message · Day 7' }),
  },

  // ── Day 7 — PROTOTYPE REVIEW ──────────────────────────────────────────────────

  // 7:00 — Prototype Review Teams call notification
  {
    event_id: 'prototype_review_notification',
    fireAtMs: 420_000,
    channel: 'notification',
    condition: (s) => s.meetingState.kickoffDone,
    build: () => makeNotif(
      'notif-prototype-review', 'Teams',
      'Microsoft Teams · Prototype Review',
      'Marcus, Daniel, and Emma are in the meeting room. Join now.',
      { subtitle: 'Day 7 · 10:00 AM', actionText: 'Join Review', onActionAppId: 'review', isCall: true }
    ),
  },

  // 7:48 — If player missed the review
  {
    event_id: 'prototype_review_missed_dm',
    fireAtMs: 470_000,
    channel: 'notification',
    condition: (s) => !s.meetingState.prototypeReviewDone,
    build: () => makeNotif('notif_review_missed', 'Teams', 'Daniel Brooks', "We started the meeting without you. We will need to regroup before the board presentation.", { subtitle: 'Direct Message' }),
  },

  {
    event_id: 'missed_review_penalty_signal',
    fireAtMs: 471_000,
    channel: 'signal',
    condition: (s) => !s.meetingState.prototypeReviewDone,
    build: () => ({ dimension: 'delivery_management', description: 'Missed the Day 7 Prototype Review meeting', value: -15 }),
  },

  // ── Day 8 ────────────────────────────────────────────────────────────────────

  {
    event_id: 'daniel_security_review_mail',
    fireAtMs: 480_000,
    channel: 'mail',
    condition: (s) => s.prototypeBuilt,
    build: () => makeMail(
      'daniel_security_review_mail', 'daniel',
      'HR Portal — Security & Architecture Review Required',
      `Hi,

Now that the prototype is taking shape, I need to flag a few things from my side:

1. Authentication: How is SSO being implemented? We need to confirm the identity provider before production.

2. Role-based access: Do employees, managers, and HR admins have different permission scopes? This is a compliance requirement.

3. Audit logging: Every access to employee personal data needs a full audit trail. This is non-negotiable for GDPR alignment and Titan's internal compliance.

Please document the access model and let me know how these are being addressed.

Daniel Brooks`,
      'Security, access model and audit logging need to be addressed before the board.',
      'High', 8, '09:00',
    ),
  },

  {
    event_id: 'notify_daniel_security',
    fireAtMs: 480_000,
    channel: 'notification',
    condition: (s) => s.prototypeBuilt,
    build: () => makeNotif('notif_daniel_security', 'Mail', 'Daniel Brooks', 'HR Portal — Security & Architecture Review Required', { subtitle: 'High Priority' }),
  },

  // ── Day 9 ────────────────────────────────────────────────────────────────────

  {
    event_id: 'marcus_arch_chase_slack',
    fireAtMs: 540_000,
    channel: 'slack',
    build: () => makeSlack(
      'marcus_arch_chase_slack', 'marcus', 'ch-titan', '#project-titan',
      `I need the architecture documented. Not just the screens — show me how authentication, roles, data and integrations fit together. Need to see this before I can sign off.`,
      'Day 9 · 09:00',
    ),
  },

  {
    event_id: 'notify_marcus_arch',
    fireAtMs: 540_000,
    channel: 'notification',
    build: () => makeNotif('notif_marcus_arch', 'Slack', 'Marcus Reed', "I need the architecture documented…", { subtitle: '#project-titan' }),
  },

  // ── Day 10 ───────────────────────────────────────────────────────────────────

  {
    event_id: 'daniel_rbac_reminder_mail',
    fireAtMs: 600_000,
    channel: 'mail',
    condition: (s) => !s.prototypeFeatures.find((f) => f.id === 'req_rbac')?.included,
    build: () => makeMail(
      'daniel_rbac_reminder_mail', 'daniel',
      'RBAC — Still Outstanding',
      `Hi,

Quick note — I don't see role-based access in the prototype yet. Employees, managers and HR administrators should not have the same permissions.

This was raised at kickoff and it's a hard requirement. Please address before the final presentation.

Daniel`,
      'Role-based access control is still missing from the prototype.',
      'High', 10, '09:00',
    ),
  },

  {
    event_id: 'emma_bulk_import_slack',
    fireAtMs: 630_000,
    channel: 'slack',
    condition: (s) => !s.discoveredRequirements.has('req_bulk_import'),
    build: () => makeSlack(
      'emma_bulk_import_slack', 'emma', 'dm-emma', 'Emma Carter',
      `One thing we haven't discussed — Titan is onboarding 200+ new employees next month as part of a factory expansion. CSV bulk import would save the HR team enormous time. Has this been captured anywhere?`,
      'Day 10 · 16:12',
      'req_bulk_import',
    ),
  },

  {
    event_id: 'notify_emma_bulk',
    fireAtMs: 630_000,
    channel: 'notification',
    condition: (s) => !s.discoveredRequirements.has('req_bulk_import'),
    build: () => makeNotif('notif_emma_bulk', 'Slack', 'Emma Carter', 'One thing we haven\'t discussed…', { subtitle: 'Direct Message' }),
  },

  // ── Day 11 ───────────────────────────────────────────────────────────────────

  {
    event_id: 'aarav_day11_slack',
    fireAtMs: 690_000,
    channel: 'slack',
    build: () => makeSlack(
      'aarav_day11_slack', 'aarav', 'dm-aarav', 'Aarav Kapoor',
      `How are you feeling about the presentation? If you haven't reviewed your notes and the prototype together, now's a good time. The board wants to see the transformation story — not just screens.`,
      'Day 11 · 16:12',
    ),
  },

  // ── Day 12 ───────────────────────────────────────────────────────────────────

  {
    event_id: 'daniel_mom_late_nudge',
    fireAtMs: 720_000,
    channel: 'notification',
    condition: (s) => !s.meetingState.momSubmitted,
    build: () => makeNotif('notif_mom_late', 'Teams', 'Daniel Brooks', "We've noticed there's no MOM on file for the kickoff. That's a documentation gap — please address it.", { subtitle: 'Direct Message' }),
  },

  // ── Day 13 ───────────────────────────────────────────────────────────────────

  {
    event_id: 'daniel_day13_slack',
    fireAtMs: 780_000,
    channel: 'slack',
    build: () => makeSlack(
      'daniel_day13_slack', 'daniel', 'ch-titan', '#project-titan',
      `Board expects to see the full transformation story, not just screens. Make sure you can speak to the business impact, the decisions you made, and any outstanding risks. Clarity over comprehensiveness.`,
      'Day 13 · 09:00',
    ),
  },

  {
    event_id: 'marcus_day13_prep_mail',
    fireAtMs: 800_000,
    channel: 'mail',
    build: () => makeMail(
      'marcus_day13_prep_mail', 'marcus',
      'Tomorrow — Final Presentation',
      `Tomorrow is Day 14. The board includes Emma (representing the client team), Daniel, and myself.

Be ready to speak clearly and concisely. This is a business presentation, not a technical demo.

Cover:
1. What Titan's problem was
2. What you built and why
3. What you didn't build and why
4. What the risks are going into production
5. Recommended next steps

Good luck.

Marcus Reed
CTO, Brained Consulting`,
      'Final presentation tomorrow — structure your story.',
      'High', 13, '14:00',
    ),
  },

  {
    event_id: 'notify_marcus_day13',
    fireAtMs: 800_000,
    channel: 'notification',
    build: () => makeNotif('notif_marcus_day13', 'Mail', 'Marcus Reed', 'Tomorrow — Final Presentation', { subtitle: 'High Priority' }),
  },

  {
    event_id: 'final_presentation_reminder',
    fireAtMs: 820_000,
    channel: 'notification',
    build: () => makeNotif('notif_final_reminder', 'Calendar', '📋 Final Presentation — Tomorrow', 'Day 14 · 09:00 · Marcus, Daniel, Emma', { subtitle: 'Reminder' }),
  },

  // ── Day 14 ───────────────────────────────────────────────────────────────────

  {
    event_id: 'final_presentation_call',
    fireAtMs: 840_000,
    channel: 'notification',
    condition: (s) => s.meetingState.kickoffDone,
    build: () => makeNotif(
      'notif-final-presentation', 'Teams',
      '🚨 Microsoft Teams • Final Presentation',
      'Project Titan — Board Presentation. This is it.',
      { subtitle: 'Marcus, Daniel, Emma • Day 14', actionText: 'Join Presentation', onActionAppId: 'presentation', isCall: true }
    ),
  },
];

// ── Provider ──────────────────────────────────────────────────────────────────

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);
  const clockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockStartRealRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef<number>(0);
  // Track which scheduled events have fired (by event_id)
  const firedEventsRef = useRef<Set<string>>(new Set());

  // ── Clock tick ─────────────────────────────────────────────────────────────

  const startClock = useCallback(() => {
    if (clockIntervalRef.current) return;
    clockStartRealRef.current = Date.now() - accumulatedMsRef.current;

    clockIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - (clockStartRealRef.current ?? now);
      accumulatedMsRef.current = elapsed;
      const ingame = msToInGameClock(elapsed);
      setState((prev) => ({
        ...prev,
        clock: { ...ingame, realElapsedMs: elapsed, paused: false },
      }));
    }, 500);
  }, []);

  const stopClock = useCallback(() => {
    if (clockIntervalRef.current) {
      clearInterval(clockIntervalRef.current);
      clockIntervalRef.current = null;
    }
  }, []);

  // Start clock when phase moves to active phases
  useEffect(() => {
    if (['open_play', 'prototype_review', 'final_prep', 'presentation'].includes(state.phase)) {
      if (!state.paused) startClock();
    }
    return () => {};
  }, [state.phase, state.paused, startClock]);

  useEffect(() => () => stopClock(), [stopClock]);

  // ── Frontend Event Scheduler ──────────────────────────────────────────────
  // Runs every 500ms (same as clock). Checks all events against current realElapsedMs.

  useEffect(() => {
    if (!state.clock.paused && state.meetingState.kickoffDone) {
      const elapsed = state.clock.realElapsedMs;

      for (const event of TITAN_EVENTS) {
        if (firedEventsRef.current.has(event.event_id)) continue;
        if (elapsed < event.fireAtMs) continue;
        if (event.condition && !event.condition(state)) {
          // Condition not met: skip but allow re-check next tick
          // (Unless the event has passed by more than 60s — then permanently skip)
          if (elapsed > event.fireAtMs + 60_000) {
            firedEventsRef.current.add(event.event_id);
          }
          continue;
        }

        // Mark fired first
        firedEventsRef.current.add(event.event_id);

        // Deliver
        const payload = event.build(state);

        if (event.channel === 'mail') {
          const mail = payload as ScheduledMail;
          setState((prev) => {
            if (prev.deliveredMails.some((m) => m.id === mail.id)) return prev;
            return { ...prev, deliveredMails: [...prev.deliveredMails, mail] };
          });
        } else if (event.channel === 'slack') {
          const msg = payload as ScheduledSlackMsg;
          setState((prev) => {
            if (prev.deliveredSlackMessages.some((m) => m.id === msg.id)) return prev;
            return { ...prev, deliveredSlackMessages: [...prev.deliveredSlackMessages, msg] };
          });
        } else if (event.channel === 'notification') {
          const notif = payload as PendingNotification;
          setState((prev) => {
            if (prev.pendingNotifications.some((n) => n.id === notif.id)) return prev;
            return { ...prev, pendingNotifications: [...prev.pendingNotifications, notif] };
          });
        } else if (event.channel === 'signal') {
          const sig = event.build(state) as { dimension: string; description: string; value: number };
          addSignalInternal(sig.description, sig.dimension, `auto_${event.event_id}`, sig.value);
        }
      }
    }
  }, [state.clock.realElapsedMs]); // eslint-disable-line

  // ── Actions ────────────────────────────────────────────────────────────────

  const setPhase = useCallback((phase: GamePhase) => {
    setState((prev) => ({ ...prev, phase }));
  }, []);

  const discoverRequirement = useCallback((id: RequirementId) => {
    setState((prev) => {
      if (prev.discoveredRequirements.has(id)) return prev;
      const next = new Set(prev.discoveredRequirements);
      next.add(id);
      const features = prev.prototypeFeatures.map((f) =>
        f.id === id ? { ...f, discovered: true } : f
      );
      return { ...prev, discoveredRequirements: next, prototypeFeatures: features };
    });
    addSignalInternal(`Discovered requirement: ${id}`, 'requirement_management', id, 8);
    const sid = localStorage.getItem('brained_session_id');
    if (sid) fetch(`${API_BASE}/api/game/session/${sid}`, { method: 'GET' }).catch(() => {});
  }, []); // eslint-disable-line

  const togglePrototypeFeature = useCallback((id: RequirementId) => {
    setState((prev) => ({
      ...prev,
      prototypeFeatures: prev.prototypeFeatures.map((f) =>
        f.id === id && f.discovered ? { ...f, included: !f.included } : f
      ),
    }));
  }, []);

  const buildPrototype = useCallback(() => {
    setState((prev) => ({ ...prev, prototypeBuilt: true }));
    addSignalInternal('Player built prototype', 'delivery_management', 'ide_first_run', 10);

    const sid = localStorage.getItem('brained_session_id');
    if (sid) {
      try {
        fetch(`${API_BASE}/api/game/ide/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sid }),
        }).catch(() => {});
      } catch (err) {
        console.warn('Backend IDE sync non-blocking error:', err);
      }
    }
  }, []); // eslint-disable-line

  const setKickoffDone = useCallback((cameraOn: boolean, micOn: boolean) => {
    // Reset the clock origin so scheduler fires from kickoff-end, not page-load
    accumulatedMsRef.current = 0;
    clockStartRealRef.current = Date.now();

    setState((prev) => ({
      ...prev,
      phase: 'open_play',
      meetingState: {
        ...prev.meetingState,
        kickoffDone: true,
        kickoffCameraOn: cameraOn,
        kickoffMicOn: micOn,
      },
      clock: { ...prev.clock, realElapsedMs: 0 },
    }));
    addSignalInternal(
      cameraOn ? 'Camera on during kickoff' : 'Camera off during kickoff',
      'communication', 'kickoff_camera', cameraOn ? 10 : -5
    );
    startClock();
  }, [startClock]); // eslint-disable-line

  const submitMOM = useCallback(async (text: string) => {
    setState((prev) => ({
      ...prev,
      meetingState: { ...prev.meetingState, momSubmitted: true, momText: text },
    }));
    // Score by quality: length + keyword richness
    const keywords = ['requirement', 'feature', 'login', 'dashboard', 'leave', 'payroll', 'rbac', 'sso', 'attendance', 'approval', 'document', 'audit', 'daniel', 'marcus', 'emma', 'action'];
    const textLower = text.toLowerCase();
    const matchedKeywords = keywords.filter((kw) => textLower.includes(kw)).length;
    const qualityScore = text.length > 400 ? 20 : text.length > 200 ? 15 : text.length > 100 ? 10 : 5;
    const keywordBonus = Math.min(matchedKeywords * 2, 10);
    addSignalInternal('Player submitted Meeting MOM', 'documentation', 'mom_submitted', qualityScore + keywordBonus);
    const sid = localStorage.getItem('brained_session_id');
    if (sid && text.trim()) {
      try {
        await fetch(`${API_BASE}/api/game/mom/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sid, mom_text: text }),
        });
      } catch { /* non-blocking */ }
    }
  }, []);

  const setPrototypeReviewDone = useCallback(() => {
    setState((prev) => ({
      ...prev,
      meetingState: { ...prev.meetingState, prototypeReviewDone: true },
    }));
    addSignalInternal('Attended prototype review', 'delivery_management', 'review_attended', 12);
  }, []); // eslint-disable-line

  const setPresentationDone = useCallback((cameraOn: boolean) => {
    setState((prev) => ({
      ...prev,
      phase: 'evaluating',
      meetingState: { ...prev.meetingState, presentationDone: true, presentationCameraOn: cameraOn },
    }));
    addSignalInternal(
      cameraOn ? 'Camera on during final presentation' : 'Camera off during final presentation',
      'communication', 'presentation_camera', cameraOn ? 10 : -5
    );
    stopClock();
  }, [stopClock]); // eslint-disable-line

  const markStakeholderContacted = useCallback((id: 'marcus' | 'daniel' | 'emma' | 'aarav') => {
    setState((prev) => {
      if (prev.stakeholderContacted[id]) return prev;
      addSignalInternal(`Contacted ${id}`, 'stakeholder_management', `contact_${id}`, 6);
      return {
        ...prev,
        stakeholderContacted: { ...prev.stakeholderContacted, [id]: true },
      };
    });
  }, []); // eslint-disable-line

  const addSignal = useCallback((dimension: string, description: string, value: number) => {
    addSignalInternal(description, dimension, `manual_${Date.now()}`, value);
  }, []);

  const pauseGame = useCallback(() => {
    stopClock();
    setState((prev) => ({ ...prev, paused: true, clock: { ...prev.clock, paused: true } }));
    const sid = localStorage.getItem('brained_session_id');
    if (sid) fetch(`${API_BASE}/api/game/session/${sid}/pause`, { method: 'POST' }).catch(() => {});
  }, [stopClock]);

  const resumeGame = useCallback(() => {
    clockStartRealRef.current = Date.now() - accumulatedMsRef.current;
    setState((prev) => ({ ...prev, paused: false, clock: { ...prev.clock, paused: false } }));
    startClock();
    const sid = localStorage.getItem('brained_session_id');
    if (sid) fetch(`${API_BASE}/api/game/session/${sid}/resume`, { method: 'POST' }).catch(() => {});
  }, [startClock]);

  const setSessionId = useCallback((id: string) => {
    localStorage.setItem('brained_session_id', id);
    setState((prev) => ({ ...prev, sessionId: id }));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      pendingNotifications: prev.pendingNotifications.filter((n) => n.id !== id),
    }));
  }, []);

  const markMailRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      deliveredMails: prev.deliveredMails.map((m) =>
        m.id === id ? { ...m, read: true } : m
      ),
    }));
  }, []);

  const markSlackRead = useCallback((channelId: string) => {
    setState((prev) => ({
      ...prev,
      deliveredSlackMessages: prev.deliveredSlackMessages.map((m) =>
        m.channel === channelId ? { ...m, read: true } : m
      ),
    }));
  }, []);

  // ── Internal signal helper ─────────────────────────────────────────────────

  function addSignalInternal(description: string, dimension: string, _key: string, value: number) {
    const signal: PlayerSignal = {
      id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      dimension, description, value, timestamp: new Date(),
    };
    setState((prev) => ({ ...prev, signals: [...prev.signals, signal] }));
  }

  const value: GameContextValue = {
    state, setPhase,
    discoverRequirement, togglePrototypeFeature, buildPrototype,
    setKickoffDone, submitMOM, setPrototypeReviewDone, setPresentationDone,
    markStakeholderContacted, addSignal,
    pauseGame, resumeGame, setSessionId,
    dismissNotification, markMailRead, markSlackRead,
    clock: state.clock,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
