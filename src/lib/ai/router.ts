export type AiTask =
  | "evaluate-jd"
  | "tailor-cv"
  | "deep-research"
  | "batch-triage"
  | "parse-screenshot"
  | "quick-summary";

export type AiProvider = "claude" | "openai" | "gemini" | "perplexity";

export type AiRoute = {
  provider: AiProvider;
  model: string;
  reason: string;
};

import { MODELS } from "./claude";
import { OPENAI_MODELS } from "./openai";
import { GEMINI_MODELS } from "./gemini";
import { PERPLEXITY_MODELS } from "./perplexity";

export function routeAiTask(task: AiTask): AiRoute {
  switch (task) {
    case "evaluate-jd":
      return { provider: "claude", model: MODELS.sonnet, reason: "Best at structured evaluation + tool use" };
    case "tailor-cv":
      return { provider: "claude", model: MODELS.opus, reason: "Quality of writing matters most here" };
    case "deep-research":
      return { provider: "perplexity", model: PERPLEXITY_MODELS.large, reason: "Built-in real-time web search" };
    case "batch-triage":
      return { provider: "gemini", model: GEMINI_MODELS.flash, reason: "Cheap and fast for high volume" };
    case "parse-screenshot":
      return { provider: "openai", model: OPENAI_MODELS.vision, reason: "Strong vision + structured output" };
    case "quick-summary":
      return { provider: "claude", model: MODELS.haiku, reason: "Fast and cheap for short summaries" };
  }
}
