import { getDefaultKeyBindings } from '../config/keyBindings.js';
import {
    getSkinElement,
    getCosmeticElement,
    COSMETIC_LAYER_ORDER,
} from '../config/skins.js';
import { Sitting, Running, Jumping, Falling, Rolling, Diving, Stunned, Hit, Standing, Dying, Dashing } from '../animations/playerStates.js';
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
    Elyvorg, GhostElyvorg, BlueArrow, YellowArrow, GreenArrow, CyanArrow, PurpleBarrier, ElectricWheel, GravitationalAura,
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
        // sprite
        this.defaultSkinImage = getSkinElement('defaultSkin');
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
            new Dashing(this.game),   // 10
        ];
        this.previousState = null;
        this.currentState = null;
        // energy
        this.energy = 100;
        this.energyTimer = 0;
        this.energyInterval = 100;
        this.isEnergyExhausted = false;
        this.noEnergyLeftSound = false;
        // blue potion
        this.blueFireTimer = 0;
        this.isBluePotionActive = false;
        this.bluePotionSpeedMultiplier = 2.2;
        this.bluePotionSpeed = this.baseMaxSpeed * this.bluePotionSpeedMultiplier;
        // red potion
        this.isRedPotionActive = false;
        this.redPotionTimer = 0;
        // hourglass
        this.isHourglassActive = false;
        this.hourglassTimer = 0;
        this.hourglassDuration = 25000;
        this.cooldownRates = {
            fireball: 1,
            invisible: 1,
            dash: 1,
        };
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
        this.divingCooldown = 300;
        // invisible cooldowns
        this.isInvisible = false;
        this.invisibleCooldown = 35000;
        this.invisibleTimer = this.invisibleCooldown;
        this.invisibleActiveCooldownTimer = 0;
        this.invisibleDuration = 5000;
        // dash
        this.isDashing = false;
        this.dashDuration = 180;
        this.dashTimeLeft = 0;
        this.dashVelocity = 0;
        this.dashSpeedMultiplier = 3.0;
        this.dashGhostTimer = 0;
        this.dashGhostInterval = 18;
        this.dashBetweenCooldown = 500;
        this.dashBetweenTimer = this.dashBetweenCooldown;
        this.dashCooldown = 60000;
        this.dashTimer = this.dashCooldown;
        this.dashMaxCharges = 2;
        this.dashCharges = this.dashMaxCharges;
        this.dashSecondWindowMs = 7000;
        this.dashSecondWindowTimer = 0;
        this.secondDashDistanceMultiplier = 1.75;
        this.dashAwaitingSecond = false;
        this.dashEnergyCost = 15;
        this.dashInstanceId = 0;
        this.postDashGraceMs = 200;
        this.postDashGraceTimer = 0;
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

    tryStartDash(input) {
        if (!this.game.input.isDashAttack(input)) return false;
        if (this.game.cabin.isFullyVisible) return false;
        if (this.game.gameOver) return false;
        if (this.isFrozen) return false;
        if (this.isDashing) return false;

        if (this.isEnergyExhausted) return false;

        const s = this.currentState;
        const allowed =
            s === this.states[0] || // sitting
            s === this.states[1] || // running
            s === this.states[2] || // jumping
            s === this.states[3] || // falling
            s === this.states[4] || // rolling
            s === this.states[8];   // standing
        if (!allowed) return false;

        if (this.dashTimer < this.dashCooldown) return false;
        if (this.dashCharges <= 0) return false;
        if (this.dashBetweenTimer < this.dashBetweenCooldown) return false;

        const pressingBack = !!this._moveLeft(input ?? []);
        const pressingForward = !!this._moveRight(input ?? []);
        const facingDir = this.facingRight ? 1 : -1;

        let inputDir = 0;
        if (pressingForward && !pressingBack) inputDir = 1;
        else if (pressingBack && !pressingForward) inputDir = -1;

        const dir = inputDir !== 0 ? inputDir : facingDir;

        const isSecondDash = (this.dashCharges !== this.dashMaxCharges);

        if (!isSecondDash) {
            // first dash
            this.game.audioHandler.firedogSFX.playSound('dash1');

            this.dashCharges = 1;
            this.dashAwaitingSecond = true;
            this.dashSecondWindowTimer = this.dashSecondWindowMs;
        } else {
            // second dash
            this.game.audioHandler.firedogSFX.playSound('dash2');

            this.dashCharges = 0;
            this.dashAwaitingSecond = false;
            this.dashSecondWindowTimer = 0;
            this.dashTimer = 0;
        }

        this.dashBetweenTimer = 0;

        const cost = this.dashEnergyCost;
        this.energy = Math.max(0, this.energy - cost);
        if (!this.isBluePotionActive && this.energy <= 0) this.isEnergyExhausted = true;

        this.isDashing = true;
        this.dashTimeLeft = this.dashDuration;

        const baseDash = this.maxSpeed * this.dashSpeedMultiplier;
        const mult = isSecondDash ? (this.secondDashDistanceMultiplier ?? 1.35) : 1.0;
        this.dashVelocity = dir * baseDash * mult;

        this.setState(10, 3);

        this.dashInstanceId++;

        return true;
    }

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
        this.isEnergyExhausted = false;
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
        // hourglass
        this.isHourglassActive = false;
        this.hourglassTimer = 0;
        this.cooldownRates = { fireball: 1, invisible: 1, dash: 1 };
        // invisibility
        this.isInvisible = false;
        this.invisibleActiveCooldownTimer = 0;
        this.invisibleTimer = this.invisibleCooldown;
        // dash 
        this.isDashing = false;
        this.dashTimeLeft = 0;
        this.dashVelocity = 0;
        this.dashGhostTimer = 0;
        this.dashCharges = this.dashMaxCharges;
        this.dashTimer = this.dashCooldown;
        this.dashBetweenTimer = this.dashBetweenCooldown;
        this.dashAwaitingSecond = false;
        this.dashSecondWindowTimer = 0;
        this.postDashGraceTimer = 0;
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
        this.updateHourglass(deltaTime);
        this.dashImmunityTimer(deltaTime);
        this.checkIfFiredogIsSlowed(deltaTime);
        this.updateConfuse(deltaTime);
        this.emitStatusParticles(deltaTime);

        this.divingAbility(deltaTime);
        this.fireballAbility(input, deltaTime);
        this.invisibleAbility(input, deltaTime);
        this.dashAbility(deltaTime);
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
        const menuSkinEl = this.game.menu?.skins?.currentSkin;

        if (menuSkinEl && menuSkinEl.tagName === 'IMG') return menuSkinEl;

        const id = menuSkinEl?.id || this.game.menu?.skins?.getCurrentSkinId?.() || 'defaultSkin';
        const el = document.getElementById(id);
        return el || this.defaultSkinImage;
    }

    getCurrentCosmeticImage(slot) {
        const menu = this.game.menu?.skins;
        const key = menu?.getCurrentCosmeticKey?.(slot) || 'none';
        if (!key || key === 'none') return null;
        return getCosmeticElement(slot, key);
    }

    getCurrentCosmeticImagesInOrder() {
        return COSMETIC_LAYER_ORDER
            .map(slot => this.getCurrentCosmeticImage(slot))
            .filter(Boolean);
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
        const skinImg = this.getCurrentSkinImage();
        const cosmeticImgs = this.getCurrentCosmeticImagesInOrder();

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

        const skinAlpha = this.isInvisible ? 0.5 : 1.0;

        const drawLayer = (img) => {
            if (!img) return;
            context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        };

        const drawGlowLayer = (img, color, blur = 6) => {
            if (!img) return;
            context.save();
            context.shadowColor = color;
            context.shadowBlur = blur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
            context.restore();
        };

        const drawTintLayer = (img, tint) => {
            if (!img) return;
            const oc = this.getTintedFrameCanvas(img, sx, sy, sw, sh, dw, dh, tint);
            context.drawImage(oc, dx, dy, dw, dh);
        };

        const drawSkinBase = () => {
            if (!skinImg) return;
            context.save();
            context.globalAlpha = skinAlpha;
            drawLayer(skinImg);
            context.restore();
        };

        const drawSkinGlow = (color, blur) => {
            if (!skinImg) return;
            context.save();
            context.globalAlpha = skinAlpha;
            drawGlowLayer(skinImg, color, blur);
            context.restore();
        };

        const drawSkinTint = (tint) => {
            if (!skinImg) return;
            context.save();
            context.globalAlpha = skinAlpha;
            drawTintLayer(skinImg, tint);
            context.restore();
        };

        const drawCosmeticsBase = () => {
            for (const img of cosmeticImgs) drawLayer(img);
        };

        const drawCosmeticsGlow = (color, blur) => {
            for (const img of cosmeticImgs) drawGlowLayer(img, color, blur);
        };

        const drawCosmeticsTint = (tint) => {
            for (const img of cosmeticImgs) drawTintLayer(img, tint);
        };

        if (slowed && poisoned) {
            const glow = 'rgba(0,160,255,1)';

            drawSkinGlow(glow, 7);
            drawCosmeticsGlow(glow, 7);

            const mixTint = {
                dir: 'horizontal',
                stops: [
                    { offset: 0.00, color: 'rgba(0,100,0,0.40)' },
                    { offset: 0.50, color: 'rgba(0,150,120,0.38)' },
                    { offset: 1.00, color: 'rgba(0,120,255,0.35)' },
                ],
            };

            drawSkinTint(mixTint);
            drawCosmeticsTint(mixTint);
        } else if (poisoned) {
            const glow = 'rgba(0,130,0,1)';

            drawSkinGlow(glow, 6);
            drawCosmeticsGlow(glow, 6);

            drawSkinTint('rgba(0,100,0,0.40)');
            drawCosmeticsTint('rgba(0,100,0,0.40)');
        } else if (slowed) {
            const glow = 'rgba(0,160,255,1)';

            drawSkinGlow(glow, 6);
            drawCosmeticsGlow(glow, 6);

            drawSkinTint('rgba(0,120,255,0.35)');
            drawCosmeticsTint('rgba(0,120,255,0.35)');
        } else {
            drawSkinBase();
            drawCosmeticsBase();
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
        if (this.isBluePotionActive) {
            this.isEnergyExhausted = false;
            this.noEnergyLeftSound = false;

            this.isPoisonedActive = false;
            this.poisonTimer = 0;

            this.game.enemyInterval = 100;

            this.energyInterval = 70;
            this.energy = Math.min(100, this.energy + 0.1);
        } else {
            this.game.enemyInterval = 1000;
            this.energyInterval = 70;
        }

        if (this.isEnergyExhausted === true && this.energy >= 20) {
            this.isEnergyExhausted = false;
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

            if (!this.isEnergyExhausted) {
                this.energy = Math.max(0, this.energy - 0.1);
                if (this.poisonTimer <= 0) {
                    this.isPoisonedActive = false;
                    this.energyInterval = 100;
                } else {
                    this.energyInterval = 1000;
                }
                if (this.energy <= 0) {
                    this.isPoisonedActive = false;
                    this.isEnergyExhausted = true;
                    this.energyInterval = 100;
                }
            }
        }

        if (this.isEnergyExhausted && this.poisonTimer > 0) {
            this.isPoisonedActive = false;
            this.poisonTimer -= deltaTime;
        } else if (this.poisonTimer <= 0) {
            this.isPoisonedActive = false;
        }
    }

    drainEnergy() {
        if (this.isBluePotionActive) return;

        const energyDrainAmount = 0.4;
        this.energy = Math.max(0, this.energy - energyDrainAmount);
        if (this.energy <= 0) {
            this.isEnergyExhausted = true;
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

    dashImmunityTimer(deltaTime) {
        if (this.postDashGraceTimer > 0) {
            this.postDashGraceTimer = Math.max(0, this.postDashGraceTimer - deltaTime);
        }
    }

    // abilities
    divingAbility(deltaTime) {
        if (this.currentState === this.states[5]) return;

        this.divingTimer += deltaTime;
        this.divingTimer = Math.min(this.divingTimer, this.divingCooldown);
    }

    fireballAbility(input, deltaTime) {
        this.fireballTimer += deltaTime * this.cooldownRates.fireball;
        this.fireballTimer = Math.min(this.fireballTimer, this.fireballCooldown);

        const inFireballState =
            this.currentState === this.states[0] ||
            this.currentState === this.states[1] ||
            this.currentState === this.states[2] ||
            this.currentState === this.states[3] ||
            this.currentState === this.states[8];

        if (
            inFireballState &&
            !this.isEnergyExhausted &&
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
            if (!this.isBluePotionActive && this.energy <= 0) {
                this.isEnergyExhausted = true;
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
        if (this.isInvisible) {
            this.invisibleActiveCooldownTimer -= deltaTime;

            if (this.invisibleActiveCooldownTimer <= 0) {
                this.invisibleActiveCooldownTimer = 0;

                this.game.audioHandler.firedogSFX.playSound('invisibleOutSFX');
                this.isInvisible = false;

                this.invisibleTimer = 0;
            }

            return;
        }

        this.invisibleTimer += deltaTime * this.cooldownRates.invisible;
        this.invisibleTimer = Math.min(this.invisibleTimer, this.invisibleCooldown);

        if (this.game.input.isInvisibleDefense(input) && !this.game.gameOver) {
            if (this.invisibleTimer >= this.invisibleCooldown) {
                this.isInvisible = true;
                this.invisibleActiveCooldownTimer = this.invisibleDuration;

                this.invisibleTimer = this.invisibleCooldown;

                this.game.audioHandler.firedogSFX.playSound('invisibleInSFX');
            }
        }
    }

    dashAbility(deltaTime) {
        if (this.dashAwaitingSecond) {
            this.dashSecondWindowTimer -= deltaTime;

            if (this.dashSecondWindowTimer <= 0) {
                this.dashAwaitingSecond = false;
                this.dashSecondWindowTimer = 0;
                this.dashCharges = 0;
                this.dashTimer = 0;
            }
        }

        if (this.dashTimer < this.dashCooldown) {
            this.dashTimer += deltaTime * this.cooldownRates.dash;
            this.dashTimer = Math.min(this.dashTimer, this.dashCooldown);

            if (this.dashTimer >= this.dashCooldown) {
                this.dashCharges = this.dashMaxCharges;
                this.dashAwaitingSecond = false;
                this.dashSecondWindowTimer = 0;
            }
        }

        if (this.dashBetweenTimer < this.dashBetweenCooldown) {
            this.dashBetweenTimer += deltaTime;
            this.dashBetweenTimer = Math.min(this.dashBetweenTimer, this.dashBetweenCooldown);
        }

        if (!this.isDashing) return;

        this.dashTimeLeft -= deltaTime;
        if (this.dashTimeLeft <= 0) {
            this.dashTimeLeft = 0;
            this.isDashing = false;
            this.dashVelocity = 0;
            this.dashGhostTimer = 0;
            this.postDashGraceTimer = this.postDashGraceMs;
        }
    }

    // audios
    playerSFXAudios() {
        // rolling
        if (this.collisionLogic.isRollingOrDiving(this)) {
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
        if (this.isEnergyExhausted && !this.noEnergyLeftSound) {
            this.game.audioHandler.firedogSFX.playSound('energyExhaustedSound');
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

        if (this.isDashing) {
            this.x += this.dashVelocity;

            if (this.x < 0) this.x = 0;
            if (this.x > this.game.width - this.width) {
                this.x = this.game.width - this.width;
            }

            this.speed = this.dashVelocity;
            this.vx = this.dashVelocity;
            return;
        }

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

    activateHourglass() {
        this.isHourglassActive = true;
        this.hourglassTimer = this.hourglassDuration;

        this.cooldownRates = {
            fireball: 2,
            invisible: 3,
            dash: 3,
        };
    }

    updateHourglass(deltaTime) {
        if (!this.isHourglassActive) return;

        this.hourglassTimer -= deltaTime;
        if (this.hourglassTimer <= 0) {
            this.hourglassTimer = 0;
            this.isHourglassActive = false;
            this.cooldownRates = { fireball: 1, invisible: 1, dash: 1 };
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
}

// ======================================================================
// CollisionLogic
// ======================================================================
export class CollisionLogic {
    constructor(game) {
        this.game = game;
        this._fireballHandlers = null;
    }

    // ------------------------------------------------------------------
    // Player helpers that are collision-only
    // ------------------------------------------------------------------
    isRollingOrDiving(player = this.game.player) {
        return player.currentState === player.states[4] || player.currentState === player.states[5];
    }

    hit(enemy, player = this.game.player) {
        if (player.isInvisible) return;
        if (player.isDashing) return;

        if (player.isFrozen) {
            if (enemy.dealsDirectHitDamage) {
                this.game.coins -= 1;
                this.game.lives -= 1;
            }
            return;
        }

        if (player.currentState === player.states[0]) {
            player.setState(7, 0);
        } else {
            player.setState(7, 1);
        }

        if (enemy.dealsDirectHitDamage) {
            this.game.coins -= 1;
            this.game.lives -= 1;
        }
    }

    stunned(player = this.game.player) {
        if (player.isInvisible) return;
        if (player.isDashing) return;

        if (player.isFrozen) {
            this.game.audioHandler.firedogSFX.playSound('stunnedSound', false, true);
            this.game.coins -= 1;
            this.game.lives -= 1;
            return;
        }

        this.game.audioHandler.firedogSFX.playSound('stunnedSound', false, true);
        player.setState(6, 0);

        this.game.coins -= 1;
        this.game.lives -= 1;
    }

    bloodOrPoof(enemy, player = this.game.player) {
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
                    player.isBluePotionActive
                )
            );

            if (enemy instanceof Goblin) {
                this.game.audioHandler.enemySFX.playSound('goblinDie', false, true);
            }
        }
    }

    handleFloatingMessages(enemy, player = this.game.player) {
        if (enemy.lives <= 0 && this.game.lives === player.previousLives) {
            this.game.coins += 1;
            player.energy += 2;
            this.game.floatingMessages.push(
                new FloatingMessage('+1', enemy.x, enemy.y, 120, 20, 30)
            );
        }
    }

    triggerInkSplash(player = this.game.player) {
        if (player.isInvisible) return;

        const inkSplash = new InkSplash(this.game);
        inkSplash.x = player.x - inkSplash.getWidth() / 2;
        this.game.collisions.push(inkSplash);
    }

    // slow methods
    canBeSlowed(player = this.game.player) {
        return !player.isInvisible;
    }

    setSlow(durationMs, player = this.game.player) {
        if (!this.canBeSlowed(player)) return false;

        player.isSlowed = true;
        player.slowedTimer = durationMs;
        return true;
    }

    tryApplySlow(player = this.game.player, durationMs = 5000) {
        return this.setSlow(durationMs, player);
    }

    // frozen methods
    canBeFrozen(player = this.game.player) {
        return !player.isInvisible;
    }

    startFrozen(player = this.game.player, durationMs = 2000) {
        if (!this.canBeFrozen(player)) return false;
        if (this.game.gameOver) return false;
        if (player.currentState?.deathAnimation) return false;

        const wasFrozen = !!player.isFrozen;

        player.isFrozen = true;
        player.frozenTimer = Math.max(player.frozenTimer, durationMs);

        if (player.currentState !== player.states[7]) {
            player.setState(7, 1);
        }

        player.frameX = 0;
        player.frameTimer = 0;

        player.frozenFrameX = 0;
        player.frozenFrameY = player.frameY;
        player.frozenFrameTimer = 0;
        player.frozenMaxFrame = player.maxFrame;
        player.frozenFacingRight = player.facingRight;

        player.speed = 0;
        player.vx = 0;
        player.vy = 0;

        player.frozenPulseTimer = 0;
        player.frozenOpacity = 0.5;

        player.game.input.keys = [];

        if (!wasFrozen) {
            this.game.audioHandler.firedogSFX.playSound('startFrozen', false, true);
        }

        this.game.audioHandler.firedogSFX.playSound('frozenSound', false, true);

        return true;
    }

    // poison methods
    canBePoisoned(player = this.game.player) {
        return !player.isEnergyExhausted && !player.isBluePotionActive;
    }

    setPoison(durationMs, player = this.game.player) {
        if (!this.canBePoisoned(player)) {
            player.isPoisonedActive = false;
            player.poisonTimer = 0;
            return false;
        }

        player.isPoisonedActive = true;
        player.poisonTimer = durationMs;
        return true;
    }

    tryApplyPoison(player = this.game.player, durationMs = 2500) {
        if (player.isInvisible) {
            player.isPoisonedActive = false;
            player.poisonTimer = 0;
            return false;
        }
        return this.setPoison(durationMs, player);
    }

    // ------------------------------------------------------------------
    // Geometry helpers
    // ------------------------------------------------------------------
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

    enemyHitsRect(enemy, targetRect) {
        if (this.isKamehameha(enemy)) return this.beamHitsRect(enemy, targetRect);
        return this.overlapsAABB(
            { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height },
            targetRect
        );
    }

    // ------------------------------------------------------------------
    // Collision FX
    // ------------------------------------------------------------------
    _enemyCenter(enemy) {
        return { x: enemy.x + enemy.width * 0.5, y: enemy.y + enemy.height * 0.5 };
    }

    _playerCenter(player = this.game.player) {
        return { x: player.x + player.width * 0.5, y: player.y + player.height * 0.5 };
    }

    _fireballCenter(fireball) {
        const size = typeof fireball?.size === "number" ? fireball.size : 0;
        return {
            x: (typeof fireball?.x === "number" ? fireball.x : 0) + size * 0.5,
            y: (typeof fireball?.y === "number" ? fireball.y : 0) + size * 0.5,
        };
    }

    playCollisionFx(enemy, ctx = null) {
        const player = this.game.player;
        const fireball = ctx?.fireball || null;
        const fallbackToDefault = !!ctx?.fallbackToDefault;

        const { x: ex, y: ey } = this._enemyCenter(enemy);
        const { y: py } = this._playerCenter(player);
        const { y: fy } = fireball ? this._fireballCenter(fireball) : { y: py };

        const attackerY = fireball ? fy : py;

        switch (true) {
            // ink
            case enemy instanceof Sluggie || enemy instanceof InkBomb || enemy instanceof Garry || enemy instanceof InkBeam: {
                this.game.audioHandler.collisionSFX.playSound('slugExplosion', false, true);

                if (enemy instanceof Sluggie || enemy instanceof Garry || enemy instanceof InkBeam) {
                    this.game.collisions.push(new InkSplashCollision(this.game, ex, ey));
                } else {
                    this.game.collisions.push(new InkBombCollision(this.game, ex, ey));
                }
                return true;
            }

            case enemy instanceof Skulnap: {
                this.game.audioHandler.collisionSFX.playSound('explosionCollision', false, true);
                this.game.collisions.push(
                    new ExplosionCollisionAnimation(this.game, ex, ey, enemy.id)
                );
                return true;
            }

            case enemy instanceof ElectricWheel: {
                this.game.audioHandler.collisionSFX.playSound('elyvorg_electricity_wheel_collision_sound', false, true);
                this.game.collisions.push(new ElectricityCollision(this.game, ex, ey));
                return true;
            }

            case enemy instanceof GravitationalAura: {
                this.game.audioHandler.collisionSFX.playSound('darkExplosionCollisionSound', false, true);
                this.game.collisions.push(new DarkExplosionCollision(this.game, ex, ey));
                return true;
            }

            // slow
            case enemy instanceof IceBall:
            case enemy instanceof SpinningIceBalls:
            case enemy instanceof PointyIcicleShard:
            case enemy instanceof UndergroundIcicle:
            case enemy instanceof IceTrail:
            case enemy instanceof IcyStormBall:
            case enemy instanceof BlueArrow: {
                if (enemy instanceof UndergroundIcicle) {
                    this.game.collisions.push(new UndergroundIcicleCollision(this.game, ex, attackerY, enemy.id));
                } else if (enemy instanceof SpinningIceBalls) {
                    this.game.collisions.push(new SpinningIceBallsCollision(this.game, ex, ey, enemy.id));
                } else if (enemy instanceof PointyIcicleShard) {
                    this.game.collisions.push(new PointyIcicleShardCollision(this.game, ex, ey, enemy.id));
                } else if (enemy instanceof IceTrail) {
                    this.game.collisions.push(new IceTrailCollision(this.game, ex, ey, enemy.id));
                } else if (enemy instanceof BlueArrow) {
                    this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                } else if (enemy instanceof IcyStormBall) {
                    this.game.collisions.push(new IcyStormBallCollision(this.game, ex, ey, enemy.id));
                } else {
                    if (fallbackToDefault) { // for IceBall
                        this.bloodOrPoof(enemy, player);
                    }
                }
                this.game.audioHandler.collisionSFX.playSound('breakingIceNoDamageSound', false, true);
                return true;
            }

            // frozen
            case enemy instanceof IceSlash:
            case enemy instanceof BlueAsteroid:
            case enemy instanceof CyanArrow: {
                if (enemy instanceof IceSlash) {
                    const shouldInvert = enemy.speedX > 0;
                    this.game.collisions.push(new IceSlashCollision(this.game, ex, ey, shouldInvert));
                } else {
                    this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                }

                this.game.audioHandler.collisionSFX.playSound('breakingIceNoDamageSound', false, true);
                return true;
            }

            // poison
            case enemy instanceof PoisonSpit:
            case enemy instanceof PoisonDrop:
            case enemy instanceof GreenArrow: {
                this.game.audioHandler.collisionSFX.playSound('poisonDropCollisionSound', false, true);

                if (enemy instanceof PoisonSpit) {
                    this.game.collisions.push(new PoisonSpitSplash(this.game, ex, ey));
                } else if (enemy instanceof PoisonDrop) {
                    this.game.collisions.push(new PoisonDropCollision(this.game, ex, ey));
                } else {
                    this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                }

                return true;
            }

            case enemy instanceof PurpleFireball: {
                this.game.audioHandler.collisionSFX.playSound('fireballExplosionSound', false, true);
                this.game.collisions.push(new PurpleFireballCollision(this.game, ex, ey));
                return true;
            }

            // special Y = attacker center Y
            case enemy instanceof PurpleThunder: {
                this.game.audioHandler.collisionSFX.playSound('elyvorg_electricity_wheel_collision_sound', false, true);
                this.game.collisions.push(new PurpleThunderCollision(this.game, ex, attackerY));
                return true;
            }

            case enemy instanceof PurpleLaserBeam: {
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
                return true;
            }

            case enemy instanceof MeteorAttack: {
                this.game.collisions.push(new MeteorExplosionCollision(this.game, ex, ey));
                this.game.audioHandler.collisionSFX.playSound('elyvorg_meteor_in_contact_sound', false, true);
                return true;
            }

            case enemy instanceof YellowArrow: {
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
                return true;
            }

            case enemy instanceof PurpleAsteroid: {
                this.game.collisions.push(new AsteroidExplosionCollision(this.game, ex, ey - 70));
                this.game.audioHandler.collisionSFX.playSound('elyvorg_meteor_in_contact_sound', false, true);
                return true;
            }

            case enemy instanceof GalacticSpike: {
                const groundBottom = enemy.groundBottom;
                const clipRect = { x: 0, y: 0, w: this.game.width, h: groundBottom };

                this.game.collisions.push(
                    new GalacticSpikeCollision(this.game, ex, ey, enemy.heightScale, 1, clipRect)
                );

                this.game.audioHandler.collisionSFX.playSound('galacticSpikeCollisionSound', false, true);
                return true;
            }

            case enemy instanceof LaserBall: {
                const mode2 = !!enemy.mode2Active || !!enemy.mode2;
                const AnimClass = mode2 ? RedFireballCollision : PurpleFireballCollision;
                this.game.collisions.push(new AnimClass(this.game, ex, ey));
                this.game.audioHandler.collisionSFX.playSound('fireballExplosionSound', false, true);
                return true;
            }

            case enemy instanceof Kamehameha: {
                const pc = fireball ? this._fireballCenter(fireball) : this._playerCenter(player);
                const hit = this.closestPointOnSegment(
                    pc.x, pc.y,
                    enemy.mouthX, enemy.mouthY,
                    enemy.endX, enemy.endY
                );

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

                this.game.audioHandler.collisionSFX.playSound("ntharaxKamehamehaCollisionSound", false, true);
                return true;
            }

            // special Y = attacker center Y
            case enemy instanceof AntennaeTentacle: {
                const mode2 = !!enemy.mode2Active || !!enemy.mode2;

                this.game.collisions.push(
                    new BallParticleBurstCollision(
                        this.game,
                        ex,
                        attackerY,
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

                this.game.audioHandler.collisionSFX.playSound('ntharaxTentacleCollisionSound', false, true);
                return true;
            }


            case enemy instanceof GhostElyvorg: {
                this.game.collisions.push(new GhostFadeOut(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('elyvorg_ghost_hit_sound_effect', false, true);
                return true;
            }

            case enemy instanceof PurpleBeamOrb:
            case enemy instanceof YellowBeamOrb:
            case enemy instanceof BlackBeamOrb: {
                this.game.collisions.push(new DisintegrateCollision(this.game, enemy));
                this.game.audioHandler.collisionSFX.playSound('ntharaxSplitBeamCollisionSound', false, true);
                return true;
            }

            // Explicit "handled but no FX"
            case enemy instanceof GroundShockwaveRing:
            case enemy instanceof PurpleBallOrb:
                return true;

            default: {
                if (fallbackToDefault) {
                    this.bloodOrPoof(enemy, player);
                    return true;
                }
                return false;
            }
        }
    }

    shouldSkipElyvorgTeleportCollision(enemy, player) {
        const boss = this.game.boss && this.game.boss.current;
        if (!(boss instanceof Elyvorg)) return false;

        const isTeleporting = boss.state === 'teleport';
        const inPostTeleportSafeWindow =
            boss.postTeleportSafeTimer && boss.postTeleportSafeTimer > 0;
        const safePhase = isTeleporting || inPostTeleportSafeWindow;

        if (!safePhase) return false;

        const isElyvorgFamily = (enemy instanceof Elyvorg || enemy instanceof PurpleBarrier);
        const playerCanHitDuringSafePhase = this.isRollingOrDiving(player) || player.isDashing;

        if (isElyvorgFamily && !playerCanHitDuringSafePhase) {
            return true;
        }

        return false;
    }

    handleHealingBarrierCollision(barrier, healAmount = 2) {
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
            boss.lives = Math.min(boss.lives + healAmount, overhealCap);
        }
    }

    // Fireball collision handlers
    get fireballCollisionHandlers() {
        if (this._fireballHandlers) return this._fireballHandlers;

        const player = this.game.player;

        this._fireballHandlers = {
            PurpleFireball: (enemy, fireball) => {
                this.playCollisionFx(enemy, { fireball });

                this.game.floatingMessages.push(
                    new FloatingMessage('+20', enemy.x, enemy.y, 250, 110, 30, 'cyan')
                );

                player.energy += 20;

                const msg = Math.random() < 0.5 ? 'NICE!' : 'EPIC!';
                this.game.floatingMessages.push(
                    new FloatingMessage(msg, enemy.x, enemy.y, this.game.width / 2, 80, 50)
                );
            },

            // no FX
            PurpleBallOrb: () => { },
            GroundShockwaveRing: () => { },

            // special cases that do extra logic besides FX
            Goblin: (enemy) => {
                this.game.audioHandler.enemySFX.playSound('goblinDie', false, true);
                this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
                this.game.collisions.push(
                    new CollisionAnimation(
                        this.game,
                        enemy.x + enemy.width * 0.5,
                        enemy.y + enemy.height * 0.5,
                        player.isBluePotionActive
                    )
                );
                enemy.lives = 0;
            },

            // bosses
            Glacikal: (enemy) => {
                enemy.lives--;
                this.bloodOrPoof(enemy, player);
            },

            Elyvorg: (enemy) => {
                if (!enemy.isBarrierActive) {
                    enemy.lives--;
                    this.bloodOrPoof(enemy, player);
                }
            },

            NTharax: (enemy) => {
                if (enemy.isTransforming || enemy.state === "transform") return;
                if (!enemy.isBarrierActive) {
                    enemy.lives--;
                    this.bloodOrPoof(enemy, player);
                }
            },

            // barriers
            HealingBarrier: (barrier) => {
                this.handleHealingBarrierCollision(barrier);
            },

            PurpleBarrier: (enemy) => {
                if (enemy.lives <= 0) {
                    this.game.collisions.push(
                        new DisintegrateCollision(this.game, enemy, { followTarget: this.game.boss.current })
                    );
                }
            },

            default: (enemy, fireball) => {
                this.playCollisionFx(enemy, { fireball, fallbackToDefault: true });
            }
        };

        return this._fireballHandlers;
    }

    // ------------------------------------------------------------------
    // Enemies collision (player vs enemy)
    // ------------------------------------------------------------------
    handleFiredogCollisionWithEnemy(enemy) {
        const player = this.game.player;
        if (this.game.gameOver) return;

        if (!player.isDashing && player.collisionCooldowns[enemy.id] > 0) return;
        if (!this.enemyHitsRect(enemy, this.getPlayerRect())) return;

        if (!player.isDashing && player.postDashGraceTimer > 0) {
            player.collisionCooldowns[enemy.id] = Math.max(
                player.collisionCooldowns[enemy.id] || 0,
                player.postDashGraceTimer
            );
            return;
        }

        if (enemy instanceof EnemyBoss) {
            const bossInvulnerable =
                !this.game.bossInFight ||
                this.game.cutsceneActive ||
                (this.game.boss && this.game.boss.talkToBoss) ||
                (this.game.boss && this.game.boss.preFight);

            if (bossInvulnerable) return;
        }

        if (this.isKamehameha(enemy)) {
            if (!player.isDashing) {
                player.collisionCooldowns[enemy.id] = 220;
            }

            this.hit(enemy, player);

            if (player.isDashing) {
                const dashId = player.dashInstanceId;

                if (enemy._lastDashKameFxId === dashId) return;
                enemy._lastDashKameFxId = dashId;
            }

            if (!player.isInvisible || this.isRollingOrDiving(player) || player.isDashing) {
                this.playCollisionFx(enemy);
            }
            return;
        }

        if (this.shouldSkipElyvorgTeleportCollision(enemy, player)) return;

        if (!player.isDashing && (!player.isInvisible || (player.isInvisible && this.isRollingOrDiving(player)))) {
            player.collisionCooldowns[enemy.id] = 500;

            if (!(enemy instanceof EnemyBoss) && !(enemy instanceof Goblin)) {
                enemy.lives -= 1;
            }
        }

        if (this.isRollingOrDiving(player)) {
            if (player.isBluePotionActive) {
                enemy.lives -= 3;
                this.handleFloatingMessages(enemy, player);
                this.bloodOrPoof(enemy, player);
                return;
            }

            this.handleRollingOrDivingCollision(enemy);
            this.handleFloatingMessages(enemy, player);
            return;
        }

        if (player.isDashing) {
            const dashId = player.dashInstanceId;

            if (enemy instanceof Elyvorg && enemy.isBarrierActive) {
                return;
            }

            if (enemy instanceof NTharax && enemy.isBarrierActive) {
                return;
            }

            if (enemy._lastDashHitId !== dashId) {
                enemy._lastDashHitId = dashId;
                enemy.lives -= 3;
                this.handleFloatingMessages(enemy, player);
            }

            if (enemy._lastDashEffectId !== dashId) {
                enemy._lastDashEffectId = dashId;
                this.handleNormalCollision(enemy, { treatAsDash: true });
            }
            return;
        }

        this.handleNormalCollision(enemy);
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

        this.handleFloatingMessages(enemy, player);
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

    // ------------------------------------------------------------------
    // Normal collision
    // ------------------------------------------------------------------
    handleNormalCollision(enemy, opts = null) {
        const player = this.game.player;
        const treatAsDash = !!opts?.treatAsDash;

        const canReceiveStatus = !player.isInvisible;
        const canPlayCollisionFx = (!player.isInvisible) || treatAsDash || player.isDashing;

        switch (true) {
            default:
                this.hit(enemy, player);
                if (canPlayCollisionFx) this.bloodOrPoof(enemy, player);
                break;

            // normal enemies with special collision animation
            case enemy instanceof GhostElyvorg:
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
                if (canPlayCollisionFx) {
                    this.playCollisionFx(enemy);
                }
                if (canReceiveStatus) {
                    this.hit(enemy, player);
                }
                break;

            // goblin
            case enemy instanceof Goblin: {
                if (treatAsDash || player.isDashing) {
                    enemy.lives = 0;
                    if (canPlayCollisionFx) this.bloodOrPoof(enemy, player);
                    return;
                }

                this.hit(enemy, player);

                if (canPlayCollisionFx) {
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
                            new FloatingMessage('-' + coinsToSteal, player.x, player.y, 120, 30, 30, 'red')
                        );
                    }
                }
                break;
            }

            // ink
            case enemy instanceof Sluggie:
            case enemy instanceof InkBomb:
            case enemy instanceof Garry:
            case enemy instanceof InkBeam:
                this.hit(enemy, player);

                if (canReceiveStatus) {
                    this.triggerInkSplash(player);
                }

                if (canPlayCollisionFx) {
                    this.playCollisionFx(enemy);
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
            // special stun collision
            case enemy instanceof Skulnap:
            case enemy instanceof YellowArrow:
            case enemy instanceof PurpleThunder:
            case enemy instanceof YellowBeamOrb:
            case enemy instanceof GalacticSpike: {
                if (canPlayCollisionFx) {
                    this.playCollisionFx(enemy, { fallbackToDefault: true });
                }

                if (canReceiveStatus && !player.isDashing && !treatAsDash) {
                    this.stunned(player);
                }

                break;
            }

            case enemy instanceof ElectricWheel: {
                if (canPlayCollisionFx) {
                    this.playCollisionFx(enemy);
                }

                if (canReceiveStatus && !player.isDashing && !treatAsDash) {
                    this.stunned(player);
                }

                if (canPlayCollisionFx) {
                    enemy.lives = 0;
                    player.bossCollisionTimer = 0;
                    player.resetElectricWheelCounters = true;
                }

                break;
            }

            // poison
            case enemy instanceof PoisonSpit:
            case enemy instanceof PoisonDrop:
            case enemy instanceof GreenArrow: {
                if (canPlayCollisionFx) {
                    this.playCollisionFx(enemy);
                }

                if (canReceiveStatus) {
                    const applied = this.tryApplyPoison(player, 2500);
                    this.hit(enemy, player);

                    if (applied) {
                        this.game.audioHandler.enemySFX.playSound('acidSoundEffect', false, true);
                    }
                }
                break;
            }

            // red
            case enemy instanceof Gloomlet:
            case enemy instanceof KarateCroco:
            case enemy instanceof Tauro:
            case enemy instanceof SpearFish:
            case enemy instanceof TheRock:
            case enemy instanceof Volcanurtle:
                this.hit(enemy, player);
                if (canPlayCollisionFx) {
                    this.bloodOrPoof(enemy, player);
                }
                break;

            // slow
            case enemy instanceof IceBall:
            case enemy instanceof IceTrail:
            case enemy instanceof IcyStormBall:
            case enemy instanceof SpinningIceBalls:
            case enemy instanceof PointyIcicleShard:
            case enemy instanceof BlueArrow: {
                if (canPlayCollisionFx) {
                    this.playCollisionFx(enemy, { fallbackToDefault: true });
                }

                if (canReceiveStatus) {
                    const applied = this.tryApplySlow(player, 5000);
                    this.hit(enemy, player);

                    if (applied) {
                        this.game.audioHandler.enemySFX.playSound('iceSlowedSound', false, true);
                    }
                }
                break;
            }

            // frozen
            case enemy instanceof IceSlash:
            case enemy instanceof BlueAsteroid:
            case enemy instanceof CyanArrow: {
                if (canPlayCollisionFx) {
                    this.playCollisionFx(enemy, { fallbackToDefault: true });
                }

                if (canReceiveStatus && !player.isDashing && !treatAsDash) {
                    this.hit(enemy, player);
                    this.startFrozen(player, 2000);
                }

                break;
            }

            // tunnel vision
            case enemy instanceof BlackBeamOrb:
                if (canReceiveStatus) {
                    this.hit(enemy, player);

                    if (canPlayCollisionFx) {
                        this.playCollisionFx(enemy);
                    }

                    player.triggerTunnelVision({
                        fadeInMs: 1200,
                        holdMs: 2000,
                        expandMs: 0,
                        expandAmount: 0,
                        fadeOutMs: 1200,
                        fadeCircleAlphaWithFadeOut: true,
                    });
                    this.game.audioHandler.powerUpAndDownSFX.playSound('darkHoleLaughSound', false, true);
                } else {
                    if (canPlayCollisionFx) {
                        this.playCollisionFx(enemy);
                    }
                }
                break;

            // boss enemies
            case enemy instanceof Glacikal:
            case enemy instanceof Elyvorg: {
                const isElyvorg = enemy instanceof Elyvorg;

                if (treatAsDash || player.isDashing) {
                    if (!isElyvorg || !enemy.isBarrierActive) {
                        if (canPlayCollisionFx) this.bloodOrPoof(enemy, player);
                    }
                    break;
                }

                if (
                    player.bossCollisionTimer >= player.bossCollisionCooldown &&
                    (!isElyvorg || !enemy.isBarrierActive)
                ) {
                    this.hit(enemy, player);
                    if (canPlayCollisionFx) this.bloodOrPoof(enemy, player);
                }
                break;
            }

            case enemy instanceof NTharax: {
                if (enemy.isTransforming || enemy.state === "transform") break;

                if (enemy.state === 'dive') {
                    if (canReceiveStatus) this.hit(enemy, player);
                    break;
                }

                if (player.bossCollisionTimer >= player.bossCollisionCooldown) {
                    if (canReceiveStatus) {
                        this.hit(enemy, player);
                        if (canPlayCollisionFx && !enemy.isBarrierActive) {
                            this.bloodOrPoof(enemy, player);
                        }
                    } else {
                        if (canPlayCollisionFx && !enemy.isBarrierActive) {
                            this.bloodOrPoof(enemy, player);
                        }
                    }
                }
                break;
            }

            // barriers
            case enemy instanceof HealingBarrier: {
                player.bossCollisionTimer = 0;

                const canHurtPlayer =
                    canReceiveStatus && (
                        player.isFrozen ||
                        player.currentState === player.states[0] ||
                        player.currentState === player.states[1] ||
                        player.currentState === player.states[2] ||
                        player.currentState === player.states[3] ||
                        player.currentState === player.states[8]
                    );

                if (canHurtPlayer) {
                    this.hit(enemy, player);
                }

                if (canPlayCollisionFx) {
                    const healAmount = (treatAsDash || player.isDashing) ? (3 * 2) : 2;
                    this.handleHealingBarrierCollision(enemy, healAmount);
                }
                break;
            }

            case enemy instanceof PurpleBarrier:
                player.bossCollisionTimer = 0;

                if (
                    canReceiveStatus &&
                    (
                        player.isFrozen ||
                        player.currentState === player.states[0] ||
                        player.currentState === player.states[1] ||
                        player.currentState === player.states[2] ||
                        player.currentState === player.states[3] ||
                        player.currentState === player.states[8]
                    )
                ) {
                    this.hit(enemy, player);
                }

                if (enemy.lives <= 0) {
                    this.game.collisions.push(
                        new DisintegrateCollision(this.game, enemy, { followTarget: this.game.boss.current })
                    );
                }
                break;

            // purple slash
            case enemy instanceof PurpleSlash:
                player.bossCollisionTimer = 0;
                if (canReceiveStatus) this.hit(enemy, player);
                break;
        }
    }

    // ------------------------------------------------------------------
    // Rolling/Diving collision
    // ------------------------------------------------------------------
    handleRollingOrDivingCollision(enemy) {
        const player = this.game.player;

        switch (true) {
            default:
                this.bloodOrPoof(enemy, player);
                break;

            // normal enemies with special collision
            case enemy instanceof GhostElyvorg:
            case enemy instanceof MeteorAttack:
            case enemy instanceof PurpleLaserBeam:
            case enemy instanceof GravitationalAura:
            case enemy instanceof PurpleBeamOrb:
            case enemy instanceof PurpleAsteroid:
                this.playCollisionFx(enemy);
                break;

            // normal enemies with special collision but damage through rolling or diving
            case enemy instanceof PurpleFireball:
            case enemy instanceof UndergroundIcicle:
            case enemy instanceof PurpleBallOrb:
            case enemy instanceof AntennaeTentacle:
            case enemy instanceof GroundShockwaveRing:
            case enemy instanceof LaserBall:
                this.hit(enemy, player);
                this.playCollisionFx(enemy);
                break;

            // goblin
            case enemy instanceof Goblin:
                enemy.lives = 0;
                this.bloodOrPoof(enemy, player);
                break;

            // ink
            case enemy instanceof Sluggie:
            case enemy instanceof InkBomb:
            case enemy instanceof Garry:
            case enemy instanceof InkBeam:
                this.triggerInkSplash(player);
                this.playCollisionFx(enemy);
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
            case enemy instanceof YellowArrow:
            case enemy instanceof YellowBeamOrb: {
                this.playCollisionFx(enemy, { fallbackToDefault: true });

                if (!player.isInvisible) {
                    this.stunned(player);
                }

                break;
            }

            case enemy instanceof ElectricWheel: {
                enemy.lives = 0;

                this.playCollisionFx(enemy);

                if (!player.isInvisible) {
                    this.stunned(player);
                }

                player.resetElectricWheelCounters = true;
                player.bossCollisionTimer = 0;

                break;
            }

            // poison
            case enemy instanceof PoisonSpit:
            case enemy instanceof PoisonDrop:
            case enemy instanceof GreenArrow: {
                const applied = this.tryApplyPoison(player, 2500);

                if (!player.isInvisible) {
                    this.hit(enemy, player);
                    if (applied) {
                        this.game.audioHandler.enemySFX.playSound('acidSoundEffect', false, true);
                    }
                }

                this.playCollisionFx(enemy);

                break;
            }

            // red
            case enemy instanceof Gloomlet:
            case enemy instanceof Tauro:
            case enemy instanceof KarateCroco:
            case enemy instanceof SpearFish:
            case enemy instanceof TheRock:
            case enemy instanceof Volcanurtle:
                if (player.currentState === player.states[4]) this.hit(enemy, player);
                this.bloodOrPoof(enemy, player);
                break;

            // slow
            case enemy instanceof IceBall:
            case enemy instanceof IceTrail:
            case enemy instanceof IcyStormBall:
            case enemy instanceof SpinningIceBalls:
            case enemy instanceof PointyIcicleShard:
            case enemy instanceof BlueArrow: {
                const applied = this.tryApplySlow(player, 5000);
                if (applied) {
                    this.game.audioHandler.enemySFX.playSound('iceSlowedSound', false, true);
                }
                this.playCollisionFx(enemy, { fallbackToDefault: true });
                break;
            }

            // frozen
            case enemy instanceof IceSlash:
            case enemy instanceof BlueAsteroid:
            case enemy instanceof CyanArrow: {
                this.playCollisionFx(enemy, { fallbackToDefault: true });

                if (!player.isInvisible) {
                    this.hit(enemy, player);
                    this.startFrozen(player, 2000);
                }

                break;
            }

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
                this.playCollisionFx(enemy);
                break;

            // boss enemies
            case enemy instanceof Glacikal:
            case enemy instanceof Elyvorg: {
                const isElyvorg = enemy instanceof Elyvorg;

                if (
                    player.bossCollisionTimer >= player.bossCollisionCooldown &&
                    (!isElyvorg || !enemy.isBarrierActive)
                ) {
                    enemy.lives -= 1;
                    this.bloodOrPoof(enemy, player);
                }

                break;
            }

            case enemy instanceof NTharax: {
                if (enemy.isTransforming || enemy.state === "transform") break;

                if (enemy.state === 'dive') {
                    if (!player.isInvisible) {
                        this.hit(enemy, player);
                    } else {
                        if (player.bossCollisionTimer >= player.bossCollisionCooldown && !enemy.isBarrierActive) {
                            enemy.lives -= 1;
                            this.bloodOrPoof(enemy, player);
                        }
                    }
                    break;
                }

                if (player.bossCollisionTimer >= player.bossCollisionCooldown) {
                    if (!enemy.isBarrierActive) {
                        enemy.lives -= 1;
                        this.bloodOrPoof(enemy, player);
                    }
                }
                break;
            }

            // barriers
            case enemy instanceof HealingBarrier: {
                this.handleHealingBarrierCollision(enemy);
                break;
            }

            case enemy instanceof PurpleBarrier:
                player.bossCollisionTimer = 0;
                if (enemy.lives <= 0) {
                    this.game.collisions.push(
                        new DisintegrateCollision(this.game, enemy, { followTarget: this.game.boss.current })
                    );
                }
                break;

            // purple slash
            case enemy instanceof PurpleSlash:
                if (!player.isInvisible) {
                    player.bossCollisionTimer = 0;
                    this.hit(enemy, player);
                }
                break;
        }
    }

    // ------------------------------------------------------------------
    // Power collisions
    // ------------------------------------------------------------------
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
                    new FloatingMessage('+10s', item.x, item.y, 115, 70, 30, 'white', 'black', true)
                );
            },
            HealthLive() {
                game.lives++;
                game.audioHandler.powerUpAndDownSFX.playSound('healthLiveSound', false, true);
            },
            Coin(item) {
                game.coins += 10;
                game.floatingMessages.push(
                    new FloatingMessage('+10', item.x, item.y, 120, 30, 30, 'yellow')
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
                player.isEnergyExhausted = false;

                if (player.currentState === player.states[4]) {
                    game.speed = player.bluePotionSpeed;
                }

                player.blueFireTimer = 5000;
                player.isBluePotionActive = true;
            },
            Hourglass() {
                game.audioHandler.powerUpAndDownSFX.playSound('hourglassSound', false, true);
                player.activateHourglass();
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
                this.startFrozen(player, 3000);
            },
            Cauldron() {
                game.audioHandler.powerUpAndDownSFX.playSound('cauldronSoundEffect', false, true);
                this.setPoison(3500, player);
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
                    new FloatingMessage('-10s', item.x, item.y, 115, 70, 30, 'red', 'black', true)
                );
            },
            RandomPower(item) {
                const candidates = Object.keys(downHandlers).filter(name => {
                    if (name === 'RandomPower') return false;
                    if (name === 'CarbonDioxideTank' && !player.isUnderwater) return false;
                    return true;
                });

                const pickName = candidates[Math.floor(Math.random() * candidates.length)];
                downHandlers[pickName].call(this, item);
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
                handler.call(this, item);
            }
        };

        processList(game.powerUps, upHandlers, false);
        processList(game.powerDowns, downHandlers, true);
    }
}
