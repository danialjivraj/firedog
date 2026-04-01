import { fadeInAndOut } from "../../animations/fading.js";

// helpers
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const angleTo = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);
const moveAlongAngle = (obj, angle, speed) => {
    obj.x += Math.cos(angle) * speed;
    obj.y += Math.sin(angle) * speed;
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const withCtx = (ctx, fn) => {
    ctx.save();
    try {
        fn();
    } finally {
        ctx.restore();
    }
};
const drawSprite = (ctx, image, sx, sy, sw, sh, dx, dy, dw, dh) =>
    ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
const setShadow = (ctx, color = 'transparent', blur = 0) => {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
};
const getImg = (id) => document.getElementById(id);

// Enemy ---------------------------------------------------------------------------------------------------------------------------
export class Enemy {
    constructor() {
        this.frameX = 0;
        this.frameY = 0;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.markedForDeletion = false;
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
        if (!this.game.cabin.isFullyVisible) {
            this.x -= this.speedX + this.game.speed;
            this.y += this.speedY;
        } else if (this.game.cabin.isFullyVisible && !(this instanceof MovingGroundEnemy)) {
            this.x -= this.speedX;
            this.y -= this.speedY;
        }

        this.advanceFrame(deltaTime);

        const offLeft = this.x + this.width < 0;
        const offBottom = this.autoRemoveOffBottom && (this.y > this.game.height);
        const offTop = this.autoRemoveOffTop && (this.y + this.height < 0);
        const dead = this.autoRemoveOnZeroLives && this.lives <= 0;

        if (offLeft || offBottom || offTop || dead) {
            this.markedForDeletion = true;
            this.game.audioHandler.enemySFX.playSound(this.soundId, false, true, true);
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

// EnemyBoss
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

        if (this.runAnimation) {
            this.runAnimation.x = this.x;
            this.runAnimation.y = this.y;
            this.runAnimation.update(deltaTime);
        }

        this.x += this.runningDirection;
        this.game.background.totalDistanceTraveled = this.game.maxDistance - 6;

        if (this.x > this.game.width) {
            if (this.game.boss.current === this && this.game.boss.id === bossId) {
                this.game.boss.isVisible = false;
                this.game.boss.talkToBoss = false;
                this.game.boss.runAway = false;
                this.game.boss.current = null;
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
        if (this.game && typeof this.game.onBossDefeated === "function") {
            this.game.onBossDefeated(bossId);
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

            this.x = this.game.width / 2;
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

// Types of enemies ---------------------------------------------------------------------------------------------------------------------------
export class FlyingEnemy extends Enemy {
    constructor(game, width, height, maxFrame, imageId) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        this.y = Math.random() * this.game.height * 0.4 + 100;
        this.speedX = Math.random() + 1;
        this.speedY = 0;
        this.maxFrame = maxFrame;
        this.image = getImg(imageId);
        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.angle += this.va;
        this.y += Math.sin(this.angle);
    }
}

export class GroundEnemy extends Enemy {
    constructor(game, width, height, maxFrame, imageId) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = this.game.width;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.image = getImg(imageId);
        this.speedX = 0;
        this.speedY = 0;
        this.maxFrame = maxFrame;
    }
}
export class MovingGroundEnemy extends GroundEnemy {
    constructor(game, w, h, m, id) {
        super(game, w, h, m, id);
    }
}
export class ImmobileGroundEnemy extends GroundEnemy {
    constructor(game, w, h, m, id) {
        super(game, w, h, m, id);
    }
}

export class ClimbingEnemy extends Enemy {
    constructor(game, width, height, maxFrame, imageId) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = this.game.width;
        this.y = Math.random() * this.game.height * 0.5;
        this.image = getImg(imageId);
        this.speedX = 0;
        this.speedY = Math.random() > 0.5 ? 1 : -1;
        this.maxFrame = maxFrame;
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.y > this.game.height - this.height - this.game.groundMargin) this.speedY *= -1;
        if (this.y < -this.height) this.markedForDeletion = true;
    }
    draw(context) {
        context.beginPath();
        context.moveTo(this.x + this.width / 2, 0);
        context.lineTo(this.x + this.width / 2, this.y + 60);
        context.stroke();
        super.draw(context);
    }
}

export class VerticalEnemy extends Enemy {
    constructor(game, width, height, maxFrame, imageId) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = this.game.width * 0.5 + Math.random() * this.game.width * 0.5;
        this.y = 0 - this.height;
        this.speedX = 0;
        this.speedY = Math.random() + 1;
        this.maxFrame = maxFrame;
        this.image = getImg(imageId);
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.speedY;
    }
}

export class FallingEnemy extends Enemy {
    constructor(game, width, height, maxFrame, imageId) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = this.game.player.x + Math.random() * (this.game.width - this.game.player.x);
        this.y = -this.height;
        this.image = getImg(imageId);
        this.speedX = 0;
        this.speedY = Math.random() * 2 + 0.5;
        this.maxFrame = maxFrame;
    }
}

export class UnderwaterEnemy extends Enemy {
    constructor(game, width, height, maxFrame, imageId) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        this.y = Math.random() * this.game.height * 0.5;
        this.speedX = Math.random() + 1;
        this.speedY = 0;
        this.maxFrame = maxFrame;
        this.image = getImg(imageId);
        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.angle += this.va;
        this.y += Math.sin(this.angle);
    }
}

export class BeeInstances extends FlyingEnemy {
    constructor(game, width, height, maxFrame, imageName, chaseDistance, initialSpeed, speed, fps) {
        super(game, width, height, maxFrame, imageName);
        this.width = width;
        this.height = height;
        this.maxFrame = maxFrame;
        this.chaseDistance = chaseDistance;
        this.initialSpeed = initialSpeed;
        this.currentSpeed = this.initialSpeed;
        this.passedPlayer = false;
        this.speed = speed;
        this.setFps(fps);
        this.isStunEnemy = true;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const distanceToPlayer = this.getDistanceToPlayer();

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                const a = this.getAngleToPlayer();
                this.angleToPlayer = a;
                moveAlongAngle(this, a, this.speed);
            } else {
                this.x -= this.currentSpeed;
            }
        } else {
            moveAlongAngle(this, this.angleToPlayer, this.speed);
        }

        if (this.x < this.game.player.x) this.passedPlayer = true;
    }

    moveTowardsPlayer() {
        const a = this.getAngleToPlayer();
        moveAlongAngle(this, a, this.speed);
    }
}

export class BurrowingGroundEnemy extends ImmobileGroundEnemy {
    constructor(game, width, height, maxFrame, imageId, centerX, options = {}) {
        super(game, width, height, maxFrame, imageId);

        const {
            baseWarningDuration = 1500,
            baseRiseDuration = 550,
            baseHoldDuration = 350,
            baseRetractDuration = 750,
            warningJitter = { warning: 300, rise: 150, hold: 120, retract: 200 },
            cyclesMax = 1,
            moveBetweenCycles = false,
            randomiseDurations = true,
            soundIds = {},
        } = options;

        this.flipHorizontal = Math.random() < 0.5;

        const halfW = this.width * 0.5;
        const clampedCenterX = clamp(centerX, halfW, this.game.width - halfW);
        this.centerX = clampedCenterX;
        this.x = clampedCenterX - halfW;

        const groundBottom = this.game.height - this.game.groundMargin;
        this.groundBottom = groundBottom;

        this.visibleY = groundBottom - this.height;
        this.hiddenY = this.game.height + this.height;
        this.y = this.hiddenY;

        this.speedX = 0;
        this.speedY = 0;

        this.baseWarningDuration = baseWarningDuration;
        this.baseRiseDuration = baseRiseDuration;
        this.baseHoldDuration = baseHoldDuration;
        this.baseRetractDuration = baseRetractDuration;

        this.warningJitter = warningJitter;
        this.randomiseDurationsFlag = randomiseDurations;

        this.cyclesDone = 0;
        this.cyclesMax = cyclesMax;
        this.moveBetweenCycles = moveBetweenCycles;

        this.phase = "warning";
        this.timer = 0;

        this.soundIds = soundIds;

        if (this.randomiseDurationsFlag) {
            this.randomiseDurations();
        } else {
            this.warningDuration = this.baseWarningDuration;
            this.riseDuration = this.baseRiseDuration;
            this.holdDuration = this.baseHoldDuration;
            this.retractDuration = this.baseRetractDuration;
        }
    }

    jitter(base, spread) {
        return base + (Math.random() * 2 - 1) * spread;
    }

    randomiseDurations() {
        const j = this.warningJitter || {};
        const wSpread = j.warning ?? 300;
        const rSpread = j.rise ?? 150;
        const hSpread = j.hold ?? 120;
        const reSpread = j.retract ?? 200;

        this.warningDuration = Math.max(0, this.jitter(this.baseWarningDuration, wSpread));
        this.riseDuration = Math.max(0, this.jitter(this.baseRiseDuration, rSpread));
        this.holdDuration = Math.max(0, this.jitter(this.baseHoldDuration, hSpread));
        this.retractDuration = Math.max(0, this.jitter(this.baseRetractDuration, reSpread));
    }

    pickNewGroundPosition() {
        if (!this.moveBetweenCycles) return;

        const halfW = this.width * 0.5;
        const minCenter = halfW;
        const maxCenter = this.game.width - halfW;

        const others = this.game.enemies.filter(
            (e) => e instanceof this.constructor && e !== this && !e.markedForDeletion
        );

        const minGap = this.width + 4;

        let centerX = this.centerX;
        const maxAttempts = 20;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            let candidate;

            if (Math.random() < 0.5) {
                const playerCenterX =
                    this.game.player.x + this.game.player.width / 2;
                const spread = 260;
                candidate =
                    playerCenterX + (Math.random() * spread - spread / 2);
            } else {
                candidate = Math.random() * this.game.width;
            }

            candidate = clamp(candidate, minCenter, maxCenter);

            let ok = true;
            for (const other of others) {
                if (Math.abs(candidate - other.centerX) < minGap) {
                    ok = false;
                    break;
                }
            }

            centerX = candidate;
            if (ok) break;
        }

        this.centerX = centerX;
        this.x = centerX - halfW;
    }

    startNewCycle() {
        if (this.randomiseDurationsFlag) this.randomiseDurations();
        this.pickNewGroundPosition();
        this.y = this.hiddenY;
        this.timer = 0;
        this.phase = "warning";
        this.onCycleStart();
    }

    onCycleStart() { }

    onEmergeStart() {
        const id = this.soundIds?.emerge;
        if (id && this.game.audioHandler.enemySFX) {
            this.game.audioHandler.enemySFX.playSound(id, false, true);
        }
    }

    onEmergeUpdate(_t, _deltaTime) { }
    onEmergeComplete() { }

    onHoldComplete() { }

    onRetractStart() {
        const id = this.soundIds?.retract;
        if (id && this.game.audioHandler?.enemySFX) {
            this.game.audioHandler.enemySFX.playSound(id, false, true);
        }
    }

    onRetractUpdate(_t, _deltaTime) { }
    onRetractComplete() { }
    onDone() { }

    update(deltaTime) {
        this.timer += deltaTime;

        if (this.phase === "warning") {
            if (this.timer >= this.warningDuration) {
                this.flipHorizontal = Math.random() < 0.5;

                this.phase = "emerge";
                this.timer = 0;
                this.y = this.hiddenY;

                this.onEmergeStart();
            }
        } else if (this.phase === "emerge") {
            const t = this.riseDuration > 0 ? Math.min(1, this.timer / this.riseDuration) : 1;
            this.y = this.hiddenY - (this.hiddenY - this.visibleY) * t;

            this.onEmergeUpdate(t, deltaTime);

            if (t >= 1) {
                this.y = this.visibleY;
                this.timer = 0;
                this.phase = this.holdDuration > 0 ? "hold" : "retract";
                this.onEmergeComplete();
            }
        } else if (this.phase === "hold") {
            if (this.timer >= this.holdDuration) {
                this.timer = 0;
                this.phase = "retract";
                this.onHoldComplete();
                this.onRetractStart();
            }
        } else if (this.phase === "retract") {
            const t = this.retractDuration > 0 ? Math.min(1, this.timer / this.retractDuration) : 1;
            this.y = this.visibleY + (this.hiddenY - this.visibleY) * t;

            this.onRetractUpdate(t, deltaTime);

            if (t >= 1) {
                this.y = this.hiddenY;
                this.cyclesDone++;

                if (this.cyclesDone >= this.cyclesMax) {
                    this.phase = "done";
                    this.timer = 0;
                    this.onRetractComplete();
                } else {
                    this.onRetractComplete();
                    this.startNewCycle();
                }
            }
        } else if (this.phase === "done") {
            this.markedForDeletion = true;
            this.onDone();
        }
    }

    drawWarning(context) {
        const groundBottom = this.groundBottom;
        const centerX = this.x + this.width * 0.5;

        const t = clamp(this.timer / this.warningDuration, 0, 1);

        const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 6);
        const baseIntensity = t;

        const globalAlpha = 0.5 + 0.5 * (baseIntensity * pulse);

        context.save();

        const glowWidth = this.width * 1.1;
        const glowHeight = 44;

        context.translate(centerX, groundBottom - 10);

        const innerAlpha = 0.75 + 0.25 * baseIntensity;
        const midAlpha = 0.5 + 0.35 * baseIntensity;

        const gradient = context.createRadialGradient(
            0, 0, 0,
            0, 0, glowWidth * 0.75
        );
        gradient.addColorStop(0, `rgba(255, 230, 230, ${innerAlpha})`);
        gradient.addColorStop(0.5, `rgba(255, 120, 120, ${midAlpha})`);
        gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

        context.fillStyle = gradient;
        context.globalAlpha = globalAlpha;

        const blurBase = 40;
        const blurExtra = 40 * baseIntensity;
        context.shadowColor = "rgba(255, 140, 140, 1)";
        context.shadowBlur = blurBase + blurExtra;

        context.beginPath();
        context.ellipse(
            0,
            0,
            glowWidth * 0.5,
            glowHeight * 0.5,
            0,
            0,
            Math.PI * 2
        );
        context.fill();

        const coreT = Math.min(1, t * 1.15);
        const coreScale = 0.35 + 0.65 * coreT;

        const coreRadiusX = glowWidth * coreScale * 0.5;
        const coreRadiusY = glowHeight * coreScale * 0.5;

        context.globalAlpha = 0.7 + 0.3 * baseIntensity;
        context.shadowBlur = 25 + 45 * baseIntensity;
        context.shadowColor = "rgba(255, 255, 255, 1)";

        context.beginPath();
        context.ellipse(
            0,
            0,
            coreRadiusX,
            coreRadiusY,
            0,
            0,
            Math.PI * 2
        );
        context.strokeStyle = `rgba(255, 255, 255, ${0.65 + 0.35 * pulse})`;
        context.lineWidth = 3 + 3 * baseIntensity;
        context.stroke();

        context.restore();
    }

    drawActivePhase(context) {
        const groundBottom = this.groundBottom;

        context.save();
        context.beginPath();
        context.rect(this.x, 0, this.width, groundBottom);
        context.clip();

        const drawW = this.width;
        const drawH = this.height;

        const cx = this.x + drawW / 2;
        const cy = this.y + drawH / 2;

        context.translate(cx, cy);
        context.scale(this.flipHorizontal ? -1 : 1, 1);

        this.applyGlow(context);
        context.drawImage(
            this.image,
            (this.frameX || 0) * this.width,
            0,
            this.width,
            this.height,
            -drawW / 2,
            -drawH / 2,
            drawW,
            drawH
        );
        this.clearGlow(context);

        context.restore();
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        if (this.phase === "warning") {
            this.drawWarning(context);
            return;
        }

        if (this.phase === "emerge" || this.phase === "hold" || this.phase === "retract") {
            this.drawActivePhase(context);
        }
    }
}

export class UndergroundEnemy extends BurrowingGroundEnemy {
    constructor(game, width, height, maxFrame, imageId, options = {}) {
        const halfW = width / 2;
        super(game, width, height, maxFrame, imageId, game.width + halfW, {
            baseWarningDuration: options.warningDuration ?? 1500,
            baseRiseDuration: options.riseDuration ?? 550,
            baseHoldDuration: options.holdDuration ?? 800,
            baseRetractDuration: options.retractDuration ?? 750,
            randomiseDurations: false,
            cyclesMax: 1,
            moveBetweenCycles: false,
            soundIds: options.soundIds ?? {},
        });

        this.centerX = game.width + halfW;
        this.x = game.width;
        this.y = this.hiddenY;

        this.triggerDistance = options.triggerDistance ?? 1000;
        this.phase = 'dormant';
        this.flipHorizontal = false;
    }

    onEmergeStart() {
        super.onEmergeStart();
        this.flipHorizontal = false;
    }

    update(deltaTime) {
        if (!this.game.cabin.isFullyVisible) {
            this.x -= this.game.speed;
            this.centerX -= this.game.speed;
        }

        if (this.autoRemoveOnZeroLives && this.lives <= 0) {
            this.markedForDeletion = true;
            return;
        }

        if (this.x + this.width < 0) {
            this.markedForDeletion = true;
            return;
        }

        if (this.phase === 'dormant') {
            const playerCenterX = this.game.player.x + this.game.player.width / 2;
            if (Math.abs(playerCenterX - this.centerX) <= this.triggerDistance) {
                this.phase = 'warning';
                this.timer = 0;
            }
            return;
        }

        super.update(deltaTime);

        if (this.phase === 'emerge' || this.phase === 'hold' || this.phase === 'retract') {
            this.advanceFrame(deltaTime);
        }
    }
}

// Projectiles --------------------------------------------------------------------------------------------------------------------------------
export class Projectile extends Enemy {
    constructor(game, x, y, width, height, maxFrame, imageId, speedX, fps) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.image = getImg(imageId);
        this.speedX = speedX;
        this.speedY = 0;
        this.maxFrame = maxFrame;
        this.setFps(fps);
        this.frameTimer = 0;
    }
    update(deltaTime) {
        super.update(deltaTime);
    }
}

export class WindAttack extends Projectile {
    constructor(game, x, y, speedX) {
        super(game, x, y, 105, 120, 5, 'windAttack', speedX, 20);
        this.player = game.player;
        this.loopingSoundId = 'tornadoAudio';
        this.drawScale = 0.1;
        this.growDuration = 400;
        this.growTimer = 0;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.speedX;

        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const distance = Math.hypot(dx, dy);
        const dirX = dx / distance;

        this.x += dirX * this.speedX;

        const pushbackDistance = 50;
        const playerPushbackX = this.player.x - dirX * pushbackDistance;
        this.player.x += (playerPushbackX - this.player.x) * 0.04;

        if (this.drawScale < 1) {
            this.growTimer += deltaTime;
            this.drawScale = Math.min(1, this.growTimer / this.growDuration);
        }

        if (!(this.x + this.width < 0 || this.y > this.game.height || this.lives <= 0)) {
            this.game.audioHandler.enemySFX.playSound('tornadoAudio');
        }
    }
    draw(context) {
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.scale(this.drawScale, this.drawScale);
            drawSprite(context, this.image, this.frameX * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
        });
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class InkBeam extends Projectile {
    constructor(game, x, y, speedX = 10, speedY = 0) {
        super(game, x, y, 77, 34, 2, 'inkBeam', speedX, 10);
        this.speedY = speedY;
    }

    draw(ctx) {
        const angle = Math.atan2(this.speedY, this.speedX);

        if (this.game.debug) ctx.strokeRect(this.x, this.y, this.width, this.height);

        withCtx(ctx, () => {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

            ctx.scale(1, -1);

            ctx.rotate(angle);

            drawSprite(
                ctx,
                this.image,
                this.frameX * this.width, 0, this.width, this.height,
                -this.width / 2, -this.height / 2, this.width, this.height
            );
        });
    }
}

export class LeafAttack extends Projectile {
    constructor(game, x, y, imageId, speedX, rotationAngle) {
        super(game, x, y, 35.416, 45, 11, imageId, speedX, 30);
        this.rotation = 0;
        this.rotationAngle = rotationAngle;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.rotation += deltaTime * this.rotationAngle;
    }
    draw(context) {
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.rotate(this.rotation);
            drawSprite(
                context, this.image, this.frameX * this.width, 0, this.width, this.height,
                -this.width / 2, -this.height / 2, this.width, this.height
            );
        });
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class PoisonSpit extends Projectile {
    constructor(game, x, y) {
        super(game, x, y, 59, 22, 11, 'poison_spit', 18, 30);
        this.isPoisonEnemy = true;
    }
}

export class PoisonousOrb extends Projectile {
    constructor(game, x, y, angle) {
        super(game, x, y, 48.625, 50, 3, 'poisonousOrb', 0, 30);
        this.isPoisonEnemy = true;
        this.angle = angle;
        this.orbSpeed = 5;
        this.rotation = 0;
        this.rotationSpeed = 0.1;
        this.drawScale = 0.1;
        this.scaleSpeed = 0.04;
    }
    advanceFrame(deltaTime) {
        if (this.frameX >= this.maxFrame) return;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = Math.min(this.frameX + 1, this.maxFrame);
        } else {
            this.frameTimer += deltaTime;
        }
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x += Math.cos(this.angle) * this.orbSpeed;
        this.y += Math.sin(this.angle) * this.orbSpeed;
        this.rotation += this.rotationSpeed;
        if (this.drawScale < 1) this.drawScale = Math.min(1, this.drawScale + this.scaleSpeed);
    }
    draw(context) {
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.rotate(this.rotation);
            context.scale(this.drawScale, this.drawScale);
            setShadow(context, 'green', 20);
            drawSprite(context, this.image, this.frameX * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
            setShadow(context, 'transparent', 0);
        });
    }
}

export class ScorpionPoison extends Projectile {
    constructor(game, x, y) {
        super(game, x, y, 50, 50, 0, null, 9, 0);
        this.isPoisonEnemy = true;
        this.r = 25;
        this.age = 0;
        this.growDuration = 300;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.velY = 1.0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.age += deltaTime;
        this.y += this.velY;
    }

    draw(context) {
        context.save();
        const growScale = Math.min(this.age / this.growDuration, 1);
        const pulse = 0.9 + 0.1 * Math.sin(this.age * 0.01 + this.pulsePhase);
        const cx = this.x + this.r;
        const cy = this.y + this.r;
        const r = this.r * growScale * pulse;

        this.applyGlow(context);

        context.translate(cx, cy);
        context.rotate(Math.atan2(this.velY, -9) - Math.PI);
        context.scale(-1, 1);

        context.beginPath();
        context.moveTo(-r * 1.5, 0);
        context.bezierCurveTo(-r * 0.4, -r, r, -r * 0.9, r, 0);
        context.bezierCurveTo(r, r * 0.9, -r * 0.4, r, -r * 1.5, 0);
        context.closePath();

        const grad = context.createRadialGradient(r * 0.2, 0, 0, 0, 0, r * 1.4);
        grad.addColorStop(0, 'rgba(200, 255, 60, 1)');
        grad.addColorStop(0.35, 'rgba(255, 130, 20, 0.95)');
        grad.addColorStop(0.7, 'rgba(30, 140, 20, 0.95)');
        grad.addColorStop(1, 'rgba(10, 60, 5, 0.9)');
        context.fillStyle = grad;
        context.fill();

        context.restore();
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class LaserBeam extends Projectile {
    constructor(game, x, y) {
        super(game, x, y, 82, 48, 0, 'laser_beam', 30);
    }
}

export class FrozenShard extends Projectile {
    constructor(game, x, y, speedX) {
        super(game, x, y, 56, 26, 0, 'frozenShard', speedX, 20);
        this.isSlowEnemy = true;
    }
}

export class IceBall extends Projectile {
    constructor(game, x, y, speedY) {
        super(game, x, y, 35, 35, 0, 'iceBall', 7, speedY);
        this.isSlowEnemy = true;
        this.initialSize = 10;
        this.size = this.initialSize;
        this.maxSize = 35;
        this.growthRate = 1;
        this.x = x;
        this.y = y;
        this.speedY = speedY;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.04;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const sizeChange = this.size + this.growthRate > this.maxSize ? this.maxSize - this.size : this.growthRate;
        this.size += sizeChange;
        this.y -= sizeChange / 2;
        this.rotationAngle += this.rotationSpeed;
    }
    draw(context) {
        withCtx(context, () => {
            setShadow(context, 'blue', 10);
            context.translate(this.x + this.size / 2, this.y + this.size / 2);
            context.rotate(this.rotationAngle);
            if (this.game.debug) context.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
            drawSprite(context, this.image, 0, 0, this.size, this.size, -this.size / 2, -this.size / 2, this.size, this.size);
        });
    }
}

export class DarkLaser extends Projectile {
    constructor(game, x, y, speedY, direction) {
        super(game, x, y, 63, 40, 0, 'darkLaser', speedY);
        this.initialSize = 10;
        this.size = this.initialSize;
        this.x = x;
        this.y = y;
        this.speedX = 15;
        this.speedY = speedY;
        this.direction = direction;
    }
    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            let angle = Math.atan2(this.speedY, this.speedX);
            if (this.direction) {
                angle = Math.PI - angle;
                context.scale(1, 1);
            } else {
                context.scale(-1, 1);
            }
            context.rotate(angle);
            drawSprite(
                context, this.image, this.frameX * this.width, 0, this.width, this.height,
                -this.width / 2, -this.height / 2, this.width, this.height
            );
        });
    }
}

export class YellowBeam extends Projectile {
    constructor(game, x, y) {
        super(game, x, y, 53, 85, 0, 'yellowBeam');
        this.x = x;
        this.y = y;
        this.speedX = 0;
        this.speedY = -5;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.speedY;
    }
}

export class PurpleLaser extends Projectile {
    constructor(game, x, y, angle) {
        super(game, x, y, 82, 48, 0, 'purpleLaser', 0, 0);
        this.angle = angle;
        this.laserSpeed = 15;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x += Math.cos(this.angle) * this.laserSpeed;
        this.y += Math.sin(this.angle) * this.laserSpeed;
    }
    draw(context) {
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.rotate(this.angle);
            drawSprite(context, this.image, 0, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
        });
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class GlowOrb extends Projectile {
    constructor(game, x, y, size, outerColor, innerColor, angle, orbSpeed) {
        super(game, x, y, size, size, 0, null, 0, 60);
        this.outerColor = outerColor;
        this.innerColor = innerColor;
        this.angle = angle;
        this.orbSpeed = orbSpeed;
        this.pulseTimer = 0;
        this.growDuration = 0;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.pulseTimer += deltaTime;
        if (this.angle !== undefined) {
            this.x += Math.cos(this.angle) * this.orbSpeed;
            this.y += Math.sin(this.angle) * this.orbSpeed;
        }
    }
    draw(context) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const r = this.width / 2;
        const grow = this.growDuration > 0 ? Math.min(1, this.pulseTimer / this.growDuration) : 1;
        const pulse = 0.85 + 0.15 * Math.sin(this.pulseTimer * 0.01);
        withCtx(context, () => {
            context.shadowColor = this.outerColor;
            context.shadowBlur = 18;
            context.globalAlpha = 0.3;
            context.fillStyle = this.outerColor;
            context.beginPath();
            context.arc(cx, cy, r * 1.3 * pulse * grow, 0, Math.PI * 2);
            context.fill();

            context.globalAlpha = 1;
            context.shadowBlur = 10;
            context.fillStyle = this.innerColor;
            context.beginPath();
            context.arc(cx, cy, r * 0.55 * pulse * grow, 0, Math.PI * 2);
            context.fill();
        });
    }
}

export class CyanOrb extends GlowOrb {
    constructor(game, x, y, angle = undefined) {
        super(game, x, y, 40, '#00eaff', '#aaffff', angle, 8);
        this.isFrozenEnemy = true;
        this.speedX = 8;
        this.growDuration = 600;
    }
}

export class YellowOrb extends GlowOrb {
    constructor(game, x, y, angle) {
        super(game, x, y, 44, '#ffee00', '#ffffaa', angle, 6);
        this.isStunEnemy = true;
        this.growDuration = 400;
    }
}

export class RedOrb extends GlowOrb {
    constructor(game, x, y, angle) {
        super(game, x, y, 50, '#ff4444', '#ffaaaa', angle, 6);
        this.isRedEnemy = true;
        this.growDuration = 500;
    }
}

export class GreenOrb extends GlowOrb {
    constructor(game, x, y, angle) {
        super(game, x, y, 44, '#44ff88', '#003366', angle, 6);
        this.isPoisonEnemy = true;
        this.growDuration = 450;
    }
}

export class BlueOrb extends GlowOrb {
    constructor(game, x, y, angle) {
        super(game, x, y, 44, '#0044cc', '#aaccff', angle, 6);
        this.isSlowEnemy = true;
        this.growDuration = 450;
    }
}

export class LavaBall extends Projectile {
    constructor(game, x, y, speedX = 6, speedY = 0) {
        super(game, x, y, 40, 40, 7, 'lavaBall', speedX, 12);
        this.speedY = speedY;
        this.size = 8;
        this.width = this.size;
        this.height = this.size;
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.speedX < 0 && this.x > this.game.width) this.markedForDeletion = true;
        if (this.size < 40) {
            const grow = Math.min(2, 40 - this.size);
            this.x -= grow / 2;
            this.y -= grow / 2;
            this.size += grow;
            this.width = this.size;
            this.height = this.size;
        }
    }

    draw(context) {
        withCtx(context, () => {
            context.translate(this.x + this.size / 2, this.y + this.size / 2);
            if (this.speedX < 0) context.scale(-1, 1);
            drawSprite(context, this.image, this.frameX * 40, 0, 40, 40,
                -this.size / 2, -this.size / 2, this.size, this.size);
        });
        if (this.game.debug) context.strokeRect(this.x, this.y, this.size, this.size);
    }
}

// Goblin -------------------------------------------------------------------------------------------------------------------------------------
export class Goblin extends MovingGroundEnemy {
    constructor(game) {
        super(game, 60.083, 80, 11, 'goblinRun');
        this.lives = 1;
        this.dealsDirectHitDamage = false;
        this.loopingSoundId = 'goblinRunSound';

        this.walkFps = 60;
        this.attackFps = 60;
        this.jumpFps = 60;
        this.frameInterval = 1000 / this.walkFps;

        this.state = 'walk';

        this.attackAnimation = new MovingGroundEnemy(game, 60.083, 80, 11, 'goblinSteal');
        this.attackAnimation.setFps(this.attackFps);
        this.attackAnimation.frameX = 0;

        this.jumpAnimation = new MovingGroundEnemy(game, 60.083, 80, 11, 'goblinJump');
        this.jumpAnimation.setFps(this.jumpFps);
        this.jumpAnimation.frameX = 0;

        this.isJumping = false;
        this.hasJumped = false;
        this.jumpStartTime = 0;
        this.jumpDuration = 0.7;
        this.jumpHeight = 380;
        this.originalY = this.y;

        this.soundId = undefined;
    }

    update(deltaTime) {
        super.update(deltaTime);

        const playerDistance = Math.abs(this.game.player.x - this.x);
        const player = this.game.player;

        if (
            !this.hasJumped && !this.isJumping &&
            ((player.currentState === player.states[2]) ||
                ((player.currentState === player.states[4] || player.currentState === player.states[3]) && !player.onGround())) &&
            playerDistance < 300 &&
            player.x < this.x
        ) {
            this.isJumping = true;
            this.jumpStartTime = this.game.hiddenTime;
        }

        if (this.isJumping) {
            this.game.audioHandler.enemySFX.playSound('goblinJumpSound');
            const jumpProgress = (this.game.hiddenTime - this.jumpStartTime) / (this.jumpDuration * 1000);
            if (jumpProgress < 1) {
                this.y = this.originalY - this.jumpHeight * Math.sin(jumpProgress * Math.PI);
                this.x -= 3;
            } else {
                this.y = this.originalY;
                this.isJumping = false;
                this.hasJumped = true;
            }
        }

        if (this.state === 'jump') {
            this.jumpAnimation.update(deltaTime);
            this.x -= 3;
            if (this.jumpAnimation.frameX === 11) this.jumpAnimation.frameX = 5;

            if (
                this.x < player.x + this.width && this.x + this.width > player.x &&
                this.y < player.y + this.height && this.y + this.height > player.y &&
                !this.game.gameOver
            ) {
                this.state = 'attack';
                this.attackAnimation.x = this.x;
                this.attackAnimation.y = this.y;
                this.attackAnimation.frameX = 0;
            }
            if (this.hasJumped === true) {
                this.state = 'walk';
                this.frameX = 0;
            }
        }

        if (this.state === 'walk') {
            this.soundId = 'goblinRunSound';
            this.x -= 3;

            if (this.originalY !== this.y) {
                this.state = 'jump';
                this.jumpAnimation.x = this.x;
                this.jumpAnimation.y = this.y;
                this.jumpAnimation.frameX = 0;
            }

            if (
                this.x < player.x + this.width && this.x + this.width > player.x &&
                this.y < player.y + this.height && this.y + this.height > player.y &&
                !this.game.gameOver
            ) {
                this.state = 'attack';
                this.attackAnimation.x = this.x;
                this.attackAnimation.y = this.y;
                this.attackAnimation.frameX = 0;
            }
        } else if (this.state === 'attack') {
            this.attackAnimation.update(deltaTime);
            this.x -= 3;
            if (this.attackAnimation.frameX === 11) {
                this.state = 'walk';
                this.frameX = 0;
            }
        }

        if (this.game.gameOver && this.attackAnimation.frameX >= this.attackAnimation.maxFrame) {
            this.state = 'walk';
        }
    }

    draw(context) {
        if (this.state === 'walk') {
            super.draw(context);
        } else if (this.state === 'attack') {
            this.attackAnimation.x = this.x;
            this.attackAnimation.y = this.y;
            this.attackAnimation.draw(context);
        } else if (this.state === 'jump') {
            this.jumpAnimation.x = this.x;
            this.jumpAnimation.y = this.y;
            this.jumpAnimation.draw(context);
        }
    }
}

// Map 1 --------------------------------------------------------------------------------------------------------------------------------------
export class Dotter extends FlyingEnemy {
    constructor(game) {
        super(game, 60, 44, 5, 'dotter');
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.playSoundOnce('buzzingFly');
    }
}

export class Vertibat extends VerticalEnemy {
    constructor(game) {
        super(game, 151.16666666, 90, 5, 'vertibat');
        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;
        this.amplitude = 3;
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.speedY;
        this.x += this.speedX;
        this.x += this.amplitude * Math.sin(this.angle);
        this.angle += this.va;
        this.playSoundOnce('batPitch');
        if (this.frameX === 3 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('wooshBat');
    }
}

export class Geargle extends VerticalEnemy {
    constructor(game) {
        super(game, 64.5, 100, 1, 'geargle');
        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;
        this.amplitude = 3;
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.speedY;
        this.x += this.speedX;
        this.x += this.amplitude * Math.sin(this.angle);
        this.angle += this.va;
    }
}

export class Ghobat extends FlyingEnemy {
    constructor(game) {
        super(game, 134.33, 84, 5, 'ghobat');
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.frameX === 3 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('batFlapAudio');
    }
}

export class Ravengloom extends FlyingEnemy {
    constructor(game) {
        super(game, 139.66, 100, 5, 'ravengloom');
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.playSoundOnce('ravenCallAudio');
        if (this.frameX === 2 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('ravenSingleFlap');
    }
}

export class MeatSoldier extends MovingGroundEnemy {
    constructor(game) {
        super(game, 67.625, 80, 15, 'meatSoldier');
        this.setFps(60);
        this.xSpeed = Math.floor(Math.random() * 2) + 1;
        this.playSoundOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.playSoundOnce) {
            this.playSoundOnce = false;
            this.game.audioHandler.enemySFX.playSound('meatSoldierSound');
        }
        this.x -= this.xSpeed;
    }
}

export class Skulnap extends MovingGroundEnemy {
    constructor(game, scale = 1) {
        super(game, 104.23076923076923076923076923077 * scale, 70 * scale, 12, 'skulnap');
        this.isStunEnemy = true;
        this.y = this.game.height - this.height - this.game.groundMargin + 15;
        this.state = 'sleeping';
        this.scale = scale;

        this.sleepFrameX = 0;
        this.sleepFrameTimer = 0;

        this.soundId = undefined;
        this.loopingSoundId = 'fuseSound';
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.y >= this.game.height - this.height - this.game.groundMargin + 15) {
            this.y = this.game.height - this.height - this.game.groundMargin + 15;
        }

        if (this.state === 'sleeping') {
            this.game.audioHandler.enemySFX.playSound('fuseSound');
            const playerDistance = Math.abs(this.game.player.x - this.x);
            if (playerDistance < 900 && this.y >= this.game.height - this.height - this.game.groundMargin) {
                this.soundId = 'skeletonRattlingSound';
                this.loopingSoundId = 'skeletonRattlingSound';
                this.state = 'running';
                this.frameX = 0;
                this.runningSpeed = 3;
            }
        }

        if (this.state === 'running') {
            this.x -= this.runningSpeed;
            this.y = this.game.height - this.height - this.game.groundMargin + 5;
            this.advanceFrame(deltaTime);
        } else {
            if (this.sleepFrameTimer > this.frameInterval) {
                this.sleepFrameTimer = 0;
                this.sleepFrameX = this.sleepFrameX < 10 ? this.sleepFrameX + 1 : 0;
            } else {
                this.sleepFrameTimer += deltaTime;
            }
        }
    }

    draw(context) {
        const drawFromSheet = (srcY, frameX, srcW, srcH, x, y) => {
            withCtx(context, () => {
                context.translate(x, y);
                context.scale(this.scale, this.scale);
                context.translate(-x, -y);
                setShadow(context, 'yellow', 10);
                context.drawImage(this.image, frameX * srcW, srcY, srcW, srcH, x, y, srcW * this.scale, srcH * this.scale);
            });
        };

        if (this.state === 'running') {
            drawFromSheet(57, this.frameX, 104.23076923076923, 70, this.x, this.y);
        } else {
            drawFromSheet(0, this.sleepFrameX, 57, 57, this.x + 13, this.y);
        }
    }
}

export class Abyssaw extends FlyingEnemy {
    constructor(game) {
        super(game, 100.44, 100, 8, 'abyssaw');
        this.soundId = 'spinningChainsaw';
        this.loopingSoundId = 'spinningChainsaw';
        this.radius = Math.random() * 2 + 6;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= Math.cos(this.angle) * this.radius;
        this.y += Math.sin(this.angle) * this.radius;

        if (this.x + this.width < 0 || this.lives <= 0) {
            this.game.audioHandler.enemySFX.stopSound('spinningChainsaw');
        }
    }
}

export class GlidoSpike extends FlyingEnemy {
    constructor(game) {
        super(game, 191.68, 130, 24, 'glidoSpike');
        this.walkFps = 120;
        this.frameInterval = 1000 / this.walkFps;
        this.state = 'walk';

        this.attackFrameX = 0;
        this.attackFrameTimer = 0;
        this.attackMaxFrame = 24;
        this.attackFps = 120;

        this.canAttack = true;
        this.attackCooldown = 1000;
        this.attackCooldownDuration = 1000;
    }

    throwWindAttack() {
        this.game.enemies.push(new WindAttack(this.game, this.x + 50, this.y + 20, 2));
    }

    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);

        if (this.state === 'walk') {
            this.x -= 1;
            this.attackCooldown += deltaTime;
            if (playerDistance <= 1200 && this.frameX == 24 && this.attackCooldown >= this.attackCooldownDuration) {
                if (!this.game.gameOver) {
                    this.state = 'attack';
                    this.attackFrameX = 0;
                    this.attackFrameTimer = 0;
                    this.attackCooldown = 0;
                }
            }
        } else if (this.state === 'attack') {
            const attackInterval = 1000 / this.attackFps;
            if (this.attackFrameTimer > attackInterval) {
                this.attackFrameTimer = 0;
                if (this.attackFrameX < this.attackMaxFrame) this.attackFrameX++;
            } else {
                this.attackFrameTimer += deltaTime;
            }

            if (this.attackFrameX === 12 && this.canAttack === true) {
                this.throwWindAttack();
                this.game.audioHandler.enemySFX.playSound('windAttackAudio', false, true);
                this.canAttack = false;
            }
            if (this.attackFrameX === 24) {
                this.canAttack = true;
                this.state = 'walk';
                this.frameX = 0;
            }
            if (playerDistance > 1200 && this.attackFrameX >= this.attackMaxFrame) {
                this.state = 'walk';
            }
        }

        if (this.game.gameOver && this.attackFrameX >= this.attackMaxFrame) {
            this.state = 'walk';
        }
        if (this.frameX === 11 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('flyMonsterFlap');
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        if (this.state === 'walk') {
            drawSprite(context, this.image, this.frameX * 191.68, 0, 191.68, 130, this.x, this.y, this.width, this.height);
        } else if (this.state === 'attack') {
            drawSprite(context, this.image, this.attackFrameX * 191.68, 130, 191.68, 130, this.x, this.y, this.width, this.height);
        }
    }
}

// Map 2 --------------------------------------------------------------------------------------------------------------------------------------
export class DuskPlant extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 60, 87, 1, 'duskPlant');
        this.soundId = 'teethChatteringSound';
        this.lastLeafAttackTime = 4999;
    }

    throwLeaf() {
        this.game.enemies.push(new LeafAttack(
            this.game, this.x, this.y + this.height / 2 - 22.5,
            'darkLeafAttack', 5, 0.0002 + Math.random() * 0.0008
        ));
        this.game.audioHandler.enemySFX.playSound('leafAttackAudio');
        this.lastLeafAttackTime = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.lastLeafAttackTime += deltaTime;
        if (this.lastLeafAttackTime >= 5000 && this.x < this.game.width - this.width) {
            this.throwLeaf();
        }
    }
}

export class Skelly extends MovingGroundEnemy {
    constructor(game) {
        super(game, 57.5, 60, 11, 'skelly');
        this.setFps(60);
        this.isJumping = false;
        this.jumpStartTime = 0;
        this.jumpHeight = 240 + Math.random() * 40;
        this.jumpDuration = 0.5 + Math.random() * 0.1;
        this.horizontalSpeed = 10 + Math.random() * 2;
        this.groundY = this.game.height - this.height - this.game.groundMargin;
        this.jumpTimer = 1000;
        this.jumpInterval = 1000 + Math.random() * 500;
    }

    startJump() {
        this.isJumping = true;
        this.jumpStartTime = this.game.hiddenTime;
        this.groundY = this.game.height - this.height - this.game.groundMargin;
        this.jumpDir = -1;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (!this.isJumping) {
            this.jumpTimer += deltaTime;
            if (this.jumpTimer >= this.jumpInterval) {
                this.startJump();
                this.jumpTimer = 0;
            }
        }

        if (this.isJumping) {
            const progress = (this.game.hiddenTime - this.jumpStartTime) / (this.jumpDuration * 1000);
            if (progress < 1) {
                this.y = this.groundY - this.jumpHeight * Math.sin(progress * Math.PI);
                this.x += this.jumpDir * this.horizontalSpeed;
            } else {
                this.y = this.groundY;
                this.isJumping = false;
            }
        }
    }
}

export class Silknoir extends ClimbingEnemy {
    constructor(game) {
        super(game, 120, 144, 5, 'silknoir');
        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.09;
        this.soundId = 'nightSpiderSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.speedY * Math.sin(this.angle);
        this.angle += this.va;
    }
}

export class WalterTheGhost extends FlyingEnemy {
    constructor(game) {
        super(game, 104.83, 84, 5, 'walterTheGhost');
        this.curve = Math.random() * 5;
        this.playsOnce = true;
        this.currentSpeed = 6;
        this.chaseDistance = this.game.width;
        this.passedPlayer = false;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.va = Math.random() * 0.09 + 0.01;
        this.y += 1.5 * Math.sin(this.angle) * this.curve;
        this.angle += 0.005;

        const distanceToPlayer = this.getDistanceToPlayer();

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                const a = this.getAngleToPlayer();
                this.angleToPlayer = a;
                moveAlongAngle(this, a, this.currentSpeed);
            } else {
                this.x -= this.currentSpeed;
            }
        }

        if (this.x < this.game.player.x) this.passedPlayer = true;

        this.playIfOnScreen('ghostHmAudio');
    }

    moveTowardsPlayer() {
        const a = this.getAngleToPlayer();
        moveAlongAngle(this, a, this.currentSpeed);
    }

    draw(context) {
        withCtx(context, () => {
            context.globalAlpha = 0.3;
            super.draw(context);
        });
    }
}

export class Ben extends VerticalEnemy {
    constructor(game) {
        super(game, 61.5, 50, 5, 'ben');
        this.isPoisonEnemy = true;
        this.initialSpeed = 3;
        this.currentSpeed = 4;
        this.chaseDistance = this.game.width;
        this.loopingSoundId = 'verticalGhostSound';
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.playIfOnScreen('verticalGhostSound');

        const distanceToPlayer = this.getDistanceToPlayer();

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                const a = this.getAngleToPlayer();
                this.angleToPlayer = a;
                moveAlongAngle(this, a, this.currentSpeed);
            } else {
                this.x -= this.currentSpeed;
            }
        } else {
            moveAlongAngle(this, this.angleToPlayer, this.currentSpeed);
        }

        if (this.x < this.game.player.x) this.passedPlayer = true;
    }

    moveTowardsPlayer() {
        const a = this.getAngleToPlayer();
        moveAlongAngle(this, a, this.currentSpeed);
    }
}

export class Aura extends FlyingEnemy {
    constructor(game) {
        super(game, 52, 50, 0, 'aura');
        this.isStunEnemy = true;
        this.loopingSoundId = 'auraSoundEffect';
        this.currentSpeed = 5;
        this.chaseDistance = this.game.width;
        this.passedPlayer = false;
        this.angleToPlayerVal = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        const distanceToPlayer = this.getDistanceToPlayer();

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                this.angleToPlayerVal = this.getAngleToPlayer();
                moveAlongAngle(this, this.angleToPlayerVal, this.currentSpeed);
            } else {
                this.x -= this.currentSpeed;
            }
        } else {
            moveAlongAngle(this, this.angleToPlayerVal, this.currentSpeed);
        }

        if (this.x < this.game.player.x) this.passedPlayer = true;
    }

    draw(context) {
        withCtx(context, () => {
            context.globalAlpha = 0.5;
            super.draw(context);
        });
    }
}

export class Gloomlet extends FlyingEnemy {
    constructor(game) {
        super(game, 78, 75, 4, 'gloomlet');
        this.isRedEnemy = true;
        this.setFps(10);
        this.y = this.game.height * 0.5 + Math.random() * (this.game.height - 160 - this.game.height * 0.5);
        this.soundId = 'gloomletHumming';
    }
}

export class Dolly extends FlyingEnemy {
    constructor(game) {
        super(game, 88.2, 120, 29, 'dolly');
        this.auraTimer = 0;
        this.loopingSoundId = 'dollHumming';
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.game.audioHandler.enemySFX.playSound('dollHumming');
        this.game.audioHandler.enemySFX.playSound('auraSoundEffect', true);

        this.auraTimer += deltaTime;

        if (!this.game.gameOver && this.auraTimer >= 1000) {
            const aura = new Aura(this.game);
            aura.x = this.x + 20;
            aura.y = this.y + 70;
            if (this.x < this.game.width) this.game.enemies.push(aura);
            this.auraTimer = 0;
        }
    }

    draw(context) {
        withCtx(context, () => {
            context.globalAlpha = 0.5;
            super.draw(context);
        });
    }
}

// Map 3 --------------------------------------------------------------------------------------------------------------------------------------
export class Piranha extends UnderwaterEnemy {
    constructor(game) {
        super(game, 100, 70, 3, 'piranha');
        this.setFps(10);
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= 3;
        if (this.frameX === 1 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('crunchSound');
    }
}

export class Jellion extends UnderwaterEnemy {
    constructor(game) {
        super(game, 98.5, 120, 1, 'jellion');
        this.setFps(7);
        this.baseY = game.height * 0.5 - this.height * 0.5;
        this.y = this.baseY;
        this.amplitude = 180;
        this.sinAngle = Math.random() < 0.5 ? Math.PI / 2 : -Math.PI / 2;
        this.sinSpeed = 0.025;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= 3;
        this.y = this.baseY + this.amplitude * Math.sin(this.sinAngle);
        this.sinAngle += this.sinSpeed;
        if (this.frameX === 2 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('crunchSound');
    }
}

export class SkeletonFish extends UnderwaterEnemy {
    constructor(game) {
        super(game, 55, 39, 4, 'skeletonFish');
        this.chaseDistance = 900;
        this.currentSpeed = 3;
        this.passedPlayer = false;
        this.speed = 6;
        this.moveTowardsPlayerActive = false;
    }

    update(deltaTime) {
        super.update(deltaTime);

        const distanceToPlayer = this.getDistanceToPlayer();
        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                const a = this.getAngleToPlayer();
                this.angleToPlayer = a;
                this.moveTowardsPlayerActive = true;
                moveAlongAngle(this, a, this.speed);
            } else {
                this.x -= this.currentSpeed;
            }
        } else {
            moveAlongAngle(this, this.angleToPlayer, this.speed);
        }

        if (this.x < this.game.player.x) this.passedPlayer = true;

        if (this.frameX === 1 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('skeletonCrunshSound');
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            if (this.moveTowardsPlayerActive || this.passedPlayer) {
                context.rotate(this.angleToPlayer);
                if (this.moveTowardsPlayerActive) context.scale(-1, -1);
            }
            drawSprite(context, this.image, this.frameX * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
        });
    }
}

export class SpearFish extends MovingGroundEnemy {
    constructor(game) {
        super(game, 91.875, 110, 7, 'spearFish');
        this.isRedEnemy = true;
        this.lives = 2;
        this.setFps(60);
        this.loopingSoundId = 'stepWaterSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= 4;
        this.game.audioHandler.enemySFX.playSound('stepWaterSound');
    }
}

export class JetFish extends UnderwaterEnemy {
    constructor(game) {
        super(game, 124.5, 75, 3, 'jetFish');
        this.y = this.game.player.y;
        this.va = Math.random() * 0.001 + 0.1;
        this.setFps(60);
        this.loopingSoundId = 'rocketLauncherSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= 9;
        this.playIfOnScreen('rocketLauncherSound');
    }
}

export class Piper extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 87, 67, 2, 'piper');
        this.state = 'idle';
        this.lives = 2;
        this.setFps(14);
        this.playOnce = true;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);
        if (this.state !== 'extended' && (playerDistance < 100 || this.lives <= 1)) {
            this.state = 'extended';
            this.width = 82;
            this.height = 234;
            this.maxFrame = 10;
            this.frameX = 0;
            this.y = this.game.height - this.height - this.game.groundMargin;
        }

        if (this.state === 'extended') {
            if (this.playOnce) {
                this.playOnce = false;
                this.game.audioHandler.enemySFX.playSound('extendingSound', false, true);
            }
            if (this.frameX === 10) this.frameX = 9;
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        if (this.state === 'idle') {
            drawSprite(context, this.image, this.frameX * 87, 0, 87, 67, this.x, this.y, this.width, this.height);
        } else {
            drawSprite(context, this.image, this.frameX * 82, 67, 82, 234, this.x, this.y, this.width, this.height);
        }
    }
}

export class Voltzeel extends FallingEnemy {
    constructor(game) {
        super(game, 81, 100, 4, 'voltzeel');
        this.isStunEnemy = true;
        this.chaseDistance = 900;
        this.initialSpeed = 3;
        this.currentSpeed = this.initialSpeed;
        this.passedPlayer = false;
        this.speed = 4;
        this.moveTowardsPlayerActive = false;
        this.setFps(4);
    }

    update(deltaTime) {
        super.update(deltaTime);

        const distanceToPlayer = Math.abs(this.y - this.game.player.y);

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                const a = this.getAngleToPlayer();
                this.angleToPlayer = a;
                this.speedY = Math.sin(a) * this.speed;
                this.moveTowardsPlayerActive = true;
            } else {
                this.moveTowardsPlayerActive = false;
                this.y += this.currentSpeed;
            }
        }

        if (this.moveTowardsPlayerActive) this.y += this.speedY;
        if (this.x < this.game.player.x) this.passedPlayer = true;
        if (this.frameX === 4 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('electricitySound');
    }
}

export class Garry extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 165, 122, 3, 'garry');
        this.inkCooldown = 2000;
        this.inkTimer = this.inkCooldown;
    }

    throwInk() {
        const spawnX = this.x;
        const spawnY = this.y + 65;

        const player = this.game.player;
        const playerCenterX = player.x + (player.width || 0) / 2;
        const playerCenterY = player.y + (player.height || 0) / 2;
        const playerVelY = player.speedY || 0;

        const horizontalDist = Math.abs(playerCenterX - spawnX) || 1;

        const baseSpeedX = 11;

        let timeToTarget = horizontalDist / baseSpeedX;
        timeToTarget = clamp(timeToTarget, 0.35, 1.0);

        const predictedPlayerY = playerCenterY + playerVelY * timeToTarget;
        let dyPred = predictedPlayerY - spawnY;

        const leadFactor = 2.0;
        dyPred *= leadFactor;

        const angle = Math.atan2(dyPred, horizontalDist);

        let speedY = Math.sin(angle) * baseSpeedX;
        speedY = clamp(speedY, -20, 20);

        this.game.enemies.push(
            new InkBeam(this.game, spawnX, spawnY, baseSpeedX, speedY)
        );

        this.game.audioHandler.enemySFX.playSound('inkSpit', false, true);
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.isOnScreen()) {
            this.inkTimer += deltaTime;

            if (this.inkTimer >= this.inkCooldown) {
                this.throwInk();
                this.inkTimer = 0;
            }
        } else {
            this.inkTimer = this.inkCooldown;
        }
    }
}

// Map 4 --------------------------------------------------------------------------------------------------------------------------------------
export class BigGreener extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 113, 150, 1, 'bigGreener');
        this.isPoisonEnemy = true;
        this.lastLeafAttackTime = 4999;
        this.soundId = 'teethChatteringSound';
    }

    throwLeaf() {
        const spawnY = this.y + this.height / 2 - 22.5;
        this.game.enemies.push(new LeafAttack(this.game, this.x, spawnY, 'leafAttack', 5, 0.0002 + Math.random() * 0.0008));
        this.game.enemies.push(new LeafAttack(this.game, this.x, spawnY, 'leafAttack', 7.5, 0.0001 + Math.random() * 0.0089));
        this.game.audioHandler.enemySFX.playSound('leafAttackAudio');
        this.lastLeafAttackTime = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.lastLeafAttackTime += deltaTime;
        if (this.lastLeafAttackTime >= 5000 && this.x < this.game.width - this.width) {
            this.throwLeaf();
        }
    }
}

export class Chiquita extends FlyingEnemy {
    constructor(game) {
        super(game, 95.05882352941176, 68, 16, 'chiquita');
        this.setFps(120);
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.playSoundOnce('ravenCallAudio');
        if (this.frameX === 7 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('ravenSingleFlap');
    }
}

export class Fofinha extends FallingEnemy {
    constructor(game) {
        super(game, 118.82352941176470588235294117647, 85, 16, 'fofinha');
        this.x = game.width * 0.5 + Math.random() * game.width * 0.5;
        this.speedX = 2.5;
        this.speedY = 4;
        this.drawAngle = -0.6;
        this.setFps(120);
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.playSoundOnce('ravenCallAudio');
        if (this.frameX === 7 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('ravenSingleFlap');
    }
    draw(context) {
        const angle = this.drawAngle;
        this.applyGlow(context);
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.rotate(angle);
            drawSprite(context, this.image, this.frameX * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
        });
        this.clearGlow(context);
    }
}

export class Sluggie extends MovingGroundEnemy {
    constructor(game) {
        super(game, 147.33, 110, 5, 'sluggie');
        this.xSpeed = Math.floor(Math.random() * 5) + 1;
        this.soundId = 'slimyWalkSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class LilHornet extends FlyingEnemy {
    constructor(game) {
        super(game, 56, 47, 1, 'lilHornet');
        this.isStunEnemy = true;
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.playSoundOnce('buzzingFly');
    }
}

export class KarateCroco extends MovingGroundEnemy {
    constructor(game) {
        super(game, 98.25, 140, 3, 'karateCroco');
        this.isRedEnemy = true;
        this.state = 'idle';
        this.setFps(10);
        this.lives = 2;
        this.playsOnce = true;
        this.flykickFrameX = 0;
        this.flykickFrameTimer = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);
        if ((playerDistance < 1300 && this.y >= this.game.height - this.height - this.game.groundMargin) || this.lives <= 1) {
            this.state = 'flykick';
        }

        if (this.state === 'flykick') {
            this.playSoundOnce('ahhhSound', false, true);
            this.x -= 14;
            if (this.flykickFrameX < 3) {
                if (this.flykickFrameTimer > this.frameInterval / 2) {
                    this.flykickFrameTimer = 0;
                    this.flykickFrameX++;
                } else {
                    this.flykickFrameTimer += deltaTime;
                }
            }
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        withCtx(context, () => {
            setShadow(context, 'red', 10);
            if (this.state === 'idle') {
                drawSprite(context, this.image, this.frameX * 98.25, 0, 98.25, 140, this.x, this.y, this.width, this.height);
            } else {
                drawSprite(context, this.image, this.flykickFrameX * 146, 140, 146, 140, this.x, this.y, 146, 140);
            }
        });
    }
}

export class Vinelash extends UndergroundEnemy {
    constructor(game) {
        super(game, 221, 200, 1, 'vinelash', {
            warningDuration: 800,
            riseDuration: 500,
            holdDuration: 3000,
            triggerDistance: 1000
        });
        this.isPoisonEnemy = true;
        this.lives = 2;
        this.setFps(12);
    }
}

export class SpidoLazer extends MovingGroundEnemy {
    static STATES = {
        walk: {
            width: 134.4210526315789,
            height: 120,
            maxFrame: 18,
            fps: 260,
            srcY: 0,
            xOffset: 0,
            yOffset: 0,
        },
        attack: {
            width: 134.45,
            height: 120,
            maxFrame: 59,
            fps: 120,
            srcY: 120,
            xOffset: 0,
            yOffset: 0,
        },
    };

    constructor(game) {
        const { width, height, maxFrame } = SpidoLazer.STATES.walk;
        super(game, width, height, maxFrame, 'spidoLazer');

        this.game = game;
        this.lives = 2;
        this.state = 'walk';
        this.canAttack = true;
        this.loopingSoundId = 'spidoLazerWalking';

        this.applyState('walk');
    }

    applyState(newState) {
        const cfg = SpidoLazer.STATES[newState];
        if (!cfg) return;

        this.state = newState;

        this.width = cfg.width;
        this.height = cfg.height;
        this.maxFrame = cfg.maxFrame;
        this.setFps(cfg.fps);
        this.frameX = 0;

        const groundY = this.game.height - this.height - this.game.groundMargin;
        this.y = groundY + cfg.yOffset;
        this.x += cfg.xOffset;
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        const srcY = SpidoLazer.STATES[this.state]?.srcY ?? 0;
        drawSprite(context, this.image, this.frameX * this.width, srcY, this.width, this.height, this.x, this.y, this.width, this.height);
    }

    throwLaserBeam() {
        this.game.enemies.push(new LaserBeam(this.game, this.x - 40, this.y - 15 + this.height / 2 - 16));
    }

    update(deltaTime) {
        super.update(deltaTime);

        const player = this.game.player;
        const playerDistance = Math.abs(player.x - this.x);

        if (this.state === 'walk') {
            this.x -= 2;

            if (
                playerDistance <= 1600 &&
                this.frameX === this.maxFrame &&
                player.x <= this.x &&
                !this.game.gameOver
            ) {
                this.applyState('attack');
            }

            if ((this.frameX === 0 || this.frameX === 9) && this.isOnScreen()) {
                this.game.audioHandler.enemySFX.playSound('spidoLazerWalking');
            }

        } else if (this.state === 'attack') {
            const hasPassedPlayer = player.x > this.x;

            if (this.frameX === 27 && this.canAttack) {
                this.throwLaserBeam();
                this.game.audioHandler.enemySFX.playSound('laserAttackAudio', false, true);
                this.canAttack = false;
            }

            if (this.frameX >= this.maxFrame) {
                this.canAttack = true;

                if (hasPassedPlayer || this.game.gameOver) {
                    this.applyState('walk');
                }
            }
        }
    }
}

export class Jerry extends FlyingEnemy {
    constructor(game) {
        super(game, 185, 103, 4, 'jerry');
        this.y = Math.random() * this.game.height * 0.05;
        this.setFps(5);
        this.maxFrameReached = false;
        this.skeletonCount = 0;
        this.skeletonLimit = false;
        this.soundId = 'kiteSound';
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.game.gameOver || this.skeletonLimit) {
            this.maxFrame = 2;
        }

        if (this.frameX === this.maxFrame && !this.maxFrameReached && !this.game.gameOver) {
            this.maxFrameReached = true;

            if (this.skeletonCount < 5) {
                const skulnap = new Skulnap(this.game, 0.89);
                skulnap.x = this.x + 60;
                skulnap.y = this.y + 60;
                skulnap.speedY = 10;
                if (this.x < this.game.width - 50) {
                    this.game.enemies.push(skulnap);
                    this.game.audioHandler.enemySFX.playSound('throwingBombSound');
                    this.skeletonCount++;
                    if (this.skeletonCount >= 5) this.skeletonLimit = true;
                }
            }
        }

        if (this.frameX === 1) this.maxFrameReached = false;

        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else {
            this.frameTimer += deltaTime;
        }
    }
}

// Map 5 --------------------------------------------------------------------------------------------------------------------------------------
export class Snailey extends MovingGroundEnemy {
    constructor(game) {
        super(game, 103, 74, 9, 'snailey');
        this.xSpeed = Math.floor(Math.random() * 5) + 1;
        this.soundId = 'slimyWalkSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class RedFlyer extends FlyingEnemy {
    constructor(game) {
        super(game, 79.333333333333333333333333333333, 65, 14, 'redFlyer');
        this.playsOnce = true;
        this.darkLaserTimer = 2800;
    }

    throwDarkLaserAttack() {
        const playerCenterY = this.game.player.y + this.game.player.height / 2;
        const elyvorgCenterY = this.y + this.height / 2;
        const deltaY = playerCenterY - elyvorgCenterY;
        const angle = Math.atan2(deltaY, Math.abs(this.game.player.x - this.x));
        const verticalSpeed = Math.sin(angle) * 19;

        const arrow = new DarkLaser(this.game, this.x - 10, this.y + 15, verticalSpeed);
        this.game.enemies.push(arrow);
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.game.background.isRaining) {
            this.darkLaserTimer += deltaTime;
            if (!this.game.gameOver && this.x >= this.game.player.x) {
                if (this.darkLaserTimer >= 3000 && this.x + this.width < this.game.width) {
                    this.throwDarkLaserAttack();
                    this.game.audioHandler.enemySFX.playSound('staticSound', false, true);
                    this.darkLaserTimer = 0;
                }
            }
        }
        this.playSoundOnce('buzzingFly');
    }
}

export class PurpleFlyer extends FlyingEnemy {
    constructor(game) {
        super(game, 83.333333333333333333333333333333, 65, 14, 'purpleFlyer');
        this.playsOnce = true;
        this.iceballTimer = 200;
    }

    throwIceBallAttack() {
        const playerCenterY = this.game.player.y + this.game.player.height / 2;
        const elyvorgCenterY = this.y + this.height / 2;
        const deltaY = playerCenterY - elyvorgCenterY;
        const angle = Math.atan2(deltaY, Math.abs(this.game.player.x - this.x));
        const verticalSpeed = Math.sin(angle) * 10;

        const fireball = new IceBall(this.game, this.x + 5, this.y + this.height / 2 + 10, verticalSpeed);
        this.game.enemies.push(fireball);
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.playSoundOnce('buzzingFly');

        if (this.game.background.isRaining) {
            this.iceballTimer += deltaTime;
            if (!this.game.gameOver && this.x >= this.game.player.x) {
                if (this.iceballTimer >= 2000 && this.x + this.width < this.game.width) {
                    this.throwIceBallAttack();
                    this.game.audioHandler.enemySFX.playSound('iceballThrowSound', false, true);
                    this.iceballTimer = 0;
                }
            }
        }
    }
}

export class LazyMosquito extends FlyingEnemy {
    constructor(game) {
        super(game, 67.230769230769230769230769230769, 50, 12, 'lazyMosquito');
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.playSoundOnce('buzzingFly');
    }
}

export class LeafSlug extends MovingGroundEnemy {
    constructor(game) {
        super(game, 89, 84, 2, 'leafSlug');
        this.setFps(12);
        this.xSpeed = Math.floor(Math.random() * 3) + 1;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class Sunflora extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 132, 137, 3, 'sunflora');
        this.lives = 2;
        this.setFps(15);
        this.yellowBeamTimer = 350;
    }
    throwYellowBeamAttack() {
        this.game.enemies.push(new YellowBeam(this.game, this.x + 38, this.y - 45));
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.game.background.isRaining) {
            this.yellowBeamTimer += deltaTime;
            if (!this.game.gameOver) {
                if (this.yellowBeamTimer >= 350 && this.x + this.width / 2 < this.game.width) {
                    this.throwYellowBeamAttack();
                    this.game.audioHandler.enemySFX.playSound('yellowLaserBeamSound', false, true);
                    this.yellowBeamTimer = 0;
                }
            }
        }
    }
}

export class Eggry extends ImmobileGroundEnemy {
    constructor(game, jumpStyle = 'smart') {
        super(game, 102.6923076923077, 100, 38, 'eggry');
        this.setFps(30);

        this.jumpStyle = jumpStyle;

        this.isJumping = false;
        this.jumpStartTime = 0;
        this.jumpDir = 0;
        this.groundY = this.game.height - this.height - this.game.groundMargin;
        this.y = this.groundY;
        this.jumpedThisCycle = false;

        if (this.jumpStyle === 'low') {
            this.jumpHeight = 140 + Math.random() * 20;
            this.jumpDuration = 0.52 + Math.random() * 0.06;
            this.horizontalSpeed = 6.5 + Math.random() * 1.2;
        } else {
            this.jumpHeight = 260 + Math.random() * 60;
            this.jumpDuration = 0.55 + Math.random() * 0.1;
            this.baseHorizontalSpeed = 7 + Math.random() * 2;
            this.horizontalSpeed = this.baseHorizontalSpeed;


        }
    }

    startJump() {
        this.isJumping = true;
        this.jumpStartTime = this.game.hiddenTime;
        this.groundY = this.game.height - this.height - this.game.groundMargin;

        this.jumpDir = -1;
        if (this.jumpStyle === 'smart') this.horizontalSpeed = this.baseHorizontalSpeed;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.frameX < 9) this.jumpedThisCycle = false;

        if (this.game.background.isRaining) {
            if (!this.isJumping && !this.jumpedThisCycle && this.frameX === 9) {
                this.startJump();
                this.jumpedThisCycle = true;
            }
        } else {
            this.isJumping = false;
            this.jumpedThisCycle = false;
            this.y = this.groundY;
        }

        if (this.isJumping) {
            const progress = (this.game.hiddenTime - this.jumpStartTime) / (this.jumpDuration * 1000);
            if (progress < 1) {
                this.y = this.groundY - this.jumpHeight * Math.sin(progress * Math.PI);
                this.x += this.jumpDir * this.horizontalSpeed;
            } else {
                this.y = this.groundY;
                this.isJumping = false;
            }
        }
    }
}

export class Bee extends BeeInstances {
    constructor(game) {
        super(game, 55.23, 57, 12, 'bee', 800, 3, 10, 20);
        this.soundId = 'beeBuzzing';
    }
}
export class AngryBee extends BeeInstances {
    constructor(game) {
        super(game, 55.23, 57, 12, 'angryBee', 1100, 3, 12, 140);
        this.soundId = 'angryBeeBuzzing';
    }
}

export class Strawspider extends ClimbingEnemy {
    constructor(game) {
        super(game, 93.83333333333333, 110, 5, 'strawspider');
        this.lives = 2;
        this.setFps(13);
        this.swingAngle = 0;
        this.swingSpeed = 0.002 + Math.random() * 0.006;
        this.swingAmplitude = 1 + Math.random() * 4;
        this.canAttack = true;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.swingAngle += this.swingSpeed * deltaTime;
        const swingOffsetX = Math.sin(this.swingAngle) * this.swingAmplitude;
        this.x += swingOffsetX;
    }

    draw(context) {
        context.beginPath();
        context.moveTo(this.x + this.width / 2, 0);
        context.lineTo(this.x + this.width / 2, this.y + 50);
        context.stroke();
        super.draw(context);
    }
}

// Map 6 --------------------------------------------------------------------------------------------------------------------------------------
export class Toxwing extends VerticalEnemy {
    constructor(game) {
        super(game, 121.5, 100, 1, 'toxwing');
        this.angle = Math.random() * Math.PI * 2;
        this.va = Math.random() * 0.04 + 0.04;
        this.amplitude = 15;
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.speedY;
        this.x += this.speedX;
        this.x += this.amplitude * Math.sin(this.angle);
        this.angle += this.va;
        this.playSoundOnce('batPitch');
        if (this.frameX === 1 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('wooshBat');
    }
}

export class Mycora extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 165.125, 200, 7, 'mycora');
        this.isRedEnemy = true;
        this.lives = 2;
        this.setFps(15);
        this.shotTurn = 0;
    }
    throwOrbs() {
        const cx = this.x + this.width / 2 - 15;
        const cy = this.y + this.height / 3 - 5;
        const baseAngle = -Math.PI + Math.PI / 8;
        const spread = Math.PI / 6;
        const angles = [baseAngle - spread, baseAngle, baseAngle + spread];
        for (const angle of angles) {
            this.game.enemies.push(new PoisonousOrb(this.game, cx, cy, angle));
        }
    }
    advanceFrame(deltaTime) {
        const prevFrame = this.frameX;
        super.advanceFrame(deltaTime);
        if (prevFrame === 2 && this.frameX === 3) {
            this.shotTurn++;
            if (this.shotTurn % 2 === 0 && this.isOnScreen()) this.throwOrbs();
        }
    }
}

export class Venarach extends ClimbingEnemy {
    constructor(game) {
        super(game, 124.25, 150, 3, 'venarach');
        this.isPoisonEnemy = true;
        this.setFps(17);
        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.09;
        this.soundId = 'nightSpiderSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.speedY * Math.sin(this.angle);
        this.angle += this.va;
    }
}

export class LarvoxMini extends MovingGroundEnemy {
    constructor(game, x, y, launchVX) {
        super(game, 114.75 * 0.6, 70 * 0.6, 3, 'larvox');
        this.setFps(14);
        this.x = x;
        this.y = y;
        this.vx = launchVX;
        this.vy = -(Math.random() * 5 + 7);
        this.gravity = 0.4;
        this.grounded = false;
        this.groundY = game.height - (70 * 0.6) - game.groundMargin;
    }
    update(deltaTime) {
        if (!this.grounded) {
            if (!this.game.cabin.isFullyVisible) this.x -= this.game.speed;
            this.x += this.vx;
            this.vy += this.gravity;
            this.y += this.vy;
            this.advanceFrame(deltaTime);
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.grounded = true;
                this.xSpeed = Math.floor(Math.random() * 3) + 3;
            }
            if (this.x + this.width < 0) this.markedForDeletion = true;
            return;
        }
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
    draw(context) {
        drawSprite(context, this.image, this.frameX * 114.75, 0, 114.75, 70, this.x, this.y, this.width, this.height);
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class Larvox extends MovingGroundEnemy {
    constructor(game) {
        super(game, 114.75, 70, 3, 'larvox');
        this.setFps(12);
        this.xSpeed = Math.floor(Math.random() * 3) + 1;
        this.spawned = false;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
        if (!this.spawned && this.lives <= 0) {
            this.spawned = true;
            const cx = this.x + this.width / 2;
            this.game.enemies.push(new LarvoxMini(this.game, cx, this.y, -4));
            this.game.enemies.push(new LarvoxMini(this.game, cx, this.y, 3));
        }
    }
}

export class Venoblitz extends MovingGroundEnemy {
    constructor(game) {
        super(game, 133.5, 100, 5, 'venoblitz');
        this.xSpeed = Math.floor(Math.random() * 3) + 9;
        this.lives = 2;
        this.isPoisonEnemy = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class Virefly extends FlyingEnemy {
    constructor(game) {
        super(game, 100, 120, 1, 'virefly');
        this.playsOnce = true;
        this.t1 = Math.random() * Math.PI * 2;
        this.t2 = Math.random() * Math.PI * 2;
        this.t3 = Math.random() * Math.PI * 2;
        this.va = 0;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.t1 += 0.07;
        this.t2 += 0.13;
        this.t3 += 0.031;
        this.y += Math.sin(this.t1) * 3 + Math.sin(this.t2) * 1.5 + Math.sin(this.t3) * 2.5;
        this.x += Math.cos(this.t2) * 1.5 + Math.cos(this.t3) * 1;
        this.playSoundOnce('buzzingFly');
    }
}

export class Woxin extends BeeInstances {
    constructor(game) {
        super(game, 79, 85, 1, 'woxin', 1100, 3, 10, 140);
        this.isStunEnemy = false;
        this.isPoisonEnemy = true;
        this.soundId = 'beeBuzzing';
        this.setFps(17);
    }
}

export class Venflora extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 98.28571428571429, 150, 6, 'venflora');
        this.isPoisonEnemy = true;
        this.setFps(15);
        this.shotTurn = 3;
    }
    shoot() {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 3;
        const px = this.game.player.x + this.game.player.width / 2;
        const py = this.game.player.y + this.game.player.height / 2;
        const angle = Math.atan2(py - cy, px - cx);
        this.game.enemies.push(new RedOrb(this.game, cx - 15, cy - 25, angle));
    }
    advanceFrame(deltaTime) {
        const prevFrame = this.frameX;
        super.advanceFrame(deltaTime);
        if (prevFrame === 1 && this.frameX === 2 && this.isOnScreen()) {
            this.shotTurn++;
            if (this.shotTurn % 4 === 0) this.shoot();
        }
    }
}

export class Zabkous extends MovingGroundEnemy {
    static STATES = {
        run: {
            width: 234.6470588235294,
            height: 150,
            srcY: 0,
            xOffset: 0,
            yOffset: 0,
        },
        attack: {
            width: 134.0588235294118,
            height: 100,
            srcY: 150,
            xOffset: 45,
            yOffset: 0,
        },
    };

    constructor(game) {
        super(game, 316, 202, 16, 'zabkous');

        this.game = game;
        this.lives = 2;
        this.setFps(60);

        this.state = 'run';
        this.jumpHeight = 160;
        this.jumpDuration = 0.5;
        this.jumpStartTime = 0;
        this.originalY = this.y;
        this.jumpedBeforeDistanceLogic = false;

        this.poisonSpitThrown = false;
        this.playsOnce = true;

        this.applyState('run', { resetJumpFlags: true });
    }

    applyState(newState, { resetJumpFlags = false } = {}) {
        const cfg = Zabkous.STATES[newState];
        if (!cfg) return;

        this.state = newState;

        this.width = cfg.width;
        this.height = cfg.height;
        this.frameX = 0;

        const groundY = this.game.height - this.height - this.game.groundMargin;

        this.x += cfg.xOffset;
        this.y = groundY + cfg.yOffset;

        if (resetJumpFlags) {
            this.jumpedBeforeDistanceLogic = false;
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        const srcY = Zabkous.STATES[this.state]?.srcY ?? 0;
        drawSprite(context, this.image, this.frameX * this.width, srcY, this.width, this.height, this.x, this.y, this.width, this.height);
    }

    throwPoisonSpit() {
        if (!this.poisonSpitThrown) {
            this.game.enemies.push(new PoisonSpit(this.game, this.x + 20, this.y + 15 + this.height / 2 - 11));
            this.poisonSpitThrown = true;
        }
    }

    frogRun() {
        const playerDistance = Math.abs(this.game.player.x - this.x);
        this.x -= 2;

        if (this.state === 'run' && this.frameX === 0 && !this.jumpedBeforeDistanceLogic) {
            this.jumpStartTime = this.game.hiddenTime;
            this.jumpedBeforeDistanceLogic = true;
            this.originalY = this.y;
        }

        const jumpProgress =
            (this.game.hiddenTime - this.jumpStartTime) / (this.jumpDuration * 1000);

        if (jumpProgress < 1) {
            this.y = this.originalY - this.jumpHeight * Math.sin(jumpProgress * Math.PI);
            this.x -= 5;
        } else {
            this.y = this.originalY;
            this.game.audioHandler.enemySFX.playSound('landingJumpSound', false, true);

            if (this.game.gameOver) {
                this.applyState('run', { resetJumpFlags: true });
            } else if (playerDistance <= 1500) {
                this.poisonSpitThrown = false;
                this.applyState('attack');
            } else {
                this.applyState('run', { resetJumpFlags: true });
            }
        }
    }

    frogAttack() {
        if (this.state === 'attack' && this.frameX === 13) {
            this.throwPoisonSpit();
            this.game.audioHandler.enemySFX.playSound('spitSound', false, true);
        }

        if (this.state === 'attack' && this.frameX >= this.maxFrame) {
            this.applyState('run', { resetJumpFlags: true });

            this.x -= 90;

            this.jumpStartTime = this.game.hiddenTime;
        }
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.playSoundOnce('frogSound', false, true);

        if (this.state === 'run') this.frogRun();
        else if (this.state === 'attack') this.frogAttack();
    }
}

// Map 7 --------------------------------------------------------------------------------------------------------------------------------------
export class Cactus extends MovingGroundEnemy {
    constructor(game) {
        super(game, 115.3, 130, 9, 'cactus');
        this.setFps(20);
        this.isStunEnemy = true;
        this.xSpeed = Math.floor(Math.random() * 2) + 3;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class Blazice extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 103, 75, 1, 'blazice');
        this.setFps(17);
        this.isFrozenEnemy = true;
    }
}

export class Volcanurtle extends MovingGroundEnemy {
    constructor(game) {
        super(game, 152.25, 100, 7, 'volcanurtle');
        this.lives = 2;
        this.setFps(8);
        this.xSpeed = Math.floor(Math.random() * 1) + 1;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class VolcanoWasp extends BeeInstances {
    constructor(game) {
        super(game, 93, 90, 5, 'volcanoWasp', 1100, 3, 12, 140);
        this.soundId = 'angryBeeBuzzing';
    }
}

export class VolcanicBubble extends Projectile {
    constructor(game, x, y) {
        super(game, x, y, 34, 34, 0, null, 0, 60);
        this.isRedEnemy = true;
        this.r = 17;
        this.spawnDuration = 450;
        this.age = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.crackRotation = 0;
        this.driftX = 0;
        this.targetDriftX = (Math.random() - 0.5) * 2;
        this.driftTimer = 0;
        this.driftInterval = 400 + Math.random() * 400;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.age += deltaTime;
        this.crackRotation += deltaTime * 0.0008;
        this.driftTimer += deltaTime;
        if (this.driftTimer >= this.driftInterval) {
            const spread = Math.min(1 + this.age * 0.0005, 3.5);
            this.targetDriftX = (Math.random() - 0.5) * 2.5 * spread;
            this.driftInterval = 400 + Math.random() * 400;
            this.driftTimer = 0;
        }
        this.driftX += (this.targetDriftX - this.driftX) * 0.035;
        this.x += this.driftX;
        this.y -= 1.7 + 0.4 * Math.abs(Math.sin(this.age * 0.0013 + this.pulsePhase));
    }

    draw(context) {
        const spawnT = Math.min(1, this.age / this.spawnDuration);
        const spawnScale = 1 - Math.pow(1 - spawnT, 2);
        const pulse = 1 + 0.1 * Math.sin(this.age * 0.007 + this.pulsePhase);
        const r = this.r * pulse * spawnScale;
        const cx = this.x + this.r;
        const cy = this.y + this.r;

        withCtx(context, () => {
            context.globalAlpha = 0.72 * spawnScale;
            this.applyGlow(context);

            const bodyGrad = context.createRadialGradient(cx - r * 0.35, cy - r * 0.38, r * 0.05, cx, cy, r);
            bodyGrad.addColorStop(0, '#ffdd55');
            bodyGrad.addColorStop(0.25, '#ff7700');
            bodyGrad.addColorStop(0.6, '#bb1500');
            bodyGrad.addColorStop(1, '#2a0000');

            context.beginPath();
            context.arc(cx, cy, r, 0, Math.PI * 2);
            context.fillStyle = bodyGrad;
            context.fill();

            setShadow(context, 'transparent', 0);
            context.translate(cx, cy);
            context.rotate(this.crackRotation);

            context.lineWidth = 1.3;
            context.globalAlpha = 0.8;
            const numCracks = 6;
            for (let i = 0; i < numCracks; i++) {
                const a = (i / numCracks) * Math.PI * 2;
                const midA = a + 0.3;
                const innerGlow = `hsl(${30 + i * 8}, 100%, ${60 - i * 3}%)`;
                context.strokeStyle = innerGlow;
                context.beginPath();
                context.moveTo(0, 0);
                context.quadraticCurveTo(
                    Math.cos(midA) * r * 0.52,
                    Math.sin(midA) * r * 0.52,
                    Math.cos(a) * r * 0.87,
                    Math.sin(a) * r * 0.87
                );
                context.stroke();
            }

            context.globalAlpha = 0.5;
            const hiGrad = context.createRadialGradient(-r * 0.3, -r * 0.35, 0, -r * 0.22, -r * 0.28, r * 0.4);
            hiGrad.addColorStop(0, 'rgba(255, 245, 180, 0.9)');
            hiGrad.addColorStop(1, 'rgba(255, 160, 40, 0)');
            context.beginPath();
            context.arc(-r * 0.22, -r * 0.28, r * 0.4, 0, Math.PI * 2);
            context.fillStyle = hiGrad;
            context.fill();

            context.globalAlpha = 0.22;
            context.strokeStyle = 'rgba(255, 210, 80, 0.9)';
            context.lineWidth = 2.5;
            context.beginPath();
            context.arc(0, 0, r * 0.87, Math.PI * 1.05, Math.PI * 1.75);
            context.stroke();
        });

        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class VolcanicPlant extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 167, 130, 1, 'volcanicPlant');
        this.isRedEnemy = true;
        this.lives = 3;
        this.setFps(7);
        this.bubbleCooldown = 1000;
        this.bubbleTimer = 800;
    }

    throwBubble() {
        const bx = this.x + 66;
        const by = this.y + 8;
        this.game.enemies.push(new VolcanicBubble(this.game, bx, by));
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.bubbleTimer += deltaTime;
        if (!this.game.gameOver && this.bubbleTimer >= this.bubbleCooldown && this.x < this.game.width - this.width) {
            this.throwBubble();
            this.bubbleTimer = 0;
        }
    }
}

export class VolcanoScorpion extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 161, 150, 9, 'volcanoScorpion');
        this.setFps(14);
        this.prevFrameX = -1;
        this.poisonCooldown = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.poisonCooldown > 0) this.poisonCooldown -= deltaTime;
        const player = this.game.player;
        const playerAhead = player.x < this.x;
        if (this.frameX === 4 && this.prevFrameX !== 4 && this.poisonCooldown <= 0 && this.x + this.width / 2 < this.game.width && playerAhead) {
            this.game.enemies.push(new ScorpionPoison(this.game, this.x + 35, this.y + 10));
            this.poisonCooldown = 1300;
        }
        this.prevFrameX = this.frameX;
    }
}

export class VolcanoFly extends FlyingEnemy {
    constructor(game) {
        super(game, 85.5, 100, 1, 'volcanoFly');
        this.setFps(7);
    }
}

export class Bloburn extends VerticalEnemy {
    constructor(game) {
        super(game, 52, 50, 0, 'bloburn');
        this.initialSpeed = 3;
        this.currentSpeed = 4;
        this.chaseDistance = this.game.width;
        this.loopingSoundId = 'verticalGhostSound';
        this.rotation = 0;
        this.rotationSpeed = 0.05;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.playIfOnScreen('verticalGhostSound');
        this.rotation += this.rotationSpeed;

        const distanceToPlayer = this.getDistanceToPlayer();

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                const a = this.getAngleToPlayer();
                this.angleToPlayer = a;
                moveAlongAngle(this, a, this.currentSpeed);
            } else {
                this.x -= this.currentSpeed;
            }
        } else {
            moveAlongAngle(this, this.angleToPlayer, this.currentSpeed);
        }

        if (this.x < this.game.player.x) this.passedPlayer = true;
    }

    moveTowardsPlayer() {
        const a = this.getAngleToPlayer();
        moveAlongAngle(this, a, this.currentSpeed);
    }

    draw(context) {
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.rotate(this.rotation);
            this.applyGlow(context);
            drawSprite(context, this.image, 0, 0, this.width, this.height,
                -this.width / 2, -this.height / 2, this.width, this.height);
            this.clearGlow(context);
        });
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class VolcanoBeetle extends MovingGroundEnemy {
    constructor(game) {
        super(game, 90.25, 60, 3, 'volcanoBeetle');
        this.setFps(20);
        this.xSpeed = Math.floor(Math.random() * 2) + 6;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class LavaCobra extends UndergroundEnemy {
    constructor(game) {
        super(game, 176.5, 160, 1, 'lavaCobra', {
            warningDuration: 500,
            riseDuration: 400,
            holdDuration: 3200,
            triggerDistance: 1600
        });
        this.lives = 2;
        this.setFps(5);
        this._lastFrameCount = 0;
    }

    onEmergeStart() {
        super.onEmergeStart();
        this._lastFrameCount = 0;
    }

    throwLavaBall() {
        const mouthX = this.x + 70;
        const mouthY = this.y + 32;
        const player = this.game.player;
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const speed = 12;
        let speedX, speedY;
        if (playerCenterX > mouthX) {
            speedX = speed;
            speedY = 0;
        } else {
            const dx = mouthX - playerCenterX;
            const dy = playerCenterY - mouthY;
            const dist = Math.hypot(dx, dy) || 1;
            speedX = (dx / dist) * speed;
            speedY = (dy / dist) * speed;
        }
        const ball = new LavaBall(
            this.game,
            mouthX,
            mouthY,
            speedX,
            speedY
        );
        this.game.enemies.push(ball);
    }

    update(deltaTime) {
        const prevFrameX = this.frameX;
        super.update(deltaTime);
        if (this.phase === 'hold' && this.frameX === this.maxFrame && prevFrameX !== this.maxFrame) {
            this._lastFrameCount++;
            if (this._lastFrameCount % 4 === 1) {
                this.throwLavaBall();
            }
        }
    }
}

// Bonus Map 1 --------------------------------------------------------------------------------------------------------------------------------------
export class IceSilknoir extends ClimbingEnemy {
    constructor(game) {
        super(game, 120, 144, 5, 'iceSilknoir');
        this.isSlowEnemy = true;
        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.09;
        this.soundId = 'nightSpiderSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.y += this.speedY * Math.sin(this.angle);
        this.angle += this.va;
    }
}

export class CrystalWasp extends FlyingEnemy {
    constructor(game) {
        super(game, 111.8333333333333, 110, 5, 'crystalWasp');
        this.playsOnce = true;
        this.setFps(30);
        this.isFrozenEnemy = true;
        this.currentSpeed = 1.5;
        this.chaseDistance = this.game.width;
        this.lockedAngle = null;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.playSoundOnce('buzzingFly');

        if (this.lockedAngle !== null) {
            moveAlongAngle(this, this.lockedAngle, this.currentSpeed);
        } else if (this.x >= this.game.player.x && this.getDistanceToPlayer() <= this.chaseDistance) {
            const a = this.getAngleToPlayer();
            moveAlongAngle(this, a, this.currentSpeed);
            if (this.x < this.game.player.x) this.lockedAngle = a;
        } else {
            this.x -= this.currentSpeed;
        }
    }
}

export class IcePlant extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 78.42857142857143, 115, 6, 'icePlant');
        this.soundId = 'teethChatteringSound';
        this.shardCooldown = 4000;
        this.lastShardTime = 3999;
    }

    throwShard() {
        const shard = new FrozenShard(
            this.game,
            this.x - 10,
            this.y + this.height / 2 - 30,
            8
        );
        this.game.enemies.push(shard);
        this.lastShardTime = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.lastShardTime += deltaTime;
        if (this.lastShardTime >= this.shardCooldown && this.x < this.game.width - this.width) {
            this.throwShard();
        }
    }
}

export class Globby extends MovingGroundEnemy {
    constructor(game) {
        super(game, 115, 110, 5, 'globby');
        this.setFps(12);
        this.xSpeed = Math.floor(Math.random() * 6) + 2;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class IceCentipedeMini extends MovingGroundEnemy {
    constructor(game, x, y, launchVX) {
        super(game, 126 * 0.65, 80 * 0.65, 5, 'iceCentipede');
        this.setFps(14);
        this.x = x;
        this.y = y;
        this.vx = launchVX;
        this.vy = -(Math.random() * 5 + 7);
        this.gravity = 0.4;
        this.grounded = false;
        this.groundY = game.height - (80 * 0.65) - game.groundMargin;
    }
    update(deltaTime) {
        if (!this.grounded) {
            if (!this.game.cabin.isFullyVisible) this.x -= this.game.speed;
            this.x += this.vx;
            this.vy += this.gravity;
            this.y += this.vy;
            this.advanceFrame(deltaTime);
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.grounded = true;
                this.width = 126 * 0.65;
                this.height = 80 * 0.65;
                this.xSpeed = Math.floor(Math.random() * 2) + 3;
            }
            if (this.x + this.width < 0) this.markedForDeletion = true;
            return;
        }
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
    draw(context) {
        withCtx(context, () => {
            context.scale(0.65, 0.65);
            drawSprite(context, this.image, this.frameX * 126, 0, 126, 80, this.x / 0.65, this.y / 0.65, 126, 80);
        });
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class IceCentipede extends MovingGroundEnemy {
    constructor(game) {
        super(game, 126, 80, 5, 'iceCentipede');
        this.setFps(12);
        this.xSpeed = Math.floor(Math.random() * 2) + 2;
        this.spawned = false;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
        if (!this.spawned && this.lives <= 0) {
            this.spawned = true;
            const cx = this.x + this.width / 2;
            this.game.enemies.push(new IceCentipedeMini(this.game, cx, this.y, -4));
            this.game.enemies.push(new IceCentipedeMini(this.game, cx, this.y, 3));
        }
    }
}

export class DrillIce extends UndergroundEnemy {
    constructor(game) {
        super(game, 197, 115, 3, 'drillice', {
            warningDuration: 800,
            riseDuration: 300,
            holdDuration: 1200,
            triggerDistance: 700
        });
        this.isSlowEnemy = true;
    }
}

export class Frostling extends FallingEnemy {
    constructor(game) {
        super(game, 46.5, 100, 1, 'frostling');
        this.isSlowEnemy = true;
        this.speedY = Math.random() * 4 + 4;
        this.setFps(5);
    }
}

export class IceBat extends FlyingEnemy {
    constructor(game) {
        super(game, 156.75, 130, 3, 'iceBat');
        this.setFps(15);
    }
}

// Bonus Map 2 --------------------------------------------------------------------------------------------------------------------------------------
export class CrypticRocky extends MovingGroundEnemy {
    constructor(game) {
        super(game, 152, 140, 1, 'crypticRocky');
        this.lives = 2;
        this.isRedEnemy = true;
        this.setFps(6);
        this.y = this.y + 17;
        this.groundY = this.y;
        this.xSpeed = Math.floor(Math.random() * 2) + 3;
        this.ySpeed = 3;
        this._phase = 0;
        this._distCovered = 0;
        this._segmentDist = 120 + Math.random() * 160;
        this._currentSpeed = 2 + Math.random() * 3;
    }
    _nextSegment() {
        this._distCovered = 0;
        this._phase++;
        this._segmentDist = 80 + Math.random() * 200;
    }
    update(deltaTime) {
        super.update(deltaTime);
        switch (this._phase % 4) {
            case 0:
                this.x -= this._currentSpeed;
                this._distCovered += this._currentSpeed;
                break;
            case 1:
                this.y -= this._currentSpeed;
                this._distCovered += this._currentSpeed;
                break;
            case 2:
                this.x -= this._currentSpeed;
                this._distCovered += this._currentSpeed;
                break;
            case 3:
                this.y += this._currentSpeed;
                this._distCovered += this._currentSpeed;
                break;
        }
        if (this._distCovered >= this._segmentDist) this._nextSegment();
        const prevY = this.y;
        this.y = Math.max(0, Math.min(this.groundY, this.y));
        if (this.y !== prevY) this._nextSegment();
    }
}

export class CrypticSpider extends MovingGroundEnemy {
    constructor(game) {
        super(game, 98.66666666666667, 70, 2, 'crypticSpider');
        this.setFps(12);
        this.xSpeed = Math.floor(Math.random() * 2) + 2;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}


export class CrypticSlime extends MovingGroundEnemy {
    constructor(game) {
        super(game, 124, 50, 3, 'crypticSlime');
        this.setFps(8);
        this.groundY = game.height - this.height - game.groundMargin;
        this.y = -this.height;
        const minX = Math.max(game.width / 2, game.player.x);
        const maxX = game.width - this.width;
        this.x = minX + Math.random() * (maxX - minX);
        this.speedY = Math.random() * 2 + 3;
        this.xSpeed = Math.floor(Math.random() * 2) + 3;
        this.state = 'falling';
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.state === 'falling') {
            this.y += this.speedY;
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.speedY = 0;
                this.state = 'moving';
            }
        } else {
            this.x -= this.xSpeed;
        }
    }
}

export class OneEyeSnake extends MovingGroundEnemy {
    constructor(game) {
        super(game, 217, 100, 1, 'oneEyeSnake');
        this.lives = 2;
        this.setFps(6);
        this.xSpeed = Math.floor(Math.random() * 4) + 2;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class CrypticFly extends FlyingEnemy {
    constructor(game) {
        super(game, 128, 100, 1, 'crypticFly');
        this.playsOnce = true;
        this.isRedEnemy = true;
        this.speed = 1.5;
        this.lockedAngle = null;
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.lockedAngle !== null) {
            moveAlongAngle(this, this.lockedAngle, this.speed);
        } else {
            const a = this.getAngleToPlayer();
            moveAlongAngle(this, a, this.speed);
            if (this.x < this.game.player.x) this.lockedAngle = a;
        }
        this.playSoundOnce('buzzingFly');
    }
}

export class PetroPlant extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 91.555555555555555555555555555556, 100, 1, 'petroPlant');
        this.isFrozenEnemy = true;
        this.lastRockAttackTime = 1999;
        this.soundId = 'teethChatteringSound';
    }

    throwYellowOrbProjectile() {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 3;
        const px = this.game.player.x + this.game.player.width / 2;
        const py = this.game.player.y + this.game.player.height / 2;
        const angle = Math.atan2(py - cy, px - cx);
        this.game.enemies.push(new YellowOrb(this.game, cx - 22, cy - 22, angle));
        this.game.audioHandler.enemySFX.playSound('rockAttackSound');
        this.lastRockAttackTime = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.lastRockAttackTime += deltaTime;
        if (this.lastRockAttackTime >= 2000 && this.x < this.game.width - this.width) {
            this.throwYellowOrbProjectile();
        }
    }
}

export class CrypticGecko extends MovingGroundEnemy {
    constructor(game) {
        super(game, 124.5, 80, 1, 'crypticGecko');
        this.state = 'idle';
        this.setFps(7);
        this.lives = 2;
        this.playsOnce = true;
        this.jumpGroundY = 0;
        this.jumpTime = 0;
        this.jumpDuration = 700;
        this.arcHeight = 130;
        this.jumping = false;
        this.landTime = 0;
        this.landDuration = 300;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);
        if (this.state === 'idle' && ((playerDistance < 1300 && this.y >= this.game.height - this.height - this.game.groundMargin) || this.lives <= 1)) {
            this.state = 'pounce';
        }

        if (this.state === 'pounce') {
            this.playSoundOnce('ahhhSound', false, true);

            if (!this.jumping) {
                this.jumpGroundY = this.y;
                this.jumpTime = 0;
                this.jumping = true;
            }

            this.jumpTime += deltaTime;
            const progress = this.jumpTime / this.jumpDuration;

            if (progress < 1) {
                this.y = this.jumpGroundY - this.arcHeight * Math.sin(progress * Math.PI);
            } else {
                this.y = this.jumpGroundY;
                this.jumping = false;
                this.state = 'land';
                this.landTime = 0;
            }

            this.x -= 14;
        } else if (this.state === 'land') {
            this.landTime += deltaTime;
            if (this.landTime >= this.landDuration) {
                this.state = 'pounce';
            }
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        if (this.state === 'idle') {
            drawSprite(context, this.image, this.frameX * 124.5, 0, 124.5, 80, this.x, this.y, 124.5, 80);
        } else if (this.state === 'pounce') {
            drawSprite(context, this.image, 0, 80, 145, 85, this.x, this.y, 145, 85);
        } else if (this.state === 'land') {
            drawSprite(context, this.image, 0, 165, 122, 111, this.x, this.y - 20, 122, 111);
        }
    }
}

export class Sigilash extends FallingEnemy {
    static NATURAL_ANGLE = Math.atan2(9.5, 10);

    constructor(game) {
        super(game, 99, 100, 1, 'sigilash');
        this.isStunEnemy = true;
        this.x = game.width;
        this.y = -this.height;

        const minAngle = 20 * Math.PI / 180;
        const maxAngle = 65 * Math.PI / 180;
        const angle = minAngle + Math.random() * (maxAngle - minAngle);
        const totalSpeed = Math.random() * 2 + 12;

        this.speedX = totalSpeed * Math.cos(angle);
        this.speedY = totalSpeed * Math.sin(angle);
        this.drawRotation = Sigilash.NATURAL_ANGLE - angle;
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        this.applyGlow(context);
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.rotate(this.drawRotation);
            drawSprite(context, this.image, this.frameX * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
        });
        this.clearGlow(context);
    }
}

export class Dragon extends FlyingEnemy {
    constructor(game) {
        super(game, 182, 172, 11, 'dragon');
        this.lives = 2;
        this.setFps(14);
        this.canAttack = true;
    }

    throwWindAttack() {
        this.game.enemies.push(new WindAttack(this.game, this.x + 50, this.y + 20, 4));
    }

    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);

        if (playerDistance <= 1600 && this.frameX == 7 && this.canAttack === true) {
            this.canAttack = false;
            if (!this.game.gameOver) {
                this.throwWindAttack();
                this.game.audioHandler.enemySFX.playSound('windAttackAudio', false, true);
            }
        }
        if (this.frameX === 10) this.canAttack = true;
        if (this.frameX === 0 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('ravenSingleFlap');
            this.game.audioHandler.enemySFX.playSound('flyMonsterFlap');
        }
    }
}


// Bonus Map 3 --------------------------------------------------------------------------------------------------------------------------------------
export class Plazer extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 61.33333333333333, 90, 2, 'plazer');
        this.setFps(6);
        this.shotTurn = 3;
        this.burstCount = 0;
        this.burstTimer = 0;
        this.inBurst = false;
        this.burstDelay = 150;
    }
    fireLaser() {
        const cx = this.x;
        const cy = this.y + this.height / 2;
        const px = this.game.player.x + this.game.player.width / 2;
        const py = this.game.player.y + this.game.player.height / 2;
        const angle = Math.atan2(py - cy, px - cx);
        this.game.enemies.push(new PurpleLaser(this.game, cx - 40, cy - 30, angle));
        this.game.audioHandler.enemySFX.playSound('laserAttackAudio', false, true);
    }
    advanceFrame(deltaTime) {
        const prevFrame = this.frameX;
        super.advanceFrame(deltaTime);
        if (prevFrame === 0 && this.frameX === 1 && this.isOnScreen() && this.x >= this.game.player.x) {
            this.shotTurn++;
            if (this.shotTurn % 4 === 0) {
                this.inBurst = true;
                this.burstCount = 0;
                this.burstTimer = this.burstDelay;
            }
        }
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (!this.inBurst || this.game.gameOver) return;
        this.burstTimer += deltaTime;
        if (this.burstTimer >= this.burstDelay) {
            this.burstTimer = 0;
            this.fireLaser();
            this.burstCount++;
            if (this.burstCount >= 2) this.inBurst = false;
        }
    }
}

export class Veynoculus extends FlyingEnemy {
    constructor(game) {
        super(game, 78.6, 50, 4, 'veynoculus');
    }
}

export class SpaceCrab extends FallingEnemy {
    constructor(game) {
        super(game, 125.6666666666667, 130, 2, 'spaceCrab');
        this.speedY = Math.random() * 6 + 5;
        this.setFps(10);
    }
}

export class Johnny extends FlyingEnemy {
    constructor(game) {
        super(game, 98, 80, 0, 'johnny');
        this.isStunEnemy = true;
        this.setFps(0);
        this.currentSpeed = 7;
        this.chaseDistance = this.game.width;
    }
    update(deltaTime) {
        super.update(deltaTime);

        if (this.x >= this.game.player.x && this.getDistanceToPlayer() <= this.chaseDistance) {
            moveAlongAngle(this, this.getAngleToPlayer(), this.currentSpeed);
        } else {
            this.x -= this.currentSpeed;
        }
    }
}

export class Spindle extends MovingGroundEnemy {
    constructor(game) {
        super(game, 99.69230769230769, 90, 12, 'spindle');
        this.setFps(70);
        this.xSpeed = Math.floor(Math.random() * 6) + 3;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class Borion extends UndergroundEnemy {
    constructor(game) {
        super(game, 228, 150, 1, 'borion', {
            warningDuration: 500,
            riseDuration: 500,
            holdDuration: 5000,
            triggerDistance: 1300
        });
        this.lives = 3;
        this.setFps(10);
        this.drawOffsetY = 30;
        this.orbTimer = 0;
    }
    throwOrbs() {
        const orbTypes = [YellowOrb, RedOrb, CyanOrb, GreenOrb, BlueOrb];
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 4;
        const angles = [
            -Math.PI * 0.8 + Math.random() * Math.PI * 0.2,
            -Math.PI * 0.6 + Math.random() * Math.PI * 0.2,
            -Math.PI * 0.4 + Math.random() * Math.PI * 0.2,
        ];
        const shuffled = [...orbTypes].sort(() => Math.random() - 0.5);
        for (let i = 0; i < 3; i++) {
            this.game.enemies.push(new shuffled[i](this.game, cx - 22, cy + 40, angles[i]));
        }
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.phase !== 'hold' || this.game.gameOver) return;
        this.orbTimer -= deltaTime;
        if (this.orbTimer <= 0) {
            this.orbTimer = 2000;
            this.throwOrbs();
        }
    }
    draw(context) {
        if (this.phase === 'warning') {
            this.drawWarning(context);
            return;
        }
        if (this.phase === 'emerge' || this.phase === 'hold' || this.phase === 'retract') {
            withCtx(context, () => {
                context.beginPath();
                context.rect(this.x, 0, this.width, this.groundBottom);
                context.clip();
                const cx = this.x + this.width / 2;
                const cy = this.y + this.height / 2 + this.drawOffsetY;
                context.translate(cx, cy);
                context.scale(this.flipHorizontal ? -1 : 1, 1);
                this.applyGlow(context);
                context.drawImage(this.image, (this.frameX || 0) * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
                this.clearGlow(context);
            });
        }
    }
}

export class Vespion extends FlyingEnemy {
    constructor(game) {
        super(game, 117, 100, 1, 'vespion');
        this.isSlowEnemy = true;
        this.playsOnce = true;
        this.baseY = game.height * 0.5 - this.height * 0.5;
        this.y = this.baseY;
        this.va = 0.04;
        this.amplitude = 230;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const spike = (2 / Math.PI) * Math.asin(Math.sin(this.angle));
        this.y = this.baseY + this.amplitude * spike;
        this.playSoundOnce('buzzingFly');
    }
}

export class GalacticPlant extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 95.75, 150, 1, 'galacticPlant');
        this.setFps(10);
        this.suckParticles = [];
        this.particleTimer = 0;
        this.particleInterval = 80;
    }
    spawnSuckParticle() {
        const my = this.y + this.height * 0.3 + 10;
        this.suckParticles.push({
            x: this.x - 200 + (Math.random() - 0.5) * 60,
            y: my + (Math.random() - 0.5) * 300,
            size: 3 + Math.random() * 5,
            speed: 1 + Math.random() * 2.5,
            alpha: 0,
            lifeTimer: 0,
            maxLife: 1000 + Math.random() * 600,
            fadeIn: 50,
        });
    }
    update(deltaTime) {
        super.update(deltaTime);

        const mx = this.x + this.width * 0.5;
        const my = this.y + this.height * 0.3 + 10;
        const scroll = this.game.cabin?.isFullyVisible ? 0 : this.game.speed;
        for (const p of this.suckParticles) {
            p.x -= scroll;
            const dx = mx - p.x;
            const dy = my - p.y;
            const d = Math.hypot(dx, dy);
            if (d <= 8) { p.done = true; continue; }
            p.x += (dx / d) * p.speed;
            p.y += (dy / d) * p.speed;
            p.lifeTimer += deltaTime;
            const fadeInT = Math.min(1, p.lifeTimer / p.fadeIn);
            const fadeOutT = 1 - p.lifeTimer / p.maxLife;
            p.alpha = fadeInT * fadeOutT * 0.9;
        }
        this.suckParticles = this.suckParticles.filter(p => !p.done && p.lifeTimer < p.maxLife);

        if (this.game.gameOver || !this.isOnScreen()) return;

        const dx = (this.x + this.width / 2) - this.game.player.x;
        if (dx <= 0) return;

        this.particleTimer += deltaTime;
        if (this.particleTimer >= this.particleInterval) {
            this.particleTimer = 0;
            this.spawnSuckParticle();
        }

        this.game.player.x += dx * 0.008;
    }
    draw(context) {
        super.draw(context);
        for (const p of this.suckParticles) {
            context.save();
            context.globalAlpha = Math.max(0, p.alpha);
            context.fillStyle = '#99ccff';
            context.shadowColor = '#4499ff';
            context.shadowBlur = 12;
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            context.fill();
            context.restore();
        }
    }
}

export class Oculith extends UndergroundEnemy {
    constructor(game) {
        super(game, 93, 80, 1, 'oculith', {
            warningDuration: 800,
            riseDuration: 300,
            holdDuration: 0,
            triggerDistance: 700
        });
        this.isPoisonEnemy = true;
        this.ascendSpeed = (this.hiddenY - this.visibleY) / this.riseDuration;
    }

    onEmergeComplete() {
        this.phase = 'ascend';
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.phase === 'ascend') {
            this.y -= this.ascendSpeed * deltaTime;
            this.advanceFrame(deltaTime);
            if (this.y + this.height < 0) this.markedForDeletion = true;
        }
    }

    draw(context) {
        if (this.phase === 'ascend') {
            this.drawActivePhase(context);
            return;
        }
        super.draw(context);
    }
}

export class Lancer extends UnderwaterEnemy {
    constructor(game) {
        super(game, 181.25, 70, 3, 'lancer');
        this.isStunEnemy = true;
        this.y = this.game.player.y;
        this.va = Math.random() * 0.001 + 0.2;
        this.setFps(15);
        this.loopingSoundId = 'rocketLauncherSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= 11;
        this.playIfOnScreen('rocketLauncherSound');
    }
}

export class GalacticSpider extends MovingGroundEnemy {
    constructor(game) {
        super(game, 160.5, 120, 3, 'galacticSpider');
        this.setFps(15);
        this.lives = 2;
        this.xSpeed = Math.floor(Math.random() * 2) + 1;
        this.shotCooldown = 3000;
        this.shotTimer = 2500;
    }
    throwOrb() {
        this.game.enemies.push(new CyanOrb(this.game, this.x + 55, this.y + 48));
        this.shotTimer = 0;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
        this.shotTimer += deltaTime;
        if (this.shotTimer >= this.shotCooldown && this.isOnScreen()) this.throwOrb();
    }
}

export class GalacticFrog extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 96.5, 100, 1, 'galacticFrog');
        this.isRedEnemy = true;
        this.state = 'idle';
        this.setFps(10);
        this.playsOnce = true;
        this.jumpFrameX = 0;
        this.jumpFrameTimer = 0;
        this.jumpFrameInterval = 1000 / 15;
        this.jumpFrameW = 180;
        this.jumpFrameH = 105;
        this.jumpVX = 0;
        this.jumpVY = 0;
        this.jumpGravity = 0.35;
        this.groundY = 0;
        this.jumpInitialized = false;
        this.landingTimer = 0;
        this.landingCooldown = 1000;
        this.autoRemoveOffTop = false;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);

        if (this.state === 'idle') {
            this.landingTimer += deltaTime;
            if ((playerDistance < 1300 && this.landingTimer >= this.landingCooldown)) {
                this.state = 'jump';
            }
        }

        if (this.state === 'jump') {
            this.playSoundOnce('ahhhSound', false, true);

            if (!this.jumpInitialized) {
                this.jumpInitialized = true;
                this.width = this.jumpFrameW;
                this.groundY = this.y;
                const dx = Math.max(300, this.x - this.game.player.x);
                this.jumpVX = dx / 60;
                const t = dx / this.jumpVX;
                const playerTargetY = this.game.player.y + this.game.player.height / 2;
                const dy = playerTargetY - this.groundY;
                this.jumpVY = clamp((dy - 0.5 * this.jumpGravity * t * t) / t, -15, -3);
            }

            this.jumpFrameTimer += deltaTime;
            if (this.jumpFrameTimer >= this.jumpFrameInterval && this.jumpFrameX < 3) {
                this.jumpFrameX++;
                this.jumpFrameTimer = 0;
            }

            this.jumpVY += this.jumpGravity;
            this.x -= this.jumpVX;
            this.y += this.jumpVY;

            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.jumpVY = 0;
                this.jumpVX = 0;
                this.jumpInitialized = false;
                this.width = 96.5;
                this.jumpFrameX = 0;
                this.jumpFrameTimer = 0;
            }
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        if (this.state === 'idle') {
            super.draw(context);
        } else if (this.state === 'jump') {
            this.applyGlow(context);
            drawSprite(context, this.image, this.jumpFrameX * this.jumpFrameW, this.height, this.jumpFrameW, this.jumpFrameH, this.x, this.y, this.jumpFrameW, this.jumpFrameH);
            this.clearGlow(context);
        }
    }
}