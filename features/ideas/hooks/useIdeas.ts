import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import type { Idea, IdeaType, IdeaStatus } from "@prisma/client"
import { getIdeas } from "@/features/ideas/services/ideas.service"
import { createIdea, updateIdea, deleteIdea } from "@/features/ideas/actions/ideas"
import { enqueue } from "@/shared/lib/offline-queue"
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
      if (!navigator.onLine) {
        const payload = extractPayload(formData)
        await enqueue({ type: "create", payload, locale })

        const tempIdea = buildTempIdea(payload)
        queryClient.setQueryData(IDEAS_KEY, (old: Idea[] = []) => [tempIdea, ...old])
        return null
      }

      const result = await boundAction(null, formData)
      if (result?.error) throw new Error(result.error)
      return result
    },
    onSuccess: (data) => {
      if (data === null) {
        success("Idée sauvegardée — synchronisation en attente")
      } else {
        queryClient.invalidateQueries({ queryKey: IDEAS_KEY })
        success("Idée créée avec succès")
      }
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
      if (!navigator.onLine) {
        const payload = extractPayload(formData, true)
        await enqueue({ type: "update", ideaId: id, payload, locale })

        queryClient.setQueryData(IDEAS_KEY, (old: Idea[] = []) =>
          old.map((idea) =>
            idea.id === id
              ? {
                  ...idea,
                  title: payload.title ?? idea.title,
                  description: payload.description ?? idea.description,
                  type: (payload.ideaType as IdeaType) ?? idea.type,
                  tags: payload.tags ?? idea.tags,
                  status: (payload.status as IdeaStatus) ?? idea.status,
                }
              : idea
          )
        )
        return null
      }

      const result = await boundAction(null, formData)
      if (result?.error) throw new Error(result.error)
      return result
    },
    onSuccess: (data) => {
      if (data === null) {
        success("Idée mise à jour — synchronisation en attente")
      } else {
        queryClient.invalidateQueries({ queryKey: IDEAS_KEY })
        success("Idée mise à jour")
      }
    },
    onError: (err: Error) => error(err.message),
  })
}

export function useDeleteIdea(id: string, locale: string) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { success, error } = useNotifications()

  return useMutation({
    mutationFn: async () => {
      if (!navigator.onLine) {
        await enqueue({ type: "delete", ideaId: id, payload: {}, locale })
        queryClient.setQueryData(IDEAS_KEY, (old: Idea[] = []) =>
          old.filter((idea) => idea.id !== id)
        )
        return null
      }
      return deleteIdea(id, locale)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: IDEAS_KEY })
      if (data === null) {
        success("Idée supprimée — synchronisation en attente")
        router.push(`/${locale}/ideas`)
      }
    },
    onError: (err: Error) => error(err.message),
  })
}

function extractPayload(formData: FormData, withStatus = false) {
  return {
    title: (formData.get("title") as string)?.trim(),
    description: (formData.get("description") as string)?.trim() || undefined,
    ideaType: (formData.get("type") as string) || undefined,
    tags: (formData.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) ?? [],
    ...(withStatus && { status: (formData.get("status") as string) || undefined }),
  }
}

function buildTempIdea(payload: ReturnType<typeof extractPayload>): Idea {
  return {
    id: `temp_${crypto.randomUUID()}`,
    title: payload.title ?? "",
    description: payload.description ?? null,
    type: (payload.ideaType as IdeaType) ?? "PROJET",
    tags: payload.tags ?? [],
    status: "DRAFT" as IdeaStatus,
    userId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
