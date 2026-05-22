import { auth } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { apiError } from "@/shared/lib/errors"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return apiError("UNAUTHORIZED", "Non autorise", 401)

  const { id } = await params

  await prisma.apiKey.deleteMany({ where: { id, userId: session.user.id } })

  return NextResponse.json({ success: true })
}
