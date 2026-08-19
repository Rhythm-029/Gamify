/**
 * Game API Routes — all prefixed /api/game
 * Session, Character, IDE, MOM, Presentation, Report
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';

// Services
import { createSession, getSession, pauseSession, resumeSession, abandonSession, getPlayerActiveSessions } from '../session/session.service';
import { generateCharacterReply, getConversationThread } from '../characters/character.service';
import { runIDE } from '../ide/ide.service';
import { submitMOM } from '../mom/mom.service';
import { startPresentation, uploadPresentationRecording, completePresentation } from '../presentation/presentation.service';
import { generateReport } from '../report/report.service';
import { readWorldState, discoverRequirement } from '../engine/worldState.engine';
import { startTracking } from '../clock/clock.service';
import { listScenarios } from '../config/scenarios/scenario.registry';

export const gameRouter = Router();

const upload = multer({ dest: os.tmpdir() });

// ── Utility ─────────────────────────────────────────────────────────────────

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response) => {
    fn(req, res).catch((err) => {
      console.error('[GAME API]', err);
      res.status(500).json({ success: false, error: err.message ?? 'Internal server error' });
    });
  };
}

// ── Scenarios ────────────────────────────────────────────────────────────────

gameRouter.get('/scenarios', (_req, res) => {
  res.json({ success: true, scenarios: listScenarios() });
});

// ── Session ──────────────────────────────────────────────────────────────────

/** POST /api/game/session/start — create a new session */
gameRouter.post('/session/start', asyncHandler(async (req, res) => {
  const { player_id, scenario_id } = req.body as { player_id: string; scenario_id: string };
  if (!player_id || !scenario_id) {
    res.status(400).json({ success: false, error: 'player_id and scenario_id required' });
    return;
  }

  const result = await createSession(player_id, scenario_id);
  startTracking(result.session_id); // start clock
  res.json({ success: true, ...result });
}));

/** GET /api/game/session/:id — get full World State */
gameRouter.get('/session/:id', asyncHandler(async (req, res) => {
  const { session, world_state } = await getSession(req.params.id);
  if (!session || !world_state) {
    res.status(404).json({ success: false, error: 'Session not found' });
    return;
  }
  res.json({ success: true, session, world_state });
}));

/** POST /api/game/session/:id/pause */
gameRouter.post('/session/:id/pause', asyncHandler(async (req, res) => {
  await pauseSession(req.params.id);
  res.json({ success: true, message: 'Session paused' });
}));

/** POST /api/game/session/:id/resume */
gameRouter.post('/session/:id/resume', asyncHandler(async (req, res) => {
  await resumeSession(req.params.id);
  startTracking(req.params.id);
  res.json({ success: true, message: 'Session resumed' });
}));

/** POST /api/game/session/:id/abandon */
gameRouter.post('/session/:id/abandon', asyncHandler(async (req, res) => {
  await abandonSession(req.params.id);
  res.json({ success: true, message: 'Session abandoned' });
}));

/** GET /api/game/session/player/:playerId — active sessions for a player */
gameRouter.get('/session/player/:playerId', asyncHandler(async (req, res) => {
  const sessions = await getPlayerActiveSessions(req.params.playerId);
  res.json({ success: true, sessions });
}));

// ── Brief ────────────────────────────────────────────────────────────────────

/** GET /api/game/brief/:sessionId — get the brief PDF content for this session's scenario */
gameRouter.get('/brief/:sessionId', asyncHandler(async (req, res) => {
  const state = await readWorldState(req.params.sessionId);
  if (!state) { res.status(404).json({ success: false, error: 'Session not found' }); return; }

  const { getScenarioConfig } = await import('../config/scenarios/scenario.registry');
  const config = getScenarioConfig(state.scenario_id);
  if (!config) { res.status(404).json({ success: false, error: 'Scenario not found' }); return; }

  // Log that player opened the brief
  await discoverRequirement(req.params.sessionId, 'req_payroll', 'brief_read');
  await discoverRequirement(req.params.sessionId, 'req_documents', 'brief_read');
  await discoverRequirement(req.params.sessionId, 'req_announcements', 'brief_read');

  res.json({
    success: true,
    brief_text: config.briefPdfContent,
    kickoff_script: config.kickoffScript,
  });
}));

// ── Characters ───────────────────────────────────────────────────────────────

/** POST /api/game/character/:characterId/message — player sends message to character */
gameRouter.post('/character/:characterId/message', asyncHandler(async (req, res) => {
  const { session_id, message } = req.body as { session_id: string; message: string };
  if (!session_id || !message) {
    res.status(400).json({ success: false, error: 'session_id and message required' });
    return;
  }

  const result = await generateCharacterReply({
    sessionId: session_id,
    characterId: req.params.characterId,
    incomingMessage: message,
  });
  res.json({ success: true, ...result });
}));

/** GET /api/game/character/:characterId/thread/:sessionId — full conversation thread */
gameRouter.get('/character/:characterId/thread/:sessionId', asyncHandler(async (req, res) => {
  const thread = await getConversationThread(req.params.sessionId, req.params.characterId);
  res.json({ success: true, thread });
}));

// ── IDE ───────────────────────────────────────────────────────────────────────

/** POST /api/game/ide/run — trigger IDE run */
gameRouter.post('/ide/run', asyncHandler(async (req, res) => {
  const { session_id } = req.body as { session_id: string };
  if (!session_id) { res.status(400).json({ success: false, error: 'session_id required' }); return; }

  const result = await runIDE(session_id);
  res.json({ success: true, ...result });
}));

// ── MOM ───────────────────────────────────────────────────────────────────────

/** POST /api/game/mom/submit — submit meeting notes */
gameRouter.post('/mom/submit', asyncHandler(async (req, res) => {
  const { session_id, mom_text } = req.body as { session_id: string; mom_text: string };
  if (!session_id || !mom_text) {
    res.status(400).json({ success: false, error: 'session_id and mom_text required' });
    return;
  }
  const extraction = await submitMOM(session_id, mom_text);
  res.json({ success: true, extraction });
}));

// ── Presentation ──────────────────────────────────────────────────────────────

/** POST /api/game/presentation/start */
gameRouter.post('/presentation/start', asyncHandler(async (req, res) => {
  const { session_id } = req.body as { session_id: string };
  if (!session_id) { res.status(400).json({ success: false, error: 'session_id required' }); return; }
  const result = await startPresentation(session_id);
  res.json({ success: true, ...result });
}));

/** POST /api/game/presentation/upload — upload audio recording */
gameRouter.post('/presentation/upload', upload.single('audio'), asyncHandler(async (req, res) => {
  const session_id = req.body.session_id as string;
  if (!session_id || !req.file) {
    res.status(400).json({ success: false, error: 'session_id and audio file required' });
    return;
  }

  const result = await uploadPresentationRecording(
    session_id,
    req.file.path,
    req.file.originalname
  );
  res.json({ success: true, ...result });
}));

/** POST /api/game/presentation/complete */
gameRouter.post('/presentation/complete', asyncHandler(async (req, res) => {
  const { session_id } = req.body as { session_id: string };
  if (!session_id) { res.status(400).json({ success: false, error: 'session_id required' }); return; }
  await completePresentation(session_id);
  res.json({ success: true, message: 'Presentation complete. Evaluation running...' });
}));

// ── Report ────────────────────────────────────────────────────────────────────

/** GET /api/game/report/:sessionId — get final report */
gameRouter.get('/report/:sessionId', asyncHandler(async (req, res) => {
  const report = await generateReport(req.params.sessionId);
  res.json({ success: true, report });
}));
