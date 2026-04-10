import { DifficultyMenu } from '../../game/menu/difficultyMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';

describe('DifficultyMenu', () => {
    let menu, mockGame;

    const mkKeyEvt = (key) => ({
        key,
        preventDefault: jest.fn(),
        stopImmediatePropagation: jest.fn(),
    });

    const mkMouseEvt = (extra = {}) => ({
        clientX: 0,
        clientY: 0,
        preventDefault: jest.fn(),
        stopImmediatePropagation: jest.fn(),
        ...extra,
    });

    beforeAll(() => {
        document.body.innerHTML = `<img id="mainmenubackground" />`;
    });

    beforeEach(() => {
        mockGame = {
            width: 1920,
            height: 689,

            canSelect: true,
            canSelectForestMap: true,

            lives: null,
            powerUpSpawnMultiplier: null,
            powerDownSpawnMultiplier: null,

            UI: { syncLivesState: jest.fn() },

            audioHandler: {
                menu: {
                    playSound: jest.fn(),
                    stopSound: jest.fn(),
                },
            },

            input: { handleEscapeKey: jest.fn() },
            saveGameState: jest.fn(),

            canvas: {
                width: 1920,
                height: 689,
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 1920, height: 689 }),
            },

            gameOver: false,
            notEnoughCoins: false,

            menu: {
                main: { activateMenu: jest.fn(), menuActive: false },
                settings: { activateMenu: jest.fn(), menuActive: false },
                pause: { isPaused: false },
                gameOver: { menuActive: false },
            },

            currentMenu: null,
        };

        mockGame.goBackMenu = jest.fn(() => {
            mockGame.menu.settings.activateMenu(2);
            mockGame.currentMenu = mockGame.menu.settings;
        });

        menu = new DifficultyMenu(mockGame);
        menu.menuActive = true;
    });

    describe('initialization', () => {
        it('extends BaseMenu', () => {
            expect(menu).toBeInstanceOf(BaseMenu);
        });

        it('initializes with defaults: 5 lives, Normal spawn rates', () => {
            expect(menu.livesIndex).toBe(2);
            expect(menu.powerUpIndex).toBe(2);
            expect(menu.powerDownIndex).toBe(2);
            expect(mockGame.lives).toBe(5);
            expect(mockGame.powerUpSpawnMultiplier).toBe(1);
            expect(mockGame.powerDownSpawnMultiplier).toBe(1);
        });

        it('initializes focusedRow at 0', () => {
            expect(menu.focusedRow).toBe(0);
        });

        it('initializes menuInGame false and stars sticker visible', () => {
            expect(menu.menuInGame).toBe(false);
            expect(menu.showStarsSticker).toBe(true);
        });
    });

    describe('applyCurrentSettings()', () => {
        it('applies current settings to game state', () => {
            menu.livesIndex = 4;
            menu.powerUpIndex = 3;
            menu.powerDownIndex = 1;

            menu.applyCurrentSettings();

            expect(mockGame.lives).toBe(10);
            expect(mockGame.powerUpSpawnMultiplier).toBe(1.5);
            expect(mockGame.powerDownSpawnMultiplier).toBe(0.5);
            expect(mockGame.UI.syncLivesState).toHaveBeenCalledTimes(1);
        });

        it('does not sync UI when triggerUISync=false', () => {
            mockGame.UI.syncLivesState.mockClear();

            menu.applyCurrentSettings(false);

            expect(mockGame.UI.syncLivesState).not.toHaveBeenCalled();
        });
    });

    describe('getConfiguredLives()', () => {
        it.each([
            [0, 1],
            [1, 3],
            [2, 5],
            [3, 7],
            [4, 10],
        ])('maps livesIndex %d to %d lives', (idx, lives) => {
            menu.livesIndex = idx;
            expect(menu.getConfiguredLives()).toBe(lives);
        });
    });

    describe('getState() / setState()', () => {
        it('getState returns current indices', () => {
            menu.livesIndex = 1;
            menu.powerUpIndex = 3;
            menu.powerDownIndex = 0;

            expect(menu.getState()).toEqual({
                livesIndex: 1,
                powerUpIndex: 3,
                powerDownIndex: 0,
            });
        });

        it('setState restores indices and applies settings', () => {
            menu.setState({ livesIndex: 3, powerUpIndex: 1, powerDownIndex: 0 });

            expect(menu.livesIndex).toBe(3);
            expect(menu.powerUpIndex).toBe(1);
            expect(menu.powerDownIndex).toBe(0);
            expect(mockGame.lives).toBe(7);
            expect(mockGame.powerUpSpawnMultiplier).toBe(0.5);
            expect(mockGame.powerDownSpawnMultiplier).toBe(0);
        });

        it('setState uses defaults for missing fields', () => {
            menu.setState({});

            expect(menu.livesIndex).toBe(2);
            expect(menu.powerUpIndex).toBe(2);
            expect(menu.powerDownIndex).toBe(2);
        });

        it('setState with triggerUISync=false does not call syncLivesState', () => {
            mockGame.UI.syncLivesState.mockClear();

            menu.setState({ livesIndex: 0, powerUpIndex: 0, powerDownIndex: 0 }, false);

            expect(mockGame.UI.syncLivesState).not.toHaveBeenCalled();
        });

        it('setState with triggerUISync=true calls syncLivesState', () => {
            mockGame.UI.syncLivesState.mockClear();

            menu.setState({ livesIndex: 0, powerUpIndex: 0, powerDownIndex: 0 }, true);

            expect(mockGame.UI.syncLivesState).toHaveBeenCalledTimes(1);
        });
    });

    describe('activateMenu()', () => {
        it('defaults focusedRow to 0 when called without args', () => {
            menu.focusedRow = 3;
            menu.activateMenu();

            expect(menu.focusedRow).toBe(0);
            expect(menu.menuInGame).toBe(false);
            expect(menu.showStarsSticker).toBe(true);
        });

        it('uses numeric arg as selected option', () => {
            menu.activateMenu(4);
            expect(menu.focusedRow).toBe(4);
        });

        it('uses object arg for selectedOption and inGame', () => {
            menu.activateMenu({ selectedOption: 2, inGame: true });

            expect(menu.focusedRow).toBe(2);
            expect(menu.menuInGame).toBe(true);
            expect(menu.showStarsSticker).toBe(false);
        });

        it('clamps focusedRow to valid range', () => {
            menu.activateMenu({ selectedOption: 99, inGame: false });
            expect(menu.focusedRow).toBe(4);

            menu.activateMenu({ selectedOption: -5, inGame: false });
            expect(menu.focusedRow).toBe(0);
        });
    });

    describe('activateFromNav() / getNavState()', () => {
        it('getNavState returns current nav state', () => {
            menu.focusedRow = 3;
            menu.menuInGame = true;

            expect(menu.getNavState()).toEqual({
                selectedOption: 3,
                menuInGame: true,
            });
        });

        it('activateFromNav restores nav state', () => {
            menu.activateFromNav({ selectedOption: 4, menuInGame: true });

            expect(menu.focusedRow).toBe(4);
            expect(menu.menuInGame).toBe(true);
            expect(menu.showStarsSticker).toBe(false);
        });

        it('activateFromNav falls back to existing menuInGame when omitted', () => {
            menu.menuInGame = true;
            menu.activateFromNav({ selectedOption: 1 });

            expect(menu.focusedRow).toBe(1);
            expect(menu.menuInGame).toBe(true);
        });
    });

    describe('_changeRowOption()', () => {
        beforeEach(() => {
            mockGame.saveGameState.mockClear();
            mockGame.UI.syncLivesState.mockClear();
        });

        it('increments livesIndex and wraps around', () => {
            menu.livesIndex = 4;
            menu._changeRowOption(0, 1);
            expect(menu.livesIndex).toBe(0);
        });

        it('decrements powerUpIndex and wraps around', () => {
            menu.powerUpIndex = 0;
            menu._changeRowOption(1, -1);
            expect(menu.powerUpIndex).toBe(3);
        });

        it('changes powerDownIndex', () => {
            menu._changeRowOption(2, 1);
            expect(menu.powerDownIndex).toBe(3);
        });

        it('applies settings and saves after change', () => {
            menu._changeRowOption(0, 1);

            expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);
            expect(mockGame.UI.syncLivesState).toHaveBeenCalledTimes(1);
        });

        it('applies spawn multiplier changes immediately', () => {
            menu.powerUpIndex = 0;
            menu._changeRowOption(1, 1);
            expect(mockGame.powerUpSpawnMultiplier).toBe(0.5);
        });
    });

    describe('_onReset()', () => {
        it('resets all indices to defaults', () => {
            menu.livesIndex = 0;
            menu.powerUpIndex = 3;
            menu.powerDownIndex = 1;

            menu._onReset();

            expect(menu.livesIndex).toBe(2);
            expect(menu.powerUpIndex).toBe(2);
            expect(menu.powerDownIndex).toBe(2);
        });

        it('saves and plays sound', () => {
            mockGame.saveGameState.mockClear();

            menu._onReset();

            expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
        });

        it('applies default settings to game', () => {
            menu.livesIndex = 0;
            menu.powerUpIndex = 0;
            menu.powerDownIndex = 0;

            menu._onReset();

            expect(mockGame.lives).toBe(5);
            expect(mockGame.powerUpSpawnMultiplier).toBe(1);
            expect(mockGame.powerDownSpawnMultiplier).toBe(1);
        });
    });

    describe('_onGoBack()', () => {
        it('calls goBackMenu and plays sound', () => {
            menu._onGoBack();

            expect(mockGame.goBackMenu).toHaveBeenCalledTimes(1);
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
        });
    });

    describe('handleKeyDown()', () => {
        it('ArrowDown moves focus down, wraps at 5', () => {
            menu.focusedRow = 4;
            menu.handleKeyDown(mkKeyEvt('ArrowDown'));
            expect(menu.focusedRow).toBe(0);
        });

        it('ArrowUp moves focus up, wraps at 0', () => {
            menu.focusedRow = 0;
            menu.handleKeyDown(mkKeyEvt('ArrowUp'));
            expect(menu.focusedRow).toBe(4);
        });

        it('ArrowRight changes option for row 0 (Lives)', () => {
            menu.focusedRow = 0;
            const before = menu.livesIndex;

            menu.handleKeyDown(mkKeyEvt('ArrowRight'));

            expect(menu.livesIndex).toBe((before + 1) % 5);
        });

        it('ArrowLeft changes option for row 1 (Power Up)', () => {
            menu.focusedRow = 1;
            menu.powerUpIndex = 2;

            menu.handleKeyDown(mkKeyEvt('ArrowLeft'));

            expect(menu.powerUpIndex).toBe(1);
        });

        it('ArrowRight does nothing when focusedRow >= 3 (buttons)', () => {
            menu.focusedRow = 3;
            const prev = menu.livesIndex;

            menu.handleKeyDown(mkKeyEvt('ArrowRight'));

            expect(menu.livesIndex).toBe(prev);
        });

        it('Enter on focusedRow=3 triggers reset', () => {
            jest.spyOn(menu, '_onReset');
            menu.focusedRow = 3;

            menu.handleKeyDown(mkKeyEvt('Enter'));

            expect(menu._onReset).toHaveBeenCalledTimes(1);
        });

        it('Enter on focusedRow=4 triggers go back', () => {
            jest.spyOn(menu, '_onGoBack');
            menu.focusedRow = 4;

            menu.handleKeyDown(mkKeyEvt('Enter'));

            expect(menu._onGoBack).toHaveBeenCalledTimes(1);
        });

        it('Enter on an option row plays selected sound', () => {
            mockGame.audioHandler.menu.playSound.mockClear();
            menu.focusedRow = 1;

            menu.handleKeyDown(mkKeyEvt('Enter'));

            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionSelectedSound', false, true);
        });

        it('does nothing when menuActive is false', () => {
            menu.menuActive = false;
            const prev = menu.focusedRow;

            menu.handleKeyDown(mkKeyEvt('ArrowDown'));

            expect(menu.focusedRow).toBe(prev);
        });

        it('does nothing when canSelect is false', () => {
            mockGame.canSelect = false;
            const prev = menu.focusedRow;

            menu.handleKeyDown(mkKeyEvt('ArrowDown'));

            expect(menu.focusedRow).toBe(prev);
        });

        it('does nothing when canSelectForestMap is false', () => {
            mockGame.canSelectForestMap = false;
            const prev = menu.focusedRow;

            menu.handleKeyDown(mkKeyEvt('ArrowDown'));

            expect(menu.focusedRow).toBe(prev);
        });
    });

    describe('handleMouseMove()', () => {
        it('hovers a lives option and updates focusedRow', () => {
            const { listTop, optionsStartX } = menu._getLayout();
            const y = listTop;
            const x = optionsStartX + 10;

            menu.handleMouseMove(mkMouseEvt({ clientX: x, clientY: y }));

            expect(menu._hoverRow).toBe(0);
            expect(menu._hoverOptIdx).toBe(0);
            expect(menu.focusedRow).toBe(0);
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
        });

        it('hovers reset button and updates focusedRow to 3', () => {
            const { centerX, resetY } = menu._getLayout();

            menu.handleMouseMove(mkMouseEvt({ clientX: centerX, clientY: resetY }));

            expect(menu._hoverButton).toBe(0);
            expect(menu.focusedRow).toBe(3);
        });

        it('hovers go back button and updates focusedRow to 4', () => {
            const { centerX, backY } = menu._getLayout();

            menu.handleMouseMove(mkMouseEvt({ clientX: centerX, clientY: backY }));

            expect(menu._hoverButton).toBe(1);
            expect(menu.focusedRow).toBe(4);
        });

        it('does not play hover sound when hover target did not change', () => {
            const { listTop, optionsStartX } = menu._getLayout();
            const evt = mkMouseEvt({ clientX: optionsStartX + 10, clientY: listTop });

            menu.handleMouseMove(evt);
            mockGame.audioHandler.menu.playSound.mockClear();
            menu.handleMouseMove(evt);

            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
        });
    });

    describe('handleMouseClick()', () => {
        beforeEach(() => {
            mockGame.saveGameState.mockClear();
        });

        it('clicking a Lives pill updates livesIndex and saves', () => {
            menu._hoverRow = 0;
            menu._hoverOptIdx = 0;

            menu.handleMouseClick(mkMouseEvt());

            expect(menu.livesIndex).toBe(0);
            expect(mockGame.lives).toBe(1);
            expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);
        });

        it('clicking a Power Up pill updates powerUpIndex', () => {
            menu._hoverRow = 1;
            menu._hoverOptIdx = 3;

            menu.handleMouseClick(mkMouseEvt());

            expect(menu.powerUpIndex).toBe(3);
            expect(mockGame.powerUpSpawnMultiplier).toBe(1.5);
        });

        it('clicking a Power Down pill updates powerDownIndex', () => {
            menu._hoverRow = 2;
            menu._hoverOptIdx = 0;

            menu.handleMouseClick(mkMouseEvt());

            expect(menu.powerDownIndex).toBe(0);
            expect(mockGame.powerDownSpawnMultiplier).toBe(0);
        });

        it('clicking Reset button calls _onReset', () => {
            jest.spyOn(menu, '_onReset');
            menu._hoverRow = -1;
            menu._hoverOptIdx = -1;
            menu._hoverButton = 0;

            menu.handleMouseClick(mkMouseEvt());

            expect(menu._onReset).toHaveBeenCalledTimes(1);
        });

        it('clicking Go Back button calls _onGoBack', () => {
            jest.spyOn(menu, '_onGoBack');
            menu._hoverRow = -1;
            menu._hoverOptIdx = -1;
            menu._hoverButton = 1;

            menu.handleMouseClick(mkMouseEvt());

            expect(menu._onGoBack).toHaveBeenCalledTimes(1);
        });

        it('does nothing when menuActive is false', () => {
            menu.menuActive = false;
            menu._hoverRow = 0;
            menu._hoverOptIdx = 1;

            menu.handleMouseClick(mkMouseEvt());

            expect(mockGame.saveGameState).not.toHaveBeenCalled();
        });
    });

    describe('handleMouseWheel()', () => {
        it('moves focus down when wheel delta is positive', () => {
            menu.focusedRow = 1;

            menu.handleMouseWheel({ deltaY: 100 });

            expect(menu.focusedRow).toBe(2);
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('optionHoveredSound', false, true);
        });

        it('moves focus up when wheel delta is negative', () => {
            menu.focusedRow = 0;

            menu.handleMouseWheel({ deltaY: -100 });

            expect(menu.focusedRow).toBe(4);
        });

        it('does nothing when menu is inactive', () => {
            menu.menuActive = false;
            menu.focusedRow = 2;

            menu.handleMouseWheel({ deltaY: 100 });

            expect(menu.focusedRow).toBe(2);
        });
    });

    describe('spawn multiplier mapping', () => {
        it.each([
            [0, 0],
            [1, 0.5],
            [2, 1],
            [3, 1.5],
        ])('powerUpIndex %d → multiplier %d', (idx, mult) => {
            menu.powerUpIndex = idx;
            menu._applySettings(false);
            expect(mockGame.powerUpSpawnMultiplier).toBe(mult);
        });

        it.each([
            [0, 0],
            [1, 0.5],
            [2, 1],
            [3, 1.5],
        ])('powerDownIndex %d → multiplier %d', (idx, mult) => {
            menu.powerDownIndex = idx;
            menu._applySettings(false);
            expect(mockGame.powerDownSpawnMultiplier).toBe(mult);
        });
    });
});