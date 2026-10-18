const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const { createRequire } = require("node:module")
const path = require("node:path")
const { test } = require("node:test")
const { runInThisContext } = require("node:vm")
const ts = require("typescript")

// Load the actual TypeScript handler with its @/ alias on Node 20.
// Each test gets a fresh module cache so the in-memory store is isolated.
function loadTaskRoute() {
  const root = path.resolve(__dirname, "..")
  const modules = new Map()

  function load(filename) {
    if (modules.has(filename)) return modules.get(filename).exports
    const module = { exports: {} }
    modules.set(filename, module)
    const nativeRequire = createRequire(filename)
    const requireModule = name => name.startsWith("@/")
      ? load(path.join(root, `${name.slice(2)}.ts`))
      : nativeRequire(name)
    const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
    })
    const execute = runInThisContext(`(function(require, module, exports) {\n${outputText}\n})`, { filename })
    execute(requireModule, module, module.exports)
    return module.exports
  }

  return load(path.join(root, "app/tasks/route.ts"))
}

function request(body) {
  return new Request("http://localhost/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

test("POST /tasks creates a task with all fields and the current total", async () => {
  const { POST } = loadTaskRoute()
  const input = { title: "Fix the save button", category: "Bug", priority: "High", urgent: true }

  const response = await POST(request(input))
  assert.equal(response.status, 201)
  assert.match(response.headers.get("content-type"), /application\/json/)
  const task = await response.json()
  assert.equal(typeof task.id, "string")
  assert.ok(task.id.length > 0)
  assert.deepEqual(task, { ...input, id: task.id, total: 1 })

  const secondResponse = await POST(request({ ...input, urgent: false }))
  assert.equal(secondResponse.status, 201)
  const secondTask = await secondResponse.json()
  assert.deepEqual(secondTask, { ...input, urgent: false, id: secondTask.id, total: 2 })
  assert.notEqual(secondTask.id, task.id)
})

test("POST /tasks rejects a missing title without creating a task", async () => {
  const { POST } = loadTaskRoute()
  const input = { category: "Feature", priority: "Medium", urgent: false }

  const response = await POST(request(input))
  assert.equal(response.status, 400)
  assert.match(response.headers.get("content-type"), /application\/json/)
  assert.deepEqual(await response.json(), { error: "title is required" })

  const validResponse = await POST(request({ ...input, title: "Add search" }))
  assert.equal(validResponse.status, 201)
  assert.equal((await validResponse.json()).total, 1)
})
