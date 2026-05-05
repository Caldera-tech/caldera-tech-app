import Groq from "groq-sdk"
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})
export async function generateDomainQuestions(domainLabel: string) {
  const prompt = `Tu es l'IA de bord d'un vaisseau spatial
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
  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  })
  const content = chatCompletion.choices[0]?.message?.content
  return content ? JSON.parse(content).questions || JSON.parse(content) : []
}

export async function generateLevelExercise(domain: string, level: string) {
  const prompt = `Tu es l'IA LEO. Génère un exercice de type "Drag and Drop" pour le domaine ${domain}, niveau ${level}.

  RÈGLES STRICTES :
  - Retourne UNIQUEMENT un objet JSON.
  - Pas de texte avant, pas de texte après.
  - "textWithBlanks" doit contenir des marqueurs [BLANK].
  - "options" doit contenir toutes les bonnes réponses + 2 leurres.

  STRUCTURE JSON :
  {
    "mission": "Nom de la mission",
    "textWithBlanks": "Le code <[BLANK]> sert à [BLANK].",
    "options": ["html", "structurer", "div", "css"],
    "correctAnswers": ["html", "structurer"],
    "hint": "Un indice court."
  }`

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    // Force le mode JSON
    response_format: { type: "json_object" },
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error("Réponse IA vide")

  return JSON.parse(content)
}

export async function generateDragAndDropExercise(
  domain: string,
  level: number,
) {
  const prompt = `Tu es l'IA Nexora. Génère un exercice de type "texte à trous" pour le domaine ${domain}, niveau ${level}.
  Format JSON strict :
  {
    "mission": "Nom court",
    "textWithBlanks": "Le texte avec des [BLANK] à l'intérieur",
    "options": ["mot1", "mot2", "mot3"], // Inclure les bonnes réponses + des leurres
    "correctAnswers": ["mot1", "mot2"], // Dans l'ordre des trous
    "hint": "Indice de Nexora"
  }`

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  })

  return JSON.parse(completion.choices[0]?.message?.content || "{}")
}
