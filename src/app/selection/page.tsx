"use client"

import { motion } from "framer-motion"
import {
  Bot,
  Database,
  Layout,
  Palette,
  Terminal,
  Zap,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

const MISSIONS = [
  {
    id: "html",
    label: "HTML-01",
    title: "Structure",
    description: "Architecture de base et balisage sémantique du noyau.",
    icon: Layout,
    color: "#22d3ee", // Cyan pour matcher la Map
  },
  {
    id: "css",
    label: "CSS-02",
    title: "Interface",
    description: "Design visuel et protocoles de style de surface.",
    icon: Palette,
    color: "#a855f7", // Violet pour matcher la Map
  },
  {
    id: "javascript",
    label: "JS-03",
    title: "Protocoles",
    description: "Logique dynamique et synchronisation des données.",
    icon: Zap,
    color: "#f59e0b", // Orange pour matcher la Map
  },
  {
    id: "php",
    label: "PHP-04",
    title: "Serveur",
    description: "Gestion des archives et traitement côté moteur.",
    icon: Database,
    color: "#f43f5e", // Rose/Rouge pour matcher la Map
  },
]

export default function SelectionPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>("")
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  useEffect(() => {
    const loadUserIdentity = async () => {
      const userId = localStorage.getItem("userId")
      const storedName = localStorage.getItem("userName")

      if (!userId) {
        router.push("/login")
        return
      }

      console.log("🛠 Debug Identité :", { userId, storedName })

      // 2. Si le nom est déjà en cache local, on l'utilise
      if (storedName) {
        setUserName(storedName.toUpperCase())
        setIsLoadingUser(false)
        return
      }

      // 3. Sinon, on effectue une synchronisation orbitale (Fetch API)
      try {
        const res = await fetch(`/api/user/profile?userId=${userId}`)
        const data = await res.json()

        if (data.user && data.user.name) {
          const name = data.user.name.toUpperCase()
          setUserName(name)
          localStorage.setItem("userName", data.user.name) // Mise en cache pour fluidité
        }
      } catch (err) {
        console.error("Échec de liaison cockpit :", err)
      } finally {
        setIsLoadingUser(false)
      }
    }

    loadUserIdentity()
  }, [router])

  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col font-sans overflow-hidden relative">
      {/* ── AMBIENT BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      {/* ── HEADER HUD ── */}
      <nav className="relative z-10 w-full h-16 flex items-center justify-between px-8 border-b border-cyan-500/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-cyan-400/30 shadow-[0_0_10px_#22d3ee44]">
            <Image
              src="/logo.png"
              alt="Nexora"
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <span className="font-black tracking-tighter uppercase text-sm">
            Nexora IA
          </span>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-emerald-500/80">Pare-feu Actif</span>
          </div>
          <div className="flex items-center gap-2 border-l border-white/5 pl-6">
            <Cpu size={14} className="text-cyan-500" />
            <span className="text-cyan-500/80">IA Optimisée</span>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 max-w-7xl mx-auto w-full">
        {/* Title Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6"
          >
            {isLoadingUser ? (
              <Loader2 size={14} className="text-cyan-400 animate-spin" />
            ) : (
              <Bot size={14} className="text-cyan-400 animate-pulse" />
            )}
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400">
              {isLoadingUser
                ? "Synchronisation HUD..."
                : `Pilote ${userName} identifié`}
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">
            Sélecteur de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              Mission
            </span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4">
            Choisissez un secteur d'opération pour commencer l'entraînement
          </p>
        </div>

        {/* Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {MISSIONS.map((mission, index) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              onClick={() => router.push(`/map?domain=${mission.id}`)}
              className="group relative cursor-pointer"
            >
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md rounded-3xl border border-white/5 transition-all group-hover:border-white/20 z-10" />

              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl z-0"
                style={{ backgroundColor: mission.color }}
              />

              <div className="relative z-20 p-8 flex flex-col h-full min-h-[340px]">
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[10px] font-black text-slate-500 group-hover:text-white transition-colors tracking-widest">
                    {mission.label}
                  </span>
                  <div
                    className="p-3 rounded-2xl bg-white/5 border border-white/5 transition-all group-hover:scale-110"
                    style={{
                      color: mission.color,
                      boxShadow: `0 0 15px ${mission.color}22`,
                    }}
                  >
                    <mission.icon size={28} />
                  </div>
                </div>

                <div className="mt-auto">
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-cyan-400 transition-colors">
                    {mission.title}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed mb-6">
                    {mission.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden mr-4">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: mission.color }}
                        initial={{ width: "20%" }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-20 w-full flex justify-between items-center px-4 opacity-30">
          <div className="text-[8px] font-black uppercase tracking-[0.5em]">
            Nexora Operating System v2.6
          </div>
          <div className="h-[1px] flex-1 mx-10 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          <div className="text-[8px] font-black uppercase tracking-[0.5em]">
            Synchronisation Orbitale Active
          </div>
        </div>
      </main>
    </div>
  )
}
