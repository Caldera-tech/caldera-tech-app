import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function getErrorMessage(error: unknown) {
 return error instanceof Error ? error.message : "Erreur inconnue"
}

export async function GET() {
 try {
 const domains = [
 {
 slug: "cyber",
 label: "Cybersécurité",
 description: "Sécurité informatique, protection des données et gestion des risques",
 },
 {
 slug: "marketing",
 label: "Marketing et Communication",
 description: "Stratégie marketing, réseaux sociaux et branding",
 },
 {
 slug: "dev",
 label: "Développement",
 description: "Programmation, web, logiciels et systèmes",
 },
 {
 slug: "infra",
 label: "Infrastructure",
 description: "Administration systèmes, cloud et services IT",
 },
 {
 slug: "reseaux",
 label: "Réseaux",
 description: "Architecture réseau, protocoles et télécommunications",
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
 } catch (error: unknown) {
 return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
 }
}
