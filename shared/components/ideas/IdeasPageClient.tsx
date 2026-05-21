"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import type { Idea } from "@prisma/client"
import { ClipboardPenLine, Lightbulb } from "lucide-react"
import { useIdeas } from "@/shared/lib/queries/ideas"
import { Button } from "@/shared/components/ui/Button"
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          {ideas.length === 0
            ? t("title")
            : ideas.length === 1
            ? t("titleWithCount", { count: 1 })
            : t("titleWithCountPlural", { count: ideas.length })}
        </h1>
        <Button onClick={() => setModalOpen(true)}>
          <ClipboardPenLine className="w-4 h-4" />
          {t("new")}
        </Button>
      </div>

      {ideas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Lightbulb className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{t("empty")}</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-xs">{t("emptyDesc")}</p>
          <Button onClick={() => setModalOpen(true)}>
            <ClipboardPenLine className="w-4 h-4" />
            {t("addFirst")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}

      {modalOpen && (
        <NewIdeaModal locale={locale} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
