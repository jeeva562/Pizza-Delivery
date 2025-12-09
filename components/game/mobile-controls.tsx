"use client"

import type React from "react"
import { useCallback, useRef, useState, useEffect } from "react"
import { Zap, RotateCcw, Crosshair } from "lucide-react"

interface MobileControlsProps {
  onControl: (direction: string, active: boolean) => void
}

export function MobileControls({ onControl }: MobileControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null)
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 })
  const [isJoystickActive, setIsJoystickActive] = useState(false)
  const [showRotateHint, setShowRotateHint] = useState(false)
  const [isShooting, setIsShooting] = useState(false)
  const [isBoosting, setIsBoosting] = useState(false)
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md'>('md')
  const activeDirections = useRef<Set<string>>(new Set())

  useEffect(() => {
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth
      const isMobile = window.innerWidth <= 1024 || "ontouchstart" in window
      setShowRotateHint(isPortrait && isMobile)

      // Determine screen size for responsive controls
      const width = window.innerWidth
      const height = window.innerHeight
      const minDim = Math.min(width, height)

      if (minDim < 400 || height < 320) {
        setScreenSize('xs') // Very small screens
      } else if (minDim < 600 || height < 400) {
        setScreenSize('sm') // Small screens
      } else {
        setScreenSize('md') // Medium/larger screens
      }
    }

    checkOrientation()
    window.addEventListener("resize", checkOrientation)
    window.addEventListener("orientationchange", checkOrientation)

    return () => {
      window.removeEventListener("resize", checkOrientation)
      window.removeEventListener("orientationchange", checkOrientation)
    }
  }, [])

  const updateDirections = useCallback(
    (x: number, y: number) => {
      const threshold = 0.2
      const newDirections = new Set<string>()

      if (y < -threshold) newDirections.add("up")
      if (y > threshold) newDirections.add("down")
      if (x < -threshold) newDirections.add("left")
      if (x > threshold) newDirections.add("right")

      activeDirections.current.forEach((dir) => {
        if (!newDirections.has(dir)) {
          onControl(dir, false)
        }
      })

      newDirections.forEach((dir) => {
        if (!activeDirections.current.has(dir)) {
          onControl(dir, true)
        }
      })

      activeDirections.current = newDirections
    },
    [onControl],
  )

  const handleJoystickStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setIsJoystickActive(true)
  }, [])

  const handleJoystickMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isJoystickActive || !joystickRef.current) return
      e.preventDefault()

      const rect = joystickRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const touch = e.touches[0]

      const maxDistance = rect.width / 2 - 12
      let dx = touch.clientX - centerX
      let dy = touch.clientY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > maxDistance) {
        dx = (dx / distance) * maxDistance
        dy = (dy / distance) * maxDistance
      }

      setJoystickPos({ x: dx, y: dy })
      updateDirections(dx / maxDistance, dy / maxDistance)
    },
    [isJoystickActive, updateDirections],
  )

  const handleJoystickEnd = useCallback(() => {
    setIsJoystickActive(false)
    setJoystickPos({ x: 0, y: 0 })
    activeDirections.current.forEach((dir) => onControl(dir, false))
    activeDirections.current.clear()
  }, [onControl])

  const handleShootStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      setIsShooting(true)
      onControl("shoot", true)
    },
    [onControl],
  )

  const handleShootEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      setIsShooting(false)
      onControl("shoot", false)
    },
    [onControl],
  )

  const handleBoostStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      setIsBoosting(true)
      onControl("boost", true)
    },
    [onControl],
  )

  const handleBoostEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      setIsBoosting(false)
      onControl("boost", false)
    },
    [onControl],
  )

  if (showRotateHint) {
    return (
      <div className="fixed inset-0 z-[100] bg-background/95 flex items-center justify-center">
        <div className="text-center p-6">
          <RotateCcw className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" style={{ animationDuration: "3s" }} />
          <h2 className="font-display text-xl font-bold text-foreground mb-2">Rotate Your Device</h2>
          <p className="text-muted-foreground text-sm">Please rotate to landscape mode for the best experience</p>
        </div>
      </div>
    )
  }

  // Responsive sizes based on screen
  const sizes = {
    xs: {
      joystick: 'w-16 h-16',
      joystickThumb: 'w-7 h-7',
      shoot: 'w-12 h-12',
      shootOffset: 'right-20',
      boost: 'w-11 h-11',
      shootIcon: 'w-5 h-5',
      boostIcon: 'w-4 h-4',
      bottom: 'bottom-3',
      leftOffset: 'left-3',
      rightOffset: 'right-3',
      showLabels: false,
      border: 'border-2',
    },
    sm: {
      joystick: 'w-20 h-20',
      joystickThumb: 'w-8 h-8',
      shoot: 'w-14 h-14',
      shootOffset: 'right-24',
      boost: 'w-12 h-12',
      shootIcon: 'w-6 h-6',
      boostIcon: 'w-5 h-5',
      bottom: 'bottom-4',
      leftOffset: 'left-4',
      rightOffset: 'right-4',
      showLabels: false,
      border: 'border-2',
    },
    md: {
      joystick: 'w-24 h-24',
      joystickThumb: 'w-10 h-10',
      shoot: 'w-16 h-16',
      shootOffset: 'right-28',
      boost: 'w-14 h-14',
      shootIcon: 'w-7 h-7',
      boostIcon: 'w-6 h-6',
      bottom: 'bottom-6',
      leftOffset: 'left-6',
      rightOffset: 'right-6',
      showLabels: true,
      border: 'border-3',
    },
  }

  const s = sizes[screenSize]

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Virtual Joystick - bottom left */}
      <div
        ref={joystickRef}
        className={`pointer-events-auto absolute ${s.bottom} ${s.leftOffset} ${s.joystick} rounded-full bg-black/30 ${s.border} transition-all ${isJoystickActive ? "border-primary/70 bg-black/40" : "border-white/20"
          }`}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
      >
        <div
          className={`absolute ${s.joystickThumb} rounded-full bg-gradient-to-br from-primary to-orange-500 shadow-md transition-all duration-75 ${isJoystickActive ? "scale-110" : ""
            }`}
          style={{
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`,
          }}
        />
      </div>

      {/* Shoot button - bottom center-right */}
      <button
        className={`pointer-events-auto absolute ${s.bottom} ${s.shootOffset} ${s.shoot} rounded-full flex items-center justify-center transition-all ${s.border} ${isShooting
            ? "bg-cyan-500/80 scale-90 border-cyan-300"
            : "bg-cyan-600/50 border-cyan-400/40"
          }`}
        onTouchStart={handleShootStart}
        onTouchEnd={handleShootEnd}
      >
        <div className="text-center">
          <Crosshair className={`${s.shootIcon} mx-auto text-white`} />
          {s.showLabels && (
            <span className="text-[8px] font-display uppercase font-bold text-white/80">
              FIRE
            </span>
          )}
        </div>
      </button>

      {/* Boost button - bottom right */}
      <button
        className={`pointer-events-auto absolute ${s.bottom} ${s.rightOffset} ${s.boost} rounded-full flex items-center justify-center transition-all ${s.border} ${isBoosting
            ? "bg-orange-500/80 scale-90 border-orange-300"
            : "bg-orange-600/50 border-orange-400/40"
          }`}
        onTouchStart={handleBoostStart}
        onTouchEnd={handleBoostEnd}
      >
        <div className="text-center">
          <Zap className={`${s.boostIcon} mx-auto text-white`} />
          {s.showLabels && (
            <span className="text-[8px] font-display uppercase font-bold text-white/80">
              BOOST
            </span>
          )}
        </div>
      </button>
    </div>
  )
}
