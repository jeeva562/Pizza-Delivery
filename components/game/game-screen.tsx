"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import { GameHUD } from "./game-hud"
import { MobileControls } from "./mobile-controls"
import { PauseMenu } from "./pause-menu"
import { LevelTransition } from "./level-transition"
import {
  RocketColor,
  RocketShape,
  BeamColor,
  FiringModeConfig,
  ROCKET_COLORS,
  ROCKET_SHAPES,
  BEAM_COLORS,
  FIRING_MODES,
} from "@/lib/upgrade-types"

interface AppliedStats {
  rocketSpeedMultiplier: number
  beamSpeedMultiplier: number
  rocketColor: RocketColor
  beamColor: BeamColor
  firingModeConfig: FiringModeConfig
  rocketShape: RocketShape
}

interface GameScreenProps {
  onGameOver: (score: number) => void
  onVictory: (score: number) => void
  onBossFight: (level: number, score: number) => void
  currentLevel?: number
  appliedStats?: AppliedStats
  onPointsEarned?: (points: number) => void
}

interface Player {
  x: number
  y: number
  width: number
  height: number
  vx: number
  vy: number
  boosting: boolean
  invincible: boolean
  invincibleTimer: number
}

interface Projectile {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  damage: number
  color: string
}

interface Asteroid {
  x: number
  y: number
  radius: number
  speed: number
  rotation: number
  rotationSpeed: number
  vertices: number[]
  health: number
  maxHealth: number
}

interface Explosion {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
  particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[]
}

interface BackgroundStar {
  x: number
  y: number
  size: number
  speed: number
  alpha: number
}

const LEVELS = [
  {
    name: "Earth Orbit",
    distance: 12000,
    asteroidRate: 0.015,
    asteroidSpeed: 2.0,
    color: "#00d9ff",
    bgColor: "#0a1628",
    bossName: "Void Crawler",
  },
  {
    name: "Asteroid Belt",
    distance: 15000,
    asteroidRate: 0.022,
    asteroidSpeed: 2.5,
    color: "#ff6b35",
    bgColor: "#1a0f0a",
    bossName: "Rock Titan",
  },
  {
    name: "Mars Approach",
    distance: 18000,
    asteroidRate: 0.028,
    asteroidSpeed: 2.8,
    color: "#ff4444",
    bgColor: "#1a0a0a",
    bossName: "Crimson Warlord",
  },
  {
    name: "Jupiter Gravity",
    distance: 20000,
    asteroidRate: 0.032,
    asteroidSpeed: 3.2,
    color: "#ffa500",
    bgColor: "#1a140a",
    bossName: "Storm King",
  },
  {
    name: "Saturn Rings",
    distance: 22000,
    asteroidRate: 0.035,
    asteroidSpeed: 3.5,
    color: "#ffd700",
    bgColor: "#1a1a0a",
    bossName: "Ring Serpent",
  },
  {
    name: "Uranus Ice Field",
    distance: 24000,
    asteroidRate: 0.038,
    asteroidSpeed: 3.8,
    color: "#00ffcc",
    bgColor: "#0a1a1a",
    bossName: "Frost Phantom",
  },
  {
    name: "Neptune Storm",
    distance: 26000,
    asteroidRate: 0.04,
    asteroidSpeed: 4.0,
    color: "#4466ff",
    bgColor: "#0a0a1a",
    bossName: "Abyss Leviathan",
  },
  {
    name: "Kuiper Belt",
    distance: 28000,
    asteroidRate: 0.042,
    asteroidSpeed: 4.2,
    color: "#aa88ff",
    bgColor: "#140a1a",
    bossName: "Swarm Queen",
  },
  {
    name: "Deep Space",
    distance: 30000,
    asteroidRate: 0.045,
    asteroidSpeed: 4.5,
    color: "#ff66aa",
    bgColor: "#1a0a14",
    bossName: "Dark Matter Entity",
  },
  {
    name: "Space Station",
    distance: 25000,
    asteroidRate: 0.035,
    asteroidSpeed: 4.0,
    color: "#00ff88",
    bgColor: "#0a1a14",
    bossName: "Final Overlord",
  },
]

// Physics constants
const ACCELERATION = 0.8
const FRICTION = 0.88
const MAX_SPEED = 10
const BOOST_MULTIPLIER = 2.0
const BOOST_ACCELERATION = 1.2

// Shooting constants
const PROJECTILE_SPEED = 14
const FIRE_RATE = 120 // ms between shots
const PROJECTILE_DAMAGE = 15

export function GameScreen({ onGameOver, onVictory, onBossFight, currentLevel = 0, appliedStats, onPointsEarned }: GameScreenProps) {
  // Default stats if none provided
  const stats = appliedStats || {
    rocketSpeedMultiplier: 1,
    beamSpeedMultiplier: 1,
    rocketColor: ROCKET_COLORS[0],
    beamColor: BEAM_COLORS[0],
    firingModeConfig: FIRING_MODES[0],
    rocketShape: ROCKET_SHAPES[0],
  }
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const gameLoopRef = useRef<number>(0)
  const keysRef = useRef<Set<string>>(new Set())
  const canvasSizeRef = useRef({ width: 800, height: 600 })
  const backgroundInitializedRef = useRef(false)
  const lastFireTimeRef = useRef(0)

  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(5)
  const [fuel, setFuel] = useState(100)
  const [distance, setDistance] = useState(0)
  const [level, setLevel] = useState(currentLevel)
  const [isPaused, setIsPaused] = useState(false)
  const [showLevelTransition, setShowLevelTransition] = useState(false)
  const [kills, setKills] = useState(0)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  const playerRef = useRef<Player>({
    x: 100,
    y: 300,
    width: 60,
    height: 35,
    vx: 0,
    vy: 0,
    boosting: false,
    invincible: false,
    invincibleTimer: 0,
  })

  const asteroidsRef = useRef<Asteroid[]>([])
  const projectilesRef = useRef<Projectile[]>([])
  const explosionsRef = useRef<Explosion[]>([])
  const backgroundStarsRef = useRef<BackgroundStar[]>([])
  const scoreRef = useRef(0)
  const livesRef = useRef(5)
  const fuelRef = useRef(100)
  const distanceRef = useRef(0)
  const levelRef = useRef(currentLevel)
  const killsRef = useRef(0)
  const frameCount = useRef(0)

  useEffect(() => {
    levelRef.current = currentLevel
    setLevel(currentLevel)
  }, [currentLevel])

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0)
    }
    checkTouch()
  }, [])

  const initializeBackground = useCallback((width: number, height: number) => {
    if (backgroundInitializedRef.current && backgroundStarsRef.current.length > 0) return
    backgroundStarsRef.current = []
    const starCount = Math.floor((width * height) / 2500)
    for (let i = 0; i < starCount; i++) {
      backgroundStarsRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 0.5,
        speed: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.3,
      })
    }
    backgroundInitializedRef.current = true
  }, [])

  const handleMobileControl = useCallback((direction: string, active: boolean) => {
    const keyMap: Record<string, string> = {
      up: "ArrowUp",
      down: "ArrowDown",
      left: "ArrowLeft",
      right: "ArrowRight",
      boost: "ShiftLeft",
      shoot: "Space",
    }
    const key = keyMap[direction]
    if (key) {
      if (active) {
        keysRef.current.add(key)
      } else {
        keysRef.current.delete(key)
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      // Use visualViewport for more accurate mobile dimensions when available
      const vv = window.visualViewport
      const width = vv ? vv.width : window.innerWidth
      const height = vv ? vv.height : window.innerHeight

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)

      canvasSizeRef.current = { width, height }
      initializeBackground(width, height)

      playerRef.current.x = Math.min(playerRef.current.x, width - playerRef.current.width - 20)
      playerRef.current.y = Math.min(Math.max(playerRef.current.y, 20), height - playerRef.current.height - 20)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    // Also listen to visualViewport resize for mobile browser UI changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", resizeCanvas)
    }

    const drawPlayer = (player: Player) => {
      ctx.save()
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2)

      const tilt = player.vy * 2
      ctx.rotate((tilt * Math.PI) / 180)

      if (player.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5
      }

      const w = player.width
      const h = player.height

      // Engine flames
      if (player.boosting || Math.random() > 0.3) {
        const flameLength = player.boosting ? 35 + Math.random() * 15 : 20 + Math.random() * 10

        ctx.beginPath()
        ctx.moveTo(-w / 2, -h / 6)
        ctx.quadraticCurveTo(-w / 2 - flameLength * 0.7, 0, -w / 2, h / 6)
        ctx.closePath()

        const flameGradient = ctx.createLinearGradient(-w / 2, 0, -w / 2 - flameLength, 0)
        flameGradient.addColorStop(0, player.boosting ? "#ffffff" : "#ffaa00")
        flameGradient.addColorStop(0.3, player.boosting ? "#00d9ff" : "#ff6600")
        flameGradient.addColorStop(1, "transparent")
        ctx.fillStyle = flameGradient
        ctx.fill()

        ctx.beginPath()
        ctx.moveTo(-w / 2, -h / 10)
        ctx.quadraticCurveTo(-w / 2 - flameLength * 0.5, 0, -w / 2, h / 10)
        ctx.closePath()
        const innerFlame = ctx.createLinearGradient(-w / 2, 0, -w / 2 - flameLength * 0.5, 0)
        innerFlame.addColorStop(0, "#ffffff")
        innerFlame.addColorStop(1, "transparent")
        ctx.fillStyle = innerFlame
        ctx.fill()
      }

      // Rocket body
      const bodyGradient = ctx.createLinearGradient(0, -h / 2, 0, h / 2)
      bodyGradient.addColorStop(0, "#e8e8e8")
      bodyGradient.addColorStop(0.3, "#ffffff")
      bodyGradient.addColorStop(0.7, "#cccccc")
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

      // Red nose cone
      ctx.beginPath()
      ctx.moveTo(w / 2, 0)
      ctx.quadraticCurveTo(w / 3, -h / 4, w / 5, -h / 3.5)
      ctx.lineTo(w / 5, h / 3.5)
      ctx.quadraticCurveTo(w / 3, h / 4, w / 2, 0)
      ctx.closePath()
      const noseGradient = ctx.createLinearGradient(w / 5, 0, w / 2, 0)
      noseGradient.addColorStop(0, "#cc0000")
      noseGradient.addColorStop(0.5, "#ff3333")
      noseGradient.addColorStop(1, "#aa0000")
      ctx.fillStyle = noseGradient
      ctx.fill()

      // Fins
      ctx.beginPath()
      ctx.moveTo(-w / 3, -h / 2.5)
      ctx.lineTo(-w / 2 - 8, -h / 2 - 8)
      ctx.lineTo(-w / 2, -h / 4)
      ctx.closePath()
      ctx.fillStyle = "#cc0000"
      ctx.fill()
      ctx.strokeStyle = "#aa0000"
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-w / 3, h / 2.5)
      ctx.lineTo(-w / 2 - 8, h / 2 + 8)
      ctx.lineTo(-w / 2, h / 4)
      ctx.closePath()
      ctx.fillStyle = "#cc0000"
      ctx.fill()
      ctx.strokeStyle = "#aa0000"
      ctx.stroke()

      // Cockpit window
      ctx.beginPath()
      ctx.ellipse(w / 6, 0, 8, 6, 0, 0, Math.PI * 2)
      const windowGradient = ctx.createRadialGradient(w / 6 - 2, -2, 0, w / 6, 0, 8)
      windowGradient.addColorStop(0, "#88ddff")
      windowGradient.addColorStop(0.7, "#0099cc")
      windowGradient.addColorStop(1, "#006688")
      ctx.fillStyle = windowGradient
      ctx.fill()
      ctx.strokeStyle = "#004466"
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Window shine
      ctx.beginPath()
      ctx.ellipse(w / 6 - 2, -2, 3, 2, -0.5, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255,255,255,0.6)"
      ctx.fill()

      // Pizza box on top
      ctx.fillStyle = "#8B4513"
      ctx.fillRect(-w / 6, -h / 2.5 - 10, w / 3, 8)
      ctx.strokeStyle = "#5D3A1A"
      ctx.strokeRect(-w / 6, -h / 2.5 - 10, w / 3, 8)

      // Pizza circle on box
      ctx.beginPath()
      ctx.arc(0, -h / 2.5 - 6, 6, 0, Math.PI * 2)
      ctx.fillStyle = "#ffcc00"
      ctx.fill()
      ctx.beginPath()
      ctx.arc(-2, -h / 2.5 - 7, 2, 0, Math.PI * 2)
      ctx.arc(2, -h / 2.5 - 5, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = "#cc0000"
      ctx.fill()

      ctx.restore()
    }

    const drawProjectile = (projectile: Projectile) => {
      ctx.save()
      ctx.translate(projectile.x, projectile.y)

      // Glow effect
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, projectile.radius * 3)
      glowGradient.addColorStop(0, projectile.color)
      glowGradient.addColorStop(0.5, projectile.color + "88")
      glowGradient.addColorStop(1, "transparent")
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(0, 0, projectile.radius * 3, 0, Math.PI * 2)
      ctx.fill()

      // Core
      ctx.beginPath()
      ctx.arc(0, 0, projectile.radius, 0, Math.PI * 2)
      ctx.fillStyle = "#ffffff"
      ctx.fill()

      // Trail
      ctx.beginPath()
      ctx.moveTo(0, -projectile.radius * 0.5)
      ctx.lineTo(-projectile.radius * 4, 0)
      ctx.lineTo(0, projectile.radius * 0.5)
      ctx.closePath()
      const trailGradient = ctx.createLinearGradient(0, 0, -projectile.radius * 4, 0)
      trailGradient.addColorStop(0, projectile.color)
      trailGradient.addColorStop(1, "transparent")
      ctx.fillStyle = trailGradient
      ctx.fill()

      ctx.restore()
    }

    const drawAsteroid = (asteroid: Asteroid) => {
      ctx.save()
      ctx.translate(asteroid.x, asteroid.y)
      ctx.rotate(asteroid.rotation)

      const gradient = ctx.createRadialGradient(-asteroid.radius / 3, -asteroid.radius / 3, 0, 0, 0, asteroid.radius)
      gradient.addColorStop(0, "#8a8a8a")
      gradient.addColorStop(0.5, "#5a5a5a")
      gradient.addColorStop(1, "#3a3a3a")

      ctx.beginPath()
      for (let i = 0; i < asteroid.vertices.length; i++) {
        const angle = (i / asteroid.vertices.length) * Math.PI * 2
        const r = asteroid.radius * asteroid.vertices[i]
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()
      ctx.strokeStyle = "#2a2a2a"
      ctx.lineWidth = 2
      ctx.stroke()

      // Health indicator for damaged asteroids
      if (asteroid.health < asteroid.maxHealth) {
        const healthPercent = asteroid.health / asteroid.maxHealth
        ctx.beginPath()
        ctx.arc(0, -asteroid.radius - 8, 6, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(0,0,0,0.5)"
        ctx.fill()
        ctx.beginPath()
        ctx.arc(0, -asteroid.radius - 8, 5, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * healthPercent))
        ctx.strokeStyle = healthPercent > 0.5 ? "#00ff00" : healthPercent > 0.25 ? "#ffaa00" : "#ff0000"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Craters
      for (let i = 0; i < 3; i++) {
        const craterX = (Math.random() - 0.5) * asteroid.radius
        const craterY = (Math.random() - 0.5) * asteroid.radius
        const craterR = asteroid.radius * 0.15
        ctx.beginPath()
        ctx.arc(craterX, craterY, craterR, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(0,0,0,0.3)"
        ctx.fill()
      }

      ctx.restore()
    }

    const drawExplosion = (explosion: Explosion) => {
      ctx.save()
      ctx.translate(explosion.x, explosion.y)

      // Main explosion circle
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, explosion.radius)
      gradient.addColorStop(0, `rgba(255, 200, 50, ${explosion.alpha})`)
      gradient.addColorStop(0.3, `rgba(255, 100, 0, ${explosion.alpha * 0.8})`)
      gradient.addColorStop(0.7, `rgba(255, 50, 0, ${explosion.alpha * 0.5})`)
      gradient.addColorStop(1, "transparent")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(0, 0, explosion.radius, 0, Math.PI * 2)
      ctx.fill()

      // Particles
      explosion.particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 0, ${p.alpha})`
        ctx.fill()
      })

      ctx.restore()
    }

    const drawBackgroundStars = () => {
      const displayWidth = canvasSizeRef.current.width
      const bgStars = backgroundStarsRef.current

      bgStars.forEach((star) => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`
        ctx.fill()

        star.x -= star.speed
        if (star.x < -5) {
          star.x = displayWidth + 5
          star.y = Math.random() * canvasSizeRef.current.height
        }
      })
    }

    const createAsteroid = () => {
      const displayWidth = canvasSizeRef.current.width
      const displayHeight = canvasSizeRef.current.height
      const currentLevel = LEVELS[levelRef.current]

      // Scale asteroids based on screen size - smaller on mobile
      const screenScale = Math.min(displayWidth, displayHeight) / 900
      const sizeType = Math.random()
      let radius: number
      let health: number

      if (sizeType < 0.4) {
        // Small asteroid
        radius = (15 + Math.random() * 10) * screenScale
        health = 15
      } else if (sizeType < 0.75) {
        // Medium asteroid
        radius = (25 + Math.random() * 15) * screenScale
        health = 30
      } else {
        // Large asteroid
        radius = (40 + Math.random() * 20 + levelRef.current * 2) * screenScale
        health = 45 + levelRef.current * 5
      }

      const vertices: number[] = []
      const vertexCount = 8 + Math.floor(Math.random() * 4)
      for (let i = 0; i < vertexCount; i++) {
        vertices.push(0.7 + Math.random() * 0.3)
      }
      return {
        x: displayWidth + radius,
        y: Math.random() * (displayHeight - radius * 2) + radius,
        radius,
        speed: currentLevel.asteroidSpeed + Math.random() * 2,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        vertices,
        health,
        maxHealth: health,
      }
    }

    const createProjectile = (player: Player, angleOffset: number = 0, yOffset: number = 0): Projectile => {
      const currentLevel = LEVELS[levelRef.current]
      const baseSpeed = PROJECTILE_SPEED * stats.beamSpeedMultiplier
      const angle = angleOffset * (Math.PI / 180) // Convert to radians
      const beamColor = stats.beamColor.id === 'default' ? currentLevel.color : stats.beamColor.primary

      return {
        x: player.x + player.width,
        y: player.y + player.height / 2 + yOffset,
        vx: baseSpeed * Math.cos(angle),
        vy: player.vy * 0.2 + baseSpeed * Math.sin(angle),
        radius: 5,
        damage: Math.round(PROJECTILE_DAMAGE * stats.firingModeConfig.damageMultiplier),
        color: beamColor,
      }
    }

    const createProjectiles = (player: Player): Projectile[] => {
      const projectiles: Projectile[] = []
      const mode = stats.firingModeConfig

      if (mode.id === 'single') {
        projectiles.push(createProjectile(player, 0, 0))
      } else if (mode.id === 'double') {
        projectiles.push(createProjectile(player, 0, -6))
        projectiles.push(createProjectile(player, 0, 6))
      } else if (mode.id === 'triple') {
        projectiles.push(createProjectile(player, 0, 0))
        projectiles.push(createProjectile(player, mode.spreadAngle, 0))
        projectiles.push(createProjectile(player, -mode.spreadAngle, 0))
      } else if (mode.id === 'machinegun') {
        projectiles.push(createProjectile(player, 0, 0))
      }

      return projectiles
    }

    const createExplosion = (x: number, y: number, size: number): Explosion => {
      const particles = []
      const particleCount = Math.floor(10 + size / 5)
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 2 + Math.random() * 4
        particles.push({
          x: 0,
          y: 0,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          alpha: 1,
        })
      }
      return {
        x,
        y,
        radius: 5,
        maxRadius: size * 2,
        alpha: 1,
        particles,
      }
    }

    const checkProjectileAsteroidCollision = (projectile: Projectile, asteroid: Asteroid): boolean => {
      const dx = projectile.x - asteroid.x
      const dy = projectile.y - asteroid.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance < projectile.radius + asteroid.radius * 0.9
    }

    const checkPlayerAsteroidCollision = (player: Player, asteroid: Asteroid) => {
      const playerCenterX = player.x + player.width / 2
      const playerCenterY = player.y + player.height / 2
      const playerRadius = Math.min(player.width, player.height) / 2.5

      const dx = playerCenterX - asteroid.x
      const dy = playerCenterY - asteroid.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      return distance < playerRadius + asteroid.radius * 0.8
    }

    const gameLoop = () => {
      if (isPaused || showLevelTransition) {
        gameLoopRef.current = requestAnimationFrame(gameLoop)
        return
      }

      frameCount.current++
      const currentLevel = LEVELS[levelRef.current]
      const player = playerRef.current
      const displayWidth = canvasSizeRef.current.width
      const displayHeight = canvasSizeRef.current.height

      ctx.fillStyle = currentLevel.bgColor
      ctx.fillRect(0, 0, displayWidth, displayHeight)

      drawBackgroundStars()

      const boosting = keysRef.current.has("ShiftLeft") || keysRef.current.has("ShiftRight")
      player.boosting = boosting

      // Shooting - apply firing mode fire rate
      const shooting = keysRef.current.has("Space")
      const now = Date.now()
      const effectiveFireRate = Math.round(FIRE_RATE / stats.firingModeConfig.fireRateMultiplier)
      if (shooting && now - lastFireTimeRef.current > effectiveFireRate) {
        const newProjectiles = createProjectiles(player)
        projectilesRef.current.push(...newProjectiles)
        lastFireTimeRef.current = now
      }

      let ax = 0,
        ay = 0

      if (keysRef.current.has("ArrowUp") || keysRef.current.has("KeyW")) ay -= ACCELERATION
      if (keysRef.current.has("ArrowDown") || keysRef.current.has("KeyS")) ay += ACCELERATION
      if (keysRef.current.has("ArrowLeft") || keysRef.current.has("KeyA")) ax -= ACCELERATION
      if (keysRef.current.has("ArrowRight") || keysRef.current.has("KeyD")) ax += ACCELERATION

      // Apply rocket speed upgrade to movement
      const rocketSpeedBonus = stats.rocketSpeedMultiplier
      const speedMultiplier = (boosting ? BOOST_MULTIPLIER : 1) * rocketSpeedBonus
      const accelMultiplier = (boosting ? BOOST_ACCELERATION : 1) * rocketSpeedBonus
      player.vx += ax * speedMultiplier * accelMultiplier
      player.vy += ay * speedMultiplier * accelMultiplier

      player.vx *= FRICTION
      player.vy *= FRICTION

      const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy)
      const maxSpd = MAX_SPEED * speedMultiplier
      if (speed > maxSpd) {
        player.vx = (player.vx / speed) * maxSpd
        player.vy = (player.vy / speed) * maxSpd
      }

      player.x += player.vx
      player.y += player.vy

      // Boundaries
      if (player.x < 20) {
        player.x = 20
        player.vx *= -0.3
      }
      if (player.x > displayWidth - player.width - 20) {
        player.x = displayWidth - player.width - 20
        player.vx *= -0.3
      }
      if (player.y < 20) {
        player.y = 20
        player.vy *= -0.3
      }
      if (player.y > displayHeight - player.height - 20) {
        player.y = displayHeight - player.height - 20
        player.vy *= -0.3
      }

      // Fuel
      if (boosting && fuelRef.current > 0) {
        fuelRef.current = Math.max(0, fuelRef.current - 0.3)
        setFuel(fuelRef.current)
      } else if (!boosting && fuelRef.current < 100) {
        fuelRef.current = Math.min(100, fuelRef.current + 0.08)
        setFuel(fuelRef.current)
      }

      // Invincibility
      if (player.invincible) {
        player.invincibleTimer--
        if (player.invincibleTimer <= 0) {
          player.invincible = false
        }
      }

      // Spawn asteroids
      if (Math.random() < currentLevel.asteroidRate) {
        asteroidsRef.current.push(createAsteroid())
      }

      // Update projectiles
      projectilesRef.current = projectilesRef.current.filter((projectile) => {
        projectile.x += projectile.vx
        projectile.y += projectile.vy

        if (projectile.x > displayWidth + 20) return false

        // Check collision with asteroids
        for (let i = asteroidsRef.current.length - 1; i >= 0; i--) {
          const asteroid = asteroidsRef.current[i]
          if (checkProjectileAsteroidCollision(projectile, asteroid)) {
            asteroid.health -= projectile.damage

            if (asteroid.health <= 0) {
              // Asteroid destroyed
              explosionsRef.current.push(createExplosion(asteroid.x, asteroid.y, asteroid.radius))

              // Score based on asteroid size
              let points = 50
              if (asteroid.maxHealth > 30) points = 150
              else if (asteroid.maxHealth > 15) points = 100

              scoreRef.current += points
              setScore(scoreRef.current)
              killsRef.current++
              setKills(killsRef.current)

              // Notify parent about points earned for upgrades
              if (onPointsEarned) {
                onPointsEarned(points)
              }

              asteroidsRef.current.splice(i, 1)
            }
            return false
          }
        }

        drawProjectile(projectile)
        return true
      })

      // Update and draw asteroids
      asteroidsRef.current = asteroidsRef.current.filter((asteroid) => {
        asteroid.x -= asteroid.speed
        asteroid.rotation += asteroid.rotationSpeed

        if (!player.invincible && checkPlayerAsteroidCollision(player, asteroid)) {
          livesRef.current--
          setLives(livesRef.current)
          player.invincible = true
          player.invincibleTimer = 120
          explosionsRef.current.push(createExplosion(asteroid.x, asteroid.y, asteroid.radius))

          if (livesRef.current <= 0) {
            cancelAnimationFrame(gameLoopRef.current)
            onGameOver(scoreRef.current)
            return false
          }
          return false
        }

        if (asteroid.x < -asteroid.radius * 2) return false

        drawAsteroid(asteroid)
        return true
      })

      // Update and draw explosions
      explosionsRef.current = explosionsRef.current.filter((explosion) => {
        explosion.radius += 3
        explosion.alpha -= 0.04

        explosion.particles.forEach(p => {
          p.x += p.vx
          p.y += p.vy
          p.alpha -= 0.03
          p.vx *= 0.98
          p.vy *= 0.98
        })

        if (explosion.alpha <= 0) return false

        drawExplosion(explosion)
        return true
      })

      drawPlayer(player)

      // Distance progress
      distanceRef.current += 1.5 + (boosting ? 1.5 : 0)
      setDistance(distanceRef.current)

      // Level completion - trigger boss fight
      if (distanceRef.current >= currentLevel.distance) {
        cancelAnimationFrame(gameLoopRef.current)
        onBossFight(levelRef.current, scoreRef.current)
        return
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)
      if (e.code === "Escape") {
        setIsPaused((p) => !p)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", resizeCanvas)
      }
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      cancelAnimationFrame(gameLoopRef.current)
    }
  }, [isPaused, showLevelTransition, onGameOver, onVictory, onBossFight, initializeBackground])

  const handleLevelTransitionComplete = useCallback(() => {
    setShowLevelTransition(false)
  }, [])

  const currentLevelData = LEVELS[level]

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-background"
      style={{
        width: '100vw',
        height: '100dvh',
        touchAction: 'none',
        overscrollBehavior: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        className="block"
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />

      <GameHUD
        score={score}
        lives={lives}
        fuel={fuel}
        distance={distance}
        maxDistance={currentLevelData.distance}
        level={level}
        levelName={currentLevelData.name}
        levelColor={currentLevelData.color}
        kills={kills}
        totalLevels={LEVELS.length}
      />

      {isTouchDevice && <MobileControls onControl={handleMobileControl} />}

      {isPaused && <PauseMenu onResume={() => setIsPaused(false)} onQuit={() => window.location.reload()} />}

      {showLevelTransition && (
        <LevelTransition
          levelNumber={level + 1}
          levelName={currentLevelData.name}
          levelColor={currentLevelData.color}
          totalLevels={LEVELS.length}
          onComplete={handleLevelTransitionComplete}
        />
      )}
    </div>
  )
}

export { LEVELS }
