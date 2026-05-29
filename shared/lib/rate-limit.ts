type Window = { count: number; resetAt: number }

const store = new Map<string, Window>()

// Nettoyage des entrées expirées toutes les 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, w] of store) {
    if (w.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000)

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { ok: true, remaining: limit - 1, resetAt }
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count++
  return { ok: true, remaining: limit - existing.count, resetAt: existing.resetAt }
}

export function getIp(req: Request): string {
  const forwarded = (req.headers as Headers).get("x-forwarded-for")
  return forwarded ? forwarded.split(",")[0].trim() : "unknown"
}

// Limites par endpoint
export const LIMITS = {
  "GET /ideas":    { ip: 300, key: 120, windowMs: 60_000 },
  "POST /ideas":   { ip: 60,  key: 60,  windowMs: 60_000 },
  "PATCH /ideas":  { ip: 60,  key: 30,  windowMs: 60_000 },
  "DELETE /ideas": { ip: 30,  key: 30,  windowMs: 60_000 },
  "POST /upload":  { ip: 20,  key: 10,  windowMs: 60_000 },
} as const
