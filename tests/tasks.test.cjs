const assert = require("node:assert/strict")
const { test } = require("node:test")

// npm test builds first so this exercises the actual compiled route and store.
const { routeModule } = require("../.next/server/app/tasks/route.js")
const { POST } = routeModule.userland

test("POST /tasks creates a task", async () => {
  const response = await POST(new Request("http://localhost/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Write a demo test" }),
  }))

  assert.equal(response.status, 201)
  assert.match(response.headers.get("content-type"), /application\/json/)
  const task = await response.json()
  assert.equal(task.title, "Write a demo test")
  assert.equal(typeof task.id, "string")
  assert.ok(task.id.length > 0)
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
