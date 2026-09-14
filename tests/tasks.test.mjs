import { spawn } from "node:child_process"
import { createServer } from "node:net"
import assert from "node:assert/strict"
import test from "node:test"

const projectRoot = new URL("..", import.meta.url)

let baseUrl
let server
let serverOutput = ""

test.before(async () => {
  const port = await getOpenPort()
  baseUrl = `http://127.0.0.1:${port}`

  server = spawn(
    "npm",
    ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: projectRoot,
      detached: true,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  )

  server.stdout.on("data", captureServerOutput)
  server.stderr.on("data", captureServerOutput)

  await waitForServer(`${baseUrl}/healthz`)
})

test.after(async () => {
  await stopServer()
})

test("POST /tasks creates a task", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Write demo notes" }),
  })

  assert.equal(response.status, 201)
  assert.deepEqual(await response.json(), {
    id: 1,
    title: "Write demo notes",
  })
})

test("POST /tasks returns a validation error when title is missing", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  })

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), {
    error: "title must be a string",
  })
})

function captureServerOutput(chunk) {
  serverOutput += chunk.toString()
}

async function stopServer() {
  if (server === undefined || server.pid === undefined || server.exitCode !== null) {
    return
  }

  try {
    process.kill(-server.pid, "SIGTERM")
  } catch {
    return
  }

  await delay(500)

  if (server.exitCode === null) {
    try {
      process.kill(-server.pid, "SIGKILL")
    } catch {
      // The process may have exited between the status check and signal.
    }
  }
}

async function waitForServer(url) {
  const timeoutMs = 30_000
  const startedAt = Date.now()
  let lastError

  while (Date.now() - startedAt < timeoutMs) {
    if (server.exitCode !== null) {
      throw new Error(`Next dev server exited early.\n${serverOutput}`)
    }

    try {
      const response = await fetch(url)

      if (response.ok) {
        return
      }
    } catch (error) {
      lastError = error
    }

    await delay(250)
  }

  throw new Error(
    `Next dev server did not become ready: ${String(lastError)}\n${serverOutput}`,
  )
}

function getOpenPort() {
  return new Promise((resolve, reject) => {
    const socket = createServer()

    socket.unref()
    socket.on("error", reject)
    socket.listen(0, "127.0.0.1", () => {
      const address = socket.address()

      if (typeof address !== "object" || address === null) {
        reject(new Error("Could not allocate a test port"))
        return
      }

      socket.close(() => resolve(address.port))
    })
  })
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
