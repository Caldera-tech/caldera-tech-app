import logger from "@/lib/logger"
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

    const domain = await prisma.domain.findUnique({
      where: { slug: domainSlug },
    })

    if (!domain) {
      logger.warn({
        event: "REGISTER_INVALID_DOMAIN",
        domainSlug,
        message: `Tentative d'inscription sur un domaine inexistant : ${domainSlug}`,
      })
      return NextResponse.json(
        { error: "Domaine spatial introuvable dans la base." },
        { status: 404 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

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
        progress: true,
      },
    })

    logger.info({
      event: "USER_REGISTERED",
      userId: newUser.id,
      email: newUser.email,
      domain: domainSlug,
      message: `Nouveau pilote enregistré : ${newUser.name} identifié dans le secteur ${domainSlug}.`,
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
      logger.warn({
        event: "REGISTER_DUPLICATE_EMAIL",
        message: `Tentative d'inscription avec un email déjà existant.`,
      })
      return NextResponse.json(
        { error: "Cet email est déjà utilisé par un autre pilote." },
        { status: 400 },
      )
    }

    logger.error({
      event: "REGISTER_SYSTEM_ERROR",
      error: getErrorMessage(error),
    })

    return NextResponse.json(
      { error: "Échec de la base de données : " + getErrorMessage(error) },
      { status: 500 },
    )
  }
}

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
