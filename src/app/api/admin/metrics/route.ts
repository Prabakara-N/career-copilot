import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export const maxDuration = 30;

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowList = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allowList.includes(email.toLowerCase());
}

export async function GET(req: Request) {
  // 1. Authenticate
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let email: string | null = null;
  try {
    const decoded = await adminAuth().verifyIdToken(authHeader.slice("Bearer ".length));
    email = decoded.email ?? null;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!isAdmin(email)) {
    return NextResponse.json({ error: "Forbidden — not an admin" }, { status: 403 });
  }

  // 2. Compute metrics via Firestore Admin
  try {
    const usersSnap = await adminDb().collection("users").get();
    const userCount = usersSnap.size;

    let chatCount = 0;
    let reportCount = 0;
    let applicationCount = 0;
    const recentUsers: Array<{ uid: string; email: string | null; displayName: string | null; lastLoginAt: string | null; chatCount: number; reportCount: number; applicationCount: number }> = [];

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const u = userDoc.data() as { email?: string | null; displayName?: string | null; lastLoginAt?: { toDate?: () => Date } };

      const [chats, reports, apps] = await Promise.all([
        adminDb().collection("users").doc(uid).collection("chats").count().get(),
        adminDb().collection("users").doc(uid).collection("reports").count().get(),
        adminDb().collection("users").doc(uid).collection("applications").count().get(),
      ]);

      const userChats = chats.data().count;
      const userReports = reports.data().count;
      const userApps = apps.data().count;

      chatCount += userChats;
      reportCount += userReports;
      applicationCount += userApps;

      recentUsers.push({
        uid,
        email: u.email ?? null,
        displayName: u.displayName ?? null,
        lastLoginAt: u.lastLoginAt?.toDate?.()?.toISOString() ?? null,
        chatCount: userChats,
        reportCount: userReports,
        applicationCount: userApps,
      });
    }

    // Sort users by lastLoginAt desc
    recentUsers.sort((a, b) => {
      if (!a.lastLoginAt) return 1;
      if (!b.lastLoginAt) return -1;
      return b.lastLoginAt.localeCompare(a.lastLoginAt);
    });

    return NextResponse.json({
      ok: true,
      adminEmail: email,
      totals: { users: userCount, chats: chatCount, reports: reportCount, applications: applicationCount },
      users: recentUsers.slice(0, 50),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Metrics failed" },
      { status: 500 }
    );
  }
}
