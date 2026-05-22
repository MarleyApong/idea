"use client"

import { useState, useCallback, useRef } from "react"
import { UploadCloud, X, FileText, FileImage, FileType } from "lucide-react"
import Image from "next/image"
import imageCompression from "browser-image-compression"

export interface FileUploadProps {
  onFileSelect: (file: File) => void
  acceptedExtensions?: string[]
  maxSizeInMB?: number
  compressImages?: boolean
  compressionOptions?: { maxSizeMB: number; maxWidthOrHeight: number }
  error?: string
  selectedFile?: File | null
  onFileRemove?: () => void
  className?: string
}

const DEFAULT_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".txt", ".md"]

const ACCEPTED_MIMES = [
  "image/jpeg", "image/png", "image/webp",
  "application/pdf",
  "text/plain", "text/markdown", "text/x-markdown",
]

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileTypeIcon({ file }: { file: File }) {
  if (file.type.startsWith("image/")) return <FileImage className="w-8 h-8 text-blue-500" />
  if (file.type === "application/pdf") return <FileType className="w-8 h-8 text-red-400" />
  return <FileText className="w-8 h-8 text-slate-400" />
}

export function FileUpload({
  onFileSelect,
  acceptedExtensions = DEFAULT_EXTENSIONS,
  maxSizeInMB = 10,
  compressImages = true,
  compressionOptions = { maxSizeMB: 1, maxWidthOrHeight: 1920 },
  error: externalError,
  selectedFile,
  onFileRemove,
  className = "",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [internalError, setInternalError] = useState("")
  const [isCompressing, setIsCompressing] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const error = externalError || internalError

  function validate(file: File): string | null {
    const ext = "." + file.name.split(".").pop()?.toLowerCase()
    if (!acceptedExtensions.includes(ext)) return `Extension non acceptee : ${acceptedExtensions.join(", ")}`
    if (file.type && !ACCEPTED_MIMES.includes(file.type)) return `Type non accepte (${file.type})`
    if (file.size / (1024 * 1024) > maxSizeInMB) return `Fichier trop grand. Max ${maxSizeInMB}MB`
    return null
  }

  async function handleFile(file: File) {
    setInternalError("")
    const err = validate(file)
    if (err) { setInternalError(err); return }

    let final = file
    if (compressImages && file.type.startsWith("image/")) {
      try {
        setIsCompressing(true)
        final = await imageCompression(file, compressionOptions)
        setPreview(URL.createObjectURL(final))
      } finally {
        setIsCompressing(false)
      }
    } else if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file))
    } else {
      setPreview(null)
    }

    onFileSelect(final)
  }

  function handleRemove() {
    setInternalError("")
    setPreview(null)
    onFileRemove?.()
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  return (
    <div className={`space-y-2 ${className}`}>
      {selectedFile ? (
        /* Fichier selectionne */
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-primary/30 shadow-sm">
          {preview ? (
            <Image src={preview} alt="" width={56} height={56} unoptimized className="rounded-lg object-cover shrink-0 border border-slate-200" />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <FileTypeIcon file={selectedFile} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{selectedFile.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatSize(selectedFile.size)}</p>
            {isCompressing && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-primary">Compression...</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Zone de depot */
        <div
          className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : error
              ? "border-red-300 bg-red-50"
              : "border-slate-200 hover:border-primary/50 bg-white hover:bg-primary/5"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={acceptedExtensions.join(",")}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />

          <div className="flex flex-col items-center gap-3 px-6 py-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              isDragging ? "bg-primary/20" : "bg-slate-100"
            }`}>
              <UploadCloud className={`w-7 h-7 transition-colors ${isDragging ? "text-primary" : "text-slate-400"}`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">
                Glissez un fichier ici ou{" "}
                <span className="text-primary underline underline-offset-2">choisissez</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {acceptedExtensions.join(" · ")} &mdash; max {maxSizeInMB}MB
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}
    </div>
  )
}
