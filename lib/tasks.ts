export type TaskInput = {
  title: string
  category: "Feature" | "Bug" | "Chore"
  priority: "Low" | "Medium" | "High"
  urgent: boolean
}

export type Task = TaskInput & { id: string }

// Demo storage: tasks and their count live for the lifetime of this server process.
const tasks: Task[] = []

export function createTask(input: TaskInput) {
  const task: Task = { id: crypto.randomUUID(), ...input }
  tasks.push(task)
  return { ...task, total: tasks.length }
}
