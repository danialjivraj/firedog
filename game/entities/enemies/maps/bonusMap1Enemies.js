import { normalizeDelta } from "../../../config/constants.js";
import { withCtx, drawSprite, moveAlongAngle } from "../core/enemyUtils.js";
import { ImmobileGroundEnemy, MovingGroundEnemy, FlyingEnemy, FallingEnemy, ClimbingEnemy, UndergroundEnemy } from "../core/enemyTypes.js";
import { FrozenShard } from "../core/projectiles.js";

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
        const dt = normalizeDelta(deltaTime);
        this.y += this.speedY * Math.sin(this.angle) * dt;
        this.angle += this.va * dt;
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
        const dt = normalizeDelta(deltaTime);
        this.playSoundOnce('buzzingFly');

        if (this.lockedAngle !== null) {
            moveAlongAngle(this, this.lockedAngle, this.currentSpeed, dt);
        } else if (this.x >= this.game.player.x && this.getDistanceToPlayer() <= this.chaseDistance) {
            const a = this.getAngleToPlayer();
            moveAlongAngle(this, a, this.currentSpeed, dt);
            if (this.x < this.game.player.x) this.lockedAngle = a;
        } else {
            this.x -= this.currentSpeed * dt;
        }
    }
}

export class IcePlant extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 78.42857142857143, 115, 6, 'icePlant');
        this.shardCooldown = 4000;
        this.lastShardTime = 3999;
    }

    throwShard() {
        const shard = new FrozenShard(
            this.game,
            this.x + 30,
            this.y + this.height / 2 - 20,
            8
        );
        shard.speedY = 0.5;
        this.game.enemies.push(shard);
        this.playIfOnScreen('iceballThrowSound');
        this.lastShardTime = 0;
    }

    update(deltaTime) {
        const prevFrameX = this.frameX;
        super.update(deltaTime);
        this.lastShardTime += deltaTime;
        if (this.lastShardTime >= this.shardCooldown && this.frameX === 1 && prevFrameX !== 1 && this.x < this.game.width - this.width && this.x >= this.game.player.x) {
            this.throwShard();
        }
    }
}

export class Globby extends MovingGroundEnemy {
    constructor(game) {
        super(game, 115, 110, 5, 'globby');
        this.setFps(12);
        this.xSpeed = Math.floor(Math.random() * 6) + 2;
        this.loopingSoundId = 'globbySound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= this.xSpeed * dt;
        this.playIfOnScreen('globbySound');
    }
}

export class CryopedeMini extends MovingGroundEnemy {
    constructor(game, x, y, launchVX) {
        super(game, 126 * 0.65, 80 * 0.65, 5, 'cryopede');
        this.setFps(14);
        this.x = x;
        this.y = y;
        this.vx = launchVX;
        this.vy = -(Math.random() * 5 + 7);
        this.gravity = 0.4;
        this.grounded = false;
        this.groundY = game.height - (80 * 0.65) - game.groundMargin;
        this.loopingSoundId = 'cryopedeWalkingSound';
    }
    update(deltaTime) {
        const dt = normalizeDelta(deltaTime);
        if (!this.grounded) {
            if (!this.game.cabin.isFullyVisible) this.x -= this.game.speed * dt;
            this.x += this.vx * dt;
            this.vy += this.gravity * dt;
            this.y += this.vy * dt;
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
        this.x -= this.xSpeed * dt;
        if (this.grounded) this.playIfOnScreen('cryopedeWalkingSound');
    }
    draw(context) {
        withCtx(context, () => {
            context.scale(0.65, 0.65);
            drawSprite(context, this.image, this.frameX * 126, 0, 126, 80, this.x / 0.65, this.y / 0.65, 126, 80);
        });
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class Cryopede extends MovingGroundEnemy {
    constructor(game) {
        super(game, 126, 80, 5, 'cryopede');
        this.setFps(12);
        this.xSpeed = Math.floor(Math.random() * 2) + 2;
        this.spawned = false;
        this.loopingSoundId = 'cryopedeWalkingSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= this.xSpeed * dt;
        this.playIfOnScreen('cryopedeWalkingSound');
        if (!this.spawned && this.lives <= 0) {
            this.spawned = true;
            const cx = this.x + this.width / 2;
            this.game.enemies.push(new CryopedeMini(this.game, cx, this.y, 3));
        }
    }
}

export class DrillIce extends UndergroundEnemy {
    constructor(game) {
        super(game, 197, 115, 3, 'drillice', {
            warningDuration: 800,
            riseDuration: 300,
            holdDuration: 2100,
            triggerDistance: 700,
            soundIds: {
                emerge: 'drilliceEmergeSound',
                retract: 'drilliceRetractSound'
            }
        });
        this.isSlowEnemy = true;
    }
    onEmergeComplete() {
        if (this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('drilliceHoldSound', true);
        this.loopingSoundId = 'drilliceHoldSound';
    }
    onRetractStart() {
        super.onRetractStart();
        this.game.audioHandler.enemySFX.stopSound('drilliceHoldSound');
        this.loopingSoundId = null;
    }
}

export class Frostling extends FallingEnemy {
    constructor(game) {
        super(game, 46.5, 100, 1, 'frostling');
        this.isSlowEnemy = true;
        this.speedY = Math.random() * 4 + 4;
        this.setFps(5);
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.playSoundOnce('frostlingSound');
    }
}

export class Frobat extends FlyingEnemy {
    constructor(game) {
        super(game, 156.75, 130, 3, 'frobat');
        this.setFps(15);
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.playSoundOnce('batPitch');
        if (this.frameX === 3 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('wooshBat');
    }
}
