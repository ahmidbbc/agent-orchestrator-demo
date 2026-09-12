import { NextRequest } from "next/server"
import { describe, expect, it } from "vitest"
import { POST } from "./route"

function postTasksRequest(body: unknown) {
  return new NextRequest("http://localhost/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/tasks", () => {
  it("creates a task and returns it with a 201 status", async () => {
    const response = await POST(postTasksRequest({ title: "Buy milk" }))
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toMatchObject({ title: "Buy milk" })
    expect(typeof data.id).toBe("string")
  })

  it("returns a 400 validation error when title is missing", async () => {
    const response = await POST(postTasksRequest({}))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty("error")
  })
})
