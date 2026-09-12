"use client"

import { useState } from "react"

export default function DemoTasksPage() {
  const [title, setTitle] = useState("")
  const [count, setCount] = useState(0)

  async function handleCreateTask() {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })

    const res = await fetch("/api/tasks/summary")
    const data = await res.json()
    setCount(data.total)
  }

  return (
    <main>
      <h1>Demo tasks</h1>
      <input
        id="task-title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button id="create-task-button" onClick={handleCreateTask}>
        Create task
      </button>
      <p>
        Total tasks: <span id="task-count">{count}</span>
      </p>
    </main>
  )
}
