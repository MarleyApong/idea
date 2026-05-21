import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Idea } from "@prisma/client"
import { api } from "@/shared/lib/axios"
import { createIdea, updateIdea, deleteIdea } from "@/shared/lib/actions/ideas"

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: IDEAS_KEY }),
  })
}

export function useUpdateIdea(id: string, locale: string) {
  const queryClient = useQueryClient()
  const boundAction = updateIdea.bind(null, id, locale)
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await boundAction(null, formData)
      if (result?.error) throw new Error(result.error)
      return result
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: IDEAS_KEY }),
  })
}

export function useDeleteIdea(id: string, locale: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteIdea(id, locale),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: IDEAS_KEY }),
  })
}
