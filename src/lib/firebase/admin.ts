import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

let cachedApp: App | null = null;

/**
 * Try multiple parse strategies for a JSON-ish string.
 * Handles both valid JSON and backslash-escaped JSON that dotenv may leave behind.
 */
function tryParseServiceAccount(str: string): Record<string, unknown> | null {
  try {
    return JSON.parse(str);
  } catch {}
  try {
    // Unescape the common escape sequences dotenv leaves in place
    const unescaped = str.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    return JSON.parse(unescaped);
  } catch {}
  return null;
}

/**
 * Extract the private-key PEM from whatever the user pasted into
 * FIREBASE_ADMIN_PRIVATE_KEY. Handles all common paste styles:
 *   1. The bare PEM with literal "\n" escapes (correct form)
 *   2. The bare PEM with real newlines (multi-line env)
 *   3. The full service-account JSON (common mistake — auto-extract `.private_key`)
 *   4. The service-account JSON with extra backslash escaping (dotenv leftover)
 *   5. Values wrapped in extra quotes
 */
function normalizePrivateKey(raw: string): string {
  let key = raw.trim();

  // Strip outer quotes
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  // If they pasted the entire service-account JSON, extract just the private_key field
  if (key.startsWith("{")) {
    const parsed = tryParseServiceAccount(key);
    if (parsed && typeof parsed.private_key === "string") {
      key = parsed.private_key;
    }
  }

  // Replace literal \n with real newlines
  key = key.replace(/\\n/g, "\n");
  return key;
}

function extractFieldFromRaw(raw: string | undefined, field: string): string | undefined {
  if (!raw) return undefined;
  let trimmed = raw.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) trimmed = trimmed.slice(1, -1);
  if (!trimmed.startsWith("{")) return undefined;
  const parsed = tryParseServiceAccount(trimmed);
  const value = parsed?.[field];
  return typeof value === "string" ? value : undefined;
}

function validatePem(key: string): void {
  if (!key.includes("-----BEGIN") || !key.includes("-----END")) {
    throw new Error(
      "FIREBASE_ADMIN_PRIVATE_KEY is not valid PEM. Paste ONLY the `private_key` field from the service-account JSON (the value that starts with '-----BEGIN PRIVATE KEY-----'), NOT the entire JSON object. Wrap in double quotes and keep the \\n sequences literal."
    );
  }
}

function getAdminApp(): App {
  if (cachedApp) return cachedApp;
  if (getApps().length > 0) {
    cachedApp = getApps()[0];
    return cachedApp;
  }

  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  // Allow the other two fields to be inferred from the JSON if the user pasted the whole thing
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || extractFieldFromRaw(rawPrivateKey, "project_id");
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || extractFieldFromRaw(rawPrivateKey, "client_email");

  if (!projectId || !clientEmail || !rawPrivateKey) {
    throw new Error("Firebase Admin credentials are not set");
  }

  const privateKey = normalizePrivateKey(rawPrivateKey);
  validatePem(privateKey);

  cachedApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  return cachedApp;
}

export const adminAuth = (): Auth => getAuth(getAdminApp());
export const adminDb = (): Firestore => getFirestore(getAdminApp());
export const adminStorage = (): Storage => getStorage(getAdminApp());
