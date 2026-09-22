import { randomUUID } from "node:crypto"

type Task = {
  id: string
  title: string
}

// Demo-only storage: tasks live for the lifetime of this server process.
const taskStore = globalThis as typeof globalThis & { demoTasks?: Task[] }
const tasks = taskStore.demoTasks ?? (taskStore.demoTasks = [])

export function getTaskCount(): number {
  return tasks.length
}

export function createTask(title: string): Task {
  const task = { id: randomUUID(), title }
  tasks.push(task)
  return task
}
