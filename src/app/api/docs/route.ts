import { NextResponse } from "next/server"

const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Caldera Tech API",
    version: "1.0.0",
    description:
      "Documentation des endpoints de l'application Caldera Tech — inscription, quiz IA et initialisation des domaines.",
  },
  servers: [
    {
      url: "/api",
      description: "Serveur local Next.js",
    },
  ],
  tags: [
    { name: "Auth", description: "Inscription et authentification" },
    { name: "Quiz", description: "Génération de questions par domaine via IA" },
    { name: "Setup", description: "Initialisation des données" },
  ],
  paths: {
    "/register": {
      post: {
        tags: ["Auth"],
        summary: "Inscrire un nouvel utilisateur",
        description:
          "Crée un compte utilisateur avec hachage du mot de passe (bcrypt) et initialise sa progression.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password", "domainSlug"],
                properties: {
                  name: {
                    type: "string",
                    example: "Alice Dupont",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    example: "alice@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "motdepasse123",
                  },
                  domainSlug: {
                    type: "string",
                    enum: ["dev", "intra", "marketing", "cyber", "reseaux"],
                    example: "dev",
                    description: "Slug du domaine choisi lors de l'inscription",
                  },
                  answers: {
                    type: "object",
                    description: "Réponses au quiz IA (optionnel)",
                    example: { q1: "a", q2: "c" },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Utilisateur créé avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Cadet enregistré avec succès !",
                    },
                    userId: { type: "integer", example: 42 },
                  },
                },
              },
            },
          },
          "400": {
            description: "Email déjà utilisé",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Cet email est déjà enregistré dans la flotte.",
                    },
                  },
                },
              },
            },
          },
          "404": {
            description: "Domaine introuvable",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Domaine spatial introuvable",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Erreur serveur interne",
          },
        },
      },
    },
    "/quiz": {
      get: {
        tags: ["Quiz"],
        summary: "Générer des questions de quiz par domaine",
        description:
          "Appelle l'IA (Groq) pour générer une liste de questions techniques adaptées au domaine fourni.",
        parameters: [
          {
            name: "domain",
            in: "query",
            required: false,
            description: "Domaine technique ciblé",
            schema: {
              type: "string",
              default: "Développement",
              example: "Cybersécurité",
            },
          },
        ],
        responses: {
          "200": {
            description: "Questions générées avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    questions: {
                      type: "array",
                      items: { type: "string" },
                      example: [
                        "Qu'est-ce qu'une injection SQL ?",
                        "Comment fonctionne HTTPS ?",
                      ],
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Erreur lors de la génération IA",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/setup": {
      get: {
        tags: ["Setup"],
        summary: "Initialiser les domaines en base de données",
        description:
          "Crée ou met à jour les 5 domaines principaux (dev, intra, marketing, cyber, reseaux) via un upsert Prisma. À appeler une seule fois au démarrage.",
        responses: {
          "200": {
            description: "Domaines initialisés avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Système initialisé : Domaines créés.",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Erreur serveur interne",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Domain: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          slug: { type: "string", example: "dev" },
          label: { type: "string", example: "Développement" },
          description: {
            type: "string",
            example: "Programmation, web, logiciels et systèmes",
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 42 },
          email: { type: "string", example: "alice@example.com" },
          name: { type: "string", example: "Alice Dupont" },
          role: { type: "string", example: "CADET" },
          domainId: { type: "integer", example: 1 },
        },
      },
    },
  },
}

export async function GET() {
  return NextResponse.json(openApiSpec)
}
