"use client"

import { useEffect, useRef } from "react"

interface Star {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
}

interface Nebula {
  x: number
  y: number
  radius: number
  color: string
  opacity: number
}

export function ParallaxBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const nebulasRef = useRef<Nebula[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
      initNebulas()
    }

    const initStars = () => {
      starsRef.current = []
      const starCount = Math.floor((canvas.width * canvas.height) / 3000)

      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random() * 0.8 + 0.2,
        })
      }
    }

    const initNebulas = () => {
      nebulasRef.current = [
        { x: canvas.width * 0.2, y: canvas.height * 0.3, radius: 300, color: "270, 100%, 65%", opacity: 0.1 },
        { x: canvas.width * 0.8, y: canvas.height * 0.7, radius: 250, color: "180, 100%, 50%", opacity: 0.08 },
        { x: canvas.width * 0.5, y: canvas.height * 0.5, radius: 400, color: "330, 100%, 65%", opacity: 0.06 },
      ]
    }

    const drawNebulas = () => {
      nebulasRef.current.forEach((nebula) => {
        const gradient = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius)
        gradient.addColorStop(0, `hsla(${nebula.color}, ${nebula.opacity})`)
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      })
    }

    const drawStars = () => {
      starsRef.current.forEach((star) => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()

        // Move stars
        star.x -= star.speed
        if (star.x < 0) {
          star.x = canvas.width
          star.y = Math.random() * canvas.height
        }

        // Twinkle effect
        star.opacity += (Math.random() - 0.5) * 0.05
        star.opacity = Math.max(0.2, Math.min(1, star.opacity))
      })
    }

    const animate = () => {
      ctx.fillStyle = "hsl(230, 25%, 3%)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      drawNebulas()
      drawStars()

      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    animate()

    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" style={{ background: "hsl(230, 25%, 3%)" }} />
}
