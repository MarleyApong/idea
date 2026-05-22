import { api } from "@/shared/lib/axios"
import type { Attachment } from "@prisma/client"

export async function getAttachments(ideaId: string): Promise<Attachment[]> {
  const { data } = await api.get<Attachment[]>(`/ideas/${ideaId}/attachments`)
  return data
}

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg":      ".jpg",
  "image/png":       ".png",
  "image/webp":      ".webp",
  "application/pdf": ".pdf",
  "text/plain":      ".txt",
  "text/markdown":   ".md",
  "text/x-markdown": ".md",
}

function normalizeFile(file: File): File {
  const ext = "." + file.name.split(".").pop()?.toLowerCase()
  const correctExt = MIME_TO_EXT[file.type]
  if (!correctExt || ext === correctExt) return file
  const baseName = file.name.replace(/\.[^.]+$/, "") || "fichier"
  return new File([file], `${baseName}${correctExt}`, { type: file.type })
}

export async function uploadAttachment(file: File, ideaId: string, title?: string): Promise<Attachment> {
  const formData = new FormData()
  formData.append("file", normalizeFile(file))
  formData.append("ideaId", ideaId)
  if (title?.trim()) formData.append("title", title.trim())
  const { data } = await api.post<Attachment>("/upload", formData)
  return data
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  await api.delete(`/upload/${attachmentId}`)
}
