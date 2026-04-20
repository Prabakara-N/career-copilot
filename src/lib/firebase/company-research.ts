import { adminDb } from "./admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { CompanyResearch } from "@/lib/schemas/company-research";
import { optionalIntEnv } from "@/lib/env";
import { slugify } from "@/lib/slug";

const COLLECTION = "companyResearch";

export type CompanyResearchRecord = CompanyResearch & {
  _cachedAt: Timestamp;
};

export function companyResearchSlug(name: string): string {
  return slugify(name);
}

export function defaultTtlDays(): number {
  return optionalIntEnv("COMPANY_RESEARCH_TTL_DAYS", 30);
}

export function isFresh(fetchedAt: string, ttlDays: number): boolean {
  const fetched = new Date(fetchedAt).getTime();
  if (!Number.isFinite(fetched)) return false;
  const ageMs = Date.now() - fetched;
  return ageMs <= ttlDays * 24 * 60 * 60 * 1000;
}

export async function getCachedResearch(slug: string): Promise<CompanyResearchRecord | null> {
  const snap = await adminDb().collection(COLLECTION).doc(slug).get();
  if (!snap.exists) return null;
  return snap.data() as CompanyResearchRecord;
}

export async function upsertCachedResearch(slug: string, data: CompanyResearch): Promise<void> {
  await adminDb()
    .collection(COLLECTION)
    .doc(slug)
    .set({ ...data, _cachedAt: FieldValue.serverTimestamp() }, { merge: false });
}
