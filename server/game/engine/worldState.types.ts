/**
 * World State TypeScript types — shared across all services.
 * This is the single source of truth schema for §2.2 of the spec.
 */

export type ProjectStatus =
  | 'not_started'
  | 'in_discovery'
  | 'in_development'
  | 'prototype_ready'
  | 'presented'
  | 'closed';

export type EventType =
  | 'mail_received'
  | 'mail_sent'
  | 'teams_message_received'
  | 'teams_message_sent'
  | 'ide_run'
  | 'mom_submitted'
  | 'meeting_joined'
  | 'meeting_ended'
  | 'pressure_event_fired'
  | 'session_paused'
  | 'session_resumed'
  | 'requirement_discovered'
  | 'contradiction_flagged'
  | 'presentation_started'
  | 'presentation_ended'
  | 'signal_logged';

export interface Contradiction {
  req_id: string;
  sources: Array<{
    character: string;
    statement: string;
    timestamp: Date;
  }>;
}

export interface Risk {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  raised_by: string;
  status: 'open' | 'mitigated' | 'accepted' | 'closed';
  raised_at: Date;
}

export interface OutstandingAction {
  description: string;
  owed_to: string;
  due_ingame: string;
  status: 'open' | 'done' | 'overdue';
}

export interface WorldStateEvent {
  event_id: string;
  type: EventType;
  actor: string;
  target: string;
  payload: Record<string, unknown>;
  ingame_ts: string;
  real_ts: Date;
}

export interface InGameClock {
  ingame_day: number;
  ingame_time: string; // "HH:MM"
  real_elapsed_ms: number;
  paused: boolean;
  paused_at_real_ms?: number; // set when paused
}

export interface ScoreableSignal {
  dimension: string;
  signal_type: string;
  value: number; // positive or negative contribution
  description: string;
  logged_at: Date;
}

export interface WorldState {
  session_id: string;
  scenario_id: string;
  player_id: string;

  requirements: {
    discovered: string[];
    hidden: string[];
    contradicted: Contradiction[];
  };

  timeline: {
    board_deadline_ingame: string;
    milestones_hit: string[];
    milestones_missed: string[];
  };

  risks: Risk[];

  stakeholder_trust: Record<string, number>; // character_id → 0-100

  project_status: ProjectStatus;

  pending_approvals: string[];

  outstanding_actions: OutstandingAction[];

  event_log: WorldStateEvent[];

  clock: InGameClock;

  scoreable_signals: ScoreableSignal[];

  // Character conversation threads (character_id → message array)
  conversation_threads: Record<
    string,
    Array<{
      role: 'player' | 'character';
      content: string;
      timestamp: Date;
    }>
  >;

  // Tracks which orchestrator rules have already fired
  fired_events: string[];

  // MOM data
  mom: {
    raw_text: string;
    submitted_at: Date | null;
    extracted: {
      covered_requirements: string[];
      missing_requirements: string[];
      action_items: string[];
      timeline_notes: string[];
      stakeholders_mentioned: string[];
    } | null;
  };

  // Presentation
  presentation: {
    started_at: Date | null;
    ended_at: Date | null;
    recording_url: string | null;
    transcript: string | null;
    follow_up_questions: Array<{
      character_id: string;
      question: string;
      answer_transcript: string | null;
    }>;
    whisper_confidence: number | null;
  };

  // Final evaluation (score never shown during play)
  evaluation: {
    dimensions: Array<{
      name: string;
      weight: number;
      score: number;
      notes: string;
    }>;
    total_score: number;
    strengths: string[];
    weaknesses: string[];
    completed_at: Date | null;
  } | null;

  created_at: Date;
  updated_at: Date;

  /** Dynamic mails delivered from the timeline scheduler */
  mails: Array<{
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
    timestamp_ingame: string;
    read: boolean;
    starred: boolean;
    priority: 'High' | 'Normal' | 'Low';
    folder: 'Inbox' | 'Sent';
    attachment?: { name: string; size: string; type: string; content?: string };
    event_id: string;
  }>;

  /** Dynamic Slack messages delivered from timeline */
  slack_messages: Array<{
    id: string;
    character_id: string;
    from: string;
    channel: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;

  /** Dynamic calendar events added during game */
  dynamic_calendar_events: Array<{
    title: string;
    day: string;
    time: string;
    organizer: string;
    description: string;
    added_at: Date;
  }>;
}
