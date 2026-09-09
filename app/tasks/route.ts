import { NextResponse } from "next/server"

type Task = {
  id: string
  title: string
}

const tasks: Task[] = []

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!isTaskInput(body)) {
    return NextResponse.json({ error: "Task title is required" }, { status: 400 })
  }

  const task: Task = {
    id: crypto.randomUUID(),
    title: body.title,
  }

  tasks.push(task)

  return NextResponse.json(task, { status: 201 })
}

function isTaskInput(body: unknown): body is { title: string } {
  return (
    typeof body === "object" &&
    body !== null &&
    "title" in body &&
    typeof body.title === "string" &&
    body.title.trim().length > 0
  )
}
