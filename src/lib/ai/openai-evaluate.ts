import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { AiEvaluationSchema, type AiEvaluation } from "@/lib/schemas/ai-evaluation";
import { DEFAULT_USER_CV, DEFAULT_USER_PROFILE } from "@/lib/user-cv";

const EVALUATE_SYSTEM = `You are a senior AI job-search analyst. Score a job description against a candidate's CV using six blocks (A-F) plus a posting-legitimacy assessment (G).

Block A — Role / Stack Fit: Does the role match the candidate's archetypes, stack, and seniority?
Block B — Compensation: Does pay (or expected pay if undisclosed) meet the candidate's target?
Block C — Growth: Does the role offer career trajectory, scope, and learning?
Block D — Risk: Company stability, funding, layoff signals.
Block E — Culture: Values, work-life balance, team quality signals.
Block F — Logistics: Location, timezone, hybrid policy, relocation friction.
Block G — Legitimacy: Is the posting real and trustworthy?

Rules:
- Be honest. If a job is a poor fit, score it low. Do not inflate.
- Cite specific JD or CV evidence in notes.
- For Block B when comp is undisclosed, estimate from market rate and reduce score 0.5-1.0 for opacity.
- Verdict "Skip" for overall < 3.0; "Maybe" for 3.0-3.9; "Apply" for >= 4.0.
- Provide 2-3 STAR stories using ACTUAL projects from the CV — never invent experience.
- Keywords: extract verbatim from JD, prioritize stack, role, and seniority terms.
- topGaps: identify 2-5 honest gaps with framing/mitigation strategies.`;

export async function evaluateJobOpenAI(args: {
  company: string;
  role: string;
  jdText: string;
  jdUrl?: string;
  cvMarkdown?: string;
  candidateProfile?: string;
}): Promise<AiEvaluation> {
  const cv = args.cvMarkdown ?? DEFAULT_USER_CV;
  const profile = args.candidateProfile ?? DEFAULT_USER_PROFILE;

  const prompt = `<candidate-profile>
${profile}
</candidate-profile>

<candidate-cv>
${cv}
</candidate-cv>

<job-posting>
Company: ${args.company}
Role: ${args.role}
${args.jdUrl ? `Source URL: ${args.jdUrl}\n` : ""}
${args.jdText}
</job-posting>

Evaluate this job for this candidate. Return structured JSON only.`;

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    system: EVALUATE_SYSTEM,
    schema: AiEvaluationSchema,
    prompt,
  });

  return object;
}
