export type Task = {
  id: string
  title: string
  category: "Feature" | "Bug" | "Chore"
  priority: "Low" | "Medium" | "High"
  urgent: boolean
}

// Demo storage: tasks persist only for the lifetime of this server process.
const tasks: Task[] = []

export function createTask(input: Omit<Task, "id">) {
  const task: Task = { id: crypto.randomUUID(), ...input }
  tasks.push(task)
  return { ...task, total: tasks.length }
}
