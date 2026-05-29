# Synchronisation offline → prod

## Contexte

L'app **idea.** est maintenant une PWA offline-first. Les idées créées, modifiées ou supprimées sans connexion sont mises en attente et synchronisées automatiquement dès le retour en ligne.

---

## Architecture

### Service Worker — `app/sw.ts`

Utilise [`serwist`](https://serwist.pages.dev) (fork de Workbox, adapté pour Next.js).

- **NetworkFirst** sur `/api/ideas` : charge depuis le réseau, tombe sur le cache en cas d'échec
- **Offline fallback** : page `/offline` servie pour toute navigation impossible hors ligne
- **Précaching** des assets statiques via `defaultCache`

```ts
new Serwist({
  swUrl: "/sw.js",
  precacheEntries: self.__SW_MANIFEST,
  navigationPreload: true,
  fallbacks: { entries: [{ url: "/offline", matcher: ({ request }) => request.mode === "navigate" }] }
})
```

### Queue IndexedDB — `shared/lib/offline-queue.ts`

Stocke les mutations en attente dans IndexedDB (`idb`).

| Champ | Type | Description |
|-------|------|-------------|
| `id` | string | UUID de l'entrée |
| `action` | `create \| update \| delete` | Type de mutation |
| `payload` | object | Données de la mutation |
| `createdAt` | number | Timestamp |

```ts
await enqueue({ action: "create", payload: { title, type, ... } })
```

### SyncProvider — `shared/providers/SyncProvider.tsx`

Composant client monté à la racine. Écoute l'événement `online` du navigateur.

Au retour en ligne :
1. Lit toutes les entrées en attente (`getAllPending`)
2. Rejoue chaque mutation via les server actions (`createIdea`, `updateIdea`, `deleteIdea`)
3. Supprime les entrées traitées (`dequeue`)
4. Invalide le cache TanStack Query → UI rafraîchie

### Hooks offline-aware — `features/ideas/hooks/useIdeas.ts`

Chaque mutation (`useCreateIdea`, `useUpdateIdea`, `useDeleteIdea`) vérifie `navigator.onLine` :

- **En ligne** → appel serveur normal
- **Hors ligne** → mise en queue + **mise à jour optimiste** du cache local

Les idées créées hors ligne ont un ID temporaire `temp_${uuid}`, remplacé à la synchronisation.

---

## Mise en prod — Docker

### Problème rencontré

`npm ci` échouait sur Alpine (Docker) à cause d'une incompatibilité de lock file :

- **npm 11** (Windows) omet les binaires optionnels Linux/Alpine dans `package-lock.json`
- **npm 10** (Alpine Docker) considère ces entrées comme manquantes → erreur

### Solution

Remplacement de `npm ci` par `npm install` dans les deux stages du `Dockerfile` :

```dockerfile
# Avant
RUN npm ci

# Après
RUN npm install
```

### TypeScript strict en prod

Next.js lance `tsc --noEmit` lors du build de production. Une erreur pre-existante dans `app/[locale]/auth/error/page.tsx` bloquait le build :

```ts
// Avant — type mismatch : AuthErrorCode inclut "Default" mais AUTH_ERRORS non
AUTH_ERRORS.includes(error as AuthErrorCode)

// Après — cast précis sur le type du tableau
AUTH_ERRORS.includes(error as (typeof AUTH_ERRORS)[number])
```

---

## Fichiers modifiés

```
app/sw.ts                          Service worker serwist
app/offline/page.tsx               Page de fallback offline
app/[locale]/layout.tsx            Wrappé avec SyncProvider + metadata PWA
app/manifest.ts                    Manifest PWA (icons, theme_color, display)
shared/lib/offline-queue.ts        Queue IndexedDB
shared/providers/SyncProvider.tsx  Sync automatique au retour en ligne
features/ideas/hooks/useIdeas.ts   Mutations offline-aware
features/ideas/actions/ideas.ts    skipRedirect param sur deleteIdea
next.config.ts                     withSerwist wrapper
Dockerfile                         npm install au lieu de npm ci
app/[locale]/auth/error/page.tsx   Fix TypeScript strict
```

---

## Dépendances ajoutées

| Package | Rôle |
|---------|------|
| `@serwist/next` | Service worker Next.js |
| `serwist` | Runtime SW (cache, strategies) |
| `idb` | IndexedDB typé |

> `@resvg/resvg-js` utilisé uniquement pour générer les icônes PNG (`scripts/generate-icons.mjs`), non inclus dans les dépendances de prod.
