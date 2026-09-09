import { NextResponse } from "next/server"

import { createTask } from "./store"

type CreateTaskBody = {
  title?: unknown
}

export async function POST(request: Request) {
  let body: CreateTaskBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (typeof body.title !== "string") {
    return NextResponse.json({ error: "Expected title to be a string" }, { status: 400 })
  }

  const task = createTask(body.title)

  return NextResponse.json(task, { status: 201 })
}
