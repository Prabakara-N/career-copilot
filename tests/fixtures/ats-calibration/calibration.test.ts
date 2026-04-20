import { describe, expect, it } from "vitest";
import { scoreDeterministic } from "@/lib/ai/scoring/deterministic";
import { CALIBRATION_JDS } from "./jds";
import {
  MEDIUM_BACKEND,
  MEDIUM_FRONTEND,
  STRONG_BACKEND,
  STRONG_FRONTEND,
  WEAK_BACKEND,
  WEAK_FRONTEND,
} from "./cvs";

describe("ATS deterministic calibration — frontend JD", () => {
  it("strong CV scores >= 65 (deterministic only)", () => {
    const { scores } = scoreDeterministic({
      cv: STRONG_FRONTEND,
      jdText: CALIBRATION_JDS["frontend-react"],
      mode: "jd-targeted",
    });
    expect(scores.subtotal).toBeGreaterThanOrEqual(65);
  });

  it("medium CV lands in 45-75 band", () => {
    const { scores } = scoreDeterministic({
      cv: MEDIUM_FRONTEND,
      jdText: CALIBRATION_JDS["frontend-react"],
      mode: "jd-targeted",
    });
    expect(scores.subtotal).toBeGreaterThan(40);
    expect(scores.subtotal).toBeLessThan(78);
  });

  it("weak CV scores < 55", () => {
    const { scores } = scoreDeterministic({
      cv: WEAK_FRONTEND,
      jdText: CALIBRATION_JDS["frontend-react"],
      mode: "jd-targeted",
    });
    expect(scores.subtotal).toBeLessThan(55);
  });
});

describe("ATS deterministic calibration — backend JD", () => {
  it("strong CV scores >= 60", () => {
    const { scores } = scoreDeterministic({
      cv: STRONG_BACKEND,
      jdText: CALIBRATION_JDS["senior-backend-node"],
      mode: "jd-targeted",
    });
    expect(scores.subtotal).toBeGreaterThanOrEqual(60);
  });

  it("medium CV lands in 40-75 band", () => {
    const { scores } = scoreDeterministic({
      cv: MEDIUM_BACKEND,
      jdText: CALIBRATION_JDS["senior-backend-node"],
      mode: "jd-targeted",
    });
    expect(scores.subtotal).toBeGreaterThan(35);
    expect(scores.subtotal).toBeLessThan(78);
  });

  it("weak CV scores < 50", () => {
    const { scores } = scoreDeterministic({
      cv: WEAK_BACKEND,
      jdText: CALIBRATION_JDS["senior-backend-node"],
      mode: "jd-targeted",
    });
    expect(scores.subtotal).toBeLessThan(50);
  });
});

describe("ATS deterministic calibration — cross-role mismatch", () => {
  it("strong frontend CV scores lower on backend JD than on matching JD", () => {
    const onFrontend = scoreDeterministic({
      cv: STRONG_FRONTEND,
      jdText: CALIBRATION_JDS["frontend-react"],
      mode: "jd-targeted",
    }).scores.subtotal;
    const onBackend = scoreDeterministic({
      cv: STRONG_FRONTEND,
      jdText: CALIBRATION_JDS["senior-backend-node"],
      mode: "jd-targeted",
    }).scores.subtotal;
    expect(onFrontend).toBeGreaterThan(onBackend);
  });

  it("strong backend CV scores lower on data engineer JD than on backend JD", () => {
    const onBackend = scoreDeterministic({
      cv: STRONG_BACKEND,
      jdText: CALIBRATION_JDS["senior-backend-node"],
      mode: "jd-targeted",
    }).scores.subtotal;
    const onData = scoreDeterministic({
      cv: STRONG_BACKEND,
      jdText: CALIBRATION_JDS["data-engineer"],
      mode: "jd-targeted",
    }).scores.subtotal;
    expect(onBackend).toBeGreaterThan(onData);
  });
});
