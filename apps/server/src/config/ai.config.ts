import { env } from "./env.js";

export const aiConfig = {
  model: env.GEMINI_MODEL,
  batchSize: env.BATCH_SIZE,
  maxRetries: 3,
  retryBaseDelayMs: 1000,
  temperature: 0,
};