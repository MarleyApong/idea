"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, Download, ZoomIn, ZoomOut, RotateCcw, FileText, FileType } from "lucide-react"
import type { Attachment } from "@prisma/client"

type DocType = "IMAGE" | "PDF" | "TEXT" | "OTHER"

function inferDocType(mimeType: string): DocType {
  if (mimeType.startsWith("image/")) return "IMAGE"
  if (mimeType === "application/pdf") return "PDF"
  if (mimeType.startsWith("text/")) return "TEXT"
  return "OTHER"
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* ---- Image viewer avec zoom ---- */
function ImageViewer({ url, title }: { url: string; title: string }) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    setScale((s) => Math.min(8, Math.max(0.25, s - e.deltaY * 0.001)))
  }

  function handleMouseDown(e: React.MouseEvent) {
    dragging.current = true
    last.current = { x: e.clientX, y: e.clientY }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return
    setOffset((o) => ({ x: o.x + e.clientX - last.current.x, y: o.y + e.clientY - last.current.y }))
    last.current = { x: e.clientX, y: e.clientY }
  }

  function reset() { setScale(1); setOffset({ x: 0, y: 0 }) }

  return (
    <div
      className="relative flex-1 overflow-hidden bg-black/90 flex items-center justify-center select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => { dragging.current = false }}
      onMouseLeave={() => { dragging.current = false }}
      onDoubleClick={reset}
    >
      <img
        src={url}
        alt={title}
        draggable={false}
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, cursor: dragging.current ? "grabbing" : "grab" }}
        className="max-w-full max-h-full object-contain transition-none"
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 rounded-xl px-3 py-1.5">
        <button onClick={() => setScale((s) => Math.max(0.25, s - 0.25))} className="text-white/70 hover:text-white p-1">
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-white/70 text-xs font-mono w-12 text-center">{(scale * 100).toFixed(0)}%</span>
        <button onClick={() => setScale((s) => Math.min(8, s + 0.25))} className="text-white/70 hover:text-white p-1">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={reset} className="text-white/70 hover:text-white p-1 ml-1">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* ---- PDF viewer ---- */
function PdfViewer({ url }: { url: string }) {
  return (
    <iframe
      src={`${url}#toolbar=1`}
      className="flex-1 w-full border-0"
      title="PDF"
    />
  )
}

/* ---- Text viewer ---- */
function TextViewer({ url }: { url: string }) {
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(url)
      .then((r) => r.text())
      .then(setContent)
      .catch(() => setError(true))
  }, [url])

  if (error) return <div className="flex-1 flex items-center justify-center text-slate-400">Impossible de charger le fichier</div>
  if (!content) return <div className="flex-1 flex items-center justify-center text-slate-400">Chargement...</div>

  return (
    <div className="flex-1 overflow-auto bg-slate-950 p-6">
      <pre className="text-sm text-slate-200 font-mono whitespace-pre-wrap break-words leading-relaxed">{content}</pre>
    </div>
  )
}

/* ---- Download card ---- */
function DownloadCard({ attachment }: { attachment: Attachment }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="w-20 h-20 bg-slate-200 rounded-2xl flex items-center justify-center">
        <FileType className="w-10 h-10 text-slate-400" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-800">{attachment.title || attachment.filename}</p>
        <p className="text-sm text-slate-400 mt-1">{formatSize(attachment.size)}</p>
      </div>
      <a
        href={attachment.url}
        download={attachment.filename}
        className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors"
      >
        <Download className="w-4 h-4" />
        Telecharger
      </a>
    </div>
  )
}

/* ---- MediaViewer principal ---- */
interface MediaViewerProps {
  attachment: Attachment | null
  onClose: () => void
}

export function MediaViewer({ attachment, onClose }: MediaViewerProps) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [handleKey])

  if (!attachment) return null

  const docType = inferDocType(attachment.mimeType)
  const displayTitle = attachment.title || attachment.filename

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl w-full ${
        docType === "IMAGE" ? "max-w-5xl h-[90vh]" :
        docType === "PDF"   ? "max-w-4xl h-[90vh]" :
        docType === "TEXT"  ? "max-w-3xl h-[80vh]" :
                              "max-w-sm"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
            <p className="text-sm font-semibold text-slate-800 truncate">{displayTitle}</p>
            <span className="text-xs text-slate-400 shrink-0">{formatSize(attachment.size)}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <a
              href={attachment.url}
              download={attachment.filename}
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors"
              title="Telecharger"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        {docType === "IMAGE" && <ImageViewer url={attachment.url} title={displayTitle} />}
        {docType === "PDF"   && <PdfViewer url={attachment.url} />}
        {docType === "TEXT"  && <TextViewer url={attachment.url} />}
        {docType === "OTHER" && <DownloadCard attachment={attachment} />}
      </div>
    </div>
  )
}
