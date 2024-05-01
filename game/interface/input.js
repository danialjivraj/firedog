export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = [];
        this.arrowUpPressed = false;
        this.arrowDownPressed = false;
        this.isWKeyPressed = false;

        window.addEventListener('keydown', e => {
            const lowercaseKey = e.key.length === 1 && e.key !== 'Enter' ? e.key.toLowerCase() : e.key;

            if (e.key === 'Enter' && this.keys.indexOf('Enter') === -1 && this.game.talkToPenguin) {
                this.keys.push('Enter');
                this.game.enterToTalkToPenguin = true;
            }

            if ((lowercaseKey === 's' || (lowercaseKey === 'w' && this.game.player.isUnderwater === false) || lowercaseKey === 'a' || lowercaseKey === 'd' ||
                lowercaseKey === 'q' || lowercaseKey === 'e' || lowercaseKey === 'Enter') && this.keys.indexOf(lowercaseKey) === -1) {
                if (!this.game.talkToElyvorg) {
                    this.keys.push(lowercaseKey);
                } else {
                    if (!this.game.isElyvorgFullyVisible) {
                        this.keys.push('d');
                    }
                }
            }

            if (e.key === 'm') {
                //this.game.debug = !this.game.debug; //uncomment for debug mode
            }

            if (lowercaseKey === 'w' && this.game.player.isUnderwater) {
                if (!this.isWKeyPressed) {
                    this.isWKeyPressed = true;
                    this.keys.push('w');
                }
            }

            if (this.game.currentMenu && e.key === 'Escape' && this.game.currentMenu !== this.game.menuInstances.mainMenu && this.game.menuInstances.forestMapMenu.showSavingSprite === false) {
                if (this.game.menuInstances.howToPlayMenu.menuActive) {
                    this.game.menuInstances.howToPlayMenu.selectedOption = 0;
                    this.game.menuInstances.howToPlayMenu.currentImageIndex = 0;
                    this.game.menuInstances.howToPlayMenu.menuActive = false;
                } else if (this.game.menuInstances.levelDifficultyMenu.menuActive) {
                    this.game.menuInstances.levelDifficultyMenu.menuActive = false;
                } else if (this.game.menuInstances.forestMapMenu.menuActive) {
                    this.game.menuInstances.forestMapMenu.menuActive = false;
                } else if (this.game.menuInstances.audioSettingsMenu.menuActive) {
                    this.game.menuInstances.audioSettingsMenu.selectedOption = 0;
                    this.game.menuInstances.audioSettingsMenu.menuActive = false;
                } else if (this.game.menuInstances.ingameAudioSettingsMenu.menuActive) {
                    this.game.menuInstances.ingameAudioSettingsMenu.selectedOption = 0;
                    this.game.menuInstances.ingameAudioSettingsMenu.menuActive = false;
                } else if (this.game.menuInstances.skins.menuActive) {
                    this.game.menuInstances.skins.selectedOption = 0;
                    this.game.menuInstances.skins.menuActive = false;
                } else if (this.game.menuInstances.deleteProgress.menuActive) {
                    this.game.menuInstances.deleteProgress.selectedOption = 1;
                    this.game.menuInstances.deleteProgress.menuActive = false;
                } else if (this.game.menuInstances.deleteProgress2.menuActive) {
                    this.game.menuInstances.deleteProgress2.selectedOption = 1;
                    this.game.menuInstances.deleteProgress2.menuActive = false;
                }

                if (!(this.game.isPlayerInGame && this.game.currentMenu === this.game.menuInstances.ingameAudioSettingsMenu)) {
                    this.game.currentMenu = this.game.menuInstances.mainMenu;
                }
            }
        });
        window.addEventListener('keyup', e => {
            const lowercaseKey = e.key.length === 1 && e.key !== 'Enter' ? e.key.toLowerCase() : e.key;

            if (lowercaseKey === 'w') {
                this.isWKeyPressed = false;
            }

            if (lowercaseKey === 's' || lowercaseKey === 'w' || lowercaseKey === 'a' || lowercaseKey === 'd' ||
                lowercaseKey === 'q' || lowercaseKey === 'e' || lowercaseKey === 'Enter') {
                this.keys.splice(this.keys.indexOf(lowercaseKey), 1);
            } else if (lowercaseKey === 'arrowup') {
                this.arrowUpPressed = false;
            } else if (lowercaseKey === 'arrowdown') {
                this.arrowDownPressed = false;
            }
        });
    }
}
