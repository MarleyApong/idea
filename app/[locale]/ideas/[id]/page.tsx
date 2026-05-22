import { auth } from "@/shared/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/shared/lib/prisma"
import { Navbar } from "@/shared/components/layout/Navbar"
import { IdeaDetailClient } from "@/features/ideas/components/IdeaDetailClient"

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const session = await auth()

  if (!session?.user?.id) redirect(`/${locale}/auth/signin`)

  const idea = await prisma.idea.findUnique({
    where: { id, userId: session.user.id },
    include: { attachments: { orderBy: { createdAt: "desc" } } },
  })

  if (!idea) notFound()

  return (
    <div className="min-h-screen bg-(--bg)">
      <Navbar locale={locale} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <IdeaDetailClient idea={idea} attachments={idea.attachments} locale={locale} />
      </main>
    </div>
  )
}
