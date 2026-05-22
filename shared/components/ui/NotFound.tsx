"use client"

import { useRouter } from "next/navigation"
import { Lightbulb, ArrowLeft, Home } from "lucide-react"

interface NotFoundProps {
  locale?: string
}

export function NotFound({ locale = "fr" }: NotFoundProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: "var(--bg)" }}>
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-1.5 mb-8">
          <Lightbulb className="w-7 h-7 text-primary" strokeWidth={2.5} />
          <span className="font-bold text-xl text-primary tracking-tight">idea.</span>
        </div>

        {/* 404 */}
        <div className="text-[120px] font-bold leading-none text-primary/20 select-none mb-4">
          404
        </div>

        <h1 className="text-2xl font-semibold mb-2" style={{ color: "var(--fg)" }}>
          Page introuvable
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--fg-muted)" }}>
          Cette page n&apos;existe pas ou a ete deplacee.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 border px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--fg)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <a
            href={`/${locale}/ideas`}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <Home className="w-4 h-4" />
            Mes idees
          </a>
        </div>
      </div>
    </div>
  )
}
