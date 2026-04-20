type EnvKey =
  | "ANTHROPIC_API_KEY"
  | "OPENAI_API_KEY"
  | "PERPLEXITY_API_KEY"
  | "COMPANY_RESEARCH_TTL_DAYS";

/**
 * Read an env var, throwing if required and missing.
 * Use at module boundaries (inside a request handler or lazy init), not at
 * top-level — top-level throws break Next.js build-time type generation.
 */
export function requireEnv(key: EnvKey): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export function optionalEnv(key: EnvKey, fallback: string): string {
  return process.env[key] ?? fallback;
}

export function optionalIntEnv(key: EnvKey, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
