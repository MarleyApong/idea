import { auth } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 })
  }

  const { id } = await params

  const idea = await prisma.idea.findUnique({
    where: { id, userId: session.user.id },
    include: { attachments: { orderBy: { createdAt: "desc" } } },
  })

  if (!idea) return NextResponse.json([], { status: 404 })

  return NextResponse.json(idea.attachments)
}
