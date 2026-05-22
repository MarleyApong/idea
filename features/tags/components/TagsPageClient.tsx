"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tag, Search } from "lucide-react"

interface TagItem {
  name: string
  count: number
}

interface TagsPageClientProps {
  tags: TagItem[]
  locale: string
  title: string
  emptyText: string
  ideasLabel: string
}

export function TagsPageClient({ tags, locale, title, emptyText, ideasLabel }: TagsPageClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleTagClick(tag: string) {
    router.push(`/${locale}/ideas?tag=${encodeURIComponent(tag)}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-(--fg)">{title}</h1>
            <p className="text-sm text-slate-400">{tags.length} tag{tags.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {tags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
            <Tag className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
          </div>
          <p className="text-slate-400 text-sm">{emptyText}</p>
        </div>
      ) : (
        <>
          {/* Recherche */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un tag..."
              className="w-full pl-9 py-2.5 rounded-xl border border-(--border) text-sm text-(--fg) placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-(--bg-card)"
            />
          </div>

          {/* Grille de tags */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map((tag) => (
              <button
                key={tag.name}
                onClick={() => handleTagClick(tag.name)}
                className="bg-(--bg-card) rounded-xl border border-(--border) p-4 text-left hover:border-primary hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="text-sm font-semibold text-(--fg) group-hover:text-primary transition-colors truncate">
                    {tag.name}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {tag.count} {ideasLabel}
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
