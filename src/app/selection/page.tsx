"use client"

import { motion } from "framer-motion"
import { Bot, Database, Layout, Palette, Terminal, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const MISSIONS = [
  {
    id: "html",
    label: "HTML-01",
    title: "Structure",
    icon: Layout,
    color: "#f97316",
  },
  {
    id: "css",
    label: "CSS-02",
    title: "Interface",
    icon: Palette,
    color: "#3b82f6",
  },
  {
    id: "javascript",
    label: "JS-03",
    title: "Protocoles",
    icon: Zap,
    color: "#eab308",
  },
  {
    id: "php",
    label: "PHP-04",
    title: "Serveur",
    icon: Database,
    color: "#6366f1",
  },
]

export default function SelectionPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    const loadUserIdentity = () => {
      // 1. Vérification PRIORITAIRE dans le localStorage
      const storedName = localStorage.getItem("userName")
      const userId = localStorage.getItem("userId")

      console.log("🛠 Debug Identité :", { userId, storedName })

      if (storedName) {
        setUserName(storedName.toUpperCase())
      } else if (userId) {
        // 2. Si on a l'ID mais pas le nom, on tente un fetch rapide
        fetch(`/api/user/profile?userId=${userId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.name) {
              setUserName(data.name.toUpperCase())
              localStorage.setItem("userName", data.name) // On le sauve pour la prochaine fois
            }
          })
          .catch((err) => console.error("Erreur Fetch Nom:", err))
      }
    }

    loadUserIdentity()
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-white">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="flex justify-between items-end mb-12 px-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-4">
              <Terminal className="text-cyan-400 w-8 h-8" />
              Sélecteur de Mission
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-2">
              Identification :{" "}
              <span className="text-cyan-400">PILOTE {userName}</span> //
              Choisissez un secteur d'opération
            </p>
          </div>
          <Bot className="w-10 h-10 text-cyan-500/50 animate-pulse hidden md:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[60vh]">
          {MISSIONS.map((mission, index) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(`/map?domain=${mission.id}`)}
              className="group relative cursor-pointer"
            >
              <div className="h-full glass-panel relative overflow-hidden flex flex-col items-center justify-between p-8 border-b-4 border-white/5 group-hover:border-white transition-all">
                <span className="text-[10px] font-black text-slate-500 group-hover:text-white tracking-[0.3em]">
                  {mission.label}
                </span>
                <mission.icon
                  size={64}
                  style={{ color: mission.color }}
                  className="group-hover:scale-110 transition-transform"
                />
                <div className="text-center w-full">
                  <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">
                    {mission.title}
                  </h2>
                  <div className="h-0.5 w-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full w-1/3 group-hover:w-full transition-all duration-700"
                      style={{ backgroundColor: mission.color }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-between items-center text-[8px] font-black text-slate-700 uppercase tracking-[0.5em]">
          <div className="flex gap-4">
            <span className="text-green-500">Pare-feu actif</span>
            <span className="text-cyan-500">Moteur IA Optimisé</span>
          </div>
          <span>Nexora OS v.2.6</span>
        </div>
      </div>
    </div>
  )
}
