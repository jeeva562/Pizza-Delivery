"use client"

import type React from "react"
import { useCallback, useRef, useState, useEffect } from "react"
import { Zap, RotateCcw } from "lucide-react"

interface MobileControlsProps {
  onControl: (direction: string, active: boolean) => void
}

export function MobileControls({ onControl }: MobileControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null)
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 })
  const [isJoystickActive, setIsJoystickActive] = useState(false)
  const [showRotateHint, setShowRotateHint] = useState(false)
  const activeDirections = useRef<Set<string>>(new Set())

  useEffect(() => {
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth
      const isMobile = window.innerWidth <= 1024 || "ontouchstart" in window
      setShowRotateHint(isPortrait && isMobile)
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
      const threshold = 0.3
      const newDirections = new Set<string>()

      if (y < -threshold) newDirections.add("up")
      if (y > threshold) newDirections.add("down")
      if (x < -threshold) newDirections.add("left")
      if (x > threshold) newDirections.add("right")

      // Remove old directions
      activeDirections.current.forEach((dir) => {
        if (!newDirections.has(dir)) {
          onControl(dir, false)
        }
      })

      // Add new directions
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

      const maxDistance = rect.width / 2 - 20
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

  const handleBoostStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      onControl("boost", true)
    },
    [onControl],
  )

  const handleBoostEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      onControl("boost", false)
    },
    [onControl],
  )

  if (showRotateHint) {
    return (
      <div className="fixed inset-0 z-[100] bg-background/95 flex items-center justify-center">
        <div className="text-center p-8">
          <RotateCcw className="w-20 h-20 mx-auto mb-6 text-primary animate-spin" style={{ animationDuration: "3s" }} />
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Rotate Your Device</h2>
          <p className="text-muted-foreground text-lg">Please rotate to landscape mode for the best experience</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Virtual Joystick - bottom left */}
      <div
        ref={joystickRef}
        className="pointer-events-auto absolute bottom-6 left-6 w-28 h-28 sm:w-32 sm:h-32 rounded-full glass border-2 border-primary/30"
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
      >
        <div
          className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-orange-600 shadow-lg transition-transform duration-75"
          style={{
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`,
          }}
        />
        {/* Direction indicators */}
        <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
          <div className="absolute top-2 text-foreground text-[10px] font-display">▲</div>
          <div className="absolute bottom-2 text-foreground text-[10px] font-display">▼</div>
          <div className="absolute left-2 text-foreground text-[10px] font-display">◀</div>
          <div className="absolute right-2 text-foreground text-[10px] font-display">▶</div>
        </div>
      </div>

      {/* Boost button - bottom right */}
      <button
        className="pointer-events-auto absolute bottom-6 right-6 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/40 active:scale-90 transition-transform border-4 border-primary/50"
        onTouchStart={handleBoostStart}
        onTouchEnd={handleBoostEnd}
      >
        <div className="text-center">
          <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground mx-auto" />
          <span className="text-[9px] sm:text-[10px] font-display text-primary-foreground/80 uppercase">Boost</span>
        </div>
      </button>
    </div>
  )
}
