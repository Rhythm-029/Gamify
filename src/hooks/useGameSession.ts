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

  // Notification auto-dismiss after 8 seconds
  const dismissTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const addNotification = useCallback((notif: OSNotification) => {
    setNotifications((prev) => {
      // Deduplicate
      if (prev.some((n) => n.id === notif.id)) return prev;
      return [...prev, notif];
    });

    // Auto-dismiss after 8s (keep call notifications longer)
    if (!notif.isCall) {
      const timer = setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
        dismissTimersRef.current.delete(notif.id);
      }, 8000);
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

      // Clock tick update
      if (patch.clock) {
        setClock(patch.clock);
      }

      // New mail delivered
      if (patch.type === 'new_mail' && patch.mail) {
        setMails((prev) => {
          if (prev.some((m) => m.id === patch.mail.id)) return prev;
          return [...prev, patch.mail];
        });
        // Push notification
        if (patch.notification) {
          addNotification({
            id: `notif-mail-${patch.mail.id}`,
            app: 'Mail',
            ...patch.notification,
            timestamp: 'Just now',
          });
        }
      }

      // Slack message
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
            id: `notif-slack-${Date.now()}`,
            app: 'Slack',
            ...patch.notification,
            timestamp: 'Just now',
          });
        }
      }

      // Teams notification (character reply or proactive)
      if (patch.type === 'teams_message' || patch.type === 'proactive_message') {
        if (patch.notification) {
          addNotification({
            id: `notif-teams-${Date.now()}`,
            app: 'Teams',
            ...patch.notification,
            timestamp: 'Just now',
          });
        }
      }

      // Calendar event
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

      // System notification (generic)
      if (patch.type === 'system_notification' && patch.notification) {
        addNotification({
          id: `notif-sys-${Date.now()}`,
          app: patch.notification.app || 'Mail',
          ...patch.notification,
          timestamp: 'Just now',
        });
      }

      // Final presentation call (isCall)
      if (patch.type === 'system_notification' && patch.notification?.isCall) {
        addNotification({
          id: `notif-call-${Date.now()}`,
          app: 'Teams',
          ...patch.notification,
          timestamp: 'Just now',
          isCall: true,
        });
      }

      // Dock badge update
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
      // Clear all dismiss timers
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
    dismissNotification,
    markMailRead,
  };
}
