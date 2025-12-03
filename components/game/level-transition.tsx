"use client"

import { useEffect, useState } from "react"
import { Rocket } from "lucide-react"

interface LevelTransitionProps {
  levelNumber: number
  levelName: string
  levelColor: string
  onComplete: () => void
  totalLevels: number
}

export function LevelTransition({ levelNumber, levelName, levelColor, onComplete, totalLevels }: LevelTransitionProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)

    const timer = setTimeout(() => {
      onComplete()
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div
        className={`text-center transition-all duration-500 px-4 ${show ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
      >
        <Rocket
          className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 animate-bounce"
          style={{ color: levelColor }}
        />

        <p className="font-display text-base sm:text-xl text-muted-foreground mb-2">ENTERING</p>

        <h2
          className="font-display text-3xl sm:text-5xl md:text-7xl font-black mb-2 sm:mb-4"
          style={{
            color: levelColor,
            textShadow: `0 0 30px ${levelColor}, 0 0 60px ${levelColor}40`,
          }}
        >
          LEVEL {levelNumber}
        </h2>

        <p className="font-display text-lg sm:text-2xl font-semibold mb-6 sm:mb-8" style={{ color: levelColor }}>
          {levelName}
        </p>

        <div className="flex justify-center gap-1.5 sm:gap-2 flex-wrap max-w-xs sm:max-w-none mx-auto">
          {Array.from({ length: totalLevels }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${i < levelNumber ? "scale-100" : "scale-75 opacity-50"}`}
              style={{
                backgroundColor: i < levelNumber ? levelColor : "#333",
                boxShadow: i < levelNumber ? `0 0 10px ${levelColor}` : "none",
              }}
            />
          ))}
        </div>

        <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground animate-pulse">Get Ready...</p>
      </div>
    </div>
  )
}
