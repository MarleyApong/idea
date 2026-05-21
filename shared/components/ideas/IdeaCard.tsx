"use client"

import type { Idea, IdeaStatus } from "@prisma/client"
import { useTranslations } from "next-intl"
import { Card, CardBody } from "@/shared/components/ui/Card"
import { Badge } from "@/shared/components/ui/Badge"

const statusVariant: Record<IdeaStatus, "default" | "primary" | "success" | "warning" | "muted"> = {
  DRAFT: "default",
  IN_PROGRESS: "primary",
  DONE: "success",
  ARCHIVED: "warning",
}

export function IdeaCard({ idea }: { idea: Idea }) {
  const t = useTranslations("ideas")

  const statusLabel: Record<IdeaStatus, string> = {
    DRAFT: t("draft"),
    IN_PROGRESS: t("inProgress"),
    DONE: t("done"),
    ARCHIVED: t("archived"),
  }

  return (
    <Card hoverable>
      <CardBody>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-primary">
            {idea.title}
          </h3>
          <Badge variant={statusVariant[idea.status]}>
            {statusLabel[idea.status]}
          </Badge>
        </div>

        {idea.description && (
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-3">
            {idea.description}
          </p>
        )}

        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {idea.tags.map((tag) => (
              <Badge key={tag} variant="primary">{tag}</Badge>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-400">
          {new Date(idea.updatedAt).toLocaleDateString()}
        </p>
      </CardBody>
    </Card>
  )
}
