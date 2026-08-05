import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { authRouter } from './routes/authRoutes';
import { linkedinRouter } from './routes/linkedinRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Brained OS Enterprise Auth & LinkedIn Scraper Gateway',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/linkedin', linkedinRouter);

app.listen(ENV.PORT, () => {
  console.log(`\n🚀 [BRAINED BACKEND SERVER] Running on http://localhost:${ENV.PORT}`);
  console.log(`📌 Endpoints:`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/auth/send-otp`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/auth/verify-otp`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/auth/google`);
  console.log(`   - POST http://localhost:${ENV.PORT}/api/linkedin/fetch-profile\n`);
});
