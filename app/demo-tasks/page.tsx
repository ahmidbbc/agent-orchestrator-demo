"use client"

import { useState, type FormEvent } from "react"

export default function DemoTasks() {
  const [title, setTitle] = useState("")
  const [total, setTotal] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Could not create task")
      }

      setTotal(result.total)
      setTitle("")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not create task")
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
        />
        <button id="create-task-button" type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create task"}
        </button>
      </form>
      <p>Tasks created</p>
      <p id="task-count" aria-live="polite">{total}</p>
      {error && <p role="alert">{error}</p>}
    </main>
  )
}
