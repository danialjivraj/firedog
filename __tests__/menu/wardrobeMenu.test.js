import { Wardrobe } from '../../game/menu/wardrobeMenu.js';

jest.mock('../../game/config/skinsAndCosmetics.js', () => {
    const actual = jest.requireActual('../../game/config/skinsAndCosmetics.js');

    const getById = (id) => {
        if (!id) return null;
        return global.document?.getElementById?.(id) || null;
    };

    const getCosmeticChromaConfig = jest.fn((slot, key) => {
        const def = actual.COSMETICS?.[slot]?.[key];
        return def?.chroma || null;
    });

    const resolveCosmeticChromaVariant = jest.fn((slot, key, variantId) => {
        const cfg = getCosmeticChromaConfig(slot, key);
        if (!cfg || !Array.isArray(cfg.variants) || cfg.variants.length === 0) return null;

        const byId = cfg.variants.find((v) => v?.id === variantId);
        if (byId) return byId;

        const byDefault = cfg.variants.find((v) => v?.id === cfg.default);
        return byDefault || cfg.variants[0] || null;
    });

    const getCosmeticChromaVariantIdFromState = jest.fn((slot, key, state) => {
        const v = state?.[slot]?.[key];
        return typeof v === 'string' ? v : null;
    });

    const getCosmeticChromaDegFromState = jest.fn((slot, key, state) => {
        const cfg = getCosmeticChromaConfig(slot, key);
        if (!cfg || !Array.isArray(cfg.variants) || cfg.variants.length === 0) return 0;

        const id = getCosmeticChromaVariantIdFromState(slot, key, state);
        const resolved = resolveCosmeticChromaVariant(slot, key, id || cfg.default);
        return Number.isFinite(resolved?.deg) ? resolved.deg : 0;
    });

    return {
        ...actual,

        getSkinElement: jest.fn((key) => getById(actual.SKINS?.[key]?.spriteId || actual.SKINS?.[key]?.id || key)),
        getCosmeticElement: jest.fn((slot, key) => {
            const def = actual.COSMETICS?.[slot]?.[key];
            return getById(def?.spriteId || def?.id || key);
        }),

        getCosmeticChromaConfig,
        resolveCosmeticChromaVariant,
        getCosmeticChromaVariantIdFromState,
        getCosmeticChromaDegFromState,

        drawWithOptionalHue: jest.fn((ctx, opts, fn) => fn()),
    };
});

import {
    FIREDOG_FRAME,
    SKINS,
    SKIN_MENU_ORDER,
    COSMETIC_SLOTS,
    COSMETIC_MENU_ORDER,
    COSMETICS,
    COSMETIC_LAYER_ORDER,
} from '../../game/config/skinsAndCosmetics.js';

describe('Wardrobe menu', () => {
    let menu, mockGame, ctx;

    function buildDomSprites() {
        const ids = new Set(['skinStage']);

        for (const k of Object.keys(SKINS || {})) {
            const def = SKINS[k];
            if (!def) continue;
            if (def.spriteId) ids.add(def.spriteId);
            if (def.id) ids.add(def.id);
            ids.add(k);
        }

        for (const slot of Object.values(COSMETIC_SLOTS)) {
            const slotMap = COSMETICS?.[slot];
            if (!slotMap) continue;
            for (const k of Object.keys(slotMap)) {
                const def = slotMap[k];
                if (!def) continue;
                if (def.spriteId) ids.add(def.spriteId);
                if (def.id) ids.add(def.id);
                ids.add(k);
            }
        }

        document.body.innerHTML = [...ids].map((id) => `<img id="${id}" />`).join('\n');
    }

    function ensureAtLeastOneChromaCosmetic() {
        const slot = COSMETIC_SLOTS.HEAD;
        const keys = COSMETIC_MENU_ORDER?.[slot] || [];
        const key = keys.find((k) => k !== 'none' && COSMETICS?.[slot]?.[k]) || null;
        if (!key) return { slot: null, key: null };

        const def = COSMETICS[slot][key];
        def.chroma = def.chroma || {
            default: 'base',
            variants: [
                { id: 'base', deg: 0 },
                { id: 'alt', deg: 120 },
            ],
        };
        def.chromaSwatchBaseHex = def.chromaSwatchBaseHex || '#ff0000';

        return { slot, key };
    }

    function makeCtx() {
        return {
            save: jest.fn(),
            restore: jest.fn(),
            drawImage: jest.fn(),
            fillRect: jest.fn(),
            fillText: jest.fn(),
            strokeText: jest.fn(),

            measureText: jest.fn().mockReturnValue({ width: 50 }),

            beginPath: jest.fn(),
            rect: jest.fn(),
            clip: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),

            moveTo: jest.fn(),
            lineTo: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            closePath: jest.fn(),
            arc: jest.fn(),
            arcTo: jest.fn(),
            roundRect: jest.fn(),
            quadraticCurveTo: jest.fn(),

            font: '',
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            shadowColor: '',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            textAlign: '',
            textBaseline: '',
            globalAlpha: 1,
        };
    }

    let chromaSeed;

    beforeAll(() => {
        buildDomSprites();
        chromaSeed = ensureAtLeastOneChromaCosmetic();
    });

    beforeEach(() => {
        mockGame = {
            width: 1920,
            height: 689,
            creditCoins: 0,
            ownedSkins: {},
            ownedCosmetics: {
                [COSMETIC_SLOTS.HEAD]: {},
                [COSMETIC_SLOTS.NECK]: {},
                [COSMETIC_SLOTS.EYES]: {},
                [COSMETIC_SLOTS.NOSE]: {},
            },
            audioHandler: {
                menu: {
                    playSound: jest.fn(),
                    stopSound: jest.fn(),
                },
            },
            menu: {
                main: { activateMenu: jest.fn() },
                pause: { isPaused: false },
                gameOver: { menuActive: false },
            },
            input: {
                handleEscapeKey: jest.fn(),
            },
            cutsceneActive: false,
            isPlayerInGame: false,
            gameOver: false,
            notEnoughCoins: false,

            canSelect: true,
            canSelectForestMap: true,

            canvas: {
                width: 1920,
                height: 689,
                getBoundingClientRect: () => ({
                    left: 0,
                    top: 0,
                    right: 1920,
                    bottom: 689,
                    width: 1920,
                    height: 689,
                }),
            },

            saveGameState: jest.fn(),
        };

        menu = new Wardrobe(mockGame);
        menu.menuActive = true;

        ctx = makeCtx();

        jest.clearAllMocks();
    });

    describe('initialization', () => {
        it('sets defaults: active skins tab, default skin, all cosmetics none, background skinStage', () => {
            expect(menu.activeTabIndex).toBe(0);
            expect(menu.tabs[0].kind).toBe('skin');
            expect(menu.currentSkinKey).toBe('defaultSkin');

            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.HEAD)).toBe('none');
            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.NECK)).toBe('none');
            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.EYES)).toBe('none');
            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.NOSE)).toBe('none');

            expect(menu.backgroundImage).toBe(document.getElementById('skinStage'));
            expect(menu.width).toBe(FIREDOG_FRAME.width);
            expect(menu.height).toBe(FIREDOG_FRAME.height);

            expect(menu.selectedOption).toBe(0);
            expect(menu.filterModes).toEqual(['All', 'Owned', 'Unowned']);
            expect(menu.filterModeIndex).toBe(0);
        });

        it('activateMenu resets tab to skins + filter to All + closes modal + resets scroll for tab 0', () => {
            menu.activeTabIndex = 3;
            menu.filterModeIndex = 2;
            menu.filterOpen = true;
            menu.modal = { type: 'preview', item: { kind: 'skin', key: 'defaultSkin' } };
            menu.scrollYByTab[0] = 999;
            menu.targetScrollYByTab[0] = 999;
            menu.selectedOption = 5;

            menu.activateMenu(0);

            expect(menu.activeTabIndex).toBe(0);
            expect(menu.filterModeIndex).toBe(0);
            expect(menu.filterOpen).toBe(false);
            expect(menu.modal).toBeNull();
            expect(menu.scrollYByTab[0]).toBe(0);
            expect(menu.targetScrollYByTab[0]).toBe(0);
        });

        it('getCurrentSkinId prefers spriteId and falls back safely', () => {
            menu.currentSkinKey = 'defaultSkin';
            expect(menu.getCurrentSkinId()).toBe(SKINS.defaultSkin.spriteId || menu.currentSkin?.id || 'defaultSkin');

            menu.currentSkinKey = 'no_such_skin';
            expect(menu.getCurrentSkinId()).toBe('defaultSkin');
        });
    });

    describe('ownership rules', () => {
        it('_isSkinOwned: defaultSkin and shinySkin are always owned', () => {
            expect(menu._isSkinOwned('defaultSkin')).toBe(true);
            expect(menu._isSkinOwned('shinySkin')).toBe(true);
        });

        it('_isSkinOwned: normal skins depend on game.ownedSkins', () => {
            const someNonDefault =
                SKIN_MENU_ORDER.find((k) => k !== 'defaultSkin' && k !== 'shinySkin') || 'midnightSteelSkin';

            mockGame.ownedSkins[someNonDefault] = true;
            expect(menu._isSkinOwned(someNonDefault)).toBe(true);

            delete mockGame.ownedSkins[someNonDefault];
            expect(menu._isSkinOwned(someNonDefault)).toBe(false);
        });

        it('_isSkinOwned: gift skins depend on boss flags, not ownedSkins', () => {
            expect(menu._isSkinOwned('iceBreakerSkin')).toBe(false);
            mockGame.glacikalDefeated = true;
            expect(menu._isSkinOwned('iceBreakerSkin')).toBe(true);

            expect(menu._isSkinOwned('infernalSkin')).toBe(false);
            mockGame.elyvorgDefeated = true;
            expect(menu._isSkinOwned('infernalSkin')).toBe(true);

            expect(menu._isSkinOwned('galaxySkin')).toBe(false);
            mockGame.ntharaxDefeated = true;
            expect(menu._isSkinOwned('galaxySkin')).toBe(true);

            mockGame.glacikalDefeated = false;
            mockGame.ownedSkins.iceBreakerSkin = true;
            expect(menu._isSkinOwned('iceBreakerSkin')).toBe(false);
        });

        it('_isCosmeticOwned: none is always owned, otherwise uses game.ownedCosmetics per slot', () => {
            expect(menu._isCosmeticOwned(COSMETIC_SLOTS.HEAD, 'none')).toBe(true);

            const someHead =
                (COSMETIC_MENU_ORDER[COSMETIC_SLOTS.HEAD] || []).find((k) => k !== 'none') || 'hatOutfit';

            expect(menu._isCosmeticOwned(COSMETIC_SLOTS.HEAD, someHead)).toBe(false);
            mockGame.ownedCosmetics[COSMETIC_SLOTS.HEAD][someHead] = true;
            expect(menu._isCosmeticOwned(COSMETIC_SLOTS.HEAD, someHead)).toBe(true);
        });
    });

    describe('setCurrentSkinByKey / setCurrentSkinById', () => {
        it('setCurrentSkinById resolves by spriteId/id/key and forces exact (no shiny roll)', () => {
            menu.setCurrentSkinById('midnightSteelSkin');
            expect(menu.currentSkinKey).toBe('midnightSteelSkin');

            menu.setCurrentSkinById('no-such-id');
            expect(menu.currentSkinKey).toBe('defaultSkin');
        });

        it('defaultSkin rolls shiny 10% when not forcing exact (>= 0.9)', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.95);

            menu.setCurrentSkinByKey('defaultSkin');

            expect(menu.currentSkinKey).toBe('shinySkin');
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('shinySkinRizzSound');

            Math.random.mockRestore();
        });

        it('defaultSkin stays default 90% when not forcing exact (< 0.9)', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.1);

            menu.setCurrentSkinByKey('defaultSkin');

            expect(menu.currentSkinKey).toBe('defaultSkin');
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalledWith('shinySkinRizzSound');

            Math.random.mockRestore();
        });

        it('locked gift skin cannot be equipped and plays optionSelectedSound', () => {
            mockGame.glacikalDefeated = false;

            menu.setCurrentSkinByKey('iceBreakerSkin');

            expect(menu.currentSkinKey).toBe('defaultSkin');
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
        });

        it('unlocked gift skin can be equipped (forceExact)', () => {
            mockGame.glacikalDefeated = true;

            menu.setCurrentSkinByKey('iceBreakerSkin', { forceExact: true });

            expect(menu.currentSkinKey).toBe('iceBreakerSkin');
        });
    });

    describe('setCurrentCosmeticByKey / setCurrentCosmeticById', () => {
        it('setCurrentCosmeticByKey sets valid cosmetic and falls back to none', () => {
            const someHead =
                (COSMETIC_MENU_ORDER[COSMETIC_SLOTS.HEAD] || []).find((k) => k !== 'none') || 'hatOutfit';

            menu.setCurrentCosmeticByKey(COSMETIC_SLOTS.HEAD, someHead);
            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.HEAD)).toBe(someHead);

            menu.setCurrentCosmeticByKey(COSMETIC_SLOTS.HEAD, 'no-such-cosmetic');
            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.HEAD)).toBe('none');
        });

        it('setCurrentCosmeticById resolves by key/id and uses safe slot fallback', () => {
            const someHead =
                (COSMETIC_MENU_ORDER[COSMETIC_SLOTS.HEAD] || []).find((k) => k !== 'none') || 'hatOutfit';

            menu.setCurrentCosmeticById(COSMETIC_SLOTS.HEAD, someHead);
            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.HEAD)).toBe(someHead);

            menu.setCurrentCosmeticById('not-a-slot', someHead);
            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.HEAD)).toBe(someHead);

            menu.setCurrentCosmeticById(COSMETIC_SLOTS.HEAD, 'no-such');
            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.HEAD)).toBe('none');
        });

        it('switching cosmetics clears previous chroma entry for that slot', () => {
            if (!chromaSeed?.slot || !chromaSeed?.key) return;

            const slot = chromaSeed.slot;
            const keyA = chromaSeed.key;

            const keys = COSMETIC_MENU_ORDER?.[slot] || [];
            const keyB = keys.find((k) => k !== 'none' && k !== keyA && COSMETICS?.[slot]?.[k]) || null;
            if (!keyB) return;

            COSMETICS[slot][keyB].chroma = COSMETICS[slot][keyB].chroma || {
                default: 'base',
                variants: [{ id: 'base', deg: 0 }, { id: 'alt', deg: 90 }],
            };

            mockGame.ownedCosmetics[slot][keyA] = true;
            mockGame.ownedCosmetics[slot][keyB] = true;

            menu.setCurrentCosmeticByKey(slot, keyA);
            menu._setCosmeticChromaVariantId(slot, keyA, 'alt');
            expect(menu.getCurrentCosmeticsChromaState()[slot][keyA]).toBe('alt');

            menu.setCurrentCosmeticByKey(slot, keyB);

            expect(menu.getCurrentCosmeticsChromaState()[slot]?.[keyA]).toBeUndefined();
        });
    });

    describe('filtering + ordering', () => {
        it('_getActiveKeysForTab in All mode returns owned first then unowned', () => {
            menu.filterModeIndex = 0; // all
            menu.activeTabIndex = 0; // skins tab

            const a = SKIN_MENU_ORDER.find((k) => k !== 'defaultSkin' && k !== 'shinySkin') || 'midnightSteelSkin';
            const b =
                SKIN_MENU_ORDER.find((k) => k !== 'defaultSkin' && k !== 'shinySkin' && k !== a) || 'sunsetIronSkin';

            mockGame.ownedSkins[a] = true; // owned
            delete mockGame.ownedSkins[b]; // unowned

            const keys = menu._getActiveKeysForTab(menu._getActiveTab());
            const idxA = keys.indexOf(a);
            const idxB = keys.indexOf(b);

            expect(idxA).toBeGreaterThanOrEqual(0);
            expect(idxB).toBeGreaterThanOrEqual(0);
            expect(idxA).toBeLessThan(idxB);
        });

        it('Owned filter only returns owned items (including unlocked gift skins)', () => {
            menu.activeTabIndex = 0; // skins
            menu._setFilterModeIndex(1); // owned

            const someSkin =
                SKIN_MENU_ORDER.find((k) => k !== 'defaultSkin' && k !== 'shinySkin') || 'midnightSteelSkin';
            mockGame.ownedSkins[someSkin] = true;

            mockGame.glacikalDefeated = true; // gift unlocked

            const keys = menu._getActiveKeysForTab(menu._getActiveTab());
            expect(keys).toContain('defaultSkin');
            expect(keys).toContain(someSkin);
            expect(keys).toContain('iceBreakerSkin');

            const definitelyUnowned =
                SKIN_MENU_ORDER.find(
                    (k) => k !== 'defaultSkin' && k !== 'shinySkin' && k !== someSkin && k !== 'iceBreakerSkin'
                ) || null;

            if (definitelyUnowned) {
                expect(keys).not.toContain(definitelyUnowned);
            }
        });

        it('Unowned filter only returns unowned items and does not include owned/unlocked gifts', () => {
            menu.activeTabIndex = 0; // skins
            menu._setFilterModeIndex(2); // unowned

            const someOwned =
                SKIN_MENU_ORDER.find((k) => k !== 'defaultSkin' && k !== 'shinySkin') || 'midnightSteelSkin';
            mockGame.ownedSkins[someOwned] = true;

            mockGame.glacikalDefeated = true; // owned gift
            const keys = menu._getActiveKeysForTab(menu._getActiveTab());

            expect(keys).not.toContain('defaultSkin');
            expect(keys).not.toContain(someOwned);
            expect(keys).not.toContain('iceBreakerSkin');

            const someUnowned =
                SKIN_MENU_ORDER.find((k) => k !== 'defaultSkin' && k !== 'shinySkin' && k !== someOwned) || null;
            if (someUnowned) {
                expect(keys).toContain(someUnowned);
            }
        });
    });

    describe('purchase flow', () => {
        it('_purchaseItem: succeeds for unowned, affordable, non-gift item; deducts cc, marks owned, saves, plays sound', () => {
            menu.activeTabIndex = 0; // skins
            menu.filterModeIndex = 0;

            const buyKey =
                SKIN_MENU_ORDER.find((k) => {
                    const def = SKINS?.[k];
                    if (!def) return false;
                    if (k === 'defaultSkin' || k === 'shinySkin') return false;
                    if (k === 'iceBreakerSkin' || k === 'infernalSkin' || k === 'galaxySkin') return false;
                    return (def.price || 0) > 0;
                }) || 'midnightSteelSkin';

            const item = menu._getItemDef(menu._getActiveTab(), buyKey);
            expect(item).toBeTruthy();
            expect(item.gift).toBe(false);

            mockGame.creditCoins = Math.max(999, (item.price || 0) + 10);

            const ok = menu._purchaseItem(item);
            expect(ok).toBe(true);

            expect(mockGame.creditCoins).toBeGreaterThanOrEqual(0);
            expect(mockGame.ownedSkins[item.key]).toBe(true);
            expect(mockGame.saveGameState).toHaveBeenCalled();
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('purchaseCompletedSound', false, true);
        });

        it('_purchaseItem: fails when not enough cc (does not save or mark owned)', () => {
            menu.activeTabIndex = 0;

            const buyKey =
                SKIN_MENU_ORDER.find(
                    (k) => k !== 'defaultSkin' && k !== 'shinySkin' && k !== 'iceBreakerSkin' && k !== 'infernalSkin' && k !== 'galaxySkin'
                ) || 'midnightSteelSkin';

            const item = menu._getItemDef(menu._getActiveTab(), buyKey);
            mockGame.creditCoins = 0;

            const ok = menu._purchaseItem(item);
            expect(ok).toBe(false);
            expect(mockGame.ownedSkins[item.key]).not.toBe(true);
            expect(mockGame.saveGameState).not.toHaveBeenCalled();
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalledWith('purchaseCompletedSound', false, true);
        });

        it('_purchaseItem: gift skins cannot be purchased even if affordable', () => {
            menu.activeTabIndex = 0;
            mockGame.creditCoins = 9999;

            const item = menu._getItemDef(menu._getActiveTab(), 'iceBreakerSkin');
            expect(item.gift).toBe(true);

            const ok = menu._purchaseItem(item);
            expect(ok).toBe(false);
            expect(mockGame.saveGameState).not.toHaveBeenCalled();
        });
    });

    describe('selection + modals', () => {
        it('_selectCurrent on unowned non-gift opens preview modal instead of equipping', () => {
            menu.activeTabIndex = 0; // skins
            menu.filterModeIndex = 0;

            const targetKey =
                SKIN_MENU_ORDER.find(
                    (k) => k !== 'defaultSkin' && k !== 'shinySkin' && k !== 'iceBreakerSkin' && k !== 'infernalSkin' && k !== 'galaxySkin'
                ) || 'midnightSteelSkin';

            delete mockGame.ownedSkins[targetKey];

            const keys = menu._getActiveKeysForTab(menu._getActiveTab());
            const idx = keys.indexOf(targetKey);
            expect(idx).toBeGreaterThanOrEqual(0);

            menu.selectedOption = idx;
            menu._selectCurrent();

            expect(menu.modal).toBeTruthy();
            expect(menu.modal.type).toBe('preview');
            expect(menu.modal.item.key).toBe(targetKey);
            expect(menu.currentSkinKey).toBe('defaultSkin');
        });

        it('_selectCurrent on owned item equips and saves', () => {
            menu.activeTabIndex = 0;
            menu.filterModeIndex = 0;

            const targetKey =
                SKIN_MENU_ORDER.find((k) => k !== 'defaultSkin' && k !== 'shinySkin') || 'midnightSteelSkin';

            mockGame.ownedSkins[targetKey] = true;

            const keys = menu._getActiveKeysForTab(menu._getActiveTab());
            const idx = keys.indexOf(targetKey);
            expect(idx).toBeGreaterThanOrEqual(0);

            menu.selectedOption = idx;
            menu._selectCurrent();

            expect(menu.modal).toBeNull();
            expect(menu.currentSkinKey).toBe(targetKey);
            expect(mockGame.saveGameState).toHaveBeenCalled();
        });

        it('locked gift skins are not present in active grid keys (All mode)', () => {
            menu.activeTabIndex = 0; // skins
            menu.filterModeIndex = 0; // all
            mockGame.glacikalDefeated = false;

            const keys = menu._getActiveKeysForTab(menu._getActiveTab());
            expect(keys).not.toContain('iceBreakerSkin');
        });

        it('locked gift skins cannot open preview modal directly', () => {
            menu.activeTabIndex = 0;
            menu.filterModeIndex = 0;
            mockGame.glacikalDefeated = false;

            const tab = menu._getActiveTab();
            const item = menu._getItemDef(tab, 'iceBreakerSkin');

            menu._openPreviewModal(item);

            expect(menu.modal).toBeNull();
        });

        it('unlocked gift skin is appended to active keys in All mode and can be equipped', () => {
            menu.activeTabIndex = 0; // skins
            menu.filterModeIndex = 0; // all
            mockGame.glacikalDefeated = true;

            const keys = menu._getActiveKeysForTab(menu._getActiveTab());
            expect(keys).toContain('iceBreakerSkin');

            menu.setCurrentSkinByKey('iceBreakerSkin', { forceExact: true });
            expect(menu.currentSkinKey).toBe('iceBreakerSkin');
        });

        it('_openPreviewModal sets focusIndex to Close when not affordable (Buy disabled)', () => {
            menu.activeTabIndex = 0;

            const targetKey =
                SKIN_MENU_ORDER.find(
                    (k) => k !== 'defaultSkin' && k !== 'shinySkin' && k !== 'iceBreakerSkin' && k !== 'infernalSkin' && k !== 'galaxySkin'
                ) || 'midnightSteelSkin';

            const item = menu._getItemDef(menu._getActiveTab(), targetKey);
            mockGame.creditCoins = 0;

            menu._openPreviewModal(item);

            expect(menu.modal.type).toBe('preview');
            const btns = menu._getModalButtons();
            expect(btns[0].action).toBe('buy');
            expect(btns[0].disabled).toBe(true);
            expect(menu.modal.focusIndex).toBe(1);
        });

        it('details icon opens preview modal for owned item without equipping it', () => {
            menu.activeTabIndex = 0;
            menu.filterModeIndex = 0;

            const targetKey = SKIN_MENU_ORDER.find((k) => k !== 'defaultSkin' && k !== 'shinySkin');
            if (!targetKey) return;

            mockGame.ownedSkins[targetKey] = true;
            menu.currentSkinKey = 'defaultSkin';

            const keys = menu._getActiveKeysForTab(menu._getActiveTab());
            const idx = keys.indexOf(targetKey);
            expect(idx).toBeGreaterThanOrEqual(0);

            menu._detailsHitboxes = [{ key: targetKey, index: idx, x: 10, y: 10, w: 24, h: 24 }];

            const clicked = menu._tryClickDetailsIcon(18, 18);

            expect(clicked).toBe(true);
            expect(menu.modal?.type).toBe('preview');
            expect(menu.modal?.item.key).toBe(targetKey);
            expect(menu.currentSkinKey).toBe('defaultSkin');
            const btns = menu._getModalButtons();
            expect(btns).toHaveLength(2);
            expect(btns[0]).toEqual(expect.objectContaining({ label: 'Wear', action: 'wear', disabled: false }));
            expect(btns[1]).toEqual(expect.objectContaining({ label: 'Close', action: 'close', disabled: false }));
        });

        it('modal navigation (ArrowLeft/ArrowRight) cycles through visible items when browsing is allowed', () => {
            menu.activeTabIndex = 0;
            menu.filterModeIndex = 0;
            mockGame.creditCoins = 9999;

            const candidates = (menu._getActiveKeysForTab(menu._getActiveTab()) || []).filter(
                (k) => k !== 'defaultSkin' && k !== 'shinySkin' && k !== 'iceBreakerSkin' && k !== 'infernalSkin' && k !== 'galaxySkin'
            );
            if (candidates.length < 2) return;

            const [a, b] = candidates;
            delete mockGame.ownedSkins[a];
            delete mockGame.ownedSkins[b];

            const itemA = menu._getItemDef(menu._getActiveTab(), a);
            menu._openPreviewModal(itemA);
            expect(menu._modalCanBrowse()).toBe(true);

            menu._handleModalKeyDown({ key: 'ArrowRight' });
            expect(menu.modal.item.key).not.toBe(a);

            const cur = menu.modal.item.key;
            menu._handleModalKeyDown({ key: 'ArrowLeft' });
            expect(menu.modal.item.key).not.toBe(cur);
        });

        it('preview modal: Enter on Buy opens confirm modal; confirm Yes purchases; confirm No cancels', () => {
            menu.activeTabIndex = 0;
            menu.filterModeIndex = 0;

            const buyKey =
                SKIN_MENU_ORDER.find((k) => {
                    const def = SKINS?.[k];
                    if (!def) return false;
                    if (k === 'defaultSkin' || k === 'shinySkin') return false;
                    if (k === 'iceBreakerSkin' || k === 'infernalSkin' || k === 'galaxySkin') return false;
                    return (def.price || 0) > 0;
                }) || null;
            if (!buyKey) return;

            const item = menu._getItemDef(menu._getActiveTab(), buyKey);

            mockGame.creditCoins = (item.price || 0) + 10;

            menu._openPreviewModal(item);
            expect(menu.modal.type).toBe('preview');

            menu._handleModalKeyDown({ key: 'Enter' });
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
            expect(menu.modal.type).toBe('confirm');

            menu._handleModalKeyDown({ key: 'Enter' });
            expect(menu.modal).toBeNull();
            expect(mockGame.ownedSkins[item.key]).toBe(true);
            expect(mockGame.saveGameState).toHaveBeenCalled();

            delete mockGame.ownedSkins[item.key];
            mockGame.saveGameState.mockClear();

            mockGame.creditCoins = (item.price || 0) + 10;

            menu._openPreviewModal(item);
            menu._handleModalKeyDown({ key: 'Enter' }); // to confirm
            expect(menu.modal.type).toBe('confirm');

            menu._handleModalKeyDown({ key: 'ArrowRight' });
            expect(menu.modal.focusIndex).toBe(1);

            menu._handleModalKeyDown({ key: 'Enter' }); // back to preview
            expect(menu.modal?.type).toBe('preview');
            expect(menu.modal?.item).toBe(item);
            expect(mockGame.ownedSkins[item.key]).not.toBe(true);
        });

        it('confirm modal allows chroma swatch clicks like preview modal', () => {
            if (!chromaSeed?.slot || !chromaSeed?.key) return;

            const slot = chromaSeed.slot;
            const key = chromaSeed.key;
            const tabIndex = menu.tabs.findIndex((t) => t.kind === 'cosmetic' && t.slot === slot);
            if (tabIndex < 0) return;

            menu.activeTabIndex = tabIndex;
            mockGame.creditCoins = 999;
            mockGame.ownedCosmetics[slot][key] = false;

            const item = menu._getItemDef(menu._getActiveTab(), key);
            menu._openConfirmModal(item, { previewChromaVariantId: 'base' });
            menu._modalChromaHitboxes = [{ slot, key, variantId: 'alt', cx: 20, cy: 30, r: 12 }];

            expect(menu._tryClickModalChromaSwatch(20, 30)).toBe(true);
            expect(menu.modal.previewChromaVariantId).toBe('alt');
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
        });
    });

    describe('keyboard input (non-modal)', () => {
        it('Escape closes filter dropdown when open (and does not call input.handleEscapeKey)', () => {
            menu.filterOpen = true;
            menu.handleKeyDown({ key: 'Escape' });

            expect(menu.filterOpen).toBe(false);
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
            expect(mockGame.input.handleEscapeKey).not.toHaveBeenCalled();
        });

        it('ArrowLeft/ArrowRight wraps selection across items + Go Back', () => {
            menu.activeTabIndex = 0;
            menu.filterModeIndex = 0;

            const goBackIndex = menu._getGoBackIndex();
            expect(goBackIndex).toBeGreaterThanOrEqual(0);

            menu.selectedOption = 0;
            menu.handleKeyDown({ key: 'ArrowLeft' });
            expect(menu.selectedOption).toBe(goBackIndex);

            menu.handleKeyDown({ key: 'ArrowRight' });
            expect(menu.selectedOption).toBe(0);
        });

        it('Enter triggers selection flow (plays sound and selects current) when not cycling chroma', () => {
            menu.activeTabIndex = 0;
            menu.filterModeIndex = 0;

            const spy = jest.spyOn(menu, '_selectCurrent').mockImplementation(() => { });
            menu.handleKeyDown({ key: 'Enter' });

            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
            expect(spy).toHaveBeenCalled();

            spy.mockRestore();
        });

        it('Enter on equipped cosmetic cycles chroma instead of selecting (no optionSelectedSound)', () => {
            if (!chromaSeed?.slot || !chromaSeed?.key) return;

            const slot = chromaSeed.slot;
            const key = chromaSeed.key;

            const tabIndex = menu.tabs.findIndex((t) => t.kind === 'cosmetic' && t.slot === slot);
            if (tabIndex < 0) return;

            mockGame.ownedCosmetics[slot][key] = true;
            menu._setActiveTab(tabIndex, { playSound: false });
            menu.setCurrentCosmeticByKey(slot, key);

            const keys = menu._getActiveKeysForTab(menu._getActiveTab());
            menu.selectedOption = keys.indexOf(key);
            expect(menu.selectedOption).toBeGreaterThanOrEqual(0);

            mockGame.saveGameState.mockClear();
            mockGame.audioHandler.menu.playSound.mockClear();

            menu.handleKeyDown({ key: 'Enter' });

            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalledWith('optionSelectedSound', false, true);
            expect(mockGame.saveGameState).toHaveBeenCalled();
        });
    });

    describe('keyboard input (modal)', () => {
        it('Escape while modal open closes modal, prevents propagation, does not call input.handleEscapeKey', () => {
            menu.activeTabIndex = 0;

            const item = menu._getItemDef(menu._getActiveTab(), 'defaultSkin');
            menu._openPreviewModal(item);
            expect(menu.modal).toBeTruthy();

            const e = {
                key: 'Escape',
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
            };

            menu.handleKeyDown(e);

            expect(e.preventDefault).toHaveBeenCalled();
            expect(e.stopPropagation).toHaveBeenCalled();
            expect(menu.modal).toBeNull();
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
            expect(mockGame.input.handleEscapeKey).not.toHaveBeenCalled();
        });
    });

    describe('right click behavior', () => {
        it('right click closes modal (no input.handleEscapeKey) and plays optionSelectedSound', () => {
            const item = menu._getItemDef(menu._getActiveTab(), 'defaultSkin');
            menu._openPreviewModal(item);
            expect(menu.modal).toBeTruthy();

            const e = { preventDefault: jest.fn(), clientX: 10, clientY: 10 };
            menu.handleRightClick(e);

            expect(e.preventDefault).toHaveBeenCalled();
            expect(menu.modal).toBeNull();
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
            expect(mockGame.input.handleEscapeKey).not.toHaveBeenCalled();
        });

        it('right click closes filter dropdown (no input.handleEscapeKey) and plays optionSelectedSound', () => {
            menu.filterOpen = true;

            const e = { preventDefault: jest.fn(), clientX: 10, clientY: 10 };
            menu.handleRightClick(e);

            expect(menu.filterOpen).toBe(false);
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
            expect(mockGame.input.handleEscapeKey).not.toHaveBeenCalled();
        });

        it('right click otherwise delegates to input.handleEscapeKey', () => {
            const e = { preventDefault: jest.fn(), clientX: 10, clientY: 10 };
            menu.handleRightClick(e);
            expect(mockGame.input.handleEscapeKey).toHaveBeenCalled();
        });
    });

    describe('outfit slots', () => {

        beforeEach(() => {
            menu.outfitSlots = Array(4).fill(null);
            menu.outfitSlotFocusedBtn = null;
            menu.activeTabIndex = 0;
            menu.selectedOption = 0;
            mockGame.saveGameState.mockClear();
            mockGame.audioHandler.menu.playSound.mockClear();
        });

        describe('_saveOutfitToSlot', () => {
            it('stores current skin, cosmetics, and chroma in the slot', () => {
                menu._saveOutfitToSlot(0);

                expect(menu.outfitSlots[0]).not.toBeNull();
                expect(menu.outfitSlots[0].skinKey).toBe(menu.currentSkinKey);
                expect(menu.outfitSlots[0].cosmetics).toEqual(menu.currentCosmetics);
                expect(menu.outfitSlots[0].cosmeticsChroma).toBeDefined();
            });

            it('calls _save after storing', () => {
                menu._saveOutfitToSlot(1);
                expect(mockGame.saveGameState).toHaveBeenCalled();
            });

            it('saves independently to each of the four slots', () => {
                menu._saveOutfitToSlot(0);
                const key0 = menu.outfitSlots[0].skinKey;

                menu.currentSkinKey = SKIN_MENU_ORDER.find((k) => k !== key0) ?? key0;
                menu._saveOutfitToSlot(1);
                const key1 = menu.outfitSlots[1].skinKey;

                expect(menu.outfitSlots[0].skinKey).toBe(key0);
                expect(menu.outfitSlots[1].skinKey).toBe(key1);
                expect(key0).not.toBe(key1);
            });
        });

        describe('_loadOutfitFromSlot', () => {
            it('does nothing when the slot is empty', () => {
                const before = menu.currentSkinKey;
                menu._loadOutfitFromSlot(2);
                expect(menu.currentSkinKey).toBe(before);
                expect(mockGame.saveGameState).not.toHaveBeenCalled();
            });

            it('restores skin and calls _save', () => {
                menu._saveOutfitToSlot(0);
                const savedSkinKey = menu.outfitSlots[0].skinKey;

                const otherKey = SKIN_MENU_ORDER.find((k) => k !== savedSkinKey) ?? savedSkinKey;
                menu.currentSkinKey = otherKey;
                mockGame.saveGameState.mockClear();

                menu._loadOutfitFromSlot(0);
                expect(menu.currentSkinKey).toBe(savedSkinKey);
                expect(mockGame.saveGameState).toHaveBeenCalled();
            });

            it('preserves selectedOption after loading', () => {
                menu._saveOutfitToSlot(0);
                const outfitStart = menu._getOutfitSlotsStartIndex();
                menu.selectedOption = outfitStart;

                menu._loadOutfitFromSlot(0);
                expect(menu.selectedOption).toBe(outfitStart);
            });
        });

        describe('_clearOutfitSlot', () => {
            it('sets the slot to null and calls _save', () => {
                menu._saveOutfitToSlot(3);
                expect(menu.outfitSlots[3]).not.toBeNull();

                mockGame.saveGameState.mockClear();
                menu._clearOutfitSlot(3);

                expect(menu.outfitSlots[3]).toBeNull();
                expect(mockGame.saveGameState).toHaveBeenCalled();
            });
        });

        describe('_getOutfitSlotsStartIndex / _getGoBackIndex', () => {
            it('outfitStart equals the number of keys in the active tab', () => {
                const tab = menu._getActiveTab();
                const keys = menu._getActiveKeysForTab(tab);
                expect(menu._getOutfitSlotsStartIndex()).toBe(keys.length);
            });

            it('goBackIndex is outfitStart + 4', () => {
                expect(menu._getGoBackIndex()).toBe(menu._getOutfitSlotsStartIndex() + 4);
            });
        });

        describe('_handleOutfitSlotEnter', () => {
            it('btn=save: saves outfit to slot and plays sound', () => {
                menu.outfitSlotFocusedBtn = 'save';
                menu._handleOutfitSlotEnter(0);

                expect(menu.outfitSlots[0]).not.toBeNull();
                expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
            });

            it('btn=delete with outfit: clears slot and plays sound', () => {
                menu._saveOutfitToSlot(0);
                mockGame.audioHandler.menu.playSound.mockClear();

                menu.outfitSlotFocusedBtn = 'delete';
                menu._handleOutfitSlotEnter(0);

                expect(menu.outfitSlots[0]).toBeNull();
                expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
            });

            it('btn=delete with empty slot: does nothing', () => {
                menu.outfitSlotFocusedBtn = 'delete';
                menu._handleOutfitSlotEnter(0);

                expect(menu.outfitSlots[0]).toBeNull();
                expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
            });

            it('btn=null with outfit: loads outfit and plays sound', () => {
                menu._saveOutfitToSlot(0);
                const savedSkinKey = menu.outfitSlots[0].skinKey;

                const otherKey = SKIN_MENU_ORDER.find((k) => k !== savedSkinKey) ?? savedSkinKey;
                menu.currentSkinKey = otherKey;

                menu.outfitSlotFocusedBtn = null;
                mockGame.audioHandler.menu.playSound.mockClear();
                menu._handleOutfitSlotEnter(0);

                expect(menu.currentSkinKey).toBe(savedSkinKey);
                expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
            });

            it('btn=null with empty slot: does nothing', () => {
                menu.outfitSlotFocusedBtn = null;
                menu._handleOutfitSlotEnter(0);

                expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
            });
        });

        describe('keyboard navigation in outfit slot zone', () => {
            function navigateToOutfitSlot(slotIdx) {
                const outfitStart = menu._getOutfitSlotsStartIndex();
                menu.selectedOption = outfitStart + slotIdx;
                menu.outfitSlotFocusedBtn = null;
            }

            it('ArrowDown cycles outfitSlotFocusedBtn: null → save (empty slot)', () => {
                navigateToOutfitSlot(0);
                menu.handleKeyDown({ key: 'ArrowDown' });
                expect(menu.outfitSlotFocusedBtn).toBe('save');
            });

            it('ArrowDown wraps save → null on empty slot', () => {
                navigateToOutfitSlot(0);
                menu.outfitSlotFocusedBtn = 'save';
                menu.handleKeyDown({ key: 'ArrowDown' });
                expect(menu.outfitSlotFocusedBtn).toBeNull();
            });

            it('ArrowDown cycles null → save → delete → null when slot has outfit', () => {
                menu._saveOutfitToSlot(0);
                navigateToOutfitSlot(0);

                menu.handleKeyDown({ key: 'ArrowDown' });
                expect(menu.outfitSlotFocusedBtn).toBe('save');

                menu.handleKeyDown({ key: 'ArrowDown' });
                expect(menu.outfitSlotFocusedBtn).toBe('delete');

                menu.handleKeyDown({ key: 'ArrowDown' });
                expect(menu.outfitSlotFocusedBtn).toBeNull();
            });

            it('ArrowUp cycles in reverse when slot has outfit', () => {
                menu._saveOutfitToSlot(0);
                navigateToOutfitSlot(0);

                menu.handleKeyDown({ key: 'ArrowUp' });
                expect(menu.outfitSlotFocusedBtn).toBe('delete');
            });

            it('ArrowUp/ArrowDown plays optionHoveredSound', () => {
                navigateToOutfitSlot(0);
                menu.handleKeyDown({ key: 'ArrowDown' });
                expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);

                mockGame.audioHandler.menu.playSound.mockClear();
                menu.handleKeyDown({ key: 'ArrowUp' });
                expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
            });

            it('ArrowLeft resets outfitSlotFocusedBtn to null', () => {
                navigateToOutfitSlot(0);
                menu.outfitSlotFocusedBtn = 'save';
                menu.handleKeyDown({ key: 'ArrowLeft' });
                expect(menu.outfitSlotFocusedBtn).toBeNull();
            });

            it('ArrowRight resets outfitSlotFocusedBtn to null', () => {
                navigateToOutfitSlot(0);
                menu.outfitSlotFocusedBtn = 'save';
                menu.handleKeyDown({ key: 'ArrowRight' });
                expect(menu.outfitSlotFocusedBtn).toBeNull();
            });
        });

        describe('_selectCurrent routing', () => {
            it('routes Enter to _handleOutfitSlotEnter when in outfit slot zone', () => {
                const spy = jest.spyOn(menu, '_handleOutfitSlotEnter').mockImplementation(() => {});
                const outfitStart = menu._getOutfitSlotsStartIndex();
                menu.selectedOption = outfitStart + 2;

                menu._selectCurrent();

                expect(spy).toHaveBeenCalledWith(2);
                spy.mockRestore();
            });

            it('calls onGoBack when selectedOption === goBackIndex', () => {
                const spy = jest.spyOn(menu, 'onGoBack').mockImplementation(() => {});
                menu.selectedOption = menu._getGoBackIndex();

                menu._selectCurrent();

                expect(spy).toHaveBeenCalled();
                spy.mockRestore();
            });
        });
    });

    describe('reset to default button', () => {
        describe('_getResetButtonRect', () => {
            it('is positioned directly to the left of the randomizer button with the configured gap', () => {
                const rand = menu._getRandomizerButtonRect();
                const reset = menu._getResetButtonRect();
                const gap = menu.UI.resetBtn.gap;
                const size = menu.UI.resetBtn.size;
                expect(reset.x).toBe(rand.x - size - gap);
                expect(reset.y).toBe(rand.y);
                expect(reset.w).toBe(size);
                expect(reset.h).toBe(size);
            });
        });

        describe('_hitTestResetButton', () => {
            it('returns true when cursor is inside the button rect', () => {
                const btn = menu._getResetButtonRect();
                expect(menu._hitTestResetButton(btn.x + btn.w / 2, btn.y + btn.h / 2)).toBe(true);
            });

            it('returns false when cursor is outside the button rect', () => {
                const btn = menu._getResetButtonRect();
                expect(menu._hitTestResetButton(btn.x - 1, btn.y + btn.h / 2)).toBe(false);
                expect(menu._hitTestResetButton(btn.x + btn.w / 2, btn.y - 1)).toBe(false);
            });
        });

        describe('_resetToDefault', () => {
            it('sets skin to defaultSkin', () => {
                menu.setCurrentSkinByKey('shinySkin', { forceExact: true });
                menu._resetToDefault();
                expect(menu.currentSkinKey).toBe('defaultSkin');
            });

            it('sets all cosmetic slots to none', () => {
                const headKey = (COSMETIC_MENU_ORDER[COSMETIC_SLOTS.HEAD] || []).find(k => k !== 'none');
                if (headKey) {
                    mockGame.ownedCosmetics[COSMETIC_SLOTS.HEAD][headKey] = true;
                    menu.setCurrentCosmeticByKey(COSMETIC_SLOTS.HEAD, headKey);
                }
                menu._resetToDefault();
                for (const slot of Object.values(COSMETIC_SLOTS)) {
                    expect(menu.currentCosmetics[slot]).toBe('none');
                }
            });

            it('preserves selectedOption after reset', () => {
                menu.selectedOption = 3;
                menu._resetToDefault();
                expect(menu.selectedOption).toBe(3);
            });

            it('calls _save after reset', () => {
                menu._resetToDefault();
                expect(mockGame.saveGameState).toHaveBeenCalled();
            });
        });

        describe('hover', () => {
            beforeEach(() => { menu._uiCtx = ctx; });

            it('sets resetHoverBtn to true when mouse enters the button', () => {
                const btn = menu._getResetButtonRect();
                menu.handleMouseMove({ clientX: btn.x + btn.w / 2, clientY: btn.y + btn.h / 2 });
                expect(menu.resetHoverBtn).toBe(true);
            });

            it('sets resetHoverBtn to false when mouse leaves the button', () => {
                menu.resetHoverBtn = true;
                const btn = menu._getResetButtonRect();
                menu.handleMouseMove({ clientX: btn.x - 5, clientY: btn.y + btn.h / 2 });
                expect(menu.resetHoverBtn).toBe(false);
            });

            it('plays optionHoveredSound on first hover', () => {
                const btn = menu._getResetButtonRect();
                menu.handleMouseMove({ clientX: btn.x + btn.w / 2, clientY: btn.y + btn.h / 2 });
                expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
            });
        });

        describe('click', () => {
            beforeEach(() => { menu._uiCtx = ctx; });

            it('calls _resetToDefault when clicking the button', () => {
                const spy = jest.spyOn(menu, '_resetToDefault');
                const btn = menu._getResetButtonRect();
                menu.handleMouseClick({ clientX: btn.x + btn.w / 2, clientY: btn.y + btn.h / 2, button: 0 });
                expect(spy).toHaveBeenCalled();
                spy.mockRestore();
            });

            it('plays optionSelectedSound on click', () => {
                const btn = menu._getResetButtonRect();
                menu.handleMouseClick({ clientX: btn.x + btn.w / 2, clientY: btn.y + btn.h / 2, button: 0 });
                expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
            });
        });
    });

    describe('shiny skin modal substitution', () => {
        it('_openPreviewModal substitutes shinySkin details when wearing shiny and opening defaultSkin', () => {
            menu.currentSkinKey = 'shinySkin';
            const item = menu._getItemDef(menu._getActiveTab(), 'defaultSkin');
            menu._openPreviewModal(item);
            expect(menu.modal?.item?.key).toBe('shinySkin');
        });

        it('_openPreviewModal shows defaultSkin normally when not wearing shiny', () => {
            menu.currentSkinKey = 'defaultSkin';
            const item = menu._getItemDef(menu._getActiveTab(), 'defaultSkin');
            menu._openPreviewModal(item);
            expect(menu.modal?.item?.key).toBe('defaultSkin');
        });
    });

    describe('_isCurrentlyWearing', () => {
        it('returns true when the skin is currently equipped', () => {
            menu.currentSkinKey = 'defaultSkin';
            const item = { kind: 'skin', slot: null, key: 'defaultSkin', price: 0, gift: false };
            expect(menu._isCurrentlyWearing(item)).toBe(true);
        });

        it('returns false when a different skin is equipped', () => {
            menu.currentSkinKey = 'defaultSkin';
            const item = { kind: 'skin', slot: null, key: 'midnightSteelSkin', price: 30, gift: false };
            expect(menu._isCurrentlyWearing(item)).toBe(false);
        });

        it('returns true for cosmetic when equipped with no specific chroma preview', () => {
            const slot = COSMETIC_SLOTS.HEAD;
            const key = (COSMETIC_MENU_ORDER[slot] || []).find((k) => k !== 'none') || 'hatOutfit';
            mockGame.ownedCosmetics[slot][key] = true;
            menu.setCurrentCosmeticByKey(slot, key);

            const item = { kind: 'cosmetic', slot, key, price: 0, gift: false };
            expect(menu._isCurrentlyWearing(item)).toBe(true);
        });

        it('returns false for cosmetic when a different key is equipped', () => {
            const slot = COSMETIC_SLOTS.HEAD;
            menu.currentCosmetics[slot] = 'none';
            const item = { kind: 'cosmetic', slot, key: 'hatOutfit', price: 15, gift: false };
            expect(menu._isCurrentlyWearing(item)).toBe(false);
        });

        it('returns false for cosmetic when equipped but preview chroma differs from active chroma', () => {
            if (!chromaSeed?.slot || !chromaSeed?.key) return;
            const { slot, key } = chromaSeed;
            mockGame.ownedCosmetics[slot][key] = true;
            menu.setCurrentCosmeticByKey(slot, key);
            menu._setCosmeticChromaVariantId(slot, key, 'base');

            const item = { kind: 'cosmetic', slot, key, price: 0, gift: false };
            menu.modal = { previewChromaVariantId: 'alt' };
            expect(menu._isCurrentlyWearing(item)).toBe(false);
        });

        it('returns true for cosmetic when equipped and preview chroma matches active chroma', () => {
            if (!chromaSeed?.slot || !chromaSeed?.key) return;
            const { slot, key } = chromaSeed;
            mockGame.ownedCosmetics[slot][key] = true;
            menu.setCurrentCosmeticByKey(slot, key);
            menu._setCosmeticChromaVariantId(slot, key, 'base');

            const item = { kind: 'cosmetic', slot, key, price: 0, gift: false };
            menu.modal = { previewChromaVariantId: 'base' };
            expect(menu._isCurrentlyWearing(item)).toBe(true);
        });
    });

    describe('_wearItem', () => {
        it('equips a skin with forceExact — no shiny roll even for defaultSkin', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.95); // would normally trigger shiny
            menu.currentSkinKey = 'midnightSteelSkin';

            const item = { kind: 'skin', slot: null, key: 'defaultSkin', price: 0, gift: false };
            menu.modal = { previewChromaVariantId: null };
            menu._wearItem(item);

            expect(menu.currentSkinKey).toBe('defaultSkin');
            expect(mockGame.saveGameState).toHaveBeenCalled();
            Math.random.mockRestore();
        });

        it('equips a cosmetic and saves', () => {
            const slot = COSMETIC_SLOTS.HEAD;
            const key = (COSMETIC_MENU_ORDER[slot] || []).find((k) => k !== 'none') || 'hatOutfit';
            mockGame.ownedCosmetics[slot][key] = true;

            const item = { kind: 'cosmetic', slot, key, price: 0, gift: false };
            menu.modal = { previewChromaVariantId: null };
            menu._wearItem(item);

            expect(menu.getCurrentCosmeticKey(slot)).toBe(key);
            expect(mockGame.saveGameState).toHaveBeenCalled();
        });

        it('applies previewChromaVariantId when wearing a cosmetic', () => {
            if (!chromaSeed?.slot || !chromaSeed?.key) return;
            const { slot, key } = chromaSeed;
            mockGame.ownedCosmetics[slot][key] = true;

            const item = { kind: 'cosmetic', slot, key, price: 0, gift: false };
            menu.modal = { previewChromaVariantId: 'alt' };
            menu._wearItem(item);

            expect(menu.getCurrentCosmeticsChromaState()[slot][key]).toBe('alt');
        });

        it('does nothing when item is not owned', () => {
            const targetKey = SKIN_MENU_ORDER.find((k) => k !== 'defaultSkin' && k !== 'shinySkin') || 'midnightSteelSkin';
            delete mockGame.ownedSkins[targetKey];
            menu.currentSkinKey = 'defaultSkin';

            const item = { kind: 'skin', slot: null, key: targetKey, price: 30, gift: false };
            menu.modal = { previewChromaVariantId: null };
            menu._wearItem(item);

            expect(menu.currentSkinKey).toBe('defaultSkin');
            expect(mockGame.saveGameState).not.toHaveBeenCalled();
        });
    });

    describe('wear button in owned item modal', () => {
        it('shows Wear (enabled) and Close when item is owned but not currently worn', () => {
            const targetKey = SKIN_MENU_ORDER.find((k) => k !== 'defaultSkin' && k !== 'shinySkin') || 'midnightSteelSkin';
            mockGame.ownedSkins[targetKey] = true;
            menu.currentSkinKey = 'defaultSkin';

            const item = menu._getItemDef(menu._getActiveTab(), targetKey);
            menu._openPreviewModal(item);

            const btns = menu._getModalButtons();
            expect(btns).toHaveLength(2);
            expect(btns[0]).toEqual(expect.objectContaining({ action: 'wear', disabled: false }));
            expect(btns[1]).toEqual(expect.objectContaining({ action: 'close', disabled: false }));
        });

        it('shows Wear (disabled) when item is already being worn', () => {
            const targetKey = SKIN_MENU_ORDER.find((k) => k !== 'defaultSkin' && k !== 'shinySkin') || 'midnightSteelSkin';
            mockGame.ownedSkins[targetKey] = true;
            menu.setCurrentSkinByKey(targetKey, { forceExact: true });

            const item = menu._getItemDef(menu._getActiveTab(), targetKey);
            menu._openPreviewModal(item);

            const wearBtn = menu._getModalButtons().find((b) => b.action === 'wear');
            expect(wearBtn.disabled).toBe(true);
        });

        it('Enter on Wear equips the item and keeps modal open', () => {
            const targetKey = SKIN_MENU_ORDER.find((k) => k !== 'defaultSkin' && k !== 'shinySkin') || 'midnightSteelSkin';
            mockGame.ownedSkins[targetKey] = true;
            menu.currentSkinKey = 'defaultSkin';

            const item = menu._getItemDef(menu._getActiveTab(), targetKey);
            menu._openPreviewModal(item);
            expect(menu.modal.focusIndex).toBe(0); // Wear is index 0

            menu._handleModalKeyDown({ key: 'Enter' });

            expect(menu.currentSkinKey).toBe(targetKey);
            expect(menu.modal).toBeTruthy();
            expect(menu.modal.type).toBe('preview');
        });

        it('Wear button becomes disabled after wearing', () => {
            const targetKey = SKIN_MENU_ORDER.find((k) => k !== 'defaultSkin' && k !== 'shinySkin') || 'midnightSteelSkin';
            mockGame.ownedSkins[targetKey] = true;
            menu.currentSkinKey = 'defaultSkin';

            const item = menu._getItemDef(menu._getActiveTab(), targetKey);
            menu._openPreviewModal(item);

            menu._handleModalKeyDown({ key: 'Enter' }); // wear

            const wearBtn = menu._getModalButtons().find((b) => b.action === 'wear');
            expect(wearBtn.disabled).toBe(true);
        });
    });

    describe('I key shortcut', () => {
        it('opens preview modal for the currently selected item', () => {
            menu.activeTabIndex = 0;
            menu.filterModeIndex = 0;
            menu.selectedOption = 0;

            const keys = menu._getActiveKeysForTab(menu._getActiveTab());
            menu.handleKeyDown({ key: 'I' });

            expect(menu.modal).toBeTruthy();
            expect(menu.modal.type).toBe('preview');
            expect(menu.modal.item.key).toBe(keys[0]);
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
        });

        it('does nothing when selectedOption is out of grid range (outfit slot / go back)', () => {
            menu.activeTabIndex = 0;
            menu.selectedOption = menu._getGoBackIndex();

            menu.handleKeyDown({ key: 'I' });

            expect(menu.modal).toBeNull();
        });
    });

    describe('draw', () => {
        it('does nothing when menuActive is false', () => {
            menu.menuActive = false;
            menu.draw(ctx);
            expect(ctx.drawImage).not.toHaveBeenCalled();
            expect(ctx.fillText).not.toHaveBeenCalled();
        });

        it('draws background image when menuInGame === false', () => {
            menu.menuActive = true;
            menu.menuInGame = false;

            menu.draw(ctx);

            expect(ctx.drawImage).toHaveBeenCalledWith(
                document.getElementById('skinStage'),
                0,
                0,
                mockGame.width,
                mockGame.height
            );
        });

        it('draws animated preview: skin frame then cosmetics in COSMETIC_LAYER_ORDER', () => {
            menu.menuActive = true;
            menu.menuInGame = false;

            const headKey =
                (COSMETIC_MENU_ORDER[COSMETIC_SLOTS.HEAD] || []).find((k) => k !== 'none') || null;
            if (!headKey) return;

            menu.setCurrentCosmeticByKey(COSMETIC_SLOTS.HEAD, headKey);
            menu.frameX = 2;

            menu.draw(ctx);

            const sx = 2 * menu.width;
            const px = menu.x - 50;
            const py = menu.y - 20;

            const skinEl =
                document.getElementById(menu.getCurrentSkinId()) ||
                document.getElementById('defaultSkin');

            expect(ctx.drawImage).toHaveBeenCalledWith(
                skinEl,
                sx,
                0,
                menu.width,
                menu.height,
                px,
                py,
                menu.width,
                menu.height
            );

            const equipEl = document.getElementById(headKey);
            if (equipEl) {
                const cosmeticCalls = ctx.drawImage.mock.calls.filter((c) => c[0] === equipEl);
                expect(cosmeticCalls.length).toBeGreaterThan(0);
            }

            for (const slot of COSMETIC_LAYER_ORDER) {
                expect([COSMETIC_SLOTS.HEAD, COSMETIC_SLOTS.NECK, COSMETIC_SLOTS.EYES, COSMETIC_SLOTS.NOSE]).toContain(slot);
            }
        });
    });
});
