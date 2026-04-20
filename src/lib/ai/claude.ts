import Anthropic from "@anthropic-ai/sdk";

let cached: Anthropic | null = null;

export function getClaude(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  cached = new Anthropic({ apiKey });
  return cached;
}

export const MODELS = {
  opus: "claude-opus-4-5",
  sonnet: "claude-sonnet-4-5",
  haiku: "claude-haiku-4-5",
} as const;

export type ClaudeModel = (typeof MODELS)[keyof typeof MODELS];
