import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

type Task = {
  id: string
  title: string
}

// Demo storage is local to this server process and resets on restart.
const tasks: Task[] = []

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("title" in body) ||
    typeof body.title !== "string" ||
    body.title.trim().length === 0
  ) {
    return NextResponse.json(
      { error: "title must be a non-empty string" },
      { status: 400 }
    )
  }

  const task: Task = { id: randomUUID(), title: body.title }
  tasks.push(task)

  return NextResponse.json(task, { status: 201 })
}
