import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { after, before, test } from "node:test"

const host = "127.0.0.1"
const port = 3137
const baseUrl = `http://${host}:${port}`

function startServer() {
  const server = spawn(
    "node_modules/.bin/next",
    ["dev", "--hostname", host, "--port", String(port)],
    {
      cwd: process.cwd(),
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  )

  let output = ""
  server.stdout.on("data", (chunk) => {
    output += chunk.toString()
  })
  server.stderr.on("data", (chunk) => {
    output += chunk.toString()
  })

  return { server, getOutput: () => output }
}

async function waitForServer(getOutput) {
  const deadline = Date.now() + 30_000

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/healthz`)

      if (response.ok) {
        return
      }
    } catch {
      // Retry until Next finishes booting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for test server:\n${getOutput()}`)
}

async function stopServer(server) {
  if (server.exitCode !== null) {
    return
  }

  server.kill("SIGTERM")

  await new Promise((resolve) => {
    server.once("exit", resolve)
    setTimeout(resolve, 5_000)
  })
}

let testServer

before(async () => {
  testServer = startServer()
  await waitForServer(testServer.getOutput)
})

after(async () => {
  if (!testServer) {
    return
  }

  await stopServer(testServer.server)
})

test("POST /tasks creates a task", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Write demo script" }),
  })

  assert.equal(response.status, 201)
  assert.deepEqual(await response.json(), {
    id: 1,
    title: "Write demo script",
  })
})

test("POST /tasks returns validation error when title is missing", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  })

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), {
    error: "Expected JSON body with string title",
  })
})
