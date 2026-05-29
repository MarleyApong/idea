import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/shared/i18n/routing"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/shared/lib/auth"
import { QueryProvider } from "@/shared/providers/QueryProvider"
import { ThemeProvider } from "@/shared/providers/ThemeProvider"
import { Toaster } from "@/shared/components/ui/Toaster"
import "../globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "idea. - Ne perdez jamais une bonne idée",
  description: "Capturez, organisez et construisez vos idées innovantes.",
  manifest: "/manifest.webmanifest",
  themeColor: "#2274a5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "idea.",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
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
      <body className="min-h-full flex flex-col font-sans antialiased" style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}>
        <ThemeProvider>
          <SessionProvider session={session}>
            <QueryProvider>
              <NextIntlClientProvider messages={messages}>
                {children}
                <Toaster />
              </NextIntlClientProvider>
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
