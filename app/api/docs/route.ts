import { NextResponse } from "next/server"

const spec = {
  openapi: "3.0.0",
  info: {
    title: "idea. API",
    version: "1.0.0",
    description: "API publique pour creer et gerer des idees depuis des outils externes (Claude Code, scripts, etc.)",
  },
  servers: [
    { url: "/api/v1", description: "Production" },
  ],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "Cle API generee depuis /settings. Format: idea_sk_...",
      },
    },
    schemas: {
      IdeaType: {
        type: "string",
        enum: ["PROJET", "INSPIRATION", "RAPPEL", "NOTE", "AUTRE"],
        description: "PROJET=projet concret, INSPIRATION=idee creative, RAPPEL=a faire plus tard, NOTE=documentation, AUTRE=autre",
      },
      IdeaStatus: {
        type: "string",
        enum: ["DRAFT", "IN_PROGRESS", "DONE", "ARCHIVED"],
        description: "DRAFT=brouillon (defaut), IN_PROGRESS=en cours, DONE=termine, ARCHIVED=archive",
      },
      CreateIdeaBody: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", description: "Titre de l'idee", example: "App de suivi de lectures" },
          description: { type: "string", nullable: true, description: "Description detaillee", example: "Une app pour tracker les livres lus et en cours" },
          tags: { type: "array", items: { type: "string" }, description: "Tags pour categoriser", example: ["mobile", "lecture", "productivite"] },
          type: { $ref: "#/components/schemas/IdeaType" },
          status: { $ref: "#/components/schemas/IdeaStatus" },
        },
      },
      UpdateIdeaBody: {
        type: "object",
        properties: {
          title: { type: "string", description: "Nouveau titre" },
          description: { type: "string", nullable: true, description: "Nouvelle description" },
          tags: { type: "array", items: { type: "string" }, description: "Nouveaux tags (remplace la liste existante)" },
          type: { $ref: "#/components/schemas/IdeaType" },
          status: { $ref: "#/components/schemas/IdeaStatus" },
        },
      },
      IdeaList: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Idea" } },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              total: { type: "integer" },
              pages: { type: "integer" },
            },
          },
        },
      },
      Idea: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          tags: { type: "array", items: { type: "string" } },
          type: { $ref: "#/components/schemas/IdeaType" },
          status: { $ref: "#/components/schemas/IdeaStatus" },
          userId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Attachment: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string", nullable: true },
          filename: { type: "string" },
          url: { type: "string" },
          mimeType: { type: "string" },
          size: { type: "integer", description: "Taille en octets" },
          ideaId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          code: { type: "string", description: "Code d'erreur machine", example: "MISSING_TITLE" },
          message: { type: "string", description: "Message lisible", example: "Le titre est requis" },
        },
      },
    },
  },
  paths: {
    "/ideas": {
      get: {
        summary: "Lister les idees",
        description: "Retourne la liste paginee des idees de l'utilisateur, avec filtres optionnels.",
        operationId: "listIdeas",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" }, description: "Recherche dans le titre, la description et les tags" },
          { name: "type", in: "query", schema: { $ref: "#/components/schemas/IdeaType" }, description: "Filtrer par type" },
          { name: "status", in: "query", schema: { $ref: "#/components/schemas/IdeaStatus" }, description: "Filtrer par statut" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Numero de page" },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 }, description: "Nombre de resultats par page" },
        ],
        responses: {
          "200": {
            description: "Liste des idees",
            content: { "application/json": { schema: { $ref: "#/components/schemas/IdeaList" } } },
          },
          "401": {
            description: "Cle API invalide ou manquante",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
          },
        },
      },
      post: {
        summary: "Creer une idee",
        description: "Cree une nouvelle idee associee au proprietaire de la cle API.",
        operationId: "createIdea",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateIdeaBody" },
              examples: {
                projet: {
                  summary: "Creer un projet",
                  value: { title: "App de suivi de lectures", description: "Tracker les livres lus et en cours", tags: ["mobile", "lecture"], type: "PROJET" },
                },
                inspiration: {
                  summary: "Capturer une inspiration",
                  value: { title: "Utiliser des animations 3D pour l'onboarding", type: "INSPIRATION" },
                },
                rappel: {
                  summary: "Ajouter un rappel",
                  value: { title: "Regarder la conf React Summit 2025", tags: ["react", "conference"], type: "RAPPEL" },
                },
                note: {
                  summary: "Ecrire une note",
                  value: { title: "Setup Coolify avec Docker", description: "Notes de configuration pour le self-hosting", tags: ["devops", "coolify"], type: "NOTE" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Idee creee avec succes",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Idea" } } },
          },
          "400": {
            description: "Requete invalide",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
          },
          "401": {
            description: "Cle API invalide ou manquante",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
          },
        },
      },
    },
    "/ideas/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Identifiant de l'idee" },
      ],
      get: {
        summary: "Obtenir une idee",
        description: "Retourne le detail d'une idee par son ID.",
        operationId: "getIdea",
        responses: {
          "200": {
            description: "Detail de l'idee",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Idea" } } },
          },
          "401": {
            description: "Cle API invalide ou manquante",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
          },
          "404": {
            description: "Idee introuvable",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
          },
        },
      },
      patch: {
        summary: "Modifier une idee",
        description: "Met a jour les champs fournis d'une idee existante. Les champs omis ne sont pas modifies.",
        operationId: "updateIdea",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateIdeaBody" },
              examples: {
                changeStatus: {
                  summary: "Passer en cours",
                  value: { status: "IN_PROGRESS" },
                },
                updateTitle: {
                  summary: "Renommer",
                  value: { title: "Nouveau titre", tags: ["tag1", "tag2"] },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Idee mise a jour",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Idea" } } },
          },
          "400": {
            description: "Requete invalide",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
          },
          "401": {
            description: "Cle API invalide ou manquante",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
          },
          "404": {
            description: "Idee introuvable",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
          },
        },
      },
      delete: {
        summary: "Supprimer une idee",
        description: "Supprime definitivement une idee.",
        operationId: "deleteIdea",
        responses: {
          "204": { description: "Idee supprimee" },
          "401": {
            description: "Cle API invalide ou manquante",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
          },
          "404": {
            description: "Idee introuvable",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
          },
        },
      },
    },
  },
    "/upload": {
      post: {
        summary: "Attacher un fichier a une idee",
        description: "Upload un fichier (image, PDF, markdown, texte) et l'attache a une idee existante. Corps en `multipart/form-data`.",
        operationId: "uploadAttachment",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file", "ideaId"],
                properties: {
                  file: { type: "string", format: "binary", description: "Fichier a uploader (max 10MB)" },
                  ideaId: { type: "string", description: "ID de l'idee a laquelle attacher le fichier" },
                  title: { type: "string", description: "Titre optionnel pour le fichier" },
                },
              },
              examples: {
                markdown: {
                  summary: "Attacher un fichier .md",
                  value: { ideaId: "cmpr2h372000301qp9c7z2sto", title: "Documentation technique" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Fichier attache avec succes",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Attachment" } } },
          },
          "400": {
            description: "Requete invalide (fichier manquant, type non accepte, trop grand)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
          },
          "401": {
            description: "Cle API invalide ou manquante",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
          },
          "404": {
            description: "Idee introuvable",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
          },
        },
      },
    },
  },
  "x-usage": {
    claude_code: {
      description: "Comment utiliser cette API depuis Claude Code",
      steps: [
        "1. Generer une cle API sur /settings",
        "2. Stocker la cle : export IDEA_API_KEY='idea_sk_...'",
        "3. Dire a Claude : 'Capture cette idee dans mon app idea.'",
      ],
      example_prompt: "Cree une idee dans mon app avec le titre '...' de type PROJET",
    },
  },
}

export async function GET() {
  return NextResponse.json(spec, {
    headers: { "Access-Control-Allow-Origin": "*" },
  })
}
