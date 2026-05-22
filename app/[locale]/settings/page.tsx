import { auth } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/shared/lib/prisma"
import { Navbar } from "@/shared/components/layout/Navbar"
import { ApiKeysClient } from "@/features/settings/components/ApiKeysClient"

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()
  if (!session?.user?.id) redirect(`/${locale}/auth/signin`)

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, prefix: true, lastUsedAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Navbar locale={locale} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-(--fg) mb-8">Parametres</h1>
        <ApiKeysClient initialKeys={keys} locale={locale} />
      </main>
    </div>
  )
}
