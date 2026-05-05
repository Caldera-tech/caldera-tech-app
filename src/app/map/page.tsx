"use client"

import { motion, useAnimation, AnimatePresence } from "framer-motion"
import {
  Award,
  Bot,
  Flame,
  Loader2,
  Lock,
  LogOut,
  Play,
  Star,
  Zap,
  ChevronRight,
} from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"

// ─── Radar SVG Component ────────────────────────────────────────────────────
function RadarChart({
  skills,
}: {
  skills: { label: string; value: number; color: string }[]
}) {
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

  const gridLevels = [0.25, 0.5, 0.75, 1]
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
      {/* Grid circles */}
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={Array.from({ length: n }, (_, i) => {
            const pt = getPoint(i, r * level)
            return `${pt.x},${pt.y}`
          }).join(" ")}
          fill="none"
          stroke="rgba(34,211,238,0.12)"
          strokeWidth="1"
        />
      ))}

      {/* Axes */}
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
            strokeWidth="1"
          />
        )
      })}

      {/* Data polygon */}
      <motion.polygon
        points={polygonPoints}
        fill="rgba(34,211,238,0.12)"
        stroke="#22d3ee"
        strokeWidth="1.5"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        filter="url(#glow)"
      />

      {/* Glow filter */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Data points */}
      {skills.map((s, i) => {
        const pt = getPoint(i, r * Math.max(s.value, 0.05))
        return (
          <motion.circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={4}
            fill="#22d3ee"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            filter="url(#glow)"
          />
        )
      })}

      {/* Labels */}
      {skills.map((s, i) => {
        const pt = getPoint(i, r + 22)
        return (
          <text
            key={i}
            x={pt.x}
            y={pt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8"
            fontWeight="700"
            letterSpacing="0.05em"
            fill="rgba(148,163,184,0.9)"
            style={{ fontFamily: "inherit" }}
          >
            {s.label.toUpperCase()}
          </text>
        )
      })}
    </svg>
  )
}

// ─── Neon Path SVG ──────────────────────────────────────────────────────────
function NeonPath({ levels }: { levels: any[] }) {
  const pathData = levels
    .map((lvl, i) => {
      const x = parseFloat(lvl.x) * 8
      const y = parseFloat(lvl.y) * 7
      return i === 0 ? `M ${x} ${y}` : `Q ${x - 60} ${y + 30} ${x} ${y}`
    })
    .join(" ")

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <filter id="neonBlur">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="pathGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Shadow glow path */}
      <motion.path
        d="M 80 560 C 160 480 280 380 360 260 S 520 180 680 200"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="8"
        strokeOpacity="0.15"
        strokeLinecap="round"
        filter="url(#neonBlur)"
      />
      {/* Main dashed path */}
      <motion.path
        d="M 80 560 C 160 480 280 380 360 260 S 520 180 680 200"
        fill="none"
        stroke="url(#pathGrad)"
        strokeWidth="2"
        strokeDasharray="12 8"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
    </svg>
  )
}

// ─── Level Node ──────────────────────────────────────────────────────────────
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
        {/* Glow ring behind node */}
        {isAvailable && (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 80,
              height: 80,
              background: `radial-gradient(circle, ${glowColor}33 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Node button */}
        <motion.button
          onClick={isAvailable ? onClick : undefined}
          whileHover={isAvailable ? { scale: 1.12 } : {}}
          whileTap={isAvailable ? { scale: 0.95 } : {}}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
            isCompleted
              ? "bg-emerald-900/60 border-emerald-400 shadow-[0_0_20px_#10b98155]"
              : isAvailable
                ? "bg-slate-900 cursor-pointer"
                : "bg-slate-950 border-slate-800 cursor-not-allowed opacity-40"
          }`}
          style={
            isAvailable
              ? {
                  borderColor: glowColor,
                  boxShadow: `0 0 20px ${glowColor}55, 0 0 40px ${glowColor}22, inset 0 0 20px ${glowColor}11`,
                }
              : {}
          }
        >
          {/* Inner ring animation */}
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

        {/* Info card */}
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
              boxShadow: isAvailable ? `0 4px 20px ${glowColor}11` : "none",
            }}
          >
            <p
              className="text-[8px] font-black uppercase mb-1 tracking-widest"
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
                  className="w-1 h-1 rounded-full inline-block"
                  style={{
                    background: isAvailable ? glowColor : "#334155",
                  }}
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

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function MapPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentDomain = searchParams.get("domain") || "javascript"
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    router.push("/login")
  }

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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="text-cyan-400 w-12 h-12" />
        </motion.div>
        <p className="text-cyan-400 font-black text-[10px] tracking-[0.3em] uppercase">
          Initialisation du HUD...
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

  // Radar data — based on progress
  const radarSkills = [
    {
      label: "HTML",
      value: Math.min((userData?.progress?.score || 0) / 500, 1) * 0.9 + 0.1,
      color: "#22d3ee",
    },
    { label: "CSS", value: currentStep >= 2 ? 0.5 : 0.1, color: "#a855f7" },
    { label: "JS", value: currentStep >= 3 ? 0.6 : 0.15, color: "#f59e0b" },
    { label: "DOM", value: currentStep >= 3 ? 0.4 : 0.05, color: "#10b981" },
    { label: "PHP", value: currentStep >= 5 ? 0.3 : 0.05, color: "#f43f5e" },
    { label: "API", value: 0.05, color: "#22d3ee" },
  ]

  const sectorProgress = Math.round((currentStep / 5) * 100)

  const domainLabels: Record<string, string> = {
    html: "Structure",
    css: "Interface",
    javascript: "Protocoles",
    php: "Serveur",
  }

  return (
    <div className="min-h-screen w-full bg-[#050810] text-white flex flex-col font-sans overflow-hidden">
      {/* ── Ambient background grid ── */}
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
        {/* Corner glows */}
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      {/* ── NAV ── */}
      <nav className="relative z-10 w-full h-16 flex items-center justify-between px-6 border-b border-cyan-500/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden shadow-[0_0_15px_#22d3ee66] border border-cyan-400/30">
              <Image
                src="/logo.png"
                alt="Nexora"
                width={36}
                height={36}
                className="object-cover"
                priority
              />
            </div>
            <span className="font-black tracking-tighter uppercase text-base">
              Nexora IA
            </span>
          </div>
          <div className="hidden sm:flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span className="text-cyan-400">Carte</span>
            <span
              className="hover:text-white cursor-pointer transition-colors"
              onClick={() => router.push("/selection")}
            >
              Missions
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-black text-cyan-400">
              {userData?.name?.toUpperCase()}
            </span>
            <span className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">
              {currentDomain.toUpperCase()} SECTOR
            </span>
          </div>
          <div className="flex items-center gap-3 border-x border-white/5 px-4">
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
            className="p-2 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-lg text-slate-600 hover:text-red-400 transition-all"
            title="Quitter"
          >
            <LogOut size={16} />
          </button>
          <div
            className="w-9 h-9 rounded-full border-2 border-cyan-500 flex items-center justify-center font-black text-sm bg-cyan-500/10 text-cyan-400"
            style={{ boxShadow: "0 0 12px #22d3ee44" }}
          >
            {userData?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      {/* ── BODY ── */}
      <div
        className="relative z-10 flex flex-1 gap-4 p-4 overflow-hidden"
        style={{ height: "calc(100vh - 64px)" }}
      >
        {/* ── MAP PANEL ── */}
        <div className="flex-[3] relative rounded-2xl overflow-hidden border border-white/5 bg-slate-950/40 backdrop-blur-sm">
          {/* Floating header */}
          <div className="absolute top-5 left-5 z-20 flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
              <Bot className="text-cyan-400 w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase leading-none tracking-tight">
                Apprendre le{" "}
                <span className="text-cyan-400">
                  {domainLabels[currentDomain] || currentDomain}
                </span>
              </h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em] mt-0.5">
                {userData?.name} — progression synchronisée
              </p>
            </div>
          </div>

          {/* Neon SVG path */}
          <NeonPath levels={levels} />

          {/* Level nodes */}
          {levels.map((lvl) => (
            <LevelNode
              key={lvl.id}
              lvl={lvl}
              onClick={() =>
                router.push(`/quiz/${lvl.id}?domain=${currentDomain}`)
              }
            />
          ))}

          {/* 3D grid floor effect */}
          <div
            className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none opacity-20"
            style={{
              background: `
                linear-gradient(transparent, rgba(34,211,238,0.03)),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 59px,
                  rgba(34,211,238,0.3) 59px,
                  rgba(34,211,238,0.3) 60px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 39px,
                  rgba(34,211,238,0.2) 39px,
                  rgba(34,211,238,0.2) 40px
                )
              `,
              maskImage:
                "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
            }}
          />

          {/* CTA Button */}
          <motion.button
            className="absolute bottom-5 left-5 btn-cyber py-3 px-6 text-[10px] font-black flex items-center gap-2 z-20"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              router.push(`/quiz/${currentStep}?domain=${currentDomain}`)
            }
          >
            <Play fill="currentColor" size={12} />
            REPRENDRE LA QUÊTE
            <ChevronRight size={12} />
          </motion.button>

          {/* XP floating badges near completed nodes */}
          {levels
            .filter((l) => l.status === "completed")
            .map((lvl) => (
              <motion.div
                key={`xp-${lvl.id}`}
                className="absolute z-20 text-[9px] font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 rounded-full px-2 py-0.5"
                style={{ left: `calc(${lvl.x} + 30px)`, top: lvl.y }}
                animate={{ y: [-2, 2, -2] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                +XP
              </motion.div>
            ))}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div
          className="flex-1 flex flex-col gap-3 overflow-y-auto"
          style={{ minWidth: 260 }}
        >
          {/* Profile card */}
          <div className="rounded-2xl border border-white/5 bg-slate-950/60 backdrop-blur-sm p-5">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-11 h-11 rounded-full border-2 border-pink-500 flex items-center justify-center font-black text-sm bg-pink-500/10 text-pink-400"
                style={{ boxShadow: "0 0 12px #ec489944" }}
              >
                {userData?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-black uppercase italic">
                  {userData?.name || "Pilote"}
                </p>
                <p className="text-[9px] text-pink-400 font-bold uppercase tracking-widest">
                  Niveau {currentStep} Pilote
                </p>
              </div>
            </div>

            {/* Radar */}
            <div className="flex flex-col items-center">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                Radar de Compétences
              </p>
              <RadarChart skills={radarSkills} />
            </div>
          </div>

          {/* Sector progress */}
          <div className="rounded-2xl border border-white/5 bg-slate-950/60 backdrop-blur-sm p-5 space-y-3">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              Missions — {currentDomain.toUpperCase()}
            </h3>
            <div className="p-3 rounded-xl border border-white/5 bg-white/2">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[9px] font-bold text-slate-300">
                  Progression du Secteur
                </p>
                <span className="text-[9px] font-black text-cyan-400">
                  {sectorProgress}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sectorProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #22d3ee, #a855f7)",
                    boxShadow: "0 0 8px #22d3ee88",
                  }}
                />
              </div>
            </div>

            {/* Level list */}
            {levels.map((lvl) => (
              <div
                key={lvl.id}
                className="flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer"
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
                      : lvl.status === "available"
                        ? "rgba(34,211,238,0.04)"
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
                    {lvl.label}
                  </p>
                </div>
                {lvl.status === "available" && (
                  <ChevronRight size={12} className="text-cyan-400" />
                )}
                {lvl.status === "locked" && (
                  <Lock size={10} className="text-slate-700" />
                )}
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="rounded-2xl border border-white/5 bg-slate-950/60 backdrop-blur-sm p-5">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">
              Insignes Débloqués
            </h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => {
                const unlocked = i < currentStep
                return (
                  <motion.div
                    key={i}
                    whileHover={unlocked ? { scale: 1.1 } : {}}
                    className="flex-1 aspect-square rounded-lg flex items-center justify-center border"
                    style={{
                      borderColor: unlocked
                        ? "rgba(34,211,238,0.3)"
                        : "rgba(255,255,255,0.06)",
                      background: unlocked
                        ? "rgba(34,211,238,0.08)"
                        : "rgba(255,255,255,0.02)",
                      boxShadow: unlocked
                        ? "0 0 10px rgba(34,211,238,0.15)"
                        : "none",
                    }}
                  >
                    <Award
                      size={14}
                      className={unlocked ? "text-cyan-400" : "text-slate-800"}
                    />
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
