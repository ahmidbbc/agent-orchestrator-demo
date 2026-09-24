export type Task = {
  id: string
  title: string
  category: "Feature" | "Bug" | "Chore"
  priority: "Low" | "Medium" | "High"
  urgent: boolean
}

// Demo storage is local to this server process and resets on restart.
const taskStore = globalThis as typeof globalThis & { demoTasks?: Task[] }
const tasks = taskStore.demoTasks ?? (taskStore.demoTasks = [])

export function getTaskTotal() {
  return tasks.length
}

export function createTask(input: Omit<Task, "id">) {
  const task: Task = { id: crypto.randomUUID(), ...input }
  tasks.push(task)
  return { ...task, total: tasks.length }
}
