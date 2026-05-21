import type { IdeaType } from "@prisma/client"

export const ideaTypeConfig: Record<
  IdeaType,
  { color: string; bg: string; border: string; dot: string }
> = {
  PROJET:      { color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-400",  dot: "bg-blue-500"   },
  INSPIRATION: { color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-400", dot: "bg-violet-500" },
  RAPPEL:      { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-400", dot: "bg-orange-500" },
  AUTRE:       { color: "text-slate-600",  bg: "bg-slate-100", border: "border-slate-300",  dot: "bg-slate-400"  },
}
