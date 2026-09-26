import { DomMenu } from './dom/domMenu.js';
import { hasUnboundKeybind } from './dom/menuBadges.js';
import { DeleteProgressAnimation, DeleteProgressBookAnimation, SavingAnimation, SavingBookAnimation } from '../animations/savingAnimation.js';

const TARGETS = {
    'Play': 'forestMap',
    'Wardrobe': 'wardrobe',
    'Records': 'records',
    'How to Play': 'howToPlay',
    'Settings': 'settings',
};

export class MainMenu extends DomMenu {
    constructor(game) {
        super(game, [...Object.keys(TARGETS), 'Exit'], 'Main Menu');
        this.showSavingSprite = false;
        this.savingAnimation = new SavingAnimation(this.game);
        this.savingBookAnimation = new SavingBookAnimation(this.game);
        this.deleteProgressAnimation = new DeleteProgressAnimation(this.game);
        this.deleteProgressBookAnimation = new DeleteProgressBookAnimation(this.game);
    }

    getOptionBadge(index) {
        return this.menuOptions[index] === 'Settings' && hasUnboundKeybind(this.game);
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];
        if (!this.game.canSelect) return;

        super.handleMenuSelection();

        if (selectedOption === 'Exit') {
            window.electronAPI.quitApp();
            return;
        }

        if (selectedOption === 'Play') {
            this.game.audioHandler.menu.playSound('mapOpening', false, true);
        }

        this.game.openMenu(this.game.menu[TARGETS[selectedOption]], 0);
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.game.menu.deleteProgress2.showSavingSprite) {
            this.deleteProgressAnimation.update(deltaTime);
            this.deleteProgressBookAnimation.update(deltaTime);
        } else if (this.showSavingSprite) {
            this.savingAnimation.update(deltaTime);
            this.savingBookAnimation.update(deltaTime);
        }
    }

    draw(context) {
        super.draw(context);
        if (this.game.menu.deleteProgress2.showSavingSprite) {
            this.deleteProgressAnimation.draw(context);
            this.deleteProgressBookAnimation.draw(context);
        }
        if (this.showSavingSprite) {
            this.savingAnimation.draw(context);
            this.savingBookAnimation.draw(context);
        }
    }
}