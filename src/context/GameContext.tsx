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

export type FrontendEventChannel = 'mail' | 'slack' | 'notification' | 'calendar';

interface FrontendEvent {
  event_id: string;
  fireAtMs: number; // real ms from clock start (after kickoff)
  channel: FrontendEventChannel;
  condition?: (state: GameState) => boolean;
  build: (state: GameState) => ScheduledMail | ScheduledSlackMsg | PendingNotification;
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
  // ── Day 1 ────────────────────────────────────────────────────────────────────

  {
    event_id: 'daniel_brief_mail',
    fireAtMs: 45_000,
    channel: 'mail',
    build: () => makeMail(
      'daniel_brief_mail', 'daniel',
      'Project Titan — Transformation Brief & Immediate Next Steps',
      `Hi,

As promised — the project brief is attached. Please read it in full; there's a lot of context in there that we won't cover in every meeting.

Key points:
• SSO is non-negotiable per Marcus — start there.
• The board date is Day 14. That is firm.
• Payroll integration has a constraint — the vendor API docs are outdated. Don't over-commit here.
• Phase 2 items (Announcements, Approval Workflow automation, Notification Centre) are out of scope for now — flag with me if the client asks for them.

Come to me with questions. I'd rather you ask twice than build the wrong thing.

Daniel Brooks
Program Manager, Brained Consulting`,
      'As promised — the project brief is attached.',
      'High', 1, '09:18',
      { name: 'Project_Titan_Brief.pdf', size: '2.4 MB', type: 'pdf' }
    ),
  },

  {
    event_id: 'notify_daniel_brief_mail',
    fireAtMs: 45_000,
    channel: 'notification',
    build: () => makeNotif('notif_daniel_brief_mail', 'Mail', 'Daniel Brooks', 'Project Titan — Transformation Brief & Immediate Next Steps', { subtitle: 'High Priority · Attachment included' }),
  },

  {
    event_id: 'emma_survey_mail',
    fireAtMs: 60_000,
    channel: 'mail',
    build: () => makeMail(
      'emma_survey_mail', 'emma',
      'Employee Survey — Initial Findings (Titan)',
      `Hi,

I ran a quick survey with the Titan HR team last week. Here are the top findings:

1. 68% of employees say they don't know where to log a leave request.
2. 41% say it takes more than 2 working days to get leave approved.
3. Plant floor employees (especially night shift) can't access current HR tools — they share terminals and need very simple workflows.
4. Several supervisors mentioned that supporting document uploads for leave applications are a pain point — they currently use email attachments.

The last point is worth flagging — document upload for leave requests might need to be in scope. I'll confirm once I speak with more plant leads.

Emma Carter
HR Transformation Specialist`,
      'Top survey findings from Titan employees — document upload mentioned.',
      'High', 1, '09:24',
    ),
  },

  {
    event_id: 'notify_emma_survey_mail',
    fireAtMs: 60_000,
    channel: 'notification',
    build: () => makeNotif('notif_emma_survey', 'Mail', 'Emma Carter', 'Employee Survey — Initial Findings (Titan)', { subtitle: 'Read carefully — contains hidden requirement hints' }),
  },

  {
    event_id: 'daniel_payroll_slack',
    fireAtMs: 90_000,
    channel: 'slack',
    build: () => makeSlack(
      'daniel_payroll_slack', 'daniel', 'dm-daniel', 'Daniel Brooks',
      `One thing to keep on your radar.\n\nPayroll currently sits outside the HR platform. There are API constraints around that integration.\n\nDon't promise a full integration unless you've validated the dependency. The vendor's API docs are outdated — confirm the actual payload format before building anything.`,
      'Day 1 · 09:36',
      'req_payroll'
    ),
  },

  {
    event_id: 'notify_daniel_payroll_slack',
    fireAtMs: 90_000,
    channel: 'notification',
    build: () => makeNotif('notif_daniel_payroll_slack', 'Slack', 'Daniel Brooks', 'One thing to keep on your radar…', { subtitle: 'Direct Message' }),
  },

  {
    event_id: 'aarav_welcome_slack',
    fireAtMs: 100_000,
    channel: 'slack',
    build: () => makeSlack(
      'aarav_welcome_slack', 'aarav', 'dm-aarav', 'Aarav Kapoor',
      `Hey — welcome to Project Titan. Happy to answer questions if you get stuck, but try to work through the project on your own first.\n\nGood consultants discover requirements, they don't wait to be handed them. 💪\n\nOne tip: read everything that comes in. The details matter.`,
      'Day 1 · 09:40',
    ),
  },

  // ── Day 2 ────────────────────────────────────────────────────────────────────

  {
    event_id: 'prototype_review_calendar',
    fireAtMs: 120_000,
    channel: 'notification',
    build: () => makeNotif('notif_calendar_review', 'Calendar', 'Calendar — Prototype Review added', 'Day 7 · 10:00 · Marcus, Daniel, Emma', { subtitle: 'Day 7 · 10:00 AM' }),
  },

  {
    event_id: 'daniel_day2_checkin',
    fireAtMs: 140_000,
    channel: 'notification',
    condition: (s) => !s.stakeholderContacted.daniel,
    build: () => makeNotif('notif_daniel_day2', 'Teams', 'Daniel Brooks', 'Quick check — how are you progressing? Any blockers?', { subtitle: 'Direct Message' }),
  },

  {
    event_id: 'aarav_ide_nudge',
    fireAtMs: 150_000,
    channel: 'slack',
    condition: (s) => !s.prototypeBuilt,
    build: () => makeSlack(
      'aarav_ide_nudge', 'aarav', 'dm-aarav', 'Aarav Kapoor',
      `Have you looked at the prototype workspace yet? It would help to at least explore the project structure early — prototype review is Day 7.`,
      'Day 2 · 09:30',
    ),
  },

  // ── Day 3 ────────────────────────────────────────────────────────────────────

  {
    event_id: 'daniel_security_nudge',
    fireAtMs: 200_000,
    channel: 'notification',
    condition: (s) => !s.stakeholderContacted.daniel,
    build: () => makeNotif('notif_marcus_security', 'Teams', 'Marcus Reed', "Security shouldn't be an afterthought. Make sure you've considered access control and audit requirements.", { subtitle: 'Direct Message' }),
  },

  {
    event_id: 'board_presentation_calendar',
    fireAtMs: 210_000,
    channel: 'notification',
    build: () => makeNotif('notif_calendar_board', 'Calendar', 'Calendar — Board Presentation added', 'Day 14 · 09:00 · All stakeholders', { subtitle: 'Day 14 · 09:00 AM — Deadline' }),
  },

  // ── Day 4 ────────────────────────────────────────────────────────────────────

  {
    event_id: 'emma_document_upload_mail',
    fireAtMs: 240_000,
    channel: 'mail',
    build: () => makeMail(
      'emma_document_upload_mail', 'emma',
      'Important — Employee Document Upload (Scope Amendment)',
      `Hi,

After speaking with several plant HR leads, I need to flag that Employee Document Upload should be in scope for Phase 1.

Employees currently email certificates, ID proof, and leave documentation as attachments. If the new portal doesn't support document upload, they'll have a worse experience than the current system for these use cases.

This wasn't in the original brief, but it's a gap that came from listening to the actual users.

Let me know how you'd like to handle this — happy to join a call if needed.

Emma Carter`,
      'Employee Document Upload needs to be in scope for Phase 1 — employees currently email documents.',
      'High', 4, '09:00',
    ),
  },

  {
    event_id: 'notify_emma_doc_upload',
    fireAtMs: 240_000,
    channel: 'notification',
    build: () => makeNotif('notif_emma_doc_upload', 'Mail', 'Emma Carter', 'Important — Employee Document Upload (Scope Amendment)', { subtitle: 'High Priority — contains hidden requirement' }),
  },

  {
    event_id: 'emma_plant_hr_slack',
    fireAtMs: 270_000,
    channel: 'slack',
    build: () => makeSlack(
      'emma_plant_hr_slack', 'emma', 'ch-titan', '#project-titan',
      `One more thing from the plant HR team — a lot of employees access HR services from shared terminals. Keep the workflows very simple. If it takes more than 3 clicks to submit a leave request, they won't use it.`,
      'Day 4 · 15:00',
      'req_document_upload'
    ),
  },

  // ── Day 5 ────────────────────────────────────────────────────────────────────

  {
    event_id: 'daniel_prototype_reminder',
    fireAtMs: 330_000,
    channel: 'notification',
    condition: (s) => !s.prototypeBuilt,
    build: () => makeNotif('notif_daniel_prototype', 'Teams', 'Daniel Brooks', "Prototype review is Day 7. Are you tracking to have something ready?", { subtitle: 'Direct Message' }),
  },

  // ── Day 6 ────────────────────────────────────────────────────────────────────

  {
    event_id: 'emma_client_pressure_mail',
    fireAtMs: 360_000,
    channel: 'mail',
    build: () => makeMail(
      'emma_client_pressure_mail', 'emma',
      'Quick Check-In — Portal Progress',
      `Hi,

I've been getting questions from the Titan HR team about where we are with the portal. They're expecting something to review at the mid-point milestone.

The main thing they want to see is whether the employee experience is actually simpler — specifically the leave request flow.

Could you give me a quick sense of where things stand?

Emma Carter`,
      "Titan HR team asking for a progress update — is the leave flow simpler?",
      'Normal', 6, '09:00',
    ),
  },

  {
    event_id: 'aarav_day6_pressure',
    fireAtMs: 390_000,
    channel: 'slack',
    condition: (s) => !s.prototypeBuilt,
    build: () => makeSlack(
      'aarav_day6_pressure', 'aarav', 'dm-aarav', 'Aarav Kapoor',
      `It's Day 6. The prototype review is tomorrow. If you haven't started building, now is the time. Even a rough prototype shows you've been working through the problem.`,
      'Day 6 · 16:12',
    ),
  },

  // ── Day 7 ────────────────────────────────────────────────────────────────────

  {
    event_id: 'prototype_review_notification',
    fireAtMs: 420_000,
    channel: 'notification',
    condition: (s) => s.meetingState.kickoffDone,
    build: () => makeNotif(
      'notif-prototype-review', 'Teams',
      'Microsoft Teams • Prototype Review',
      'Prototype Review is now. Marcus, Daniel, Emma are waiting.',
      { subtitle: 'Day 7 · 10:00 AM', actionText: 'Join Review', onActionAppId: 'review', isCall: true }
    ),
  },

  {
    event_id: 'prototype_review_missed_dm',
    fireAtMs: 470_000,
    channel: 'notification',
    condition: (s) => !s.meetingState.prototypeReviewDone,
    build: () => makeNotif('notif_review_missed', 'Teams', 'Daniel Brooks', "The prototype review passed without you. This needs to be noted. Don't let this happen with the board presentation.", { subtitle: 'Direct Message' }),
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

    // Notify backend so orchestrator can fire olivia_review equivalent (now daniel_security)
    const sid = localStorage.getItem('brained_session_id');
    if (sid) {
      fetch(`${API_BASE}/api/game/ide/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid }),
      }).catch(() => {});
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
    addSignalInternal('Player submitted MOM', 'documentation', 'mom_submitted', text.length > 200 ? 15 : 5);
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

// ── Config ────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export { API_BASE };
