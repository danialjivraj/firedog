import { saveGameState, loadGameState, clearSavedData } from '../../game/persistence/gamePersistence.js';

jest.mock('../../game/config/keyBindings.js', () => ({
    getDefaultKeyBindings: () => ({
        jump: 'w',
        moveBackward: 'a',
        sit: 's',
        moveForward: 'd',
        rollAttack: 'Enter',
        diveAttack: 's',
        fireballAttack: 'q',
        invisibleDefense: 'e',
        dashAttack: 'Shift',
    }),
}));

jest.mock('../../game/config/skinsAndCosmetics.js', () => ({
    COSMETIC_SLOTS: { HEAD: 'head', NECK: 'neck', EYES: 'eyes', NOSE: 'nose' },
}));

function makeGame() {
    return {
        currentMap: 'Map1',
        isTutorialActive: true,
        uiLayoutStyle: 'compact',

        map1Unlocked: true,
        map2Unlocked: false,
        map3Unlocked: false,
        map4Unlocked: false,
        map5Unlocked: false,
        map6Unlocked: false,
        map7Unlocked: false,
        bonusMap1Unlocked: false,
        bonusMap2Unlocked: false,
        bonusMap3Unlocked: false,
        glacikalDefeated: false,
        elyvorgDefeated: false,
        ntharaxDefeated: false,

        _announcedGiftSkins: {},

        creditCoins: 0,
        ownedSkins: {},
        ownedCosmetics: {},

        keyBindings: { jump: 'w', moveBackward: 'a', sit: 's', moveForward: 'd', rollAttack: 'Enter', diveAttack: 's', fireballAttack: 'q', invisibleDefense: 'e', dashAttack: 'Shift' },
        records: {
            Map1: { clearMs: null, bossMs: null },
        },

        menu: {
            audioSettings: { getState: jest.fn(() => ({})), setState: jest.fn() },
            wardrobe: {
                getCurrentSkinId: jest.fn(() => 'defaultSkin'),
                getCurrentCosmeticKey: jest.fn(() => 'none'),
                getCurrentCosmeticsChromaState: jest.fn(() => ({})),
                outfitSlots: [null, null, null, null],
                setCurrentSkinById: jest.fn(),
                setCurrentCosmeticByKey: jest.fn(),
                setCurrentCosmeticsChromaState: jest.fn(),
            },
            difficulty: { getState: jest.fn(() => ({})), setState: jest.fn() },
            forestMap: { resetSelectedCircleIndex: jest.fn() },
            enemyLore: { currentPage: 0 },
        },
    };
}

describe('gamePersistence', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('saveGameState / loadGameState round-trip', () => {
        test('saves and restores map unlock state', () => {
            const game = makeGame();
            game.map3Unlocked = true;
            game.elyvorgDefeated = true;

            saveGameState(game);

            const game2 = makeGame();
            loadGameState(game2);

            expect(game2.map3Unlocked).toBe(true);
            expect(game2.elyvorgDefeated).toBe(true);
        });

        test('saves and restores creditCoins', () => {
            const game = makeGame();
            game.creditCoins = 42;

            saveGameState(game);

            const game2 = makeGame();
            loadGameState(game2);

            expect(game2.creditCoins).toBe(42);
        });

        test('saves and restores custom key bindings merged with defaults', () => {
            const game = makeGame();
            game.keyBindings = { jump: 'Space', moveForward: 'ArrowRight' };

            saveGameState(game);

            const game2 = makeGame();
            loadGameState(game2);

            expect(game2.keyBindings.jump).toBe('Space');
            expect(game2.keyBindings.moveForward).toBe('ArrowRight');
            expect(game2.keyBindings.moveBackward).toBe('a');
        });
    });

    describe('loadGameState with no saved data', () => {
        test('calls clearSavedData when nothing is saved', () => {
            const game = makeGame();
            game.map3Unlocked = true;

            loadGameState(game);

            expect(game.map3Unlocked).toBe(false);
            expect(game.isTutorialActive).toBe(true);
        });
    });

    describe('loadGameState with corrupted data', () => {
        test('resets game to defaults on invalid JSON', () => {
            localStorage.setItem('gameState', '{not valid json!!!');
            jest.spyOn(console, 'warn').mockImplementation(() => {});

            const game = makeGame();
            game.map3Unlocked = true;
            loadGameState(game);

            expect(game.isTutorialActive).toBe(true);
            expect(game.map1Unlocked).toBe(true);
            expect(game.map2Unlocked).toBe(false);
            expect(game.map3Unlocked).toBe(false);

            console.warn.mockRestore();
        });
    });

    describe('clearSavedData', () => {
        test('resets all unlock flags and removes saved data', () => {
            localStorage.setItem('gameState', '{}');

            const game = makeGame();
            game.map7Unlocked = true;
            game.creditCoins = 999;

            clearSavedData(game);

            expect(game.map7Unlocked).toBe(false);
            expect(game.creditCoins).toBe(0);
            expect(game.isTutorialActive).toBe(true);
            expect(game.menu.wardrobe.setCurrentSkinById).toHaveBeenCalledWith('defaultSkin');
        });

        test('resets records to all null values', () => {
            const game = makeGame();
            clearSavedData(game);

            expect(game.records.Map1.clearMs).toBeNull();
            expect(game.records.Map1.bossMs).toBeNull();
            expect(Object.keys(game.records)).toHaveLength(10);
        });
    });
});
