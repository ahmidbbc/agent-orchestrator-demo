import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { test } from "node:test"

// npm test builds first, compiling TypeScript and resolving the app's aliases.
const require = createRequire(import.meta.url)
const { routeModule } = require("../.next/server/app/tasks/route.js")
const { POST } = routeModule.userland

function createTask(body) {
  return POST(new Request("http://localhost/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }))
}

test("POST /tasks creates a task with category, priority, urgent, and total", async () => {
  const input = {
    title: "Fix the login button",
    category: "Bug",
    priority: "High",
    urgent: true
  }
  const response = await createTask(input)

  assert.equal(response.status, 201)
  assert.match(response.headers.get("content-type"), /application\/json/)
  const task = await response.json()
  assert.equal(typeof task.id, "string")
  assert.ok(task.id.length > 0)
  assert.deepEqual(task, { ...input, id: task.id, total: 1 })

  const secondResponse = await createTask({ ...input, urgent: false })
  assert.equal(secondResponse.status, 201)
  const secondTask = await secondResponse.json()
  assert.equal(secondTask.total, 2)
  assert.equal(secondTask.urgent, false)
  assert.notEqual(secondTask.id, task.id)
})

test("POST /tasks rejects a missing title", async () => {
  const response = await createTask({
    category: "Feature",
    priority: "Medium",
    urgent: false
  })

  assert.equal(response.status, 400)
  assert.match(response.headers.get("content-type"), /application\/json/)
  assert.deepEqual(await response.json(), { error: "title is required" })
})
