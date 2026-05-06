"use client"

import { motion } from "framer-motion"
import { ChevronRight, Loader2, Lock, Mail, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (localStorage.getItem("userId")) {
      router.replace("/selection")
    }
  }, [router])

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })

  function getErrorMessage(error: unknown) {
    return error instanceof Error
      ? error.message
      : "Accès refusé. Vérifiez vos identifiants."
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || "Accès refusé. Vérifiez vos identifiants.",
        )
      }

      localStorage.setItem("userId", result.user.id)
      router.push("/selection")
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#0b1120] relative font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="neon-text text-2xl font-black tracking-tighter uppercase">
            Authentification Pilote
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-2">
            Veuillez entrer vos codes d&apos;accès
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-panel p-8 space-y-6 border-t-2 border-t-cyan-500/50 shadow-[0_-20px_50px_-20px_rgba(34,211,238,0.1)]"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg"
            >
              ALERTE SYSTÈME : {error.toUpperCase()}
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
              <input
                required
                type="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                placeholder="CANAL EMAIL"
                className="neon-input w-full pl-12 text-xs py-4"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 w-4 h-4 transition-colors" />
              <input
                required
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                placeholder="CLÉ D'ACCÈS"
                className="neon-input w-full pl-12 text-xs py-4"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-cyber w-full py-4 text-[10px] font-black group disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                DÉVERROUILLER L&apos;ACCÈS{" "}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>

          <div className="pt-4 text-center">
            <Link
              href="/register"
              className="text-[9px] text-slate-500 hover:text-cyan-400 transition-colors uppercase font-bold tracking-widest"
            >
              Pas encore de profil ? Créer un compte pilote
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
