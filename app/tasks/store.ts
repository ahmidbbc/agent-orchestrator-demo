export type Task = {
  id: string
  title: string
}

const tasks: Task[] = []

export function createTask(title: string): Task {
  const task = {
    id: crypto.randomUUID(),
    title,
  }

  tasks.push(task)

  return task
}

export function listTasks(): Task[] {
  return tasks
}
