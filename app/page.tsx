"use client"

import { useState } from "react"
import { GameScreen } from "@/components/game/game-screen"
import { StartScreen } from "@/components/game/start-screen"
import { ParallaxBackground } from "@/components/game/parallax-background"
import { Rocket, Pizza, RotateCcw, Home } from "lucide-react"

export type GameState = "start" | "playing" | "paused" | "gameover" | "victory"

export default function Page() {
  const [gameState, setGameState] = useState<GameState>("start")
  const [finalScore, setFinalScore] = useState(0)

  const handleStartGame = () => {
    setGameState("playing")
    setFinalScore(0)
  }

  const handleGameOver = (score: number) => {
    setFinalScore(score)
    setGameState("gameover")
  }

  const handleVictory = (score: number) => {
    setFinalScore(score)
    setGameState("victory")
  }

  const handleRestart = () => {
    setGameState("start")
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background">
      <ParallaxBackground />

      {gameState === "start" && <StartScreen onStart={handleStartGame} />}

      {gameState === "playing" && <GameScreen onGameOver={handleGameOver} onVictory={handleVictory} />}

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
            <p className="text-xl sm:text-2xl font-display text-primary mb-6 sm:mb-8">
              Score: {finalScore.toLocaleString()}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleStartGame}
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
              <Pizza className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gradient-cosmic mb-3 sm:mb-4">
              Pizza Delivered!
            </h2>
            <p className="text-muted-foreground mb-2 text-sm sm:text-base">
              The galaxy thanks you, brave delivery pilot!
            </p>
            <p className="text-xl sm:text-2xl font-display text-accent mb-6 sm:mb-8">
              Final Score: {finalScore.toLocaleString()}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleStartGame}
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-accent text-accent-foreground font-display font-bold rounded-xl text-base sm:text-lg hover:scale-105 active:scale-95 transition-transform"
              >
                <RotateCcw className="w-5 h-5" />
                Play Again
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
    </main>
  )
}
