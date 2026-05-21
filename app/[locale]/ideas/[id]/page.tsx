import { auth } from "@/shared/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/shared/lib/prisma"
import { getTranslations } from "next-intl/server"
import { Navbar } from "@/shared/components/layout/Navbar"
import { IdeaDetailClient } from "@/shared/components/ideas/IdeaDetailClient"

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
  })

  if (!idea) notFound()

  const t = await getTranslations("ideas")

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar locale={locale} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <IdeaDetailClient idea={idea} locale={locale} />
      </main>
    </div>
  )
}
