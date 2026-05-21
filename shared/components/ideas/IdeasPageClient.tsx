"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import type { Idea } from "@prisma/client"
import { useIdeas } from "@/shared/lib/queries/ideas"
import { IdeaCard } from "./IdeaCard"
import { NewIdeaModal } from "./NewIdeaModal"

interface IdeasPageClientProps {
  locale: string
  initialData: Idea[]
}

export function IdeasPageClient({ locale, initialData }: IdeasPageClientProps) {
  const t = useTranslations("ideas")
  const [modalOpen, setModalOpen] = useState(false)
  const { data: ideas = [] } = useIdeas(initialData)

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          {ideas.length === 0
            ? t("title")
            : ideas.length === 1
            ? t("titleWithCount", { count: 1 })
            : t("titleWithCountPlural", { count: ideas.length })}
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors"
        >
          + {t("new")}
        </button>
      </div>

      {/* Content */}
      {ideas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{t("empty")}</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-xs">{t("emptyDesc")}</p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors"
          >
            {t("addFirst")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <NewIdeaModal locale={locale} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
