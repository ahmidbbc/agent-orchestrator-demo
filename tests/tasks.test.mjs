import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { after, before, test } from "node:test"

const port = 3210
const baseUrl = `http://127.0.0.1:${port}`
let server
let serverOutput = ""

before(async () => {
  server = spawn("node_modules/.bin/next", ["dev", "-p", String(port), "-H", "127.0.0.1"], {
    cwd: process.cwd(),
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  })

  server.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString()
  })

  server.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString()
  })

  await waitForServer()
})

after(() => {
  server?.kill()
})

test("POST /tasks creates a task", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Write demo script" }),
  })

  assert.equal(response.status, 201)

  const task = await response.json()
  assert.equal(task.title, "Write demo script")
  assert.equal(typeof task.id, "string")
  assert.ok(task.id.length > 0)
})

test("POST /tasks returns a validation error when title is missing", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  })

  assert.equal(response.status, 400)

  const body = await response.json()
  assert.deepEqual(body, { error: "Task title is required" })
})

async function waitForServer() {
  const deadline = Date.now() + 30_000

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Next dev server exited early:\n${serverOutput}`)
    }

    try {
      const response = await fetch(`${baseUrl}/healthz`)
      if (response.ok) {
        return
      }
    } catch {
      // Server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for Next dev server:\n${serverOutput}`)
}
