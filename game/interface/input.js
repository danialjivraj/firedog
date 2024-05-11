export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = [];
        this.arrowUpPressed = false;
        this.arrowDownPressed = false;
        this.isWKeyPressed = false;

        window.addEventListener('keydown', e => {
            const lowercaseKey = e.key.length === 1 && e.key !== 'Enter' ? e.key.toLowerCase() : e.key;

            if (e.key === 'Enter' && this.keys.indexOf('Enter') === -1 && this.game.talkToPenguin && this.game.enterDuringBackgroundTransition) {
                this.keys.push('Enter');
                this.game.enterToTalkToPenguin = true;
            }

            if ((lowercaseKey === 's' || (lowercaseKey === 'w' && this.game.player.isUnderwater === false) || lowercaseKey === 'a' || lowercaseKey === 'd' ||
                lowercaseKey === 'q' || lowercaseKey === 'e' || lowercaseKey === 'Enter') && this.keys.indexOf(lowercaseKey) === -1 && this.game.enterDuringBackgroundTransition) {
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

            if (e.key === 'Escape') {
                if (this.game.isPlayerInGame) {
                    if (this.game.audioHandler.cutsceneSFX.isPlaying("battleStarting")) {
                        return;
                    }
                    if (!this.game.currentMenu && !this.game.cutsceneActive && !this.game.notEnoughCoins && !this.game.gameOver ||
                        this.game.cutsceneActive && this.game.enterDuringBackgroundTransition && (this.game.talkToElyvorg || this.game.talkToPenguin)) {
                        this.game.menu.pause.togglePause();
                    }
                }

                if (this.game.currentMenu && this.game.currentMenu !== this.game.menu.main && this.game.menu.forestMap.showSavingSprite === false) {
                    this.handleEscapeKey();
                }
            }
        });

        window.addEventListener('keyup', e => {
            const lowercaseKey = e.key.length === 1 && e.key !== 'Enter' ? e.key.toLowerCase() : e.key;

            if (lowercaseKey === 'w') {
                this.isWKeyPressed = false;
            }

            if ((lowercaseKey === 's' || lowercaseKey === 'w' || lowercaseKey === 'a' || lowercaseKey === 'd' ||
                lowercaseKey === 'q' || lowercaseKey === 'e' || lowercaseKey === 'Enter') && this.game.enterDuringBackgroundTransition) {
                this.keys.splice(this.keys.indexOf(lowercaseKey), 1);
            } else if (lowercaseKey === 'arrowup') {
                this.arrowUpPressed = false;
            } else if (lowercaseKey === 'arrowdown') {
                this.arrowDownPressed = false;
            }
        });

        document.addEventListener("mousedown", (event) => {
            if (!this.game.talkToElyvorg && this.game.enterDuringBackgroundTransition) {
                if (event.button === 0) {
                    this.keys.push('leftClick');
                } else if (event.button === 2) {
                    this.keys.push('rightClick');
                } else if (event.button === 1) {
                    this.keys.push('scrollClick');
                }
            }
        });

        document.addEventListener("mouseup", (event) => {
            if ((event.button === 0 || event.button === 2 || event.button === 1) && this.game.enterDuringBackgroundTransition) {
                const mouseClickType = event.button === 0 ? 'leftClick' : event.button === 2 ? 'rightClick' : 'scrollClick';
                const index = this.keys.indexOf(mouseClickType);
                if (index !== -1) {
                    this.keys.splice(index, 1);
                }
                if (event.button === 0 && this.game.talkToPenguin) {
                    this.game.enterToTalkToPenguin = true;
                }
            }
        });
    }

    enterOrRightClick(input) {
        if (input.includes('Enter') || input.includes('rightClick')) {
            return true;
        }
    }

    eOrScrollClick(input) {
        if (input.includes('e') || input.includes('scrollClick')) {
            return true;
        }
    }

    qOrLeftClick(input) {
        if (input.includes('q') || input.includes('leftClick')) {
            return true;
        }
    }

    handleEscapeKey() {
        if (this.game.currentMenu.menuInGame === false) {
            for (const menuKey in this.game.menu) {
                const menu = this.game.menu[menuKey];
                if (menu.menuActive) {
                    menu.activateMenu(0);
                    break;
                }
            }
            this.game.menu.howToPlay.currentImageIndex = 0;
            this.game.currentMenu = this.game.menu.main;
        } else {
            if (this.game.menu.pause.canEscape && !this.game.gameOver) {
                this.game.menu.pause.canEscape = false;
                this.game.menu.pause.togglePause();
            }
        }
    }
}
