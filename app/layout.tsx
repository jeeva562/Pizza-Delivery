import type React from "react"
import type { Metadata } from "next"
import { Inter, Orbitron, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"], display: "swap" })
const _orbitron = Orbitron({ subsets: ["latin"], variable: "--font-display", display: "swap" })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" })

export const metadata: Metadata = {
  title: "Intergalactic Pizza Delivery | Space Adventure Game",
  description:
    "Navigate through space, dodge asteroids, and deliver pizza across the galaxy in this epic parallax scrolling adventure game!",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_orbitron.variable} ${_jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className="font-sans overflow-hidden"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100dvh',
          overscrollBehavior: 'none',
        }}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
