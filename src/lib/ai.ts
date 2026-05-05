import Groq from "groq-sdk"
const groq = new Groq({
 apiKey: process.env.GROQ_API_KEY,
})
export async function generateDomainQuestions(domainLabel:
string) {
 const prompt = `Tu es l'IA de bord d'un vaisseau spatial
Partie Back End 4
chargée de l'orientation des nouveaux cadets.
 Le cadet a choisi le domaine "${domainLabel}".
 Génère 3 questions très courtes pour établir son profil :
 1. Une question sur son expérience passée (ex: as-tu déjà
codé ?).
 2. Une question sur ses préférences techniques (ex: quel
langage aimes-tu ?).
 3. Une question sur sa motivation ou une notion de base s
imple.
 CONSIGNES :
 - Utilise un ton accueillant et immersif (thème spatial).
 - Les questions doivent être simples (pas de protocoles c
omplexes).
 - Réponds UNIQUEMENT sous forme de tableau JSON : ["q1",
"q2", "q3"]`
 const chatCompletion = await groq.chat.completions.create
({
 messages: [{ role: "user", content: prompt }],
 model: "llama-3.3-70b-versatile",
 response_format: { type: "json_object" },
 })
 const content = chatCompletion.choices[0]?.message?.content
 return content ? JSON.parse(content).questions || JSON.parse(content) : []
}