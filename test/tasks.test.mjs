import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { setTimeout as delay } from "node:timers/promises"
import { after, before, test } from "node:test"

const host = "127.0.0.1"
const port = Number(process.env.TEST_PORT ?? 43123)
const baseUrl = `http://${host}:${port}`

let server
let serverOutput = ""

before(async () => {
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--hostname", host, "--port", String(port)],
    {
      cwd: process.cwd(),
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  )

  server.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString()
  })

  server.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString()
  })

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
      // Keep polling until Next finishes booting.
    }

    await delay(250)
  }

  throw new Error(`Timed out waiting for Next dev server:\n${serverOutput}`)
})

after(async () => {
  if (!server || server.exitCode !== null) {
    return
  }

  server.kill("SIGTERM")

  await Promise.race([
    new Promise((resolve) => {
      server.once("exit", resolve)
    }),
    delay(5_000).then(() => {
      server.kill("SIGKILL")
    }),
  ])
})

test("POST /tasks creates a task", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Write the task test" }),
  })

  assert.equal(response.status, 201)

  const task = await response.json()

  assert.equal(task.title, "Write the task test")
  assert.equal(typeof task.id, "string")
  assert.match(task.id, /^[0-9a-f-]{36}$/i)
})

test("POST /tasks returns a validation error when title is missing", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  })

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: "Expected title to be a string" })
})
