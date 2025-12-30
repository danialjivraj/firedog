import { Map1, Map2, Map3, Map4, Map5, Map6, Map7, BonusMap1, BonusMap2, BonusMap3 } from "./background/background.js";
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
    reset() {
        // if during a cutscene
        if (this.game.currentCutscene !== null) {
            this.game.currentCutscene.removeEventListeners();
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
        this.game.time = 0;
        this.game.invisibleColourOpacity = 0;
        this.game.gameOver = false;
        this.coinReset();
        this.game.notEnoughCoins = false;
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
        this.game.endCutscene();
        this.game.cutscenes = [];
        this.game.isEndCutscene = false;
        this.game.input.keys = [];
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
        // level difficulty
        this.game.menu.levelDifficulty.setDifficulty(this.game.selectedDifficulty);
        // selecting map
        let selectedMap;
        switch (this.game.background.constructor) {
            case Map1:
                selectedMap = new Map1(this.game);
                break;
            case Map2:
                selectedMap = new Map2(this.game);
                this.game.player.isDarkWhiteBorder = true;
                break;
            case Map3:
                selectedMap = new Map3(this.game);
                this.game.player.isUnderwater = true;
                break;
            case Map4:
                selectedMap = new Map4(this.game);
                break;
            case Map5:
                selectedMap = new Map5(this.game);
                break;
            case Map6:
                selectedMap = new Map6(this.game);
                break;
            case Map7:
                selectedMap = new Map7(this.game);
                this.game.maxDistance = 9999999;
                break;
            case BonusMap1:
                selectedMap = new BonusMap1(this.game);
                this.game.maxDistance = 9999999;
                this.game.player.isIce = true;
                break;
            case BonusMap2:
                selectedMap = new BonusMap2(this.game);
                break;
            case BonusMap3:
                selectedMap = new BonusMap3(this.game);
                this.game.maxDistance = 9999999;
                this.game.player.isSpace = true;
                break;
            default:
                break;
        }
        this.game.menu.forestMap.setMap(selectedMap);
    }
}
