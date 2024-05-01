import { BaseMenu } from './baseMenu.js';

export class DeleteProgress extends BaseMenu {
    constructor(game) {
        const menuOptions = ['Yes', 'No'];
        super(game, menuOptions, 'Are you sure you want to delete your game progress?');
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];

        super.handleMenuSelection();
        if (selectedOption === 'Yes') {
            this.game.currentMenu = this.game.menuInstances.deleteProgress2;
            this.game.menuInstances.deleteProgress2.selectedOption = 1;
        } else if (selectedOption === 'No') {
            this.game.currentMenu = this.game.menuInstances.mainMenu;
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
        this.canSelect = true;
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];

        super.handleMenuSelection();

        if (selectedOption === "Yes, I want to delete my game progress") {
            this.game.clearSavedData();
            this.game.deleteProgessionAnimation();
            this.game.menuInstances.mainMenu.selectedOption = 0;
            this.menuActive = false;
            this.game.currentMenu = this.game.menuInstances.mainMenu;
        } else if (selectedOption === "No, I do not want to delete my game progress") {
            this.menuActive = false;
            this.game.currentMenu = this.game.menuInstances.mainMenu;
        }

    }
}

