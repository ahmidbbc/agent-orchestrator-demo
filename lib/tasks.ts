// In-memory task store shared across route handlers in this process.
// Intentionally simple for the agent-orchestrator demo mode — not persisted
// across deployments or serverless cold starts.

export const TASK_CATEGORIES = ["Feature", "Bug", "Chore"] as const
export const TASK_PRIORITIES = ["Low", "Medium", "High"] as const

export type TaskCategory = (typeof TASK_CATEGORIES)[number]
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export type Task = {
  id: string
  title: string
  category: TaskCategory
  priority: TaskPriority
  urgent: boolean
  createdAt: string
}

const tasks: Task[] = []

export function createTask(input: {
  title: string
  category: TaskCategory
  priority: TaskPriority
  urgent: boolean
}): Task {
  const task: Task = {
    id: crypto.randomUUID(),
    title: input.title,
    category: input.category,
    priority: input.priority,
    urgent: input.urgent,
    createdAt: new Date().toISOString(),
  }
  tasks.push(task)
  return task
}

export function getTaskCount(): number {
  return tasks.length
}
