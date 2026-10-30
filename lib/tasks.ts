import { randomUUID } from "node:crypto"

type TaskInput = {
  title: string
  category: "Feature" | "Bug" | "Chore"
  priority: "Low" | "Medium" | "High"
  urgent: boolean
}

type Task = TaskInput & { id: string }

// Demo storage lasts for this server process only.
const tasks: Task[] = []

export function createTask(input: TaskInput): Task & { total: number } {
  const task = { id: randomUUID(), ...input }
  tasks.push(task)
  return { ...task, total: tasks.length }
}
