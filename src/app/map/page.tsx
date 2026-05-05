"use client"

import { Award, Flame, Lock, Play, Star, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

const LEVELS = [
  {
    id: 1,
    label: "Les Bases",
    x: "10%",
    y: "70%",
    status: "available",
    color: "#22d3ee",
    info: ["Variables", "Types", "Affichage"],
  },
  {
    id: 2,
    label: "Fondations",
    x: "25%",
    y: "50%",
    status: "locked",
    color: "#22d3ee",
    info: ["Boucles", "Conditions"],
  },
  {
    id: 3,
    label: "DOM",
    x: "45%",
    y: "30%",
    status: "locked",
    color: "#8b5cf6",
    info: ["Sélecteurs", "Events"],
  },
  {
    id: 4,
    label: "Avancé",
    x: "65%",
    y: "45%",
    status: "locked",
    color: "#8b5cf6",
    info: ["Fonctions", "Tableaux"],
  },
  {
    id: 5,
    label: "Boss",
    x: "85%",
    y: "25%",
    status: "locked",
    color: "#f43f5e",
    info: ["Projet final"],
  },
]

export default function MapPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full bg-[#050810] text-white flex flex-col p-4 font-sans gap-4">
      {/* --- NAVBAR SUPÉRIEURE (Inspirée image_03bdf0) --- */}
      <nav className="w-full h-16 glass-panel flex items-center justify-between px-8 border-b border-cyan-500/20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_15px_#22d3ee]">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-black tracking-tighter uppercase text-xl">
              Caldera IA
            </span>
          </div>
          <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span className="text-cyan-400 cursor-pointer">Carte</span>
            <span className="hover:text-white cursor-pointer">Quêtes</span>
            <span className="hover:text-white cursor-pointer">Classement</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-orange-500" />
            <span className="text-[10px] font-bold">12 JOURS DE SUITE</span>
          </div>
          <div className="flex items-center gap-2">
            <Star size={14} className="text-yellow-400" />
            <span className="text-[10px] font-bold">850 XP</span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-cyan-500 overflow-hidden">
            <div className="w-full h-full bg-slate-800" />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* --- ZONE GAUCHE : LA MAP (Grande partie) --- */}
        <div className="flex-[3] glass-panel relative overflow-hidden bg-slate-950/20 border border-white/5">
          {/* Header de sujet */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <Zap className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase leading-none">
                Apprendre le JavaScript
              </h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                Ton aventure commence ici !
              </p>
            </div>
          </div>

          {/* SVG Chemin (Le trait lumineux) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <path
              d="M 100 600 Q 250 500 450 300 T 800 200"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="10 10"
            />
          </svg>

          {/* Placement des Nodes de Niveaux */}
          {LEVELS.map((lvl) => (
            <div
              key={lvl.id}
              className="absolute group"
              style={{ left: lvl.x, top: lvl.y }}
              onClick={() =>
                lvl.status === "available" && router.push(`/quiz/${lvl.id}`)
              }
            >
              <div className="flex flex-col items-center cursor-pointer">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-300 relative z-10 ${
                    lvl.status === "available"
                      ? "bg-slate-900 border-cyan-500 shadow-[0_0_20px_#22d3ee55] group-hover:scale-110"
                      : "bg-slate-950 border-slate-800 text-slate-700 grayscale"
                  }`}
                >
                  {lvl.status === "available" ? (
                    <span className="text-xl font-black">{lvl.id}</span>
                  ) : (
                    <Lock size={18} />
                  )}
                </div>

                {/* Petit panneau descriptif (Tooltip fixe) */}
                <div className="mt-4 glass-panel p-2 min-w-[120px] bg-[#0f172a]/80 border-cyan-500/20">
                  <p className="text-[8px] font-black uppercase text-cyan-400 mb-1">
                    {lvl.label}
                  </p>
                  {lvl.info.map((i) => (
                    <p
                      key={i}
                      className="text-[7px] text-slate-400 flex items-center gap-1"
                    >
                      <span className="w-1 h-1 bg-cyan-500 rounded-full" /> {i}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Bouton "Reprendre" en bas à gauche */}
          <button className="absolute bottom-6 left-6 btn-cyber py-3 px-8 text-[10px] font-black flex items-center gap-2">
            <Play fill="currentColor" size={12} /> REPRENDRE LA QUÊTE
          </button>
        </div>

        {/* --- ZONE DROITE : SIDEBAR STATS (Inspirée image_03bdf0) --- */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          {/* Profil & Radar */}
          <div className="glass-panel p-6 bg-slate-900/40 border border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full border-2 border-pink-500 p-1">
                <div className="w-full h-full rounded-full bg-slate-800" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase italic">
                  Alexandre V.
                </h2>
                <p className="text-[9px] text-pink-400 font-bold uppercase tracking-widest">
                  Niveau 7 Cadet
                </p>
              </div>
            </div>

            {/* Radar de compétences (Simulé) */}
            <div className="aspect-square w-full bg-white/5 rounded-full flex items-center justify-center border border-white/5 relative">
              <span className="text-[8px] text-slate-600 font-black uppercase tracking-[0.2em]">
                Radar de Compétences
              </span>
              {/* Ici on pourrait mettre un graphique radar SVG */}
            </div>
          </div>

          {/* Quêtes en cours */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              Quêtes en cours
            </h3>
            <div className="space-y-3">
              {[
                { t: "Utiliser une boucle for", xp: "+50" },
                { t: "Créer une fonction fléchée", xp: "+60" },
              ].map((q) => (
                <div
                  key={q.t}
                  className="p-3 bg-white/2 rounded-lg border border-white/5"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[9px] font-bold text-slate-300">{q.t}</p>
                    <span className="text-[8px] text-yellow-400">
                      {q.xp} XP
                    </span>
                  </div>
                  <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-cyan-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Récompenses / Badges */}
          <div className="glass-panel p-5">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">
              Récompenses
            </h3>
            <div className="flex justify-around">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-slate-800 border border-white/10 rounded-lg flex items-center justify-center grayscale opacity-50"
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
