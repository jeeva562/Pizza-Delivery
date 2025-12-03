import type React from "react"
import type { Metadata } from "next"
import { Inter, Orbitron, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _orbitron = Orbitron({ subsets: ["latin"], variable: "--font-display" })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Intergalactic Pizza Delivery | Space Adventure Game",
  description:
    "Navigate through space, dodge asteroids, and deliver pizza across the galaxy in this epic parallax scrolling adventure game!",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_orbitron.variable} ${_jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
