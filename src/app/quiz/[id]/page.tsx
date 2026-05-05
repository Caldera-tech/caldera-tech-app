"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  Bot,
  ChevronLeft,
  Loader2,
  LockOpen,
  RotateCcw,
  Terminal,
  XCircle,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import * as React from "react"
import { useEffect, useState } from "react"

interface QuizPageProps {
  params: Promise<{ id: string }>
}

export default function DragDropQuiz({ params }: QuizPageProps) {
  const resolvedParams = React.use(params)
  const exerciseId = resolvedParams.id

  const searchParams = useSearchParams()
  const router = useRouter()
  const domain = searchParams.get("domain") || "html"

  const [exercise, setExercise] = useState<any>(null)
  const [placedItems, setPlacedItems] = useState<string[]>([])
  const [availableOptions, setAvailableOptions] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dynamicHint, setDynamicHint] = useState<string>("")

  const [exerciseCount, setExerciseCount] = useState(1)
  const TOTAL_REQUIRED = 3
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const fetchExercise = async (count: number) => {
    setLoading(true)
    setIsCorrect(null)
    setPlacedItems([])
    setDynamicHint("")

    const type = count === 2 ? "qcm" : "drag-drop"

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          level: exerciseId,
          type,
          seed: Math.random(),
        }),
      })
      const data = await res.json()

      if (data && data.correctAnswers) {
        setExercise(data)
        setAvailableOptions(data.options || [])
        setPlacedItems(new Array(data.correctAnswers.length).fill(""))
      }
    } catch (err) {
      console.error("Erreur de liaison LEO:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExercise(1)
  }, [domain, exerciseId])

  const getAIHint = async () => {
    try {
      const res = await fetch("/api/quiz/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          mission: exercise.mission,
          currentWrongAnswers: placedItems,
        }),
      })
      const data = await res.json()
      setDynamicHint(data.hint)
    } catch (err) {
      console.error("Erreur indice Nexora:", err)
    }
  }

  const handleSubmit = async () => {
    if (placedItems.includes("")) return

    setIsSubmitting(true)
    const success =
      JSON.stringify(placedItems) === JSON.stringify(exercise.correctAnswers)
    setIsCorrect(success)

    const userId = localStorage.getItem("userId")

    if (success) {
      try {
        if (exerciseCount < TOTAL_REQUIRED) {
          await fetch("/api/user/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              xpToAdd: 50,
              nextStep: parseInt(exerciseId),
            }),
          })

          setTimeout(() => {
            setExerciseCount((prev) => prev + 1)
            fetchExercise(exerciseCount + 1)
          }, 1500)
        } else {
          const res = await fetch("/api/user/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              xpToAdd: 150,
              nextStep: parseInt(exerciseId) + 1,
            }),
          })

          if (res.ok) {
            setTimeout(() => setShowSuccessModal(true), 800)
          }
        }
      } catch (err) {
        console.error("Erreur progression:", err)
      }
    } else {
      await getAIHint()
    }
    setIsSubmitting(false)
  }

  if (loading || !exercise)
    return (
      <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-cyan-400 w-10 h-10" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 italic">
          Génération du module {exerciseCount}/{TOTAL_REQUIRED}...
        </p>
      </div>
    )

  return (
    <div className="h-screen w-full bg-[#050810] text-white flex flex-col font-sans overflow-hidden relative">
      <header className="h-20 flex justify-between items-center px-8 border-b border-cyan-500/20 bg-[#050810]/50 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-full border border-white/5 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
              Secteur {domain.toUpperCase()} // Séquence {exerciseCount} sur{" "}
              {TOTAL_REQUIRED}
            </h1>
            <div className="flex gap-1.5 mt-1">
              {[...Array(TOTAL_REQUIRED)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-8 rounded-full transition-all duration-500 ${i + 1 < exerciseCount ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : i + 1 === exerciseCount ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" : "bg-slate-800"}`}
                />
              ))}
            </div>
          </div>
        </div>
        <Bot className="text-cyan-400 animate-pulse w-6 h-6" />
      </header>

      <main className="flex-1 flex overflow-hidden p-6 gap-6 relative">
        <aside className="w-80 glass-panel p-6 bg-slate-900/20 border border-white/5 flex flex-col gap-6">
          <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Terminal size={14} /> Objectifs du Scan
          </h2>
          <div className="p-4 bg-cyan-500/5 rounded border border-cyan-500/20 italic text-[11px] text-slate-300">
            {exerciseCount === 2
              ? "Cadet, analysez la question et choisissez la réponse correcte pour stabiliser le flux."
              : "Pilote, insérez les fragments de code manquants pour restaurer le noyau."}
          </div>

          <AnimatePresence>
            {isCorrect === false && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-[10px] font-black uppercase"
              >
                <XCircle size={16} /> Erreur détectée
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 glass-panel bg-[#0b1120]/50 border border-white/5 p-12 flex items-center justify-center overflow-y-auto relative shadow-inner">
            {exercise.question ? (
              <div className="w-full max-w-xl flex flex-col gap-8">
                <h3 className="text-2xl font-black italic uppercase text-cyan-400 text-center tracking-tight">
                  {exercise.question}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {exercise.options.map((opt: string) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setPlacedItems([opt])
                        setIsCorrect(null)
                      }}
                      className={`p-5 border-2 transition-all text-left uppercase font-black text-xs tracking-widest ${placedItems[0] === opt ? "border-cyan-500 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "border-white/5 bg-white/5 hover:bg-white/10"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-2xl font-mono leading-[5.5rem] text-slate-300 text-center">
                {exercise?.textWithBlanks
                  ?.split("[BLANK]")
                  .map((part: string, i: number, arr: any[]) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <div
                          className={`inline-block min-w-[12rem] h-14 mx-3 translate-y-4 border-2 border-dashed rounded-xl transition-all cursor-pointer ${placedItems[i] ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "border-slate-800 bg-black/40 hover:border-slate-700"}`}
                          onClick={() => {
                            if (placedItems[i]) {
                              const newPlaced = [...placedItems]
                              setAvailableOptions([
                                ...availableOptions,
                                placedItems[i],
                              ])
                              newPlaced[i] = ""
                              setPlacedItems(newPlaced)
                              setIsCorrect(null)
                            }
                          }}
                        >
                          {placedItems[i] && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="w-full h-full flex items-center justify-center text-xs font-black text-cyan-400 tracking-widest uppercase px-4"
                            >
                              {placedItems[i]}
                            </motion.div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
              </div>
            )}
          </div>

          <AnimatePresence>
            {!exercise.question && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="h-32 glass-panel bg-slate-900/40 border border-white/5 p-6 flex items-center gap-4 overflow-x-auto scrollbar-hide"
              >
                {availableOptions.map((opt) => (
                  <motion.button
                    key={opt}
                    whileHover={{ y: -5, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const emptyIndex = placedItems.indexOf("")
                      if (emptyIndex !== -1) {
                        const newPlaced = [...placedItems]
                        newPlaced[emptyIndex] = opt
                        setPlacedItems(newPlaced)
                        setAvailableOptions(
                          availableOptions.filter((o) => o !== opt),
                        )
                        setIsCorrect(null)
                      }
                    }}
                    className="px-8 py-3 border border-cyan-500/30 rounded-lg bg-cyan-500/10 text-cyan-400 font-black text-[10px] tracking-widest uppercase shadow-lg transition-all"
                  >
                    {opt}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="h-24 px-12 border-t border-white/5 flex items-center justify-between bg-[#050810] z-40">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors"
        >
          <RotateCcw size={14} /> Réinitialiser
        </button>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex max-w-md glass-panel p-3 border-l-2 border-cyan-500 bg-cyan-500/5 items-center gap-3">
            <Bot
              size={16}
              className={`text-cyan-400 ${isCorrect === false ? "animate-bounce" : ""}`}
            />
            <p className="text-[9px] text-slate-400 italic">
              Nexora : "{dynamicHint || exercise?.hint}"
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={
              placedItems.includes("") || isSubmitting || isCorrect === true
            }
            className={`px-12 py-4 btn-cyber text-[10px] font-black uppercase shadow-[0_0_30px_rgba(34,211,238,0.2)] disabled:opacity-20 flex items-center gap-3 min-w-[220px] justify-center transition-all ${isCorrect ? "bg-green-500/20 border-green-500 text-green-400" : ""}`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={14} />
            ) : isCorrect ? (
              "Séquence validée"
            ) : exerciseCount === TOTAL_REQUIRED ? (
              "Finaliser le secteur"
            ) : (
              "Vérifier la réponse"
            )}
          </button>
        </div>
      </footer>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[100] bg-[#050810]/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className="glass-panel p-10 border-2 border-green-500 shadow-[0_0_60px_rgba(34,197,94,0.3)] max-w-md w-full text-center flex flex-col items-center gap-8"
            >
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{
                    scale: 1,
                    rotate: [0, -10, 10, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                  }}
                  className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_40px_#22c55e]"
                >
                  <LockOpen size={48} className="text-white animate-pulse" />
                </motion.div>

                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-green-500 rounded-full blur-3xl opacity-20"
                />
              </div>

              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
                  Niveau Débloqué
                </h2>
                <p className="text-green-400 font-bold text-[10px] tracking-[0.4em] uppercase mt-4 italic">
                  Secteur {parseInt(exerciseId) + 1} désormais accessible.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full py-6 border-y border-white/10">
                <div className="text-center border-r border-white/10">
                  <p className="text-[8px] text-slate-500 font-black uppercase mb-1">
                    XP Bonus Total
                  </p>
                  <p className="text-2xl font-black text-yellow-400">+250</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] text-slate-500 font-black uppercase mb-1">
                    Niveau
                  </p>
                  <p className="text-2xl font-black text-white">
                    {parseInt(exerciseId) + 1}
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push("/map")}
                className="w-full py-5 bg-green-500 text-black text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 group hover:bg-green-400 transition-colors"
              >
                Retourner à la Map{" "}
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
