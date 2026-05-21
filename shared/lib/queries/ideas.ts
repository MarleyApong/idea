import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Idea } from "@prisma/client"
import { api } from "@/shared/lib/axios"
import { createIdea } from "@/shared/lib/actions/ideas"

export const IDEAS_KEY = ["ideas"] as const

async function fetchIdeas(): Promise<Idea[]> {
  const { data } = await api.get<Idea[]>("/ideas")
  return data
}

export function useIdeas(initialData?: Idea[]) {
  return useQuery({
    queryKey: IDEAS_KEY,
    queryFn: fetchIdeas,
    initialData,
  })
}

export function useCreateIdea(locale: string) {
  const queryClient = useQueryClient()
  const boundAction = createIdea.bind(null, locale)

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await boundAction(null, formData)
      if (result?.error) throw new Error(result.error)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: IDEAS_KEY })
    },
  })
}
