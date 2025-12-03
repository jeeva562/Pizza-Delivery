"use client"

import { useState, useEffect } from "react"
import { Rocket, Pizza, Zap, Star, ChevronRight, Gamepad2 } from "lucide-react"

interface StartScreenProps {
  onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
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
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-auto py-4 sm:py-8">
      {/* Animated decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] animate-float opacity-60">
          <Pizza className="w-10 h-10 sm:w-16 sm:h-16 text-primary" />
        </div>
        <div className="absolute top-[25%] right-[15%] animate-float-delayed opacity-50">
          <Star className="w-8 h-8 sm:w-14 sm:h-14 text-accent" />
        </div>
        <div className="absolute bottom-[20%] left-[20%] animate-float-reverse opacity-40">
          <Rocket className="w-8 h-8 sm:w-12 sm:h-12 text-secondary" />
        </div>

        <div className="absolute top-[10%] right-[25%] w-10 h-10 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 animate-float opacity-70" />
        <div className="absolute bottom-[15%] right-[30%] w-14 h-14 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 animate-float-delayed opacity-60">
          <div className="absolute inset-2 rounded-full border-2 sm:border-4 border-amber-200/30 animate-spin-slow" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Logo/Title */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-4">
            <Rocket className="w-6 h-6 sm:w-12 sm:h-12 text-primary animate-float" />
            <Pizza className="w-8 h-8 sm:w-16 sm:h-16 text-primary animate-pulse-glow rounded-full" />
            <Star className="w-6 h-6 sm:w-12 sm:h-12 text-accent animate-float-reverse" />
          </div>

          <h1 className="font-display text-2xl sm:text-5xl md:text-7xl font-black mb-1 sm:mb-4">
            <span className="text-gradient-fire">INTERGALACTIC</span>
          </h1>
          <h2 className="font-display text-xl sm:text-4xl md:text-6xl font-bold text-gradient-cosmic mb-3 sm:mb-6">
            PIZZA DELIVERY
          </h2>

          <p className="text-xs sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Navigate through asteroid fields and deliver the hottest pizza across the galaxy!
          </p>
        </div>

        {/* Play Button */}
        <div className="mb-4 sm:mb-8">
          <button
            onClick={onStart}
            className="group relative px-6 sm:px-12 py-3 sm:py-6 bg-gradient-to-r from-primary via-orange-500 to-primary text-primary-foreground font-display font-bold text-base sm:text-2xl rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse-glow"
          >
            <span className="flex items-center gap-2 sm:gap-3">
              <Gamepad2 className="w-5 h-5 sm:w-8 sm:h-8" />
              START MISSION
              <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8 group-hover:translate-x-2 transition-transform" />
            </span>
          </button>

          {!isTouchDevice && (
            <p className="mt-2 sm:mt-4 text-[10px] sm:text-sm text-muted-foreground">
              Press{" "}
              <kbd className="px-1 sm:px-2 py-0.5 bg-muted rounded text-foreground font-mono text-[10px] sm:text-xs">
                SPACE
              </kbd>{" "}
              to start
            </p>
          )}
          {isTouchDevice && (
            <p className="mt-2 sm:mt-4 text-[10px] sm:text-sm text-muted-foreground">
              Rotate device to landscape for best experience
            </p>
          )}
        </div>

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
                <p className="text-muted-foreground">Use the virtual joystick to move</p>
                <p className="text-muted-foreground">Tap the BOOST button for speed</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-4 text-left text-xs sm:text-base">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded font-mono text-[10px] sm:text-sm">WASD</kbd>
                  <span className="text-muted-foreground">Move</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded font-mono text-[10px] sm:text-sm">SPACE</kbd>
                  <span className="text-muted-foreground">Boost</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded font-mono text-[10px] sm:text-sm">ESC</kbd>
                  <span className="text-muted-foreground">Pause</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded font-mono text-[10px] sm:text-sm">Arrows</kbd>
                  <span className="text-muted-foreground">Move</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mission Objectives */}
        <div className="mt-4 sm:mt-8 glass rounded-xl sm:rounded-2xl p-3 sm:p-6 max-w-2xl mx-auto">
          <h3 className="font-display text-base sm:text-xl font-bold text-accent mb-2 sm:mb-4">Mission Objectives</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center p-1 sm:p-4">
              <Rocket className="w-6 h-6 sm:w-10 sm:h-10 mx-auto text-red-400 mb-1" />
              <p className="text-[10px] sm:text-sm text-muted-foreground">Dodge asteroids</p>
            </div>
            <div className="text-center p-1 sm:p-4">
              <Star className="w-6 h-6 sm:w-10 sm:h-10 mx-auto text-yellow-400 mb-1" />
              <p className="text-[10px] sm:text-sm text-muted-foreground">Collect stars</p>
            </div>
            <div className="text-center p-1 sm:p-4">
              <Pizza className="w-6 h-6 sm:w-10 sm:h-10 mx-auto text-orange-400 mb-1" />
              <p className="text-[10px] sm:text-sm text-muted-foreground">Deliver pizza!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
