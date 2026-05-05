import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { userId, xpToAdd, nextStep } = await req.json()

    if (!userId) {
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

    return NextResponse.json({
      success: true,
      newTotalXp: result[0].xp,
      currentStep: result[1].currentStep,
    })
  } catch (error: any) {
    console.error("Erreur critique Route Progress:", error)
    return NextResponse.json(
      { error: "Échec de synchronisation orbitale", details: error.message },
      { status: 500 },
    )
  }
}
