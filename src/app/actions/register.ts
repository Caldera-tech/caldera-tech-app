"use server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
export async function registerUser(formData: FormData) {
 const email = formData.get("email") as string
 const name = formData.get("name") as string
 const password = formData.get("password") as string
 const domainSlug = formData.get("domain") as string
 try {
 const domain = await prisma.domain.findUnique({
 where: { slug: domainSlug },
 })
 if (!domain) throw new Error("Domaine introuvable")
 await prisma.user.create({
 data: {
 email,
 name,
 password,
 domainId: domain.id,
 },
 })
 } catch (error: any) {
 console.error("Erreur d'inscription:", error.message)
 return { error: "L'inscription a échoué." }
 }
 redirect("/dashboard")
}