import { auth } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

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
  return patterns.some((pattern) =>
    pattern.every((byte, i) => buffer[i] === byte)
  )
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const ideaId = formData.get("ideaId") as string | null

  if (!file || !ideaId) {
    return NextResponse.json({ error: "Fichier ou ideaId manquant" }, { status: 400 })
  }

  const idea = await prisma.idea.findUnique({ where: { id: ideaId, userId: session.user.id } })
  if (!idea) return NextResponse.json({ error: "Idee introuvable" }, { status: 404 })

  // Vérification taille
  if (file.size / (1024 * 1024) > MAX_MB) {
    return NextResponse.json({ error: `Fichier trop grand (max ${MAX_MB}MB)` }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Vérification MIME type déclaré
  const mimeConfig = ACCEPTED_TYPES[file.type]
  if (!mimeConfig) {
    return NextResponse.json({ error: `Type MIME non accepte : ${file.type}` }, { status: 400 })
  }

  // Vérification extension cohérente avec le MIME
  const ext = "." + file.name.split(".").pop()?.toLowerCase()
  if (!mimeConfig.ext.includes(ext)) {
    return NextResponse.json({ error: "Extension et type de fichier incohérents" }, { status: 400 })
  }

  // Vérification magic bytes (signature réelle du fichier)
  if (!checkMagicBytes(buffer, mimeConfig.magic)) {
    return NextResponse.json({ error: "Contenu du fichier invalide" }, { status: 400 })
  }

  const uploadDir = join(process.cwd(), "public", "uploads", session.user.id)
  await mkdir(uploadDir, { recursive: true })

  const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`
  await writeFile(join(uploadDir, uniqueName), buffer)

  const url = `/uploads/${session.user.id}/${uniqueName}`

  const attachment = await prisma.attachment.create({
    data: {
      url,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      ideaId,
    },
  })

  return NextResponse.json(attachment)
}
