"use client"

import { Heart, Crosshair, Zap, Skull } from "lucide-react"

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
      {/* Boss Health Bar - Compact for mobile */}
      {isBossFight && bossHealth !== undefined && (
        <div className="bg-black/40 px-2 py-1 sm:px-4 sm:py-2">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-0.5">
              <Skull className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              <span className="font-display text-[10px] sm:text-xs font-bold text-red-400 flex-1 truncate">
                {bossName || "BOSS"}
              </span>
              <span className="text-[10px] sm:text-xs text-white/70">
                {Math.round(bossHealth)}%
              </span>
            </div>
            <div className="h-1.5 sm:h-2 bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${bossHealth}%`,
                  background: `linear-gradient(90deg, #ff0000, #ff6600)`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile compact HUD - Minimal footprint */}
      <div className="sm:hidden">
        {/* Single row, ultra compact */}
        <div className="flex items-center justify-between px-1 py-0.5 gap-1">
          {/* Left: Score */}
          <div className="flex items-center gap-1 bg-black/30 rounded px-1.5 py-0.5">
            <Crosshair className="w-3 h-3 text-cyan-400" />
            <span className="font-display text-[10px] font-bold text-cyan-400">{kills}</span>
            <span className="text-[8px] text-white/50">|</span>
            <span className="font-display text-[10px] font-bold text-primary">{score > 9999 ? `${Math.floor(score / 1000)}k` : score}</span>
          </div>

          {/* Center: Lives - just hearts, no container */}
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-2.5 h-2.5 ${i < lives ? "text-red-500 fill-red-500" : "text-white/20"}`}
              />
            ))}
          </div>

          {/* Right: Fuel bar only */}
          <div className="flex items-center gap-1 bg-black/30 rounded px-1.5 py-0.5">
            <Zap className={`w-3 h-3 ${fuel > 30 ? "text-primary" : fuel > 15 ? "text-orange-400" : "text-red-400"}`} />
            <div className="w-10 h-1 bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${fuel}%`,
                  background: fuel > 30 ? "var(--primary)" : fuel > 15 ? "#f97316" : "#ef4444",
                }}
              />
            </div>
          </div>
        </div>

        {/* Progress bar - thin line at top, no blocking */}
        {!isBossFight && (
          <div className="px-1">
            <div className="h-0.5 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  background: levelColor,
                }}
              />
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
                    className={`w-5 h-5 transition-all ${i < lives ? "text-red-500 fill-red-500" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
            </div>

            {/* Center - Level & Progress */}
            {!isBossFight && (
              <div className="flex-1 max-w-md">
                <div className="glass rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-sm font-semibold" style={{ color: levelColor }}>
                      {level + 1}/{totalLevels}
                    </span>
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

      {/* Controls hint (desktop only) */}
      <div className="absolute bottom-4 right-4 pointer-events-none hidden sm:block">
        <div className="glass rounded-lg px-3 py-2 text-[10px] text-muted-foreground/60">
          WASD: Move | Space: Shoot | Shift: Boost
        </div>
      </div>
    </div>
  )
}
