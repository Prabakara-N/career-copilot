import { describe, expect, it } from "vitest";
import { companyResearchSlug, isFresh } from "./company-research";

describe("companyResearchSlug", () => {
  it("lowercases and dashes", () => {
    expect(companyResearchSlug("Stripe, Inc.")).toBe("stripe-inc");
  });
});

describe("isFresh", () => {
  it("returns true within TTL", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(isFresh(twoDaysAgo, 30)).toBe(true);
  });
  it("returns false past TTL", () => {
    const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
    expect(isFresh(fortyDaysAgo, 30)).toBe(false);
  });
  it("returns false for invalid date", () => {
    expect(isFresh("not-a-date", 30)).toBe(false);
  });
});
