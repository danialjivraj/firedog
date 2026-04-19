import { normalizeDelta } from "../../../config/constants.js";
import { withCtx, moveAlongAngle } from "../core/enemyUtils.js";
import { ImmobileGroundEnemy, MovingGroundEnemy, FlyingEnemy, VerticalEnemy, ClimbingEnemy } from "../core/enemyTypes.js";
import { LeafAttack } from "../core/projectiles.js";

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
        this.game.audioHandler.enemySFX.playSound('skellyJumpSound');
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
            const dt = normalizeDelta(deltaTime);
            const progress = (this.game.hiddenTime - this.jumpStartTime) / (this.jumpDuration * 1000);
            if (progress < 1) {
                this.y = this.groundY - this.jumpHeight * Math.sin(progress * Math.PI);
                this.x += this.jumpDir * this.horizontalSpeed * dt;
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
        const dt = normalizeDelta(deltaTime);
        this.y += this.speedY * Math.sin(this.angle) * dt;
        this.angle += this.va * dt;
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
        const dt = normalizeDelta(deltaTime);
        this.va = Math.random() * 0.09 + 0.01;
        this.y += 1.5 * Math.sin(this.angle) * this.curve * dt;
        this.angle += 0.005 * dt;

        const distanceToPlayer = this.getDistanceToPlayer();

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                const a = this.getAngleToPlayer();
                this.angleToPlayer = a;
                moveAlongAngle(this, a, this.currentSpeed, dt);
            } else {
                this.x -= this.currentSpeed * dt;
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
            context.globalAlpha = 0.5;
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
        const dt = normalizeDelta(deltaTime);
        this.playIfOnScreen('verticalGhostSound');

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
        const dt = normalizeDelta(deltaTime);
        this.playIfOnScreen('auraSoundEffect', true);

        const distanceToPlayer = this.getDistanceToPlayer();

        if (!this.passedPlayer) {
            if (distanceToPlayer <= this.chaseDistance) {
                this.angleToPlayerVal = this.getAngleToPlayer();
                moveAlongAngle(this, this.angleToPlayerVal, this.currentSpeed, dt);
            } else {
                this.x -= this.currentSpeed * dt;
            }
        } else {
            moveAlongAngle(this, this.angleToPlayerVal, this.currentSpeed, dt);
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
