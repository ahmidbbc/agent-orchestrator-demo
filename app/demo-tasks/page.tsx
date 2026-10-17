"use client"

import { useRef, useState } from "react"
import type { TaskInput } from "@/lib/tasks"

const steps = ["Details", "Priority", "Review"]
const priorityIcons = { Low: "↓", Medium: "→", High: "↑" }
const fieldClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
const buttonClass = "rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 disabled:cursor-wait disabled:opacity-60"

export default function DemoTasks() {
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<TaskInput["category"]>("Feature")
  const [priority, setPriority] = useState<TaskInput["priority"]>("Low")
  const [urgent, setUrgent] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const submitting = useRef(false)
  const [result, setResult] = useState<{ total: number; priority: TaskInput["priority"] } | null>(null)

  async function validate() {
    if (submitting.current) return
    submitting.current = true
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
      if (!Number.isInteger(data.total) || data.total < 1) {
        throw new Error("The server returned an invalid task count.")
      }
      // Use the count from this write; a separate request may reach another instance.
      setResult({ total: data.total, priority })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not create the task. Please try again.")
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="w-full max-w-xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">Task workspace</p>
        <h1 className="text-3xl font-bold tracking-tight">Create a task</h1>
        <p className="mt-2 text-slate-500">A little clarity now. A clear next step for your team.</p>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-label="Task creation">
          <ol className="mb-8 flex justify-between gap-3" aria-label="Progress">
            {steps.map((label, index) => (
              <li key={label} aria-current={!result && step === index ? "step" : undefined} className={`flex items-center gap-2 text-sm font-medium ${result || index <= step ? "text-indigo-600" : "text-slate-400"}`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${result || index <= step ? "bg-indigo-100" : "bg-slate-100"}`}>{index + 1}</span>
                {label}
              </li>
            ))}
          </ol>

          {result ? (
            <div role="status" className="py-4 text-center">
              <span id="result-priority-icon" data-priority={result.priority} aria-label={`${result.priority} priority`} className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-4xl text-indigo-600">{priorityIcons[result.priority]}</span>
              <h2 className="mt-5 text-2xl font-semibold">Task created</h2>
              <p className="mt-2 break-words text-slate-500">{title}</p>
              <p className="mt-2 text-sm text-indigo-600">{result.priority} priority</p>
              <div className="mt-8 rounded-xl bg-slate-50 p-6">
                <p id="task-count" className="text-5xl font-bold tracking-tight">{result.total}</p>
                <p className="mt-2 text-sm text-slate-500">Total tasks created</p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-xl font-semibold" aria-live="polite">{steps[step]}</h2>
              {step === 0 && (
                <form onSubmit={event => {
                  event.preventDefault()
                  if (!title.trim()) { setError("Enter a task title."); return }
                  setError("")
                  setStep(1)
                }} className="space-y-5">
                  <div>
                    <label htmlFor="task-title-input" className="text-sm font-medium">Task title</label>
                    <input id="task-title-input" type="text" required value={title} onChange={event => setTitle(event.target.value)} placeholder="What needs to be done?" className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="task-category-select" className="text-sm font-medium">Category</label>
                    <select id="task-category-select" value={category} onChange={event => setCategory(event.target.value as TaskInput["category"])} className={fieldClass}>
                      <option value="Feature">Feature</option>
                      <option value="Bug">Bug</option>
                      <option value="Chore">Chore</option>
                    </select>
                  </div>
                  <div className="flex justify-end pt-3"><button id="step1-next-button" type="submit" className={buttonClass}>Next: Priority</button></div>
                </form>
              )}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="task-priority-select" className="text-sm font-medium">Priority</label>
                    <select id="task-priority-select" value={priority} onChange={event => setPriority(event.target.value as TaskInput["priority"])} className={fieldClass}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <label htmlFor="task-urgent-switch" className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-4">
                    <span><span className="block font-medium">Urgent task</span><span className="text-sm text-slate-500">Needs immediate attention</span></span>
                    <span className="relative inline-flex shrink-0">
                      <input id="task-urgent-switch" type="checkbox" checked={urgent} onChange={event => setUrgent(event.target.checked)} className="peer h-7 w-12 cursor-pointer appearance-none rounded-full bg-slate-300 transition-colors checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600" />
                      <span aria-hidden="true" className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                    </span>
                  </label>
                  <div className="flex justify-end pt-3"><button id="step2-next-button" type="button" onClick={() => setStep(2)} className={buttonClass}>Next: Review</button></div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <dl className="space-y-4 rounded-xl bg-slate-50 p-5">
                    {[["Title", title], ["Category", category], ["Priority", priority], ["Urgent", urgent ? "Yes" : "No"]].map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[5rem_1fr] gap-4">
                        <dt className="text-sm text-slate-500">{label}</dt>
                        <dd className="break-words font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-8 flex justify-end"><button id="validate-button" type="button" disabled={pending} onClick={validate} className={buttonClass}>{pending ? "Creating…" : "Create task"}</button></div>
                </div>
              )}
              {error && <p role="alert" className="mt-4 text-sm font-medium text-slate-700">{error}</p>}
            </>
          )}
        </section>
      </div>
    </main>
  )
}
