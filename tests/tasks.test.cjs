const assert = require("node:assert/strict")
const { createServer } = require("node:http")
const { before, after, test } = require("node:test")
const next = require("next")

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
    body: JSON.stringify(body)
  })
}

test("POST /tasks creates tasks and returns their fields and running total", async () => {
  const input = {
    title: "Add task filters",
    category: "Feature",
    priority: "High",
    urgent: true
  }
  const response = await postTask(input)
  assert.equal(response.status, 201)
  assert.match(response.headers.get("content-type"), /application\/json/)
  const { id, total, ...task } = await response.json()
  assert.deepEqual(task, input)
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  assert.equal(total, 1)

  const secondResponse = await postTask({ ...input, urgent: false })
  assert.equal(secondResponse.status, 201)
  const second = await secondResponse.json()
  assert.equal(second.urgent, false)
  assert.notEqual(second.id, id)
  assert.equal(second.total, 2)
})

test("POST /tasks returns a validation error when title is missing", async () => {
  const response = await postTask({ category: "Bug", priority: "Medium", urgent: false })
  assert.equal(response.status, 400)
  assert.match(response.headers.get("content-type"), /application\/json/)
  const body = await response.json()
  assert.equal(typeof body.error, "string")
  assert.match(body.error, /title.*required/i)
})
