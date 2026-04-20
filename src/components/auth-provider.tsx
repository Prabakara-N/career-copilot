"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { ensureUserDoc } from "@/lib/firebase/users";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth(), (u) => {
      setUser(u);
      setLoading(false);
      // Auto-provision Firestore user doc on sign-in. Failures are non-blocking
      // (user can still chat — tracker writes will fail loudly later if rules block).
      if (u) {
        ensureUserDoc(u).catch((err) => {
          console.warn("ensureUserDoc failed:", err);
        });
      }
    });
    return () => unsub();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth(), provider);
  };

  const signOut = async () => {
    await fbSignOut(auth());
  };

  const getIdToken = async () => {
    const current = auth().currentUser;
    if (!current) return null;
    return current.getIdToken();
  };

  return (
    <Ctx.Provider value={{ user, loading, signIn, signOut, getIdToken }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
