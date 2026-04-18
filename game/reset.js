import { Player } from "./entities/player.js";

export class Reset {
    constructor(game) {
        this.game = game;
    }
    coinReset() {
        if (this.game.notEnoughCoins) {
            this.game.coins = Math.floor(0.1 * this.game.coins);
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
        if (this.game._recordToastTimeoutId) {
            clearTimeout(this.game._recordToastTimeoutId);
            this.game._recordToastTimeoutId = null;
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
        this.game.cabins = [];
        this.game.penguins = [];
        this.game.recordToasts = [];
        this.game.coinConvertToasts = [];
        // cutscene
        this.game.clearCutsceneState();
        // cabin
        this.game.cabinAppeared = false;
        this.game.cabin.isFullyVisible = false;
        this.game.cabin.x = this.game.width;
        // penguin
        this.game.penguinAppeared = false;
        this.game.talkToPenguin = false;
        this.game.enterToTalkToPenguin = false;
        this.game.talkToPenguinOneTimeOnly = true;
        // boss
        this.game.bossManager.resetState();
        this.game.bossTime = 0;
        this.game._bossFightWasActive = false;
        this.game._bossDefeatRecorded = false;
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
