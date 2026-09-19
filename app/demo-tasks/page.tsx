"use client"

import { useState, type FormEvent } from "react"

export default function DemoTasks() {
  const [title, setTitle] = useState("")
  const [total, setTotal] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unable to create task")
      }

      setTotal(result.total)
      setTitle("")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to create task")
    } finally {
      setSubmitting(false)
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
          disabled={submitting}
        />
        <button id="create-task-button" type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create task"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      <p>Total tasks:</p>
      <output id="task-count" aria-live="polite">{total}</output>
    </main>
  )
}
