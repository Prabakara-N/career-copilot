import { adminAuth } from "./admin";

export type UidResult =
  | { uid: string; error?: never }
  | { uid: null; status: 401 | 503; error: string };

/**
 * Verify the Firebase ID token on an incoming request.
 *
 * Returns distinct error codes so the client can show a useful message:
 * - 401: no Authorization header, or token verification failed
 * - 503: Firebase Admin env vars are not configured on the server
 */
export async function requireUidFromRequest(req: Request): Promise<UidResult> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      uid: null,
      status: 401,
      error: "No Authorization header. Sign in and retry.",
    };
  }

  // Catch the "admin env vars missing" case up front — it's the most common local-dev failure
  if (
    !process.env.FIREBASE_ADMIN_PROJECT_ID ||
    !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    !process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    return {
      uid: null,
      status: 503,
      error:
        "Server is not configured for authenticated requests. " +
        "Add FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY to your .env.local (from Firebase Console → Service Accounts) and restart the dev server.",
    };
  }

  try {
    const decoded = await adminAuth().verifyIdToken(authHeader.slice("Bearer ".length));
    return { uid: decoded.uid };
  } catch (err) {
    return {
      uid: null,
      status: 401,
      error: err instanceof Error ? `Token verification failed: ${err.message}` : "Token verification failed",
    };
  }
}
