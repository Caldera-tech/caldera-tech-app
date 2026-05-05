import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const DOMAIN_TOPICS: Record<string, string[]> = {
  html: ["Structure", "Balises texte", "Listes", "Liens/Images", "Formulaires"],
  css: ["Sélecteurs", "Box Model", "Flexbox", "Couleurs", "Positionnement"],
  javascript: ["Variables", "Fonctions", "Conditions", "Boucles", "DOM"],
  php: ["Variables", "Boucles", "Fonctions", "POST/GET", "Tableaux"],
}

export async function generateDomainQuestions(domainLabel: string) {
  const prompt = `Tu es l'IA Nexora. Génère 3 questions flash pour le domaine "${domainLabel}".
  CONSIGNES : Phrases de moins de 10 mots. Ton spatial.
  RÉPONSE : Uniquement un tableau JSON : ["q1", "q2", "q3"]`

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  })

  const content = chatCompletion.choices[0]?.message?.content
  return content ? JSON.parse(content).questions || JSON.parse(content) : []
}

export async function generateLevelExercise(
  domain: string,
  level: string,
  type: "drag-drop" | "qcm" = "drag-drop",
) {
  const topics = DOMAIN_TOPICS[domain.toLowerCase()] || DOMAIN_TOPICS.html
  const selectedTopic = topics[Math.floor(Math.random() * topics.length)]

  const prompt =
    type === "qcm"
      ? `Nexora: Génère un QCM court sur ${domain} (${selectedTopic}).
         RÈGLES : Question max 12 mots.
         JSON IMPÉRATIF :
         {
           "mission": "Nom",
           "question": "Texte ?",
           "options": ["Rép1", "Rép2", "Rép3", "Rép4"],
           "correctAnswers": ["Rép1"],
           "hint": "Indice"
         }`
      : `Nexora: Génère un texte à trous court sur ${domain} (${selectedTopic}).
         RÈGLES : Texte max 15 mots avec 2 marqueurs [BLANK].
         JSON IMPÉRATIF :
         {
           "mission": "Nom",
           "textWithBlanks": "Texte [BLANK] suite [BLANK]",
           "options": ["Mot1", "Mot2", "Faux1", "Faux2"],
           "correctAnswers": ["Mot1", "Mot2"],
           "hint": "Indice"
         }`

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    temperature: 0.7,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error("Réponse IA vide")

  const parsed = JSON.parse(content)

  if (!parsed.options || parsed.options.length === 0) {
    parsed.options = parsed.correctAnswers || []
  }

  return parsed
}

export async function generateDynamicHint(
  domain: string,
  mission: string,
  currentWrongAnswers: string[],
) {
  const prompt = `Nexora: Le joueur a échoué à "${mission}" sur ${domain}.
  Rép incorrectes: ${JSON.stringify(currentWrongAnswers)}.
  Donne un indice de maximum 10 mots. Ton spatial.`

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
  })

  return (
    completion.choices[0]?.message?.content ||
    "Analyse radar : réessaie, pilote."
  )
}

export async function generateDragAndDropExercise(
  domain: string,
  level: number,
) {
  return generateLevelExercise(domain, level.toString(), "drag-drop")
}
