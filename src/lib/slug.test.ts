import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and dashes", () => {
    expect(slugify("Google LLC")).toBe("google-llc");
  });

  it("strips accents", () => {
    expect(slugify("Café Étoile")).toBe("cafe-etoile");
  });

  it("collapses multiple separators", () => {
    expect(slugify("  Foo & Bar !! ")).toBe("foo-bar");
  });

  it("handles empty input", () => {
    expect(slugify("")).toBe("");
  });
});
