"use client"

import { useState, useRef, KeyboardEvent, useEffect } from "react"
import { X } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getSavedTags } from "@/features/tags/services/tags.service"

interface TagInputProps {
  name: string
  defaultValue?: string
  placeholder?: string
  label?: string
  hint?: string
  color?: string
}

export function TagInput({ name, defaultValue = "", placeholder, label, color = "text-primary" }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(
    defaultValue ? defaultValue.split(",").map((t) => t.trim()).filter(Boolean) : []
  )
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: savedTags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: getSavedTags,
    staleTime: 60 * 1000,
  })

  const suggestions = savedTags.filter(
    (t) =>
      !tags.includes(t) &&
      (input.length === 0 || t.toLowerCase().includes(input.toLowerCase()))
  )

  useEffect(() => {
    setHighlighted(0)
  }, [input])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function addTag(value: string) {
    const trimmed = value.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setInput("")
    setOpen(false)
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if ((e.key === "Enter" || e.key === ",") && open && suggestions.length > 0) {
      e.preventDefault()
      addTag(suggestions[highlighted])
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (input.trim()) addTag(input)
    } else if (e.key === "Escape") {
      setOpen(false)
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">{label}</label>
      )}

      <input type="hidden" name={name} value={tags.join(",")} />

      <div ref={containerRef} className="relative">
        <div
          className="flex flex-wrap gap-1.5 w-full px-3 py-2 rounded-xl border border-(--border) focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-colors bg-(--bg-card) min-h-[44px] cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {tags.map((tag) => (
            <span key={tag} className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-slate-100 rounded-full ${color}`}>
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
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[80px] text-sm text-(--fg) placeholder:text-(--fg-muted) outline-none bg-transparent py-0.5"
          />
        </div>

        {/* Dropdown suggestions */}
        {open && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-(--bg-card) border border-(--border) rounded-xl shadow-lg z-20 overflow-hidden">
            {suggestions.map((tag, i) => (
              <button
                key={tag}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addTag(tag) }}
                onMouseEnter={() => setHighlighted(i)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  i === highlighted ? `${color} bg-(--bg) font-medium` : "text-slate-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
