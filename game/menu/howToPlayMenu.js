import { BaseMenu } from './baseMenu.js';

export class HowToPlayMenu extends BaseMenu {
    constructor(game) {
        const menuOptions = ['Next', 'Previous', 'Go Back'];
        super(game, menuOptions, '');
        this.backgroundImage = document.getElementById('mainmenubackgroundhowtoplay');

        this.centerX = this.game.width - 90;
        this.positionOffset = -115;

        this.howToPlayImages = [
            document.getElementById('howToPlay1'),
            document.getElementById('howToPlay2'),
            document.getElementById('howToPlay3'),
            document.getElementById('howToPlay4'),
            document.getElementById('howToPlay5'),
            document.getElementById('howToPlay6'),
            document.getElementById('howToPlay7'),
            document.getElementById('howToPlay8'),
            document.getElementById('howToPlay9'),
            document.getElementById('howToPlay10'),
        ];
        this.currentImageIndex = 0;
    }

    handleKeyDown(event) {
        super.handleKeyDown(event);
        if (this.menuActive) {
            if (event.key === 'ArrowLeft' && this.currentImageIndex > 0) {
                this.currentImageIndex--;
                super.handleMenuSelection();
            } else if (event.key === 'ArrowRight' && this.currentImageIndex < this.howToPlayImages.length - 1) {
                this.currentImageIndex++;
                super.handleMenuSelection();
            }
        }
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];
        if (selectedOption === 'Next' && this.currentImageIndex < this.howToPlayImages.length - 1) {
            this.currentImageIndex++;
            super.handleMenuSelection();
        } else if (selectedOption === 'Previous' && this.currentImageIndex > 0) {
            this.currentImageIndex--;
            super.handleMenuSelection();
        } else if (selectedOption === 'Go Back') {
            this.currentImageIndex = 0;
            super.handleMenuSelection();
            this.game.menu.main.activateMenu(3);
        }
    }

    draw(context) {
        super.draw(context);
        const currentImage = this.howToPlayImages[this.currentImageIndex];
        if (currentImage) {
            context.drawImage(currentImage, 0, 0, this.game.width, this.game.height);

            context.save();
            const centerX = this.game.width - 80;
            const centerY = 15;
            const optionWidth = 200;
            const optionHeight = 40;

            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            context.fillRect(centerX - optionWidth / 2, centerY - optionHeight / 2, optionWidth, optionHeight);

            context.font = 'bold 20px Arial';
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.fillText(this.game.isTutorialActive ? 'Tutorial: On' : 'Tutorial: Off', centerX, centerY + 10);
            context.restore();
        }
    }

}
