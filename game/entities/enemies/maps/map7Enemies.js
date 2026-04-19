import { normalizeDelta } from "../../../config/constants.js";
import { withCtx, drawSprite, moveAlongAngle } from "../core/enemyUtils.js";
import { ImmobileGroundEnemy, MovingGroundEnemy, FlyingEnemy, VerticalEnemy, BeeInstances, UndergroundEnemy } from "../core/enemyTypes.js";
import { ScorpionPoison, LavaBall, VolcanicBubble } from "../core/projectiles.js";

export class Cactrix extends MovingGroundEnemy {
    constructor(game) {
        super(game, 115.3, 130, 9, 'cactrix');
        this.lives = 2;
        this.coinValue = 2;
        this.setFps(20);
        this.isStunEnemy = true;
        this.xSpeed = Math.floor(Math.random() * 2) + 5;
        this.soundId = 'venoblitzRunningSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= this.xSpeed * dt;
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
        this.coinValue = 2;
        this.setFps(8);
        this.xSpeed = Math.floor(Math.random() * 1) + 1;
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= this.xSpeed * dt;
        this.playSoundOnce('volcanurtleSound');
    }
}

export class VolcanoWasp extends BeeInstances {
    constructor(game) {
        super(game, 93, 90, 5, 'volcanoWasp', 1100, 3, 12, 140);
        this.soundId = 'angryBeeBuzzing';
    }
}

export class Magmapod extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 167, 130, 1, 'magmapod');
        this.isRedEnemy = true;
        this.lives = 3;
        this.coinValue = 3;
        this.setFps(7);
        this.bubbleCooldown = 1000;
        this.bubbleTimer = 800;
    }

    throwBubble() {
        const bx = this.x + 66;
        const by = this.y + 8;
        this.game.audioHandler.enemySFX.playSound('magmapodProjectileSound', false, true);
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

export class Scorvex extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 161, 150, 9, 'scorvex');
        this.setFps(14);
        this.prevFrameX = -1;
        this.poisonCooldown = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.poisonCooldown > 0) this.poisonCooldown -= deltaTime;
        const player = this.game.player;
        const playerAhead = player.x < this.x;
        if (this.frameX === 4 && this.prevFrameX !== 4 && this.poisonCooldown <= 0 && this.x + this.width / 2 < this.game.width && playerAhead && !this.game.gameOver) {
            this.game.enemies.push(new ScorpionPoison(this.game, this.x + 35, this.y + 10));
            this.playIfOnScreen('scorvexProjectileSound');
            this.poisonCooldown = 1300;
        }
        this.prevFrameX = this.frameX;
    }
}

export class EmberFly extends FlyingEnemy {
    constructor(game) {
        super(game, 85.5, 100, 1, 'emberFly');
        this.setFps(7);
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.playSoundOnce('buzzingFly');
    }
}

export class Bloburn extends VerticalEnemy {
    constructor(game) {
        super(game, 52, 50, 0, 'bloburn');
        this.isPoisonEnemy = true;
        this.initialSpeed = 3;
        this.currentSpeed = 4;
        this.chaseDistance = this.game.width;
        this.loopingSoundId = 'bloburnSound';
        this.rotation = 0;
        this.rotationSpeed = 0.05;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.playIfOnScreen('bloburnSound');
        this.rotation += this.rotationSpeed * dt;

        const distanceToPlayer = this.getDistanceToPlayer();

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                const a = this.getAngleToPlayer();
                this.angleToPlayer = a;
                moveAlongAngle(this, a, this.currentSpeed, dt);
            } else {
                this.x -= this.currentSpeed * dt;
            }
        } else {
            moveAlongAngle(this, this.angleToPlayer, this.currentSpeed, dt);
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

export class Scorble extends MovingGroundEnemy {
    constructor(game) {
        super(game, 90.25, 60, 3, 'scorble');
        this.setFps(20);
        this.xSpeed = Math.floor(Math.random() * 2) + 6;
        this.soundId = 'scorbleSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= this.xSpeed * dt;
    }
}

export class Lavaryn extends UndergroundEnemy {
    constructor(game) {
        super(game, 176.5, 160, 1, 'lavaryn', {
            warningDuration: 500,
            riseDuration: 400,
            holdDuration: 3200,
            triggerDistance: 1600,
            soundIds: {
                emerge: 'lavarynEmergeSound',
                retract: 'lavarynEmergeSound'
            }
        });
        this.lives = 2;
        this.coinValue = 2;
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
                this.playIfOnScreen('lavarynProjectileSound');
            }
        }
    }
}
