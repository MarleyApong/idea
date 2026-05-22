"use client"

import { useState } from "react"
import type { Attachment } from "@prisma/client"
import { Paperclip, Trash2, FileText, FileType, Download, Plus, X, Eye } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAttachments, useUploadAttachment, useDeleteAttachment } from "@/features/attachments/hooks/useAttachments"
import { FileUpload } from "@/shared/components/ui/FileUpload"
import { Button } from "@/shared/components/ui/Button"
import { MediaViewer } from "./MediaViewer"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function AttachmentCard({
  att,
  onView,
  onDelete,
  deleting,
}: {
  att: Attachment
  onView: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const isImage = att.mimeType.startsWith("image/")
  const isPdf = att.mimeType === "application/pdf"
  const displayName = att.title || att.filename

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Zone apercu */}
      <div
        className="relative h-28 cursor-pointer"
        onClick={onView}
      >
        {isImage ? (
          <img
            src={att.url}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : isPdf ? (
          <div className="w-full h-full bg-red-50 flex flex-col items-center justify-center gap-1">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <FileType className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">PDF</span>
          </div>
        ) : (
          <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-1">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {att.filename.split(".").pop()?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Overlay actions au survol */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onView() }}
            className="p-2 bg-white rounded-lg text-slate-700 hover:text-primary shadow-sm transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <a
            href={att.url}
            download={att.filename}
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-white rounded-lg text-slate-700 hover:text-primary shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            disabled={deleting}
            className="p-2 bg-white rounded-lg text-slate-700 hover:text-red-500 shadow-sm transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Infos */}
      <div className="px-3 py-2">
        <p className="text-xs font-semibold text-slate-800 truncate">{displayName}</p>
        <p className="text-xs text-slate-400">{formatSize(att.size)}</p>
      </div>
    </div>
  )
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
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""))
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {attachments.map((att) => (
              <AttachmentCard
                key={att.id}
                att={att}
                onView={() => setViewing(att)}
                onDelete={() => remove(att.id)}
                deleting={removing}
              />
            ))}
          </div>
        )}
      </div>

      <MediaViewer attachment={viewing} onClose={() => setViewing(null)} />
    </>
  )
}
