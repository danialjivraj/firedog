import { ForestMapMenu } from '../../game/menu/forestMap.js';
import { isLocalNight } from '../../game/config/timeOfDay.js';

jest.mock('../../game/config/timeOfDay.js', () => ({
    isLocalNight: jest.fn(() => false),
}));

jest.mock('../../game/config/skins.js', () => ({
    getMapIconElement: jest.fn((id) => ({
        id,
        width: 40,
        height: 40,
    })),
}));

jest.useFakeTimers();

describe('ForestMapMenu', () => {
    const W = 1920;
    const H = 689;
    let menu, mockGame, ctx;

    beforeAll(() => {
        document.body.innerHTML = `
      <img id="forestmap" />
      <img id="forestmapNight" />
      <img id="forestmapFiredog" />
      <img id="forestmapHatFiredog" />
      <img id="forestmapCholoFiredog" />
      <img id="forestmapZabkaFiredog" />
      <img id="forestmapFiredogShiny" />
    `;
    });

    beforeEach(() => {
        mockGame = {
            width: W,
            height: H,
            canvas: {
                width: W,
                height: H,
                getBoundingClientRect: () => ({ left: 0, top: 0, width: W, height: H }),
            },
            audioHandler: { menu: { playSound: jest.fn(), stopSound: jest.fn() } },
            map1Unlocked: false,
            map2Unlocked: false,
            map3Unlocked: false,
            map4Unlocked: false,
            map5Unlocked: false,
            map6Unlocked: false,
            bonusMap1Unlocked: false,
            bonusMap2Unlocked: false,
            bonusMap3Unlocked: false,
            canSelectForestMap: false,
            menu: {
                skins: {
                    defaultSkin: 'default',
                    currentSkin: 'default',
                },
                main: { closeAllMenus: jest.fn() },
            },
            player: { isUnderwater: null, isDarkWhiteBorder: null, isIce: null },
            updateMapSelection: jest.fn(),
            startCutscene: jest.fn(),
            maxCoinsToFightElyvorg: 999,
            groundMargin: 0,
            gameCompleted: false,
        };

        ctx = {
            drawImage: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            closePath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            measureText: jest.fn().mockReturnValue({ width: 20 }),
            createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
            fillRect: jest.fn(),
            shadowColor: '',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            globalAlpha: 1,
            font: '',
            textAlign: 'left',
        };

        menu = new ForestMapMenu(mockGame);
        menu.activateMenu();
        jest.clearAllMocks();
        isLocalNight.mockClear();
        isLocalNight.mockReturnValue(false);
    });

    describe('initial state', () => {
        it('initializes with selectedCircleIndex 0 and showSavingSprite false', () => {
            expect(menu.selectedCircleIndex).toBe(0);
            expect(menu.showSavingSprite).toBe(false);
        });

        it('resetSelectedCircleIndex() resets selectedCircleIndex back to 0', () => {
            menu.selectedCircleIndex = 3;
            menu.resetSelectedCircleIndex();
            expect(menu.selectedCircleIndex).toBe(0);
        });
    });

    describe('isNightMode()', () => {
        it('returns false when neither story night nor clock night is active', () => {
            mockGame.map2Unlocked = false;
            mockGame.map3Unlocked = false;
            isLocalNight.mockReturnValue(false);

            expect(menu.isNightMode()).toBe(false);
        });

        it('returns true when story night is active even if clock says day', () => {
            mockGame.map2Unlocked = true;
            mockGame.map3Unlocked = false;
            isLocalNight.mockReturnValue(false);

            expect(menu.isNightMode()).toBe(true);
        });

        it('returns true when clock indicates night even if story is not at night', () => {
            mockGame.map2Unlocked = false;
            mockGame.map3Unlocked = false;
            isLocalNight.mockReturnValue(true);

            expect(menu.isNightMode()).toBe(true);
        });
    });

    describe('getCurrentMapIcon()', () => {
        it('returns default icon when no skin is explicitly selected', () => {
            const icon = menu.getCurrentMapIcon();
            expect(icon.id).toBe('default');
        });

        it('uses selectedSkinId when getCurrentSkinId is not available', () => {
            mockGame.selectedSkinId = 'shinySkin';
            const menuWithSelection = new ForestMapMenu(mockGame);

            const icon = menuWithSelection.getCurrentMapIcon();
            expect(icon.id).toBe('shiny');
        });

        it('uses getCurrentSkinId when it exists on skins', () => {
            mockGame.menu.skins.getCurrentSkinId = jest.fn(() => 'hatSkin');

            const icon = menu.getCurrentMapIcon();
            expect(icon.id).toBe('hat');
        });

        it('falls back to default icon when skin id is unrecognized', () => {
            mockGame.menu.skins.getCurrentSkinId = jest.fn(() => 'unknownSkin');

            const icon = menu.getCurrentMapIcon();
            expect(icon.id).toBe('default');
        });
    });

    describe('computeMapNameParts()', () => {
        it('returns correct labels and color for a main map index', () => {
            const result = menu.computeMapNameParts(0); // map1

            expect(result.nameKey).toBe('map1');
            expect(result.mapIndexLabel).toBe('MAP 1');
            expect(result.mapNameLabel).toBe('LUNAR MOONLIT GLADE');
            expect(result.colorCfg).toBe(menu.mapColors.map1);
        });

        it('returns correct labels and color for a bonus map index', () => {
            const result = menu.computeMapNameParts(6); // bonus1

            expect(result.nameKey).toBe('bonus1');
            expect(result.mapIndexLabel).toBe('BONUS MAP 1');
            expect(result.mapNameLabel).toBe('ICEBOUND CAVE');
            expect(result.colorCfg).toBe(menu.mapColors.bonus1);
        });

        it('returns empty labels and default colors for invalid index', () => {
            const result = menu.computeMapNameParts(99);

            expect(result.nameKey).toBeNull();
            expect(result.mapIndexLabel).toBe('');
            expect(result.mapNameLabel).toBe('');
            expect(result.colorCfg).toBe(menu.defaultMapColor);
        });
    });

    describe('drawRibbonBackgroundsAndLines()', () => {
        it('does not draw right ribbon or line when showRightRibbon is false', () => {
            menu.fixedLeftRibbonWidth = 200;

            ctx.measureText.mockClear();
            ctx.createLinearGradient.mockClear();
            ctx.fillRect.mockClear();

            const ribbonY = mockGame.height - 60;
            const ribbonHeight = 60;
            const mapFullText = 'MAP 1 LUNAR MOONLIT GLADE';
            const loreText = 'TAB FOR ENEMY LORE';

            menu.drawRibbonBackgroundsAndLines(
                ctx,
                ribbonY,
                ribbonHeight,
                mapFullText,
                loreText,
                false,
                false
            );

            expect(ctx.measureText).not.toHaveBeenCalled();

            expect(ctx.createLinearGradient).toHaveBeenCalledTimes(2);
            expect(ctx.fillRect).toHaveBeenCalledTimes(2);
        });
    });

    describe('node unlocking', () => {
        it('isNodeUnlocked() reflects main and bonus unlock flags correctly', () => {
            mockGame.map1Unlocked = true;
            mockGame.map3Unlocked = true;
            mockGame.bonusMap2Unlocked = true;

            expect(menu.isNodeUnlocked(0)).toBe(true); // map1
            expect(menu.isNodeUnlocked(1)).toBe(false); // map2
            expect(menu.isNodeUnlocked(2)).toBe(true); // map3
            expect(menu.isNodeUnlocked(7)).toBe(true); // bonusMap2
            expect(menu.isNodeUnlocked(8)).toBe(false); // bonusMap3
        });

        it('getUnlockedCircles() returns only circles whose nodes are unlocked', () => {
            mockGame.map1Unlocked = true;
            mockGame.map4Unlocked = true;
            mockGame.bonusMap1Unlocked = true;

            const unlocked = menu.getUnlockedCircles();
            const expectedCircles = [
                menu.circleOptions[0], // map1
                menu.circleOptions[3], // map4
                menu.circleOptions[6], // bonus1
            ];

            expect(unlocked).toEqual(expectedCircles);
        });
    });

    describe('handleMouseWheel()', () => {
        beforeEach(() => {
            mockGame.canSelectForestMap = true;
        });

        it('ignores wheel events when menu is inactive', () => {
            menu.menuActive = false;
            menu.handleMouseWheel({ deltaY: -100 });
            expect(menu.selectedCircleIndex).toBe(0);
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
        });

        it('ignores wheel events when no maps are unlocked', () => {
            menu.menuActive = true;
            menu.handleMouseWheel({ deltaY: -100 });
            expect(menu.selectedCircleIndex).toBe(0);
        });

        it('moves selection among unlocked nodes with a scroll cooldown', () => {
            mockGame.map1Unlocked = true;
            mockGame.map2Unlocked = true;
            menu.menuActive = true;

            menu.handleMouseWheel({ deltaY: -200 });
            expect(menu.selectedCircleIndex).toBe(1);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionHoveredSound', false, true);

            mockGame.audioHandler.menu.playSound.mockClear();

            menu.handleMouseWheel({ deltaY: -200 });
            expect(menu.selectedCircleIndex).toBe(1);
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();

            jest.advanceTimersByTime(20);

            menu.handleMouseWheel({ deltaY: 100 });
            expect(menu.selectedCircleIndex).toBe(0);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionHoveredSound', false, true);
        });
    });

    describe('handleMouseMove()', () => {
        beforeEach(() => {
            mockGame.canSelectForestMap = true;
            mockGame.map1Unlocked = true;
            mockGame.map2Unlocked = true;
            menu.menuActive = true;
        });

        it('changes selection when the mouse moves over a different unlocked circle', () => {
            expect(menu.selectedCircleIndex).toBe(0);
            const circle2 = menu.circleOptions[1];

            menu.handleMouseMove({
                clientX: circle2.x,
                clientY: circle2.y,
            });

            expect(menu.selectedCircleIndex).toBe(1);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionHoveredSound', false, true);
        });

        it('does nothing when the mouse is not over any unlocked circle', () => {
            mockGame.audioHandler.menu.playSound.mockClear();

            menu.handleMouseMove({ clientX: 0, clientY: 0 });

            expect(menu.selectedCircleIndex).toBe(0);
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
        });
    });

    describe('handleKeyDown()', () => {
        beforeEach(() => {
            mockGame.canSelectForestMap = true;
            mockGame.map1Unlocked = true;
            mockGame.map2Unlocked = true;
            menu.menuActive = true;
        });

        it('ArrowRight moves to the next unlocked circle', () => {
            menu.handleKeyDown({ key: 'ArrowRight' });
            expect(menu.selectedCircleIndex).toBe(1);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionHoveredSound', false, true);
        });

        it('ArrowLeft moves to the previous unlocked circle', () => {
            menu.selectedCircleIndex = 1;
            menu.handleKeyDown({ key: 'ArrowLeft' });
            expect(menu.selectedCircleIndex).toBe(0);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionHoveredSound', false, true);
        });

        it('Enter triggers handleMenuSelection when there is at least one unlocked circle', () => {
            jest.spyOn(menu, 'handleMenuSelection').mockImplementation(() => { });
            menu.handleKeyDown({ key: 'Enter' });
            expect(menu.handleMenuSelection).toHaveBeenCalled();
        });
    });

    describe('update()', () => {
        it('always stops the soundtrack', () => {
            menu.update(16);
            expect(mockGame.audioHandler.menu.stopSound).toHaveBeenCalledWith('soundtrack');
        });

        it('updates saving animations when showSavingSprite is true', () => {
            jest.spyOn(menu.savingAnimation, 'update');
            jest.spyOn(menu.savingBookAnimation, 'update');
            menu.showSavingSprite = true;

            menu.update(42);

            expect(menu.savingAnimation.update).toHaveBeenCalledWith(42);
            expect(menu.savingBookAnimation.update).toHaveBeenCalledWith(42);
        });

        it('selects the current map circle when menu just opened and map is unlocked', () => {
            mockGame.currentMap = 'Map4';
            mockGame.map4Unlocked = true;
            menu.justOpened = true;
            menu.selectedCircleIndex = 0;

            menu.update(0);

            expect(menu.selectedCircleIndex).toBe(3);
            expect(menu.justOpened).toBe(false);
        });

        it('does not change selected circle when current map node is locked', () => {
            mockGame.currentMap = 'Map4';
            mockGame.map4Unlocked = false;
            menu.justOpened = true;
            menu.selectedCircleIndex = 0;

            menu.update(0);

            expect(menu.selectedCircleIndex).toBe(0);
            expect(menu.justOpened).toBe(false);
        });
    });

    describe('draw()', () => {
        beforeEach(() => {
            menu.menuActive = true;
        });

        it('draws day background when story night and clock night are both false', () => {
            isLocalNight.mockReturnValue(false);
            mockGame.map2Unlocked = false;
            mockGame.map3Unlocked = false;

            menu.draw(ctx);

            expect(ctx.drawImage).toHaveBeenCalledWith(menu.backgroundImage, 0, 0, W, H);
        });

        it('draws night background when story night is active (map2 unlocked, map3 locked)', () => {
            isLocalNight.mockReturnValue(false);
            mockGame.map2Unlocked = true;
            mockGame.map3Unlocked = false;

            menu.draw(ctx);

            expect(ctx.drawImage).toHaveBeenCalledWith(menu.backgroundImageNight, 0, 0, W, H);
        });

        it('only draws circles for unlocked maps', () => {
            mockGame.map1Unlocked = true;
            mockGame.map2Unlocked = false;

            menu.draw(ctx);

            expect(ctx.arc).toHaveBeenCalledWith(
                menu.circleOptions[0].x,
                menu.circleOptions[0].y,
                menu.circleOptions[0].radius,
                0,
                Math.PI * 2
            );

            const coords1 = menu.circleOptions[1];
            const calledWith1 = ctx.arc.mock.calls.some(
                call => call[0] === coords1.x && call[1] === coords1.y
            );
            expect(calledWith1).toBe(false);
        });

        it('renders the selected map index, name, and lore hint in the bottom ribbon', () => {
            mockGame.map1Unlocked = true;

            menu.draw(ctx);

            const texts = ctx.fillText.mock.calls.map(args => args[0]);
            expect(texts).toContain('MAP 1');
            expect(texts).toContain('LUNAR MOONLIT GLADE');
            expect(texts).toContain('TAB FOR ENEMY LORE');
        });

        it('hides the lore hint text while the saving sprite is visible', () => {
            mockGame.map1Unlocked = true;
            menu.showSavingSprite = true;

            menu.draw(ctx);

            const texts = ctx.fillText.mock.calls.map(args => args[0]);
            expect(texts).not.toContain('TAB FOR ENEMY LORE');
        });

        it('draws saving sprites when showSavingSprite is true', () => {
            jest.spyOn(menu.savingAnimation, 'draw');
            jest.spyOn(menu.savingBookAnimation, 'draw');
            menu.showSavingSprite = true;

            menu.draw(ctx);

            expect(menu.savingAnimation.draw).toHaveBeenCalledWith(ctx);
            expect(menu.savingBookAnimation.draw).toHaveBeenCalledWith(ctx);
        });

        it('draws the game completed overlay when gameCompleted is true', () => {
            menu.menuActive = false;
            mockGame.gameCompleted = true;

            menu.draw(ctx);

            expect(ctx.drawImage).toHaveBeenCalledWith(menu.greenCompletedImage, 10, 10);
            expect(ctx.globalAlpha).toBe(1);
        });
    });
});
