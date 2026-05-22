import { Navbar } from "@/shared/components/layout/Navbar"
import { NotFound } from "@/shared/components/ui/NotFound"

export default async function LocaleNotFound({
  params,
}: {
  params?: Promise<{ locale: string }>
}) {
  const locale = params ? (await params).locale : "fr"

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Navbar locale={locale} />
      <NotFound locale={locale} />
    </div>
  )
}
