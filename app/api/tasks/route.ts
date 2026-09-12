import { NextRequest, NextResponse } from "next/server"
import { tasks, Task } from "@/lib/tasks"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body || typeof body.title !== "string" || body.title.trim() === "") {
    return NextResponse.json(
      { error: "title is required and must be a non-empty string" },
      { status: 400 }
    )
  }

  const task: Task = {
    id: crypto.randomUUID(),
    title: body.title,
  }
  tasks.push(task)

  // Return the resulting total in the same response instead of making the
  // caller do a second fetch to /api/tasks/summary: on Vercel each route is
  // its own serverless function with its own in-memory `tasks` array, so a
  // follow-up GET can land on a different instance that never saw this push
  // (confirmed live 2026-09-12 — the demo page showed "0" right after
  // creating a task). Computing the total here uses the exact same
  // in-process array this push just happened on — no cross-instance gap.
  return NextResponse.json({ ...task, total: tasks.length }, { status: 201 })
}
