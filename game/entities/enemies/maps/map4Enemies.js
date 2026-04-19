import { normalizeDelta } from "../../../config/constants.js";
import { withCtx, drawSprite, setShadow } from "../core/enemyUtils.js";
import { ImmobileGroundEnemy, MovingGroundEnemy, FlyingEnemy, FallingEnemy, ClimbingEnemy, UndergroundEnemy } from "../core/enemyTypes.js";
import { LeafAttack, BrambleLeafAttack } from "../core/projectiles.js";
import { Skulnap } from "./map1Enemies.js";

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
        const dt = normalizeDelta(deltaTime);
        this.x -= this.xSpeed * dt;
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
        this.coinValue = 2;
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
            const dt = normalizeDelta(deltaTime);
            this.playSoundOnce('ahhhSound', false, true);
            this.x -= 14 * dt;
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
            triggerDistance: 1000,
            soundIds: {
                emerge: 'vinelashEmergeSound',
                retract: 'vinelashRetractSound'
            }
        });
        this.isPoisonEnemy = true;
        this.lives = 2;
        this.coinValue = 2;
        this.setFps(12);
    }
}

export class Bramble extends ClimbingEnemy {
    constructor(game) {
        super(game, 174.2, 140, 4, 'bramble');
        this.lives = 2;
        this.coinValue = 2;
        this.setFps(13);
        this.soundId = 'nightSpiderSound';
        this.swingAngle = 0;
        this.swingSpeed = 0.002 + Math.random() * 0.006;
        this.swingAmplitude = 1 + Math.random() * 4;
        this.attackCooldown = 1000;
        this.attackCooldownDuration = 1000;
    }

    throwLeaves() {
        const spawnX = this.x + this.width / 2 - 17;
        const spawnY = this.y + this.height - 10;
        this.game.enemies.push(new BrambleLeafAttack(this.game, spawnX, spawnY, -1.5, 4));
        this.game.enemies.push(new BrambleLeafAttack(this.game, spawnX, spawnY, 1.5, 4));
        this.game.audioHandler.enemySFX.playSound('leafAttackAudio');
        this.attackCooldown = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        const maxY = this.game.height * 0.75 - this.height;
        if (this.y > maxY && this.speedY > 0) {
            this.y = maxY;
            this.speedY *= -1;
        }
        this.swingAngle += this.swingSpeed * deltaTime;
        this.x += Math.sin(this.swingAngle) * this.swingAmplitude * dt;

        if (this.x < this.game.width - this.width) {
            this.attackCooldown += deltaTime;
            if (this.attackCooldown >= this.attackCooldownDuration) {
                this.throwLeaves();
            }
        }
    }

    draw(context) {
        context.beginPath();
        context.moveTo(this.x + this.width / 2, 0);
        context.lineTo(this.x + this.width / 2, this.y + 50);
        context.stroke();
        super.draw(context);
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
