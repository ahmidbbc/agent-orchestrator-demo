"use client"

import { useState } from "react"
import type { Task } from "@/lib/tasks"

const priorityIcons = { Low: "↓", Medium: "→", High: "↑" }
const fieldClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
const buttonClass = "mt-8 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"

export default function DemoTasksPage() {
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<Task["category"]>("Feature")
  const [priority, setPriority] = useState<Task["priority"]>("Low")
  const [urgent, setUrgent] = useState(false)
  const [result, setResult] = useState<{ total: number; priority: Task["priority"] } | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function validate() {
    if (pending) return
    setPending(true)
    setError("")
    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, priority, urgent }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to create task")
      if (!Number.isInteger(data.total) || data.total < 1) {
        throw new Error("The server returned an invalid task count")
      }
      setResult({ total: data.total, priority })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create task. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-lg">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">Task studio</p>
        <h1 className="text-3xl font-bold">Make room for your next idea.</h1>
        <p className="mb-8 mt-3 text-slate-600">Create a task in three simple steps.</p>
        <section className="rounded-2xl bg-white p-8 shadow-sm" aria-label="Create a task">
          <ol className="mb-8 flex justify-between gap-3" aria-label="Progress">
            {["Details", "Priority", "Review"].map((label, index) => (
              <li key={label} aria-current={!result && step === index + 1 ? "step" : undefined}
                className={`flex items-center gap-2 text-sm ${step >= index + 1 ? "font-semibold text-indigo-600" : "text-slate-400"}`}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">{index + 1}</span>
                {label}
              </li>
            ))}
          </ol>
          {result ? (
            <div className="text-center" role="status">
              <span id="result-priority-icon" data-priority={result.priority} aria-label={`${result.priority} priority`}
                className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-4xl text-indigo-600">
                {priorityIcons[result.priority]}
              </span>
              <h2 className="mt-5 text-2xl font-bold">Task created</h2>
              <p className="mt-2 text-slate-600">{title}</p>
              <p className="mt-8 text-sm text-slate-500">Total tasks created</p>
              <p id="task-count" className="mt-2 text-5xl font-bold text-indigo-600">{result.total}</p>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-xl font-semibold">{["Details", "Priority", "Review"][step - 1]}</h2>
              {step === 1 && (
                <form onSubmit={event => { event.preventDefault(); setStep(2) }}>
                  <label htmlFor="task-title-input" className="block text-sm font-medium">Title</label>
                  <input id="task-title-input" type="text" required value={title} onChange={event => setTitle(event.target.value)}
                    className={fieldClass} placeholder="What needs to happen?" />
                  <label htmlFor="task-category-select" className="mt-6 block text-sm font-medium">Category</label>
                  <select id="task-category-select" value={category} onChange={event => setCategory(event.target.value as Task["category"])} className={fieldClass}>
                    <option value="Feature">Feature</option><option value="Bug">Bug</option><option value="Chore">Chore</option>
                  </select>
                  <button id="step1-next-button" type="submit" disabled={!title.trim()} className={buttonClass}>Next: Priority</button>
                </form>
              )}
              {step === 2 && (
                <>
                  <label htmlFor="task-priority-select" className="block text-sm font-medium">Priority</label>
                  <select id="task-priority-select" value={priority} onChange={event => setPriority(event.target.value as Task["priority"])} className={fieldClass}>
                    <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                  </select>
                  <label htmlFor="task-urgent-switch" className="mt-6 flex cursor-pointer items-center justify-between gap-4">
                    <span><span className="block font-medium">Urgent</span><span className="text-sm text-slate-500">This task needs immediate attention.</span></span>
                    <span className="relative inline-flex shrink-0">
                      <input id="task-urgent-switch" type="checkbox" checked={urgent} onChange={event => setUrgent(event.target.checked)} className="peer sr-only" />
                      <span aria-hidden="true" className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2" />
                      <span aria-hidden="true" className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                    </span>
                  </label>
                  <button id="step2-next-button" type="button" onClick={() => setStep(3)} className={buttonClass}>Next: Review</button>
                </>
              )}
              {step === 3 && (
                <>
                  <dl className="space-y-4 rounded-xl bg-slate-50 p-5">
                    {[["Title", title], ["Category", category], ["Priority", priority], ["Urgent", urgent ? "Yes" : "No"]].map(([label, value]) => (
                      <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 break-words font-medium">{value}</dd></div>
                    ))}
                  </dl>
                  <button id="validate-button" type="button" onClick={validate} disabled={pending} className={buttonClass}>{pending ? "Creating…" : "Validate"}</button>
                </>
              )}
              {error && <p role="alert" className="mt-4 text-sm text-slate-700">{error}</p>}
            </>
          )}
        </section>
      </div>
    </main>
  )
}
