/**
 * Central switch for which LLM provider the app uses for generation.
 * Set AI_PROVIDER=openai in .env.local to run everything on OpenAI.
 * Default is "claude" (Anthropic).
 *
 * Perplexity (research_company) is always Perplexity — it's the only one that
 * does live web search, so swapping providers there makes no sense.
 */
export type AiProvider = "claude" | "openai";

export function getAiProvider(): AiProvider {
  const raw = (process.env.AI_PROVIDER ?? "claude").toLowerCase();
  return raw === "openai" ? "openai" : "claude";
}
