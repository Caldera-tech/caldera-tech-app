/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronLeft,
  Cpu,
  HelpCircle,
  Info,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import * as React from "react"
import { useEffect, useState } from "react"

export default function NexoraMultiWindowQuiz({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)
  const exerciseId = resolvedParams.id
  const searchParams = useSearchParams()
  const router = useRouter()

  // Récupération dynamique du domaine depuis l'URL
  const domain = searchParams.get("domain") || "html"

  const [exercise, setExercise] = useState<any>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [exerciseCount, setExerciseCount] = useState(1)
  const [usedQuestions, setUsedQuestions] = useState<string[]>([]) // Historique pour éviter les doublons
  const TOTAL_REQUIRED = 3
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const fetchExercise = async (currentUsedQuestions: string[]) => {
    setLoading(true)
    setIsCorrect(null)
    setSelectedOption(null)
    try {
      // Transmission du domaine, du niveau et des questions à exclure
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          level: exerciseId,
          type: "qcm",
          exclude: currentUsedQuestions, // On envoie les questions déjà posées
          seed: Math.random(),
        }),
      })
      const data = await res.json()
      if (data) {
        setExercise(data)
        // On ajoute la nouvelle question à l'historique
        if (data.question) {
          setUsedQuestions((prev) => [...prev, data.question])
        }
      }
    } catch (err) {
      console.error("Erreur cockpit:", err)
    } finally {
      setLoading(false)
    }
  }

  // Initialisation au montage
  useEffect(() => {
    fetchExercise([])
  }, [domain, exerciseId])

  const handleSubmit = async () => {
    if (!selectedOption || !exercise) return
    setIsSubmitting(true)

    const answers = exercise.correctAnswers || exercise.answers || []
    const success = selectedOption === answers[0]
    setIsCorrect(success)

    if (success) {
      const userId = localStorage.getItem("userId")
      const currentLevelInt = parseInt(exerciseId)

      try {
        if (exerciseCount < TOTAL_REQUIRED) {
          // Mise à jour de la progression intermédiaire
          await fetch("/api/user/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              xpToAdd: 50,
              nextStep: currentLevelInt,
              domain: domain, // Correction : ajout du domaine
            }),
          })

          setTimeout(() => {
            const newCount = exerciseCount + 1
            setExerciseCount(newCount)
            fetchExercise([...usedQuestions]) // On passe l'historique actuel
          }, 1500)
        } else {
          // Validation finale du niveau
          const res = await fetch("/api/user/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              xpToAdd: 150,
              nextStep: currentLevelInt + 1,
              domain: domain, // Correction : ajout du domaine
            }),
          })

          if (res.ok) {
            setTimeout(() => setShowSuccessModal(true), 800)
          }
        }
      } catch (err) {
        console.error("Échec de synchronisation orbitale")
      }
    }
    setIsSubmitting(false)
  }

  const displayQuestion =
    exercise?.question ||
    exercise?.text ||
    exercise?.mission ||
    "Analyse radar en cours..."

  if (loading || !exercise)
    return (
      <div className="min-h-screen bg-[#080b14] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-cyan-400 w-12 h-12" />
        <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em]">
          Initialisation du protocole...
        </p>
      </div>
    )

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 lg:p-8 font-sans overflow-hidden relative">
      <header className="max-w-[1600px] mx-auto flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center hover:bg-slate-700 transition-colors shadow-lg"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Secteur: {domain.toUpperCase()}
            </p>
            <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(exerciseCount / TOTAL_REQUIRED) * 100}%`,
                }}
                className="h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]"
              />
            </div>
          </div>
        </div>
        <h2 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter text-white">
          Level {exerciseId}: Protocole {domain.toUpperCase()}
        </h2>
        <div className="flex items-center gap-3 bg-slate-900/80 p-2 px-4 rounded-xl border border-white/5 backdrop-blur-md">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Stabilité: 100%
          </span>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 h-[calc(100vh-140px)]">
        <aside className="lg:col-span-3 flex flex-col gap-6 h-full">
          <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-cyan-500/20 rounded-[2rem] p-6 flex flex-col shadow-2xl">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-4 italic">
              Mission / Quest
            </span>
            <div className="mb-6">
              <h3 className="text-sm font-black uppercase text-white mb-2 leading-tight">
                Reconstruction du Noyau
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                "{exercise.mission || "Stabilisation des flux de données"}"
              </p>
            </div>
            <div className="space-y-3 mt-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">
                Objectifs
              </span>
              {[
                "Analyser le fragment",
                "Identifier les paramètres",
                "Restaurer le module",
              ].map((obj, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${i + 1 === exerciseCount ? "bg-cyan-500/10 border-cyan-500/30 shadow-inner" : "bg-slate-950/50 border-white/5"}`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center ${i + 1 < exerciseCount ? "bg-emerald-500 border-emerald-500" : "border-slate-700"}`}
                  >
                    {i + 1 < exerciseCount && (
                      <CheckCircle2 size={12} className="text-white" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-tighter ${i + 1 === exerciseCount ? "text-white" : "text-slate-600"}`}
                  >
                    {obj}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-6 border-t border-white/5 text-center">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                Séquence {exerciseCount} / {TOTAL_REQUIRED}
              </p>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-6 flex flex-col gap-6 h-full">
          <div
            className={`flex-1 bg-[#0b0f1a] border transition-all duration-500 rounded-[2.5rem] flex flex-col shadow-2xl relative overflow-hidden ${isCorrect === false ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "border-white/10"}`}
          >
            <div className="bg-[#161b22] px-6 py-4 border-b border-white/5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                  Question Terminal
                </span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/30 shadow-sm" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30 shadow-sm" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 shadow-sm" />
              </div>
            </div>

            <div className="flex-1 p-6 lg:p-10 flex flex-col items-center justify-center overflow-y-auto relative">
              <div className="mb-10 text-center w-full max-w-lg relative z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-6"
                >
                  <HelpCircle
                    size={48}
                    className="text-cyan-400 mx-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                  />
                </motion.div>
                <h2 className="text-xl lg:text-3xl font-black uppercase italic tracking-tighter text-white leading-tight mb-6 drop-shadow-xl">
                  {displayQuestion}
                </h2>
                <div className="h-1 w-32 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mx-auto rounded-full" />
              </div>

              <div className="grid grid-cols-1 gap-3 w-full max-w-md relative z-10">
                {exercise?.options?.map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedOption(opt)
                      setIsCorrect(null)
                    }}
                    className={`group p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${selectedOption === opt ? "border-cyan-500 bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]" : "border-white/5 bg-slate-900/80 hover:bg-slate-800 hover:border-white/10"}`}
                  >
                    <div className="flex items-center gap-4 relative z-20">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedOption === opt ? "border-cyan-500 bg-cyan-500/20 shadow-inner" : "border-slate-700"}`}
                      >
                        {selectedOption === opt && (
                          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
                        )}
                      </div>
                      <span
                        className={`text-[12px] font-black uppercase tracking-widest ${selectedOption === opt ? "text-cyan-400" : "text-slate-300 group-hover:text-white"}`}
                      >
                        {opt}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 border-t border-white/5 bg-slate-950/40 flex gap-4 shrink-0 relative z-10 backdrop-blur-sm">
              <button
                onClick={() => fetchExercise(usedQuestions)}
                className="p-4 bg-slate-800 border border-white/10 rounded-2xl hover:bg-slate-700 text-slate-400 hover:text-white transition-all shadow-inner"
              >
                <RotateCcw size={20} />
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedOption || isSubmitting || isCorrect === true}
                className={`flex-1 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-2xl ${isCorrect ? "bg-emerald-500 text-white" : "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]"} disabled:opacity-20`}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin mx-auto" size={18} />
                ) : isCorrect ? (
                  "Séquence Stabilisée"
                ) : (
                  "Soumettre Solution"
                )}
              </button>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-3 flex flex-col gap-6 h-full">
          <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 h-1/2 flex flex-col shadow-xl">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">
              Module Preview
            </span>
            <div className="flex-1 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center p-4 relative overflow-hidden group">
              <div className="text-center relative z-10">
                <Cpu
                  size={24}
                  className={`mx-auto mb-2 transition-colors ${isCorrect ? "text-emerald-400" : "text-slate-700"}`}
                />
                <p className="text-[10px] font-bold text-slate-600 uppercase italic leading-tight">
                  Status: {isCorrect ? "Online" : "Offline"}
                </p>
                <p className="text-[8px] text-slate-800 uppercase mt-2 font-black">
                  Data Sync {domain.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-[2rem] p-6 flex-1 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
              <Bot size={80} />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-cyan-500/30">
                  <Bot size={22} className="text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block italic">
                    Assistant Nexora
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest opacity-60">
                    — LEO-V3
                  </span>
                </div>
              </div>
              <div className="flex-1 bg-slate-950/50 rounded-2xl border border-white/5 p-4 relative">
                <Info
                  size={12}
                  className="text-cyan-500 absolute top-3 right-3 opacity-30"
                />
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  "
                  {exercise?.hint || "Vérifiez les protocoles dans la console."}
                  "
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-[#050810]/95 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-[#0f172a] border-2 border-cyan-500/30 rounded-[3rem] p-12 text-center shadow-[0_0_120px_rgba(34,211,238,0.2)] relative"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-slate-900 border-2 border-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_40px_#22d3ee]">
                <Sparkles size={40} className="text-cyan-400" />
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 italic mt-6 text-white drop-shadow-lg">
                Secteur Sécurisé
              </h2>
              <p className="text-emerald-400 font-black text-sm tracking-[0.4em] mb-10 drop-shadow-md">
                +150 XP Gagné
              </p>
              <button
                onClick={() => {
                  window.location.href = `/map?domain=${domain}&t=${Date.now()}`
                }}
                className="w-full py-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-black text-[10px] uppercase tracking-widest text-black shadow-2xl group active:scale-95 transition-all"
              >
                Retour au Secteur {domain.toUpperCase()}{" "}
                <ArrowRight
                  size={16}
                  className="inline ml-2 group-hover:translate-x-2 transition-transform"
                />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
