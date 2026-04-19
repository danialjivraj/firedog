import { normalizeDelta } from "../../../config/constants.js";
import { withCtx, drawSprite, setShadow } from "../core/enemyUtils.js";
import { MovingGroundEnemy, FlyingEnemy, VerticalEnemy } from "../core/enemyTypes.js";
import { WindAttack } from "../core/projectiles.js";

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
        const dt = normalizeDelta(deltaTime);

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
                this.x -= 3 * dt;
            } else {
                this.y = this.originalY;
                this.isJumping = false;
                this.hasJumped = true;
            }
        }

        if (this.state === 'jump') {
            this.jumpAnimation.update(deltaTime);
            this.x -= 3 * dt;
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
            this.x -= 3 * dt;

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
            this.x -= 3 * dt;
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
        super(game, 132.3333333333333, 70, 5, 'vertibat');
        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;
        this.amplitude = 3;
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x += this.amplitude * Math.sin(this.angle) * dt;
        this.angle += this.va * dt;
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
        const dt = normalizeDelta(deltaTime);
        this.x += this.amplitude * Math.sin(this.angle) * dt;
        this.angle += this.va * dt;
        this.playSoundOnce('helicopterSound');
    }
}

export class Moonsect extends FlyingEnemy {
    constructor(game) {
        super(game, 91.5, 100, 1, 'moonsect');
        this.setFps(8);
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.frameX === 1 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('moonsectFlapAudio');
    }
}

export class Lunny extends FlyingEnemy {
    constructor(game) {
        super(game, 122, 100, 1, 'lunny');
        this.setFps(6);
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.frameX === 1 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('ravenSingleFlap');
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
        const dt = normalizeDelta(deltaTime);
        if (this.playSoundOnce) {
            this.playSoundOnce = false;
            this.game.audioHandler.enemySFX.playSound('meatSoldierSound');
        }
        this.x -= this.xSpeed * dt;
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
            const dt = normalizeDelta(deltaTime);
            this.x -= this.runningSpeed * dt;
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
        const dt = normalizeDelta(deltaTime);
        this.x -= Math.cos(this.angle) * this.radius * dt;
        this.y += Math.sin(this.angle) * this.radius * dt;

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
            const dt = normalizeDelta(deltaTime);
            this.x -= dt;
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
