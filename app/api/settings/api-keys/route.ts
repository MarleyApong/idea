import { auth } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { generateApiKey } from "@/shared/lib/api-key"
import { apiError } from "@/shared/lib/errors"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return apiError("UNAUTHORIZED", "Non autorise", 401)

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, prefix: true, lastUsedAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(keys)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return apiError("UNAUTHORIZED", "Non autorise", 401)

  const { name } = await req.json()
  if (!name?.trim()) return apiError("MISSING_NAME", "Le nom est requis")

  const { raw, prefix, hash } = generateApiKey()

  await prisma.apiKey.create({
    data: { name: name.trim(), prefix, keyHash: hash, userId: session.user.id },
  })

  // On retourne la clé brute une seule fois - elle ne sera plus jamais accessible
  return NextResponse.json({ raw, prefix }, { status: 201 })
}
