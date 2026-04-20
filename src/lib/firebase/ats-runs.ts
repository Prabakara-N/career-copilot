import { adminDb } from "./admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { AtsRun, AtsRunSummary } from "@/lib/schemas/ats-run";
import type { AtsScore } from "@/lib/schemas/ats-score";
import type { CvPdfData } from "@/lib/cv/pdf-document";

export type AtsRunRecord = Omit<AtsRun, "createdAt" | "updatedAt"> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export async function saveAtsRun(args: {
  userId: string;
  mode: AtsRun["mode"];
  resumeSource: AtsRun["input"]["resumeSource"];
  cvData: CvPdfData;
  jdText: string | null;
  initialScore: AtsScore;
}): Promise<string> {
  const ref = adminDb().collection("users").doc(args.userId).collection("atsRuns").doc();
  const jdSnippet = (args.jdText ?? "").slice(0, 200);
  await ref.set({
    id: ref.id,
    userId: args.userId,
    mode: args.mode,
    input: {
      resumeSource: args.resumeSource,
      cvData: args.cvData,
      jdText: args.jdText,
      jdSnippet,
    },
    initialScore: args.initialScore,
    fix: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function attachFixToRun(args: {
  userId: string;
  runId: string;
  cvData: CvPdfData;
  diffSummary: string[];
  score: AtsScore;
}): Promise<void> {
  const ref = adminDb()
    .collection("users")
    .doc(args.userId)
    .collection("atsRuns")
    .doc(args.runId);
  await ref.set(
    {
      fix: {
        appliedAt: new Date().toISOString(),
        cvData: args.cvData,
        diffSummary: args.diffSummary,
        score: args.score,
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getAtsRun(userId: string, runId: string): Promise<AtsRunRecord | null> {
  const snap = await adminDb()
    .collection("users")
    .doc(userId)
    .collection("atsRuns")
    .doc(runId)
    .get();
  if (!snap.exists) return null;
  return snap.data() as AtsRunRecord;
}

export async function listAtsRuns(userId: string): Promise<AtsRunSummary[]> {
  const snap = await adminDb()
    .collection("users")
    .doc(userId)
    .collection("atsRuns")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  return snap.docs.map((d) => {
    const data = d.data() as AtsRunRecord;
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null;
    return {
      id: d.id,
      mode: data.mode,
      resumeSource: data.input.resumeSource,
      jdSnippet: data.input.jdSnippet,
      initialScoreValue: data.initialScore.overallScore,
      fixedScoreValue: data.fix?.score.overallScore ?? null,
      createdAt,
    };
  });
}

export async function deleteAtsRun(userId: string, runId: string): Promise<void> {
  await adminDb()
    .collection("users")
    .doc(userId)
    .collection("atsRuns")
    .doc(runId)
    .delete();
}
