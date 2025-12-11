"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import { Rocket, Star, Lock, Trophy, ChevronRight, Sparkles } from "lucide-react"

interface GalaxyMapProps {
    currentLevel: number
    completedLevels: number[]
    onLevelSelect: (level: number) => void
    onContinue: () => void
    totalScore: number
    onOpenUpgrades?: () => void
    availablePoints?: number
}

interface Planet {
    x: number
    y: number
    radius: number
    color: string
    name: string
    ringColor?: string
    hasRings?: boolean
    glowColor: string
    atmosphere?: string
    moons?: number
    texture?: string
}

interface BackgroundStar {
    x: number
    y: number
    size: number
    alpha: number
    twinkleSpeed: number
    twinklePhase: number
    parallaxLayer: number
    color: string
}

interface Nebula {
    x: number
    y: number
    radius: number
    color: string
    rotation: number
    speed: number
}

interface Spaceship {
    x: number
    y: number
    targetX: number
    targetY: number
    angle: number
    traveling: boolean
    trailPoints: { x: number; y: number; alpha: number }[]
}

const PLANETS: Planet[] = [
    { x: 0.08, y: 0.5, radius: 40, color: "#1e90ff", name: "Earth", glowColor: "#00aaff", atmosphere: "#87ceeb", moons: 1, texture: "earth" },
    { x: 0.18, y: 0.28, radius: 30, color: "#8B7355", name: "Asteroid Belt", glowColor: "#a09080", texture: "asteroid" },
    { x: 0.30, y: 0.68, radius: 38, color: "#cd5c5c", name: "Mars", glowColor: "#ff6b6b", atmosphere: "#ff9999", texture: "mars" },
    { x: 0.42, y: 0.32, radius: 60, color: "#daa520", name: "Jupiter", glowColor: "#ffa500", atmosphere: "#ffcc80", texture: "jupiter" },
    { x: 0.55, y: 0.62, radius: 55, color: "#f4a460", name: "Saturn", hasRings: true, ringColor: "#d2b48c", glowColor: "#ffe4b5", texture: "saturn" },
    { x: 0.67, y: 0.30, radius: 42, color: "#40e0d0", name: "Uranus", hasRings: true, ringColor: "#7fffd4", glowColor: "#afeeee", atmosphere: "#e0ffff", texture: "uranus" },
    { x: 0.78, y: 0.58, radius: 40, color: "#4169e1", name: "Neptune", glowColor: "#6495ed", atmosphere: "#b0c4de", texture: "neptune" },
    { x: 0.86, y: 0.32, radius: 28, color: "#9370db", name: "Kuiper Belt", glowColor: "#dda0dd", texture: "kuiper" },
    { x: 0.90, y: 0.68, radius: 25, color: "#ff69b4", name: "Deep Space", glowColor: "#ffb6c1", texture: "void" },
    { x: 0.96, y: 0.5, radius: 45, color: "#32cd32", name: "Space Station", glowColor: "#90ee90", texture: "station" },
]

export function GalaxyMap({ currentLevel, completedLevels, onLevelSelect, onContinue, totalScore, onOpenUpgrades, availablePoints = 0 }: GalaxyMapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number>(0)
    const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null)
    const [isAnimating, setIsAnimating] = useState(true)
    const [showContinueButton, setShowContinueButton] = useState(false)
    const canvasSizeRef = useRef({ width: 800, height: 600 })

    const backgroundStarsRef = useRef<BackgroundStar[]>([])
    const nebulaeRef = useRef<Nebula[]>([])
    const spaceshipRef = useRef<Spaceship>({
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        angle: 0,
        traveling: false,
        trailPoints: [],
    })

    const frameCount = useRef(0)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const resizeCanvas = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            const width = window.innerWidth
            const height = window.innerHeight

            canvas.width = width * dpr
            canvas.height = height * dpr
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`
            ctx.scale(dpr, dpr)

            canvasSizeRef.current = { width, height }

            // Initialize rich background stars with colors
            backgroundStarsRef.current = []
            const starCount = Math.floor((width * height) / 800)
            const starColors = ["#ffffff", "#fffafa", "#f0f8ff", "#fff8dc", "#ffefd5", "#e6e6fa"]
            for (let i = 0; i < starCount; i++) {
                backgroundStarsRef.current.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 2 + 0.3,
                    alpha: Math.random() * 0.8 + 0.2,
                    twinkleSpeed: 0.008 + Math.random() * 0.02,
                    twinklePhase: Math.random() * Math.PI * 2,
                    parallaxLayer: Math.floor(Math.random() * 3),
                    color: starColors[Math.floor(Math.random() * starColors.length)],
                })
            }

            // Initialize nebulae for atmosphere
            nebulaeRef.current = [
                { x: width * 0.2, y: height * 0.3, radius: 250, color: "#4b0082", rotation: 0, speed: 0.001 },
                { x: width * 0.7, y: height * 0.6, radius: 300, color: "#800080", rotation: Math.PI, speed: 0.0008 },
                { x: width * 0.5, y: height * 0.2, radius: 200, color: "#191970", rotation: Math.PI / 2, speed: 0.0012 },
                { x: width * 0.85, y: height * 0.4, radius: 180, color: "#2f4f4f", rotation: 0, speed: 0.0015 },
            ]

            // Position spaceship at current level's planet
            if (currentLevel < PLANETS.length) {
                const planet = PLANETS[currentLevel]
                spaceshipRef.current.x = planet.x * width - 80
                spaceshipRef.current.y = planet.y * height
                spaceshipRef.current.targetX = spaceshipRef.current.x
                spaceshipRef.current.targetY = spaceshipRef.current.y
            }
        }

        resizeCanvas()
        window.addEventListener("resize", resizeCanvas)

        // Start animation: spaceship travels from previous level to current
        if (currentLevel > 0 && completedLevels.includes(currentLevel - 1)) {
            const width = canvasSizeRef.current.width
            const height = canvasSizeRef.current.height
            const prevPlanet = PLANETS[currentLevel - 1]
            const currPlanet = PLANETS[currentLevel]

            spaceshipRef.current.x = prevPlanet.x * width + 80
            spaceshipRef.current.y = prevPlanet.y * height
            spaceshipRef.current.targetX = currPlanet.x * width - 80
            spaceshipRef.current.targetY = currPlanet.y * height
            spaceshipRef.current.traveling = true
            spaceshipRef.current.trailPoints = []
        } else {
            setIsAnimating(false)
            setShowContinueButton(true)
        }

        const drawBackgroundStars = () => {
            backgroundStarsRef.current.forEach((star) => {
                star.twinklePhase += star.twinkleSpeed
                const twinkle = 0.4 + Math.sin(star.twinklePhase) * 0.6

                // Subtle parallax
                const parallaxOffset = Math.sin(frameCount.current * 0.0005) * star.parallaxLayer * 0.3

                // Draw star with glow
                const glowSize = star.size * 3
                const gradient = ctx.createRadialGradient(
                    star.x + parallaxOffset, star.y, 0,
                    star.x + parallaxOffset, star.y, glowSize
                )
                gradient.addColorStop(0, star.color)
                gradient.addColorStop(0.3, star.color + "88")
                gradient.addColorStop(1, "transparent")

                ctx.beginPath()
                ctx.arc(star.x + parallaxOffset, star.y, glowSize, 0, Math.PI * 2)
                ctx.fillStyle = gradient
                ctx.globalAlpha = star.alpha * twinkle
                ctx.fill()
                ctx.globalAlpha = 1
            })
        }

        const drawNebulae = () => {
            nebulaeRef.current.forEach((nebula) => {
                nebula.rotation += nebula.speed

                ctx.save()
                ctx.translate(nebula.x, nebula.y)
                ctx.rotate(nebula.rotation)

                // Multi-layered nebula effect
                for (let layer = 0; layer < 4; layer++) {
                    const layerRadius = nebula.radius * (1 - layer * 0.15)
                    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, layerRadius)
                    gradient.addColorStop(0, nebula.color + "15")
                    gradient.addColorStop(0.3, nebula.color + "0a")
                    gradient.addColorStop(0.6, nebula.color + "05")
                    gradient.addColorStop(1, "transparent")

                    ctx.beginPath()
                    ctx.ellipse(0, 0, layerRadius, layerRadius * 0.6, layer * 0.3, 0, Math.PI * 2)
                    ctx.fillStyle = gradient
                    ctx.fill()
                }

                ctx.restore()
            })
        }

        const drawPlanet = (planet: Planet, index: number, isCompleted: boolean, isCurrent: boolean, isLocked: boolean) => {
            const width = canvasSizeRef.current.width
            const height = canvasSizeRef.current.height
            const x = planet.x * width
            const y = planet.y * height
            const baseRadius = planet.radius * Math.min(width, height) / 900
            const radius = baseRadius * (isCurrent ? 1 + Math.sin(frameCount.current * 0.03) * 0.08 : 1)

            ctx.save()

            // Outer cosmic glow for unlocked planets
            if (!isLocked) {
                const outerGlow = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 3)
                outerGlow.addColorStop(0, "transparent")
                outerGlow.addColorStop(0.5, isCompleted ? "rgba(0, 255, 100, 0.15)" : isCurrent ? planet.glowColor + "25" : "transparent")
                outerGlow.addColorStop(1, "transparent")
                ctx.fillStyle = outerGlow
                ctx.beginPath()
                ctx.arc(x, y, radius * 3, 0, Math.PI * 2)
                ctx.fill()
            }

            // Planet atmosphere (for unlocked)
            if (!isLocked && planet.atmosphere) {
                const atmoGradient = ctx.createRadialGradient(x, y, radius * 0.9, x, y, radius * 1.3)
                atmoGradient.addColorStop(0, "transparent")
                atmoGradient.addColorStop(0.5, planet.atmosphere + "40")
                atmoGradient.addColorStop(1, "transparent")
                ctx.fillStyle = atmoGradient
                ctx.beginPath()
                ctx.arc(x, y, radius * 1.3, 0, Math.PI * 2)
                ctx.fill()
            }

            // Draw rings behind planet
            if (planet.hasRings && !isLocked) {
                ctx.save()
                ctx.translate(x, y)
                ctx.scale(1, 0.25)
                ctx.beginPath()
                ctx.arc(0, 0, radius * 2, 0, Math.PI * 2)
                const ringGradient = ctx.createRadialGradient(0, 0, radius * 1.3, 0, 0, radius * 2)
                ringGradient.addColorStop(0, "transparent")
                ringGradient.addColorStop(0.3, planet.ringColor + "60")
                ringGradient.addColorStop(0.5, planet.ringColor + "90")
                ringGradient.addColorStop(0.7, planet.ringColor + "60")
                ringGradient.addColorStop(1, "transparent")
                ctx.strokeStyle = ringGradient
                ctx.lineWidth = radius * 0.35
                ctx.stroke()
                ctx.restore()
            }

            // Planet body with realistic shading
            const planetGradient = ctx.createRadialGradient(
                x - radius * 0.35, y - radius * 0.35, 0,
                x, y, radius
            )

            if (isLocked) {
                planetGradient.addColorStop(0, "#4a4a4a")
                planetGradient.addColorStop(0.5, "#2a2a2a")
                planetGradient.addColorStop(1, "#0a0a0a")
            } else {
                planetGradient.addColorStop(0, "#ffffff")
                planetGradient.addColorStop(0.1, planet.glowColor)
                planetGradient.addColorStop(0.5, planet.color)
                planetGradient.addColorStop(1, "#000000")
            }

            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fillStyle = planetGradient
            ctx.fill()

            // Planet surface details (texture-like)
            if (!isLocked) {
                ctx.save()
                ctx.globalAlpha = 0.3
                ctx.beginPath()
                ctx.arc(x, y, radius, 0, Math.PI * 2)
                ctx.clip()

                // Surface bands for gas giants
                if (planet.texture === "jupiter" || planet.texture === "saturn") {
                    for (let i = 0; i < 6; i++) {
                        const bandY = y - radius + (radius * 2 * i / 6) + Math.sin(frameCount.current * 0.02 + i) * 2
                        ctx.beginPath()
                        ctx.ellipse(x, bandY, radius, radius * 0.08, 0, 0, Math.PI * 2)
                        ctx.fillStyle = i % 2 === 0 ? planet.color : planet.glowColor
                        ctx.fill()
                    }
                }

                ctx.restore()
            }

            // Highlight reflection
            ctx.beginPath()
            ctx.ellipse(x - radius * 0.25, y - radius * 0.35, radius * 0.35, radius * 0.2, -0.5, 0, Math.PI * 2)
            ctx.fillStyle = "rgba(255,255,255,0.25)"
            ctx.fill()

            // Draw rings in front of planet
            if (planet.hasRings && !isLocked) {
                ctx.save()
                ctx.translate(x, y)
                ctx.scale(1, 0.25)
                ctx.beginPath()
                ctx.arc(0, 0, radius * 2, Math.PI, Math.PI * 2)
                ctx.strokeStyle = planet.ringColor + "80"
                ctx.lineWidth = radius * 0.3
                ctx.stroke()
                ctx.restore()
            }

            // Draw moons
            if (!isLocked && planet.moons) {
                for (let m = 0; m < planet.moons; m++) {
                    const moonAngle = frameCount.current * 0.015 + m * Math.PI * 2 / planet.moons
                    const moonDist = radius * 1.8
                    const moonX = x + Math.cos(moonAngle) * moonDist
                    const moonY = y + Math.sin(moonAngle) * moonDist * 0.4
                    const moonRadius = radius * 0.15

                    const moonGradient = ctx.createRadialGradient(moonX - moonRadius * 0.3, moonY - moonRadius * 0.3, 0, moonX, moonY, moonRadius)
                    moonGradient.addColorStop(0, "#ffffff")
                    moonGradient.addColorStop(0.5, "#cccccc")
                    moonGradient.addColorStop(1, "#666666")

                    ctx.beginPath()
                    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2)
                    ctx.fillStyle = moonGradient
                    ctx.fill()
                }
            }

            // Locked icon
            if (isLocked) {
                ctx.beginPath()
                ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2)
                ctx.fillStyle = "rgba(0,0,0,0.6)"
                ctx.fill()
                ctx.font = `${radius * 0.5}px Arial`
                ctx.fillStyle = "#666666"
                ctx.textAlign = "center"
                ctx.textBaseline = "middle"
                ctx.fillText("🔒", x, y)
            }

            // Completion badge
            if (isCompleted) {
                const badgeX = x + radius * 0.7
                const badgeY = y - radius * 0.7
                const badgeR = radius * 0.3

                // Badge glow
                const badgeGlow = ctx.createRadialGradient(badgeX, badgeY, 0, badgeX, badgeY, badgeR * 2)
                badgeGlow.addColorStop(0, "rgba(0, 255, 100, 0.5)")
                badgeGlow.addColorStop(1, "transparent")
                ctx.fillStyle = badgeGlow
                ctx.beginPath()
                ctx.arc(badgeX, badgeY, badgeR * 2, 0, Math.PI * 2)
                ctx.fill()

                // Badge
                ctx.beginPath()
                ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2)
                const badgeGradient = ctx.createRadialGradient(badgeX, badgeY, 0, badgeX, badgeY, badgeR)
                badgeGradient.addColorStop(0, "#00ff88")
                badgeGradient.addColorStop(1, "#00aa44")
                ctx.fillStyle = badgeGradient
                ctx.fill()
                ctx.strokeStyle = "#ffffff"
                ctx.lineWidth = 2
                ctx.stroke()

                // Checkmark
                ctx.beginPath()
                ctx.moveTo(badgeX - badgeR * 0.4, badgeY)
                ctx.lineTo(badgeX - badgeR * 0.1, badgeY + badgeR * 0.3)
                ctx.lineTo(badgeX + badgeR * 0.4, badgeY - badgeR * 0.3)
                ctx.strokeStyle = "#ffffff"
                ctx.lineWidth = 3
                ctx.lineCap = "round"
                ctx.lineJoin = "round"
                ctx.stroke()
            }

            // Level number with better styling
            const labelY = y + radius + 18

            // Number background
            ctx.beginPath()
            ctx.roundRect(x - 15, labelY - 10, 30, 20, 6)
            ctx.fillStyle = isLocked ? "rgba(50,50,50,0.8)" : isCurrent ? "rgba(0,200,255,0.9)" : isCompleted ? "rgba(0,180,80,0.8)" : "rgba(0,0,0,0.6)"
            ctx.fill()

            ctx.font = `bold ${12}px Orbitron, sans-serif`
            ctx.fillStyle = "#ffffff"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(`${index + 1}`, x, labelY)

            // Planet name with glow
            ctx.font = `bold ${11}px Inter, sans-serif`
            ctx.fillStyle = isLocked ? "#555555" : "#ffffff"
            ctx.shadowColor = isLocked ? "transparent" : planet.glowColor
            ctx.shadowBlur = isLocked ? 0 : 8
            ctx.fillText(planet.name, x, labelY + 20)
            ctx.shadowBlur = 0

            ctx.restore()
        }

        const drawConnections = () => {
            const width = canvasSizeRef.current.width
            const height = canvasSizeRef.current.height

            for (let i = 0; i < PLANETS.length - 1; i++) {
                const from = PLANETS[i]
                const to = PLANETS[i + 1]
                const fromX = from.x * width
                const fromY = from.y * height
                const toX = to.x * width
                const toY = to.y * height

                const isCompleted = completedLevels.includes(i)
                const isActive = i === currentLevel - 1

                // Path glow
                if (isCompleted || isActive) {
                    ctx.beginPath()
                    ctx.moveTo(fromX, fromY)
                    const midX = (fromX + toX) / 2
                    const midY = (fromY + toY) / 2 - 40
                    ctx.quadraticCurveTo(midX, midY, toX, toY)
                    ctx.strokeStyle = isCompleted ? "rgba(0, 255, 100, 0.3)" : "rgba(0, 200, 255, 0.2)"
                    ctx.lineWidth = 12
                    ctx.stroke()
                }

                // Main path
                ctx.beginPath()
                ctx.setLineDash(isCompleted ? [] : [8, 6])
                ctx.moveTo(fromX, fromY)
                const midX = (fromX + toX) / 2
                const midY = (fromY + toY) / 2 - 40
                ctx.quadraticCurveTo(midX, midY, toX, toY)
                ctx.strokeStyle = isCompleted ? "#00ff66" : "rgba(255,255,255,0.3)"
                ctx.lineWidth = isCompleted ? 3 : 2
                ctx.stroke()
                ctx.setLineDash([])

                // Animated particles along path
                if (isCompleted || isActive) {
                    const particleCount = 3
                    for (let p = 0; p < particleCount; p++) {
                        const t = ((frameCount.current * 0.008 + p / particleCount) % 1)
                        const px = (1 - t) * (1 - t) * fromX + 2 * (1 - t) * t * midX + t * t * toX
                        const py = (1 - t) * (1 - t) * fromY + 2 * (1 - t) * t * midY + t * t * toY

                        const particleGlow = ctx.createRadialGradient(px, py, 0, px, py, 8)
                        particleGlow.addColorStop(0, isCompleted ? "#00ff66" : "#00d9ff")
                        particleGlow.addColorStop(0.5, isCompleted ? "#00ff6644" : "#00d9ff44")
                        particleGlow.addColorStop(1, "transparent")

                        ctx.beginPath()
                        ctx.arc(px, py, 8, 0, Math.PI * 2)
                        ctx.fillStyle = particleGlow
                        ctx.fill()

                        ctx.beginPath()
                        ctx.arc(px, py, 3, 0, Math.PI * 2)
                        ctx.fillStyle = "#ffffff"
                        ctx.fill()
                    }
                }
            }
        }

        const drawSpaceship = (ship: Spaceship) => {
            ctx.save()
            ctx.translate(ship.x, ship.y)
            ctx.rotate(ship.angle)

            // Engine trail
            if (ship.traveling) {
                ship.trailPoints.forEach((point) => {
                    const gradient = ctx.createRadialGradient(point.x - ship.x, point.y - ship.y, 0, point.x - ship.x, point.y - ship.y, 8)
                    gradient.addColorStop(0, `rgba(255, 150, 0, ${point.alpha})`)
                    gradient.addColorStop(1, "transparent")
                    ctx.beginPath()
                    ctx.arc(point.x - ship.x, point.y - ship.y, 8, 0, Math.PI * 2)
                    ctx.fillStyle = gradient
                    ctx.fill()
                })
            }

            const size = 30

            // Ship glow
            const shipGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.5)
            shipGlow.addColorStop(0, "rgba(0, 200, 255, 0.3)")
            shipGlow.addColorStop(1, "transparent")
            ctx.beginPath()
            ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2)
            ctx.fillStyle = shipGlow
            ctx.fill()

            // Engine flame
            if (ship.traveling) {
                const flameLength = 20 + Math.random() * 12
                ctx.beginPath()
                ctx.moveTo(-size / 2, -size / 10)
                ctx.quadraticCurveTo(-size / 2 - flameLength, 0, -size / 2, size / 10)
                const flameGradient = ctx.createLinearGradient(-size / 2, 0, -size / 2 - flameLength, 0)
                flameGradient.addColorStop(0, "#ffffff")
                flameGradient.addColorStop(0.2, "#00d9ff")
                flameGradient.addColorStop(0.5, "#ff6600")
                flameGradient.addColorStop(1, "transparent")
                ctx.fillStyle = flameGradient
                ctx.fill()
            }

            // Ship body
            const bodyGradient = ctx.createLinearGradient(-size / 2, 0, size / 2, 0)
            bodyGradient.addColorStop(0, "#888888")
            bodyGradient.addColorStop(0.5, "#ffffff")
            bodyGradient.addColorStop(1, "#cccccc")

            ctx.beginPath()
            ctx.moveTo(size / 2 + 5, 0)
            ctx.lineTo(-size / 3, -size / 3)
            ctx.lineTo(-size / 2, -size / 6)
            ctx.lineTo(-size / 2, size / 6)
            ctx.lineTo(-size / 3, size / 3)
            ctx.closePath()
            ctx.fillStyle = bodyGradient
            ctx.fill()
            ctx.strokeStyle = "#666666"
            ctx.lineWidth = 1
            ctx.stroke()

            // Cockpit
            const cockpitGradient = ctx.createRadialGradient(size / 6, 0, 0, size / 6, 0, size / 5)
            cockpitGradient.addColorStop(0, "#00ffff")
            cockpitGradient.addColorStop(0.7, "#0088aa")
            cockpitGradient.addColorStop(1, "#004455")
            ctx.beginPath()
            ctx.ellipse(size / 6, 0, size / 5, size / 8, 0, 0, Math.PI * 2)
            ctx.fillStyle = cockpitGradient
            ctx.fill()

            // Wings
            ctx.beginPath()
            ctx.moveTo(-size / 4, -size / 4)
            ctx.lineTo(-size / 2 - 8, -size / 2)
            ctx.lineTo(-size / 2, -size / 5)
            ctx.closePath()
            ctx.fillStyle = "#cc0000"
            ctx.fill()

            ctx.beginPath()
            ctx.moveTo(-size / 4, size / 4)
            ctx.lineTo(-size / 2 - 8, size / 2)
            ctx.lineTo(-size / 2, size / 5)
            ctx.closePath()
            ctx.fillStyle = "#cc0000"
            ctx.fill()

            ctx.restore()
        }

        const updateSpaceship = () => {
            const ship = spaceshipRef.current
            if (!ship.traveling) return

            const dx = ship.targetX - ship.x
            const dy = ship.targetY - ship.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < 5) {
                ship.traveling = false
                ship.x = ship.targetX
                ship.y = ship.targetY
                setIsAnimating(false)
                setShowContinueButton(true)
                return
            }

            ship.angle = Math.atan2(dy, dx)
            const speed = Math.min(dist * 0.04, 6)
            ship.x += (dx / dist) * speed
            ship.y += (dy / dist) * speed

            ship.trailPoints.push({
                x: ship.x - Math.cos(ship.angle) * 18,
                y: ship.y - Math.sin(ship.angle) * 18,
                alpha: 1,
            })

            ship.trailPoints = ship.trailPoints.filter((point) => {
                point.alpha -= 0.025
                return point.alpha > 0
            })
        }

        const animate = () => {
            frameCount.current++
            const width = canvasSizeRef.current.width
            const height = canvasSizeRef.current.height

            // Deep space background
            const bgGradient = ctx.createRadialGradient(
                width * 0.5, height * 0.5, 0,
                width * 0.5, height * 0.5, width * 0.8
            )
            bgGradient.addColorStop(0, "#0f0f2e")
            bgGradient.addColorStop(0.3, "#080818")
            bgGradient.addColorStop(0.7, "#040410")
            bgGradient.addColorStop(1, "#000005")
            ctx.fillStyle = bgGradient
            ctx.fillRect(0, 0, width, height)

            drawNebulae()
            drawBackgroundStars()
            drawConnections()

            // Draw planets
            PLANETS.forEach((planet, index) => {
                const isCompleted = completedLevels.includes(index)
                const isCurrent = index === currentLevel
                const isLocked = index > currentLevel && !completedLevels.includes(index)
                drawPlanet(planet, index, isCompleted, isCurrent, isLocked)
            })

            updateSpaceship()
            drawSpaceship(spaceshipRef.current)

            animationRef.current = requestAnimationFrame(animate)
        }

        animationRef.current = requestAnimationFrame(animate)

        const handleClick = (e: MouseEvent) => {
            if (isAnimating) return

            const rect = canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            const width = canvasSizeRef.current.width
            const height = canvasSizeRef.current.height

            PLANETS.forEach((planet, index) => {
                const px = planet.x * width
                const py = planet.y * height
                const radius = planet.radius * Math.min(width, height) / 900

                const dx = x - px
                const dy = y - py
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist < radius * 1.8) {
                    const isLocked = index > currentLevel && !completedLevels.includes(index)
                    if (!isLocked) {
                        setSelectedPlanet(index)
                    }
                }
            })
        }

        canvas.addEventListener("click", handleClick)

        return () => {
            window.removeEventListener("resize", resizeCanvas)
            canvas.removeEventListener("click", handleClick)
            cancelAnimationFrame(animationRef.current)
        }
    }, [currentLevel, completedLevels, isAnimating])

    const handleContinue = useCallback(() => {
        if (selectedPlanet !== null) {
            onLevelSelect(selectedPlanet)
        } else {
            onContinue()
        }
    }, [selectedPlanet, onLevelSelect, onContinue])

    return (
        <div className="fixed inset-0 z-50 bg-black">
            <canvas ref={canvasRef} className="block w-full h-full" />

            {/* Cinematic header */}
            <div className="absolute top-0 left-0 right-0 p-3 sm:p-6 pointer-events-none">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="glass-strong rounded-xl px-4 py-2 sm:px-6 sm:py-3 border border-cyan-500/30">
                        <h1 className="font-display text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                            GALAXY MAP
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {onOpenUpgrades && (
                            <button
                                onClick={onOpenUpgrades}
                                className="pointer-events-auto glass-strong rounded-xl px-4 py-2 sm:px-5 sm:py-3 flex items-center gap-2 border border-purple-500/30 hover:border-purple-400/50 transition-all hover:scale-105 active:scale-95"
                            >
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                                <span className="font-display text-sm sm:text-base text-purple-400 hidden sm:inline">UPGRADES</span>
                                {availablePoints > 0 && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/20 rounded-full text-yellow-300 text-xs">
                                        <Star className="w-3 h-3 fill-yellow-300" />
                                        {availablePoints > 9999 ? `${Math.floor(availablePoints / 1000)}k` : availablePoints.toLocaleString()}
                                    </span>
                                )}
                            </button>
                        )}
                        <div className="glass-strong rounded-xl px-4 py-2 sm:px-6 sm:py-3 flex items-center gap-2 sm:gap-3 border border-yellow-500/30">
                            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                            <span className="font-display text-sm sm:text-lg text-yellow-400">
                                {totalScore.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Level info panel */}
            {selectedPlanet !== null && (
                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="glass-strong rounded-2xl p-5 sm:p-6 border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-3">
                            <h2
                                className="font-display text-xl sm:text-2xl font-bold"
                                style={{ color: PLANETS[selectedPlanet].glowColor }}
                            >
                                {PLANETS[selectedPlanet].name}
                            </h2>
                            <span className="text-xs sm:text-sm text-muted-foreground bg-black/30 px-2 py-1 rounded">
                                Level {selectedPlanet + 1}/10
                            </span>
                        </div>

                        {completedLevels.includes(selectedPlanet) && (
                            <div className="flex items-center gap-2 text-green-400 mb-4 bg-green-500/10 px-3 py-2 rounded-lg">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-semibold">MISSION COMPLETE</span>
                            </div>
                        )}

                        <button
                            onClick={handleContinue}
                            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-display font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/25"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Rocket className="w-5 h-5" />
                                {completedLevels.includes(selectedPlanet) ? "REPLAY MISSION" : "LAUNCH MISSION"}
                                <ChevronRight className="w-5 h-5" />
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* Continue button */}
            {showContinueButton && selectedPlanet === null && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <button
                        onClick={handleContinue}
                        className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-display font-bold text-lg rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/30 animate-pulse-glow"
                    >
                        <span className="flex items-center gap-3">
                            <Rocket className="w-6 h-6" />
                            {currentLevel >= PLANETS.length ? "VICTORY!" : "CONTINUE MISSION"}
                            <ChevronRight className="w-6 h-6" />
                        </span>
                    </button>
                </div>
            )}

            {/* Animation overlay */}
            {isAnimating && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <div className="glass-strong rounded-xl px-6 py-3 border border-cyan-500/30">
                        <p className="text-sm text-cyan-400 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                            Traveling to destination...
                        </p>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 pointer-events-none hidden sm:block">
                <div className="glass-strong rounded-lg px-4 py-3 text-xs space-y-2 border border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600" />
                        <span className="text-green-400">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse" />
                        <span className="text-cyan-400">Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Lock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-500">Locked</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
