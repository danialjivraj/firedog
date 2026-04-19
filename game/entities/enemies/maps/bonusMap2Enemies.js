import { normalizeDelta } from "../../../config/constants.js";
import { withCtx, drawSprite, moveAlongAngle } from "../core/enemyUtils.js";
import { ImmobileGroundEnemy, MovingGroundEnemy, FlyingEnemy, FallingEnemy } from "../core/enemyTypes.js";
import { YellowOrb, RedOrb } from "../core/projectiles.js";

export class Golex extends MovingGroundEnemy {
    constructor(game) {
        super(game, 152, 140, 1, 'golex');
        this.lives = 2;
        this.coinValue = 2;
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
        this.playsOnce = true;
    }
    _nextSegment() {
        this._distCovered = 0;
        this._phase++;
        this._segmentDist = 80 + Math.random() * 200;
        this.playIfOnScreen('golexMovingSound', false, true);
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.playSoundOnce('golexAppearingSound');
        switch (this._phase % 4) {
            case 0:
                this.x -= this._currentSpeed * dt;
                this._distCovered += this._currentSpeed * dt;
                break;
            case 1:
                this.y -= this._currentSpeed * dt;
                this._distCovered += this._currentSpeed * dt;
                break;
            case 2:
                this.x -= this._currentSpeed * dt;
                this._distCovered += this._currentSpeed * dt;
                break;
            case 3:
                this.y += this._currentSpeed * dt;
                this._distCovered += this._currentSpeed * dt;
                break;
        }
        if (this._distCovered >= this._segmentDist) this._nextSegment();
        const prevY = this.y;
        this.y = Math.max(0, Math.min(this.groundY, this.y));
        if (this.y !== prevY) this._nextSegment();
    }
}

export class Runespider extends MovingGroundEnemy {
    constructor(game) {
        super(game, 98.66666666666667, 70, 2, 'runespider');
        this.setFps(12);
        this.xSpeed = Math.floor(Math.random() * 2) + 2;
        this.loopingSoundId = 'runespiderWalkingSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= this.xSpeed * dt;
        this.playIfOnScreen('runespiderWalkingSound');
    }
}

export class OozelMini extends MovingGroundEnemy {
    constructor(game, x, y, launchVX) {
        super(game, 124 * 0.715, 50 * 0.715, 3, 'oozel');
        this.setFps(8);
        this.x = x;
        this.y = y;
        this.vx = launchVX;
        this.vy = -(Math.random() * 5 + 7);
        this.gravity = 0.4;
        this.grounded = false;
        this.groundY = game.height - (50 * 0.715) - game.groundMargin;
        this.loopingSoundId = 'slimyWalkSound';
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
                this.xSpeed = Math.floor(Math.random() * 2) + 3;
            }
            if (this.x + this.width < 0) this.markedForDeletion = true;
            return;
        }
        super.update(deltaTime);
        this.x -= this.xSpeed * dt;
        this.playIfOnScreen('slimyWalkSound');
    }
    draw(context) {
        drawSprite(context, this.image, this.frameX * 124, 0, 124, 50, this.x, this.y, this.width, this.height);
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class Oozel extends MovingGroundEnemy {
    constructor(game) {
        super(game, 124, 50, 3, 'oozel');
        this.setFps(8);
        this.groundY = game.height - this.height - game.groundMargin;
        this.y = -this.height;
        this.x = game.width - this.width;
        this.speedY = Math.random() * 2 + 3;
        this.xSpeed = Math.floor(Math.random() * 2) + 3;
        this.state = 'falling';
        this.playsOnce = true;
        this.loopingSoundId = 'slimyWalkSound';
        this.spawned = false;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        if (this.state === 'falling') {
            this.playSoundOnce('oozelFallingSound');
            this.y += this.speedY * dt;
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.speedY = 0;
                this.state = 'moving';
            }
        } else {
            this.x -= this.xSpeed * dt;
            this.playIfOnScreen('slimyWalkSound');
        }
        if (!this.spawned && this.lives <= 0) {
            this.spawned = true;
            const cx = this.x + this.width / 2;
            this.game.enemies.push(new OozelMini(this.game, cx, this.y, -4));
            this.game.enemies.push(new OozelMini(this.game, cx, this.y, 3));
        }
    }
}

export class Voidserp extends MovingGroundEnemy {
    constructor(game) {
        super(game, 217, 100, 1, 'voidserp');
        this.lives = 2;
        this.coinValue = 2;
        this.setFps(6);
        this.xSpeed = Math.floor(Math.random() * 4) + 2;
        this.loopingSoundId = 'voidserpSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= this.xSpeed * dt;
        this.playIfOnScreen('voidserpSound');
    }
}

export class Sigilfly extends FlyingEnemy {
    constructor(game) {
        super(game, 128, 100, 1, 'sigilfly');
        this.playsOnce = true;
        this.isRedEnemy = true;
        this.speed = 1.5;
        this.lockedAngle = null;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        if (this.lockedAngle !== null) {
            moveAlongAngle(this, this.lockedAngle, this.speed, dt);
        } else {
            const a = this.getAngleToPlayer();
            moveAlongAngle(this, a, this.speed, dt);
            if (this.x < this.game.player.x) this.lockedAngle = a;
        }
        this.playSoundOnce('buzzingFly');
    }
}

export class Mawrune extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 108.5, 120, 1, 'mawrune');
        this.setFps(7);
        this.isFrozenEnemy = true;
        this.lastRockAttackTime = 2999;
        this.soundId = 'mawruneBiteSound';
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
        if (this.lastRockAttackTime >= 3000 && this.x < this.game.width - this.width && this.game.player.x < this.x) {
            this.throwYellowOrbProjectile();
        }
    }
}

export class Runecko extends MovingGroundEnemy {
    constructor(game) {
        super(game, 124.5, 80, 1, 'runecko');
        this.state = 'idle';
        this.setFps(7);
        this.lives = 2;
        this.coinValue = 2;
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

            const dt = normalizeDelta(deltaTime);
            this.x -= 14 * dt;
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
        this.soundId = 'angryBeeBuzzing';

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

export class Wardrake extends FlyingEnemy {
    constructor(game) {
        super(game, 182, 172, 11, 'wardrake');
        this.lives = 2;
        this.coinValue = 2;
        this.setFps(14);
        this.canAttack = true;
        this._attackFrame = null;
        this.playsOnce = true;
    }

    throwRedOrbs() {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const spread = Math.PI / 6;
        for (let i = -1; i <= 1; i++) {
            this.game.enemies.push(new RedOrb(this.game, cx - 25, cy - 25, Math.PI + spread * i));
        }
        this.playIfOnScreen('wardrakeProjectileSound');
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.playSoundOnce('wardrakeGrowlSound');

        if (this._attackFrame === null && this.x + this.width <= this.game.width) {
            const distTo1 = (1 - this.frameX + 11) % 11;
            const distTo7 = (7 - this.frameX + 11) % 11;
            this._attackFrame = distTo1 <= distTo7 ? 1 : 7;
        }

        if (this._attackFrame !== null && this.frameX === this._attackFrame && this.canAttack === true) {
            this.canAttack = false;
            if (!this.game.gameOver) this.throwRedOrbs();
        }

        if (this.frameX === 10) this.canAttack = true;
        if (this.frameX === 0 && this.isOnScreen()) {
            this.game.audioHandler.enemySFX.playSound('ravenSingleFlap');
            this.game.audioHandler.enemySFX.playSound('flyMonsterFlap');
        }
    }
}
