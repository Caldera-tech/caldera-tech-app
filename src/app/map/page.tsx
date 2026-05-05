"use client"

import { motion } from "framer-motion"
import { Award, Bot, Flame, Loader2, Lock, Play, Star, Zap } from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function MapPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Récupération du domaine via l'URL (ex: /map?domain=javascript)
  const currentDomain = searchParams.get("domain") || "javascript"

  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 1. Chargement des données réelles du pilote
  useEffect(() => {
    async function fetchProfile() {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        router.push("/login")
        return
      }

      try {
        const res = await fetch(`/api/user/profile?userId=${userId}`)
        const data = await res.json()
        if (data.user) setUserData(data.user)
      } catch (err) {
        console.error("Erreur de synchronisation cockpit")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [router])

  if (loading)
    return (
      <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-cyan-400 w-12 h-12" />
        <p className="text-cyan-400 font-black text-[10px] tracking-[0.3em] uppercase">
          Initialisation du HUD...
        </p>
      </div>
    )

  const levels = [
    {
      id: 1,
      label: "Les Bases",
      x: "10%",
      y: "70%",
      color: "#22d3ee",
      info: ["Variables", "Types", "Affichage"],
    },
    {
      id: 2,
      label: "Fondations",
      x: "25%",
      y: "50%",
      color: "#22d3ee",
      info: ["Boucles", "Conditions"],
    },
    {
      id: 3,
      label: "DOM",
      x: "45%",
      y: "30%",
      color: "#8b5cf6",
      info: ["Sélecteurs", "Events"],
    },
    {
      id: 4,
      label: "Avancé",
      x: "65%",
      y: "45%",
      color: "#8b5cf6",
      info: ["Fonctions", "Tableaux"],
    },
    {
      id: 5,
      label: "Boss",
      x: "85%",
      y: "25%",
      color: "#f43f5e",
      info: ["Projet final"],
    },
  ].map((lvl) => ({
    ...lvl,
    status:
      lvl.id <= (userData?.progress?.currentStep || 1) ? "available" : "locked",
  }))

  return (
    <div className="min-h-screen w-full bg-[#050810] text-white flex flex-col p-4 font-sans gap-4">
      <nav className="w-full h-16 glass-panel flex items-center justify-between px-3 sm:px-8 border-b border-cyan-500/20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-[0_0_15px_#22d3ee] border border-cyan-400/30">
              <Image
                src="/logo.png"
                alt="Nexora logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="font-black tracking-tighter uppercase text-sm sm:text-xl">
              Nexora IA
            </span>
          </div>
          <div className="hidden sm:flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span className="text-cyan-400 cursor-pointer">Carte</span>
            <span
              className="hover:text-white cursor-pointer"
              onClick={() => router.push("/selection")}
            >
              Missions
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] font-black text-cyan-400">
              {userData?.name?.toUpperCase() || "CADET UNKNOWN"}
            </span>
            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">
              {currentDomain.toUpperCase()} SECTOR
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Flame size={14} className="text-orange-500" />
            <span className="text-[10px] font-bold">7 JOURS</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Star size={14} className="text-yellow-400" />
            <span className="text-[10px] font-bold">
              {userData?.progress?.score || 0} XP
            </span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-cyan-500 overflow-hidden bg-slate-800 flex items-center justify-center font-black">
            {userData?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:flex-3 glass-panel relative overflow-hidden bg-slate-950/20 border border-white/5 min-h-95">
          <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <Bot className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase leading-none">
                Apprendre le {currentDomain}
              </h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                Cadet {userData?.name}, votre progression est synchronisée.
              </p>
            </div>
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <path
              d="M 100 600 Q 250 500 450 300 T 800 200"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="10 10"
            />
          </svg>

          {levels.map((lvl) => (
            <div
              key={lvl.id}
              className="absolute group"
              style={{ left: lvl.x, top: lvl.y }}
              onClick={() =>
                lvl.status === "available" &&
                router.push(`/quiz/${lvl.id}?domain=${currentDomain}`)
              }
            >
              <div className="flex flex-col items-center cursor-pointer">
                <motion.div
                  whileHover={lvl.status === "available" ? { scale: 1.1 } : {}}
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-300 relative z-10 ${
                    lvl.status === "available"
                      ? "bg-slate-900 border-cyan-500 shadow-[0_0_20px_#22d3ee55]"
                      : "bg-slate-950 border-slate-800 text-slate-700 grayscale"
                  }`}
                >
                  {lvl.status === "available" ? (
                    <span className="text-xl font-black">{lvl.id}</span>
                  ) : (
                    <Lock size={18} />
                  )}
                </motion.div>

                <div
                  className={`mt-4 glass-panel p-2 min-w-[120px] transition-opacity duration-300 ${
                    lvl.status === "available"
                      ? "bg-[#0f172a]/80 border-cyan-500/20 opacity-100"
                      : "bg-black/40 border-white/5 opacity-40"
                  }`}
                >
                  <p
                    className={`text-[8px] font-black uppercase mb-1 ${lvl.status === "available" ? "text-cyan-400" : "text-slate-600"}`}
                  >
                    {lvl.label}
                  </p>
                  {lvl.info.map((i) => (
                    <p
                      key={i}
                      className="text-[7px] text-slate-400 flex items-center gap-1 font-bold"
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${lvl.status === "available" ? "bg-cyan-500" : "bg-slate-800"}`}
                      />{" "}
                      {i.toUpperCase()}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button className="absolute bottom-6 left-6 btn-cyber py-3 px-8 text-[10px] font-black flex items-center gap-2">
            <Play fill="currentColor" size={12} /> REPRENDRE LA QUÊTE
          </button>
        </div>

        <div className="w-full lg:flex-1 flex flex-col gap-4">
          <div className="glass-panel p-6 bg-slate-900/40 border border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full border-2 border-pink-500 p-1 flex items-center justify-center font-black bg-slate-800">
                {userData?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xs font-black uppercase italic">
                  {userData?.name || "Cadet"}
                </h2>
                <p className="text-[9px] text-pink-400 font-bold uppercase tracking-widest">
                  Niveau {userData?.progress?.currentStep || 1} Pilote
                </p>
              </div>
            </div>

            <div className="aspect-square w-full bg-white/5 rounded-full flex flex-col items-center justify-center border border-white/5 relative p-4 text-center">
              <Zap className="text-cyan-400 w-8 h-8 mb-2 opacity-50" />
              <span className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">
                Radar de Compétences Spatiales
              </span>
              <div className="absolute inset-4 border border-cyan-500/10 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              Missions Secteur {currentDomain}
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-white/2 rounded-lg border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[9px] font-bold text-slate-300">
                    Progression du Secteur
                  </p>
                  <span className="text-[8px] text-cyan-400">
                    {((userData?.progress?.currentStep || 1) / 5) * 100}%
                  </span>
                </div>
                <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((userData?.progress?.currentStep || 1) / 5) * 100}%`,
                    }}
                    className="h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 mt-auto">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">
              Insignes Débloqués
            </h3>
            <div className="flex justify-around">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 ${i === 1 ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 grayscale opacity-50"}`}
                >
                  <Award size={16} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
