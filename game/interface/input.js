import { getDefaultKeyBindings } from '../config/keyBindings.js';

export class InputHandler {
    constructor(game) {
        this.game = game;

        this.keys = [];
        this.arrowUpPressed = false;
        this.arrowDownPressed = false;
        this.isJumpKeyPressed = false;

        this._defaultBindings = getDefaultKeyBindings();

        // keyboard
        window.addEventListener('keydown', (e) => {
            const lowercaseKey = this.normalizeKey(e.key);

            if (
                e.key === 'Enter' &&
                this.game.enterDuringBackgroundTransition &&
                !(this.game.talkToElyvorg && this.game.isElyvorgFullyVisible) &&
                this.game.talkToPenguin
            ) {
                this.game.enterToTalkToPenguin = true;
            }

            const isGameplayKey = this.isMappedGameplayKey(lowercaseKey);

            const jumpNorm = this.getJumpKeyNorm();

            const jumpAllowed = !(lowercaseKey === jumpNorm && this.game.player.isUnderwater);

            if (
                isGameplayKey &&
                jumpAllowed &&
                this.keys.indexOf(lowercaseKey) === -1 &&
                this.game.enterDuringBackgroundTransition
            ) {
                if (!this.game.talkToElyvorg) {
                    this.keys.push(lowercaseKey);
                } else {
                    if (!this.game.isElyvorgFullyVisible) {
                        const forwardKey = this.keyForAction('moveForward') || 'd';
                        this.keys.push(forwardKey);
                    }
                }
            }

            if (
                lowercaseKey === 'b' &&
                this.game.isPlayerInGame &&
                this.game.menu.pause.isPaused === false &&
                this.game.tutorial.tutorialPause === false &&
                this.game.gameOver === false
            ) {
                this.game.audioHandler.firedogSFX.playSound('barkSound');
            }

            if (e.key === 'Tab' && this.game.canSelectForestMap) {
                if (this.game.currentMenu === this.game.menu.forestMap) {
                    this.game.menu.enemyLore.activateMenu();
                    this.game.audioHandler.menu.playSound('bookFlip', false, true);
                } else if (this.game.currentMenu === this.game.menu.enemyLore) {
                    this.game.menu.forestMap.activateMenu();
                    this.game.audioHandler.menu.playSound('bookFlip', false, true);
                }
            }

            if (lowercaseKey === 'm') {
                //this.game.debug = !this.game.debug;
            }

            if (lowercaseKey === 't' && this.game.currentMenu === this.game.menu.howToPlay) {
                this.game.audioHandler.menu.playSound('optionSelectedSound', false, true);
                this.game.isTutorialActive = !this.game.isTutorialActive;
                this.game.tutorial.tutorialPause = this.game.isTutorialActive === true;
                this.game.saveGameState();
            }

            if (
                lowercaseKey === jumpNorm &&
                this.game.player.isUnderwater &&
                this.game.enterDuringBackgroundTransition
            ) {
                if (!this.isJumpKeyPressed) {
                    this.isJumpKeyPressed = true;
                    this.keys.push(jumpNorm);
                }
            }

            if (e.key === 'Escape') {
                if (this.game.currentMenu && this.game.currentMenu.waitingForKey) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                if (this.game.isPlayerInGame) {
                    if (this.game.audioHandler.cutsceneSFX.isPlaying('battleStarting')) {
                        return;
                    }
                    if (
                        (!this.game.currentMenu && !this.game.cutsceneActive && !this.game.notEnoughCoins && !this.game.gameOver) ||
                        (this.game.cutsceneActive &&
                            this.game.enterDuringBackgroundTransition &&
                            (this.game.talkToElyvorg || this.game.talkToPenguin))
                    ) {
                        this.game.menu.pause.togglePause();
                    }
                }

                if (
                    this.game.currentMenu &&
                    this.game.currentMenu !== this.game.menu.main &&
                    this.game.menu.forestMap.showSavingSprite === false
                ) {
                    this.handleEscapeKey();
                }
                return;
            }
        });

        window.addEventListener('keyup', (e) => {
            const lowercaseKey = this.normalizeKey(e.key);
            const jumpNorm = this.getJumpKeyNorm();

            if (lowercaseKey === jumpNorm) {
                this.isJumpKeyPressed = false;
            }

            if (this.isMappedGameplayKey(lowercaseKey)) {
                const idx = this.keys.indexOf(lowercaseKey);
                if (idx !== -1) this.keys.splice(idx, 1);
            } else if (lowercaseKey === 'arrowup') {
                this.arrowUpPressed = false;
            } else if (lowercaseKey === 'arrowdown') {
                this.arrowDownPressed = false;
            }
        });

        // mouse
        document.addEventListener('mousedown', (event) => {
            if (!this.game.talkToElyvorg && this.game.enterDuringBackgroundTransition) {
                if (event.button === 0) {
                    if (this.keys.indexOf('leftClick') === -1) this.keys.push('leftClick');
                } else if (event.button === 2) {
                    if (this.keys.indexOf('rightClick') === -1) this.keys.push('rightClick');
                } else if (event.button === 1) {
                    if (this.keys.indexOf('scrollClick') === -1) this.keys.push('scrollClick');
                }
            }
        });

        document.addEventListener('mouseup', (event) => {
            if ((event.button === 0 || event.button === 2 || event.button === 1) && this.game.enterDuringBackgroundTransition) {
                const mouseClickType =
                    event.button === 0 ? 'leftClick' : event.button === 2 ? 'rightClick' : 'scrollClick';
                const index = this.keys.indexOf(mouseClickType);
                if (index !== -1) this.keys.splice(index, 1);

                if (event.button === 0 && this.game.talkToPenguin) {
                    this.game.enterToTalkToPenguin = true;
                }
            }
        });
    }

    // helpers
    normalizeKey(key) {
        if (!key) return key;
        if (key.length === 1 && key !== 'Enter') return key.toLowerCase();
        return key;
    }

    _bindingsObject() {
        return (this.game.getEffectiveKeyBindings && this.game.getEffectiveKeyBindings())
            || this.game.keyBindings
            || this._defaultBindings
            || {};
    }

    getJumpKeyNorm() {
        return this.keyForAction('jump');
    }

    keyForAction(action) {
        const kbObj = this._bindingsObject();
        if (!kbObj) return null;

        const raw = kbObj[action];

        if (!raw) return null;
        return raw.length === 1 ? raw.toLowerCase() : raw;
    }

    isKeyForAction(key, action) {
        const binding = this.keyForAction(action);
        if (!binding) return false;
        return key === binding;
    }

    isMappedGameplayKey(key) {
        const ACTIONS = [
            'jump',
            'moveBackward',
            'sit',
            'moveForward',
            'rollAttack',
            'diveAttack',
            'fireballAttack',
            'invisibleDefense',
        ];
        return ACTIONS.some((a) => this.isKeyForAction(key, a));
    }

    isActionActive(action, input) {
        const kb = this.keyForAction(action);
        const kbPressed = kb ? input.includes(kb) : false;

        let active = kbPressed;
        if (action === 'rollAttack') {
            active = kbPressed || input.includes('rightClick');
        } else if (action === 'fireballAttack') {
            active = kbPressed || input.includes('leftClick');
        } else if (action === 'invisibleDefense') {
            active = kbPressed || input.includes('scrollClick');
        }
        return active ? true : undefined;
    }

    isRollAttack(input) { return this.isActionActive('rollAttack', input); }
    isInvisibleDefense(input) { return this.isActionActive('invisibleDefense', input); }
    isFireballAttack(input) { return this.isActionActive('fireballAttack', input); }

    handleEscapeKey() {
        if (this.game.currentMenu && this.game.currentMenu.waitingForKey) {
            this.game.currentMenu.waitingForKey = false;
            this.game.currentMenu.waitingAction = null;
            return;
        }

        if (this.game.currentMenu.menuInGame === false) {
            if (this.game.currentMenu !== this.game.menu.enemyLore) {
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
                this.game.audioHandler.menu.playSound('bookFlip', false, true);
                this.game.menu.forestMap.activateMenu();
            }
        } else {
            if (this.game.menu.pause.canEscape && !this.game.gameOver) {
                this.game.menu.pause.canEscape = false;
                this.game.menu.pause.togglePause();
            }
        }
    }
}
