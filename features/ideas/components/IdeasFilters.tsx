"use client"

import { useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { useTranslations } from "next-intl"
import type { IdeaStatus, IdeaType } from "@prisma/client"
import { ideaTypeConfig } from "@/features/ideas/types/idea-types"

interface IdeasFiltersProps {
  search: string
  onSearch: (v: string) => void
  typeFilter: IdeaType | "ALL"
  onTypeFilter: (v: IdeaType | "ALL") => void
  statusFilter: IdeaStatus | "ALL"
  onStatusFilter: (v: IdeaStatus | "ALL") => void
}

const types: IdeaType[] = ["PROJET", "INSPIRATION", "RAPPEL", "AUTRE"]
const statuses: IdeaStatus[] = ["DRAFT", "IN_PROGRESS", "DONE", "ARCHIVED"]

const statusColors: Record<IdeaStatus, string> = {
  DRAFT:       "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  IN_PROGRESS: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  DONE:        "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
  ARCHIVED:    "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
}

const statusActiveColors: Record<IdeaStatus, string> = {
  DRAFT:       "bg-slate-600 text-white border-slate-600",
  IN_PROGRESS: "bg-blue-600 text-white border-blue-600",
  DONE:        "bg-green-600 text-white border-green-600",
  ARCHIVED:    "bg-amber-500 text-white border-amber-500",
}

export function IdeasFilters({
  search, onSearch,
  typeFilter, onTypeFilter,
  statusFilter, onStatusFilter,
}: IdeasFiltersProps) {
  const t = useTranslations("ideas")
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const typeLabels: Record<IdeaType, string> = {
    PROJET:      t("typeProjet"),
    INSPIRATION: t("typeInspiration"),
    RAPPEL:      t("typeRappel"),
    AUTRE:       t("typeAutre"),
  }

  const statusLabels: Record<IdeaStatus, string> = {
    DRAFT:       t("draft"),
    IN_PROGRESS: t("inProgress"),
    DONE:        t("done"),
    ARCHIVED:    t("archived"),
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--fg-muted)]" />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full pl-9 pr-16 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-[var(--bg-card)]"
        />
        {!search && (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-xs text-[var(--fg-muted)] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
            Ctrl K
          </kbd>
        )}
        {search && (
          <button onClick={() => onSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] hover:text-[var(--fg-muted)]">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtres type */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTypeFilter("ALL")}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
            typeFilter === "ALL"
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-[var(--bg-card)] text-[var(--fg-muted)] border-[var(--border)] hover:border-slate-400"
          }`}
        >
          {t("allTypes")}
        </button>
        {types.map((type) => {
          const cfg = ideaTypeConfig[type]
          const active = typeFilter === type
          return (
            <button
              key={type}
              onClick={() => onTypeFilter(active ? "ALL" : type)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? `${cfg.bg} text-white border-transparent`
                  : `bg-[var(--bg-card)] ${cfg.color} border-[var(--border)] hover:border-current`
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${active ? "bg-[var(--bg-card)]" : cfg.dot}`} />
              {typeLabels[type]}
            </button>
          )
        })}
      </div>

      {/* Filtres status */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onStatusFilter("ALL")}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
            statusFilter === "ALL"
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-[var(--bg-card)] text-[var(--fg-muted)] border-[var(--border)] hover:border-slate-400"
          }`}
        >
          {t("allStatuses")}
        </button>
        {statuses.map((status) => {
          const active = statusFilter === status
          return (
            <button
              key={status}
              onClick={() => onStatusFilter(active ? "ALL" : status)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                active ? statusActiveColors[status] : `bg-[var(--bg-card)] ${statusColors[status]} hover:opacity-80`
              }`}
            >
              {statusLabels[status]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
