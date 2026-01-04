import { getDefaultKeyBindings } from '../config/keyBindings.js';
import { getSkinElement } from '../config/skins.js';
import { Sitting, Running, Jumping, Falling, Rolling, Diving, Stunned, Hit, Standing, Dying } from '../animations/playerStates.js';
import {
    CollisionAnimation, ExplosionCollisionAnimation, PoisonSpitSplash, InkSplashCollision, Blood,
    ElectricityCollision, InkBombCollision, PoisonDropCollision,
    MeteorExplosionCollision, IceSlashCollision, IceTrailCollision, IcyStormBallCollision, SpinningIceBallsCollision,
    PointyIcicleShardCollision, UndergroundIcicleCollision, PurpleThunderCollision, GhostFadeOut, DisintegrateCollision,
    DarkExplosionCollision, HealingStarBurstCollision, AsteroidExplosionCollision, GalacticSpikeCollision, BallParticleBurstCollision,
    PurpleFireballCollision, RedFireballCollision,
} from '../animations/collisionAnimation.js';
import { FloatingMessage } from '../animations/floatingMessages.js';
import { Fireball, CoinLoss, PoisonBubbles, IceCrystalBubbles, SpinningChicks } from '../animations/particles.js';
import {
    AngryBee, Bee, Skulnap, PoisonSpit, Goblin, Sluggie, Voltzeel, Tauro, Gloomlet, EnemyBoss, Barrier,
    Aura, KarateCroco, SpearFish, TheRock, LilHornet, Cactus, IceBall, Garry, InkBeam, RockProjectile, VolcanoWasp, Volcanurtle
} from './enemies/enemies.js';
import { InkSplash } from '../animations/ink.js';
import { DamageIndicator } from '../animations/damageIndicator.js';
import { TunnelVision } from '../animations/tunnelVision.js';
import {
    Elyvorg, GhostElyvorg, Arrow, PurpleBarrier, ElectricWheel, GravitationalAura,
    InkBomb, PurpleFireball, PoisonDrop, MeteorAttack, PurpleSlash, PurpleThunder, PurpleLaserBeam
} from './enemies/elyvorg.js';
import { IceTrail, IcyStormBall, IceSlash, SpinningIceBalls, PointyIcicleShard, Glacikal, UndergroundIcicle } from './enemies/glacikal.js';
import {
    NTharax, Kamehameha, HealingBarrier, GalacticSpike, PurpleBallOrb, AntennaeTentacle, YellowBeamOrb, BlackBeamOrb,
    PurpleBeamOrb, PurpleAsteroid, BlueAsteroid, GroundShockwaveRing, LaserBall
} from './enemies/ntharax.js';

export class Player {
    constructor(game) {
        this.game = game;
        // images
        this.image = getSkinElement('default');
        this.hatImage = getSkinElement('hat');
        this.choloImage = getSkinElement('cholo');
        this.zabkaImage = getSkinElement('zabka');
        this.shinyImage = getSkinElement('shiny');
        // firedog vars
        this.width = 100;
        this.height = 91.3;
        this.x = 0;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.frameX = 0;
        this.frameY = 0;
        this.vy = 0;
        // base physics/speed values
        this.weight = 1;
        this.normalSpeed = 6;
        this.maxSpeed = 10;
        this.baseWeight = this.weight;
        this.baseNormalSpeed = this.normalSpeed;
        this.baseMaxSpeed = this.maxSpeed;
        this.slowNormalSpeedMultiplier = 4 / 6;
        this.slowMaxSpeedMultiplier = 0.6;
        this.slowWeightMultiplier = 1.5;
        this.maxFrame;
        this.fps = 31;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.speed = 0;
        this.previousLives = this.game.lives;
        this.facingRight = true;
        this.facingLeft = false;
        this.isRolling = false; // for sound
        this.firstLoopDamageIndicator = true;
        // collision
        this.collisionCooldowns = {};
        this.collisionLogic = new CollisionLogic(this.game);
        // underwater vars
        this.isUnderwater = false;
        this.loopDamageIndicator = true;
        this.buoyancy = 4;
        // space vars
        this.isSpace = false;
        this.canSpaceDoubleJump = false;
        // ice vars
        this.isIce = false;
        this.vx = 0;
        this.accelIce = 0.045;
        this.frictionIce = 0.005;
        this.turnResistanceIce = 0.45;
        this.deadzone = 0.05;
        this.iceIdleDrift = 0.0005;
        this.slideGraceMs = 260;
        this.slideFrictionIce = 0.0016;
        this.slideTimer = 0;
        this.prevAxis = 0;
        this.slideGraceMsBack = this.slideGraceMs;
        this.slideFrictionIceBack = this.slideFrictionIce;
        this.slideBoostBack = 0;
        this._reverseSlideActive = false;
        // frozen vars
        this.isFrozen = false;
        this.frozenTimer = 0;
        this.frozenDuration = 2000;
        this.frozenFrameX = 0;
        this.frozenFrameY = 0;
        this.frozenFrameTimer = 0;
        this.frozenMaxFrame = 0;
        this.frozenFacingRight = true;
        this.frozenIceImage = document.getElementById('frozenIce');
        this.frozenPulseTimer = 0;
        this.frozenPulseSpeed = 0.009;
        this.frozenPulseAmp = 0.2;
        this.frozenOpacity = 0.5;
        // states
        this.states = [
            new Sitting(this.game),   // 0
            new Running(this.game),   // 1
            new Jumping(this.game),   // 2
            new Falling(this.game),   // 3
            new Rolling(this.game),   // 4
            new Diving(this.game),    // 5
            new Stunned(this.game),   // 6
            new Hit(this.game),       // 7
            new Standing(this.game),  // 8
            new Dying(this.game),     // 9
        ];
        this.previousState = null;
        this.currentState = null;
        // energy
        this.energy = 100;
        this.energyTimer = 0;
        this.energyInterval = 100;
        this.energyReachedZero = false;
        this.noEnergyLeftSound = false;
        // blue potion
        this.blueFireTimer = 0;
        this.isBluePotionActive = false;
        this.bluePotionSpeedMultiplier = 2.2;
        this.bluePotionSpeed = this.baseMaxSpeed * this.bluePotionSpeedMultiplier;
        // red potion
        this.isRedPotionActive = false;
        this.redPotionTimer = 0;
        // poison
        this.isPoisonedActive = false;
        this.poisonTimer = 0;
        // black hole
        this.isBlackHoleActive = false;
        // slow down
        this.isSlowed = false;
        this.slowedTimer = 0;
        // confuse
        this.isConfused = false;
        this.confuseTimer = 0;
        this.confuseDuration = 8000;
        this.confusedKeyBindings = null;
        // status bubbles
        this.statusFxTimer = 0;
        this.statusFxInterval = 120;
        // fireball cooldowns
        this.fireballTimer = 1000;
        this.fireballCooldown = 1000;
        // diving cooldowns
        this.divingTimer = 500;
        this.divingCooldown = 500;
        // invisible cooldowns
        this.isInvisible = false;
        this.invisibleTimer = 40000;
        this.invisibleCooldown = 40000;
        this.invisibleActiveCooldownTimer = 0;
        // firedog vars when interacting with boss
        this.setToRunOnce = true;
        this.setToStandingOnce = true;
        // boss collision vars
        this.bossCollisionTimer = 1000;
        this.bossCollisionCooldown = 1000;
        this.resetElectricWheelCounters = false;
    }

    _moveLeft(input) { return this.game.input.isActionActive('moveBackward', input); }
    _moveRight(input) { return this.game.input.isActionActive('moveForward', input); }
    _jump(input) { return this.game.input.isActionActive('jump', input); }
    _sit(input) { return this.game.input.isActionActive('sit', input); }

    clearAllStatusEffects() {
        // freeze
        this.isFrozen = false;
        this.frozenTimer = 0;
        this.frozenPulseTimer = 0;
        this.frozenOpacity = 0;
        this.game.input.keys = [];
        // poison
        this.isPoisonedActive = false;
        this.poisonTimer = 0;
        this.energyReachedZero = false;
        // slow
        this.isSlowed = false;
        this.slowedTimer = 0;
        // confuse
        this.isConfused = false;
        this.confuseTimer = 0;
        this.confusedKeyBindings = null;
        // blue potion
        this.isBluePotionActive = false;
        this.blueFireTimer = 0;
        // red potion
        this.isRedPotionActive = false;
        this.redPotionTimer = 0;
        // invisibility
        this.isInvisible = false;
        this.invisibleActiveCooldownTimer = 0;
        this.invisibleTimer = this.invisibleCooldown;
        // black hole
        this.isBlackHoleActive = false;
        // energy
        this.energy = Math.min(100, Math.max(0, this.energy));
        this.energyInterval = 100;
        this.noEnergyLeftSound = false;
        // state restore
        this.normalSpeed = this.baseNormalSpeed;
        this.maxSpeed = this.baseMaxSpeed;
        this.weight = this.baseWeight;
        // movement reset
        this.speed = 0;
        this.vx = 0;
        this.vy = 0;
        // state sanity
        if (
            this.currentState === this.states[6] || // stunned
            this.currentState === this.states[7]    // hit
        ) {
            this.setState(8, 0); // standing
        }
        // audio cleanup
        const sfx = this.game.audioHandler.firedogSFX;
        sfx.stopSound('bluePotionEnergyGoingUp');
        sfx.stopSound('invisibleInSFX');
        sfx.stopSound('rollingSFX');
        sfx.stopSound('rollingUnderwaterSFX');
        sfx.stopSound('frozenSound');
        // particles cleanup
        this.game.particles = this.game.particles.filter(p =>
            !(
                p.constructor.name === 'PoisonBubbles' ||
                p.constructor.name === 'IceCrystalBubbles' ||
                p.constructor.name === 'SpinningChicks'
            )
        );
        // collisions
        this.game.collisions = this.game.collisions.filter(c =>
            !(
                c.constructor.name === 'TunnelVision'
            )
        );
    }

    startFrozen(durationMs = this.frozenDuration) {
        if (this.game.gameOver) return;
        if (this.currentState.deathAnimation) return;

        this.isFrozen = true;
        this.frozenTimer = Math.max(this.frozenTimer, durationMs);

        if (this.currentState !== this.states[7]) {
            this.setState(7, 1);
        }
        this.frameX = 0;
        this.frameTimer = 0;

        this.frozenFrameX = 0;
        this.frozenFrameY = this.frameY;
        this.frozenFrameTimer = 0;
        this.frozenMaxFrame = this.maxFrame;
        this.frozenFacingRight = this.facingRight;

        this.speed = 0;
        this.vx = 0;
        this.vy = 0;

        this.frozenPulseTimer = 0;
        this.frozenOpacity = 0.5;

        this.game.input.keys = [];

        this.game.audioHandler.firedogSFX.playSound('frozenSound', false, true);
    }

    updateFrozen(deltaTime) {
        if (!this.isFrozen) return;

        this.game.speed = 0;
        this.frozenTimer -= deltaTime;
        if (this.frozenTimer <= 0) {
            this.frozenTimer = 0;
            this.isFrozen = false;
            this.game.input.keys = [];
            return;
        }

        this.frameX = this.frozenFrameX;
        this.frameY = this.frozenFrameY;
        this.frameTimer = this.frozenFrameTimer;
        this.maxFrame = this.frozenMaxFrame;

        this.speed = 0;
        this.vx = 0;
        this.vy = 0;

        this.frozenPulseTimer += deltaTime;
        const phase = this.frozenPulseTimer * this.frozenPulseSpeed;
        const dip = 0.5 * (1 - Math.cos(phase));
        this.frozenOpacity = 0.5 - this.frozenPulseAmp * dip;
        if (this.frozenOpacity < 0.05) this.frozenOpacity = 0.05;
        if (this.frozenOpacity > 0.5) this.frozenOpacity = 0.5;
    }

    clearFreeze() {
        if (!this.isFrozen) return;
        this.isFrozen = false;
        this.frozenTimer = 0;
        this.game.input.keys = [];
    }

    bossCollisionTimers(deltaTime) { // needed for boss hazards (elyvorg barrier, slash, electricWheel)
        if (!this.game.bossInFight) return;
        this.bossCollisionTimer += deltaTime;
        this.bossCollisionTimer = Math.min(this.bossCollisionTimer, this.bossCollisionCooldown);
    }

    update(input, deltaTime) {
        this.checkIfFiredogIsDead();

        this.firedogLivesLimit();
        this.energyLogic(deltaTime);
        this.updateBluePotionTimer(deltaTime);
        this.checkIfFiredogIsSlowed(deltaTime);
        this.updateConfuse(deltaTime);
        this.emitStatusParticles(deltaTime);

        this.divingAbility(deltaTime);
        this.fireballAbility(input, deltaTime);
        this.invisibleAbility(input, deltaTime);
        this.bossCollisionTimers(deltaTime);
        this.updateFrozen(deltaTime);

        if (!this.currentState.deathAnimation) {
            this.playerSFXAudios();
            this.currentState.handleInput(input);
            this.underwaterGravityAndIndicator();

            this.spriteAnimation(deltaTime);
            this.playerHorizontalMovement(input, deltaTime);
            this.playerVerticalMovement(input);

            this.collisionWithEnemies(deltaTime);
            this.collisionWithPowers();

            this.firedogMeetsElyvorg(input);
        }
    }

    draw(context) {
        if (this.game.gameOver) {
            context.save();
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.scale(this.facingRight ? 1 : -1, 1);
            this.drawPlayerWithCurrentSkin(context);
            context.restore();
            return;
        }

        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);

        if (this.game.isBossVisible && this.game.boss.current) {
            const boss = this.game.boss.current;
            const bossOnRight =
                boss.x + boss.width / 2 > this.x + this.width / 2;

            if (bossOnRight) {
                this.facingRight = true;
                this.facingLeft = false;
                context.scale(1, 1);
            } else {
                this.facingRight = false;
                this.facingLeft = true;
                context.scale(-1, 1);
            }
        } else {
            context.scale(1, 1);
            this.facingRight = true;
            this.facingLeft = false;
        }

        this.drawPlayerWithCurrentSkin(context);

        context.restore();
    }

    getCurrentSkinImage() {
        switch (this.game.menu.skins.currentSkin) {
            case this.game.menu.skins.hatSkin:
                return this.hatImage;
            case this.game.menu.skins.choloSkin:
                return this.choloImage;
            case this.game.menu.skins.zabkaSkin:
                return this.zabkaImage;
            case this.game.menu.skins.shinySkin:
                return this.shinyImage;
            default:
                return this.image;
        }
    }

    getTintedFrameCanvas(img, sx, sy, sw, sh, dw, dh, tint) {
        const OW = Math.max(1, Math.round(dw));
        const OH = Math.max(1, Math.round(dh));

        if (!this.tintCanvas) {
            this.tintCanvas = document.createElement('canvas');
            this.tintCtx = this.tintCanvas.getContext('2d');
        }
        const oc = this.tintCanvas;
        const octx = this.tintCtx;

        if (oc.width !== OW || oc.height !== OH) {
            oc.width = OW;
            oc.height = OH;
        }

        octx.setTransform(1, 0, 0, 1, 0, 0);
        octx.clearRect(0, 0, OW, OH);
        octx.globalCompositeOperation = 'source-over';
        octx.drawImage(img, sx, sy, sw, sh, 0, 0, OW, OH);

        octx.globalCompositeOperation = 'source-atop';
        if (typeof tint === 'string') {
            octx.fillStyle = tint;
        } else {
            const grad = tint.dir === 'horizontal'
                ? octx.createLinearGradient(0, 0, OW, 0)
                : octx.createLinearGradient(0, 0, 0, OH);
            for (const stop of tint.stops) grad.addColorStop(stop.offset, stop.color);
            octx.fillStyle = grad;
        }
        octx.fillRect(0, 0, OW, OH);
        octx.globalCompositeOperation = 'source-over';

        return oc;
    }

    drawPlayerWithCurrentSkin(context) {
        if (this.isInvisible) context.globalAlpha = 0.5;

        const img = this.getCurrentSkinImage();

        const sx = this.frameX * this.width;
        const sy = this.frameY * this.height;
        const sw = this.width;
        const sh = this.height;
        const dx = -this.width / 2;
        const dy = -this.height / 2;
        const dw = this.width;
        const dh = this.height;

        const slowed = this.isSlowed;
        const poisoned = this.isPoisonedActive;

        const drawGlow = (color, blur = 6) => {
            context.save();
            context.shadowColor = color;
            context.shadowBlur = blur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
            context.restore();
        };

        if (slowed && poisoned) {
            drawGlow('rgba(0,160,255,1)', 7);
            const oc = this.getTintedFrameCanvas(
                img, sx, sy, sw, sh, dw, dh,
                {
                    dir: 'horizontal',
                    stops: [
                        { offset: 0.00, color: 'rgba(0,100,0,0.40)' },
                        { offset: 0.50, color: 'rgba(0,150,120,0.38)' },
                        { offset: 1.00, color: 'rgba(0,120,255,0.35)' },
                    ]
                }
            );
            context.drawImage(oc, dx, dy, dw, dh);
        } else if (poisoned) {
            drawGlow('rgba(0,130,0,1)', 6);
            const oc = this.getTintedFrameCanvas(img, sx, sy, sw, sh, dw, dh, 'rgba(0,100,0,0.40)');
            context.drawImage(oc, dx, dy, dw, dh);
        } else if (slowed) {
            drawGlow('rgba(0,160,255,1)', 6);
            const oc = this.getTintedFrameCanvas(img, sx, sy, sw, sh, dw, dh, 'rgba(0,120,255,0.35)');
            context.drawImage(oc, dx, dy, dw, dh);
        } else {
            context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        }

        if (this.isFrozen && this.frozenIceImage) {
            const iceImg = this.frozenIceImage;
            const iceScale = 1.1;
            const iceW = this.width * iceScale;
            const iceH = this.height * iceScale;

            context.save();
            context.globalAlpha = this.frozenOpacity;
            context.drawImage(iceImg, -iceW / 2, (-iceH / 2) + 10, iceW, iceH);
            context.restore();
        }

        context.globalAlpha = 1;
    }

    // lives
    firedogLivesLimit() {
        this.game.lives = Math.min(this.game.lives, this.game.maxLives);
    }

    // energy
    energyLogic(deltaTime) {
        this.energyTimer += deltaTime;
        this.energy = Math.max(0, Math.min(100, this.energy));

        let regenAmount = 0.4;

        if (this.currentState === this.states[5]) { // dive attack slows regen
            regenAmount *= 0.07;
        }

        if (this.energyTimer >= this.energyInterval) {
            this.energyTimer = 0;
            this.energy = Math.min(100, this.energy + regenAmount);
        }

        // blue potion
        if (this.isBluePotionActive && this.currentState === this.states[4]) {
            this.game.enemyInterval = 100;
            this.noEnergyLeftSound = false;
            this.isPoisonedActive = false;
            this.energy = Math.min(100, this.energy + 0.1);
        } else {
            this.game.enemyInterval = 1000;
            this.energyInterval = 70;
        }

        if (this.energyReachedZero === true && this.energy >= 20) {
            this.energyReachedZero = false;
            this.noEnergyLeftSound = false;
        }

        // poison
        if (this.isPoisonedActive) {
            if (this.poisonTimer > 0) {
                this.poisonTimer -= deltaTime;
            } else {
                this.poisonTimer = 0;
                this.isPoisonedActive = false;
            }

            if (!this.energyReachedZero) {
                this.energy = Math.max(0, this.energy - 0.1);
                if (this.poisonTimer <= 0) {
                    this.isPoisonedActive = false;
                    this.energyInterval = 100;
                } else {
                    this.energyInterval = 1000;
                }
                if (this.energy <= 0) {
                    this.isPoisonedActive = false;
                    this.energyReachedZero = true;
                    this.energyInterval = 100;
                }
            }
        }

        if (this.energyReachedZero && this.poisonTimer > 0) {
            this.isPoisonedActive = false;
            this.poisonTimer -= deltaTime;
        } else if (this.poisonTimer <= 0) {
            this.isPoisonedActive = false;
        }
    }

    isPoisonActiveChecker() {
        if (this.energyReachedZero || this.isBluePotionActive) {
            this.isPoisonedActive = false;
        } else {
            this.isPoisonedActive = true;
        }
        return this.isPoisonedActive;
    }

    isPoisonTimerChecker(x) {
        if (this.energyReachedZero || this.isBluePotionActive) {
            this.poisonTimer = 0;
        } else {
            this.poisonTimer = x;
        }
        return this.poisonTimer;
    }

    drainEnergy() {
        if (this.isBluePotionActive) return;

        const energyDrainAmount = 0.4;
        this.energy = Math.max(0, this.energy - energyDrainAmount);
        if (this.energy <= 0) {
            this.energyReachedZero = true;
        }
    }

    updateBluePotionTimer(deltaTime) {
        if (this.blueFireTimer <= 0) return;

        this.blueFireTimer -= deltaTime;

        if (this.blueFireTimer <= 0) {
            this.blueFireTimer = 0;
            this.isBluePotionActive = false;
            this.game.audioHandler.firedogSFX.stopSound('bluePotionEnergyGoingUp');

            if (!this.game.isBossVisible && !this.isFrozen) {
                if (this.currentState === this.states[4]) {
                    this.game.speed = 12;
                } else if (this.game.speed === this.bluePotionSpeed) {
                    this.game.speed = this.game.normalSpeed ?? 6;
                }
            }
        }
    }

    // abilities
    divingAbility(deltaTime) {
        this.divingTimer += deltaTime;
        this.divingTimer = Math.min(this.divingTimer, this.divingCooldown);
    }

    fireballAbility(input, deltaTime) {
        this.fireballTimer += deltaTime;
        this.fireballTimer = Math.min(this.fireballTimer, this.fireballCooldown);

        const inFireballState =
            this.currentState === this.states[0] ||
            this.currentState === this.states[1] ||
            this.currentState === this.states[2] ||
            this.currentState === this.states[3] ||
            this.currentState === this.states[8];

        if (
            inFireballState &&
            !this.energyReachedZero &&
            this.fireballTimer >= this.fireballCooldown &&
            this.game.input.isFireballAttack(input) &&
            !this.game.cabin.isFullyVisible
        ) {
            const underwater = this.isUnderwater;
            const redActive = this.isRedPotionActive;

            const sfxKey = underwater
                ? (redActive ? 'fireballUnderwaterRedPotionSFX' : 'fireballUnderwaterSFX')
                : (redActive ? 'fireballRedPotionActiveSFX' : 'fireballSFX');

            this.game.audioHandler.firedogSFX.playSound(sfxKey, false, true);

            const yOffset = this.currentState === this.states[0] ? 15 : 0; // small offset when sitting
            const baseX = this.x + 10 + this.width * 0.5;
            const baseY = this.y + this.height * 0.5 + yOffset;
            const fireballDirection = this.facingRight ? 'right' : 'left';

            if (redActive) {
                for (let i = -6; i <= 0; i++) {
                    this.game.behindPlayerParticles.unshift(
                        new Fireball(this.game, baseX, baseY, 'redPotionFireball', fireballDirection, i)
                    );
                }
            } else {
                this.game.behindPlayerParticles.unshift(
                    new Fireball(this.game, baseX, baseY, 'fireball', fireballDirection)
                );
            }

            this.energy = Math.max(0, this.energy - 8);
            if (this.energy <= 0) {
                this.energyReachedZero = true;
            }

            this.fireballTimer = 0;
        }

        if (this.isRedPotionActive) {
            this.redPotionTimer -= deltaTime;
            if (this.redPotionTimer <= 0) {
                this.isRedPotionActive = false;
            }
        }
    }

    invisibleAbility(input, deltaTime) {
        this.invisibleTimer += deltaTime;
        this.invisibleTimer = Math.min(this.invisibleTimer, this.invisibleCooldown);

        if (this.game.input.isInvisibleDefense(input) && !this.isInvisible && !this.game.gameOver) {
            if (this.invisibleTimer === this.invisibleCooldown) {
                this.isInvisible = true;
                this.game.audioHandler.firedogSFX.playSound('invisibleInSFX');
            }
        }

        if (this.invisibleTimer >= this.invisibleCooldown && this.isInvisible) {
            this.invisibleTimer = 0;
            this.invisibleActiveCooldownTimer = 5000;
        }

        if (this.isInvisible) {
            this.invisibleActiveCooldownTimer -= deltaTime;
            if (this.invisibleActiveCooldownTimer <= 0) {
                this.game.audioHandler.firedogSFX.playSound('invisibleOutSFX');
                this.isInvisible = false;
            }
        }
    }

    // audios
    playerSFXAudios() {
        // rolling
        if (this.rollingOrDiving()) {
            const rollingSoundName = this.isUnderwater ? 'rollingUnderwaterSFX' : 'rollingSFX';
            if (!this.isRolling) {
                this.isRolling = true;
                this.rollingSound = this.game.audioHandler.firedogSFX.playSound(rollingSoundName, true, true);
            }
            if (this.currentState === this.states[5] && this.onGround()) {
                this.rollingSound = this.game.audioHandler.firedogSFX.playSound(rollingSoundName, true, true);
            }
        } else if (this.isRolling) {
            this.isRolling = false;
            const rollingSoundName = this.isUnderwater ? 'rollingUnderwaterSFX' : 'rollingSFX';
            this.game.audioHandler.firedogSFX.stopSound(rollingSoundName);
        }

        // running
        if (this.currentState === this.states[1]) {
            if (this.frameX === 3) {
                this.game.audioHandler.firedogSFX.playSound('runningSFX1');
            }
            if (this.frameX === 6) {
                this.game.audioHandler.firedogSFX.playSound('runningSFX2');
            }
        }

        // getting hit
        if (this.game.lives < this.previousLives) {
            this.game.audioHandler.firedogSFX.playSound('gettingHit', false, true);
            if (this.game.time >= 1000) {
                this.triggerDamageIndicator();
            } else {
                this.game.audioHandler.firedogSFX.stopSound('gettingHit');
            }
        }
        this.previousLives = this.game.lives;

        // no energy
        if (this.energyReachedZero && !this.noEnergyLeftSound) {
            this.game.audioHandler.firedogSFX.playSound('energyReachedZeroSound');
            this.noEnergyLeftSound = true;
        }
    }

    // states
    setState(state, speed) {
        this.previousState = this.currentState;
        this.currentState = this.states[state];

        if (!this.game.isBossVisible) {
            if (this.isFrozen) {
                this.game.speed = 0;
            } else if (this.isBluePotionActive && this.currentState === this.states[4]) {
                this.game.speed = this.bluePotionSpeed;
            } else {
                this.game.speed = this.game.normalSpeed * speed;
            }
        } else {
            this.game.speed = 0;
        }

        this.currentState.enter();
    }

    rollingOrDiving() {
        return this.currentState === this.states[4] || this.currentState === this.states[5];
    }

    // taking damage
    hit(enemy) {
        if (this.isInvisible) return;

        if (this.isFrozen) {
            if (enemy.dealsDirectHitDamage) {
                this.game.coins -= 1;
                this.game.lives -= 1;
            }
            return;
        }

        if (this.currentState === this.states[0]) {
            this.setState(7, 0);
        } else {
            this.setState(7, 1);
        }

        if (enemy.dealsDirectHitDamage) {
            this.game.coins -= 1;
            this.game.lives -= 1;
        }
    }

    stunned(enemy) {
        if (this.isInvisible) return;

        if (this.isFrozen) {
            this.game.audioHandler.firedogSFX.playSound('stunnedSound', false, true);
            this.game.coins -= 1;
            this.game.lives -= 1;
            return;
        }

        this.game.audioHandler.firedogSFX.playSound('stunnedSound', false, true);
        this.setState(6, 0);

        this.collisionLogic.specialCollisionAnimationOrNot(enemy);

        this.game.coins -= 1;
        this.game.lives -= 1;
    }

    bloodOrPoof(enemy) {
        // boss enemies
        if (enemy instanceof EnemyBoss) {
            this.game.collisions.push(
                new Blood(
                    this.game,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5,
                    enemy
                )
            );
            this.game.audioHandler.collisionSFX.playSound('bloodSound', false, true);
            return;
        }

        if (enemy instanceof Barrier) return;

        // normal enemies
        if (enemy.lives >= 1) {
            this.game.collisions.push(
                new Blood(
                    this.game,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5,
                    enemy
                )
            );
            this.game.audioHandler.collisionSFX.playSound('bloodSound', false, true);
        } else {
            this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
            this.game.collisions.push(
                new CollisionAnimation(
                    this.game,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5,
                    this.isBluePotionActive
                )
            );

            if (enemy instanceof Goblin) {
                this.game.audioHandler.enemySFX.playSound('goblinDie', false, true);
            }
        }
    }

    // screen indicators
    triggerDamageIndicator() {
        const ONE_MINUTE = 60000;
        const isMap3 =
            this.game.background &&
            this.game.background.constructor &&
            this.game.background.constructor.name === 'Map3';

        if (isMap3 && this.game.time < this.game.maxTime - ONE_MINUTE) {
            this.firstLoopDamageIndicator = true;
        }

        const existingDamageIndicator = this.game.collisions.find(
            c => c instanceof DamageIndicator
        );

        if (existingDamageIndicator) {
            if (!(isMap3 && this.game.time >= this.game.maxTime - ONE_MINUTE)) {
                existingDamageIndicator.reset();
            }
        } else {
            this.game.collisions.push(new DamageIndicator(this.game));
        }
    }

    underwaterGravityAndIndicator() {
        if (!this.isUnderwater) return;

        if (this.onGround()) {
            this.vy = 0;
        } else {
            const vyDecreaseFactor = 0.01;
            this.vy = Math.max(-3, this.vy - vyDecreaseFactor * this.y / this.buoyancy);
        }

        if (this.game.UI.secondsLeftActivated && this.loopDamageIndicator && !this.game.cabin.isFullyVisible) {
            if (this.game.time >= 1000) {
                if (this.firstLoopDamageIndicator) {
                    this.firstLoopDamageIndicator = false;
                    const existingDamageIndicator = this.game.collisions.find(
                        collision => collision instanceof DamageIndicator
                    );
                    if (existingDamageIndicator) {
                        existingDamageIndicator.reset();
                    }
                }
                this.triggerDamageIndicator();
                this.loopDamageIndicator = false;
            }
        }
    }

    triggerInkSplash() {
        if (this.isInvisible) return;

        const inkSplash = new InkSplash(this.game);
        inkSplash.x = this.x - inkSplash.getWidth() / 2;
        this.game.collisions.push(inkSplash);
    }

    triggerTunnelVision(options = null) {
        const existing = this.game.collisions.find(c => c instanceof TunnelVision);

        if (existing) {
            if (options && typeof options === "object") {
                existing.restartFromCurrentWithOptions(options);
            } else {
                existing.restartFromCurrent();
            }
            return;
        }

        const tv = options ? new TunnelVision(this.game, options) : new TunnelVision(this.game);
        this.game.collisions.push(tv);
    }

    emitStatusParticles(deltaTime) {
        this.statusFxTimer += deltaTime;
        if (this.statusFxTimer < this.statusFxInterval) return;
        this.statusFxTimer = 0;

        const lineLeft = this.x + this.width * 0.20;
        const lineRight = this.x + this.width * 0.80;
        const spawnY = this.y + this.height * 0.5;

        const jitter = 6;
        const pickX = () =>
            lineLeft + Math.random() * (lineRight - lineLeft) + (Math.random() * jitter - jitter / 2);

        const spawnPoisonBubbles = (kind) => {
            this.game.particles.unshift(new PoisonBubbles(this.game, pickX(), spawnY, kind));
        };

        const spawnIceCrystal = () => {
            this.game.particles.unshift(new IceCrystalBubbles(this.game, pickX(), spawnY));
        };

        if (this.isPoisonedActive && this.isSlowed) {
            spawnPoisonBubbles('poison');
            spawnIceCrystal();
            return;
        }

        if (this.isPoisonedActive && Math.random() < 0.75) {
            spawnPoisonBubbles('poison');
        }

        if (this.isSlowed && Math.random() < 1.0) {
            spawnIceCrystal();
        }

        if (!this.game.particles.some(p => p instanceof SpinningChicks)) {
            this.game.particles.push(new SpinningChicks(this.game));
        }
    }

    // movement logic
    spriteAnimation(deltaTime) {
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else {
            this.frameTimer += deltaTime;
        }
    }

    onGround() {
        return this.y >= this.game.height - this.height - this.game.groundMargin;
    }

    playerHorizontalMovement(input, deltaTime) {
        if (this.isFrozen) return;

        const talkingToBoss = this.game.boss && this.game.boss.talkToBoss;
        if (this.isIce && !talkingToBoss) {
            this.applyIceMovementExact(input, deltaTime);
            return;
        }

        const right = this._moveRight(input);
        const left = this._moveLeft(input);

        this.x += this.speed;

        if (right && this.currentState !== this.states[6]) {
            this.speed = this.maxSpeed;
        } else if (left && this.currentState !== this.states[6]) {
            if (this.game.isBossVisible || this.game.cabin.isFullyVisible) {
                this.speed = -this.maxSpeed;
            } else if (this.currentState === this.states[4]) {
                this.speed = -this.maxSpeed * 1.7;
            } else {
                this.speed = -this.maxSpeed * 1.3;
            }
        } else {
            this.speed = 0;
        }

        if (this.x < 0) this.x = 0;
        if (this.x > this.game.width - this.width) {
            this.x = this.game.width - this.width;
        }
    }

    applyIceMovementExact(input, deltaTime) {
        let axis = 0;
        if (this._moveLeft(input)) axis -= 1;
        if (this._moveRight(input)) axis += 1;

        const onIce = true;
        const stunned = this.currentState === this.states[6];

        const accel = this.accelIce;
        const frictionBase = this.frictionIce;

        let speedCap = this.maxSpeed;
        if (axis < 0) {
            if (this.game.isBossVisible || this.game.cabin.isFullyVisible) {
                speedCap = this.maxSpeed;
            } else if (this.currentState === this.states[4]) {
                speedCap = this.maxSpeed * 1.7;
            } else {
                speedCap = this.maxSpeed * 1.3;
            }
        }

        const dt = Math.max(1, deltaTime || 16);

        if (onIce && this.prevAxis !== 0 && axis === 0) {
            if (this.vx < 0) {
                this.slideTimer = this.slideGraceMsBack;
                this._reverseSlideActive = true;
                if (Math.abs(this.vx) > 0.05 && this.slideBoostBack > 0) {
                    this.vx *= (1 + this.slideBoostBack);
                }
            } else {
                this.slideTimer = this.slideGraceMs;
                this._reverseSlideActive = false;
            }
        }

        const slideFric =
            (this._reverseSlideActive ? this.slideFrictionIceBack : this.slideFrictionIce);

        if (stunned) {
            const effFric = (onIce && this.slideTimer > 0) ? slideFric : frictionBase;
            const decay = Math.max(0, 1 - effFric * dt);
            this.vx *= decay;
        } else {
            if (Math.abs(axis) < this.deadzone) axis = 0;

            let effectiveAccel = accel;
            if (
                onIce &&
                axis !== 0 &&
                Math.sign(axis) !== Math.sign(this.vx) &&
                Math.abs(this.vx) > 0.01
            ) {
                effectiveAccel *= (1 - this.turnResistanceIce);
            }

            this.vx += axis * effectiveAccel * dt;

            if (axis === 0) {
                const effFric = (onIce && this.slideTimer > 0) ? slideFric : frictionBase;
                const decay = Math.max(0, 1 - effFric * dt);
                this.vx *= decay;

                if (onIce && Math.abs(this.vx) < 0.01 && this.iceIdleDrift > 0) {
                    this.vx += (Math.random() * 2 - 1) * this.iceIdleDrift * dt;
                }
            } else {
                this._reverseSlideActive = false;
            }
        }

        if (this.slideTimer > 0) {
            this.slideTimer = Math.max(0, this.slideTimer - dt);
            if (this.slideTimer === 0) this._reverseSlideActive = false;
        }

        if (this.vx > speedCap) this.vx = speedCap;
        if (this.vx < -speedCap) this.vx = -speedCap;

        this.x += this.vx;

        if (this.x < 0) {
            this.x = 0;
            if (this.vx < 0) this.vx = 0;
        }
        const rightMax = this.game.width - this.width;
        if (this.x > rightMax) {
            this.x = rightMax;
            if (this.vx > 0) this.vx = 0;
        }

        this.speed = this.vx;
        this.prevAxis = axis;
    }

    playerVerticalMovement(input) {
        if (this.isFrozen) return;

        if (this.isSpace) {
            const spaceGravity = 0.07;
            const fallClamp = 3;

            this.y += this.vy;

            if (this.vy < fallClamp) {
                this.vy += spaceGravity;
            }

            const minY = 0;
            const maxY = this.game.height - this.height - this.game.groundMargin;

            if (this.y < minY) {
                this.y = minY;
                this.vy = 0;
            } else if (this.y > maxY) {
                this.y = maxY;
                this.vy = 0;
                this.canSpaceDoubleJump = false;
            }

            return;
        }

        this.y += this.vy;
        if (!this.onGround()) {
            this.vy += this.weight;
        } else {
            this.vy = 0;
        }

        if (this.isUnderwater) {
            if (this.game.input.isRollAttack(input) && this._jump(input) && this.currentState === this.states[4]) {
                this.buoyancy -= 1;
                this.y -= 4;
            }
            if (this.buoyancy < 1) {
                this.buoyancy = 1;
            } else if (this.buoyancy > 4) {
                this.buoyancy = 4;
            }
        }

        if (this.y > this.game.height - this.height - this.game.groundMargin) {
            this.y = this.game.height - this.height - this.game.groundMargin;
            this.canSpaceDoubleJump = false;
        }
    }

    firedogMeetsElyvorg(input) {
        const left = this._moveLeft(input);
        const right = this._moveRight(input);

        if (this.game.isBossVisible && this.currentState === this.states[4]) {
            if (this.facingRight) {
                if (!(this.game.input.isRollAttack(input) && !left && !right)) {
                    if (left) this.x -= 6;
                    else this.x += 6;
                }
            } else if (this.facingLeft) {
                if (!(this.game.input.isRollAttack(input) && !left && !right)) {
                    if (right) this.x += 6;
                    else this.x -= 6;
                }
            }
        }

        if (this.game.boss.talkToBoss && this.game.isBossVisible) {
            if (this.x > 0) {
                if (this.setToRunOnce) {
                    this.game.input.keys = [];
                    this.setToRunOnce = false;
                    this.setState(1, 1);
                }
                this.x -= 6;
            } else if (this.setToStandingOnce) {
                setTimeout(() => {
                    this.game.input.keys = [];
                    this.setToStandingOnce = false;
                    this.setState(8, 0);
                }, 10);
            }
        }
    }

    checkIfFiredogIsDead() {
        if (this.game.lives <= 0) {
            if (this.game.noDamageDuringTutorial) {
                this.game.menu.levelDifficulty.setDifficulty(this.game.selectedDifficulty);
            } else {
                this.game.gameOver = true;
            }
        }

        if (this.game.gameOver) {
            this.clearFreeze();
        }

        if (this.currentState.deathAnimation && (this.isUnderwater || this.isSpace) && !this.onGround()) {
            this.y += 2;
        }
    }

    checkIfFiredogIsSlowed(deltaTime) {
        if (!this.isSlowed) return;

        if (this.slowedTimer > 0) {
            this.slowedTimer -= deltaTime;

            this.normalSpeed = this.baseNormalSpeed * this.slowNormalSpeedMultiplier;
            this.maxSpeed = this.baseMaxSpeed * this.slowMaxSpeedMultiplier;
            this.weight = this.baseWeight * this.slowWeightMultiplier;
        } else {
            this.slowedTimer = 0;
            this.isSlowed = false;

            this.normalSpeed = this.baseNormalSpeed;
            this.maxSpeed = this.baseMaxSpeed;
            this.weight = this.baseWeight;
        }
    }

    updateConfuse(deltaTime) {
        if (!this.isConfused) return;

        this.confuseTimer -= deltaTime;
        if (this.confuseTimer <= 0) {
            this.isConfused = false;
            this.confusedKeyBindings = null;
        }
    }

    activateConfuse() {
        const tutorialMapActive = this.game.isTutorialActive && this.game.currentMap === 'Map1';
        const base =
            (tutorialMapActive ? this.game._defaultKeyBindings : this.game.keyBindings) ||
            this.game._defaultKeyBindings ||
            getDefaultKeyBindings();

        const MOVEMENT_ACTIONS = ['jump', 'moveBackward', 'sit', 'moveForward'];
        const movementKeys = MOVEMENT_ACTIONS.map(a => base[a] ?? null);

        const shuffled = movementKeys.slice();
        const changes = (a, b) => a.reduce((n, v, i) => n + (v !== b[i] ? 1 : 0), 0);

        let tries = 0;
        do {
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            tries++;
        } while (changes(movementKeys, shuffled) < 2 && tries < 6);

        if (changes(movementKeys, shuffled) < 2) {
            for (let i = 0; i < shuffled.length; i++) {
                for (let j = i + 1; j < shuffled.length; j++) {
                    if (movementKeys[i] !== movementKeys[j]) {
                        [shuffled[i], shuffled[j]] = [movementKeys[j], movementKeys[i]];
                        i = j = shuffled.length;
                    }
                }
            }
        }

        const confused = { ...base };
        MOVEMENT_ACTIONS.forEach((action, idx) => {
            confused[action] = shuffled[idx];
        });

        this.confusedKeyBindings = confused;
        this.isConfused = true;
        this.confuseTimer = this.confuseDuration;
    }

    collisionWithEnemies(deltaTime) {
        const enemiesHit = new Set(); // keeps track of enemies already hit by red-potion fireballs

        this.game.enemies.forEach(enemy => {
            this.collisionLogic.handleFiredogCollisionWithEnemy(enemy);
            this.collisionLogic.handleFireballCollisionWithEnemy(enemy, enemiesHit);
            this.collisionLogic.collisionAnimationFollowsEnemy(enemy);
        });

        this.collisionLogic.updateCollisionCooldowns(deltaTime);
    }

    collisionWithPowers() {
        this.collisionLogic.handlePowerCollisions();
    }

    handleFloatingMessages(enemy) {
        if (enemy.lives <= 0 && this.game.lives === this.previousLives) {
            this.game.coins += 1;
            this.game.player.energy += 2;
            this.game.floatingMessages.push(
                new FloatingMessage('+1', enemy.x, enemy.y, 150, 50, 30)
            );
        }
    }
}

// ======================================================================
// CollisionLogic
// ======================================================================
export class CollisionLogic {
    constructor(game) {
        this.game = game;
        this._fireballHandlers = null;
    }

    getPlayerRect() {
        const p = this.game.player;
        return { x: p.x, y: p.y, width: p.width, height: p.height };
    }

    getFireballRect(fireball) {
        const size = typeof fireball.size === "number" ? fireball.size : 0;
        return { x: fireball.x, y: fireball.y, width: size, height: size };
    }

    overlapsAABB(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    overlapsWithPlayer(rect) {
        return this.overlapsAABB(rect, this.getPlayerRect());
    }

    overlapsFireballEnemy(fireball, enemy) {
        return this.overlapsAABB(this.getFireballRect(fireball), {
            x: enemy.x,
            y: enemy.y,
            width: enemy.width,
            height: enemy.height,
        });
    }

    isKamehameha(enemy) {
        return !!enemy && (enemy.isKamehameha || enemy instanceof Kamehameha);
    }

    circleIntersectsAABB(cx, cy, r, rect) {
        const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));
        const dx = cx - closestX;
        const dy = cy - closestY;
        return (dx * dx + dy * dy) <= r * r;
    }

    closestPointOnSegment(px, py, ax, ay, bx, by) {
        const abx = bx - ax, aby = by - ay;
        const apx = px - ax, apy = py - ay;

        const abLen2 = abx * abx + aby * aby;
        if (abLen2 <= 1e-6) return { x: ax, y: ay, t: 0 };

        let t = (apx * abx + apy * aby) / abLen2;
        t = Math.max(0, Math.min(1, t));

        return { x: ax + abx * t, y: ay + aby * t, t };
    }

    beamHitsRect(beam, rect) {
        if (beam._phase !== "beam") return false;

        const mx = beam.mouthX, my = beam.mouthY;
        const ex = beam.endX, ey = beam.endY;

        const dx = ex - mx, dy = ey - my;
        const len = Math.hypot(dx, dy);
        if (len < 1) return false;

        const ux = dx / len, uy = dy / len;
        const rx = -uy, ry = ux;

        const half = (beam.thickness ?? 42) * 0.5 * 0.55;

        const pts = [
            { x: rect.x, y: rect.y },
            { x: rect.x + rect.width, y: rect.y },
            { x: rect.x, y: rect.y + rect.height },
            { x: rect.x + rect.width, y: rect.y + rect.height },
            { x: rect.x + rect.width * 0.5, y: rect.y + rect.height * 0.5 },
        ];

        for (const p of pts) {
            const px = p.x - mx;
            const py = p.y - my;

            const localX = px * ux + py * uy;
            const localY = px * rx + py * ry;

            if (localX >= 0 && localX <= len && Math.abs(localY) <= half) {
                return true;
            }
        }

        return (
            this.circleIntersectsAABB(mx, my, half, rect) ||
            this.circleIntersectsAABB(ex, ey, half, rect)
        );
    }

    beamHitsPlayer(beam, player) {
        return this.beamHitsRect(beam, player);
    }

    enemyHitsRect(enemy, targetRect) {
        if (this.isKamehameha(enemy)) return this.beamHitsRect(enemy, targetRect);
        return this.overlapsAABB(
            { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height },
            targetRect
        );
    }

    shouldSkipElyvorgTeleportCollision(enemy, player) {
        const boss = this.game.boss && this.game.boss.current;
        if (!(boss instanceof Elyvorg)) return false;

        const isTeleporting = boss.state === 'teleport';
        const inPostTeleportSafeWindow =
            boss.postTeleportSafeTimer && boss.postTeleportSafeTimer > 0;
        const safePhase = isTeleporting || inPostTeleportSafeWindow;

        if (!safePhase) return false;

        if ((enemy instanceof Elyvorg || enemy instanceof PurpleBarrier) &&
            !player.rollingOrDiving()) {
            return true;
        }

        return false;
    }

    handleHealingBarrierCollision(barrier) {
        if (barrier.lives <= 0) {
            this.game.collisions.push(
                new DisintegrateCollision(this.game, barrier, { followTarget: this.game.boss.current })
            );
        }

        const boss = this.game.boss?.current;
        if (boss && boss.isBarrierActive) {
            const burst = new HealingStarBurstCollision(this.game, boss, {
                followTarget: boss,
                soundId: "healingStarSound",
                playSound: true,
            });
            burst.start();

            boss.healingStarBursts ??= [];
            boss.healingStarBursts.push(burst);

            const overhealCap = boss.maxLives * (1 + (boss.overhealPercent ?? 0));
            boss.lives = Math.min(boss.lives + 2, overhealCap);
        }
    }

    // fireball collision
    get fireballCollisionHandlers() {
        if (this._fireballHandlers) return this._fireballHandlers;

        const player = this.game.player;

        const spawnAtEnemy = (AnimClass) => (enemy) => {
            this.game.collisions.push(
                new AnimClass(
                    this.game,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5
                )
            );
        };

        const spawnAtEnemyXFireballY = (spawnFn, soundKey) => (enemy, fireball) => {
            const x = enemy.x + enemy.width * 0.5;

            let y;
            if (fireball && typeof fireball.y === "number") {
                const size = typeof fireball.size === "number" ? fireball.size : 0;
                y = fireball.y + size * 0.5;
            } else {
                y = player.y + player.height * 0.5;
            }

            spawnFn(enemy, x, y, fireball);

            if (soundKey) {
                this.game.audioHandler.collisionSFX.playSound(soundKey, false, true);
            }
        };

        const slugSplash = (enemy) => {
            spawnAtEnemy(InkSplashCollision)(enemy);
            this.game.audioHandler.collisionSFX.playSound('slugExplosion', false, true);
        };

        this._fireballHandlers = {
            PurpleFireball: (enemy) => {
                spawnAtEnemy(RedFireballCollision)(enemy);
                this.game.audioHandler.collisionSFX.playSound('fireballExplosionSound', false, true);

                this.game.floatingMessages.push(
                    new FloatingMessage('+20', enemy.x, enemy.y, 160, 120, 30, 'orange')
                );

                player.energy += 20;

                const msg = Math.random() < 0.5 ? 'NICE!' : 'EPIC!';
                this.game.floatingMessages.push(
                    new FloatingMessage(msg, enemy.x, enemy.y, this.game.width / 2, 80, 50)
                );
            },

            MeteorAttack: (enemy) => {
                spawnAtEnemy(MeteorExplosionCollision)(enemy);
                this.game.audioHandler.enemySFX.playSound(
                    'elyvorg_meteor_in_contact_sound',
                    false,
                    true
                );
            },

            PurpleAsteroid: (enemy) => {
                this.game.collisions.push(
                    new AsteroidExplosionCollision(
                        this.game,
                        enemy.x + enemy.width * 0.5,
                        enemy.y + enemy.height * 0.5 - 70
                    )
                );
                this.game.audioHandler.collisionSFX.playSound('elyvorg_meteor_in_contact_sound', false, true);
            },

            BlueAsteroid: (enemy) => {
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('elyvorg_meteor_in_contact_sound', false, true);
            },

            PurpleBallOrb: (enemy) => {
                // no collision animation
            },

            LaserBall: (enemy) => {
                const mode2 =
                    !!enemy.mode2Active ||
                    !!enemy.mode2;

                spawnAtEnemy(mode2 ? RedFireballCollision : PurpleFireballCollision)(enemy);
                this.game.audioHandler.collisionSFX.playSound('fireballExplosionSound', false, true);
            },

            Kamehameha: (enemy, fireball) => {
                const size = typeof fireball?.size === "number" ? fireball.size : 0;
                const fcx = (typeof fireball?.x === "number" ? fireball.x : 0) + size * 0.5;
                const fcy = (typeof fireball?.y === "number" ? fireball.y : 0) + size * 0.5;

                const mx = enemy.mouthX, my = enemy.mouthY;
                const ex = enemy.endX, ey = enemy.endY;

                const hit = this.closestPointOnSegment(fcx, fcy, mx, my, ex, ey);

                this.game.collisions.push(
                    new BallParticleBurstCollision(this.game, hit.x, hit.y, {
                        color: "#098cf7ff",
                        count: 48,
                        minRadius: 2,
                        maxRadius: 6,
                        minSpeed: 3,
                        maxSpeed: 9,
                        gravity: 0.45,
                        spread: Math.PI * 1.1,
                        duration: 600,
                    })
                );

                this.game.audioHandler.collisionSFX.playSound(
                    "ntharaxKamehamehaCollisionSound",
                    false,
                    true
                );
            },

            AntennaeTentacle: spawnAtEnemyXFireballY((enemy, x, y) => {
                const mode2 =
                    !!enemy.mode2Active ||
                    !!enemy.mode2

                this.game.collisions.push(
                    new BallParticleBurstCollision(
                        this.game,
                        x,
                        y,
                        mode2
                            ? {
                                color: "#fa0b7aff",
                                count: 44,
                                minRadius: 2,
                                maxRadius: 7,
                                minSpeed: 4,
                                maxSpeed: 11,
                                gravity: 0.52,
                                spread: Math.PI * 1.2,
                                duration: 720,
                            }
                            : {
                                color: "#cf0fe9ff",
                                count: 28,
                                minRadius: 2,
                                maxRadius: 6,
                                minSpeed: 3,
                                maxSpeed: 9,
                                gravity: 0.45,
                                spread: Math.PI * 1.1,
                                duration: 600,
                            }
                    )
                );
                this.game.audioHandler.collisionSFX.playSound(
                    'ntharaxTentacleCollisionSound',
                    false,
                    true
                );
            }),

            GravitationalAura: (enemy) => {
                spawnAtEnemy(DarkExplosionCollision)(enemy);
                this.game.audioHandler.collisionSFX.playSound('darkExplosionCollisionSound', false, true);
            },

            PoisonDrop: (enemy) => {
                spawnAtEnemy(PoisonDropCollision)(enemy);
                this.game.audioHandler.collisionSFX.playSound('poisonDropCollisionSound', false, true);
            },

            ElectricWheel: (enemy) => {
                spawnAtEnemy(ElectricityCollision)(enemy);
                this.game.audioHandler.collisionSFX.playSound('elyvorg_electricity_wheel_collision_sound', false, true);
            },

            PurpleThunder: spawnAtEnemyXFireballY(
                (enemy, x, y) => {
                    this.game.collisions.push(
                        new PurpleThunderCollision(this.game, x, y)
                    );
                },
                'elyvorg_electricity_wheel_collision_sound'
            ),

            Arrow: (enemy) => {
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
            },

            PurpleLaserBeam: (enemy) => {
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
            },

            Goblin: (enemy) => {
                spawnAtEnemy(CollisionAnimation)(enemy);
                this.game.audioHandler.enemySFX.playSound('goblinDie', false, true);
                this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
                enemy.lives = 0;
            },

            Skulnap: (enemy) => {
                this.game.collisions.push(
                    new ExplosionCollisionAnimation(
                        this.game,
                        enemy.x + enemy.width * 0.5,
                        enemy.y + enemy.height * 0.5,
                        enemy.id
                    )
                );
                this.game.audioHandler.collisionSFX.playSound('explosionCollision', false, true);
            },

            Sluggie: slugSplash,
            Garry: slugSplash,
            InkBeam: slugSplash,

            InkBomb: (enemy) => {
                spawnAtEnemy(InkBombCollision)(enemy);
                this.game.audioHandler.collisionSFX.playSound('slugExplosion', false, true);
            },

            PoisonSpit: (enemy) => {
                spawnAtEnemy(PoisonSpitSplash)(enemy);
                this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
            },

            Glacikal: (enemy) => {
                enemy.lives--;
                player.bloodOrPoof(enemy);
            },

            IcyStormBall: (enemy) => {
                spawnAtEnemy(IcyStormBallCollision)(enemy);
                this.game.audioHandler.collisionSFX.playSound('breakingIceNoDamageSound', false, true);
            },

            SpinningIceBalls: (enemy) => {
                spawnAtEnemy(SpinningIceBallsCollision)(enemy);
                this.game.audioHandler.collisionSFX.playSound('breakingIceNoDamageSound', false, true);
            },

            PointyIcicleShard: (enemy) => {
                spawnAtEnemy(PointyIcicleShardCollision)(enemy);
                this.game.audioHandler.collisionSFX.playSound('breakingIceNoDamageSound', false, true);
            },

            UndergroundIcicle: spawnAtEnemyXFireballY(
                (enemy, x, y) => {
                    this.game.collisions.push(
                        new UndergroundIcicleCollision(this.game, x, y)
                    );
                },
                'breakingIceNoDamageSound'
            ),

            IceSlash: (enemy) => {
                const shouldInvert = enemy.speedX > 0;
                this.game.collisions.push(
                    new IceSlashCollision(
                        this.game,
                        enemy.x + enemy.width * 0.5,
                        enemy.y + enemy.height * 0.5,
                        shouldInvert
                    )
                );
                this.game.audioHandler.collisionSFX.playSound('breakingIceNoDamageSound', false, true);
            },

            IceTrail: (enemy) => {
                spawnAtEnemy(IceTrailCollision)(enemy);
                this.game.audioHandler.collisionSFX.playSound('breakingIceNoDamageSound', false, true);
            },

            NTharax: (enemy) => {
                if (enemy.isTransforming || enemy.state === "transform") return;
                if (!enemy.isBarrierActive) {
                    enemy.lives--;
                    player.bloodOrPoof(enemy);
                }
            },

            HealingBarrier: (barrier) => {
                this.handleHealingBarrierCollision(barrier);
            },

            PurpleBeamOrb: (enemy) => {
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('ntharaxSplitBeamCollisionSound', false, true);
            },

            YellowBeamOrb: (enemy) => {
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('ntharaxSplitBeamCollisionSound', false, true);
            },

            BlackBeamOrb: (enemy) => {
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('ntharaxSplitBeamCollisionSound', false, true);
            },

            GalacticSpike: (enemy) => {
                const x = enemy.x + enemy.width * 0.5;
                const y = enemy.y + enemy.height * 0.5;

                const groundBottom = enemy.groundBottom;
                const clipRect = {
                    x: 0,
                    y: 0,
                    w: this.game.width,
                    h: groundBottom,
                };

                this.game.collisions.push(
                    new GalacticSpikeCollision(this.game, x, y, enemy.heightScale, 1, clipRect)
                );

                this.game.audioHandler.collisionSFX.playSound(
                    "galacticSpikeCollisionSound",
                    false,
                    true
                );
            },

            Elyvorg: (enemy) => {
                if (!enemy.isBarrierActive) {
                    enemy.lives--;
                    player.bloodOrPoof(enemy);
                }
            },

            PurpleBarrier: (enemy) => {
                if (enemy.lives <= 0) {
                    this.game.collisions.push(
                        new DisintegrateCollision(this.game, enemy, { followTarget: this.game.boss.current })
                    );
                }
            },

            GhostElyvorg: (enemy) => {
                this.game.collisions.push(new GhostFadeOut(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('elyvorg_ghost_hit_sound_effect', false, true);
            },

            default: (enemy) => {
                player.bloodOrPoof(enemy);
            }
        };

        return this._fireballHandlers;
    }

    // enemies collision
    handleFiredogCollisionWithEnemy(enemy) {
        const player = this.game.player;
        if (this.game.gameOver || player.collisionCooldowns[enemy.id] > 0) return;

        if (!this.enemyHitsRect(enemy, this.getPlayerRect())) return;

        if (enemy instanceof EnemyBoss) {
            const bossInvulnerable =
            !this.game.bossInFight ||
            this.game.cutsceneActive ||
            (this.game.boss && this.game.boss.talkToBoss) ||
            (this.game.boss && this.game.boss.preFight);

            if (bossInvulnerable) return;
        }

        if (this.isKamehameha(enemy)) {
            player.collisionCooldowns[enemy.id] = 220;
            if (!player.isInvisible) {
                player.hit(enemy);
            }
            if (!player.isInvisible || player.rollingOrDiving()) {
                this.collisionAnimationBasedOnEnemy(enemy);
            }
            return;
        }

        if (this.shouldSkipElyvorgTeleportCollision(enemy, player)) return;

        if (!player.isInvisible || (player.isInvisible && player.rollingOrDiving())) {
            player.collisionCooldowns[enemy.id] = 500;
            if (!(enemy instanceof EnemyBoss)) enemy.lives -= 1;
        }

        if (player.rollingOrDiving()) {
            if (player.isBluePotionActive) {
                enemy.lives -= 3;
                player.handleFloatingMessages(enemy);
                player.bloodOrPoof(enemy);
                return;
            }
            this.handleRollingOrDivingCollision(enemy);
            player.handleFloatingMessages(enemy);
        } else {
            this.handleNormalCollision(enemy);
        }
    }

    // fireball vs enemy
    handleFireballCollisionWithEnemy(enemy, enemiesHit) {
        this.game.behindPlayerParticles.forEach(fireball => {
            if (!(fireball instanceof Fireball)) return;

            const fireballRect = this.getFireballRect(fireball);

            if (!this.enemyHitsRect(enemy, fireballRect)) return;

            this.handleSpecificFireballCollisions(fireball, enemy, enemiesHit);
        });
    }

    handleSpecificFireballCollisions(fireball, enemy, enemiesHit) {
        const player = this.game.player;

        if (enemiesHit.has(enemy)) return;
        enemiesHit.add(enemy);

        const isBoss = enemy instanceof EnemyBoss;
        const bossInvulnerable =
            isBoss &&
            (
                !this.game.bossInFight ||
                this.game.cutsceneActive ||
                (this.game.boss && this.game.boss.talkToBoss) ||
                (this.game.boss && this.game.boss.preFight)
            );

        if (bossInvulnerable) {
            fireball.markedForDeletion = true;
            return;
        }

        if (!(enemy instanceof EnemyBoss)) enemy.lives--;

        if (fireball.type === 'normalMode') {
            fireball.markedForDeletion = true;
        }

        const handlers = this.fireballCollisionHandlers;
        const type = enemy.constructor.name;
        (handlers[type] || handlers.default)(enemy, fireball);

        player.handleFloatingMessages(enemy);
    }

    // follow collision animations
    collisionAnimationFollowsEnemy(enemy) {
        const player = this.game.player;

        this.game.collisions.forEach(collision => {
            if (collision instanceof ElectricityCollision && enemy instanceof ElectricWheel) {
                const overlaps =
                    collision.x < player.x + player.width &&
                    collision.x + collision.width > player.x &&
                    collision.y < player.y + player.height &&
                    collision.y + collision.height > player.y;

                if (overlaps) collision.updatePositionWhereCollisionHappened(collision.x, collision.y);
                else collision.updatePosition(enemy);
            } else if (collision instanceof Blood && collision.enemy === enemy) {
                collision.updatePosition(enemy);
            }
        });
    }

    // cooldowns
    updateCollisionCooldowns(deltaTime) {
        const player = this.game.player;
        Object.keys(player.collisionCooldowns).forEach(enemyId => {
            player.collisionCooldowns[enemyId] =
                Math.max(0, player.collisionCooldowns[enemyId] - deltaTime);
        });
    }

    // power collisions
    handlePowerCollisions() {
        const game = this.game;
        const player = game.player;
        if (game.gameOver) return;

        const overlaps = (item) => this.overlapsWithPlayer(item);

        // power ups
        const upHandlers = {
            OxygenTank(item) {
                game.time -= 10000;
                game.audioHandler.powerUpAndDownSFX.playSound('oxygenTankSound', false, true);
                game.floatingMessages.push(
                    new FloatingMessage('+10s', item.x, item.y, 115, 90, 30, 'white', 'black', true)
                );
            },
            HealthLive() {
                game.lives++;
                game.audioHandler.powerUpAndDownSFX.playSound('healthLiveSound', false, true);
            },
            Coin(item) {
                game.coins += 10;
                game.floatingMessages.push(
                    new FloatingMessage('+10', item.x, item.y, 150, 50, 30, 'yellow')
                );
                game.audioHandler.powerUpAndDownSFX.playSound('coinSound', false, true);
            },
            RedPotion() {
                game.audioHandler.powerUpAndDownSFX.playSound('redPotionSound', false, true);
                player.isRedPotionActive = true;
                player.redPotionTimer = 15000;
            },
            BluePotion() {
                if (player.currentState === player.states[4] || player.currentState === player.states[5]) {
                    game.audioHandler.powerUpAndDownSFX.playSound('bluePotionSound', false, true);
                } else {
                    game.audioHandler.powerUpAndDownSFX.playSound('bluePotionSound2', false, true);
                }

                game.audioHandler.firedogSFX.playSound('bluePotionEnergyGoingUp');
                player.energyReachedZero = false;

                if (player.currentState === player.states[4]) {
                    game.speed = player.bluePotionSpeed;
                }

                player.blueFireTimer = 5000;
                player.isBluePotionActive = true;
            },
            RandomPower(item) {
                const candidates = Object.keys(upHandlers).filter(name => {
                    if (name === 'RandomPower') return false;
                    if (name === 'OxygenTank' && !player.isUnderwater) return false;
                    return true;
                });

                const pickName = candidates[Math.floor(Math.random() * candidates.length)];
                upHandlers[pickName](item);
            }
        };

        // power downs
        const downHandlers = {
            IceDrink() {
                player.isSlowed = true;
                player.slowedTimer = 7000;
                game.audioHandler.powerUpAndDownSFX.playSound('drinkSoundEffect', false, true);
            },
            IceCube() {
                player.startFrozen(3000);
            },
            Cauldron() {
                game.audioHandler.powerUpAndDownSFX.playSound('cauldronSoundEffect', false, true);
                player.isPoisonActiveChecker();
                player.isPoisonTimerChecker(3500);
            },
            BlackHole() {
                player.isBlackHoleActive = true;
                player.triggerTunnelVision();
                game.audioHandler.powerUpAndDownSFX.playSound('darkHoleLaughSound', false, true);
            },
            Confuse() {
                game.audioHandler.powerUpAndDownSFX.playSound('statusConfusedSound', false, true);
                player.activateConfuse();
            },
            DeadSkull() {
                game.lives--;
                player.setState(7, 1);
                game.audioHandler.powerUpAndDownSFX.playSound('deadSkullLaugh', false, true);
            },
            CarbonDioxideTank(item) {
                game.time += 10000;
                game.audioHandler.powerUpAndDownSFX.playSound('carbonDioxideTankSound', false, true);
                game.floatingMessages.push(
                    new FloatingMessage('-10s', item.x, item.y, 115, 90, 30, 'red', 'black', true)
                );
            },
            RandomPower(item) {
                const candidates = Object.keys(downHandlers).filter(name => {
                    if (name === 'RandomPower') return false;
                    if (name === 'CarbonDioxideTank' && !player.isUnderwater) return false;
                    return true;
                });

                const pickName = candidates[Math.floor(Math.random() * candidates.length)];
                downHandlers[pickName](item);
            }
        };

        const processList = (list, handlers, isPowerDown) => {
            for (const item of list) {
                if (!overlaps(item)) continue;
                if (isPowerDown && player.isInvisible) continue;

                const name = item.constructor.name;
                const handler = handlers[name];
                if (!handler) continue;

                item.markedForDeletion = true;
                handler(item);
            }
        };

        processList(game.powerUps, upHandlers, false);
        processList(game.powerDowns, downHandlers, true);
    }

    // collision animations
    collisionAnimationBasedOnEnemy(enemy) {
        const player = this.game.player;

        switch (true) {
            case enemy instanceof Sluggie || enemy instanceof InkBomb || enemy instanceof Garry || enemy instanceof InkBeam:
                this.game.audioHandler.collisionSFX.playSound('slugExplosion', false, true);
                if (enemy instanceof Sluggie || enemy instanceof Garry || enemy instanceof InkBeam) {
                    this.game.collisions.push(
                        new InkSplashCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)
                    );
                } else {
                    this.game.collisions.push(
                        new InkBombCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)
                    );
                }
                return true;

            case enemy instanceof Skulnap:
                this.game.audioHandler.collisionSFX.playSound('explosionCollision', false, true);
                this.game.collisions.push(
                    new ExplosionCollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5, enemy.id)
                );
                return true;

            case enemy instanceof ElectricWheel:
                this.game.audioHandler.collisionSFX.playSound('elyvorg_electricity_wheel_collision_sound', false, true);
                this.game.collisions.push(
                    new ElectricityCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)
                );
                return true;

            case enemy instanceof GravitationalAura:
                this.game.audioHandler.collisionSFX.playSound('darkExplosionCollisionSound', false, true);
                this.game.collisions.push(
                    new DarkExplosionCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)
                );
                return true;

            case enemy instanceof PoisonSpit:
                this.game.audioHandler.enemySFX.playSound('acidSoundEffect', false, true);
                this.game.collisions.push(
                    new PoisonSpitSplash(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)
                );
                return true;

            case enemy instanceof PoisonDrop:
                this.game.collisions.push(
                    new PoisonDropCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)
                );
                this.game.audioHandler.collisionSFX.playSound('poisonDropCollisionSound', false, true);
                if (!player.isInvisible) {
                    this.game.audioHandler.enemySFX.playSound('acidSoundEffect', false, true);
                }
                return true;

            case enemy instanceof PurpleFireball:
                this.game.audioHandler.collisionSFX.playSound('fireballExplosionSound', false, true);
                this.game.collisions.push(
                    new PurpleFireballCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)
                );
                return true;

            case enemy instanceof PurpleThunder: {
                const x = enemy.x + enemy.width * 0.5;
                const y = player.y + player.height * 0.5;
                this.game.audioHandler.collisionSFX.playSound('elyvorg_electricity_wheel_collision_sound', false, true);
                this.game.collisions.push(new PurpleThunderCollision(this.game, x, y));
                return true;
            }

            case enemy instanceof PurpleLaserBeam: {
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
                return true;
            }

            case enemy instanceof MeteorAttack:
                this.game.collisions.push(
                    new MeteorExplosionCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5)
                );
                this.game.audioHandler.collisionSFX.playSound('elyvorg_meteor_in_contact_sound', false, true);
                return true;

            case enemy instanceof Arrow: {
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
                return true;
            }

            case enemy instanceof PurpleAsteroid:
                this.game.collisions.push(
                    new AsteroidExplosionCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5 - 70)
                );
                this.game.audioHandler.collisionSFX.playSound('elyvorg_meteor_in_contact_sound', false, true);
                return true;

            case enemy instanceof BlueAsteroid:
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('elyvorg_meteor_in_contact_sound', false, true);
                return true;

            case enemy instanceof GalacticSpike: {
                const x = enemy.x + enemy.width * 0.5;
                const y = enemy.y + enemy.height * 0.5;

                const groundBottom = enemy.groundBottom;
                const clipRect = {
                    x: 0,
                    y: 0,
                    w: this.game.width,
                    h: groundBottom
                };

                this.game.collisions.push(
                    new GalacticSpikeCollision(this.game, x, y, enemy.heightScale, 1, clipRect)
                );

                this.game.audioHandler.collisionSFX.playSound(
                    'galacticSpikeCollisionSound',
                    false,
                    true
                );
                return true;
            }

            case enemy instanceof LaserBall: {
                const mode2 =
                    !!enemy.mode2Active ||
                    !!enemy.mode2;

                const AnimClass = mode2 ? RedFireballCollision : PurpleFireballCollision;

                this.game.collisions.push(
                    new AnimClass(
                        this.game,
                        enemy.x + enemy.width * 0.5,
                        enemy.y + enemy.height * 0.5
                    )
                );
                this.game.audioHandler.collisionSFX.playSound('fireballExplosionSound', false, true);
                return true;
            }

            case enemy instanceof Kamehameha: {
                const pcx = player.x + player.width * 0.5;
                const pcy = player.y + player.height * 0.5;

                const mx = enemy.mouthX, my = enemy.mouthY;
                const ex = enemy.endX, ey = enemy.endY;

                const hit = this.closestPointOnSegment(pcx, pcy, mx, my, ex, ey);

                this.game.collisions.push(
                    new BallParticleBurstCollision(this.game, hit.x, hit.y, {
                        color: "#098cf7ff",
                        count: 48,
                        minRadius: 2,
                        maxRadius: 6,
                        minSpeed: 3,
                        maxSpeed: 9,
                        gravity: 0.45,
                        spread: Math.PI * 1.1,
                        duration: 600,
                    })
                );

                this.game.audioHandler.collisionSFX.playSound(
                    "ntharaxKamehamehaCollisionSound",
                    false,
                    true
                );
                return true;
            }

            case enemy instanceof AntennaeTentacle: {
                const x = enemy.x + enemy.width * 0.5;
                const y = player.y + player.height * 0.5;

                const mode2 =
                    !!enemy.mode2Active ||
                    !!enemy.mode2

                this.game.collisions.push(
                    new BallParticleBurstCollision(this.game, x, y, mode2
                        ? {
                            color: "#fa0b7aff",
                            count: 44,
                            minRadius: 2,
                            maxRadius: 7,
                            minSpeed: 4,
                            maxSpeed: 11,
                            gravity: 0.52,
                            spread: Math.PI * 1.2,
                            duration: 720,
                        }
                        : {
                            color: "#cf0fe9ff",
                            count: 28,
                            minRadius: 2,
                            maxRadius: 6,
                            minSpeed: 3,
                            maxSpeed: 9,
                            gravity: 0.45,
                            spread: Math.PI * 1.1,
                            duration: 600,
                        }
                    )
                );

                this.game.audioHandler.collisionSFX.playSound(
                    'ntharaxTentacleCollisionSound',
                    false,
                    true
                );

                return true;
            }

            case enemy instanceof IceSlash: {
                const shouldInvert = enemy.speedX > 0;
                this.game.collisions.push(
                    new IceSlashCollision(
                        this.game,
                        enemy.x + enemy.width * 0.5,
                        enemy.y + enemy.height * 0.5,
                        shouldInvert
                    )
                );
                return true;
            }

            case enemy instanceof SpinningIceBalls:
                this.game.collisions.push(
                    new SpinningIceBallsCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5, enemy.id)
                );
                return true;

            case enemy instanceof PointyIcicleShard:
                this.game.collisions.push(
                    new PointyIcicleShardCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5, enemy.id)
                );
                return true;

            case enemy instanceof UndergroundIcicle: {
                const x = enemy.x + enemy.width * 0.5;
                const y = player.y + player.height * 0.5;

                this.game.audioHandler.collisionSFX.playSound('breakingIceNoDamageSound', false, true);
                this.game.collisions.push(new UndergroundIcicleCollision(this.game, x, y, enemy.id));
                return true;
            }

            case enemy instanceof IceTrail:
                this.game.collisions.push(
                    new IceTrailCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5, enemy.id)
                );
                return true;

            case enemy instanceof IcyStormBall:
                this.game.collisions.push(
                    new IcyStormBallCollision(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5, enemy.id)
                );
                return true;

            case enemy instanceof GhostElyvorg:
                this.game.collisions.push(new GhostFadeOut(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('elyvorg_ghost_hit_sound_effect', false, true);
                return true;

            case enemy instanceof PurpleBeamOrb:
            case enemy instanceof YellowBeamOrb:
            case enemy instanceof BlackBeamOrb:
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('ntharaxSplitBeamCollisionSound', false, true);
                return true;

            case enemy instanceof GroundShockwaveRing:
            case enemy instanceof PurpleBallOrb:
                // no collision animation
                return true;

            default:
                return false;
        }
    }

    specialCollisionAnimationOrNot(enemy) {
        const player = this.game.player;
        if (!this.collisionAnimationBasedOnEnemy(enemy)) {
            player.bloodOrPoof(enemy);
        }
    }

    // normal collision
    handleNormalCollision(enemy) {
        const player = this.game.player;

        switch (true) {
            default:
                if (!player.isInvisible) {
                    player.hit(enemy);
                    player.bloodOrPoof(enemy);
                }
                break;

            case enemy instanceof Goblin:
                if (!player.isInvisible) {
                    enemy.lives += 1;
                    player.hit(enemy);

                    const maxCoinsToSteal = Math.min(20, this.game.coins);
                    const minCoinsToSteal = Math.min(10, maxCoinsToSteal);
                    const coinsToSteal =
                        Math.floor(Math.random() * (maxCoinsToSteal - minCoinsToSteal + 1)) +
                        minCoinsToSteal;

                    for (let i = 0; i < coinsToSteal; i++) {
                        this.game.particles.unshift(
                            new CoinLoss(this.game, player.x + player.width * -0.1, player.y)
                        );
                    }

                    if (coinsToSteal > 0) {
                        this.game.audioHandler.enemySFX.playSound('goblinStealing', false, true);
                        this.game.coins -= coinsToSteal;
                        this.game.floatingMessages.push(
                            new FloatingMessage('-' + coinsToSteal, player.x, player.y, 150, 50, 30, 'red')
                        );
                    }
                }
                break;

            // ink
            case enemy instanceof Sluggie:
            case enemy instanceof InkBomb:
            case enemy instanceof Garry:
            case enemy instanceof InkBeam:
                player.hit(enemy);
                player.triggerInkSplash();
                if (!player.isInvisible) {
                    this.collisionAnimationBasedOnEnemy(enemy);
                }
                break;

            // tunnel vision
            case enemy instanceof BlackBeamOrb:
                if (!player.isInvisible) {
                    player.hit(enemy);
                    this.collisionAnimationBasedOnEnemy(enemy);
                    player.triggerTunnelVision({
                        fadeInMs: 1200,
                        holdMs: 2000,
                        expandMs: 0,
                        expandAmount: 0,
                        fadeOutMs: 1200,
                        fadeCircleAlphaWithFadeOut: true,
                    });
                    this.game.audioHandler.powerUpAndDownSFX.playSound('darkHoleLaughSound', false, true);
                }
                break;

            // stun
            case enemy instanceof Bee:
            case enemy instanceof AngryBee:
            case enemy instanceof VolcanoWasp:
            case enemy instanceof LilHornet:
            case enemy instanceof Voltzeel:
            case enemy instanceof Aura:
            case enemy instanceof Cactus:
            case enemy instanceof RockProjectile:
            // special collision
            case enemy instanceof Skulnap:
            case enemy instanceof PurpleThunder:
            case enemy instanceof YellowBeamOrb:
            case enemy instanceof GalacticSpike:
                player.stunned(enemy);
                break;

            case enemy instanceof ElectricWheel:
                player.stunned(enemy);
                if (!player.isInvisible) {
                    enemy.lives = 0;
                    player.bossCollisionTimer = 0;
                    player.resetElectricWheelCounters = true;
                }
                break;

            // poison
            case enemy instanceof PoisonSpit:
            case enemy instanceof PoisonDrop:
                if (!player.isInvisible) {
                    player.isPoisonActiveChecker();
                    player.hit(enemy);
                    this.collisionAnimationBasedOnEnemy(enemy);
                    player.isPoisonTimerChecker(enemy instanceof PoisonSpit ? 1500 : 2500);
                }
                break;

            // red
            case enemy instanceof Gloomlet:
            case enemy instanceof KarateCroco:
            case enemy instanceof Tauro:
            case enemy instanceof SpearFish:
            case enemy instanceof TheRock:
            case enemy instanceof Volcanurtle:
                player.hit(enemy);
                if (!player.isInvisible) {
                    player.bloodOrPoof(enemy);
                }
                break;

            // slow
            case enemy instanceof IceBall:
            case enemy instanceof IceTrail:
            case enemy instanceof IcyStormBall:
            case enemy instanceof SpinningIceBalls:
            case enemy instanceof PointyIcicleShard:
                if (!player.isInvisible) {
                    this.game.audioHandler.enemySFX.playSound('iceSlowedSound', false, true);
                    player.hit(enemy);
                    this.specialCollisionAnimationOrNot(enemy);
                    player.isSlowed = true;
                    player.slowedTimer = 5000;
                }
                break;

            // frozen
            case enemy instanceof IceSlash:
            case enemy instanceof BlueAsteroid:
                if (!player.isInvisible) {
                    player.hit(enemy);
                    this.specialCollisionAnimationOrNot(enemy);
                    player.startFrozen(2000);
                }
                break;

            case enemy instanceof NTharax: {
                if (enemy.isTransforming || enemy.state === "transform") break;

                if (enemy.state === 'dive') {
                    if (!player.isInvisible) player.hit(enemy);
                    break;
                }

                if (player.bossCollisionTimer >= player.bossCollisionCooldown) {
                    if (!player.isInvisible) {
                        player.hit(enemy);
                        if (!enemy.isBarrierActive) {
                            player.bloodOrPoof(enemy);
                        }
                    }
                }
                break;
            }

            case enemy instanceof HealingBarrier: {
                player.bossCollisionTimer = 0;

                const canHurtPlayer =
                    !player.isInvisible &&
                    (
                        player.isFrozen ||
                        player.currentState === player.states[0] ||
                        player.currentState === player.states[1] ||
                        player.currentState === player.states[2] ||
                        player.currentState === player.states[3] ||
                        player.currentState === player.states[8]
                    );

                if (canHurtPlayer) {
                    player.hit(enemy);
                }

                if (!player.isInvisible) {
                    this.handleHealingBarrierCollision(enemy);
                }
                break;
            }

            case enemy instanceof Elyvorg:
                if (player.bossCollisionTimer >= player.bossCollisionCooldown && !enemy.isBarrierActive) {
                    player.hit(enemy);
                    if (!player.isInvisible) {
                        player.bloodOrPoof(enemy);
                    }
                }
                break;

            case enemy instanceof PurpleBarrier:
                player.bossCollisionTimer = 0;
                if (
                    !player.isInvisible &&
                    (
                        player.isFrozen ||
                        player.currentState === player.states[0] ||
                        player.currentState === player.states[1] ||
                        player.currentState === player.states[2] ||
                        player.currentState === player.states[3] ||
                        player.currentState === player.states[8]
                    )
                ) {
                    player.hit(enemy);
                }
                if (enemy.lives <= 0) {
                    this.game.collisions.push(new DisintegrateCollision(this.game, enemy, { followTarget: this.game.boss.current }));
                }
                break;

            case enemy instanceof GhostElyvorg:
                if (!player.isInvisible) {
                    player.hit(enemy);
                    this.collisionAnimationBasedOnEnemy(enemy);
                    this.game.audioHandler.collisionSFX.playSound('elyvorg_ghost_hit_sound_effect', false, true);
                }
                break;

            case enemy instanceof PurpleSlash:
                player.bossCollisionTimer = 0;
                if (!player.isInvisible) player.hit(enemy);
                break;

            case enemy instanceof PurpleFireball:
            case enemy instanceof MeteorAttack:
            case enemy instanceof UndergroundIcicle:
            case enemy instanceof GravitationalAura:
            case enemy instanceof PurpleLaserBeam:
            case enemy instanceof PurpleBallOrb:
            case enemy instanceof AntennaeTentacle:
            case enemy instanceof PurpleBeamOrb:
            case enemy instanceof PurpleAsteroid:
            case enemy instanceof GroundShockwaveRing:
            case enemy instanceof LaserBall:
                if (!player.isInvisible) {
                    player.hit(enemy);
                    this.collisionAnimationBasedOnEnemy(enemy);
                }
                break;

            case enemy instanceof Arrow:
                if (!player.isInvisible) {
                    const id = enemy.image.id;
                    if (id === 'blueArrow') {
                        player.hit(enemy);
                        this.game.audioHandler.enemySFX.playSound('iceSlowedSound', false, true);
                        player.isSlowed = true;
                        player.slowedTimer = 5000;
                        this.collisionAnimationBasedOnEnemy(enemy);
                    } else if (id === 'yellowArrow') {
                        player.stunned(enemy);
                    } else if (id === 'greenArrow') {
                        player.hit(enemy);
                        player.isPoisonActiveChecker();
                        player.isPoisonTimerChecker(2500);
                        this.game.audioHandler.enemySFX.playSound('acidSoundEffect', false, true);
                        this.collisionAnimationBasedOnEnemy(enemy);
                    } else if (id === 'cyanArrow') {
                        player.hit(enemy);
                        player.startFrozen(2000);
                        this.collisionAnimationBasedOnEnemy(enemy);
                    }
                }
                break;
        }
    }

    // rolling/diving collision
    handleRollingOrDivingCollision(enemy) {
        const player = this.game.player;

        switch (true) {
            default:
                player.bloodOrPoof(enemy);
                break;

            case enemy instanceof Goblin:
                enemy.lives = 0;
                player.bloodOrPoof(enemy);
                break;

            // ink
            case enemy instanceof Sluggie:
            case enemy instanceof InkBomb:
            case enemy instanceof Garry:
            case enemy instanceof InkBeam:
                player.triggerInkSplash();
                this.collisionAnimationBasedOnEnemy(enemy);
                break;

            // tunnel vision
            case enemy instanceof BlackBeamOrb:
                if (!player.isInvisible) {
                    player.triggerTunnelVision({
                        fadeInMs: 1200,
                        holdMs: 2000,
                        expandMs: 0,
                        expandAmount: 0,
                        fadeOutMs: 1200,
                        fadeCircleAlphaWithFadeOut: true,
                    });
                    this.game.audioHandler.powerUpAndDownSFX.playSound('darkHoleLaughSound', false, true);
                }
                this.collisionAnimationBasedOnEnemy(enemy);
                break;

            // stun
            case enemy instanceof Bee:
            case enemy instanceof AngryBee:
            case enemy instanceof VolcanoWasp:
            case enemy instanceof Voltzeel:
            case enemy instanceof Aura:
            case enemy instanceof LilHornet:
            case enemy instanceof Cactus:
            case enemy instanceof RockProjectile:
            case enemy instanceof GalacticSpike:
            // special collision
            case enemy instanceof Skulnap:
            case enemy instanceof PurpleThunder:
            case enemy instanceof YellowBeamOrb:
                player.stunned(enemy);
                if (player.isInvisible) this.specialCollisionAnimationOrNot(enemy);
                break;

            case enemy instanceof ElectricWheel:
                enemy.lives = 0;
                player.stunned(enemy);
                if (player.isInvisible) this.specialCollisionAnimationOrNot(enemy);
                player.resetElectricWheelCounters = true;
                player.bossCollisionTimer = 0;
                break;

            // poison
            case enemy instanceof PoisonSpit:
            case enemy instanceof PoisonDrop:
                if (!player.isInvisible) {
                    player.isPoisonActiveChecker();
                    player.hit(enemy);
                    player.isPoisonTimerChecker(enemy instanceof PoisonSpit ? 1500 : 2500);
                }
                this.collisionAnimationBasedOnEnemy(enemy);
                break;

            // red
            case enemy instanceof Gloomlet:
            case enemy instanceof Tauro:
            case enemy instanceof KarateCroco:
            case enemy instanceof SpearFish:
            case enemy instanceof TheRock:
            case enemy instanceof Volcanurtle:
                if (player.currentState === player.states[4]) player.hit(enemy);
                player.bloodOrPoof(enemy);
                break;

            // slow
            case enemy instanceof IceBall:
            case enemy instanceof IceTrail:
            case enemy instanceof IcyStormBall:
            case enemy instanceof SpinningIceBalls:
            case enemy instanceof PointyIcicleShard:
                if (!player.isInvisible) {
                    player.isSlowed = true;
                    player.slowedTimer = 5000;
                }
                this.specialCollisionAnimationOrNot(enemy);
                if (player.isInvisible) {
                    this.game.audioHandler.collisionSFX.playSound('breakingIceNoDamageSound', false, true);
                } else {
                    this.game.audioHandler.enemySFX.playSound('iceSlowedSound', false, true);
                }
                break;

            // frozen
            case enemy instanceof IceSlash:
            case enemy instanceof BlueAsteroid:
                if (!player.isInvisible) {
                    player.hit(enemy);
                    player.startFrozen(2000);
                } else {
                    this.game.audioHandler.collisionSFX.playSound('breakingIceNoDamageSound', false, true);
                }
                this.specialCollisionAnimationOrNot(enemy);
                break;

            case enemy instanceof Glacikal:
                if (player.bossCollisionTimer >= player.bossCollisionCooldown) {
                    enemy.lives -= 1;
                    player.bloodOrPoof(enemy);
                }
                break;

            case enemy instanceof NTharax: {
                if (enemy.isTransforming || enemy.state === "transform") break;

                if (enemy.state === 'dive') {
                    if (!player.isInvisible) {
                        player.hit(enemy);
                    } else {
                        if (player.bossCollisionTimer >= player.bossCollisionCooldown && !enemy.isBarrierActive) {
                            enemy.lives -= 1;
                            player.bloodOrPoof(enemy);
                        }
                    }
                    break;
                }

                if (player.bossCollisionTimer >= player.bossCollisionCooldown) {
                    if (!enemy.isBarrierActive) {
                        enemy.lives -= 1;
                        player.bloodOrPoof(enemy);
                    }
                }
                break;
            }

            case enemy instanceof HealingBarrier: {
                this.handleHealingBarrierCollision(enemy);
                break;
            }

            case enemy instanceof Elyvorg:
                if (player.bossCollisionTimer >= player.bossCollisionCooldown && !enemy.isBarrierActive) {
                    enemy.lives -= 1;
                    player.bloodOrPoof(enemy);
                }
                break;

            case enemy instanceof PurpleBarrier:
                player.bossCollisionTimer = 0;
                if (enemy.lives <= 0) {
                    this.game.collisions.push(new DisintegrateCollision(this.game, enemy, { followTarget: this.game.boss.current }));
                }
                break;

            case enemy instanceof GhostElyvorg:
                this.collisionAnimationBasedOnEnemy(enemy);
                this.game.audioHandler.collisionSFX.playSound('elyvorg_ghost_hit_sound_effect', false, true);
                break;

            case enemy instanceof PurpleSlash:
                if (!player.isInvisible) {
                    player.bossCollisionTimer = 0;
                    player.hit(enemy);
                }
                break;

            case enemy instanceof PurpleFireball:
            case enemy instanceof UndergroundIcicle:
            case enemy instanceof PurpleBallOrb:
            case enemy instanceof AntennaeTentacle:
            case enemy instanceof GroundShockwaveRing:
            case enemy instanceof LaserBall:
                player.hit(enemy);
                this.collisionAnimationBasedOnEnemy(enemy);
                break;

            case enemy instanceof MeteorAttack:
            case enemy instanceof PurpleLaserBeam:
            case enemy instanceof GravitationalAura:
            case enemy instanceof PurpleBeamOrb:
            case enemy instanceof PurpleAsteroid:
                this.collisionAnimationBasedOnEnemy(enemy);
                break;

            case enemy instanceof Arrow: {
                const id = enemy.image.id;
                if (id === 'blueArrow') {
                    if (!player.isInvisible) {
                        this.game.audioHandler.enemySFX.playSound('iceSlowedSound', false, true);
                        player.isSlowed = true;
                        player.slowedTimer = 5000;
                    }
                    this.collisionAnimationBasedOnEnemy(enemy);
                } else if (id === 'yellowArrow') {
                    if (player.isInvisible) {
                        enemy.lives -= 1;
                        this.collisionAnimationBasedOnEnemy(enemy);
                    } else {
                        player.stunned(enemy);
                    }
                } else if (id === 'greenArrow') {
                    if (!player.isInvisible) {
                        player.isPoisonActiveChecker();
                        player.isPoisonTimerChecker(2500);
                        this.game.audioHandler.enemySFX.playSound('acidSoundEffect', false, true);
                    }
                    this.collisionAnimationBasedOnEnemy(enemy);
                } else if (id === 'cyanArrow') {
                    if (!player.isInvisible) {
                        player.hit(enemy);
                        player.startFrozen(2000);
                    }
                    this.collisionAnimationBasedOnEnemy(enemy);
                }
                break;
            }
        }
    }
}