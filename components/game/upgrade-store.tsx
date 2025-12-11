"use client"

import { useState } from "react"
import {
    Rocket,
    Zap,
    Palette,
    Target,
    ChevronLeft,
    Check,
    Lock,
    Star,
    Sparkles,
    X,
} from "lucide-react"
import {
    ROCKET_SPEED_TIERS,
    BEAM_SPEED_TIERS,
    ROCKET_COLORS,
    ROCKET_SHAPES,
    BEAM_COLORS,
    FIRING_MODES,
    FiringMode,
} from "@/lib/upgrade-types"
import { UseUpgradesReturn } from "@/hooks/use-upgrades"

interface UpgradeStoreProps {
    upgrades: UseUpgradesReturn
    onClose: () => void
}

type TabType = "rocket" | "beam"
type SubTabType = "speed" | "color" | "shape" | "mode"

export function UpgradeStore({ upgrades, onClose }: UpgradeStoreProps) {
    const [activeTab, setActiveTab] = useState<TabType>("rocket")
    const [activeSubTab, setActiveSubTab] = useState<SubTabType>("speed")

    const { upgradeState, appliedStats } = upgrades

    const handlePurchase = (type: string, id: string | number) => {
        switch (type) {
            case "rocketSpeed":
                upgrades.purchaseRocketSpeed(id as number)
                break
            case "beamSpeed":
                upgrades.purchaseBeamSpeed(id as number)
                break
            case "rocketColor":
                upgrades.purchaseRocketColor(id as string)
                break
            case "rocketShape":
                upgrades.purchaseRocketShape(id as string)
                break
            case "beamColor":
                upgrades.purchaseBeamColor(id as string)
                break
            case "firingMode":
                upgrades.purchaseFiringMode(id as FiringMode)
                break
        }
    }

    const handleEquip = (type: string, id: string) => {
        switch (type) {
            case "rocketColor":
                upgrades.equipRocketColor(id)
                break
            case "rocketShape":
                upgrades.equipRocketShape(id)
                break
            case "beamColor":
                upgrades.equipBeamColor(id)
                break
            case "firingMode":
                upgrades.equipFiringMode(id as FiringMode)
                break
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl glass-strong">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-display text-xl sm:text-2xl font-bold text-gradient-cosmic">
                                Upgrade Shop
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Enhance your delivery rocket
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Points Display */}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <span className="font-display text-lg font-bold text-primary">
                                {upgradeState.availablePoints.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">pts</span>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => { setActiveTab("rocket"); setActiveSubTab("speed") }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-display font-semibold transition-all ${activeTab === "rocket"
                                ? "text-primary bg-primary/10 border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            }`}
                    >
                        <Rocket className="w-5 h-5" />
                        <span>Rocket</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab("beam"); setActiveSubTab("speed") }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-display font-semibold transition-all ${activeTab === "beam"
                                ? "text-cyan-400 bg-cyan-400/10 border-b-2 border-cyan-400"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            }`}
                    >
                        <Target className="w-5 h-5" />
                        <span>Weapons</span>
                    </button>
                </div>

                {/* Sub Tabs */}
                <div className="flex gap-2 p-3 border-b border-white/10 overflow-x-auto">
                    {activeTab === "rocket" ? (
                        <>
                            <SubTabButton
                                active={activeSubTab === "speed"}
                                onClick={() => setActiveSubTab("speed")}
                                icon={<Zap className="w-4 h-4" />}
                                label="Speed"
                            />
                            <SubTabButton
                                active={activeSubTab === "color"}
                                onClick={() => setActiveSubTab("color")}
                                icon={<Palette className="w-4 h-4" />}
                                label="Color"
                            />
                            <SubTabButton
                                active={activeSubTab === "shape"}
                                onClick={() => setActiveSubTab("shape")}
                                icon={<Rocket className="w-4 h-4" />}
                                label="Shape"
                            />
                        </>
                    ) : (
                        <>
                            <SubTabButton
                                active={activeSubTab === "speed"}
                                onClick={() => setActiveSubTab("speed")}
                                icon={<Zap className="w-4 h-4" />}
                                label="Speed"
                            />
                            <SubTabButton
                                active={activeSubTab === "color"}
                                onClick={() => setActiveSubTab("color")}
                                icon={<Palette className="w-4 h-4" />}
                                label="Color"
                            />
                            <SubTabButton
                                active={activeSubTab === "mode"}
                                onClick={() => setActiveSubTab("mode")}
                                icon={<Target className="w-4 h-4" />}
                                label="Fire Mode"
                            />
                        </>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[50vh]">
                    {/* Rocket Speed */}
                    {activeTab === "rocket" && activeSubTab === "speed" && (
                        <div className="space-y-3">
                            <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                Rocket Speed Upgrades
                            </h3>
                            {ROCKET_SPEED_TIERS.map((tier, index) => {
                                const isPurchased = upgradeState.rocketSpeedTier >= tier.tier
                                const canPurchase = tier.tier === 0 || upgradeState.rocketSpeedTier === tier.tier - 1
                                const canAfford = upgradeState.availablePoints >= tier.cost

                                return (
                                    <UpgradeCard
                                        key={tier.tier}
                                        title={tier.name}
                                        description={`+${Math.round((tier.multiplier - 1) * 100)}% speed boost`}
                                        cost={tier.cost}
                                        isPurchased={isPurchased}
                                        isEquipped={isPurchased}
                                        canPurchase={canPurchase && canAfford}
                                        isLocked={!canPurchase && !isPurchased}
                                        onPurchase={() => handlePurchase("rocketSpeed", tier.tier)}
                                    />
                                )
                            })}
                        </div>
                    )}

                    {/* Rocket Color */}
                    {activeTab === "rocket" && activeSubTab === "color" && (
                        <div className="space-y-3">
                            <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-pink-400" />
                                Rocket Colors
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {ROCKET_COLORS.map((color) => {
                                    const isUnlocked = upgradeState.unlockedRocketColors.includes(color.id)
                                    const isEquipped = upgradeState.rocketColorId === color.id
                                    const canAfford = upgradeState.availablePoints >= color.cost

                                    return (
                                        <ColorCard
                                            key={color.id}
                                            name={color.name}
                                            colors={color.bodyGradient}
                                            accentColor={color.glowColor}
                                            cost={color.cost}
                                            isUnlocked={isUnlocked}
                                            isEquipped={isEquipped}
                                            canAfford={canAfford}
                                            onPurchase={() => handlePurchase("rocketColor", color.id)}
                                            onEquip={() => handleEquip("rocketColor", color.id)}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Rocket Shape */}
                    {activeTab === "rocket" && activeSubTab === "shape" && (
                        <div className="space-y-3">
                            <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                                <Rocket className="w-5 h-5 text-orange-400" />
                                Rocket Shapes
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {ROCKET_SHAPES.map((shape) => {
                                    const isUnlocked = upgradeState.unlockedRocketShapes.includes(shape.id)
                                    const isEquipped = upgradeState.rocketShapeId === shape.id
                                    const canAfford = upgradeState.availablePoints >= shape.cost

                                    return (
                                        <ShapeCard
                                            key={shape.id}
                                            name={shape.name}
                                            description={shape.description}
                                            shapeId={shape.id}
                                            cost={shape.cost}
                                            isUnlocked={isUnlocked}
                                            isEquipped={isEquipped}
                                            canAfford={canAfford}
                                            onPurchase={() => handlePurchase("rocketShape", shape.id)}
                                            onEquip={() => handleEquip("rocketShape", shape.id)}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Beam Speed */}
                    {activeTab === "beam" && activeSubTab === "speed" && (
                        <div className="space-y-3">
                            <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-cyan-400" />
                                Beam Speed Upgrades
                            </h3>
                            {BEAM_SPEED_TIERS.map((tier) => {
                                const isPurchased = upgradeState.beamSpeedTier >= tier.tier
                                const canPurchase = tier.tier === 0 || upgradeState.beamSpeedTier === tier.tier - 1
                                const canAfford = upgradeState.availablePoints >= tier.cost

                                return (
                                    <UpgradeCard
                                        key={tier.tier}
                                        title={tier.name}
                                        description={`+${Math.round((tier.multiplier - 1) * 100)}% projectile speed`}
                                        cost={tier.cost}
                                        isPurchased={isPurchased}
                                        isEquipped={isPurchased}
                                        canPurchase={canPurchase && canAfford}
                                        isLocked={!canPurchase && !isPurchased}
                                        onPurchase={() => handlePurchase("beamSpeed", tier.tier)}
                                    />
                                )
                            })}
                        </div>
                    )}

                    {/* Beam Color */}
                    {activeTab === "beam" && activeSubTab === "color" && (
                        <div className="space-y-3">
                            <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-green-400" />
                                Beam Colors
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {BEAM_COLORS.map((color) => {
                                    const isUnlocked = upgradeState.unlockedBeamColors.includes(color.id)
                                    const isEquipped = upgradeState.beamColorId === color.id
                                    const canAfford = upgradeState.availablePoints >= color.cost

                                    return (
                                        <BeamColorCard
                                            key={color.id}
                                            name={color.name}
                                            color={color.primary}
                                            glow={color.glow}
                                            cost={color.cost}
                                            isUnlocked={isUnlocked}
                                            isEquipped={isEquipped}
                                            canAfford={canAfford}
                                            onPurchase={() => handlePurchase("beamColor", color.id)}
                                            onEquip={() => handleEquip("beamColor", color.id)}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Firing Mode */}
                    {activeTab === "beam" && activeSubTab === "mode" && (
                        <div className="space-y-3">
                            <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-red-400" />
                                Firing Modes
                            </h3>
                            {FIRING_MODES.map((mode) => {
                                const isUnlocked = upgradeState.unlockedFiringModes.includes(mode.id)
                                const isEquipped = upgradeState.firingMode === mode.id
                                const canAfford = upgradeState.availablePoints >= mode.cost

                                return (
                                    <FiringModeCard
                                        key={mode.id}
                                        name={mode.name}
                                        description={mode.description}
                                        projectileCount={mode.projectileCount}
                                        fireRateMultiplier={mode.fireRateMultiplier}
                                        damageMultiplier={mode.damageMultiplier}
                                        cost={mode.cost}
                                        isUnlocked={isUnlocked}
                                        isEquipped={isEquipped}
                                        canAfford={canAfford}
                                        onPurchase={() => handlePurchase("firingMode", mode.id)}
                                        onEquip={() => handleEquip("firingMode", mode.id)}
                                    />
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-6 border-t border-white/10 flex justify-between items-center">
                    <button
                        onClick={upgrades.resetUpgrades}
                        className="text-sm text-muted-foreground hover:text-red-400 transition-colors"
                    >
                        Reset All Upgrades
                    </button>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-display font-bold rounded-xl hover:scale-105 active:scale-95 transition-transform"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to Game
                    </button>
                </div>
            </div>
        </div>
    )
}

// Sub-components

function SubTabButton({
    active,
    onClick,
    icon,
    label,
}: {
    active: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${active
                    ? "bg-white/15 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
        >
            {icon}
            {label}
        </button>
    )
}

function UpgradeCard({
    title,
    description,
    cost,
    isPurchased,
    isEquipped,
    canPurchase,
    isLocked,
    onPurchase,
}: {
    title: string
    description: string
    cost: number
    isPurchased: boolean
    isEquipped: boolean
    canPurchase: boolean
    isLocked: boolean
    onPurchase: () => void
}) {
    return (
        <div
            className={`p-4 rounded-xl border transition-all ${isPurchased
                    ? "bg-green-500/10 border-green-500/30"
                    : isLocked
                        ? "bg-white/5 border-white/10 opacity-50"
                        : "bg-white/5 border-white/10 hover:border-primary/50"
                }`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-display font-semibold text-lg">{title}</h4>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <div className="flex items-center gap-3">
                    {isPurchased ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 text-green-400">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">Owned</span>
                        </div>
                    ) : isLocked ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-muted-foreground">
                            <Lock className="w-4 h-4" />
                        </div>
                    ) : (
                        <button
                            onClick={onPurchase}
                            disabled={!canPurchase}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${canPurchase
                                    ? "bg-primary text-primary-foreground hover:scale-105"
                                    : "bg-white/10 text-muted-foreground cursor-not-allowed"
                                }`}
                        >
                            <Star className="w-4 h-4" />
                            {cost.toLocaleString()}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function ColorCard({
    name,
    colors,
    accentColor,
    cost,
    isUnlocked,
    isEquipped,
    canAfford,
    onPurchase,
    onEquip,
}: {
    name: string
    colors: string[]
    accentColor: string
    cost: number
    isUnlocked: boolean
    isEquipped: boolean
    canAfford: boolean
    onPurchase: () => void
    onEquip: () => void
}) {
    return (
        <div
            className={`p-4 rounded-xl border transition-all ${isEquipped
                    ? "bg-primary/10 border-primary/50"
                    : isUnlocked
                        ? "bg-white/5 border-white/10 hover:border-primary/30"
                        : "bg-white/5 border-white/10"
                }`}
        >
            <div className="flex items-center gap-4">
                {/* Color Preview */}
                <div
                    className="w-12 h-12 rounded-lg"
                    style={{
                        background: `linear-gradient(135deg, ${colors.join(", ")})`,
                        boxShadow: `0 0 20px ${accentColor}40`,
                    }}
                />
                <div className="flex-1">
                    <h4 className="font-display font-semibold">{name}</h4>
                    {isEquipped && (
                        <span className="text-xs text-primary">Equipped</span>
                    )}
                </div>
                <div>
                    {isEquipped ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 text-primary">
                            <Check className="w-4 h-4" />
                        </div>
                    ) : isUnlocked ? (
                        <button
                            onClick={onEquip}
                            className="px-4 py-2 rounded-lg bg-white/10 text-foreground font-medium hover:bg-white/20 transition-all"
                        >
                            Equip
                        </button>
                    ) : (
                        <button
                            onClick={onPurchase}
                            disabled={!canAfford}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${canAfford
                                    ? "bg-primary text-primary-foreground hover:scale-105"
                                    : "bg-white/10 text-muted-foreground cursor-not-allowed"
                                }`}
                        >
                            <Star className="w-4 h-4" />
                            {cost.toLocaleString()}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function ShapeCard({
    name,
    description,
    shapeId,
    cost,
    isUnlocked,
    isEquipped,
    canAfford,
    onPurchase,
    onEquip,
}: {
    name: string
    description: string
    shapeId: string
    cost: number
    isUnlocked: boolean
    isEquipped: boolean
    canAfford: boolean
    onPurchase: () => void
    onEquip: () => void
}) {
    const shapeIcons: Record<string, string> = {
        classic: "🚀",
        sleek: "✈️",
        heavy: "🛸",
        stealth: "🔷",
    }

    return (
        <div
            className={`p-4 rounded-xl border transition-all ${isEquipped
                    ? "bg-primary/10 border-primary/50"
                    : isUnlocked
                        ? "bg-white/5 border-white/10 hover:border-primary/30"
                        : "bg-white/5 border-white/10"
                }`}
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl">
                    {shapeIcons[shapeId] || "🚀"}
                </div>
                <div className="flex-1">
                    <h4 className="font-display font-semibold">{name}</h4>
                    <p className="text-xs text-muted-foreground">{description}</p>
                    {isEquipped && (
                        <span className="text-xs text-primary">Equipped</span>
                    )}
                </div>
                <div>
                    {isEquipped ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 text-primary">
                            <Check className="w-4 h-4" />
                        </div>
                    ) : isUnlocked ? (
                        <button
                            onClick={onEquip}
                            className="px-4 py-2 rounded-lg bg-white/10 text-foreground font-medium hover:bg-white/20 transition-all"
                        >
                            Equip
                        </button>
                    ) : (
                        <button
                            onClick={onPurchase}
                            disabled={!canAfford}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${canAfford
                                    ? "bg-primary text-primary-foreground hover:scale-105"
                                    : "bg-white/10 text-muted-foreground cursor-not-allowed"
                                }`}
                        >
                            <Star className="w-4 h-4" />
                            {cost.toLocaleString()}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function BeamColorCard({
    name,
    color,
    glow,
    cost,
    isUnlocked,
    isEquipped,
    canAfford,
    onPurchase,
    onEquip,
}: {
    name: string
    color: string
    glow: string
    cost: number
    isUnlocked: boolean
    isEquipped: boolean
    canAfford: boolean
    onPurchase: () => void
    onEquip: () => void
}) {
    return (
        <div
            className={`p-4 rounded-xl border transition-all ${isEquipped
                    ? "bg-cyan-500/10 border-cyan-500/50"
                    : isUnlocked
                        ? "bg-white/5 border-white/10 hover:border-cyan-500/30"
                        : "bg-white/5 border-white/10"
                }`}
        >
            <div className="flex items-center gap-4">
                {/* Beam Preview */}
                <div className="w-12 h-12 rounded-lg bg-black/50 flex items-center justify-center overflow-hidden">
                    <div
                        className="w-8 h-2 rounded-full"
                        style={{
                            background: color,
                            boxShadow: `0 0 15px ${color}, 0 0 30px ${glow}`,
                        }}
                    />
                </div>
                <div className="flex-1">
                    <h4 className="font-display font-semibold">{name}</h4>
                    {isEquipped && (
                        <span className="text-xs text-cyan-400">Equipped</span>
                    )}
                </div>
                <div>
                    {isEquipped ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                            <Check className="w-4 h-4" />
                        </div>
                    ) : isUnlocked ? (
                        <button
                            onClick={onEquip}
                            className="px-4 py-2 rounded-lg bg-white/10 text-foreground font-medium hover:bg-white/20 transition-all"
                        >
                            Equip
                        </button>
                    ) : (
                        <button
                            onClick={onPurchase}
                            disabled={!canAfford}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${canAfford
                                    ? "bg-cyan-500 text-white hover:scale-105"
                                    : "bg-white/10 text-muted-foreground cursor-not-allowed"
                                }`}
                        >
                            <Star className="w-4 h-4" />
                            {cost.toLocaleString()}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function FiringModeCard({
    name,
    description,
    projectileCount,
    fireRateMultiplier,
    damageMultiplier,
    cost,
    isUnlocked,
    isEquipped,
    canAfford,
    onPurchase,
    onEquip,
}: {
    name: string
    description: string
    projectileCount: number
    fireRateMultiplier: number
    damageMultiplier: number
    cost: number
    isUnlocked: boolean
    isEquipped: boolean
    canAfford: boolean
    onPurchase: () => void
    onEquip: () => void
}) {
    return (
        <div
            className={`p-4 rounded-xl border transition-all ${isEquipped
                    ? "bg-red-500/10 border-red-500/50"
                    : isUnlocked
                        ? "bg-white/5 border-white/10 hover:border-red-500/30"
                        : "bg-white/5 border-white/10"
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h4 className="font-display font-semibold text-lg">{name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{description}</p>
                    <div className="flex gap-3 text-xs">
                        <span className="px-2 py-1 rounded bg-white/10">
                            {projectileCount}x shots
                        </span>
                        <span className="px-2 py-1 rounded bg-white/10">
                            {fireRateMultiplier}x fire rate
                        </span>
                        <span className="px-2 py-1 rounded bg-white/10">
                            {damageMultiplier}x damage
                        </span>
                    </div>
                    {isEquipped && (
                        <span className="text-xs text-red-400 mt-2 inline-block">Equipped</span>
                    )}
                </div>
                <div>
                    {isEquipped ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-400">
                            <Check className="w-4 h-4" />
                        </div>
                    ) : isUnlocked ? (
                        <button
                            onClick={onEquip}
                            className="px-4 py-2 rounded-lg bg-white/10 text-foreground font-medium hover:bg-white/20 transition-all"
                        >
                            Equip
                        </button>
                    ) : (
                        <button
                            onClick={onPurchase}
                            disabled={!canAfford}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${canAfford
                                    ? "bg-red-500 text-white hover:scale-105"
                                    : "bg-white/10 text-muted-foreground cursor-not-allowed"
                                }`}
                        >
                            <Star className="w-4 h-4" />
                            {cost.toLocaleString()}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
