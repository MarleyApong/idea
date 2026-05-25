"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { useSyncExternalStore } from "react"

function subscribe() { return () => {} }

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)

  if (!mounted) return <div className="w-22 h-8" />

  const options = [
    { value: "light",  icon: Sun,     label: "Clair"   },
    { value: "system", icon: Monitor, label: "Systeme" },
    { value: "dark",   icon: Moon,    label: "Sombre"  },
  ] as const

  return (
    <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={value}
          className={`p-1.5 rounded-md transition-colors ${
            theme === value
              ? "bg-(--bg-card) dark:bg-slate-700 text-primary shadow-sm"
              : "text-(--fg-muted) hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  )
}
