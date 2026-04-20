import { tool } from "ai";
import { z } from "zod";
import { evaluateJob } from "./evaluate";
import { evaluateJobOpenAI } from "./openai-evaluate";
import { fetchJobDescription } from "./fetch-jd";
import { researchCompany } from "./research-company";
import { tailorCvForJd } from "./tailor-cv";
import { tailorCvForJdOpenAI } from "./openai-tailor-cv";
import { generateCoverLetter } from "./cover-letter";
import { generateCoverLetterOpenAI } from "./openai-cover-letter";
import { attachAtsScoreToLatestReport, saveReport } from "@/lib/firebase/reports";
import { upsertApplication } from "@/lib/firebase/applications";
import { getAiProvider } from "./provider";

type ToolBuildArgs = { uid: string | null };

/**
 * Build the Career-Ops tool set, scoped to the current user (or anonymous).
 * Tools that need persistence read/write through Firebase Admin if uid is present;
 * otherwise they run in stub mode and tell the user to sign in.
 */
export function buildCareerOpsTools({ uid }: ToolBuildArgs) {
  const fetchJdTool = tool({
    description:
      "Fetch a job description from a URL. Use this whenever the user shares a job posting URL. Returns the company, role, location, source, and the JD text — pass these to evaluate_job next.",
    inputSchema: z.object({
      url: z.string().url().describe("The job posting URL"),
    }),
    execute: async ({ url }) => {
      try {
        const jd = await fetchJobDescription(url);
        return {
          ok: true as const,
          url: jd.url,
          source: jd.source,
          title: jd.title ?? "",
          company: jd.company ?? "",
          location: jd.location ?? "",
          jdText: jd.jdText.slice(0, 12_000),
        };
      } catch (err) {
        return {
          ok: false as const,
          error: err instanceof Error ? err.message : "Unknown fetch error",
          hint: "URL may be behind a login wall or bot-blocked. Ask the user to paste the JD text.",
        };
      }
    },
  });

  const evaluateJobTool = tool({
    description:
      "Evaluate a job description against the user's CV. Returns scored blocks A-G, an overall 0-5 score, a verdict (Apply/Maybe/Skip), top gaps with mitigations, ATS keywords, and 2-3 STAR stories. Use whenever the user has JD text. If the user is signed in, the report is auto-persisted and a reportId is returned — share it so they can revisit at /reports/{reportId}.",
    inputSchema: z.object({
      company: z.string(),
      role: z.string(),
      jdText: z.string(),
      jdUrl: z.string().url().optional(),
    }),
    execute: async ({ company, role, jdText, jdUrl }) => {
      try {
        const evaluation =
          getAiProvider() === "openai"
            ? await evaluateJobOpenAI({ company, role, jdText, jdUrl })
            : await evaluateJob({ company, role, jdText, jdUrl });
        let reportId: string | null = null;
        if (uid) {
          try {
            reportId = await saveReport({
              userId: uid,
              company,
              role,
              jdText,
              jdUrl,
              evaluation,
            });
          } catch (persistErr) {
            console.warn("saveReport failed:", persistErr);
          }
        }
        return {
          ok: true as const,
          company,
          role,
          reportId,
          reportUrl: reportId ? `/reports/${reportId}` : null,
          ...evaluation,
        };
      } catch (err) {
        return {
          ok: false as const,
          error: err instanceof Error ? err.message : "Unknown error during evaluation",
        };
      }
    },
  });

  const researchCompanyTool = tool({
    description:
      "Get structured intel on a company — overview, funding, leadership, headcount, departments, open roles, office locations, and review-platform signal (Glassdoor / AmbitionBox / Blind / Comparably). Runs four parallel Perplexity queries and caches the result shared across users for 30 days. Returns a page URL the user can visit for the full UI. Use when the user asks about a company or before committing to apply.",
    inputSchema: z.object({
      company: z.string().describe("Company name"),
    }),
    execute: async ({ company }) => {
      try {
        const result = await researchCompany(company);
        return { ok: true as const, ...result };
      } catch (err) {
        return {
          ok: false as const,
          error: err instanceof Error ? err.message : "Unknown research error",
        };
      }
    },
    toModelOutput: ({ output }) => {
      if (!output.ok) {
        return { type: "content", value: [{ type: "text", text: JSON.stringify(output) }] };
      }
      const s = output.structured;
      const compact = {
        ok: true,
        company: output.company,
        pageUrl: output.pageUrl,
        source: output.source,
        oneLiner: s.overview.oneLiner,
        industry: s.overview.industry,
        stage: s.overview.stage,
        headcountBand: s.people.headcountBand,
        hq: s.locations.hq,
        officesCount: s.locations.offices.length,
        openRolesCount: s.people.openRoles.length,
        topPros: [
          ...(s.reviews.glassdoor?.pros ?? []),
          ...(s.reviews.ambitionBox?.pros ?? []),
        ].slice(0, 3),
        topCons: [
          ...(s.reviews.glassdoor?.cons ?? []),
          ...(s.reviews.ambitionBox?.cons ?? []),
        ].slice(0, 3),
        reviewSummary: s.reviews.summary,
        citationsCount: output.citations.length,
        _note: `Full structured data + tabs UI at ${output.pageUrl}`,
      };
      return { type: "content", value: [{ type: "text", text: JSON.stringify(compact) }] };
    },
  });

  const tailorCvTool = tool({
    description:
      "Generate a tailored CV PDF specifically for this JD — refines summary, competencies, and bullets to match the JD without inventing experience. Returns a base64 PDF the user can download. Use after evaluation when the verdict is Apply or Maybe and the user wants to apply.",
    inputSchema: z.object({
      company: z.string(),
      role: z.string(),
      jdText: z.string().describe("The full JD text — same one used for evaluation"),
    }),
    execute: async ({ company, role, jdText }) => {
      try {
        const pdf =
          getAiProvider() === "openai"
            ? await tailorCvForJdOpenAI({ company, role, jdText })
            : await tailorCvForJd({ company, role, jdText });

        if (uid) {
          try {
            await attachAtsScoreToLatestReport({
              userId: uid,
              company,
              role,
              atsScore: pdf.atsScore,
              tailoredCvFilename: pdf.filename,
            });
          } catch (persistErr) {
            console.warn("attachAtsScoreToLatestReport failed:", persistErr);
          }
        }

        return {
          ok: true as const,
          filename: pdf.filename,
          base64: pdf.base64,
          byteLength: pdf.byteLength,
          mimeType: "application/pdf",
          atsScore: pdf.atsScore,
          message: `Tailored CV ready: ${pdf.filename} (${(pdf.byteLength / 1024).toFixed(1)} KB). ATS score: ${pdf.atsScore.overallScore}/100 (grade ${pdf.atsScore.grade}). Download button is rendered in the UI — DO NOT echo the base64 in your response.`,
        };
      } catch (err) {
        return {
          ok: false as const,
          error: err instanceof Error ? err.message : "Unknown CV generation error",
        };
      }
    },
    toModelOutput: ({ output }) => {
      if (!output.ok) {
        return { type: "content", value: [{ type: "text", text: JSON.stringify(output) }] };
      }
      const topFindings = output.atsScore.findings
        .filter((f) => f.severity !== "suggestion")
        .slice(0, 3)
        .map((f) => `[${f.severity}] ${f.message}`);
      const stripped = {
        ok: true,
        filename: output.filename,
        byteLength: output.byteLength,
        mimeType: output.mimeType,
        message: output.message,
        atsScore: {
          overallScore: output.atsScore.overallScore,
          grade: output.atsScore.grade,
          mode: output.atsScore.mode,
          topFindings,
        },
        _note: "base64 omitted from model context — UI has the download button",
      };
      return { type: "content", value: [{ type: "text", text: JSON.stringify(stripped) }] };
    },
  });

  const generateCoverLetterTool = tool({
    description:
      "Generate a tailored cover letter PDF for this JD — short, specific, no clichés. Returns a base64 PDF the user can preview/download. Use after evaluation when the user asks for a cover letter.",
    inputSchema: z.object({
      company: z.string(),
      role: z.string(),
      jdText: z.string().describe("The full JD text — same one used for evaluation"),
    }),
    execute: async ({ company, role, jdText }) => {
      try {
        const pdf =
          getAiProvider() === "openai"
            ? await generateCoverLetterOpenAI({ company, role, jdText })
            : await generateCoverLetter({ company, role, jdText });
        return {
          ok: true as const,
          filename: pdf.filename,
          base64: pdf.base64,
          byteLength: pdf.byteLength,
          mimeType: "application/pdf",
          message: `Cover letter ready: ${pdf.filename} (${(pdf.byteLength / 1024).toFixed(1)} KB). Preview/Download buttons are rendered in the UI — DO NOT echo the base64.`,
        };
      } catch (err) {
        return {
          ok: false as const,
          error: err instanceof Error ? err.message : "Cover letter generation failed",
        };
      }
    },
    toModelOutput: ({ output }) => {
      if (!output.ok) {
        return { type: "content", value: [{ type: "text", text: JSON.stringify(output) }] };
      }
      const stripped = {
        ok: true,
        filename: output.filename,
        byteLength: output.byteLength,
        mimeType: output.mimeType,
        message: output.message,
      };
      return { type: "content", value: [{ type: "text", text: JSON.stringify(stripped) }] };
    },
  });

  const saveToTrackerTool = tool({
    description:
      "Save an evaluated job to the user's applications tracker. Use after evaluating a job and the user wants to keep it. Idempotent — re-saves to the same row if (company, role) already exists.",
    inputSchema: z.object({
      company: z.string(),
      role: z.string(),
      score: z.number().describe("Overall score from 0 to 5"),
      status: z
        .enum(["Evaluated", "Applied", "SKIP", "Discarded"])
        .default("Evaluated"),
      notes: z.string().optional(),
      reportId: z.string().optional().describe("ID of the related report (returned by evaluate_job)"),
      jdUrl: z.string().url().optional(),
    }),
    execute: async ({ company, role, score, status, notes, reportId, jdUrl }) => {
      if (!uid) {
        return {
          ok: false as const,
          stub: true,
          message:
            "Not signed in. Ask the user to sign in via /login to enable persistent tracker.",
        };
      }
      try {
        const result = await upsertApplication({
          userId: uid,
          company,
          role,
          score,
          status,
          notes,
          reportId,
          jdUrl,
        });
        return {
          ok: true as const,
          applicationId: result.id,
          created: result.created,
          message: result.created
            ? `Added to tracker as #${result.id.slice(0, 6)}`
            : `Updated existing tracker entry`,
        };
      } catch (err) {
        return {
          ok: false as const,
          error: err instanceof Error ? err.message : "Tracker write failed",
        };
      }
    },
  });

  return {
    fetch_jd: fetchJdTool,
    evaluate_job: evaluateJobTool,
    research_company: researchCompanyTool,
    tailor_cv: tailorCvTool,
    generate_cover_letter: generateCoverLetterTool,
    save_to_tracker: saveToTrackerTool,
  };
}

export type CareerOpsTools = ReturnType<typeof buildCareerOpsTools>;
export type CareerOpsToolName = keyof CareerOpsTools;
