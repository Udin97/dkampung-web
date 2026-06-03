// Middleware is intentionally minimal — the /admin page hosts the login form
// so it must be accessible to unauthenticated users.
// Admin API routes are each individually protected by isAdmin() in lib/session.js.
export function middleware() {
  return
}

export const config = {
  matcher: [],
}
