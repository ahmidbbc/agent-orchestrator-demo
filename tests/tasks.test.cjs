const assert = require("node:assert/strict")
const { test } = require("node:test")

// Exercise the real handler and store after Next resolves TypeScript and aliases.
const { POST } = require("../.next/server/app/tasks/route.js").routeModule.userland

function request(body) {
  return new Request("http://localhost/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

test("POST /tasks creates a task and rejects a missing title without increasing the total", async (t) => {
  const input = {
    title: "Ship the demo",
    category: "Feature",
    priority: "High",
    urgent: true,
  }
  let firstTask

  await t.test("returns the created task with category, priority, urgent, and total", async () => {
    const response = await POST(request(input))
    assert.equal(response.status, 201)
    assert.match(response.headers.get("content-type"), /application\/json/)
    firstTask = await response.json()
    assert.equal(typeof firstTask.id, "string")
    assert.ok(firstTask.id.length > 0)
    assert.deepEqual(firstTask, { ...input, id: firstTask.id, total: 1 })
  })

  await t.test("returns 400 when title is missing", async () => {
    const { title, ...withoutTitle } = input
    const response = await POST(request(withoutTitle))
    assert.equal(response.status, 400)
    assert.match(response.headers.get("content-type"), /application\/json/)
    assert.deepEqual(await response.json(), { error: "title is required" })
  })

  await t.test("counts only successful creations", async () => {
    const nextInput = { ...input, title: "Fix the demo", category: "Bug", priority: "Low", urgent: false }
    const response = await POST(request(nextInput))
    assert.equal(response.status, 201)
    const nextTask = await response.json()
    assert.notEqual(nextTask.id, firstTask.id)
    assert.deepEqual(nextTask, { ...nextInput, id: nextTask.id, total: 2 })
  })
})
