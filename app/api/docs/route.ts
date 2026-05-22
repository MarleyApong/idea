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
        enum: ["PROJET", "INSPIRATION", "RAPPEL", "AUTRE"],
        description: "PROJET=projet concret, INSPIRATION=idee creative, RAPPEL=a faire plus tard, AUTRE=autre",
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
