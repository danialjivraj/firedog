import { BaseMenu } from './baseMenu.js';
import { DeleteProgressAnimation, DeleteProgressBookAnimation, SavingAnimation, SavingBookAnimation } from '../animations/savingAnimation.js';

export class MainMenu extends BaseMenu {
    constructor(game) {
        const menuOptions = ['Play', 'Skins', 'Records', 'How to Play', 'Settings', 'Exit'];
        super(game, menuOptions, 'Main Menu');
        this.menuOptionsPositionOffset = 50;
        this.positionOffset = 220;
        this.showSavingSprite = false;
        this.savingAnimation = new SavingAnimation(this.game);
        this.savingBookAnimation = new SavingBookAnimation(this.game);
        this.deleteProgressAnimation = new DeleteProgressAnimation(this.game);
        this.deleteProgressBookAnimation = new DeleteProgressBookAnimation(this.game);
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];
        if (this.game.canSelect) {
            super.handleMenuSelection();
            if (selectedOption === 'Play') {
                this.game.audioHandler.menu.playSound('mapOpening');
                this.game.menu.forestMap.activateMenu();
            } else if (selectedOption === 'Skins') {
                this.game.menu.skins.activateMenu();
            } else if (selectedOption === 'Records') {
                this.game.menu.records.activateMenu();
            } else if (selectedOption === 'How to Play') {
                this.game.menu.howToPlay.activateMenu();
            } else if (selectedOption === 'Settings') {
                this.game.menu.settings.activateMenu();
            } else if (selectedOption === 'Exit') {
                window.electronAPI.quitApp();
            }
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
