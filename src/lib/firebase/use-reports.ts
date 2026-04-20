"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./client";
import type { AiEvaluation } from "@/lib/schemas/ai-evaluation";
import type { AtsScore } from "@/lib/schemas/ats-score";

export type ReportRow = AiEvaluation & {
  id: string;
  company: string;
  role: string;
  jdUrl: string | null;
  jdText: string;
  source: string;
  createdAt: Timestamp | null;
  atsScore?: AtsScore;
  tailoredCvFilename?: string;
};

export function useReports(uid: string | null | undefined) {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db(), "users", uid, "reports"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRows(snap.docs.map((d) => ({ ...(d.data() as ReportRow), id: d.id })));
        setLoading(false);
      },
      (err) => {
        console.warn("useReports subscribe failed:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [uid]);

  return { rows, loading };
}

export function useReport(uid: string | null | undefined, reportId: string | null) {
  const [data, setData] = useState<ReportRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !reportId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const ref = doc(db(), "users", uid, "reports", reportId);
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) {
          setData({ ...(snap.data() as ReportRow), id: snap.id });
        } else {
          setError("Report not found");
          setData(null);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Load failed");
      })
      .finally(() => setLoading(false));
  }, [uid, reportId]);

  return { data, loading, error };
}

export async function deleteReport(uid: string, reportId: string): Promise<void> {
  await deleteDoc(doc(db(), "users", uid, "reports", reportId));
}
