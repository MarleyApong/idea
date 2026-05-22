"use client"

import { useState } from "react"
import type { Attachment } from "@prisma/client"
import { Paperclip, Trash2, FileText, FileImage, FileType, Download, Plus, X, Eye } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAttachments, useUploadAttachment, useDeleteAttachment } from "@/features/attachments/hooks/useAttachments"
import { FileUpload } from "@/shared/components/ui/FileUpload"
import { Button } from "@/shared/components/ui/Button"
import { MediaViewer } from "./MediaViewer"

function AttachmentIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <FileImage className="w-5 h-5 text-blue-500 shrink-0" />
  if (mimeType === "application/pdf") return <FileType className="w-5 h-5 text-red-400 shrink-0" />
  return <FileText className="w-5 h-5 text-slate-400 shrink-0" />
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
  const [title, setTitle] = useState("")
  const [viewing, setViewing] = useState<Attachment | null>(null)

  const { data: attachments = initialAttachments } = useAttachments(ideaId, initialAttachments)
  const { mutate: upload, isPending: uploading } = useUploadAttachment(ideaId)
  const { mutate: remove, isPending: removing } = useDeleteAttachment(ideaId)

  function handleFileSelect(file: File) {
    setSelectedFile(file)
    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^.]+$/, "")
      setTitle(nameWithoutExt)
    }
  }

  function handleUpload() {
    if (!selectedFile) return
    upload({ file: selectedFile, title: title || undefined }, {
      onSuccess: () => { setSelectedFile(null); setTitle(""); setShowUpload(false) },
    })
  }

  function handleCancel() {
    setSelectedFile(null)
    setTitle("")
    setShowUpload(false)
  }

  return (
    <>
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
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">{t("titleField")}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("titlePlaceholder")}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
              />
            </div>

            <FileUpload
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onFileRemove={() => { setSelectedFile(null); setTitle("") }}
            />

            {selectedFile && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={handleCancel}>
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
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {att.title || att.filename}
                  </p>
                  <p className="text-xs text-slate-400">{formatSize(att.size)}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setViewing(att)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-white transition-colors" title="Apercu">
                    <Eye className="w-4 h-4" />
                  </button>
                  <a href={att.url} download={att.filename} className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-white transition-colors" title="Telecharger">
                    <Download className="w-4 h-4" />
                  </a>
                  <button onClick={() => remove(att.id)} disabled={removing} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white transition-colors disabled:opacity-40" title="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MediaViewer attachment={viewing} onClose={() => setViewing(null)} />
    </>
  )
}
