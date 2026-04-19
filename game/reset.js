import { Player } from "./entities/player.js";
import { COIN_LOSS_KEEP_RATE } from "./config/constants.js";

export class Reset {
    constructor(game) {
        this.game = game;
    }
    coinReset() {
        if (this.game.notEnoughCoins) {
            this.game.coins = Math.floor(COIN_LOSS_KEEP_RATE * this.game.coins);
        } else {
            this.game.coins = 0;
        }
    }
    reset({ preserveTime = false } = {}) {
        // if during a cutscene
        const cs = this.game.currentCutscene;
        if (cs && typeof cs.removeEventListeners === "function") {
            cs.removeEventListeners();
        }
        // record
        if (this.game._animatedToastTimeoutId) {
            clearTimeout(this.game._animatedToastTimeoutId);
            this.game._animatedToastTimeoutId = null;
        }
        // shake
        this.game.stopShake();
        // distortion
        this.game.distortionActive = false;
        if (this.game.distortionEffect && this.game.distortionEffect.reset) {
            this.game.distortionEffect.reset();
        }
        // tutorial
        this.game.tutorial.elapsedTime = 0;
        this.game.tutorial.currentStepIndex = 0;
        this.game.tutorial.tutorialPause = true;
        // game variables
        this.game.speed = 0;
        if (!preserveTime) {
            this.game.time = 0;
        }
        this.game.invisibleColourOpacity = 0;
        this.game.gameOver = false;
        this.coinReset();
        if (this.game.UI) this.game.UI.resetTransientUiState();
        this.game.notEnoughCoins = false;
        this.game._fullClearRecorded = false;
        // player
        this.game.player = new Player(this.game);
        this.game.player.currentState = this.game.player.states[0];
        this.game.player.currentState.enter();
        // audio handlers
        this.game.audioHandler.mapSoundtrack.stopAllSounds();
        this.game.audioHandler.firedogSFX.stopAllSounds();
        this.game.audioHandler.enemySFX.stopAllSounds();
        this.game.audioHandler.collisionSFX.stopAllSounds();
        this.game.audioHandler.powerUpAndDownSFX.stopAllSounds();
        this.game.audioHandler.cutsceneMusic.stopAllSounds();
        this.game.audioHandler.cutsceneSFX.stopAllSounds();
        this.game.audioHandler.cutsceneDialogue.stopAllSounds();
        // arrays
        this.game.enemies = [];
        this.game.behindPlayerParticles = [];
        this.game.particles = [];
        this.game.collisions = [];
        this.game.floatingMessages = [];
        this.game.powerUps = [];
        this.game.powerDowns = [];
        this.game.animatedToasts = [];
        this.game.coinConvertToasts = [];
        // cutscene
        this.game.clearCutsceneState();
        // cabin
        this.game.cabinAppeared = false;
        this.game.cabin.isFullyVisible = false;
        this.game.cabin.x = this.game.width;
        // penguin
        this.game.penguinAppeared = false;
        if (this.game.penguini) {
            this.game.penguini.x = this.game.width;
            this.game.penguini.showEnterToTalkToPenguini = false;
        }
        this.game.talkToPenguin = false;
        this.game.enterToTalkToPenguin = false;
        this.game.talkToPenguinOneTimeOnly = true;
        // boss
        this.game.bossManager.resetState();
        // tips
        if (this.game.UI) this.game.UI.resetTip();
        // level difficulty
        this.game.menu.difficulty.applyCurrentSettings();
        // selecting map
        const MapClass = this.game.background.constructor;
        if (MapClass) {
            const selectedMap = new MapClass(this.game);
            this.game.menu.forestMap.applyMapOption(
                this.game.menu.forestMap.getMapOptionByClass(MapClass)
            );
            this.game.menu.forestMap.setMap(selectedMap);
        }
    }
}
