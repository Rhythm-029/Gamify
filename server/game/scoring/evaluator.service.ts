/**
 * Evaluator Service — final LLM evaluation call (step 3 of §2.8).
 * Called only once, after the presentation is complete.
 * Score is NEVER shown to the player during the game.
 */


import { llmClient as openai, LLM_MODEL } from '../config/llm.client';
import { ENV } from '../../config/env';
import { readWorldState, mutateWorldState } from '../engine/worldState.engine';
import { getScenarioConfig } from '../config/scenarios/scenario.registry';
import { logEndOfSessionSignals, computeSignalSummary } from './signal.logger';


export interface EvaluationResult {
  dimensions: Array<{
    name: string;
    weight: number;
    score: number; // 0-100 within this dimension
    weighted_score: number; // score * weight
    notes: string;
  }>;
  total_score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  completed_at: Date;
}

export async function runFinalEvaluation(
  sessionId: string
): Promise<EvaluationResult> {
  // 1. Log end-of-session deterministic signals
  await logEndOfSessionSignals(sessionId);

  const state = await readWorldState(sessionId);
  if (!state) throw new Error(`Session not found: ${sessionId}`);

  const config = getScenarioConfig(state.scenario_id);
  if (!config) throw new Error(`Scenario not found`);

  // 2. Compute signal summaries per dimension
  const signalSummaries = await computeSignalSummary(sessionId);

  // 3. Build LLM evaluation prompt
  const signalContext = signalSummaries
    .map(
      (s) =>
        `Dimension: ${s.dimension}\nRaw signal score: ${s.raw_score}\nKey signals:\n${s.key_signals.map((k) => `  - ${k}`).join('\n')}`
    )
    .join('\n\n');

  const worldContext = `
Project status at presentation: ${state.project_status}
Requirements discovered: ${state.requirements.discovered.join(', ') || 'none'}
Requirements never surfaced: ${state.requirements.hidden.join(', ') || 'all found'}
MOM submitted: ${state.mom.submitted_at ? 'Yes' : 'No'}
MOM requirement coverage: ${state.mom.extracted?.covered_requirements?.length ?? 0} of ${config.requirements.length}
Presentation transcript: ${state.presentation.transcript ?? '(no transcript available)'}
Stakeholder trust at end: ${JSON.stringify(state.stakeholder_trust)}
Characters never contacted: ${config.characters.filter((c) => !state.conversation_threads[c.id]?.some((m) => m.role === 'player')).map((c) => c.name).join(', ') || 'none'}
`;

  const scoringDimensions = Object.entries(config.scoringWeights)
    .map(([name, weight]) => `- ${name}: ${weight * 100}% weight`)
    .join('\n');

  const prompt = `You are evaluating a Digital Transformation Consultant's performance on a 15-20 minute enterprise simulation called "Project Titan."

SCORING DIMENSIONS (weights must be respected):
${scoringDimensions}

WORLD STATE CONTEXT:
${worldContext}

SIGNAL SUMMARIES (deterministic scores already computed):
${signalContext}

PRESENTATION TRANSCRIPT:
${state.presentation.transcript ?? '(no presentation recorded)'}

Your task:
1. For each scoring dimension, assign a score from 0-100 (this is the dimension score, before weighting).
2. Weight each score by its dimension weight to compute the weighted_score.
3. Sum weighted_scores for total_score (0-100).
4. Identify 3-5 specific strengths (what the consultant did well).
5. Identify 3-5 specific weaknesses or missed opportunities.
6. Be concrete — reference specific World State facts (e.g. "never contacted Olivia" or "surfaced Audit Logs proactively").
7. Do NOT be lenient — this is a professional evaluation. A score of 70+ means genuinely competent performance.

Pay special attention to:
- Whether Audit Logs and RBAC were addressed before the presentation (compliance gates)
- Whether the consultant's presentation claims match what the World State actually shows as completed
- The 2-weeks/3-weeks timeline contradiction — was it noticed and resolved?
- Employee Document Upload — was it incorporated when Emma raised it?

Return ONLY valid JSON:
{
  "dimensions": [
    {"name": "decision_quality", "weight": 0.25, "score": 0-100, "weighted_score": 0-25, "notes": "..."},
    ...
  ],
  "total_score": 0-100,
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."]
}`;

  let evalResult: Omit<EvaluationResult, 'completed_at'>;
  try {
    const completion = await openai.chat.completions.create({
      model: LLM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    const raw = completion.choices[0]?.message?.content ?? '{}';
    evalResult = JSON.parse(raw);
  } catch (err) {
    console.error('[EVALUATOR] LLM evaluation failed:', err);
    throw new Error('Evaluation failed — please try again.');
  }

  const result: EvaluationResult = { ...evalResult, completed_at: new Date() };

  // Save to World State (score hidden during play — only accessible via report)
  await mutateWorldState(sessionId, () => ({
    evaluation: result,
    project_status: 'closed',
  }));

  console.log(`[EVALUATOR] Session ${sessionId} evaluated. Total score: ${result.total_score}`);
  return result;
}
