"use client"

import { useState, useEffect } from "react"
import { Rocket, Pizza, Zap, Star, ChevronRight, Gamepad2, Crosshair, Skull, Map, Sparkles } from "lucide-react"

interface StartScreenProps {
  onStart: () => void
  onOpenUpgrades?: () => void
  availablePoints?: number
}

export function StartScreen({ onStart, onOpenUpgrades, availablePoints = 0 }: StartScreenProps) {
  const [showControls, setShowControls] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0
    const isSmallScreen = window.innerWidth <= 1024
    setIsTouchDevice(hasTouch && isSmallScreen)

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        onStart()
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [onStart])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-auto py-2 sm:py-8">
      {/* Animated decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] animate-float opacity-60">
          <Pizza className="w-10 h-10 sm:w-16 sm:h-16 text-primary" />
        </div>
        <div className="absolute top-[25%] right-[15%] animate-float-delayed opacity-50">
          <Crosshair className="w-8 h-8 sm:w-14 sm:h-14 text-cyan-400" />
        </div>
        <div className="absolute bottom-[20%] left-[20%] animate-float-reverse opacity-40">
          <Rocket className="w-8 h-8 sm:w-12 sm:h-12 text-secondary" />
        </div>
        <div className="absolute bottom-[30%] right-[10%] animate-float opacity-50">
          <Skull className="w-10 h-10 sm:w-14 sm:h-14 text-red-400" />
        </div>

        <div className="absolute top-[10%] right-[25%] w-10 h-10 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 animate-float opacity-70" />
        <div className="absolute bottom-[15%] right-[30%] w-14 h-14 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 animate-float-delayed opacity-60">
          <div className="absolute inset-2 rounded-full border-2 sm:border-4 border-amber-200/30 animate-spin-slow" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-3 sm:px-4 max-w-4xl mx-auto w-full">
        {/* Logo/Title */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-4">
            <Rocket className="w-8 h-8 sm:w-12 sm:h-12 text-primary animate-float" />
            <Pizza className="w-10 h-10 sm:w-16 sm:h-16 text-primary animate-pulse-glow rounded-full" />
            <Crosshair className="w-8 h-8 sm:w-12 sm:h-12 text-cyan-400 animate-float-reverse" />
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-black mb-2 sm:mb-4 px-2">
            <span className="text-gradient-fire">INTERGALACTIC</span>
          </h1>
          <h2 className="font-display text-2xl sm:text-4xl md:text-6xl font-bold text-gradient-cosmic mb-3 sm:mb-6 px-2">
            PIZZA DELIVERY
          </h2>

          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2 leading-relaxed">
            Blast through asteroids, defeat <span className="text-red-400 font-bold">alien bosses</span>, and deliver pizza across <span className="text-primary font-bold">10 planets</span>!
          </p>
          <p className="text-[10px] sm:text-sm text-muted-foreground/80 max-w-xl mx-auto px-2 mt-2">
            <span className="text-cyan-400">★</span> Shoot to destroy • Battle epic bosses • Travel the galaxy map
          </p>
        </div>

        {/* Play Button */}
        <div className="mb-4 sm:mb-8">
          <button
            onClick={onStart}
            className="group relative px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-primary via-orange-500 to-primary text-primary-foreground font-display font-bold text-lg sm:text-2xl rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse-glow shadow-2xl"
          >
            <span className="flex items-center gap-2 sm:gap-3">
              <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8" />
              START MISSION
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-2 transition-transform" />
            </span>
          </button>

          {!isTouchDevice && (
            <p className="mt-2 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
              Press{" "}
              <kbd className="px-2 py-1 bg-muted rounded text-foreground font-mono text-xs">
                SPACE
              </kbd>{" "}
              to start
            </p>
          )}
          {isTouchDevice && (
            <p className="mt-2 text-xs text-muted-foreground">
              Rotate to landscape for best experience
            </p>
          )}
        </div>

        {/* Upgrades Button */}
        {onOpenUpgrades && (
          <div className="mb-4 sm:mb-8">
            <button
              onClick={onOpenUpgrades}
              className="group relative px-5 sm:px-8 py-2.5 sm:py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white font-display font-bold text-sm sm:text-lg rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
                UPGRADE SHOP
                {availablePoints > 0 && (
                  <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-yellow-400/20 rounded-full text-yellow-300 text-xs">
                    <Star className="w-3 h-3 fill-yellow-300" />
                    {availablePoints.toLocaleString()}
                  </span>
                )}
              </span>
            </button>
          </div>
        )}

        {/* Controls Toggle */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="text-accent hover:text-accent/80 font-display text-sm sm:text-lg flex items-center gap-2 mx-auto transition-colors"
        >
          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
          {showControls ? "Hide Controls" : "Show Controls"}
        </button>

        {/* Controls Panel */}
        {showControls && (
          <div className="mt-3 sm:mt-6 glass rounded-xl sm:rounded-2xl p-3 sm:p-6 max-w-md mx-auto">
            <h3 className="font-display text-base sm:text-xl font-bold text-primary mb-2 sm:mb-4">Controls</h3>

            {isTouchDevice ? (
              <div className="text-left space-y-2 text-xs sm:text-base">
                <p className="text-muted-foreground">🕹️ Use the virtual joystick to move</p>
                <p className="text-muted-foreground">🎯 Tap FIRE button to shoot asteroids</p>
                <p className="text-muted-foreground">⚡ Hold BOOST button for speed</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-4 text-left text-xs sm:text-base">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded font-mono text-[10px] sm:text-sm">WASD</kbd>
                  <span className="text-muted-foreground">Move</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded font-mono text-[10px] sm:text-sm">SPACE</kbd>
                  <span className="text-muted-foreground">Shoot</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded font-mono text-[10px] sm:text-sm">SHIFT</kbd>
                  <span className="text-muted-foreground">Boost</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded font-mono text-[10px] sm:text-sm">ESC</kbd>
                  <span className="text-muted-foreground">Pause</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mission Objectives */}
        <div className="mt-3 sm:mt-8 glass rounded-xl sm:rounded-2xl p-2 sm:p-6 max-w-2xl mx-auto">
          <h3 className="font-display text-sm sm:text-xl font-bold text-accent mb-2 sm:mb-4">Mission Objectives</h3>
          <div className="grid grid-cols-4 gap-1 sm:gap-4">
            <div className="text-center p-1 sm:p-4">
              <Crosshair className="w-5 h-5 sm:w-10 sm:h-10 mx-auto text-cyan-400 mb-0.5 sm:mb-1" />
              <p className="text-[9px] sm:text-sm text-muted-foreground leading-tight">Destroy asteroids</p>
            </div>
            <div className="text-center p-1 sm:p-4">
              <Skull className="w-5 h-5 sm:w-10 sm:h-10 mx-auto text-red-400 mb-0.5 sm:mb-1" />
              <p className="text-[9px] sm:text-sm text-muted-foreground leading-tight">Defeat bosses</p>
            </div>
            <div className="text-center p-1 sm:p-4">
              <Map className="w-5 h-5 sm:w-10 sm:h-10 mx-auto text-purple-400 mb-0.5 sm:mb-1" />
              <p className="text-[9px] sm:text-sm text-muted-foreground leading-tight">Travel galaxy</p>
            </div>
            <div className="text-center p-1 sm:p-4">
              <Pizza className="w-5 h-5 sm:w-10 sm:h-10 mx-auto text-orange-400 mb-0.5 sm:mb-1" />
              <p className="text-[9px] sm:text-sm text-muted-foreground leading-tight">Deliver pizza!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
