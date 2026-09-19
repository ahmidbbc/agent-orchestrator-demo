"use client"

import { useState, type FormEvent } from "react"

export default function DemoTasks() {
  const [title, setTitle] = useState("")
  const [total, setTotal] = useState(0)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      if (!response.ok) throw new Error("Could not create task. Please try again.")

      const task = await response.json()
      // Use the count from the instance that handled this write.
      setTotal(task.total)
      setTitle("")
    } catch {
      setError("Could not create task. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <main>
      <h1>Task demo</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="task-title-input">Task title</label>
        <input
          id="task-title-input"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button id="create-task-button" type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create task"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      <p>Total tasks</p>
      <output id="task-count" aria-live="polite">{total}</output>
    </main>
  )
}
