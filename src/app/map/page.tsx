"use client"

import { motion } from "framer-motion"
import { Loader2, LogOut, Play, Star } from "lucide-react"
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
      <motion.polygon
        points={polygonPoints}
        fill="rgba(34,211,238,0.12)"
        stroke="#22d3ee"
        strokeWidth="1.5"
      />
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
function NeonPath({ levels, currentStep }: { levels: any[]; currentStep: number }) {
  // On trace jusqu'au niveau actuel
  const displayCount = Math.min(currentStep, levels.length);
  const activePoints = levels.slice(0, displayCount).map((lvl) => ({
    x: parseFloat(lvl.x),
    y: parseFloat(lvl.y),
  }));

  if (activePoints.length < 2) return null;

  let pathData = `M ${activePoints[0].x} ${activePoints[0].y}`;
  for (let i = 1; i < activePoints.length; i++) {
    const prev = activePoints[i - 1];
    const curr = activePoints[i];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    pathData += ` C ${cp1x} ${prev.y}, ${cp1x} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    >
      <defs>
        {/* Filtre de lueur intense */}
        <filter id="ultraGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Dégradé de la route (Cyan vers Violet/Rose) */}
        <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>

      {/* 1. Couche de fond : Ombre portée large pour donner de la profondeur */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="3"
        strokeOpacity="0.1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5 }}
      />

      {/* 2. Le Halo Extérieur (Glow) */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="url(#neonGradient)"
        strokeWidth="1.8"
        strokeOpacity="0.4"
        filter="url(#ultraGlow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* 3. Le Trait Central (Cœur lumineux) */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="url(#neonGradient)"
        strokeWidth="0.8"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* 4. Petits filets de lumière (Effet "cinématique") */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="#fff"
        strokeWidth="0.2"
        strokeDasharray="0.5 10"
        strokeOpacity="0.8"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
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
            className="absolute w-16 h-16 rounded-full"
            style={{
              background: `radial-gradient(circle, ${glowColor}44 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <motion.button
          onClick={isAvailable ? onClick : undefined}
          whileHover={isAvailable ? { scale: 1.1 } : {}}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
            isCompleted
              ? "bg-emerald-900/40 border-emerald-400 shadow-[0_0_15px_#10b98144]"
              : isAvailable
                ? "bg-slate-900 border-cyan-400 shadow-[0_0_15px_#22d3ee44] cursor-pointer"
                : "bg-slate-950 border-slate-800 opacity-40"
          }`}
        >
          {isCompleted ? (
            <span className="text-emerald-400 font-black text-lg">✓</span>
          ) : (
            <span
              className="font-black text-lg"
              style={{ color: isAvailable ? glowColor : "#475569" }}
            >
              {lvl.id}
            </span>
          )}
        </motion.button>
        <div
          className={`text-[8px] font-black uppercase tracking-tighter ${isAvailable ? "text-white" : "text-slate-600"}`}
        >
          {lvl.label}
        </div>
      </div>
    </div>
  )
}

export default function MapPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentDomain = searchParams.get("domain") || "html"

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
        `/api/user/profile?userId=${userId}&domain=${currentDomain.toLowerCase()}&t=${Date.now()}`,
        {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        },
      )
      const data = await res.json()
      if (data.user) {
        setUserData(data.user)
      }
    } catch (err) {
      console.error("Erreur synchronisation profil")
    } finally {
      setLoading(false)
    }
  }, [router, currentDomain])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
  }

  if (loading)
    return (
      <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-cyan-400 w-12 h-12" />
        <p className="text-cyan-400 font-black text-[10px] uppercase tracking-[0.3em]">
          Initialisation Flux...
        </p>
      </div>
    )


  const currentStep = userData?.progress?.currentStep || 1
  const totalXP = userData?.xp || 0

  const levels = [
    { id: 1, label: "Les Bases", x: "15%", y: "70%" },
    { id: 2, label: "Fondations", x: "32%", y: "52%" },
    { id: 3, label: "Architecture", x: "50%", y: "42%" },
    { id: 4, label: "Avancé", x: "68%", y: "58%" },
    { id: 5, label: "Expert", x: "85%", y: "35%" },
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
      value: currentDomain === "html" ? Math.min(totalXP / 1000 + 0.1, 1) : 0.1,
    },
    {
      label: "CSS",
      value: currentDomain === "css" ? Math.min(totalXP / 1000 + 0.1, 1) : 0.1,
    },
    {
      label: "JS",
      value:
        currentDomain === "javascript"
          ? Math.min(totalXP / 1000 + 0.1, 1)
          : 0.1,
    },
    { label: "PHP", value: 0.1 },
    { label: "UX", value: 0.2 },
    { label: "GIT", value: 0.15 },
  ]

  return (
    <div className="min-h-screen w-full bg-[#050810] text-white flex flex-col overflow-hidden font-sans">
      {/* Grille de fond dynamique */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #22d3ee 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <nav className="relative z-10 h-16 flex items-center justify-between px-8 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <span className="font-black uppercase text-lg tracking-tighter italic">
              Nexora <span className="text-cyan-400">Hub</span>
            </span>
          </div>
          <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="text-cyan-400">
              Secteur: {currentDomain.toUpperCase()}
            </span>
            <button
              onClick={() => router.push("/selection")}
              className="text-slate-500 hover:text-white transition-colors"
            >
              Changer de Module
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[11px] font-black text-yellow-400">
              {totalXP} XP TOTAL
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
          </button>
          <div className="w-9 h-9 rounded-full border-2 border-cyan-500 flex items-center justify-center font-black text-sm bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_#22d3ee44]">
            {userData?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      <div
        className="relative z-10 flex flex-1 gap-6 p-6 overflow-hidden"
        style={{ height: "calc(100vh - 64px)" }}
      >
        {/* ZONE DE CARTE */}
        <div className="flex-[3] relative rounded-[2.5rem] border border-white/5 bg-slate-950/40 backdrop-blur-md shadow-2xl overflow-hidden">
          <div className="absolute top-10 left-10 z-20">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-2">
              Système{" "}
              <span className="text-cyan-400">
                {currentDomain.toUpperCase()}
              </span>
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
                Niveau d'accréditation : {currentStep} / 5
              </p>
            </div>
          </div>

          <NeonPath levels={levels} currentStep={currentStep} />

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
            className="absolute bottom-10 left-10 py-5 px-10 text-[11px] font-black flex items-center gap-3 z-20 bg-cyan-500 text-black rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.3)] hover:bg-cyan-400 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              router.push(`/quiz/${currentStep}?domain=${currentDomain}`)
            }
          >
            <Play fill="currentColor" size={14} />
            SYNCHRONISER SÉQUENCE {currentStep}
          </motion.button>
        </div>

        <div className="flex-1 flex flex-col gap-6 min-w-[320px]">
          <div className="rounded-[2.5rem] border border-white/5 bg-slate-950/60 p-8 flex flex-col items-center shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 italic">
              Analyse Synaptique
            </p>
            <RadarChart skills={radarSkills} />
          </div>

          <div className="rounded-[2.5rem] border border-white/5 bg-slate-950/60 p-8 flex-1 overflow-y-auto no-scrollbar shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">
              Objectifs Prioritaires
            </h3>
            <div className="space-y-3">
              {levels.map((lvl) => (
                <div
                  key={lvl.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    lvl.status === "locked"
                      ? "opacity-20 border-white/5"
                      : lvl.status === "completed"
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-cyan-500/30 bg-cyan-500/5 shadow-inner"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black ${
                      lvl.status === "completed"
                        ? "bg-emerald-500 text-black"
                        : "bg-slate-800 text-cyan-400 border border-cyan-500/30"
                    }`}
                  >
                    {lvl.status === "completed" ? "✓" : lvl.id}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-tighter">
                    {lvl.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
