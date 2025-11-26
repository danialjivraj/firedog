import { PauseMenu } from '../../game/menu/pauseMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';

jest.useFakeTimers();

describe('PauseMenu', () => {
    let menu;
    let mockGame;

    beforeEach(() => {
        jest.spyOn(BaseMenu.prototype, 'handleMenuSelection').mockImplementation(() => { });

        mockGame = {
            reset: jest.fn(),
            audioHandler: {
                mapSoundtrack: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                firedogSFX: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                enemySFX: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                collisionSFX: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                powerUpAndDownSFX: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                cutsceneMusic: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
            },
            menu: {
                ingameAudioSettings: { activateMenu: jest.fn() },
                main: { activateMenu: jest.fn() },
            }
        };

        menu = new PauseMenu(mockGame);
        mockGame.menu.pause = menu;

        jest.spyOn(menu, 'activateMenu').mockImplementation(() => { });
        jest.spyOn(menu, 'closeAllMenus').mockImplementation(() => { });

        menu.activateMenu();
        jest.clearAllMocks();
    });

    afterEach(() => {
        BaseMenu.prototype.handleMenuSelection.mockRestore();
    });

    describe('constructor', () => {
        it('sets up base menu options, title, and defaults', () => {
            expect(menu.menuOptions).toEqual(['Resume', 'Restart', 'Audio Settings', 'Back to Main Menu']);
            expect(menu.title).toBe('Paused');
            expect(menu.positionOffset).toBe(180);
            expect(menu.selectedOption).toBe(0);
            expect(menu.isPaused).toBe(false);
            expect(menu.menuInGame).toBe(true);
            expect(menu.canEscape).toBe(false);
        });
    });

    describe('togglePause()', () => {
        it('pauses the game on first call', () => {
            menu.togglePause();

            expect(menu.isPaused).toBe(true);
            expect(menu.selectedOption).toBe(0);
            expect(menu.activateMenu).toHaveBeenCalled();

            // all sounds paused
            expect(mockGame.audioHandler.mapSoundtrack.pauseAllSounds).toHaveBeenCalled();
            expect(mockGame.audioHandler.firedogSFX.pauseAllSounds).toHaveBeenCalled();
            expect(mockGame.audioHandler.enemySFX.pauseAllSounds).toHaveBeenCalled();
            expect(mockGame.audioHandler.collisionSFX.pauseAllSounds).toHaveBeenCalled();
            expect(mockGame.audioHandler.powerUpAndDownSFX.pauseAllSounds).toHaveBeenCalled();
            expect(mockGame.audioHandler.cutsceneMusic.pauseAllSounds).toHaveBeenCalled();

            expect(menu.canEscape).toBe(false);
            jest.advanceTimersByTime(1);
            expect(menu.canEscape).toBe(true);
        });

        it('resumes the game on second call', () => {
            menu.togglePause();
            jest.runAllTimers();

            menu.togglePause();

            expect(menu.isPaused).toBe(false);
            expect(menu.selectedOption).toBe(0);
            expect(menu.closeAllMenus).toHaveBeenCalled();

            // all sounds resumed
            expect(mockGame.audioHandler.mapSoundtrack.resumeAllSounds).toHaveBeenCalled();
            expect(mockGame.audioHandler.firedogSFX.resumeAllSounds).toHaveBeenCalled();
            expect(mockGame.audioHandler.enemySFX.resumeAllSounds).toHaveBeenCalled();
            expect(mockGame.audioHandler.collisionSFX.resumeAllSounds).toHaveBeenCalled();
            expect(mockGame.audioHandler.powerUpAndDownSFX.resumeAllSounds).toHaveBeenCalled();
            expect(mockGame.audioHandler.cutsceneMusic.resumeAllSounds).toHaveBeenCalled();

            expect(menu.canEscape).toBe(false);
            jest.advanceTimersByTime(1);
            expect(menu.canEscape).toBe(true);
        });
    });

    describe('handleMenuSelection()', () => {
        beforeEach(() => {
            menu.menuActive = true;
        });

        it('“Resume” toggles pause only', () => {
            jest.spyOn(menu, 'togglePause');
            menu.selectedOption = 0; // Resume

            menu.handleMenuSelection();

            expect(BaseMenu.prototype.handleMenuSelection).toHaveBeenCalled();
            expect(menu.togglePause).toHaveBeenCalled();
            expect(mockGame.reset).not.toHaveBeenCalled();
            expect(menu.menuActive).toBe(false);
        });

        it('“Restart” toggles pause and resets the game', () => {
            jest.spyOn(menu, 'togglePause');
            menu.selectedOption = 1; // Restart

            menu.handleMenuSelection();

            expect(menu.togglePause).toHaveBeenCalled();
            expect(mockGame.reset).toHaveBeenCalled();
            expect(menu.menuActive).toBe(false);
        });

        it('“Audio Settings” opens the in‐game audio menu', () => {
            menu.selectedOption = 2; // Audio Settings

            menu.handleMenuSelection();

            expect(BaseMenu.prototype.handleMenuSelection).toHaveBeenCalled();
            expect(mockGame.menu.ingameAudioSettings.activateMenu).toHaveBeenCalled();
            expect(menu.menuActive).toBe(false);
        });

        it('“Back to Main Menu” toggles pause, resets, and goes to main menu', () => {
            jest.spyOn(menu, 'togglePause');
            menu.selectedOption = 3; // Back to Main Menu

            menu.handleMenuSelection();

            expect(menu.togglePause).toHaveBeenCalled();
            expect(mockGame.reset).toHaveBeenCalled();
            expect(mockGame.menu.main.activateMenu).toHaveBeenCalled();
            expect(menu.menuActive).toBe(false);
        });
    });
});
