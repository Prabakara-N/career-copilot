import { NextResponse } from "next/server";
import { requireUidFromRequest } from "@/lib/firebase/require-uid";
import { deleteAtsRun, getAtsRun } from "@/lib/firebase/ats-runs";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireUidFromRequest(req);
  if (auth.uid === null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await context.params;
  const run = await getAtsRun(auth.uid, id);
  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, run });
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireUidFromRequest(req);
  if (auth.uid === null) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await context.params;
  await deleteAtsRun(auth.uid, id);
  return NextResponse.json({ ok: true });
}
