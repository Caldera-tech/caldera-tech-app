import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Erreur inconnue"
}

export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      select: {
        slug: true,
        label: true,
        description: true,
      },
      orderBy: { label: "asc" },
    })
    return NextResponse.json({ domains })
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}
