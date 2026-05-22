"use client"

import { useState } from "react"
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff } from "lucide-react"
import { api } from "@/shared/lib/axios"
import { useNotifications } from "@/shared/store/notifications"
import { Button } from "@/shared/components/ui/Button"
import { formatDate } from "@/shared/lib/format"

interface ApiKeyRow {
  id: string
  name: string
  prefix: string
  lastUsedAt: Date | string | null
  createdAt: Date | string
}

interface ApiKeysClientProps {
  initialKeys: ApiKeyRow[]
  locale: string
}

export function ApiKeysClient({ initialKeys, locale }: ApiKeysClientProps) {
  const { success, error } = useNotifications()
  const [keys, setKeys] = useState<ApiKeyRow[]>(initialKeys)
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setCreating(true)
    try {
      const { data } = await api.post<{ raw: string; prefix: string }>("/settings/api-keys", { name })
      setNewKey(data.raw)
      setName("")
      const refreshed = await api.get<ApiKeyRow[]>("/settings/api-keys")
      setKeys(refreshed.data)
      success("Cle API creee")
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Erreur")
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/settings/api-keys/${id}`)
      setKeys((k) => k.filter((key) => key.id !== id))
      success("Cle supprimee")
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Erreur")
    }
  }

  async function handleCopy() {
    if (!newKey) return
    await navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Section cles API */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Key className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-slate-900">Cles API</h2>
          </div>
          <p className="text-sm text-slate-500">
            Utilisees pour creer des idees depuis Claude Code ou tout autre outil externe.
          </p>
        </div>

        {/* Alerte cle nouvellement creee */}
        {newKey && (
          <div className="mx-6 mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0" />
              <p className="text-sm font-semibold text-amber-800">
                Copiez cette cle maintenant - elle ne sera plus affichee.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-white border border-amber-200 rounded-lg px-3 py-2 font-mono text-sm text-slate-800 min-w-0">
                <span className="truncate">
                  {showKey ? newKey : newKey.slice(0, 16) + "••••••••••••••••••••••••••••••••••••••••••••••••"}
                </span>
              </div>
              <button onClick={() => setShowKey(!showKey)} className="p-2 text-slate-500 hover:text-slate-800 transition-colors shrink-0">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copie !" : "Copier"}
              </button>
            </div>
            <button onClick={() => setNewKey(null)} className="text-xs text-amber-600 hover:text-amber-800 underline">
              J'ai copie ma cle
            </button>
          </div>
        )}

        {/* Liste des cles */}
        <div className="px-6 py-4 space-y-3">
          {keys.length === 0 && !newKey ? (
            <p className="text-sm text-slate-400 text-center py-4">Aucune cle API.</p>
          ) : (
            keys.map((key) => (
              <div key={key.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <Key className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{key.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{key.prefix}••••••••</p>
                </div>
                <div className="text-right text-xs text-slate-400 shrink-0">
                  {key.lastUsedAt ? (
                    <p>Utilise le {formatDate(key.lastUsedAt, locale)}</p>
                  ) : (
                    <p>Jamais utilise</p>
                  )}
                  <p>Cree le {formatDate(key.createdAt, locale)}</p>
                </div>
                <button
                  onClick={() => handleDelete(key.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Creer une nouvelle cle */}
        <div className="px-6 pb-5 border-t border-slate-100 pt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Nom de la cle (ex: Claude Code local)"
              className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            <Button onClick={handleCreate} disabled={creating || !name.trim()}>
              <Plus className="w-4 h-4" />
              {creating ? "..." : "Generer"}
            </Button>
          </div>
        </div>
      </div>

      {/* Exemple d'utilisation */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Utilisation avec Claude Code</h2>
        </div>
        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-slate-600">Dans une session Claude Code, dis simplement :</p>
          <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm text-slate-300 leading-relaxed">
            <span className="text-slate-500"># Creer une idee via l'API</span>
            <br />
            curl -X POST https://ton-app.com/api/v1/ideas \<br />
            {"  "}-H "Authorization: Bearer idea_sk_..." \<br />
            {"  "}-H "Content-Type: application/json" \<br />
            {"  "}-d {'\'{"title":"Mon idee","description":"...","type":"PROJET"}\''}
          </div>
          <p className="text-xs text-slate-400">
            Types acceptes : PROJET, INSPIRATION, RAPPEL, AUTRE
          </p>
        </div>
      </div>
    </div>
  )
}
