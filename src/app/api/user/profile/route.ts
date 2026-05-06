import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const domain = searchParams.get("domain") || "html"

    if (!userId)
      return NextResponse.json({ error: "ID manquant" }, { status: 400 })

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        xp: true,
        progress: {
          where: {
            domain: {
              equals: domain.toLowerCase().trim(),
            },
          },
        },
      },
    })

    if (!user)
      return NextResponse.json({ error: "Pilote non trouvé" }, { status: 404 })

    const currentProgress = user.progress[0] || {
      currentStep: 1,
      score: 0,
      domain: domain.toLowerCase(),
    }

    return NextResponse.json({
      user: {
        ...user,
        progress: currentProgress,
      },
    })
  } catch (error: any) {
    console.error("Erreur Profile API:", error.message)
    return NextResponse.json({ error: "Erreur liaison BDD" }, { status: 500 })
  }
}
