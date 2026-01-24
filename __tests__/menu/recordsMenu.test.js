import { RecordsMenu } from '../../game/menu/recordsMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';
import { formatTimeMs } from '../../game/config/formatTime.js';

describe('RecordsMenu', () => {
    let menu;
    let game;
    let ctx;

    const makeCtx = () => {
        const grad = { addColorStop: jest.fn() };
        return {
            save: jest.fn(),
            restore: jest.fn(),
            drawImage: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            fillText: jest.fn(),
            beginPath: jest.fn(),
            rect: jest.fn(),
            clip: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            createLinearGradient: jest.fn(() => grad),

            set font(_) {},
            set fillStyle(_) {},
            set shadowColor(_) {},
            set shadowOffsetX(_) {},
            set shadowOffsetY(_) {},
            set textAlign(_) {},
            set textBaseline(_) {},
            set strokeStyle(_) {},
            set lineWidth(_) {},
        };
    };

    const makeGame = () => ({
        width: 1280,
        height: 720,
        canSelect: true,
        canSelectForestMap: true,
        audioHandler: { menu: { playSound: jest.fn() } },
        menu: {
            main: { activateMenu: jest.fn() },
            pause: { isPaused: false },
        },
        canvas: {
            width: 1280,
            height: 720,
            getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
        },

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

        glacikalDefeated: false,
        elyvorgDefeated: false,

        records: {},
    });

    const unlock = (...keys) => {
        for (const k of keys) game[`${k}Unlocked`] = true;
    };

    const unlockEnoughToScroll = () => {
        unlock('map1', 'map2', 'map3', 'map4', 'map5', 'map6');
    };

    const evtAt = (x, y, extra = {}) => ({ clientX: x, clientY: y, ...extra });

    const expectHoverSound = () => {
        expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
    };

    const setInactiveOrDisabledSelection = (mode) => {
        if (mode === 'inactive') menu.menuActive = false;
        if (mode === 'cantSelect') game.canSelect = false;
        if (mode === 'cantSelectForest') game.canSelectForestMap = false;
    };

    const goBackButtonCenter = () => {
        const optionHeight = 60;
        const gapBelowTable = 70;
        const bottomMargin = 0;
        const buttonCenterX = game.width / 2;
        const buttonTopY = Math.min(game.height - bottomMargin - optionHeight, menu.sectionBottomY + gapBelowTable);
        return { x: buttonCenterX, y: buttonTopY + optionHeight / 2 };
    };

    beforeAll(() => {
        document.body.innerHTML = `<img id="mainmenubackground" />`;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        game = makeGame();
        ctx = makeCtx();

        menu = new RecordsMenu(game);
        menu.activateMenu();
    });

    afterEach(() => {
        if (menu) menu.destroy();
    });

    describe('construction & lifecycle', () => {
        test('initializes expected defaults', () => {
            expect(menu.title).toBe('Records');
            expect(menu.menuOptions).toEqual(['Go Back']);
            expect(menu.decimals).toBe(2);

            expect(menu.scrollY).toBe(0);
            expect(menu.targetScrollY).toBe(0);
            expect(menu.scrollMax).toBe(0);

            expect(menu.draggingBar).toBe(false);
            expect(menu.barRect).toBe(null);
        });

        test('closeMenu() clears dragging state', () => {
            menu.draggingBar = true;

            menu.closeMenu();

            expect(menu.draggingBar).toBe(false);
        });

        test('destroy() removes the document listeners installed in the constructor', () => {
            const removeSpy = jest.spyOn(document, 'removeEventListener');

            const localMenu = new RecordsMenu(game);
            localMenu.activateMenu();
            localMenu.destroy();

            expect(removeSpy).toHaveBeenCalledWith('mousedown', localMenu._onMouseDown);
            expect(removeSpy).toHaveBeenCalledWith('mouseup', localMenu._onMouseUp);

            removeSpy.mockRestore();
        });
    });

    describe('pure helpers', () => {
        describe('isBossMap(mapKey)', () => {
            test('returns true only for Map7, BonusMap1, and BonusMap3', () => {
                expect(menu.isBossMap('Map7')).toBe(true);
                expect(menu.isBossMap('BonusMap1')).toBe(true);
                expect(menu.isBossMap('BonusMap3')).toBe(true);

                expect(menu.isBossMap('Map6')).toBe(false);
                expect(menu.isBossMap('BonusMap2')).toBe(false);
            });
        });

        describe('getUnlockedMaps()', () => {
            test('returns only maps whose unlock flags are truthy', () => {
                unlock('map1', 'map2', 'bonusMap1');

                const keys = menu.getUnlockedMaps().map((m) => m.key);

                expect(keys).toEqual(expect.arrayContaining(['Map1', 'Map2', 'BonusMap1']));
                expect(keys).not.toContain('Map3');
                expect(keys).not.toContain('BonusMap2');
            });

            test('includes BonusMap3 only when its unlock flag and both boss defeats are true', () => {
                unlock('bonusMap3');

                game.glacikalDefeated = false;
                game.elyvorgDefeated = true;
                expect(menu.getUnlockedMaps().map((m) => m.key)).not.toContain('BonusMap3');

                game.glacikalDefeated = true;
                expect(menu.getUnlockedMaps().map((m) => m.key)).toContain('BonusMap3');
            });
        });

        describe('formatTimeMs(ms, decimals)', () => {
            test('returns an em dash when ms is null/undefined', () => {
                expect(formatTimeMs(null)).toBe('—');
                expect(formatTimeMs(undefined)).toBe('—');
            });

            test('formats mm:ss.xx, floors fractional part, and clamps negative ms to 0', () => {
                expect(formatTimeMs(65432, 2)).toBe('01:05.43');

                expect(formatTimeMs(-10, 2)).toBe('00:00.00');

                expect(formatTimeMs(1234, 0)).toBe('00:01.0');

                expect(formatTimeMs(1234, 3)).toBe('00:01.234');
            });

            test('treats negative decimals as 0 (current behavior)', () => {
                expect(formatTimeMs(1234, -2)).toBe('00:01.0');
            });
        });

        describe('canvasMouse(event)', () => {
            test('converts client coordinates to canvas-space using bounding-rect scaling', () => {
                game.canvas.width = 1000;
                game.canvas.height = 500;
                game.canvas.getBoundingClientRect = () => ({ left: 10, top: 20, width: 2000, height: 1000 });

                const { mouseX, mouseY } = menu.canvasMouse({ clientX: 1010, clientY: 520 });
                expect(mouseX).toBeCloseTo(500, 6);
                expect(mouseY).toBeCloseTo(250, 6);
            });
        });
    });

    describe('layout & scrolling', () => {
        test('tableBounds() clamps width to tableMaxWidth and centers the table', () => {
            const { tableLeft, tableRight, tableWidth } = menu.tableBounds();

            expect(tableWidth).toBeLessThanOrEqual(menu.tableMaxWidth);
            expect(tableRight - tableLeft).toBe(tableWidth);
            expect(tableLeft).toBe(Math.floor((game.width - tableWidth) / 2));
        });

        test('update() computes scrollMax from content height and clamps targetScrollY into [0, scrollMax]', () => {
            unlockEnoughToScroll();
            menu.targetScrollY = 99999;

            menu.update(16);

            expect(menu.scrollMax).toBeGreaterThan(0);
            expect(menu.targetScrollY).toBe(menu.scrollMax);
            expect(menu.scrollY).toBeGreaterThanOrEqual(0);
            expect(menu.scrollY).toBeLessThanOrEqual(menu.targetScrollY);
        });

        describe('scrollSelectedIntoView(listH, unlockedLen)', () => {
            test('adjusts targetScrollY to ensure the selected row is visible (and clamps within bounds)', () => {
                unlockEnoughToScroll();
                menu.update(16);

                const { listH } = menu.geometry();
                const unlockedLen = menu.getUnlockedMaps().length;

                menu.selectedOption = unlockedLen - 1;
                menu.targetScrollY = 0;

                menu.scrollSelectedIntoView(listH, unlockedLen);

                expect(menu.targetScrollY).toBeGreaterThanOrEqual(0);
                expect(menu.targetScrollY).toBeLessThanOrEqual(menu.scrollMax);
            });

            test('does nothing when selectedOption is out of range', () => {
                unlockEnoughToScroll();
                menu.update(16);

                const { listH } = menu.geometry();
                const unlockedLen = menu.getUnlockedMaps().length;

                menu.targetScrollY = 123;

                menu.selectedOption = -1;
                menu.scrollSelectedIntoView(listH, unlockedLen);
                expect(menu.targetScrollY).toBe(123);

                menu.selectedOption = unlockedLen;
                menu.scrollSelectedIntoView(listH, unlockedLen);
                expect(menu.targetScrollY).toBe(123);
            });
        });

        describe('updateScrollFromThumb(mouseY)', () => {
            test('maps mouseY into [0, scrollMax] based on thumb travel', () => {
                menu.scrollMax = 500;
                menu.barRect = { y: 100, h: 300, thumbH: 60 };

                const travel = 300 - 60;
                const midMouseY = 100 + travel / 2 + 60 / 2;

                menu.updateScrollFromThumb(midMouseY);

                expect(menu.targetScrollY).toBeCloseTo(250, 0);
            });

            test('clamps mouse positions above/below the track to 0/scrollMax', () => {
                menu.scrollMax = 500;
                menu.barRect = { y: 100, h: 300, thumbH: 60 };

                menu.updateScrollFromThumb(0);
                expect(menu.targetScrollY).toBe(0);

                menu.updateScrollFromThumb(10_000);
                expect(menu.targetScrollY).toBe(500);
            });

            test('does nothing when thumb travel is <= 1px', () => {
                menu.scrollMax = 500;
                menu.targetScrollY = 123;
                menu.barRect = { y: 100, h: 60, thumbH: 59 };

                menu.updateScrollFromThumb(120);

                expect(menu.targetScrollY).toBe(123);
            });

            test('does nothing when barRect is not set', () => {
                menu.scrollMax = 500;
                menu.targetScrollY = 321;
                menu.barRect = null;

                menu.updateScrollFromThumb(200);

                expect(menu.targetScrollY).toBe(321);
            });
        });
    });

    describe('input handling', () => {
        describe('keyboard (handleKeyDown)', () => {
            test('ArrowDown advances selection through map rows and Go Back (wraps) and plays hover sound', () => {
                unlock('map1', 'map2');

                // 2 maps + go back = 3 rows
                menu.selectedOption = 0;

                menu.handleKeyDown({ key: 'ArrowDown' });
                expect(menu.selectedOption).toBe(1);
                expectHoverSound();

                game.audioHandler.menu.playSound.mockClear();

                menu.handleKeyDown({ key: 'ArrowDown' });
                expect(menu.selectedOption).toBe(2); // go back
                expectHoverSound();

                game.audioHandler.menu.playSound.mockClear();

                menu.handleKeyDown({ key: 'ArrowDown' });
                expect(menu.selectedOption).toBe(0); // wrap
                expectHoverSound();
            });

            test('ArrowUp moves selection upward (wraps through Go Back) and plays hover sound', () => {
                unlock('map1', 'map2');

                const rowCount = menu.getUnlockedMaps().length + 1;
                menu.selectedOption = 0;

                menu.handleKeyDown({ key: 'ArrowUp' });

                expect(menu.selectedOption).toBe(rowCount - 1);
                expectHoverSound();
            });

            test('Enter triggers handleMenuSelection() only when Go Back is selected', () => {
                unlock('map1', 'map2');
                const selectionSpy = jest.spyOn(menu, 'handleMenuSelection');

                menu.selectedOption = 0;
                menu.handleKeyDown({ key: 'Enter' });
                expect(selectionSpy).not.toHaveBeenCalled();

                menu.selectedOption = menu.getUnlockedMaps().length;
                menu.handleKeyDown({ key: 'Enter' });
                expect(selectionSpy).toHaveBeenCalledTimes(1);

                selectionSpy.mockRestore();
            });

            test.each([
                ['inactive', 'menu is inactive'],
                ['cantSelect', 'game.canSelect is false'],
                ['cantSelectForest', 'game.canSelectForestMap is false'],
            ])('ignores key input when %s (%s)', (mode) => {
                unlock('map1');
                const scrollSpy = jest.spyOn(menu, 'scrollSelectedIntoView');

                setInactiveOrDisabledSelection(mode);
                menu.handleKeyDown({ key: 'ArrowDown' });

                expect(game.audioHandler.menu.playSound).not.toHaveBeenCalled();
                expect(scrollSpy).not.toHaveBeenCalled();

                scrollSpy.mockRestore();
            });
        });

        describe('mouse wheel (handleMouseWheel)', () => {
            test('when cursor is inside a scrollable list, wheel scrolls (clamped) without changing selection', () => {
                unlockEnoughToScroll();
                menu.update(16);
                const geom = menu.geometry();

                const prevSelected = menu.selectedOption;

                menu.targetScrollY = menu.scrollMax - 10;
                menu.handleMouseWheel(evtAt(geom.innerLeft + 10, geom.listTop + 10, { deltaY: 100 }));

                expect(menu.targetScrollY).toBeLessThanOrEqual(menu.scrollMax);
                expect(menu.targetScrollY).toBeGreaterThanOrEqual(0);
                expect(menu.selectedOption).toBe(prevSelected);
            });

            test('when cursor is inside a scrollable list, wheel scrolling up decreases targetScrollY and clamps at 0', () => {
                unlockEnoughToScroll();
                menu.update(16);
                const geom = menu.geometry();

                menu.targetScrollY = 10;
                menu.handleMouseWheel(evtAt(geom.innerLeft + 10, geom.listTop + 10, { deltaY: -100 }));

                expect(menu.targetScrollY).toBe(0);
            });

            test('when cursor is inside the list but it is not scrollable, wheel navigates selection and plays hover sound', () => {
                unlock('map1', 'map2'); // not enough rows to scroll
                menu.update(16);
                const geom = menu.geometry();

                const unlockedLen = menu.getUnlockedMaps().length;
                const rowCount = unlockedLen + 1;

                menu.selectedOption = 0;

                menu.handleMouseWheel(evtAt(geom.innerLeft + 10, geom.listTop + 10, { deltaY: 100 }));

                expect(menu.scrollMax).toBe(0);
                expect(menu.selectedOption).toBe((0 + 1 + rowCount) % rowCount);
                expectHoverSound();
            });

            test('when cursor is outside the list, wheel navigates selection and plays hover sound', () => {
                unlockEnoughToScroll();
                menu.update(16);

                const unlockedLen = menu.getUnlockedMaps().length;
                const rowCount = unlockedLen + 1;

                menu.selectedOption = 0;

                menu.handleMouseWheel(evtAt(5, 5, { deltaY: 100 }));

                expect(menu.selectedOption).toBe((0 + 1 + rowCount) % rowCount);
                expectHoverSound();
            });

            test.each([
                ['inactive', 'menu is inactive'],
                ['cantSelect', 'game.canSelect is false'],
                ['cantSelectForest', 'game.canSelectForestMap is false'],
            ])('ignores wheel input when %s (%s)', (mode) => {
                unlockEnoughToScroll();
                menu.update(16);

                const prevSelected = menu.selectedOption;
                const prevTarget = menu.targetScrollY;

                setInactiveOrDisabledSelection(mode);
                menu.handleMouseWheel(evtAt(10, 10, { deltaY: 100 }));

                expect(menu.selectedOption).toBe(prevSelected);
                expect(menu.targetScrollY).toBe(prevTarget);
            });
        });

        describe('mouse (move/down/up/click)', () => {
            test('mousemove over a list row updates selectedOption and plays hover sound (when selection changes)', () => {
                unlock('map1', 'map2', 'map3');
                menu.update(16);
                const geom = menu.geometry();

                menu.selectedOption = 1;
                game.audioHandler.menu.playSound.mockClear();

                menu.handleMouseMove(evtAt(geom.innerLeft + 10, geom.listTop + 5));

                expect(menu.selectedOption).toBe(0);
                expectHoverSound();
            });

            test('mousemove uses scrollY when calculating which row is hovered', () => {
                unlockEnoughToScroll();
                menu.update(16);
                const geom = menu.geometry();

                menu.scrollY = menu.rowH + menu.rowGap; // scroll down by ~1 row

                game.audioHandler.menu.playSound.mockClear();

                // hover at the top of the list -> should resolve to index 1 due to scrollY
                menu.handleMouseMove(evtAt(geom.innerLeft + 10, geom.listTop + 1));

                expect(menu.selectedOption).toBe(1);
                expectHoverSound();
            });

            test('mousemove over the Go Back button selects the Go Back row', () => {
                unlock('map1', 'map2');
                menu.update(16);

                const goBackIndex = menu.getUnlockedMaps().length;
                const { x, y } = goBackButtonCenter();

                menu.selectedOption = 0;

                menu.handleMouseMove(evtAt(x, y));

                expect(menu.selectedOption).toBe(goBackIndex);
            });

            test('while dragging the scrollbar thumb, mousemove delegates to updateScrollFromThumb()', () => {
                unlockEnoughToScroll();
                menu.update(16);

                menu.draggingBar = true;
                menu.barRect = { y: 100, h: 300, thumbH: 60 };
                menu.scrollMax = 500;

                const spy = jest.spyOn(menu, 'updateScrollFromThumb');

                menu.handleMouseMove(evtAt(10, 150));

                expect(spy).toHaveBeenCalledWith(expect.any(Number));
                spy.mockRestore();
            });

            test('mousedown on scrollbar thumb starts dragging; mouseup stops dragging', () => {
                unlockEnoughToScroll();
                menu.update(16);
                const geom = menu.geometry();

                menu.barRect = {
                    x: geom.barX,
                    y: geom.listTop,
                    w: menu.barWidth,
                    h: geom.listH,
                    thumbY: geom.listTop + 20,
                    thumbH: 40,
                };

                menu.handleMouseDown(evtAt(menu.barRect.x + 2, menu.barRect.thumbY + 2));
                expect(menu.draggingBar).toBe(true);

                menu.handleMouseUp();
                expect(menu.draggingBar).toBe(false);
            });

            test('mousedown on scrollbar track (not thumb) jumps targetScrollY within bounds', () => {
                unlockEnoughToScroll();
                menu.update(16);
                const geom = menu.geometry();

                menu.scrollMax = 500;
                menu.targetScrollY = 0;

                menu.barRect = {
                    x: geom.barX,
                    y: geom.listTop,
                    w: menu.barWidth,
                    h: geom.listH,
                    thumbY: geom.listTop + 10,
                    thumbH: 34,
                };

                menu.handleMouseDown(evtAt(menu.barRect.x + 2, menu.barRect.y + menu.barRect.h - 2));

                expect(menu.targetScrollY).toBeGreaterThan(0);
                expect(menu.targetScrollY).toBeLessThanOrEqual(menu.scrollMax);
            });

            test('mousedown inside the list selects the clicked row', () => {
                unlock('map1', 'map2', 'map3');
                menu.update(16);
                const geom = menu.geometry();

                menu.selectedOption = 2;

                menu.handleMouseDown(evtAt(geom.innerLeft + 10, geom.listTop + 5));

                expect(menu.selectedOption).toBe(0);
            });

            test('click triggers handleMenuSelection() only when Go Back is selected', () => {
                unlock('map1', 'map2');
                const spy = jest.spyOn(menu, 'handleMenuSelection');

                menu.selectedOption = 0;
                menu.handleMouseClick();
                expect(spy).not.toHaveBeenCalled();

                menu.selectedOption = menu.getUnlockedMaps().length; // go back
                menu.handleMouseClick();
                expect(spy).toHaveBeenCalledTimes(1);

                spy.mockRestore();
            });

            test.each([
                ['inactive', 'menu is inactive'],
                ['cantSelect', 'game.canSelect is false'],
                ['cantSelectForest', 'game.canSelectForestMap is false'],
            ])('ignores mouse interactions when %s (%s)', (mode) => {
                unlockEnoughToScroll();
                menu.update(16);

                const prevSelected = menu.selectedOption;
                const prevTarget = menu.targetScrollY;

                setInactiveOrDisabledSelection(mode);

                menu.handleMouseMove(evtAt(10, 10));
                menu.handleMouseDown(evtAt(10, 10));
                menu.handleMouseClick();

                expect(menu.selectedOption).toBe(prevSelected);
                expect(menu.targetScrollY).toBe(prevTarget);
            });
        });
    });

    describe('menu selection (Go Back action)', () => {
        test('handleMenuSelection() calls BaseMenu.handleMenuSelection() and activates main menu index 2', () => {
            const superSpy = jest.spyOn(BaseMenu.prototype, 'handleMenuSelection').mockImplementation(() => {});

            menu.handleMenuSelection();

            expect(superSpy).toHaveBeenCalledTimes(1);
            expect(game.menu.main.activateMenu).toHaveBeenCalledWith(2);

            superSpy.mockRestore();
        });

        test('handleMenuSelection() is a no-op when game.canSelect is false', () => {
            const superSpy = jest.spyOn(BaseMenu.prototype, 'handleMenuSelection').mockImplementation(() => {});

            game.canSelect = false;
            menu.handleMenuSelection();

            expect(superSpy).not.toHaveBeenCalled();
            expect(game.menu.main.activateMenu).not.toHaveBeenCalled();

            superSpy.mockRestore();
        });
    });

    describe('rendering (draw)', () => {
        test('draw() is a no-op when menu is inactive', () => {
            menu.menuActive = false;

            menu.draw(ctx);

            expect(ctx.fillText).not.toHaveBeenCalled();
        });

        test('when no maps are unlocked, renders the empty-state message and still draws Go Back', () => {
            expect(() => menu.draw(ctx)).not.toThrow();

            expect(ctx.fillText).toHaveBeenCalledWith(
                'No maps unlocked yet.',
                game.width / 2,
                (menu.sectionTopY + menu.sectionBottomY) / 2
            );
            expect(ctx.fillText).toHaveBeenCalledWith('Go Back', expect.any(Number), expect.any(Number));
        });

        test('for a boss map, renders a "Boss:" line only when bossMs is present (Map7)', () => {
            game.map7Unlocked = true;
            game.records = { Map7: { clearMs: 120000, bossMs: 30000 } };

            menu.update(16);

            expect(() => menu.draw(ctx)).not.toThrow();

            expect(ctx.fillText).toHaveBeenCalledWith('02:00.00', expect.any(Number), expect.any(Number));
            expect(ctx.fillText).toHaveBeenCalledWith(expect.stringMatching(/^Boss: /), expect.any(Number), expect.any(Number));
        });

        test('renders clear times (including em dash for null) and sets barRect when scrollable', () => {
            unlock('map1', 'map2', 'map3', 'map4', 'map5', 'map6', 'map7');
            game.records = {
                Map1: { clearMs: 65432, bossMs: null },
                Map2: { clearMs: null, bossMs: null },
                Map7: { clearMs: 120000, bossMs: 30000 },
            };

            menu.update(16);

            expect(() => menu.draw(ctx)).not.toThrow();

            expect(ctx.fillText).toHaveBeenCalledWith('01:05.43', expect.any(Number), expect.any(Number));
            expect(ctx.fillText).toHaveBeenCalledWith('—', expect.any(Number), expect.any(Number));

            expect(menu.scrollMax).toBeGreaterThan(0);
            expect(menu.barRect).not.toBeNull();
            expect(menu.barRect).toEqual(
                expect.objectContaining({
                    x: expect.any(Number),
                    y: expect.any(Number),
                    w: menu.barWidth,
                    h: expect.any(Number),
                    thumbY: expect.any(Number),
                    thumbH: expect.any(Number),
                })
            );
        });

        test('clears barRect when content is not scrollable', () => {
            unlock('map1', 'map2');
            menu.update(16);

            menu.draw(ctx);

            expect(menu.scrollMax).toBe(0);
            expect(menu.barRect).toBe(null);
        });

        test('when paused in-game, draws a dark overlay instead of background image', () => {
            menu.menuInGame = true;
            game.menu.pause.isPaused = true;

            expect(() => menu.draw(ctx)).not.toThrow();
            expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, game.width, game.height);
        });
    });
});
