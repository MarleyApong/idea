import { prisma } from "@/shared/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { hashApiKey } from "@/shared/lib/api-key"
import { apiError } from "@/shared/lib/errors"
import { IdeaType, IdeaStatus } from "@prisma/client"

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

export async function GET(req: NextRequest) {
  const user = await resolveApiKey(req)
  if (!user) return apiError("UNAUTHORIZED", "Cle API invalide ou manquante", 401)

  const { searchParams } = req.nextUrl
  const search = searchParams.get("search") ?? ""
  const type = searchParams.get("type") ?? ""
  const status = searchParams.get("status") ?? ""
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))

  const where = {
    userId: user.id,
    ...(type && Object.values(IdeaType).includes(type as IdeaType) ? { type: type as IdeaType } : {}),
    ...(status && Object.values(IdeaStatus).includes(status as IdeaStatus) ? { status: status as IdeaStatus } : {}),
    ...(search ? {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { tags: { has: search } },
      ],
    } : {}),
  }

  const [ideas, total] = await Promise.all([
    prisma.idea.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.idea.count({ where }),
  ])

  return NextResponse.json({
    data: ideas,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

export async function POST(req: NextRequest) {
  const user = await resolveApiKey(req)
  if (!user) return apiError("UNAUTHORIZED", "Cle API invalide ou manquante", 401)

  const body = await req.json().catch(() => null)
  if (!body) return apiError("INVALID_BODY", "Corps JSON invalide")

  const { title, description, tags, type, status } = body

  if (!title?.trim()) return apiError("MISSING_TITLE", "Le titre est requis")

  const idea = await prisma.idea.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : [],
      type: Object.values(IdeaType).includes(type) ? type : IdeaType.PROJET,
      status: Object.values(IdeaStatus).includes(status) ? status : IdeaStatus.DRAFT,
      userId: user.id,
    },
  })

  return NextResponse.json(idea, { status: 201 })
}
