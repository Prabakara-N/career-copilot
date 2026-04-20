"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "./client";
import type { AtsRunSummary } from "@/lib/schemas/ats-run";
import type { AtsMode } from "@/lib/schemas/ats-score";

type AtsRunDoc = {
  id: string;
  mode: AtsMode;
  input: { resumeSource: "profile" | "upload"; jdSnippet: string };
  initialScore: { overallScore: number };
  fix: { score: { overallScore: number } } | null;
  createdAt: Timestamp | null;
};

export function useAtsRuns(uid: string | null | undefined) {
  const [rows, setRows] = useState<AtsRunSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db(), "users", uid, "atsRuns"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const mapped: AtsRunSummary[] = snap.docs.map((d) => {
          const data = d.data() as AtsRunDoc;
          return {
            id: d.id,
            mode: data.mode,
            resumeSource: data.input.resumeSource,
            jdSnippet: data.input.jdSnippet,
            initialScoreValue: data.initialScore.overallScore,
            fixedScoreValue: data.fix?.score.overallScore ?? null,
            createdAt: data.createdAt?.toDate().toISOString() ?? null,
          };
        });
        setRows(mapped);
        setLoading(false);
      },
      (err) => {
        console.warn("useAtsRuns subscribe failed:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [uid]);

  return { rows, loading };
}
