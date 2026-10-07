import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { test } from "node:test"

// npm test builds first, so Next.js resolves TypeScript and path aliases.
const require = createRequire(import.meta.url)
const { routeModule } = require("../.next/server/app/tasks/route.js")
const { POST } = routeModule.userland

function postTask(body) {
  return POST(new Request("http://localhost/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }))
}

test("POST /tasks rejects a missing title", async () => {
  const response = await postTask({
    category: "Bug",
    priority: "Medium",
    urgent: false,
  })

  assert.equal(response.status, 400)
  assert.match(response.headers.get("content-type"), /application\/json/)
  assert.deepEqual(await response.json(), { error: "title is required" })
})

test("POST /tasks creates tasks with category, priority, urgency, and a running total", async () => {
  const ids = new Set()
  for (const urgent of [true, false]) {
    const input = {
      title: "Add task filters",
      category: "Feature",
      priority: "High",
      urgent,
    }
    const response = await postTask(input)

    assert.equal(response.status, 201)
    assert.match(response.headers.get("content-type"), /application\/json/)
    const { id, total, ...task } = await response.json()
    assert.deepEqual(task, input)
    assert.equal(typeof id, "string")
    assert.ok(id.length > 0)
    assert.ok(!ids.has(id), "Each task has a unique ID")
    ids.add(id)
    assert.equal(total, ids.size, "Total counts only successful creations")
  }
})
