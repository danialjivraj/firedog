import { AudioMenu } from '../baseMenu.js';

export class IngameAudioSettingsMenu extends AudioMenu {
    constructor(game) {
        const options = ['In-game Master Volume', 'Map Soundtrack', 'Firedog SFX', 'Enemy SFX', 'Collision SFX', 'Power Up/Down SFX', 'Go Back'];
        super(game, options, 'Ingame Audio Settings');
        this.menuInGame = true;
    }
    initializeAudioMap() {
        this.audioMap = {
            'In-game Master Volume': {
                ...this.game.audioHandler.mapSoundtrack.getSoundsMapping(),
                ...this.game.audioHandler.enemySFX.getSoundsMapping(),
                ...this.game.audioHandler.firedogSFX.getSoundsMapping(),
                ...this.game.audioHandler.explosionSFX.getSoundsMapping(),
                ...this.game.audioHandler.powerUpAndDownSFX.getSoundsMapping(),
            },
            'Map Soundtrack': { ...this.game.audioHandler.mapSoundtrack.getSoundsMapping(), },
            'Firedog SFX': { ...this.game.audioHandler.firedogSFX.getSoundsMapping(), },
            'Enemy SFX': { ...this.game.audioHandler.enemySFX.getSoundsMapping(), },
            'Collision SFX': { ...this.game.audioHandler.explosionSFX.getSoundsMapping(), },
            'Power Up/Down SFX': { ...this.game.audioHandler.powerUpAndDownSFX.getSoundsMapping(), },
        };
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];
        if (selectedOption === 'Go Back') {
            super.handleMenuSelection();
            this.delayedEnablePress();
            this.game.menu.pause.activateMenu(2);
            this.canPressNow = false;
        }
    }
}
