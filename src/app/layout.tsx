import { Rajdhani, Orbitron, Share_Tech_Mono } from "next/font/google"
import "./globals.css"

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-display",
  display: "swap",
})

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono-tech",
  display: "swap",
})

export const metadata = {
  title: "Nexora Tech - ",
  description: "Recrutement de la prochaine génération d'utilisateurs spatiaux",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`dark ${orbitron.variable} ${shareTechMono.variable}`}>
      <body className={`${rajdhani.className} min-h-screen relative`}>
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  )
}
