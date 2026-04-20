"use client";

import { doc, getDoc, serverTimestamp, setDoc, type Timestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./client";

export type WorkMode = "remote" | "hybrid" | "onsite";
export type JobType = "full-time" | "part-time" | "contract" | "internship";

export type UserDoc = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providers: string[];
  createdAt: Timestamp | null;
  lastLoginAt: Timestamp | null;
  // Profile fields
  fullName?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  targetRoles?: string[];
  yearsExperience?: number;
  cvMarkdown?: string;
  // Extended job-search preferences
  skills?: string[];
  targetSalary?: string; // free-form e.g. "₹15-25 LPA" or "$120k-150k"
  workModes?: WorkMode[];
  jobTypes?: JobType[];
  openToRelocation?: boolean;
  noticePeriod?: string; // e.g., "30 days", "Immediate"
};

export async function ensureUserDoc(user: User): Promise<void> {
  const ref = doc(db(), "users", user.uid);
  const snap = await getDoc(ref);

  const baseFields = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    providers: user.providerData.map((p) => p.providerId),
    lastLoginAt: serverTimestamp(),
  };

  if (!snap.exists()) {
    await setDoc(ref, {
      ...baseFields,
      createdAt: serverTimestamp(),
      fullName: user.displayName ?? "",
      targetRoles: [],
      skills: [],
      workModes: [],
      jobTypes: [],
    });
    return;
  }
  await setDoc(ref, baseFields, { merge: true });
}
