import { api } from "@/shared/lib/axios"
import type { Attachment } from "@prisma/client"

export async function getAttachments(ideaId: string): Promise<Attachment[]> {
  const { data } = await api.get<Attachment[]>(`/ideas/${ideaId}/attachments`)
  return data
}

export async function uploadAttachment(file: File, ideaId: string): Promise<Attachment> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("ideaId", ideaId)
  const { data } = await api.post<Attachment>("/upload", formData)
  return data
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  await api.delete(`/upload/${attachmentId}`)
}
