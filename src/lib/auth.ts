// 인증 유틸 — Web Crypto 기반 (Cloudflare Workers 호환)

const enc = new TextEncoder()

function toB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromB64(s: string): Uint8Array {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  const arr = new Uint8Array(b.length)
  for (let i = 0; i < b.length; i++) arr[i] = b.charCodeAt(i)
  return arr
}

// ===== 비밀번호 해시 (PBKDF2) =====
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  )
  return `pbkdf2$${toB64(salt)}$${toB64(bits)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 3 || parts[0] !== 'pbkdf2') return false
  const salt = fromB64(parts[1])
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  )
  return toB64(bits) === parts[2]
}

// ===== 세션 쿠키 (HMAC 서명) =====
const SECRET = 'gdfirst-dental-session-secret-v1' // 배포 시 env SESSION_SECRET 권장

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return toB64(sig)
}

export interface Session {
  uid?: number
  name?: string
  admin?: boolean
  exp: number
}

export async function createSession(payload: Omit<Session, 'exp'>, secret = SECRET): Promise<string> {
  const sess: Session = { ...payload, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 } // 7일
  const data = toB64(enc.encode(JSON.stringify(sess)))
  const sig = await hmac(data, secret)
  return `${data}.${sig}`
}

export async function readSession(cookie: string | undefined, secret = SECRET): Promise<Session | null> {
  if (!cookie) return null
  const idx = cookie.lastIndexOf('.')
  if (idx < 0) return null
  const data = cookie.slice(0, idx)
  const sig = cookie.slice(idx + 1)
  const expect = await hmac(data, secret)
  if (sig !== expect) return null
  try {
    const sess: Session = JSON.parse(new TextDecoder().decode(fromB64(data)))
    if (sess.exp < Date.now()) return null
    return sess
  } catch {
    return null
  }
}
