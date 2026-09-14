import { randomUUID } from "crypto"
import { NextResponse } from "next/server"

type CreateTaskRequest = {
  title?: unknown
}

type Task = {
  id: string
  title: string
}

const tasks: Task[] = []

export async function POST(request: Request) {
  const body = (await request.json()) as CreateTaskRequest

  if (typeof body.title !== "string" || body.title.trim() === "") {
    return NextResponse.json(
      { error: "title must be a non-empty string" },
      { status: 400 },
    )
  }

  const task = {
    id: randomUUID(),
    title: body.title,
  }

  tasks.push(task)

  return NextResponse.json(task, { status: 201 })
}
