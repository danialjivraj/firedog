import { Player } from "./entities/player.js";
import { DistortionEffect } from "./animations/distortion.js";
import { SpinningChicks } from "./animations/particles.js";
import { AnimatedToast } from "./interface/animatedToast.js";
import { formatTimeMs } from "./utils/formatTime.js";
import { ImmobileGroundEnemy } from "./entities/enemies/enemies.js";
import { POWER_UP_SPAWN_CONFIG, POWER_DOWN_SPAWN_CONFIG } from "./config/itemSpawnConfig.js";
import { PENGUIN_CUTSCENES, END_CUTSCENES, BOSS_CUTSCENE_CONFIGS, CABIN_ENTRANCE_OVERRIDES } from "./config/cutsceneConfig.js";
// ingame
import { Reset } from "./reset.js";
import { PauseMenu } from "./menu/pauseMenu.js";
import { GameOverMenu } from "./menu/gameOverMenu.js";
// ui
import { InputHandler } from "./interface/input.js";
import { UI } from "./interface/UI.js";
import { Tutorial } from "./interface/tutorial.js";
// menus
import { MainMenu } from "./menu/mainMenu.js";
import { DifficultyMenu } from "./menu/difficultyMenu.js";
import { ForestMapMenu } from "./menu/forestMap.js";
import { HowToPlayMenu } from "./menu/howToPlay/howToPlayMenu.js";
import { Wardrobe } from "./menu/wardrobe/wardrobeMenu.js";
import { RecordsMenu } from "./menu/recordsMenu.js";
import { DeleteProgress, DeleteProgress2 } from "./menu/deleteProgress.js";
import { SettingsMenu } from "./menu/settingsMenu.js";
import { ControlsSettingsMenu } from "./menu/controlsSettingsMenu.js";
import { InterfaceMenu } from "./menu/interfaceMenu.js";
import { getDefaultKeyBindings } from "./config/keyBindings.js";
// audios
import { AudioSettingsMenu } from "./menu/audioSettingsMenu.js";
import {
    MenuAudioHandler, FiredogAudioHandler, EnemySFXAudioHandler, CollisionSFXAudioHandler, MapSoundtrackAudioHandler,
    PowerUpAndDownSFXAudioHandler, CutsceneMusicAudioHandler, CutsceneDialogueAudioHandler, CutsceneSFXAudioHandler
} from "./audioHandler.js";
// animations
import { fadeIn } from "./animations/fading.js";
import { screenColourFadeIn, screenColourFadeOut } from "./animations/screenColourFade.js";
import { EnemyLore } from "./menu/enemyLore.js";
import {
    saveGameState as persistGameState,
    loadGameState as restoreGameState,
    clearSavedData as resetPersistedData
} from "./persistence/gamePersistence.js";
import { BossManager } from "./entities/enemies/bosses/bossManager.js";
import { SKINS, GIFT_SKINS } from "./config/skinsAndCosmetics.js";
import { MenuNavigator } from "./menu/menuNavigator.js";
import { CoinConvertToast } from "./interface/coinConvertToast.js";
import { getEnemySpawnConfig } from "./config/enemySpawnConfig.js";
import {
    NORMAL_SPEED, GROUND_MARGIN, MAX_TIME_UNDERWATER_MS,
    MAX_PARTICLES, MAX_ENEMIES,
    ENEMY_INTERVAL_MS, NON_ENEMY_INTERVAL_MS,
    GameState, FULL_ENERGY,
    ENEMY_SPAWN_DISTANCE_BUFFER, ITEM_SPAWN_DISTANCE_BUFFER,
    MAX_CREDIT_COINS, TOAST_Y,
    CABIN_COLLISION_OFFSET, PENGUIN_OFFSET_FROM_CABIN,
    CUTSCENE_INPUT_DEBOUNCE_MS, LOOPING_SOUND_FADE_OUT_MS,
    MAX_DISTANCE, WINNING_COINS,
} from "./config/constants.js";

export { GameState };

export class Game {
    constructor(canvas, width, height) {
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        // general
        this.speed = 0;
        this.normalSpeed = NORMAL_SPEED;
        this.groundMargin = GROUND_MARGIN;
        this.maxDistance = MAX_DISTANCE;
        this.winningCoins = WINNING_COINS;
        this.coins = 0;
        this.notEnoughCoins = false;
        this.surplusCoins = 0;
        this.time = 0;
        this.hiddenTime = 0;
        this.maxTimeUnderwater = MAX_TIME_UNDERWATER_MS;
        this.maxParticles = MAX_PARTICLES;
        this.maxEnemies = MAX_ENEMIES;
        this.enemyTimer = 0;
        this.enemyInterval = ENEMY_INTERVAL_MS;
        this.nonEnemyTimer = 0;
        this.nonEnemyInterval = NON_ENEMY_INTERVAL_MS;
        this.invisibleColourOpacity = 0;
        this.gameOver = false;
        this.debug = false;
        // credit coins and skins/cosmetics
        this.creditCoins = 0;
        this.ownedSkins = {};
        this.ownedCosmetics = {};
        this.metaToasts = [];
        this.coinConvertToasts = [];
        this._announcedGiftSkins = {};
        this._pendingCoinConvertAmount = 0;
        // player/audio handlers/menus/etc classes and vars...
        this.player = new Player(this);
        this.player.currentState = this.player.states[0];
        this.player.currentState.enter();
        this.uiLayoutStyle = "compact";
        this.input = new InputHandler(this);
        this.UI = new UI(this);
        this.background = null;
        this.cabin = null;
        this.penguini = null;
        this.fontColor = "black";
        this.resetInstance = new Reset(this);
        this.audioHandler = {
            mapSoundtrack: new MapSoundtrackAudioHandler(this),
            menu: new MenuAudioHandler(this),
            cutsceneDialogue: new CutsceneDialogueAudioHandler(this),
            cutsceneSFX: new CutsceneSFXAudioHandler(this),
            cutsceneMusic: new CutsceneMusicAudioHandler(this),
            enemySFX: new EnemySFXAudioHandler(this),
            firedogSFX: new FiredogAudioHandler(this),
            collisionSFX: new CollisionSFXAudioHandler(this),
            powerUpAndDownSFX: new PowerUpAndDownSFXAudioHandler(this),
        };
        this.isTutorialActive = true;
        this.noDamageDuringTutorial = false;
        this.tutorial = new Tutorial(this);
        this.keyBindings = getDefaultKeyBindings();
        this._defaultKeyBindings = getDefaultKeyBindings();
        this.menu = {
            main: new MainMenu(this),
            forestMap: new ForestMapMenu(this),
            enemyLore: new EnemyLore(this),
            wardrobe: new Wardrobe(this),
            records: new RecordsMenu(this),
            difficulty: new DifficultyMenu(this),
            howToPlay: new HowToPlayMenu(this),
            settings: new SettingsMenu(this),
            audioSettings: new AudioSettingsMenu(this),
            controlsSettings: new ControlsSettingsMenu(this),
            interfaceSettings: new InterfaceMenu(this),
            deleteProgress: new DeleteProgress(this),
            deleteProgress2: new DeleteProgress2(this),
            pause: new PauseMenu(this),
            gameOver: new GameOverMenu(this),
        };
        this.nav = new MenuNavigator(this);
        this.nav.setRoot(this.menu.main, 0);
        this.currentMenu = this.menu.main;
        this.canSelect = true;
        this.canSelectForestMap = true;
        this.currentMap = null;
        this.powerUpSpawnMultiplier = 1;
        this.powerDownSpawnMultiplier = 1;
        this.map1Unlocked = true;
        this.map2Unlocked = false;
        this.map3Unlocked = false;
        this.map4Unlocked = false;
        this.map5Unlocked = false;
        this.map6Unlocked = false;
        this.map7Unlocked = false;
        this.bonusMap1Unlocked = false;
        this.bonusMap2Unlocked = false;
        this.bonusMap3Unlocked = false;
        this.glacikalDefeated = false;
        this.elyvorgDefeated = false;
        this.ntharaxDefeated = false;
        this.isPlayerInGame = false;
        // records
        this.records = {
            Map1: { clearMs: null, bossMs: null },
            Map2: { clearMs: null, bossMs: null },
            Map3: { clearMs: null, bossMs: null },
            Map4: { clearMs: null, bossMs: null },
            Map5: { clearMs: null, bossMs: null },
            Map6: { clearMs: null, bossMs: null },
            Map7: { clearMs: null, bossMs: null },
            BonusMap1: { clearMs: null, bossMs: null },
            BonusMap2: { clearMs: null, bossMs: null },
            BonusMap3: { clearMs: null, bossMs: null },
        };
        this._fullClearRecorded = false;
        // arrays
        this.enemies = [];
        this.powerUps = [];
        this.powerDowns = [];
        this.behindPlayerParticles = [];
        this.particles = [];
        this.collisions = [];
        this.floatingMessages = [];
        this.cutscenes = [];
        this.animatedToasts = [];
        // cabin / penguin spawn state
        this.cabinAppeared = false;
        this.penguinAppeared = false;
        this.fixedCabinX = 0;
        this.fixedPenguinX = 0;
        // deferred toasts
        this._pendingClearToast = null;
        this._animatedToastTimeoutId = null;
        // cutscene
        this.cutsceneActive = false;
        this.currentCutscene = null;
        this.enterDuringBackgroundTransition = true;
        this.isEndCutscene = false;
        this.fadingIn = false;
        this.fadingInInitiated = false;
        this.waitForFadeInOpacity = false;
        this.ignoreCutsceneInputUntil = 0;
        this.pauseContext = 'gameplay';
        // penguin
        this.talkToPenguin = false;
        this.enterToTalkToPenguin = false;
        this.talkToPenguinOneTimeOnly = true;
        // boss
        this.bossManager = new BossManager(this);
        // shake
        this.shakeActive = false;
        this.shakeTimer = 0;
        this.shakeDuration = 0;
        // distortion
        this.distortionActive = false;
        this.distortionEffect = new DistortionEffect(this);
        // loading game state
        this.loadGameState();
    }

    get boss() {
        return this.bossManager.state;
    }

    // ------------------------------------------------------------ Game Class logic ------------------------------------------------------------

    setMenuRoot(menu, arg = 0) {
        if (!this.nav) return;
        this.nav.setRoot(menu, arg);
    }

    openMenu(menu, arg = 0) {
        if (!this.nav) return;
        this.nav.open(menu, arg);
    }

    goBackMenu() {
        if (!this.nav) return;
        this.nav.back();
    }

    startCutscene(cutscene) {
        this.fadingIn = true;
        this.cutsceneActive = true;
        this.currentCutscene = cutscene;
    }

    launchCutscene(CutsceneClass) {
        const cutscene = new CutsceneClass(this);
        this.startCutscene(cutscene);
        cutscene.displayDialogue();
        this.cutscenes.push(cutscene);
        return cutscene;
    }

    showMetaToast(text, delayMs = 200) {
        setTimeout(() => {
            this.metaToasts.push(new AnimatedToast(this, text, { y: TOAST_Y }));
            this.audioHandler.mapSoundtrack.playSound('newRecordSound', false, true);
        }, Math.max(0, delayMs));
    }

    announceEndCutsceneRewards({ delayMs = 450 } = {}) {
        this.announceGiftSkins({ delayMs });
        this.showCoinConvertToast();
    }

    showCoinConvertToast() {
        if (this._pendingCoinConvertAmount <= 0) return;
        const amount = this._pendingCoinConvertAmount;
        this._pendingCoinConvertAmount = 0;
        setTimeout(() => {
            this.coinConvertToasts.push(new CoinConvertToast(this, amount));
        }, 600);
    }

    announceGiftSkins({ delayMs = 450 } = {}) {
        let announcedAny = false;

        for (const gift of GIFT_SKINS) {
            if (!this[gift.flag]) continue;
            if (this._announcedGiftSkins[gift.key]) continue;

            this._announcedGiftSkins[gift.key] = true;
            announcedAny = true;

            const skin = SKINS[gift.key];
            const label = skin?.label ?? gift.key;
            const labelFill = skin?.giftColor ?? "yellow";

            this.showMetaToast([
                [{ text: "NEW SKIN UNLOCKED!", fill: "yellow" }],
                [
                    { text: "YOU'VE RECEIVED THE ", fill: "yellow" },
                    { text: label, fill: labelFill },
                    { text: " SKIN!", fill: "yellow" },
                ],
            ], delayMs);
        }

        if (announcedAny) {
            this.saveGameState();
        }

        return announcedAny;
    }

    endCutscene() {
        const wasEndCutscene = !!this.isEndCutscene;

        this.cutsceneActive = false;
        this.currentCutscene = null;
        this.pauseContext = 'gameplay';
        this.currentMenu = null;
        if (this.input) this.input.clearAll();
        if (
            this.cabin &&
            this.player.x + this.player.width >= this.cabin.x + CABIN_COLLISION_OFFSET &&
            this.player.x <= this.cabin.x + this.cabin.width
        ) {
            this.reset();
            this.isPlayerInGame = false;
            if (wasEndCutscene) {
                this.announceEndCutsceneRewards({ delayMs: 450 });
            }
            if (this.currentMap !== 'Map7') {
                this.canSelectForestMap = false;
                this.nav.root = this.menu.main;
                this.nav.stack = [{ menu: this.menu.main, state: this.menu.main.getNavState() }];
                this.currentMenu = this.menu.forestMap;
                this.menu.forestMap.showSavingSprite = true;

                setTimeout(() => {
                    this.canSelectForestMap = true;
                    this.menu.forestMap.showSavingSprite = false;

                    const bgName =
                        this.background && this.background.constructor
                            ? this.background.constructor.name
                            : null;

                    this.menu.forestMap.selectNextAfterClear(bgName);
                }, 4000);
            } else {
                this.menu.main.showSavingSprite = true;
                this.canSelect = false;
                this.currentMenu = this.menu.main;
                setTimeout(() => {
                    this.menu.main.showSavingSprite = false;
                    this.canSelect = true;
                }, 4000);
            }
        }
    }

    clearCutsceneState() {
        this.cutsceneActive = false;
        this.currentCutscene = null;
        this.isEndCutscene = false;
        this.pauseContext = 'gameplay';
        this.currentMenu = null;
        this.cutscenes = [];

        if (this.input) this.input.clearAll();
    }

    restartActiveCutscene() {
        const cs = this.currentCutscene;
        if (!cs) return;
        this.stopShake();

        if (typeof cs.removeEventListeners === 'function') cs.removeEventListeners();
        if (typeof cs.stopAllAudio === 'function') cs.stopAllAudio();

        const CutsceneClass = cs.constructor;
        const fresh = new CutsceneClass(this);

        this.startCutscene(fresh);
        fresh.displayDialogue();

        this.ignoreCutsceneInputUntil = performance.now() + CUTSCENE_INPUT_DEBOUNCE_MS;
    }

    exitCutsceneToMainMenu() {
        const cs = this.currentCutscene;
        if (cs && typeof cs.removeEventListeners === 'function') cs.removeEventListeners();
        if (cs && typeof cs.stopAllAudio === 'function') cs.stopAllAudio();

        this.cutsceneActive = false;
        this.currentCutscene = null;
        this.fadingIn = false;
        this.waitForFadeInOpacity = false;
        this.enterDuringBackgroundTransition = true;
        this.isEndCutscene = false;
        this.isPlayerInGame = false;

        this.menu.pause.isPaused = false;
        this.pauseContext = 'gameplay';
        this.currentMenu = this.menu.main;
    }

    goToMainMenuWithSavingAnimation(durationMs = 4000) {
        this.input && (this.input.keys = []);

        this.currentMenu = this.menu.main;
        this.menu.main.showSavingSprite = true;

        this.canSelect = false;
        this.canSelectForestMap = false;

        this.enterDuringBackgroundTransition = false;
        fadeIn(this.canvas, 1300, () => {
            this.enterDuringBackgroundTransition = true;
        });

        setTimeout(() => {
            this.menu.main.showSavingSprite = false;
            this.canSelect = true;
            this.canSelectForestMap = true;
        }, durationMs);
    }

    startShake(durationMs = 0, { ifNotActive = false } = {}) {
        if (ifNotActive && this.shakeActive) return;

        if (this.shakeActive && this.shakeDuration === 0) return;

        this.shakeActive = true;
        this.shakeTimer = 0;
        this.shakeDuration = Math.max(0, durationMs);
    }

    stopShake() {
        this.shakeActive = false;
        this.shakeTimer = 0;
        this.shakeDuration = 0;
    }

    showAnimatedToast(text, delayMs = 200) {
        if (this._animatedToastTimeoutId) {
            clearTimeout(this._animatedToastTimeoutId);
            this._animatedToastTimeoutId = null;
        }

        this._animatedToastTimeoutId = setTimeout(() => {
            this._animatedToastTimeoutId = null;
            this.animatedToasts.push(new AnimatedToast(this, text, { y: TOAST_Y }));
            this.audioHandler.mapSoundtrack.playSound('newRecordSound', false, true);
        }, Math.max(0, delayMs));
    }

    getEffectiveKeyBindings() {
        const tutorialMapActive =
            this.isTutorialActive && this.currentMap === "Map1";
        if (tutorialMapActive) {
            return this._defaultKeyBindings;
        }
        if (this.player && this.player.isConfused && this.player.confusedKeyBindings) {
            return this.player.confusedKeyBindings;
        }
        return this.keyBindings;
    }

    hasMetWinningCoins() {
        const required = Number(this.winningCoins) || 0;
        return this.coins >= required;
    }

    resetBossTimer() {
        this.bossManager.resetBossTimer();
    }

    onBossDefeated(bossId) {
        this.bossManager.onBossDefeated(bossId);
    }

    updateBestFullClearRecord() {
        if (!this.hasMetWinningCoins()) return;

        const mapKey = this.currentMap;
        if (!mapKey || !this.records || !this.records[mapKey]) return;

        const newMs = Math.max(0, Math.floor(this.time));
        const prev = this.records[mapKey].clearMs;

        if (prev == null || newMs < prev) {
            this.records[mapKey].clearMs = newMs;
            this.saveGameState();

            const t = formatTimeMs(newMs, 2);
            this._pendingClearToast = [
                [{ text: "NEW RECORD!", fill: "yellow" }],
                [{ text: "MAP CLEARED IN ", fill: "yellow" }, { text: t, fill: "orange" }],
            ];
        }
    }

    reset(opts) {
        this.resetInstance.reset(opts);
    }

    get bossTime() {
        return this.bossManager.bossTime;
    }
    set bossTime(v) {
        this.bossManager.bossTime = v;
    }

    get hasActiveBoss() {
        return this.bossManager.hasActiveBoss;
    }
    get isBossVisible() {
        return this.bossManager.isBossVisible;
    }
    get bossInFight() {
        return this.bossManager.bossInFight;
    }

    get gameState() {
        if (this.cutsceneActive && !this.talkToPenguin && !(this.boss && this.boss.talkToBoss)) {
            return GameState.CUTSCENE;
        }
        if (this.currentMenu && this.currentMenu.menuInGame === false) {
            return GameState.MENU;
        }
        if (this.isPlayerInGame) {
            return GameState.GAMEPLAY;
        }
        return GameState.MENU;
    }

    // ------------------------------------------------------------ Update ------------------------------------------------------------

    update(deltaTime) {
        if (
            this.background &&
            this.background.constructor &&
            this.currentMap !== this.background.constructor.name
        ) {
            this.currentMap = this.background.constructor.name;
        }

        const tutorialMapActive = this.isTutorialActive && this.currentMap === "Map1";
        if (tutorialMapActive) {
            this.tutorial.update(deltaTime);
            this.noDamageDuringTutorial = true;
        } else {
            this.tutorial.tutorialPause = false;
            this.noDamageDuringTutorial = false;
        }

        if (!this.menu.pause.isPaused && this.tutorial.tutorialPause === false) {
            this._updateBossTimers(deltaTime);
            this._updateGameTimers(deltaTime);
            if (this.background) this.background.update(deltaTime);
            this._updateSpawnTimers(deltaTime, tutorialMapActive);
            this.hiddenTime += deltaTime;
            this._updateShakeTimer(deltaTime);
            this.player.update(this.input.keys, deltaTime);
            this.coins = Math.max(0, this.coins);
            this._updateEntities(deltaTime);
            this._cleanupEntities();
            this._checkPenguinCutscene();
            this._checkBossCutscenes();
            this._checkCabinEntrance();
            if (this.distortionActive || this.distortionEffect.amount > 0.01) {
                this.distortionEffect.update(deltaTime);
            }
        }

        this._updateScreenEffects(deltaTime);
    }

    _updateBossTimers(deltaTime) {
        this.bossManager.updateBossTimers(deltaTime);
    }

    _updateGameTimers(deltaTime) {
        if (this.cabin && this.cabin.isFullyVisible) {
            if (!this._fullClearRecorded && this.hasMetWinningCoins()) {
                this._fullClearRecorded = true;
                this.updateBestFullClearRecord();
            }
        } else if (!this.gameOver) {
            this.time += deltaTime;
            if (this.time > this.maxTimeUnderwater && this.player.isUnderwater) {
                this.audioHandler.firedogSFX.playSound('gettingHit', false, true);
                this.gameOver = true;
            }
        } else {
            this.speed = 0;
        }
    }

    _updateSpawnTimers(deltaTime, tutorialMapActive) {
        if (this.cabin && this.cabin.isFullyVisible) return;

        if (this.enemyTimer > this.enemyInterval) {
            if (!tutorialMapActive) this.addEnemy();
            this.enemyTimer = 0;
        } else {
            this.enemyTimer += deltaTime;
        }

        if (this.nonEnemyTimer > this.nonEnemyInterval) {
            if (!tutorialMapActive) {
                this.addPowerUp();
                this.addPowerDown();
            }
            if (this.background && this.background.totalDistanceTraveled >= this.maxDistance) {
                if (!this.cabinAppeared) {
                    this.cabinAppeared = true;
                    this.fixedCabinX = this.width - this.cabin.width;
                }
                if (!this.penguinAppeared) {
                    this.penguinAppeared = true;
                    this.fixedPenguinX = this.width - this.cabin.width - PENGUIN_OFFSET_FROM_CABIN;
                    this.talkToPenguin = true;
                }
            }
            this.nonEnemyTimer = 0;
        } else {
            this.nonEnemyTimer += deltaTime;
        }
    }

    _updateShakeTimer(deltaTime) {
        if (this.shakeActive && this.shakeDuration > 0) {
            this.shakeTimer += deltaTime;
            if (this.shakeTimer >= this.shakeDuration) {
                this.stopShake();
            }
        }
    }

    _updateEntities(deltaTime) {
        this.powerUps.forEach(p => p.update(deltaTime));
        this.powerDowns.forEach(p => p.update(deltaTime));
        this.enemies.forEach(e => e.update(deltaTime));
        this.floatingMessages.forEach(m => m.update(deltaTime));
        this.animatedToasts.forEach(t => t.update(deltaTime));
        if (this.cabinAppeared && this.cabin) this.cabin.update(deltaTime);
        if (this.penguinAppeared && this.penguini) this.penguini.update(deltaTime);
        this.behindPlayerParticles.forEach(p => p.update(deltaTime));
        this.particles.forEach(p => p.update(deltaTime));

        if (this.particles.length > this.maxParticles) {
            const keep = [];
            const evictable = [];
            for (const p of this.particles) {
                if (p instanceof SpinningChicks) keep.push(p);
                else evictable.push(p);
            }
            const roomForEvictable = Math.max(0, this.maxParticles - keep.length);
            this.particles = keep.concat(evictable.slice(0, roomForEvictable));
        }

        this.collisions.forEach(c => c.update(deltaTime));
    }

    _cleanupEntities() {
        const removedEnemies = this.enemies.filter(e => e.markedForDeletion);
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);
        for (const enemy of removedEnemies) {
            if (!enemy.loopingSoundId) continue;
            if (this.enemies.some(e => e.loopingSoundId === enemy.loopingSoundId)) continue;
            if (enemy.loopingSoundFadeOut) {
                if (this.audioHandler.enemySFX.isPlaying(enemy.loopingSoundId)) {
                    this.audioHandler.enemySFX.fadeOutAndStop(enemy.loopingSoundId, LOOPING_SOUND_FADE_OUT_MS);
                }
            } else {
                this.audioHandler.enemySFX.stopSound(enemy.loopingSoundId);
            }
        }

        this.powerUps = this.powerUps.filter(p => !p.markedForDeletion);
        this.powerDowns = this.powerDowns.filter(p => !p.markedForDeletion);
        this.behindPlayerParticles = this.behindPlayerParticles.filter(p => !p.markedForDeletion);
        this.particles = this.particles.filter(p => !p.markedForDeletion);
        this.collisions = this.collisions.filter(c => !c.markedForDeletion);
        this.floatingMessages = this.floatingMessages.filter(m => !m.markedForDeletion);
        this.animatedToasts = this.animatedToasts.filter(t => !t.markedForDeletion);
    }

    _checkPenguinCutscene() {
        if (!this.talkToPenguin || !this.talkToPenguinOneTimeOnly || !this.enterToTalkToPenguin) return;

        this.enterToTalkToPenguin = false;
        const CutsceneClass = PENGUIN_CUTSCENES[this.currentMap];
        if (CutsceneClass) this.launchCutscene(CutsceneClass);
    }

    _checkBossCutscenes() {
        if (!this.background || !this.hasActiveBoss || !this.isBossVisible || this.player.x > 0) return;

        const boss = this.boss;

        for (const cfg of BOSS_CUTSCENE_CONFIGS) {
            if (this.currentMap !== cfg.mapName) continue;
            if (boss.id !== cfg.bossId) continue;

            if (boss.dialogueBeforeOnce) {
                boss.preFight = true;
                boss.postFight = false;
                boss.dialogueBeforeOnce = false;

                this.bossManager.preparePlayerForBossFight();

                this.launchCutscene(cfg.beforeCutscene);
                break;
            }

            if (boss.dialogueAfterOnce && boss.startAfterDialogueWhenAnimEnds) {
                boss.preFight = false;
                boss.postFight = true;
                boss.dialogueAfterOnce = false;
                boss.dialogueAfterLeaving = true;

                this.player.energy = FULL_ENERGY;

                this.launchCutscene(cfg.afterCutscene);
                break;
            }
        }
    }

    _checkCabinEntrance() {
        const overrides = CABIN_ENTRANCE_OVERRIDES[this.currentMap] || {};
        const enterCabin = overrides.enterOffset ?? 290;
        const openDoor = overrides.doorSound ?? "doorOpening";

        if (
            this.cabin &&
            this.player.x + this.player.width >= this.cabin.x + enterCabin &&
            this.player.x <= this.cabin.x + this.cabin.width &&
            this.cabin.isFullyVisible
        ) {
            const coinsNow = Math.max(0, Math.floor(this.coins));
            if (coinsNow > 0) {
                const before = Math.max(0, Math.floor(this.creditCoins || 0));
                this.creditCoins = Math.min(MAX_CREDIT_COINS, before + coinsNow);
                this._pendingCoinConvertAmount = this.creditCoins - before;
                this.saveGameState();
            }

            this.audioHandler.cutsceneSFX.playSound(openDoor);
            this.audioHandler.firedogSFX.stopAllSounds();

            const CutsceneClass = END_CUTSCENES[this.currentMap];
            if (CutsceneClass) {
                this.isEndCutscene = true;
                this.isPlayerInGame = false;
                const cutscene = new CutsceneClass(this);
                this.startCutscene(cutscene);
                cutscene.displayDialogue();
            }
        }
    }

    _updateScreenEffects(deltaTime) {
        this.bossManager.updateScreenEffect(deltaTime);

        if (this.player.isInvisible) {
            this.invisibleColourOpacity = screenColourFadeIn(this.invisibleColourOpacity, 0.014, deltaTime);
        } else {
            this.invisibleColourOpacity = screenColourFadeOut(this.invisibleColourOpacity, deltaTime);
        }
    }

    // ------------------------------------------------------------ Draw ------------------------------------------------------------

    _fillScreen(ctx, style) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = style;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.restore();
    }

    draw(context) {
        context.clearRect(0, 0, this.width, this.height);

        if (this.background) this.background.draw(context);

        if (this.cabinAppeared && this.cabin) this.cabin.draw(context);
        if (this.penguinAppeared && this.penguini) this.penguini.draw(context);
        this.powerUps.forEach(p => p.draw(context));
        this.powerDowns.forEach(p => p.draw(context));
        this.behindPlayerParticles.forEach(p => p.draw(context));

        this.player.draw(context);

        this.enemies.forEach(e => e.draw(context));
        this.particles.forEach(p => p.draw(context));
        this.collisions.forEach(c => c.draw(context));
        this.floatingMessages.forEach(m => m.draw(context));
        this.animatedToasts.forEach(t => t.draw(context));

        if (this.player.isUnderwater === true) {
            this._fillScreen(context, "rgba(0, 0, 50, 0.6)");
        }

        const effect = this.boss.screenEffect;
        if (effect && effect.opacity > 0) {
            const [r, g, b] = effect.rgb ?? [0, 0, 0];
            this._fillScreen(context, `rgba(${r}, ${g}, ${b}, ${effect.opacity})`);
        }

        this._fillScreen(context, `rgba(0, 0, 50, ${this.invisibleColourOpacity})`);

        this.cutscenes.forEach(c => c.draw(context));

        if (this.isTutorialActive && this.currentMap === "Map1") {
            this.tutorial.draw(context);
        }
    }

    // ------------------------------------------------------------ Entity Spawning ------------------------------------------------------------

    addEnemy() {
        if (
            this.gameOver ||
            (this.background &&
                this.background.totalDistanceTraveled >= this.maxDistance - ENEMY_SPAWN_DISTANCE_BUFFER)
        ) {
            return;
        }

        if (this.bossManager.spawnBossIfNeeded()) return;
        if (!this.bossManager.canSpawnNormalEnemies()) return;

        const enemiesForCurrentMap = getEnemySpawnConfig(this)[this.currentMap];

        if (enemiesForCurrentMap && this.enemies.length < this.maxEnemies) {
            for (const { type, probability, spawningDistance } of enemiesForCurrentMap) {
                if (
                    Math.random() < probability &&
                    this.background &&
                    this.background.totalDistanceTraveled >= spawningDistance
                ) {
                    const newEnemy = new type(this);
                    let collision = false;

                    for (const existingEnemy of this.enemies) {
                        if (
                            existingEnemy instanceof type ||
                            (newEnemy instanceof ImmobileGroundEnemy &&
                                existingEnemy instanceof ImmobileGroundEnemy &&
                                Math.abs(newEnemy.x - existingEnemy.x) <
                                (newEnemy.width + existingEnemy.width) / 2)
                        ) {
                            collision = true;
                            break;
                        }
                    }

                    if (!collision) {
                        this.enemies.push(newEnemy);
                    }
                }
            }
        }
    }

    _spawnItems(list, entries, multiplier = 1) {
        if (multiplier === 0) return;
        if (this.bossManager.hasBossConfiguredForCurrentMap()) {
            if (this.bossManager.bossIsEngaged()) return;
            if (this.bossManager.bossGateReached()) return;
        }

        if (
            this.speed > 0 &&
            this.background &&
            this.background.totalDistanceTraveled < this.maxDistance - ITEM_SPAWN_DISTANCE_BUFFER
        ) {
            for (const { type, chance, underwaterOnly } of entries) {
                if (underwaterOnly && !this.player.isUnderwater) continue;
                if (Math.random() < chance * multiplier) list.push(new type(this));
            }
        }
    }

    addPowerUp() {
        this._spawnItems(this.powerUps, POWER_UP_SPAWN_CONFIG, this.powerUpSpawnMultiplier);
    }

    addPowerDown() {
        this._spawnItems(this.powerDowns, POWER_DOWN_SPAWN_CONFIG, this.powerDownSpawnMultiplier);
    }

    // ------------------------------------------------------------ Global Overlays ------------------------------------------------------------

    updateGlobalOverlays(deltaTime) {
        this.metaToasts.forEach(t => t.update(deltaTime));
        this.metaToasts = this.metaToasts.filter(t => !t.markedForDeletion);
        this.coinConvertToasts.forEach(t => t.update(deltaTime));
        this.coinConvertToasts = this.coinConvertToasts.filter(t => !t.markedForDeletion);
    }

    // ------------------------------------------------------------ Saving logic  ------------------------------------------------------------

    saveGameState() {
        persistGameState(this);
    }

    loadGameState() {
        restoreGameState(this);
    }

    clearSavedData() {
        resetPersistedData(this);
    }
}
