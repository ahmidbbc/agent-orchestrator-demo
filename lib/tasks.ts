import { randomUUID } from "node:crypto"

export type TaskInput = {
  title: string
  category: "Feature" | "Bug" | "Chore"
  priority: "Low" | "Medium" | "High"
  urgent: boolean
}

export type Task = TaskInput & { id: string }

// Demo storage is local to this server process and resets on restart.
const tasks: Task[] = []

export function createTask(input: TaskInput) {
  const task: Task = { id: randomUUID(), ...input }
  tasks.push(task)
  return { ...task, total: tasks.length }
}
