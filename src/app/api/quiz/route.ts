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
    const body = await req.json()
    const { domain, level, type } = body

    const exercise = await generateLevelExercise(domain, level, type || "qcm")

    const isValidStructure =
      exercise.correctAnswers && (exercise.question || exercise.textWithBlanks)

    if (!isValidStructure) {
      console.error("Structure IA invalide détectée :", exercise)
      throw new Error("Structure JSON incomplète reçue de l'IA")
    }

    return NextResponse.json(exercise)
  } catch (error: any) {
    console.error("Erreur API Quiz:", error.message)
    return NextResponse.json(
      {
        error: "Échec de génération de l'exercice",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
