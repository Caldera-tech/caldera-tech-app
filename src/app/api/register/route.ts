import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
 try {
 const body = await req.json()
 const { name, email, password, domainSlug, answers } = body

 const domain = await prisma.domain.findUnique({
 where: { slug: domainSlug },
 })
 if (!domain) {
 return NextResponse.json(
 { error: "Domaine spatial introuvable" },
 { status: 404 },
 )
 }

 // 2. Création du cadet
 const newUser = await prisma.user.create({
 data: {
 name,
 email,
 password,
 domainId: domain.id,
 answers: answers || {},
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
 return NextResponse.json({ error: error.message }, { status: 500 })
 }
}