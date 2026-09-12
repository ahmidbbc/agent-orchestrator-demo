import { NextRequest, NextResponse } from "next/server"

type Task = {
  id: string
  title: string
}

const tasks: Task[] = []

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

  return NextResponse.json(task, { status: 201 })
}
