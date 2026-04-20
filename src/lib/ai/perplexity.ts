const PERPLEXITY_URL = "https://api.perplexity.ai/chat/completions";

export const PERPLEXITY_MODELS = {
  small: "sonar",
  large: "sonar-pro",
  reasoning: "sonar-reasoning",
} as const;

type PerplexityModel = (typeof PERPLEXITY_MODELS)[keyof typeof PERPLEXITY_MODELS];

type PerplexityMessage = { role: "system" | "user" | "assistant"; content: string };

type PerplexityRequest = {
  model: PerplexityModel;
  messages: PerplexityMessage[];
  temperature?: number;
  max_tokens?: number;
};

export async function perplexityChat(req: PerplexityRequest) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error("PERPLEXITY_API_KEY is not set");

  const res = await fetch(PERPLEXITY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error(`Perplexity API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}
