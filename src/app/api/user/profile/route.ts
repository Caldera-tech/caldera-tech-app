import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // 1. Récupération de l'ID depuis les paramètres de l'URL
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Identifiant pilote manquant." },
        { status: 400 }
      );
    }

    // 2. Requête Prisma pour récupérer l'utilisateur avec ses relations
    const user = await prisma.user.findUnique({
      where: { 
        id: parseInt(userId) 
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // On inclut les données du domaine choisi
        domain: {
          select: {
            label: true,
            slug: true
          }
        },
        // On inclut la progression (score et étape actuelle)
        progress: {
          select: {
            score: true,
            currentStep: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Pilote non répertorié dans la base." },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error("Erreur Profile API:", error);
    return NextResponse.json(
      { error: "Échec de la liaison avec la base de données." },
      { status: 500 }
    );
  }
}