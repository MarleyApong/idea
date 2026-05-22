import { api } from "@/shared/lib/axios"
import type { Idea } from "@prisma/client"

export async function getIdeas(): Promise<Idea[]> {
  const { data } = await api.get<Idea[]>("/ideas")
  return data
}
