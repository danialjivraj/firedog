import { BaseMenu } from './baseMenu.js';
import { fadeIn } from '../animations/fading.js';

export class DeleteProgress extends BaseMenu {
    constructor(game) {
        const menuOptions = ['Yes', 'No'];
        super(game, menuOptions, 'Are you sure you want to delete your game progress?');
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];

        super.handleMenuSelection();
        if (selectedOption === 'Yes') {
            this.game.currentMenu = this.game.menu.deleteProgress2;
            this.game.menu.deleteProgress2.selectedOption = 1;
        } else if (selectedOption === 'No') {
            this.game.menu.settings.activateMenu(4);
        }
        this.menuActive = false;
    }
}

export class DeleteProgress2 extends BaseMenu {
    constructor(game) {
        const menuOptions = ["Yes, I want to delete my game progress", "No, I do not want to delete my game progress"];
        super(game, menuOptions, 'All your progress will be lost!');
        this.selectedOption = 1;
        this.showSavingSprite = false;
    }

    deleteProgessionAnimation() {
        this.game.canSelect = false;
        this.game.menu.deleteProgress2.showSavingSprite = true;
        fadeIn(this.game.canvas, 4000, () => {
            this.game.canSelect = true;
            this.game.menu.deleteProgress2.showSavingSprite = false;
        });
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];

        super.handleMenuSelection();

        if (selectedOption === "Yes, I want to delete my game progress") {
            this.game.clearSavedData();
            this.deleteProgessionAnimation();
            this.game.menu.main.activateMenu(0);
            this.game.audioHandler.menu.stopSound('soundtrack');
            this.game.audioHandler.menu.playSound('soundtrack');
        } else if (selectedOption === "No, I do not want to delete my game progress") {
            this.game.menu.settings.activateMenu(4);
        }
    }
}
