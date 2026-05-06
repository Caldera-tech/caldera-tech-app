import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const domain = searchParams.get("domain") || "html" // On récupère le domaine de l'URL

    if (!userId) {
      return NextResponse.json(
        { error: "Identifiant pilote manquant." },
        { status: 400 },
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true, // ✅ CRUCIAL : Ajout de l'XP globale (les 1000 XP de Bob)
        domain: {
          select: {
            label: true,
            slug: true,
          },
        },
        progress: {
          // ✅ FILTRE : On ne prend que la progression du domaine actuel
          where: {
            domain: domain.toLowerCase(),
          },
          select: {
            score: true,
            currentStep: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Pilote non répertorié dans la base." },
        { status: 404 },
      )
    }

    // On formate la réponse pour que userData.progress soit un objet (pas un tableau)
    const formattedUser = {
      ...user,
      progress: user.progress[0] || { score: 0, currentStep: 1 },
    }

    return NextResponse.json({ user: formattedUser })
  } catch (error) {
    console.error("Erreur Profile API:", error)
    return NextResponse.json(
      { error: "Échec de la liaison avec la base de données." },
      { status: 500 },
    )
  }
}
