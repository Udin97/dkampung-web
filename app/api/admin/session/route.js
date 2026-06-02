import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const ok = await isAdmin(request)
  return NextResponse.json({ ok }, { status: ok ? 200 : 401 })
}
