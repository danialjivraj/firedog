import { GameOverMenu } from '../../game/menu/gameOverMenu.js';
import { BaseMenu } from '../../game/menu/baseMenu.js';

describe('GameOverMenu', () => {
    let menu, mockGame, ctx;

    beforeEach(() => {
        mockGame = {
            width: 1920,
            height: 689,
            player: { currentState: { deathAnimation: false } },
            notEnoughCoins: false,
            isElyvorgFullyVisible: false,
            coins: 0,
            maxCoinsToFightElyvorg: 999,
            audioHandler: {
                menu: {
                    playSound: jest.fn(),
                    stopSound: jest.fn(),
                }
            },
            menu: {
                main: { activateMenu: jest.fn() },
                pause: { canEscape: true }
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

    describe('draw()', () => {
        it('draws the “Game Over!” overlay when coins are sufficient', () => {
            mockGame.notEnoughCoins = false;
            mockGame.isElyvorgFullyVisible = false;

            menu.draw(ctx);

            expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 1920, 689);
            expect(menu.title).toBe('Game Over!');
            expect(mockGame.menu.pause.canEscape).toBe(false);
            expect(menu.menuOptions).toEqual(['Retry', 'Back to Main Menu']);
        });

        it('draws the “not enough coins” overlay when flagged', () => {
            mockGame.notEnoughCoins = true;

            menu.draw(ctx);

            expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 1920, 689);
            expect(menu.title).toBe("You don't have enough coins!");
            expect(menu.menuOptions).toEqual(['Retry', 'Back to Main Menu']);
        });

        it('inserts the “Retry Final Boss” option when Elyvorg is visible', () => {
            mockGame.isElyvorgFullyVisible = true;

            menu.draw(ctx);

            expect(menu.menuOptions).toEqual([
                'Retry Final Boss',
                'Retry',
                'Back to Main Menu'
            ]);
        });

        it('delegates into BaseMenu.draw()', () => {
            jest.spyOn(BaseMenu.prototype, 'draw');
            menu.draw(ctx);
            expect(BaseMenu.prototype.draw).toHaveBeenCalledWith(ctx);
        });
    });

    describe('handleMenuSelection()', () => {
        beforeEach(() => {
            mockGame.player.currentState.deathAnimation = true;
            menu.menuActive = true;
        });

        it('retries (calls reset) when “Retry” is selected', () => {
            menu.selectedOption = 0; // Retry
            menu.handleMenuSelection();

            expect(mockGame.reset).toHaveBeenCalled();
            expect(menu.menuActive).toBe(false);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionSelectedSound', false, true);
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledTimes(1);
        });

        it('goes back to main when “Back to Main Menu” is selected', () => {
            menu.selectedOption = 1; // Back to Main Menu
            menu.handleMenuSelection();

            expect(mockGame.reset).toHaveBeenCalled();
            expect(mockGame.menu.main.activateMenu).toHaveBeenCalled();
            expect(menu.menuActive).toBe(false);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionSelectedSound', false, true);
        });

        it('retries final boss when visible & selected', () => {
            mockGame.isElyvorgFullyVisible = true;
            menu.draw(ctx);
            menu.selectedOption = 0; // Retry Final Boss

            menu.handleMenuSelection();

            expect(mockGame.reset).toHaveBeenCalled();
            expect(mockGame.coins).toBe(mockGame.maxCoinsToFightElyvorg);
            expect(menu.menuActive).toBe(false);
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionSelectedSound', false, true);
        });

        it('does nothing if neither deathAnimation nor notEnoughCoins is true', () => {
            mockGame.player.currentState.deathAnimation = false;
            mockGame.notEnoughCoins = false;
            menu.selectedOption = 0;

            menu.handleMenuSelection();
            expect(mockGame.reset).not.toHaveBeenCalled();
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
        });

        it('still lets retry/back‑to‑main if notEnoughCoins but no deathAnimation', () => {
            mockGame.player.currentState.deathAnimation = false;
            mockGame.notEnoughCoins = true;
            menu.selectedOption = 0; // Retry

            menu.handleMenuSelection();
            expect(mockGame.reset).toHaveBeenCalled();
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('optionSelectedSound', false, true);
        });
    });
});
