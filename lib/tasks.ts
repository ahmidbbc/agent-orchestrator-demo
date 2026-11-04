export type TaskCategory = "Feature" | "Bug" | "Chore"
export type TaskPriority = "Low" | "Medium" | "High"

export interface Task {
  id: string
  title: string
  category: TaskCategory
  priority: TaskPriority
  urgent: boolean
  createdAt: string
}

// In-memory store, scoped to this server process. Good enough for the demo
// mini-sprint (and for the later GET /tasks/summary endpoint to read from).
const tasks: Task[] = []

export function addTask(input: {
  title: string
  category: TaskCategory
  priority: TaskPriority
  urgent: boolean
}): Task {
  const task: Task = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
  }
  tasks.push(task)
  return task
}

export function listTasks(): Task[] {
  return tasks
}

export function taskCount(): number {
  return tasks.length
}
