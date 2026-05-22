import type { IdeaType } from "@prisma/client"
import { Layers, Lightbulb, Bell, Grid2x2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const ideaTypeConfig: Record<
  IdeaType,
  { color: string; bg: string; border: string; dot: string; icon: LucideIcon }
> = {
  PROJET:      { color: "text-blue-700 dark:text-blue-400",   bg: "bg-blue-500",   border: "border-blue-200 dark:border-blue-700",   dot: "bg-blue-500",   icon: Layers    },
  INSPIRATION: { color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-500", border: "border-violet-200 dark:border-violet-700", dot: "bg-violet-500", icon: Lightbulb },
  RAPPEL:      { color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-500", border: "border-orange-200 dark:border-orange-700", dot: "bg-orange-500", icon: Bell       },
  AUTRE:       { color: "text-slate-500 dark:text-slate-400",  bg: "bg-slate-400",  border: "border-slate-200 dark:border-slate-600",  dot: "bg-slate-400",  icon: Grid2x2   },
}
