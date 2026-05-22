"use client"

import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { X, Check, Ban } from "lucide-react"
import { IdeaType } from "@prisma/client"
import { useCreateIdea } from "@/features/ideas/hooks/useIdeas"
import { ideaTypeConfig } from "@/features/ideas/types/idea-types"
import { Button } from "@/shared/components/ui/Button"
import { Input } from "@/shared/components/ui/Input"
import { Textarea } from "@/shared/components/ui/Textarea"
import { TagInput } from "@/shared/components/ui/TagInput"

interface NewIdeaModalProps {
  locale: string
  onClose: () => void
}

const types: IdeaType[] = ["PROJET", "INSPIRATION", "RAPPEL", "AUTRE"]

export function NewIdeaModal({ locale, onClose }: NewIdeaModalProps) {
  const t = useTranslations("ideas")
  const formRef = useRef<HTMLFormElement>(null)
  const { mutate, isPending, error } = useCreateIdea(locale)
  const [selectedType, setSelectedType] = useState<IdeaType>("PROJET")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set("type", selectedType)
    mutate(formData, {
      onSuccess: () => {
        formRef.current?.reset()
        onClose()
      },
    })
  }

  const typeLabels: Record<IdeaType, string> = {
    PROJET:      t("typeProjet"),
    INSPIRATION: t("typeInspiration"),
    RAPPEL:      t("typeRappel"),
    AUTRE:       t("typeAutre"),
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">{t("new")}</h2>
          <Button variant="ghost" size="sm" type="button" onClick={onClose} className="!p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type selector */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">{t("type")}</p>
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
                      active ? `${cfg.bg} border-transparent` : "border-slate-200 hover:border-slate-300"
                    } ${cfg.color}`}
                  >
                    <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                    <span className="text-xs font-medium">{typeLabels[type]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <Input
            id="title"
            name="title"
            required
            autoFocus
            label={t("titleLabel")}
            placeholder={t("titlePlaceholder")}
          />

          <Textarea
            id="description"
            name="description"
            rows={3}
            label={t("description")}
            hint={t("optional")}
            placeholder={t("descPlaceholder")}
          />

          <TagInput
            name="tags"
            label={t("tags")}
            placeholder={t("tagsPlaceholder")}
            color={ideaTypeConfig[selectedType].color}
          />

          {error && <p className="text-sm text-red-500">{error.message}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              <Ban className="w-4 h-4" />
              {t("cancel")}
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isPending}>
              <Check className="w-4 h-4" />
              {isPending ? t("saving") : t("save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
