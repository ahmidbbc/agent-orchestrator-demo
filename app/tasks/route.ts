import { NextRequest, NextResponse } from "next/server"
import {
  createTask,
  getTaskCount,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  type TaskCategory,
  type TaskPriority,
} from "@/lib/tasks"

function isTaskCategory(value: unknown): value is TaskCategory {
  return typeof value === "string" && (TASK_CATEGORIES as readonly string[]).includes(value)
}

function isTaskPriority(value: unknown): value is TaskPriority {
  return typeof value === "string" && (TASK_PRIORITIES as readonly string[]).includes(value)
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 })
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 })
  }

  const { title, category, priority, urgent } = body as Record<string, unknown>

  if (typeof title !== "string" || title.trim() === "") {
    return NextResponse.json({ error: '"title" is required' }, { status: 400 })
  }

  if (!isTaskCategory(category)) {
    return NextResponse.json(
      { error: `"category" must be one of ${TASK_CATEGORIES.join(", ")}` },
      { status: 400 }
    )
  }

  if (!isTaskPriority(priority)) {
    return NextResponse.json(
      { error: `"priority" must be one of ${TASK_PRIORITIES.join(", ")}` },
      { status: 400 }
    )
  }

  if (urgent !== undefined && typeof urgent !== "boolean") {
    return NextResponse.json({ error: '"urgent" must be a boolean' }, { status: 400 })
  }

  const task = createTask({
    title: title.trim(),
    category,
    priority,
    urgent: urgent ?? false,
  })

  return NextResponse.json({ ...task, total: getTaskCount() }, { status: 201 })
}
