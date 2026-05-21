"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import type { Idea, IdeaType, IdeaStatus } from "@prisma/client"
import { ArrowLeft, Pencil, Trash2, AlertTriangle, Check, Archive } from "lucide-react"
import { ideaTypeConfig } from "@/shared/lib/idea-types"
import { useDeleteIdea } from "@/shared/lib/queries/ideas"
import { Button } from "@/shared/components/ui/Button"
import { EditIdeaModal } from "./EditIdeaModal"

const steps: { status: IdeaStatus; percent: number }[] = [
  { status: "DRAFT",       percent: 0   },
  { status: "IN_PROGRESS", percent: 50  },
  { status: "DONE",        percent: 100 },
]

function getProgressPercent(status: IdeaStatus): number {
  if (status === "ARCHIVED") return 0
  return steps.find((s) => s.status === status)?.percent ?? 0
}

function IdeaProgressBar({ status, statusLabels }: { status: IdeaStatus; statusLabels: Record<IdeaStatus, string> }) {
  const isArchived = status === "ARCHIVED"
  const percent = getProgressPercent(status)

  if (isArchived) {
    return (
      <div className="px-6 py-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-slate-400">
          <Archive className="w-4 h-4" />
          <span className="text-sm font-medium">{statusLabels["ARCHIVED"]}</span>
        </div>
        <div className="mt-2 h-2 w-full bg-slate-100 rounded-full">
          <div className="h-2 w-1/4 bg-slate-300 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-4 border-t border-slate-100">
      {/* Etapes */}
      <div className="flex items-center justify-between mb-3">
        {steps.map((step, i) => {
          const isDone = percent >= step.percent
          const isCurrent = status === step.status
          return (
            <div key={step.status} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isDone
                  ? isCurrent
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-primary text-white"
                  : "bg-slate-100 text-slate-400"
              }`}>
                {isDone && !isCurrent ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${isCurrent ? "text-primary" : isDone ? "text-slate-600" : "text-slate-400"}`}>
                {statusLabels[step.status]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Barre */}
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-2 bg-primary rounded-full transition-all duration-500"
          style={{ width: percent === 0 ? "8%" : `${percent}%` }}
        />
      </div>
    </div>
  )
}

export function IdeaDetailClient({ idea, locale }: { idea: Idea; locale: string }) {
  const t = useTranslations("ideas")
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { mutate: deleteIdea, isPending: deleting } = useDeleteIdea(idea.id, locale)

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
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/${locale}/ideas`)}>
          <ArrowLeft className="w-4 h-4" />
          {t("backToIdeas")}
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="w-4 h-4" />
            {t("edit")}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="w-4 h-4" />
            {t("delete")}
          </Button>
        </div>
      </div>

      {/* Card detail */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header colore */}
        <div className={`${cfg.bg} px-6 py-5 flex items-center gap-4`}>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
              {typeLabels[idea.type]}
            </p>
            <h1 className="text-white text-xl font-bold leading-tight mt-0.5 break-words">
              {idea.title}
            </h1>
          </div>
        </div>

        {/* Barre de progression */}
        <IdeaProgressBar status={idea.status} statusLabels={statusLabels} />

        {/* Contenu */}
        <div className="px-6 py-5 space-y-5 border-t border-slate-100">
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            <span>{t("createdAt")} {new Date(idea.createdAt).toLocaleDateString()}</span>
            <span>{t("updatedAt")} {new Date(idea.updatedAt).toLocaleDateString()}</span>
          </div>

          {idea.description ? (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("description")}</p>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{idea.description}</p>
            </div>
          ) : (
            <p className="text-slate-400 text-sm italic">{t("noDescription")}</p>
          )}

          {idea.tags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t("tags")}</p>
              <div className="flex flex-wrap gap-2">
                {idea.tags.map((tag) => (
                  <span key={tag} className={`text-xs px-3 py-1 rounded-full font-medium bg-slate-100 ${cfg.color}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {editOpen && <EditIdeaModal idea={idea} locale={locale} onClose={() => setEditOpen(false)} />}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{t("confirmDeleteTitle")}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{t("confirmDeleteDesc")}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                {t("cancel")}
              </Button>
              <Button variant="danger" className="flex-1" disabled={deleting} onClick={() => deleteIdea()}>
                <Trash2 className="w-4 h-4" />
                {deleting ? "..." : t("delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
