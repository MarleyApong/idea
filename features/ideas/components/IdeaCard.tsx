"use client"

import { useState } from "react"
import type { Idea, IdeaStatus, IdeaType } from "@prisma/client"
import { useTranslations, useLocale } from "next-intl"
import { ideaTypeConfig } from "@/features/ideas/types/idea-types"
import { formatDate } from "@/shared/lib/format"

const statusStyles: Record<IdeaStatus, string> = {
  DRAFT:       "bg-slate-100 text-(--fg-muted)",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE:        "bg-green-100 text-green-700",
  ARCHIVED:    "bg-amber-100 text-amber-700",
}

const DESCRIPTION_LIMIT = 100

export function IdeaCard({ idea }: { idea: Idea }) {
  const t = useTranslations("ideas")
  const locale = useLocale()
  const [expanded, setExpanded] = useState(false)

  const typeLabels: Record<IdeaType, string> = {
    PROJET:      t("typeProjet"),
    INSPIRATION: t("typeInspiration"),
    RAPPEL:      t("typeRappel"),
    NOTE:        t("typeNote"),
    AUTRE:       t("typeAutre"),
  }

  const statusLabels: Record<IdeaStatus, string> = {
    DRAFT:       t("draft"),
    IN_PROGRESS: t("inProgress"),
    DONE:        t("done"),
    ARCHIVED:    t("archived"),
  }

  const cfg = ideaTypeConfig[idea.type] ?? ideaTypeConfig.PROJET
  const Icon = cfg.icon
  const isLong = !!idea.description && idea.description.length > DESCRIPTION_LIMIT

  return (
    <div className="bg-(--bg-card) rounded-2xl border border-(--border) shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex">
      {/* Panneau gauche colore */}
      <div className={`w-24 shrink-0 ${cfg.bg} flex flex-col items-center justify-center gap-2 p-3`}>
        <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
        <span className="text-white text-xs font-semibold text-center leading-tight">
          {typeLabels[idea.type ?? "PROJET"]}
        </span>
      </div>

      {/* Contenu droit */}
      <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
        {/* Date + Status */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-(--fg-muted)">
            {formatDate(idea.createdAt, locale)}
          </p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusStyles[idea.status]}`}>
            {statusLabels[idea.status]}
          </span>
        </div>

        {/* Titre */}
        <h3 className="font-bold text-(--fg) text-base leading-snug line-clamp-1">
          {idea.title}
        </h3>

        {/* Description */}
        {idea.description && (
          <div>
            <p className={`text-(--fg-muted) text-sm leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
              {idea.description}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className={`mt-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cfg.bg} text-white hover:opacity-90 transition-opacity`}
              >
                {expanded ? t("seeMinus") : t("readMore")}
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            {idea.tags.map((tag) => (
              <span key={tag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color} bg-slate-100`}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
