import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

let cachedApp: FirebaseApp | null = null;

function getFirebaseApp(): FirebaseApp {
  if (cachedApp) return cachedApp;
  if (getApps().length > 0) {
    cachedApp = getApps()[0];
    return cachedApp;
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    // Return a placeholder during prerender / when not configured.
    // Calls to auth() / db() / storage() will fail at runtime if used unconfigured.
    cachedApp = initializeApp({ apiKey: "missing", projectId: "missing" }, "career-ops-placeholder");
    return cachedApp;
  }

  cachedApp = initializeApp({
    apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
  return cachedApp;
}

export const firebaseApp = (): FirebaseApp => getFirebaseApp();
export const auth = (): Auth => getAuth(getFirebaseApp());
export const db = (): Firestore => getFirestore(getFirebaseApp());
export const storage = (): FirebaseStorage => getStorage(getFirebaseApp());
