"use client"

import { useState, useEffect, useCallback } from 'react'
import {
    UpgradeState,
    DEFAULT_UPGRADE_STATE,
    ROCKET_SPEED_TIERS,
    BEAM_SPEED_TIERS,
    ROCKET_COLORS,
    ROCKET_SHAPES,
    BEAM_COLORS,
    FIRING_MODES,
    FiringMode,
    getAppliedStats,
} from '@/lib/upgrade-types'

const STORAGE_KEY = 'pizza-delivery-upgrades'

export function useUpgrades() {
    const [upgradeState, setUpgradeState] = useState<UpgradeState>(DEFAULT_UPGRADE_STATE)
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsed = JSON.parse(saved) as Partial<UpgradeState>

                // Ensure default items are always in unlock arrays
                const unlockedRocketColors = Array.from(new Set([
                    'default',
                    ...(parsed.unlockedRocketColors || [])
                ]))
                const unlockedRocketShapes = Array.from(new Set([
                    'classic',
                    ...(parsed.unlockedRocketShapes || [])
                ]))
                const unlockedBeamColors = Array.from(new Set([
                    'default',
                    ...(parsed.unlockedBeamColors || [])
                ]))
                const unlockedFiringModes = Array.from(new Set([
                    'single' as FiringMode,
                    ...(parsed.unlockedFiringModes || [])
                ]))

                setUpgradeState(prev => ({
                    ...prev,
                    ...parsed,
                    unlockedRocketColors,
                    unlockedRocketShapes,
                    unlockedBeamColors,
                    unlockedFiringModes,
                }))
            }
        } catch (e) {
            console.error('Failed to load upgrade state:', e)
        }
        setIsLoaded(true)
    }, [])

    // Save to localStorage on state change
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(upgradeState))
            } catch (e) {
                console.error('Failed to save upgrade state:', e)
            }
        }
    }, [upgradeState, isLoaded])

    // Add points (called when player earns points in game)
    const addPoints = useCallback((points: number) => {
        setUpgradeState(prev => ({
            ...prev,
            totalPoints: prev.totalPoints + points,
            availablePoints: prev.availablePoints + points,
        }))
    }, [])

    // Purchase rocket speed tier
    const purchaseRocketSpeed = useCallback((tier: number) => {
        const tierConfig = ROCKET_SPEED_TIERS[tier]
        if (!tierConfig) return false

        setUpgradeState(prev => {
            // Check if already at this tier or higher
            if (prev.rocketSpeedTier >= tier) return prev

            // Check if previous tier is purchased (must purchase in order)
            if (tier > 0 && prev.rocketSpeedTier < tier - 1) return prev

            // Check if can afford
            if (prev.availablePoints < tierConfig.cost) return prev

            return {
                ...prev,
                availablePoints: prev.availablePoints - tierConfig.cost,
                rocketSpeedTier: tier,
            }
        })
        return true
    }, [])

    // Purchase beam speed tier
    const purchaseBeamSpeed = useCallback((tier: number) => {
        const tierConfig = BEAM_SPEED_TIERS[tier]
        if (!tierConfig) return false

        setUpgradeState(prev => {
            if (prev.beamSpeedTier >= tier) return prev
            if (tier > 0 && prev.beamSpeedTier < tier - 1) return prev
            if (prev.availablePoints < tierConfig.cost) return prev

            return {
                ...prev,
                availablePoints: prev.availablePoints - tierConfig.cost,
                beamSpeedTier: tier,
            }
        })
        return true
    }, [])

    // Purchase and unlock rocket color
    const purchaseRocketColor = useCallback((colorId: string) => {
        const color = ROCKET_COLORS.find(c => c.id === colorId)
        if (!color) return false

        setUpgradeState(prev => {
            // Already unlocked? Just equip it
            if (prev.unlockedRocketColors.includes(colorId)) {
                return { ...prev, rocketColorId: colorId }
            }

            // Check if can afford
            if (prev.availablePoints < color.cost) return prev

            return {
                ...prev,
                availablePoints: prev.availablePoints - color.cost,
                rocketColorId: colorId,
                unlockedRocketColors: [...prev.unlockedRocketColors, colorId],
            }
        })
        return true
    }, [])

    // Equip already unlocked rocket color
    const equipRocketColor = useCallback((colorId: string) => {
        setUpgradeState(prev => {
            if (!prev.unlockedRocketColors.includes(colorId)) return prev
            return { ...prev, rocketColorId: colorId }
        })
    }, [])

    // Purchase and unlock rocket shape
    const purchaseRocketShape = useCallback((shapeId: string) => {
        const shape = ROCKET_SHAPES.find(s => s.id === shapeId)
        if (!shape) return false

        setUpgradeState(prev => {
            if (prev.unlockedRocketShapes.includes(shapeId)) {
                return { ...prev, rocketShapeId: shapeId }
            }

            if (prev.availablePoints < shape.cost) return prev

            return {
                ...prev,
                availablePoints: prev.availablePoints - shape.cost,
                rocketShapeId: shapeId,
                unlockedRocketShapes: [...prev.unlockedRocketShapes, shapeId],
            }
        })
        return true
    }, [])

    // Equip already unlocked rocket shape
    const equipRocketShape = useCallback((shapeId: string) => {
        setUpgradeState(prev => {
            if (!prev.unlockedRocketShapes.includes(shapeId)) return prev
            return { ...prev, rocketShapeId: shapeId }
        })
    }, [])

    // Purchase and unlock beam color
    const purchaseBeamColor = useCallback((colorId: string) => {
        const color = BEAM_COLORS.find(c => c.id === colorId)
        if (!color) return false

        setUpgradeState(prev => {
            if (prev.unlockedBeamColors.includes(colorId)) {
                return { ...prev, beamColorId: colorId }
            }

            if (prev.availablePoints < color.cost) return prev

            return {
                ...prev,
                availablePoints: prev.availablePoints - color.cost,
                beamColorId: colorId,
                unlockedBeamColors: [...prev.unlockedBeamColors, colorId],
            }
        })
        return true
    }, [])

    // Equip already unlocked beam color
    const equipBeamColor = useCallback((colorId: string) => {
        setUpgradeState(prev => {
            if (!prev.unlockedBeamColors.includes(colorId)) return prev
            return { ...prev, beamColorId: colorId }
        })
    }, [])

    // Purchase and unlock firing mode
    const purchaseFiringMode = useCallback((mode: FiringMode) => {
        const modeConfig = FIRING_MODES.find(m => m.id === mode)
        if (!modeConfig) return false

        setUpgradeState(prev => {
            if (prev.unlockedFiringModes.includes(mode)) {
                return { ...prev, firingMode: mode }
            }

            if (prev.availablePoints < modeConfig.cost) return prev

            return {
                ...prev,
                availablePoints: prev.availablePoints - modeConfig.cost,
                firingMode: mode,
                unlockedFiringModes: [...prev.unlockedFiringModes, mode],
            }
        })
        return true
    }, [])

    // Equip already unlocked firing mode
    const equipFiringMode = useCallback((mode: FiringMode) => {
        setUpgradeState(prev => {
            if (!prev.unlockedFiringModes.includes(mode)) return prev
            return { ...prev, firingMode: mode }
        })
    }, [])

    // Reset all upgrades (refund all points)
    const resetUpgrades = useCallback(() => {
        setUpgradeState(prev => ({
            ...DEFAULT_UPGRADE_STATE,
            totalPoints: prev.totalPoints,
            availablePoints: prev.totalPoints,
        }))
    }, [])

    // Get computed stats for gameplay
    const appliedStats = getAppliedStats(upgradeState)

    return {
        upgradeState,
        appliedStats,
        isLoaded,
        addPoints,
        purchaseRocketSpeed,
        purchaseBeamSpeed,
        purchaseRocketColor,
        equipRocketColor,
        purchaseRocketShape,
        equipRocketShape,
        purchaseBeamColor,
        equipBeamColor,
        purchaseFiringMode,
        equipFiringMode,
        resetUpgrades,
    }
}

export type UseUpgradesReturn = ReturnType<typeof useUpgrades>
