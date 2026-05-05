import logger from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { userId, xpToAdd, nextStep } = await req.json()

    if (!userId) {
      logger.warn({
        event: "SECURITY_WARNING",
        message: "Tentative de mise à jour de progression sans ID utilisateur.",
      })
      return NextResponse.json({ error: "ID Pilote manquant" }, { status: 400 })
    }

    const id = parseInt(userId)
    const step = parseInt(nextStep)

    const result = await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { xp: { increment: xpToAdd || 0 } },
      }),

      prisma.progress.upsert({
        where: { userId: id },
        update: {
          currentStep: step,
          score: { increment: xpToAdd || 0 },
          lastActivity: new Date(),
        },
        create: {
          userId: id,
          currentStep: step,
          score: xpToAdd || 0,
        },
      }),
    ])

    logger.info({
      event: "XP_UPDATE_SUCCESS",
      userId: id,
      xpGained: xpToAdd,
      newTotalXp: result[0].xp,
      reachedStep: step,
      message: `Audit : L'utilisateur ${id} a validé une étape. +${xpToAdd} XP ajoutés.`,
    })

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
