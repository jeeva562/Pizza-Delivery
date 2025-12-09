"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { StartScreen } from "@/components/game/start-screen"
import { ParallaxBackground } from "@/components/game/parallax-background"
import { Rocket, Pizza, RotateCcw, Home, Trophy, Star } from "lucide-react"

// Lazy load heavy game components to reduce initial bundle
const GameScreen = dynamic(() => import("@/components/game/game-screen").then(mod => ({ default: mod.GameScreen })), {
  loading: () => <div className="fixed inset-0 flex items-center justify-center bg-background"><div className="text-primary animate-pulse">Loading...</div></div>
})
const BossFight = dynamic(() => import("@/components/game/boss-fight").then(mod => ({ default: mod.BossFight })), {
  loading: () => <div className="fixed inset-0 flex items-center justify-center bg-background"><div className="text-primary animate-pulse">Loading Boss...</div></div>
})
const GalaxyMap = dynamic(() => import("@/components/game/galaxy-map").then(mod => ({ default: mod.GalaxyMap })), {
  loading: () => <div className="fixed inset-0 flex items-center justify-center bg-background"><div className="text-primary animate-pulse">Loading Map...</div></div>
})

export type GameState =
  | "start"
  | "playing"
  | "boss-fight"
  | "galaxy-map"
  | "gameover"
  | "victory"

export default function Page() {
  const [gameState, setGameState] = useState<GameState>("start")
  const [currentLevel, setCurrentLevel] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [completedLevels, setCompletedLevels] = useState<number[]>([])
  const [bossLevel, setBossLevel] = useState(0)

  const handleStartGame = useCallback(() => {
    setGameState("playing")
    setCurrentLevel(0)
    setTotalScore(0)
    setCompletedLevels([])
  }, [])

  const handleGameOver = useCallback((score: number) => {
    setTotalScore(score)
    setGameState("gameover")
  }, [])

  const handleVictory = useCallback((score: number) => {
    setTotalScore(score)
    setGameState("victory")
  }, [])

  const handleBossFight = useCallback((level: number, score: number) => {
    setBossLevel(level)
    setTotalScore(score)
    setGameState("boss-fight")
  }, [])

  const handleBossDefeated = useCallback((score: number) => {
    setTotalScore(score)
    setCompletedLevels(prev => [...prev, bossLevel])

    // Check if this was the final level
    if (bossLevel >= 9) {
      setGameState("victory")
    } else {
      // Show galaxy map and prepare for next level
      setCurrentLevel(bossLevel + 1)
      setGameState("galaxy-map")
    }
  }, [bossLevel])

  const handlePlayerDied = useCallback((score: number) => {
    setTotalScore(score)
    setGameState("gameover")
  }, [])

  const handleGalaxyMapContinue = useCallback(() => {
    setGameState("playing")
  }, [])

  const handleGalaxyMapLevelSelect = useCallback((level: number) => {
    setCurrentLevel(level)
    setGameState("playing")
  }, [])

  const handleRestart = useCallback(() => {
    setGameState("start")
    setCurrentLevel(0)
    setTotalScore(0)
    setCompletedLevels([])
  }, [])

  const handleContinueFromGameOver = useCallback(() => {
    // Continue from last completed level or current level
    setGameState("playing")
  }, [])

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background">
      <ParallaxBackground />

      {gameState === "start" && <StartScreen onStart={handleStartGame} />}

      {gameState === "playing" && (
        <GameScreen
          onGameOver={handleGameOver}
          onVictory={handleVictory}
          onBossFight={handleBossFight}
          currentLevel={currentLevel}
        />
      )}

      {gameState === "boss-fight" && (
        <BossFight
          level={bossLevel}
          currentScore={totalScore}
          onBossDefeated={handleBossDefeated}
          onPlayerDied={handlePlayerDied}
        />
      )}

      {gameState === "galaxy-map" && (
        <GalaxyMap
          currentLevel={currentLevel}
          completedLevels={completedLevels}
          totalScore={totalScore}
          onContinue={handleGalaxyMapContinue}
          onLevelSelect={handleGalaxyMapLevelSelect}
        />
      )}

      {gameState === "gameover" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="glass-strong rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-4 w-full">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
              <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-destructive rotate-45" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gradient-fire mb-3 sm:mb-4">
              Mission Failed
            </h2>
            <p className="text-muted-foreground mb-2 text-sm sm:text-base">The pizza got cold in space...</p>

            <div className="glass rounded-xl p-4 mb-6">
              <div className="flex justify-around">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">SCORE</p>
                  <p className="font-display text-xl text-primary">{totalScore.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">LEVEL</p>
                  <p className="font-display text-xl text-accent">{currentLevel + 1}/10</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">COMPLETED</p>
                  <p className="font-display text-xl text-green-400">{completedLevels.length}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleContinueFromGameOver}
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground font-display font-bold rounded-xl text-base sm:text-lg hover:scale-105 active:scale-95 transition-transform animate-pulse-glow"
              >
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={handleRestart}
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-secondary text-secondary-foreground font-display font-bold rounded-xl text-base sm:text-lg hover:scale-105 active:scale-95 transition-transform"
              >
                <Home className="w-5 h-5" />
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === "victory" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="glass-strong rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-4 w-full">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-accent/20 flex items-center justify-center animate-pulse-glow">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gradient-cosmic mb-3 sm:mb-4">
              GALAXY CONQUERED!
            </h2>
            <p className="text-muted-foreground mb-2 text-sm sm:text-base">
              The universe is forever grateful, brave delivery pilot!
            </p>

            <div className="glass rounded-xl p-4 mb-6">
              <div className="flex justify-around">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">FINAL SCORE</p>
                  <p className="font-display text-2xl text-primary">{totalScore.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">BOSSES DEFEATED</p>
                  <p className="font-display text-2xl text-red-400">{completedLevels.length}/10</p>
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${completedLevels.includes(i) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleStartGame}
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-accent text-accent-foreground font-display font-bold rounded-xl text-base sm:text-lg hover:scale-105 active:scale-95 transition-transform"
              >
                <RotateCcw className="w-5 h-5" />
                New Game+
              </button>
              <button
                onClick={handleRestart}
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-secondary text-secondary-foreground font-display font-bold rounded-xl text-base sm:text-lg hover:scale-105 active:scale-95 transition-transform"
              >
                <Home className="w-5 h-5" />
                Main Menu
              </button>
            </div>

            {/* Decorative pizzas */}
            <div className="absolute -top-8 -left-8 animate-float opacity-50">
              <Pizza className="w-16 h-16 text-primary" />
            </div>
            <div className="absolute -bottom-8 -right-8 animate-float-reverse opacity-50">
              <Pizza className="w-20 h-20 text-accent" />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
