import { auth } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/shared/lib/prisma"
import { getTranslations } from "next-intl/server"
import { Navbar } from "@/shared/components/layout/Navbar"
import { TagsPageClient } from "@/features/tags/components/TagsPageClient"

export default async function TagsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  if (!session?.user?.id) redirect(`/${locale}/auth/signin`)

  const ideas = await prisma.idea.findMany({
    where: { userId: session.user.id },
    select: { tags: true, id: true },
  })

  const tagMap: Record<string, number> = {}
  for (const idea of ideas) {
    for (const tag of idea.tags) {
      tagMap[tag] = (tagMap[tag] ?? 0) + 1
    }
  }

  const tags = Object.entries(tagMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const t = await getTranslations("tags")

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar locale={locale} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <TagsPageClient tags={tags} locale={locale} title={t("title")} emptyText={t("empty")} ideasLabel={t("ideas")} />
      </main>
    </div>
  )
}
