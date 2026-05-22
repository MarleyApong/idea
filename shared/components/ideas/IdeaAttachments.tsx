"use client"

import { useState } from "react"
import type { Attachment } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { Paperclip, Trash2, FileText, Image, Download, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { api } from "@/shared/lib/axios"
import { attachmentsKey, useUploadAttachment, useDeleteAttachment } from "@/shared/lib/queries/attachments"
import { FileUpload } from "@/shared/components/ui/FileUpload"
import { Button } from "@/shared/components/ui/Button"

async function fetchAttachments(ideaId: string): Promise<Attachment[]> {
  const { data } = await api.get<Attachment[]>(`/ideas/${ideaId}/attachments`)
  return data
}

function AttachmentIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <Image className="w-5 h-5 text-blue-500" />
  return <FileText className="w-5 h-5 text-slate-400" />
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface IdeaAttachmentsProps {
  ideaId: string
  initialAttachments: Attachment[]
}

export function IdeaAttachments({ ideaId, initialAttachments }: IdeaAttachmentsProps) {
  const t = useTranslations("attachments")
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState("")

  const { data: attachments = initialAttachments } = useQuery({
    queryKey: attachmentsKey(ideaId),
    queryFn: () => fetchAttachments(ideaId),
    initialData: initialAttachments,
  })

  const { mutate: upload, isPending: uploading } = useUploadAttachment(ideaId)
  const { mutate: deleteAttachment } = useDeleteAttachment(ideaId)

  function handleUpload() {
    if (!selectedFile) return
    setUploadError("")
    upload(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null)
        setShowUpload(false)
      },
      onError: (err) => setUploadError(err.message),
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-slate-400" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("title")}</p>
          {attachments.length > 0 && (
            <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
              {attachments.length}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowUpload(!showUpload)}>
          <Plus className="w-4 h-4" />
          {t("add")}
        </Button>
      </div>

      {showUpload && (
        <div className="mb-4 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onFileRemove={() => setSelectedFile(null)}
            error={uploadError}
          />
          {selectedFile && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => { setSelectedFile(null); setShowUpload(false) }}>
                {t("cancel")}
              </Button>
              <Button variant="primary" size="sm" className="flex-1" disabled={uploading} onClick={handleUpload}>
                {uploading ? t("uploading") : t("upload")}
              </Button>
            </div>
          )}
        </div>
      )}

      {attachments.length === 0 ? (
        <p className="text-sm text-slate-400 italic">{t("empty")}</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 group">
              <AttachmentIcon mimeType={att.mimeType} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{att.filename}</p>
                <p className="text-xs text-slate-400">{formatSize(att.size)}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={att.url} download={att.filename} className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-white transition-colors">
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => deleteAttachment(att.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
