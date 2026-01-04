import { SelectMenu } from './baseMenu.js';

export class LevelDifficultyMenu extends SelectMenu {
    constructor(game) {
        const menuOptions = ['Very Easy', 'Easy', 'Normal', 'Hard', 'Extreme', 'Go Back'];
        super(game, menuOptions, 'Level Difficulty Settings', { initialIndex: 1, goBackLabel: 'Go Back' });
        this.setDifficulty('Normal');
    }

    getLivesForDifficulty(selectedDifficulty) {
        switch (selectedDifficulty) {
            case 'Very Easy': return 10;
            case 'Easy': return 7;
            case 'Normal': return 5;
            case 'Hard': return 3;
            case 'Extreme': return 1;
            default: return 5;
        }
    }

    setDifficulty(selectedDifficulty, triggerUISync = true) {
        switch (selectedDifficulty) {
            case 'Very Easy':
                this.selectedDifficultyIndex = 0;
                this.game.lives = 10;
                break;
            case 'Easy':
                this.selectedDifficultyIndex = 1;
                this.game.lives = 7;
                break;
            case 'Normal':
                this.selectedDifficultyIndex = 2;
                this.game.lives = 5;
                break;
            case 'Hard':
                this.selectedDifficultyIndex = 3;
                this.game.lives = 3;
                break;
            case 'Extreme':
                this.selectedDifficultyIndex = 4;
                this.game.lives = 1;
                break;
            default:
                this.selectedDifficultyIndex = 2;
                this.game.lives = 5;
                break;
        }
        this.game.selectedDifficulty = selectedDifficulty;
        if (triggerUISync) this.game.UI.syncLivesState();
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
