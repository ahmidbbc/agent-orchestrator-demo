const assert = require("node:assert/strict")
const { test } = require("node:test")

// Exercise the real Next.js route handler built by `npm test`.
const { POST } = require("../.next/server/app/tasks/route.js").routeModule.userland

function createRequest(body) {
  return new Request("http://localhost/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

test("POST /tasks creates a task with category, priority, urgent, and total", async () => {
  const input = {
    title: "Fix the demo button",
    category: "Bug",
    priority: "High",
    urgent: true,
  }
  const response = await POST(createRequest(input))

  assert.equal(response.status, 201)
  assert.match(response.headers.get("Content-Type"), /application\/json/)
  const task = await response.json()
  assert.equal(typeof task.id, "string")
  assert.ok(task.id.length > 0)
  assert.deepEqual(task, { ...input, id: task.id, total: 1 })

  const secondInput = { ...input, title: "Another task", urgent: false }
  const secondResponse = await POST(createRequest(secondInput))
  assert.equal(secondResponse.status, 201)
  const secondTask = await secondResponse.json()
  assert.notEqual(secondTask.id, task.id)
  assert.deepEqual(secondTask, { ...secondInput, id: secondTask.id, total: 2 })
})

test("POST /tasks returns a validation error when title is missing", async () => {
  const response = await POST(createRequest({
    category: "Feature",
    priority: "Medium",
    urgent: false,
  }))

  assert.equal(response.status, 400)
  assert.match(response.headers.get("Content-Type"), /application\/json/)
  assert.deepEqual(await response.json(), { error: "title is required" })
})
