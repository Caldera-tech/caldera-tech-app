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
         RÈGLES : Question max 12 mots. Options courtes.
         JSON : { "mission": "Nom court", "question": "Phrase courte ?", "options": [], "correctAnswers": ["Rép"], "hint": "Indice max 10 mots" }`
      : `Nexora: Génère un texte à trous court sur ${domain} (${selectedTopic}).
         RÈGLES : Texte max 15 mots avec 2 [BLANK].
         JSON : { "mission": "Nom court", "textWithBlanks": "Code [BLANK] texte [BLANK]", "options": [], "correctAnswers": [], "hint": "Indice max 10 mots" }`

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    temperature: 0.8,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error("Réponse IA vide")

  return JSON.parse(content)
}

export async function generateDynamicHint(
  domain: string,
  mission: string,
  currentWrongAnswers: string[],
) {
  const prompt = `Nexora: Le cadet a échoué à "${mission}" sur ${domain}.
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
