const assert = require("node:assert/strict")
const { test } = require("node:test")

// npm test builds first so these requests exercise the real Next.js handler
// with its resolved imports, without a separate server or mocked task store.
const { POST } = require("../.next/server/app/tasks/route.js").routeModule.userland

function createRequest(body) {
  return new Request("http://localhost/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

test("POST /tasks creates tasks with their fields and a running total", async () => {
  const input = {
    title: "Add task search",
    category: "Feature",
    priority: "High",
    urgent: true,
  }
  const response = await POST(createRequest(input))
  assert.equal(response.status, 201)
  assert.match(response.headers.get("content-type"), /application\/json/)

  const task = await response.json()
  assert.match(task.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  assert.deepEqual(task, { id: task.id, ...input, total: 1 })

  const nextInput = { title: "Fix task search", category: "Bug", priority: "Medium", urgent: false }
  const nextResponse = await POST(createRequest(nextInput))
  assert.equal(nextResponse.status, 201)
  const nextTask = await nextResponse.json()
  assert.notEqual(nextTask.id, task.id)
  assert.deepEqual(nextTask, { id: nextTask.id, ...nextInput, total: task.total + 1 })
})

test("POST /tasks rejects a missing title", async () => {
  const response = await POST(createRequest({
    category: "Chore",
    priority: "Low",
    urgent: false,
  }))

  assert.equal(response.status, 400)
  assert.match(response.headers.get("content-type"), /application\/json/)
  assert.deepEqual(await response.json(), { error: "title is required" })
})
