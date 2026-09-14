import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { once } from "node:events"
import net from "node:net"
import { after, before, test } from "node:test"

let appUrl
let serverProcess
let serverOutput = ""

before(async () => {
  const port = await getAvailablePort()
  appUrl = `http://127.0.0.1:${port}`

  serverProcess = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: process.cwd(),
      detached: process.platform !== "win32",
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  )

  serverProcess.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString()
  })
  serverProcess.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString()
  })

  await waitForServer(`${appUrl}/healthz`)
})

after(async () => {
  if (!serverProcess || serverProcess.exitCode !== null) {
    return
  }

  killServerProcess("SIGTERM")

  const forceKillTimeout = setTimeout(() => {
    killServerProcess("SIGKILL")
  }, 5_000)
  forceKillTimeout.unref()

  try {
    await once(serverProcess, "exit")
  } finally {
    clearTimeout(forceKillTimeout)
  }
})

test("POST /tasks creates a task", async () => {
  const response = await fetch(`${appUrl}/tasks`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ title: "Write endpoint test" }),
  })

  assert.equal(response.status, 201)
  assert.deepEqual(await response.json(), {
    id: 1,
    title: "Write endpoint test",
  })
})

test("POST /tasks returns a validation error when title is missing", async () => {
  const response = await fetch(`${appUrl}/tasks`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({}),
  })

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), {
    error: "Expected title to be a string",
  })
})

async function getAvailablePort() {
  const server = net.createServer()

  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
  })

  const address = server.address()

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })

  if (!address || typeof address === "string") {
    throw new Error("Could not allocate a local test port")
  }

  return address.port
}

async function waitForServer(url) {
  const deadline = Date.now() + 30_000

  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Next dev server exited early:\n${serverOutput}`)
    }

    try {
      const response = await fetch(url)

      if (response.ok) {
        return
      }
    } catch {
      // The server is still starting.
    }

    await sleep(250)
  }

  throw new Error(`Timed out waiting for Next dev server:\n${serverOutput}`)
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

function killServerProcess(signal) {
  if (process.platform === "win32") {
    serverProcess.kill(signal)
    return
  }

  try {
    process.kill(-serverProcess.pid, signal)
  } catch (error) {
    if (error.code !== "ESRCH") {
      throw error
    }
  }
}
