import { NextResponse } from "next/server"

// Fixed contract checked by internal/demo/playwright/demo.spec.js (agent-orchestrator).
// Do not rename this path or the response shape without updating that script.
export async function GET() {
  return NextResponse.json({ status: "ok" })
}
