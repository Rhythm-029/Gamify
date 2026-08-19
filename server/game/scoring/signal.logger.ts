/**
 * Signal Logger — deterministic, continuous scoring.
 * No LLM. Pure World State reads → structured signals against the rubric.
 * Called by every other service on key player actions.
 * This module also provides the "snapshot scoring" used before the final LLM eval.
 */

import { readWorldState, logSignal } from '../engine/worldState.engine';
import { getScenarioConfig } from '../config/scenarios/scenario.registry';
import type { WorldState } from '../engine/worldState.types';

// ── Signal types and their dimensions ────────────────────────────────────────

export const SIGNAL_CATALOG = {
  // Decision Quality (25%)
  REQUIREMENT_DISCOVERED_PROACTIVE: { dimension: 'decision_quality', baseValue: 5 },
  REQUIREMENT_DISCOVERED_REACTIVE: { dimension: 'decision_quality', baseValue: 2 },
  CONTRADICTION_CAUGHT: { dimension: 'decision_quality', baseValue: 10 },
  CONTRADICTION_MISSED: { dimension: 'decision_quality', baseValue: -8 },
  IDE_BEFORE_SECURITY_REVIEW: { dimension: 'decision_quality', baseValue: -8 },
  IDE_AFTER_SECURITY_REVIEW: { dimension: 'decision_quality', baseValue: 5 },
  BRIEF_READ_FULLY: { dimension: 'decision_quality', baseValue: 3 },

  // Stakeholder Management (20%)
  CHARACTER_CONTACTED: { dimension: 'stakeholder_management', baseValue: 2 },
  CHARACTER_IGNORED: { dimension: 'stakeholder_management', baseValue: -3 },
  PROACTIVE_OLIVIA_CONTACT: { dimension: 'stakeholder_management', baseValue: 8 },
  RESPONSE_WITHIN_2MIN: { dimension: 'stakeholder_management', baseValue: 2 },
  RESPONSE_AFTER_5MIN: { dimension: 'stakeholder_management', baseValue: -2 },
  ALL_CHARACTERS_ENGAGED: { dimension: 'stakeholder_management', baseValue: 10 },

  // Communication Integrity (20%)
  PRESENTATION_CLAIM_VERIFIED: { dimension: 'communication_integrity', baseValue: 5 },
  PRESENTATION_CLAIM_CONTRADICTS_WS: { dimension: 'communication_integrity', baseValue: -10 },
  SCOPE_CONSISTENT_ACROSS_CHARACTERS: { dimension: 'communication_integrity', baseValue: 5 },

  // Documentation & Execution (15%)
  MOM_COMPLETENESS_HIGH: { dimension: 'documentation_execution', baseValue: 15 },
  MOM_COMPLETENESS_MEDIUM: { dimension: 'documentation_execution', baseValue: 8 },
  MOM_COMPLETENESS_LOW: { dimension: 'documentation_execution', baseValue: 2 },
  MOM_NOT_SUBMITTED: { dimension: 'documentation_execution', baseValue: -10 },
  ACTION_ITEMS_DOCUMENTED: { dimension: 'documentation_execution', baseValue: 2 },

  // Business & Security Understanding (10%)
  AUDIT_LOGS_RESOLVED: { dimension: 'business_security_understanding', baseValue: 8 },
  RBAC_RESOLVED: { dimension: 'business_security_understanding', baseValue: 8 },
  SECURITY_NOT_ADDRESSED: { dimension: 'business_security_understanding', baseValue: -8 },
  RISK_RAISED: { dimension: 'business_security_understanding', baseValue: 3 },

  // Presentation & Outcome (10%)
  PRESENTATION_COHERENT: { dimension: 'presentation_outcome', baseValue: 8 },
  PRESENTATION_INCOMPLETE: { dimension: 'presentation_outcome', baseValue: 3 },
};

// ── Snapshot scorer — called before final evaluation ─────────────────────────

export interface SignalSummary {
  dimension: string;
  raw_score: number;
  signal_count: number;
  key_signals: string[];
}

export async function computeSignalSummary(sessionId: string): Promise<SignalSummary[]> {
  const state = await readWorldState(sessionId);
  if (!state) throw new Error(`Session not found: ${sessionId}`);

  const config = getScenarioConfig(state.scenario_id);
  if (!config) throw new Error(`Scenario not found`);

  const dimensions = Object.keys(config.scoringWeights);
  const summaries: SignalSummary[] = [];

  for (const dimension of dimensions) {
    const signals = state.scoreable_signals.filter((s) => s.dimension === dimension);
    const rawScore = signals.reduce((sum, s) => sum + s.value, 0);
    const keySignals = signals.map((s) => s.description);

    summaries.push({
      dimension,
      raw_score: rawScore,
      signal_count: signals.length,
      key_signals: keySignals.slice(-5), // last 5 for LLM context
    });
  }

  return summaries;
}

// ── End-of-session auto-logging (call just before evaluation) ─────────────────

/**
 * Compute and log final session-level signals that can only be evaluated at the end.
 * Called by the Evaluator Service before the LLM evaluation call.
 */
export async function logEndOfSessionSignals(sessionId: string): Promise<void> {
  const state = await readWorldState(sessionId);
  if (!state) return;

  const config = getScenarioConfig(state.scenario_id);
  if (!config) return;

  // Check: all 5 characters engaged?
  const characterIds = config.characters.map((c) => c.id);
  const engagedCharacters = characterIds.filter((id) =>
    state.conversation_threads[id]?.some((m) => m.role === 'player')
  );

  if (engagedCharacters.length === characterIds.length) {
    await logSignal(sessionId, {
      dimension: 'stakeholder_management',
      signal_type: 'all_characters_engaged',
      value: 10,
      description: 'Player engaged all 5 stakeholders during the session.',
    });
  } else {
    const missed = characterIds.filter((id) => !engagedCharacters.includes(id));
    for (const id of missed) {
      await logSignal(sessionId, {
        dimension: 'stakeholder_management',
        signal_type: 'character_ignored',
        value: -3,
        description: `Player never contacted ${id}.`,
      });
    }
  }

  // Check: Olivia contacted proactively (before CTO security nudge fired)?
  const ctoNudgeFired = state.fired_events.includes('cto_security_nudge');
  const oliviaEverContacted = state.conversation_threads['olivia']?.some(
    (m) => m.role === 'player'
  );
  if (oliviaEverContacted && !ctoNudgeFired) {
    await logSignal(sessionId, {
      dimension: 'stakeholder_management',
      signal_type: 'proactive_olivia_contact',
      value: 8,
      description: 'Player contacted Olivia (InfoSec) proactively, before the CTO security nudge.',
    });
  }

  // Check: Audit Logs and RBAC addressed before presentation?
  const auditResolved = state.requirements.discovered.includes('req_audit_logs');
  const rbacResolved = state.requirements.discovered.includes('req_rbac');

  if (auditResolved && rbacResolved) {
    await logSignal(sessionId, {
      dimension: 'business_security_understanding',
      signal_type: 'security_requirements_addressed',
      value: 8,
      description: 'Both Audit Logs and RBAC were surfaced and addressed before presentation.',
    });
  } else {
    if (!auditResolved) {
      await logSignal(sessionId, {
        dimension: 'business_security_understanding',
        signal_type: 'audit_logs_not_addressed',
        value: -8,
        description: 'Audit Logs requirement was never surfaced or addressed.',
      });
    }
    if (!rbacResolved) {
      await logSignal(sessionId, {
        dimension: 'business_security_understanding',
        signal_type: 'rbac_not_addressed',
        value: -8,
        description: 'RBAC requirement was never properly specified.',
      });
    }
  }

  // Check: MOM submitted?
  if (!state.mom.submitted_at) {
    await logSignal(sessionId, {
      dimension: 'documentation_execution',
      signal_type: 'mom_not_submitted',
      value: -10,
      description: 'No Meeting Minutes submitted during the session.',
    });
  }

  // Check: requirement coverage percentage
  const totalReqs = config.requirements.length;
  const discovered = state.requirements.discovered.length;
  const coveragePct = discovered / totalReqs;

  await logSignal(sessionId, {
    dimension: 'decision_quality',
    signal_type: 'requirement_coverage',
    value: Math.round(coveragePct * 25), // 0-25 points
    description: `Player discovered ${discovered}/${totalReqs} requirements (${Math.round(coveragePct * 100)}%)`,
  });
}
