import logger from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Erreur inconnue"
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      logger.warn({
        event: "AUTH_FAILED_UNKNOWN_USER",
        email: email,
        message: `Tentative de connexion : l'email ${email} n'existe pas.`,
      })

      return NextResponse.json(
        { error: "Pilote non identifié dans la flotte." },
        { status: 401 },
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      logger.warn({
        event: "AUTH_FAILED_WRONG_PASSWORD",
        userId: user.id,
        email: email,
        message: `Échec d'authentification (mot de passe invalide) pour le pilote ${user.name}.`,
      })

      return NextResponse.json(
        { error: "Clé d'accès invalide." },
        { status: 401 },
      )
    }

    logger.info({
      event: "AUTH_LOGIN_SUCCESS",
      userId: user.id,
      email: user.email,
      message: `Pilote ${user.name} connecté avec succès.`,
    })

    return NextResponse.json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error: unknown) {
    logger.error({
      event: "AUTH_SYSTEM_ERROR",
      message: getErrorMessage(error),
    })

    return NextResponse.json(
      { error: "Erreur lors de l'authentification." },
      { status: 500 },
    )
  }
}
