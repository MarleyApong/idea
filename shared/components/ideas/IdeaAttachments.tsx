"use client"

import { useState } from "react"
import type { Attachment } from "@prisma/client"
import { Paperclip, Trash2, FileText, Image, Download, Plus, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAttachments, useUploadAttachment, useDeleteAttachment } from "@/shared/lib/queries/attachments"
import { FileUpload } from "@/shared/components/ui/FileUpload"
import { Button } from "@/shared/components/ui/Button"

function AttachmentIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <Image className="w-5 h-5 text-blue-500" />
  return <FileText className="w-5 h-5 text-slate-400" />
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function IdeaAttachments({ ideaId, initialAttachments }: { ideaId: string; initialAttachments: Attachment[] }) {
  const t = useTranslations("attachments")
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { data: attachments = initialAttachments } = useAttachments(ideaId, initialAttachments)

  const { mutate: upload, isPending: uploading } = useUploadAttachment(ideaId)
  const { mutate: remove, isPending: removing } = useDeleteAttachment(ideaId)

  function handleUpload() {
    if (!selectedFile) return
    upload(selectedFile, {
      onSuccess: () => { setSelectedFile(null); setShowUpload(false) },
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-slate-400" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("title")}</p>
          {attachments.length > 0 && (
            <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">
              {attachments.length}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showUpload ? t("cancel") : t("add")}
        </Button>
      </div>

      {showUpload && (
        <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onFileRemove={() => setSelectedFile(null)}
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
                <a
                  href={att.url}
                  download={att.filename}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => remove(att.id)}
                  disabled={removing}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white transition-colors disabled:opacity-40"
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
