import { NextResponse } from "next/server"
import { generateDomainQuestions } from "@/lib/ai"

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