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
            if (selectedOption === 'Retry Final Boss Again') {
                this.game.reset();
                this.game.coins = this.game.maxCoinsToFightElyvorg;
            } else if (selectedOption === 'Retry' || selectedOption === 'Retry Map 6 Again') {
                this.game.reset();
            } else if (selectedOption === 'Back to Main Menu') {
                this.game.reset();
                this.game.menu.main.activateMenu();
            }
            this.menuActive = false;
        }
    }

    draw(context) {
        if (this.game.gameOver && this.game.isElyvorgFullyVisible) {
            this.menuOptions = ['Retry Final Boss Again', 'Retry Map 6 Again', 'Back to Main Menu'];
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
