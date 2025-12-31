import { ControlsSettingsMenu } from '../../game/menu/controlsSettingsMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';

jest.mock('../../game/config/keyBindings.js', () => {
    const defaults = {
        jump: 'Space',
        moveBackward: 'A',
        sit: 'S',
        moveForward: 'D',
        rollAttack: 'K',
        diveAttack: 'L',
        fireballAttack: 'F',
        invisibleDefense: 'I',
    };
    return {
        getDefaultKeyBindings: jest.fn(() => ({ ...defaults })),
        normalizeKey: jest.fn((k) => k),
        keyLabel: jest.fn((k) => (k ? String(k) : '(Unbound)')),
    };
});

describe('ControlsSettingsMenu', () => {
    let menu, mockGame, ctx;
    const { getDefaultKeyBindings, normalizeKey, keyLabel } =
        jest.requireMock('../../game/config/keyBindings.js');

    const actionOrder = [
        'jump',
        'moveBackward',
        'sit',
        'moveForward',
        'rollAttack',
        'diveAttack',
        'fireballAttack',
        'invisibleDefense',
        'Reset to Defaults',
        'Go Back',
    ];

    beforeAll(() => {
        document.body.innerHTML = `
      <img id="mainmenubackground" />
    `;
        jest.spyOn(BaseMenu.prototype, 'draw').mockImplementation(() => {});
    });

    afterAll(() => {
        BaseMenu.prototype.draw.mockRestore();
    });

    beforeEach(() => {
        mockGame = {
            width: 1280,
            height: 720,
            canSelect: true,
            canSelectForestMap: true,
            isPlayerInGame: true,
            audioHandler: { menu: { playSound: jest.fn() } },
            menu: { settings: { activateMenu: jest.fn() } },
            canvas: {
                width: 1280,
                height: 720,
                getBoundingClientRect: () => ({
                    left: 0,
                    top: 0,
                    width: 1280,
                    height: 720,
                }),
            },
            saveGameState: jest.fn(),
        };

        mockGame.keyBindings = getDefaultKeyBindings();

        ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            drawImage: jest.fn(),
            fillRect: jest.fn(),
            fillText: jest.fn(),
            beginPath: jest.fn(),
            rect: jest.fn(),
            clip: jest.fn(),
            setTransform: jest.fn(),
        };

        menu = new ControlsSettingsMenu(mockGame);
        menu.activateMenu();
        jest.clearAllMocks();
    });

    afterEach(() => {
        menu.destroy();
    });

    describe('initialisation and basic state', () => {
        test('initialises with default key bindings, menu order, and flags', () => {
            expect(menu.menuOptions).toEqual(actionOrder);
            expect(menu.waitingForKey).toBe(false);
            expect(menu.waitingAction).toBe(null);
            expect(mockGame.keyBindings).toEqual(getDefaultKeyBindings());
        });

        test('unboundCount() reports number of unbound actions', () => {
            expect(menu.unboundCount()).toBe(0);
            mockGame.keyBindings.jump = null;
            mockGame.keyBindings.fireballAttack = null;
            expect(menu.unboundCount()).toBe(2);
        });
    });

    describe('handleMenuSelection behaviour', () => {
        test('selecting an action opens rebind overlay and plays selection sound', () => {
            menu.selectedOption = menu.menuOptions.indexOf('sit');

            menu.handleMenuSelection();

            expect(menu.waitingForKey).toBe(true);
            expect(menu.waitingAction).toBe('sit');
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionSelectedSound', false, true);
        });

        test('"Reset to Defaults" restores defaults, saves, and plays selection sound', () => {
            mockGame.keyBindings.jump = 'Q';
            mockGame.keyBindings.sit = null;

            menu.selectedOption = menu.menuOptions.indexOf('Reset to Defaults');
            menu.handleMenuSelection();

            expect(mockGame.keyBindings).toEqual(getDefaultKeyBindings());
            expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionSelectedSound', false, true);
        });

        test('"Go Back" activates settings menu index 1 and does not save', () => {
            menu.selectedOption = menu.menuOptions.indexOf('Go Back');

            menu.handleMenuSelection();

            expect(mockGame.menu.settings.activateMenu).toHaveBeenCalledWith(1);
            expect(mockGame.saveGameState).not.toHaveBeenCalled();
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionSelectedSound', false, true);
        });
    });

    describe('rebinding flow via onGlobalKeyDown', () => {
        test('Escape cancels the rebind overlay without saving', () => {
            menu.selectedOption = menu.menuOptions.indexOf('jump');
            menu.handleMenuSelection();
            expect(menu.waitingForKey).toBe(true);

            const e = new KeyboardEvent('keydown', { key: 'Escape' });
            menu.onGlobalKeyDown(e);

            expect(menu.waitingForKey).toBe(false);
            expect(menu.waitingAction).toBe(null);
            expect(mockGame.saveGameState).not.toHaveBeenCalled();
        });

        test('rebind of sit assigns key, mirrors to diveAttack, clears duplicates, and saves', () => {
            mockGame.keyBindings.moveForward = 'Q';

            menu.selectedOption = menu.menuOptions.indexOf('sit');
            menu.handleMenuSelection();

            const e = new KeyboardEvent('keydown', { key: 'Q' });
            menu.onGlobalKeyDown(e);

            expect(mockGame.keyBindings.sit).toBe('Q');
            expect(mockGame.keyBindings.diveAttack).toBe('Q');
            expect(mockGame.keyBindings.moveForward).toBeNull();

            expect(menu.waitingForKey).toBe(false);
            expect(menu.waitingAction).toBe(null);
            expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);
        });

        test('rebind of non sit/dive action clears duplicates but does not mirror', () => {
            mockGame.keyBindings.jump = 'Q';
            mockGame.keyBindings.rollAttack = 'Q';

            menu.selectedOption = menu.menuOptions.indexOf('jump');
            menu.handleMenuSelection();

            const e = new KeyboardEvent('keydown', { key: 'Q' });
            menu.onGlobalKeyDown(e);

            expect(mockGame.keyBindings.jump).toBe('Q');
            expect(mockGame.keyBindings.rollAttack).toBeNull();
            expect(mockGame.keyBindings.diveAttack).toBe('L');
            expect(mockGame.keyBindings.sit).toBe('S');
            expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);
        });

        test('normalizeKey is applied before storing the key binding', () => {
            normalizeKey.mockImplementation((k) => (k === 'a' ? 'A' : k));

            menu.selectedOption = menu.menuOptions.indexOf('jump');
            menu.handleMenuSelection();
            menu.onGlobalKeyDown(new KeyboardEvent('keydown', { key: 'a' }));

            expect(mockGame.keyBindings.jump).toBe('A');
        });
    });

    describe('keyboard navigation (Arrow keys and Enter)', () => {
        test('ArrowUp/ArrowDown move selection and play hover sound when not waitingForKey', () => {
            const start = menu.selectedOption;

            menu.handleKeyDown({ key: 'ArrowDown' });
            expect(menu.selectedOption).toBe((start + 1) % menu.menuOptions.length);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionHoveredSound', false, true);

            mockGame.audioHandler.menu.playSound.mockClear();

            menu.handleKeyDown({ key: 'ArrowUp' });
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionHoveredSound', false, true);
        });

        test('Enter triggers handleMenuSelection when menu is active', () => {
            const spy = jest.spyOn(menu, 'handleMenuSelection');

            menu.handleKeyDown({ key: 'Enter' });

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });

        test('when waitingForKey, Arrow keys do not change selection', () => {
            menu.waitingForKey = true;
            const prev = menu.selectedOption;

            menu.handleKeyDown({ key: 'ArrowDown' });

            expect(menu.selectedOption).toBe(prev);
        });
    });

    describe('mouse wheel and move behaviour', () => {
        test('mouse wheel inside list scrolls list; outside delegates to BaseMenu and scrolls selection into view', () => {
            menu.scrollMax = 500;
            menu.targetScrollY = 0;

            const list = menu.listBounds();
            const insideEvt = {
                deltaY: 100,
                clientX: list.x + 10,
                clientY: list.y + 10,
            };

            menu.handleMouseWheel(insideEvt);
            expect(menu.targetScrollY).toBeGreaterThan(0);

            const spySuper = jest.spyOn(BaseMenu.prototype, 'handleMouseWheel');
            const spyScrollIntoView = jest.spyOn(menu, 'scrollSelectedIntoView');

            const outsideEvt = {
                deltaY: 100,
                clientX: list.x - 50,
                clientY: list.y + 10,
            };

            menu.handleMouseWheel(outsideEvt);

            expect(spySuper).toHaveBeenCalledWith(outsideEvt);
            expect(spyScrollIntoView).toHaveBeenCalled();

            spySuper.mockRestore();
            spyScrollIntoView.mockRestore();
        });

        test('mouse move over list area selects corresponding row and plays hover sound', () => {
            const list = menu.listBounds();
            menu.selectedOption = 1;

            const mx = list.x + 10;
            const my = list.y + menu.listPadding + menu.rowHeight * 0.5;

            menu.handleMouseMove({ clientX: mx, clientY: my });

            expect(menu.selectedOption).toBe(0);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionHoveredSound', false, true);
        });

        test('mouse move over bottom buttons selects Reset and Go Back entries', () => {
            const listTop = mockGame.height / 2 - menu.positionOffset + menu.menuOptionsPositionOffset;
            const reservedForButtons = menu.rowHeight * 2 + 40;
            const listBottom = mockGame.height - reservedForButtons - 30;
            const listHeight = Math.max(120, listBottom - listTop);

            const resetIdx = menu.menuOptions.length - 2;
            const backIdx = menu.menuOptions.length - 1;

            const xEnd = menu.centerX - 40;
            const xStart = xEnd - 400;
            const midX = (xStart + xEnd) / 2;

            const resetY = listTop + listHeight + 40 + menu.rowHeight / 2;
            const backY = resetY + menu.rowHeight;

            menu.handleMouseMove({ clientX: midX, clientY: resetY });
            expect(menu.selectedOption).toBe(resetIdx);

            menu.handleMouseMove({ clientX: midX, clientY: backY });
            expect(menu.selectedOption).toBe(backIdx);
        });
    });

    describe('scroll helpers and update', () => {
        test('scrollSelectedIntoView clamps targetScrollY within [0, scrollMax] and ignores bottom buttons', () => {
            menu.scrollMax = 400;
            menu.selectedOption = 6;

            menu.scrollSelectedIntoView();

            expect(menu.targetScrollY).toBeGreaterThanOrEqual(0);
            expect(menu.targetScrollY).toBeLessThanOrEqual(menu.scrollMax);

            const prev = menu.targetScrollY;

            menu.selectedOption = menu.menuOptions.length - 1;
            menu.scrollSelectedIntoView();

            expect(menu.targetScrollY).toBe(prev);
        });

        test('update() clamps targetScrollY to scrollMax', () => {
            menu.scrollMax = 120;
            menu.targetScrollY = 999;

            menu.update(16);

            expect(menu.targetScrollY).toBe(menu.scrollMax);
        });

        test('updateScrollFromThumb maps thumb position to targetScrollY within range', () => {
            menu.barRect = { y: 100, h: 300, thumbH: 60 };
            menu.scrollMax = 500;

            const mid = 100 + (300 - 60) / 2 + 60 / 2;

            menu.updateScrollFromThumb(mid);

            expect(menu.targetScrollY).toBeCloseTo(menu.scrollMax / 2, 1);
        });
    });

    describe('click handling', () => {
        test('clicks are ignored while waitingForKey', () => {
            menu.waitingForKey = true;
            const spy = jest.spyOn(menu, 'handleMenuSelection');

            menu.handleMouseClick({ clientX: 0, clientY: 0 });

            expect(spy).not.toHaveBeenCalled();
            spy.mockRestore();
        });

        test('click triggers selection handler when active and not waitingForKey', () => {
            const spy = jest.spyOn(menu, 'handleMenuSelection');

            menu.handleMouseClick({ clientX: 0, clientY: 0 });

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe('drawing', () => {
        test('draw() renders without throwing and uses keyLabel for key display', () => {
            mockGame.keyBindings.jump = null;

            expect(() => menu.draw(ctx)).not.toThrow();
            expect(keyLabel).toHaveBeenCalled();
        });
    });
});
