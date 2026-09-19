import { randomUUID } from "node:crypto"

type Task = {
  id: string
  title: string
}

const tasks: Task[] = []

export function createTask(title: string): Task {
  const task = { id: randomUUID(), title }
  tasks.push(task)
  return task
}
