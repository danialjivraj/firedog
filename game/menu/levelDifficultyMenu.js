import { BaseMenu } from './baseMenu.js';

export class LevelDifficultyMenu extends BaseMenu {
    constructor(game) {
        const menuOptions = ['Easy', 'Normal', 'Hard', 'Go Back'];
        super(game, menuOptions, 'Level Difficulty Menu');
        this.setDifficulty('Normal');
    }

    setDifficulty(selectedDifficulty) {
        switch (selectedDifficulty) {
            case 'Easy':
                this.selectedDifficultyIndex = 0;
                this.game.lives = 7;
                break;
            case 'Normal':
                this.selectedDifficultyIndex = 1;
                this.game.lives = 5;
                break;
            case 'Hard':
                this.selectedDifficultyIndex = 2;
                this.game.lives = 3;
                break;
            default:
                this.selectedDifficultyIndex = 1;
                this.game.lives = 5;
                break;
        }
        this.game.selectedDifficulty = selectedDifficulty;
        this.updateSelectedDifficulty();
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];
        super.handleMenuSelection();

        if (selectedOption === 'Go Back') {
            this.menuActive = false;
            this.game.currentMenu = this.game.menuInstances.mainMenu;
        } else {
            this.setDifficulty(selectedOption.replace(' - Selected', ''));
        }
    }

    updateSelectedDifficulty() {
        this.menuOptions = this.menuOptions.map(option => option.replace(' - Selected', ''));
        this.menuOptions[this.selectedDifficultyIndex] += ' - Selected';
    }

    getSelectedOption() {
        return this.selectedDifficultyIndex;
    }
}
