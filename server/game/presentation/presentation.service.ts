/**
 * Presentation Service — manages the final presentation flow.
 * 1. Trigger: calendar event fires near session end
 * 2. Generate per-character follow-up questions from World State gaps (LLM)
 * 3. Accept audio recording upload
 * 4. Transcribe via Whisper
 * 5. Trigger evaluation pipeline
 */


import fs from 'fs';
import path from 'path';
import { llmClient as openai, whisperClient, WHISPER_MODEL, LLM_MODEL } from '../config/llm.client';
import { ENV } from '../../config/env';
import { readWorldState, mutateWorldState, logSignal } from '../engine/worldState.engine';
import { getScenarioConfig } from '../config/scenarios/scenario.registry';
import { PERSONA_CONFIGS } from '../characters/character.personas';
import { uploadFile } from '../storage/storage.service';
import { runFinalEvaluation } from '../scoring/evaluator.service';



// ── Start presentation ────────────────────────────────────────────────────────

export interface PresentationStartResult {
  follow_up_questions: Array<{
    character_id: string;
    character_name: string;
    question: string;
  }>;
}

/**
 * Start the final presentation — generates in-character follow-up questions
 * based on actual World State gaps. Each character asks about THEIR domain.
 */
export async function startPresentation(sessionId: string): Promise<PresentationStartResult> {
  const state = await readWorldState(sessionId);
  if (!state) throw new Error(`Session not found: ${sessionId}`);

  const config = getScenarioConfig(state.scenario_id);
  if (!config) throw new Error(`Scenario not found`);

  // Build context for question generation
  const gaps = state.requirements.hidden.map((id) => {
    const req = config.requirements.find((r) => r.id === id);
    return req ? `${req.label} (owned by: ${req.owner})` : id;
  });

  const complianceGaps = config.requirements
    .filter((r) => r.complianceGate && !state.requirements.discovered.includes(r.id))
    .map((r) => r.label);

  const trustScores = Object.entries(state.stakeholder_trust)
    .map(([id, score]) => `${id}: ${score}/100`)
    .join(', ');

  const questionsPrompt = `You are generating follow-up questions for a final project presentation review.

World State:
- Requirements NOT surfaced: ${gaps.join(', ') || 'none'}
- Compliance gates NOT addressed: ${complianceGaps.join(', ') || 'none'}
- Stakeholder trust scores: ${trustScores}
- Project status: ${state.project_status}
- MOM submitted: ${state.mom.submitted_at ? 'Yes' : 'No'}

Characters present (each asks ONE question, strictly within their own domain):
${config.characters.map((c) => {
  const persona = PERSONA_CONFIGS[c.id];
  return `- ${c.id} (${c.name}, ${c.role}): scope = ${persona?.knowledgeScopeDescription ?? 'general'}`;
}).join('\n')}

Generate exactly one question per character that:
1. Is strictly in-character (match each character's voice and domain exactly)
2. Probes a real gap in the World State where possible (if Audit Logs were never addressed, Olivia asks about it)
3. If no gap in their domain, asks a reasonable follow-up about something the consultant should have covered

Return ONLY valid JSON:
{
  "questions": [
    {"character_id": "marcus", "question": "..."},
    {"character_id": "daniel", "question": "..."},
    {"character_id": "emma", "question": "..."},
    {"character_id": "olivia", "question": "..."},
    {"character_id": "sophia", "question": "..."}
  ]
}`;

  let followUpQuestions: Array<{ character_id: string; question: string }> = [];
  try {
    const completion = await openai.chat.completions.create({
      model: LLM_MODEL,
      messages: [{ role: 'user', content: questionsPrompt }],
      max_tokens: 600,
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });
    const raw = JSON.parse(completion.choices[0]?.message?.content ?? '{"questions":[]}');
    followUpQuestions = raw.questions ?? [];
  } catch (err) {
    console.error('[PRESENTATION] Follow-up Q generation failed:', err);
    followUpQuestions = config.characters.map((c) => ({
      character_id: c.id,
      question: "Can you walk us through your approach to this engagement?",
    }));
  }

  // Save to World State
  const questionsWithAnswers = followUpQuestions.map((q) => ({
    ...q,
    answer_transcript: null,
  }));

  await mutateWorldState(sessionId, () => ({
    presentation: {
      ...state.presentation,
      started_at: new Date(),
      follow_up_questions: questionsWithAnswers,
    },
    project_status: 'presented',
  }), {
    type: 'presentation_started',
    actor: 'system',
    target: 'player',
    payload: { question_count: followUpQuestions.length },
  });

  const result = followUpQuestions.map((q) => {
    const charDef = config.characters.find((c) => c.id === q.character_id);
    return {
      character_id: q.character_id,
      character_name: charDef?.name ?? q.character_id,
      question: q.question,
    };
  });

  console.log(`[PRESENTATION] Started for session ${sessionId} with ${result.length} follow-up questions`);
  return { follow_up_questions: result };
}

// ── Upload and transcribe recording ──────────────────────────────────────────

export async function uploadPresentationRecording(
  sessionId: string,
  audioFilePath: string,
  originalFilename: string
): Promise<{ transcript: string; confidence: number; recording_url: string }> {
  const state = await readWorldState(sessionId);
  if (!state) throw new Error(`Session not found: ${sessionId}`);

  // Upload to storage
  const recording_url = await uploadFile(audioFilePath, `recordings/${sessionId}/${originalFilename}`);

  // Transcribe with Whisper
  let transcript = '';
  let confidence = 0;

  try {
    const audioStream = fs.createReadStream(audioFilePath);
    const transcription = await openai.audio.transcriptions.create({
      model: WHISPER_MODEL,
      file: audioStream,
      response_format: 'verbose_json',
    });
    transcript = transcription.text ?? '';

    // Compute average confidence from segments if available
    const segments = (transcription as any).segments ?? [];
    if (segments.length > 0) {
      const avgLogProb = segments.reduce((sum: number, s: any) => sum + (s.avg_logprob ?? 0), 0) / segments.length;
      confidence = Math.min(1, Math.max(0, Math.exp(avgLogProb)));
    } else {
      confidence = 0.85; // default if segments unavailable
    }
  } catch (err) {
    console.error('[PRESENTATION] Whisper transcription failed:', err);
    transcript = '[Transcription unavailable]';
    confidence = 0;
  }

  // Save transcript to World State
  await mutateWorldState(sessionId, () => ({
    presentation: {
      ...state.presentation,
      recording_url,
      transcript,
      whisper_confidence: confidence,
    },
  }));

  // Log presentation quality signal
  await logSignal(sessionId, {
    dimension: 'presentation_outcome',
    signal_type: 'recording_uploaded',
    value: 3,
    description: 'Player recorded and uploaded their presentation.',
  });

  console.log(`[PRESENTATION] Recording transcribed for ${sessionId}: ${transcript.length} chars, confidence: ${confidence.toFixed(2)}`);
  return { transcript, confidence, recording_url };
}

// ── Complete presentation ─────────────────────────────────────────────────────

export async function completePresentation(sessionId: string): Promise<void> {
  await mutateWorldState(sessionId, (s) => ({
    presentation: { ...s.presentation, ended_at: new Date() },
  }), {
    type: 'presentation_ended',
    actor: 'system',
    target: 'player',
    payload: {},
  });

  // Trigger final evaluation (async — report generation follows)
  await runFinalEvaluation(sessionId);
  console.log(`[PRESENTATION] Completed for session ${sessionId}`);
}
