import { auth } from "@/lib/auth"
import { signOutAction } from "@/lib/actions/auth"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { LocaleSwitcher } from "./LocaleSwitcher"

export async function Navbar({ locale }: { locale: string }) {
  const session = await auth()
  const t = await getTranslations("nav")

  const logoutAction = signOutAction.bind(null, locale)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={`/${locale}/ideas`} className="text-primary font-bold text-lg tracking-tight">
          idea.
        </Link>

        <div className="flex items-center gap-2">
          <LocaleSwitcher locale={locale} />

          {session ? (
            <div className="flex items-center gap-3">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? ""}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-sm font-medium">
                    {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </span>
                </div>
              )}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {t("signOut")}
                </button>
              </form>
            </div>
          ) : (
            <Link
              href={`/${locale}/auth/signin`}
              className="text-sm bg-primary text-white px-4 py-1.5 rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              {t("myIdeas")}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
