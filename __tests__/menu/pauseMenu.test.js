import { PauseMenu } from '../../game/menu/pauseMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';

describe('PauseMenu', () => {
    let menu;
    let game;

    beforeEach(() => {
        jest.useFakeTimers();

        jest.spyOn(BaseMenu.prototype, 'handleMenuSelection').mockImplementation(() => { });

        game = {
            reset: jest.fn(),
            isPlayerInGame: true,
            audioHandler: {
                mapSoundtrack: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                firedogSFX: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                enemySFX: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                collisionSFX: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                powerUpAndDownSFX: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                cutsceneMusic: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
            },
            menu: {
                main: { activateMenu: jest.fn() },
                audioSettings: { activateMenu: jest.fn() },
            },
        };

        menu = new PauseMenu(game);
        game.menu.pause = menu;

        jest.spyOn(menu, 'activateMenu').mockImplementation(() => { });
        jest.spyOn(menu, 'closeAllMenus').mockImplementation(() => { });

        menu.activateMenu();

        jest.clearAllMocks();
    });

    afterEach(() => {
        BaseMenu.prototype.handleMenuSelection.mockRestore();
        jest.useRealTimers();
    });

    describe('constructor', () => {
        test('initializes menu options, title, and flags', () => {
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
        test('first call pauses game, pauses all sounds, and re-enables escape after 1ms', () => {
            menu.togglePause();

            expect(menu.isPaused).toBe(true);
            expect(menu.selectedOption).toBe(0);
            expect(menu.activateMenu).toHaveBeenCalled();

            expect(game.audioHandler.mapSoundtrack.pauseAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.firedogSFX.pauseAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.enemySFX.pauseAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.collisionSFX.pauseAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.powerUpAndDownSFX.pauseAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneMusic.pauseAllSounds).toHaveBeenCalled();

            expect(menu.canEscape).toBe(false);
            jest.advanceTimersByTime(1);
            expect(menu.canEscape).toBe(true);
        });

        test('second call resumes game, resumes all sounds, closes all menus, and re-enables escape after 1ms', () => {
            menu.togglePause();
            jest.runOnlyPendingTimers();

            menu.togglePause();

            expect(menu.isPaused).toBe(false);
            expect(menu.selectedOption).toBe(0);
            expect(menu.closeAllMenus).toHaveBeenCalled();

            expect(game.audioHandler.mapSoundtrack.resumeAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.firedogSFX.resumeAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.enemySFX.resumeAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.collisionSFX.resumeAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.powerUpAndDownSFX.resumeAllSounds).toHaveBeenCalled();
            expect(game.audioHandler.cutsceneMusic.resumeAllSounds).toHaveBeenCalled();

            expect(menu.canEscape).toBe(false);
            jest.advanceTimersByTime(1);
            expect(menu.canEscape).toBe(true);
        });
    });

    describe('handleMenuSelection()', () => {
        beforeEach(() => {
            menu.menuActive = true;
        });

        test('Resume: plays select sound, closes menu, and toggles pause only', () => {
            const toggleSpy = jest.spyOn(menu, 'togglePause');

            menu.selectedOption = 0;
            menu.handleMenuSelection();

            expect(BaseMenu.prototype.handleMenuSelection).toHaveBeenCalled();
            expect(toggleSpy).toHaveBeenCalled();
            expect(game.reset).not.toHaveBeenCalled();
            expect(game.menu.main.activateMenu).not.toHaveBeenCalled();
            expect(game.menu.audioSettings.activateMenu).not.toHaveBeenCalled();
            expect(menu.menuActive).toBe(false);

            toggleSpy.mockRestore();
        });

        test('Restart: plays select sound, closes menu, toggles pause, then resets game', () => {
            const toggleSpy = jest.spyOn(menu, 'togglePause');

            menu.selectedOption = 1;
            menu.handleMenuSelection();

            expect(BaseMenu.prototype.handleMenuSelection).toHaveBeenCalled();
            expect(toggleSpy).toHaveBeenCalled();
            expect(game.reset).toHaveBeenCalled();
            expect(menu.menuActive).toBe(false);

            toggleSpy.mockRestore();
        });

        test('Audio Settings: plays select sound, closes menu, and opens audio settings in-game', () => {
            menu.selectedOption = 2;
            menu.handleMenuSelection();

            expect(BaseMenu.prototype.handleMenuSelection).toHaveBeenCalled();
            expect(game.menu.audioSettings.activateMenu).toHaveBeenCalledWith({ inGame: true });
            expect(menu.menuActive).toBe(false);
        });

        test('Back to Main Menu: plays select sound, closes menu, toggles pause, resets, and activates main menu', () => {
            const toggleSpy = jest.spyOn(menu, 'togglePause');

            menu.selectedOption = 3;
            menu.handleMenuSelection();

            expect(BaseMenu.prototype.handleMenuSelection).toHaveBeenCalled();
            expect(toggleSpy).toHaveBeenCalled();
            expect(game.isPlayerInGame).toBe(false);
            expect(game.reset).toHaveBeenCalled();
            expect(game.menu.main.activateMenu).toHaveBeenCalled();
            expect(menu.menuActive).toBe(false);

            toggleSpy.mockRestore();
        });
    });
});
