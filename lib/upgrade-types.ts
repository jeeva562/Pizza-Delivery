// Upgrade System Types and Constants

export interface RocketColor {
    id: string
    name: string
    bodyGradient: string[]
    noseGradient: string[]
    finColor: string
    glowColor: string
    cost: number
}

export interface RocketShape {
    id: string
    name: string
    description: string
    cost: number
}

export interface BeamColor {
    id: string
    name: string
    primary: string
    glow: string
    trail: string
    cost: number
}

export interface UpgradeTier {
    tier: number
    multiplier: number
    cost: number
    name: string
}

export type FiringMode = 'single' | 'double' | 'triple' | 'machinegun'

export interface FiringModeConfig {
    id: FiringMode
    name: string
    description: string
    projectileCount: number
    spreadAngle: number
    fireRateMultiplier: number
    damageMultiplier: number
    cost: number
}

// Rocket Speed Tiers
export const ROCKET_SPEED_TIERS: UpgradeTier[] = [
    { tier: 0, multiplier: 1.0, cost: 0, name: 'Standard' },
    { tier: 1, multiplier: 1.15, cost: 500, name: 'Enhanced' },
    { tier: 2, multiplier: 1.30, cost: 1500, name: 'Advanced' },
    { tier: 3, multiplier: 1.50, cost: 4000, name: 'Ultimate' },
]

// Beam Speed Tiers
export const BEAM_SPEED_TIERS: UpgradeTier[] = [
    { tier: 0, multiplier: 1.0, cost: 0, name: 'Standard' },
    { tier: 1, multiplier: 1.20, cost: 400, name: 'Swift' },
    { tier: 2, multiplier: 1.40, cost: 1200, name: 'Rapid' },
    { tier: 3, multiplier: 1.70, cost: 3000, name: 'Lightning' },
]

// Rocket Colors
export const ROCKET_COLORS: RocketColor[] = [
    {
        id: 'default',
        name: 'Classic Silver',
        bodyGradient: ['#e8e8e8', '#ffffff', '#cccccc', '#999999'],
        noseGradient: ['#cc0000', '#ff3333', '#aa0000'],
        finColor: '#cc0000',
        glowColor: '#ffffff',
        cost: 0,
    },
    {
        id: 'flame',
        name: 'Flame Red',
        bodyGradient: ['#ff4444', '#ff6666', '#cc2222', '#991111'],
        noseGradient: ['#ffaa00', '#ffcc00', '#ff8800'],
        finColor: '#ffaa00',
        glowColor: '#ff4444',
        cost: 800,
    },
    {
        id: 'electric',
        name: 'Electric Blue',
        bodyGradient: ['#0088ff', '#00aaff', '#0066cc', '#004499'],
        noseGradient: ['#00ffff', '#88ffff', '#00cccc'],
        finColor: '#00ffff',
        glowColor: '#00aaff',
        cost: 800,
    },
    {
        id: 'cosmic',
        name: 'Cosmic Purple',
        bodyGradient: ['#8844ff', '#aa66ff', '#6622cc', '#441199'],
        noseGradient: ['#ff44ff', '#ff88ff', '#cc22cc'],
        finColor: '#ff44ff',
        glowColor: '#aa66ff',
        cost: 800,
    },
    {
        id: 'neon',
        name: 'Neon Green',
        bodyGradient: ['#44ff44', '#66ff66', '#22cc22', '#119911'],
        noseGradient: ['#88ff00', '#aaff44', '#66cc00'],
        finColor: '#88ff00',
        glowColor: '#44ff44',
        cost: 800,
    },
    {
        id: 'golden',
        name: 'Golden Glory',
        bodyGradient: ['#ffdd44', '#ffee66', '#ccaa22', '#998811'],
        noseGradient: ['#ffffff', '#ffffcc', '#ddddaa'],
        finColor: '#ffdd44',
        glowColor: '#ffee66',
        cost: 800,
    },
]

// Rocket Shapes
export const ROCKET_SHAPES: RocketShape[] = [
    {
        id: 'classic',
        name: 'Classic',
        description: 'The original pizza delivery rocket',
        cost: 0,
    },
    {
        id: 'sleek',
        name: 'Sleek Fighter',
        description: 'Aerodynamic design for speed demons',
        cost: 1500,
    },
    {
        id: 'heavy',
        name: 'Heavy Cruiser',
        description: 'Tank-like durability with intimidating presence',
        cost: 1500,
    },
    {
        id: 'stealth',
        name: 'Stealth Viper',
        description: 'Angular modern design with sharp edges',
        cost: 1500,
    },
]

// Beam Colors
export const BEAM_COLORS: BeamColor[] = [
    {
        id: 'default',
        name: 'Level Color',
        primary: '#00d9ff',
        glow: '#00d9ff88',
        trail: '#00d9ff',
        cost: 0,
    },
    {
        id: 'plasma',
        name: 'Red Plasma',
        primary: '#ff4444',
        glow: '#ff444488',
        trail: '#ff4444',
        cost: 600,
    },
    {
        id: 'energy',
        name: 'Green Energy',
        primary: '#44ff44',
        glow: '#44ff4488',
        trail: '#44ff44',
        cost: 600,
    },
    {
        id: 'void',
        name: 'Purple Void',
        primary: '#aa44ff',
        glow: '#aa44ff88',
        trail: '#aa44ff',
        cost: 600,
    },
    {
        id: 'sun',
        name: 'Golden Sun',
        primary: '#ffcc00',
        glow: '#ffcc0088',
        trail: '#ffcc00',
        cost: 600,
    },
    {
        id: 'white',
        name: 'White Hot',
        primary: '#ffffff',
        glow: '#ffffff88',
        trail: '#ffffff',
        cost: 600,
    },
]

// Firing Modes
export const FIRING_MODES: FiringModeConfig[] = [
    {
        id: 'single',
        name: 'Single Shot',
        description: 'Standard single projectile',
        projectileCount: 1,
        spreadAngle: 0,
        fireRateMultiplier: 1.0,
        damageMultiplier: 1.0,
        cost: 0,
    },
    {
        id: 'double',
        name: 'Double Shot',
        description: 'Fire two parallel beams',
        projectileCount: 2,
        spreadAngle: 0,
        fireRateMultiplier: 1.0,
        damageMultiplier: 0.7,
        cost: 2000,
    },
    {
        id: 'triple',
        name: 'Triple Spread',
        description: 'Three beams in a fan pattern',
        projectileCount: 3,
        spreadAngle: 15,
        fireRateMultiplier: 0.9,
        damageMultiplier: 0.5,
        cost: 5000,
    },
    {
        id: 'machinegun',
        name: 'Machine Gun',
        description: 'Rapid fire with reduced damage',
        projectileCount: 1,
        spreadAngle: 0,
        fireRateMultiplier: 3.0,
        damageMultiplier: 0.4,
        cost: 8000,
    },
]

// Upgrade State Interface
export interface UpgradeState {
    // Points
    totalPoints: number
    availablePoints: number

    // Rocket upgrades
    rocketSpeedTier: number
    rocketColorId: string
    rocketShapeId: string

    // Beam upgrades
    beamSpeedTier: number
    beamColorId: string
    firingMode: FiringMode

    // Unlocked items (purchased but not necessarily equipped)
    unlockedRocketColors: string[]
    unlockedRocketShapes: string[]
    unlockedBeamColors: string[]
    unlockedFiringModes: FiringMode[]
}

// Default state
export const DEFAULT_UPGRADE_STATE: UpgradeState = {
    totalPoints: 0,
    availablePoints: 0,
    rocketSpeedTier: 0,
    rocketColorId: 'default',
    rocketShapeId: 'classic',
    beamSpeedTier: 0,
    beamColorId: 'default',
    firingMode: 'single',
    unlockedRocketColors: ['default'],
    unlockedRocketShapes: ['classic'],
    unlockedBeamColors: ['default'],
    unlockedFiringModes: ['single'],
}

// Helper to get applied stats
export function getAppliedStats(state: UpgradeState) {
    const rocketSpeedMultiplier = ROCKET_SPEED_TIERS[state.rocketSpeedTier]?.multiplier ?? 1
    const beamSpeedMultiplier = BEAM_SPEED_TIERS[state.beamSpeedTier]?.multiplier ?? 1
    const rocketColor = ROCKET_COLORS.find(c => c.id === state.rocketColorId) ?? ROCKET_COLORS[0]
    const beamColor = BEAM_COLORS.find(c => c.id === state.beamColorId) ?? BEAM_COLORS[0]
    const firingModeConfig = FIRING_MODES.find(m => m.id === state.firingMode) ?? FIRING_MODES[0]
    const rocketShape = ROCKET_SHAPES.find(s => s.id === state.rocketShapeId) ?? ROCKET_SHAPES[0]

    return {
        rocketSpeedMultiplier,
        beamSpeedMultiplier,
        rocketColor,
        beamColor,
        firingModeConfig,
        rocketShape,
    }
}
