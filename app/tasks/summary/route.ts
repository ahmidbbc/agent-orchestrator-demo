import { NextResponse } from "next/server"
import { tasks } from "../store"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(
    { total: tasks.length },
    { headers: { "Cache-Control": "no-store" } }
  )
}
