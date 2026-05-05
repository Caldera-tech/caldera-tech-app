import { generateDomainQuestions, generateLevelExercise } from "@/lib/ai"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get("domain") || "Développement"
  try {
    const questions = await generateDomainQuestions(domain)
    return NextResponse.json({ questions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { domain, level } = await req.json()
    const exercise = await generateLevelExercise(domain, level)

    // Vérification de la structure minimale requise
    if (!exercise.textWithBlanks || !exercise.correctAnswers) {
      throw new Error("Structure JSON incomplète")
    }

    return NextResponse.json(exercise)
  } catch (error: any) {
    console.error("Erreur API Quiz:", error.message)
    return NextResponse.json(
      { error: "Format de données invalide", details: error.message },
      { status: 500 },
    )
  }
}
