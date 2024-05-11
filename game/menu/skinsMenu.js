import { BaseMenu } from './baseMenu.js';

export class Skins extends BaseMenu {
    constructor(game) {
        const menuOptions = ['Firedog', 'Hatboy Firedog', 'Firedog the Cholo', 'Zabka Firedog', 'Go Back'];
        super(game, menuOptions, 'Skins');
        this.backgroundImage = document.getElementById('skinStage');
        this.defaultSkin = document.getElementById('player');
        this.hatSkin = document.getElementById('player2');
        this.choloSkin = document.getElementById('player3');
        this.zabkaSkin = document.getElementById('player4');
        this.shinySkin = document.getElementById('player5');
        this.currentSkin = this.defaultSkin;
        this.selectedSkinIndex = 0;

        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 6;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.width = 100;
        this.height = 91.3;
        this.x = this.game.width / 2;
        this.y = this.game.height - this.height;
    }
    setCurrentSkinById(skinId) {
        const skinElement = document.getElementById(skinId);
        if (skinElement) {
            this.menuOptions.forEach((option, index) => {
                this.menuOptions[index] = option.replace(' - Selected', '');
            });

            this.currentSkin = skinElement;

            switch (skinId) {
                case 'player':
                    this.selectedSkinIndex = 0;
                    break;
                case 'player2':
                    this.selectedSkinIndex = 1;
                    break;
                case 'player3':
                    this.selectedSkinIndex = 2;
                    break;
                case 'player4':
                    this.selectedSkinIndex = 3;
                    break;
            }

            this.menuOptions[this.selectedSkinIndex] += ' - Selected';
        }
    }
    setCurrentSkin(skinName) {
        switch (skinName) {
            case 'Firedog':
                if (Math.random() < 0.9) {
                    this.currentSkin = this.defaultSkin;
                } else {
                    this.currentSkin = this.shinySkin; // :)
                    this.game.audioHandler.menu.playSound('shinySkinRizzSound');
                }
                break;
            case 'Hatboy Firedog':
                this.currentSkin = this.hatSkin;
                break;
            case 'Firedog the Cholo':
                this.currentSkin = this.choloSkin;
                break;
            case 'Zabka Firedog':
                this.currentSkin = this.zabkaSkin;
                break;
            default:
                this.currentSkin = this.defaultSkin;
                break;
        }
    }
    update(deltaTime) {
        super.update(deltaTime);
    }
    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];

        super.handleMenuSelection();

        this.menuOptions[this.selectedSkinIndex] = this.menuOptions[this.selectedSkinIndex].replace(' - Selected', '');

        if (selectedOption === 'Firedog') {
            this.selectedSkinIndex = 0;
            this.setCurrentSkin('Firedog');
        } else if (selectedOption === 'Hatboy Firedog') {
            this.selectedSkinIndex = 1;
            this.setCurrentSkin('Hatboy Firedog');
        } else if (selectedOption === 'Firedog the Cholo') {
            this.selectedSkinIndex = 2;
            this.setCurrentSkin('Firedog the Cholo');
        } else if (selectedOption === 'Zabka Firedog') {
            this.selectedSkinIndex = 3;
            this.setCurrentSkin('Zabka Firedog');
        } else if (selectedOption === 'Go Back') {
            this.game.menu.main.activateMenu(1);
        }
        this.menuOptions[this.selectedSkinIndex] += ' - Selected';
    }
    draw(context) {
        super.draw(context);

        if (this.menuActive) {
            const selectedOption = this.menuOptions[this.selectedOption];

            if (selectedOption === 'Firedog' || selectedOption === 'Firedog - Selected') {
                if (this.currentSkin === this.shinySkin) {
                    context.drawImage(this.shinySkin, this.frameX * this.width, 0, this.width, this.height, this.x - 50, this.y - 20, this.width, this.height);
                } else {
                    context.drawImage(this.defaultSkin, this.frameX * this.width, 0, this.width, this.height, this.x - 50, this.y - 20, this.width, this.height);
                }
            } else if (selectedOption === 'Hatboy Firedog' || selectedOption === 'Hatboy Firedog - Selected') {
                context.drawImage(this.hatSkin, this.frameX * this.width, 0, this.width, this.height, this.x - 50, this.y - 20, this.width, this.height);
            } else if (selectedOption === 'Firedog the Cholo' || selectedOption === 'Firedog the Cholo - Selected') {
                context.drawImage(this.choloSkin, this.frameX * this.width, 0, this.width, this.height, this.x - 50, this.y - 20, this.width, this.height);
            } else if (selectedOption === 'Zabka Firedog' || selectedOption === 'Zabka Firedog - Selected') {
                context.drawImage(this.zabkaSkin, this.frameX * this.width, 0, this.width, this.height, this.x - 50, this.y - 20, this.width, this.height);
            } else if (selectedOption === 'Go Back') {
                context.drawImage(this.currentSkin, this.frameX * this.width, 0, this.width, this.height, this.x - 50, this.y - 20, this.width, this.height);
            }
        }
    }
}
