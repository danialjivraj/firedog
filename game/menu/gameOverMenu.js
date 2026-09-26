import { DomMenu } from "./dom/domMenu.js";
import { hasUnboundKeybind } from "./dom/menuBadges.js";

export class GameOverMenu extends DomMenu {
    constructor(game) {
        super(game, ['Retry', 'Settings', 'Back to Main Menu'], '');
        this.menuInGame = true;
        this.panelModifier = 'menu-panel--danger menu-panel--gameover';
    }

    activateMenu(selectedOption = 0) {
        this.menuOptions = this.game.hasActiveBoss
            ? ['Retry Final Boss', 'Retry', 'Settings', 'Back to Main Menu']
            : ['Retry', 'Settings', 'Back to Main Menu'];

        this.title = this.game.notEnoughCoins
            ? "You don't have enough coins!"
            : "Game Over!";

        super.activateMenu(selectedOption);
    }

    getOptionBadge(index) {
        return this.menuOptions[index] === 'Settings' && hasUnboundKeybind(this.game);
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
                this.game.openMenu(this.game.menu.settings, {
                    inGame: true,
                    selectedOption: 0,
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
                        this.game.background._oneShotTriggered = true;
                    }
                }

                this.game.notEnoughCoins = false;
                return;
            }
        }
    }

    draw(context) {
        this.game.menu.pause.canEscape = false;
        super.draw(context);
    }
}
