"use client"

import { useRef, useState } from "react"
import type { Task } from "@/lib/tasks"

const priorityIcons = { Low: "↓", Medium: "→", High: "↑" }
const fieldClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
const buttonClass = "rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"

export default function DemoTasks() {
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<Task["category"]>("Feature")
  const [priority, setPriority] = useState<Task["priority"]>("Low")
  const [urgent, setUrgent] = useState(false)
  const [result, setResult] = useState<{ total: number; priority: Task["priority"] } | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const submitting = useRef(false)

  async function validate() {
    if (submitting.current) return
    submitting.current = true
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, priority, urgent }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not create the task.")
      if (!Number.isInteger(data.total) || data.total < 0) {
        throw new Error("The server did not return a valid task count.")
      }
      setResult({ total: data.total, priority })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the task. Please try again.")
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-16 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">Task studio</p>
        <h1 className="text-3xl font-bold tracking-tight">Create a task</h1>
        <p className="mt-2 text-slate-600">A few details. A clear priority. Ready to go.</p>
        <ol aria-label="Task creation progress" className="my-8 flex gap-3">
          {["Details", "Priority", "Review"].map((label, index) => (
            <li key={label} aria-current={!result && step === index + 1 ? "step" : undefined}
              className={`flex flex-1 items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium ${result || step >= index + 1 ? "bg-indigo-100 text-indigo-800" : "bg-white text-slate-500"}`}>
              <span className="font-bold">{index + 1}</span>{label}
            </li>
          ))}
        </ol>
        <section aria-label={result ? "Task created" : `Step ${step}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {result ? (
            <div role="status" className="text-center">
              <span id="result-priority-icon" data-priority={result.priority} role="img" aria-label={`${result.priority} priority`}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-4xl text-indigo-700">
                {priorityIcons[result.priority]}
              </span>
              <h2 className="mt-5 text-2xl font-bold">Task created</h2>
              <p className="mt-2 break-words text-slate-600">{title}</p>
              <p className="mt-2 text-sm text-slate-500">{result.priority} priority</p>
              <div className="mt-6 rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-600">Total tasks created</p>
                <p id="task-count" className="mt-1 text-4xl font-bold text-indigo-600">{result.total}</p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-xl font-bold">{["Details", "Priority", "Review"][step - 1]}</h2>
              {step === 1 && (
                <form onSubmit={event => {
                  event.preventDefault()
                  if (!title.trim()) { setError("Enter a task title."); return }
                  setError("")
                  setStep(2)
                }} className="space-y-5">
                  <div>
                    <label htmlFor="task-title-input" className="text-sm font-medium">Title</label>
                    <input id="task-title-input" type="text" required value={title} onChange={event => setTitle(event.target.value)} className={fieldClass} placeholder="What needs to be done?" />
                  </div>
                  <div>
                    <label htmlFor="task-category-select" className="text-sm font-medium">Category</label>
                    <select id="task-category-select" value={category} onChange={event => setCategory(event.target.value as Task["category"])} className={fieldClass}>
                      <option value="Feature">Feature</option><option value="Bug">Bug</option><option value="Chore">Chore</option>
                    </select>
                  </div>
                  <div className="flex justify-end"><button id="step1-next-button" type="submit" className={buttonClass}>Next: Priority</button></div>
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
                  <label htmlFor="task-urgent-switch" className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
                    <span><span className="block font-medium">Urgent</span><span className="text-sm text-slate-500">Needs immediate attention</span></span>
                    <span className="relative inline-flex">
                      <input id="task-urgent-switch" type="checkbox" checked={urgent} onChange={event => setUrgent(event.target.checked)} className="peer h-7 w-12 cursor-pointer appearance-none rounded-full bg-slate-300 transition-colors checked:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" />
                      <span aria-hidden="true" className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                    </span>
                  </label>
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setStep(1)} className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100">Back</button>
                    <button id="step2-next-button" type="button" onClick={() => setStep(3)} className={buttonClass}>Next: Review</button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <dl className="space-y-4 rounded-xl bg-slate-50 p-5">
                    {[["Title", title], ["Category", category], ["Priority", priority], ["Urgent", urgent ? "Yes" : "No"]].map(([label, value]) => (
                      <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 break-words font-medium">{value}</dd></div>
                    ))}
                  </dl>
                  <div className="mt-6 flex items-center justify-between">
                    <button type="button" disabled={saving} onClick={() => { setError(""); setStep(2) }} className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50">Back</button>
                    <button id="validate-button" type="button" disabled={saving} onClick={validate} className={buttonClass}>{saving ? "Creating…" : "Validate & create"}</button>
                  </div>
                </div>
              )}
              {error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}
            </>
          )}
        </section>
      </div>
    </main>
  )
}
