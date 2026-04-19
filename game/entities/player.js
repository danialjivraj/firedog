import { getDefaultKeyBindings } from '../config/keyBindings.js';
import { normalizeDelta, BASE_FRAME_MS, PlayerState, MAX_LIVES } from '../config/constants.js';
import { getConfiguredLivesFromIndex } from '../config/difficultySettings.js';
import {
    getSkinElement,
    getCosmeticElement,
    COSMETIC_LAYER_ORDER,
    getCosmeticChromaDegFromState,
    drawWithOptionalHue,
    FIREDOG_FRAME,
} from '../config/skinsAndCosmetics.js';
import {
    PLAYER_PHYSICS, PLAYER_SLOW_MULTIPLIERS,
    ICE_PHYSICS, FROZEN_CONFIG,
    STATUS_EFFECT_DURATIONS, ENERGY_CONFIG,
    FIREBALL_CONFIG, DIVING_CONFIG,
    INVISIBLE_CONFIG, DASH_CONFIG,
    BOSS_COLLISION_CONFIG,
} from '../config/playerConfig.js';
import { Sitting, Running, Jumping, Falling, Rolling, Diving, Stunned, Hit, Standing, Dying, Dashing } from './playerStates.js';
import { Fireball, PoisonBubbles, IceCrystalBubbles, SpinningChicks } from '../animations/particles.js';
import { DamageIndicator } from '../animations/damageIndicator.js';
import { TunnelVision } from '../animations/tunnelVision.js';
import { CollisionLogic } from './playerCollision.js';

export class Player {
    constructor(game) {
        this.game = game;
        // sprite
        this.defaultSkinImage = getSkinElement('defaultSkin');
        // firedog vars
        this.width = FIREDOG_FRAME.width;
        this.height = FIREDOG_FRAME.height;
        this.x = 0;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.frameX = 0;
        this.frameY = 0;
        this.vy = 0;
        // base physics/speed values
        this.weight = PLAYER_PHYSICS.weight;
        this.normalSpeed = PLAYER_PHYSICS.normalSpeed;
        this.maxSpeed = PLAYER_PHYSICS.maxSpeed;
        this.baseWeight = this.weight;
        this.baseNormalSpeed = this.normalSpeed;
        this.baseMaxSpeed = this.maxSpeed;
        this.slowNormalSpeedMultiplier = PLAYER_SLOW_MULTIPLIERS.normalSpeed;
        this.slowMaxSpeedMultiplier = PLAYER_SLOW_MULTIPLIERS.maxSpeed;
        this.slowWeightMultiplier = PLAYER_SLOW_MULTIPLIERS.weight;
        this.fps = PLAYER_PHYSICS.fps;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.speed = 0;
        this.lives = getConfiguredLivesFromIndex();
        this.maxLives = MAX_LIVES;
        this.previousLives = this.lives;
        this.facingRight = true;
        this.facingLeft = false;
        this.isRolling = false; // for sound
        // collision
        this.collisionCooldowns = {};
        this.collisionLogic = new CollisionLogic(this.game);
        this._enemiesHitSet = new Set();
        // underwater vars
        this.isUnderwater = false;
        this.wasUnderwaterCriticalRedPhaseOn = false;
        this.lastUnderwaterWarningRemainingTime = null;
        this.buoyancy = PLAYER_PHYSICS.buoyancy;
        // space vars
        this.isSpace = false;
        this.canSpaceDoubleJump = false;
        // ice vars
        this.isIce = false;
        this.vx = 0;
        this.accelIce = ICE_PHYSICS.accelIce;
        this.frictionIce = ICE_PHYSICS.frictionIce;
        this.turnResistanceIce = ICE_PHYSICS.turnResistanceIce;
        this.deadzone = ICE_PHYSICS.deadzone;
        this.iceIdleDrift = ICE_PHYSICS.iceIdleDrift;
        this.slideGraceMs = ICE_PHYSICS.slideGraceMs;
        this.slideFrictionIce = ICE_PHYSICS.slideFrictionIce;
        this.slideTimer = 0;
        this.prevAxis = 0;
        this.slideGraceMsBack = this.slideGraceMs;
        this.slideFrictionIceBack = this.slideFrictionIce;
        this._reverseSlideActive = false;
        // frozen vars
        this.isFrozen = false;
        this.frozenTimer = 0;
        this.frozenDuration = FROZEN_CONFIG.duration;
        this.frozenFrameX = 0;
        this.frozenFrameY = 0;
        this.frozenFrameTimer = 0;
        this.frozenMaxFrame = 0;
        this.frozenFacingRight = true;
        this.frozenIceImage = document.getElementById('frozenIce');
        this.frozenPulseTimer = 0;
        this.frozenPulseSpeed = FROZEN_CONFIG.pulseSpeed;
        this.frozenPulseAmp = FROZEN_CONFIG.pulseAmp;
        this.frozenOpacity = FROZEN_CONFIG.opacity;
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
        this.energy = ENERGY_CONFIG.max;
        this.energyTimer = 0;
        this.energyInterval = ENERGY_CONFIG.regenInterval;
        this.isEnergyExhausted = false;
        this.noEnergyLeftSound = false;
        // blue potion
        this.blueFireTimer = 0;
        this.isBluePotionActive = false;
        this.bluePotionSpeedMultiplier = ENERGY_CONFIG.bluePotionSpeedMultiplier;
        this.bluePotionSpeed = this.baseMaxSpeed * this.bluePotionSpeedMultiplier;
        // red potion
        this.isRedPotionActive = false;
        this.redPotionTimer = 0;
        // hourglass
        this.isHourglassActive = false;
        this.hourglassTimer = 0;
        this.hourglassDuration = STATUS_EFFECT_DURATIONS.hourglass;
        this.cooldownRates = {
            fireball: 1,
            invisible: 1,
            dash: 1,
        };
        // hit invincibility
        this.isInvincible = false;
        this.invincibleTimer = 0;
        this.invincibleDuration = STATUS_EFFECT_DURATIONS.invincible;
        // poison
        this.isPoisonedActive = false;
        this.poisonTimer = 0;
        // black hole
        this.isBlackHoleActive = false;
        this.blackHoleTimer = 0;
        this.blackHoleDuration = 0;
        // slow down
        this.isSlowed = false;
        this.slowedTimer = 0;
        // confuse
        this.isConfused = false;
        this.confuseTimer = 0;
        this.confuseDuration = STATUS_EFFECT_DURATIONS.confuse;
        this.confusedKeyBindings = null;
        // status bubbles
        this.statusFxTimer = 0;
        this.statusFxInterval = ENERGY_CONFIG.statusFxInterval;
        // fireball cooldowns
        this.fireballTimer = FIREBALL_CONFIG.cooldown;
        this.fireballCooldown = FIREBALL_CONFIG.cooldown;
        // diving cooldowns
        this.divingTimer = DIVING_CONFIG.timer;
        this.divingCooldown = DIVING_CONFIG.cooldown;
        // invisible cooldowns
        this.isInvisible = false;
        this.invisibleCooldown = INVISIBLE_CONFIG.cooldown;
        this.invisibleTimer = this.invisibleCooldown;
        this.invisibleActiveCooldownTimer = 0;
        this.invisibleDuration = INVISIBLE_CONFIG.duration;
        // dash
        this.isDashing = false;
        this.dashDuration = DASH_CONFIG.duration;
        this.dashTimeLeft = 0;
        this.dashVelocity = 0;
        this.dashSpeedMultiplier = DASH_CONFIG.speedMultiplier;
        this.dashGhostTimer = 0;
        this.dashGhostInterval = DASH_CONFIG.ghostInterval;
        this.dashBetweenCooldown = DASH_CONFIG.betweenCooldown;
        this.dashBetweenTimer = this.dashBetweenCooldown;
        this.dashCooldown = DASH_CONFIG.cooldown;
        this.dashTimer = this.dashCooldown;
        this.dashMaxCharges = DASH_CONFIG.maxCharges;
        this.dashCharges = this.dashMaxCharges;
        this.dashSecondWindowMs = DASH_CONFIG.secondWindowMs;
        this.dashSecondWindowTimer = 0;
        this.secondDashDistanceMultiplier = DASH_CONFIG.secondDistanceMultiplier;
        this.dashAwaitingSecond = false;
        this.dashEnergyCost = DASH_CONFIG.energyCost;
        this.dashInstanceId = 0;
        this.postDashGraceMs = DASH_CONFIG.postGraceMs;
        this.postDashGraceTimer = 0;
        // firedog vars when interacting with boss
        this.setToRunOnce = true;
        this.setToStandingOnce = true;
        // boss collision vars
        this.bossCollisionTimer = BOSS_COLLISION_CONFIG.timer;
        this.bossCollisionCooldown = BOSS_COLLISION_CONFIG.cooldown;
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
            s === this.states[PlayerState.SITTING] ||
            s === this.states[PlayerState.RUNNING] ||
            s === this.states[PlayerState.JUMPING] ||
            s === this.states[PlayerState.FALLING] ||
            s === this.states[PlayerState.ROLLING] ||
            s === this.states[PlayerState.STANDING];
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
        const mult = isSecondDash ? this.secondDashDistanceMultiplier : 1.0;
        this.dashVelocity = dir * baseDash * mult;

        this.setState(PlayerState.DASHING, 3);

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
        // hit invincibility
        this.isInvincible = false;
        this.invincibleTimer = 0;
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
        this.blackHoleTimer = 0;
        this.blackHoleDuration = 0;
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
            this.currentState === this.states[PlayerState.STUNNED] ||
            this.currentState === this.states[PlayerState.HIT]
        ) {
            this.setState(PlayerState.STANDING, 0);
        }
        // audio cleanup
        const sfx = this.game.audioHandler.firedogSFX;
        sfx.stopSound('bluePotionEnergyGoingUp');
        sfx.stopSound('invisibleInSFX');
        sfx.stopSound('rollingSFX');
        sfx.stopSound('rollingUnderwaterSFX');
        sfx.stopSound('frozenSound');
        // particles cleanup
        let pw = 0;
        for (let i = 0; i < this.game.particles.length; i++) {
            if (!this.game.particles[i]._isStatusParticle) {
                if (i !== pw) this.game.particles[pw] = this.game.particles[i];
                pw++;
            }
        }
        this.game.particles.length = pw;
        // collisions
        let cw = 0;
        for (let i = 0; i < this.game.collisions.length; i++) {
            if (!this.game.collisions[i]._isTunnelVision) {
                if (i !== cw) this.game.collisions[cw] = this.game.collisions[i];
                cw++;
            }
        }
        this.game.collisions.length = cw;
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
        this.updateInvincibility(deltaTime);
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
            this.currentState.handleInput(input, deltaTime);
            this.underwaterGravityAndIndicator();

            this.spriteAnimation(deltaTime);
            this.playerHorizontalMovement(input, deltaTime);
            this.playerVerticalMovement(input, deltaTime);

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

        const skipSkin = this.isInvincible && (Math.floor(this.game.hiddenTime / 80) % 2 !== 0);

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

        this.drawPlayerWithCurrentSkin(context, skipSkin);

        context.restore();
    }

    getCurrentSkinImage() {
        const wardrobe = this.game?.menu?.wardrobe;
        const current = wardrobe?.currentSkin;

        if (current && current.tagName === 'IMG') return current;

        const id = current && typeof current.id === 'string' ? current.id : null;
        if (!id) return null;

        const el = globalThis?.document?.getElementById?.(id) || null;
        if (el && el.tagName === 'IMG') return el;

        return null;
    }

    getCurrentCosmeticImage(slot) {
        const menu = this.game.menu.wardrobe;
        const key = menu.getCurrentCosmeticKey?.(slot) || 'none';
        if (!key || key === 'none') return null;
        return getCosmeticElement(slot, key);
    }

    getCurrentCosmeticImagesInOrder() {
        const menu = this.game.menu.wardrobe;
        const version = menu.cosmeticVersion;
        if (this._cosmeticCacheVersion === version && this._cosmeticCache) {
            return this._cosmeticCache;
        }

        const result = [];
        for (let i = 0; i < COSMETIC_LAYER_ORDER.length; i++) {
            const slot = COSMETIC_LAYER_ORDER[i];
            const key = menu.getCurrentCosmeticKey?.(slot) || 'none';
            if (!key || key === 'none') continue;

            const img = getCosmeticElement(slot, key);
            if (!img) continue;

            const chromaState = menu.getCurrentCosmeticsChromaState?.() || {};
            const hueDeg = getCosmeticChromaDegFromState(slot, key, chromaState);

            result.push({ slot, key, img, hueDeg });
        }

        this._cosmeticCache = result;
        this._cosmeticCacheVersion = version;
        return result;
    }

    getTintedFrameCanvas(img, sx, sy, sw, sh, dw, dh, tint, hueDeg = null) {
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

        drawWithOptionalHue(octx, { hueDeg }, () => {
            octx.drawImage(img, sx, sy, sw, sh, 0, 0, OW, OH);
        });

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

    drawPlayerWithCurrentSkin(context, skipSkin = false) {
        const skinImg = this.getCurrentSkinImage();
        const cosmeticLayers = this.getCurrentCosmeticImagesInOrder();

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

        const drawTintLayer = (img, tint, hueDeg = null) => {
            if (!img) return;
            const oc = this.getTintedFrameCanvas(img, sx, sy, sw, sh, dw, dh, tint, hueDeg);
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
            for (const layer of cosmeticLayers) {
                if (!layer?.img) continue;

                drawWithOptionalHue(context, { hueDeg: layer.hueDeg }, () => {
                    drawLayer(layer.img);
                });
            }
        };

        const drawCosmeticsGlow = (color, blur) => {
            for (const layer of cosmeticLayers) {
                if (!layer?.img) continue;

                drawWithOptionalHue(context, { hueDeg: layer.hueDeg }, () => {
                    drawGlowLayer(layer.img, color, blur);
                });
            }
        };

        const drawCosmeticsTint = (tint) => {
            for (const layer of cosmeticLayers) {
                if (!layer?.img) continue;
                drawTintLayer(layer.img, tint, layer.hueDeg);
            }
        };

        if (!skipSkin) {
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
        this.lives = Math.min(this.lives, this.maxLives);
    }

    // energy
    energyLogic(deltaTime) {
        this.energyTimer += deltaTime;
        this.energy = Math.max(0, Math.min(100, this.energy));

        let regenAmount = 0.4;

        if (this.currentState === this.states[PlayerState.DIVING]) { // dive attack slows regen
            regenAmount *= 0.15;
        }

        if (this.isHourglassActive) {
            regenAmount *= 2;
        }

        if (this.energyTimer >= this.energyInterval) {
            this.energyTimer = 0;
            this.energy = Math.min(100, this.energy + regenAmount);
        }

        // blue potion
        this.energyInterval = 70;
        if (this.isBluePotionActive) {
            this.isEnergyExhausted = false;
            this.noEnergyLeftSound = false;

            this.isPoisonedActive = false;
            this.poisonTimer = 0;

            this.game.enemyInterval = 100;
            this.energy = Math.min(100, this.energy + 0.1 * (normalizeDelta(deltaTime)));
        } else {
            this.game.enemyInterval = 1000;
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
                this.energy = Math.max(0, this.energy - 0.1 * (normalizeDelta(deltaTime)));
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

    drainEnergy(deltaTime = BASE_FRAME_MS) {
        if (this.isBluePotionActive) return;

        const energyDrainAmount = 0.4 * (normalizeDelta(deltaTime));
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
                if (this.currentState === this.states[PlayerState.ROLLING]) {
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
        if (this.currentState === this.states[PlayerState.DIVING]) return;

        this.divingTimer += deltaTime;
        this.divingTimer = Math.min(this.divingTimer, this.divingCooldown);
    }

    fireballAbility(input, deltaTime) {
        this.fireballTimer += deltaTime * this.cooldownRates.fireball;
        this.fireballTimer = Math.min(this.fireballTimer, this.fireballCooldown);

        const inFireballState =
            this.currentState === this.states[PlayerState.SITTING] ||
            this.currentState === this.states[PlayerState.RUNNING] ||
            this.currentState === this.states[PlayerState.JUMPING] ||
            this.currentState === this.states[PlayerState.FALLING] ||
            this.currentState === this.states[PlayerState.STANDING];

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

            const yOffset = this.currentState === this.states[PlayerState.SITTING] ? 15 : 0; // small offset when sitting
            const baseX = this.x + 10 + this.width * 0.5;
            const baseY = this.y + this.height * 0.5 + yOffset;
            const fireballDirection = this.facingRight ? 'right' : 'left';

            if (redActive) {
                for (let i = -6; i <= 0; i++) {
                    this.game.behindPlayerParticles.push(
                        new Fireball(this.game, baseX, baseY, 'redPotionFireball', fireballDirection, i)
                    );
                }
            } else {
                this.game.behindPlayerParticles.push(
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
            if (this.currentState === this.states[PlayerState.DIVING] && this.onGround()) {
                this.rollingSound = this.game.audioHandler.firedogSFX.playSound(rollingSoundName, true, true);
            }
        } else if (this.isRolling) {
            this.isRolling = false;
            const rollingSoundName = this.isUnderwater ? 'rollingUnderwaterSFX' : 'rollingSFX';
            this.game.audioHandler.firedogSFX.stopSound(rollingSoundName);
        }

        // running
        if (this.currentState === this.states[PlayerState.RUNNING]) {
            if (this.frameX === 3) {
                this.game.audioHandler.firedogSFX.playSound('runningSFX1');
            }
            if (this.frameX === 6) {
                this.game.audioHandler.firedogSFX.playSound('runningSFX2');
            }
        }

        // getting hit
        if (this.lives < this.previousLives) {
            this.game.audioHandler.firedogSFX.playSound('gettingHit', false, true);
            this.triggerDamageIndicator();
        }
        this.previousLives = this.lives;

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
        this._lastSpeedMultiplier = speed;

        if (!this.game.isBossVisible) {
            if (this.isFrozen) {
                this.game.speed = 0;
            } else if (this.isBluePotionActive && this.currentState === this.states[PlayerState.ROLLING]) {
                this.game.speed = this.bluePotionSpeed;
            } else {
                this.game.speed = this.game.normalSpeed * speed;
            }
        } else {
            this.game.speed = 0;
        }

        this.currentState.enter();
    }

    refreshSpeed() {
        let speed = this._lastSpeedMultiplier ?? 1;
        if (this.currentState === this.states[PlayerState.ROLLING] && speed === 0) speed = 2;
        if (!this.game.isBossVisible) {
            this.game.speed = this.game.normalSpeed * speed;
        }
    }

    // screen indicators
    triggerDamageIndicator() {
        const existingDamageIndicator = this.game.collisions.find(
            c => c instanceof DamageIndicator
        );

        if (existingDamageIndicator) {
            existingDamageIndicator.reset();
        } else {
            this.game.collisions.push(new DamageIndicator(this.game));
        }
    }

    getUnderwaterRemainingTime() {
        if (!this.isUnderwater) return null;
        return Math.max(this.game.maxTimeUnderwater - this.game.time, 0);
    }

    isUnderwaterCriticalTime() {
        const remainingTime = this.getUnderwaterRemainingTime();
        return remainingTime !== null && remainingTime <= 60000;
    }

    isUnderwaterCriticalBlinkOn() {
        const remainingTime = this.getUnderwaterRemainingTime();
        return remainingTime !== null && remainingTime > 0 && remainingTime <= 60000 && (remainingTime % 2000 < 1000);
    }

    isUnderwaterCriticalRedPhaseOn() {
        return this.isUnderwaterCriticalTime() && !this.isUnderwaterCriticalBlinkOn();
    }

    underwaterGravityAndIndicator() {
        if (!this.isUnderwater) {
            this.wasUnderwaterCriticalRedPhaseOn = false;
            this.lastUnderwaterWarningRemainingTime = null;
            return;
        }

        if (this.onGround()) {
            this.vy = 0;
        } else {
            const vyDecreaseFactor = 0.01;
            this.vy = Math.max(-3, this.vy - vyDecreaseFactor * this.y / this.buoyancy);
        }

        const remainingTime = this.getUnderwaterRemainingTime();
        const criticalRedPhaseOn = this.isUnderwaterCriticalRedPhaseOn();
        const redPhaseJustTurnedOn = criticalRedPhaseOn && !this.wasUnderwaterCriticalRedPhaseOn;
        const warningTimeJumped =
            this.lastUnderwaterWarningRemainingTime != null &&
            remainingTime != null &&
            Math.abs(remainingTime - this.lastUnderwaterWarningRemainingTime) >= 5000;

        if (redPhaseJustTurnedOn && !warningTimeJumped && !this.game.cabin.isFullyVisible) {
            if (this.game.time >= 1000) {
                this.triggerDamageIndicator();
            }
        }

        this.wasUnderwaterCriticalRedPhaseOn = criticalRedPhaseOn;
        this.lastUnderwaterWarningRemainingTime = remainingTime;
    }

    triggerTunnelVision(options = null) {
        this.isBlackHoleActive = true;

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
            this.game.particles.push(new PoisonBubbles(this.game, pickX(), spawnY, kind));
        };

        const spawnIceCrystal = () => {
            this.game.particles.push(new IceCrystalBubbles(this.game, pickX(), spawnY));
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

        if (!this.game.particles.some(p => p._isSpinningChicks)) {
            this.game.particles.push(new SpinningChicks(this.game));
        }
    }

    // movement logic
    spriteAnimation(deltaTime) {
        if (this.currentState.deathAnimation) return;
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

        const dt = normalizeDelta(deltaTime);

        if (this.isDashing) {
            this.x += this.dashVelocity * dt;

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

        this.x += this.speed * dt;

        if (right && this.currentState !== this.states[PlayerState.STUNNED]) {
            this.speed = this.maxSpeed;
        } else if (left && this.currentState !== this.states[PlayerState.STUNNED]) {
            if (this.game.isBossVisible || this.game.cabin.isFullyVisible) {
                this.speed = -this.maxSpeed;
            } else if (this.currentState === this.states[PlayerState.ROLLING]) {
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

        const stunned = this.currentState === this.states[PlayerState.STUNNED];

        const accel = this.accelIce;
        const frictionBase = this.frictionIce;

        let speedCap = this.maxSpeed;
        if (axis < 0) {
            if (this.game.isBossVisible || this.game.cabin.isFullyVisible) {
                speedCap = this.maxSpeed;
            } else if (this.currentState === this.states[PlayerState.ROLLING]) {
                speedCap = this.maxSpeed * 1.7;
            } else {
                speedCap = this.maxSpeed * 1.3;
            }
        }

        const dt = Math.max(1, deltaTime || 16);

        if (this.prevAxis !== 0 && axis === 0) {
            if (this.vx < 0) {
                this.slideTimer = this.slideGraceMsBack;
                this._reverseSlideActive = true;
            } else {
                this.slideTimer = this.slideGraceMs;
                this._reverseSlideActive = false;
            }
        }

        const slideFric =
            (this._reverseSlideActive ? this.slideFrictionIceBack : this.slideFrictionIce);

        if (stunned) {
            const effFric = this.slideTimer > 0 ? slideFric : frictionBase;
            const decay = Math.max(0, 1 - effFric * dt);
            this.vx *= decay;
        } else {
            if (Math.abs(axis) < this.deadzone) axis = 0;

            let effectiveAccel = accel;
            if (
                axis !== 0 &&
                Math.sign(axis) !== Math.sign(this.vx) &&
                Math.abs(this.vx) > 0.01
            ) {
                effectiveAccel *= (1 - this.turnResistanceIce);
            }

            this.vx += axis * effectiveAccel * dt;

            if (axis === 0) {
                const effFric = this.slideTimer > 0 ? slideFric : frictionBase;
                const decay = Math.max(0, 1 - effFric * dt);
                this.vx *= decay;

                if (Math.abs(this.vx) < 0.01 && this.iceIdleDrift > 0) {
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

    playerVerticalMovement(input, deltaTime) {
        if (this.isFrozen) return;

        const dt = normalizeDelta(deltaTime);

        if (this.isSpace) {
            const weightRatio = this.weight / this.baseWeight;
            const spaceGravity = 0.07 * (this.isSlowed ? weightRatio * 1.3 : weightRatio);
            const fallClamp = 3;

            this.y += this.vy * dt;

            if (this.vy < fallClamp) {
                this.vy += spaceGravity * dt;
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

        this.y += this.vy * dt;
        if (!this.onGround()) {
            this.vy += this.weight * dt;
        } else {
            this.vy = 0;
        }

        if (this.isUnderwater) {
            if (this.game.input.isRollAttack(input) && this._jump(input) && this.currentState === this.states[PlayerState.ROLLING]) {
                this.buoyancy -= 1;
                this.y -= 4 * dt;
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
        const dt = normalizeDelta(this.game.deltaTime ?? BASE_FRAME_MS);

        if (this.game.isBossVisible && this.currentState === this.states[PlayerState.ROLLING]) {
            if (this.facingRight) {
                if (!(this.game.input.isRollAttack(input) && !left && !right)) {
                    if (left) this.x -= 6 * dt;
                    else this.x += 6 * dt;
                }
            } else if (this.facingLeft) {
                if (!(this.game.input.isRollAttack(input) && !left && !right)) {
                    if (right) this.x += 6 * dt;
                    else this.x -= 6 * dt;
                }
            }
        }

        if (this.game.boss.talkToBoss && this.game.isBossVisible) {
            if (this.x > 0) {
                if (this.setToRunOnce) {
                    this.game.input.keys = [];
                    this.setToRunOnce = false;
                    this.setState(PlayerState.RUNNING, 1);
                }
                this.x -= 6 * dt;
            } else if (this.setToStandingOnce) {
                setTimeout(() => {
                    this.game.input.keys = [];
                    this.setToStandingOnce = false;
                    this.setState(PlayerState.STANDING, 0);
                }, 10);
            }
        }
    }

    checkIfFiredogIsDead() {
        if (this.lives <= 0) {
            if (this.game.noDamageDuringTutorial) {
                this.game.menu.difficulty.applyCurrentSettings();
            } else {
                this.game.gameOver = true;
            }
        }

        if (this.game.gameOver) {
            this.clearFreeze();
        }

        if (this.currentState.deathAnimation && (this.isUnderwater || this.isSpace) && !this.onGround()) {
            const dt = normalizeDelta(this.game.deltaTime ?? BASE_FRAME_MS);
            this.y += 2 * dt;
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

    updateInvincibility(deltaTime) {
        if (!this.isInvincible) return;
        this.invincibleTimer -= deltaTime;
        if (this.invincibleTimer <= 0) {
            this.invincibleTimer = 0;
            this.isInvincible = false;
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
        this._enemiesHitSet.clear();

        const enemies = this.game.enemies;
        for (let i = 0; i < enemies.length; i++) {
            this.collisionLogic.handleFiredogCollisionWithEnemy(enemies[i]);
            this.collisionLogic.handleFireballCollisionWithEnemy(enemies[i], this._enemiesHitSet);
        }

        this.collisionLogic.updateAllCollisionAnimationPositions();
        this.collisionLogic.updateCollisionCooldowns(deltaTime);
    }

    collisionWithPowers() {
        this.collisionLogic.handlePowerCollisions();
    }
}

