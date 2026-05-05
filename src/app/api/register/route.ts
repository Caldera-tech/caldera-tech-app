import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt" // 1. Import de bcrypt

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, domainSlug, answers } = body

    // Vérification du domaine
    const domain = await prisma.domain.findUnique({
      where: { slug: domainSlug },
    })

    if (!domain) {
      return NextResponse.json(
        { error: "Domaine spatial introuvable" },
        { status: 404 },
      )
    }

    // 2. Hachage du mot de passe
    // Le "10" correspond au coût de hachage (salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Création du cadet avec le mot de passe haché
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // On utilise la version sécurisée
        domainId: domain.id,
        answers: answers || {},
        // On initialise la progression en même temps
        progress: {
          create: {} 
        }
      },
    })

    return NextResponse.json(
      {
        message: "Cadet enregistré avec succès !",
        userId: newUser.id,
      },
      { status: 201 },
    )
  } catch (error: any) {
    // Gestion spécifique si l'email existe déjà (erreur Prisma P2002)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Cet email est déjà enregistré dans la flotte." },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}