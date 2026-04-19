import { fadeInAndOut } from "../../../animations/fading.js";
import { normalizeDelta } from "../../../config/constants.js";
import { dist, angleTo, setShadow, drawSprite, withCtx, clamp } from "./enemyUtils.js";

export class Enemy {
    constructor() {
        this.frameX = 0;
        this.frameY = 0;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.markedForDeletion = false;
        this.coinValue = 1;
        this.lives = 1;
        this.id = Math.random().toString(36).substring(2, 11);
        this.soundId = undefined;

        this.dealsDirectHitDamage = true;
        this.autoRemoveOnZeroLives = true;

        this.autoRemoveOffBottom = true;
        this.autoRemoveOffTop = true;

        this.isStunEnemy = false;
        this.isRedEnemy = false;
        this.isPoisonEnemy = false;
        this.isSlowEnemy = false;
        this.isFrozenEnemy = false;

        this.loopingSoundId = null;
        this.loopingSoundFadeOut = false;

        this._isMovingGround = false;
    }

    setFps(fps) {
        this.fps = fps;
        this.frameInterval = 1000 / this.fps;
    }

    advanceFrame(deltaTime) {
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = this.frameX < this.maxFrame ? this.frameX + 1 : 0;
        } else {
            this.frameTimer += deltaTime;
        }
    }

    isOnScreen() {
        return (
            this.x + this.width >= 0 &&
            this.y + this.height >= 0 &&
            this.x + this.width / 2 <= this.game.width &&
            this.y + this.height / 2 <= this.game.height
        );
    }

    playIfOnScreen(soundId, ...args) {
        if (this.isOnScreen()) this.game.audioHandler.enemySFX.playSound(soundId, ...args);
    }

    playSoundOnce(soundId, ...args) {
        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound(soundId, ...args);
        }
    }

    getDistanceToPlayer() {
        const p = this.game.player;
        return dist(this.x, this.y, p.x, p.y);
    }

    getAngleToPlayer() {
        const p = this.game.player;
        return angleTo(this.x, this.y, p.x, p.y);
    }

    applyGlow(context) {
        if (this.isStunEnemy) setShadow(context, 'yellow', 10);
        else if (this.isRedEnemy) setShadow(context, 'red', 10);
        else if (this.isPoisonEnemy) setShadow(context, 'green', 10);
        else if (this.isSlowEnemy) setShadow(context, 'blue', 10);
        else if (this.isFrozenEnemy) setShadow(context, '#00eaff', 18);
    }

    clearGlow(context) {
        setShadow(context, 'transparent', 0);
    }

    update(deltaTime) {
        const dt = normalizeDelta(deltaTime);
        if (!this.game.cabin.isFullyVisible) {
            this.x -= (this.speedX + this.game.speed) * dt;
            this.y += this.speedY * dt;
        } else if (this.game.cabin.isFullyVisible && !this._isMovingGround) {
            this.x -= this.speedX * dt;
            this.y -= this.speedY * dt;
        }

        this.advanceFrame(deltaTime);

        const offLeft = this.x + this.width < 0;
        const offBottom = this.autoRemoveOffBottom && (this.y > this.game.height);
        const offTop = this.autoRemoveOffTop && (this.y + this.height < 0);
        const dead = this.autoRemoveOnZeroLives && this.lives <= 0;

        if (offLeft || offBottom || offTop || dead) {
            this.markedForDeletion = true;
            this.game.audioHandler.enemySFX.stopSound(this.soundId);
        } else {
            this.playIfOnScreen(this.soundId);
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        this.applyGlow(context);
        drawSprite(
            context,
            this.image,
            this.frameX * this.width, 0, this.width, this.height,
            this.x, this.y, this.width, this.height
        );
        this.clearGlow(context);
    }
}

export class EnemyBoss extends Enemy {
    constructor(game, width, height, maxFrame, imageId) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = this.game.width;
        this.y = this.game.height - this.height - this.game.groundMargin;

        this.image = document.getElementById(imageId);

        this.speedX = 0;
        this.speedY = 0;
        this.maxFrame = maxFrame;

        this.autoRemoveOnZeroLives = false;

        this.autoRemoveOffBottom = false;
        this.autoRemoveOffTop = false;

        this.state = "idle";
        this.previousState = null;
        this.shouldInvert = false;

        this.reachedRightEdge = false;
        this.reachedLeftEdge = false;
        this.isInTheMiddle = false;

        this.originalY = this.y;
    }

    draw(context, shouldInvert = false) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.scale(shouldInvert ? -1 : 1, 1);

        context.drawImage(
            this.image,
            this.frameX * this.width,
            this.frameY * this.height,
            this.width,
            this.height,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        context.restore();
    }

    cutsceneBackgroundChange(fadein, stay, fadeout) {
        this.game.enterDuringBackgroundTransition = false;
        fadeInAndOut(this.game.canvas, fadein, stay, fadeout, () => {
            this.game.enterDuringBackgroundTransition = true;
        });
    }

    backToIdleSetUp({ recordPreviousState = true } = {}) {
        if (recordPreviousState) {
            this.previousState = this.state;
        }

        this.state = "idle";
        this.frameX = 0;
    }

    backToRechargeSetUp() {
        this.state = "recharge";
        this.frameX = 0;
        this.stateRandomiserTimer = 0;
    }

    checksBossIsFullyVisible(bossId) {
        if (!this.game.boss.isVisible &&
            this.game.boss.current === this &&
            this.game.boss.id === bossId) {
            if (this.x <= this.game.width - this.width) {
                this.game.boss.isVisible = true;
                this.x = this.game.width - this.width;
            }
        }
    }

    edgeConstraintLogic(bossId, middleTolerance = 11, stopAtMiddleChance = 0.7) {
        if (this.game.boss.isVisible &&
            this.game.boss.current === this &&
            this.game.boss.id === bossId) {

            const pickRunStopAtMiddle = () => {
                this.runStopAtTheMiddle = Math.random() >= stopAtMiddleChance;
            };

            if (this.x <= 0) {
                this.x = 1;
                pickRunStopAtMiddle();
                this.reachedLeftEdge = true;
                if (this.state === "run") this.previousState = this.state;
                this.state = "idle";
            } else if (this.x + this.width >= this.game.width) {
                this.x = this.game.width - this.width - 1;
                pickRunStopAtMiddle();
                this.reachedRightEdge = true;
                if (this.state === "run") this.previousState = this.state;
                this.state = "idle";
            } else {
                this.reachedRightEdge = false;
                this.reachedLeftEdge = false;
            }

            const bossCenterX = this.x + this.width * 0.5;
            this.isInTheMiddle = Math.abs(bossCenterX - this.game.width * 0.5) <= middleTolerance;
        }
    }

    runningAway(deltaTime, bossId) {
        this.runningDirection = 10;
        this.state = "run";
        const dt = normalizeDelta(deltaTime);

        if (this.runAnimation) {
            this.runAnimation.x = this.x;
            this.runAnimation.y = this.y;
            this.runAnimation.update(deltaTime);
        }

        this.x += this.runningDirection * dt;
        this.game.background.totalDistanceTraveled = this.game.maxDistance - 6;

        if (this.x > this.game.width) {
            if (this.game.boss.current === this && this.game.boss.id === bossId) {
                this.game.boss.isVisible = false;
                this.game.boss.talkToBoss = false;
                this.game.boss.runAway = false;
                this.game.boss.current = null;
                this.game.player.refreshSpeed();
            }
            this.markedForDeletion = true;
            this.stopRunSFX();
        }
    }

    defeatCommon({
        bossId,
        bossClass,
        battleThemeId = "elyvorgBattleTheme",
        onBeforeClear = () => { },
        onAfterSetup = () => { },
    }) {
        if (this.game && this.game.bossManager && typeof this.game.bossManager.onBossDefeated === "function") {
            this.game.bossManager.onBossDefeated(bossId);
        }

        const gate = this.game.bossManager.getGateForCurrentMap();
        if (gate) {
            const currentCoins = this.game.coins || 0;
            this.game.coins = Math.max(currentCoins, gate.minCoins);
        }

        this.game.boss.inFight = false;
        this.lives = 100;

        this.cutsceneBackgroundChange(200, 600, 300);
        this.game.audioHandler.mapSoundtrack.fadeOutAndStop(battleThemeId);
        this.game.input.keys = [];
        this.game.audioHandler.enemySFX.stopAllSounds();

        onBeforeClear();

        for (const enemy of this.game.enemies) {
            if (!(enemy instanceof bossClass)) enemy.markedForDeletion = true;
        }

        setTimeout(() => {
            this.game.boss.talkToBoss = true;
            this.game.player.setToStandingOnce = true;
            this.game.boss.dialogueAfterOnce = true;
            this.game.boss.dialogueAfterLeaving = false;

            this.game.input.keys = [];
            this.game.collisions = [];
            this.game.behindPlayerParticles = [];

            this.x = this.game.width / 2 + 200;
            this.y = this.originalY;
            this.speedX = 0;
            this.speedY = 0;
            this.state = "idle";
            this.frameX = 0;
            this.frameY = 0;

            this.game.player.setState(8, 0);
            this.game.player.x = 1;
            this.game.player.y = this.game.height - this.game.player.height - this.game.groundMargin;
            this.game.player.vy = 0;
            this.game.player.vx = 0;
            this.game.player.isInvisible = false;
            this.game.player.invisibleTimer = this.game.player.invisibleCooldown;
            this.game.player.invisibleActiveCooldownTimer = 5000;

            onAfterSetup();
        }, 300);

        setTimeout(() => {
            this.game.boss.startAfterDialogueWhenAnimEnds = true;
            this.game.audioHandler.enemySFX.stopAllSounds();

            for (const enemy of this.game.enemies) {
                if (!(enemy instanceof bossClass)) enemy.markedForDeletion = true;
            }
        }, 1200);
    }
}

export class Barrier extends Enemy {
    constructor(
        game,
        x,
        y,
        width,
        height,
        images,
        lives,
        {
            owner = null,
            followOwner = false,
            dealsDirectHitDamage = true,
            autoRemoveOnZeroLives = true,
            sounds = null,
            clipWithOwnerBurrow = false,
        } = {}
    ) {
        super();

        this.game = game;
        this.owner = owner;

        this.width = width;
        this.height = height;

        this.x = x;
        this.y = y;

        this.images = images;
        this.lives = lives;

        this.image = document.getElementById(this.images[this.images.length - 1]);
        this.maxFrame = 0;

        this.setFps(0);
        this.frameX = 0;
        this.frameY = 0;

        this.followOwner = followOwner;

        this.dealsDirectHitDamage = dealsDirectHitDamage;

        this.autoRemoveOnZeroLives = autoRemoveOnZeroLives;

        this.markedForDeletion = false;

        this.sounds = sounds || null;

        this.clipWithOwnerBurrow = clipWithOwnerBurrow;

        this._prevLives = this.lives;
        this._breakSoundPlayed = false;
        this._crackPlayedForLives = new Set();

        if (this.sounds && this.sounds.spawnSound) {
            this._playBarrierSound(this.sounds.spawnSound);
        }
    }

    _playBarrierSound(soundId, loop = false) {
        if (!soundId) return;
        if (!this.game || !this.game.audioHandler || !this.game.audioHandler.enemySFX) return;
        this.game.audioHandler.enemySFX.playSound(soundId, loop, true);
    }

    _handleBarrierSoundTransitions() {
        if (!this.sounds) {
            this._prevLives = this.lives;
            return;
        }

        if (this.lives > this._prevLives) {
            this._crackPlayedForLives.clear();
            this._breakSoundPlayed = false;
        }

        if (this.lives < this._prevLives) {
            if (this.lives <= 0) {
                if (!this._breakSoundPlayed && this.sounds.breakSound) {
                    this._playBarrierSound(this.sounds.breakSound);
                    this._breakSoundPlayed = true;
                }
            } else {
                const crackMap = this.sounds.crackSoundsByLives || null;
                const soundId = crackMap ? crackMap[this.lives] : null;

                if (soundId && !this._crackPlayedForLives.has(this.lives)) {
                    this._playBarrierSound(soundId);
                    this._crackPlayedForLives.add(this.lives);
                }
            }
        }

        this._prevLives = this.lives;
    }

    update(deltaTime) {
        if (this.followOwner) {
            if (!this.owner || this.owner.markedForDeletion) {
                this.markedForDeletion = true;
                return;
            }

            const centerX = this.owner.x + this.owner.width / 2;
            const centerY = this.owner.y + this.owner.height / 2;

            this.x = centerX - this.width / 2;
            this.y = centerY - this.height / 2;
        }

        this._handleBarrierSoundTransitions();

        if (this.autoRemoveOnZeroLives && this.lives <= 0) {
            this.markedForDeletion = true;
            return;
        }

        this.advanceFrame(deltaTime);
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        const owner = this.owner;
        const shouldClip =
            this.clipWithOwnerBurrow &&
            owner &&
            owner.state === "burrow";

        if (shouldClip) {
            const groundY =
                (owner.burrow && owner.burrow.groundY != null)
                    ? owner.burrow.groundY
                    : (owner.originalY + owner.height);

            context.save();
            context.beginPath();
            context.rect(0, 0, owner.game.width, groundY);
            context.clip();
        }

        const imageIndex = Math.max(0, Math.min(this.lives - 1, this.images.length - 1));
        const imageName = this.images[imageIndex];

        const img = document.getElementById(imageName);
        this.image = img;

        context.drawImage(
            img,
            this.frameX * this.width,
            0,
            this.width,
            this.height,
            this.x,
            this.y,
            this.width,
            this.height
        );

        if (shouldClip) context.restore();
    }
}
