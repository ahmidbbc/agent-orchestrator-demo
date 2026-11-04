import { describe, expect, it } from "vitest"
import { NextRequest } from "next/server"
import { POST } from "./route"

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/tasks", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /tasks", () => {
  it("creates a task with the given category/priority/urgent and returns the running total", async () => {
    const response = await POST(
      postRequest({
        title: "Fix login bug",
        category: "Bug",
        priority: "High",
        urgent: true,
      })
    )

    expect(response.status).toBe(201)

    const task = await response.json()
    expect(task.title).toBe("Fix login bug")
    expect(task.category).toBe("Bug")
    expect(task.priority).toBe("High")
    expect(task.urgent).toBe(true)
    expect(typeof task.id).toBe("string")
    expect(typeof task.createdAt).toBe("string")
    // The response is the source of truth for the running total — never a
    // separate GET call (see the GET /tasks/summary endpoint's caveat).
    expect(typeof task.total).toBe("number")
    expect(task.total).toBeGreaterThanOrEqual(1)
  })

  it("rejects a task with a missing title", async () => {
    const response = await POST(
      postRequest({
        category: "Bug",
        priority: "High",
      })
    )

    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error).toMatch(/title/i)
  })

  it("rejects a task with an empty title", async () => {
    const response = await POST(
      postRequest({
        title: "   ",
        category: "Feature",
        priority: "Low",
      })
    )

    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error).toMatch(/title/i)
  })
})
