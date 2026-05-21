import { auth } from "@/shared/lib/auth"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { ArrowRight, LogIn } from "lucide-react"
import Link from "next/link"

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  if (session) redirect(`/${locale}/ideas`)

  const t = await getTranslations("home")

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="text-center max-w-xl">
        <span className="text-5xl font-bold text-primary tracking-tight">idea.</span>
        <h1 className="mt-6 text-3xl font-semibold text-slate-900 leading-tight">{t("hero")}</h1>
        <p className="mt-3 text-slate-500 text-lg">{t("heroSub")}</p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link
            href={`/${locale}/auth/signin`}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            {t("cta")}
          </Link>
          <Link
            href={`/${locale}/auth/signin`}
            className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {t("ctaSignIn")}
          </Link>
        </div>
      </div>
    </main>
  )
}
