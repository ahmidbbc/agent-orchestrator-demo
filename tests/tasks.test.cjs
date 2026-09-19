const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const Module = require("node:module")
const { test } = require("node:test")
const ts = require("typescript")

// Compile the actual route in memory so Node can test TypeScript without a build.
const filename = require.resolve("../app/tasks/route.ts")
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2017
  }
})
const route = new Module(filename, module)
route.filename = filename
route.paths = module.paths
route._compile(outputText, filename)
const { POST } = route.exports

function request(body) {
  return new Request("http://localhost/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
}

test("POST /tasks creates a task and returns it as JSON", async () => {
  const response = await POST(request({ title: "Demo task" }))

  assert.equal(response.status, 201)
  assert.match(response.headers.get("content-type"), /application\/json/)
  const task = await response.json()
  assert.equal(task.title, "Demo task")
  assert.equal(typeof task.id, "string")
  assert.ok(task.id.length > 0)
})

test("POST /tasks returns a validation error when title is missing", async () => {
  const response = await POST(request({}))

  assert.equal(response.status, 400)
  assert.match(response.headers.get("content-type"), /application\/json/)
  assert.deepEqual(await response.json(), {
    error: "title must be a non-empty string"
  })
})
