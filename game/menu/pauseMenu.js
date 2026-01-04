import { BaseMenu } from "./baseMenu.js";

export class PauseMenu extends BaseMenu {
    constructor(game) {
        super(game, ['Resume', 'Restart', 'Audio Settings', 'Back to Main Menu'], 'Paused');
        this.game = game;
        this.positionOffset = 180;
        this.selectedOption = 0;
        this.isPaused = false;
        this.menuInGame = true;
        this.canEscape = false;
    }

    handleMenuSelection() {
        const selectedOption = this.menuOptions[this.selectedOption];
        super.handleMenuSelection();
        this.menuActive = false;
        if (selectedOption === 'Resume') {
            this.togglePause();
        } else if (selectedOption === 'Restart') {
            this.togglePause();
            this.game.reset();
        } else if (selectedOption === 'Audio Settings') {
            this.game.menu.audioSettings.activateMenu({ inGame: true });
        } else if (selectedOption === 'Back to Main Menu') {
            this.togglePause();
            this.game.isPlayerInGame = false;
            this.game.reset();
            this.game.menu.main.activateMenu();
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.selectedOption = 0;
        if (this.isPaused === true) {
            this.game.menu.pause.activateMenu();
            this.game.audioHandler.mapSoundtrack.pauseAllSounds();
            this.game.audioHandler.firedogSFX.pauseAllSounds();
            this.game.audioHandler.enemySFX.pauseAllSounds();
            this.game.audioHandler.collisionSFX.pauseAllSounds();
            this.game.audioHandler.powerUpAndDownSFX.pauseAllSounds();
            this.game.audioHandler.cutsceneMusic.pauseAllSounds();
        } else {
            this.game.menu.pause.closeAllMenus();
            this.game.audioHandler.mapSoundtrack.resumeAllSounds();
            this.game.audioHandler.firedogSFX.resumeAllSounds();
            this.game.audioHandler.enemySFX.resumeAllSounds();
            this.game.audioHandler.collisionSFX.resumeAllSounds();
            this.game.audioHandler.powerUpAndDownSFX.resumeAllSounds();
            this.game.audioHandler.cutsceneMusic.resumeAllSounds();
        }

        this.canEscape = false;
        setTimeout(() => {
            this.canEscape = true;
        }, 1);
    }
}
