import { adminAuth } from "@/lib/firebase/admin";

export type Context = {
  userId: string | null;
};

export async function createContext(req: Request): Promise<Context> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { userId: null };
  }

  const idToken = authHeader.slice("Bearer ".length);
  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    return { userId: decoded.uid };
  } catch {
    return { userId: null };
  }
}
