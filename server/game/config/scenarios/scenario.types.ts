/**
 * Scenario Config interface — every scenario ships one of these.
 * The engine code NEVER references Titan Manufacturing or any character name directly.
 * Everything resolves through this config at session start.
 */

export interface RequirementDef {
  id: string;
  label: string;
  /** Which channel this is revealed through */
  revealedVia: 'kickoff' | 'brief' | 'mid_event' | 'proactive_inquiry';
  /** Which character "owns" this requirement */
  owner: string;
  /** Is this a compliance gate (must be resolved for security sign-off) */
  complianceGate: boolean;
}

export interface CharacterDef {
  id: string;
  name: string;
  role: string;
  department: string;
  badge: string;
  /** Knowledge scope: list of requirement IDs this character may discuss */
  knowledgeScope: string[];
  /** Initial trust score (0-100) */
  initialTrust: number;
  /** Simulated response delay in ms */
  replyDelayMs: number;
  /** Avatar image path */
  dp: string;
}

export interface EventRuleDef {
  event_id: string;
  label: string;
  trigger_type: 'always_at_time' | 'conditional';
  /**
   * For always_at_time: session progress percentage (0-100) to fire at.
   * For conditional: JS expression string evaluated against World State snapshot.
   * Uses only safe fields: fired_events, requirements.discovered, clock.real_elapsed_ms
   */
  condition_expr: string;
  fires_once: boolean;
  /** Which character sends this event */
  sender_character_id: string;
  /** Channel for delivery */
  delivery_channel: 'mail' | 'teams';
  /** The message to deliver (static for non-LLM events) */
  message_template: string;
}

export interface ScenarioDef {
  id: string;
  name: string;
  client: string;
  briefPdfContent: string;
  kickoffScript: string;
  requirements: RequirementDef[];
  characters: CharacterDef[];
  eventRules: EventRuleDef[];
  boardDeadlineIngame: string;
  totalIngameDays: number;
  /** Scoring dimension weights — must sum to 1.0 */
  scoringWeights: Record<string, number>;
}
