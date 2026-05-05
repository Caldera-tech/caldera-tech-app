"use client"

import { motion } from "framer-motion"
import {
  Bot,
  ChevronDown,
  Compass,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function RegisterPage() {
  const router = useRouter()

  const [domains, setDomains] = useState<
    { slug: string; label: string; description?: string }[]
  >([])
  const [isLoadingDomains, setIsLoadingDomains] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ajout du champ 'answers' pour le Stage 2
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    domainSlug: "",
    answers: {
      experience: "",
      language: "",
      presentation: "",
    },
  })

  const progress = Object.values(formData.answers).filter(
    (v) => v !== "",
  ).length

  function getErrorMessage(error: unknown) {
    return error instanceof Error
      ? error.message
      : "Une erreur inconnue est survenue."
  }

  useEffect(() => {
    async function loadDomains() {
      try {
        const res = await fetch("/api/domain")
        const data = await res.json()
        const domainList = Array.isArray(data?.domains) ? data.domains : []

        setDomains(domainList)
        if (domainList.length > 0) {
          setFormData((prev) => ({ ...prev, domainSlug: domainList[0].slug }))
        }
      } catch (err) {
        console.error("Erreur chargement domaines:", err)
      } finally {
        setIsLoadingDomains(false)
      }
    }
    loadDomains()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (progress < 3) {
      setError("Veuillez finaliser le calibrage IA (Stage 2) avant de valider.")
      return
    }
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (!response.ok)
        throw new Error(result.error || "Échec de l'initialisation.")

      router.push("/login")
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-8 p-4 bg-ui-bg relative font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neon-text text-2xl md:text-4xl font-black mb-6 md:mb-12 tracking-tight text-center uppercase"
      >
        Création de profil pilote
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl relative z-10">
        <form
          onSubmit={handleSubmit}
          className="glass-panel p-8 space-y-6 flex flex-col border-l-2 border-l-cyan-500/50 shadow-[20px_0_50px_-20px_rgba(34,211,238,0.1)]"
        >
          <h2 className="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
            Stage 1: Identification
          </h2>

          <div className="space-y-4">
            {error && (
              <div className="text-[10px] bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg">
                ERREUR SYSTÈME : {error.toUpperCase()}
              </div>
            )}

            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
              <input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="NOM DE PILOTE"
                className="neon-input w-full pl-12 text-xs py-3.5"
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="CANAL EMAIL"
                className="neon-input w-full pl-12 text-xs py-3.5"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
              <input
                required
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="CLÉ D'ACCÈS"
                className="neon-input w-full pl-12 text-xs py-3.5"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Domaine de compétences
              </label>
              <div className="relative">
                <select
                  value={formData.domainSlug}
                  onChange={(e) =>
                    setFormData({ ...formData, domainSlug: e.target.value })
                  }
                  className="neon-input w-full appearance-none text-xs py-3.5 pr-10 cursor-pointer"
                >
                  {isLoadingDomains ? (
                    <option>SÉCURISATION DU CANAL...</option>
                  ) : (
                    domains.map((domain) => (
                      <option key={domain.slug} value={domain.slug}>
                        {domain.label.toUpperCase()}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-cyber w-full py-4 text-[10px] font-black mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                VALIDER & INITIALISER IA{" "}
                <Compass className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
              </span>
            )}
          </button>
        </form>

        <div className="glass-panel p-8 flex flex-col min-h-[500px] relative border-r border-white/5">
          <h2 className="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase mb-8">
            Stage 2: Calibrage IA en cours
          </h2>

          <div className="flex-1 flex flex-col gap-6 relative">
            {/* Question Experience */}
            <div className="space-y-3">
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                Expérience en CSS Flexbox ?
              </p>
              <div className="flex gap-2">
                {["Novateur", "Confirmé", "Expert"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        answers: { ...formData.answers, experience: lvl },
                      })
                    }
                    className={`px-3 py-1.5 rounded text-[9px] font-bold border transition-all ${
                      formData.answers.experience === lvl
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                        : "border-white/10 text-slate-500 hover:border-white/30"
                    }`}
                  >
                    {lvl.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Langage */}
            <div className="space-y-3">
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                Langage de préférence ?
              </p>
              <div className="flex gap-2">
                {["JS", "TS", "Python"].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        answers: { ...formData.answers, language: lang },
                      })
                    }
                    className={`px-3 py-1.5 rounded text-[9px] font-bold border transition-all ${
                      formData.answers.language === lang
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                        : "border-white/10 text-slate-500 hover:border-white/30"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                Présentation du Cadet
              </p>
              <textarea
                placeholder="Décrivez votre motivation spatiale..."
                value={formData.answers.presentation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    answers: {
                      ...formData.answers,
                      presentation: e.target.value,
                    },
                  })
                }
                className="neon-input w-full text-[10px] py-3 h-24 resize-none bg-black/20"
              />
            </div>

            <div className="flex items-center gap-4 py-2 border-t border-white/5 mt-2">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="bg-[#0f172a] p-3 rounded-2xl border border-cyan-400/30"
              >
                <Bot className="w-8 h-8 text-cyan-400" />
              </motion.div>
              <div className="bg-[#0f172a]/90 border border-cyan-500/30 p-2 px-3 rounded-xl rounded-bl-none text-[9px] flex-1 backdrop-blur-md">
                <span className="text-cyan-400 font-black block mb-0.5">
                  IA Nexora:
                </span>
                Répondez aux scans pour valider votre profil.
              </div>
            </div>

            <div className="w-full mt-auto space-y-3">
              <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <span>Calibrage système</span>
                <span className="text-cyan-400">{progress}/3</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full border border-white/5 p-0.5">
                <motion.div
                  animate={{ width: `${(progress / 3) * 100}%` }}
                  className="h-full bg-linear-to-r from-cyan-500 to-blue-600 rounded-full shadow-[0_0_10px_#22d3ee]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
