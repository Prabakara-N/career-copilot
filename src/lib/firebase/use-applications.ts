"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, deleteDoc, updateDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "./client";
import type { ApplicationStatusType } from "@/lib/schemas/application";

export type AppRow = {
  id: string;
  company: string;
  role: string;
  jdUrl: string | null;
  status: ApplicationStatusType;
  score: number;
  notes: string | null;
  reportId: string | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export function useApplications(uid: string | null | undefined) {
  const [rows, setRows] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db(), "users", uid, "applications"),
      orderBy("updatedAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRows(snap.docs.map((d) => ({ ...(d.data() as AppRow), id: d.id })));
        setLoading(false);
      },
      (err) => {
        console.warn("useApplications subscribe failed:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [uid]);

  return { rows, loading };
}

export async function updateApplicationStatus(
  uid: string,
  appId: string,
  status: ApplicationStatusType,
  notes?: string
): Promise<void> {
  await updateDoc(doc(db(), "users", uid, "applications", appId), {
    status,
    ...(notes !== undefined ? { notes } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteApplication(uid: string, appId: string): Promise<void> {
  await deleteDoc(doc(db(), "users", uid, "applications", appId));
}
