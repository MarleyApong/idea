import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Attachment } from "@prisma/client"
import { getAttachments, uploadAttachment, deleteAttachment } from "@/shared/services/attachments.service"
import { useNotifications } from "@/shared/store/notifications"

export const attachmentsKey = (ideaId: string) => ["attachments", ideaId]

export function useAttachments(ideaId: string, initialData: Attachment[]) {
  return useQuery({
    queryKey: attachmentsKey(ideaId),
    queryFn: () => getAttachments(ideaId),
    initialData,
  })
}

export function useUploadAttachment(ideaId: string) {
  const queryClient = useQueryClient()
  const { success, error } = useNotifications()

  return useMutation({
    mutationFn: (file: File) => uploadAttachment(file, ideaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentsKey(ideaId) })
      success("Fichier televerse avec succes")
    },
    onError: (err: Error) => error(err.message),
  })
}

export function useDeleteAttachment(ideaId: string) {
  const queryClient = useQueryClient()
  const { success, error } = useNotifications()

  return useMutation({
    mutationFn: (attachmentId: string) => deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentsKey(ideaId) })
      success("Fichier supprime")
    },
    onError: (err: Error) => error(err.message),
  })
}
