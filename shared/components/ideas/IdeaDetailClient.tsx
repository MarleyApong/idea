"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import type { Idea, IdeaType, IdeaStatus } from "@prisma/client"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { ideaTypeConfig } from "@/shared/lib/idea-types"
import { Button } from "@/shared/components/ui/Button"
import { Badge } from "@/shared/components/ui/Badge"

const statusStyles: Record<IdeaStatus, "default" | "primary" | "success" | "warning" | "muted"> = {
  DRAFT:       "default",
  IN_PROGRESS: "primary",
  DONE:        "success",
  ARCHIVED:    "warning",
}

interface IdeaDetailClientProps {
  idea: Idea
  locale: string
}

export function IdeaDetailClient({ idea, locale }: IdeaDetailClientProps) {
  const t = useTranslations("ideas")
  const router = useRouter()

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
  const Icon = cfg.icon

  return (
    <div className="space-y-6">
      {/* Header navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/${locale}/ideas`)}>
          <ArrowLeft className="w-4 h-4" />
          {t("backToIdeas")}
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Pencil className="w-4 h-4" />
            {t("edit")}
          </Button>
          <Button variant="danger" size="sm">
            <Trash2 className="w-4 h-4" />
            {t("delete")}
          </Button>
        </div>
      </div>

      {/* Card detail */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Bandeau coloré type */}
        <div className={`${cfg.bg} px-6 py-5 flex items-center gap-4`}>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
              {typeLabels[idea.type]}
            </p>
            <h1 className="text-white text-xl font-bold leading-tight mt-0.5">
              {idea.title}
            </h1>
          </div>
        </div>

        {/* Contenu */}
        <div className="px-6 py-6 space-y-5">
          {/* Status + dates */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={statusStyles[idea.status]}>
              {statusLabels[idea.status]}
            </Badge>
            <span className="text-xs text-slate-400">
              {t("createdAt")} {new Date(idea.createdAt).toLocaleDateString()}
            </span>
            <span className="text-xs text-slate-400">
              {t("updatedAt")} {new Date(idea.updatedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Description */}
          {idea.description ? (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t("description")}
              </p>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {idea.description}
              </p>
            </div>
          ) : (
            <p className="text-slate-400 text-sm italic">{t("noDescription")}</p>
          )}

          {/* Tags */}
          {idea.tags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t("tags")}
              </p>
              <div className="flex flex-wrap gap-2">
                {idea.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs px-3 py-1 rounded-full font-medium bg-slate-100 ${cfg.color}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
