import { LevelDifficultyMenu } from '../../game/menu/levelDifficultyMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';

describe('LevelDifficultyMenu', () => {
    let menu, mockGame;

    const labels = (sel) => ([
        sel === 0 ? 'Very Easy - Selected' : 'Very Easy',
        sel === 1 ? 'Easy - Selected' : 'Easy',
        sel === 2 ? 'Normal - Selected' : 'Normal',
        sel === 3 ? 'Hard - Selected' : 'Hard',
        sel === 4 ? 'Extreme - Selected' : 'Extreme',
        'Go Back'
    ]);

    const expectState = ({ idx, lives, selectedDifficulty, expectedLabels }) => {
        expect(menu.selectedDifficultyIndex).toBe(idx);
        if (lives !== undefined) expect(mockGame.lives).toBe(lives);
        if (selectedDifficulty !== undefined) {
            expect(mockGame.selectedDifficulty).toBe(selectedDifficulty);
        }
        if (expectedLabels) expect(menu.menuOptions).toEqual(expectedLabels);
    };

    const clickEvt = (extra = {}) => ({
        clientX: 0,
        clientY: 0,
        preventDefault: jest.fn(),
        stopImmediatePropagation: jest.fn(),
        ...extra,
    });

    beforeAll(() => {
        jest.spyOn(BaseMenu.prototype, 'handleMenuSelection').mockImplementation(() => { });
        document.body.innerHTML = `<img id="mainmenubackground" />`;
    });

    afterAll(() => {
        BaseMenu.prototype.handleMenuSelection.mockRestore();
    });

    beforeEach(() => {
        mockGame = {
            width: 1920,
            height: 1080,

            canSelect: true,
            canSelectForestMap: true,

            lives: null,
            selectedDifficulty: null,

            UI: {
                syncLivesState: jest.fn(),
            },

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
                height: 1080,
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 1920, height: 1080 }),
            },

            menu: {
                main: { activateMenu: jest.fn(), menuActive: false },
                settings: { activateMenu: jest.fn(), menuActive: false },
                pause: { isPaused: false },
            },

            currentMenu: null,
        };

        mockGame.goBackMenu = jest.fn(() => {
            mockGame.menu.settings.activateMenu(2);
            mockGame.currentMenu = mockGame.menu.settings;
        });

        menu = new LevelDifficultyMenu(mockGame);
    });

    describe('initialization', () => {
        it('extends BaseMenu and has the expected title and 6 options', () => {
            expect(menu).toBeInstanceOf(BaseMenu);
            expect(menu.title).toBe('Level Difficulty Settings');
            expect(menu.menuOptions).toHaveLength(6);

            menu.setDifficulty('Easy');
            expect(menu.menuOptions).toHaveLength(6);

            menu.selectedOption = 5;
            menu.handleMenuSelection();

            expect(menu.menuOptions).toHaveLength(6);
        });

        it('initializes with Normal difficulty selected', () => {
            expectState({
                idx: 2,
                lives: 5,
                selectedDifficulty: 'Normal',
                expectedLabels: labels(2),
            });
        });
    });

    describe('setDifficulty()', () => {
        it.each([
            ['Very Easy', 0, 10],
            ['Easy', 1, 7],
            ['Normal', 2, 5],
            ['Hard', 3, 3],
            ['Extreme', 4, 1],
        ])('setDifficulty("%s") updates index, lives and labels correctly', (name, idx, lives) => {
            mockGame.UI.syncLivesState.mockClear();

            menu.setDifficulty(name);

            expectState({
                idx,
                lives,
                selectedDifficulty: name,
                expectedLabels: labels(idx),
            });

            expect(mockGame.UI.syncLivesState).toHaveBeenCalledTimes(1);
        });

        it('defaults unknown difficulty to Normal (but preserves the string on the game)', () => {
            mockGame.UI.syncLivesState.mockClear();

            menu.setDifficulty('Impossible');

            expectState({
                idx: 2,
                lives: 5,
                selectedDifficulty: 'Impossible',
                expectedLabels: labels(2),
            });

            expect(mockGame.UI.syncLivesState).toHaveBeenCalledTimes(1);
        });

        it('falls back to Normal if you pass null/undefined', () => {
            mockGame.UI.syncLivesState.mockClear();

            menu.setDifficulty(undefined);
            expectState({
                idx: 2,
                lives: 5,
                selectedDifficulty: undefined,
                expectedLabels: labels(2),
            });

            menu.setDifficulty(null);
            expectState({
                idx: 2,
                lives: 5,
                expectedLabels: labels(2),
            });

            expect(mockGame.UI.syncLivesState).toHaveBeenCalledTimes(2);
        });

        it('does not call UI.syncLivesState when triggerUISync=false', () => {
            mockGame.UI.syncLivesState.mockClear();

            menu.setDifficulty('Hard', false);

            expect(menu.selectedDifficultyIndex).toBe(3);
            expect(mockGame.lives).toBe(3);
            expect(mockGame.selectedDifficulty).toBe('Hard');
            expect(mockGame.UI.syncLivesState).not.toHaveBeenCalled();
        });

        it('calls UI.syncLivesState by default when setDifficulty is called', () => {
            mockGame.UI.syncLivesState.mockClear();

            menu.setDifficulty('Hard');

            expect(mockGame.UI.syncLivesState).toHaveBeenCalledTimes(1);
        });
    });

    describe('handleMenuSelection()', () => {
        beforeEach(() => {
            menu.menuOptions = ['Very Easy', 'Easy', 'Normal - Selected', 'Hard', 'Extreme', 'Go Back'];
        });

        it('always delegates to BaseMenu.handleMenuSelection()', () => {
            BaseMenu.prototype.handleMenuSelection.mockClear();
            menu.selectedOption = 2;
            menu.handleMenuSelection();
            expect(BaseMenu.prototype.handleMenuSelection).toHaveBeenCalledTimes(1);
        });

        it.each([
            [0, 0, 10, 'Very Easy'],
            [1, 1, 7, 'Easy'],
            [3, 3, 3, 'Hard'],
            [4, 4, 1, 'Extreme'],
        ])('selects the correct difficulty when cursor index is %s', (cursor, idx, lives, label) => {
            menu.selectedOption = cursor;
            menu.handleMenuSelection();
            expectState({
                idx,
                lives,
                selectedDifficulty: label,
                expectedLabels: labels(idx),
            });
        });

        it('Go Back: activates main menu and never appends "- Selected"', () => {
            menu.selectedOption = 5;
            menu.menuOptions[5] = 'Go Back';

            menu.handleMenuSelection();

            expect(mockGame.goBackMenu).toHaveBeenCalledTimes(1);
            expect(mockGame.menu.settings.activateMenu).toHaveBeenCalledWith(2);
            expect(menu.menuOptions[5]).toBe('Go Back');
        });
    });

    describe('getSelectedOption()', () => {
        it('returns the current difficulty index', () => {
            menu.setDifficulty('Hard'); expect(menu.getSelectedOption()).toBe(3);
            menu.setDifficulty('Easy'); expect(menu.getSelectedOption()).toBe(1);
            menu.setDifficulty('Extreme'); expect(menu.getSelectedOption()).toBe(4);
            menu.setDifficulty('Very Easy'); expect(menu.getSelectedOption()).toBe(0);
        });

        it('returns the difficulty index, not the cursor index', () => {
            menu.selectedOption = 5;
            menu.setDifficulty('Easy');
            expect(menu.getSelectedOption()).toBe(1);
        });
    });

    describe('saving behavior (LevelDifficulty via SelectMenu)', () => {
        beforeEach(() => {
            mockGame.saveGameState.mockClear();
            mockGame.goBackMenu.mockClear();
            mockGame.menu.settings.activateMenu.mockClear();
        });

        it('saves once when changing to a different difficulty via Enter', () => {
            menu.selectedOption = 0;
            menu.handleMenuSelection();

            expectState({
                idx: 0,
                expectedLabels: labels(0),
            });
            expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);
        });

        it('does NOT save when confirming the already selected difficulty', () => {
            mockGame.saveGameState.mockClear();
            menu.selectedOption = 2;
            menu.handleMenuSelection();
            expect(menu.selectedDifficultyIndex).toBe(2);
            expect(mockGame.saveGameState).not.toHaveBeenCalled();
        });

        it('does NOT save when choosing Go Back', () => {
            mockGame.saveGameState.mockClear();
            menu.selectedOption = 5;
            menu.handleMenuSelection();

            expect(mockGame.goBackMenu).toHaveBeenCalledTimes(1);
            expect(mockGame.menu.settings.activateMenu).toHaveBeenCalledWith(2);
            expect(mockGame.saveGameState).not.toHaveBeenCalled();
        });

        it('mouse clicks follow the same save semantics as Enter', () => {
            menu.activateMenu();
            mockGame.saveGameState.mockClear();

            menu.selectedOption = 3;
            menu.handleMouseClick(clickEvt());

            expect(menu.selectedDifficultyIndex).toBe(3);
            expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);

            mockGame.saveGameState.mockClear();
            menu.selectedOption = 3;
            menu.handleMouseClick(clickEvt());

            expect(mockGame.saveGameState).not.toHaveBeenCalled();
        });
    });
});