import { randomUUID } from "node:crypto"

type Task = {
  id: string
  title: string
}

// Share the store across route bundles within the same server process.
const taskStore = globalThis as typeof globalThis & { demoTasks?: Task[] }
const tasks = (taskStore.demoTasks ??= [])

export function getTaskCount(): number {
  return tasks.length
}

export function createTask(title: string): Task {
  const task = { id: randomUUID(), title }
  tasks.push(task)
  return task
}
