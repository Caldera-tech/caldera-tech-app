"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  Bot,
  ChevronRight,
  Flame,
  Loader2,
  Lock,
  LogOut,
  Play,
  Star,
} from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

// --- Radar Chart Component ---
function RadarChart({ skills }: { skills: any[] }) {
  const size = 220
  const cx = size / 2
  const cy = size / 2
  const r = 80
  const n = skills.length
  const getPoint = (i: number, radius: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  }
  const polygonPoints = skills
    .map((s, i) => {
      const pt = getPoint(i, r * Math.max(s.value, 0.05))
      return `${pt.x},${pt.y}`
    })
    .join(" ")
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible"
    >
      {[0.25, 0.5, 0.75, 1].map((l) => (
        <polygon
          key={l}
          points={Array.from({ length: n }, (_, i) => {
            const pt = getPoint(i, r * l)
            return `${pt.x},${pt.y}`
          }).join(" ")}
          fill="none"
          stroke="rgba(34,211,238,0.12)"
        />
      ))}
      {skills.map((_, i) => {
        const pt = getPoint(i, r)
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={pt.x}
            y2={pt.y}
            stroke="rgba(34,211,238,0.15)"
          />
        )
      })}
      <motion.polygon
        points={polygonPoints}
        fill="rgba(34,211,238,0.12)"
        stroke="#22d3ee"
        strokeWidth="1.5"
        filter="url(#glow)"
      />
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {skills.map((s, i) => {
        const pt = getPoint(i, r * Math.max(s.value, 0.05))
        return (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={4}
            fill="#22d3ee"
            filter="url(#glow)"
          />
        )
      })}
      {skills.map((s, i) => {
        const pt = getPoint(i, r + 22)
        return (
          <text
            key={i}
            x={pt.x}
            y={pt.y}
            textAnchor="middle"
            fontSize="8"
            fontWeight="700"
            fill="rgba(148,163,184,0.9)"
          >
            {s.label.toUpperCase()}
          </text>
        )
      })}
    </svg>
  )
}

// --- Neon Path SVG ---
function NeonPath({
  levels,
  currentStep,
}: {
  levels: any[]
  currentStep: number
}) {
  // On ne trace le chemin que jusqu'au niveau actuel
  const activePoints = levels.slice(0, currentStep).map((lvl) => ({
    x: parseFloat(lvl.x),
    y: parseFloat(lvl.y),
  }))

  if (activePoints.length < 2) return null

  // Génération d'une courbe lisse (Bézier) entre les points
  let pathData = `M ${activePoints[0].x} ${activePoints[0].y}`

  for (let i = 1; i < activePoints.length; i++) {
    const prev = activePoints[i - 1]
    const curr = activePoints[i]
    // On crée un point de contrôle pour arrondir la courbe
    const cp1x = prev.x + (curr.x - prev.x) / 2
    pathData += ` C ${cp1x} ${prev.y}, ${cp1x} ${curr.y}, ${curr.x} ${curr.y}`
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    >
      <defs>
        <filter id="neonBlur">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>

      {/* Halo lumineux (Glow) */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="1.5"
        strokeOpacity="0.2"
        filter="url(#neonBlur)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Trait pointillé principal */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="url(#pathGrad)"
        strokeWidth="0.5"
        strokeDasharray="1 1"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  )
}

// --- Level Node ---
function LevelNode({ lvl, onClick }: { lvl: any; onClick: () => void }) {
  const isAvailable = lvl.status === "available"
  const isCompleted = lvl.status === "completed"
  const glowColor =
    lvl.id === 5 ? "#f43f5e" : lvl.id >= 3 ? "#a855f7" : "#22d3ee"
  return (
    <div
      className="absolute"
      style={{ left: lvl.x, top: lvl.y, transform: "translate(-50%, -50%)" }}
    >
      <div className="flex flex-col items-center gap-3">
        {isAvailable && (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 80,
              height: 80,
              background: `radial-gradient(circle, ${glowColor}33 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}
        <motion.button
          onClick={isAvailable ? onClick : undefined}
          whileHover={isAvailable ? { scale: 1.12 } : {}}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${isCompleted ? "bg-emerald-900/60 border-emerald-400 shadow-[0_0_20px_#10b98155]" : isAvailable ? "bg-slate-900 cursor-pointer" : "bg-slate-950 border-slate-800 opacity-40"}`}
          style={
            isAvailable
              ? { borderColor: glowColor, boxShadow: `0 0 20px ${glowColor}55` }
              : {}
          }
        >
          {isAvailable && (
            <motion.div
              className="absolute inset-1 rounded-full border"
              style={{ borderColor: `${glowColor}44` }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          )}
          {isCompleted ? (
            <span className="text-emerald-400 font-black text-lg">✓</span>
          ) : isAvailable ? (
            <span className="font-black text-xl" style={{ color: glowColor }}>
              {lvl.id}
            </span>
          ) : (
            <Lock size={18} className="text-slate-600" />
          )}
        </motion.button>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: isAvailable ? 1 : 0.3, y: 0 }}
            className="rounded-xl p-2 min-w-[120px] border backdrop-blur-sm"
            style={{
              background: isAvailable
                ? `linear-gradient(135deg, #0f172a 0%, #0a0f1e 100%)`
                : "rgba(0,0,0,0.3)",
              borderColor: isAvailable
                ? `${glowColor}33`
                : "rgba(255,255,255,0.05)",
            }}
          >
            <p
              className="text-[8px] font-black uppercase mb-1"
              style={{ color: isAvailable ? glowColor : "#475569" }}
            >
              {lvl.label}
            </p>
            {lvl.info.map((item: string) => (
              <p
                key={item}
                className="text-[7px] text-slate-400 flex items-center gap-1 font-bold"
              >
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: isAvailable ? glowColor : "#334155" }}
                />
                {item.toUpperCase()}
              </p>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function MapPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentDomain = searchParams.get("domain") || "javascript"
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      router.push("/login")
      return
    }
    try {
      const res = await fetch(
        `/api/user/profile?userId=${userId}&t=${Date.now()}`,
        {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        },
      )
      const data = await res.json()
      if (data.user) setUserData(data.user)
    } catch (err) {
      console.error("Erreur cockpit")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchProfile()
    const handleReSync = () => {
      if (document.visibilityState === "visible") fetchProfile()
    }
    window.addEventListener("visibilitychange", handleReSync)
    window.addEventListener("focus", fetchProfile)
    return () => {
      window.removeEventListener("visibilitychange", handleReSync)
      window.removeEventListener("focus", fetchProfile)
    }
  }, [fetchProfile])

  const handleLogout = () => {
    localStorage.removeItem("userId")
    router.push("/login")
  }

  if (loading)
    return (
      <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-cyan-400 w-12 h-12" />
        <p className="text-cyan-400 font-black text-[10px] uppercase tracking-widest animate-pulse">
          Synchronisation HUD...
        </p>
      </div>
    )

  const currentStep = userData?.progress?.currentStep || 1
  const levels = [
    {
      id: 1,
      label: "Les Bases",
      x: "12%",
      y: "75%",
      info: ["Variables", "Types", "Affichage"],
    },
    {
      id: 2,
      label: "Fondations",
      x: "28%",
      y: "55%",
      info: ["Boucles", "Conditions"],
    },
    { id: 3, label: "DOM", x: "47%", y: "35%", info: ["Sélecteurs", "Events"] },
    {
      id: 4,
      label: "Avancé",
      x: "67%",
      y: "48%",
      info: ["Fonctions", "Tableaux"],
    },
    { id: 5, label: "Boss", x: "85%", y: "28%", info: ["Projet final"] },
  ].map((lvl) => ({
    ...lvl,
    status:
      lvl.id < currentStep
        ? "completed"
        : lvl.id === currentStep
          ? "available"
          : "locked",
  }))

  const radarSkills = [
    {
      label: "HTML",
      value: Math.min((userData?.progress?.score || 0) / 500, 1) * 0.9 + 0.1,
    },
    { label: "CSS", value: currentStep >= 2 ? 0.5 : 0.1 },
    { label: "JS", value: currentStep >= 3 ? 0.6 : 0.15 },
    { label: "DOM", value: currentStep >= 3 ? 0.4 : 0.05 },
    { label: "PHP", value: currentStep >= 5 ? 0.3 : 0.05 },
    { label: "API", value: 0.05 },
  ]

  return (
    <div className="min-h-screen w-full bg-[#050810] text-white flex flex-col overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <nav className="relative z-10 h-16 flex items-center justify-between px-6 border-b border-cyan-500/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-cyan-400/30 overflow-hidden">
              <Image
                src="/logo.png"
                alt="Nexora"
                width={36}
                height={36}
                priority
              />
            </div>
            <span className="font-black uppercase text-base">Nexora IA</span>
          </div>
          <div className="hidden sm:flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span className="text-cyan-400 cursor-pointer">Carte</span>
            <span
              className="hover:text-white cursor-pointer"
              onClick={() => router.push("/selection")}
            >
              Missions
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Flame size={13} className="text-orange-500" />
              <span className="text-[10px] font-bold">7 JOURS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star size={13} className="text-yellow-400" />
              <span className="text-[10px] font-bold text-yellow-400">
                {userData?.progress?.score || 0} XP
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:text-red-400 transition-all"
          >
            <LogOut size={16} />
          </button>
          <div className="w-9 h-9 rounded-full border-2 border-cyan-500 flex items-center justify-center font-black text-sm bg-cyan-500/10 text-cyan-400">
            {userData?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>
      <div
        className="relative z-10 flex flex-1 gap-4 p-4 overflow-hidden"
        style={{ height: "calc(100vh - 64px)" }}
      >
        <div className="flex-[3] relative rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-sm shadow-2xl">
          <div className="absolute top-5 left-5 z-20 flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
              <Bot className="text-cyan-400 w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase">
                Apprendre le{" "}
                <span className="text-cyan-400">
                  {currentDomain.toUpperCase()}
                </span>
              </h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                {userData?.name} — synchronisé
              </p>
            </div>
          </div>
          <NeonPath levels={levels} />
          <div className="absolute inset-0 z-10">
            {levels.map((lvl) => (
              <LevelNode
                key={lvl.id}
                lvl={lvl}
                onClick={() =>
                  router.push(`/quiz/${lvl.id}?domain=${currentDomain}`)
                }
              />
            ))}
          </div>
          <motion.button
            className="absolute bottom-5 left-5 btn-cyber py-3 px-6 text-[10px] font-black flex items-center gap-2 z-20 shadow-[0_0_20px_rgba(34,211,238,0.3)] bg-cyan-500 text-black rounded-lg"
            whileHover={{ scale: 1.03 }}
            onClick={() =>
              router.push(`/quiz/${currentStep}?domain=${currentDomain}`)
            }
          >
            <Play fill="currentColor" size={12} />
            REPRENDRE LA QUÊTE
            <ChevronRight size={12} />
          </motion.button>
        </div>
        <div
          className="flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar"
          style={{ minWidth: 260 }}
        >
          <div className="rounded-2xl border border-white/5 bg-slate-950/60 backdrop-blur-sm p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full border-2 border-pink-500 flex items-center justify-center font-black text-sm bg-pink-500/10 text-pink-400">
                {userData?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-black uppercase italic">
                  {userData?.name || "Pilote"}
                </p>
                <p className="text-[9px] text-pink-400 font-bold uppercase tracking-widest">
                  Niveau {currentStep}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-3">
                Radar de Compétences
              </p>
              <RadarChart skills={radarSkills} />
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-950/60 backdrop-blur-sm p-5 space-y-3 shadow-lg">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              Missions — {currentDomain.toUpperCase()}
            </h3>
            {levels.map((lvl) => (
              <div
                key={lvl.id}
                className="flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer group"
                style={{
                  borderColor:
                    lvl.status === "completed"
                      ? "rgba(16,185,129,0.2)"
                      : lvl.status === "available"
                        ? "rgba(34,211,238,0.15)"
                        : "rgba(255,255,255,0.04)",
                  background:
                    lvl.status === "completed"
                      ? "rgba(16,185,129,0.05)"
                      : "transparent",
                }}
                onClick={() =>
                  lvl.status === "available" &&
                  router.push(`/quiz/${lvl.id}?domain=${currentDomain}`)
                }
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black border"
                  style={{
                    borderColor:
                      lvl.status === "completed"
                        ? "#10b981"
                        : lvl.status === "available"
                          ? "#22d3ee"
                          : "#334155",
                    color:
                      lvl.status === "completed"
                        ? "#10b981"
                        : lvl.status === "available"
                          ? "#22d3ee"
                          : "#475569",
                  }}
                >
                  {lvl.status === "completed" ? "✓" : lvl.id}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-[9px] font-black uppercase ${lvl.status === "locked" ? "text-slate-700" : "text-slate-300"}`}
                  >
                    {lvl.label.toUpperCase()}
                  </p>
                </div>
                {lvl.status === "available" && (
                  <ChevronRight
                    size={12}
                    className="text-cyan-400 animate-pulse"
                  />
                )}
                {lvl.status === "locked" && (
                  <Lock size={10} className="text-slate-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
