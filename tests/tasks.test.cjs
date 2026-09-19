const assert = require("node:assert/strict")
const { test } = require("node:test")
// npm test builds the app first so these tests exercise the compiled route handler.
const { POST } = require("../.next/server/app/tasks/route.js").routeModule.userland

test("POST /tasks creates a task", async () => {
  const response = await POST(new Request("http://localhost/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Demo task" }),
  }))

  assert.equal(response.status, 201)
  assert.match(response.headers.get("content-type"), /application\/json/)
  const task = await response.json()
  assert.equal(task.title, "Demo task")
  assert.match(task.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
})

test("POST /tasks rejects a missing title", async () => {
  const response = await POST(new Request("http://localhost/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  }))

  assert.equal(response.status, 400)
  assert.match(response.headers.get("content-type"), /application\/json/)
  assert.deepEqual(await response.json(), { error: "title must be a string" })
})
