# Intergalactic Pizza Delivery Game

A thrilling space adventure game built with Next.js, TypeScript, and HTML5 Canvas.

## About

Navigate through space, dodge asteroids, collect stars, and deliver pizza across 10 challenging levels from Earth Orbit to Deep Space!

## Features

- 🚀 **10 Progressive Levels**: Journey through space with increasing difficulty
- 🎮 **Dual Control Systems**: Keyboard (WASD/Arrows) and mobile touch controls
- ⭐ **Combo System**: Chain star collections for bonus points
- ⛽ **Fuel Management**: Strategic boosting with regenerating fuel
- 💪 **Lives & Invincibility**: Three lives with temporary invincibility after hits
- 🎨 **Modern UI**: Glassmorphism effects and smooth animations
- 📱 **Responsive Design**: Optimized for desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to play!

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **UI Components**: Radix UI
- **Game Engine**: HTML5 Canvas
- **Fonts**: Google Fonts (Orbitron, JetBrains Mono)
- **Analytics**: Vercel Analytics

## How to Play

### Desktop Controls
- **Arrow Keys / WASD**: Move your rocket
- **Space / Shift**: Boost (uses fuel)
- **ESC**: Pause game

### Mobile Controls
- **Virtual Joystick**: Move your rocket (bottom-left)
- **Boost Button**: Activate boost (bottom-right)

### Objective
- Avoid asteroids to preserve your lives
- Collect stars for points and combo multipliers
- Complete the required distance to progress through levels
- Reach the Space Station to win!

## Project Structure

```
Pizza Delivery/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main game page
│   └── globals.css         # Global styles and animations
├── components/
│   ├── game/               # Game components
│   │   ├── game-screen.tsx # Main game logic
│   │   ├── game-hud.tsx    # Heads-up display
│   │   ├── mobile-controls.tsx
│   │   ├── pause-menu.tsx
│   │   ├── level-transition.tsx
│   │   └── ...
│   └── ...
└── public/                 # Static assets
```

## License

MIT