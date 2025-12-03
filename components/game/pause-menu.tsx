"use client"

import { Play, LogOut } from "lucide-react"

interface PauseMenuProps {
  onResume: () => void
  onQuit: () => void
}

export function PauseMenu({ onResume, onQuit }: PauseMenuProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-strong rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gradient-cosmic mb-6 sm:mb-8">PAUSED</h2>

        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-primary text-primary-foreground font-display font-bold rounded-xl text-base sm:text-lg hover:scale-105 active:scale-95 transition-transform"
          >
            <Play className="w-5 h-5 sm:w-6 sm:h-6" />
            Resume
          </button>

          <button
            onClick={onQuit}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-destructive/20 text-destructive font-display font-bold rounded-xl text-base sm:text-lg hover:scale-105 active:scale-95 transition-transform border border-destructive/30"
          >
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
            Quit Mission
          </button>
        </div>

        <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground">
          Press <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted rounded font-mono text-xs">ESC</kbd> to resume
        </p>
      </div>
    </div>
  )
}
