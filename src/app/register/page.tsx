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

  // 1. États pour les données de la DB et le formulaire
  const [domains, setDomains] = useState<
    { id: number; slug: string; label: string }[]
  >([])
  const [isLoadingDomains, setIsLoadingDomains] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    domainSlug: "", // Sera initialisé après le fetch des domaines
  })

  // 2. Chargement des domaines au montage
  useEffect(() => {
    async function loadDomains() {
      try {
        const res = await fetch("/api/domains")
        const data = await res.json()
        setDomains(data)
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, domainSlug: data[0].slug }))
        }
      } catch (err) {
        console.error("Erreur chargement domaines:", err)
      } finally {
        setIsLoadingDomains(false)
      }
    }
    loadDomains()
  }, [])

  // 3. Logique d'envoi à la base de données
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Échec de l'initialisation du profil.")
      }

      // Succès ! On peut rediriger vers le quiz par exemple
      console.log("Pilote enregistré :", result.userId)
      router.push("/quiz") // Ou l'étape suivante de ton app
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#0b1120] relative overflow-hidden font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neon-text text-3xl md:text-4xl font-black mb-12 tracking-tight text-center uppercase"
      >
        Création de profil pilote
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl relative z-10">
        {/* STAGE 1: FORMULAIRE D'IDENTIFICATION */}
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
              <div className="text-[10px] bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg animate-bounce">
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
                      <option key={domain.id} value={domain.slug}>
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

        {/* STAGE 2: IA LEO VISUAL */}
        <div className="glass-panel p-8 flex flex-col min-h-[450px] relative border-r border-white/5">
          <h2 className="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase mb-10">
            Stage 2: Calibrage IA en cours
          </h2>

          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute w-40 h-40 border border-cyan-500/20 rounded-full border-dashed"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute w-48 h-48 border border-cyan-500/10 rounded-full"
              />
              <div className="absolute inset-0 bg-cyan-500/15 blur-[45px] rounded-full" />

              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10 bg-[#0f172a] p-5 rounded-3xl border border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
              >
                <Bot className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              </motion.div>

              <div className="absolute -right-24 -top-8 z-20">
                <div className="bg-[#0f172a]/90 border border-cyan-500/30 p-3 rounded-2xl rounded-bl-none backdrop-blur-md w-36 shadow-2xl">
                  <p className="text-[9px] leading-relaxed">
                    <span className="text-cyan-400 font-black block mb-1">
                      IA LEO:
                    </span>
                    Répondez aux scans pour votre parcours.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full mt-auto space-y-3">
              <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <span>Questionnaire</span>
                <span className="text-cyan-400">0/60</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full border border-white/5 p-[2px]">
                <motion.div
                  initial={{ width: "5%" }}
                  animate={{ width: isSubmitting ? "40%" : "15%" }}
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
