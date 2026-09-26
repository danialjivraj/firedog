import { GameOverMenu } from '../../game/menu/gameOverMenu.js';
import { DomMenu } from '../../game/menu/dom/domMenu.js';

describe('GameOverMenu', () => {
    let menu, mockGame, ctx;

    beforeEach(() => {
        mockGame = {
            width: 1920,
            height: 689,

            gameOver: false,
            notEnoughCoins: false,
            hasActiveBoss: false,

            coins: 0,
            player: { currentState: { deathAnimation: false } },

            background: { totalDistanceTraveled: 0 },

            audioHandler: {
                menu: {
                    playSound: jest.fn(),
                    stopSound: jest.fn(),
                },
            },

            menu: {
                main: { activateMenu: jest.fn() },
                pause: { canEscape: true },
                settings: { activateMenu: jest.fn() },
            },

            bossManager: {
                getGateForCurrentMap: jest.fn().mockReturnValue({
                    minCoins: 999,
                    minDistance: 1234,
                }),
            },

            reset: jest.fn(),
        };

        ctx = {
            save: jest.fn(),
            restore: jest.fn(),
            fillRect: jest.fn(),
            fillText: jest.fn(),
            measureText: jest.fn().mockReturnValue({ width: 10 }),
            drawImage: jest.fn(),
            fillStyle: '',
            font: '',
            strokeText: jest.fn(),
            strokeStyle: '',
            lineWidth: 0,
            textAlign: '',
            globalAlpha: 1,
            shadowColor: '',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
        };

        menu = new GameOverMenu(mockGame);
        menu.activateMenu();
        jest.clearAllMocks();
    });

    describe('unbound-keybind badge', () => {
        const badgeOn = (label) => {
            menu.ensurePanel();
            menu.syncContent();
            const row = menu.dom.rows[menu.menuOptions.indexOf(label)];
            return !row.querySelector('.menu-option__badge').hidden;
        };

        it('flags "Settings" only while a keybind two levels down is unbound', () => {
            mockGame.menu.controlsSettings = { unboundCount: () => 0 };
            expect(badgeOn('Settings')).toBe(false);

            mockGame.menu.controlsSettings = { unboundCount: () => 2 };
            expect(badgeOn('Settings')).toBe(true);
            expect(badgeOn('Retry')).toBe(false);
        });

        it('keeps flagging "Settings" once the boss retry row shifts its index', () => {
            mockGame.menu.controlsSettings = { unboundCount: () => 1 };
            mockGame.hasActiveBoss = true;
            menu.activateMenu();

            expect(menu.menuOptions).toEqual(['Retry Final Boss', 'Retry', 'Settings', 'Back to Main Menu']);
            expect(badgeOn('Settings')).toBe(true);
            expect(badgeOn('Retry Final Boss')).toBe(false);
        });

        it('stays clear when Controls Settings has not been built yet', () => {
            delete mockGame.menu.controlsSettings;
            expect(badgeOn('Settings')).toBe(false);
        });
    });

    describe('activateMenu()', () => {
        it('sets title to "Game Over!" when coins are sufficient', () => {
            mockGame.notEnoughCoins = false;
            mockGame.hasActiveBoss = false;
            menu.activateMenu();
            expect(menu.title).toBe('Game Over!');
            expect(menu.menuOptions).toEqual(['Retry', 'Settings', 'Back to Main Menu']);
        });

        it('sets title to "not enough coins" when flagged', () => {
            mockGame.notEnoughCoins = true;
            mockGame.hasActiveBoss = false;
            menu.activateMenu();
            expect(menu.title).toBe("You don't have enough coins!");
            expect(menu.menuOptions).toEqual(['Retry', 'Settings', 'Back to Main Menu']);
        });

        it('inserts the "Retry Final Boss" option when a boss is active', () => {
            mockGame.hasActiveBoss = true;
            menu.activateMenu();
            expect(menu.menuOptions).toEqual([
                'Retry Final Boss',
                'Retry',
                'Settings',
                'Back to Main Menu',
            ]);
        });
    });

    describe('draw()', () => {
        it('disables canEscape and delegates to DomMenu.draw()', () => {
            mockGame.gameOver = true;
            jest.spyOn(DomMenu.prototype, 'draw');
            menu.draw(ctx);
            expect(mockGame.menu.pause.canEscape).toBe(false);
            expect(DomMenu.prototype.draw).toHaveBeenCalledWith(ctx);
        });

        it('renders with the red danger chrome, like the delete confirmations', () => {
            menu.activateMenu();

            expect(menu.panel.classList.contains('menu-panel--danger')).toBe(true);
        });
    });

    describe('handleMenuSelection()', () => {
        beforeEach(() => {
            mockGame.player.currentState.deathAnimation = true;
            menu.menuActive = true;
        });

        it('retries (calls reset) when "Retry" is selected', () => {
            menu.selectedOption = 0; // Retry
            menu.handleMenuSelection();

            expect(mockGame.reset).toHaveBeenCalled();
            expect(menu.menuActive).toBe(false);
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
                'optionSelectedSound',
                false,
                true
            );
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledTimes(1);
        });

        it('goes back to main when "Back to Main Menu" is selected', () => {
            menu.selectedOption = 2; // Back to Main Menu
            menu.handleMenuSelection();

            expect(mockGame.reset).toHaveBeenCalled();
            expect(mockGame.menu.main.activateMenu).toHaveBeenCalled();
            expect(menu.menuActive).toBe(false);
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
                'optionSelectedSound',
                false,
                true
            );
        });

        it('retries final boss using gate data and preserves time', () => {
            mockGame.hasActiveBoss = true;
            menu.activateMenu();
            menu.selectedOption = 0; // Retry Final Boss

            menu.handleMenuSelection();

            expect(mockGame.bossManager.getGateForCurrentMap).toHaveBeenCalled();
            expect(mockGame.reset).toHaveBeenCalledWith({ preserveTime: true });
            expect(mockGame.coins).toBe(999);
            expect(mockGame.background.totalDistanceTraveled).toBe(1234);
            expect(mockGame.notEnoughCoins).toBe(false);
            expect(menu.menuActive).toBe(false);
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
                'optionSelectedSound',
                false,
                true
            );
        });

        it('does nothing if neither deathAnimation nor notEnoughCoins is true', () => {
            mockGame.player.currentState.deathAnimation = false;
            mockGame.notEnoughCoins = false;
            menu.selectedOption = 0;

            menu.handleMenuSelection();
            expect(mockGame.reset).not.toHaveBeenCalled();
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
        });

        it('still lets retry/back-to-main if notEnoughCoins but no deathAnimation', () => {
            mockGame.player.currentState.deathAnimation = false;
            mockGame.notEnoughCoins = true;
            menu.selectedOption = 0; // Retry

            menu.handleMenuSelection();
            expect(mockGame.reset).toHaveBeenCalled();
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith(
                'optionSelectedSound',
                false,
                true
            );
        });
    });
});
