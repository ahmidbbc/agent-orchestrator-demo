const assert = require("node:assert/strict")
const { createServer } = require("node:http")
const { once } = require("node:events")
const { before, after, test } = require("node:test")
const next = require("next")

const app = next({ dev: false })
let server
let baseUrl

before(async () => {
  await app.prepare()
  server = createServer(app.getRequestHandler())
  server.listen(0, "127.0.0.1")
  await once(server, "listening")
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  if (server?.listening) {
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
  })
}

test("POST /tasks creates tasks with all fields and a running total", async () => {
  const input = {
    title: "Add search",
    category: "Feature",
    priority: "High",
    urgent: true,
  }
  const response = await postTask(input)

  assert.equal(response.status, 201)
  assert.match(response.headers.get("content-type"), /application\/json/)
  const task = await response.json()
  assert.match(task.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  assert.deepEqual(task, { ...input, id: task.id, total: 1 })

  const secondInput = { ...input, title: "Fix search", category: "Bug", priority: "Low", urgent: false }
  const secondResponse = await postTask(secondInput)
  assert.equal(secondResponse.status, 201)
  const secondTask = await secondResponse.json()
  assert.notEqual(secondTask.id, task.id)
  assert.deepEqual(secondTask, { ...secondInput, id: secondTask.id, total: 2 })
})

test("POST /tasks returns 400 when title is missing", async () => {
  const response = await postTask({
    category: "Feature",
    priority: "High",
    urgent: true,
  })

  assert.equal(response.status, 400)
  assert.match(response.headers.get("content-type"), /application\/json/)
  assert.deepEqual(await response.json(), { error: "title is required" })
})
