const assert = require("node:assert/strict")
const { test } = require("node:test")
const { POST } = require("../.test-build/app/tasks/route.js")

function taskRequest(body) {
  return new Request("http://localhost/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

test("POST /tasks creates a task with the supplied title", async () => {
  const response = await POST(taskRequest({ title: "Prepare the demo" }))

  assert.equal(response.status, 201)
  assert.match(response.headers.get("content-type"), /application\/json/)
  const task = await response.json()
  assert.equal(task.title, "Prepare the demo")
  assert.equal(typeof task.id, "string")
  assert.match(task.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
})

test("POST /tasks returns a validation error when title is missing", async () => {
  const response = await POST(taskRequest({}))

  assert.equal(response.status, 400)
  assert.match(response.headers.get("content-type"), /application\/json/)
  assert.deepEqual(await response.json(), { error: "title must be a string" })
})
