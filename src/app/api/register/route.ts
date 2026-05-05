import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Une erreur inconnue est survenue."
}

function isPrismaUniqueError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  )
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, domainSlug, answers } = body

    // 1. Récupération du domaine
    const domain = await prisma.domain.findUnique({
      where: { slug: domainSlug },
    })

    if (!domain) {
      return NextResponse.json(
        { error: "Domaine spatial introuvable dans la base." },
        { status: 404 },
      )
    }

    // 2. Sécurisation du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Création atomique (User + Progress)
    // Cette syntaxe crée l'utilisateur ET sa progression en une seule transaction
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        domainId: domain.id,
        answers: answers || {},
        progress: {
          create: {
            currentStep: 1,
            score: 0,
            completed: false,
          },
        },
      },
      include: {
        progress: true, // On inclut la progression dans la réponse pour vérification
      },
    })

    return NextResponse.json(
      {
        message: "Profil pilote initialisé avec succès !",
        userId: newUser.id,
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    if (isPrismaUniqueError(error)) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé par un autre pilote." },
        { status: 400 },
      )
    }

    console.error("Erreur Prisma complète:", error)
    return NextResponse.json(
      { error: "Échec de la base de données : " + getErrorMessage(error) },
      { status: 500 },
    )
  }
}

// Optionnel : GET pour voir si les données arrivent bien
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { domain: true, progress: true },
    })
    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ error: "Erreur lecture" }, { status: 500 })
  }
}
