import { randomUUID } from "node:crypto"

type Task = { id: string; title: string }

// Share data across route bundles in this process. Serverless instances each
// have their own store, and restarting an instance clears its tasks.
const taskGlobal = globalThis as typeof globalThis & { demoTasks?: Task[] }
const tasks = (taskGlobal.demoTasks ??= [])

export function createTask(title: string) {
  const task = { id: randomUUID(), title }
  tasks.push(task)
  return { ...task, total: tasks.length }
}

export function getTaskCount() {
  return tasks.length
}
