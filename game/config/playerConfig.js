// ─── Player Physics ──────────────────────────────────────────────────────────
export const PLAYER_PHYSICS = Object.freeze({
    weight:     1,
    normalSpeed: 6,
    maxSpeed:   10,
    fps:        31,
    buoyancy:   4,
});

export const PLAYER_SLOW_MULTIPLIERS = Object.freeze({
    normalSpeed: 4 / 6,
    maxSpeed:    0.6,
    weight:      1.5,
});

// ─── Ice Physics ─────────────────────────────────────────────────────────────
export const ICE_PHYSICS = Object.freeze({
    accelIce:         0.045,
    frictionIce:      0.005,
    turnResistanceIce: 0.45,
    deadzone:         0.05,
    iceIdleDrift:     0.0005,
    slideGraceMs:     260,
    slideFrictionIce: 0.0016,
});

// ─── Frozen ──────────────────────────────────────────────────────────────────
export const FROZEN_CONFIG = Object.freeze({
    duration:   2000,
    pulseSpeed: 0.009,
    pulseAmp:   0.2,
    opacity:    0.5,
});

// ─── Status Effect Durations ─────────────────────────────────────────────────
export const STATUS_EFFECT_DURATIONS = Object.freeze({
    invincible: 1000,
    hourglass:  25000,
    confuse:    8000,
});

// ─── Energy ──────────────────────────────────────────────────────────────────
export const ENERGY_CONFIG = Object.freeze({
    max:                    100,
    regenInterval:          100,
    statusFxInterval:       120,
    bluePotionSpeedMultiplier: 2.2,
});

// ─── Fireball ────────────────────────────────────────────────────────────────
export const FIREBALL_CONFIG = Object.freeze({
    cooldown: 1000,
});

// ─── Diving ──────────────────────────────────────────────────────────────────
export const DIVING_CONFIG = Object.freeze({
    timer:    500,
    cooldown: 300,
});

// ─── Invisible ───────────────────────────────────────────────────────────────
export const INVISIBLE_CONFIG = Object.freeze({
    cooldown: 35000,
    duration: 5000,
});

// ─── Dash ────────────────────────────────────────────────────────────────────
export const DASH_CONFIG = Object.freeze({
    duration:                 180,
    speedMultiplier:          3.0,
    ghostInterval:            18,
    betweenCooldown:          500,
    cooldown:                 60000,
    maxCharges:               2,
    secondWindowMs:           7000,
    secondDistanceMultiplier: 1.75,
    energyCost:               10,
    postGraceMs:              500,
});

// ─── Boss Collision ──────────────────────────────────────────────────────────
export const BOSS_COLLISION_CONFIG = Object.freeze({
    timer:    1000,
    cooldown: 1000,
});
