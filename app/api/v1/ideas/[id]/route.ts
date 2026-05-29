import { prisma } from "@/shared/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { apiError } from "@/shared/lib/errors"
import { IdeaType, IdeaStatus } from "@prisma/client"
import { resolveApiKey } from "../route"
import { unlink } from "fs/promises"
import { join } from "path"
import { rateLimit, getIp, LIMITS } from "@/shared/lib/rate-limit"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cfg = LIMITS["GET /ideas"]
  const ip = getIp(req)
  if (!rateLimit(`ip:GET/ideas:${ip}`, cfg.ip, cfg.windowMs).ok)
    return apiError("RATE_LIMITED", "Trop de requetes, reessaie dans quelques secondes", 429)

  const user = await resolveApiKey(req)
  if (!user) return apiError("UNAUTHORIZED", "Cle API invalide ou manquante", 401)

  if (!rateLimit(`key:GET/ideas:${user.id}`, cfg.key, cfg.windowMs).ok)
    return apiError("RATE_LIMITED", "Limite de requetes atteinte pour cette cle API", 429)

  const { id } = await params
  const idea = await prisma.idea.findUnique({ where: { id } })

  if (!idea || idea.userId !== user.id)
    return apiError("NOT_FOUND", "Idee introuvable", 404)

  return NextResponse.json(idea)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cfg = LIMITS["PATCH /ideas"]
  const ip = getIp(req)
  if (!rateLimit(`ip:PATCH/ideas:${ip}`, cfg.ip, cfg.windowMs).ok)
    return apiError("RATE_LIMITED", "Trop de requetes, reessaie dans quelques secondes", 429)

  const user = await resolveApiKey(req)
  if (!user) return apiError("UNAUTHORIZED", "Cle API invalide ou manquante", 401)

  if (!rateLimit(`key:PATCH/ideas:${user.id}`, cfg.key, cfg.windowMs).ok)
    return apiError("RATE_LIMITED", "Limite de requetes atteinte pour cette cle API", 429)

  const { id } = await params
  const existing = await prisma.idea.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id)
    return apiError("NOT_FOUND", "Idee introuvable", 404)

  const body = await req.json().catch(() => null)
  if (!body) return apiError("INVALID_BODY", "Corps JSON invalide")

  const { title, description, tags, type, status } = body

  if (title !== undefined && !title?.trim())
    return apiError("MISSING_TITLE", "Le titre ne peut pas etre vide")

  const idea = await prisma.idea.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(tags !== undefined ? { tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : [] } : {}),
      ...(type !== undefined && Object.values(IdeaType).includes(type) ? { type } : {}),
      ...(status !== undefined && Object.values(IdeaStatus).includes(status) ? { status } : {}),
    },
  })

  return NextResponse.json(idea)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cfg = LIMITS["DELETE /ideas"]
  const ip = getIp(req)
  if (!rateLimit(`ip:DELETE/ideas:${ip}`, cfg.ip, cfg.windowMs).ok)
    return apiError("RATE_LIMITED", "Trop de requetes, reessaie dans quelques secondes", 429)

  const user = await resolveApiKey(req)
  if (!user) return apiError("UNAUTHORIZED", "Cle API invalide ou manquante", 401)

  if (!rateLimit(`key:DELETE/ideas:${user.id}`, cfg.key, cfg.windowMs).ok)
    return apiError("RATE_LIMITED", "Limite de requetes atteinte pour cette cle API", 429)

  const { id } = await params
  const existing = await prisma.idea.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id)
    return apiError("NOT_FOUND", "Idee introuvable", 404)

  const attachments = await prisma.attachment.findMany({ where: { ideaId: id } })

  await prisma.idea.delete({ where: { id } })

  for (const att of attachments) {
    try { await unlink(join(process.cwd(), "public", att.url)) } catch {}
  }

  return new NextResponse(null, { status: 204 })
}
