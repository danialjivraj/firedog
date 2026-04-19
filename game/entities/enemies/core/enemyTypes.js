import { normalizeDelta } from "../../../config/constants.js";
import { moveAlongAngle, getImg, clamp, drawSprite, withCtx } from "./enemyUtils.js";
import { Enemy } from "./enemyBase.js";

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
        const dt = normalizeDelta(deltaTime);
        this.angle += this.va * dt;
        this.y += Math.sin(this.angle) * dt;
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
        this._isMovingGround = true;
    }
}

export class ImmobileGroundEnemy extends GroundEnemy {
    constructor(game, w, h, m, id) {
        super(game, w, h, m, id);
        this._isImmobileGround = true;
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
        const dt = normalizeDelta(deltaTime);
        this.y += this.speedY * dt;
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
        const dt = normalizeDelta(deltaTime);
        this.angle += this.va * dt;
        this.y += Math.sin(this.angle) * dt;
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
        const dt = normalizeDelta(deltaTime);
        const distanceToPlayer = this.getDistanceToPlayer();

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                const a = this.getAngleToPlayer();
                this.angleToPlayer = a;
                moveAlongAngle(this, a, this.speed, dt);
            } else {
                this.x -= this.currentSpeed * dt;
            }
        } else {
            moveAlongAngle(this, this.angleToPlayer, this.speed, dt);
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

        const others = [];
        const ctor = this.constructor;
        for (let i = 0; i < this.game.enemies.length; i++) {
            const e = this.game.enemies[i];
            if (e.constructor === ctor && e !== this && !e.markedForDeletion) others.push(e);
        }

        const minGap = this.width + 4;

        let centerX = this.centerX;
        const maxAttempts = 20;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            let candidate;

            if (Math.random() < 0.5) {
                const playerCenterX = this.game.player.x + this.game.player.width / 2;
                const spread = 260;
                candidate = playerCenterX + (Math.random() * spread - spread / 2);
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
        const dt = normalizeDelta(deltaTime);
        if (!this.game.cabin.isFullyVisible) {
            this.x -= this.game.speed * dt;
            this.centerX -= this.game.speed * dt;
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
