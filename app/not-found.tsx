import { Poppins } from "next/font/google"
import { ThemeProvider } from "@/shared/providers/ThemeProvider"
import { NotFound } from "@/shared/components/ui/NotFound"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export default function RootNotFound() {
  return (
    <html lang="fr" className={`${poppins.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full font-sans antialiased" style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}>
        <ThemeProvider>
          <NotFound />
        </ThemeProvider>
      </body>
    </html>
  )
}
