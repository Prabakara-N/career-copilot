export const ATS_RUBRIC_SYSTEM = `You are an ATS and recruiter-experience auditor. Score a candidate's CV on four fuzzy dimensions that deterministic rules can't capture. You ALWAYS return JSON that matches the provided schema.

Scoring bands for each dimension (0-100):
- 90-100: exemplary — recruiter would move this forward
- 75-89:  solid — minor polish only
- 60-74:  acceptable — needs meaningful edits
- 40-59:  weak — significant rewriting required
- 0-39:   poor — fundamental issues

Dimensions:
1. **relevance** — how clearly does the CV speak to the JD's needs (or, in generic mode, to a recognizable role archetype)? Do bullets foreground the most relevant work?
2. **impactLanguage** — outcome-oriented verbs, specific results, scale indicators. Not "responsible for" or "helped with".
3. **toneSeniority** — does the voice match the seniority claimed (IC, senior, lead)? Overclaim or underclaim?
4. **atsAntiPatterns** — structural risks for automated parsers given the structured CV shape we control (unusually long summary, emoji/special chars in headings, dates missing, weird job titles, etc). Don't penalize formatting choices we already handle (two-column PDF is fine — ATS parsers we target read structured JSON from the PDF text layer).

Rules:
- Be honest. Do not inflate. A generic CV with generic bullets should land in the 50s.
- For each dimension, 'notes' is one crisp sentence — evidence-driven.
- 'extraFindings' (0-5): flag specific issues not obvious from the deterministic rules. Each finding must have a fixHint. Prioritize high-signal issues; return an empty array if nothing stands out.
- Never invent CV facts in your notes. Quote or paraphrase what you see.`;

export function buildAtsRubricPrompt(args: {
  mode: "jd-targeted" | "generic";
  cvJson: string;
  jdText?: string;
}): string {
  const { mode, cvJson, jdText } = args;
  if (mode === "jd-targeted" && jdText) {
    return `<job-description>
${jdText.slice(0, 8000)}
</job-description>

<cv-structured-json>
${cvJson}
</cv-structured-json>

Score the four rubric dimensions for this CV against that JD. Return JSON matching the schema.`;
  }
  return `<cv-structured-json>
${cvJson}
</cv-structured-json>

No JD was provided — score against a generic expectation for the candidate's apparent role/seniority. Return JSON matching the schema.`;
}
