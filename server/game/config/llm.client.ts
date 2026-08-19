/**
 * Centralized LLM Client — Grok (xAI) as primary, OpenAI-compatible SDK.
 * All services import `llmClient` from here — no OpenAI imports anywhere else.
 * Switch model/provider by changing env vars only.
 */

import OpenAI from 'openai';
import { ENV } from '../../config/env';

// Grok API is OpenAI-compatible — same SDK, different baseURL and key
export const llmClient = new OpenAI({
  apiKey: ENV.XAI_API_KEY || ENV.OPENAI_API_KEY,
  baseURL: ENV.LLM_BASE_URL, // https://api.x.ai/v1 for Grok
});

/** Default model — overridable per call */
export const LLM_MODEL = ENV.LLM_MODEL; // grok-3, grok-2, or gpt-4o

/** Whisper client — can be same key or separate Groq key */
export const whisperClient = (() => {
  if (ENV.WHISPER_PROVIDER === 'groq') {
    return new OpenAI({
      apiKey: ENV.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  // Default: OpenAI Whisper API
  return new OpenAI({
    apiKey: ENV.OPENAI_API_KEY || ENV.XAI_API_KEY,
  });
})();

export const WHISPER_MODEL = ENV.WHISPER_PROVIDER === 'groq' ? 'whisper-large-v3' : 'whisper-1';
