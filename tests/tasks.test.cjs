const assert = require("node:assert/strict")
const { test } = require("node:test")

// npm test builds the app first so these tests exercise the compiled handler.
const { POST } = require("../.next/server/app/tasks/route.js").routeModule.userland

function request(body) {
  return new Request("http://localhost/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

test("POST /tasks creates a task and returns it as JSON", async () => {
  const response = await POST(request({ title: "Demo task" }))

  assert.equal(response.status, 201)
  assert.match(response.headers.get("content-type"), /application\/json/)
  const task = await response.json()
  assert.equal(task.title, "Demo task")
  assert.equal(typeof task.id, "string")
  assert.ok(task.id.length > 0)
})

test("POST /tasks returns a validation error when title is missing", async () => {
  const response = await POST(request({}))

  assert.equal(response.status, 400)
  assert.match(response.headers.get("content-type"), /application\/json/)
  assert.deepEqual(await response.json(), { error: "title must be a string" })
})
