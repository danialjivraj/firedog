import { BaseMenu } from "./baseMenu.js";

export class GameOverMenu extends BaseMenu {
    constructor(game) {
        super(game, ['Retry', 'Back to Main Menu'], '');
        this.game = game;
        this.positionOffset = 160;
        this.menuInGame = true;
    }

    handleMenuSelection() {
        if (this.game.player.currentState.deathAnimation || this.game.notEnoughCoins) {
            super.handleMenuSelection();
            const selectedOption = this.menuOptions[this.selectedOption];

            if (selectedOption === 'Retry') {
                this.game.reset();
            } else if (selectedOption === 'Back to Main Menu') {
                this.game.reset();
                this.game.menu.main.activateMenu();
            } else if (selectedOption === 'Retry Final Boss') {
                const bossManager = this.game.bossManager;
                const gate = bossManager.getGateForCurrentMap();
                this.game.reset({ preserveTime: true });
                if (gate) {
                    if (typeof gate.minCoins === 'number') {
                        this.game.coins = gate.minCoins;
                    }
                    if (
                        typeof gate.minDistance === 'number' &&
                        this.game.background &&
                        this.game.background.totalDistanceTraveled !== undefined
                    ) {
                        this.game.background.totalDistanceTraveled = gate.minDistance;
                    }
                }
                this.game.notEnoughCoins = false;
            }
            this.menuActive = false;
        }
    }

    draw(context) {
        if (this.game.hasActiveBoss) {
            this.menuOptions = ['Retry Final Boss', 'Retry', 'Back to Main Menu'];
        } else {
            this.menuOptions = ['Retry', 'Back to Main Menu'];
        }

        if (this.game.notEnoughCoins) {
            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            context.fillRect(0, 0, this.game.width, this.game.height);
            this.title = "You don't have enough coins!";
        } else {
            context.fillStyle = 'rgba(0, 0, 0, 0.2)';
            context.fillRect(0, 0, this.game.width, this.game.height);
            this.title = "Game Over!";
        }

        this.game.menu.pause.canEscape = false;

        super.draw(context);
    }
}
