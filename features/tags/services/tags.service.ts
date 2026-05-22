import { api } from "@/shared/lib/axios"

export async function getSavedTags(): Promise<string[]> {
  const { data } = await api.get<string[]>("/tags")
  return data
}
