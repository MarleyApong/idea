import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Idea } from "@prisma/client"
import { getIdeas } from "@/features/ideas/services/ideas.service"
import { createIdea, updateIdea, deleteIdea } from "@/features/ideas/actions/ideas"
import { useNotifications } from "@/shared/store/notifications"

export const IDEAS_KEY = ["ideas"] as const

export function useIdeas(initialData?: Idea[]) {
  return useQuery({
    queryKey: IDEAS_KEY,
    queryFn: getIdeas,
    initialData,
  })
}

export function useCreateIdea(locale: string) {
  const queryClient = useQueryClient()
  const { success, error } = useNotifications()
  const boundAction = createIdea.bind(null, locale)

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await boundAction(null, formData)
      if (result?.error) throw new Error(result.error)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: IDEAS_KEY })
      success("Idee creee avec succes")
    },
    onError: (err: Error) => error(err.message),
  })
}

export function useUpdateIdea(id: string, locale: string) {
  const queryClient = useQueryClient()
  const { success, error } = useNotifications()
  const boundAction = updateIdea.bind(null, id, locale)

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await boundAction(null, formData)
      if (result?.error) throw new Error(result.error)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: IDEAS_KEY })
      success("Idee mise a jour")
    },
    onError: (err: Error) => error(err.message),
  })
}

export function useDeleteIdea(id: string, locale: string) {
  const queryClient = useQueryClient()
  const { error } = useNotifications()

  return useMutation({
    mutationFn: () => deleteIdea(id, locale),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: IDEAS_KEY }),
    onError: (err: Error) => error(err.message),
  })
}
