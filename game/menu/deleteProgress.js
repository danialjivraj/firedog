import { DomMenu } from './dom/domMenu.js';
import { fadeIn } from '../animations/fading.js';

class ConfirmMenu extends DomMenu {
    constructor(game, menuOptions, title, { heading, question, labels }) {
        super(game, menuOptions, title);
        this.panelModifier = 'menu-panel--danger';
        this.heading = heading;
        this.question = question;
        this.buttonLabels = labels;
    }

    getPanelTitle() {
        return this.heading;
    }

    getOptionLabel(index) {
        return this.buttonLabels[index];
    }

    getOptionModifier(index) {
        return index === 0 ? 'menu-option--danger' : 'menu-option--safe';
    }

    buildBody(body) {
        const question = document.createElement('p');
        question.className = 'menu-question';
        question.textContent = this.question;
        body.appendChild(question);

        this.buildOptionList(body);
        this.dom.options.classList.add('menu-options--buttons');
    }
}

export class DeleteProgress extends ConfirmMenu {
    constructor(game) {
        super(game, ['Yes', 'No'], 'Are you sure you want to delete your game progress?', {
            heading: 'Delete Progress',
            question: 'Are you sure you want to delete your game progress?',
            labels: ['YES, DELETE', 'NO, GO BACK'],
        });
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];
        super.handleMenuSelection();

        if (selectedOption === 'Yes') {
            this.game.openMenu(this.game.menu.deleteProgress2, 1);
            return;
        }

        this.game.goBackMenu();
    }
}

export class DeleteProgress2 extends ConfirmMenu {
    constructor(game) {
        super(
            game,
            [
                "Yes, I want to delete my game progress",
                "No, I do not want to delete my game progress",
            ],
            'All your progress will be lost!',
            {
                heading: 'Final Warning',
                question: 'All your progress will be permanently lost!',
                labels: ['YES, DELETE EVERYTHING', 'NO, KEEP MY PROGRESS'],
            }
        );
        this.selectedOption = 1;
        this.showSavingSprite = false;
    }

    deleteProgessionAnimation() {
        this.game.canSelect = false;
        this.showSavingSprite = true;

        fadeIn(this.game.canvas, 4000, () => {
            this.game.canSelect = true;
            this.showSavingSprite = false;
        });
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];
        super.handleMenuSelection();

        if (selectedOption === "Yes, I want to delete my game progress") {
            this.game.clearSavedData();
            this.deleteProgessionAnimation();

            this.game.setMenuRoot(this.game.menu.main, 0);

            this.game.audioHandler.menu.stopSound('criminalitySoundtrack');
            this.game.audioHandler.menu.playSound('criminalitySoundtrack');
            return;
        }

        this.game.goBackMenu();
    }
}
