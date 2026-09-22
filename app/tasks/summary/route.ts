import { NextResponse } from "next/server"
import { getTaskTotal } from "../../../lib/tasks"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ total: getTaskTotal() }, {
    headers: { "Cache-Control": "no-store" },
  })
}
