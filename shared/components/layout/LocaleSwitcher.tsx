"use client"

import { useRouter, usePathname } from "next/navigation"
import { routing } from "@/shared/i18n/routing"

export function LocaleSwitcher({ locale }: { locale: string }) {
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(next: string) {
    const segments = pathname.split("/")
    segments[1] = next
    router.push(segments.join("/"))
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`px-2 py-1 rounded font-medium uppercase transition-colors ${
            l === locale
              ? "text-primary"
              : "text-[var(--fg-muted)] hover:text-slate-700"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
