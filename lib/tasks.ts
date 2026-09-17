import { randomUUID } from "node:crypto"

type Task = { id: string; title: string }

// Shared by routes within one process; separate serverless instances have their own store.
const taskGlobal = globalThis as typeof globalThis & { demoTasks?: Task[] }
const tasks = (taskGlobal.demoTasks ??= [])

export function createTask(title: string) {
  const task = { id: randomUUID(), title }
  tasks.push(task)
  return { ...task, total: tasks.length }
}

export function getTaskTotal() {
  return tasks.length
}
