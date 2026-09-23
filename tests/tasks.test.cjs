const assert = require("node:assert/strict")
const { createServer } = require("node:http")
const { after, before, test } = require("node:test")
const next = require("next")

let app
let server
let baseUrl

before(async () => {
  app = next({ dev: false })
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
  if (app) await app.close()
})

test("POST /tasks creates a task", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Prepare the live demo" })
  })

  assert.equal(response.status, 201)
  assert.match(response.headers.get("content-type"), /application\/json/)
  const task = await response.json()
  assert.equal(task.title, "Prepare the live demo")
  assert.equal(typeof task.id, "string")
  assert.ok(task.id.length > 0)
})

test("POST /tasks rejects a missing title", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  })

  assert.equal(response.status, 400)
  assert.match(response.headers.get("content-type"), /application\/json/)
  assert.deepEqual(await response.json(), { error: "title must be a string" })
})
