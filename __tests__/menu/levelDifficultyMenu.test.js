import { LevelDifficultyMenu } from '../../game/menu/levelDifficultyMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';

describe('LevelDifficultyMenu', () => {
    let menu, mockGame;

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
            menu: { main: { activateMenu: jest.fn() } }
        };
        menu = new LevelDifficultyMenu(mockGame);
    });

    describe('inheritance & basic properties', () => {
        it('is an instance of BaseMenu with the correct title', () => {
            expect(menu).toBeInstanceOf(BaseMenu);
            expect(menu.title).toBe('Level Difficulty Menu');
        });

        it('always has four menu options', () => {
            expect(menu.menuOptions).toHaveLength(4);
            menu.setDifficulty('Easy');
            expect(menu.menuOptions).toHaveLength(4);
            menu.selectedOption = 3;
            menu.handleMenuSelection();
            expect(menu.menuOptions).toHaveLength(4);
        });
    });

    describe('initialization', () => {
        it('defaults to Normal difficulty', () => {
            expect(menu.selectedDifficultyIndex).toBe(1);
            expect(mockGame.lives).toBe(5);
            expect(mockGame.selectedDifficulty).toBe('Normal');
            expect(menu.menuOptions).toEqual([
                'Easy',
                'Normal - Selected',
                'Hard',
                'Go Back'
            ]);
        });
    });

    describe('setDifficulty()', () => {
        it('sets Easy correctly', () => {
            menu.setDifficulty('Easy');
            expect(menu.selectedDifficultyIndex).toBe(0);
            expect(mockGame.lives).toBe(7);
            expect(mockGame.selectedDifficulty).toBe('Easy');
            expect(menu.menuOptions).toEqual([
                'Easy - Selected',
                'Normal',
                'Hard',
                'Go Back'
            ]);
        });

        it('sets Normal correctly', () => {
            menu.setDifficulty('Normal');
            expect(menu.selectedDifficultyIndex).toBe(1);
            expect(mockGame.lives).toBe(5);
            expect(mockGame.selectedDifficulty).toBe('Normal');
            expect(menu.menuOptions).toEqual([
                'Easy',
                'Normal - Selected',
                'Hard',
                'Go Back'
            ]);
        });

        it('sets Hard correctly', () => {
            menu.setDifficulty('Hard');
            expect(menu.selectedDifficultyIndex).toBe(2);
            expect(mockGame.lives).toBe(3);
            expect(mockGame.selectedDifficulty).toBe('Hard');
            expect(menu.menuOptions).toEqual([
                'Easy',
                'Normal',
                'Hard - Selected',
                'Go Back'
            ]);
        });

        it('defaults unknown difficulty to Normal', () => {
            menu.setDifficulty('Impossible');
            expect(menu.selectedDifficultyIndex).toBe(1);
            expect(mockGame.lives).toBe(5);
            expect(mockGame.selectedDifficulty).toBe('Impossible');
            expect(menu.menuOptions).toEqual([
                'Easy',
                'Normal - Selected',
                'Hard',
                'Go Back'
            ]);
        });

        it('falls back to Normal if you pass null/undefined', () => {
            menu.setDifficulty(undefined);
            expect(menu.selectedDifficultyIndex).toBe(1);
            expect(mockGame.lives).toBe(5);
            expect(mockGame.selectedDifficulty).toBeUndefined();
            expect(menu.menuOptions).toEqual([
                'Easy',
                'Normal - Selected',
                'Hard',
                'Go Back'
            ]);

            menu.setDifficulty(null);
            expect(menu.selectedDifficultyIndex).toBe(1);
            expect(mockGame.lives).toBe(5);
            expect(menu.menuOptions).toEqual([
                'Easy',
                'Normal - Selected',
                'Hard',
                'Go Back'
            ]);
        });
    });

    describe('updateSelectedDifficulty()', () => {
        it('strips old suffixes and applies only to the current index', () => {
            menu.menuOptions = [
                'Easy - Selected',
                'Normal - Selected',
                'Hard - Selected',
                'Go Back'
            ];
            menu.selectedDifficultyIndex = 2;
            menu.updateSelectedDifficulty();
            expect(menu.menuOptions).toEqual([
                'Easy',
                'Normal',
                'Hard - Selected',
                'Go Back'
            ]);
        });

        it('does not double‑suffix if called repeatedly', () => {
            menu.setDifficulty('Hard');
            menu.updateSelectedDifficulty();
            expect(menu.menuOptions[2]).toBe('Hard - Selected');
            menu.updateSelectedDifficulty();
            expect(menu.menuOptions[2]).toBe('Hard - Selected');
        });
    });

    describe('handleMenuSelection()', () => {
        beforeEach(() => {
            menu.menuOptions = ['Easy', 'Normal - Selected', 'Hard', 'Go Back'];
        });

        it('always calls BaseMenu.handleMenuSelection()', () => {
            BaseMenu.prototype.handleMenuSelection.mockClear();
            menu.selectedOption = 1;
            menu.handleMenuSelection();
            expect(BaseMenu.prototype.handleMenuSelection).toHaveBeenCalledTimes(1);
        });

        it('selects Easy when selectedOption is 0', () => {
            menu.selectedOption = 0;
            menu.handleMenuSelection();
            expect(menu.selectedDifficultyIndex).toBe(0);
            expect(mockGame.lives).toBe(7);
            expect(mockGame.selectedDifficulty).toBe('Easy');
            expect(menu.menuOptions).toEqual([
                'Easy - Selected',
                'Normal',
                'Hard',
                'Go Back'
            ]);
        });

        it('selects Hard when selectedOption is 2', () => {
            menu.selectedOption = 2;
            menu.handleMenuSelection();
            expect(menu.selectedDifficultyIndex).toBe(2);
            expect(mockGame.lives).toBe(3);
            expect(mockGame.selectedDifficulty).toBe('Hard');
            expect(menu.menuOptions).toEqual([
                'Easy',
                'Normal',
                'Hard - Selected',
                'Go Back'
            ]);
        });

        it('calls activateMenu(2) when Go Back is chosen', () => {
            menu.selectedOption = 3;
            menu.handleMenuSelection();
            expect(mockGame.menu.main.activateMenu).toHaveBeenCalledWith(2);
        });

        it('does not append "- Selected" to Go Back', () => {
            menu.selectedOption = 3;
            menu.menuOptions[3] = 'Go Back';
            menu.handleMenuSelection();
            expect(menu.menuOptions[3]).toBe('Go Back');
        });
    });

    describe('getSelectedOption()', () => {
        it('returns the current difficulty index', () => {
            menu.setDifficulty('Hard');
            expect(menu.getSelectedOption()).toBe(2);
            menu.setDifficulty('Easy');
            expect(menu.getSelectedOption()).toBe(0);
        });

        it('returns difficultyIndex, not the cursor', () => {
            menu.selectedOption = 3; // cursor on 'Go Back'
            menu.setDifficulty('Easy');
            expect(menu.getSelectedOption()).toBe(0);
        });
    });
});
