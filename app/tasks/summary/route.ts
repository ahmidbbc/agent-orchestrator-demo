import { NextResponse } from "next/server"
import { getTaskCount } from "../store"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(
    { total: getTaskCount() },
    { headers: { "Cache-Control": "no-store" } }
  )
}
