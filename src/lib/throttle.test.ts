import { afterEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimit } from "./throttle";

describe("checkRateLimit", () => {
  afterEach(() => {
    resetRateLimit("test-key");
  });

  it("allows calls under the limit", () => {
    expect(checkRateLimit("test-key", 3, 60_000).ok).toBe(true);
    expect(checkRateLimit("test-key", 3, 60_000).ok).toBe(true);
    expect(checkRateLimit("test-key", 3, 60_000).ok).toBe(true);
  });

  it("blocks at the limit with retry hint", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("test-key", 3, 60_000);
    const result = checkRateLimit("test-key", 3, 60_000);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.retryAfterSec).toBeGreaterThan(0);
  });

  it("isolates across keys", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("test-key", 3, 60_000);
    expect(checkRateLimit("other-key", 3, 60_000).ok).toBe(true);
    resetRateLimit("other-key");
  });
});
