"use client"

import { useState } from "react"
import type { Task } from "@/lib/tasks"

const priorityIcons = { Low: "↓", Medium: "→", High: "↑" }
const steps = ["Details", "Priority", "Review"]
const fieldClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
const buttonClass = "rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-wait disabled:opacity-60"

export default function DemoTasks() {
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
      // Use the write response: another request may reach a different instance.
      setResult({ total: data.total, priority })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create task. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12 text-slate-900 sm:py-20">
      <div className="mx-auto max-w-xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">Task studio</p>
        <h1 className="text-3xl font-bold tracking-tight">Make your next move.</h1>
        <p className="mt-3 text-slate-600">A few details. A clear priority. Ready to go.</p>
        <ol aria-label="Task creation steps" className="my-8 flex gap-3">
          {steps.map((label, index) => (
            <li key={label} aria-current={!result && step === index + 1 ? "step" : undefined}
              className={`flex flex-1 items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium ${result || step >= index + 1 ? "bg-indigo-100 text-indigo-800" : "bg-white text-slate-500"}`}>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current">{index + 1}</span>
              {label}
            </li>
          ))}
        </ol>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="step-heading">
          {result ? (
            <div role="status" className="text-center">
              <span id="result-priority-icon" data-priority={result.priority} aria-label={`${result.priority} priority`}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-4xl text-indigo-700">
                {priorityIcons[result.priority]}
              </span>
              <h2 id="step-heading" className="text-2xl font-semibold">Task created</h2>
              <p className="mt-2 break-words text-slate-600">{title}</p>
              <p className="mt-6 text-sm text-slate-500">Total tasks created</p>
              <p id="task-count" className="mt-1 text-5xl font-bold text-indigo-600">{result.total}</p>
            </div>
          ) : (
            <>
              <h2 id="step-heading" className="mb-6 text-xl font-semibold">{steps[step - 1]}</h2>
              {step === 1 && (
                <form onSubmit={event => { event.preventDefault(); setStep(2) }} className="space-y-5">
                  <div>
                    <label htmlFor="task-title-input" className="text-sm font-medium">Task title</label>
                    <input id="task-title-input" type="text" required value={title} onChange={event => setTitle(event.target.value)}
                      placeholder="What needs to get done?" className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="task-category-select" className="text-sm font-medium">Category</label>
                    <select id="task-category-select" value={category} onChange={event => setCategory(event.target.value as Task["category"])} className={fieldClass}>
                      <option value="Feature">Feature</option><option value="Bug">Bug</option><option value="Chore">Chore</option>
                    </select>
                  </div>
                  <button id="step1-next-button" type="submit" className={buttonClass} disabled={!title.trim()}>Continue</button>
                </form>
              )}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="task-priority-select" className="text-sm font-medium">Priority</label>
                    <select id="task-priority-select" value={priority} onChange={event => setPriority(event.target.value as Task["priority"])} className={fieldClass}>
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                  <label htmlFor="task-urgent-switch" className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-4">
                    <span><span className="block font-medium">Urgent</span><span className="text-sm text-slate-500">Needs attention right away</span></span>
                    <span className="relative inline-flex h-7 w-12 shrink-0">
                      <input id="task-urgent-switch" type="checkbox" checked={urgent} onChange={event => setUrgent(event.target.checked)}
                        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
                      <span aria-hidden="true" className="h-7 w-12 rounded-full bg-slate-300 transition-colors peer-checked:bg-indigo-600 peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-200" />
                      <span aria-hidden="true" className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                    </span>
                  </label>
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setStep(1)} className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100">Back</button>
                    <button id="step2-next-button" type="button" onClick={() => setStep(3)} className={buttonClass}>Review task</button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-6">
                  <dl className="space-y-4 rounded-xl bg-slate-50 p-5">
                    {[["Title", title], ["Category", category], ["Priority", priority], ["Urgent", urgent ? "Yes" : "No"]].map(([label, value]) => (
                      <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 break-words font-medium">{value}</dd></div>
                    ))}
                  </dl>
                  {error && <p role="alert" className="rounded-xl border border-slate-300 p-3 text-sm">{error}</p>}
                  <div className="flex items-center justify-between">
                    <button type="button" disabled={pending} onClick={() => { setError(""); setStep(2) }} className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100">Back</button>
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
