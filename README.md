# Intergalactic Pizza Delivery Game

A thrilling space adventure game built with Next.js, TypeScript, and HTML5 Canvas.

## About

Navigate through space, dodge asteroids, defeat epic bosses, and deliver pizza across 10 challenging levels from Earth Orbit to Deep Space!

## Features

- 🚀 **10 Progressive Levels**: Journey through space with increasing difficulty
- 👾 **Epic Boss Fights**: Each level ends with a unique boss battle
- 🔫 **Shooting System**: Destroy asteroids and bosses with your laser
- 🎮 **Dual Control Systems**: Keyboard (WASD/Arrows + Space) and mobile touch controls
- ⛽ **Fuel Management**: Strategic boosting with regenerating fuel
- 💪 **Lives & Invincibility**: Five lives with temporary invincibility after hits
- 🎨 **Modern UI**: Glassmorphism effects and smooth animations
- 📱 **Mobile Optimized**: Full-screen support with dynamic viewport handling
- 🗺️ **Galaxy Map**: Visual progression through the solar system

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
- **Space**: Shoot lasers
- **Shift**: Boost (uses fuel)
- **ESC**: Pause game

### Mobile Controls
- **Virtual Joystick**: Move your rocket (bottom-left)
- **Fire Button**: Shoot lasers (bottom-center-right)
- **Boost Button**: Activate boost (bottom-right)

### Objective
- Shoot or avoid asteroids to preserve your lives
- Complete the required distance to reach the boss
- Defeat the boss to progress to the next level
- Reach the Space Station to win!

## Recent Updates

### v1.2.0 (December 2024)
- **Mobile Fullscreen Fix**: Game now properly fills the entire mobile screen using `100dvh` (dynamic viewport height)
- **Visual Viewport API**: Canvas auto-resizes when mobile browser UI appears/disappears
- **Touch Prevention**: Added `overscroll-behavior` and `touch-action` to prevent accidental scrolling during gameplay
- **Boss Fight Improvements**: Same fullscreen fixes applied to boss battles

### v1.1.0
- Added shooting mechanics with destroyable asteroids
- 10 unique boss fights with different attack patterns
- Galaxy map for level progression
- Improved HUD for mobile devices

## Project Structure

```
Pizza Delivery/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main game page
│   └── globals.css         # Global styles and animations
├── components/
│   └── game/               # Game components
│       ├── game-screen.tsx # Main game logic & canvas
│       ├── boss-fight.tsx  # Boss battle system
│       ├── game-hud.tsx    # Heads-up display
│       ├── mobile-controls.tsx
│       ├── galaxy-map.tsx  # Level selection map
│       ├── pause-menu.tsx
│       ├── level-transition.tsx
│       └── start-screen.tsx
└── public/                 # Static assets
```

## Deployment

The game is deployed on Vercel: [pizza-delivery-bay.vercel.app](https://pizza-delivery-bay.vercel.app)

## License

MIT