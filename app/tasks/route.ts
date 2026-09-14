import { NextResponse } from "next/server"

import { createTask } from "./store"

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

  const task = createTask(body.title)

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
