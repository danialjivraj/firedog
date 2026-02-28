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
            canSelect: true,
            canvas: {},

            menu: {
                deleteProgress2: {
                    selectedOption: 0,
                    menuActive: false,
                    activateMenu: jest.fn(function (arg = 0) {
                        this.selectedOption = arg;
                        this.menuActive = true;
                    }),
                },
                main: { activateMenu: jest.fn(), menuActive: false },
                settings: { activateMenu: jest.fn(), menuActive: false },
            },

            audioHandler: {
                menu: {
                    playSound: jest.fn(),
                    stopSound: jest.fn(),
                },
            },

            currentMenu: null,
        };

        const deactivateAll = () => {
            for (const k in mockGame.menu) {
                if (mockGame.menu[k]) mockGame.menu[k].menuActive = false;
            }
        };

        mockGame.openMenu = jest.fn((targetMenu, arg = 0) => {
            deactivateAll();

            if (targetMenu && typeof targetMenu.activateMenu === 'function') {
                targetMenu.activateMenu(arg);
            } else if (targetMenu) {
                targetMenu.selectedOption = arg;
                targetMenu.menuActive = true;
            }

            if (targetMenu) targetMenu.menuActive = true;
            mockGame.currentMenu = targetMenu;
        });

        mockGame.goBackMenu = jest.fn(() => {
            deactivateAll();

            if (mockGame.menu.settings && typeof mockGame.menu.settings.activateMenu === 'function') {
                mockGame.menu.settings.activateMenu(4);
            }
            mockGame.menu.settings.menuActive = true;
            mockGame.currentMenu = mockGame.menu.settings;
        });

        menu = new DeleteProgress(mockGame);
        mockGame.menu.deleteProgress = menu;

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

        expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
            'optionSelectedSound',
            false,
            true
        );

        expect(mockGame.openMenu).toHaveBeenCalledWith(mockGame.menu.deleteProgress2, 1);

        expect(mockGame.currentMenu).toBe(mockGame.menu.deleteProgress2);
        expect(menu.menuActive).toBe(false);

        expect(mockGame.menu.deleteProgress2.selectedOption).toBe(1);

        expect(mockGame.menu.settings.activateMenu).not.toHaveBeenCalled();
    });

    it('“No” branch: returns to settings menu at index 4', () => {
        menu.selectedOption = 1; // No
        menu.handleMenuSelection();

        expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
            'optionSelectedSound',
            false,
            true
        );

        expect(mockGame.goBackMenu).toHaveBeenCalledTimes(1);
        expect(mockGame.menu.settings.activateMenu).toHaveBeenCalledWith(4);

        expect(menu.menuActive).toBe(false);
        expect(mockGame.menu.main.activateMenu).not.toHaveBeenCalled();
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
                main: { activateMenu: jest.fn(), menuActive: false },
                settings: { activateMenu: jest.fn(), menuActive: false },
            },

            clearSavedData: jest.fn(),

            audioHandler: {
                menu: {
                    stopSound: jest.fn(),
                    playSound: jest.fn(),
                },
            },

            currentMenu: null,
        };

        const deactivateAll = () => {
            for (const k in mockGame.menu) {
                if (mockGame.menu[k]) mockGame.menu[k].menuActive = false;
            }
        };

        mockGame.setMenuRoot = jest.fn((targetMenu, arg = 0) => {
            deactivateAll();

            if (targetMenu && typeof targetMenu.activateMenu === 'function') {
                targetMenu.activateMenu(arg);
            }

            if (targetMenu) targetMenu.menuActive = true;
            mockGame.currentMenu = targetMenu;
        });

        mockGame.goBackMenu = jest.fn(() => {
            deactivateAll();

            mockGame.menu.settings.activateMenu(4);
            mockGame.menu.settings.menuActive = true;
            mockGame.currentMenu = mockGame.menu.settings;
        });

        menu2 = new DeleteProgress2(mockGame);
        mockGame.menu.deleteProgress2 = menu2;

        jest.clearAllMocks();
    });

    it('initializes with the right title, options, default selectedOption and flag', () => {
        expect(menu2.title).toBe('All your progress will be lost!');
        expect(menu2.menuOptions).toEqual([
            'Yes, I want to delete my game progress',
            'No, I do not want to delete my game progress',
        ]);
        expect(menu2.selectedOption).toBe(1);
        expect(menu2.showSavingSprite).toBe(false);
    });

    it('deleteProgessionAnimation: toggles flags, calls fadeIn, then restores on callback', () => {
        menu2.deleteProgessionAnimation();

        expect(mockGame.canSelect).toBe(false);
        expect(mockGame.menu.deleteProgress2.showSavingSprite).toBe(true);

        expect(fadeIn).toHaveBeenCalledWith(mockGame.canvas, 4000, expect.any(Function));

        const callback = fadeIn.mock.calls[0][2];
        callback();

        expect(mockGame.canSelect).toBe(true);
        expect(mockGame.menu.deleteProgress2.showSavingSprite).toBe(false);
    });

    it('“Yes” branch: clears data, runs animation, jumps to main[0], stops & restarts criminalitySoundtrack', () => {
        menu2.selectedOption = 0; // Yes
        menu2.handleMenuSelection();

        expect(mockGame.audioHandler.menu.playSound.mock.calls[0]).toEqual([
            'optionSelectedSound',
            false,
            true,
        ]);

        expect(mockGame.clearSavedData).toHaveBeenCalled();
        expect(fadeIn).toHaveBeenCalled();

        expect(mockGame.setMenuRoot).toHaveBeenCalledWith(mockGame.menu.main, 0);
        expect(mockGame.menu.main.activateMenu).toHaveBeenCalledWith(0);

        expect(mockGame.audioHandler.menu.stopSound).toHaveBeenCalledWith('criminalitySoundtrack');
        expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('criminalitySoundtrack');

        expect(mockGame.menu.settings.activateMenu).not.toHaveBeenCalled();
    });

    it('“No” branch: returns to settings[4] without clearing or restarting criminalitySoundtrack', () => {
        menu2.selectedOption = 1; // No
        menu2.handleMenuSelection();

        expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
            'optionSelectedSound',
            false,
            true
        );

        expect(mockGame.clearSavedData).not.toHaveBeenCalled();

        expect(mockGame.goBackMenu).toHaveBeenCalledTimes(1);
        expect(mockGame.menu.settings.activateMenu).toHaveBeenCalledWith(4);

        expect(mockGame.menu.main.activateMenu).not.toHaveBeenCalled();

        expect(mockGame.audioHandler.menu.stopSound).not.toHaveBeenCalled();
        expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalledWith('criminalitySoundtrack');
    });
});