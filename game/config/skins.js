export const FIREDOG_FRAME = {
    width: 100,
    height: 91.3,
};

export const SKINS = {
    defaultSkin: { key: 'defaultSkin', spriteId: 'defaultSkin', label: 'Default', cutscene: { prefix: '' } },
    shinySkin: { key: 'shinySkin', spriteId: 'shinySkin', label: 'Firedog (Shiny)', variantOf: 'defaultSkin', hidden: true, cutscene: { prefix: 'shiny' } },
    midnightSteelSkin: { key: 'midnightSteelSkin', spriteId: 'midnightSteelSkin', label: 'Midnight Steel', cutscene: { prefix: 'midnightSteel' } },
    sunsetIronSkin: { key: 'sunsetIronSkin', spriteId: 'sunsetIronSkin', label: 'Sunset Iron', cutscene: { prefix: 'sunsetIron' } },
    reddenShockSkin: { key: 'reddenShockSkin', spriteId: 'reddenShockSkin', label: 'Redden Shock', cutscene: { prefix: 'reddenShock' } },
    neonPinkSkin: { key: 'neonPinkSkin', spriteId: 'neonPinkSkin', label: 'Neon Pink', cutscene: { prefix: '' } },
    ghostSkin: { key: 'ghostSkin', spriteId: 'ghostSkin', label: 'Ghost', cutscene: { prefix: 'ghost' } },
    zombieSkin: { key: 'zombieSkin', spriteId: 'zombieSkin', label: 'Zombie', cutscene: { prefix: 'zombie' } },
    sharkSkin: { key: 'sharkSkin', spriteId: 'sharkSkin', label: 'Shark', cutscene: { prefix: 'shark' } },
    zebraSkin: { key: 'zebraSkin', spriteId: 'zebraSkin', label: 'Zebra', cutscene: { prefix: 'zebra' } },
    foxSkin: { key: 'foxSkin', spriteId: 'foxSkin', label: 'Fox', cutscene: { prefix: 'fox' } },
    leopardSkin: { key: 'leopardSkin', spriteId: 'leopardSkin', label: 'Leopard', cutscene: { prefix: 'leopard' } },
    tigerSkin: { key: 'tigerSkin', spriteId: 'tigerSkin', label: 'Tiger', cutscene: { prefix: 'tiger' } },
    iceBreakerSkin: { key: 'iceBreakerSkin', spriteId: 'iceBreakerSkin', label: 'Ice Breaker', cutscene: { prefix: 'iceBreaker' } },
    infernalSkin: { key: 'infernalSkin', spriteId: 'infernalSkin', label: 'Infernal', cutscene: { prefix: 'infernal' } },
    galaxySkin: { key: 'galaxySkin', spriteId: 'galaxySkin', label: 'Galaxy', cutscene: { prefix: 'galaxy' } },
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
    'iceBreakerSkin',
    'infernalSkin',
    'galaxySkin',
];

export const COSMETIC_SLOTS = Object.freeze({
    HEAD: 'head',
    NECK: 'neck',
    EYES: 'eyes',
    FACE: 'face',
});

export const COSMETIC_LAYER_ORDER = Object.freeze([
    COSMETIC_SLOTS.NECK,
    COSMETIC_SLOTS.EYES,
    COSMETIC_SLOTS.FACE,
    COSMETIC_SLOTS.HEAD,
]);

const NONE_ENTRY = Object.freeze({
    key: 'none',
    spriteId: null,
    label: 'None',
    cutscene: { overlayId: null },
});

export const COSMETICS = {
    [COSMETIC_SLOTS.HEAD]: {
        none: NONE_ENTRY,
        hatOutfit: { key: 'hatOutfit', spriteId: 'hatOutfit', label: 'Hat', cutscene: { overlayId: 'cutsceneHatOutfit' } },
        headBandanaOutfit: { key: 'headBandanaOutfit', spriteId: 'headBandanaOutfit', label: 'Head Bandana', cutscene: { overlayId: 'cutsceneHeadBandanaOutfit' } },
        frogCrownOutfit: { key: 'frogCrownOutfit', spriteId: 'frogCrownOutfit', label: 'Frog Crown', cutscene: { overlayId: 'cutsceneFrogCrownOutfit' } },
        kingsCrownOutfit: { key: 'kingsCrownOutfit', spriteId: 'kingsCrownOutfit', label: "King's Crown", cutscene: { overlayId: 'cutsceneKingsCrownOutfit' } },
        cowboyHatOutfit: { key: 'cowboyHatOutfit', spriteId: 'cowboyHatOutfit', label: 'Cowboy Hat', cutscene: { overlayId: 'cutsceneCowboyHatOutfit' } },
        unicornHornOutfit: { key: 'unicornHornOutfit', spriteId: 'unicornHornOutfit', label: 'Unicorn Horn', cutscene: { overlayId: 'cutsceneUnicornHornOutfit' } },
        flowerOutfit: { key: 'flowerOutfit', spriteId: 'flowerOutfit', label: 'Flower', cutscene: { overlayId: 'cutsceneFlowerOutfit' } },
        catEarsOutfit: { key: 'catEarsOutfit', spriteId: 'catEarsOutfit', label: 'Cat Ears', cutscene: { overlayId: 'cutsceneCatEarsOutfit' } },
        devilHornsOutfit: { key: 'devilHornsOutfit', spriteId: 'devilHornsOutfit', label: 'Devil Horns', cutscene: { overlayId: 'cutsceneDevilHornsOutfit' } },
    },

    [COSMETIC_SLOTS.EYES]: {
        none: NONE_ENTRY,
        thugSunglassesOutfit: { key: 'thugSunglassesOutfit', spriteId: 'thugSunglassesOutfit', label: 'Thug Sunglasses', cutscene: { overlayId: 'cutsceneThugSunglassesOutfit' } },
        pirateEyePatchOutfit: { key: 'pirateEyePatchOutfit', spriteId: 'pirateEyePatchOutfit', label: 'Pirate Eye Patch', cutscene: { overlayId: 'cutscenePirateEyePatchOutfit' } },
    },

    [COSMETIC_SLOTS.NECK]: {
        none: NONE_ENTRY,
        neckerchiefOutfit: { key: 'neckerchiefOutfit', spriteId: 'neckerchiefOutfit', label: 'Neckerchief', cutscene: { overlayId: 'cutsceneNeckerchiefOutfit' } },
        scarfOutfit: { key: 'scarfOutfit', spriteId: 'scarfOutfit', label: 'Scarf', cutscene: { overlayId: 'cutsceneScarfOutfit' } },
        cubanChainOutfit: { key: 'cubanChainOutfit', spriteId: 'cubanChainOutfit', label: 'Cuban Chain', cutscene: { overlayId: 'cutsceneCubanChainOutfit' } },
    },

    [COSMETIC_SLOTS.FACE]: {
        none: NONE_ENTRY,
        mustacheOutfit: { key: 'mustacheOutfit', spriteId: 'mustacheOutfit', label: 'Mustache', cutscene: { overlayId: 'cutsceneMustacheOutfit' } },
        bullRingOutfit: { key: 'bullRingOutfit', spriteId: 'bullRingOutfit', label: 'Bull Ring', cutscene: { overlayId: 'cutsceneBullRingOutfit' } },
    },
};

export const COSMETIC_MENU_ORDER = {
    [COSMETIC_SLOTS.HEAD]: [
        'none',
        'hatOutfit',
        'headBandanaOutfit',
        'frogCrownOutfit',
        'kingsCrownOutfit',
        'cowboyHatOutfit',
        'unicornHornOutfit',
        'flowerOutfit',
        'catEarsOutfit',
        'devilHornsOutfit',
    ],
    [COSMETIC_SLOTS.NECK]: [
        'none',
        'neckerchiefOutfit',
        'scarfOutfit',
        'cubanChainOutfit',
    ],
    [COSMETIC_SLOTS.EYES]: [
        'none',
        'thugSunglassesOutfit',
        'pirateEyePatchOutfit',
    ],
    [COSMETIC_SLOTS.FACE]: [
        'none',
        'mustacheOutfit',
        'bullRingOutfit',
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
