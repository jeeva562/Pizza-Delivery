"use client"

import { Heart, MapPin, Star, Zap } from "lucide-react"

interface GameHUDProps {
  score: number
  lives: number
  fuel: number
  distance: number
  level: number
  levelName: string
  levelColor: string
  maxDistance: number
  combo: number
  totalLevels: number
}

export function GameHUD({
  score,
  lives,
  fuel,
  distance,
  level,
  levelName,
  levelColor,
  maxDistance,
  combo,
  totalLevels,
}: GameHUDProps) {
  const progress = (distance / maxDistance) * 100

  return (
    <div className="absolute inset-x-0 top-0 z-40 pointer-events-none p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          {/* Left side - Score & Lives */}
          <div className="flex flex-col gap-1.5 sm:gap-3">
            {/* Score */}
            <div className="glass rounded-lg px-2 sm:px-4 py-1 sm:py-2 flex items-center gap-1.5 sm:gap-3">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="font-display text-sm sm:text-xl font-bold text-primary">{score.toLocaleString()}</span>
              {combo > 1 && <span className="text-accent font-display text-xs sm:text-sm animate-pulse">x{combo}</span>}
            </div>

            {/* Lives */}
            <div className="glass rounded-lg px-2 sm:px-4 py-1 sm:py-2 flex items-center gap-0.5 sm:gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-all ${
                    i < lives ? "text-red-500 fill-red-500" : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Center - Level & Progress */}
          <div className="flex-1 max-w-[140px] sm:max-w-md">
            <div className="glass rounded-lg px-2 sm:px-4 py-1.5 sm:py-3">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: levelColor }} />
                  <span className="font-display text-[10px] sm:text-sm font-semibold" style={{ color: levelColor }}>
                    {level + 1}/{totalLevels}
                  </span>
                </div>
                <span className="text-[9px] sm:text-xs text-muted-foreground truncate max-w-[60px] sm:max-w-none">
                  {levelName}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    background: `linear-gradient(90deg, ${levelColor}, ${levelColor}88)`,
                    boxShadow: `0 0 10px ${levelColor}`,
                  }}
                />
              </div>

              <div className="flex justify-center gap-0.5 mt-1.5 sm:hidden">
                {Array.from({ length: totalLevels }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-1 rounded-full ${i <= level ? "opacity-100" : "opacity-30"}`}
                    style={{ backgroundColor: i <= level ? levelColor : "#666" }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Fuel gauge */}
          <div className="flex flex-col gap-1.5 sm:gap-3 items-end">
            {/* Fuel */}
            <div className="glass rounded-lg px-2 sm:px-4 py-1 sm:py-2">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${fuel > 30 ? "text-primary" : "text-orange-500"}`} />
                <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">{Math.round(fuel)}%</span>
              </div>
              <div className="w-12 sm:w-20 h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${fuel}%`,
                    background: fuel > 30 ? "var(--primary)" : fuel > 15 ? "#f97316" : "#ef4444",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Combo display */}
      {combo > 2 && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 text-center">
          <div
            className="font-display text-xl sm:text-4xl font-black animate-pulse"
            style={{
              color: levelColor,
              textShadow: `0 0 20px ${levelColor}, 0 0 40px ${levelColor}`,
            }}
          >
            {combo}x COMBO!
          </div>
        </div>
      )}
    </div>
  )
}
