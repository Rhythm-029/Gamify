import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Nodemailer SMTP Email Config
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '"Brained OS Auth" <auth@brained.io>',

  // Google OAuth Client Config
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '579864871614-o90r392pup5745p87u54opq0skf52q19.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

  // RapidAPI LinkedIn Scraper Key & Active Host
  RAPIDAPI_KEY: process.env.RAPIDAPI_KEY || '66fee2e051mshfc218b658a48457p138226jsneb71acae02f8',
  RAPIDAPI_HOST: process.env.RAPIDAPI_HOST || 'fresh-linkedin-profile-data.p.rapidapi.com',

  // ── Game Backend ─────────────────────────────────────────────────────────
  // MongoDB — local default, override with Atlas URI in .env
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',

  // Redis — local default, override with Upstash URL in .env
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // ── LLM (Grok-first, OpenAI fallback) ────────────────────────────────────
  // Grok / xAI — set XAI_API_KEY for Grok
  XAI_API_KEY: process.env.XAI_API_KEY || '',
  LLM_BASE_URL: process.env.LLM_BASE_URL || 'https://api.x.ai/v1',
  LLM_MODEL: process.env.LLM_MODEL || 'grok-3',

  // OpenAI — fallback (used if XAI_API_KEY not set)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

  // ── Whisper (transcription) ───────────────────────────────────────────────
  // WHISPER_PROVIDER: 'openai' (default) | 'groq' (faster, free tier)
  WHISPER_PROVIDER: process.env.WHISPER_PROVIDER || 'openai',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',

  // Storage adapter: 'local' (default) | 's3' | 'r2'
  STORAGE_ADAPTER: process.env.STORAGE_ADAPTER || 'local',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  S3_BUCKET: process.env.S3_BUCKET || '',
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',

};

