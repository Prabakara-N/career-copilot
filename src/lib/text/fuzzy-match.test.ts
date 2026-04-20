import { describe, expect, it } from "vitest";
import { coverageRatio, fuzzyMatchMany } from "./fuzzy-match";

describe("fuzzyMatchMany", () => {
  it("matches exact strings", () => {
    const results = fuzzyMatchMany(["react"], ["react", "next.js", "typescript"]);
    expect(results[0].matched).toBe(true);
    expect(results[0].bestMatch).toBe("react");
    expect(results[0].score).toBe(1);
  });

  it("matches close variants", () => {
    const results = fuzzyMatchMany(["reactjs"], ["react.js"]);
    expect(results[0].matched).toBe(true);
  });

  it("returns no match for unrelated queries", () => {
    const results = fuzzyMatchMany(["golang"], ["react", "typescript"]);
    expect(results[0].matched).toBe(false);
    expect(results[0].score).toBeLessThan(0.72);
  });

  it("returns one result per query", () => {
    const results = fuzzyMatchMany(["a", "b", "c"], ["a", "b"]);
    expect(results).toHaveLength(3);
  });
});

describe("coverageRatio", () => {
  it("returns the fraction matched", () => {
    const results = fuzzyMatchMany(
      ["react", "next.js", "golang"],
      ["react", "next.js", "typescript"]
    );
    expect(coverageRatio(results)).toBeCloseTo(2 / 3, 5);
  });

  it("returns 0 for empty", () => {
    expect(coverageRatio([])).toBe(0);
  });
});
