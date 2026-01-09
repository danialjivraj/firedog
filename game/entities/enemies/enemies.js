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

    getDistanceToPlayer() {
        const p = this.game.player;
        return dist(this.x, this.y, p.x, p.y);
    }
    getAngleToPlayer() {
        const p = this.game.player;
        return angleTo(this.x, this.y, p.x, p.y);
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

        if (this.isStunEnemy) {
            setShadow(context, 'yellow', 10);
        } else if (this.isRedEnemy) {
            setShadow(context, 'red', 10);
        } else if (this.isPoisonEnemy) {
            setShadow(context, 'green', 10);
        } else if (this.isSlowEnemy) {
            setShadow(context, 'blue', 10);
        } else if (this.isFrozenEnemy) {
            setShadow(context, '#00eaff', 18);
        }

        drawSprite(
            context,
            this.image,
            this.frameX * this.width, 0, this.width, this.height,
            this.x, this.y, this.width, this.height
        );

        setShadow(context, 'transparent', 0);
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
            this.state = "idle";

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
        if (id && this.game?.audioHandler?.enemySFX) {
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
    constructor(game, x, y, width, height, maxFrame, imageId, speedX, player) {
        super(game, x, y, width, height, maxFrame, imageId, speedX, 30);
        this.player = player;
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

        if (!(this.x + this.width < 0 || this.y > this.game.height || this.lives <= 0)) {
            this.game.audioHandler.enemySFX.playSound('tornadoAudio');
        }
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
    constructor(game, x, y, width, height, maxFrame, imageId, speedX, rotationAngle) {
        super(game, x, y, width, height, maxFrame, imageId, speedX, 30);
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
    constructor(game, x, y, width, height, maxFrame, imageId, speedX) {
        super(game, x, y, width, height, maxFrame, imageId, speedX, 30);
        this.dealsDirectHitDamage = false;
        this.isPoisonEnemy = true;
    }
}

export class LaserBeam extends Projectile {
    constructor(game, x, y, width, height, maxFrame, imageId, speedX) {
        super(game, x, y, width, height, maxFrame, imageId, speedX, 30);
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
    constructor(game, x, y) {
        super(game, x, y, 82, 48, 0, 'purpleLaser', 15, 0);
    }
}

export class RockProjectile extends Projectile {
    constructor(game, x, y, width, height, maxFrame, imageId, speedX, rotationAngle) {
        super(game, x, y, width, height, maxFrame, imageId, speedX, 30);
        this.rotation = 0;
        this.rotationAngle = rotationAngle;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.rotation += deltaTime * this.rotationAngle;
    }
    draw(context) {
        withCtx(context, () => {
            setShadow(context, 'yellow', 10);
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

// Goblin -------------------------------------------------------------------------------------------------------------------------------------
export class Goblin extends MovingGroundEnemy {
    constructor(game) {
        super(game, 60.083, 80, 11, 'goblinRun');
        this.lives = 1;
        this.dealsDirectHitDamage = false;

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
        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('buzzingFly');
        }
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
        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('batPitch');
        }
        if (this.frameX === 3 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('wooshBat');
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
        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('ravenCallAudio');
        }
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
        super(game, 104.23076923076923076923076923077 * scale, 70 * scale, 12, 'skulnapAwake');
        this.isStunEnemy = true;
        this.y = this.game.height - this.height - this.game.groundMargin + 15;
        this.state = 'sleeping';
        this.scale = scale;

        this.sleepingAnimation = new GroundEnemy(game, 57 * scale, 57 * scale, 10, 'skulnapSleep');
        this.sleepingAnimation.frameX = 0;
        this.sleepingAnimation.frameY = 0;

        this.soundId = undefined;
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
            this.sleepingAnimation.x = this.x + 13;
            this.sleepingAnimation.y = this.y;
            this.sleepingAnimation.update(deltaTime);
        }
    }

    draw(context) {
        const drawImageWithScale = (image, frameX, x, y, width, height, scale) => {
            withCtx(context, () => {
                context.translate(x, y);
                context.scale(scale, scale);
                context.translate(-x, -y);
                setShadow(context, 'yellow', 10);
                context.drawImage(image, frameX * (width / scale), 0, width / scale, height / scale, x, y, width, height);
            });
        };

        if (this.state === 'running') {
            drawImageWithScale(this.image, this.frameX, this.x, this.y, this.width, this.height, this.scale);
        } else {
            drawImageWithScale(
                this.sleepingAnimation.image,
                this.sleepingAnimation.frameX,
                this.sleepingAnimation.x,
                this.sleepingAnimation.y,
                this.sleepingAnimation.width,
                this.sleepingAnimation.height,
                this.scale
            );
        }
    }
}

export class Abyssaw extends FlyingEnemy {
    constructor(game) {
        super(game, 100.44, 100, 8, 'abyssaw');
        this.soundId = 'spinningChainsaw';
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
        super(game, 191.68, 130, 24, 'glidoSpikeFly');
        this.walkFps = 120;
        this.attackFps = 120;
        this.frameInterval = 1000 / this.walkFps;
        this.state = 'walk';

        this.attackAnimation = new FlyingEnemy(game, 191.68, 130, 24, 'glidoSpikeAttack');
        this.attackAnimation.setFps(this.attackFps);
        this.attackAnimation.frameX = 0;

        this.canAttack = true;
        this.windAttackConfig = {
            width: 105,
            height: 120,
            maxFrame: 5,
            imageId: 'windAttack',
            speedX: 2,
            fps: 20,
            offsetX: 0,
            offsetY: 0
        };
    }

    throwWindAttack() {
        const windAttack = new WindAttack(
            this.game,
            this.x + this.windAttackConfig.offsetX + 50,
            this.y + this.windAttackConfig.offsetY + 20,
            this.windAttackConfig.width,
            this.windAttackConfig.height,
            this.windAttackConfig.maxFrame,
            this.windAttackConfig.imageId,
            this.windAttackConfig.speedX,
            this.game.player
        );
        this.game.enemies.push(windAttack);
    }

    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);

        if (this.state === 'walk') {
            this.x -= 1;
            if (playerDistance <= 1200 && this.frameX == 24) {
                if (!this.game.gameOver) {
                    this.state = 'attack';
                    this.attackAnimation.x = this.x;
                    this.attackAnimation.y = this.y;
                    this.attackAnimation.frameX = 0;
                }
            }
        } else if (this.state === 'attack') {
            this.attackAnimation.update(deltaTime);
            if (this.attackAnimation.frameX === 12 && this.canAttack === true) {
                this.throwWindAttack();
                this.game.audioHandler.enemySFX.playSound('windAttackAudio', false, true);
                this.canAttack = false;
            }
            if (this.attackAnimation.frameX === 24) {
                this.canAttack = true;
                this.state = 'walk';
                this.frameX = 0;
            }
            if (playerDistance > 1200 && this.attackAnimation.frameX >= this.attackAnimation.maxFrame) {
                this.state = 'walk';
            }
        }

        if (this.game.gameOver && this.attackAnimation.frameX >= this.attackAnimation.maxFrame) {
            this.state = 'walk';
        }
        if (this.frameX === 11 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('flyMonsterFlap');
        }
    }

    draw(context) {
        if (this.state === 'walk') {
            super.draw(context);
        } else if (this.state === 'attack') {
            this.attackAnimation.x = this.x;
            this.attackAnimation.y = this.y;
            this.attackAnimation.draw(context);
        }
    }
}

// Map 2 --------------------------------------------------------------------------------------------------------------------------------------
export class DuskPlant extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 60, 87, 1, 'duskPlant');
        this.soundId = 'teethChatteringSound';
        this.leafAttackConfig = {
            width: 35.416,
            height: 45,
            maxFrame: 11,
            imageId: 'darkLeafAttack',
            cooldown: 5000,
            speedX: 5
        };
        this.lastLeafAttackTime = 4999;
        this.soundId = 'teethChatteringSound';
    }

    throwLeaf() {
        const {
            x,
            y,
            height
        } = this;
        const {
            width,
            height: leafHeight,
            maxFrame,
            imageId
        } = this.leafAttackConfig;

        const leaf = new LeafAttack(
            this.game,
            x,
            y + height / 2 - leafHeight / 2,
            width,
            leafHeight,
            maxFrame,
            imageId,
            this.leafAttackConfig.speedX,
            0.0002 + Math.random() * (0.001 - 0.0002)
        );
        this.game.audioHandler.enemySFX.playSound('leafAttackAudio');
        this.game.enemies.push(leaf);

        this.lastLeafAttackTime = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.lastLeafAttackTime += deltaTime;
        if (this.lastLeafAttackTime >= this.leafAttackConfig.cooldown && this.x < this.game.width - this.width) {
            this.throwLeaf();
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
        this.initialSpeed = 3;
        this.currentSpeed = 4;
        this.chaseDistance = this.game.width;
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
        super(game, 75.166666666666666666666666666667, 50, 5, 'piranha');
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= 3;
        if (this.frameX === 1 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('crunchSound');
    }
}

export class SkeletonFish extends UnderwaterEnemy {
    constructor(game) {
        super(game, 55, 39, 4, 'skeletonFish');
        this.chaseDistance = 900;
        this.initialSpeed = 3;
        this.currentSpeed = this.initialSpeed;
        this.passedPlayer = false;
        this.speed = 6;
        this.moveTowardsPlayerActive = false;
        this.useLogic1 = Math.random() < 0.5;
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.useLogic1) this.updateLogic1();
        else this.updateLogic2();

        if (this.frameX === 1 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('skeletonCrunshSound');
        }
    }

    updateLogic1() {
        const distanceToPlayer = this.getDistanceToPlayer();

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                const a = this.getAngleToPlayer();
                this.angleToPlayer = a;
                this.moveTowardsPlayer();
            } else {
                this.x -= this.currentSpeed;
            }
        } else {
            moveAlongAngle(this, this.angleToPlayer, this.speed);
        }

        if (this.x < this.game.player.x) this.passedPlayer = true;
    }

    updateLogic2() {
        const distanceToPlayer = this.getDistanceToPlayer();

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                const a = this.getAngleToPlayer();
                this.angleToPlayer = a;
                this.moveTowardsPlayer();
            } else {
                this.x -= this.currentSpeed;
            }
        } else {
            this.x -= this.currentSpeed;
        }

        if (this.x < this.game.player.x - 150 || this.game.gameOver) {
            this.passedPlayer = true;
        }
    }

    moveTowardsPlayer() {
        const a = this.getAngleToPlayer();
        moveAlongAngle(this, a, this.speed);
        this.angleToPlayer = a;
        this.moveTowardsPlayerActive = true;
    }

    draw(context) {
        if (this.useLogic1) this.drawLogic1(context);
        else this.drawLogic2(context);
    }

    drawLogic1(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);

            if (this.moveTowardsPlayerActive || this.passedPlayer) {
                context.rotate(this.angleToPlayer);
                if (this.moveTowardsPlayerActive) context.scale(-1, -1);
            }

            drawSprite(
                context,
                this.image,
                this.frameX * this.width,
                0,
                this.width,
                this.height,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        });
    }

    drawLogic2(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);

            if (!this.passedPlayer) {
                context.rotate(this.angleToPlayer);
                if (this.moveTowardsPlayerActive) context.scale(-1, -1);
            }

            drawSprite(
                context,
                this.image,
                this.frameX * this.width,
                0,
                this.width,
                this.height,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        });
    }
}

export class SpearFish extends MovingGroundEnemy {
    constructor(game) {
        super(game, 91.875, 110, 7, 'spearFish');
        this.isRedEnemy = true;
        this.lives = 2;
        this.setFps(60);
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= 4;
        this.game.audioHandler.enemySFX.playSound('stepWaterSound');
    }
}

export class JetFish extends UnderwaterEnemy {
    constructor(game) {
        super(game, 142, 55, 7, 'jetFish');
        this.y = this.game.player.y;
        this.va = Math.random() * 0.001 + 0.1;
        this.setFps(60);
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= 9;
        this.playIfOnScreen('rocketLauncherSound');
    }
}

export class Piper extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 87, 67, 2, 'piperIdle');
        this.state = 'idle';
        this.lives = 2;
        this.setFps(14);
        this.image = getImg('piperIdle');
        this.playOnce = true;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);
        if (playerDistance < 100 || this.lives <= 1) {
            this.state = 'extended';
            this.image = getImg('piperExtended');
            this.width = 82;
            this.height = 234;
            this.maxFrame = 10;
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
}

export class Voltzeel extends FallingEnemy {
    constructor(game) {
        super(game, 107, 87, 4, 'voltzeel');
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
        this.leafAttackConfig = {
            width: 35.416,
            height: 45,
            maxFrame: 11,
            imageId: 'leafAttack',
            cooldown: 5000,
            speedX: 5
        };
        this.lastLeafAttackTime = 4999;
        this.soundId = 'teethChatteringSound';
    }

    throwLeaf() {
        const {
            x,
            y,
            height
        } = this;
        const {
            width,
            height: leafHeight,
            maxFrame,
            imageId
        } = this.leafAttackConfig;

        const firstLeafAttack = new LeafAttack(
            this.game,
            x,
            y + height / 2 - leafHeight / 2,
            width,
            leafHeight,
            maxFrame,
            imageId,
            this.leafAttackConfig.speedX,
            0.0002 + Math.random() * (0.001 - 0.0002)
        );
        this.game.audioHandler.enemySFX.playSound('leafAttackAudio');
        this.game.enemies.push(firstLeafAttack);

        const secondLeafAttack = new LeafAttack(
            this.game,
            x,
            y + height / 2 - leafHeight / 2,
            width,
            leafHeight,
            maxFrame,
            imageId,
            this.leafAttackConfig.speedX * 1.5,
            0.0001 + Math.random() * (0.009 - 0.0001)
        );
        this.game.enemies.push(secondLeafAttack);

        this.lastLeafAttackTime = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.lastLeafAttackTime += deltaTime;
        if (this.lastLeafAttackTime >= this.leafAttackConfig.cooldown && this.x < this.game.width - this.width) {
            this.throwLeaf();
        }
    }
}

export class Chiquita extends FlyingEnemy {
    constructor(game) {
        super(game, 118.82352941176470588235294117647, 85, 16, 'chiquita');
        this.setFps(120);
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('ravenCallAudio');
        }
        if (this.frameX === 7 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('ravenSingleFlap');
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
        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('buzzingFly');
        }
    }
}

export class KarateCroco extends MovingGroundEnemy {
    constructor(game) {
        super(game, 98.25, 140, 3, 'karateCrocoIdle');
        this.isRedEnemy = true;
        this.state = 'idle';
        this.setFps(10);
        this.lives = 2;
        this.flyKickAnimation = new MovingGroundEnemy(game, 146, 140, 3, 'karateCrocoFlyKick');
        this.playsOnce = true;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);
        if ((playerDistance < 1300 && this.y >= this.game.height - this.height - this.game.groundMargin) || this.lives <= 1) {
            this.state = 'flykick';
        }

        if (this.state === 'flykick') {
            if (this.playsOnce && this.isOnScreen()) {
                this.playsOnce = false;
                this.game.audioHandler.enemySFX.playSound('ahhhSound', false, true);
            }
            if (this.flyKickAnimation.frameX < 3) {
                this.flyKickAnimation.update(deltaTime);
                this.x -= 14;
            } else {
                this.x -= 14;
                this.flyKickAnimation.frameX = 3;
            }
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        if (this.state === 'idle') {
            super.draw(context);
        } else if (this.state === 'flykick') {
            withCtx(context, () => {
                setShadow(context, 'red', 10);
                this.flyKickAnimation.x = this.x;
                this.flyKickAnimation.y = this.y;
                this.flyKickAnimation.draw(context);
            });
        }
    }
}

export class Zabkous extends MovingGroundEnemy {
    static STATES = {
        run: {
            imageId: 'zabkousJump',
            width: 234.6470588235294,
            height: 150,
            xOffset: 0,
            yOffset: 0,
        },
        attack: {
            imageId: 'zabkousAttack',
            width: 134.0588235294118,
            height: 100,
            xOffset: 45,
            yOffset: 0,
        },
    };

    constructor(game) {
        super(game, 316, 202, 16, 'zabkousJump');

        this.game = game;
        this.lives = 2;
        this.setFps(60);

        this.state = 'run';
        this.jumpHeight = 160;
        this.jumpDuration = 0.5;
        this.jumpStartTime = 0;
        this.originalY = this.y;
        this.jumpedBeforeDistanceLogic = false;

        this.poisonSpitConfig = {
            width: 59,
            height: 22,
            maxFrame: 11,
            imageId: 'poison_spit',
            speedX: 18,
        };
        this.poisonSpitThrown = false;
        this.playsOnce = true;

        this.applyState('run', { resetJumpFlags: true });
    }

    applyState(newState, { resetJumpFlags = false } = {}) {
        const cfg = Zabkous.STATES[newState];
        if (!cfg) return;

        this.state = newState;

        this.image = getImg(cfg.imageId);
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

    throwPoisonSpit() {
        if (!this.poisonSpitThrown) {
            const { x, y, height } = this;
            const {
                width,
                height: spitHeight,
                maxFrame,
                imageId,
                speedX,
            } = this.poisonSpitConfig;

            const spit = new PoisonSpit(
                this.game,
                x + 20,
                y + 15 + height / 2 - spitHeight / 2,
                width,
                spitHeight,
                maxFrame,
                imageId,
                speedX
            );

            this.game.enemies.push(spit);
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

        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('frogSound', false, true);
        }

        if (this.state === 'run') this.frogRun();
        else if (this.state === 'attack') this.frogAttack();
    }
}

export class SpidoLazer extends MovingGroundEnemy {
    static STATES = {
        walk: {
            imageId: 'spidoLazerWalk',
            width: 134.4210526315789,
            height: 120,
            maxFrame: 18,
            fps: 260,
            xOffset: 0,
            yOffset: 0,
        },
        attack: {
            imageId: 'spidoLazerAttack',
            width: 134.45,
            height: 120,
            maxFrame: 59,
            fps: 120,
            xOffset: 0,
            yOffset: 0,
        },
    };

    constructor(game) {
        const { width, height, maxFrame, imageId } = SpidoLazer.STATES.walk;
        super(game, width, height, maxFrame, imageId);

        this.game = game;
        this.lives = 2;
        this.state = 'walk';
        this.canAttack = true;

        this.laserBeamConfig = {
            width: 300,
            height: 28,
            maxFrame: 9,
            imageId: 'laser_beam',
            speedX: 30,
        };

        this.applyState('walk');
    }

    applyState(newState) {
        const cfg = SpidoLazer.STATES[newState];
        if (!cfg) return;

        this.state = newState;

        this.image = getImg(cfg.imageId);
        this.width = cfg.width;
        this.height = cfg.height;
        this.maxFrame = cfg.maxFrame;
        this.setFps(cfg.fps);
        this.frameX = 0;

        const groundY = this.game.height - this.height - this.game.groundMargin;
        this.y = groundY + cfg.yOffset;
        this.x += cfg.xOffset;
    }

    throwLaserBeam() {
        const { x, y, height } = this;
        const {
            width,
            height: laserHeight,
            maxFrame,
            imageId,
            speedX,
        } = this.laserBeamConfig;

        const laser = new LaserBeam(
            this.game,
            x - 170,
            y - 15 + height / 2 - laserHeight / 2,
            width,
            laserHeight,
            maxFrame,
            imageId,
            speedX
        );
        this.game.enemies.push(laser);
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
        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('buzzingFly');
        }
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

        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('buzzingFly');
        }

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
        if (this.playsOnce && this.isOnScreen()) {
            this.playsOnce = false;
            this.game.audioHandler.enemySFX.playSound('buzzingFly');
        }
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

            this.minHSpeed = 5;
            this.maxHSpeed = 11;

            this.jumpTickFpsEstimate = 60;
        }
    }

    startJump() {
        this.isJumping = true;
        this.jumpStartTime = this.game.hiddenTime;
        this.groundY = this.game.height - this.height - this.game.groundMargin;

        if (this.game.gameOver) {
            this.jumpDir = -1;
            if (this.jumpStyle === 'smart') this.horizontalSpeed = this.baseHorizontalSpeed;
            return;
        }

        if (this.jumpStyle === 'low') {
            this.jumpDir = this.game.player.x >= this.x ? 1 : -1;
        } else {
            const playerCenterX = this.game.player.x + (this.game.player.width ? this.game.player.width / 2 : 0);
            const myCenterX = this.x + this.width / 2;
            const deltaX = playerCenterX - myCenterX;

            this.jumpDir = deltaX >= 0 ? 1 : -1;

            const expectedTicks = Math.max(1, Math.round(this.jumpDuration * this.jumpTickFpsEstimate));
            const neededSpeed = Math.abs(deltaX) / expectedTicks;

            this.horizontalSpeed = clamp(neededSpeed, this.minHSpeed, this.maxHSpeed);
        }
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

export class Tauro extends MovingGroundEnemy {
    constructor(game) {
        super(game, 151, 132, 2, 'tauro');
        this.isRedEnemy = true;
        this.lives = 2;
        this.setFps(15);
        this.soundId = 'stomp';
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= 8;
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

export class HangingSpidoLazer extends ClimbingEnemy {
    constructor(game) {
        super(game, 123.2333333333333, 110, 59, 'hangingSpidoLazer');
        this.lives = 2;
        this.setFps(120);
        this.swingAngle = 0;
        this.swingSpeed = 0.002 + Math.random() * 0.006;
        this.swingAmplitude = 1 + Math.random() * 4;
        this.canAttack = true;
        this.laserBeamConfig = {
            width: 300,
            height: 28,
            maxFrame: 9,
            imageId: 'laser_beam',
            speedX: 30
        };
    }

    throwLaserBeam() {
        const {
            x,
            y,
            height
        } = this;
        const {
            width,
            height: spitHeight,
            maxFrame,
            imageId
        } = this.laserBeamConfig;

        const laser = new LaserBeam(this.game, x - 185, y + 25 + height / 2 - spitHeight / 2, width, spitHeight, maxFrame, imageId, this.laserBeamConfig.speedX);
        this.game.enemies.push(laser);
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.swingAngle += this.swingSpeed * deltaTime;
        const swingOffsetX = Math.sin(this.swingAngle) * this.swingAmplitude;
        this.x += swingOffsetX;
        if (this.frameX === 27 && this.x <= this.game.width && this.canAttack === true) {
            this.throwLaserBeam();
            this.game.audioHandler.enemySFX.playSound('laserAttackAudio', false, true);
            this.canAttack = false;
        }
        if (this.frameX === 59) this.canAttack = true;
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
export class Cactus extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 71, 90, 0, 'cactus');
        this.isStunEnemy = true;
    }
}

export class PetroPlant extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 91.555555555555555555555555555556, 100, 1, 'petroPlant');
        this.rockAttackConfig = {
            width: 37,
            height: 40,
            maxFrame: 0,
            imageId: 'rockProjectile',
            cooldown: 5000,
            speedX: 5
        };
        this.lastRockAttackTime = 4999;
        this.soundId = 'teethChatteringSound';
    }

    throwRockProjectile() {
        const {
            x,
            y,
            height
        } = this;
        const {
            width,
            height: leafHeight,
            maxFrame,
            imageId
        } = this.rockAttackConfig;

        const rockProjectile = new RockProjectile(
            this.game,
            x,
            y + height / 2 - leafHeight / 2,
            width,
            leafHeight,
            maxFrame,
            imageId,
            this.rockAttackConfig.speedX,
            0.02 + Math.random() * (0.01 - 0.0002)
        );
        this.game.audioHandler.enemySFX.playSound('rockAttackSound');
        this.game.enemies.push(rockProjectile);

        const secondRockAttack = new RockProjectile(
            this.game,
            x,
            y + height / 2 - leafHeight / 2,
            width,
            leafHeight,
            maxFrame,
            imageId,
            this.rockAttackConfig.speedX * 1.5,
            0.02 + Math.random() * (0.01 - 0.0002)
        );
        this.game.enemies.push(secondRockAttack);

        this.lastRockAttackTime = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.lastRockAttackTime += deltaTime;
        if (this.lastRockAttackTime >= this.rockAttackConfig.cooldown && this.x < this.game.width - this.width) {
            this.throwRockProjectile();
        }
    }
}

export class Plazer extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 75, 89, 2, 'plazer');
        this.setFps(6);
        this.canAttack = true;
    }
    throwPurpleLaserAttack() {
        const purpleLaser = new PurpleLaser(this.game, this.x - 40, this.y + 15);
        this.game.enemies.push(purpleLaser);
    }
    update(deltaTime) {
        super.update(deltaTime);

        if (!this.game.gameOver && this.x >= this.game.player.x) {
            if (this.frameX === 1 && this.canAttack && this.x + this.width / 2 < this.game.width) {
                this.canAttack = false;
                this.throwPurpleLaserAttack();
                this.game.audioHandler.enemySFX.playSound('laserAttackAudio', false, true);
                this.darkLaserTimer = 0;
            }
        }
        if (this.frameX === 2) this.canAttack = true;
    }
}

export class Veynoculus extends FlyingEnemy {
    constructor(game) {
        super(game, 57, 37, 4, 'veynoculus');
    }
}

export class Volcanurtle extends MovingGroundEnemy {
    constructor(game) {
        super(game, 177, 107, 5, 'volcanurtle');
        this.isRedEnemy = true;
        this.lives = 2;
        this.setFps(5);
        this.xSpeed = Math.floor(Math.random() * 1) + 1;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x -= this.xSpeed;
    }
}

export class TheRock extends MovingGroundEnemy {
    constructor(game) {
        super(game, 132, 132, 11, 'theRock');
        this.isRedEnemy = true;
        this.state = 'idle';

        this.playSmashOnce = true;
        this.setFps(25);
        this.lives = 2;
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.state === 'idle') {
            this.x -= 2;
            if ((this.frameX === 0 || this.frameX === 7) && this.isOnScreen()) {
                this.game.audioHandler.enemySFX.playSound('theRockStomp');
            }
        }
        const playerDistance = Math.abs(this.game.player.x - this.x);
        if (playerDistance < 100 && this.playSmashOnce) {
            this.state = 'smash';
            this.frameX = 0;
            this.image = getImg('theRockSmash');
            this.width = 182;
            this.height = 162;
            this.maxFrame = 6;
            this.y = this.game.height - this.height - this.game.groundMargin;
            this.x = this.x - 70;
            this.setFps(11);
            this.playSmashOnce = false;
        }

        if (this.state === 'smash' && this.frameX === this.maxFrame) {
            this.state = 'idle';
            this.frameX = 0;
            this.image = getImg('theRock');
            this.width = 132;
            this.height = 132;
            this.maxFrame = 11;
            this.x = this.x + 70;
            this.y = this.game.height - this.height - this.game.groundMargin;
            this.setFps(25);
        }
    }
}

export class VolcanoWasp extends BeeInstances {
    constructor(game) {
        super(game, 113, 125, 1, 'volcanoWasp', 1100, 3, 12, 140);
        this.soundId = 'angryBeeBuzzing';
    }
}

export class Rollhog extends MovingGroundEnemy {
    constructor(game) {
        super(game, 125, 85, 2, 'rollhogWalk');
        this.lives = 2;
        this.state = 'idle';
        this.setFps(3);
        this.image = getImg('rollhogWalk');
        this.playOnce = true;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.state === 'idle') this.x -= 1;
        else this.x -= 10;

        const playerDistance = Math.abs(this.game.player.x - this.x);
        if (playerDistance < 1100) {
            this.state = 'roll';
            this.image = getImg('rollhogRoll');
            this.width = 97;
            this.height = 92;
            this.y = this.game.height - this.height - this.game.groundMargin;
        }

        if (this.state === 'roll') {
            this.setFps(15);
            if (this.playOnce) {
                this.playOnce = false;
                this.game.audioHandler.enemySFX.playSound('rollhogRollSound', false, true);
            }
            if (this.frameX === 10) this.frameX = 9;
        }

        if (this.x + this.width < 0 || this.lives <= 0) {
            this.game.audioHandler.enemySFX.stopSound('rollhogRollSound');
        }
    }
}

export class Dragon extends FlyingEnemy {
    constructor(game) {
        super(game, 182, 172, 11, 'dragon');
        this.lives = 2;
        this.setFps(14);
        this.canAttack = true;
        this.windAttackConfig = {
            width: 105,
            height: 120,
            maxFrame: 5,
            imageId: 'windAttack',
            speedX: 4,
            fps: 20,
            offsetX: 0,
            offsetY: 0
        };
    }

    throwWindAttack() {
        const windAttack = new WindAttack(
            this.game,
            this.x + this.windAttackConfig.offsetX + 50,
            this.y + this.windAttackConfig.offsetY + 20,
            this.windAttackConfig.width,
            this.windAttackConfig.height,
            this.windAttackConfig.maxFrame,
            this.windAttackConfig.imageId,
            this.windAttackConfig.speedX,
            this.game.player
        );
        this.game.enemies.push(windAttack);
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

// Bonus Map 1 --------------------------------------------------------------------------------------------------------------------------------------
export class IceSilknoir extends ClimbingEnemy {
    constructor(game) {
        super(game, 120, 144, 5, 'iceSilknoir');
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