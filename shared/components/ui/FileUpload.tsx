"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, CheckCircle2, AlertCircle, X, FileText, Image } from "lucide-react"
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

function fileIcon(file: File) {
  if (file.type.startsWith("image/")) return <Image className="w-8 h-8 text-blue-500" />
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
  const inputRef = useRef<HTMLInputElement>(null)

  const error = externalError || internalError

  function validate(file: File): string | null {
    const ext = "." + file.name.split(".").pop()?.toLowerCase()
    if (!acceptedExtensions.includes(ext)) {
      return `Extension non acceptee. Acceptees : ${acceptedExtensions.join(", ")}`
    }
    if (file.type && !ACCEPTED_MIMES.includes(file.type)) {
      return `Type de fichier non accepte (${file.type})`
    }
    if (file.size / (1024 * 1024) > maxSizeInMB) {
      return `Fichier trop grand. Max : ${maxSizeInMB}MB`
    }
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
      } finally {
        setIsCompressing(false)
      }
    }
    onFileSelect(final)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
          isDragging       ? "border-primary bg-primary/5 scale-[1.01]"
          : selectedFile  ? "border-green-400 bg-green-50"
          : error         ? "border-red-400 bg-red-50"
          : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptedExtensions.join(",")}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        {isCompressing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-primary font-medium">Compression en cours...</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            {fileIcon(selectedFile)}
            <div>
              <p className="text-sm font-semibold text-slate-800">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setInternalError(""); onFileRemove?.(); if (inputRef.current) inputRef.current.value = "" }}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-3 h-3" /> Retirer
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className={`w-10 h-10 ${error ? "text-red-400" : "text-slate-300"}`} />
            <div>
              <p className="text-sm text-slate-600">
                Deposez un fichier ici ou{" "}
                <span className="text-primary font-medium">parcourir</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {acceptedExtensions.join(", ")} • Max {maxSizeInMB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
