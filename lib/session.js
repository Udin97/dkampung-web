const ALGO = { name: 'HMAC', hash: 'SHA-256' }
export const SESSION_COOKIE = 'dk_admin'
const TTL = 60 * 60 * 24 // 24 hours in seconds

async function getKey() {
  const raw = new TextEncoder().encode(process.env.ADMIN_PASSWORD || '__fallback__')
  return crypto.subtle.importKey('raw', raw, ALGO, false, ['sign', 'verify'])
}

export async function createToken() {
  const exp = Math.floor(Date.now() / 1000) + TTL
  const payload = btoa(JSON.stringify({ exp }))
  const key = await getKey()
  const sigBuf = await crypto.subtle.sign(ALGO, key, new TextEncoder().encode(payload))
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf)))
  return `${payload}.${sig}`
}

export async function verifyToken(token) {
  try {
    const dot = token.lastIndexOf('.')
    if (dot === -1) return false
    const payload = token.slice(0, dot)
    const sig = token.slice(dot + 1)
    const key = await getKey()
    const sigBytes = Uint8Array.from(atob(sig), c => c.charCodeAt(0))
    const valid = await crypto.subtle.verify(ALGO, key, sigBytes, new TextEncoder().encode(payload))
    if (!valid) return false
    const { exp } = JSON.parse(atob(payload))
    return typeof exp === 'number' && exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export async function isAdmin(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  return token ? verifyToken(token) : false
}
