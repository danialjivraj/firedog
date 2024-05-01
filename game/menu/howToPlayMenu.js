import { BaseMenu } from './baseMenu.js';

export class HowToPlayMenu extends BaseMenu {
    constructor(game) {
        const menuOptions = ['Next', 'Go Back'];
        super(game, menuOptions, 'How To Play');
        this.howToPlayImages = [
            document.getElementById('howToPlay'),
            document.getElementById('howToPlay2'),
            document.getElementById('howToPlay3'),
            document.getElementById('howToPlay4'),
            document.getElementById('howToPlay5'),
            document.getElementById('howToPlay6'),
            document.getElementById('howToPlay7'),
            document.getElementById('howToPlay8'),
        ];
        this.currentImageIndex = 0;
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];

        super.handleMenuSelection();
        if (selectedOption === 'Next') {
            this.currentImageIndex = (this.currentImageIndex + 1) % this.howToPlayImages.length;
        } else if (selectedOption === 'Go Back') {
            this.currentImageIndex = 0;
            this.menuActive = false;
            this.game.currentMenu = this.game.menuInstances.mainMenu;
        }
    }

    draw(context) {
        super.draw(context);
        const currentImage = this.howToPlayImages[this.currentImageIndex];
        if (currentImage) {
            context.drawImage(currentImage, 0, 0, this.game.width, this.game.height);
        }
    }
}
