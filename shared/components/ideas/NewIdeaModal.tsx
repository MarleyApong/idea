"use client"

import { useRef } from "react"
import { useTranslations } from "next-intl"
import { useCreateIdea } from "@/shared/lib/queries/ideas"

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
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">{t("new")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Titre */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("titleLabel")} <span className="text-primary">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              autoFocus
              placeholder={t("titlePlaceholder")}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("description")}
              <span className="text-slate-400 font-normal ml-1">({t("optional")})</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder={t("descPlaceholder")}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("tags")}
              <span className="text-slate-400 font-normal ml-1">({t("tagsHint").toLowerCase()})</span>
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              placeholder={t("tagsPlaceholder")}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Erreur */}
          {error && (
            <p className="text-sm text-red-500">{error.message}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-60 transition-colors"
            >
              {isPending ? t("saving") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
