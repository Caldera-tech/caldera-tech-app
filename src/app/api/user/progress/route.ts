import logger from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, xpToAdd, nextStep } = body

    // 1. VÉRIFICATION DE SÉCURITÉ DE BASE
    if (!userId || nextStep === undefined) {
      logger.warn({
        event: "SECURITY_WARNING",
        message:
          "Tentative de mise à jour de progression avec données manquantes.",
        payload: body,
      })
      return NextResponse.json(
        { error: "Données de synchronisation manquantes" },
        { status: 400 },
      )
    }

    // 2. CONVERSION IMPÉRATIVE (D'après ton schéma Prisma, User.id est Int)
    const userIdInt = parseInt(userId)
    const nextStepInt = parseInt(nextStep)

    // Vérification que les conversions ont fonctionné
    if (isNaN(userIdInt) || isNaN(nextStepInt)) {
      logger.error({
        event: "DATA_CONVERSION_ERROR",
        message: "Impossible de convertir userId ou nextStep en Entier.",
        userId_brut: userId,
        nextStep_brut: nextStep,
      })
      return NextResponse.json(
        { error: "Format de données invalide" },
        { status: 400 },
      )
    }

    // 3. TRANSACTION ATOMIQUE (Garantit que XP + Étape sont mis à jour ensemble)
    const result = await prisma.$transaction([
      // A. Mise à jour de l'XP de l'utilisateur
      prisma.user.update({
        where: { id: userIdInt },
        data: { xp: { increment: xpToAdd || 0 } },
      }),

      // B. Mise à jour (ou création) de la ligne de progression
      prisma.progress.upsert({
        where: { userId: userIdInt },
        update: {
          currentStep: nextStepInt, // ON FORCE LE NOUVEAU PALLIER ICI (ex: 4)
          score: { increment: xpToAdd || 0 },
          lastActivity: new Date(),
        },
        create: {
          userId: userIdInt,
          currentStep: nextStepInt, // ON INITIALISE LE PALLIER ICI (ex: 4)
          score: xpToAdd || 0,
        },
      }),
    ])

    // 4. AUDIT ET LOGS
    logger.info({
      event: "XP_UPDATE_SUCCESS",
      userId: userIdInt,
      xpGained: xpToAdd,
      newTotalXp: result[0].xp,
      reachedStep: nextStepInt, // Audit : On enregistre que le niveau 4 est atteint
      message: `Audit : L'utilisateur ${userIdInt} a validé une étape. +${xpToAdd} XP ajoutés. Nouveau step: ${nextStepInt}.`,
    })

    // 5. RÉPONSE AU CLIENT (Quiz)
    return NextResponse.json({
      success: true,
      newTotalXp: result[0].xp,
      currentStep: result[1].currentStep, // Renvoie '4' au quiz pour confirmation
    })
  } catch (error: any) {
    // Gestion centralisée des erreurs Prisma (P2002, P2025, etc.)
    logger.error({
      event: "PROGRESS_ROUTE_ERROR",
      message: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      { error: "Échec de synchronisation orbitale", details: error.message },
      { status: 500 },
    )
  }
}
