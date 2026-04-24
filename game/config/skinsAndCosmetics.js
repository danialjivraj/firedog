export const FIREDOG_FRAME = {
    width: 100,
    height: 91.6,
};

export const SKINS = {
    defaultSkin: { key: 'defaultSkin', spriteId: 'defaultSkin', label: 'Default', description: "Good ol' classic Firedog. Still gets the job done.", cutscene: { prefix: '' }, price: 0, ownedByDefault: true },
    shinySkin: { key: 'shinySkin', spriteId: 'shinySkin', label: 'Shiny', description: 'Rare sparkle mode. Definitely not overconfident.', variantOf: 'defaultSkin', hidden: true, cutscene: { prefix: 'shiny' }, price: 0, ownedByDefault: true },
    midnightSteelSkin: { key: 'midnightSteelSkin', spriteId: 'midnightSteelSkin', label: 'Midnight Steel', description: 'Built like steel. Colored like bedtime.', cutscene: { prefix: 'midnightSteel' }, price: 30, ownedByDefault: false },
    sunsetIronSkin: { key: 'sunsetIronSkin', spriteId: 'sunsetIronSkin', label: 'Sunset Iron', description: 'Warm metal vibes for dramatic evening zoomies.', cutscene: { prefix: 'sunsetIron' }, price: 30, ownedByDefault: false },
    reddenShockSkin: { key: 'reddenShockSkin', spriteId: 'reddenShockSkin', label: 'Redden Shock', description: 'Touched one wire and made it a personality.', cutscene: { prefix: 'reddenShock' }, price: 35, ownedByDefault: false },
    neonPinkSkin: { key: 'neonPinkSkin', spriteId: 'neonPinkSkin', label: 'Neon Pink', description: 'Impossible to miss. Even in another postcode.', cutscene: { prefix: 'neonPink' }, price: 35, ownedByDefault: false },
    ghostSkin: { key: 'ghostSkin', spriteId: 'ghostSkin', label: 'Ghost', description: 'Spooky, floaty, still somehow leaves pawprints.', cutscene: { prefix: 'ghost' }, price: 40, ownedByDefault: false },
    zombieSkin: { key: 'zombieSkin', spriteId: 'zombieSkin', label: 'Zombie', description: 'Mostly undead. Fully committed to snacks.', cutscene: { prefix: 'zombie' }, price: 45, ownedByDefault: false },
    sharkSkin: { key: 'sharkSkin', spriteId: 'sharkSkin', label: 'Shark', description: 'Dun dun... tiny paws approaching.', cutscene: { prefix: 'shark' }, price: 50, ownedByDefault: false },
    zebraSkin: { key: 'zebraSkin', spriteId: 'zebraSkin', label: 'Zebra', description: 'Stripes so bold traffic may respectfully pause.', cutscene: { prefix: 'zebra' }, price: 50, ownedByDefault: false },
    foxSkin: { key: 'foxSkin', spriteId: 'foxSkin', label: 'Fox', description: 'Sneaky forest charm with premium mischief included.', cutscene: { prefix: 'fox' }, price: 50, ownedByDefault: false },
    leopardSkin: { key: 'leopardSkin', spriteId: 'leopardSkin', label: 'Leopard', description: 'Spots, speed, and suspiciously fancy confidence.', cutscene: { prefix: 'leopard' }, price: 50, ownedByDefault: false },
    tigerSkin: { key: 'tigerSkin', spriteId: 'tigerSkin', label: 'Tiger', description: 'Orange, striped, and absolutely not a house cat.', cutscene: { prefix: 'tiger' }, price: 50, ownedByDefault: false },
    iceBreakerSkin: { key: 'iceBreakerSkin', spriteId: 'iceBreakerSkin', label: 'Ice Breaker', description: 'Cold enough to make awkward silence useful.', cutscene: { prefix: 'iceBreaker' }, price: 0, ownedByDefault: false, giftFlag: 'glacikalDefeated', giftColor: 'cyan' },
    infernalSkin: { key: 'infernalSkin', spriteId: 'infernalSkin', label: 'Infernal', description: 'So hot the lava asked for personal space.', cutscene: { prefix: 'infernal' }, price: 0, ownedByDefault: false, giftFlag: 'elyvorgDefeated', giftColor: 'orangered' },
    galaxySkin: { key: 'galaxySkin', spriteId: 'galaxySkin', label: 'Galaxy', description: 'One small step for Firedog, one giant nap after.', cutscene: { prefix: 'galaxy' }, price: 0, ownedByDefault: false, giftFlag: 'ntharaxDefeated', giftColor: 'violet' },
};

export const GIFT_SKINS = Object.values(SKINS)
    .filter(skin => skin.giftFlag)
    .map(skin => ({ key: skin.key, flag: skin.giftFlag }));

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
    description: 'No accessory. Just pure, unfiltered Firedog.',
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
        unicornHornOutfit: { key: 'unicornHornOutfit', spriteId: 'unicornHornOutfit', label: 'Unicorn Horn', description: 'Instant magical authority. May attract rainbows.', cutscene: { overlayId: 'cutsceneUnicornHornOutfit' }, price: 5, ownedByDefault: false },
        flowerOutfit: {
            key: 'flowerOutfit', spriteId: 'flowerOutfit', label: 'Flower', description: 'Soft, cute, and ready for dramatic pollen season.', cutscene: { overlayId: 'cutsceneFlowerOutfit' }, price: 10, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'lightblue', deg: 220 },
                ],
            }),
            chromaSwatchBaseHex: '#ffbcd2',
        },
        frogCrownOutfit: {
            key: 'frogCrownOutfit', spriteId: 'frogCrownOutfit', label: 'Frog Crown', description: 'Royal ribbits. Questionable paperwork.', cutscene: { overlayId: 'cutsceneFrogCrownOutfit' }, price: 10, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'blue', deg: 100 },
                    { id: 'red', deg: 240 },
                ],
            }),
            chromaSwatchBaseHex: '#036a00',
        },
        hatOutfit: {
            key: 'hatOutfit', spriteId: 'hatOutfit', label: 'Hat', description: 'A classic hat. Somehow improves decision making.', cutscene: { overlayId: 'cutsceneHatOutfit' }, price: 15, ownedByDefault: false,
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
        clownWigOutfit: { key: 'clownWigOutfit', spriteId: 'clownWigOutfit', label: 'Clown Wig', description: 'Maximum circus. Minimum personal space.', cutscene: { overlayId: 'cutsceneClownWigOutfit' }, price: 15, ownedByDefault: false },
        cowboyHatOutfit: { key: 'cowboyHatOutfit', spriteId: 'cowboyHatOutfit', label: 'Cowboy Hat', description: 'Yeehaw, but make it canine.', cutscene: { overlayId: 'cutsceneCowboyHatOutfit' }, price: 20, ownedByDefault: false },
        catEarsOutfit: {
            key: 'catEarsOutfit', spriteId: 'catEarsOutfit', label: 'Cat Ears', description: 'For undercover cat operations. Very convincing.', cutscene: { overlayId: 'cutsceneCatEarsOutfit' }, price: 20, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'lightgreen', deg: 150 },
                ],
            }),
            chromaSwatchBaseHex: '#febcce',
        },
        devilHornsOutfit: {
            key: 'devilHornsOutfit', spriteId: 'devilHornsOutfit', label: 'Devil Horns', description: 'Tiny horns. Big bad idea energy.', cutscene: { overlayId: 'cutsceneDevilHornsOutfit' }, price: 20, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'purple', deg: 270 },
                ],
            }),
            chromaSwatchBaseHex: '#d43031',
        },
        bandanaOutfit: {
            key: 'bandanaOutfit', spriteId: 'bandanaOutfit', label: 'Bandana', description: 'Neighborhood tough guy. Still afraid of baths.', cutscene: { overlayId: 'cutsceneBandanaOutfit' }, price: 25, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'red', deg: 120 },
                    { id: 'green', deg: 240 },
                    { id: 'purple', deg: 50 },
                ],
            }),
            chromaSwatchBaseHex: '#002dbc',
        },
        vikingHelmetOutfit: { key: 'vikingHelmetOutfit', spriteId: 'vikingHelmetOutfit', label: 'Viking Helmet', description: 'For pillaging treats and looking historically loud.', cutscene: { overlayId: 'cutsceneVikingHelmetOutfit' }, price: 25, ownedByDefault: false },
        kingsCrownOutfit: { key: 'kingsCrownOutfit', spriteId: 'kingsCrownOutfit', label: "King's Crown", description: 'A crown fit for barking decrees at squirrels.', cutscene: { overlayId: 'cutsceneKingsCrownOutfit' }, price: 30, ownedByDefault: false },
    },

    [COSMETIC_SLOTS.NECK]: {
        none: NONE_ENTRY,
        bowtieOutfit: {
            key: 'bowtieOutfit', spriteId: 'bowtieOutfit', label: 'Bowtie', description: 'Fancy enough for dinner. Dangerous near soup.', cutscene: { overlayId: 'cutsceneBowtieOutfit' }, price: 5, ownedByDefault: false,
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
        necktieOutfit: {
            key: 'necktieOutfit', spriteId: 'necktieOutfit', label: 'Necktie', description: 'Business casual, except the business is chaos.', cutscene: { overlayId: 'cutsceneNecktieOutfit' }, price: 10, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'blue', deg: 240 },
                    { id: 'green', deg: 110 },
                ],
            }),
            chromaSwatchBaseHex: '#e00f13',
        },
        hawaiianNecklaceOutfit: { key: 'hawaiianNecklaceOutfit', spriteId: 'hawaiianNecklaceOutfit', label: 'Hawaiian Necklace', description: 'Aloha energy. Zero beach required.', cutscene: { overlayId: 'cutsceneHawaiianNecklaceOutfit' }, price: 15, ownedByDefault: false },
        scarfOutfit: {
            key: 'scarfOutfit', spriteId: 'scarfOutfit', label: 'Scarf', description: 'Cozy, heroic, and likely to flap dramatically.', cutscene: { overlayId: 'cutsceneScarfOutfit' }, price: 20, ownedByDefault: false,
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
        pearlOutfit: { key: 'pearlOutfit', spriteId: 'pearlOutfit', label: 'Pearl', description: 'Classy pearls for a dog with appointments.', cutscene: { overlayId: 'cutscenePearlOutfit' }, price: 20, ownedByDefault: false },
        championMedalOutfit: { key: 'championMedalOutfit', spriteId: 'championMedalOutfit', label: 'Champion Medal', description: 'Proof of greatness. Or at least enthusiasm.', cutscene: { overlayId: 'cutsceneChampionMedalOutfit' }, price: 20, ownedByDefault: false },
        neckerchiefOutfit: {
            key: 'neckerchiefOutfit', spriteId: 'neckerchiefOutfit', label: 'Neckerchief', description: 'Tiny outlaw scarf. Big suspicious energy.', cutscene: { overlayId: 'cutsceneNeckerchiefOutfit' }, price: 20, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'red', deg: 120 },
                    { id: 'green', deg: 240 },
                    { id: 'purple', deg: 50 },
                ],
            }),
            chromaSwatchBaseHex: '#002dbc',
        },
        spikeChokerOutfit: { key: 'spikeChokerOutfit', spriteId: 'spikeChokerOutfit', label: 'Spike Choker', description: 'Punk rock neckwear. Do not hug recklessly.', cutscene: { overlayId: 'cutsceneSpikeChokerOutfit' }, price: 25, ownedByDefault: false },
        cubanChainOutfit: { key: 'cubanChainOutfit', spriteId: 'cubanChainOutfit', label: 'Cuban Chain', description: 'Heavy drip for lightweight sprinting.', cutscene: { overlayId: 'cutsceneCubanChainOutfit' }, price: 30, ownedByDefault: false },
    },

    [COSMETIC_SLOTS.EYES]: {
        none: NONE_ENTRY,
        roundGlassesOutfit: { key: 'roundGlassesOutfit', spriteId: 'roundGlassesOutfit', label: 'Round Glasses', description: 'Tiny professor energy. Homework still optional.', cutscene: { overlayId: 'cutsceneRoundGlassesOutfit' }, price: 5, ownedByDefault: false },
        leopardPrintSunglassesOutfit: { key: 'leopardPrintSunglassesOutfit', spriteId: 'leopardPrintSunglassesOutfit', label: 'Leopard Sunglasses', description: 'For seeing spots before becoming one.', cutscene: { overlayId: 'cutsceneLeopardPrintSunglassesOutfit' }, price: 10, ownedByDefault: false },
        glasses3dOutfit: { key: 'glasses3dOutfit', spriteId: 'glasses3dOutfit', label: '3D Glasses', description: 'Now seeing snacks in an extra dimension.', cutscene: { overlayId: 'cutsceneGlasses3dOutfit' }, price: 15, ownedByDefault: false },
        pirateEyePatchOutfit: {
            key: 'pirateEyePatchOutfit', spriteId: 'pirateEyePatchOutfit', label: 'Pirate Eye Patch', description: 'Arrr-rated for treasure and depth perception.', cutscene: { overlayId: 'cutscenePirateEyePatchOutfit' }, price: 20, ownedByDefault: false,
            chroma: makeHueChromaPack({
                variants: [
                    { id: 'base', deg: 0 },
                    { id: 'yellow', deg: 160 },
                    { id: 'green', deg: 250 },
                ],
            }),
            chromaSwatchBaseHex: '#5951ae',
        },
        wayfarerSunglassesOutfit: {
            key: 'wayfarerSunglassesOutfit', spriteId: 'wayfarerSunglassesOutfit', label: 'Wayfarer Sunglasses', description: 'Cool enough to ignore explosions politely.', cutscene: { overlayId: 'cutsceneWayfarerSunglassesOutfit' }, price: 20, ownedByDefault: false,
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
        thugSunglassesOutfit: {
            key: 'thugSunglassesOutfit', spriteId: 'thugSunglassesOutfit', label: 'Thug Sunglasses', description: 'Deal with it, but politely.', cutscene: { overlayId: 'cutsceneThugSunglassesOutfit' }, price: 25, ownedByDefault: false,
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
        bullRingOutfit: { key: 'bullRingOutfit', spriteId: 'bullRingOutfit', label: 'Bull Ring', description: 'Tiny tough-guy ring. Big snort potential.', cutscene: { overlayId: 'cutsceneBullRingOutfit' }, price: 10, ownedByDefault: false },
        catWhiskersOutfit: {
            key: 'catWhiskersOutfit', spriteId: 'catWhiskersOutfit', label: 'Cat Whiskers', description: 'For detecting snacks through walls, allegedly.', cutscene: { overlayId: 'cutsceneCatWhiskersOutfit' }, price: 15, ownedByDefault: false,
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
            key: 'clownNoseOutfit', spriteId: 'clownNoseOutfit', label: 'Clown Nose', description: 'Honk responsibly. Side effects include giggling.', cutscene: { overlayId: 'cutsceneClownNoseOutfit' }, price: 20, ownedByDefault: false,
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
            key: 'mustacheOutfit', spriteId: 'mustacheOutfit', label: 'Mustache', description: 'Instant disguise. Nobody suspects the dog.', cutscene: { overlayId: 'cutsceneMustacheOutfit' }, price: 25, ownedByDefault: false,
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
        'flowerOutfit',
        'frogCrownOutfit',
        'hatOutfit',
        'clownWigOutfit',
        'cowboyHatOutfit',
        'catEarsOutfit',
        'devilHornsOutfit',
        'bandanaOutfit',
        'vikingHelmetOutfit',
        'kingsCrownOutfit',
    ],
    [COSMETIC_SLOTS.NECK]: [
        'none',
        'bowtieOutfit',
        'necktieOutfit',
        'hawaiianNecklaceOutfit',
        'scarfOutfit',
        'pearlOutfit',
        'championMedalOutfit',
        'neckerchiefOutfit',
        'spikeChokerOutfit',
        'cubanChainOutfit',
    ],
    [COSMETIC_SLOTS.EYES]: [
        'none',
        'roundGlassesOutfit',
        'leopardPrintSunglassesOutfit',
        'glasses3dOutfit',
        'pirateEyePatchOutfit',
        'wayfarerSunglassesOutfit',
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

// export function logCosmeticPrices() {
//     const skinsTotal = Object.values(SKINS)
//         .filter(s => !s.ownedByDefault && s.price < 1000)
//         .reduce((sum, s) => sum + (s.price || 0), 0);

//     console.log('=== Skins ===');
//     console.log(`  skins: ${skinsTotal}`);

//     const slotTotals = {};
//     let cosmeticsTotal = 0;

//     for (const slot of Object.values(COSMETIC_SLOTS)) {
//         const entries = COSMETICS[slot];
//         const total = Object.values(entries)
//             .filter(e => e.key !== 'none')
//             .reduce((sum, e) => sum + (e.price || 0), 0);
//         slotTotals[slot] = total;
//         cosmeticsTotal += total;
//     }

//     console.log('=== Cosmetics ===');
//     for (const [slot, total] of Object.entries(slotTotals)) {
//         console.log(`  ${slot}: ${total}`);
//     }
//     console.log(`  cosmetics total: ${cosmeticsTotal}`);

//     console.log(`=== Total: ${skinsTotal + cosmeticsTotal} ===`);
// }

// window.logCosmeticPrices = logCosmeticPrices;
