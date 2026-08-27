/**
 * Game Timeline Scheduler
 * The heart of the game's event system.
 *
 * All timed events (mails, notifications, Slack messages, calendar entries)
 * are defined here with their real-time offsets. The clock worker fires them.
 *
 * Every entry maps directly to GAME_TIMELINE.md.
 * No hardcoded mails at session start — everything fires from here.
 */

import { scheduleGameEvent } from '../clock/clock.service';
import { readWorldState, mutateWorldState, markEventFired } from '../engine/worldState.engine';
import { getScenarioConfig } from '../config/scenarios/scenario.registry';
import {
  deliverMail,
  buildDanielBriefMail,
  buildEmmaSurveyMail,
  buildEmmaAmendmentMail,
  buildSophiaPrototypeMail,
  buildOliviaReviewMail,
  buildSophiaFollowUpMail,
  type GameMail,
} from '../mail/mail.service';
import { publishStateChanged } from '../engine/worldState.redis';

// ── Timeline event definitions ────────────────────────────────────────────────

interface TimelineEntry {
  event_id: string;
  /** Real-time offset in ms from session start when this should fire */
  offset_ms: number;
  /** If true, fires regardless of World State (unless already fired) */
  always: boolean;
  /** If false, will be re-evaluated each tick by orchestrator (not pre-scheduled) */
  pre_schedule: boolean;
}

/**
 * All timed events per GAME_TIMELINE.md.
 * Conditional events (manager_checkin, cto_security_nudge, olivia_review)
 * are evaluated by the orchestrator, NOT pre-scheduled.
 */
export const TIMELINE: TimelineEntry[] = [
  // Day 1 — 0:45 real: Daniel sends brief + attachment
  { event_id: 'daniel_brief_mail', offset_ms: 45_000, always: true, pre_schedule: true },
  // Day 1 — 1:00 real: Emma sends survey findings
  { event_id: 'emma_survey_mail', offset_ms: 60_000, always: true, pre_schedule: true },
  // Day 2 — 2:00 real: Calendar: Prototype Review added
  { event_id: 'calendar_prototype_event', offset_ms: 120_000, always: true, pre_schedule: true },
  // Day 3 — 3:00 real: Daniel Slack payroll hint
  { event_id: 'daniel_slack_payroll_hint', offset_ms: 180_000, always: true, pre_schedule: true },
  // Day 3 — Daniel check-in (CONDITIONAL — orchestrator handles if player hasn't messaged him)
  { event_id: 'manager_checkin', offset_ms: 150_000, always: false, pre_schedule: false },
  // Day 4 — CTO security nudge (CONDITIONAL — orchestrator handles)
  { event_id: 'cto_security_nudge', offset_ms: 240_000, always: false, pre_schedule: false },
  // Day 5 — 4:30 real: Calendar: Board Presentation added
  { event_id: 'calendar_board_event', offset_ms: 270_000, always: true, pre_schedule: true },
  // Day 6 — 6:00 real: Emma Slack plant hint
  { event_id: 'emma_slack_plant_hint', offset_ms: 360_000, always: true, pre_schedule: true },
  // Day 7 — 7:30 real: Sophia prototype ask mail
  { event_id: 'client_prototype_ask', offset_ms: 450_000, always: true, pre_schedule: true },
  // Day 7 — 9:00 real: Prototype Review checkpoint notification
  { event_id: 'prototype_review_notif', offset_ms: 540_000, always: true, pre_schedule: true },
  // Day 8 — 8:00 real: Emma Document Upload amendment (AFTER prototype review, more realistic)
  { event_id: 'hr_amendment', offset_ms: 480_000, always: true, pre_schedule: true },
  // Day 9 — Marcus Slack group @mention architecture chase
  { event_id: 'marcus_slack_group_tag', offset_ms: 540_000, always: true, pre_schedule: true },
  // Day 10 — Daniel requests prototype link for security review
  { event_id: 'daniel_prototype_link_request', offset_ms: 600_000, always: true, pre_schedule: true },
  // Day 11 — Sophia follow-up (CONDITIONAL — only if prototype not ready)
  { event_id: 'sophia_follow_up', offset_ms: 660_000, always: false, pre_schedule: false },
  // Day 11 — Aarav check-in asking for update
  { event_id: 'aarav_checkin_teams', offset_ms: 660_000, always: true, pre_schedule: true },
  // Day 12 — Olivia RBAC reminder (CONDITIONAL — only if req_rbac not discovered)
  { event_id: 'olivia_rbac_reminder', offset_ms: 720_000, always: false, pre_schedule: false },
  // Day 13 — Calendar: Final Presentation added
  { event_id: 'final_presentation_calendar', offset_ms: 780_000, always: true, pre_schedule: true },
  // Day 13 — Teams call: Final Presentation
  { event_id: 'final_presentation_call', offset_ms: 810_000, always: true, pre_schedule: true },
  // Day 14 — Board deadline (auto-starts presentation)
  { event_id: 'board_deadline', offset_ms: 840_000, always: true, pre_schedule: true },
  // Hard session end
  { event_id: 'session_end', offset_ms: 900_000, always: true, pre_schedule: true },
];

// ── Pre-schedule all "always" events at session start ─────────────────────────

export async function initTimeline(sessionId: string): Promise<void> {
  const preScheduled = TIMELINE.filter((e) => e.pre_schedule && e.always);
  for (const entry of preScheduled) {
    await scheduleGameEvent(sessionId, entry.event_id, entry.offset_ms);
  }
  console.log(`[TIMELINE] Pre-scheduled ${preScheduled.length} events for session ${sessionId}`);
}

// ── Event handler — called by clock worker when a timer fires ─────────────────

export async function handleTimelineEvent(sessionId: string, eventId: string): Promise<void> {
  const state = await readWorldState(sessionId);
  if (!state) return;
  if (state.fired_events.includes(eventId)) return; // Already fired

  const ingameTime = `Day ${state.clock.ingame_day} — ${state.clock.ingame_time}`;
  await markEventFired(sessionId, eventId);

  console.log(`[TIMELINE] Firing event "${eventId}" for session ${sessionId} at ${ingameTime}`);

  switch (eventId) {
    // ── Mails ──────────────────────────────────────────────────────────────

    case 'daniel_brief_mail':
      await deliverMail(sessionId, buildDanielBriefMail(ingameTime));
      // Increment dock badge for Mail
      await pushDockBadge(sessionId, 'inbox', 1);
      break;

    case 'emma_survey_mail':
      await deliverMail(sessionId, buildEmmaSurveyMail(ingameTime));
      await pushDockBadge(sessionId, 'inbox', 1);
      break;

    case 'hr_amendment':
      await deliverMail(sessionId, buildEmmaAmendmentMail(ingameTime));
      await pushDockBadge(sessionId, 'inbox', 1);
      break;

    case 'client_prototype_ask':
      await deliverMail(sessionId, buildSophiaPrototypeMail(ingameTime));
      await pushDockBadge(sessionId, 'inbox', 1);
      break;

    case 'olivia_review': {
      // This fires when Olivia's review is triggered (IDE first run)
      // Extra check: only fire if IDE has been run
      if (!state.fired_events.includes('ide_first_run')) {
        await markEventFired(sessionId, eventId); // unmark, try again later
        return;
      }
      await deliverMail(sessionId, buildOliviaReviewMail(ingameTime));
      await pushDockBadge(sessionId, 'inbox', 1);
      break;
    }

    case 'sophia_follow_up':
      // Only if prototype not ready
      if (state.project_status !== 'prototype_ready' && state.project_status !== 'presented') {
        await deliverMail(sessionId, buildSophiaFollowUpMail(ingameTime));
        await pushDockBadge(sessionId, 'inbox', 1);
      }
      break;

    // ── Slack notifications ────────────────────────────────────────────────

    case 'daniel_slack_payroll_hint':
      await pushSlackNotification(sessionId, {
        from: 'Daniel Brooks',
        channel: '#project-titan',
        character_id: 'daniel',
        message: "Don't forget the payroll constraint in the brief — vendor API docs are outdated. Chase that early, it'll affect your integration timeline.",
      });
      await pushDockBadge(sessionId, 'slack', 1);
      break;

    case 'emma_slack_plant_hint':
      await pushSlackNotification(sessionId, {
        from: 'Emma Carter',
        channel: '#project-titan',
        character_id: 'emma',
        message: "Heads up — the plant HR leads in Malaysia and Brazil are the most vocal about leave and attendance tracking. Worth understanding their specific workflow before finalizing the scope.",
      });
      await pushDockBadge(sessionId, 'slack', 1);
      break;

    case 'marcus_slack_group_tag':
      // Marcus @mentions the player in the group channel asking about architecture/security
      await pushSlackNotification(sessionId, {
        from: 'Marcus Reed',
        channel: '#project-titan',
        character_id: 'marcus',
        message: `@Consultant — where are we on the architecture doc and security sign-off? Board wants a real technical summary, not just a slide. Tag me when it's ready.`,
      });
      // Daniel follows up in the group immediately after Marcus
      setTimeout(async () => {
        await pushSlackNotification(sessionId, {
          from: 'Daniel Brooks',
          channel: '#project-titan',
          character_id: 'daniel',
          message: `+1 from me — @Consultant is the prototype ready for security check? I'll set up the review once you confirm.`,
        });
      }, 8000);
      await pushDockBadge(sessionId, 'slack', 1);
      break;

    case 'daniel_prototype_link_request':
      // Daniel messages directly (Teams) asking for the prototype link
      await pushTeamsNotification(sessionId, {
        from: 'Daniel Brooks',
        character_id: 'daniel',
        message: `Need the prototype link today — I want to run it past the security checklist before the board presentation. Once you share it I'll loop Olivia in for the final sign-off.`,
        isUrgent: true,
        eventType: 'prototype_link_request',
      });
      // Also emit the special prototype_link_request event for the share-link button
      await publishStateChanged(sessionId, {
        type: 'prototype_link_request',
        character_id: 'daniel',
        message: 'Daniel is asking for the prototype link for his security review.',
      });
      await pushDockBadge(sessionId, 'teams', 1);
      break;

    case 'aarav_checkin_teams':
      // Aarav checks in via Teams asking for an update
      await pushTeamsNotification(sessionId, {
        from: 'Aarav Kapoor',
        character_id: 'aarav',
        message: `How's it going? I've been watching the timeline — Day 11 is here. Have you managed to get the security review sorted with Daniel? And how did you handle Emma's doc upload request?`,
        isUrgent: false,
        eventType: 'aarav_checkin',
      });
      await pushDockBadge(sessionId, 'teams', 1);
      break;

    case 'olivia_rbac_reminder':
      // Only if RBAC not yet discovered
      if (!state.requirements.discovered.includes('req_rbac')) {
        await pushSlackNotification(sessionId, {
          from: 'Olivia Hayes',
          channel: '#project-titan',
          character_id: 'olivia',
          message: "Just a reminder: I still need the RBAC model sign-off before board sign-off. Can we get 15 minutes to walk through the access control design?",
        });
        await pushDockBadge(sessionId, 'slack', 1);
      }
      break;

    case 'manager_checkin':
      // Only if player has not contacted Daniel
      if (!state.conversation_threads['daniel']?.some((m) => m.role === 'player')) {
        await pushTeamsNotification(sessionId, {
          from: 'Daniel Brooks',
          character_id: 'daniel',
          message: "Hey — progress update? Board's asking me for a status line.",
          isUrgent: false,
        });
        await pushDockBadge(sessionId, 'teams', 1);
      }
      break;

    case 'cto_security_nudge':
      // Only if Olivia not contacted yet
      if (!state.conversation_threads['olivia']?.some((m) => m.role === 'player')) {
        await pushTeamsNotification(sessionId, {
          from: 'Marcus Reed',
          character_id: 'marcus',
          message: "Quick one — has Security actually reviewed the architecture yet? I don't want this flagged the week before the board demo.",
          isUrgent: true,
        });
        await pushDockBadge(sessionId, 'teams', 1);
      }
      break;

    // ── Calendar events ────────────────────────────────────────────────────

    case 'calendar_prototype_event':
      await pushCalendarEvent(sessionId, {
        title: 'Prototype Review Checkpoint',
        day: 'Day 7',
        time: '10:00',
        organizer: 'daniel',
        description: 'Internal prototype review — show working UI to stakeholders before board presentation.',
      });
      break;

    case 'calendar_board_event':
      await pushCalendarEvent(sessionId, {
        title: 'Board Presentation — Project Titan',
        day: 'Day 14',
        time: '09:00',
        organizer: 'marcus',
        description: 'Final board presentation. Full prototype demo required. All stakeholders attending.',
      });
      break;

    case 'prototype_review_notif':
      await publishStateChanged(sessionId, {
        type: 'system_notification',
        notification: {
          app: 'Calendar',
          title: 'Calendar • Internal Milestone',
          subtitle: 'Prototype Review Today',
          body: 'Internal prototype review checkpoint — Day 7. Is your prototype ready to show?',
          actionText: 'Open Calendar',
          onActionAppId: 'calendar',
        },
      });
      break;

    case 'final_presentation_calendar':
      await pushCalendarEvent(sessionId, {
        title: '🔴 Board Presentation — Final (Tomorrow)',
        day: 'Day 14',
        time: '09:00',
        organizer: 'marcus',
        description: 'FINAL board presentation. All stakeholders. Prototype demo required.',
      });
      await publishStateChanged(sessionId, {
        type: 'system_notification',
        notification: {
          app: 'Calendar',
          title: 'Calendar • Reminder',
          subtitle: 'Board Presentation in 1 minute',
          body: 'Final Project Titan board presentation begins in 60 seconds. Prepare your prototype.',
          actionText: 'Open Calendar',
          onActionAppId: 'calendar',
        },
      });
      break;

    case 'final_presentation_call':
      // Final Teams call notification
      await publishStateChanged(sessionId, {
        type: 'system_notification',
        notification: {
          app: 'Teams',
          title: 'Microsoft Teams • Incoming Video Call',
          subtitle: 'Marcus Reed (CTO)',
          body: 'Project Titan — Final Board Presentation. All stakeholders are joining.',
          actionText: 'Accept Call',
          onActionAppId: 'teams',
          isCall: true,
          event_id: 'final_presentation_call',
        },
      });
      await pushDockBadge(sessionId, 'teams', 1);
      break;

    case 'board_deadline':
      await publishStateChanged(sessionId, {
        type: 'board_deadline',
        message: 'Board deadline reached. Final presentation beginning.',
      });
      break;

    case 'session_end':
      await publishStateChanged(sessionId, {
        type: 'session_end',
        message: 'Session time limit reached. Evaluation starting.',
      });
      break;

    default:
      console.log(`[TIMELINE] Unhandled event: ${eventId}`);
  }
}

// ── Push helpers ──────────────────────────────────────────────────────────────

async function pushDockBadge(sessionId: string, app: string, increment: number): Promise<void> {
  await publishStateChanged(sessionId, {
    type: 'dock_badge',
    app,
    increment,
  });
}

async function pushSlackNotification(
  sessionId: string,
  opts: { from: string; channel: string; character_id: string; message: string }
): Promise<void> {
  // Add to World State conversation thread as a Slack message
  const state = await readWorldState(sessionId);
  if (!state) return;

  await mutateWorldState(sessionId, (s) => ({
    conversation_threads: {
      ...s.conversation_threads,
      [opts.character_id]: [
        ...(s.conversation_threads[opts.character_id] ?? []),
        { role: 'character', content: `[Slack] ${opts.message}`, timestamp: new Date() },
      ],
    },
  }));

  await publishStateChanged(sessionId, {
    type: 'slack_message',
    character_id: opts.character_id,
    from: opts.from,
    channel: opts.channel,
    message: opts.message,
    notification: {
      app: 'Slack',
      title: `Slack • ${opts.channel}`,
      subtitle: opts.from,
      body: opts.message,
      actionText: 'Reply on Slack',
      onActionAppId: 'slack',
    },
  });
}

async function pushTeamsNotification(
  sessionId: string,
  opts: { from: string; character_id: string; message: string; isUrgent: boolean; eventType?: string }
): Promise<void> {
  const state = await readWorldState(sessionId);
  if (!state) return;

  await mutateWorldState(sessionId, (s) => ({
    conversation_threads: {
      ...s.conversation_threads,
      [opts.character_id]: [
        ...(s.conversation_threads[opts.character_id] ?? []),
        { role: 'character', content: opts.message, timestamp: new Date() },
      ],
    },
  }));

  await publishStateChanged(sessionId, {
    type: 'teams_message',
    character_id: opts.character_id,
    from: opts.from,
    message: opts.message,
    event_type: opts.eventType,
    notification: {
      app: 'Teams',
      title: `Microsoft Teams • ${opts.from}`,
      subtitle: opts.from,
      body: opts.message.length > 80 ? `${opts.message.slice(0, 80)}…` : opts.message,
      actionText: 'Reply',
      onActionAppId: 'teams',
      isUrgent: opts.isUrgent,
    },
  });
}

async function pushCalendarEvent(
  sessionId: string,
  event: { title: string; day: string; time: string; organizer: string; description: string }
): Promise<void> {
  await publishStateChanged(sessionId, {
    type: 'calendar_event_added',
    calendar_event: event,
    notification: {
      app: 'Calendar',
      title: `Calendar • New Event Added`,
      subtitle: event.title,
      body: `${event.day} at ${event.time} — ${event.description.slice(0, 60)}...`,
      actionText: 'View Calendar',
      onActionAppId: 'calendar',
    },
  });
}
