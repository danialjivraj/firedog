import { BaseMenu } from "./baseMenu.js";

export class PauseMenu extends BaseMenu {
    constructor(game) {
        super(game, ["Resume", "Restart", "Settings", "Back to Main Menu"], "Paused");
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

        if (selectedOption === "Resume") {
            this.togglePause();
        } else if (selectedOption === "Restart") {
            if (this.game.pauseContext === 'storyCutscene') {
                this.game.restartActiveCutscene();
                if (this.isPaused) this.togglePause();
                return;
            }

            this.togglePause();
            this.game.reset();
        } else if (selectedOption === "Settings") {
            this.game.menu.settings.activateMenu({ inGame: true, selectedOption: 0 });
        } else if (selectedOption === "Back to Main Menu") {
            const isStoryCutscene = (this.game.pauseContext === 'storyCutscene');
            const leavingEndCutscene = (isStoryCutscene && this.game.isEndCutscene);

            if (isStoryCutscene) {
                this.game.exitCutsceneToMainMenu();
            }

            if (this.isPaused) this.togglePause();
            this.game.isPlayerInGame = false;
            this.game.reset();

            if (leavingEndCutscene) {
                this.game.goToMainMenuWithSavingAnimation(4000);
            } else {
                this.game.menu.main.activateMenu();
            }
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.selectedOption = 0;

        if (this.isPaused === true) {
            if (this.game.cutsceneActive && this.game.currentCutscene) {
                this.game.pauseContext = this.game.isPlayerInGame
                    ? 'inGameCutscene'
                    : 'storyCutscene';
            } else {
                this.game.pauseContext = 'gameplay';
            }

            this.game.menu.pause.activateMenu();
            this.game.audioHandler.mapSoundtrack.pauseAllSounds();
            this.game.audioHandler.firedogSFX.pauseAllSounds();
            this.game.audioHandler.enemySFX.pauseAllSounds();
            this.game.audioHandler.collisionSFX.pauseAllSounds();
            this.game.audioHandler.powerUpAndDownSFX.pauseAllSounds();
            this.game.audioHandler.cutsceneMusic.pauseAllSounds();
            this.game.audioHandler.cutsceneSFX.pauseAllSounds();
        } else {
            this.game.ignoreCutsceneInputUntil = performance.now() + 200;
            this.game.menu.pause.closeAllMenus();
            this.game.audioHandler.mapSoundtrack.resumeAllSounds();
            this.game.audioHandler.firedogSFX.resumeAllSounds();
            this.game.audioHandler.enemySFX.resumeAllSounds();
            this.game.audioHandler.collisionSFX.resumeAllSounds();
            this.game.audioHandler.powerUpAndDownSFX.resumeAllSounds();
            this.game.audioHandler.cutsceneMusic.resumeAllSounds();
            this.game.audioHandler.cutsceneSFX.resumeAllSounds();
        }

        this.canEscape = false;
        setTimeout(() => {
            this.canEscape = true;
        }, 1);
    }
}
