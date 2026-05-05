"use client"

import { motion } from "framer-motion"
import { Bot, CheckCircle2, ChevronLeft, Loader2, Terminal } from "lucide-react"
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

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain,
            level: exerciseId,
            type: "drag-drop",
          }),
        })
        const data = await res.json()

        // --- PROTECTION CONTRE LES UNDEFINED ---
        if (data && data.correctAnswers) {
          setExercise(data)
          setAvailableOptions(data.options || [])
          setPlacedItems(new Array(data.correctAnswers.length).fill(""))
        } else {
          console.error("Format de données invalide reçu de l'IA")
        }
      } catch (err) {
        console.error("Erreur de liaison LEO:", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [domain, exerciseId])

  const handleValidation = () => {
    if (!exercise?.correctAnswers) return
    const success =
      JSON.stringify(placedItems) === JSON.stringify(exercise.correctAnswers)
    setIsCorrect(success)
  }

  // Si on charge ou si l'exercice n'est pas encore prêt, on affiche le loader
  if (loading || !exercise)
    return (
      <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-cyan-400 w-10 h-10" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 italic font-sans">
          Initialisation de la mission...
        </p>
      </div>
    )

  return (
    <div className="min-h-screen bg-[#050810] text-white p-3 sm:p-6 flex flex-col gap-4 sm:gap-8 font-sans">
      {/* HEADER HUD */}
      <header className="flex justify-between items-center glass-panel p-3 sm:p-4 border-b-2 border-cyan-500/50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-sans">
              Secteur {domain.toUpperCase()} // Mission ID-{exerciseId}
            </h1>
            <p className="text-base sm:text-xl font-black uppercase tracking-tighter text-white font-sans">
              {exercise?.mission || "Chargement..."}
            </p>
          </div>
        </div>
        <Bot className="text-cyan-400 animate-pulse" />
      </header>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-8">
        {/* PANEL GAUCHE */}
        <div className="lg:col-span-3 glass-panel p-4 sm:p-6 bg-slate-900/40 border border-white/5 flex flex-col gap-6">
          <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 font-sans">
            <Terminal size={12} /> Objectifs du Scan
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-cyan-500/5 rounded border border-cyan-500/20 italic text-[11px] text-slate-300 font-sans">
              "Pilote, identifiez et placez les fragments pour restaurer le
              noyau."
            </div>
          </div>
        </div>

        {/* CENTRE : TEXTE À TROUS */}
        <div className="lg:col-span-9 flex flex-col gap-4 lg:gap-6">
          <div className="glass-panel p-4 sm:p-12 bg-ui-bg border-t border-white/10 relative overflow-y-auto">
            <div className="text-sm sm:text-lg font-mono leading-14 sm:leading-16 text-slate-300">
              {exercise?.textWithBlanks
                ?.split("[BLANK]")
                .map((part: string, i: number, arr: any[]) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <div
                        className={`inline-block w-24 sm:w-40 h-10 sm:h-12 mx-1 sm:mx-2 translate-y-3 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
                          placedItems[i]
                            ? "border-cyan-500 bg-cyan-500/10 shadow-[inset_0_0_10px_rgba(34,211,238,0.2)]"
                            : "border-slate-800 bg-black/40"
                        }`}
                        onClick={() => {
                          if (placedItems[i]) {
                            const newPlaced = [...placedItems]
                            setAvailableOptions([
                              ...availableOptions,
                              placedItems[i],
                            ])
                            newPlaced[i] = ""
                            setPlacedItems(newPlaced)
                          }
                        }}
                      >
                        {placedItems[i] && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full h-full flex items-center justify-center text-[10px] font-black text-cyan-400 tracking-widest font-sans"
                          >
                            {placedItems[i].toUpperCase()}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                ))}
            </div>
          </div>

          {/* SÉLECTEUR DE CARTES */}
          <div className="glass-panel p-6 bg-slate-900/40">
            <div className="flex flex-wrap gap-4">
              {availableOptions.map((opt) => (
                <motion.button
                  key={opt}
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
                    }
                  }}
                  className="px-6 py-3 border border-cyan-500/30 rounded bg-cyan-500/5 text-cyan-400 font-black text-[10px] tracking-widest uppercase font-sans"
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 pb-4">
            <button
              onClick={handleValidation}
              disabled={placedItems.includes("")}
              className="px-12 py-4 btn-cyber text-[10px] font-black uppercase flex items-center gap-2 disabled:opacity-30 font-sans"
            >
              <CheckCircle2 size={14} /> Valider la structure
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER INDICE IA */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8 sm:max-w-sm glass-panel p-4 border-l-4 border-cyan-500 bg-[#050810]/90 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <Bot className="text-cyan-400 shrink-0" />
          <div className="font-sans">
            <p className="text-[10px] font-black text-cyan-400 mb-1 uppercase">
              IA LEO : Indice
            </p>
            <p className="text-[10px] text-slate-400 italic leading-relaxed">
              "{exercise?.hint}"
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
