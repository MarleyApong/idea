"use client"

import { useRef } from "react"
import { useTranslations } from "next-intl"
import { X, Check, Ban } from "lucide-react"
import { useCreateIdea } from "@/shared/lib/queries/ideas"
import { Button } from "@/shared/components/ui/Button"
import { Input } from "@/shared/components/ui/Input"
import { Textarea } from "@/shared/components/ui/Textarea"

interface NewIdeaModalProps {
  locale: string
  onClose: () => void
}

export function NewIdeaModal({ locale, onClose }: NewIdeaModalProps) {
  const t = useTranslations("ideas")
  const formRef = useRef<HTMLFormElement>(null)
  const { mutate, isPending, error } = useCreateIdea(locale)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    mutate(formData, {
      onSuccess: () => {
        formRef.current?.reset()
        onClose()
      },
    })
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

          <Input
            id="tags"
            name="tags"
            label={t("tags")}
            hint={t("tagsHint").toLowerCase()}
            placeholder={t("tagsPlaceholder")}
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
