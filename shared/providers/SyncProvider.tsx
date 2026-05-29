"use client"

import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getAllPending, dequeue } from "@/shared/lib/offline-queue"
import { createIdea, updateIdea, deleteIdea } from "@/features/ideas/actions/ideas"
import { IDEAS_KEY } from "@/features/ideas/hooks/useIdeas"
import { useNotifications } from "@/shared/store/notifications"

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { success } = useNotifications()
  const isSyncing = useRef(false)

  async function syncQueue() {
    if (isSyncing.current) return
    const pending = await getAllPending()
    if (pending.length === 0) return

    isSyncing.current = true
    let synced = 0

    for (const op of pending) {
      try {
        if (op.type === "create") {
          const fd = buildFormData(op.payload)
          const result = await createIdea(op.locale, null, fd)
          if (!result?.error) { await dequeue(op.id); synced++ }

        } else if (op.type === "update" && op.ideaId) {
          const fd = buildFormData(op.payload)
          const result = await updateIdea(op.ideaId, op.locale, null, fd)
          if (!result?.error) { await dequeue(op.id); synced++ }

        } else if (op.type === "delete" && op.ideaId) {
          await deleteIdea(op.ideaId, op.locale, true)
          await dequeue(op.id)
          synced++
        }
      } catch {
        // sera rejoue au prochain evenement online
      }
    }

    isSyncing.current = false

    if (synced > 0) {
      await queryClient.invalidateQueries({ queryKey: IDEAS_KEY })
      success(`${synced} idée${synced > 1 ? "s" : ""} synchronisée${synced > 1 ? "s" : ""}`)
    }
  }

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }

    if (navigator.onLine) syncQueue()

    window.addEventListener("online", syncQueue)
    return () => window.removeEventListener("online", syncQueue)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}

function buildFormData(payload: {
  title?: string
  description?: string
  ideaType?: string
  tags?: string[]
  status?: string
}): FormData {
  const fd = new FormData()
  if (payload.title) fd.set("title", payload.title)
  if (payload.description) fd.set("description", payload.description)
  if (payload.ideaType) fd.set("type", payload.ideaType)
  if (payload.tags?.length) fd.set("tags", payload.tags.join(","))
  if (payload.status) fd.set("status", payload.status)
  return fd
}
