"use client"

import { useState } from "react"
import type { TaskInput } from "@/lib/tasks"

const priorityIcons = { Low: "↓", Medium: "→", High: "↑" }
const steps = ["Details", "Priority", "Review"]
const fieldClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
const buttonClass = "rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"

export default function DemoTasksPage() {
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<TaskInput["category"]>("Feature")
  const [priority, setPriority] = useState<TaskInput["priority"]>("Low")
  const [urgent, setUrgent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ total: number; priority: TaskInput["priority"] } | null>(null)

  async function createTask() {
    if (saving) return
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, priority, urgent })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to create task. Please try again.")
      // The count must come from this write, never from a follow-up GET.
      setResult({ total: data.total, priority })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to create task. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 font-sans text-slate-900 sm:py-20">
      <div className="mx-auto max-w-xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">Task workspace</p>
        <h1 className="text-3xl font-bold tracking-tight">A little clarity. A next step.</h1>
        <p className="mt-3 text-slate-500">Turn your next idea into a task in three simple steps.</p>

        <ol aria-label="Task creation steps" className="my-8 flex gap-3">
          {steps.map((label, index) => (
            <li key={label} aria-current={!result && step === index ? "step" : undefined} className={`flex flex-1 items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium ${result || index <= step ? "bg-indigo-100 text-indigo-800" : "bg-slate-200 text-slate-500"}`}>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white">{index + 1}</span>
              {label}
            </li>
          ))}
        </ol>

        <section aria-label={result ? "Task created" : steps[step]} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {result ? (
            <div role="status" className="py-4 text-center">
              <span id="result-priority-icon" data-priority={result.priority} role="img" aria-label={`${result.priority} priority`} className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-4xl text-indigo-700">{priorityIcons[result.priority]}</span>
              <h2 className="mt-6 text-2xl font-bold">Task created</h2>
              <p className="mt-2 break-words text-slate-500">{title.trim()}</p>
              <p className="mt-8 text-sm font-medium text-slate-500">Total tasks created</p>
              <p id="task-count" className="mt-2 text-5xl font-bold text-indigo-600">{result.total}</p>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-xl font-bold" aria-live="polite">{steps[step]}</h2>
              {step === 0 && (
                <form onSubmit={event => { event.preventDefault(); if (title.trim()) setStep(1) }} className="space-y-5">
                  <div>
                    <label htmlFor="task-title-input" className="text-sm font-medium">Task title</label>
                    <input id="task-title-input" type="text" required value={title} onChange={event => setTitle(event.target.value)} placeholder="What needs to happen?" className={fieldClass} />
                  </div>
                  <div>
                    <label htmlFor="task-category-select" className="text-sm font-medium">Category</label>
                    <select id="task-category-select" value={category} onChange={event => setCategory(event.target.value as TaskInput["category"])} className={fieldClass}>
                      <option value="Feature">Feature</option>
                      <option value="Bug">Bug</option>
                      <option value="Chore">Chore</option>
                    </select>
                  </div>
                  <div className="flex justify-end pt-3"><button id="step1-next-button" type="submit" disabled={!title.trim()} className={buttonClass}>Next: Priority</button></div>
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
                    <span><span className="block font-medium">Urgent task</span><span className="text-sm text-slate-500">Flag this for immediate attention.</span></span>
                    <span className="relative ml-4 inline-flex shrink-0">
                      <input id="task-urgent-switch" type="checkbox" checked={urgent} onChange={event => setUrgent(event.target.checked)} className="peer h-7 w-12 cursor-pointer appearance-none rounded-full bg-slate-300 transition-colors checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600" />
                      <span aria-hidden="true" className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                    </span>
                  </label>
                  <div className="flex items-center justify-between pt-3">
                    <button type="button" onClick={() => setStep(0)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600">Back</button>
                    <button id="step2-next-button" type="button" onClick={() => setStep(2)} className={buttonClass}>Next: Review</button>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <dl className="space-y-4 rounded-xl bg-slate-50 p-5">
                    {[["Title", title.trim()], ["Category", category], ["Priority", priority], ["Urgent", urgent ? "Yes" : "No"]].map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[5rem_1fr] gap-4"><dt className="text-sm text-slate-500">{label}</dt><dd className="break-words font-medium">{value}</dd></div>
                    ))}
                  </dl>
                  {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
                  <div className="mt-6 flex items-center justify-between">
                    <button type="button" disabled={saving} onClick={() => { setError(""); setStep(1) }} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 disabled:opacity-50">Back</button>
                    <button id="validate-button" type="button" disabled={saving} onClick={createTask} className={buttonClass}>{saving ? "Creating…" : "Create task"}</button>
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
