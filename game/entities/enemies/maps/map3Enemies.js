import { normalizeDelta } from "../../../config/constants.js";
import { withCtx, drawSprite, clamp, moveAlongAngle } from "../core/enemyUtils.js";
import { UnderwaterEnemy, MovingGroundEnemy, ImmobileGroundEnemy, FallingEnemy } from "../core/enemyTypes.js";
import { InkBeam } from "../core/projectiles.js";

export class Razorfin extends UnderwaterEnemy {
    constructor(game) {
        super(game, 100, 70, 3, 'razorfin');
        this.setFps(10);
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= 3 * dt;
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
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= 3 * dt;
        this.sinAngle += this.sinSpeed * dt;
        this.y = this.baseY + this.amplitude * Math.sin(this.sinAngle);
        this.playSoundOnce('jellionSound');
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
        const dt = normalizeDelta(deltaTime);

        const distanceToPlayer = this.getDistanceToPlayer();
        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                const a = this.getAngleToPlayer();
                this.angleToPlayer = a;
                this.moveTowardsPlayerActive = true;
                moveAlongAngle(this, a, this.speed, dt);
            } else {
                this.x -= this.currentSpeed * dt;
            }
        } else {
            moveAlongAngle(this, this.angleToPlayer, this.speed, dt);
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
        this.coinValue = 2;
        this.setFps(60);
        this.loopingSoundId = 'stepWaterSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= 4 * dt;
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
        const dt = normalizeDelta(deltaTime);
        this.x -= 9 * dt;
        this.playIfOnScreen('rocketLauncherSound');
    }
}

export class Piper extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 87, 67, 2, 'piper');
        this.state = 'idle';
        this.lives = 2;
        this.coinValue = 2;
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
        const dt = normalizeDelta(deltaTime);

        const distanceToPlayer = Math.abs(this.y - this.game.player.y);

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                const a = this.getAngleToPlayer();
                this.angleToPlayer = a;
                this.speedY = Math.sin(a) * this.speed;
                this.moveTowardsPlayerActive = true;
            } else {
                this.moveTowardsPlayerActive = false;
                this.y += this.currentSpeed * dt;
            }
        }

        if (this.moveTowardsPlayerActive) this.y += this.speedY * dt;
        if (this.x < this.game.player.x) this.passedPlayer = true;
        if (this.frameX === 4 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('electricitySound');
    }
}

export class Garry extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 165, 122, 3, 'garry');
        this.inkCooldown = 3000;
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
