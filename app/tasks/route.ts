import { NextRequest, NextResponse } from "next/server"
import { addTask, taskCount, type TaskCategory, type TaskPriority } from "@/lib/tasks"

const CATEGORIES: TaskCategory[] = ["Feature", "Bug", "Chore"]
const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High"]

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { title, category, priority, urgent } = body as Record<string, unknown>

  if (typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: '"title" is required' }, { status: 400 })
  }

  if (typeof category !== "string" || !CATEGORIES.includes(category as TaskCategory)) {
    return NextResponse.json(
      { error: `"category" must be one of ${CATEGORIES.join(", ")}` },
      { status: 400 }
    )
  }

  if (typeof priority !== "string" || !PRIORITIES.includes(priority as TaskPriority)) {
    return NextResponse.json(
      { error: `"priority" must be one of ${PRIORITIES.join(", ")}` },
      { status: 400 }
    )
  }

  const task = addTask({
    title: title.trim(),
    category: category as TaskCategory,
    priority: priority as TaskPriority,
    urgent: typeof urgent === "boolean" ? urgent : false,
  })

  return NextResponse.json({ ...task, total: taskCount() }, { status: 201 })
}
