"use client"

import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { X, Check, Ban } from "lucide-react"
import type { Idea, IdeaType, IdeaStatus } from "@prisma/client"
import { useUpdateIdea } from "@/features/ideas/hooks/useIdeas"
import { ideaTypeConfig } from "@/features/ideas/types/idea-types"
import { Button } from "@/shared/components/ui/Button"
import { Input } from "@/shared/components/ui/Input"
import { Textarea } from "@/shared/components/ui/Textarea"
import { TagInput } from "@/shared/components/ui/TagInput"

const types: IdeaType[] = ["PROJET", "INSPIRATION", "RAPPEL", "AUTRE"]
const statuses: IdeaStatus[] = ["DRAFT", "IN_PROGRESS", "DONE", "ARCHIVED"]

const statusConfig: Record<IdeaStatus, { idle: string; active: string }> = {
  DRAFT:       { idle: "bg-slate-100 text-(--fg-muted) hover:bg-slate-200",       active: "bg-slate-600 text-white"   },
  IN_PROGRESS: { idle: "bg-blue-100 text-blue-700 hover:bg-blue-200",          active: "bg-blue-600 text-white"    },
  DONE:        { idle: "bg-green-100 text-green-700 hover:bg-green-200",        active: "bg-green-600 text-white"   },
  ARCHIVED:    { idle: "bg-amber-100 text-amber-700 hover:bg-amber-200",        active: "bg-amber-500 text-white"   },
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
  const [selectedType, setSelectedType] = useState<IdeaType>(idea.type ?? "PROJET")
  const [selectedStatus, setSelectedStatus] = useState<IdeaStatus>(idea.status ?? "DRAFT")

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
    formData.set("type", selectedType)
    formData.set("status", selectedStatus)
    mutate(formData, { onSuccess: onClose })
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-(--bg-card) rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-(--border)">
          <h2 className="text-lg font-semibold text-(--fg)">{t("edit")}</h2>
          <Button variant="ghost" size="sm" type="button" onClick={onClose} className="p-1.5! rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        </div>
 
        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type */}
          <div>
            <p className="text-sm font-medium text-(--fg) mb-2">{t("type")}</p>
            <div className="grid grid-cols-4 gap-2">
              {types.map((type) => {
                const cfg = ideaTypeConfig[type]
                const active = selectedType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl border-2 transition-all ${
                      active
                        ? `${cfg.bg} border-transparent`
                        : "border-(--border) hover:border-slate-300"
                    } ${cfg.color}`}
                  >
                    <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                    <span className="text-xs font-medium">{typeLabels[type]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm font-medium text-(--fg) mb-2">{t("status")}</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => {
                const active = selectedStatus === status
                const cfg = statusConfig[status]
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${
                      active ? cfg.active : cfg.idle
                    }`}
                  >
                    {statusLabels[status]}
                  </button>
                )
              })}
            </div>
          </div>

          <Input
            id="title"
            name="title"
            required
            label={t("titleLabel")}
            defaultValue={idea.title}
            placeholder={t("titlePlaceholder")}
          />

          <Textarea
            id="description"
            name="description"
            rows={3}
            label={t("description")}
            hint={t("optional")}
            defaultValue={idea.description ?? ""}
            placeholder={t("descPlaceholder")}
          />

          <TagInput
            name="tags"
            label={t("tags")}
            defaultValue={idea.tags.join(",")}
            placeholder={t("tagsPlaceholder")}
            color={(ideaTypeConfig[selectedType] ?? ideaTypeConfig.PROJET).color}
          />

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
