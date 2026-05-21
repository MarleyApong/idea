import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { signInWithGoogle, signInWithGitHub } from "@/lib/actions/auth"

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  if (session) redirect(`/${locale}/ideas`)

  const t = await getTranslations("auth")

  const googleAction = signInWithGoogle.bind(null, locale)
  const githubAction = signInWithGitHub.bind(null, locale)

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[480px] bg-primary flex-col justify-between p-12 shrink-0">
        <div>
          <span className="text-white text-2xl font-bold tracking-tight">idea.</span>
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

      {/* Right sign-in panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <span className="text-primary text-2xl font-bold">idea.</span>
          </div>

          <div className="mb-8">
            <h1 className="text-[26px] font-semibold text-slate-900">{t("welcomeBack")}</h1>
            <p className="text-slate-400 text-sm mt-1.5">{t("tagline")}</p>
          </div>

          <div className="space-y-3">
            {/* Google */}
            <form action={googleAction}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {t("continueWithGoogle")}
              </button>
            </form>

            {/* GitHub */}
            <form action={githubAction}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#24292e] rounded-xl text-white text-sm font-medium hover:bg-[#1a1e22] transition-colors"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                {t("continueWithGitHub")}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-slate-400">
            {t("noAccount")}{" "}
            <span className="text-primary font-medium cursor-pointer">{t("signUpLink")}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
