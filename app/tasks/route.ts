import { NextResponse } from "next/server"
import { createTask } from "@/lib/tasks"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 })
  }

  const { title, category, priority, urgent } = body as Record<string, unknown>

  if (typeof title !== "string" || title.trim() === "") {
    return NextResponse.json({ error: "title is required" }, { status: 400 })
  }
  if (category !== "Feature" && category !== "Bug" && category !== "Chore") {
    return NextResponse.json({ error: "category must be Feature, Bug, or Chore" }, { status: 400 })
  }
  if (priority !== "Low" && priority !== "Medium" && priority !== "High") {
    return NextResponse.json({ error: "priority must be Low, Medium, or High" }, { status: 400 })
  }
  if (typeof urgent !== "boolean") {
    return NextResponse.json({ error: "urgent must be a boolean" }, { status: 400 })
  }

  return NextResponse.json(
    createTask({ title: title.trim(), category, priority, urgent }),
    { status: 201 },
  )
}
