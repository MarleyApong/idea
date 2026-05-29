"use client"

import type { Idea, IdeaStatus, IdeaType } from "@prisma/client"
import { useTranslations, useLocale } from "next-intl"
import { ideaTypeConfig } from "@/features/ideas/types/idea-types"
import { formatDate } from "@/shared/lib/format"

const statusStyles: Record<IdeaStatus, string> = {
  DRAFT:       "bg-slate-100 dark:bg-slate-700 text-(--fg-muted)",
  IN_PROGRESS: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  DONE:        "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
  ARCHIVED:    "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
}

export function IdeaCard({ idea }: { idea: Idea }) {
  const t = useTranslations("ideas")
  const locale = useLocale()

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

  return (
    <div className="bg-(--bg-card) rounded-2xl overflow-hidden shadow-sm border border-(--border)/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

      {/* Accent couleur */}
      <div className={`${cfg.bg} px-4 py-3.5 flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/25 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="text-white text-xs font-bold tracking-wide uppercase opacity-90">
            {typeLabels[idea.type]}
          </span>
        </div>
        {idea.status !== "DRAFT" && (
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/25 text-white shrink-0">
            {statusLabels[idea.status]}
          </span>
        )}
      </div>

      {/* Corps */}
      <div className="px-4 pt-3.5 pb-4 flex flex-col gap-2.5">
        <h3 className="font-bold text-(--fg) text-[15px] leading-snug">
          {idea.title}
        </h3>

        {idea.description && (
          <p className="text-(--fg-muted) text-sm leading-relaxed">
            {idea.description}
          </p>
        )}

        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {idea.tags.map((tag) => (
              <span
                key={tag}
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 ${cfg.color}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-[11px] text-(--fg-muted) mt-1">
          {formatDate(idea.createdAt, locale)}
        </p>
      </div>
    </div>
  )
}
