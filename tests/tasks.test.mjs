import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { test } from "node:test"

// npm test builds first so these tests exercise the production route handler.
const require = createRequire(import.meta.url)
const { POST } = require("../.next/server/app/tasks/route.js").routeModule.userland
const { GET: getSummary } = require("../.next/server/app/tasks/summary/route.js").routeModule.userland

function postTask(body) {
  return POST(new Request("http://localhost/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }))
}

test("POST /tasks creates a task with category, priority, urgent, and total", async () => {
  const input = {
    title: "Add task creation",
    category: "Feature",
    priority: "High",
    urgent: true,
  }
  const response = await postTask(input)

  assert.equal(response.status, 201)
  assert.match(response.headers.get("content-type"), /application\/json/)
  const task = await response.json()
  assert.equal(typeof task.id, "string")
  assert.ok(task.id.length > 0)
  assert.deepEqual(task, { ...input, id: task.id, total: 1 })

  const secondResponse = await postTask({ ...input, urgent: false })
  assert.equal(secondResponse.status, 201)
  const secondTask = await secondResponse.json()
  assert.equal(secondTask.total, 2)
  assert.equal(secondTask.urgent, false)
  assert.notEqual(secondTask.id, task.id)

  const summaryResponse = await getSummary()
  assert.equal(summaryResponse.status, 200)
  assert.equal(summaryResponse.headers.get("cache-control"), "no-store")
  assert.deepEqual(await summaryResponse.json(), { total: secondTask.total })
})

test("POST /tasks returns a validation error when title is missing", async () => {
  const response = await postTask({
    category: "Bug",
    priority: "Medium",
    urgent: false,
  })

  assert.equal(response.status, 400)
  assert.match(response.headers.get("content-type"), /application\/json/)
  const body = await response.json()
  assert.equal(body.error, "title is required and must be a non-empty string")
})
