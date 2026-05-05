import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
