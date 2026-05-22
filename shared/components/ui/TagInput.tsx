"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { X } from "lucide-react"

interface TagInputProps {
  name: string
  defaultValue?: string
  placeholder?: string
  label?: string
  hint?: string
  color?: string
}

export function TagInput({ name, defaultValue = "", placeholder, label, hint, color = "text-primary" }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(
    defaultValue ? defaultValue.split(",").map((t) => t.trim()).filter(Boolean) : []
  )
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(value: string) {
    const trimmed = value.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setInput("")
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault()
      addTag(input)
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  function handleBlur() {
    if (input.trim()) addTag(input)
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {hint && <span className="text-slate-400 font-normal ml-1">({hint})</span>}
        </label>
      )}

      <input type="hidden" name={name} value={tags.join(",")} />

      <div
        className="flex flex-wrap gap-1.5 w-full px-3 py-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-colors bg-white min-h-[44px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span key={tag} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 bg-slate-100 rounded-full ${color}`}>
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[80px] text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
        />
      </div>
    </div>
  )
}
