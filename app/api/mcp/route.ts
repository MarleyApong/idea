import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/shared/lib/prisma"
import { resolveApiKey } from "@/app/api/v1/ideas/route"
import { IdeaType, IdeaStatus } from "@prisma/client"
import { unlink } from "fs/promises"
import { join } from "path"

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "list_ideas",
    description: "Liste les idées de l'utilisateur avec filtres optionnels. Retourne les données paginées.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Recherche dans le titre, description et tags" },
        type: { type: "string", enum: ["PROJET", "INSPIRATION", "RAPPEL", "NOTE", "AUTRE"], description: "Filtrer par type" },
        status: { type: "string", enum: ["DRAFT", "IN_PROGRESS", "DONE", "ARCHIVED"], description: "Filtrer par statut" },
        limit: { type: "number", description: "Nombre de résultats (max 100, défaut 20)" },
      },
    },
  },
  {
    name: "get_idea",
    description: "Récupère le détail complet d'une idée par son ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", description: "ID de l'idée" },
      },
    },
  },
  {
    name: "create_idea",
    description: "Crée une nouvelle idée. Types : PROJET (projet concret), INSPIRATION (idée créative), RAPPEL (à faire plus tard), NOTE (documentation), AUTRE.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string", description: "Titre de l'idée" },
        description: { type: "string", description: "Description détaillée" },
        type: { type: "string", enum: ["PROJET", "INSPIRATION", "RAPPEL", "NOTE", "AUTRE"], description: "Type d'idée (défaut: AUTRE)" },
        status: { type: "string", enum: ["DRAFT", "IN_PROGRESS", "DONE", "ARCHIVED"], description: "Statut (défaut: DRAFT)" },
        tags: { type: "array", items: { type: "string" }, description: "Tags pour catégoriser" },
      },
    },
  },
  {
    name: "update_idea",
    description: "Met à jour les champs d'une idée existante. Seuls les champs fournis sont modifiés.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", description: "ID de l'idée à modifier" },
        title: { type: "string" },
        description: { type: "string" },
        type: { type: "string", enum: ["PROJET", "INSPIRATION", "RAPPEL", "NOTE", "AUTRE"] },
        status: { type: "string", enum: ["DRAFT", "IN_PROGRESS", "DONE", "ARCHIVED"] },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    name: "delete_idea",
    description: "Supprime définitivement une idée et ses fichiers attachés.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", description: "ID de l'idée à supprimer" },
      },
    },
  },
]

// ── Tool handlers ─────────────────────────────────────────────────────────────

async function callTool(name: string, args: Record<string, unknown>, userId: string): Promise<string> {
  switch (name) {
    case "list_ideas": {
      const search = args.search as string | undefined
      const type = args.type as IdeaType | undefined
      const status = args.status as IdeaStatus | undefined
      const limit = Math.min(Number(args.limit ?? 20), 100)

      const ideas = await prisma.idea.findMany({
        where: {
          userId,
          ...(type ? { type } : {}),
          ...(status ? { status } : {}),
          ...(search ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { tags: { has: search } },
            ],
          } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      })

      return ideas.length === 0
        ? "Aucune idée trouvée."
        : ideas.map((i) => `[${i.id}] ${i.title} (${i.type} · ${i.status})${i.tags.length ? ` — tags: ${i.tags.join(", ")}` : ""}`).join("\n")
    }

    case "get_idea": {
      const idea = await prisma.idea.findUnique({ where: { id: args.id as string } })
      if (!idea || idea.userId !== userId) return "Idée introuvable."
      const attachments = await prisma.attachment.findMany({ where: { ideaId: idea.id } })
      return JSON.stringify({ ...idea, attachments }, null, 2)
    }

    case "create_idea": {
      const idea = await prisma.idea.create({
        data: {
          title: (args.title as string).trim(),
          description: (args.description as string | undefined)?.trim() ?? null,
          type: (args.type as IdeaType) ?? "AUTRE",
          status: (args.status as IdeaStatus) ?? "DRAFT",
          tags: Array.isArray(args.tags) ? (args.tags as string[]).map((t) => t.trim()).filter(Boolean) : [],
          userId,
        },
      })
      return `Idée créée avec succès !\nID : ${idea.id}\nTitre : ${idea.title}\nType : ${idea.type} · Statut : ${idea.status}`
    }

    case "update_idea": {
      const { id, ...updates } = args as Record<string, unknown>
      const existing = await prisma.idea.findUnique({ where: { id: id as string } })
      if (!existing || existing.userId !== userId) return "Idée introuvable."
      const idea = await prisma.idea.update({
        where: { id: id as string },
        data: {
          ...(updates.title !== undefined ? { title: (updates.title as string).trim() } : {}),
          ...(updates.description !== undefined ? { description: (updates.description as string)?.trim() || null } : {}),
          ...(updates.type !== undefined && Object.values(IdeaType).includes(updates.type as IdeaType) ? { type: updates.type as IdeaType } : {}),
          ...(updates.status !== undefined && Object.values(IdeaStatus).includes(updates.status as IdeaStatus) ? { status: updates.status as IdeaStatus } : {}),
          ...(updates.tags !== undefined ? { tags: (updates.tags as string[]).map((t) => t.trim()).filter(Boolean) } : {}),
        },
      })
      return `Idée mise à jour.\nTitre : ${idea.title} · ${idea.type} · ${idea.status}`
    }

    case "delete_idea": {
      const existing = await prisma.idea.findUnique({ where: { id: args.id as string } })
      if (!existing || existing.userId !== userId) return "Idée introuvable."
      const attachments = await prisma.attachment.findMany({ where: { ideaId: existing.id } })
      await prisma.idea.delete({ where: { id: existing.id } })
      for (const att of attachments) {
        try { await unlink(join(process.cwd(), "public", att.url)) } catch {}
      }
      return `Idée "${existing.title}" supprimée.`
    }

    default:
      throw new Error(`Tool inconnu : ${name}`)
  }
}

// ── JSON-RPC helpers ──────────────────────────────────────────────────────────

function ok(id: unknown, result: unknown) {
  return NextResponse.json(
    { jsonrpc: "2.0", id, result },
    { headers: corsHeaders() },
  )
}

function rpcError(id: unknown, code: number, message: string) {
  return NextResponse.json(
    { jsonrpc: "2.0", id, error: { code, message } },
    { headers: corsHeaders() },
  )
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

// ── Route handlers ────────────────────────────────────────────────────────────

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

export async function GET() {
  return NextResponse.json(
    { name: "idea-mcp", version: "1.0.0", protocol: "2024-11-05" },
    { headers: corsHeaders() },
  )
}

export async function POST(req: NextRequest) {
  const user = await resolveApiKey(req)
  if (!user) return rpcError(null, -32001, "Unauthorized — Bearer token requis")

  let body: { jsonrpc: string; id?: unknown; method: string; params?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return rpcError(null, -32700, "Parse error")
  }

  const { id, method, params = {} } = body

  switch (method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "idea-mcp", version: "1.0.0" },
      })

    case "notifications/initialized":
      return new NextResponse(null, { status: 204, headers: corsHeaders() })

    case "ping":
      return ok(id, {})

    case "tools/list":
      return ok(id, { tools: TOOLS })

    case "tools/call": {
      const { name, arguments: args = {} } = params as { name: string; arguments?: Record<string, unknown> }
      try {
        const text = await callTool(name, args, user.id)
        return ok(id, { content: [{ type: "text", text }] })
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Erreur inconnue"
        return ok(id, { content: [{ type: "text", text: `Erreur : ${msg}` }], isError: true })
      }
    }

    default:
      return rpcError(id, -32601, `Méthode inconnue : ${method}`)
  }
}
