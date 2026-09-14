import { NextResponse } from "next/server"

type Task = {
  id: number
  title: string
}

let nextTaskId = 1
const tasks: Task[] = []

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!isCreateTaskBody(body)) {
    return NextResponse.json({ error: "title must be a string" }, { status: 400 })
  }

  const task = {
    id: nextTaskId,
    title: body.title,
  }

  nextTaskId += 1
  tasks.push(task)

  return NextResponse.json(task, { status: 201 })
}

function isCreateTaskBody(body: unknown): body is { title: string } {
  return (
    typeof body === "object" &&
    body !== null &&
    "title" in body &&
    typeof body.title === "string"
  )
}
