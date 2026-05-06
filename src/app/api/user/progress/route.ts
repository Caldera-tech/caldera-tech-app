import logger from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // AJOUT : on récupère 'domain' depuis le body envoyé par le Quiz
    const { userId, xpToAdd, nextStep, domain } = body

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

    // 2. CONVERSION IMPÉRATIVE
    const userIdInt = parseInt(userId)
    const nextStepInt = parseInt(nextStep)
    // On s'assure que le domaine est en minuscule pour correspondre à la BDD
    const activeDomain = (domain || "html").toLowerCase()

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

    // 3. TRANSACTION ATOMIQUE
    const result = await prisma.$transaction([
      // A. Mise à jour de l'XP globale de l'utilisateur (Table User)
      prisma.user.update({
        where: { id: userIdInt },
        data: { xp: { increment: xpToAdd || 0 } },
      }),

      // B. Mise à jour (ou création) de la ligne de progression (Table Progress)
      prisma.progress.upsert({
        where: {
          // CORRECTION ICI : Utilisation de l'index composé userId_domain
          userId_domain: {
            userId: userIdInt,
            domain: activeDomain,
          },
        },
        update: {
          currentStep: nextStepInt,
          score: { increment: xpToAdd || 0 },
          lastActivity: new Date(),
        },
        create: {
          userId: userIdInt,
          domain: activeDomain, // On initialise le domaine à la création
          currentStep: nextStepInt,
          score: xpToAdd || 0,
        },
      }),
    ])

    // 4. AUDIT ET LOGS
    logger.info({
      event: "XP_UPDATE_SUCCESS",
      userId: userIdInt,
      domain: activeDomain,
      xpGained: xpToAdd,
      reachedStep: nextStepInt,
      message: `Audit : L'utilisateur ${userIdInt} a validé une étape en ${activeDomain}. +${xpToAdd} XP. Nouveau step: ${nextStepInt}.`,
    })

    // 5. RÉPONSE AU CLIENT
    return NextResponse.json({
      success: true,
      newTotalXp: result[0].xp,
      currentStep: result[1].currentStep,
    })
  } catch (error: any) {
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
