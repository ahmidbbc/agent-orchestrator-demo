"use client"

import { useState } from "react"
import type { TaskCategory, TaskPriority } from "@/lib/tasks"

type WizardStep = 1 | 2 | 3 | "result"

const CATEGORIES: TaskCategory[] = ["Feature", "Bug", "Chore"]
const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High"]

const PRIORITY_ICON: Record<TaskPriority, string> = {
  Low: "🟢",
  Medium: "🟠",
  High: "🔴",
}

function StepIndicator({ step }: { step: WizardStep }) {
  const labels = ["Details", "Priority", "Review"]
  const currentN = step === "result" ? 4 : step

  return (
    <div className="mb-8 flex items-center justify-center">
      {labels.map((label, i) => {
        const n = i + 1
        const active = currentN >= n
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  active ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {n}
              </div>
              <span className={`mt-1 text-xs ${active ? "text-indigo-600" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={`mx-2 h-0.5 w-10 ${currentN > n ? "bg-indigo-600" : "bg-gray-200"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function DemoTasksPage() {
  const [step, setStep] = useState<WizardStep>(1)

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<TaskCategory>("Feature")
  const [priority, setPriority] = useState<TaskPriority>("Low")
  const [urgent, setUrgent] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ total: number; priority: TaskPriority } | null>(null)

  async function handleValidate() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, priority, urgent }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? "La création de la tâche a échoué.")
        return
      }
      // The count comes from this POST response's own `total` field, never
      // from a separate GET /tasks/summary call (see task note: on a
      // serverless deployment a follow-up GET can hit a different instance
      // that never saw this write).
      setResult({ total: data.total, priority: data.priority })
      setStep("result")
    } catch {
      setError("Impossible de contacter le serveur.")
    } finally {
      setSubmitting(false)
    }
  }

  function handleRestart() {
    setStep(1)
    setTitle("")
    setCategory("Feature")
    setPriority("Low")
    setUrgent(false)
    setError(null)
    setResult(null)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-xl font-bold text-gray-900">Create a task</h1>

        {step !== "result" && <StepIndicator step={step} />}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Details</h2>

            <div className="flex flex-col gap-1">
              <label htmlFor="task-title-input" className="text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                id="task-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fix login bug"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="task-category-select" className="text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="task-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              id="step1-next-button"
              type="button"
              disabled={title.trim().length === 0}
              onClick={() => setStep(2)}
              className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Priority</h2>

            <div className="flex flex-col gap-1">
              <label htmlFor="task-priority-select" className="text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="task-urgent-switch" className="text-sm font-medium text-gray-700">
                Urgent
              </label>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  id="task-urgent-switch"
                  type="checkbox"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-indigo-600" />
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
              </label>
            </div>

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Back
              </button>
              <button
                id="step2-next-button"
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Review</h2>

            <dl className="flex flex-col gap-2 rounded-lg bg-gray-50 p-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Title</dt>
                <dd className="font-medium text-gray-900">{title}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium text-gray-900">{category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Priority</dt>
                <dd className="font-medium text-gray-900">{priority}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Urgent</dt>
                <dd className="font-medium text-gray-900">{urgent ? "Yes" : "No"}</dd>
              </div>
            </dl>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={submitting}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <button
                id="validate-button"
                type="button"
                onClick={handleValidate}
                disabled={submitting}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Creating…" : "Create task"}
              </button>
            </div>
          </div>
        )}

        {step === "result" && result && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div id="result-priority-icon" data-priority={result.priority} className="text-5xl">
              {PRIORITY_ICON[result.priority]}
            </div>
            <p className="text-sm text-gray-500">Task created successfully.</p>
            <p className="text-sm text-gray-500">
              Total tasks created: <span id="task-count" className="text-lg font-bold text-indigo-600">{result.total}</span>
            </p>
            <button
              type="button"
              onClick={handleRestart}
              className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Create another task
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
