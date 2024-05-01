import { MainMenu } from "./mainMenu.js";

export class IngamePauseMenu {
    constructor(game) {
        this.game = game;
        this.width = this.game.width;
        this.height = this.game.height;
        this.selectedOptionIndex = 0;
        this.pausedYText;
        this.gameOverBecauseNotEnoughCoins = false;
        this.canPauseInPenguinCutscene = true;
        this.menus = {
            default: ['Resume', 'Restart', 'Audio Settings', 'Back to Main Menu'],
            gameOver: ['Retry', 'Back to Main Menu'],
            audio: [] // empty because calls ingameAudioSettingsMenu directly
        };
        this.menuActive = 'default';
        window.addEventListener('keydown', e => {
            if (this.game.audioHandler.cutsceneSFX.isPlaying("battleStarting")) {
                return;
            }
            if (this.game.isPlayerInGame && this.game.currentMenu === this.game.menuInstances.ingameAudioSettingsMenu && e.key === 'Escape') {
                this.menuActive = 'default';
                this.game.menuInstances.ingameAudioSettingsMenu.selectedOption = 0;
                this.game.currentMenu = false;
                this.togglePause();
            } else if (!this.game.currentMenu && !this.game.cutsceneActive && !this.game.notEnoughCoins && !this.game.gameOver ||
                this.game.cutsceneActive && this.game.talkToElyvorg || (this.game.cutsceneActive && this.game.talkToPenguin && this.canPauseInPenguinCutscene)) {
                if (e.key === 'Escape') {
                    this.menuActive = 'default';
                    this.togglePause();
                }
            }
            if (this.game.gameOver && this.game.player.currentState.deathAnimation || this.gameOverBecauseNotEnoughCoins) {
                if (e.key === 'ArrowUp') {
                    this.arrowUpPressed = true;
                    this.moveSelectionUpGameOver();
                } else if (e.key === 'ArrowDown') {
                    this.arrowDownPressed = true;
                    this.moveSelectionDownGameOver();
                } else if (e.key === 'Enter') {
                    this.handleEnterKey();
                }
            }

            if (this.isPaused && this.menuActive !== 'audio') {
                if (e.key === 'ArrowUp') {
                    this.arrowUpPressed = true;
                    this.moveSelectionUp();
                } else if (e.key === 'ArrowDown') {
                    this.arrowDownPressed = true;
                    this.moveSelectionDown();
                } else if (e.key === 'Enter') {
                    this.handleEnterKey();
                }
            }
        });
    }
    handleEnterKey() {
        if (this.menuActive === 'gameOver') {
            this.gameOverOptions();
        } else {
            this.pauseOptions();
        }
        this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
    }

    getActiveMenuOptions() {
        return this.menus[this.menuActive];
    }

    contextColorDesign(context) {
        context.fillStyle = 'white';
        context.shadowColor = 'black';
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
    }

// ------------------------------------------------- pause screen -----------------------------------------------------------------------------
    pauseOptions() {
        const selectedOption = this.getActiveMenuOptions()[this.selectedOptionIndex];
        this.pausedYText = 150;
        switch (selectedOption) {
            case 'Resume':
                if (this.game.menuInstances.ingameAudioSettingsMenu.canPressNow) {
                    this.togglePause();
                }
                break;
            case 'Restart':
                this.game.reset();
                this.togglePause();
                break;
            case 'Audio Settings':
                this.menuActive = 'audio';
                this.pausedYText = 250;
                this.game.currentMenu = this.game.menuInstances.ingameAudioSettingsMenu; // calling audio menu from audioSettingsMenu directly
                this.selectedOptionIndex = 0;
                break;
            case 'Back to Main Menu':
                this.togglePause();
                this.game.reset();
                const mainMenu = new MainMenu(this.game);
                this.game.currentMenu = mainMenu;
                break;
        }
    }
    togglePause() {
        this.isPaused = !this.isPaused;
        this.selectedOptionIndex = 0;
        this.pausedYText = 150;
        if (this.isPaused) {
            this.game.audioHandler.mapSoundtrack.pauseAllSounds();
            this.game.audioHandler.firedogSFX.pauseAllSounds();
            this.game.audioHandler.enemySFX.pauseAllSounds();
            this.game.audioHandler.explosionSFX.pauseAllSounds();
            this.game.audioHandler.powerUpAndDownSFX.pauseAllSounds();
            this.game.audioHandler.cutsceneMusic.pauseAllSounds();
        } else {
            this.game.audioHandler.mapSoundtrack.resumeAllSounds();
            this.game.audioHandler.firedogSFX.resumeAllSounds();
            this.game.audioHandler.enemySFX.resumeAllSounds();
            this.game.audioHandler.explosionSFX.resumeAllSounds();
            this.game.audioHandler.powerUpAndDownSFX.resumeAllSounds();
            this.game.audioHandler.cutsceneMusic.resumeAllSounds();
        }
    }
    moveSelectionUp() {
        const activeMenuOptions = this.getActiveMenuOptions();
        this.selectedOptionIndex = (this.selectedOptionIndex - 1 + activeMenuOptions.length) % activeMenuOptions.length;
    }
    moveSelectionDown() {
        const activeMenuOptions = this.getActiveMenuOptions();
        this.selectedOptionIndex = (this.selectedOptionIndex + 1) % activeMenuOptions.length;
    }
// ------------------------------------------------- game over screen -----------------------------------------------------------------------------
    gameOverOptions() {
        const selectedOption = this.getActiveMenuOptions()[this.selectedOptionIndex];
        this.selectedOptionIndex = 0;
        switch (selectedOption) {
            case 'Retry':
                this.game.reset();
                break;
            case 'Back to Main Menu':
                this.game.reset();
                const mainMenu = new MainMenu(this.game);
                this.game.currentMenu = mainMenu;
                break;
        }
        this.gameOverBecauseNotEnoughCoins = false;
    }
    gameOverNotEnoughCoins() {
        this.gameOverBecauseNotEnoughCoins = !this.gameOverBecauseNotEnoughCoins;
        if (this.gameOverBecauseNotEnoughCoins) {
            this.selectedOptionIndex = 0;
        }
    }
    moveSelectionUpGameOver() {
        const gameOverOptions = this.menus.gameOver;
        this.selectedOptionIndex = (this.selectedOptionIndex - 1 + gameOverOptions.length) % gameOverOptions.length;
    }

    moveSelectionDownGameOver() {
        const gameOverOptions = this.menus.gameOver;
        this.selectedOptionIndex = (this.selectedOptionIndex + 1) % gameOverOptions.length;
    }
// --------------------------------------------------------------------------------------------------------------------------------------------------------------
    draw(context) {
        context.save();
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowColor = 'white';
        context.shadowBlur = 0;
        context.font = this.fontSize + 'px ' + this.fontFamily;
        context.textAlign = 'left';
        context.fillStyle = this.game.fontColor;
        context.restore();
        // draws the pause menu
        if (this.isPaused) {
            context.save();
            context.fillStyle = 'rgba(0, 0, 0, 0.7)';
            context.fillRect(0, 0, this.width, this.height);
            context.font = 'bold 46px Love Ya Like A Sister';
            context.textAlign = 'center';
            this.contextColorDesign(context);
            context.fillText('Paused', this.width / 2, this.height / 2 - this.pausedYText);
            context.font = '34px Arial';
            const activeMenuOptions = this.getActiveMenuOptions();
            for (let i = 0; i < activeMenuOptions.length; i++) {
                if (i === this.selectedOptionIndex) {
                    context.font = 'bold 36px Arial';
                    context.fillStyle = 'yellow';
                } else {
                    context.font = '34px Arial';
                    this.contextColorDesign(context);
                }
                context.fillText(activeMenuOptions[i], this.width / 2, this.height / 2 + (i * 60) - 55);
            }
            context.restore();
            // draws the audio settings menu on top
            if (this.menuActive === 'audio') {
                this.game.menuInstances.ingameAudioSettingsMenu.draw(context);
            }
        }
        // draws the game over messages
        if (this.game.gameOver || this.gameOverBecauseNotEnoughCoins) {
            context.save();
            if (this.game.notEnoughCoins && !this.game.gameOver) {
                context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            } else {
                context.fillStyle = 'rgba(0, 0, 0, 0.2)';
            }
            context.fillRect(0, 0, this.width, this.height);
            context.font = 'bold 46px Love Ya Like A Sister';
            context.textAlign = 'center';
            this.contextColorDesign(context);
            if (this.game.notEnoughCoins && !this.game.gameOver) {
                context.fillText("You don't have enough coins!", this.width / 2, this.height / 2 - 150);
            } else {
                context.fillText('Game Over!', this.width / 2, this.height / 2 - 150);
            }
            context.font = '34px Arial';
            const gameOverOptions = this.menus.gameOver;
            this.menuActive = 'gameOver';
            for (let i = 0; i < gameOverOptions.length; i++) {
                if (i === this.selectedOptionIndex) {
                    context.font = 'bold 36px Arial';
                    context.fillStyle = 'yellow';
                } else {
                    context.font = '34px Arial';
                    this.contextColorDesign(context);
                }
                context.fillText(gameOverOptions[i], this.width / 2, this.height / 2 + (i * 60) - 55);
            }
            context.restore();
        }
    }
}