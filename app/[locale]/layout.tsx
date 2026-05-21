import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/shared/i18n/routing"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/shared/lib/auth"
import { QueryProvider } from "@/shared/providers/QueryProvider"
import "../globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "idea. - Ne perdez jamais une bonne idee",
  description: "Capturez, organisez et construisez vos idees innovantes.",
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!routing.locales.includes(locale as "fr" | "en")) {
    notFound()
  }

  const messages = await getMessages()
  const session = await auth()

  return (
    <html lang={locale} className={`${poppins.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased bg-slate-50 text-slate-900">
        <SessionProvider session={session}>
          <QueryProvider>
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
