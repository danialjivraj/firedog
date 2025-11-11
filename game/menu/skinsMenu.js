import { getSkinElement } from '../config/skins.js';
import { SelectMenu } from './baseMenu.js';

export class Skins extends SelectMenu {
    constructor(game) {
        const menuOptions = ['Firedog', 'Hatboy Firedog', 'Firedog the Cholo', 'Zabka Firedog', 'Go Back'];
        super(game, menuOptions, 'Skins');

        this.backgroundImage = document.getElementById('skinStage');
        this.defaultSkin = getSkinElement('default');
        this.hatSkin = getSkinElement('hat');
        this.choloSkin = getSkinElement('cholo');
        this.zabkaSkin = getSkinElement('zabka');
        this.shinySkin = getSkinElement('shiny');

        this.currentSkin = this.defaultSkin;

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

        this.setCurrentSkinById('defaultSkin');
        this.setSelectedIndex(0);
    }

    getCurrentSkinId() {
        return this.currentSkin.id || 'defaultSkin';
    }

    setCurrentSkinById(skinId) {
        const skinElement = document.getElementById(skinId);
        if (skinElement) {
            this.currentSkin = skinElement;

            switch (skinId) {
                case 'defaultSkin': this.setSelectedIndex(0); break;
                case 'hatSkin': this.setSelectedIndex(1); break;
                case 'choloSkin': this.setSelectedIndex(2); break;
                case 'zabkaSkin': this.setSelectedIndex(3); break;
                case 'shinySkin': this.setSelectedIndex(0); break;
            }
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

    onSelect(index, cleanLabel) {
        this.setCurrentSkin(cleanLabel);
    }

    onGoBack() {
        this.game.menu.main.activateMenu(1);
    }

    draw(context) {
        super.draw(context);

        if (this.menuActive) {
            const selectedOption = this.menuOptions[this.selectedOption];
            const clean = selectedOption.replace(' - Selected', '');

            let preview = this.currentSkin;
            if (clean === 'Firedog') {
                const isShinyNow = this.currentSkin === this.shinySkin;
                preview = isShinyNow ? this.shinySkin : this.defaultSkin;
            } else if (clean === 'Hatboy Firedog') {
                preview = this.hatSkin;
            } else if (clean === 'Firedog the Cholo') {
                preview = this.choloSkin;
            } else if (clean === 'Zabka Firedog') {
                preview = this.zabkaSkin;
            }

            context.drawImage(
                preview,
                this.frameX * this.width, 0, this.width, this.height,
                this.x - 50, this.y - 20, this.width, this.height
            );
        }
    }
}
