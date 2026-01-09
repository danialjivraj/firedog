import { PauseMenu } from '../../game/menu/pauseMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';

describe('PauseMenu', () => {
    let menu;
    let game;
    let baseSelectSpy;

    beforeEach(() => {
        jest.useFakeTimers();

        baseSelectSpy = jest
            .spyOn(BaseMenu.prototype, 'handleMenuSelection')
            .mockImplementation(() => { });

        game = {
            reset: jest.fn(),
            isPlayerInGame: true,

            cutsceneActive: false,
            currentCutscene: null,

            pauseContext: 'gameplay',
            isEndCutscene: false,

            restartActiveCutscene: jest.fn(),
            exitCutsceneToMainMenu: jest.fn(),
            goToMainMenuWithSavingAnimation: jest.fn(),

            ignoreCutsceneInputUntil: 0,

            audioHandler: {
                mapSoundtrack: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                firedogSFX: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                enemySFX: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                collisionSFX: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                powerUpAndDownSFX: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                cutsceneMusic: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
                cutsceneSFX: { pauseAllSounds: jest.fn(), resumeAllSounds: jest.fn() },
            },

            menu: {
                main: { activateMenu: jest.fn() },
                settings: { activateMenu: jest.fn() },
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
        baseSelectSpy.mockRestore();
        jest.useRealTimers();
    });

    describe('constructor', () => {
        test('initializes menu options, title, and flags', () => {
            expect(menu.menuOptions).toEqual([
                'Resume',
                'Restart',
                'Settings',
                'Back to Main Menu',
            ]);
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
            expect(game.audioHandler.cutsceneSFX.pauseAllSounds).toHaveBeenCalled();

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
            expect(game.audioHandler.cutsceneSFX.resumeAllSounds).toHaveBeenCalled();

            expect(menu.canEscape).toBe(false);
            jest.advanceTimersByTime(1);
            expect(menu.canEscape).toBe(true);
        });

        test('when pausing during story cutscene (not in game), sets pauseContext = storyCutscene', () => {
            game.cutsceneActive = true;
            game.currentCutscene = {};
            game.isPlayerInGame = false;

            menu.togglePause();

            expect(game.pauseContext).toBe('storyCutscene');
        });

        test('when pausing during in-game cutscene, sets pauseContext = inGameCutscene', () => {
            game.cutsceneActive = true;
            game.currentCutscene = {};
            game.isPlayerInGame = true;

            menu.togglePause();

            expect(game.pauseContext).toBe('inGameCutscene');
        });

        test('when pausing during normal gameplay, sets pauseContext = gameplay', () => {
            game.cutsceneActive = false;
            game.currentCutscene = null;
            game.isPlayerInGame = true;

            menu.togglePause();

            expect(game.pauseContext).toBe('gameplay');
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

            expect(baseSelectSpy).toHaveBeenCalled();
            expect(toggleSpy).toHaveBeenCalled();
            expect(game.reset).not.toHaveBeenCalled();
            expect(game.menu.main.activateMenu).not.toHaveBeenCalled();
            expect(menu.menuActive).toBe(false);

            toggleSpy.mockRestore();
        });

        test('Restart: plays select sound, closes menu, toggles pause, then resets game (gameplay context)', () => {
            const toggleSpy = jest.spyOn(menu, 'togglePause');

            game.pauseContext = 'gameplay';
            menu.selectedOption = 1;
            menu.handleMenuSelection();

            expect(baseSelectSpy).toHaveBeenCalled();
            expect(toggleSpy).toHaveBeenCalled();
            expect(game.reset).toHaveBeenCalled();
            expect(game.restartActiveCutscene).not.toHaveBeenCalled();
            expect(menu.menuActive).toBe(false);

            toggleSpy.mockRestore();
        });

        test('Restart: when pauseContext is storyCutscene, restarts active cutscene and does NOT reset game', () => {
            const toggleSpy = jest.spyOn(menu, 'togglePause');

            game.pauseContext = 'storyCutscene';
            menu.isPaused = true;

            menu.selectedOption = 1;
            menu.handleMenuSelection();

            expect(baseSelectSpy).toHaveBeenCalled();
            expect(game.restartActiveCutscene).toHaveBeenCalled();
            expect(toggleSpy).toHaveBeenCalled();
            expect(game.reset).not.toHaveBeenCalled();

            toggleSpy.mockRestore();
        });

        test('Restart: when pauseContext is inGameCutscene, uses in-game restart (reset) and does NOT restart cutscene', () => {
            const toggleSpy = jest.spyOn(menu, 'togglePause');

            game.pauseContext = 'inGameCutscene';
            menu.isPaused = true;

            menu.selectedOption = 1;
            menu.handleMenuSelection();

            expect(baseSelectSpy).toHaveBeenCalled();
            expect(toggleSpy).toHaveBeenCalled();
            expect(game.reset).toHaveBeenCalled();
            expect(game.restartActiveCutscene).not.toHaveBeenCalled();

            toggleSpy.mockRestore();
        });

        test('Settings: plays select sound, closes menu, and opens settings in-game', () => {
            menu.selectedOption = 2;
            menu.handleMenuSelection();

            expect(baseSelectSpy).toHaveBeenCalled();
            expect(game.menu.settings.activateMenu).toHaveBeenCalledWith({
                inGame: true,
                selectedOption: 0,
                returnMenu: "pause",
                returnSelectedOption: 2,
            });
            expect(menu.menuActive).toBe(false);
        });

        test('Back to Main Menu (gameplay): closes menu, toggles pause if needed, resets, and activates main menu', () => {
            const toggleSpy = jest.spyOn(menu, 'togglePause');

            game.pauseContext = 'gameplay';
            menu.isPaused = true;
            menu.selectedOption = 3;

            menu.handleMenuSelection();

            expect(baseSelectSpy).toHaveBeenCalled();
            expect(game.exitCutsceneToMainMenu).not.toHaveBeenCalled();
            expect(toggleSpy).toHaveBeenCalled();
            expect(game.isPlayerInGame).toBe(false);
            expect(game.reset).toHaveBeenCalled();
            expect(game.goToMainMenuWithSavingAnimation).not.toHaveBeenCalled();
            expect(game.menu.main.activateMenu).toHaveBeenCalled();
            expect(menu.menuActive).toBe(false);

            toggleSpy.mockRestore();
        });

        test('Back to Main Menu (story cutscene, not end cutscene): exits cutscene, then activates main menu (no saving animation)', () => {
            const toggleSpy = jest.spyOn(menu, 'togglePause');

            game.pauseContext = 'storyCutscene';
            game.isEndCutscene = false;

            menu.isPaused = true;
            menu.selectedOption = 3;

            menu.handleMenuSelection();

            expect(baseSelectSpy).toHaveBeenCalled();
            expect(game.exitCutsceneToMainMenu).toHaveBeenCalled();

            expect(toggleSpy).toHaveBeenCalled();
            expect(game.isPlayerInGame).toBe(false);
            expect(game.reset).toHaveBeenCalled();

            expect(game.goToMainMenuWithSavingAnimation).not.toHaveBeenCalled();
            expect(game.menu.main.activateMenu).toHaveBeenCalled();

            toggleSpy.mockRestore();
        });

        test('Back to Main Menu from end story cutscene triggers saving animation instead of direct activateMenu', () => {
            menu.isPaused = true;
            game.pauseContext = 'storyCutscene';
            game.isEndCutscene = true;

            menu.selectedOption = 3;
            menu.handleMenuSelection();

            expect(game.exitCutsceneToMainMenu).toHaveBeenCalled();
            expect(game.reset).toHaveBeenCalled();
            expect(game.isPlayerInGame).toBe(false);
            expect(game.goToMainMenuWithSavingAnimation).toHaveBeenCalledWith(4000);
            expect(game.menu.main.activateMenu).not.toHaveBeenCalled();
        });
    });
});
