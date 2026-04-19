import { normalizeDelta } from "../../../config/constants.js";
import { withCtx, drawSprite, setShadow, getImg } from "./enemyUtils.js";
import { Enemy } from "./enemyBase.js";

export class Projectile extends Enemy {
    constructor(game, x, y, width, height, maxFrame, imageId, speedX, fps) {
        super();
        this.game = game;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.image = getImg(imageId);
        this.speedX = speedX;
        this.speedY = 0;
        this.maxFrame = maxFrame;
        this.setFps(fps);
        this.frameTimer = 0;
    }
    update(deltaTime) {
        super.update(deltaTime);
    }
}

export class WindAttack extends Projectile {
    constructor(game, x, y, speedX) {
        super(game, x, y, 105, 120, 5, 'windAttack', speedX, 20);
        this.player = game.player;
        this.loopingSoundId = 'tornadoAudio';
        this.drawScale = 0.1;
        this.growDuration = 400;
        this.growTimer = 0;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.y += this.speedX * dt;

        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const distance = Math.hypot(dx, dy);
        const dirX = dx / distance;

        this.x += dirX * this.speedX * dt;

        const pushbackDistance = 50;
        const playerPushbackX = this.player.x - dirX * pushbackDistance;
        this.player.x += (playerPushbackX - this.player.x) * 0.04 * dt;

        if (this.drawScale < 1) {
            this.growTimer += deltaTime;
            this.drawScale = Math.min(1, this.growTimer / this.growDuration);
        }

        if (!(this.x + this.width < 0 || this.y > this.game.height || this.lives <= 0)) {
            this.game.audioHandler.enemySFX.playSound('tornadoAudio');
        }
    }
    draw(context) {
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.scale(this.drawScale, this.drawScale);
            drawSprite(context, this.image, this.frameX * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
        });
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class InkBeam extends Projectile {
    constructor(game, x, y, speedX = 10, speedY = 0) {
        super(game, x, y, 77, 34, 2, 'inkBeam', speedX, 10);
        this.speedY = speedY;
    }

    draw(ctx) {
        const angle = Math.atan2(this.speedY, this.speedX);

        if (this.game.debug) ctx.strokeRect(this.x, this.y, this.width, this.height);

        withCtx(ctx, () => {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

            ctx.scale(1, -1);

            ctx.rotate(angle);

            drawSprite(
                ctx,
                this.image,
                this.frameX * this.width, 0, this.width, this.height,
                -this.width / 2, -this.height / 2, this.width, this.height
            );
        });
    }
}

export class LeafAttack extends Projectile {
    constructor(game, x, y, imageId, speedX, rotationAngle) {
        super(game, x, y, 35.416, 45, 11, imageId, speedX, 30);
        this.rotation = 0;
        this.rotationAngle = rotationAngle;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.rotation += deltaTime * this.rotationAngle;
    }
    draw(context) {
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.rotate(this.rotation);
            drawSprite(
                context, this.image, this.frameX * this.width, 0, this.width, this.height,
                -this.width / 2, -this.height / 2, this.width, this.height
            );
        });
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class BrambleLeafAttack extends LeafAttack {
    constructor(game, x, y, fallSpeedX, fallSpeedY) {
        super(game, x, y, 'leafAttack', 0, 0.0002 + Math.random() * 0.0008);
        this.fallSpeedX = fallSpeedX;
        this.fallSpeedY = fallSpeedY;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x -= this.fallSpeedX * dt;
        this.y += this.fallSpeedY * dt;
        if (this.y > this.game.height) this.markedForDeletion = true;
    }
}

export class PoisonSpit extends Projectile {
    constructor(game, x, y) {
        super(game, x, y, 59, 22, 11, 'poison_spit', 18, 30);
        this.isPoisonEnemy = true;
    }
}

export class PoisonousOrb extends Projectile {
    constructor(game, x, y, angle) {
        super(game, x, y, 48.625, 50, 3, 'poisonousOrb', 0, 30);
        this.isPoisonEnemy = true;
        this.angle = angle;
        this.orbSpeed = 5;
        this.rotation = 0;
        this.rotationSpeed = 0.1;
        this.drawScale = 0.1;
        this.scaleSpeed = 0.04;
    }
    advanceFrame(deltaTime) {
        if (this.frameX >= this.maxFrame) return;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            this.frameX = Math.min(this.frameX + 1, this.maxFrame);
        } else {
            this.frameTimer += deltaTime;
        }
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x += Math.cos(this.angle) * this.orbSpeed * dt;
        this.y += Math.sin(this.angle) * this.orbSpeed * dt;
        this.rotation += this.rotationSpeed * dt;
        if (this.drawScale < 1) this.drawScale = Math.min(1, this.drawScale + this.scaleSpeed * dt);
    }
    draw(context) {
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.rotate(this.rotation);
            context.scale(this.drawScale, this.drawScale);
            setShadow(context, 'green', 20);
            drawSprite(context, this.image, this.frameX * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
            setShadow(context, 'transparent', 0);
        });
    }
}

export class ScorpionPoison extends Projectile {
    constructor(game, x, y) {
        super(game, x, y, 50, 50, 0, null, 9, 0);
        this.isPoisonEnemy = true;
        this.r = 25;
        this.age = 0;
        this.growDuration = 300;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.velY = 1.0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.age += deltaTime;
        const dt = normalizeDelta(deltaTime);
        this.y += this.velY * dt;
    }

    draw(context) {
        context.save();
        const growScale = Math.min(this.age / this.growDuration, 1);
        const pulse = 0.9 + 0.1 * Math.sin(this.age * 0.01 + this.pulsePhase);
        const cx = this.x + this.r;
        const cy = this.y + this.r;
        const r = this.r * growScale * pulse;

        this.applyGlow(context);

        context.translate(cx, cy);
        context.rotate(Math.atan2(this.velY, -9) - Math.PI);
        context.scale(-1, 1);

        context.beginPath();
        context.moveTo(-r * 1.5, 0);
        context.bezierCurveTo(-r * 0.4, -r, r, -r * 0.9, r, 0);
        context.bezierCurveTo(r, r * 0.9, -r * 0.4, r, -r * 1.5, 0);
        context.closePath();

        const grad = context.createRadialGradient(r * 0.2, 0, 0, 0, 0, r * 1.4);
        grad.addColorStop(0, 'rgba(200, 255, 60, 1)');
        grad.addColorStop(0.35, 'rgba(255, 130, 20, 0.95)');
        grad.addColorStop(0.7, 'rgba(30, 140, 20, 0.95)');
        grad.addColorStop(1, 'rgba(10, 60, 5, 0.9)');
        context.fillStyle = grad;
        context.fill();

        context.restore();
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class FrozenShard extends Projectile {
    constructor(game, x, y, speedX) {
        super(game, x, y, 35, 35, 0, 'frozenShard', speedX, 20);
        this.isSlowEnemy = true;
        this.initialSize = 8;
        this.size = this.initialSize;
        this.maxSize = 35;
        this.growthRate = 1.5;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.08;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        if (this.size < this.maxSize) {
            const sizeChange = Math.min(this.growthRate * dt, this.maxSize - this.size);
            this.size += sizeChange;
            this.x -= sizeChange / 2;
            this.y -= sizeChange / 2;
        }
        this.rotationAngle += this.rotationSpeed * dt;
    }
    draw(context) {
        withCtx(context, () => {
            setShadow(context, 'blue', 10);
            context.translate(this.x + this.size / 2, this.y + this.size / 2);
            context.rotate(this.rotationAngle);
            drawSprite(context, this.image, 0, 0, this.maxSize, this.maxSize, -this.size / 2, -this.size / 2, this.size, this.size);
        });
    }
}

export class BerriflyIceBall extends Projectile {
    constructor(game, x, y, speedY) {
        super(game, x, y, 35, 35, 0, 'iceBall', 7, speedY);
        this.isSlowEnemy = true;
        this.initialSize = 10;
        this.size = this.initialSize;
        this.maxSize = 35;
        this.growthRate = 1;
        this.x = x;
        this.y = y;
        this.speedY = speedY;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.04;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        const sizeChange = this.size + this.growthRate * dt > this.maxSize ? this.maxSize - this.size : this.growthRate * dt;
        this.size += sizeChange;
        this.y -= sizeChange / 2;
        this.rotationAngle += this.rotationSpeed * dt;
    }
    draw(context) {
        withCtx(context, () => {
            setShadow(context, 'blue', 10);
            context.translate(this.x + this.size / 2, this.y + this.size / 2);
            context.rotate(this.rotationAngle);
            if (this.game.debug) context.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
            drawSprite(context, this.image, 0, 0, this.maxSize, this.maxSize, -this.size / 2, -this.size / 2, this.size, this.size);
        });
    }
}

export class DarkLaser extends Projectile {
    constructor(game, x, y, speedY, direction) {
        super(game, x, y, 63, 40, 0, 'darkLaser', speedY);
        this.initialSize = 10;
        this.size = this.initialSize;
        this.x = x;
        this.y = y;
        this.speedX = 15;
        this.speedY = speedY;
        this.direction = direction;
    }
    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            let angle = Math.atan2(this.speedY, this.speedX);
            if (this.direction) {
                angle = Math.PI - angle;
                context.scale(1, 1);
            } else {
                context.scale(-1, 1);
            }
            context.rotate(angle);
            drawSprite(
                context, this.image, this.frameX * this.width, 0, this.width, this.height,
                -this.width / 2, -this.height / 2, this.width, this.height
            );
        });
    }
}

export class YellowBeam extends Projectile {
    constructor(game, x, y) {
        super(game, x, y, 53, 85, 0, 'yellowBeam');
        this.x = x;
        this.y = y;
        this.speedX = 0;
        this.speedY = -5;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.y += this.speedY * dt;
    }
}

export class PurpleLaser extends Projectile {
    constructor(game, x, y, angle) {
        super(game, x, y, 82, 48, 0, 'purpleLaser', 0, 0);
        this.angle = angle;
        this.laserSpeed = 15;
    }
    update(deltaTime) {
        super.update(deltaTime);
        const dt = normalizeDelta(deltaTime);
        this.x += Math.cos(this.angle) * this.laserSpeed * dt;
        this.y += Math.sin(this.angle) * this.laserSpeed * dt;
    }
    draw(context) {
        withCtx(context, () => {
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.rotate(this.angle);
            drawSprite(context, this.image, 0, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
        });
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class GlowOrb extends Projectile {
    constructor(game, x, y, size, outerColor, innerColor, angle, orbSpeed) {
        super(game, x, y, size, size, 0, null, 0, 60);
        this.outerColor = outerColor;
        this.innerColor = innerColor;
        this.angle = angle;
        this.orbSpeed = orbSpeed;
        this.pulseTimer = 0;
        this.growDuration = 0;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.pulseTimer += deltaTime;
        const dt = normalizeDelta(deltaTime);
        if (this.angle !== undefined) {
            this.x += Math.cos(this.angle) * this.orbSpeed * dt;
            this.y += Math.sin(this.angle) * this.orbSpeed * dt;
        }
    }
    draw(context) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const r = this.width / 2;
        const grow = this.growDuration > 0 ? Math.min(1, this.pulseTimer / this.growDuration) : 1;
        const pulse = 0.85 + 0.15 * Math.sin(this.pulseTimer * 0.01);
        withCtx(context, () => {
            context.shadowColor = this.outerColor;
            context.shadowBlur = 18;
            context.globalAlpha = 0.3;
            context.fillStyle = this.outerColor;
            context.beginPath();
            context.arc(cx, cy, r * 1.3 * pulse * grow, 0, Math.PI * 2);
            context.fill();

            context.globalAlpha = 1;
            context.shadowBlur = 10;
            context.fillStyle = this.innerColor;
            context.beginPath();
            context.arc(cx, cy, r * 0.55 * pulse * grow, 0, Math.PI * 2);
            context.fill();
        });
    }
}

export class CyanOrb extends GlowOrb {
    constructor(game, x, y, angle = undefined) {
        super(game, x, y, 40, '#00eaff', '#aaffff', angle, 8);
        this.isFrozenEnemy = true;
        this.speedX = 8;
        this.growDuration = 600;
    }
}

export class YellowOrb extends GlowOrb {
    constructor(game, x, y, angle) {
        super(game, x, y, 44, '#ffee00', '#ffffaa', angle, 6);
        this.isStunEnemy = true;
        this.growDuration = 400;
    }
}

export class RedOrb extends GlowOrb {
    constructor(game, x, y, angle) {
        super(game, x, y, 50, '#ff4444', '#ffaaaa', angle, 6);
        this.isRedEnemy = true;
        this.growDuration = 500;
    }
}

export class GreenOrb extends GlowOrb {
    constructor(game, x, y, angle) {
        super(game, x, y, 44, '#44ff88', '#003366', angle, 6);
        this.isPoisonEnemy = true;
        this.growDuration = 450;
    }
}

export class BlueOrb extends GlowOrb {
    constructor(game, x, y, angle) {
        super(game, x, y, 44, '#0044cc', '#aaccff', angle, 6);
        this.isSlowEnemy = true;
        this.growDuration = 450;
    }
}

export class LavaBall extends Projectile {
    constructor(game, x, y, speedX = 6, speedY = 0) {
        super(game, x, y, 40, 40, 7, 'lavaBall', speedX, 12);
        this.speedY = speedY;
        this.size = 8;
        this.width = this.size;
        this.height = this.size;
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.speedX < 0 && this.x > this.game.width) this.markedForDeletion = true;
        const dt = normalizeDelta(deltaTime);
        if (this.size < 40) {
            const grow = Math.min(2 * dt, 40 - this.size);
            this.x -= grow / 2;
            this.y -= grow / 2;
            this.size += grow;
            this.width = this.size;
            this.height = this.size;
        }
    }

    draw(context) {
        withCtx(context, () => {
            context.translate(this.x + this.size / 2, this.y + this.size / 2);
            if (this.speedX < 0) context.scale(-1, 1);
            drawSprite(context, this.image, this.frameX * 40, 0, 40, 40,
                -this.size / 2, -this.size / 2, this.size, this.size);
        });
        if (this.game.debug) context.strokeRect(this.x, this.y, this.size, this.size);
    }
}

export class VolcanicBubble extends Projectile {
    constructor(game, x, y) {
        super(game, x, y, 34, 34, 0, null, 0, 60);
        this.isRedEnemy = true;
        this.r = 17;
        this.spawnDuration = 450;
        this.age = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.crackRotation = 0;
        this.driftX = 0;
        this.targetDriftX = (Math.random() - 0.5) * 2;
        this.driftTimer = 0;
        this.driftInterval = 400 + Math.random() * 400;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.age += deltaTime;
        this.crackRotation += deltaTime * 0.0008;
        this.driftTimer += deltaTime;
        if (this.driftTimer >= this.driftInterval) {
            const spread = Math.min(1 + this.age * 0.0005, 3.5);
            this.targetDriftX = (Math.random() - 0.5) * 2.5 * spread;
            this.driftInterval = 400 + Math.random() * 400;
            this.driftTimer = 0;
        }
        const dt = normalizeDelta(deltaTime);
        this.driftX += (this.targetDriftX - this.driftX) * 0.035 * dt;
        this.x += this.driftX * dt;
        this.y -= (1.7 + 0.4 * Math.abs(Math.sin(this.age * 0.0013 + this.pulsePhase))) * dt;
    }

    draw(context) {
        const spawnT = Math.min(1, this.age / this.spawnDuration);
        const spawnScale = 1 - Math.pow(1 - spawnT, 2);
        const pulse = 1 + 0.1 * Math.sin(this.age * 0.007 + this.pulsePhase);
        const r = this.r * pulse * spawnScale;
        const cx = this.x + this.r;
        const cy = this.y + this.r;

        withCtx(context, () => {
            context.globalAlpha = 0.72 * spawnScale;
            this.applyGlow(context);

            const bodyGrad = context.createRadialGradient(cx - r * 0.35, cy - r * 0.38, r * 0.05, cx, cy, r);
            bodyGrad.addColorStop(0, '#ffdd55');
            bodyGrad.addColorStop(0.25, '#ff7700');
            bodyGrad.addColorStop(0.6, '#bb1500');
            bodyGrad.addColorStop(1, '#2a0000');

            context.beginPath();
            context.arc(cx, cy, r, 0, Math.PI * 2);
            context.fillStyle = bodyGrad;
            context.fill();

            setShadow(context, 'transparent', 0);
            context.translate(cx, cy);
            context.rotate(this.crackRotation);

            context.lineWidth = 1.3;
            context.globalAlpha = 0.8;
            const numCracks = 6;
            for (let i = 0; i < numCracks; i++) {
                const a = (i / numCracks) * Math.PI * 2;
                const midA = a + 0.3;
                const innerGlow = `hsl(${30 + i * 8}, 100%, ${60 - i * 3}%)`;
                context.strokeStyle = innerGlow;
                context.beginPath();
                context.moveTo(0, 0);
                context.quadraticCurveTo(
                    Math.cos(midA) * r * 0.52,
                    Math.sin(midA) * r * 0.52,
                    Math.cos(a) * r * 0.87,
                    Math.sin(a) * r * 0.87
                );
                context.stroke();
            }

            context.globalAlpha = 0.5;
            const hiGrad = context.createRadialGradient(-r * 0.3, -r * 0.35, 0, -r * 0.22, -r * 0.28, r * 0.4);
            hiGrad.addColorStop(0, 'rgba(255, 245, 180, 0.9)');
            hiGrad.addColorStop(1, 'rgba(255, 160, 40, 0)');
            context.beginPath();
            context.arc(-r * 0.22, -r * 0.28, r * 0.4, 0, Math.PI * 2);
            context.fillStyle = hiGrad;
            context.fill();

            context.globalAlpha = 0.22;
            context.strokeStyle = 'rgba(255, 210, 80, 0.9)';
            context.lineWidth = 2.5;
            context.beginPath();
            context.arc(0, 0, r * 0.87, Math.PI * 1.05, Math.PI * 1.75);
            context.stroke();
        });

        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    }
}
