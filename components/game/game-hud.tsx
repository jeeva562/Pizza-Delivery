"use client"

import { Heart, MapPin, Crosshair, Zap, Skull } from "lucide-react"

interface GameHUDProps {
  score: number
  lives: number
  fuel: number
  distance: number
  level: number
  levelName: string
  levelColor: string
  maxDistance: number
  kills: number
  totalLevels: number
  bossHealth?: number
  bossName?: string
  isBossFight?: boolean
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
  kills,
  totalLevels,
  bossHealth,
  bossName,
  isBossFight = false,
}: GameHUDProps) {
  const progress = (distance / maxDistance) * 100

  return (
    <div className="absolute inset-x-0 top-0 z-40 pointer-events-none">
      {/* Boss Health Bar - Full Width at Top */}
      {isBossFight && bossHealth !== undefined && (
        <div className="bg-black/50 px-4 py-2 sm:py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Skull className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <span className="font-display text-xs sm:text-sm font-bold text-red-400">
                  {bossName || "BOSS"}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {Math.round(bossHealth)}%
              </span>
            </div>
            <div className="h-3 sm:h-4 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${bossHealth}%`,
                  background: `linear-gradient(90deg, #ff0000, #ff6600)`,
                  boxShadow: "0 0 10px #ff0000",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile compact HUD */}
      <div className="sm:hidden">
        <div className="flex items-start justify-between p-2 gap-2">
          {/* Left: Score & Kills */}
          <div className="glass-mobile rounded-lg px-2 py-1 flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span className="font-display text-sm font-bold text-cyan-400">{kills}</span>
            <span className="text-xs text-muted-foreground">|</span>
            <span className="font-display text-sm font-bold text-primary">{score.toLocaleString()}</span>
          </div>

          {/* Center: Lives */}
          <div className="glass-mobile rounded-lg px-2 py-1 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-3.5 h-3.5 transition-all ${i < lives ? "text-red-500 fill-red-500" : "text-muted-foreground/20"
                  }`}
              />
            ))}
          </div>

          {/* Right: Fuel */}
          <div className="glass-mobile rounded-lg px-2 py-1 flex items-center gap-1.5">
            <Zap className={`w-4 h-4 ${fuel > 30 ? "text-primary" : fuel > 15 ? "text-orange-500 animate-pulse" : "text-red-500 animate-pulse"}`} />
            <span className="text-xs text-muted-foreground font-mono font-semibold">{Math.round(fuel)}%</span>
          </div>
        </div>

        {/* Mobile Progress Overlay */}
        {!isBossFight && (
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
        )}
      </div>

      {/* Desktop HUD */}
      <div className="hidden sm:block p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            {/* Left side - Score, Kills & Lives */}
            <div className="flex flex-col gap-3">
              {/* Score & Kills */}
              <div className="glass rounded-lg px-4 py-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-5 h-5 text-cyan-400" />
                  <span className="font-display text-lg font-bold text-cyan-400">{kills}</span>
                  <span className="text-xs text-muted-foreground">KILLS</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <span className="font-display text-xl font-bold text-primary">{score.toLocaleString()}</span>
              </div>

              {/* Lives */}
              <div className="glass rounded-lg px-4 py-2 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 transition-all ${i < lives ? "text-red-500 fill-red-500" : "text-muted-foreground/30"
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Center - Level & Progress */}
            {!isBossFight && (
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
            )}

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

      {/* Kill streak display */}
      {kills > 0 && kills % 10 === 0 && (
        <div className="absolute top-16 sm:top-24 left-1/2 -translate-x-1/2 text-center">
          <div
            className="font-display text-xl sm:text-3xl font-black animate-pulse"
            style={{
              color: levelColor,
              textShadow: `0 0 20px ${levelColor}, 0 0 40px ${levelColor}`,
            }}
          >
            {kills} KILLS!
          </div>
        </div>
      )}

      {/* Controls hint (desktop only) */}
      <div className="absolute bottom-4 right-4 pointer-events-none hidden sm:block">
        <div className="glass rounded-lg px-3 py-2 text-[10px] text-muted-foreground/60">
          WASD: Move | Space: Shoot | Shift: Boost | ESC: Pause
        </div>
      </div>
    </div>
  )
}
