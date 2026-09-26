import { ControlsSettingsMenu } from '../../game/menu/controlsSettingsMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';

jest.mock('../../game/config/keyBindings.js', () => {
    const defaults = {
        jump: 'w',
        moveBackward: 'a',
        sit: 's',
        moveForward: 'd',
        rollAttack: 'Enter',
        diveAttack: 's',
        fireballAttack: 'q',
        invisibleDefense: 'e',
        dashAttack: 'Shift',
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
        'dashAttack',
        'Reset to Defaults',
        'Go Back',
    ];

    beforeAll(() => {
        document.body.innerHTML = `
      <img id="mainmenubackground" />
    `;
        jest.spyOn(BaseMenu.prototype, 'draw').mockImplementation(() => { });
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
            audioHandler: {
                menu: {
                    playSound: jest.fn(),
                    stopSound: jest.fn(),
                },
            },
            goBackMenu: jest.fn(),

            menu: {
                settings: { activateMenu: jest.fn() },
                pause: { isPaused: false },
            },
            cutsceneActive: false,
            currentCutscene: null,
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
            strokeRect: jest.fn(),
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
            mockGame.keyBindings.jump = 'z';
            mockGame.keyBindings.sit = null;

            menu.selectedOption = menu.menuOptions.indexOf('Reset to Defaults');
            menu.handleMenuSelection();

            expect(mockGame.keyBindings).toEqual(getDefaultKeyBindings());
            expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionSelectedSound', false, true);
        });

        test('"Go Back" delegates to game.goBackMenu() and does not save', () => {
            menu.selectedOption = menu.menuOptions.indexOf('Go Back');

            menu.handleMenuSelection();

            expect(mockGame.goBackMenu).toHaveBeenCalledTimes(1);
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
            mockGame.keyBindings.moveForward = 'x';

            menu.selectedOption = menu.menuOptions.indexOf('sit');
            menu.handleMenuSelection();

            const e = new KeyboardEvent('keydown', { key: 'x' });
            menu.onGlobalKeyDown(e);

            expect(mockGame.keyBindings.sit).toBe('x');
            expect(mockGame.keyBindings.diveAttack).toBe('x');
            expect(mockGame.keyBindings.moveForward).toBeNull();

            expect(menu.waitingForKey).toBe(false);
            expect(menu.waitingAction).toBe(null);
            expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);
        });

        test('rebind of non sit/dive action clears duplicates but does not mirror', () => {
            mockGame.keyBindings.jump = 'x';
            mockGame.keyBindings.rollAttack = 'x';

            menu.selectedOption = menu.menuOptions.indexOf('jump');
            menu.handleMenuSelection();

            const e = new KeyboardEvent('keydown', { key: 'x' });
            menu.onGlobalKeyDown(e);

            expect(mockGame.keyBindings.jump).toBe('x');
            expect(mockGame.keyBindings.rollAttack).toBeNull();

            expect(mockGame.keyBindings.sit).toBe('s');
            expect(mockGame.keyBindings.diveAttack).toBe('s');

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

    describe('mouse wheel and hover behaviour', () => {
        const hover = (element) => element.dispatchEvent(new Event('pointerenter'));

        test('mouse wheel over the list scrolls it; elsewhere it moves the selection', () => {
            menu.ensurePanel();
            menu.scrollMax = 500;
            menu.targetScrollY = 0;

            hover(menu.dom.viewport);
            menu.handleMouseWheel({ deltaY: 100 });
            expect(menu.targetScrollY).toBeGreaterThan(0);

            menu.dom.viewport.dispatchEvent(new Event('pointerleave'));
            const spyScrollIntoView = jest.spyOn(menu, 'scrollSelectedIntoView');
            const before = menu.selectedOption;

            menu.handleMouseWheel({ deltaY: 100 });

            expect(menu.selectedOption).toBe(before + 1);
            expect(spyScrollIntoView).toHaveBeenCalled();

            spyScrollIntoView.mockRestore();
        });

        test('hovering a keybind row selects it and plays the hover sound', () => {
            menu.ensurePanel();
            menu.selectedOption = 1;

            hover(menu.dom.keyRows[0].row);

            expect(menu.selectedOption).toBe(0);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionHoveredSound', false, true);
        });

        test('hovering the bottom buttons selects Reset and Go Back entries', () => {
            menu.ensurePanel();

            hover(menu.dom.footer[0]);
            expect(menu.selectedOption).toBe(menu.menuOptions.length - 2);

            hover(menu.dom.footer[1]);
            expect(menu.selectedOption).toBe(menu.menuOptions.length - 1);
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

        test('dragging the scrollbar thumb maps its position onto targetScrollY', () => {
            menu.ensurePanel();
            menu.barRect = { h: 300, thumbY: 0, thumbH: 60 };
            menu.scrollMax = 500;
            menu.draggingBar = true;

            menu.dom.bar.getBoundingClientRect = () => ({ top: 0, height: 300 });
            const midpoint = (300 - 60) / 2 + 60 / 2;

            menu._dragBar({ clientY: midpoint });

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

        const armScrollbar = () => {
            menu.ensurePanel();
            menu.barRect = { h: 300, thumbY: 0, thumbH: 60 };
            menu.scrollMax = 500;
            menu.dom.bar.getBoundingClientRect = () => ({ top: 0, height: 300 });
        };

        test('the click ending a thumb drag does not open the rebind prompt', () => {
            armScrollbar();
            menu._grabBar({ clientY: 30 });
            expect(menu.draggingBar).toBe(true);

            const spy = jest.spyOn(menu, 'handleMenuSelection');
            menu.handleMouseClick({ target: menu.dom.track });

            expect(spy).not.toHaveBeenCalled();
            expect(menu.waitingForKey).toBe(false);
            spy.mockRestore();
        });

        test('clicking the scrollbar itself does not open the rebind prompt', () => {
            armScrollbar();
            const spy = jest.spyOn(menu, 'handleMenuSelection');

            menu.handleMouseClick({ target: menu.dom.bar });

            expect(spy).not.toHaveBeenCalled();
            expect(menu.waitingForKey).toBe(false);
            spy.mockRestore();
        });

        test('only the click belonging to the scrollbar press is swallowed', () => {
            armScrollbar();
            menu._grabBar({ clientY: 30 });
            menu.handleMouseClick({ target: menu.dom.track });

            const spy = jest.spyOn(menu, 'handleMenuSelection');
            menu.handleMouseClick({ target: menu.dom.track });

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