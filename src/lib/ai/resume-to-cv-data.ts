import type { CvPdfData } from "@/lib/cv/pdf-document";
import type { ResumeParsed } from "@/lib/schemas/resume-parsed";

/**
 * Deterministically adapt a parsed resume (ResumeParsed) into the structured
 * CvPdfData shape the scorer + renderer expect.
 *
 * Best-effort: we preserve what ResumeParsed captures directly and split the
 * markdown body by H2 sections for the narrative parts (summary, experience
 * bullets, projects, education, etc.). Missing fields become empty arrays so
 * the scorer's "missing section" findings fire correctly.
 */
export function resumeParsedToCvData(parsed: ResumeParsed): CvPdfData {
  const sections = splitMarkdownBySection(parsed.markdown ?? "");
  const summary = firstNonEmpty(sections["summary"] ?? sections["professional summary"] ?? "");
  const experience = parseExperience(sections["experience"] ?? sections["work experience"] ?? "");
  const projects = parseProjects(sections["projects"] ?? "");
  const certifications = parseCertifications(sections["certifications"] ?? sections["certificates"] ?? "");
  const education = parseEducation(sections["education"] ?? "");

  const skills = parsed.skills.length > 0
    ? [{ category: "Technical skills", items: parsed.skills.join(", ") }]
    : [];

  return {
    name: parsed.fullName || "Candidate",
    email: parsed.email || "",
    phone: parsed.phone || undefined,
    linkedinUrl: parsed.linkedinUrl || undefined,
    portfolioUrl: parsed.portfolioUrl || undefined,
    location: parsed.location || undefined,
    summary: summary || parsed.markdown.slice(0, 400),
    competencies: parsed.skills.slice(0, 8),
    experience,
    projects,
    skills,
    certifications,
    education,
  };
}

function splitMarkdownBySection(markdown: string): Record<string, string> {
  const out: Record<string, string> = {};
  const lines = markdown.split(/\r?\n/);
  let currentKey: string | null = null;
  let buffer: string[] = [];
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      if (currentKey) out[currentKey] = buffer.join("\n").trim();
      currentKey = h2[1].toLowerCase();
      buffer = [];
      continue;
    }
    buffer.push(line);
  }
  if (currentKey) out[currentKey] = buffer.join("\n").trim();
  return out;
}

function firstNonEmpty(block: string): string {
  return block.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)[0] ?? "";
}

function parseExperience(block: string): CvPdfData["experience"] {
  if (!block) return [];
  const entries = block.split(/^### /m).map((e) => e.trim()).filter(Boolean);
  const out: CvPdfData["experience"] = [];
  for (const entry of entries) {
    const lines = entry.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length === 0) continue;
    const header = lines[0];
    const [roleCompanyRaw, periodRaw] = header.split("|").map((s) => s?.trim() ?? "");
    const [role, company] = splitRoleCompany(roleCompanyRaw);
    const bullets = lines
      .slice(1)
      .filter((l) => l.trim().startsWith("-"))
      .map((l) => l.replace(/^\s*-\s*/, "").trim())
      .filter(Boolean);
    out.push({
      company: company || "",
      role: role || "",
      period: periodRaw || "",
      bullets,
    });
  }
  return out;
}

function splitRoleCompany(text: string): [string, string] {
  if (text.includes(" at ")) {
    const [role, company] = text.split(" at ", 2).map((s) => s.trim());
    return [role, company];
  }
  if (text.includes(" @ ")) {
    const [role, company] = text.split(" @ ", 2).map((s) => s.trim());
    return [role, company];
  }
  if (text.includes(" — ")) {
    const [role, company] = text.split(" — ", 2).map((s) => s.trim());
    return [role, company];
  }
  return [text, ""];
}

function parseProjects(block: string): CvPdfData["projects"] {
  if (!block) return [];
  const entries = block.split(/^### /m).map((e) => e.trim()).filter(Boolean);
  const out: CvPdfData["projects"] = [];
  for (const entry of entries) {
    const lines = entry.split(/\r?\n/);
    const title = lines[0]?.trim() ?? "";
    const description = lines
      .slice(1)
      .filter((l) => l.trim() && !l.trim().startsWith("**Tech"))
      .join(" ")
      .trim();
    const techLine = lines.find((l) => l.trim().startsWith("**Tech"));
    const tech = techLine ? techLine.replace(/\*\*Tech[^:]*:?\*\*?\s*/i, "").trim() : "";
    out.push({ title, description, tech });
  }
  return out;
}

function parseCertifications(block: string): CvPdfData["certifications"] {
  if (!block) return [];
  const lines = block.split(/\r?\n/).filter((l) => l.trim().startsWith("-"));
  return lines.map((line) => {
    const stripped = line.replace(/^\s*-\s*/, "").trim();
    const yearMatch = stripped.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[1] : "";
    const clean = stripped.replace(/\(\d{4}\)\s*$/, "").trim();
    const [title, issuer] = clean.split("—").map((s) => s?.trim() ?? "");
    return { title: title || clean, issuer: issuer || "", year };
  });
}

function parseEducation(block: string): CvPdfData["education"] {
  if (!block) return [];
  const entries = block.split(/^### /m).map((e) => e.trim()).filter(Boolean);
  return entries.map((entry) => {
    const lines = entry.split(/\r?\n/).filter((l) => l.trim());
    const header = lines[0] ?? "";
    const [title, period] = header.split("|").map((s) => s?.trim() ?? "");
    const rest = lines.slice(1).join(" ").trim();
    return { title: title || header, org: rest, period: period || "" };
  });
}
