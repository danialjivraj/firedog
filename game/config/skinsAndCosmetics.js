export const FIREDOG_FRAME = {
    width: 100,
    height: 91.3,
};

export const SKINS = {
    defaultSkin: { key: 'defaultSkin', spriteId: 'defaultSkin', label: 'Default', cutscene: { prefix: '' }, price: 0, ownedByDefault: true },
    shinySkin: { key: 'shinySkin', spriteId: 'shinySkin', label: 'Firedog (Shiny)', variantOf: 'defaultSkin', hidden: true, cutscene: { prefix: 'shiny' }, price: 0, ownedByDefault: true },
    midnightSteelSkin: { key: 'midnightSteelSkin', spriteId: 'midnightSteelSkin', label: 'Midnight Steel', cutscene: { prefix: 'midnightSteel' }, price: 70, ownedByDefault: false },
    sunsetIronSkin: { key: 'sunsetIronSkin', spriteId: 'sunsetIronSkin', label: 'Sunset Iron', cutscene: { prefix: 'sunsetIron' }, price: 70, ownedByDefault: false },
    reddenShockSkin: { key: 'reddenShockSkin', spriteId: 'reddenShockSkin', label: 'Redden Shock', cutscene: { prefix: 'reddenShock' }, price: 100, ownedByDefault: false },
    neonPinkSkin: { key: 'neonPinkSkin', spriteId: 'neonPinkSkin', label: 'Neon Pink', cutscene: { prefix: 'neonPink' }, price: 100, ownedByDefault: false },
    ghostSkin: { key: 'ghostSkin', spriteId: 'ghostSkin', label: 'Ghost', cutscene: { prefix: 'ghost' }, price: 120, ownedByDefault: false },
    zombieSkin: { key: 'zombieSkin', spriteId: 'zombieSkin', label: 'Zombie', cutscene: { prefix: 'zombie' }, price: 140, ownedByDefault: false },
    sharkSkin: { key: 'sharkSkin', spriteId: 'sharkSkin', label: 'Shark', cutscene: { prefix: 'shark' }, price: 150, ownedByDefault: false },
    zebraSkin: { key: 'zebraSkin', spriteId: 'zebraSkin', label: 'Zebra', cutscene: { prefix: 'zebra' }, price: 150, ownedByDefault: false },
    foxSkin: { key: 'foxSkin', spriteId: 'foxSkin', label: 'Fox', cutscene: { prefix: 'fox' }, price: 150, ownedByDefault: false },
    leopardSkin: { key: 'leopardSkin', spriteId: 'leopardSkin', label: 'Leopard', cutscene: { prefix: 'leopard' }, price: 150, ownedByDefault: false },
    tigerSkin: { key: 'tigerSkin', spriteId: 'tigerSkin', label: 'Tiger', cutscene: { prefix: 'tiger' }, price: 150, ownedByDefault: false },
    iceBreakerSkin: { key: 'iceBreakerSkin', spriteId: 'iceBreakerSkin', label: 'Ice Breaker', cutscene: { prefix: 'iceBreaker' }, price: 1000, ownedByDefault: false },
    infernalSkin: { key: 'infernalSkin', spriteId: 'infernalSkin', label: 'Infernal', cutscene: { prefix: 'infernal' }, price: 1000, ownedByDefault: false },
    galaxySkin: { key: 'galaxySkin', spriteId: 'galaxySkin', label: 'Galaxy', cutscene: { prefix: 'galaxy' }, price: 1000, ownedByDefault: false },
};

export const SKIN_MENU_ORDER = [
    'defaultSkin',
    'midnightSteelSkin',
    'sunsetIronSkin',
    'reddenShockSkin',
    'neonPinkSkin',
    'ghostSkin',
    'zombieSkin',
    'sharkSkin',
    'foxSkin',
    'zebraSkin',
    'leopardSkin',
    'tigerSkin',
];

export const COSMETIC_SLOTS = Object.freeze({
    HEAD: 'head',
    NECK: 'neck',
    EYES: 'eyes',
    NOSE: 'nose',
});

export const COSMETIC_LAYER_ORDER = Object.freeze([
    COSMETIC_SLOTS.NECK,
    COSMETIC_SLOTS.EYES,
    COSMETIC_SLOTS.NOSE,
    COSMETIC_SLOTS.HEAD,
]);

const NONE_ENTRY = Object.freeze({
    key: 'none',
    spriteId: null,
    label: 'None',
    cutscene: { overlayId: null },
    price: 0,
    ownedByDefault: true,
});

function makeHueChromaPack({ defaultId, variants } = {}) {
    const list = Array.isArray(variants) ? variants : [];
    const safeDefault =
        (defaultId && list.some(v => v?.id === defaultId))
            ? defaultId
            : (list[0]?.id || null);

    return {
        mode: 'hue',
        default: safeDefault,
        variants: list.map(v => ({
            id: String(v.id),
            deg: Number.isFinite(v.deg) ? v.deg : 0,
        })),
    };
}

export const COSMETICS = {
    [COSMETIC_SLOTS.HEAD]: {
        none: NONE_ENTRY,
        unicornHornOutfit: { key: 'unicornHornOutfit', spriteId: 'unicornHornOutfit', label: 'Unicorn Horn', cutscene: { overlayId: 'cutsceneUnicornHornOutfit' }, price: 15, ownedByDefault: false },
        hatOutfit: {
            key: 'hatOutfit', spriteId: 'hatOutfit', label: 'Hat', cutscene: { overlayId: 'cutsceneHatOutfit' }, price: 20, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'green', deg: 120 },
                    { id: 'blue', deg: 240 },
                    { id: 'purple', deg: 300 },
                ],
            }),
            chromaSwatchBaseHex: '#9f1318',
        },
        flowerOutfit: {
            key: 'flowerOutfit', spriteId: 'flowerOutfit', label: 'Flower', cutscene: { overlayId: 'cutsceneFlowerOutfit' }, price: 30, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'lightblue', deg: 220 },
                ],
            }),
            chromaSwatchBaseHex: '#ffbcd2',
        },
        frogCrownOutfit: {
            key: 'frogCrownOutfit', spriteId: 'frogCrownOutfit', label: 'Frog Crown', cutscene: { overlayId: 'cutsceneFrogCrownOutfit' }, price: 30, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'blue', deg: 100 },
                    { id: 'red', deg: 240 },
                ],
            }),
            chromaSwatchBaseHex: '#036a00',
        },
        cowboyHatOutfit: { key: 'cowboyHatOutfit', spriteId: 'cowboyHatOutfit', label: 'Cowboy Hat', cutscene: { overlayId: 'cutsceneCowboyHatOutfit' }, price: 50, ownedByDefault: false },
        bandanaOutfit: {
            key: 'bandanaOutfit', spriteId: 'bandanaOutfit', label: 'Bandana', cutscene: { overlayId: 'cutsceneBandanaOutfit' }, price: 70, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'red', deg: 120 },
                    { id: 'green', deg: 240 },
                ],
            }),
            chromaSwatchBaseHex: '#002dbc',
        },
        catEarsOutfit: {
            key: 'catEarsOutfit', spriteId: 'catEarsOutfit', label: 'Cat Ears', cutscene: { overlayId: 'cutsceneCatEarsOutfit' }, price: 70, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'lightgreen', deg: 150 },
                ],
            }),
            chromaSwatchBaseHex: '#febcce',
        },
        devilHornsOutfit: { key: 'devilHornsOutfit', spriteId: 'devilHornsOutfit', label: 'Devil Horns', cutscene: { overlayId: 'cutsceneDevilHornsOutfit' }, price: 70, ownedByDefault: false },
        kingsCrownOutfit: { key: 'kingsCrownOutfit', spriteId: 'kingsCrownOutfit', label: "King's Crown", cutscene: { overlayId: 'cutsceneKingsCrownOutfit' }, price: 100, ownedByDefault: false },
        vikingHelmetOutfit: { key: 'vikingHelmetOutfit', spriteId: 'vikingHelmetOutfit', label: 'Viking Helmet', cutscene: { overlayId: 'cutsceneVikingHelmetOutfit' }, price: 100, ownedByDefault: false },
        clownWigOutfit: { key: 'clownWigOutfit', spriteId: 'clownWigOutfit', label: 'Clown Wig', cutscene: { overlayId: 'cutsceneClownWigOutfit' }, price: 100, ownedByDefault: false },
    },

    [COSMETIC_SLOTS.NECK]: {
        none: NONE_ENTRY,
        hawaiianNecklaceOutfit: { key: 'hawaiianNecklaceOutfit', spriteId: 'hawaiianNecklaceOutfit', label: 'Hawaiian Necklace', cutscene: { overlayId: 'cutsceneHawaiianNecklaceOutfit' }, price: 50, ownedByDefault: false },
        tieOutfit: {
            key: 'tieOutfit', spriteId: 'tieOutfit', label: 'Tie', cutscene: { overlayId: 'cutsceneTieOutfit' }, price: 50, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'blue', deg: 240 },
                    { id: 'green', deg: 110 },
                ],
            }),
            chromaSwatchBaseHex: '#e00f13',
        },
        bowtieOutfit: {
            key: 'bowtieOutfit', spriteId: 'bowtieOutfit', label: 'Bowtie', cutscene: { overlayId: 'cutsceneBowtieOutfit' }, price: 50, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'blue', deg: 160 },
                    { id: 'red', deg: 260 },
                    { id: 'orange', deg: 300 },
                ],
            }),
            chromaSwatchBaseHex: '#53b001',
        },
        scarfOutfit: {
            key: 'scarfOutfit', spriteId: 'scarfOutfit', label: 'Scarf', cutscene: { overlayId: 'cutsceneScarfOutfit' }, price: 50, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'yellow', deg: 40 },
                    { id: 'green', deg: 120 },
                    { id: 'blue', deg: 240 },
                ],
            }),
            chromaSwatchBaseHex: '#ef2c2b',
        },
        neckerchiefOutfit: {
            key: 'neckerchiefOutfit', spriteId: 'neckerchiefOutfit', label: 'Neckerchief', cutscene: { overlayId: 'cutsceneNeckerchiefOutfit' }, price: 70, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'red', deg: 120 },
                    { id: 'green', deg: 240 },
                ],
            }),
            chromaSwatchBaseHex: '#002dbc',
        },
        pearlOutfit: { key: 'pearlOutfit', spriteId: 'pearlOutfit', label: 'Pearl', cutscene: { overlayId: 'cutscenePearlOutfit' }, price: 100, ownedByDefault: false },
        cubanChainOutfit: { key: 'cubanChainOutfit', spriteId: 'cubanChainOutfit', label: 'Cuban Chain', cutscene: { overlayId: 'cutsceneCubanChainOutfit' }, price: 100, ownedByDefault: false },
        championMedalOutfit: { key: 'championMedalOutfit', spriteId: 'championMedalOutfit', label: 'Champion Medal', cutscene: { overlayId: 'cutsceneChampionMedalOutfit' }, price: 100, ownedByDefault: false },
        spikeChokerOutfit: { key: 'spikeChokerOutfit', spriteId: 'spikeChokerOutfit', label: 'Spike Choker', cutscene: { overlayId: 'cutsceneSpikeChokerOutfit' }, price: 100, ownedByDefault: false },
    },

    [COSMETIC_SLOTS.EYES]: {
        none: NONE_ENTRY,
        roundGlassesOutfit: { key: 'roundGlassesOutfit', spriteId: 'roundGlassesOutfit', label: 'Round Glasses', cutscene: { overlayId: 'cutsceneRoundGlassesOutfit' }, price: 50, ownedByDefault: false },
        wayfarerSunglassesOutfit: {
            key: 'wayfarerSunglassesOutfit', spriteId: 'wayfarerSunglassesOutfit', label: 'Wayfarer Sunglasses', cutscene: { overlayId: 'cutsceneWayfarerSunglassesOutfit' }, price: 50, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'purple', deg: 160 },
                    { id: 'orange', deg: 270 },
                    { id: 'yellow', deg: 310 },
                ],
            }),
            chromaSwatchBaseHex: '#4df821',
        },
        leopardPrintSunglassesOutfit: { key: 'leopardPrintSunglassesOutfit', spriteId: 'leopardPrintSunglassesOutfit', label: 'Leopard Sunglasses', cutscene: { overlayId: 'cutsceneLeopardPrintSunglassesOutfit' }, price: 50, ownedByDefault: false },
        pirateEyePatchOutfit: {
            key: 'pirateEyePatchOutfit', spriteId: 'pirateEyePatchOutfit', label: 'Pirate Eye Patch', cutscene: { overlayId: 'cutscenePirateEyePatchOutfit' }, price: 50, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'yellow', deg: 160 },
                    { id: 'green', deg: 250 },
                ],
            }),
            chromaSwatchBaseHex: '#5951ae',
        },
        glasses3dOutfit: { key: 'glasses3dOutfit', spriteId: 'glasses3dOutfit', label: '3D Glasses', cutscene: { overlayId: 'cutsceneGlasses3dOutfit' }, price: 70, ownedByDefault: false },
        thugSunglassesOutfit: {
            key: 'thugSunglassesOutfit', spriteId: 'thugSunglassesOutfit', label: 'Thug Sunglasses', cutscene: { overlayId: 'cutsceneThugSunglassesOutfit' }, price: 100, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'yellow', deg: 60 },
                    { id: 'lightgreen', deg: 160 },
                ],
            }),
            chromaSwatchBaseHex: '#ff9292',
        },
    },

    [COSMETIC_SLOTS.NOSE]: {
        none: NONE_ENTRY,
        bullRingOutfit: { key: 'bullRingOutfit', spriteId: 'bullRingOutfit', label: 'Bull Ring', cutscene: { overlayId: 'cutsceneBullRingOutfit' }, price: 30, ownedByDefault: false },
        catWhiskersOutfit: {
            key: 'catWhiskersOutfit', spriteId: 'catWhiskersOutfit', label: 'Cat Whiskers', cutscene: { overlayId: 'cutsceneCatWhiskersOutfit' }, price: 30, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'green', deg: 160 },
                    { id: 'blue', deg: 310 },
                ],
            }),
            chromaSwatchBaseHex: '#ff00f0',
        },
        clownNoseOutfit: {
            key: 'clownNoseOutfit', spriteId: 'clownNoseOutfit', label: 'Clown Nose', cutscene: { overlayId: 'cutsceneClownNoseOutfit' }, price: 30, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'green', deg: 160 },
                    { id: 'purple', deg: 310 },
                ],
            }),
            chromaSwatchBaseHex: '#f81022',
        },
        mustacheOutfit: {
            key: 'mustacheOutfit', spriteId: 'mustacheOutfit', label: 'Mustache', cutscene: { overlayId: 'cutsceneMustacheOutfit' }, price: 30, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'green', deg: 50 },
                    { id: 'blue', deg: 160 },
                    { id: 'red', deg: 310 },
                ],
            }),
            chromaSwatchBaseHex: '#ffa800',
        },
    },
};

export const COSMETIC_MENU_ORDER = {
    [COSMETIC_SLOTS.HEAD]: [
        'none',
        'unicornHornOutfit',
        'hatOutfit',
        'flowerOutfit',
        'frogCrownOutfit',
        'cowboyHatOutfit',
        'bandanaOutfit',
        'catEarsOutfit',
        'devilHornsOutfit',
        'kingsCrownOutfit',
        'vikingHelmetOutfit',
        'clownWigOutfit',
    ],
    [COSMETIC_SLOTS.NECK]: [
        'none',
        'hawaiianNecklaceOutfit',
        'tieOutfit',
        'bowtieOutfit',
        'scarfOutfit',
        'neckerchiefOutfit',
        'pearlOutfit',
        'cubanChainOutfit',
        'championMedalOutfit',
        'spikeChokerOutfit',
    ],
    [COSMETIC_SLOTS.EYES]: [
        'none',
        'roundGlassesOutfit',
        'wayfarerSunglassesOutfit',
        'leopardPrintSunglassesOutfit',
        'pirateEyePatchOutfit',
        'glasses3dOutfit',
        'thugSunglassesOutfit',
    ],
    [COSMETIC_SLOTS.NOSE]: [
        'none',
        'bullRingOutfit',
        'catWhiskersOutfit',
        'clownNoseOutfit',
        'mustacheOutfit',
    ],
};

const _skinSpriteCache = new Map();
const _cosmeticSpriteCacheBySlot = new Map();

function getCached(map, key, computeFn) {
    if (map.has(key)) return map.get(key);
    const value = computeFn();
    map.set(key, value);
    return value;
}

function getSlotCache(slot) {
    if (!_cosmeticSpriteCacheBySlot.has(slot)) {
        _cosmeticSpriteCacheBySlot.set(slot, new Map());
    }
    return _cosmeticSpriteCacheBySlot.get(slot);
}

export function getSkinElement(skinKey) {
    return getCached(_skinSpriteCache, skinKey, () => {
        const entry = SKINS[skinKey];
        if (!entry || !entry.spriteId) return null;
        return document.getElementById(entry.spriteId) || null;
    });
}

export function getCosmeticElement(slot, cosmeticKey) {
    const safeSlot = (slot && COSMETICS[slot]) ? slot : COSMETIC_SLOTS.HEAD;
    const key = cosmeticKey || 'none';

    return getCached(getSlotCache(safeSlot), key, () => {
        const entry = COSMETICS[safeSlot]?.[key];
        if (!entry || !entry.spriteId) return null;
        return document.getElementById(entry.spriteId) || null;
    });
}

export function getCosmeticChromaConfig(slot, cosmeticKey) {
    const safeSlot = (slot && COSMETICS[slot]) ? slot : COSMETIC_SLOTS.HEAD;
    const key = cosmeticKey || 'none';
    const entry = COSMETICS[safeSlot]?.[key];
    return entry?.chroma || null;
}

export function resolveCosmeticChromaVariant(slot, cosmeticKey, variantIdOrNull) {
    const cfg = getCosmeticChromaConfig(slot, cosmeticKey);
    if (!cfg || !Array.isArray(cfg.variants) || cfg.variants.length === 0) return null;

    const wanted = (variantIdOrNull && typeof variantIdOrNull === 'string') ? variantIdOrNull : cfg.default;
    const found = cfg.variants.find(v => v?.id === wanted) || cfg.variants.find(v => v?.id === cfg.default) || cfg.variants[0];

    if (!found) return null;
    return { id: found.id, deg: Number.isFinite(found.deg) ? found.deg : 0, mode: cfg.mode || 'hue' };
}

// HELPERS
const _HUE_EPS = 0.001;

function _normalizeSlot(slot) {
    return (slot && COSMETICS[slot]) ? slot : COSMETIC_SLOTS.HEAD;
}

function _normalizeCosmeticKey(key) {
    return key || 'none';
}

export function resolveCosmeticChromaVariantFromState(slot, cosmeticKey, chromaState, variantIdOverride = null) {
    const safeSlot = _normalizeSlot(slot);
    const key = _normalizeCosmeticKey(cosmeticKey);
    if (key === 'none') return null;

    const storedId =
        (variantIdOverride && typeof variantIdOverride === 'string')
            ? variantIdOverride
            : (chromaState?.[safeSlot]?.[key] ?? null);

    return resolveCosmeticChromaVariant(safeSlot, key, storedId);
}

export function getCosmeticChromaVariantIdFromState(slot, cosmeticKey, chromaState, variantIdOverride = null) {
    const resolved = resolveCosmeticChromaVariantFromState(slot, cosmeticKey, chromaState, variantIdOverride);
    return resolved?.id || null;
}

export function getCosmeticChromaDegFromState(slot, cosmeticKey, chromaState, variantIdOverride = null) {
    const resolved = resolveCosmeticChromaVariantFromState(slot, cosmeticKey, chromaState, variantIdOverride);
    return Number.isFinite(resolved?.deg) ? resolved.deg : 0;
}

export function drawWithOptionalHue(ctx, { hueDeg = 0, baseFilter = '' } = {}, drawFn) {
    if (!ctx || typeof drawFn !== 'function') return;

    const deg = Number.isFinite(hueDeg) ? hueDeg : 0;
    const hasHue = Math.abs(deg) >= _HUE_EPS;
    const hasBase = !!(baseFilter && String(baseFilter).trim());

    if (!hasHue && !hasBase) {
        drawFn();
        return;
    }

    const filter = hasHue
        ? (hasBase ? `${baseFilter} hue-rotate(${deg}deg)` : `hue-rotate(${deg}deg)`)
        : baseFilter;

    ctx.save();
    ctx.filter = filter;
    drawFn();
    ctx.restore();
}

export function getCutsceneSkinPrefixBySkinId(skinId) {
    const entry = SKINS[skinId];
    if (!entry) return '';
    return entry.cutscene?.prefix || '';
}

export function getCutsceneCosmeticOverlayId(slot, cosmeticKey) {
    const safeSlot = (slot && COSMETICS[slot]) ? slot : COSMETIC_SLOTS.HEAD;
    const key = cosmeticKey || 'none';
    const entry = COSMETICS[safeSlot]?.[key];
    if (!entry) return null;
    return entry.cutscene?.overlayId || null;
}