import { normalizeDelta } from "../../../config/constants.js";
import { withCtx, drawSprite } from "../core/enemyUtils.js";
import { ImmobileGroundEnemy, MovingGroundEnemy, FlyingEnemy, VerticalEnemy, ClimbingEnemy, BeeInstances } from "../core/enemyTypes.js";
import { PoisonSpit, PoisonousOrb, RedOrb } from "../core/projectiles.js";

export class Toxwing extends VerticalEnemy {
    constructor(game) {
        super(game, 127, 105, 1, 'toxwing');
        this.setFps(12);
        this.angle = Math.random() * Math.PI * 2;
        this.va = Math.random() * 0.04 + 0.04;
        this.amplitude = 15;
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x += this.amplitude * Math.sin(this.angle) * dt;
        this.angle += this.va * dt;
        this.playSoundOnce('batPitch');
        if (this.frameX === 1 && this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('wooshBat');
    }
}

export class Mycora extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 165.125, 200, 7, 'mycora');
        this.isRedEnemy = true;
        this.lives = 2;
        this.coinValue = 2;
        this.setFps(15);
        this.shotTurn = 1;
    }
    throwOrbs() {
        const cx = this.x + this.width / 2 - 15;
        const cy = this.y + this.height / 3 - 5;
        const baseAngle = -Math.PI + Math.PI / 8;
        const spread = Math.PI / 6;
        const angles = [baseAngle - spread, baseAngle, baseAngle + spread];

        this.playIfOnScreen('mycoraMouthSound');

        for (const angle of angles) {
            this.game.enemies.push(new PoisonousOrb(this.game, cx, cy, angle));
        }
    }
    advanceFrame(deltaTime) {
        const prevFrame = this.frameX;
        super.advanceFrame(deltaTime);

        if (prevFrame === 2 && this.frameX === 3) {
            this.shotTurn++;

            if (
                this.shotTurn % 3 === 0 &&
                this.isOnScreen() &&
                this.x >= this.game.player.x &&
                !this.game.gameOver
            ) {
                this.throwOrbs();
            }
        }

        if (prevFrame === this.maxFrame - 1 && this.frameX === this.maxFrame) {
            this.game.audioHandler.enemySFX.playSound('mycoraMouthCloseSound', false, true);
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
        const dt = normalizeDelta(deltaTime);
        this.y += this.speedY * Math.sin(this.angle) * dt;
        this.angle += this.va * dt;
    }
}

export class LarvoxMini extends MovingGroundEnemy {
    constructor(game, x, y, launchVX) {
        super(game, 114.75 * 0.6, 70 * 0.6, 3, 'larvox');
        this.setFps(14);
        this.soundId = 'slimyWalkSound';
        this.x = x;
        this.y = y;
        this.vx = launchVX;
        this.vy = -(Math.random() * 5 + 7);
        this.gravity = 0.4;
        this.grounded = false;
        this.groundY = game.height - (70 * 0.6) - game.groundMargin;
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
                this.xSpeed = Math.floor(Math.random() * 3) + 3;
            }
            if (this.x + this.width < 0) this.markedForDeletion = true;
            return;
        }
        super.update(deltaTime);
        this.x -= this.xSpeed * dt;
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
        this.soundId = 'slimyWalkSound';
        this.xSpeed = Math.floor(Math.random() * 3) + 1;
        this.spawned = false;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= this.xSpeed * dt;
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
        this.coinValue = 2;
        this.isPoisonEnemy = true;
        this.soundId = 'venoblitzRunningSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= this.xSpeed * dt;
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
        const dt = normalizeDelta(deltaTime);
        this.t1 += 0.07 * dt;
        this.t2 += 0.13 * dt;
        this.t3 += 0.031 * dt;
        this.y += (Math.sin(this.t1) * 3 + Math.sin(this.t2) * 1.5 + Math.sin(this.t3) * 2.5) * dt;
        this.x += (Math.cos(this.t2) * 1.5 + Math.cos(this.t3) * 1) * dt;
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
        this.shotTurn = 5;
    }
    shoot() {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 3;
        const px = this.game.player.x + this.game.player.width / 2;
        const py = this.game.player.y + this.game.player.height / 2;
        const angle = Math.atan2(py - cy, px - cx);
        this.playIfOnScreen('venfloraProjectileSound');
        this.game.enemies.push(new RedOrb(this.game, cx - 15, cy - 25, angle));
    }
    advanceFrame(deltaTime) {
        const prevFrame = this.frameX;
        super.advanceFrame(deltaTime);
        if (prevFrame === 1 && this.frameX === 2 && this.isOnScreen() && this.x >= this.game.player.x) {
            this.shotTurn++;
            if (this.shotTurn % 6 === 0) this.shoot();
        }
    }
}

export class Toxhop extends MovingGroundEnemy {
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
        super(game, 316, 202, 16, 'toxhop');

        this.game = game;
        this.lives = 2;
        this.coinValue = 2;
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
        const cfg = Toxhop.STATES[newState];
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
        const srcY = Toxhop.STATES[this.state]?.srcY ?? 0;
        drawSprite(context, this.image, this.frameX * this.width, srcY, this.width, this.height, this.x, this.y, this.width, this.height);
    }

    throwPoisonSpit() {
        if (!this.poisonSpitThrown) {
            this.game.enemies.push(new PoisonSpit(this.game, this.x + 20, this.y + 15 + this.height / 2 - 11));
            this.poisonSpitThrown = true;
        }
    }

    frogRun(dt) {
        const playerDistance = Math.abs(this.game.player.x - this.x);
        this.x -= 2 * dt;

        if (this.state === 'run' && this.frameX === 0 && !this.jumpedBeforeDistanceLogic) {
            this.jumpStartTime = this.game.hiddenTime;
            this.jumpedBeforeDistanceLogic = true;
            this.originalY = this.y;
        }

        const jumpProgress =
            (this.game.hiddenTime - this.jumpStartTime) / (this.jumpDuration * 1000);

        if (jumpProgress < 1) {
            this.y = this.originalY - this.jumpHeight * Math.sin(jumpProgress * Math.PI);
            this.x -= 5 * dt;
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
        const dt = normalizeDelta(deltaTime);

        this.playSoundOnce('frogSound', false, true);

        if (this.state === 'run') this.frogRun(dt);
        else if (this.state === 'attack') this.frogAttack();
    }
}
