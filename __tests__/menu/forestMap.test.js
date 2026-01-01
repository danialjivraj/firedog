import { ForestMapMenu } from '../../game/menu/forestMap.js';
import { isLocalNight } from '../../game/config/timeOfDay.js';
import {
    Map3Cutscene,
    BonusMap1Cutscene,
    BonusMap3Cutscene,
} from '../../game/cutscene/storyCutscenes.js';
import {
    Map1,
    Map3,
    Map7,
    BonusMap1,
    BonusMap3,
} from '../../game/background/background.js';
import { Cabin } from '../../game/entities/cabin.js';
import { Penguini } from '../../game/entities/penguini.js';

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

jest.mock('../../game/cutscene/storyCutscenes.js', () => {
    const makeCutscene = (label) =>
        jest.fn().mockImplementation((game) => ({
            game,
            label,
            displayDialogue: jest.fn(),
        }));

    return {
        Map1Cutscene: makeCutscene('Map1Cutscene'),
        Map2Cutscene: makeCutscene('Map2Cutscene'),
        Map3Cutscene: makeCutscene('Map3Cutscene'),
        Map4Cutscene: makeCutscene('Map4Cutscene'),
        Map5Cutscene: makeCutscene('Map5Cutscene'),
        Map6Cutscene: makeCutscene('Map6Cutscene'),
        Map7Cutscene: makeCutscene('Map7Cutscene'),
        BonusMap1Cutscene: makeCutscene('BonusMap1Cutscene'),
        BonusMap2Cutscene: makeCutscene('BonusMap2Cutscene'),
        BonusMap3Cutscene: makeCutscene('BonusMap3Cutscene'),
    };
});

jest.mock('../../game/background/background.js', () => {
    class Map1 { constructor(game) { this.game = game; } }
    class Map2 { constructor(game) { this.game = game; } }
    class Map3 { constructor(game) { this.game = game; } }
    class Map4 { constructor(game) { this.game = game; } }
    class Map5 { constructor(game) { this.game = game; } }
    class Map6 { constructor(game) { this.game = game; } }
    class Map7 { constructor(game) { this.game = game; } }
    class BonusMap1 { constructor(game) { this.game = game; } }
    class BonusMap2 { constructor(game) { this.game = game; } }
    class BonusMap3 { constructor(game) { this.game = game; } }

    return {
        Map1,
        Map2,
        Map3,
        Map4,
        Map5,
        Map6,
        Map7,
        BonusMap1,
        BonusMap2,
        BonusMap3,
    };
});

jest.mock('../../game/entities/cabin.js', () => ({
    Cabin: jest.fn().mockImplementation((game, spriteId, width, height, cabinY) => ({
        game,
        spriteId,
        width,
        height,
        cabinY,
    })),
}));

jest.mock('../../game/entities/penguini.js', () => ({
    Penguini: jest.fn().mockImplementation((game, width, height, sprite, frames) => ({
        game,
        width,
        height,
        sprite,
        frames,
        y: 0,
    })),
}));

jest.useFakeTimers();

describe('ForestMapMenu', () => {
    const W = 1920;
    const H = 689;
    let menu;
    let mockGame;
    let ctx;

    beforeAll(() => {
        document.body.innerHTML = `
        <img id="forestmap" />
        <img id="forestmapNight" />
        <img id="forestmapFiredog" />
        <img id="forestmapHatFiredog" />
        <img id="forestmapCholoFiredog" />
        <img id="forestmapZabkaFiredog" />
        <img id="forestmapFiredogShiny" />

        <img id="greenBand" />
        <img id="blankStarLeft" />
        <img id="blankStarMiddle" />
        <img id="blankStarRight" />
        <img id="filledStarLeft" />
        <img id="filledStarMiddle" />
        <img id="filledStarRight" />
        <img id="storyCompleteText" />
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
            map7Unlocked: false,
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
            player: {
                isUnderwater: null,
                isDarkWhiteBorder: null,
                isIce: null,
                isSpace: null,
            },
            startCutscene: jest.fn(),
            groundMargin: 0,
            glacikalDefeated: false,
            elyvorgDefeated: false,
            ntharaxDefeated: false,
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
            setLineDash: jest.fn(),
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
            filter: 'none',
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

    describe('bonus map 3 gating (glacikal / elyvorg)', () => {
        describe('canEnterBonusMap3()', () => {
            it('returns false when neither boss is defeated', () => {
                mockGame.glacikalDefeated = false;
                mockGame.elyvorgDefeated = false;

                expect(menu.canEnterBonusMap3()).toBe(false);
            });

            it('returns false when only glacikal is defeated', () => {
                mockGame.glacikalDefeated = true;
                mockGame.elyvorgDefeated = false;

                expect(menu.canEnterBonusMap3()).toBe(false);
            });

            it('returns false when only elyvorg is defeated', () => {
                mockGame.glacikalDefeated = false;
                mockGame.elyvorgDefeated = true;

                expect(menu.canEnterBonusMap3()).toBe(false);
            });

            it('returns true when both glacikal and elyvorg are defeated', () => {
                mockGame.glacikalDefeated = true;
                mockGame.elyvorgDefeated = true;

                expect(menu.canEnterBonusMap3()).toBe(true);
            });

            it('coerces truthy values to true (double-bang behavior)', () => {
                mockGame.glacikalDefeated = 1;
                mockGame.elyvorgDefeated = 'yes';

                expect(menu.canEnterBonusMap3()).toBe(true);
            });
        });

        describe('isBonusMap3Sealed()', () => {
            it('returns false when bonusMap3 is NOT unlocked (regardless of boss flags)', () => {
                mockGame.bonusMap3Unlocked = false;

                mockGame.glacikalDefeated = false;
                mockGame.elyvorgDefeated = false;
                expect(menu.isBonusMap3Sealed()).toBe(false);

                mockGame.glacikalDefeated = true;
                mockGame.elyvorgDefeated = false;
                expect(menu.isBonusMap3Sealed()).toBe(false);

                mockGame.glacikalDefeated = false;
                mockGame.elyvorgDefeated = true;
                expect(menu.isBonusMap3Sealed()).toBe(false);

                mockGame.glacikalDefeated = true;
                mockGame.elyvorgDefeated = true;
                expect(menu.isBonusMap3Sealed()).toBe(false);
            });

            it('returns true when bonusMap3 is unlocked but bosses are not both defeated', () => {
                mockGame.bonusMap3Unlocked = true;

                mockGame.glacikalDefeated = false;
                mockGame.elyvorgDefeated = false;
                expect(menu.isBonusMap3Sealed()).toBe(true);

                mockGame.glacikalDefeated = true;
                mockGame.elyvorgDefeated = false;
                expect(menu.isBonusMap3Sealed()).toBe(true);

                mockGame.glacikalDefeated = false;
                mockGame.elyvorgDefeated = true;
                expect(menu.isBonusMap3Sealed()).toBe(true);
            });

            it('returns false when bonusMap3 is unlocked and both bosses are defeated', () => {
                mockGame.bonusMap3Unlocked = true;
                mockGame.glacikalDefeated = true;
                mockGame.elyvorgDefeated = true;

                expect(menu.isBonusMap3Sealed()).toBe(false);
            });
        });

        describe('handleMenuSelection() gating for bonus map 3', () => {
            beforeEach(() => {
                mockGame.canSelectForestMap = true;
                menu.menuActive = true;
                menu.selectedCircleIndex = 9;
            });

            it('blocks entry, plays hover sound, and shows UNAVAILABLE notice when bosses are not both defeated', () => {
                mockGame.bonusMap3Unlocked = true;
                mockGame.glacikalDefeated = true;
                mockGame.elyvorgDefeated = false;

                menu.handleMenuSelection();

                expect(mockGame.audioHandler.menu.playSound)
                    .toHaveBeenCalledWith('optionHoveredSound', false, true);

                expect(menu.lockedNoticeText).toBe('UNAVAILABLE!');
                expect(menu.lockedNoticeTimer).toBeGreaterThan(0);

                expect(mockGame.startCutscene).not.toHaveBeenCalled();
                expect(mockGame.menu.main.closeAllMenus).not.toHaveBeenCalled();
                expect(mockGame.currentMap).toBeUndefined();
            });

            it('allows entry and sets up BonusMap3 when both bosses are defeated', () => {
                mockGame.bonusMap3Unlocked = true;
                mockGame.glacikalDefeated = true;
                mockGame.elyvorgDefeated = true;

                menu.handleMenuSelection();

                expect(BonusMap3Cutscene).toHaveBeenCalledWith(mockGame);
                const cutsceneInstance = BonusMap3Cutscene.mock.results[0].value;
                expect(mockGame.startCutscene).toHaveBeenCalledWith(cutsceneInstance);
                expect(cutsceneInstance.displayDialogue).toHaveBeenCalled();

                expect(mockGame.background).toBeInstanceOf(BonusMap3);
                expect(mockGame.currentMap).toBe('BonusMap3');

                expect(mockGame.player.isSpace).toBe(true);
                expect(mockGame.menu.main.closeAllMenus).toHaveBeenCalled();
            });
        });

        describe('draw() sealed visuals + locked notice text', () => {
            beforeEach(() => {
                menu.menuActive = true;
                mockGame.bonusMap3Unlocked = true;
                menu.selectedCircleIndex = 9;
            });

            it('renders sealed visuals for BonusMap3 when unlocked but bosses not both defeated', () => {
                mockGame.glacikalDefeated = true;
                mockGame.elyvorgDefeated = false;

                menu.draw(ctx);

                const bonus3 = menu.circleOptions[9];
                const arcsAtBonus3 = ctx.arc.mock.calls.filter(
                    call => call[0] === bonus3.x && call[1] === bonus3.y
                );

                expect(arcsAtBonus3.length).toBeGreaterThanOrEqual(3);

                const hasRedRing = arcsAtBonus3.some(call => call[2] === bonus3.radius + 2);
                expect(hasRedRing).toBe(true);

                expect(ctx.moveTo).toHaveBeenCalled();
                expect(ctx.lineTo).toHaveBeenCalled();
                expect(ctx.lineTo.mock.calls.length).toBeGreaterThanOrEqual(2);
            });

            it('does not render sealed visuals for BonusMap3 when bosses both defeated', () => {
                mockGame.glacikalDefeated = true;
                mockGame.elyvorgDefeated = true;

                menu.draw(ctx);

                const bonus3 = menu.circleOptions[9];
                const arcsAtBonus3 = ctx.arc.mock.calls.filter(
                    call => call[0] === bonus3.x && call[1] === bonus3.y
                );

                const hasRedRing = arcsAtBonus3.some(call => call[2] === bonus3.radius + 2);
                expect(hasRedRing).toBe(false);
            });

            it('shows locked notice text in the bottom ribbon when selection attempt is blocked', () => {
                mockGame.canSelectForestMap = true;
                menu.menuActive = true;
                menu.selectedCircleIndex = 9;

                mockGame.glacikalDefeated = false;
                mockGame.elyvorgDefeated = false;

                menu.handleMenuSelection();
                ctx.fillText.mockClear();

                menu.draw(ctx);

                const texts = ctx.fillText.mock.calls.map(args => args[0]);
                expect(texts).toContain('UNAVAILABLE!');
            });

            it('locked notice expires via update() and ribbon returns to TAB FOR ENEMY LORE', () => {
                mockGame.canSelectForestMap = true;
                menu.menuActive = true;
                menu.selectedCircleIndex = 9;

                mockGame.glacikalDefeated = false;
                mockGame.elyvorgDefeated = false;

                menu.handleMenuSelection();
                expect(menu.lockedNoticeTimer).toBeGreaterThan(0);

                menu.update(2000);

                expect(menu.lockedNoticeTimer).toBe(0);
                expect(menu.lockedNoticeText).toBe('');

                ctx.fillText.mockClear();
                mockGame.map1Unlocked = true;
                menu.selectedCircleIndex = 0;

                menu.draw(ctx);

                const texts = ctx.fillText.mock.calls.map(args => args[0]);
                expect(texts).toContain('TAB FOR ENEMY LORE');
                expect(texts).not.toContain('UNAVAILABLE!');
            });

            it('draws dashed bonus connection to BonusMap3 when sealed (unlocked but bosses missing)', () => {
                mockGame.bonusMap2Unlocked = true;
                mockGame.bonusMap3Unlocked = true;

                mockGame.glacikalDefeated = false;
                mockGame.elyvorgDefeated = true;

                menu.draw(ctx);

                expect(ctx.setLineDash).toHaveBeenCalledWith([10, 10]);
                expect(ctx.setLineDash).toHaveBeenCalledWith([]);
            });

            it('does not set dashed connection when bonus3 is not sealed (bosses defeated)', () => {
                mockGame.bonusMap2Unlocked = true;
                mockGame.bonusMap3Unlocked = true;

                mockGame.glacikalDefeated = true;
                mockGame.elyvorgDefeated = true;

                menu.draw(ctx);

                const dashCalls = ctx.setLineDash.mock.calls.map(c => c[0]);
                expect(dashCalls).not.toContainEqual([10, 10]);
            });
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

    describe('getMapKeyByIndex()', () => {
        it('maps indices 0–6 to main map keys and 7–9 to bonus map keys', () => {
            expect(menu.getMapKeyByIndex(0)).toBe('map1');
            expect(menu.getMapKeyByIndex(1)).toBe('map2');
            expect(menu.getMapKeyByIndex(2)).toBe('map3');
            expect(menu.getMapKeyByIndex(3)).toBe('map4');
            expect(menu.getMapKeyByIndex(4)).toBe('map5');
            expect(menu.getMapKeyByIndex(5)).toBe('map6');
            expect(menu.getMapKeyByIndex(6)).toBe('map7');
            expect(menu.getMapKeyByIndex(7)).toBe('bonus1');
            expect(menu.getMapKeyByIndex(8)).toBe('bonus2');
            expect(menu.getMapKeyByIndex(9)).toBe('bonus3');
        });

        it('returns null for indices outside the known range', () => {
            expect(menu.getMapKeyByIndex(-1)).toBeNull();
            expect(menu.getMapKeyByIndex(10)).toBeNull();
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

        it('returns correct labels and color for the new Map6 (Venomveil Lake)', () => {
            const result = menu.computeMapNameParts(5);

            expect(result.nameKey).toBe('map6');
            expect(result.mapIndexLabel).toBe('MAP 6');
            expect(result.mapNameLabel).toBe('VENOMVEIL LAKE');
            expect(result.colorCfg).toBe(menu.mapColors.map6);
        });

        it('returns correct labels and color for a bonus map index', () => {
            const result = menu.computeMapNameParts(7); // bonus1

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

        it('computes and caches fixedLeftRibbonWidth on first call', () => {
            menu.fixedLeftRibbonWidth = null;

            const ribbonY = mockGame.height - 60;
            const ribbonHeight = 60;

            menu.drawRibbonBackgroundsAndLines(
                ctx,
                ribbonY,
                ribbonHeight,
                'MAP 1 LUNAR MOONLIT GLADE',
                'TAB FOR ENEMY LORE',
                false,
                true
            );

            expect(menu.fixedLeftRibbonWidth).not.toBeNull();
            expect(ctx.measureText).toHaveBeenCalled();
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
            expect(menu.isNodeUnlocked(8)).toBe(true); // bonusMap2
            expect(menu.isNodeUnlocked(9)).toBe(false); // bonusMap3
        });

        it('isNodeUnlocked() returns false for indices outside known range', () => {
            expect(menu.isNodeUnlocked(-1)).toBe(false);
            expect(menu.isNodeUnlocked(10)).toBe(false);
        });

        it('getUnlockedCircles() returns only circles whose nodes are unlocked', () => {
            mockGame.map1Unlocked = true;
            mockGame.map4Unlocked = true;
            mockGame.bonusMap1Unlocked = true;

            const unlocked = menu.getUnlockedCircles();
            const expectedCircles = [
                menu.circleOptions[0], // map1
                menu.circleOptions[3], // map4
                menu.circleOptions[7], // bonus1
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

    describe('handleMenuSelection()', () => {
        beforeEach(() => {
            mockGame.canSelectForestMap = true;
            menu.menuActive = true;
        });

        it('sets up Map3, cutscene and player flags when selecting main map circle', () => {
            menu.selectedCircleIndex = 2; // map3

            menu.handleMenuSelection();

            expect(mockGame.player.isUnderwater).toBe(true);
            expect(mockGame.player.isDarkWhiteBorder).toBe(true);
            expect(mockGame.player.isIce).toBe(false);
            expect(mockGame.player.isSpace).toBe(false);

            expect(mockGame.maxDistance).toBe(270);
            expect(mockGame.winningCoins).toBe(200);

            expect(Map3Cutscene).toHaveBeenCalledWith(mockGame);
            const cutsceneInstance = Map3Cutscene.mock.results[0].value;
            expect(mockGame.startCutscene).toHaveBeenCalledWith(cutsceneInstance);
            expect(cutsceneInstance.displayDialogue).toHaveBeenCalled();

            expect(mockGame.background).toBeInstanceOf(Map3);
            expect(mockGame.currentMap).toBe('Map3');

            expect(mockGame.menu.main.closeAllMenus).toHaveBeenCalled();
        });

        it('sets up BonusMap1 with isIce flag when selecting bonus circle', () => {
            menu.selectedCircleIndex = 7; // bonusMap1

            menu.handleMenuSelection();

            expect(mockGame.player.isUnderwater).toBe(false);
            expect(mockGame.player.isDarkWhiteBorder).toBe(false);
            expect(mockGame.player.isIce).toBe(true);
            expect(mockGame.player.isSpace).toBe(false);

            expect(mockGame.maxDistance).toBe(9999999);
            expect(mockGame.winningCoins).toBe(0);

            expect(BonusMap1Cutscene).toHaveBeenCalledWith(mockGame);
            const cutsceneInstance = BonusMap1Cutscene.mock.results[0].value;
            expect(mockGame.startCutscene).toHaveBeenCalledWith(cutsceneInstance);
            expect(cutsceneInstance.displayDialogue).toHaveBeenCalled();

            expect(mockGame.background).toBeInstanceOf(BonusMap1);
            expect(mockGame.currentMap).toBe('BonusMap1');
            expect(mockGame.menu.main.closeAllMenus).toHaveBeenCalled();
        });

        it('plays hover sound and does nothing else when selected index has no map entry', () => {
            menu.selectedCircleIndex = 99;

            menu.handleMenuSelection();

            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionHoveredSound', false, true);
            expect(mockGame.startCutscene).not.toHaveBeenCalled();
            expect(mockGame.menu.main.closeAllMenus).not.toHaveBeenCalled();
        });
    });

    describe('setMap()', () => {
        it('configures cabin and penguini correctly for Map1', () => {
            const map = new Map1(mockGame);

            menu.setMap(map);

            expect(mockGame.background).toBe(map);
            expect(mockGame.currentMap).toBe('Map1');
            expect(Cabin).toHaveBeenCalled();
            expect(Penguini).toHaveBeenCalled();

            const cabinInstance = Cabin.mock.results[0].value;
            const penguiniInstance = Penguini.mock.results[0].value;

            expect(cabinInstance.spriteId).toBe('map1cabin');
            expect(penguiniInstance.sprite).toBe('penguinBatSprite');
        });

        it('configures penguini position for Map7 based on height and groundMargin', () => {
            mockGame.groundMargin = 10;
            const map = new Map7(mockGame);

            menu.setMap(map);

            const penguiniInstance = Penguini.mock.results[Penguini.mock.results.length - 1].value;
            expect(penguiniInstance.height).toBe(80);
            expect(penguiniInstance.y).toBe(H - 80 - 10);
        });

        it('configures cabin and penguini for BonusMap3 with pistol sprite', () => {
            const map = new BonusMap3(mockGame);

            menu.setMap(map);

            const cabinInstance = Cabin.mock.results[Cabin.mock.results.length - 1].value;
            const penguiniInstance = Penguini.mock.results[Penguini.mock.results.length - 1].value;

            expect(cabinInstance.spriteId).toBe('bonusmap3cabin');
            expect(penguiniInstance.sprite).toBe('penguinPistolSprite');
        });
    });

    describe('connection helpers', () => {
        it('drawStraightConnection does nothing when distance is zero', () => {
            const circle = { x: 100, y: 100, radius: 20 };

            menu.drawStraightConnection(ctx, circle, circle);

            expect(ctx.beginPath).not.toHaveBeenCalled();
            expect(ctx.moveTo).not.toHaveBeenCalled();
            expect(ctx.lineTo).not.toHaveBeenCalled();
            expect(ctx.stroke).not.toHaveBeenCalled();
        });

        it('drawStraightConnection draws a line between two distinct circles', () => {
            const from = { x: 0, y: 0, radius: 10 };
            const to = { x: 100, y: 0, radius: 10 };

            menu.drawStraightConnection(ctx, from, to);

            expect(ctx.beginPath).toHaveBeenCalled();
            expect(ctx.moveTo).toHaveBeenCalled();
            expect(ctx.lineTo).toHaveBeenCalled();
            expect(ctx.stroke).toHaveBeenCalled();
        });

        it('drawElbowConnection draws an elbowed line between two distinct circles', () => {
            const from = { x: 0, y: 0, radius: 10 };
            const to = { x: 100, y: 100, radius: 10 };

            menu.drawElbowConnection(ctx, from, to);

            expect(ctx.beginPath).toHaveBeenCalled();
            expect(ctx.moveTo).toHaveBeenCalled();
            expect(ctx.lineTo).toHaveBeenCalledTimes(2);
            expect(ctx.stroke).toHaveBeenCalled();
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

        it('draws the stars sticker when there is any boss progress (menu not in-game)', () => {
            menu.menuActive = false;
            menu.menuInGame = false;
            menu.showStarsSticker = true;

            mockGame.elyvorgDefeated = true;

            ctx.drawImage.mockClear();
            menu.draw(ctx);

            const drawnImages = ctx.drawImage.mock.calls.map(call => call[0]);

            expect(drawnImages).toContain(menu.greenBandImage);

            expect(
                drawnImages.includes(menu.filledStarMiddleImage) ||
                drawnImages.includes(menu.blankStarMiddleImage)
            ).toBe(true);

            expect(drawnImages).toContain(menu.storyCompleteTextImage);

            expect(ctx.globalAlpha).toBe(0.9);
        });
    });
});
