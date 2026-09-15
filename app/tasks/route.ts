import { NextResponse } from "next/server"

type CreateTaskBody = {
  title?: unknown
}

export async function POST(request: Request) {
  let body: CreateTaskBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 })
  }

  if (typeof body.title !== "string" || body.title.trim() === "") {
    return NextResponse.json({ error: "Task title is required" }, { status: 400 })
  }

  const task = {
    id: crypto.randomUUID(),
    title: body.title,
  }

  return NextResponse.json(task, { status: 201 })
}
