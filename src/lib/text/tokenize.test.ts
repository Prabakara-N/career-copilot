import { describe, expect, it } from "vitest";
import { extractKeyPhrases, ngrams, tokenize } from "./tokenize";

describe("tokenize", () => {
  it("lowercases and strips punctuation", () => {
    expect(tokenize("React, Next.js; TypeScript!")).toEqual([
      "react",
      "next",
      "js",
      "typescript",
    ]);
  });

  it("drops stopwords by default", () => {
    expect(tokenize("the quick brown fox")).toEqual(["quick", "brown", "fox"]);
  });

  it("keeps stopwords when requested", () => {
    expect(tokenize("the quick fox", { dropStopwords: false })).toEqual([
      "the",
      "quick",
      "fox",
    ]);
  });

  it("drops bare numbers by default", () => {
    expect(tokenize("scale 10x with 2.5 years")).toEqual(["scale", "10x", "years"]);
  });

  it("honours minLength", () => {
    expect(tokenize("a go to hire", { minLength: 3 })).toEqual(["hire"]);
  });
});

describe("ngrams", () => {
  it("returns adjacent tuples", () => {
    expect(ngrams(["a", "b", "c", "d"], 2)).toEqual(["a b", "b c", "c d"]);
  });

  it("returns empty when too short", () => {
    expect(ngrams(["a"], 2)).toEqual([]);
  });
});

describe("extractKeyPhrases", () => {
  it("returns unigrams, bigrams, and trigrams", () => {
    const phrases = extractKeyPhrases(
      "React developer needed. Next.js experience required. React and Next.js are essential."
    );
    expect(phrases).toContain("react");
    expect(phrases).toContain("next");
    expect(phrases.length).toBeGreaterThan(3);
  });

  it("caps results at maxPhrases", () => {
    const text = "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda";
    expect(extractKeyPhrases(text, 3).length).toBeLessThanOrEqual(3);
  });
});
