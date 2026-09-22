import { NextResponse } from "next/server"
import { getTaskCount } from "@/lib/tasks"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(
    { total: getTaskCount() },
    { headers: { "Cache-Control": "no-store" } }
  )
}
