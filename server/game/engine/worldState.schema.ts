import mongoose, { Schema, Document, Model } from 'mongoose';
import type { WorldState } from './worldState.types';

export type WorldStateDocument = WorldState & Document;

// ── Sub-schemas ─────────────────────────────────────────────────────────────

const ContradictionSchema = new Schema({
  req_id: String,
  sources: [{ character: String, statement: String, timestamp: Date }],
}, { _id: false });

const RiskSchema = new Schema({
  id: String,
  description: String,
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  raised_by: String,
  status: { type: String, enum: ['open', 'mitigated', 'accepted', 'closed'], default: 'open' },
  raised_at: { type: Date, default: Date.now },
}, { _id: false });

const OutstandingActionSchema = new Schema({
  description: String,
  owed_to: String,
  due_ingame: String,
  status: { type: String, enum: ['open', 'done', 'overdue'], default: 'open' },
}, { _id: false });

const WorldStateEventSchema = new Schema({
  event_id: String,
  type: String,
  actor: String,
  target: String,
  payload: { type: Schema.Types.Mixed, default: {} },
  ingame_ts: String,
  real_ts: { type: Date, default: Date.now },
}, { _id: false });

const InGameClockSchema = new Schema({
  ingame_day: { type: Number, default: 1 },
  ingame_time: { type: String, default: '09:00' },
  real_elapsed_ms: { type: Number, default: 0 },
  paused: { type: Boolean, default: false },
  paused_at_real_ms: Number,
}, { _id: false });

const ScoreableSignalSchema = new Schema({
  dimension: String,
  signal_type: String,
  value: Number,
  description: String,
  logged_at: { type: Date, default: Date.now },
}, { _id: false });

const ConversationMessageSchema = new Schema({
  role: { type: String, enum: ['player', 'character'] },
  content: String,
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const FollowUpQuestionSchema = new Schema({
  character_id: String,
  question: String,
  answer_transcript: { type: String, default: null },
}, { _id: false });

const EvaluationDimensionSchema = new Schema({
  name: String,
  weight: Number,
  score: Number,
  notes: String,
}, { _id: false });

// ── Main World State Schema ──────────────────────────────────────────────────

const WorldStateSchema = new Schema<WorldStateDocument>(
  {
    session_id: { type: String, required: true, unique: true, index: true },
    scenario_id: { type: String, required: true },
    player_id: { type: String, required: true, index: true },

    requirements: {
      discovered: { type: [String], default: [] },
      hidden: { type: [String], default: [] },
      contradicted: { type: [ContradictionSchema], default: [] },
    },

    timeline: {
      board_deadline_ingame: { type: String, default: 'Day 14' },
      milestones_hit: { type: [String], default: [] },
      milestones_missed: { type: [String], default: [] },
    },

    risks: { type: [RiskSchema], default: [] },

    stakeholder_trust: { type: Schema.Types.Mixed, default: {} },

    project_status: {
      type: String,
      enum: ['not_started', 'in_discovery', 'in_development', 'prototype_ready', 'presented', 'closed'],
      default: 'not_started',
    },

    pending_approvals: { type: [String], default: [] },
    outstanding_actions: { type: [OutstandingActionSchema], default: [] },
    event_log: { type: [WorldStateEventSchema], default: [] },
    clock: { type: InGameClockSchema, default: () => ({}) },
    scoreable_signals: { type: [ScoreableSignalSchema], default: [] },

    conversation_threads: { type: Schema.Types.Mixed, default: {} },

    fired_events: { type: [String], default: [] },

    mom: {
      raw_text: { type: String, default: '' },
      submitted_at: { type: Date, default: null },
      extracted: { type: Schema.Types.Mixed, default: null },
    },

    presentation: {
      started_at: { type: Date, default: null },
      ended_at: { type: Date, default: null },
      recording_url: { type: String, default: null },
      transcript: { type: String, default: null },
      follow_up_questions: { type: [FollowUpQuestionSchema], default: [] },
      whisper_confidence: { type: Number, default: null },
    },

    evaluation: {
      type: new Schema({
        dimensions: [EvaluationDimensionSchema],
        total_score: Number,
        strengths: [String],
        weaknesses: [String],
        completed_at: Date,
      }, { _id: false }),
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    strict: false,
  }
);

// ── Model ────────────────────────────────────────────────────────────────────

export const WorldStateModel: Model<WorldStateDocument> =
  mongoose.models['WorldState'] ||
  mongoose.model<WorldStateDocument>('WorldState', WorldStateSchema);
