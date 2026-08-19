import express from 'express';
import http from 'http';
import cors from 'cors';
import { ENV } from './config/env';
import { authRouter } from './routes/authRoutes';
import { linkedinRouter } from './routes/linkedinRoutes';
import { gameRouter } from './game/routes/game.routes';
import { initWebSocket } from './game/websocket/ws.gateway';
import { startClockWorker } from './game/clock/clock.service';
import { initOrchestrator } from './game/orchestrator/event.orchestrator';

const app = express();
const httpServer = http.createServer(app);

app.use(cors());
app.use(express.json());

// Serve uploaded files (recordings, PDFs)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Brained OS Backend',
    timestamp: new Date().toISOString(),
  });
});

// ── Existing Routes (untouched) ──────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/linkedin', linkedinRouter);

// ── Game Backend Routes ───────────────────────────────────────────────────────
app.use('/api/game', gameRouter);

// ── WebSocket Gateway ─────────────────────────────────────────────────────────
initWebSocket(httpServer);

// ── Game Engine Services ──────────────────────────────────────────────────────
startClockWorker();
initOrchestrator();

httpServer.listen(ENV.PORT, () => {
  console.log(`\n🚀 [BRAINED BACKEND] Running on http://localhost:${ENV.PORT}`);
  console.log(`📌 Auth Endpoints:`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/auth/send-otp`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/auth/verify-otp`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/auth/google`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/linkedin/fetch-profile`);
  console.log(`\n🎮 Game Endpoints:`);
  console.log(`   - GET  http://localhost:${ENV.PORT}/api/game/scenarios`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/game/session/start`);
  console.log(`   - GET  http://localhost:${ENV.PORT}/api/game/session/:id`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/game/session/:id/pause`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/game/session/:id/resume`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/game/character/:id/message`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/game/ide/run`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/game/mom/submit`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/game/presentation/start`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/game/presentation/upload`);
  console.log(`   - GET  http://localhost:${ENV.PORT}/api/game/report/:sessionId`);
  console.log(`\n🔌 WebSocket: ws://localhost:${ENV.PORT}\n`);
});
