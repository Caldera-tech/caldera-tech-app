import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // 1. Chercher l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Pilote non identifié dans la flotte." },
        { status: 401 }
      )
    }

    // 2. Comparer le mot de passe avec le hash en base
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Clé d'accès invalide." },
        { status: 401 }
      )
    }

    // 3. Ici, tu pourrais gérer les cookies ou les JWT de session
    // Pour l'instant, on renvoie juste un succès
    return NextResponse.json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de l'authentification." },
      { status: 500 }
    )
  }
}