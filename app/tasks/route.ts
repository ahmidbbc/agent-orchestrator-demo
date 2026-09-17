import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"

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
    return NextResponse.json({ error: "title must be a string" }, { status: 400 })
  }

  const task = { id: randomUUID(), title: body.title }

  return NextResponse.json(task, { status: 201 })
}
