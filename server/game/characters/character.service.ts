/**
 * Character AI Service
 * One call pattern, reused for all 5 characters — parameterized by persona config.
 * Enforces knowledge scoping in the prompt. Post-checks for out-of-scope content.
 * Simulates per-character reply latency via the Scheduler (doesn't block on generate).
 */


import { llmClient as openai, LLM_MODEL } from '../config/llm.client';
import { ENV } from '../../config/env';
import { PERSONA_CONFIGS } from './character.personas';
import { getScenarioConfig } from '../config/scenarios/scenario.registry';
import { readWorldState, mutateWorldState, updateTrust, logSignal } from '../engine/worldState.engine';
import { scheduleGameEvent } from '../clock/clock.service';
import type { WorldState } from '../engine/worldState.types';


// ── Reply generation ──────────────────────────────────────────────────────────

interface GenerateReplyParams {
  sessionId: string;
  characterId: string;
  incomingMessage: string;
  /** Optional — for orchestrator-generated proactive messages (no player message) */
  proactiveMessage?: string;
}

interface CharacterReply {
  text: string;
  character_id: string;
  delivery_channel: 'mail' | 'teams';
  delivered_at_delay_ms: number;
}

/**
 * Generate a character reply and schedule its delivery.
 * Returns immediately — the reply is delivered after the character's latency delay.
 */
export async function generateCharacterReply(
  params: GenerateReplyParams
): Promise<{ queued: true; expected_delay_ms: number }> {
  const { sessionId, characterId, incomingMessage, proactiveMessage } = params;

  const persona = PERSONA_CONFIGS[characterId];
  if (!persona) throw new Error(`Unknown character: ${characterId}`);

  const state = await readWorldState(sessionId);
  if (!state) throw new Error(`Session not found: ${sessionId}`);

  const config = getScenarioConfig(state.scenario_id);
  if (!config) throw new Error(`Scenario not found: ${state.scenario_id}`);

  const charDef = config.characters.find((c) => c.id === characterId);
  if (!charDef) throw new Error(`Character ${characterId} not in scenario config`);

  // Build conversation history for this character's thread
  const thread = state.conversation_threads[characterId] ?? [];
  const historyMessages = thread.slice(-12).map((m) => ({
    role: m.role === 'player' ? ('user' as const) : ('assistant' as const),
    content: m.content,
  }));

  // Build the LLM prompt
  const scopeList = charDef.knowledgeScope.join(', ');
  const scopeDescription = persona.knowledgeScopeDescription;

  const systemPrompt = `${persona.systemPrompt}

KNOWLEDGE SCOPE ENFORCEMENT:
You may ONLY discuss topics related to: ${scopeDescription}
Requirement IDs you may reference: ${scopeList}
If the player asks about anything outside this scope, respond with a natural in-character redirect like: "${persona.deflectionPhrase}" — do NOT answer the out-of-scope question.

WORLD STATE CONTEXT (read-only — stay consistent with this):
- Project status: ${state.project_status}
- Requirements discovered so far: ${state.requirements.discovered.join(', ') || 'none yet'}
- Day in-game: ${state.clock.ingame_day}, Time: ${state.clock.ingame_time}
- Your current trust with the player: ${state.stakeholder_trust[characterId] ?? 70}/100

Be fully in character. Never break the fourth wall. Never acknowledge you are an AI.`;

  const userMessage = proactiveMessage
    ? `[SYSTEM: This is a proactive message from you to the player. Generate the message naturally in your voice.]\n\n${proactiveMessage}`
    : incomingMessage;

  // LLM call
  let replyText: string;
  try {
    const completion = await openai.chat.completions.create({
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: userMessage },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });
    replyText = completion.choices[0]?.message?.content?.trim() ?? 'I need to step away — follow up later.';
  } catch (err) {
    console.error(`[CHARACTER AI] LLM call failed for ${characterId}:`, err);
    replyText = charDef.replyDelayMs < 10000
      ? "I'll get back to you on that — busy right now."
      : "Give me a moment — I'll come back to this.";
  }

  // Post-check: does the reply mention requirement IDs outside this character's scope?
  const allReqIds = config.requirements.map((r) => r.id);
  const outOfScopeIds = allReqIds.filter(
    (id) => !charDef.knowledgeScope.includes(id) && replyText.includes(id)
  );

  if (outOfScopeIds.length > 0) {
    console.warn(`[CHARACTER AI] ${characterId} reply contained out-of-scope IDs: ${outOfScopeIds}. Regenerating...`);
    // One regeneration attempt with a stricter prompt
    try {
      const retry = await openai.chat.completions.create({
        model: LLM_MODEL,
        messages: [
          {
            role: 'system',
            content: `${systemPrompt}\n\nCRITICAL: Your previous reply referenced topics outside your scope. Redirect the question in character. Do NOT mention: ${outOfScopeIds.join(', ')}.`,
          },
          ...historyMessages,
          { role: 'user', content: userMessage },
        ],
        max_tokens: 200,
        temperature: 0.5,
      });
      replyText = retry.choices[0]?.message?.content?.trim() ?? `${persona.deflectionPhrase}`;
    } catch {
      replyText = persona.deflectionPhrase;
    }
  }

  // Schedule delivery after character's reply delay
  const deliveryEventRef = `char_reply:${characterId}:${Date.now()}`;
  const delayMs = charDef.replyDelayMs;

  // Stash the reply in Redis under a delivery key, then schedule
  const { getRedis } = await import('../engine/worldState.redis');
  const redis = getRedis();
  await redis.setex(
    `pending_reply:${sessionId}:${deliveryEventRef}`,
    300, // 5 min TTL
    JSON.stringify({ characterId, replyText, channel: 'teams' })
  );
  await scheduleGameEvent(sessionId, deliveryEventRef, delayMs);

  // Log the player's message immediately to conversation thread
  if (!proactiveMessage) {
    await mutateWorldState(sessionId, (s) => ({
      conversation_threads: {
        ...s.conversation_threads,
        [characterId]: [
          ...(s.conversation_threads[characterId] ?? []),
          { role: 'player', content: incomingMessage, timestamp: new Date() },
        ],
      },
    }), {
      type: 'teams_message_sent',
      actor: 'player',
      target: characterId,
      payload: { message: incomingMessage },
    });

    // Log signal: player contacted this character
    await logSignal(sessionId, {
      dimension: 'stakeholder_management',
      signal_type: 'character_contacted',
      value: 2,
      description: `Player sent message to ${characterId}`,
    });
  }

  return { queued: true, expected_delay_ms: delayMs };
}

/**
 * Deliver a pending character reply (called by the clock worker when the timer fires).
 * Writes the reply to the conversation thread and emits via WebSocket.
 */
export async function deliverPendingReply(
  sessionId: string,
  deliveryEventRef: string
): Promise<void> {
  const { getRedis, publishStateChanged } = await import('../engine/worldState.redis');
  const redis = getRedis();

  const raw = await redis.get(`pending_reply:${sessionId}:${deliveryEventRef}`);
  if (!raw) {
    console.warn(`[CHARACTER AI] No pending reply found for ${deliveryEventRef}`);
    return;
  }

  const { characterId, replyText } = JSON.parse(raw) as {
    characterId: string;
    replyText: string;
    channel: string;
  };

  // Write reply to conversation thread
  await mutateWorldState(sessionId, (s) => ({
    conversation_threads: {
      ...s.conversation_threads,
      [characterId]: [
        ...(s.conversation_threads[characterId] ?? []),
        { role: 'character', content: replyText, timestamp: new Date() },
      ],
    },
  }), {
    type: 'teams_message_received',
    actor: characterId,
    target: 'player',
    payload: { message: replyText },
  });

  // Update trust slightly for replying
  await updateTrust(sessionId, characterId, 1);

  // Push to WebSocket
  await publishStateChanged(sessionId, {
    type: 'character_message',
    character_id: characterId,
    message: replyText,
  });

  await redis.del(`pending_reply:${sessionId}:${deliveryEventRef}`);
  console.log(`[CHARACTER AI] Delivered reply from ${characterId} to session ${sessionId}`);
}

/**
 * Deliver a proactive event message (orchestrator-triggered).
 * No player input — the character initiates this.
 */
export async function deliverProactiveMessage(
  sessionId: string,
  characterId: string,
  messageText: string,
  channel: 'mail' | 'teams',
  eventId: string
): Promise<void> {
  const { publishStateChanged } = await import('../engine/worldState.redis');

  await mutateWorldState(sessionId, (s) => ({
    conversation_threads: {
      ...s.conversation_threads,
      [characterId]: [
        ...(s.conversation_threads[characterId] ?? []),
        { role: 'character', content: messageText, timestamp: new Date() },
      ],
    },
  }), {
    type: channel === 'mail' ? 'mail_received' : 'teams_message_received',
    actor: characterId,
    target: 'player',
    payload: { message: messageText, event_id: eventId, channel },
  });

  await publishStateChanged(sessionId, {
    type: 'proactive_message',
    character_id: characterId,
    message: messageText,
    channel,
    event_id: eventId,
  });

  console.log(`[CHARACTER AI] Proactive message from ${characterId} (${eventId}) delivered to ${sessionId}`);
}

/**
 * Get the full conversation thread with a character.
 */
export async function getConversationThread(
  sessionId: string,
  characterId: string
): Promise<Array<{ role: string; content: string; timestamp: Date }>> {
  const state = await readWorldState(sessionId);
  if (!state) return [];
  return state.conversation_threads[characterId] ?? [];
}
