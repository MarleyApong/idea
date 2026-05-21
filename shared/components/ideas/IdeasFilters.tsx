"use client"

import { Search, X } from "lucide-react"
import { useTranslations } from "next-intl"
import type { IdeaStatus, IdeaType } from "@prisma/client"
import { ideaTypeConfig } from "@/shared/lib/idea-types"

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
  DRAFT:       "bg-slate-100 text-slate-600 border-slate-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  DONE:        "bg-green-100 text-green-700 border-green-200",
  ARCHIVED:    "bg-amber-100 text-amber-700 border-amber-200",
}

const statusActiveColors: Record<IdeaStatus, string> = {
  DRAFT:       "bg-slate-500 text-white border-slate-500",
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
        />
        {search && (
          <button onClick={() => onSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
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
                  : `bg-white ${cfg.color} border-slate-200 hover:border-current`
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${active ? "bg-white" : cfg.dot}`} />
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
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
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
                active ? statusActiveColors[status] : `bg-white ${statusColors[status]} hover:opacity-80`
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
