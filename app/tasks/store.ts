import { randomUUID } from "node:crypto"

type Task = {
  id: string
  title: string
}

// Share data across route bundles within this process, without persisting it.
const taskStore = globalThis as typeof globalThis & { demoTasks?: Task[] }
const tasks = taskStore.demoTasks ??= []

export function createTask(title: string) {
  const task: Task = { id: randomUUID(), title }
  tasks.push(task)
  return { ...task, total: tasks.length }
}

export function getTaskTotal() {
  return tasks.length
}
