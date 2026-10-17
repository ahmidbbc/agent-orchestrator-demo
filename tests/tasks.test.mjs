import assert from "node:assert/strict"
import { createServer } from "node:http"
import { after, before, test } from "node:test"
import next from "next"

const app = next({ dev: false })
let server
let baseUrl

before(async () => {
  await app.prepare()
  server = createServer(app.getRequestHandler())
  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve())
      server.closeAllConnections()
    })
  }
  await app.close()
})

function postTask(body) {
  return fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  })
}

test("POST /tasks creates a task with category, priority, urgent, and total", async () => {
  const input = {
    title: "Fix the sign-in button",
    category: "Bug",
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
})

test("POST /tasks returns a validation error when title is missing", async () => {
  const response = await postTask({
    category: "Feature",
    priority: "Medium",
    urgent: false,
  })

  assert.equal(response.status, 400)
  assert.match(response.headers.get("content-type"), /application\/json/)
  assert.deepEqual(await response.json(), { error: "title is required" })
})
