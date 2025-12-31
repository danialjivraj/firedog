import { SelectMenu } from './baseMenu.js';

export class LevelDifficultyMenu extends SelectMenu {
    constructor(game) {
        const menuOptions = ['Easy', 'Normal', 'Hard', 'Extreme', 'Go Back'];
        super(game, menuOptions, 'Level Difficulty Menu', { initialIndex: 1, goBackLabel: 'Go Back' });
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
            case 'Extreme':
                this.selectedDifficultyIndex = 3;
                this.game.lives = 1;
                break;
            default:
                this.selectedDifficultyIndex = 1;
                this.game.lives = 5;
                break;
        }
        this.game.selectedDifficulty = selectedDifficulty;
        this.setSelectedIndex(this.selectedDifficultyIndex);
    }

    onSelect(index, cleanLabel) {
        this.setDifficulty(cleanLabel);
    }

    onGoBack() {
        this.game.menu.settings.activateMenu(2);
    }

    getSelectedOption() {
        return this.selectedDifficultyIndex;
    }
}
