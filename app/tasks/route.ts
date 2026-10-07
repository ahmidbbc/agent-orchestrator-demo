import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

type Task = {
  id: string
  title: string
  category: "Feature" | "Bug" | "Chore"
  priority: "Low" | "Medium" | "High"
  urgent: boolean
}

// Demo storage lasts for the lifetime of this server instance.
const tasks: Task[] = []

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Expected a JSON object" }, { status: 400 })
  }

  const { title, category, priority, urgent } = body as Record<string, unknown>

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 })
  }

  if (category !== "Feature" && category !== "Bug" && category !== "Chore") {
    return NextResponse.json(
      { error: "category must be Feature, Bug, or Chore" },
      { status: 400 }
    )
  }

  if (priority !== "Low" && priority !== "Medium" && priority !== "High") {
    return NextResponse.json(
      { error: "priority must be Low, Medium, or High" },
      { status: 400 }
    )
  }

  if (typeof urgent !== "boolean") {
    return NextResponse.json({ error: "urgent must be a boolean" }, { status: 400 })
  }

  const task: Task = { id: randomUUID(), title: title.trim(), category, priority, urgent }
  tasks.push(task)

  return NextResponse.json({ ...task, total: tasks.length }, { status: 201 })
}
