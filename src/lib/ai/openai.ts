import OpenAI from "openai";

let cached: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (cached) return cached;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  cached = new OpenAI({ apiKey });
  return cached;
}

export const OPENAI_MODELS = {
  flagship: "gpt-4o",
  reasoning: "o1",
  vision: "gpt-4o",
} as const;
