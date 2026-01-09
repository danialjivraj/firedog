import { BaseMenu } from "./baseMenu.js";

export class GameOverMenu extends BaseMenu {
    constructor(game) {
        super(game, ['Retry', 'Settings', 'Back to Main Menu'], '');
        this.game = game;
        this.positionOffset = 160;
        this.menuInGame = true;
    }

    handleMenuSelection() {
        if (this.game.player.currentState.deathAnimation || this.game.notEnoughCoins) {
            super.handleMenuSelection();
            const selectedOption = this.menuOptions[this.selectedOption];

            if (selectedOption === 'Retry') {
                this.closeMenu();
                this.game.reset();
                return;
            }

            if (selectedOption === 'Settings') {
                this.game.menu.settings.activateMenu({
                    inGame: true,
                    selectedOption: 0,
                    returnMenu: 'gameOver',
                    returnSelectedOption: this.menuOptions.indexOf('Settings'),
                });
                return;
            }

            if (selectedOption === 'Back to Main Menu') {
                this.closeMenu();
                this.game.reset();
                this.game.menu.main.activateMenu();
                return;
            }

            if (selectedOption === 'Retry Final Boss') {
                const gate = this.game.bossManager.getGateForCurrentMap();
                this.closeMenu();
                this.game.reset({ preserveTime: true });

                if (gate) {
                    this.game.coins = gate.minCoins;
                    if (this.game.background) {
                        this.game.background.totalDistanceTraveled = gate.minDistance;
                    }
                }

                this.game.notEnoughCoins = false;
                return;
            }
        }
    }

    draw(context) {
        if (this.game.hasActiveBoss) {
            this.menuOptions = ['Retry Final Boss', 'Retry', 'Settings', 'Back to Main Menu'];
        } else {
            this.menuOptions = ['Retry', 'Settings', 'Back to Main Menu'];
        }

        this.title = this.game.notEnoughCoins
            ? "You don't have enough coins!"
            : "Game Over!";

        this.game.menu.pause.canEscape = false;

        super.draw(context);
    }
}
