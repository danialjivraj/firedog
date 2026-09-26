import { RecordsMenu } from '../../game/menu/recordsMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';
import { formatTimeMs } from '../../game/utils/formatTime.js';

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

            set font(_) { },
            set fillStyle(_) { },
            set shadowColor(_) { },
            set shadowOffsetX(_) { },
            set shadowOffsetY(_) { },
            set textAlign(_) { },
            set textBaseline(_) { },
            set strokeStyle(_) { },
            set lineWidth(_) { },
        };
    };

    const makeGame = () => {
        const g = {
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
        };

        g.goBackMenu = jest.fn(() => g.menu.main.activateMenu(2));

        return g;
    };

    const unlock = (...keys) => {
        for (const k of keys) game[`${k}Unlocked`] = true;
    };

    const unlockEnoughToScroll = () => {
        unlock('map1', 'map2', 'map3', 'map4', 'map5', 'map6');
    };

    const expectHoverSound = () => {
        expect(game.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
    };

    const setInactiveOrDisabledSelection = (mode) => {
        if (mode === 'inactive') menu.menuActive = false;
        if (mode === 'cantSelect') game.canSelect = false;
        if (mode === 'cantSelectForest') game.canSelectForestMap = false;
    };

    const render = () => {
        menu.ensurePanel();
        menu.syncContent();
        return menu.dom;
    };

    const hover = (element) => element.dispatchEvent(new Event('pointerenter'));
    const leave = (element) => element.dispatchEvent(new Event('pointerleave'));
    const pointerDown = (element, clientY) =>
        element.dispatchEvent(Object.assign(new Event('pointerdown'), { clientY }));

    const stubBar = (height) => {
        const { bar } = render();
        bar.getBoundingClientRect = () => ({ top: 0, height });
        return bar;
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
        test('listHeight grows with the unlocked maps up to the scroll cap', () => {
            const rowH = menu.listHeight;

            unlock('map1', 'map2');
            expect(menu.listHeight).toBe(rowH * 2);

            unlockEnoughToScroll();
            expect(menu.listHeight).toBe(rowH * 5);
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

        describe('scrollSelectedIntoView()', () => {
            test('adjusts targetScrollY to ensure the selected row is visible (and clamps within bounds)', () => {
                unlockEnoughToScroll();
                menu.update(16);

                menu.selectedOption = menu.getUnlockedMaps().length - 1;
                menu.targetScrollY = 0;

                menu.scrollSelectedIntoView();

                expect(menu.targetScrollY).toBeGreaterThan(0);
                expect(menu.targetScrollY).toBeLessThanOrEqual(menu.scrollMax);
            });

            test('does nothing when selectedOption is out of range', () => {
                unlockEnoughToScroll();
                menu.update(16);

                menu.targetScrollY = 123;

                menu.selectedOption = -1;
                menu.scrollSelectedIntoView();
                expect(menu.targetScrollY).toBe(123);

                menu.selectedOption = menu.goBackIndex;
                menu.scrollSelectedIntoView();
                expect(menu.targetScrollY).toBe(123);
            });
        });

        describe('dragging the scrollbar thumb', () => {
            test('maps the pointer onto targetScrollY within [0, scrollMax]', () => {
                stubBar(300);
                menu.scrollMax = 500;
                menu.barRect = { h: 300, thumbY: 0, thumbH: 60 };
                menu.draggingBar = true;

                menu._dragBar({ clientY: (300 - 60) / 2 + 60 / 2 });

                expect(menu.targetScrollY).toBeCloseTo(250, 0);
            });

            test('clamps pointer positions above/below the track to 0/scrollMax', () => {
                stubBar(300);
                menu.scrollMax = 500;
                menu.barRect = { h: 300, thumbY: 0, thumbH: 60 };
                menu.draggingBar = true;

                menu._dragBar({ clientY: -1000 });
                expect(menu.targetScrollY).toBe(0);

                menu._dragBar({ clientY: 10000 });
                expect(menu.targetScrollY).toBe(500);
            });

            test('does nothing when thumb travel is <= 1px', () => {
                stubBar(60);
                menu.scrollMax = 500;
                menu.targetScrollY = 123;
                menu.barRect = { h: 60, thumbY: 0, thumbH: 59 };
                menu.draggingBar = true;

                menu._dragBar({ clientY: 20 });

                expect(menu.targetScrollY).toBe(123);
            });

            test('does nothing when not dragging, or when barRect is not set', () => {
                stubBar(300);
                menu.scrollMax = 500;
                menu.targetScrollY = 321;
                menu.barRect = { h: 300, thumbY: 0, thumbH: 60 };

                menu.draggingBar = false;
                menu._dragBar({ clientY: 200 });
                expect(menu.targetScrollY).toBe(321);

                menu.draggingBar = true;
                menu.barRect = null;
                menu._dragBar({ clientY: 200 });
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

                menu.selectedOption = 0;
                menu.handleKeyDown({ key: 'ArrowUp' });

                expect(menu.selectedOption).toBe(menu.goBackIndex);
                expectHoverSound();
            });

            test('Enter triggers handleMenuSelection() only when Go Back is selected', () => {
                unlock('map1', 'map2');
                const selectionSpy = jest.spyOn(menu, 'handleMenuSelection');

                menu.selectedOption = 0;
                menu.handleKeyDown({ key: 'Enter' });
                expect(selectionSpy).not.toHaveBeenCalled();

                menu.selectedOption = menu.goBackIndex;
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
            test('over a scrollable list, the wheel scrolls (clamped) without changing selection', () => {
                unlockEnoughToScroll();
                menu.update(16);
                hover(render().viewport);

                const prevSelected = menu.selectedOption;
                menu.targetScrollY = menu.scrollMax - 10;

                menu.handleMouseWheel({ deltaY: 100 });

                expect(menu.targetScrollY).toBe(menu.scrollMax);
                expect(menu.selectedOption).toBe(prevSelected);
            });

            test('over a scrollable list, scrolling up decreases targetScrollY and clamps at 0', () => {
                unlockEnoughToScroll();
                menu.update(16);
                hover(render().viewport);

                menu.targetScrollY = 10;
                menu.handleMouseWheel({ deltaY: -100 });

                expect(menu.targetScrollY).toBe(0);
            });

            test('over a list that cannot scroll, the wheel navigates and plays the hover sound', () => {
                unlock('map1', 'map2'); // not enough rows to scroll
                menu.update(16);
                hover(render().viewport);

                menu.selectedOption = 0;
                menu.handleMouseWheel({ deltaY: 100 });

                expect(menu.scrollMax).toBe(0);
                expect(menu.selectedOption).toBe(1);
                expectHoverSound();
            });

            test('away from the list, the wheel navigates and plays the hover sound', () => {
                unlockEnoughToScroll();
                menu.update(16);
                leave(render().viewport);

                menu.selectedOption = 0;
                menu.handleMouseWheel({ deltaY: 100 });

                expect(menu.selectedOption).toBe(1);
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
                menu.handleMouseWheel({ deltaY: 100 });

                expect(menu.selectedOption).toBe(prevSelected);
                expect(menu.targetScrollY).toBe(prevTarget);
            });
        });

        describe('pointer (hover / scrollbar / click)', () => {
            test('hovering a list row updates selectedOption and plays the hover sound', () => {
                unlock('map1', 'map2', 'map3');
                menu.update(16);

                menu.selectedOption = 1;
                game.audioHandler.menu.playSound.mockClear();

                hover(render().mapRows[0].root);

                expect(menu.selectedOption).toBe(0);
                expectHoverSound();
            });

            test('hovering the Go Back button selects the Go Back row', () => {
                unlock('map1', 'map2');
                menu.update(16);

                menu.selectedOption = 0;
                hover(render().back);

                expect(menu.selectedOption).toBe(menu.goBackIndex);
            });

            test('pointerdown on the scrollbar thumb starts dragging; pointerup stops it', () => {
                unlockEnoughToScroll();
                menu.update(16);

                const bar = stubBar(menu.listHeight);
                menu.barRect = { h: menu.listHeight, thumbY: 20, thumbH: 40 };
                menu.scrollMax = 500;

                pointerDown(bar, 30);
                expect(menu.draggingBar).toBe(true);

                document.dispatchEvent(new Event('pointerup'));
                expect(menu.draggingBar).toBe(false);
            });

            test('pointerdown on the scrollbar track (not the thumb) jumps targetScrollY within bounds', () => {
                unlockEnoughToScroll();
                menu.update(16);

                const bar = stubBar(menu.listHeight);
                menu.scrollMax = 500;
                menu.targetScrollY = 0;
                menu.barRect = { h: menu.listHeight, thumbY: 0, thumbH: 34 };

                pointerDown(bar, menu.listHeight - 2);

                expect(menu.targetScrollY).toBeGreaterThan(0);
                expect(menu.targetScrollY).toBeLessThanOrEqual(menu.scrollMax);
            });

            test('click triggers handleMenuSelection() only when Go Back is selected', () => {
                unlock('map1', 'map2');
                const spy = jest.spyOn(menu, 'handleMenuSelection');

                menu.selectedOption = 0;
                menu.handleMouseClick();
                expect(spy).not.toHaveBeenCalled();

                menu.selectedOption = menu.goBackIndex;
                menu.handleMouseClick();
                expect(spy).toHaveBeenCalledTimes(1);

                spy.mockRestore();
            });

            test.each([
                ['inactive', 'menu is inactive'],
                ['cantSelect', 'game.canSelect is false'],
                ['cantSelectForest', 'game.canSelectForestMap is false'],
            ])('ignores pointer interactions when %s (%s)', (mode) => {
                unlockEnoughToScroll();
                menu.update(16);
                const dom = render();

                const prevSelected = menu.selectedOption;
                const prevTarget = menu.targetScrollY;

                setInactiveOrDisabledSelection(mode);

                hover(dom.mapRows[1].root);
                hover(dom.back);
                pointerDown(stubBar(menu.listHeight), 10);
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

            expect(game.goBackMenu).toHaveBeenCalledTimes(1);

            expect(game.menu.main.activateMenu).toHaveBeenCalledWith(2);

            superSpy.mockRestore();
        });

        test('handleMenuSelection() is a no-op when game.canSelect is false', () => {
            const superSpy = jest.spyOn(BaseMenu.prototype, 'handleMenuSelection').mockImplementation(() => {});

            game.canSelect = false;
            menu.handleMenuSelection();

            expect(superSpy).not.toHaveBeenCalled();
            expect(game.goBackMenu).not.toHaveBeenCalled();
            expect(game.menu.main.activateMenu).not.toHaveBeenCalled();

            superSpy.mockRestore();
        });
    });

    describe('rendering (draw)', () => {
        const panelText = () => menu.panel.textContent;

        test('draw() is a no-op when menu is inactive', () => {
            menu.menuActive = false;
            const syncSpy = jest.spyOn(menu, 'syncPanel');

            menu.draw(ctx);

            expect(syncSpy).not.toHaveBeenCalled();
            expect(ctx.fillText).not.toHaveBeenCalled();

            syncSpy.mockRestore();
        });

        test('when no maps are unlocked, renders the empty-state message and still draws Go Back', () => {
            expect(() => menu.draw(ctx)).not.toThrow();

            const empty = menu.panel.querySelector('.records-empty');
            expect(empty.hidden).toBe(false);
            expect(empty.textContent).toBe('No maps unlocked yet.');
            expect(menu.dom.back.textContent.trim()).toBe('Go Back');
        });

        test('for a boss map, renders a "Boss:" line only when bossMs is present (Map7)', () => {
            game.map7Unlocked = true;
            game.records = { Map7: { clearMs: 120000, bossMs: 30000 } };

            menu.update(16);

            expect(() => menu.draw(ctx)).not.toThrow();

            expect(panelText()).toContain('02:00.00');

            const boss = menu.panel.querySelector('.records-row__boss');
            expect(boss.hidden).toBe(false);
            expect(boss.textContent).toMatch(/^Boss: /);
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

            expect(panelText()).toContain('01:05.43');
            expect(panelText()).toContain('—');

            expect(menu.scrollMax).toBeGreaterThan(0);
            expect(menu.barRect).not.toBeNull();
            expect(menu.barRect).toEqual({
                h: menu.listHeight,
                thumbY: expect.any(Number),
                thumbH: expect.any(Number),
            });
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