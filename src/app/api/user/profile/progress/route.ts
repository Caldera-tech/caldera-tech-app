import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, xpToAdd, nextStep } = body;

    // 1. Validation de sécurité
    if (!userId) {
      return NextResponse.json({ error: "ID Pilote requis pour la synchronisation" }, { status: 400 });
    }

    // 2. Mise à jour atomique dans Prisma
    // On utilise 'update' sur userProgress lié à l'ID de l'utilisateur
    const updatedProgress = await prisma.userProgress.update({
      where: { 
        userId: parseInt(userId) 
      },
      data: {
        // Incrémente le score actuel
        score: { 
          increment: xpToAdd || 0 
        },
        // Met à jour le palier si le nouveau palier est supérieur au palier actuel
        currentStep: { 
          set: nextStep 
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Données de vol synchronisées avec succès",
      newScore: updatedProgress.score,
      currentStep: updatedProgress.currentStep
    });

  } catch (error: any) {
    console.error("ERREUR CRITIQUE API PROGRESS:", error);
    return NextResponse.json(
      { error: "Échec de la liaison avec le centre de données", details: error.message },
      { status: 500 }
    );
  }
}