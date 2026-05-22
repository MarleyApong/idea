import { auth } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/shared/lib/prisma"
import { Navbar } from "@/shared/components/layout/Navbar"
import { IdeasPageClient } from "@/features/ideas/components/IdeasPageClient"

export default async function IdeasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  if (!session?.user?.id) redirect(`/${locale}/auth/signin`)

  const ideas = await prisma.idea.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="min-h-screen">
      <Navbar locale={locale} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <IdeasPageClient locale={locale} initialData={ideas} />
      </main>
    </div>
  )
}
