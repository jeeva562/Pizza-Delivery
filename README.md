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
- ⬆️ **Upgrade System**: Spend earned points to enhance your rocket and weapons

## Upgrade System

Earn points by destroying asteroids and spend them in the Upgrade Shop:

### Rocket Upgrades
- **Speed**: 3 tiers (up to +50% movement speed)
- **Color**: 6 color schemes (Flame Red, Electric Blue, Cosmic Purple, etc.)
- **Shape**: 4 variants (Classic, Sleek Fighter, Heavy Cruiser, Stealth Viper)

### Weapon Upgrades
- **Beam Speed**: 3 tiers (up to +70% projectile speed)
- **Beam Color**: 6 colors (Red Plasma, Green Energy, Purple Void, etc.)
- **Firing Modes**: Single, Double Shot, Triple Spread, Machine Gun

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
- Earn points and upgrade your rocket in the Upgrade Shop
- Reach the Space Station to win!

## Recent Updates

### v1.3.0 (December 2024)
- **Upgrade System**: New points-based upgrade shop with rocket and weapon upgrades
- **Rocket Customization**: Speed tiers, color schemes, and shape variants
- **Weapon Upgrades**: Beam speed, colors, and firing modes (double, triple, machine gun)
- **Persistent Progress**: Upgrades saved to localStorage between sessions
- **UI Improvements**: Upgrade shop accessible from start screen and galaxy map

### v1.2.0 (December 2024)
- **Mobile Fullscreen Fix**: Game now properly fills the entire mobile screen using `100dvh`
- **Visual Viewport API**: Canvas auto-resizes when mobile browser UI appears/disappears
- **Touch Prevention**: Added `overscroll-behavior` and `touch-action` to prevent accidental scrolling

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
│       ├── upgrade-store.tsx # Upgrade shop UI
│       ├── pause-menu.tsx
│       ├── level-transition.tsx
│       └── start-screen.tsx
├── hooks/
│   └── use-upgrades.ts     # Upgrade state management
├── lib/
│   └── upgrade-types.ts    # Upgrade definitions
└── public/                 # Static assets
```

## Deployment

The game is deployed on Vercel: [pizza-delivery-bay.vercel.app](https://pizza-delivery-bay.vercel.app)

## License

MIT
