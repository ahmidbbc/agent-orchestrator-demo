import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { createServer } from "node:net"
import { test } from "node:test"
import { setTimeout as delay } from "node:timers/promises"
import { fileURLToPath } from "node:url"

const rootDir = fileURLToPath(new URL("../", import.meta.url))
const nextCli = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
)

let server
let serverOutput = ""
let port
let baseUrl

async function getAvailablePort() {
  if (process.env.TEST_PORT) {
    return process.env.TEST_PORT
  }

  const probe = createServer()
  probe.listen(0, "127.0.0.1")
  await once(probe, "listening")

  const address = probe.address()
  probe.close()
  await once(probe, "close")

  return String(address.port)
}

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
      await delay(250)
    }
  }

  throw new Error(`Timed out waiting for Next dev server:\n${serverOutput}`)
}

test.before(async () => {
  port = await getAvailablePort()
  baseUrl = `http://127.0.0.1:${port}`

  server = spawn(
    process.execPath,
    [nextCli, "dev", "--hostname", "127.0.0.1", "--port", port],
    {
      cwd: rootDir,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  )

  server.stdout.on("data", (chunk) => {
    serverOutput += chunk
  })

  server.stderr.on("data", (chunk) => {
    serverOutput += chunk
  })

  await waitForServer()
})

test.after(async () => {
  if (!server || server.exitCode !== null) {
    return
  }

  server.kill("SIGTERM")
  await once(server, "exit")
})

test("POST /tasks creates a task", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Write demo notes" }),
  })

  assert.equal(response.status, 201)

  const task = await response.json()
  assert.equal(task.title, "Write demo notes")
  assert.equal(typeof task.id, "string")
  assert.ok(task.id.length > 0)
})

test("POST /tasks returns validation error when title is missing", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  })

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), {
    error: "title must be a non-empty string",
  })
})
