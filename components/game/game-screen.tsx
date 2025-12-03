"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import { GameHUD } from "./game-hud"
import { MobileControls } from "./mobile-controls"
import { PauseMenu } from "./pause-menu"
import { LevelTransition } from "./level-transition"

interface GameScreenProps {
  onGameOver: (score: number) => void
  onVictory: (score: number) => void
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

interface Asteroid {
  x: number
  y: number
  radius: number
  speed: number
  rotation: number
  rotationSpeed: number
  vertices: number[]
}

interface Star {
  x: number
  y: number
  radius: number
  speed: number
  pulse: number
  pulseSpeed: number
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
    distance: 20000,
    asteroidRate: 0.012,
    starRate: 0.03,
    asteroidSpeed: 2,
    color: "#00d9ff",
    bgColor: "#0a1628",
  },
  {
    name: "Asteroid Belt",
    distance: 25000,
    asteroidRate: 0.025,
    starRate: 0.025,
    asteroidSpeed: 2.5,
    color: "#ff6b35",
    bgColor: "#1a0f0a",
  },
  {
    name: "Mars Approach",
    distance: 25000,
    asteroidRate: 0.03,
    starRate: 0.028,
    asteroidSpeed: 3,
    color: "#ff4444",
    bgColor: "#1a0a0a",
  },
  {
    name: "Jupiter Gravity",
    distance: 30000,
    asteroidRate: 0.035,
    starRate: 0.025,
    asteroidSpeed: 3.5,
    color: "#ffa500",
    bgColor: "#1a140a",
  },
  {
    name: "Saturn Rings",
    distance: 30000,
    asteroidRate: 0.04,
    starRate: 0.022,
    asteroidSpeed: 4,
    color: "#ffd700",
    bgColor: "#1a1a0a",
  },
  {
    name: "Uranus Ice Field",
    distance: 35000,
    asteroidRate: 0.045,
    starRate: 0.02,
    asteroidSpeed: 4.5,
    color: "#00ffcc",
    bgColor: "#0a1a1a",
  },
  {
    name: "Neptune Storm",
    distance: 35000,
    asteroidRate: 0.05,
    starRate: 0.018,
    asteroidSpeed: 5,
    color: "#4466ff",
    bgColor: "#0a0a1a",
  },
  {
    name: "Kuiper Belt",
    distance: 40000,
    asteroidRate: 0.055,
    starRate: 0.015,
    asteroidSpeed: 5.5,
    color: "#aa88ff",
    bgColor: "#140a1a",
  },
  {
    name: "Deep Space",
    distance: 40000,
    asteroidRate: 0.06,
    starRate: 0.012,
    asteroidSpeed: 6,
    color: "#ff66aa",
    bgColor: "#1a0a14",
  },
  {
    name: "Space Station",
    distance: 30000,
    asteroidRate: 0.03,
    starRate: 0.04,
    asteroidSpeed: 4,
    color: "#00ff88",
    bgColor: "#0a1a14",
  },
]

const ACCELERATION = 0.6
const FRICTION = 0.94
const MAX_SPEED = 10
const BOOST_MULTIPLIER = 1.5

export function GameScreen({ onGameOver, onVictory }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const gameLoopRef = useRef<number>(0)
  const keysRef = useRef<Set<string>>(new Set())
  const canvasSizeRef = useRef({ width: 800, height: 600 })
  const backgroundInitializedRef = useRef(false)

  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [fuel, setFuel] = useState(100)
  const [distance, setDistance] = useState(0)
  const [level, setLevel] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showLevelTransition, setShowLevelTransition] = useState(false)
  const [combo, setCombo] = useState(0)
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
  const starsRef = useRef<Star[]>([])
  const backgroundStarsRef = useRef<BackgroundStar[]>([])
  const scoreRef = useRef(0)
  const livesRef = useRef(3)
  const fuelRef = useRef(100)
  const distanceRef = useRef(0)
  const levelRef = useRef(0)
  const comboRef = useRef(0)
  const comboTimerRef = useRef(0)
  const frameCount = useRef(0)

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0)
    }
    checkTouch()
  }, [])

  const initializeBackground = useCallback((width: number, height: number) => {
    if (backgroundInitializedRef.current && backgroundStarsRef.current.length > 0) return
    backgroundStarsRef.current = []
    const starCount = Math.floor((width * height) / 3000)
    for (let i = 0; i < starCount; i++) {
      backgroundStarsRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.3,
      })
    }
    backgroundInitializedRef.current = true
  }, [])

  // Fixed handleMobileControl to properly map directions
  const handleMobileControl = useCallback((direction: string, active: boolean) => {
    const keyMap: Record<string, string> = {
      up: "ArrowUp",
      down: "ArrowDown",
      left: "ArrowLeft",
      right: "ArrowRight",
      boost: "Space",
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
      const width = window.innerWidth
      const height = window.innerHeight

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

    const drawStar = (star: Star) => {
      ctx.save()
      ctx.translate(star.x, star.y)

      const pulse = 1 + Math.sin(star.pulse) * 0.2
      const r = star.radius * pulse

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2)
      gradient.addColorStop(0, "#ffffff")
      gradient.addColorStop(0.3, "#ffdd00")
      gradient.addColorStop(0.6, "#ffaa00")
      gradient.addColorStop(1, "transparent")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(0, 0, r * 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
        const outerX = Math.cos(angle) * r
        const outerY = Math.sin(angle) * r
        const innerAngle = angle + Math.PI / 5
        const innerX = Math.cos(innerAngle) * (r * 0.4)
        const innerY = Math.sin(innerAngle) * (r * 0.4)
        if (i === 0) ctx.moveTo(outerX, outerY)
        else ctx.lineTo(outerX, outerY)
        ctx.lineTo(innerX, innerY)
      }
      ctx.closePath()
      ctx.fillStyle = "#ffdd00"
      ctx.fill()
      ctx.strokeStyle = "#ffaa00"
      ctx.lineWidth = 1
      ctx.stroke()

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
      const radius = 20 + Math.random() * 30 + levelRef.current * 2
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
      }
    }

    const createStar = () => {
      const displayWidth = canvasSizeRef.current.width
      const displayHeight = canvasSizeRef.current.height
      return {
        x: displayWidth + 20,
        y: Math.random() * (displayHeight - 40) + 20,
        radius: 12 + Math.random() * 6,
        speed: 3 + Math.random() * 2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.1 + Math.random() * 0.1,
      }
    }

    const checkCollision = (player: Player, asteroid: Asteroid) => {
      const playerCenterX = player.x + player.width / 2
      const playerCenterY = player.y + player.height / 2
      const playerRadius = Math.min(player.width, player.height) / 2.5

      const dx = playerCenterX - asteroid.x
      const dy = playerCenterY - asteroid.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      return distance < playerRadius + asteroid.radius * 0.8
    }

    const checkStarCollision = (player: Player, star: Star) => {
      const playerCenterX = player.x + player.width / 2
      const playerCenterY = player.y + player.height / 2
      const playerRadius = Math.min(player.width, player.height) / 2

      const dx = playerCenterX - star.x
      const dy = playerCenterY - star.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      return distance < playerRadius + star.radius
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

      const boosting = keysRef.current.has("Space") || keysRef.current.has("ShiftLeft")
      player.boosting = boosting

      let ax = 0,
        ay = 0

      if (keysRef.current.has("ArrowUp") || keysRef.current.has("KeyW")) ay -= ACCELERATION
      if (keysRef.current.has("ArrowDown") || keysRef.current.has("KeyS")) ay += ACCELERATION
      if (keysRef.current.has("ArrowLeft") || keysRef.current.has("KeyA")) ax -= ACCELERATION
      if (keysRef.current.has("ArrowRight") || keysRef.current.has("KeyD")) ax += ACCELERATION

      const speedMultiplier = boosting ? BOOST_MULTIPLIER : 1
      player.vx += ax * speedMultiplier
      player.vy += ay * speedMultiplier

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

      // Combo decay
      if (comboTimerRef.current > 0) {
        comboTimerRef.current--
      } else if (comboRef.current > 0) {
        comboRef.current = 0
        setCombo(0)
      }

      // Spawn asteroids
      if (Math.random() < currentLevel.asteroidRate) {
        asteroidsRef.current.push(createAsteroid())
      }

      // Spawn stars
      if (Math.random() < currentLevel.starRate) {
        starsRef.current.push(createStar())
      }

      // Update and draw asteroids
      asteroidsRef.current = asteroidsRef.current.filter((asteroid) => {
        asteroid.x -= asteroid.speed
        asteroid.rotation += asteroid.rotationSpeed

        if (!player.invincible && checkCollision(player, asteroid)) {
          livesRef.current--
          setLives(livesRef.current)
          player.invincible = true
          player.invincibleTimer = 120
          comboRef.current = 0
          setCombo(0)

          if (livesRef.current <= 0) {
            cancelAnimationFrame(gameLoopRef.current)
            onGameOver(scoreRef.current)
            return false
          }
        }

        if (asteroid.x < -asteroid.radius * 2) return false

        drawAsteroid(asteroid)
        return true
      })

      // Update and draw stars
      starsRef.current = starsRef.current.filter((star) => {
        star.x -= star.speed
        star.pulse += star.pulseSpeed

        if (checkStarCollision(player, star)) {
          comboRef.current++
          comboTimerRef.current = 90
          setCombo(comboRef.current)
          const points = 100 * Math.max(1, comboRef.current)
          scoreRef.current += points
          setScore(scoreRef.current)
          return false
        }

        if (star.x < -30) return false

        drawStar(star)
        return true
      })

      drawPlayer(player)

      // Distance progress
      distanceRef.current += 0.5 + (boosting ? 0.5 : 0)
      setDistance(distanceRef.current)

      // Level completion
      if (distanceRef.current >= currentLevel.distance) {
        if (levelRef.current < LEVELS.length - 1) {
          levelRef.current++
          setLevel(levelRef.current)
          distanceRef.current = 0
          setDistance(0)
          setShowLevelTransition(true)
          asteroidsRef.current = []
          starsRef.current = []
        } else {
          cancelAnimationFrame(gameLoopRef.current)
          onVictory(scoreRef.current)
          return
        }
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
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      cancelAnimationFrame(gameLoopRef.current)
    }
  }, [isPaused, showLevelTransition, onGameOver, onVictory, initializeBackground])

  const handleLevelTransitionComplete = useCallback(() => {
    setShowLevelTransition(false)
  }, [])

  const currentLevel = LEVELS[level]

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-background"
    >
      <canvas ref={canvasRef} className="block w-full h-full" style={{ touchAction: "none" }} />

      <GameHUD
        score={score}
        lives={lives}
        fuel={fuel}
        distance={distance}
        maxDistance={currentLevel.distance}
        level={level}
        levelName={currentLevel.name}
        levelColor={currentLevel.color}
        combo={combo}
        totalLevels={LEVELS.length}
      />

      {isTouchDevice && <MobileControls onControl={handleMobileControl} />}

      {isPaused && <PauseMenu onResume={() => setIsPaused(false)} onQuit={() => window.location.reload()} />}

      {showLevelTransition && (
        <LevelTransition
          levelNumber={level + 1}
          levelName={currentLevel.name}
          levelColor={currentLevel.color}
          totalLevels={LEVELS.length}
          onComplete={handleLevelTransitionComplete}
        />
      )}
    </div>
  )
}
