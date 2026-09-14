import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { existsSync, rmSync } from "node:fs"
import net from "node:net"
import { after, before, test } from "node:test"

const cwd = process.cwd()
const nextEnvPath = "next-env.d.ts"
const hadNextEnv = existsSync(nextEnvPath)

let app
let baseUrl

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer()

    server.once("error", reject)
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()

      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Unable to allocate test port")))
        return
      }

      const { port } = address
      server.close(() => resolve(port))
    })
  })
}

async function waitForApp(url, getOutput) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < 30_000) {
    if (app.exitCode !== null) {
      throw new Error(`Next dev server exited early:\n${getOutput()}`)
    }

    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // Retry until Next has finished booting.
    }

    await delay(250)
  }

  throw new Error(`Timed out waiting for Next dev server:\n${getOutput()}`)
}

before(async () => {
  const port = await getAvailablePort()
  baseUrl = `http://127.0.0.1:${port}`

  const output = []
  app = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  )

  app.stdout.on("data", (chunk) => output.push(chunk.toString()))
  app.stderr.on("data", (chunk) => output.push(chunk.toString()))

  await waitForApp(`${baseUrl}/healthz`, () => output.join(""))
})

after(async () => {
  if (app && app.exitCode === null) {
    app.kill("SIGTERM")
    await new Promise((resolve) => app.once("exit", resolve))
  }

  if (!hadNextEnv && existsSync(nextEnvPath)) {
    rmSync(nextEnvPath)
  }
})

test("POST /tasks creates a task", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Prepare live demo" }),
  })

  assert.equal(response.status, 201)

  const task = await response.json()
  assert.equal(task.title, "Prepare live demo")
  assert.equal(typeof task.id, "string")
  assert.match(task.id, /^[0-9a-f-]{36}$/)
})

test("POST /tasks returns a validation error when title is missing", async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  })

  assert.equal(response.status, 400)

  const body = await response.json()
  assert.deepEqual(body, { error: "Expected title to be a string" })
})
