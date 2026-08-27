/**
 * useGameSession — React hook for WebSocket-driven game state.
 *
 * Connects to the backend WebSocket, joins the player's session room,
 * and provides:
 * - Live World State updates (mails, clock, events)
 * - Notification queue (feeds directly into OSNotificationCenter)
 * - Mail inbox (feeds directly into AppleMailApp)
 * - Slack messages
 * - Dock badge increments
 * - Clock ticks (in-game time display)
 * - Character reply notifications (Teams toast for every character reply)
 * - Share-prototype-link event (daniel_prototype_link_request)
 *
 * Usage:
 *   const { notifications, mails, slackMessages, dismissNotification, worldState } = useGameSession(sessionId);
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { OSNotification } from '../data/brainedOSData';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

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
  timestamp_real: string;
  timestamp_ingame: string;
  read: boolean;
  starred: boolean;
  priority: 'High' | 'Normal' | 'Low';
  folder: 'Inbox' | 'Sent';
  attachment?: { name: string; size: string; type: string; content?: string };
  event_id: string;
}

export interface SlackMessage {
  id: string;
  character_id: string;
  from: string;
  channel: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface GameCalendarEvent {
  title: string;
  day: string;
  time: string;
  organizer: string;
  description: string;
}

export interface DockBadges {
  inbox: number;
  slack: number;
  teams: number;
  calendar: number;
}

export interface InGameClock {
  ingame_day: number;
  ingame_time: string;
  real_elapsed_ms: number;
  paused: boolean;
}

/** Fired when Daniel requests the prototype link on Day 10 */
export interface PrototypeLinkRequest {
  fired: boolean;
  character_id: string;
  message: string;
}

// ── Character name/app map ─────────────────────────────────────────────────────
const CHARACTER_DISPLAY: Record<string, { name: string; app: string }> = {
  marcus: { name: 'Marcus Reed', app: 'Teams' },
  daniel: { name: 'Daniel Brooks', app: 'Teams' },
  emma: { name: 'Emma Carter', app: 'Teams' },
  olivia: { name: 'Olivia Hayes', app: 'Teams' },
  sophia: { name: 'Sophia Bennett', app: 'Teams' },
  aarav: { name: 'Aarav Kapoor', app: 'Teams' },
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGameSession(sessionId: string | null) {
  const socketRef = useRef<Socket | null>(null);

  const [notifications, setNotifications] = useState<OSNotification[]>([]);
  const [mails, setMails] = useState<GameMail[]>([]);
  const [slackMessages, setSlackMessages] = useState<SlackMessage[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<GameCalendarEvent[]>([]);
  const [dockBadges, setDockBadges] = useState<DockBadges>({ inbox: 0, slack: 0, teams: 0, calendar: 0 });
  const [clock, setClock] = useState<InGameClock | null>(null);
  const [connected, setConnected] = useState(false);
  const [prototypeLinkRequest, setPrototypeLinkRequest] = useState<PrototypeLinkRequest | null>(null);

  // Notification auto-dismiss after 10 seconds
  const dismissTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const addNotification = useCallback((notif: OSNotification) => {
    setNotifications((prev) => {
      // Deduplicate by id
      if (prev.some((n) => n.id === notif.id)) return prev;
      return [...prev, notif];
    });

    // Auto-dismiss: 10s for normal, keep calls until accepted/declined
    if (!notif.isCall) {
      const timer = setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
        dismissTimersRef.current.delete(notif.id);
      }, 10000);
      dismissTimersRef.current.set(notif.id, timer);
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const timer = dismissTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      dismissTimersRef.current.delete(id);
    }
  }, []);

  const markMailRead = useCallback((mailId: string) => {
    setMails((prev) => prev.map((m) => m.id === mailId ? { ...m, read: true } : m));
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_session', { session_id: sessionId });
      console.log('[WS] Connected, joined session', sessionId);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Full World State sync on connect / reconnect
    socket.on('world_state_full', (state: any) => {
      if (state.mails) setMails(state.mails);
      if (state.slack_messages) setSlackMessages(state.slack_messages);
      if (state.dynamic_calendar_events) setCalendarEvents(state.dynamic_calendar_events);
      if (state.clock) setClock(state.clock);
    });

    // Incremental World State patch
    socket.on('world_state_update', (data: { session_id: string; patch: any }) => {
      const { patch } = data;

      // ── Clock tick ──────────────────────────────────────────────────────────
      if (patch.clock) {
        setClock(patch.clock);
      }

      // ── New Mail ────────────────────────────────────────────────────────────
      if (patch.type === 'new_mail' && patch.mail) {
        setMails((prev) => {
          if (prev.some((m) => m.id === patch.mail.id)) return prev;
          return [...prev, patch.mail];
        });
        if (patch.notification) {
          addNotification({
            id: `notif-mail-${patch.mail.id}`,
            app: 'Mail',
            ...patch.notification,
            timestamp: 'Just now',
          });
        }
        // Increment inbox dock badge
        setDockBadges((prev) => ({ ...prev, inbox: prev.inbox + 1 }));
      }

      // ── Slack Message ───────────────────────────────────────────────────────
      if (patch.type === 'slack_message') {
        setSlackMessages((prev) => [
          ...prev,
          {
            id: `slack-${Date.now()}`,
            character_id: patch.character_id,
            from: patch.from,
            channel: patch.channel,
            message: patch.message,
            timestamp: new Date().toISOString(),
            read: false,
          },
        ]);
        if (patch.notification) {
          addNotification({
            id: `notif-slack-${patch.character_id}-${Date.now()}`,
            app: 'Slack',
            ...patch.notification,
            timestamp: 'Just now',
          });
        }
        setDockBadges((prev) => ({ ...prev, slack: prev.slack + 1 }));
      }

      // ── Character Reply (from generateCharacterReply delivery) ──────────────
      // Fired by deliverPendingReply → publishStateChanged({ type: 'character_message' })
      if (patch.type === 'character_message' && patch.character_id) {
        const charInfo = CHARACTER_DISPLAY[patch.character_id] ?? { name: patch.character_id, app: 'Teams' };
        // Truncate to a notification-friendly preview
        const preview = patch.message?.length > 80
          ? `${patch.message.slice(0, 80)}…`
          : patch.message;
        addNotification({
          id: `notif-char-${patch.character_id}-${Date.now()}`,
          app: 'Teams',
          title: `Microsoft Teams • ${charInfo.name}`,
          subtitle: charInfo.name,
          body: preview,
          actionText: 'Reply',
          onActionAppId: 'teams',
          timestamp: 'Just now',
        });
        setDockBadges((prev) => ({ ...prev, teams: prev.teams + 1 }));
      }

      // ── Proactive/Orchestrator message (Teams channel or mail) ──────────────
      if (patch.type === 'proactive_message' && patch.character_id) {
        const charInfo = CHARACTER_DISPLAY[patch.character_id] ?? { name: patch.character_id, app: 'Teams' };
        const preview = patch.message?.length > 80
          ? `${patch.message.slice(0, 80)}…`
          : patch.message;
        addNotification({
          id: `notif-proactive-${patch.character_id}-${Date.now()}`,
          app: patch.channel === 'mail' ? 'Mail' : 'Teams',
          title: patch.channel === 'mail'
            ? `Mail • ${charInfo.name}`
            : `Microsoft Teams • ${charInfo.name}`,
          subtitle: charInfo.name,
          body: preview,
          actionText: patch.channel === 'mail' ? 'Open Mail' : 'Reply',
          onActionAppId: patch.channel === 'mail' ? 'inbox' : 'teams',
          timestamp: 'Just now',
        });
        setDockBadges((prev) =>
          patch.channel === 'mail'
            ? { ...prev, inbox: prev.inbox + 1 }
            : { ...prev, teams: prev.teams + 1 }
        );
      }

      // ── Teams direct notification (legacy, from timeline pushTeamsNotification) ──
      if (patch.type === 'teams_message') {
        if (patch.notification) {
          addNotification({
            id: `notif-teams-${patch.character_id}-${Date.now()}`,
            app: 'Teams',
            ...patch.notification,
            timestamp: 'Just now',
          });
        }
        setDockBadges((prev) => ({ ...prev, teams: prev.teams + 1 }));
      }

      // ── Calendar Event ──────────────────────────────────────────────────────
      if (patch.type === 'calendar_event_added') {
        setCalendarEvents((prev) => [...prev, patch.calendar_event]);
        if (patch.notification) {
          addNotification({
            id: `notif-cal-${Date.now()}`,
            app: 'Calendar',
            ...patch.notification,
            timestamp: 'Just now',
          });
        }
      }

      // ── System Notification ─────────────────────────────────────────────────
      if (patch.type === 'system_notification' && patch.notification) {
        const isCall = patch.notification.isCall;
        addNotification({
          id: `notif-sys-${Date.now()}`,
          app: patch.notification.app || 'Teams',
          ...patch.notification,
          timestamp: 'Just now',
          isCall: isCall ?? false,
        });
      }

      // ── Prototype Link Request (Daniel Day 10) ──────────────────────────────
      if (patch.type === 'prototype_link_request') {
        setPrototypeLinkRequest({
          fired: true,
          character_id: patch.character_id ?? 'daniel',
          message: patch.message ?? 'Daniel has requested the prototype link.',
        });
        addNotification({
          id: `notif-proto-link-${Date.now()}`,
          app: 'Teams',
          title: 'Microsoft Teams • Daniel Brooks',
          subtitle: 'Daniel Brooks',
          body: 'Requesting prototype link for security review — action required.',
          actionText: 'Share Link',
          onActionAppId: 'teams',
          timestamp: 'Just now',
        });
        setDockBadges((prev) => ({ ...prev, teams: prev.teams + 1 }));
      }

      // ── Dock Badge ──────────────────────────────────────────────────────────
      if (patch.type === 'dock_badge') {
        setDockBadges((prev) => ({
          ...prev,
          [patch.app]: (prev[patch.app as keyof DockBadges] ?? 0) + patch.increment,
        }));
      }
    });

    return () => {
      socket.emit('leave_session', { session_id: sessionId });
      socket.disconnect();
      socketRef.current = null;
      dismissTimersRef.current.forEach((t) => clearTimeout(t));
      dismissTimersRef.current.clear();
    };
  }, [sessionId, addNotification]);

  const unreadMailCount = mails.filter((m) => !m.read && m.folder === 'Inbox').length;
  const unreadSlackCount = slackMessages.filter((m) => !m.read).length;

  return {
    connected,
    notifications,
    mails,
    slackMessages,
    calendarEvents,
    dockBadges: {
      ...dockBadges,
      inbox: dockBadges.inbox + unreadMailCount,
      slack: dockBadges.slack + unreadSlackCount,
    },
    clock,
    prototypeLinkRequest,
    dismissNotification,
    markMailRead,
  };
}
