import { adminDb } from "./admin";
import type { AiEvaluation } from "@/lib/schemas/ai-evaluation";
import type { AtsScore } from "@/lib/schemas/ats-score";
import { Timestamp } from "firebase-admin/firestore";

export type ReportRecord = AiEvaluation & {
  id: string;
  userId: string;
  company: string;
  role: string;
  jdUrl?: string;
  jdText: string;
  source?: "greenhouse" | "lever" | "ashby" | "html" | "pasted";
  createdAt: Timestamp;
  atsScore?: AtsScore;
  tailoredCvFilename?: string;
};

/** Save an evaluation report. Returns the new doc id. */
export async function saveReport(args: {
  userId: string;
  company: string;
  role: string;
  jdText: string;
  jdUrl?: string;
  source?: ReportRecord["source"];
  evaluation: AiEvaluation;
}): Promise<string> {
  const ref = adminDb().collection("users").doc(args.userId).collection("reports").doc();
  const now = Timestamp.now();
  await ref.set({
    id: ref.id,
    userId: args.userId,
    company: args.company,
    role: args.role,
    jdUrl: args.jdUrl ?? null,
    jdText: args.jdText,
    source: args.source ?? "pasted",
    ...args.evaluation,
    createdAt: now,
  });
  return ref.id;
}

/**
 * Attach an ATS score + tailored CV filename to the most recent report matching
 * (company, role) for this user. No-op if no matching report exists.
 */
export async function attachAtsScoreToLatestReport(args: {
  userId: string;
  company: string;
  role: string;
  atsScore: AtsScore;
  tailoredCvFilename?: string;
}): Promise<string | null> {
  const snapshot = await adminDb()
    .collection("users")
    .doc(args.userId)
    .collection("reports")
    .where("company", "==", args.company)
    .where("role", "==", args.role)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const docRef = snapshot.docs[0].ref;
  await docRef.update({
    atsScore: args.atsScore,
    ...(args.tailoredCvFilename ? { tailoredCvFilename: args.tailoredCvFilename } : {}),
  });
  return docRef.id;
}
