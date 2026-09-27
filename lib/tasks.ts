import { randomUUID } from "node:crypto"

export type TaskInput = {
  title: string
  category: "Feature" | "Bug" | "Chore"
  priority: "Low" | "Medium" | "High"
  urgent: boolean
}

export type Task = TaskInput & { id: string }

// Demo storage is local to this server instance and resets on restart.
const taskStore = globalThis as typeof globalThis & { demoTasks?: Task[] }
const tasks = taskStore.demoTasks ??= []

export function getTaskTotal() {
  return tasks.length
}

export function createTask(input: TaskInput) {
  const task: Task = { id: randomUUID(), ...input }
  tasks.push(task)
  return { ...task, total: tasks.length }
}
