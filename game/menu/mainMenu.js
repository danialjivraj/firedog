import { BaseMenu } from './baseMenu.js';
import { DeleteProgressAnimation, DeleteProgressBookAnimation, SavingAnimation, SavingBookAnimation } from '../animations/savingAnimation.js';

export class MainMenu extends BaseMenu {
    constructor(game) {
        const menuOptions = ['Play', 'Wardrobe', 'Records', 'How to Play', 'Settings', 'Exit'];
        super(game, menuOptions, 'Main Menu');
        this.showSavingSprite = false;
        this.savingAnimation = new SavingAnimation(this.game);
        this.savingBookAnimation = new SavingBookAnimation(this.game);
        this.deleteProgressAnimation = new DeleteProgressAnimation(this.game);
        this.deleteProgressBookAnimation = new DeleteProgressBookAnimation(this.game);
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];
        if (!this.game.canSelect) return;

        super.handleMenuSelection();

        if (selectedOption === 'Play') {
            this.game.audioHandler.menu.playSound('mapOpening');
            this.game.openMenu(this.game.menu.forestMap, 0);
        } else if (selectedOption === 'Wardrobe') {
            this.game.openMenu(this.game.menu.wardrobe, 0);
        } else if (selectedOption === 'Records') {
            this.game.openMenu(this.game.menu.records, 0);
        } else if (selectedOption === 'How to Play') {
            this.game.openMenu(this.game.menu.howToPlay, 0);
        } else if (selectedOption === 'Settings') {
            this.game.openMenu(this.game.menu.settings, 0);
        } else if (selectedOption === 'Exit') {
            window.electronAPI.quitApp();
        }
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