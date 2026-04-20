import { adminDb } from "./admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import type { ApplicationStatusType } from "@/lib/schemas/application";

export type ApplicationRecord = {
  id: string;
  userId: string;
  reportId?: string;
  company: string;
  role: string;
  jdUrl?: string;
  status: ApplicationStatusType;
  score: number;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/** Insert or update an application by company + role (idempotent). */
export async function upsertApplication(args: {
  userId: string;
  company: string;
  role: string;
  score: number;
  status: ApplicationStatusType;
  notes?: string;
  reportId?: string;
  jdUrl?: string;
}): Promise<{ id: string; created: boolean }> {
  const colRef = adminDb().collection("users").doc(args.userId).collection("applications");

  const dupes = await colRef
    .where("company", "==", args.company)
    .where("role", "==", args.role)
    .limit(1)
    .get();

  if (!dupes.empty) {
    const doc = dupes.docs[0];
    await doc.ref.set(
      {
        score: args.score,
        status: args.status,
        notes: args.notes ?? null,
        reportId: args.reportId ?? null,
        jdUrl: args.jdUrl ?? null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return { id: doc.id, created: false };
  }

  const newRef = colRef.doc();
  await newRef.set({
    id: newRef.id,
    userId: args.userId,
    company: args.company,
    role: args.role,
    jdUrl: args.jdUrl ?? null,
    status: args.status,
    score: args.score,
    notes: args.notes ?? null,
    reportId: args.reportId ?? null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { id: newRef.id, created: true };
}
