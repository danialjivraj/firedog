import { normalizeDelta } from "../../../config/constants.js";
import { withCtx, drawSprite } from "../core/enemyUtils.js";
import { ImmobileGroundEnemy, MovingGroundEnemy, FlyingEnemy, ClimbingEnemy, BeeInstances } from "../core/enemyTypes.js";
import { DarkLaser, BerriflyIceBall, YellowBeam } from "../core/projectiles.js";

export class Snailey extends MovingGroundEnemy {
    constructor(game) {
        super(game, 103, 74, 9, 'snailey');
        this.xSpeed = Math.floor(Math.random() * 5) + 1;
        this.soundId = 'slimyWalkSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= this.xSpeed * dt;
    }
}

export class Citrifly extends FlyingEnemy {
    constructor(game) {
        super(game, 80.5, 90, 1, 'citrifly');
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
        this.playSoundOnce('buzzingFly');
    }
}

export class Berrifly extends FlyingEnemy {
    constructor(game) {
        super(game, 84, 75, 1, 'berrifly');
        this.setFps(10);
        this.playsOnce = true;
        this.iceballTimer = 200;
    }

    throwIceBallAttack() {
        const playerCenterY = this.game.player.y + this.game.player.height / 2;
        const elyvorgCenterY = this.y + this.height / 2;
        const deltaY = playerCenterY - elyvorgCenterY;
        const angle = Math.atan2(deltaY, Math.abs(this.game.player.x - this.x));
        const verticalSpeed = Math.sin(angle) * 10;

        const fireball = new BerriflyIceBall(this.game, this.x + 17, this.y + 37, verticalSpeed);
        this.game.enemies.push(fireball);
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.playSoundOnce('buzzingFly');

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
        this.playSoundOnce('buzzingFly');
    }
}

export class LeafSlug extends MovingGroundEnemy {
    constructor(game) {
        super(game, 89, 84, 2, 'leafSlug');
        this.setFps(12);
        this.xSpeed = Math.floor(Math.random() * 3) + 1;
        this.loopingSoundId = 'leafSlugSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= this.xSpeed * dt;
        this.playIfOnScreen('leafSlugSound');
    }
}

export class Sunflora extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 132, 137, 3, 'sunflora');
        this.lives = 2;
        this.coinValue = 2;
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
        }
    }

    startJump() {
        this.isJumping = true;
        this.jumpStartTime = this.game.hiddenTime;
        this.groundY = this.game.height - this.height - this.game.groundMargin;

        this.jumpDir = -1;
        if (this.jumpStyle === 'smart') this.horizontalSpeed = this.baseHorizontalSpeed;

        this.game.audioHandler.enemySFX.playSound('eggrySound');
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.frameX < 9) this.jumpedThisCycle = false;

        if (this.game.background.isRaining) {
            if (!this.isJumping && !this.jumpedThisCycle && this.frameX === 9) {
                this.startJump();
                this.jumpedThisCycle = true;
            }
        } else if (!this.isJumping) {
            this.jumpedThisCycle = false;
            this.y = this.groundY;
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

export class Strawspider extends ClimbingEnemy {
    constructor(game) {
        super(game, 93.83333333333333, 110, 5, 'strawspider');
        this.lives = 2;
        this.coinValue = 2;
        this.setFps(13);
        this.soundId = 'nightSpiderSound';
        this.swingAngle = 0;
        this.swingSpeed = 0.002 + Math.random() * 0.006;
        this.swingAmplitude = 1 + Math.random() * 4;
        this.canAttack = true;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.swingAngle += this.swingSpeed * deltaTime;
        const swingOffsetX = Math.sin(this.swingAngle) * this.swingAmplitude;
        this.x += swingOffsetX * dt;

        if (this.game.background.isRaining && !this.game.gameOver) {
            const targetY = this.game.player.y;
            const dy = targetY - this.y;
            const floorY = this.game.height - this.height - this.game.groundMargin;
            const nearFloor = this.y > floorY - 20;
            if (!(nearFloor && dy > 0)) {
                const trackSpeed = 0.003;
                this.speedY += dy * trackSpeed * dt;
                this.speedY = Math.max(-4, Math.min(4, this.speedY));
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
