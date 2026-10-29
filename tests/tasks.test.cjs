const assert = require("node:assert/strict")
const { test } = require("node:test")

// Exercise the real Next.js handler after compilation, without a listening server.
const { POST } = require("../.next/server/app/tasks/route.js").routeModule.userland

function request(body) {
  return new Request("http://localhost/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

test("POST /tasks creates a task with category, priority, urgent, and total", async () => {
  const input = {
    title: "Fix the demo",
    category: "Bug",
    priority: "High",
    urgent: true,
  }

  const response = await POST(request(input))
  assert.equal(response.status, 201)
  assert.match(response.headers.get("content-type"), /application\/json/)

  const { id, total, ...task } = await response.json()
  assert.deepEqual(task, input)
  assert.equal(typeof id, "string")
  assert.ok(id.length > 0)
  assert.equal(total, 1)

  const nextResponse = await POST(request({ ...input, urgent: false }))
  assert.equal(nextResponse.status, 201)
  const nextTask = await nextResponse.json()
  assert.equal(nextTask.total, 2)
  assert.equal(nextTask.urgent, false)
  assert.notEqual(nextTask.id, id)
})

test("POST /tasks returns a validation error when title is missing", async () => {
  const response = await POST(request({
    category: "Feature",
    priority: "Medium",
    urgent: false,
  }))

  assert.equal(response.status, 400)
  assert.match(response.headers.get("content-type"), /application\/json/)
  assert.deepEqual(await response.json(), { error: "title is required" })
})
