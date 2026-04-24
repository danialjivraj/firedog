// baseline frame duration the game physics/speeds were originally tuned at (~75 fps).
// normalises deltaTime so that gameplay is frame-rate independent:
// const dt = normalizeDelta(deltaTime);
export const BASE_FRAME_MS = 13.333;
export const normalizeDelta = (deltaTime) => deltaTime / BASE_FRAME_MS;

// ─── Canvas ───────────────────────────────────────────────────────────────────
export const CANVAS_WIDTH  = 1920;
export const CANVAS_HEIGHT = 689;

// ─── Game State ───────────────────────────────────────────────────────────────
export const GameState = Object.freeze({
    CUTSCENE: 'CUTSCENE',
    MENU:     'MENU',
    GAMEPLAY: 'GAMEPLAY',
});

// ─── Game Loop ────────────────────────────────────────────────────────────────
export const NORMAL_SPEED          = 6;
export const GROUND_MARGIN         = 40;
export const MAX_PARTICLES         = 210;
export const MAX_ENEMIES           = 6;
export const ENEMY_INTERVAL_MS     = 1000;
export const NON_ENEMY_INTERVAL_MS = 1000;

// ─── Player ──────────────────────────────────────────────────────────────────
export const FULL_ENERGY = 100;
export const MAX_LIVES   = 10;

// ─── Economy ─────────────────────────────────────────────────────────────────
export const MAX_CREDIT_COINS    = 999;
export const WINNING_COINS       = 100;
export const COIN_LOSS_KEEP_RATE = 0.1;

// ─── Environment ─────────────────────────────────────────────────────────────
export const MAX_TIME_UNDERWATER_MS = 420000; // 7 minutes

// ─── Spawn Buffers ───────────────────────────────────────────────────────────
export const ENEMY_SPAWN_DISTANCE_BUFFER = 5;
export const ITEM_SPAWN_DISTANCE_BUFFER  = 3;

// ─── Map Display Names ───────────────────────────────────────────────────────
export const MAP_DISPLAY_NAMES = Object.freeze({
    Map1:      'Lunar Glade',
    Map2:      'Nightfall Phantom Graves',
    Map3:      'Coral Abyss',
    Map4:      'Verdant Vine',
    Map5:      'Springly Lemony',
    Map6:      'Venomveil Lake',
    Map7:      'Infernal Crater Peak',
    BonusMap1: 'Icebound Cave',
    BonusMap2: 'Crimson Fissure',
    BonusMap3: 'Cosmic Rift',
});

export const MAP_DISPLAY_NAMES_UPPER = Object.freeze(
    Object.fromEntries(
        Object.entries(MAP_DISPLAY_NAMES).map(([k, v]) => [k, v.toUpperCase()])
    )
);

// ─── Map Theme Colors ────────────────────────────────────────────────────────
export const MAP_THEME_COLORS = Object.freeze({
    forestMap: Object.freeze({
        Map1:      { fill: '#57e2d0ff', stroke: '#097e12ff', strokeBlur: 5 },
        Map2:      { fill: '#a84ffcff', stroke: '#380057ff', strokeBlur: 4 },
        Map3:      { fill: 'dodgerblue', stroke: 'darkblue',  strokeBlur: 4 },
        Map4:      { fill: '#61c050ff', stroke: '#346b38ff', strokeBlur: 5 },
        Map5:      { fill: 'yellow',    stroke: 'orange',     strokeBlur: 5 },
        Map6:      { fill: '#39ff14',   stroke: '#003b00',    strokeBlur: 10 },
        Map7:      { fill: '#ff2100ff', stroke: 'black',      strokeBlur: 5 },
        BonusMap1: { fill: '#8fd7ff',   stroke: '#1c4a7f',    strokeBlur: 10 },
        BonusMap2: { fill: '#dc143c',   stroke: 'black',      strokeBlur: 12 },
        BonusMap3: { fill: '#ff41ffff', stroke: '#270033',    strokeBlur: 10 },
    }),
    enemyLore: Object.freeze({
        Map1:      { fill: '#57e2d0ff', stroke: '#06580dff', strokeBlur: 7 },
        Map2:      { fill: '#a84ffcff', stroke: 'black',     strokeBlur: 10 },
        Map3:      { fill: 'dodgerblue', stroke: 'darkblue', strokeBlur: 5 },
        Map4:      { fill: '#61c050ff', stroke: 'black',     strokeBlur: 15 },
        Map5:      { fill: 'yellow',    stroke: 'orange',    strokeBlur: 5 },
        Map6:      { fill: '#39ff14',   stroke: '#003b00',   strokeBlur: 10 },
        Map7:      { fill: '#ff3300ff', stroke: 'black',     strokeBlur: 10 },
        BonusMap1: { fill: '#8fd7ff',   stroke: '#1c4a7f',   strokeBlur: 10 },
        BonusMap2: { fill: '#ff2c56ff', stroke: '#000000ff', strokeBlur: 10 },
        BonusMap3: { fill: '#ff41ffff', stroke: '#270033',   strokeBlur: 10 },
    }),
});

// ─── Maps ─────────────────────────────────────────────────────────────────────
export const MAX_DISTANCE          = 100;
export const BOSS_MAP_MAX_DISTANCE = 9999999;

// ─── Cabin / Penguin ─────────────────────────────────────────────────────────
export const CABIN_COLLISION_OFFSET    = 190;
export const PENGUIN_OFFSET_FROM_CABIN = 100;

// ─── Damage Indicator ────────────────────────────────────────────────────────
export const DAMAGE_INDICATOR_OPACITY_BY_MAP = Object.freeze({
    Map1:      0.2,
    Map2:      0.10,
    Map3:      0.40,
    Map4:      0.25,
    Map5:      0.27,
    Map6:      0.26,
    Map7:      0.26,
    BonusMap1: 0.35,
    BonusMap2: 0.19,
    BonusMap3: 0.15,
});

// ─── UI ──────────────────────────────────────────────────────────────────────
export const TOAST_Y = 100;

// ─── Audio ───────────────────────────────────────────────────────────────────
export const LOOPING_SOUND_FADE_OUT_MS = 2000;

// ─── Cutscene ────────────────────────────────────────────────────────────────
export const CUTSCENE_INPUT_DEBOUNCE_MS = 250;

// ─── Transitions ──────────────────────────────────────────────────────────────
export const FADE_IN_DELAY_MS    = 1300;
export const FADE_IN_COMPLETE_MS = 2700;

// ─── Player States ────────────────────────────────────────────────────────────
export const PlayerState = Object.freeze({
    SITTING:  0,
    RUNNING:  1,
    JUMPING:  2,
    FALLING:  3,
    ROLLING:  4,
    DIVING:   5,
    STUNNED:  6,
    HIT:      7,
    STANDING: 8,
    DYING:    9,
    DASHING:  10,
});
