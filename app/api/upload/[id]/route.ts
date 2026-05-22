import { auth } from "@/shared/lib/auth"
import { prisma } from "@/shared/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { unlink } from "fs/promises"
import { join } from "path"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 })
  }

  const { id } = await params
  const attachment = await prisma.attachment.findUnique({
    where: { id },
    include: { idea: true },
  })

  if (!attachment || attachment.idea.userId !== session.user.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  }

  try {
    const filePath = join(process.cwd(), "public", attachment.url)
    await unlink(filePath)
  } catch {}

  await prisma.attachment.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
