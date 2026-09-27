const assert = require("node:assert/strict")
const { test } = require("node:test")
// npm test builds first so Next.js resolves TypeScript and path aliases.
const { POST } = require("../.next/server/app/tasks/route.js").routeModule.userland

function postTask(body) {
  return POST(new Request("http://localhost/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }))
}

test("POST /tasks creates tasks with their fields and a running total", async () => {
  const input = {
    title: "Add task filters",
    category: "Feature",
    priority: "High",
    urgent: true
  }
  const response = await postTask(input)
  assert.equal(response.status, 201)
  assert.match(response.headers.get("content-type"), /application\/json/)
  const task = await response.json()
  assert.equal(typeof task.id, "string")
  assert.ok(task.id.length > 0)
  assert.deepEqual(task, { id: task.id, ...input, total: 1 })

  const secondInput = { ...input, category: "Bug", priority: "Low", urgent: false }
  const secondResponse = await postTask(secondInput)
  assert.equal(secondResponse.status, 201)
  const secondTask = await secondResponse.json()
  assert.notEqual(secondTask.id, task.id)
  assert.deepEqual(secondTask, { id: secondTask.id, ...secondInput, total: 2 })
})

test("POST /tasks rejects a missing title", async () => {
  const response = await postTask({
    category: "Chore",
    priority: "Medium",
    urgent: false
  })
  assert.equal(response.status, 400)
  assert.match(response.headers.get("content-type"), /application\/json/)
  assert.deepEqual(await response.json(), {
    error: "title is required and must be a non-empty string"
  })
})
