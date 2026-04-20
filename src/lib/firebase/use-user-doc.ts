"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./client";
import type { UserDoc } from "./users";
import { stripUndefined } from "./utils";

export function useUserDoc(uid: string | null | undefined) {
  const [data, setData] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ref = doc(db(), "users", uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setData(snap.exists() ? ({ ...snap.data(), uid } as UserDoc) : null);
        setLoading(false);
      },
      (err) => {
        console.warn("useUserDoc subscribe failed:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [uid]);

  return { data, loading };
}

export async function updateUserDoc(uid: string, patch: Partial<UserDoc>): Promise<void> {
  await setDoc(
    doc(db(), "users", uid),
    { ...stripUndefined(patch as Record<string, unknown>), updatedAt: serverTimestamp() },
    { merge: true }
  );
}
