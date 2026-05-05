import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
 try {
 const domains = [
 {
 slug: "cyber",
 label: "Cyber-Odyssée",
 description: "Sécurité et infiltration",
 },
 {
 slug: "marketing",
 label: "Influence Galactique",
 description: "Stratégie et com",
 },
 {
 slug: "dev",
 label: "Forge Numérique",
 description: "Développement système",
 },
 {
 slug: "design",
 label: "Esthétique Stellaire",
 description: "Interface et UX",
 },
 ]
 for (const d of domains) {
 await prisma.domain.upsert({
 where: { slug: d.slug },
 update: {},
 create: d,
 })
 }
 return NextResponse.json({
 message: "Système initialisé : Domaines créés.",
 })
 } catch (error: any) {
 return NextResponse.json({ error: error.message }, { status: 500 })
 }
}
