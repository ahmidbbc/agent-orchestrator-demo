import { NextResponse } from "next/server"

import { listTasks } from "../store"

export async function GET() {
  return NextResponse.json({ total: listTasks().length })
}
