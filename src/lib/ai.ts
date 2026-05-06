import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

/**
 * ARCHITECTURE DES SECTEURS PAR NIVEAU
 * Définit strictement les sujets abordés pour chaque palier (1 à 5).
 */
const DOMAIN_LEVELS: Record<string, Record<number, string>> = {
  html: {
    1: "Structure de base, Doctype et balises <html>, <head>, <body>",
    2: "Sémantique de texte : titres (h1-h6), paragraphes (p) et listes (ul, ol, li)",
    3: "Hyperliens (a) et intégration d'images (img) avec attributs alt",
    4: "Formulaires : balises <form>, <input> (text, email, password) et <label>",
    5: "HTML5 Avancé : Sémantique (main, section, article) et intégration multimédia",
  },
  css: {
    1: "Sélecteurs de base (balise, classe, id) et propriétés de texte (color, font-size)",
    2: "Le Modèle de Boîte (Box Model) : margin, padding, border et box-sizing",
    3: "Positionnement : static, relative, absolute, fixed et z-index",
    4: "Mise en page moderne : Flexbox (container, direction, alignement)",
    5: "Grilles et Dynamisme : CSS Grid et @keyframes pour les animations",
  },
  javascript: {
    1: "Bases des données : variables (let, const), nombres et chaînes de caractères",
    2: "Logique de contrôle : structures conditionnelles (if, else, switch)",
    3: "Modularité : déclaration et appel de fonctions, paramètres et retour",
    4: "Structures de données : boucles (for, while) et manipulation de tableaux (push, pop)",
    5: "Interactivité DOM : sélection d'éléments et gestion des événements (click, submit)",
  },
  php: {
    1: "Syntaxe de base, balises <?php ?> et affichage (echo/print)",
    2: "Variables, constantes et concaténation de chaînes",
    3: "Superglobales : gestion des données de formulaires avec $_GET et $_POST",
    4: "Logique serveur : structures de contrôle et fonctions natives PHP",
    5: "Gestion des données : Tableaux associatifs et inclusion de fichiers (require/include)",
  },
}

/**
 * GÉNÉRATEUR D'EXERCICES DE NIVEAU
 * Produit un QCM ou un Drag & Drop spécifique au domaine et au palier actuel.
 */
export async function generateLevelExercise(
  domain: string,
  level: string,
  type: "drag-drop" | "qcm" = "qcm",
) {
  const levelInt = parseInt(level) || 1
  const domainKey = domain.toLowerCase()

  // Récupération du sujet spécifique au palier
  const topics = DOMAIN_LEVELS[domainKey] || DOMAIN_LEVELS.html
  const specificTopic = topics[levelInt] || topics[1]

  const prompt =
    type === "qcm"
      ? `Tu es Nexora, IA architecte système.
         Génère un QCM EXCLUSIVEMENT sur le secteur "${domain.toUpperCase()}".
         Sujet précis : ${specificTopic}.
         Difficulté : Niveau ${levelInt}/5.

         RÈGLES :
         - Question courte (max 12 mots).
         - Ton spatial et immersif.
         - 4 options cohérentes, 1 seule réponse exacte.

         FORMAT JSON STRICT :
         {
           "mission": "Nom de la mission",
           "question": "Texte de la question",
           "options": ["Choix A", "Choix B", "Choix C", "Choix D"],
           "correctAnswers": ["La réponse exacte"],
           "hint": "Un indice tactique court"
         }`
      : `Génère un exercice texte à trous sur ${domain} (Niveau ${levelInt}).
         Sujet : ${specificTopic}.
         JSON STRICT :
         {
           "mission": "Nom",
           "textWithBlanks": "Texte avec [BLANK]",
           "options": ["Correct1", "Correct2", "Faux1", "Faux2"],
           "correctAnswers": ["Correct1", "Correct2"],
           "hint": "Indice"
         }`

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    temperature: 0.6,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error("Réponse IA vide")

  const parsed = JSON.parse(content)

  // Sécurité pour les options
  if (!parsed.options || parsed.options.length === 0) {
    parsed.options = parsed.correctAnswers || []
  }

  return parsed
}

/**
 * GÉNÉRATEUR DE QUESTIONS FLASH (POUR LE HUD)
 */
export async function generateDomainQuestions(domainLabel: string) {
  const prompt = `Nexora: Génère 3 alertes système (questions flash) pour le domaine "${domainLabel}".
  CONSIGNES : Ton d'urgence spatiale. Phrases très courtes.
  RÉPONSE : Uniquement un tableau JSON : ["q1", "q2", "q3"]`

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  })

  const content = chatCompletion.choices[0]?.message?.content
  if (!content) return []

  const parsed = JSON.parse(content)
  return parsed.questions || parsed
}

/**
 * GÉNÉRATEUR D'INDICES DYNAMIQUES
 */
export async function generateDynamicHint(
  domain: string,
  mission: string,
  currentWrongAnswers: string[],
) {
  const prompt = `Nexora: Le pilote a échoué à la mission "${mission}" en ${domain}.
  Erreurs commises: ${JSON.stringify(currentWrongAnswers)}.
  Donne un indice cryptique et spatial de max 10 mots sans donner la réponse directement.`

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
  })

  return (
    completion.choices[0]?.message?.content ||
    "Analyse radar : recalibrage nécessaire, pilote."
  )
}

// Fonction utilitaire pour compatibilité drag-and-drop
export async function generateDragAndDropExercise(
  domain: string,
  level: number,
) {
  return generateLevelExercise(domain, level.toString(), "drag-drop")
}
