/**
 * Firestore rejects `undefined` values. Strip undefined keys before passing to setDoc/updateDoc.
 * Use this whenever you're spreading optional form fields into a Firestore write.
 */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k as keyof T] = v as T[keyof T];
  }
  return out;
}
