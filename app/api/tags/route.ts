import { auth } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 })
  }

  const ideas = await prisma.idea.findMany({
    where: { userId: session.user.id },
    select: { tags: true },
  })

  const allTags = [...new Set(ideas.flatMap((i) => i.tags))].sort()

  return NextResponse.json(allTags)
}
