import { prisma } from "@/shared/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { apiError } from "@/shared/lib/errors"
import { resolveApiKey } from "../ideas/route"
import { rateLimit, getIp, LIMITS } from "@/shared/lib/rate-limit"

const ACCEPTED_TYPES: Record<string, { ext: string[]; magic: number[][] }> = {
  "image/jpeg":       { ext: [".jpg", ".jpeg"], magic: [[0xFF, 0xD8, 0xFF]] },
  "image/png":        { ext: [".png"],          magic: [[0x89, 0x50, 0x4E, 0x47]] },
  "image/webp":       { ext: [".webp"],         magic: [[0x52, 0x49, 0x46, 0x46]] },
  "application/pdf":  { ext: [".pdf"],          magic: [[0x25, 0x50, 0x44, 0x46]] },
  "text/plain":       { ext: [".txt"],          magic: [] },
  "text/markdown":    { ext: [".md"],           magic: [] },
  "text/x-markdown":  { ext: [".md"],           magic: [] },
}

const MAX_MB = 10

function checkMagicBytes(buffer: Buffer, patterns: number[][]): boolean {
  if (patterns.length === 0) return true
  return patterns.some((pattern) => pattern.every((byte, i) => buffer[i] === byte))
}

export async function POST(req: NextRequest) {
  const cfg = LIMITS["POST /upload"]
  const ip = getIp(req)
  if (!rateLimit(`ip:POST/upload:${ip}`, cfg.ip, cfg.windowMs).ok)
    return apiError("RATE_LIMITED", "Trop de requetes, reessaie dans quelques secondes", 429)

  const user = await resolveApiKey(req)
  if (!user) return apiError("UNAUTHORIZED", "Cle API invalide ou manquante", 401)

  if (!rateLimit(`key:POST/upload:${user.id}`, cfg.key, cfg.windowMs).ok)
    return apiError("RATE_LIMITED", "Limite d'upload atteinte pour cette cle API (10/min)", 429)

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return apiError("INVALID_REQUEST", "Le corps de la requete doit etre multipart/form-data")
  }

  const file = formData.get("file") as File | null
  const ideaId = formData.get("ideaId") as string | null
  const title = (formData.get("title") as string | null)?.trim() || null

  if (!file) return apiError("MISSING_FILE", "Aucun fichier fourni")
  if (!ideaId) return apiError("MISSING_IDEA_ID", "ideaId manquant")

  const idea = await prisma.idea.findUnique({ where: { id: ideaId, userId: user.id } })
  if (!idea) return apiError("IDEA_NOT_FOUND", "Idee introuvable", 404)

  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > MAX_MB)
    return apiError("FILE_TOO_LARGE", `Fichier trop grand : ${sizeMB.toFixed(1)}MB (max ${MAX_MB}MB)`)

  const mimeConfig = ACCEPTED_TYPES[file.type]
  if (!mimeConfig)
    return apiError("INVALID_MIME_TYPE", `Type non accepte : "${file.type}". Acceptes : ${Object.keys(ACCEPTED_TYPES).join(", ")}`)

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (!checkMagicBytes(buffer, mimeConfig.magic))
    return apiError("INVALID_FILE_CONTENT", "Le contenu du fichier ne correspond pas a son type declare")

  const rawExt = "." + file.name.split(".").pop()?.toLowerCase()
  const canonicalExt = mimeConfig.ext[0]
  const hasValidExt = mimeConfig.ext.includes(rawExt)
  const baseName = hasValidExt
    ? file.name.replace(/\s+/g, "_")
    : (file.name.replace(/\.[^.]+$/, "") || "fichier").replace(/\s+/g, "_") + canonicalExt

  try {
    const uploadDir = join(process.cwd(), "public", "uploads", user.id)
    await mkdir(uploadDir, { recursive: true })

    const uniqueName = `${Date.now()}-${baseName}`
    await writeFile(join(uploadDir, uniqueName), buffer)

    const url = `/uploads/${user.id}/${uniqueName}`

    const attachment = await prisma.attachment.create({
      data: { url, filename: baseName, mimeType: file.type, size: file.size, ideaId, title },
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch {
    return apiError("STORAGE_ERROR", "Erreur lors de la sauvegarde du fichier", 500)
  }
}
