import { NextResponse } from "next/server"

import { getTaskCount } from "../store"

export async function GET() {
  return NextResponse.json({ total: getTaskCount() })
}
