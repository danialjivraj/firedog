import { LevelDifficultyMenu } from '../../game/menu/levelDifficultyMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';

describe('LevelDifficultyMenu', () => {
    let menu, mockGame;

    const labels = (sel) => ([
        sel === 0 ? 'Easy - Selected' : 'Easy',
        sel === 1 ? 'Normal - Selected' : 'Normal',
        sel === 2 ? 'Hard - Selected' : 'Hard',
        sel === 3 ? 'Extreme - Selected' : 'Extreme',
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

    beforeAll(() => {
        jest.spyOn(BaseMenu.prototype, 'handleMenuSelection').mockImplementation(() => { });
    });

    afterAll(() => {
        BaseMenu.prototype.handleMenuSelection.mockRestore();
    });

    beforeEach(() => {
        mockGame = {
            lives: null,
            selectedDifficulty: null,
            menu: { main: { activateMenu: jest.fn() } },
        };
        menu = new LevelDifficultyMenu(mockGame);
    });

    describe('initialization', () => {
        it('extends BaseMenu and has the expected title and 5 options', () => {
            expect(menu).toBeInstanceOf(BaseMenu);
            expect(menu.title).toBe('Level Difficulty Menu');
            expect(menu.menuOptions).toHaveLength(5);

            menu.setDifficulty('Easy');
            expect(menu.menuOptions).toHaveLength(5);
            menu.selectedOption = 4;
            menu.handleMenuSelection();
            expect(menu.menuOptions).toHaveLength(5);
        });

        it('initializes with Normal difficulty selected', () => {
            expectState({
                idx: 1,
                lives: 5,
                selectedDifficulty: 'Normal',
                expectedLabels: labels(1),
            });
        });
    });

    describe('setDifficulty()', () => {
        it.each([
            ['Easy', 0, 7],
            ['Normal', 1, 5],
            ['Hard', 2, 3],
            ['Extreme', 3, 1],
        ])('setDifficulty("%s") updates index, lives and labels correctly', (name, idx, lives) => {
            menu.setDifficulty(name);
            expectState({
                idx,
                lives,
                selectedDifficulty: name,
                expectedLabels: labels(idx),
            });
        });

        it('defaults unknown difficulty to Normal (but preserves the string on the game)', () => {
            menu.setDifficulty('Impossible');
            expectState({
                idx: 1,
                lives: 5,
                selectedDifficulty: 'Impossible',
                expectedLabels: labels(1),
            });
        });

        it('falls back to Normal if you pass null/undefined', () => {
            menu.setDifficulty(undefined);
            expectState({
                idx: 1,
                lives: 5,
                selectedDifficulty: undefined,
                expectedLabels: labels(1),
            });

            menu.setDifficulty(null);
            expectState({
                idx: 1,
                lives: 5,
                expectedLabels: labels(1),
            });
        });
    });

    describe('handleMenuSelection()', () => {
        beforeEach(() => {
            menu.menuOptions = ['Easy', 'Normal - Selected', 'Hard', 'Extreme', 'Go Back'];
        });

        it('always delegates to BaseMenu.handleMenuSelection()', () => {
            BaseMenu.prototype.handleMenuSelection.mockClear();
            menu.selectedOption = 1;
            menu.handleMenuSelection();
            expect(BaseMenu.prototype.handleMenuSelection).toHaveBeenCalledTimes(1);
        });

        it.each([
            [0, 0, 7, 'Easy'],
            [2, 2, 3, 'Hard'],
            [3, 3, 1, 'Extreme'],
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
            menu.selectedOption = 4;
            menu.menuOptions[4] = 'Go Back';
            menu.handleMenuSelection();
            expect(mockGame.menu.main.activateMenu).toHaveBeenCalledWith(2);
            expect(menu.menuOptions[4]).toBe('Go Back');
        });
    });

    describe('getSelectedOption()', () => {
        it('returns the current difficulty index', () => {
            menu.setDifficulty('Hard'); expect(menu.getSelectedOption()).toBe(2);
            menu.setDifficulty('Easy'); expect(menu.getSelectedOption()).toBe(0);
            menu.setDifficulty('Extreme'); expect(menu.getSelectedOption()).toBe(3);
        });

        it('returns the difficulty index, not the cursor index', () => {
            menu.selectedOption = 4;
            menu.setDifficulty('Easy');
            expect(menu.getSelectedOption()).toBe(0);
        });
    });

    describe('saving behavior (LevelDifficulty via SelectMenu)', () => {
        beforeEach(() => {
            mockGame.saveGameState = jest.fn();
            mockGame.canSelect = true;
            mockGame.canSelectForestMap = true;
            mockGame.width = mockGame.width ?? 1920;
            mockGame.height = mockGame.height ?? 1080;
            mockGame.canvas = mockGame.canvas ?? {
                width: 1920,
                height: 1080,
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 1920, height: 1080 }),
            };
        });

        it('saves once when changing to a different difficulty via Enter', () => {
            mockGame.saveGameState.mockClear();
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
            menu.selectedOption = 1;
            menu.handleMenuSelection();
            expect(menu.selectedDifficultyIndex).toBe(1);
            expect(mockGame.saveGameState).not.toHaveBeenCalled();
        });

        it('does NOT save when choosing Go Back', () => {
            mockGame.saveGameState.mockClear();
            menu.selectedOption = 4;
            menu.handleMenuSelection();
            expect(mockGame.menu.main.activateMenu).toHaveBeenCalledWith(2);
            expect(mockGame.saveGameState).not.toHaveBeenCalled();
        });

        it('mouse clicks follow the same save semantics as Enter', () => {
            menu.activateMenu();
            mockGame.saveGameState.mockClear();

            menu.selectedOption = 2;
            menu.handleMouseClick({ clientX: 0, clientY: 0 });
            expect(menu.selectedDifficultyIndex).toBe(2);
            expect(mockGame.saveGameState).toHaveBeenCalledTimes(1);

            mockGame.saveGameState.mockClear();
            menu.selectedOption = 2;
            menu.handleMouseClick({ clientX: 0, clientY: 0 });
            expect(mockGame.saveGameState).not.toHaveBeenCalled();
        });
    });
});
