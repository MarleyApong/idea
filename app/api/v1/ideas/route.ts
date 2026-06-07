import { prisma } from "@/shared/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { hashApiKey } from "@/shared/lib/api-key"
import { apiError } from "@/shared/lib/errors"
import { IdeaType, IdeaStatus, Prisma } from "@prisma/client"
import { rateLimit, getIp, LIMITS } from "@/shared/lib/rate-limit"

export async function resolveApiKey(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? ""
  const raw = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null
  if (!raw) return null

  const hash = hashApiKey(raw)
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    include: { user: true },
  })

  if (!apiKey) return null

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return apiKey.user
}

function rateLimitHeaders(remaining: number, resetAt: number) {
  return {
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  }
}

export async function GET(req: NextRequest) {
  const cfg = LIMITS["GET /ideas"]
  const ip = getIp(req)
  const ipCheck = rateLimit(`ip:GET/ideas:${ip}`, cfg.ip, cfg.windowMs)
  if (!ipCheck.ok) return apiError("RATE_LIMITED", "Trop de requetes, reessaie dans quelques secondes", 429)

  const user = await resolveApiKey(req)
  if (!user) return apiError("UNAUTHORIZED", "Cle API invalide ou manquante", 401)

  const keyCheck = rateLimit(`key:GET/ideas:${user.id}`, cfg.key, cfg.windowMs)
  if (!keyCheck.ok) return apiError("RATE_LIMITED", "Limite de requetes atteinte pour cette cle API", 429)

  const { searchParams } = req.nextUrl
  const search = searchParams.get("search") ?? ""
  const type = searchParams.get("type") ?? ""
  const status = searchParams.get("status") ?? ""
  const parentId = searchParams.get("parentId") ?? ""
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))

  let tagMatchIds: string[] = []
  if (search) {
    const tagMatches = await prisma.$queryRaw<{ id: string }[]>(
      Prisma.sql`SELECT id FROM "Idea" WHERE "userId" = ${user.id} AND EXISTS (SELECT 1 FROM unnest(tags) AS t WHERE t ILIKE ${`%${search}%`})`
    )
    tagMatchIds = tagMatches.map(r => r.id)
  }

  const where = {
    userId: user.id,
    ...(type && Object.values(IdeaType).includes(type as IdeaType) ? { type: type as IdeaType } : {}),
    ...(status && Object.values(IdeaStatus).includes(status as IdeaStatus) ? { status: status as IdeaStatus } : {}),
    ...(parentId ? { parentId } : {}),
    ...(search ? {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        ...(tagMatchIds.length > 0 ? [{ id: { in: tagMatchIds } }] : []),
      ],
    } : {}),
  }

  const [ideas, total] = await Promise.all([
    prisma.idea.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { attachments: true },
    }),
    prisma.idea.count({ where }),
  ])

  return NextResponse.json(
    { data: ideas, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    { headers: rateLimitHeaders(keyCheck.remaining, keyCheck.resetAt) }
  )
}

export async function POST(req: NextRequest) {
  const cfg = LIMITS["POST /ideas"]
  const ip = getIp(req)
  const ipCheck = rateLimit(`ip:POST/ideas:${ip}`, cfg.ip, cfg.windowMs)
  if (!ipCheck.ok) return apiError("RATE_LIMITED", "Trop de requetes, reessaie dans quelques secondes", 429)

  const user = await resolveApiKey(req)
  if (!user) return apiError("UNAUTHORIZED", "Cle API invalide ou manquante", 401)

  const keyCheck = rateLimit(`key:POST/ideas:${user.id}`, cfg.key, cfg.windowMs)
  if (!keyCheck.ok) return apiError("RATE_LIMITED", "Limite de requetes atteinte pour cette cle API", 429)

  const body = await req.json().catch(() => null)
  if (!body) return apiError("INVALID_BODY", "Corps JSON invalide")

  const { title, description, tags, type, status, parentId: bodyParentId } = body

  if (!title?.trim()) return apiError("MISSING_TITLE", "Le titre est requis")

  const idea = await prisma.idea.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : [],
      type: Object.values(IdeaType).includes(type) ? type : IdeaType.PROJET,
      status: Object.values(IdeaStatus).includes(status) ? status : IdeaStatus.DRAFT,
      parentId: bodyParentId ?? null,
      userId: user.id,
    },
    include: { attachments: true },
  })

  return NextResponse.json(idea, {
    status: 201,
    headers: rateLimitHeaders(keyCheck.remaining, keyCheck.resetAt),
  })
}
