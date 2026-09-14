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

  if (
    typeof body !== "object" ||
    body === null ||
    !("title" in body) ||
    typeof body.title !== "string"
  ) {
    return NextResponse.json({ error: "Expected body with string title" }, { status: 400 })
  }

  const task = {
    id: crypto.randomUUID(),
    title: body.title,
  }

  tasks.push(task)

  return NextResponse.json(task, { status: 201 })
}
