const assert = require("node:assert/strict")
const { spawn } = require("node:child_process")
const net = require("node:net")
const path = require("node:path")
const { after, before, test } = require("node:test")

const rootDir = path.join(__dirname, "..")

let server
let baseUrl
let output = ""

before(async () => {
  const port = await getAvailablePort()
  baseUrl = `http://127.0.0.1:${port}`

  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: rootDir,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  )

  server.stdout.on("data", (chunk) => {
    output += chunk
  })
  server.stderr.on("data", (chunk) => {
    output += chunk
  })

  await waitForServer()
})

after(() => {
  if (server) {
    server.kill()
  }
})

test("POST /tasks creates a task", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Write endpoint test" }),
  })

  assert.equal(response.status, 201)

  const task = await response.json()

  assert.equal(task.title, "Write endpoint test")
  assert.equal(typeof task.id, "string")
  assert.ok(task.id.length > 0)
})

test("POST /tasks returns a validation error when title is missing", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  })

  assert.equal(response.status, 400)

  const body = await response.json()

  assert.deepEqual(body, { error: "Expected body with string title" })
})

async function getAvailablePort() {
  const testServer = net.createServer()

  return new Promise((resolve, reject) => {
    testServer.once("error", reject)
    testServer.listen(0, "127.0.0.1", () => {
      const address = testServer.address()
      testServer.close(() => {
        if (typeof address === "object" && address !== null) {
          resolve(address.port)
        } else {
          reject(new Error("Could not allocate a test port"))
        }
      })
    })
  })
}

async function waitForServer() {
  const deadline = Date.now() + 30_000

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Next dev server exited before tests started:\n${output}`)
    }

    try {
      const response = await fetch(`${baseUrl}/healthz`)

      if (response.ok) {
        return
      }
    } catch {
      // Retry until Next finishes starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for Next dev server:\n${output}`)
}
