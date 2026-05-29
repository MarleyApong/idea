"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import type { Idea, IdeaStatus, IdeaType } from "@prisma/client"
import { ClipboardPenLine } from "lucide-react"
import { useIdeas } from "@/features/ideas/hooks/useIdeas"
import { Button } from "@/shared/components/ui/Button"
import { IdeaCard } from "./IdeaCard"
import { NewIdeaModal } from "./NewIdeaModal"
import { IdeasFilters } from "./IdeasFilters"

interface IdeasPageClientProps {
  locale: string
  initialData: Idea[]
}

export function IdeasPageClient({ locale, initialData }: IdeasPageClientProps) {
  const t = useTranslations("ideas")
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<IdeaType | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | "ALL">("ALL")

  const { data: ideas = [] } = useIdeas(initialData)

  const filtered = useMemo(() => {
    return ideas.filter((idea) => {
      const matchSearch =
        !search ||
        idea.title.toLowerCase().includes(search.toLowerCase()) ||
        idea.description?.toLowerCase().includes(search.toLowerCase()) ||
        idea.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      const matchType = typeFilter === "ALL" || idea.type === typeFilter
      const matchStatus = statusFilter === "ALL" || idea.status === statusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [ideas, search, typeFilter, statusFilter])

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-(--fg)">
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

      {ideas.length > 0 && (
        <IdeasFilters
          search={search}
          onSearch={setSearch}
          typeFilter={typeFilter}
          onTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
        />
      )}

      {ideas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <ClipboardPenLine className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-(--fg) mb-2">{t("empty")}</h3>
          <p className="text-(--fg-muted) text-sm mb-6 max-w-xs">{t("emptyDesc")}</p>
          <Button onClick={() => setModalOpen(true)}>
            <ClipboardPenLine className="w-4 h-4" />
            {t("addFirst")}
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-(--fg-muted) text-sm">{t("noResults")}</p>
          <button onClick={() => { setSearch(""); setTypeFilter("ALL"); setStatusFilter("ALL") }} className="mt-2 text-sm text-primary font-medium">
            {t("clearFilters")}
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {filtered.map((idea) => (
            <div
              key={idea.id}
              onClick={() => router.push(`/${locale}/ideas/${idea.id}`)}
              className="break-inside-avoid mb-4 cursor-pointer"
            >
              <IdeaCard idea={idea} />
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <NewIdeaModal locale={locale} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
