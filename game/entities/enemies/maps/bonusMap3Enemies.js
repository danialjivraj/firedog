import { normalizeDelta } from "../../../config/constants.js";
import { withCtx, drawSprite, moveAlongAngle } from "../core/enemyUtils.js";
import { ImmobileGroundEnemy, MovingGroundEnemy, FlyingEnemy, FallingEnemy, UnderwaterEnemy, UndergroundEnemy } from "../core/enemyTypes.js";
import { PurpleLaser, YellowOrb, RedOrb, CyanOrb, GreenOrb, BlueOrb } from "../core/projectiles.js";

export class Plazer extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 61.33333333333333, 90, 2, 'plazer');
        this.setFps(6);
        this.shotTurn = 3;
        this.burstCount = 0;
        this.burstTimer = 0;
        this.inBurst = false;
        this.burstDelay = 150;
    }
    fireLaser() {
        const cx = this.x;
        const cy = this.y + this.height / 2;
        const px = this.game.player.x + this.game.player.width / 2;
        const py = this.game.player.y + this.game.player.height / 2;
        const angle = Math.atan2(py - cy, px - cx);
        this.game.enemies.push(new PurpleLaser(this.game, cx - 40, cy - 30, angle));
        this.game.audioHandler.enemySFX.playSound('laserAttackAudio', false, true);
    }
    advanceFrame(deltaTime) {
        const prevFrame = this.frameX;
        super.advanceFrame(deltaTime);
        if (prevFrame === 0 && this.frameX === 1 && this.isOnScreen() && this.x >= this.game.player.x) {
            this.shotTurn++;
            if (this.shotTurn % 4 === 0) {
                this.inBurst = true;
                this.burstCount = 0;
                this.burstTimer = this.burstDelay;
            }
        }
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (!this.inBurst || this.game.gameOver) return;
        this.burstTimer += deltaTime;
        if (this.burstTimer >= this.burstDelay) {
            this.burstTimer = 0;
            this.fireLaser();
            this.burstCount++;
            if (this.burstCount >= 2) this.inBurst = false;
        }
    }
}

export class Veynoculus extends FlyingEnemy {
    constructor(game) {
        super(game, 78.6, 50, 4, 'veynoculus');
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.playSoundOnce('veynoculusSound');
    }
}

export class Crabula extends FallingEnemy {
    constructor(game) {
        super(game, 125.6666666666667, 130, 2, 'crabula');
        this.speedY = Math.random() * 6 + 5;
        this.setFps(10);
        this._prevFrameX = -1;
        this.playsOnce = true;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.playSoundOnce('crabulaEntranceSound', false, true);
        if (this.frameX === 2 && this._prevFrameX !== 2) this.playIfOnScreen('crabulaSnippingSound', false, true);
        this._prevFrameX = this.frameX;
    }
}

export class Johnny extends FlyingEnemy {
    constructor(game) {
        super(game, 98, 80, 0, 'johnny');
        this.isStunEnemy = true;
        this.setFps(0);
        this.currentSpeed = 7;
        this.chaseDistance = this.game.width;
        this.loopingSoundId = 'johnnyAlienSound';
        this.passedPlayer = false;
        this.angleToPlayer = Math.PI;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.game.audioHandler.enemySFX.playSound('johnnyAlienSound');

        if (!this.passedPlayer) {
            if (this.getDistanceToPlayer() <= this.chaseDistance) {
                this.angleToPlayer = this.getAngleToPlayer();
                moveAlongAngle(this, this.angleToPlayer, this.currentSpeed, dt);
            } else {
                this.x -= this.currentSpeed * dt;
            }
        } else {
            moveAlongAngle(this, this.angleToPlayer, this.currentSpeed, dt);
        }

        if (this.x < this.game.player.x) this.passedPlayer = true;
    }
}

export class Spindle extends MovingGroundEnemy {
    constructor(game) {
        super(game, 99.69230769230769, 90, 12, 'spindle');
        this.setFps(70);
        this.xSpeed = Math.floor(Math.random() * 6) + 3;
        this.loopingSoundId = 'runespiderWalkingSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= this.xSpeed * dt;
        this.playIfOnScreen('runespiderWalkingSound');
    }
}

export class Borion extends UndergroundEnemy {
    constructor(game) {
        super(game, 228, 150, 1, 'borion', {
            warningDuration: 500,
            riseDuration: 500,
            holdDuration: 5000,
            triggerDistance: 1300,
            soundIds: {
                emerge: 'borionEmergeSound',
                retract: 'borionRetractSound'
            }
        });
        this.lives = 3;
        this.coinValue = 3;
        this.setFps(10);
        this.drawOffsetY = 30;
        this.orbTimer = 0;
    }
    throwOrbs() {
        const orbTypes = [YellowOrb, RedOrb, CyanOrb, GreenOrb, BlueOrb];
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 4;
        const angles = [
            -Math.PI * 0.8 + Math.random() * Math.PI * 0.2,
            -Math.PI * 0.6 + Math.random() * Math.PI * 0.2,
            -Math.PI * 0.4 + Math.random() * Math.PI * 0.2,
        ];
        const shuffled = [...orbTypes].sort(() => Math.random() - 0.5);
        for (let i = 0; i < 3; i++) {
            this.game.enemies.push(new shuffled[i](this.game, cx - 22, cy + 40, angles[i]));
        }
        this.playIfOnScreen('borionProjectileSound');
    }
    onEmergeComplete() {
        if (this.isOnScreen()) this.game.audioHandler.enemySFX.playSound('borionMouthSound', true);
        this.loopingSoundId = 'borionMouthSound';
    }
    onRetractStart() {
        super.onRetractStart();
        this.game.audioHandler.enemySFX.stopSound('borionMouthSound');
        this.loopingSoundId = null;
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.phase !== 'hold' || this.game.gameOver) return;
        this.orbTimer -= deltaTime;
        if (this.orbTimer <= 0) {
            this.orbTimer = 2000;
            this.throwOrbs();
        }
    }
    draw(context) {
        if (this.phase === 'warning') {
            this.drawWarning(context);
            return;
        }
        if (this.phase === 'emerge' || this.phase === 'hold' || this.phase === 'retract') {
            withCtx(context, () => {
                context.beginPath();
                context.rect(this.x, 0, this.width, this.groundBottom);
                context.clip();
                const cx = this.x + this.width / 2;
                const cy = this.y + this.height / 2 + this.drawOffsetY;
                context.translate(cx, cy);
                context.scale(this.flipHorizontal ? -1 : 1, 1);
                this.applyGlow(context);
                context.drawImage(this.image, (this.frameX || 0) * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
                this.clearGlow(context);
            });
        }
    }
}

export class Vespion extends FlyingEnemy {
    constructor(game) {
        super(game, 117, 100, 1, 'vespion');
        this.isSlowEnemy = true;
        this.playsOnce = true;
        this.baseY = game.height * 0.5 - this.height * 0.5;
        this.y = this.baseY;
        this.va = 0.04;
        this.amplitude = 230;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const spike = (2 / Math.PI) * Math.asin(Math.sin(this.angle));
        this.y = this.baseY + this.amplitude * spike;
        this.playSoundOnce('buzzingFly');
    }
}

export class Nebulure extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 95.75, 150, 1, 'nebulure');
        this.setFps(10);
        this.suckParticles = [];
        this.particleTimer = 0;
        this.particleInterval = 80;
        this.loopingSoundId = 'nebulureSuctionSound';
    }
    spawnSuckParticle() {
        const my = this.y + this.height * 0.3 + 10;
        this.suckParticles.push({
            x: this.x - 200 + (Math.random() - 0.5) * 60,
            y: my + (Math.random() - 0.5) * 300,
            size: 3 + Math.random() * 5,
            speed: 1 + Math.random() * 2.5,
            alpha: 0,
            lifeTimer: 0,
            maxLife: 1000 + Math.random() * 600,
            fadeIn: 50,
        });
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.playIfOnScreen('nebulureSuctionSound');

        const mx = this.x + this.width * 0.5;
        const my = this.y + this.height * 0.3 + 10;
        const scroll = this.game.cabin?.isFullyVisible ? 0 : this.game.speed;
        for (const p of this.suckParticles) {
            p.x -= scroll;
            const dx = mx - p.x;
            const dy = my - p.y;
            const d = Math.hypot(dx, dy);
            if (d <= 8) { p.done = true; continue; }
            p.x += (dx / d) * p.speed;
            p.y += (dy / d) * p.speed;
            p.lifeTimer += deltaTime;
            const fadeInT = Math.min(1, p.lifeTimer / p.fadeIn);
            const fadeOutT = 1 - p.lifeTimer / p.maxLife;
            p.alpha = fadeInT * fadeOutT * 0.9;
        }
        this.suckParticles = this.suckParticles.filter(p => !p.done && p.lifeTimer < p.maxLife);

        if (!this.isOnScreen()) return;

        this.particleTimer += deltaTime;
        if (this.particleTimer >= this.particleInterval) {
            this.particleTimer = 0;
            this.spawnSuckParticle();
        }

        if (this.game.gameOver) return;

        const dx = (this.x + this.width / 2) - this.game.player.x;
        if (dx <= 0) return;

        const dt = normalizeDelta(deltaTime);
        this.game.player.x += dx * 0.008 * dt;
    }
    draw(context) {
        super.draw(context);
        for (const p of this.suckParticles) {
            context.save();
            context.globalAlpha = Math.max(0, p.alpha);
            context.fillStyle = '#99ccff';
            context.shadowColor = '#4499ff';
            context.shadowBlur = 12;
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            context.fill();
            context.restore();
        }
    }
}

export class Oculith extends UndergroundEnemy {
    constructor(game) {
        super(game, 93, 80, 1, 'oculith', {
            warningDuration: 800,
            riseDuration: 300,
            holdDuration: 0,
            triggerDistance: 700,
            soundIds: {
                emerge: 'oculithEmergeSound',
            }
        });
        this.isPoisonEnemy = true;
        this.ascendSpeed = (this.hiddenY - this.visibleY) / this.riseDuration;
    }

    onEmergeComplete() {
        this.phase = 'ascend';
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.phase === 'ascend') {
            this.y -= this.ascendSpeed * deltaTime;
            this.advanceFrame(deltaTime);
            if (this.y + this.height < 0) this.markedForDeletion = true;
        }
    }

    draw(context) {
        if (this.phase === 'ascend') {
            this.drawActivePhase(context);
            return;
        }
        super.draw(context);
    }
}

export class Lancer extends UnderwaterEnemy {
    constructor(game) {
        super(game, 181.25, 70, 3, 'lancer');
        this.isFrozenEnemy = true;
        this.y = this.game.player.y;
        this.va = Math.random() * 0.001 + 0.2;
        this.setFps(15);
        this.loopingSoundId = 'rocketLauncherSound';
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= 11 * dt;
        this.playIfOnScreen('rocketLauncherSound');
    }
}

export class Astraider extends MovingGroundEnemy {
    constructor(game) {
        super(game, 160.5, 120, 3, 'astraider');
        this.setFps(15);
        this.lives = 2;
        this.coinValue = 2;
        this.xSpeed = Math.floor(Math.random() * 2) + 1;
        this.shotCooldown = 3000;
        this.shotTimer = 2500;
        this.loopingSoundId = 'astraiderWalkingSound';
    }

    throwOrb() {
        this.game.enemies.push(new CyanOrb(this.game, this.x + 55, this.y + 48));
        this.playIfOnScreen('iceballThrowSound');
        this.shotTimer = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= this.xSpeed * dt;
        this.shotTimer += deltaTime;
        if (this.shotTimer >= this.shotCooldown && this.isOnScreen()) this.throwOrb();
        this.playIfOnScreen('astraiderWalkingSound');
    }
}

export class Frogula extends ImmobileGroundEnemy {
    constructor(game) {
        super(game, 96.5, 100, 1, 'frogula');
        this.lives = 2;
        this.coinValue = 2;
        this.isRedEnemy = true;
        this.state = 'idle';
        this.setFps(10);
        this.playsOnce = true;
        this.jumpFrameX = 0;
        this.jumpFrameTimer = 0;
        this.jumpFrameInterval = 1000 / 15;
        this.jumpFrameW = 180;
        this.jumpFrameH = 105;
        this.jumpVX = 0;
        this.jumpVY = 0;
        this.jumpGravity = 0.35;
        this.groundY = 0;
        this.jumpInitialized = false;
        this.landingTimer = 0;
        this.landingCooldown = 1000;
        this.autoRemoveOffTop = false;
    }

    update(deltaTime) {
        super.update(deltaTime);
        const playerDistance = Math.abs(this.game.player.x - this.x);

        if (this.state === 'idle') {
            this.landingTimer += deltaTime;
            if ((playerDistance < 1300 && this.landingTimer >= this.landingCooldown) || this.lives <= 1) {
                this.state = 'jump';
            }
        }

        if (this.state === 'jump') {
            if (!this.jumpInitialized) {
                this.jumpInitialized = true;
                this.playIfOnScreen('frogulaSound');
                this.width = this.jumpFrameW;
                this.groundY = this.y;
                this.jumpVX = 7;
                this.jumpVY = -12;
            }

            this.jumpFrameTimer += deltaTime;
            if (this.jumpFrameTimer >= this.jumpFrameInterval && this.jumpFrameX < 3) {
                this.jumpFrameX++;
                this.jumpFrameTimer = 0;
            }

            const dt = normalizeDelta(deltaTime);
            this.jumpVY += this.jumpGravity * dt;
            this.x -= this.jumpVX * dt;
            this.y += this.jumpVY * dt;

            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.jumpVY = 0;
                this.jumpVX = 0;
                this.jumpInitialized = false;
                this.width = 96.5;
                this.jumpFrameX = 0;
                this.jumpFrameTimer = 0;
            }
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        if (this.state === 'idle') {
            super.draw(context);
        } else if (this.state === 'jump') {
            this.applyGlow(context);
            drawSprite(context, this.image, this.jumpFrameX * this.jumpFrameW, this.height, this.jumpFrameW, this.jumpFrameH, this.x, this.y, this.jumpFrameW, this.jumpFrameH);
            this.clearGlow(context);
        }
    }
}
