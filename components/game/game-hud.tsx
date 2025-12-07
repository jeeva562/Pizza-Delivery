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
    <div className="absolute inset-x-0 top-0 z-40 pointer-events-none">
      {/* Mobile compact HUD */}
      <div className="sm:hidden">
        <div className="flex items-start justify-between p-2 gap-2">
          {/* Left: Score & Lives combined */}
          <div className="glass-mobile rounded-lg px-2 py-1 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            <span className="font-display text-sm font-bold text-primary">{score.toLocaleString()}</span>
            <div className="flex gap-0.5 ml-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-3.5 h-3.5 transition-all ${i < lives ? "text-red-500 fill-red-500" : "text-muted-foreground/20"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Right: Fuel */}
          <div className="glass-mobile rounded-lg px-2 py-1 flex items-center gap-1.5">
            <Zap className={`w-4 h-4 ${fuel > 30 ? "text-primary" : fuel > 15 ? "text-orange-500 animate-pulse" : "text-red-500 animate-pulse"}`} />
            <span className="text-xs text-muted-foreground font-mono font-semibold">{Math.round(fuel)}%</span>
          </div>
        </div>

        {/* Mobile Progress Overlay - Transparent */}
        <div className="absolute top-12 left-0 right-0 px-3">
          <div className="glass-mobile rounded-full px-3 py-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-display font-semibold" style={{ color: levelColor }}>
                {level + 1}/{totalLevels} - {levelName}
              </span>
              <span className="text-[10px] text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  background: `linear-gradient(90deg, ${levelColor}, ${levelColor}aa)`,
                  boxShadow: `0 0 8px ${levelColor}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop HUD */}
      <div className="hidden sm:block p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            {/* Left side - Score & Lives */}
            <div className="flex flex-col gap-3">
              {/* Score */}
              <div className="glass rounded-lg px-4 py-2 flex items-center gap-3">
                <Star className="w-5 h-5 text-primary" />
                <span className="font-display text-xl font-bold text-primary">{score.toLocaleString()}</span>
                {combo > 1 && <span className="text-accent font-display text-sm animate-pulse">x{combo}</span>}
              </div>

              {/* Lives */}
              <div className="glass rounded-lg px-4 py-2 flex items-center gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 transition-all ${i < lives ? "text-red-500 fill-red-500" : "text-muted-foreground/30"
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Center - Level & Progress */}
            <div className="flex-1 max-w-md">
              <div className="glass rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: levelColor }} />
                    <span className="font-display text-sm font-semibold" style={{ color: levelColor }}>
                      {level + 1}/{totalLevels}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {levelName}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      background: `linear-gradient(90deg, ${levelColor}, ${levelColor}88)`,
                      boxShadow: `0 0 10px ${levelColor}`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right side - Fuel gauge */}
            <div className="flex flex-col gap-3 items-end">
              {/* Fuel */}
              <div className="glass rounded-lg px-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className={`w-4 h-4 ${fuel > 30 ? "text-primary" : "text-orange-500"}`} />
                  <span className="text-xs text-muted-foreground font-mono font-semibold">{Math.round(fuel)}%</span>
                </div>
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
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
