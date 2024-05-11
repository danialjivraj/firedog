import { BaseMenu } from './baseMenu.js';
import { DeleteProgressAnimation, DeleteProgressBookAnimation, SavingAnimation, SavingBookAnimation } from '../animations/savingAnimation.js';

export class MainMenu extends BaseMenu {
    constructor(game) {
        const menuOptions = ['Play', 'Skins', 'Level Difficulty', 'How to Play', 'Audio Settings', 'Delete Progress'];
        super(game, menuOptions, 'Main Menu');
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
                this.game.currentMenu = this.game.menu.forestMap;
                this.game.menu.forestMap.activateMenu();
            } else if (selectedOption === 'Level Difficulty') {
                this.game.currentMenu = this.game.menu.levelDifficulty;
                this.game.menu.levelDifficulty.activateMenu(this.game.menu.levelDifficulty.selectedDifficultyIndex);
            } else if (selectedOption === 'Skins') {
                this.game.currentMenu = this.game.menu.skins;
                this.game.menu.skins.activateMenu(this.game.menu.skins.selectedSkinIndex);
            } else if (selectedOption === 'How to Play') {
                this.game.currentMenu = this.game.menu.howToPlay;
                this.game.menu.howToPlay.activateMenu();
            } else if (selectedOption === 'Audio Settings') {
                this.game.currentMenu = this.game.menu.audioSettings;
                this.game.menu.audioSettings.activateMenu();
            } else if (selectedOption === 'Delete Progress') {
                this.game.currentMenu = this.game.menu.deleteProgress;
                this.game.menu.deleteProgress.activateMenu(1);
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
