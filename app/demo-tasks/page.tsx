"use client"

import { useState } from "react"
import type { Task } from "@/lib/tasks"

const priorityIcons = { Low: "↓", Medium: "→", High: "↑" }
const steps = ["Details", "Priority", "Review"]
const fieldClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
const buttonClass = "rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"

export default function DemoTasks() {
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<Task["category"]>("Feature")
  const [priority, setPriority] = useState<Task["priority"]>("Low")
  const [urgent, setUrgent] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ total: number; priority: Task["priority"] } | null>(null)

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
      if (!response.ok) throw new Error(data.error || "Could not create the task. Please try again.")
      if (!Number.isInteger(data.total) || data.total < 1) throw new Error("The server returned an invalid task count.")
      // Use the count from the write itself; another instance may have different data.
      setResult({ total: data.total, priority })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not create the task. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900 sm:py-24">
      <div className="mx-auto max-w-xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">Task workspace</p>
        <h1 className="text-3xl font-bold tracking-tight">Make room for your next idea.</h1>
        <p className="mt-3 text-slate-500">A few details. A clear priority. Ready to get done.</p>
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-label="Create a task">
          <ol className="mb-8 flex items-center justify-between gap-3" aria-label="Progress">
            {steps.map((label, index) => (
              <li key={label} aria-current={!result && step === index + 1 ? "step" : undefined} className={`flex items-center gap-2 text-sm font-medium ${result || step >= index + 1 ? "text-indigo-600" : "text-slate-400"}`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${result || step >= index + 1 ? "bg-indigo-100" : "bg-slate-100"}`}>{index + 1}</span>
                {label}
              </li>
            ))}
          </ol>

          {result ? (
            <div className="py-6 text-center" role="status">
              <span id="result-priority-icon" data-priority={result.priority} aria-label={`${result.priority} priority`} className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-4xl text-indigo-600">{priorityIcons[result.priority]}</span>
              <h2 className="mt-5 text-2xl font-bold">Task created</h2>
              <p className="mt-2 break-words text-slate-500">{title}</p>
              <p className="mt-6 text-sm text-slate-500">Total tasks created</p>
              <p id="task-count" className="mt-1 text-5xl font-bold text-indigo-600">{result.total}</p>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-xl font-semibold">{steps[step - 1]}</h2>
              {step === 1 && (
                <form onSubmit={(event) => { event.preventDefault(); if (title.trim()) setStep(2) }} className="space-y-5">
                  <div>
                    <label htmlFor="task-title-input" className="text-sm font-medium">Task title</label>
                    <input id="task-title-input" type="text" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to get done?" className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="task-category-select" className="text-sm font-medium">Category</label>
                    <select id="task-category-select" value={category} onChange={(event) => setCategory(event.target.value as Task["category"])} className={fieldClass}>
                      <option value="Feature">Feature</option><option value="Bug">Bug</option><option value="Chore">Chore</option>
                    </select>
                  </div>
                  <div className="flex justify-end pt-3"><button id="step1-next-button" type="submit" disabled={!title.trim()} className={buttonClass}>Next →</button></div>
                </form>
              )}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="task-priority-select" className="text-sm font-medium">Priority</label>
                    <select id="task-priority-select" value={priority} onChange={(event) => setPriority(event.target.value as Task["priority"])} className={fieldClass}>
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                  <label htmlFor="task-urgent-switch" className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
                    <span><span className="block font-medium">Mark as urgent</span><span className="text-sm text-slate-500">This task needs prompt attention.</span></span>
                    <span className="relative inline-flex shrink-0">
                      <input id="task-urgent-switch" type="checkbox" checked={urgent} onChange={(event) => setUrgent(event.target.checked)} className="peer h-7 w-12 cursor-pointer appearance-none rounded-full bg-slate-300 transition-colors checked:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" />
                      <span aria-hidden="true" className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                    </span>
                  </label>
                  <div className="flex items-center justify-between pt-3">
                    <button type="button" onClick={() => setStep(1)} className="rounded-lg px-3 py-2 text-slate-600">Back</button>
                    <button id="step2-next-button" type="button" onClick={() => setStep(3)} className={buttonClass}>Review →</button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <dl className="space-y-4 rounded-xl bg-slate-50 p-5">
                    {[["Title", title], ["Category", category], ["Priority", priority], ["Urgent", urgent ? "Yes" : "No"]].map(([label, value]) => (
                      <div key={label} className="grid grid-cols-3 gap-4"><dt className="text-sm text-slate-500">{label}</dt><dd className="col-span-2 break-words font-medium">{value}</dd></div>
                    ))}
                  </dl>
                  {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
                  <div className="mt-6 flex items-center justify-between">
                    <button type="button" disabled={pending} onClick={() => { setError(""); setStep(2) }} className="rounded-lg px-3 py-2 text-slate-600 disabled:opacity-50">Back</button>
                    <button id="validate-button" type="button" disabled={pending} onClick={validate} className={buttonClass}>{pending ? "Creating…" : "Create task"}</button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}
