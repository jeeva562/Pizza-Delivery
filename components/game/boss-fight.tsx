"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import { Skull, Trophy } from "lucide-react"

interface BossFightProps {
    level: number
    onBossDefeated: (score: number) => void
    onPlayerDied: (score: number) => void
    currentScore: number
}

interface Player {
    x: number
    y: number
    width: number
    height: number
    vx: number
    vy: number
    invincible: boolean
    invincibleTimer: number
}

interface Boss {
    x: number
    y: number
    width: number
    height: number
    health: number
    maxHealth: number
    phase: number
    attackCooldown: number
    patternIndex: number
    animationFrame: number
    hitFlash: number
}

interface Projectile {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    damage: number
    isPlayerProjectile: boolean
    color: string
}

interface Explosion {
    x: number
    y: number
    radius: number
    maxRadius: number
    alpha: number
}

interface BackgroundStar {
    x: number
    y: number
    size: number
    alpha: number
    twinkleSpeed: number
    twinklePhase: number
}

const BOSS_DATA = [
    {
        name: "Void Crawler",
        color: "#6633ff",
        accentColor: "#aa66ff",
        eyeColor: "#ff0066",
        attackSpeed: 2200,
        projectileSpeed: 3,
        projectileCount: 2,
        shape: "blob", // Amorphous blob shape
        healthMultiplier: 1,
    },
    {
        name: "Rock Titan",
        color: "#8B4513",
        accentColor: "#CD853F",
        eyeColor: "#ffcc00",
        attackSpeed: 2000,
        projectileSpeed: 3.5,
        projectileCount: 3,
        shape: "crystal", // Angular crystal/rock shape
        healthMultiplier: 1.5,
    },
    {
        name: "Crimson Warlord",
        color: "#cc0000",
        accentColor: "#ff3333",
        eyeColor: "#ffffff",
        attackSpeed: 1800,
        projectileSpeed: 4,
        projectileCount: 3,
        shape: "skull", // Skull-like humanoid shape
        healthMultiplier: 2,
    },
    {
        name: "Storm King",
        color: "#ff8800",
        accentColor: "#ffcc00",
        eyeColor: "#00ffff",
        attackSpeed: 1600,
        projectileSpeed: 4.5,
        projectileCount: 4,
        shape: "cloud", // Swirling cloud/storm shape
        healthMultiplier: 2.5,
    },
    {
        name: "Ring Serpent",
        color: "#ffd700",
        accentColor: "#ffee88",
        eyeColor: "#ff0000",
        attackSpeed: 1500,
        projectileSpeed: 5,
        projectileCount: 4,
        shape: "serpent", // Long coiled serpent
        healthMultiplier: 3,
    },
    {
        name: "Frost Phantom",
        color: "#00ccff",
        accentColor: "#88eeff",
        eyeColor: "#ffffff",
        attackSpeed: 1400,
        projectileSpeed: 5.5,
        projectileCount: 5,
        shape: "ghost", // Ethereal ghost shape
        healthMultiplier: 3.5,
    },
    {
        name: "Abyss Leviathan",
        color: "#0044aa",
        accentColor: "#0088ff",
        eyeColor: "#00ffcc",
        attackSpeed: 1300,
        projectileSpeed: 6,
        projectileCount: 5,
        shape: "fish", // Deep sea creature with fins
        healthMultiplier: 4,
    },
    {
        name: "Swarm Queen",
        color: "#44aa00",
        accentColor: "#88ff44",
        eyeColor: "#ffcc00",
        attackSpeed: 1200,
        projectileSpeed: 6.5,
        projectileCount: 6,
        shape: "insect", // Insectoid with mandibles
        healthMultiplier: 5,
    },
    {
        name: "Dark Matter Entity",
        color: "#330066",
        accentColor: "#6600cc",
        eyeColor: "#ff00ff",
        attackSpeed: 1100,
        projectileSpeed: 7,
        projectileCount: 6,
        shape: "void", // Abstract void shape with multiple eyes
        healthMultiplier: 6,
    },
    {
        name: "Final Overlord",
        color: "#222222",
        accentColor: "#ff0000",
        eyeColor: "#ff0000",
        attackSpeed: 900,
        projectileSpeed: 7.5,
        projectileCount: 7,
        shape: "mech", // Mechanical alien overlord
        healthMultiplier: 8,
    },
]

const ACCELERATION = 0.8
const FRICTION = 0.88
const MAX_SPEED = 10
const PLAYER_FIRE_RATE = 120
const PLAYER_PROJECTILE_SPEED = 14
const BASE_PLAYER_DAMAGE = 8 // Reduced base damage for longer fights

export function BossFight({ level, onBossDefeated, onPlayerDied, currentScore }: BossFightProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const gameLoopRef = useRef<number>(0)
    const keysRef = useRef<Set<string>>(new Set())
    const canvasSizeRef = useRef({ width: 800, height: 600 })
    const lastFireTimeRef = useRef(0)
    const lastBossAttackRef = useRef(0)

    const [playerLives, setPlayerLives] = useState(5)
    const [bossHealth, setBossHealth] = useState(100)
    const [score, setScore] = useState(currentScore)
    const [showVictory, setShowVictory] = useState(false)
    const [phase, setPhase] = useState(1)
    const [isTouchDevice, setIsTouchDevice] = useState(false)

    const playerRef = useRef<Player>({
        x: 100,
        y: 300,
        width: 50,
        height: 30,
        vx: 0,
        vy: 0,
        invincible: false,
        invincibleTimer: 0,
    })

    // Calculate boss health with exponential scaling
    const bossData = BOSS_DATA[level] || BOSS_DATA[0]
    const baseHealth = 800
    const calculatedHealth = Math.floor(baseHealth * bossData.healthMultiplier)

    const bossRef = useRef<Boss>({
        x: 600,
        y: 200,
        width: 160 + level * 5,
        height: 160 + level * 5,
        health: calculatedHealth,
        maxHealth: calculatedHealth,
        phase: 1,
        attackCooldown: 0,
        patternIndex: 0,
        animationFrame: 0,
        hitFlash: 0,
    })

    const projectilesRef = useRef<Projectile[]>([])
    const explosionsRef = useRef<Explosion[]>([])
    const backgroundStarsRef = useRef<BackgroundStar[]>([])
    const playerLivesRef = useRef(5)
    const scoreRef = useRef(currentScore)

    // Player damage scales down as levels get harder
    const playerDamage = Math.max(4, BASE_PLAYER_DAMAGE - level * 0.3)

    useEffect(() => {
        const checkTouch = () => {
            setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0)
        }
        checkTouch()
    }, [])

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

            // Initialize background stars
            backgroundStarsRef.current = []
            const starCount = Math.floor((width * height) / 2000)
            for (let i = 0; i < starCount; i++) {
                backgroundStarsRef.current.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 2 + 0.5,
                    alpha: Math.random() * 0.6 + 0.3,
                    twinkleSpeed: 0.02 + Math.random() * 0.03,
                    twinklePhase: Math.random() * Math.PI * 2,
                })
            }

            // Position boss
            bossRef.current.x = width - 200
            bossRef.current.y = height / 2 - bossRef.current.height / 2
        }

        resizeCanvas()
        window.addEventListener("resize", resizeCanvas)

        const drawBackgroundStars = () => {
            backgroundStarsRef.current.forEach((star) => {
                star.twinklePhase += star.twinkleSpeed
                const twinkle = 0.5 + Math.sin(star.twinklePhase) * 0.5
                ctx.beginPath()
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * twinkle})`
                ctx.fill()
            })
        }

        const drawPlayer = (player: Player) => {
            ctx.save()
            ctx.translate(player.x + player.width / 2, player.y + player.height / 2)

            if (player.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
                ctx.globalAlpha = 0.5
            }

            const w = player.width
            const h = player.height

            // Engine flame
            const flameLength = 15 + Math.random() * 8
            ctx.beginPath()
            ctx.moveTo(-w / 2, -h / 6)
            ctx.quadraticCurveTo(-w / 2 - flameLength * 0.7, 0, -w / 2, h / 6)
            ctx.closePath()
            const flameGradient = ctx.createLinearGradient(-w / 2, 0, -w / 2 - flameLength, 0)
            flameGradient.addColorStop(0, "#ffaa00")
            flameGradient.addColorStop(0.5, "#ff6600")
            flameGradient.addColorStop(1, "transparent")
            ctx.fillStyle = flameGradient
            ctx.fill()

            // Body
            const bodyGradient = ctx.createLinearGradient(0, -h / 2, 0, h / 2)
            bodyGradient.addColorStop(0, "#e8e8e8")
            bodyGradient.addColorStop(0.5, "#ffffff")
            bodyGradient.addColorStop(1, "#999999")

            ctx.beginPath()
            ctx.moveTo(w / 2, 0)
            ctx.quadraticCurveTo(w / 2 - 5, -h / 2.5, -w / 4, -h / 2.5)
            ctx.lineTo(-w / 2, -h / 4)
            ctx.lineTo(-w / 2, h / 4)
            ctx.lineTo(-w / 4, h / 2.5)
            ctx.quadraticCurveTo(w / 2 - 5, h / 2.5, w / 2, 0)
            ctx.closePath()
            ctx.fillStyle = bodyGradient
            ctx.fill()
            ctx.strokeStyle = "#666"
            ctx.lineWidth = 1
            ctx.stroke()

            // Nose cone
            ctx.beginPath()
            ctx.moveTo(w / 2, 0)
            ctx.quadraticCurveTo(w / 3, -h / 4, w / 5, -h / 3.5)
            ctx.lineTo(w / 5, h / 3.5)
            ctx.quadraticCurveTo(w / 3, h / 4, w / 2, 0)
            ctx.closePath()
            ctx.fillStyle = "#cc0000"
            ctx.fill()

            // Cockpit
            ctx.beginPath()
            ctx.ellipse(w / 6, 0, 6, 4, 0, 0, Math.PI * 2)
            ctx.fillStyle = "#88ddff"
            ctx.fill()

            ctx.restore()
        }

        const drawBoss = (boss: Boss) => {
            ctx.save()
            ctx.translate(boss.x + boss.width / 2, boss.y + boss.height / 2)

            boss.animationFrame += 0.05
            const breathe = 1 + Math.sin(boss.animationFrame) * 0.05
            ctx.scale(breathe, breathe)

            if (boss.hitFlash > 0) {
                ctx.globalAlpha = 0.7 + Math.sin(boss.hitFlash * 0.5) * 0.3
            }

            const w = boss.width
            const h = boss.height
            const shape = bossData.shape

            // Outer glow
            const glowGradient = ctx.createRadialGradient(0, 0, w * 0.3, 0, 0, w * 0.9)
            glowGradient.addColorStop(0, bossData.color + "66")
            glowGradient.addColorStop(0.5, bossData.color + "33")
            glowGradient.addColorStop(1, "transparent")
            ctx.fillStyle = glowGradient
            ctx.beginPath()
            ctx.arc(0, 0, w * 0.9, 0, Math.PI * 2)
            ctx.fill()

            // Shape-specific body drawing
            const bodyGradient = ctx.createRadialGradient(-w * 0.1, -h * 0.1, 0, 0, 0, w / 2)
            bodyGradient.addColorStop(0, bossData.accentColor)
            bodyGradient.addColorStop(0.5, bossData.color)
            bodyGradient.addColorStop(1, "#000000")

            if (shape === "blob") {
                // Amorphous blob with wobbling edges
                ctx.beginPath()
                for (let i = 0; i < 16; i++) {
                    const angle = (i / 16) * Math.PI * 2
                    const wobble = Math.sin(boss.animationFrame * 3 + i * 0.8) * 12
                    const r = w / 2.5 + wobble
                    const x = Math.cos(angle) * r
                    const y = Math.sin(angle) * r * 0.85
                    if (i === 0) ctx.moveTo(x, y)
                    else ctx.lineTo(x, y)
                }
                ctx.closePath()
                ctx.fillStyle = bodyGradient
                ctx.fill()
                ctx.strokeStyle = bossData.accentColor
                ctx.lineWidth = 4
                ctx.stroke()

                // Blob tentacles
                for (let i = 0; i < 6; i++) {
                    const baseAngle = (i / 6) * Math.PI * 2 + boss.animationFrame * 0.2
                    ctx.beginPath()
                    ctx.moveTo(0, 0)
                    const len = w * 0.5 + Math.sin(boss.animationFrame + i) * 15
                    for (let j = 1; j <= 8; j++) {
                        const t = j / 8
                        const wave = Math.sin(boss.animationFrame * 2.5 + i + j) * 20 * t
                        ctx.lineTo(Math.cos(baseAngle) * len * t + wave, Math.sin(baseAngle) * len * t * 0.6)
                    }
                    ctx.strokeStyle = bossData.color
                    ctx.lineWidth = 8 - i
                    ctx.lineCap = "round"
                    ctx.stroke()
                }
            } else if (shape === "crystal") {
                // Angular crystal with sharp edges
                ctx.beginPath()
                const points = 8
                for (let i = 0; i < points; i++) {
                    const angle = (i / points) * Math.PI * 2 - Math.PI / 2
                    const spike = i % 2 === 0 ? 1.3 : 0.7
                    const r = w / 2.5 * spike
                    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r * 0.9)
                }
                ctx.closePath()
                ctx.fillStyle = bodyGradient
                ctx.fill()
                ctx.strokeStyle = bossData.accentColor
                ctx.lineWidth = 3
                ctx.stroke()

                // Crystal spikes
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 + boss.animationFrame * 0.1
                    const len = w * 0.35
                    ctx.beginPath()
                    ctx.moveTo(Math.cos(angle) * w * 0.2, Math.sin(angle) * w * 0.2)
                    ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len * 0.8)
                    ctx.lineTo(Math.cos(angle + 0.2) * w * 0.25, Math.sin(angle + 0.2) * w * 0.25)
                    ctx.closePath()
                    ctx.fillStyle = bossData.accentColor
                    ctx.fill()
                }
            } else if (shape === "skull") {
                // Skull-like humanoid shape
                ctx.beginPath()
                ctx.ellipse(0, -h * 0.05, w / 2.5, h / 2.2, 0, 0, Math.PI * 2)
                ctx.fillStyle = bodyGradient
                ctx.fill()
                ctx.strokeStyle = bossData.accentColor
                ctx.lineWidth = 3
                ctx.stroke()

                // Jaw
                ctx.beginPath()
                ctx.ellipse(0, h * 0.25, w / 3, h / 5, 0, 0, Math.PI)
                ctx.fillStyle = bossData.color
                ctx.fill()

                // Horns
                for (let s = -1; s <= 1; s += 2) {
                    ctx.beginPath()
                    ctx.moveTo(s * w * 0.3, -h * 0.3)
                    ctx.quadraticCurveTo(s * w * 0.5, -h * 0.5, s * w * 0.35, -h * 0.6)
                    ctx.strokeStyle = bossData.accentColor
                    ctx.lineWidth = 8
                    ctx.lineCap = "round"
                    ctx.stroke()
                }
            } else if (shape === "cloud") {
                // Swirling storm cloud
                for (let layer = 3; layer >= 0; layer--) {
                    const offset = layer * 8
                    ctx.beginPath()
                    for (let i = 0; i < 20; i++) {
                        const angle = (i / 20) * Math.PI * 2 + boss.animationFrame * (0.5 + layer * 0.2)
                        const wobble = Math.sin(boss.animationFrame * 2 + i + layer) * 8
                        const r = w / 2.5 - offset + wobble
                        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r * 0.7)
                    }
                    ctx.closePath()
                    ctx.fillStyle = layer === 0 ? bodyGradient : bossData.color + (40 + layer * 20).toString(16)
                    ctx.fill()
                }

                // Lightning bolts
                for (let i = 0; i < 3; i++) {
                    if (Math.sin(boss.animationFrame * 5 + i * 2) > 0.7) {
                        const startX = (Math.random() - 0.5) * w * 0.5
                        ctx.beginPath()
                        ctx.moveTo(startX, 0)
                        ctx.lineTo(startX + 10, h * 0.3)
                        ctx.lineTo(startX - 5, h * 0.35)
                        ctx.lineTo(startX + 5, h * 0.5)
                        ctx.strokeStyle = "#ffffff"
                        ctx.lineWidth = 2
                        ctx.stroke()
                    }
                }
            } else if (shape === "serpent") {
                // Coiled serpent shape
                const coils = 3
                for (let c = 0; c < coils; c++) {
                    const yOff = (c - 1) * h * 0.25
                    const xOff = Math.sin(boss.animationFrame + c) * 20
                    ctx.beginPath()
                    ctx.ellipse(xOff, yOff, w / 2.8, h / 8, 0, 0, Math.PI * 2)
                    ctx.fillStyle = c === 1 ? bodyGradient : bossData.color
                    ctx.fill()
                    ctx.strokeStyle = bossData.accentColor
                    ctx.lineWidth = 2
                    ctx.stroke()
                }

                // Head
                ctx.beginPath()
                ctx.ellipse(w * 0.3, -h * 0.3, w / 4, h / 5, 0.3, 0, Math.PI * 2)
                ctx.fillStyle = bodyGradient
                ctx.fill()
                ctx.strokeStyle = bossData.accentColor
                ctx.lineWidth = 3
                ctx.stroke()

                // Tail
                ctx.beginPath()
                ctx.moveTo(-w * 0.2, h * 0.3)
                for (let i = 0; i < 10; i++) {
                    const t = i / 10
                    ctx.lineTo(-w * 0.2 - t * w * 0.4, h * 0.3 + Math.sin(boss.animationFrame * 3 + i) * 15)
                }
                ctx.strokeStyle = bossData.color
                ctx.lineWidth = 12 - 8
                ctx.lineCap = "round"
                ctx.stroke()
            } else if (shape === "ghost") {
                // Ethereal ghost shape
                ctx.beginPath()
                ctx.ellipse(0, -h * 0.1, w / 2.5, h / 3, 0, Math.PI, Math.PI * 2)
                ctx.fillStyle = bodyGradient
                ctx.fill()

                // Flowing bottom
                ctx.beginPath()
                ctx.moveTo(-w / 2.5, -h * 0.1)
                for (let i = 0; i <= 6; i++) {
                    const x = -w / 2.5 + (i / 6) * (w / 1.25)
                    const wave = Math.sin(boss.animationFrame * 2 + i) * 15
                    const y = h * 0.3 + wave + (i % 2 === 0 ? 20 : 0)
                    ctx.lineTo(x, y)
                }
                ctx.lineTo(w / 2.5, -h * 0.1)
                ctx.closePath()
                ctx.fillStyle = bodyGradient
                ctx.fill()

                // Glow effect
                ctx.globalAlpha = 0.3 + Math.sin(boss.animationFrame) * 0.2
                ctx.beginPath()
                ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2)
                ctx.fillStyle = bossData.accentColor
                ctx.fill()
                ctx.globalAlpha = 1
            } else if (shape === "fish") {
                // Deep sea creature with fins
                ctx.beginPath()
                ctx.ellipse(0, 0, w / 2.2, h / 3.5, 0, 0, Math.PI * 2)
                ctx.fillStyle = bodyGradient
                ctx.fill()
                ctx.strokeStyle = bossData.accentColor
                ctx.lineWidth = 3
                ctx.stroke()

                // Dorsal fin
                ctx.beginPath()
                ctx.moveTo(-w * 0.1, -h * 0.25)
                ctx.quadraticCurveTo(0, -h * 0.5, w * 0.15, -h * 0.25)
                ctx.fillStyle = bossData.accentColor
                ctx.fill()

                // Side fins
                for (let s = -1; s <= 1; s += 2) {
                    ctx.beginPath()
                    ctx.moveTo(0, s * h * 0.2)
                    ctx.quadraticCurveTo(w * 0.3, s * h * 0.4, w * 0.1, s * h * 0.25)
                    ctx.fillStyle = bossData.color
                    ctx.fill()
                }

                // Tail
                ctx.beginPath()
                ctx.moveTo(-w * 0.35, 0)
                ctx.lineTo(-w * 0.55, -h * 0.25)
                ctx.lineTo(-w * 0.45, 0)
                ctx.lineTo(-w * 0.55, h * 0.25)
                ctx.closePath()
                ctx.fillStyle = bossData.accentColor
                ctx.fill()

                // Angler light
                ctx.beginPath()
                ctx.moveTo(w * 0.35, -h * 0.1)
                ctx.quadraticCurveTo(w * 0.5, -h * 0.3, w * 0.45, -h * 0.15)
                ctx.strokeStyle = bossData.color
                ctx.lineWidth = 3
                ctx.stroke()
                ctx.beginPath()
                ctx.arc(w * 0.45, -h * 0.15, 8, 0, Math.PI * 2)
                ctx.fillStyle = bossData.eyeColor
                ctx.fill()
            } else if (shape === "insect") {
                // Insectoid with mandibles
                // Thorax
                ctx.beginPath()
                ctx.ellipse(0, -h * 0.1, w / 3.5, h / 4, 0, 0, Math.PI * 2)
                ctx.fillStyle = bodyGradient
                ctx.fill()

                // Abdomen
                ctx.beginPath()
                ctx.ellipse(-w * 0.25, h * 0.1, w / 4, h / 3, -0.3, 0, Math.PI * 2)
                ctx.fillStyle = bossData.color
                ctx.fill()

                // Head
                ctx.beginPath()
                ctx.ellipse(w * 0.2, -h * 0.15, w / 5, h / 5, 0, 0, Math.PI * 2)
                ctx.fillStyle = bodyGradient
                ctx.fill()

                // Mandibles
                for (let s = -1; s <= 1; s += 2) {
                    ctx.beginPath()
                    ctx.moveTo(w * 0.35, -h * 0.1 + s * h * 0.05)
                    ctx.quadraticCurveTo(w * 0.5, -h * 0.1 + s * h * 0.15, w * 0.4, -h * 0.1 + s * h * 0.02)
                    ctx.strokeStyle = bossData.accentColor
                    ctx.lineWidth = 6
                    ctx.lineCap = "round"
                    ctx.stroke()
                }

                // Legs
                for (let i = 0; i < 6; i++) {
                    const side = i < 3 ? -1 : 1
                    const idx = i % 3
                    const angle = (idx - 1) * 0.4 + boss.animationFrame * 0.5
                    ctx.beginPath()
                    ctx.moveTo(0, side * h * 0.15)
                    ctx.lineTo(Math.cos(angle) * w * 0.4, side * (h * 0.15 + Math.sin(angle) * h * 0.2))
                    ctx.strokeStyle = bossData.color
                    ctx.lineWidth = 4
                    ctx.stroke()
                }
            } else if (shape === "void") {
                // Abstract void with many eyes
                ctx.beginPath()
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2
                    const spike = 1 + Math.sin(boss.animationFrame * 3 + i * 2) * 0.3
                    const r = w / 2.5 * spike
                    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r * 0.85)
                }
                ctx.closePath()
                ctx.fillStyle = bodyGradient
                ctx.fill()

                // Multiple eyes scattered
                for (let i = 0; i < 7; i++) {
                    const ex = (Math.sin(i * 1.5) * w * 0.25)
                    const ey = (Math.cos(i * 1.2) * h * 0.2)
                    const size = 6 + (i % 3) * 4
                    ctx.beginPath()
                    ctx.arc(ex, ey, size, 0, Math.PI * 2)
                    ctx.fillStyle = bossData.eyeColor
                    ctx.fill()
                    ctx.beginPath()
                    ctx.arc(ex + 2, ey, size * 0.5, 0, Math.PI * 2)
                    ctx.fillStyle = "#000000"
                    ctx.fill()
                }

                // Void tendrils
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 + boss.animationFrame * 0.4
                    ctx.beginPath()
                    ctx.moveTo(0, 0)
                    for (let j = 1; j <= 6; j++) {
                        const t = j / 6
                        const wave = Math.sin(boss.animationFrame * 3 + i + j) * 15
                        ctx.lineTo(Math.cos(angle) * w * 0.5 * t + wave, Math.sin(angle) * h * 0.4 * t)
                    }
                    ctx.strokeStyle = bossData.color + "88"
                    ctx.lineWidth = 5
                    ctx.lineCap = "round"
                    ctx.stroke()
                }

                ctx.restore()
                return // Skip default eyes
            } else if (shape === "mech") {
                // Mechanical alien overlord
                // Main body - hexagonal
                ctx.beginPath()
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2
                    ctx.lineTo(Math.cos(angle) * w / 2.5, Math.sin(angle) * h / 2.5)
                }
                ctx.closePath()
                ctx.fillStyle = bodyGradient
                ctx.fill()
                ctx.strokeStyle = bossData.eyeColor
                ctx.lineWidth = 4
                ctx.stroke()

                // Inner details
                ctx.beginPath()
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2
                    ctx.lineTo(Math.cos(angle) * w / 4, Math.sin(angle) * h / 4)
                }
                ctx.closePath()
                ctx.strokeStyle = bossData.accentColor
                ctx.lineWidth = 2
                ctx.stroke()

                // Weapon arms
                for (let s = -1; s <= 1; s += 2) {
                    ctx.beginPath()
                    ctx.moveTo(0, s * h * 0.2)
                    ctx.lineTo(-w * 0.4, s * h * 0.35)
                    ctx.lineTo(-w * 0.5, s * h * 0.3)
                    ctx.strokeStyle = bossData.accentColor
                    ctx.lineWidth = 8
                    ctx.lineCap = "square"
                    ctx.stroke()

                    // Cannon
                    ctx.beginPath()
                    ctx.arc(-w * 0.5, s * h * 0.3, 12, 0, Math.PI * 2)
                    ctx.fillStyle = bossData.eyeColor
                    ctx.fill()
                }

                // Antenna
                ctx.beginPath()
                ctx.moveTo(0, -h * 0.35)
                ctx.lineTo(0, -h * 0.55)
                ctx.strokeStyle = bossData.accentColor
                ctx.lineWidth = 4
                ctx.stroke()
                ctx.beginPath()
                ctx.arc(0, -h * 0.55, 6, 0, Math.PI * 2)
                ctx.fillStyle = bossData.eyeColor
                ctx.fill()
            } else {
                // Default blob fallback
                ctx.beginPath()
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2
                    const wobble = Math.sin(boss.animationFrame * 2 + i) * 5
                    const r = w / 2.5 + wobble
                    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r * 0.8)
                }
                ctx.closePath()
                ctx.fillStyle = bodyGradient
                ctx.fill()
            }

            // Standard eyes (skip for void shape)
            if (shape !== "void") {
                const eyeSpacing = w * 0.12
                const eyeY = -h * 0.08
                const eyeSize = 8 + level
                for (let i = -1; i <= 1; i += 2) {
                    ctx.beginPath()
                    ctx.ellipse(i * eyeSpacing, eyeY, eyeSize, eyeSize * 1.2, 0, 0, Math.PI * 2)
                    ctx.fillStyle = "#ffffff"
                    ctx.fill()
                    ctx.strokeStyle = "#000000"
                    ctx.lineWidth = 2
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.arc(i * eyeSpacing + 2, eyeY + 2, eyeSize * 0.5, 0, Math.PI * 2)
                    ctx.fillStyle = bossData.eyeColor
                    ctx.fill()
                    ctx.beginPath()
                    ctx.arc(i * eyeSpacing + 2, eyeY + 2, eyeSize * 0.25, 0, Math.PI * 2)
                    ctx.fillStyle = "#000000"
                    ctx.fill()
                }
            }

            ctx.restore()
        }

        const drawProjectile = (projectile: Projectile) => {
            ctx.save()
            ctx.translate(projectile.x, projectile.y)

            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, projectile.radius * 3)
            glowGradient.addColorStop(0, projectile.color)
            glowGradient.addColorStop(0.5, projectile.color + "88")
            glowGradient.addColorStop(1, "transparent")
            ctx.fillStyle = glowGradient
            ctx.beginPath()
            ctx.arc(0, 0, projectile.radius * 3, 0, Math.PI * 2)
            ctx.fill()

            ctx.beginPath()
            ctx.arc(0, 0, projectile.radius, 0, Math.PI * 2)
            ctx.fillStyle = "#ffffff"
            ctx.fill()

            ctx.restore()
        }

        const drawExplosion = (explosion: Explosion) => {
            ctx.save()
            ctx.translate(explosion.x, explosion.y)

            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, explosion.radius)
            gradient.addColorStop(0, `rgba(255, 200, 50, ${explosion.alpha})`)
            gradient.addColorStop(0.5, `rgba(255, 100, 0, ${explosion.alpha * 0.6})`)
            gradient.addColorStop(1, "transparent")
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(0, 0, explosion.radius, 0, Math.PI * 2)
            ctx.fill()

            ctx.restore()
        }

        const createBossProjectile = (boss: Boss): Projectile[] => {
            const projectiles: Projectile[] = []
            const centerX = boss.x
            const centerY = boss.y + boss.height / 2
            const player = playerRef.current

            const angleToPlayer = Math.atan2(
                player.y + player.height / 2 - centerY,
                player.x + player.width / 2 - centerX
            )

            const count = bossData.projectileCount
            const spread = Math.PI / 6

            for (let i = 0; i < count; i++) {
                const offsetAngle = (i - (count - 1) / 2) * (spread / count)
                const angle = angleToPlayer + offsetAngle

                projectiles.push({
                    x: centerX,
                    y: centerY,
                    vx: Math.cos(angle) * bossData.projectileSpeed,
                    vy: Math.sin(angle) * bossData.projectileSpeed,
                    radius: 8,
                    damage: 1,
                    isPlayerProjectile: false,
                    color: bossData.eyeColor,
                })
            }

            return projectiles
        }

        const gameLoop = () => {
            if (showVictory) {
                gameLoopRef.current = requestAnimationFrame(gameLoop)
                return
            }

            const player = playerRef.current
            const boss = bossRef.current
            const displayWidth = canvasSizeRef.current.width
            const displayHeight = canvasSizeRef.current.height

            // Background
            const bgGradient = ctx.createRadialGradient(
                displayWidth * 0.7,
                displayHeight * 0.5,
                0,
                displayWidth * 0.5,
                displayHeight * 0.5,
                displayWidth * 0.8
            )
            bgGradient.addColorStop(0, "#1a0a2e")
            bgGradient.addColorStop(0.5, "#0a0a1a")
            bgGradient.addColorStop(1, "#000000")
            ctx.fillStyle = bgGradient
            ctx.fillRect(0, 0, displayWidth, displayHeight)

            drawBackgroundStars()

            // Player controls
            let ax = 0, ay = 0
            if (keysRef.current.has("ArrowUp") || keysRef.current.has("KeyW")) ay -= ACCELERATION
            if (keysRef.current.has("ArrowDown") || keysRef.current.has("KeyS")) ay += ACCELERATION
            if (keysRef.current.has("ArrowLeft") || keysRef.current.has("KeyA")) ax -= ACCELERATION
            if (keysRef.current.has("ArrowRight") || keysRef.current.has("KeyD")) ax += ACCELERATION

            player.vx += ax
            player.vy += ay
            player.vx *= FRICTION
            player.vy *= FRICTION

            const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy)
            if (speed > MAX_SPEED) {
                player.vx = (player.vx / speed) * MAX_SPEED
                player.vy = (player.vy / speed) * MAX_SPEED
            }

            player.x += player.vx
            player.y += player.vy

            // Boundaries
            player.x = Math.max(20, Math.min(displayWidth * 0.6, player.x))
            player.y = Math.max(20, Math.min(displayHeight - player.height - 20, player.y))

            // Invincibility timer
            if (player.invincible) {
                player.invincibleTimer--
                if (player.invincibleTimer <= 0) {
                    player.invincible = false
                }
            }

            // Player shooting
            const shooting = keysRef.current.has("Space")
            const now = Date.now()
            if (shooting && now - lastFireTimeRef.current > PLAYER_FIRE_RATE) {
                projectilesRef.current.push({
                    x: player.x + player.width,
                    y: player.y + player.height / 2,
                    vx: PLAYER_PROJECTILE_SPEED,
                    vy: 0,
                    radius: 5,
                    damage: playerDamage,
                    isPlayerProjectile: true,
                    color: "#00ffff",
                })
                lastFireTimeRef.current = now
            }

            // Boss movement
            const targetY = player.y + player.height / 2 - boss.height / 2
            boss.y += (targetY - boss.y) * 0.02
            boss.y = Math.max(50, Math.min(displayHeight - boss.height - 50, boss.y))

            // Boss attacking
            if (now - lastBossAttackRef.current > bossData.attackSpeed) {
                const newProjectiles = createBossProjectile(boss)
                projectilesRef.current.push(...newProjectiles)
                lastBossAttackRef.current = now
            }

            // Boss hit flash decay
            if (boss.hitFlash > 0) {
                boss.hitFlash -= 2
            }

            // Update phase
            const healthPercent = boss.health / boss.maxHealth
            if (healthPercent <= 0.25 && boss.phase < 3) {
                boss.phase = 3
                setPhase(3)
            } else if (healthPercent <= 0.5 && boss.phase < 2) {
                boss.phase = 2
                setPhase(2)
            }

            // Update projectiles
            projectilesRef.current = projectilesRef.current.filter((projectile) => {
                projectile.x += projectile.vx
                projectile.y += projectile.vy

                // Out of bounds
                if (
                    projectile.x < -50 ||
                    projectile.x > displayWidth + 50 ||
                    projectile.y < -50 ||
                    projectile.y > displayHeight + 50
                ) {
                    return false
                }

                // Player projectile hitting boss
                if (projectile.isPlayerProjectile) {
                    const dx = projectile.x - (boss.x + boss.width / 2)
                    const dy = projectile.y - (boss.y + boss.height / 2)
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < boss.width / 2) {
                        boss.health -= projectile.damage
                        boss.hitFlash = 20
                        setBossHealth(Math.max(0, (boss.health / boss.maxHealth) * 100))

                        // Add score for hitting boss
                        scoreRef.current += 10
                        setScore(scoreRef.current)

                        explosionsRef.current.push({
                            x: projectile.x,
                            y: projectile.y,
                            radius: 5,
                            maxRadius: 30,
                            alpha: 1,
                        })

                        if (boss.health <= 0) {
                            // Boss defeated!
                            scoreRef.current += 5000 + level * 1000
                            setScore(scoreRef.current)
                            setShowVictory(true)
                            setTimeout(() => {
                                onBossDefeated(scoreRef.current)
                            }, 2000)
                        }
                        return false
                    }
                }

                // Boss projectile hitting player
                if (!projectile.isPlayerProjectile && !player.invincible) {
                    const dx = projectile.x - (player.x + player.width / 2)
                    const dy = projectile.y - (player.y + player.height / 2)
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < player.width / 2 + projectile.radius) {
                        playerLivesRef.current--
                        setPlayerLives(playerLivesRef.current)
                        player.invincible = true
                        player.invincibleTimer = 120

                        explosionsRef.current.push({
                            x: player.x + player.width / 2,
                            y: player.y + player.height / 2,
                            radius: 5,
                            maxRadius: 40,
                            alpha: 1,
                        })

                        if (playerLivesRef.current <= 0) {
                            cancelAnimationFrame(gameLoopRef.current)
                            onPlayerDied(scoreRef.current)
                            return false
                        }
                        return false
                    }
                }

                drawProjectile(projectile)
                return true
            })

            // Update explosions
            explosionsRef.current = explosionsRef.current.filter((explosion) => {
                explosion.radius += 2
                explosion.alpha -= 0.05
                if (explosion.alpha <= 0) return false
                drawExplosion(explosion)
                return true
            })

            drawPlayer(player)
            drawBoss(boss)

            gameLoopRef.current = requestAnimationFrame(gameLoop)
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop)

        const handleKeyDown = (e: KeyboardEvent) => {
            keysRef.current.add(e.code)
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            keysRef.current.delete(e.code)
        }

        // Touch controls for mobile
        const handleTouchStart = (e: TouchEvent) => {
            e.preventDefault()
            const touch = e.touches[0]
            const rect = canvas.getBoundingClientRect()
            const x = touch.clientX - rect.left
            const y = touch.clientY - rect.top

            // Simple touch zones
            if (x < rect.width / 3) {
                if (y < rect.height / 2) keysRef.current.add("ArrowUp")
                else keysRef.current.add("ArrowDown")
            } else if (x < (rect.width * 2) / 3) {
                if (y < rect.height / 2) keysRef.current.add("ArrowLeft")
                else keysRef.current.add("ArrowRight")
            } else {
                keysRef.current.add("Space")
            }
        }

        const handleTouchEnd = () => {
            keysRef.current.clear()
        }

        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keyup", handleKeyUp)
        if (isTouchDevice) {
            canvas.addEventListener("touchstart", handleTouchStart)
            canvas.addEventListener("touchend", handleTouchEnd)
        }

        return () => {
            window.removeEventListener("resize", resizeCanvas)
            window.removeEventListener("keydown", handleKeyDown)
            window.removeEventListener("keyup", handleKeyUp)
            if (isTouchDevice) {
                canvas.removeEventListener("touchstart", handleTouchStart)
                canvas.removeEventListener("touchend", handleTouchEnd)
            }
            cancelAnimationFrame(gameLoopRef.current)
        }
    }, [level, bossData, showVictory, onBossDefeated, onPlayerDied, isTouchDevice])

    return (
        <div className="fixed inset-0 z-50 bg-black">
            <canvas ref={canvasRef} className="block w-full h-full" style={{ touchAction: "none" }} />

            {/* Boss info HUD */}
            <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
                <div className="max-w-4xl mx-auto">
                    {/* Boss name and health */}
                    <div className="glass rounded-xl p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Skull className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                                <span className="font-display text-sm sm:text-lg font-bold" style={{ color: bossData.color }}>
                                    {bossData.name}
                                </span>
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                    Phase {phase}/3
                                </span>
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                                Level {level + 1}
                            </div>
                        </div>
                        <div className="h-3 sm:h-4 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                    width: `${bossHealth}%`,
                                    background: `linear-gradient(90deg, #ff0000, ${bossData.color})`,
                                    boxShadow: `0 0 10px ${bossData.color}`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Player stats */}
            <div className="absolute bottom-4 left-4 pointer-events-none">
                <div className="glass rounded-lg px-3 py-2 sm:px-4 sm:py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${i < playerLives ? "bg-red-500" : "bg-muted"
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                            Score: <span className="text-primary font-bold">{score.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile controls hint */}
            {isTouchDevice && (
                <div className="absolute bottom-20 left-0 right-0 text-center pointer-events-none">
                    <p className="text-xs text-muted-foreground/60">
                        Left: Move | Center: Direction | Right: Shoot
                    </p>
                </div>
            )}

            {/* Victory overlay */}
            {showVictory && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-60">
                    <div className="glass-strong rounded-2xl p-8 text-center animate-pulse-glow">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                        <h2 className="font-display text-3xl font-bold text-gradient-fire mb-2">
                            BOSS DEFEATED!
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            {bossData.name} has been vanquished!
                        </p>
                        <p className="text-xl text-primary font-display mt-4">
                            +{5000 + level * 1000} points
                        </p>
                    </div>
                </div>
            )}

            {/* Controls hint for desktop */}
            {!isTouchDevice && (
                <div className="absolute bottom-4 right-4 pointer-events-none">
                    <div className="glass rounded-lg px-3 py-2 text-xs text-muted-foreground">
                        WASD/Arrows: Move | Space: Shoot
                    </div>
                </div>
            )}
        </div>
    )
}
