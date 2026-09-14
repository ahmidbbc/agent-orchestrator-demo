export type Task = {
  id: number
  title: string
}

const tasks: Task[] = []
let nextTaskId = 1

export function createTask(title: string) {
  const task = {
    id: nextTaskId,
    title,
  }

  nextTaskId += 1
  tasks.push(task)

  return task
}

export function getTaskCount() {
  return tasks.length
}
