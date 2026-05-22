import { createHash, randomBytes } from "crypto"

const PREFIX = "idea_sk_"

export function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const secret = randomBytes(32).toString("hex")
  const raw = `${PREFIX}${secret}`
  const prefix = raw.slice(0, 16) // "idea_sk_" + 8 chars pour affichage
  const hash = hashApiKey(raw)
  return { raw, prefix, hash }
}

export function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex")
}
