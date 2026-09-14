import { NextResponse } from "next/server"

type Task = {
  id: number
  title: string
}

const tasks: Task[] = []
let nextTaskId = 1

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
    typeof body.title !== "string"
  ) {
    return NextResponse.json({ error: "Expected JSON body with string title" }, { status: 400 })
  }

  const task = {
    id: nextTaskId,
    title: body.title,
  }

  nextTaskId += 1
  tasks.push(task)

  return NextResponse.json(task, { status: 201 })
}
