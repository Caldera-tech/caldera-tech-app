"use client"

import { motion } from "framer-motion"
import {
  Bot,
  Database,
  Layout,
  Palette,
  Shield,
  Terminal,
  Zap,
} from "lucide-react"
import { useRouter } from "next/navigation"

const MISSIONS = [
  {
    id: "html",
    label: "HTML-01",
    title: "Structure",
    icon: Layout,
    color: "#f97316",
    shadow: "shadow-orange-500/20",
  },
  {
    id: "css",
    label: "CSS-02",
    title: "Interface",
    icon: Palette,
    color: "#3b82f6",
    shadow: "shadow-blue-500/20",
  },
  {
    id: "javascript",
    label: "JS-03",
    title: "Protocoles",
    icon: Zap,
    color: "#eab308",
    shadow: "shadow-yellow-500/20",
  },
  {
    id: "php",
    label: "PHP-04",
    title: "Serveur",
    icon: Database,
    color: "#6366f1",
    shadow: "shadow-indigo-500/20",
  },
]

export default function SelectionPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-start py-8 p-4 relative font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="flex justify-between items-end mb-12 px-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white flex items-center gap-4">
              <Terminal className="text-cyan-400 w-8 h-8" />
              Sélecteur de Mission
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-2">
              Identification cadet confirmée // Choisissez un secteur
              d'opération
            </p>
          </div>
          <div className="hidden md:flex gap-4 items-center">
            <div className="text-right">
              <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">
                IA Nexora : Online
              </p>
              <p className="text-[8px] text-slate-600 uppercase font-bold">
                Signal stable 100%
              </p>
            </div>
            <Bot className="w-10 h-10 text-cyan-500/50 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {MISSIONS.map((mission, index) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, zIndex: 50 }}
              onClick={() => router.push(`/map?domain=${mission.id}`)}
              className="group relative cursor-pointer"
            >
              <div
                className={`absolute inset-0 rounded-2xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                style={{ backgroundColor: mission.color }}
              />

              <div
                className={`min-h-55 glass-panel relative overflow-hidden flex flex-col items-center justify-between p-8 border-b-4 transition-all duration-300 border-white/5 group-hover:border-[${mission.color}]`}
              >
                <span className="text-[10px] font-black text-slate-500 group-hover:text-white transition-colors tracking-[0.3em]">
                  {mission.label}
                </span>

                <div className="relative">
                  <mission.icon
                    size={64}
                    className="transition-all duration-500 transform group-hover:scale-125"
                    style={{ color: mission.color }}
                  />
                  <div
                    className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-50 transition-opacity"
                    style={{ backgroundColor: mission.color }}
                  />
                </div>

                <div className="text-center w-full">
                  <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 group-hover:neon-text transition-all">
                    {mission.title}
                  </h2>
                  <div className="h-0.5 w-full bg-white/5 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-current opacity-50"
                      style={{ backgroundColor: mission.color }}
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </div>
                  <p className="text-[9px] font-bold text-slate-600 mt-4 uppercase tracking-widest group-hover:text-white transition-colors">
                    Initialiser la séquence
                  </p>
                </div>

                <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20 group-hover:border-white/50" />
                <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/20 group-hover:border-white/50" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-between items-center px-4">
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-green-500" />
              <span className="text-[8px] font-black uppercase text-slate-500">
                Pare-feu actif
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-cyan-500" />
              <span className="text-[8px] font-black uppercase text-slate-500">
                Moteur IA Optimisé
              </span>
            </div>
          </div>
          <p className="text-[8px] font-black text-slate-700 tracking-[0.5em] uppercase">
            Nexora Operating System v.2.6
          </p>
        </div>
      </div>
    </div>
  )
}
