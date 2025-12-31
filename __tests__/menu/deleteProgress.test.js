import { DeleteProgress, DeleteProgress2 } from '../../game/menu/deleteProgress.js';
import { fadeIn } from '../../game/animations/fading.js';

jest.mock('../../game/animations/fading.js', () => ({
    fadeIn: jest.fn(),
}));

describe('DeleteProgress', () => {
    let menu, mockGame;

    beforeAll(() => {
        document.body.innerHTML = `
      <img id="mainmenubackground" />
    `;
    });

    beforeEach(() => {
        mockGame = {
            menu: {
                deleteProgress2: { activateMenu: jest.fn() },
                main: { activateMenu: jest.fn() },
            },
            audioHandler: {
                menu: {
                    playSound: jest.fn(),
                },
            },
            currentMenu: null,
        };

        menu = new DeleteProgress(mockGame);
        menu.activateMenu();
        jest.clearAllMocks();
    });

    it('initializes with the right title, options and default selectedOption', () => {
        expect(menu.title).toBe('Are you sure you want to delete your game progress?');
        expect(menu.menuOptions).toEqual(['Yes', 'No']);
        expect(menu.selectedOption).toBe(0);
    });

    it('“Yes” branch: switches to deleteProgress2 and deactivates itself', () => {
        menu.selectedOption = 0; // Yes
        menu.handleMenuSelection();

        expect(mockGame.audioHandler.menu.playSound)
            .toHaveBeenCalledWith('optionSelectedSound', false, true);

        expect(mockGame.currentMenu).toBe(mockGame.menu.deleteProgress2);
        expect(menu.menuActive).toBe(false);
        expect(mockGame.menu.deleteProgress2.selectedOption).toBe(1);
    });

    it('“No” branch: returns to main menu at index 5', () => {
        menu.selectedOption = 1; // No
        menu.handleMenuSelection();

        expect(mockGame.audioHandler.menu.playSound)
            .toHaveBeenCalledWith('optionSelectedSound', false, true);

        expect(menu.menuActive).toBe(false);
        expect(mockGame.menu.main.activateMenu).toHaveBeenCalledWith(5);
    });
});

describe('DeleteProgress2', () => {
    let menu2, mockGame;

    beforeAll(() => {
        document.body.innerHTML = `
      <img id="mainmenubackground" />
    `;
    });

    beforeEach(() => {
        mockGame = {
            canvas: {},
            canSelect: true,
            menu: {
                main: { activateMenu: jest.fn() },
            },
            clearSavedData: jest.fn(),
            audioHandler: {
                menu: {
                    stopSound: jest.fn(),
                    playSound: jest.fn(),
                },
            },
        };

        menu2 = new DeleteProgress2(mockGame);
        mockGame.menu.deleteProgress2 = menu2;
        jest.clearAllMocks();
    });

    it('initializes with the right title, options, default selectedOption and flag', () => {
        expect(menu2.title).toBe('All your progress will be lost!');
        expect(menu2.menuOptions).toEqual([
            'Yes, I want to delete my game progress',
            'No, I do not want to delete my game progress'
        ]);
        expect(menu2.selectedOption).toBe(1);
        expect(menu2.showSavingSprite).toBe(false);
    });

    it('deleteProgessionAnimation: toggles flags, calls fadeIn, then restores on callback', () => {
        menu2.deleteProgessionAnimation();

        expect(mockGame.canSelect).toBe(false);
        expect(mockGame.menu.deleteProgress2.showSavingSprite).toBe(true);
        expect(fadeIn).toHaveBeenCalledWith(
            mockGame.canvas,
            4000,
            expect.any(Function)
        );

        const callback = fadeIn.mock.calls[0][2];
        callback();
        expect(mockGame.canSelect).toBe(true);
        expect(mockGame.menu.deleteProgress2.showSavingSprite).toBe(false);
    });

    it('“Yes” branch: clears data, runs animation, jumps to main[0], stops & restarts soundtrack', () => {
        menu2.selectedOption = 0; // Yes
        menu2.handleMenuSelection();

        expect(mockGame.audioHandler.menu.playSound.mock.calls[0])
            .toEqual(['optionSelectedSound', false, true]);

        expect(mockGame.clearSavedData).toHaveBeenCalled();
        expect(fadeIn).toHaveBeenCalled();
        expect(mockGame.menu.main.activateMenu).toHaveBeenCalledWith(0);
        expect(mockGame.audioHandler.menu.stopSound).toHaveBeenCalledWith('soundtrack');
        expect(mockGame.audioHandler.menu.playSound)
            .toHaveBeenCalledWith('soundtrack');
    });

    it('“No” branch: returns to main[5] without clearing or restarting soundtrack', () => {
        menu2.selectedOption = 1; // No
        menu2.handleMenuSelection();

        expect(mockGame.audioHandler.menu.playSound)
            .toHaveBeenCalledWith('optionSelectedSound', false, true);

        expect(mockGame.clearSavedData).not.toHaveBeenCalled();
        expect(mockGame.menu.main.activateMenu).toHaveBeenCalledWith(5);
        expect(mockGame.audioHandler.menu.stopSound).not.toHaveBeenCalled();
        expect(mockGame.audioHandler.menu.playSound)
            .not.toHaveBeenCalledWith('soundtrack');
    });
});
