import { NextResponse } from "next/server"
import { tasks } from "@/lib/tasks"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ total: tasks.length })
}
