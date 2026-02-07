import { Skins } from '../../game/menu/skinsMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';
import {
    SKINS,
    SKIN_MENU_ORDER,
    COSMETIC_SLOTS,
    COSMETIC_MENU_ORDER,
    COSMETICS,
} from '../../game/config/skins.js';

describe('Skins menu', () => {
    let menu, mockGame, ctx;

    function buildDomSprites() {
        const ids = new Set(['skinStage']);

        for (const key of Object.keys(SKINS)) {
            if (SKINS[key]?.spriteId) ids.add(SKINS[key].spriteId);
        }

        for (const slot of Object.values(COSMETIC_SLOTS)) {
            const slotMap = COSMETICS[slot];
            if (!slotMap) continue;
            for (const cKey of Object.keys(slotMap)) {
                const spriteId = slotMap[cKey]?.spriteId;
                if (spriteId) ids.add(spriteId);
            }
        }

        document.body.innerHTML = [...ids].map(id => `<img id="${id}" />`).join('\n');
    }

    function expectedFlatOptions() {
        const columns = [
            { id: 'skins', keys: SKIN_MENU_ORDER, kind: 'skin' },

            { id: COSMETIC_SLOTS.HEAD, keys: COSMETIC_MENU_ORDER[COSMETIC_SLOTS.HEAD], kind: 'cosmetic', slot: COSMETIC_SLOTS.HEAD },
            { id: COSMETIC_SLOTS.NECK, keys: COSMETIC_MENU_ORDER[COSMETIC_SLOTS.NECK], kind: 'cosmetic', slot: COSMETIC_SLOTS.NECK },
            { id: COSMETIC_SLOTS.EYES, keys: COSMETIC_MENU_ORDER[COSMETIC_SLOTS.EYES], kind: 'cosmetic', slot: COSMETIC_SLOTS.EYES },
            { id: COSMETIC_SLOTS.FACE, keys: COSMETIC_MENU_ORDER[COSMETIC_SLOTS.FACE], kind: 'cosmetic', slot: COSMETIC_SLOTS.FACE },
        ];

        const flat = [];
        for (const col of columns) {
            if (col.kind === 'skin') {
                flat.push(...col.keys.map(k => SKINS[k]?.label ?? k));
            } else {
                flat.push(...col.keys.map(k => COSMETICS[col.slot]?.[k]?.label ?? k));
            }
        }
        flat.push('Go Back');
        return flat;
    }

    beforeAll(() => {
        buildDomSprites();

        jest.spyOn(BaseMenu.prototype, 'draw').mockImplementation(() => { });
    });

    afterAll(() => {
        BaseMenu.prototype.draw.mockRestore();
    });

    beforeEach(() => {
        mockGame = {
            width: 1920,
            height: 689,
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
        };

        menu = new Skins(mockGame);
        menu.activateMenu?.();

        ctx = {
            drawImage: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            fillText: jest.fn(),
            measureText: jest.fn().mockReturnValue({ width: 10 }),
            fillRect: jest.fn(),
            beginPath: jest.fn(),
            rect: jest.fn(),
            clip: jest.fn(),

            font: '',
            fillStyle: '',
            shadowColor: '',
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            textAlign: '',
        };

        jest.clearAllMocks();
    });

    describe('initialization', () => {
        it('builds flat menu options (skins + cosmetics + Go Back)', () => {
            const expected = expectedFlatOptions();

            expected[0] = `${expected[0]} - Selected`;

            expect(menu.menuOptions).toEqual(expected);
            expect(menu.menuOptions[menu.menuOptions.length - 1]).toBe('Go Back');
        });


        it('starts with defaultSkin and all cosmetics none', () => {
            expect(menu.currentSkinKey).toBe('defaultSkin');
            expect(menu.getCurrentSkinId()).toBe('defaultSkin');

            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.HEAD)).toBe('none');
            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.NECK)).toBe('none');
            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.EYES)).toBe('none');
            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.FACE)).toBe('none');
        });

        it('selected index syncs to default skin row (not Go Back)', () => {
            expect(menu.selectedOption).toBe(0);
        });
    });

    describe('setCurrentSkinById()', () => {
        it('sets exact skin by sprite id and does not roll shiny', () => {
            menu.setCurrentSkinById('midnightSteelSkin');

            expect(menu.currentSkinKey).toBe('midnightSteelSkin');
            expect(menu.getCurrentSkinId()).toBe('midnightSteelSkin');
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
        });

        it('unknown id falls back to defaultSkin (exact)', () => {
            menu.setCurrentSkinById('no-such-sprite-id');

            expect(menu.currentSkinKey).toBe('defaultSkin');
            expect(menu.getCurrentSkinId()).toBe('defaultSkin');
        });
    });

    describe('setCurrentSkinByKey()', () => {
        it('defaultSkin rolls shiny 10% when not forcing exact (>= 0.9)', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.95);

            menu.setCurrentSkinByKey('defaultSkin');

            expect(menu.currentSkinKey).toBe('shinySkin');
            expect(menu.getCurrentSkinId()).toBe('shinySkin');
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('shinySkinRizzSound');

            Math.random.mockRestore();
        });

        it('defaultSkin stays default 90% when not forcing exact (< 0.9)', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.5);

            menu.setCurrentSkinByKey('defaultSkin');

            expect(menu.currentSkinKey).toBe('defaultSkin');
            expect(menu.getCurrentSkinId()).toBe('defaultSkin');
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();

            Math.random.mockRestore();
        });

        it('non-default skin sets directly', () => {
            menu.setCurrentSkinByKey('galaxySkin');
            expect(menu.currentSkinKey).toBe('galaxySkin');
            expect(menu.getCurrentSkinId()).toBe('galaxySkin');
        });

        it('unknown key falls back to defaultSkin', () => {
            menu.setCurrentSkinByKey('no-such-key', { forceExact: true });
            expect(menu.currentSkinKey).toBe('defaultSkin');
            expect(menu.getCurrentSkinId()).toBe('defaultSkin');
        });
    });

    describe('setCurrentCosmeticByKey()', () => {
        it('sets head cosmetic safely', () => {
            menu.setCurrentCosmeticByKey(COSMETIC_SLOTS.HEAD, 'hatOutfit');
            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.HEAD)).toBe('hatOutfit');
        });

        it('unknown cosmetic falls back to none', () => {
            menu.setCurrentCosmeticByKey(COSMETIC_SLOTS.NECK, 'no-such-cosmetic');
            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.NECK)).toBe('none');
        });

        it('unknown slot falls back to HEAD slot behavior', () => {
            menu.setCurrentCosmeticByKey('nope', 'hatOutfit');
            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.HEAD)).toBe('hatOutfit');
        });
    });

    describe('onSelect()', () => {
        it('selecting a skin index updates current skin', () => {
            menu.onSelect(1);

            expect(menu.currentSkinKey).toBe('midnightSteelSkin');
            expect(menu.getCurrentSkinId()).toBe('midnightSteelSkin');
        });


        it('selecting a head cosmetic index updates head cosmetic', () => {
            const skinsCount = SKIN_MENU_ORDER.length;
            const headKeys = COSMETIC_MENU_ORDER[COSMETIC_SLOTS.HEAD];

            const headStart = skinsCount;
            const hatRow = headKeys.indexOf('hatOutfit');
            const index = headStart + hatRow;

            menu.onSelect(index);

            expect(menu.getCurrentCosmeticKey(COSMETIC_SLOTS.HEAD)).toBe('hatOutfit');
        });

        it('Go Back triggers main.activateMenu(1)', () => {
            const goBackIndex = menu.menuOptions.length - 1;
            menu.onSelect(goBackIndex);
            expect(mockGame.menu.main.activateMenu).toHaveBeenCalledWith(1);
        });
    });

    describe('draw()', () => {
        it('does nothing when menuActive is false', () => {
            menu.menuActive = false;
            menu.draw(ctx);
            expect(ctx.drawImage).not.toHaveBeenCalled();
        });

        it('draws stage background when menuInGame === false', () => {
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

        it('draws preview skin frame and then cosmetics (if equipped)', () => {
            menu.menuActive = true;
            menu.menuInGame = false;

            menu.frameX = 2;

            menu.setCurrentCosmeticByKey(COSMETIC_SLOTS.HEAD, 'hatOutfit');

            menu.draw(ctx);

            const sx = 2 * menu.width;
            const px = menu.x - 50;
            const py = menu.y - 20;

            expect(ctx.drawImage).toHaveBeenCalledWith(
                document.getElementById(menu.getCurrentSkinId()),
                sx,
                0,
                menu.width,
                menu.height,
                px,
                py,
                menu.width,
                menu.height
            );

            expect(ctx.drawImage).toHaveBeenCalledWith(
                document.getElementById('hatOutfit'),
                sx,
                0,
                menu.width,
                menu.height,
                px,
                py,
                menu.width,
                menu.height
            );
        });
    });
});
