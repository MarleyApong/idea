import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { Attachment } from "@prisma/client"
import { api } from "@/shared/lib/axios"

export const attachmentsKey = (ideaId: string) => ["attachments", ideaId]

export function useUploadAttachment(ideaId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File): Promise<Attachment> => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("ideaId", ideaId)
      const { data } = await api.post<Attachment>("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentsKey(ideaId) })
    },
  })
}

export function useDeleteAttachment(ideaId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (attachmentId: string) => {
      await api.delete(`/upload/${attachmentId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentsKey(ideaId) })
    },
  })
}
