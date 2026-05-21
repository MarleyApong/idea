"use client"

import type { Idea, IdeaStatus, IdeaType } from "@prisma/client"
import { useTranslations } from "next-intl"
import { ideaTypeConfig } from "@/shared/lib/idea-types"

const statusStyles: Record<IdeaStatus, string> = {
  DRAFT:       "bg-slate-100 text-slate-500",
  IN_PROGRESS: "bg-blue-50 text-blue-600",
  DONE:        "bg-green-50 text-green-600",
  ARCHIVED:    "bg-amber-50 text-amber-600",
}

export function IdeaCard({ idea }: { idea: Idea }) {
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

  const cfg = ideaTypeConfig[idea.type] ?? ideaTypeConfig.PROJET

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer">
      {/* Bande coloree en haut selon le type */}
      <div className={`h-1 w-full ${cfg.dot}`} />

      <div className="p-5">
        {/* Type + Status */}
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {typeLabels[idea.type]}
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[idea.status]}`}>
            {statusLabels[idea.status]}
          </span>
        </div>

        {/* Titre */}
        <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {idea.title}
        </h3>

        {/* Description */}
        {idea.description && (
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-3">
            {idea.description}
          </p>
        )}

        {/* Tags */}
        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {idea.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Date */}
        <p className="text-xs text-slate-300">
          {new Date(idea.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
