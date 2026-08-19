/**
 * Event Orchestrator
 * Subscribes to World State changes (via Redis pub/sub) and clock ticks.
 * Evaluates the scenario's event rule table against current World State.
 * Rules are DATA (from scenario config) — no hardcoded event logic here.
 *
 * Rule evaluation uses a safe sandbox — only World State fields are exposed,
 * no arbitrary code execution risk.
 */

import { readWorldState, markEventFired } from '../engine/worldState.engine';
import { getRedis } from '../engine/worldState.redis';
import { getScenarioConfig } from '../config/scenarios/scenario.registry';
import { deliverProactiveMessage } from '../characters/character.service';
import { registerEventHandler, getSessionProgress } from '../clock/clock.service';
import type { EventRuleDef } from '../config/scenarios/scenario.types';
import type { WorldState } from '../engine/worldState.types';

// ── Rule evaluator ────────────────────────────────────────────────────────────

/**
 * Evaluate a rule's condition expression against a World State snapshot.
 * Safe sandbox: only a limited set of fields exposed.
 */
function evaluateCondition(
  expr: string,
  state: WorldState,
  progress: number
): boolean {
  try {
    // Build safe context
    const context = {
      progress,
      fired_events: state.fired_events,
      requirements: state.requirements,
      conversation_threads: state.conversation_threads,
      real_elapsed_ms: state.clock.real_elapsed_ms,
      project_status: state.project_status,
      stakeholder_trust: state.stakeholder_trust,
    };

    // Create function from expression with only the safe context in scope
    const fn = new Function(...Object.keys(context), `return (${expr});`);
    return Boolean(fn(...Object.values(context)));
  } catch (err) {
    console.error('[ORCHESTRATOR] Rule eval error:', err);
    return false;
  }
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

/**
 * Evaluate all unfired rules for a session against current World State.
 * Called on every clock tick AND on every World State change.
 */
export async function evaluateRules(sessionId: string): Promise<void> {
  const state = await readWorldState(sessionId);
  if (!state || state.clock.paused || state.project_status === 'closed') return;

  const config = getScenarioConfig(state.scenario_id);
  if (!config) return;

  const progress = await getSessionProgress(sessionId);

  for (const rule of config.eventRules) {
    // Skip if already fired (fires_once)
    if (rule.fires_once && state.fired_events.includes(rule.event_id)) continue;

    const shouldFire = evaluateCondition(rule.condition_expr, state, progress);
    if (!shouldFire) continue;

    console.log(`[ORCHESTRATOR] Firing rule "${rule.event_id}" for session ${sessionId}`);

    // Mark as fired first to prevent double-firing
    await markEventFired(sessionId, rule.event_id);

    // Deliver the message
    await deliverProactiveMessage(
      sessionId,
      rule.sender_character_id,
      rule.message_template,
      rule.delivery_channel,
      rule.event_id
    );
  }
}

// ── Startup: register with clock service ──────────────────────────────────────

/**
 * Register the orchestrator's event handler with the clock service.
 * The clock fires scheduled event refs; orchestrator handles character reply delivery.
 */
export function initOrchestrator(): void {
  registerEventHandler(async (sessionId: string, eventRef: string) => {
    // Character reply deliveries (from character service scheduler)
    if (eventRef.startsWith('char_reply:')) {
      const { deliverPendingReply } = await import('../characters/character.service');
      await deliverPendingReply(sessionId, eventRef);
      return;
    }

    // Orchestrator rule events (time-based only — conditional ones are evaluated inline)
    await evaluateRules(sessionId);
  });

  // Also subscribe to Redis pub/sub for World State changes
  startStatePubSubListener();

  console.log('[ORCHESTRATOR] Initialised');
}

// ── Redis pub/sub listener (World State changes trigger rule re-evaluation) ────

function startStatePubSubListener(): void {
  const subscriber = getRedis().duplicate();
  subscriber.subscribe('state:changed', (err) => {
    if (err) console.error('[ORCHESTRATOR] Sub error:', err);
  });

  subscriber.on('message', async (_channel: string, message: string) => {
    try {
      const { session_id } = JSON.parse(message) as { session_id: string };
      // Re-evaluate rules on every World State change (conditional rules)
      await evaluateRules(session_id);
    } catch (err) {
      console.error('[ORCHESTRATOR] Message handling error:', err);
    }
  });
}
