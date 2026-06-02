import { NextResponse } from 'next/server'
import { verifyToken, SESSION_COOKIE } from '@/lib/session'

export async function middleware(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const valid = token ? await verifyToken(token) : false

  if (!valid) {
    const res = NextResponse.redirect(new URL('/', request.url))
    res.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' })
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin'],
}
