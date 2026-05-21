"use client"

import type { Idea, IdeaStatus } from "@prisma/client"
import { useTranslations } from "next-intl"

const statusColors: Record<IdeaStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  DONE: "bg-green-50 text-green-700",
  ARCHIVED: "bg-amber-50 text-amber-700",
}

interface IdeaCardProps {
  idea: Idea
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const t = useTranslations("ideas")

  const statusLabel: Record<IdeaStatus, string> = {
    DRAFT: t("draft"),
    IN_PROGRESS: t("inProgress"),
    DONE: t("done"),
    ARCHIVED: t("archived"),
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-slate-900 text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {idea.title}
        </h3>
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[idea.status]}`}
        >
          {statusLabel[idea.status]}
        </span>
      </div>

      {idea.description && (
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-3">
          {idea.description}
        </p>
      )}

      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {idea.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400">
        {new Date(idea.updatedAt).toLocaleDateString()}
      </p>
    </div>
  )
}
