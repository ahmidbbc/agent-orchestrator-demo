import { NextResponse } from "next/server"
import { taskCount } from "@/lib/tasks"

// Reads a runtime in-memory counter — must not be statically optimized/cached
// at build time (Next.js would otherwise bake in the count from build time).
export const dynamic = "force-dynamic"

// Total task count for this server instance. NOTE: on a serverless deployment
// a request here can land on a different function instance than the one that
// handled a given POST /tasks, so this can read as stale/zero right after a
// write. The /demo-tasks page must never rely on this for the count it shows
// right after creating a task — it uses the `total` already returned by the
// POST /tasks response instead. This endpoint still exists for callers that
// land on the instance that does have the data.
export async function GET() {
  return NextResponse.json({ total: taskCount() })
}
