import { AudioMenu } from '../baseMenu.js';

export class AudioSettingsMenu extends AudioMenu {
    constructor(game) {
        const options = ['Master Volume', 'Menu Music', 'Option Selected', 'Cutscene Music', 'Cutscene SFX', 'Cutscene Dialogue', 'Go Back'];
        super(game, options, 'Audio Settings');
    }

    initializeVolumeLevels() {
        this.volumeLevels = [75, 10, 90, 90, 70, 60, null];
    }

    initializeAudioMap() {
        this.audioMap = {
            'Master Volume': {
                ...this.game.audioHandler.menu.getSoundsMapping(),
                ...this.game.audioHandler.cutsceneMusic.getSoundsMapping(),
                ...this.game.audioHandler.cutsceneSFX.getSoundsMapping(),
                ...this.game.audioHandler.cutsceneDialogue.getSoundsMapping(),
            },
            'Option Selected': [
                this.game.audioHandler.menu.soundsMapping['optionSelectedSound'],
                this.game.audioHandler.menu.soundsMapping['optionHoveredSound'],
            ],
            'Menu Music': this.game.audioHandler.menu.soundsMapping['soundtrack'],
            'Cutscene Music': { ...this.game.audioHandler.cutsceneMusic.getSoundsMapping() },
            'Cutscene SFX': { ...this.game.audioHandler.cutsceneSFX.getSoundsMapping() },
            'Cutscene Dialogue': { ...this.game.audioHandler.cutsceneDialogue.getSoundsMapping() },
        };
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];
        if (selectedOption === 'Go Back') {
            super.handleMenuSelection();
            this.game.menu.main.activateMenu(4);
            this.canPressNow = true;
        }
    }
}
