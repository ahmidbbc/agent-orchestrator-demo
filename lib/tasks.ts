import { randomUUID } from "node:crypto"

type Task = {
  id: string
  title: string
}

// Demo-only storage: tasks live for the lifetime of this server process.
const tasks: Task[] = []

export function createTask(title: string): Task {
  const task = { id: randomUUID(), title }
  tasks.push(task)
  return task
}
