import { Player } from "./entities/player.js";
import { preShake, postShake } from './animations/shake.js';
import {
    Goblin,
    Dotter, Vertibat, Ghobat, Ravengloom, MeatSoldier, Skulnap, Abyssaw, GlidoSpike,
    DuskPlant, Silknoir, WalterTheGhost, Ben, Gloomlet, Dolly, Aura,
    Piranha, SkeletonFish, SpearFish, JetFish, Piper, Voltzeel, Garry,
    Sluggie, BigGreener, Chiquita, LilHornet, KarateCroco, Zabkous, SpidoLazer, Jerry,
    Snailey, RedFlyer, PurpleFlyer, LazyMosquito, LeafSlug, Sunflora, Eggry, Tauro, AngryBee, Bee, HangingSpidoLazer,
    Cactus, PetroPlant, Plazer, Veynoculus, Volcanurtle, TheRock, VolcanoWasp, Rollhog, Dragon,
    WindAttack,
    ImmobileGroundEnemy,
} from "./entities/enemies/enemies.js";
import { InkBomb, MeteorAttack } from "./entities/enemies/elyvorg.js";
import {
    RedPotion, BluePotion, HealthLive, Coin, OxygenTank,
    BlackHole, Cauldron, IceDrink, IceCube, Confuse, DeadSkull, CarbonDioxideTank,
    RandomPower
} from "./entities/powerUpAndDown.js";
// ingame
import { Reset } from "./reset.js";
import { PauseMenu } from "./menu/pauseMenu.js";
import { GameOverMenu } from "./menu/gameOverMenu.js";
// ui
import { InputHandler } from "./interface/input.js";
import { UI } from "./interface/UI.js";
import { Tutorial } from "./interface/tutorial.js";
import { Map3, Map6, BonusMap1 } from "./background/background.js";
// menus
import { MainMenu } from "./menu/mainMenu.js";
import { LevelDifficultyMenu } from "./menu/levelDifficultyMenu.js";
import { ForestMapMenu } from "./menu/forestMap.js";
import { HowToPlayMenu } from "./menu/howToPlayMenu.js";
import { Skins } from "./menu/skinsMenu.js";
import { DeleteProgress, DeleteProgress2 } from "./menu/deleteProgress.js";
import { SettingsMenu } from "./menu/settingsMenu.js";
import { ControlsSettingsMenu } from "./menu/controlsSettingsMenu.js";
import { getDefaultKeyBindings } from "./config/keyBindings.js";
// audios
import { AudioSettingsMenu } from "./menu/audio/audioSettingsMenu.js";
import { IngameAudioSettingsMenu } from "./menu/audio/ingameAudioSettingsMenu.js";
import {
    MenuAudioHandler, FiredogAudioHandler, EnemySFXAudioHandler, CollisionSFXAudioHandler, MapSoundtrackAudioHandler,
    PowerUpAndDownSFXAudioHandler, CutsceneMusicAudioHandler, CutsceneDialogueAudioHandler, CutsceneSFXAudioHandler
} from "./audioHandler.js";
// animations
import { fadeIn } from "./animations/fading.js";
import { screenColourFadeIn, screenColourFadeOut } from "./animations/screenColourFade.js";
// cutscenes
import {
    Map1EndCutscene, Map2EndCutscene, Map3EndCutscene,
    Map4EndCutscene, Map5EndCutscene, Map6EndCutscene,
    BonusMap1EndCutscene, BonusMap2EndCutscene, BonusMap3EndCutscene
} from "./cutscene/storyCutscenes.js";
import {
    Map1PenguinIngameCutscene, Map2PenguinIngameCutscene, Map3PenguinIngameCutscene,
    Map4PenguinIngameCutscene, Map5PenguinIngameCutscene, Map6PenguinIngameCutscene,
    BonusMap1PenguinIngameCutscene, BonusMap2PenguinIngameCutscene, BonusMap3PenguinIngameCutscene,
} from "./cutscene/penguiniCutscenes.js";
import {
    Map6ElyvorgIngameCutsceneBeforeFight,
    Map6ElyvorgIngameCutsceneAfterFight
} from "./cutscene/elyvorgCutscenes.js";
import {
    Map6GlacikalIngameCutsceneBeforeFight,
    Map6GlacikalIngameCutsceneAfterFight
} from "./cutscene/glacikalCutscenes.js";
import { EnemyLore } from "./menu/enemyLore.js";
import {
    saveGameState as persistGameState,
    loadGameState as restoreGameState,
    clearSavedData as resetPersistedData
} from "./persistence/gamePersistence.js";
import { BossManager } from "./entities/enemies/bossManager.js";

export class Game {
    constructor(canvas, width, height) {
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        // player related
        this.lives = 5;
        this.maxLives = 10;
        this.speed = 0;
        this.normalSpeed = 6;
        this.groundMargin = 40;
        this.maxDistance = 100;
        this.winningCoins = 100;
        this.coins = 0;
        this.notEnoughCoins = false;
        this.time = 0;
        this.hiddenTime = 0;
        this.maxTime = 450000;
        this.maxParticles = 210;
        this.maxEnemies = 6;
        this.enemyTimer = 0;
        this.enemyInterval = 1000;
        this.nonEnemyTimer = 0;
        this.nonEnemyInterval = 1000;
        this.invisibleColourOpacity = 0;
        this.gameOver = false;
        this.debug = false;

        // player/audio handlers/menus/etc classes and vars...
        this.player = new Player(this);
        this.player.currentState = this.player.states[0];
        this.player.currentState.enter();
        this.input = new InputHandler(this);
        this.UI = new UI(this);
        this.background = null;
        this.cabin = null;
        this.penguini = null;
        this.fontColor = "black";
        this.isDarkWhiteBorder = false;
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
            skins: new Skins(this),
            levelDifficulty: new LevelDifficultyMenu(this),
            howToPlay: new HowToPlayMenu(this),
            settings: new SettingsMenu(this),
            audioSettings: new AudioSettingsMenu(this),
            controlsSettings: new ControlsSettingsMenu(this),
            ingameAudioSettings: new IngameAudioSettingsMenu(this),
            deleteProgress: new DeleteProgress(this),
            deleteProgress2: new DeleteProgress2(this),
            pause: new PauseMenu(this),
            gameOver: new GameOverMenu(this),
        };
        this.currentMenu = this.menu.main;
        this.canSelect = true;
        this.canSelectForestMap = true;
        this.currentMap = null;
        this.selectedDifficulty = "Normal";
        this.map1Unlocked = true;
        this.map2Unlocked = false;
        this.map3Unlocked = false;
        this.map4Unlocked = false;
        this.map5Unlocked = false;
        this.map6Unlocked = false;
        this.bonusMap1Unlocked = false;
        this.bonusMap2Unlocked = false;
        this.bonusMap3Unlocked = false;
        this.gameCompleted = false;
        this.isPlayerInGame = false;
        // arrays
        this.enemies = [];
        this.powerUps = [];
        this.powerDowns = [];
        this.behindPlayerParticles = [];
        this.particles = [];
        this.collisions = [];
        this.floatingMessages = [];
        this.cabins = [];
        this.penguins = [];
        this.cutscenes = [];
        // cutscene
        this.cutsceneActive = false;
        this.currentCutscene = null;
        this.enterDuringBackgroundTransition = true;
        this.isEndCutscene = false;
        this.fadingIn = false;
        this.waitForFadeInOpacity = false;
        // penguin
        this.talkToPenguin = false;
        this.enterToTalkToPenguin = false;
        this.talkToPenguinOneTimeOnly = true;
        // boss
        this.bossManager = new BossManager(this);
        // loading game state
        this.loadGameState();
    }

    get boss() {
        return this.bossManager.state;
    }

    // ------------------------------------------------------------ Game Class logic ------------------------------------------------------------
    startCutscene(cutscene) {
        this.fadingIn = true;
        this.cutsceneActive = true;
        this.currentCutscene = cutscene;
    }

    endCutscene() {
        this.cutsceneActive = false;
        this.currentCutscene = null;
        this.currentMenu = null;
        if (this.input) {
            this.input.keys = [];
            this.input.arrowUpPressed = false;
            this.input.arrowDownPressed = false;
        }
        if (
            this.player.x + this.player.width >= this.cabin.x + 190 &&
            this.player.x <= this.cabin.x + this.cabin.width
        ) {
            this.reset();
            this.isPlayerInGame = false;
            if (!(this.background instanceof Map6)) {
                this.canSelectForestMap = false;
                this.currentMenu = this.menu.forestMap;
                this.menu.forestMap.showSavingSprite = true;

                setTimeout(() => {
                    this.canSelectForestMap = true;
                    this.menu.forestMap.showSavingSprite = false;

                    const bgName =
                        this.background && this.background.constructor
                            ? this.background.constructor.name
                            : null;

                    const targetIndexByMap = {
                        Map1: 1,
                        Map2: 2,
                        Map3: 3,
                        Map4: 4,
                        Map5: 5,
                        BonusMap1: 1,
                        BonusMap2: 8,
                        BonusMap3: 3,
                    };

                    let nextIndex =
                        bgName && bgName in targetIndexByMap
                            ? targetIndexByMap[bgName]
                            : this.menu.forestMap.selectedCircleIndex + 1;

                    const maxIdx = this.menu.forestMap.circleOptions.length - 1;
                    nextIndex = Math.max(0, Math.min(maxIdx, nextIndex));

                    const isUnlocked = (idx) => {
                        if (idx === 6) return !!this.bonusMap1Unlocked;
                        if (idx === 7) return !!this.bonusMap2Unlocked;
                        if (idx === 8) return !!this.bonusMap3Unlocked;
                        if (idx >= 0 && idx <= 5) return !!this[`map${idx + 1}Unlocked`];
                        return false;
                    };

                    if (isUnlocked(nextIndex)) {
                        this.menu.forestMap.selectedCircleIndex = nextIndex;
                    }

                    this.audioHandler.menu.playSound("optionHoveredSound", false, true);
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

    reset() {
        this.resetInstance.reset();
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

    update(deltaTime) {
        if (
            this.background &&
            this.background.constructor &&
            this.currentMap !== this.background.constructor.name
        ) {
            this.currentMap = this.background.constructor.name;
        }

        const tutorialMapActive =
            this.isTutorialActive && this.currentMap === "Map1";
        if (tutorialMapActive) {
            this.tutorial.update(deltaTime);
            this.noDamageDuringTutorial = true;
        } else {
            this.tutorial.tutorialPause = false;
            this.noDamageDuringTutorial = false;
        }

        if (!this.menu.pause.isPaused && this.tutorial.tutorialPause === false) {
            if (this.cabin && this.cabin.isFullyVisible) {
                this.time = this.time;
            } else if (!this.gameOver) {
                this.time += deltaTime;
                if (this.time > this.maxTime && this.player.isUnderwater)
                    this.gameOver = true;
            } else {
                this.speed = 0;
            }

            if (this.background) this.background.update(deltaTime);

            if (!this.cabin || !this.cabin.isFullyVisible) {
                // enemy
                if (this.enemyTimer > this.enemyInterval) {
                    if (!tutorialMapActive) {
                        this.addEnemy();
                    }
                    this.enemyTimer = 0;
                } else {
                    this.enemyTimer += deltaTime;
                }
                // other entities
                if (this.nonEnemyTimer > this.nonEnemyInterval) {
                    if (!tutorialMapActive) {
                        this.addPowerUp();
                        this.addPowerDown();
                    }
                    this.addCabin();
                    this.addPenguin();
                    this.nonEnemyTimer = 0;
                } else {
                    this.nonEnemyTimer += deltaTime;
                }
            }

            this.hiddenTime += deltaTime; // hiddenTime doesn't stop when player dies

            this.player.update(this.input.keys, deltaTime);
            this.coins = Math.max(0, this.coins);

            // handles certain audios where the sound doesn't stop until that type of enemy is not in enemy list
            const enemyAudioMapping = [
                { enemyType: WindAttack, audio: "tornadoAudio" },
                { enemyType: Skulnap, audio: "fuseSound" },
                { enemyType: SpidoLazer, audio: "spidoLazerWalking" },
                { enemyType: Goblin, audio: "goblinRunSound" },
                { enemyType: Ben, audio: "verticalGhostSound" },
                { enemyType: JetFish, audio: "rocketLauncherSound" },
                { enemyType: SpearFish, audio: "stepWaterSound" },
                { enemyType: Dolly, audio: "dollHumming" },
                { enemyType: Aura, audio: "auraSoundEffect" },
                { enemyType: InkBomb, audio: "elyvorg_ink_bomb_sound" },
                { enemyType: MeteorAttack, audio: "elyvorg_meteor_falling_sound" },
            ];
            enemyAudioMapping.forEach(({ enemyType, audio }) => {
                if (
                    enemyType === MeteorAttack &&
                    !this.enemies.some((enemy) => enemy instanceof enemyType)
                ) {
                    if (this.audioHandler.enemySFX.isPlaying(audio)) {
                        this.audioHandler.enemySFX.fadeOutAndStop(audio, 2000);
                    }
                } else {
                    if (
                        !this.enemies.some((enemy) => enemy instanceof enemyType)
                    ) {
                        this.audioHandler.enemySFX.stopSound(audio);
                    }
                }
            });

            // handle power up
            this.powerUps.forEach((powerUp) => {
                powerUp.update(deltaTime);
            });
            // handle power down
            this.powerDowns.forEach((powerDown) => {
                powerDown.update(deltaTime);
            });
            // handle enemies
            this.enemies.forEach((enemy) => {
                enemy.update(deltaTime);
            });
            // handle messages
            this.floatingMessages.forEach((message) => {
                message.update();
            });
            // handle cabin
            this.cabins.forEach((cabin) => {
                cabin.update(deltaTime);
            });
            // handle penguin
            this.penguins.forEach((penguin) => {
                penguin.update(deltaTime);
            });
            // handle particles behind the player
            this.behindPlayerParticles.forEach((behindPlayerParticle) => {
                behindPlayerParticle.update();
            });
            // handle particles
            this.particles.forEach((particle) => {
                particle.update(deltaTime);
            });
            if (this.particles.length > this.maxParticles) {
                this.particles.length = this.maxParticles;
            }
            // handle collision sprites
            this.collisions.forEach((collision) => {
                collision.update(deltaTime);
            });
            // removes marked entities
            this.enemies = this.enemies.filter(
                (enemy) => !enemy.markedForDeletion
            );
            this.powerUps = this.powerUps.filter(
                (powerUp) => !powerUp.markedForDeletion
            );
            this.powerDowns = this.powerDowns.filter(
                (powerDown) => !powerDown.markedForDeletion
            );
            this.behindPlayerParticles = this.behindPlayerParticles.filter(
                (behindPlayerParticle) => !behindPlayerParticle.markedForDeletion
            );
            this.particles = this.particles.filter(
                (particle) => !particle.markedForDeletion
            );
            this.collisions = this.collisions.filter(
                (collision) => !collision.markedForDeletion
            );
            this.floatingMessages = this.floatingMessages.filter(
                (message) => !message.markedForDeletion
            );

            // penguin cutscenes
            if (
                this.talkToPenguin &&
                this.talkToPenguinOneTimeOnly &&
                this.enterToTalkToPenguin
            ) {
                this.enterToTalkToPenguin = false;
                const mapCutsceneMapping = {
                    Map1: Map1PenguinIngameCutscene,
                    Map2: Map2PenguinIngameCutscene,
                    Map3: Map3PenguinIngameCutscene,
                    Map4: Map4PenguinIngameCutscene,
                    Map5: Map5PenguinIngameCutscene,
                    Map6: Map6PenguinIngameCutscene,
                    BonusMap1: BonusMap1PenguinIngameCutscene,
                    BonusMap2: BonusMap2PenguinIngameCutscene,
                    BonusMap3: BonusMap3PenguinIngameCutscene,
                };
                const mapConstructor = mapCutsceneMapping[this.currentMap];
                if (mapConstructor) {
                    const cutscene = new mapConstructor(this);
                    this.startCutscene(cutscene);
                    cutscene.displayDialogue();
                    this.cutscenes.push(cutscene);
                }
            }

            // boss in-game cutscenes (before/after fight)
            if (
                this.background &&
                this.hasActiveBoss &&
                this.isBossVisible &&
                this.player.x <= 0
            ) {
                const boss = this.boss;

                const configs = [
                    {
                        mapClass: BonusMap1,
                        bossId: "glacikal",
                        beforeCutscene: Map6GlacikalIngameCutsceneBeforeFight,
                        afterCutscene: Map6GlacikalIngameCutsceneAfterFight,
                    },
                    {
                        mapClass: Map6,
                        bossId: "elyvorg",
                        beforeCutscene: Map6ElyvorgIngameCutsceneBeforeFight,
                        afterCutscene: Map6ElyvorgIngameCutsceneAfterFight,
                    },
                ];

                for (const cfg of configs) {
                    if (!(this.background instanceof cfg.mapClass)) continue;
                    if (boss.id !== cfg.bossId) continue;

                    if (boss.dialogueBeforeOnce) {
                        boss.preFight = true;
                        boss.postFight = false;
                        boss.dialogueBeforeOnce = false;

                        this.player.energy = 100;
                        this.player.isInvisible = false;
                        this.player.invisibleTimer = this.player.invisibleCooldown;
                        this.player.invisibleActiveCooldownTimer = 5000;
                        this.menu.levelDifficulty.setDifficulty(this.selectedDifficulty);

                        const cutscene = new cfg.beforeCutscene(this);
                        this.startCutscene(cutscene);
                        cutscene.displayDialogue();
                        this.cutscenes.push(cutscene);
                        break;
                    }

                    if (boss.dialogueAfterOnce && boss.startAfterDialogueWhenAnimEnds) {
                        boss.preFight = false;
                        boss.postFight = true;
                        boss.dialogueAfterOnce = false;
                        boss.dialogueAfterLeaving = true;

                        this.player.energy = 100;

                        const cutscene = new cfg.afterCutscene(this);
                        this.startCutscene(cutscene);
                        cutscene.displayDialogue();
                        this.cutscenes.push(cutscene);
                        break;
                    }
                }
            }

            // end cutscenes after each map
            if (this.background instanceof Map3) {
                this.enterCabin = 500;
                this.openDoor = "submarineDoorOpening";
            } else if (this.background instanceof Map6) {
                this.enterCabin = 570;
                this.openDoor = "walkingCutsceneSound";
            } else {
                this.enterCabin = 290;
                this.openDoor = "doorOpening";
            }
            if (
                this.cabin &&
                this.player.x + this.player.width >= this.cabin.x + this.enterCabin &&
                this.player.x <= this.cabin.x + this.cabin.width &&
                this.cabin.isFullyVisible
            ) {
                this.audioHandler.cutsceneSFX.playSound(this.openDoor);
                this.audioHandler.firedogSFX.stopAllSounds();

                const mapCutsceneMapping = {
                    Map1: Map1EndCutscene,
                    Map2: Map2EndCutscene,
                    Map3: Map3EndCutscene,
                    Map4: Map4EndCutscene,
                    Map5: Map5EndCutscene,
                    Map6: Map6EndCutscene,
                    BonusMap1: BonusMap1EndCutscene,
                    BonusMap2: BonusMap2EndCutscene,
                    BonusMap3: BonusMap3EndCutscene,
                };

                const mapConstructor = mapCutsceneMapping[this.currentMap];
                if (mapConstructor) {
                    this.isEndCutscene = true;
                    this.isPlayerInGame = false;
                    const cutscene = new mapConstructor(this);
                    this.startCutscene(cutscene);
                    cutscene.displayDialogue();
                }
            }
        }
    }

    draw(context) {
        context.clearRect(0, 0, this.width, this.height);
        if (this.background) this.background.draw(context);

        this.cabins.forEach((cabin) => {
            cabin.draw(context);
        });
        this.penguins.forEach((penguin) => {
            penguin.draw(context);
        });
        this.powerUps.forEach((powerUp) => {
            powerUp.draw(context);
        });
        this.powerDowns.forEach((powerDown) => {
            powerDown.draw(context);
        });
        this.behindPlayerParticles.forEach((behindPlayerParticle) => {
            behindPlayerParticle.draw(context);
        });
        this.player.draw(context); // player
        this.enemies.forEach((enemy) => {
            enemy.draw(context);
        });
        this.particles.forEach((particle) => {
            particle.draw(context);
        });
        this.collisions.forEach((collision) => {
            collision.draw(context);
        });
        this.floatingMessages.forEach((message) => {
            message.draw(context);
        });

        if (this.player.isUnderwater === true) {
            context.fillStyle = "rgba(0, 0, 50, 0.6)";
            context.fillRect(0, 0, this.width, this.height);
        }

        const effect = this.boss.screenEffect;

        if (this.bossInFight && effect.active) {
            effect.opacity = screenColourFadeIn(
                effect.opacity,
                effect.fadeInSpeed ?? 0.00298
            );
        } else if (effect) {
            effect.opacity = screenColourFadeOut(effect.opacity);
        }

        if (effect && effect.opacity > 0) {
            const [r, g, b] = effect.rgb ?? [0, 0, 0];
            context.fillStyle = `rgba(${r}, ${g}, ${b}, ${effect.opacity})`;
            context.fillRect(0, 0, this.width, this.height);
        }

        if (this.player.isInvisible) {
            this.invisibleColourOpacity = screenColourFadeIn(
                this.invisibleColourOpacity,
                0.014
            );
        } else {
            this.invisibleColourOpacity = screenColourFadeOut(
                this.invisibleColourOpacity
            );
        }
        context.fillStyle = `rgba(0, 0, 50, ${this.invisibleColourOpacity})`;
        context.fillRect(0, 0, this.width, this.height);

        this.cutscenes.forEach((cutscene) => {
            cutscene.draw(context);
        });

        // tutorial overlay only when Map1 tutorial is active
        if (this.isTutorialActive && this.currentMap === "Map1") {
            this.tutorial.draw(context);
        }

        this.UI.draw(context);
    }

    addEnemy() {
        if (
            this.gameOver ||
            (this.background &&
                this.background.totalDistanceTraveled >= this.maxDistance - 5)
        ) {
            return;
        }

        if (this.bossManager.spawnBossIfNeeded()) {
            return;
        }

        if (!this.bossManager.canSpawnNormalEnemies()) {
            return;
        }

        const enemyTypes = {
            Map1: [
                { type: Goblin, probability: 0.05, spawningDistance: 0 },
                { type: Dotter, probability: 0.35, spawningDistance: 0 },
                { type: Vertibat, probability: 0.35, spawningDistance: 0 },
                { type: Ghobat, probability: 0.3, spawningDistance: 0 },
                { type: Ravengloom, probability: 0.3, spawningDistance: 0 },
                { type: MeatSoldier, probability: 0.1, spawningDistance: 0 },
                { type: Skulnap, probability: 0.25, spawningDistance: 50 },
                { type: Abyssaw, probability: 0.06, spawningDistance: 100 },
                { type: GlidoSpike, probability: 0.1, spawningDistance: 150 },
            ],
            Map2: [
                { type: Goblin, probability: 0.05, spawningDistance: 0 },
                { type: Vertibat, probability: 0.1, spawningDistance: 0 },
                { type: DuskPlant, probability: 0.2, spawningDistance: 0 },
                { type: Silknoir, probability: 0.4, spawningDistance: 0 },
                { type: WalterTheGhost, probability: 0.2, spawningDistance: 0 },
                { type: Ben, probability: 0.2, spawningDistance: 0 },
                { type: Gloomlet, probability: 0.08, spawningDistance: 50 },
                { type: Dolly, probability: 0.01, spawningDistance: 100 },
            ],
            Map3: [
                { type: Goblin, probability: 0.05, spawningDistance: 0 },
                { type: Piranha, probability: 0.2, spawningDistance: 0 },
                { type: SkeletonFish, probability: 0.2, spawningDistance: 0 },
                { type: SpearFish, probability: 0.1, spawningDistance: 0 },
                { type: JetFish, probability: 0.05, spawningDistance: 0 },
                { type: Piper, probability: 0.2, spawningDistance: 50 },
                { type: Voltzeel, probability: 0.08, spawningDistance: 100 },
                { type: Garry, probability: 0.07, spawningDistance: 100 },
            ],
            Map4: [
                { type: Goblin, probability: 0.05, spawningDistance: 0 },
                { type: BigGreener, probability: 0.2, spawningDistance: 0 },
                { type: Chiquita, probability: 0.2, spawningDistance: 0 },
                { type: Sluggie, probability: 0.3, spawningDistance: 0 },
                { type: LilHornet, probability: 0.05, spawningDistance: 0 },
                { type: KarateCroco, probability: 0.05, spawningDistance: 0 },
                { type: Zabkous, probability: 0.01, spawningDistance: 80 },
                { type: SpidoLazer, probability: 0.01, spawningDistance: 100 },
                { type: Jerry, probability: 0.05, spawningDistance: 100 },
            ],
            Map5: [
                { type: Goblin, probability: 0.05, spawningDistance: 0 },
                { type: Snailey, probability: 0.05, spawningDistance: 0 },
                { type: RedFlyer, probability: 0.2, spawningDistance: 0 },
                { type: PurpleFlyer, probability: 0.2, spawningDistance: 0 },
                { type: LazyMosquito, probability: 0.2, spawningDistance: 0 },
                { type: LeafSlug, probability: 0.15, spawningDistance: 0 },
                { type: Sunflora, probability: 0.1, spawningDistance: 0 },
                { type: Eggry, probability: 0.3, spawningDistance: 0 },
                { type: Tauro, probability: 0.05, spawningDistance: 0 },
                { type: this.background && this.background.isRaining ? AngryBee : Bee, probability: this.background && this.background.isRaining ? 0.06 : 0.07, spawningDistance: 0 },
                { type: HangingSpidoLazer, probability: 0.05, spawningDistance: 0 },
            ],
            Map6: [
                { type: Goblin, probability: 0.05, spawningDistance: 0 },
                { type: Cactus, probability: 0.1, spawningDistance: 0 },
                { type: PetroPlant, probability: 0.1, spawningDistance: 0 },
                { type: Plazer, probability: 0.05, spawningDistance: 0 },
                { type: Veynoculus, probability: 0.5, spawningDistance: 0 },
                { type: Volcanurtle, probability: 0.1, spawningDistance: 0 },
                { type: TheRock, probability: 0.05, spawningDistance: 0 },
                { type: VolcanoWasp, probability: 0.03, spawningDistance: 0 },
                { type: Rollhog, probability: 0.1, spawningDistance: 0 },
                { type: Dragon, probability: 0.05, spawningDistance: 0 },
            ],
            BonusMap1: [
                { type: Goblin, probability: 0.05, spawningDistance: 0 },
                { type: Vertibat, probability: 0.1, spawningDistance: 0 },
                { type: DuskPlant, probability: 0.2, spawningDistance: 0 },
                { type: Silknoir, probability: 0.4, spawningDistance: 0 },
                { type: WalterTheGhost, probability: 0.2, spawningDistance: 0 },
                { type: Ben, probability: 0.2, spawningDistance: 0 },
                { type: Dolly, probability: 0.01, spawningDistance: 100 },
            ],
            BonusMap2: [
                { type: Goblin, probability: 0.05, spawningDistance: 0 },
                { type: Vertibat, probability: 0.1, spawningDistance: 0 },
                { type: DuskPlant, probability: 0.2, spawningDistance: 0 },
                { type: Silknoir, probability: 0.4, spawningDistance: 0 },
                { type: WalterTheGhost, probability: 0.2, spawningDistance: 0 },
                { type: Ben, probability: 0.2, spawningDistance: 0 },
                { type: Dolly, probability: 0.01, spawningDistance: 100 },
            ],
        };

        const currentMap = this.currentMap;
        const enemiesForCurrentMap = enemyTypes[currentMap];

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
                                (newEnemy.width + existingEnemy.width) / 2 &&
                                Math.abs(newEnemy.y - existingEnemy.y) <
                                (newEnemy.height + existingEnemy.height) / 2)
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

    addPowerUp() {
        if (!(this.background instanceof Map6)) {
            if (
                this.speed > 0 &&
                this.background &&
                this.background.totalDistanceTraveled < this.maxDistance - 3
            ) {
                if (Math.random() < 0.0025) {
                    this.powerUps.push(new RandomPower(this));
                }
                if (Math.random() < 0.005) {
                    this.powerUps.push(new RedPotion(this));
                }
                if (Math.random() < 0.005) {
                    this.powerUps.push(new BluePotion(this));
                }
                if (Math.random() < 0.005) {
                    this.powerUps.push(new HealthLive(this));
                }
                if (Math.random() < 0.005) {
                    this.powerUps.push(new Coin(this));
                }
                if (this.player.isUnderwater) {
                    if (Math.random() < 0.005) {
                        this.powerUps.push(new OxygenTank(this));
                    }
                }
            }
        }
    }

    addPowerDown() {
        if (!(this.background instanceof Map6)) {
            if (
                this.speed > 0 &&
                this.background &&
                this.background.totalDistanceTraveled < this.maxDistance - 3
            ) {
                if (Math.random() < 0.0025) {
                    this.powerDowns.push(new RandomPower(this));
                }
                if (Math.random() < 0.005) {
                    this.powerDowns.push(new IceDrink(this));
                }
                if (Math.random() < 0.005) {
                    this.powerDowns.push(new IceCube(this));
                }
                if (Math.random() < 0.005) {
                    this.powerDowns.push(new Cauldron(this));
                }
                if (Math.random() < 0.005) {
                    this.powerDowns.push(new BlackHole(this));
                }
                if (Math.random() < 0.005) {
                    this.powerDowns.push(new Confuse(this));
                }
                if (Math.random() < 0.005) {
                    this.powerDowns.push(new DeadSkull(this));
                }
                if (this.player.isUnderwater) {
                    if (Math.random() < 0.005) {
                        this.powerDowns.push(new CarbonDioxideTank(this));
                    }
                }
            }
        }
    }

    addCabin() {
        if (
            this.background &&
            this.background.totalDistanceTraveled >= this.maxDistance &&
            !this.cabinAppeared
        ) {
            this.cabins.push(this.cabin);
            this.cabinAppeared = true;
            this.fixedCabinX = this.width - this.cabin.width;
        }
    }

    addPenguin() {
        if (
            this.background &&
            this.background.totalDistanceTraveled >= this.maxDistance &&
            !this.penguinAppeared
        ) {
            this.penguins.push(this.penguini);
            this.penguinAppeared = true;
            this.fixedPenguinX = this.width - this.cabin.width - 100;
            this.talkToPenguin = true;
        }
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

// ------------------------------------------------------------ Game Function ------------------------------------------------------------
window.addEventListener("load", function () {
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 1920;
    canvas.height = 689;

    const game = new Game(canvas, canvas.width, canvas.height);
    let lastTime = 0;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (
            game.cutsceneActive &&
            !game.talkToPenguin &&
            !(game.boss && game.boss.talkToBoss)
        ) {
            if (game.fadingIn) {
                game.waitForFadeInOpacity = true;
                fadeIn(canvas, 1300, () => {
                    game.fadingIn = false;
                });
                setTimeout(() => {
                    game.waitForFadeInOpacity = false;
                }, 2200);
            } else {
                game.currentCutscene.draw(ctx);
            }
        } else if (game.currentMenu && game.currentMenu.menuInGame === false) {
            game.isPlayerInGame = false;
            game.currentMenu.menuActive = true;
            game.currentMenu.draw(ctx);
            game.currentMenu.update(deltaTime);
        } else if (game.isPlayerInGame) {
            game.update(deltaTime);

            const canShake =
                game.shakeActive &&
                !game.menu.pause.isPaused &&
                game.tutorial.tutorialPause === false;

            if (canShake) preShake(ctx);

            game.draw(ctx);

            if (canShake) postShake(ctx);

            if (game.currentMenu || game.gameOver) {
                game.currentMenu.menuActive = true;
                game.currentMenu.draw(ctx);
                game.currentMenu.update(deltaTime);
            }
        }

        requestAnimationFrame(animate);
    }
    animate(0);
});
