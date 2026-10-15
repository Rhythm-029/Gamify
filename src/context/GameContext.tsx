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
  // Persisted player DM threads — survives Slack app close/reopen
  slackPlayerThreads: Record<string, Array<{
    id: string;
    role: 'player' | 'char';
    senderId: string;
    senderName: string;
    senderAvatar: string;
    content: string;
    timestamp: string;
  }>>;
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
  phase: 'open_play',
  clock: INITIAL_CLOCK,
  discoveredRequirements: new Set<RequirementId>([
    'req_login', 'req_dashboard', 'req_directory',
    'req_leave', 'req_attendance', 'req_approval_workflow',
    'req_hr_dashboard', 'req_rbac',
  ]),
  prototypeFeatures: CORE_FEATURES,
  meetingState: {
    kickoffDone: true, kickoffCameraOn: false, kickoffMicOn: true,
    momSubmitted: true, momText: '',
    prototypeReviewDone: true, presentationDone: false, presentationCameraOn: false,
  },
  stakeholderContacted: { marcus: false, daniel: false, emma: false, aarav: false },
  prototypeBuilt: false,
  signals: [],
  paused: false,
  deliveredMails: [],
  deliveredSlackMessages: [],
  pendingNotifications: [],
  slackPlayerThreads: {},
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
  addPlayerSlackMsg: (channelId: string, msg: GameState['slackPlayerThreads'][string][number]) => void;
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

export { makeMail, makeSlack, makeNotif, TITAN_EVENTS, CHAR_META, msToInGameClock };

// ── THE EVENT TABLE ───────────────────────────────────────────────────────────

const TITAN_EVENTS: FrontendEvent[] = [];

// ── Provider ──────────────────────────────────────────────────────────────────

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(INITIAL_GAME_STATE);

  // ── Clock ──────────────────────────────────────────────────────────────────

  const startClock = useCallback(() => {}, []);
  const stopClock = useCallback(() => {}, []);

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

  const addPlayerSlackMsg = useCallback(
    (channelId: string, msg: GameState['slackPlayerThreads'][string][number]) => {
      setState((prev) => {
        const existing = prev.slackPlayerThreads[channelId] ?? [];
        // Deduplicate by id
        if (existing.some((m) => m.id === msg.id)) return prev;
        return {
          ...prev,
          slackPlayerThreads: {
            ...prev.slackPlayerThreads,
            [channelId]: [...existing, msg],
          },
        };
      });
    },
    []
  );

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
    dismissNotification, markMailRead, markSlackRead, addPlayerSlackMsg,
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
