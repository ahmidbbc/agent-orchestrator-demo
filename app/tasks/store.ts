export type Task = {
  id: string
  title: string
}

// Share the store across route bundles within this server instance.
const taskGlobal = globalThis as typeof globalThis & { demoTasks?: Task[] }
export const tasks = taskGlobal.demoTasks ?? (taskGlobal.demoTasks = [])
