/**
 * Crée une idée de type NOTE sur la synchronisation offline, avec un fichier .md joint.
 * Usage : IDEA_API_KEY=idea_sk_... node scripts/create-offline-sync-note.mjs
 */
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.IDEA_BASE_URL ?? "https://idea.mlya.me"
const API_KEY = process.env.IDEA_API_KEY

if (!API_KEY) {
  console.error("❌  IDEA_API_KEY manquante. Lance : export IDEA_API_KEY=idea_sk_...")
  process.exit(1)
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
}

// 1. Créer l'idée
const ideaRes = await fetch(`${BASE_URL}/api/v1/ideas`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    title: "Synchronisation offline → prod : architecture et décisions",
    description:
      "Documentation de l'implémentation PWA offline-first : service worker (serwist), queue IndexedDB, sync automatique au retour en ligne, et mise en prod Docker.",
    tags: ["pwa", "offline", "serwist", "indexeddb", "docker"],
    type: "NOTE",
    status: "DONE",
  }),
})

if (!ideaRes.ok) {
  console.error("❌  Erreur création idée :", await ideaRes.text())
  process.exit(1)
}

const idea = await ideaRes.json()
console.log(`✓ Idée créée : ${idea.id}`)

// 2. Attacher le fichier .md via l'API interne (session requise) — afficher l'URL d'upload manuelle
const mdPath = join(__dirname, "offline-sync-note.md")
const mdContent = readFileSync(mdPath, "utf8")
console.log(`\n📎 Fichier .md prêt (${mdContent.length} caractères).`)
console.log(`   Attache-le manuellement depuis l'app : /ideas/${idea.id}`)
console.log(`   Ou via l'API d'upload (session cookie requise) :`)
console.log(`   POST /api/upload  { file: offline-sync-note.md, ideaId: "${idea.id}" }`)
console.log(`\n✅  Idée créée avec succès. Ouvre : ${BASE_URL}/fr/ideas/${idea.id}`)
