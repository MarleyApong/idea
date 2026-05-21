"use client"

import { useRef } from "react"
import { useTranslations } from "next-intl"
import { X, Check, Ban } from "lucide-react"
import type { Idea, IdeaType, IdeaStatus } from "@prisma/client"
import { useUpdateIdea } from "@/shared/lib/queries/ideas"
import { ideaTypeConfig } from "@/shared/lib/idea-types"
import { Button } from "@/shared/components/ui/Button"
import { Input } from "@/shared/components/ui/Input"
import { Textarea } from "@/shared/components/ui/Textarea"

const types: IdeaType[] = ["PROJET", "INSPIRATION", "RAPPEL", "AUTRE"]
const statuses: IdeaStatus[] = ["DRAFT", "IN_PROGRESS", "DONE", "ARCHIVED"]

const statusColors: Record<IdeaStatus, string> = {
  DRAFT:       "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE:        "bg-green-100 text-green-700",
  ARCHIVED:    "bg-amber-100 text-amber-700",
}

const statusActiveColors: Record<IdeaStatus, string> = {
  DRAFT:       "bg-slate-500 text-white",
  IN_PROGRESS: "bg-blue-600 text-white",
  DONE:        "bg-green-600 text-white",
  ARCHIVED:    "bg-amber-500 text-white",
}

interface EditIdeaModalProps {
  idea: Idea
  locale: string
  onClose: () => void
}

export function EditIdeaModal({ idea, locale, onClose }: EditIdeaModalProps) {
  const t = useTranslations("ideas")
  const formRef = useRef<HTMLFormElement>(null)
  const { mutate, isPending, error } = useUpdateIdea(idea.id, locale)

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    mutate(formData, { onSuccess: onClose })
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">{t("edit")}</h2>
          <Button variant="ghost" size="sm" type="button" onClick={onClose} className="!p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">{t("type")}</p>
            <div className="grid grid-cols-4 gap-2">
              {types.map((type) => {
                const cfg = ideaTypeConfig[type]
                return (
                  <label key={type} className="cursor-pointer">
                    <input type="radio" name="type" value={type} defaultChecked={idea.type === type} className="sr-only peer" />
                    <div className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl border-2 border-transparent peer-checked:border-current peer-checked:${cfg.bg.replace("bg-", "bg-").replace("500", "100")} ${cfg.color} hover:bg-slate-50 transition-colors`}>
                      <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                      <span className="text-xs font-medium">{typeLabels[type]}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">{t("status") ?? "Statut"}</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <label key={status} className="cursor-pointer">
                  <input type="radio" name="status" value={status} defaultChecked={idea.status === status} className="sr-only peer" />
                  <div className={`text-xs font-medium px-3 py-1.5 rounded-full border-2 border-transparent peer-checked:border-current ${statusColors[status]} peer-checked:${statusActiveColors[status]} transition-colors cursor-pointer`}>
                    {statusLabels[status]}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Input id="title" name="title" required label={t("titleLabel")} defaultValue={idea.title} placeholder={t("titlePlaceholder")} />

          <Textarea id="description" name="description" rows={3} label={t("description")} hint={t("optional")} defaultValue={idea.description ?? ""} placeholder={t("descPlaceholder")} />

          <Input id="tags" name="tags" label={t("tags")} hint={t("tagsHint").toLowerCase()} defaultValue={idea.tags.join(", ")} placeholder={t("tagsPlaceholder")} />

          {error && <p className="text-sm text-red-500">{error.message}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              <Ban className="w-4 h-4" />{t("cancel")}
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isPending}>
              <Check className="w-4 h-4" />{isPending ? t("saving") : t("save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
