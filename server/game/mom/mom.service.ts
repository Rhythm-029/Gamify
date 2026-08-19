/**
 * MOM (Minutes of Meeting) Service
 * Player submits raw meeting notes → LLM extracts structured data →
 * discovered requirements updated in World State.
 * This is step 1 of 3 in the evaluation pipeline (§2.8).
 */


import { llmClient as openai, LLM_MODEL } from '../config/llm.client';
import { ENV } from '../../config/env';
import { readWorldState, mutateWorldState, discoverRequirement, logSignal } from '../engine/worldState.engine';
import { getScenarioConfig } from '../config/scenarios/scenario.registry';


export interface MOMExtraction {
  covered_requirements: string[];   // requirement IDs mentioned in the MOM
  missing_requirements: string[];   // requirement IDs from ground truth not in MOM
  action_items: string[];
  timeline_notes: string[];
  stakeholders_mentioned: string[];
  contradictions_noted: string[];
}

export async function submitMOM(
  sessionId: string,
  momText: string
): Promise<MOMExtraction> {
  const state = await readWorldState(sessionId);
  if (!state) throw new Error(`Session not found: ${sessionId}`);

  const config = getScenarioConfig(state.scenario_id);
  if (!config) throw new Error(`Scenario not found`);

  const allRequirements = config.requirements.map((r) => `${r.id}: ${r.label}`).join('\n');
  const allCharacters = config.characters.map((c) => `${c.id}: ${c.name} (${c.role})`).join('\n');

  const prompt = `You are analysing a consultant's Meeting Minutes (MOM) document for an enterprise IT engagement.

GROUND TRUTH REQUIREMENT LIST (these are the actual requirements — the consultant may not know all of them yet):
${allRequirements}

PROJECT STAKEHOLDERS:
${allCharacters}

CONSULTANT'S MOM:
"""
${momText}
"""

Extract the following as a JSON object (no markdown, raw JSON only):
{
  "covered_requirements": ["req_id_1", ...],   // requirement IDs from the ground truth list that are clearly addressed in this MOM
  "missing_requirements": ["req_id_2", ...],   // requirement IDs from ground truth NOT mentioned at all
  "action_items": ["..."],                      // specific action items or next steps mentioned
  "timeline_notes": ["..."],                    // any timeline or deadline references
  "stakeholders_mentioned": ["character_id", ...],  // which stakeholders are mentioned by name or role
  "contradictions_noted": ["..."]               // any contradictions or inconsistencies noticed in the MOM text
}

Be strict about covered_requirements — only include IDs if the MOM clearly addresses that requirement, even if not by exact name.`;

  let extraction: MOMExtraction;
  try {
    const completion = await openai.chat.completions.create({
      model: LLM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    extraction = JSON.parse(raw) as MOMExtraction;
  } catch (err) {
    console.error('[MOM] LLM extraction failed:', err);
    throw new Error('MOM extraction failed — please try again.');
  }

  // Discover requirements that appear in the MOM
  for (const reqId of extraction.covered_requirements) {
    if (config.requirements.find((r) => r.id === reqId)) {
      await discoverRequirement(sessionId, reqId, 'mom_submission');
    }
  }

  // Store MOM in World State
  await mutateWorldState(sessionId, () => ({
    mom: {
      raw_text: momText,
      submitted_at: new Date(),
      extracted: extraction,
    },
  }), {
    type: 'mom_submitted',
    actor: 'player',
    target: 'world_state',
    payload: {
      covered_count: extraction.covered_requirements.length,
      missing_count: extraction.missing_requirements.length,
    },
  });

  // Score: MOM completeness signal
  const totalReqs = config.requirements.length;
  const coveredPct = extraction.covered_requirements.length / totalReqs;
  await logSignal(sessionId, {
    dimension: 'documentation_execution',
    signal_type: 'mom_completeness',
    value: Math.round(coveredPct * 20), // 0-20 points
    description: `MOM covered ${extraction.covered_requirements.length} of ${totalReqs} requirements (${Math.round(coveredPct * 100)}%)`,
  });

  // Score: Action items closed
  if (extraction.action_items.length > 0) {
    await logSignal(sessionId, {
      dimension: 'documentation_execution',
      signal_type: 'action_items_documented',
      value: Math.min(extraction.action_items.length * 2, 10),
      description: `${extraction.action_items.length} action items documented in MOM`,
    });
  }

  console.log(`[MOM] Extraction complete for ${sessionId}: ${extraction.covered_requirements.length} requirements covered`);
  return extraction;
}
