import { randomUUID } from "node:crypto"

type Task = {
  id: string
  title: string
}

// Share data across route bundles in this process, but not across server instances.
const taskGlobal = globalThis as typeof globalThis & { demoTasks?: Task[] }
const tasks = taskGlobal.demoTasks ?? (taskGlobal.demoTasks = [])

export function createTask(title: string) {
  const task: Task = { id: randomUUID(), title }
  tasks.push(task)
  return { ...task, total: tasks.length }
}

export function getTaskTotal() {
  return tasks.length
}
