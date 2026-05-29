import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { Lightbulb, AlertCircle } from "lucide-react"

const AUTH_ERRORS = [
  "OAuthAccountNotLinked",
  "AccessDenied",
  "OAuthSignin",
  "OAuthCallback",
  "OAuthCreateAccount",
  "Callback",
  "Configuration",
] as const

type AuthErrorCode = (typeof AUTH_ERRORS)[number] | "Default"

function getErrorKey(error: string | undefined): AuthErrorCode {
  if (AUTH_ERRORS.includes(error as (typeof AUTH_ERRORS)[number])) return error as AuthErrorCode
  return "Default"
}

export default async function AuthErrorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { locale } = await params
  const { error } = await searchParams
  const t = await getTranslations("auth")

  const key = getErrorKey(error)

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-[480px] bg-primary flex-col justify-between p-12 shrink-0">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="w-6 h-6 text-white" strokeWidth={2.5} />
          <span className="font-bold text-xl text-white tracking-tight">idea.</span>
        </div>

        <div className="space-y-5">
          <p className="text-white text-[40px] font-semibold leading-tight">
            Ne laissez<br />aucune bonne<br />idee s&apos;echapper.
          </p>
          <p className="text-white/70 text-base leading-relaxed">
            Capturez instantanement, organisez par<br />
            categorie, revenez construire quand vous<br />
            etes pret.
          </p>
        </div>

        <div className="flex gap-10">
          <div>
            <p className="text-white text-3xl font-bold">00</p>
            <p className="text-white/50 text-sm mt-0.5">Idees illimitees</p>
          </div>
          <div>
            <p className="text-white text-3xl font-bold">4</p>
            <p className="text-white/50 text-sm mt-0.5">Statuts</p>
          </div>
          <div>
            <p className="text-white text-3xl font-bold">2</p>
            <p className="text-white/50 text-sm mt-0.5">Langues</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-(--bg-card)">
        <div className="w-full max-w-[360px]">
          <div className="lg:hidden mb-10 flex items-center gap-1.5">
            <Lightbulb className="w-6 h-6 text-primary" strokeWidth={2.5} />
            <span className="font-bold text-xl text-primary tracking-tight">idea.</span>
          </div>

          <div className="mb-8 flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-[26px] font-semibold text-(--fg)">{t("error.title")}</h1>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                {t(`error.${key}`)}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/auth/signin`}
            className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {t("error.backToSignIn")}
          </Link>
        </div>
      </div>
    </div>
  )
}
