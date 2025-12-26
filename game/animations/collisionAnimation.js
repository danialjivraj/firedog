import { Skulnap, Abyssaw } from "../entities/enemies/enemies.js";
import { FloatingMessage } from "./floatingMessages.js";

export class Collision {
    constructor(
        game, x, y, imageId, spriteWidth, spriteHeight, maxFrame, fps,
        drawWidth = spriteWidth, drawHeight = spriteHeight,
        clipRect = null
    ) {
        this.game = game;
        this.image = document.getElementById(imageId);

        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;

        this.width = drawWidth;
        this.height = drawHeight;

        this.x = x - this.width * 0.5;
        this.y = y - this.height * 0.5;

        this.frameX = 0;
        this.maxFrame = maxFrame;
        this.markedForDeletion = false;

        this.fps = fps;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;

        this.clipRect = clipRect;
    }

    draw(context) {
        context.save();

        if (this.clipRect) {
            context.beginPath();
            context.rect(0, 0, this.game.width, this.clipRect.h);
            context.clip();
        }

        context.drawImage(
            this.image,
            this.frameX * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight,
            this.x, this.y,
            this.width, this.height
        );

        context.restore();
    }

    update(deltaTime) {
        this.x -= this.game.speed;

        if (this.clipRect) this.clipRect.x -= this.game.speed;

        if (this.frameTimer > this.frameInterval) {
            this.frameX++;
            this.frameTimer = 0;
        } else {
            this.frameTimer += deltaTime;
        }
        if (this.frameX > this.maxFrame) this.markedForDeletion = true;
    }
}

export class CollisionAnimation extends Collision {
    constructor(game, x, y, isBluePotionActive) {
        const animationType = isBluePotionActive ? 'blueCollisionAnimation' : 'collisionAnimation';
        const { width, height, maxFrame, fps } = animationType === 'blueCollisionAnimation'
            ? { width: 113.857, height: 110, maxFrame: 6, fps: 25 }
            : { width: 100, height: 90, maxFrame: 4, fps: Math.random() * 10 + 5 };

        super(game, x, y, animationType, width, height, maxFrame, fps);
    }
}

export class Blood extends Collision {
    constructor(game, x, y, enemy) {
        super(game, x, y, 'blood', 70.571428571428571428571428571429, 100, 6, 20);
        this.enemy = enemy;
    }

    updatePosition(enemy) {
        this.x = enemy.x + enemy.width * 0.5 - this.width * 0.5;
        this.y = enemy.y + enemy.height * 0.5 - this.height * 0.5;
    }
}

export class ExplosionCollisionAnimation extends Collision {
    constructor(game, x, y, enemyId) {
        const adjustedY = y - 50;
        let fps = Math.random() * (40 - 25) + 25;
        super(game, x, adjustedY, 'explosionCollisionAnimation', 300.09523809523809523809523809524, 260, 20, fps);
        this.enemyId = enemyId;
        this.processed = false;
    }

    update(deltaTime) {
        // checks collision with enemies
        this.game.enemies.forEach(enemy => {
            if (
                enemy.x < this.x + this.width &&
                enemy.x + enemy.width > this.x &&
                enemy.y < this.y + this.height &&
                enemy.y + enemy.height > this.y && !this.game.gameOver
            ) {
                enemy.markedForDeletion = true;
                if (!(enemy instanceof Skulnap)) {
                    this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
                    this.game.collisions.push(new CollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                    this.game.floatingMessages.push(new FloatingMessage('+1', enemy.x, enemy.y, 150, 50, 20));
                    this.game.coins++;
                } else if (enemy instanceof Skulnap && enemy.id !== this.enemyId) {
                    this.game.collisions.push(new ExplosionCollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5, this.enemyId));
                    this.game.audioHandler.enemySFX.stopSound('skeletonRattlingSound');
                    this.game.audioHandler.collisionSFX.playSound('explosionCollision', false, true);
                }
                if (enemy instanceof Abyssaw) {
                    this.game.audioHandler.enemySFX.stopSound('spinningChainsaw');
                }
            }
        });

        // checks collision with power-ups
        this.game.powerUps.forEach(powerUp => {
            if (
                powerUp.x < this.x + this.width &&
                powerUp.x + powerUp.width > this.x &&
                powerUp.y < this.y + this.height &&
                powerUp.y + powerUp.height > this.y && !this.game.gameOver
            ) {
                powerUp.markedForDeletion = true;
                this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
                this.game.collisions.push(new CollisionAnimation(
                    this.game, powerUp.x + powerUp.width * 0.5, powerUp.y + powerUp.height * 0.5));
            }
        });
        // checks collision with power-down
        this.game.powerDowns.forEach(powerDown => {
            if (
                powerDown.x < this.x + this.width &&
                powerDown.x + powerDown.width > this.x &&
                powerDown.y < this.y + this.height &&
                powerDown.y + powerDown.height > this.y && !this.game.gameOver
            ) {
                powerDown.markedForDeletion = true;
                this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
                this.game.collisions.push(new CollisionAnimation(this.game, powerDown.x + powerDown.width * 0.5, powerDown.y + powerDown.height * 0.5));
            }
        });
        super.update(deltaTime);
    }
}

export class MeteorExplosionCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'meteorExplosion', 382, 332, 5, 23);
    }
}

export class AsteroidExplosionCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'asteroidExplosion', 382, 332, 5, 23);
    }
}

export class ElectricityCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'electricityCollision', 215.25, 200, 7, 20);
    }

    updatePosition(enemy) {
        this.x = enemy.x + enemy.width * 0.5 - this.width * 0.5;
        this.y = enemy.y + enemy.height * 0.5 - this.height * 0.5;
    }
    updatePositionWhereCollisionHappened(x, y) {
        this.x = x;
        this.y = y;
    }
}

export class DarkExplosionCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'darkExplosion', 300.09523809523809523809523809524, 279, 20, 50);
    }
}

export class RedFireballCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'redFireballCollision', 300.09523809523809523809523809524, 280, 20, 50);
    }
}

export class PurpleFireballCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'purpleFireballCollision', 300.09523809523809523809523809524, 280, 20, 50);
    }
}

export class PurpleThunderCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'purpleThunderCollision', 304, 293, 20, 50);
    }
}

export class PoisonSpitSplash extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'poisonSpitSplash', 43, 73, 10, 80);
    }
}

export class PoisonDropCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'poisonDropCollision', 112, 102, 5, 30);
    }
}

export class PoisonDropGroundCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'poisonDropGroundCollision', 50, 50, 6, 30);
    }
}

function _makeOffscreenCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    return c;
}

function _snapshotDrawable(source, w, h, options = {}) {
    const c = _makeOffscreenCanvas(w, h);
    const ctx = c.getContext("2d");

    const sx = options.sourceX ?? source.x ?? 0;
    const sy = options.sourceY ?? source.y ?? 0;

    ctx.save();
    ctx.translate(-sx, -sy);

    const prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = 1;

    source.draw(ctx);

    ctx.globalAlpha = prevAlpha;
    ctx.restore();

    return c;
}

export class IcyStormBallCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'icyStormBallCollision', 42.44444444444444, 50, 8, 50);
    }
}

export class IceSlashCollision extends Collision {
    constructor(game, x, y, shouldInvert = false) {
        super(game, x, y, 'iceSlashCollision', 119, 150, 5, 30);
        this.shouldInvert = shouldInvert;
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.scale(this.shouldInvert ? -1 : 1, 1);

        context.drawImage(
            this.image,
            this.frameX * this.spriteWidth,
            0,
            this.spriteWidth,
            this.spriteHeight,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        context.restore();
    }
}

export class IceTrailCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'iceTrailCollision', 28.83333333333333, 70, 5, 30);
    }
}

export class InkSplashCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'blackInk', 278, 394, 6, 20);
    }
}

export class SpinningIceBallsCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'spinningIceBallsCollision', 37.2, 35, 4, 20);
    }
}

export class PointyIcicleShardCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'pointyIcicleShardCollision', 81, 130, 5, 20);
    }
}

export class UndergroundIcicleCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'undergroundIcicleCollision', 125.4, 200, 4, 20);
    }
}

export class InkBombCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'inkBombCollision', 212, 212, 7, 20);
    }
}

export class GalacticSpikeCollision extends Collision {
    constructor(game, x, y, heightScale = 1, widthScale = 1, clipRect = null) {
        const SPR_W = 211.5454545454545;
        const SPR_H = 180;

        super(
            game,
            x,
            y,
            'galacticSpikeCollision',
            SPR_W,
            SPR_H,
            10,
            30,
            SPR_W * widthScale,
            SPR_H * heightScale,
            clipRect
        );
    }
}

export class DisintegrateCollision {
    constructor(game, source, options = {}) {
        this.game = game;

        this.followTarget = options.followTarget || null;

        this.width = options.width ?? source.width ?? 0;
        this.height = options.height ?? source.height ?? 0;

        this.image = options.image || source.image || null;

        if (!this.image && source && typeof source.draw === "function") {
            const snapW =
                options.snapshotWidth ??
                this.width ??
                source.width ??
                source.spriteWidth ??
                0;

            const snapH =
                options.snapshotHeight ??
                this.height ??
                source.height ??
                source.spriteHeight ??
                0;

            if (snapW > 0 && snapH > 0) {
                this.image = _snapshotDrawable(source, snapW, snapH, {
                    sourceX: options.sourceX,
                    sourceY: options.sourceY,
                });

                options.frameX ??= 0;
                options.frameY ??= 0;
                options.spriteWidth ??= this.image.width;
                options.spriteHeight ??= this.image.height;

                options.width ??= this.image.width;
                options.height ??= this.image.height;
            }
        }

        this.spriteWidth =
            options.spriteWidth ??
            source.width ??
            source.spriteWidth ??
            (this.image ? this.image.width : 0);

        this.spriteHeight =
            options.spriteHeight ??
            source.height ??
            source.spriteHeight ??
            (this.image ? this.image.height : 0);

        this.width = options.width ?? source.width ?? this.spriteWidth;
        this.height = options.height ?? source.height ?? this.spriteHeight;

        const srcW = source.width ?? this.width;
        const srcH = source.height ?? this.height;

        const cxFromSource = (source.x ?? 0) + srcW * 0.5;
        const cyFromSource = (source.y ?? 0) + srcH * 0.5;

        this.x = options.x ?? cxFromSource;
        this.y = options.y ?? cyFromSource;

        this.frameX = options.frameX ?? source.frameX ?? 0;
        this.frameY = options.frameY ?? source.frameY ?? 0;

        const drawInfo = source.collisionDrawInfo || {};

        if (typeof options.angle === "number") {
            this.angle = options.angle;
        } else if (typeof drawInfo.angle === "number") {
            this.angle = drawInfo.angle;
        } else if (typeof source.angle === "number") {
            this.angle = source.angle;
        } else {
            const vx = drawInfo.vx ?? source.speedX ?? source.vx ?? 0;
            const vy = drawInfo.vy ?? source.speedY ?? source.vy ?? 0;
            this.angle = (vx || vy) ? Math.atan2(vy, vx) : 0;
        }

        this.direction =
            options.direction ??
            drawInfo.direction ??
            source.direction ??
            false;

        this.duration = options.duration ?? 450;
        this.timer = 0;
        this.markedForDeletion = false;

        const cols = options.cols ?? 7;
        const rows = options.rows ?? 4;

        const shardW = this.spriteWidth / cols;
        const shardH = this.spriteHeight / rows;

        this.shards = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const sx = col * shardW;
                const sy = row * shardH;

                const sw = (col === cols - 1)
                    ? this.spriteWidth - sx
                    : shardW;
                const sh = (row === rows - 1)
                    ? this.spriteHeight - sy
                    : shardH;

                const fx = (col + 0.5) / cols - 0.5;
                const fy = (row + 0.5) / rows - 0.5;

                let dirX = fx;
                let dirY = fy;

                const len = Math.hypot(dirX, dirY) || 1;
                dirX /= len;
                dirY /= len;

                const jitterAngle = (Math.random() - 0.5) * 0.6;
                const cosA = Math.cos(jitterAngle);
                const sinA = Math.sin(jitterAngle);
                const jx = dirX * cosA - dirY * sinA;
                const jy = dirX * sinA + dirY * cosA;

                const baseSpeed =
                    (options.minShardSpeed ?? 25) +
                    Math.random() *
                    ((options.maxShardSpeed ?? 60) - (options.minShardSpeed ?? 25));

                this.shards.push({
                    sx,
                    sy,
                    sw,
                    sh,
                    dirX: jx,
                    dirY: jy,
                    baseSpeed,
                    jitterPhase: Math.random() * Math.PI * 2,
                    jitterStrength:
                        (options.jitterStrengthBase ?? 1) +
                        Math.random() * (options.jitterStrengthRange ?? 1.5),
                    alpha: 1,
                    scale: 1,
                    offsetX: 0,
                    offsetY: 0,
                });
            }
        }
    }

    update(deltaTime) {
        if (this.followTarget) {
            this.x = this.followTarget.x + this.followTarget.width * 0.5;
            this.y = this.followTarget.y + this.followTarget.height * 0.5;
        } else {
            this.x -= this.game.speed;
        }

        this.timer += deltaTime;
        const t = Math.min(1, this.timer / this.duration);

        const travelFactor = t * t;

        this.shards.forEach(shard => {
            const baseDist = shard.baseSpeed * travelFactor;

            let dx = shard.dirX * baseDist;
            let dy = shard.dirY * baseDist;

            const time = this.timer * 0.01;
            const wiggle = Math.sin(time + shard.jitterPhase) * shard.jitterStrength;
            dx += -shard.dirY * wiggle * 0.5;
            dy += shard.dirX * wiggle * 0.5;

            shard.offsetX = dx;
            shard.offsetY = dy;

            shard.alpha = 1 - t * 1.1;
            shard.scale = 1 - t * 0.85;

            if (shard.alpha < 0) shard.alpha = 0;
            if (shard.scale < 0) shard.scale = 0;
        });

        if (this.timer >= this.duration) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        if (!this.image) return;

        context.save();

        if (this.game.debug) {
            context.strokeRect(
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        }

        context.translate(this.x, this.y);

        if (this.direction) {
            context.scale(-1, -1);
        } else {
            context.scale(1, -1);
        }
        context.rotate(this.angle);

        const baseSx = this.frameX * this.spriteWidth;
        const baseSy = this.frameY * this.spriteHeight;

        const widthScale = this.width / this.spriteWidth;
        const heightScale = this.height / this.spriteHeight;

        for (const shard of this.shards) {
            if (shard.alpha <= 0 || shard.scale <= 0) continue;

            const localCenterX =
                -this.width / 2 +
                (shard.sx + shard.sw * 0.5) * widthScale;

            const localCenterY =
                -this.height / 2 +
                (shard.sy + shard.sh * 0.5) * heightScale;

            const dx = localCenterX + shard.offsetX;
            const dy = localCenterY + shard.offsetY;

            const dw = shard.sw * widthScale * shard.scale;
            const dh = shard.sh * heightScale * shard.scale;

            context.save();
            context.globalAlpha = shard.alpha;

            context.drawImage(
                this.image,
                baseSx + shard.sx,
                baseSy + shard.sy,
                shard.sw,
                shard.sh,
                dx - dw / 2,
                dy - dh / 2,
                dw,
                dh
            );

            context.restore();
        }

        context.restore();
    }
}

export class GhostFadeOut {
    constructor(game, enemy) {
        this.game = game;

        this.image = enemy.image;
        this.spriteWidth = enemy.width;
        this.spriteHeight = enemy.height;

        this.frameX = enemy.frameX || 0;
        this.frameY = enemy.frameY || 0;

        this.width = enemy.width;
        this.height = enemy.height;

        this.x = enemy.x;
        this.y = enemy.y;

        this.inverted = enemy.incrementMovement > 0;

        this.duration = 450;
        this.timer = 0;
        this.alpha = 1;

        this.bands = [];
        const bandCount = 12;
        const bandHeight = this.spriteHeight / bandCount;

        const baseSy = this.frameY * this.spriteHeight;

        for (let i = 0; i < bandCount; i++) {
            const sy = baseSy + i * bandHeight;
            const sh = i === bandCount - 1
                ? this.spriteHeight - i * bandHeight
                : bandHeight;

            this.bands.push({
                sy,
                sh,
                offsetX: 0,
                offsetY: 0,
                jitterStrength: 3 + Math.random() * 12,
                flicker: Math.random() * 0.6 + 0.4,
                phase: Math.random() * Math.PI * 2,
                currentAlpha: 1,
            });
        }

        this.markedForDeletion = false;
    }

    update(deltaTime) {
        this.x -= this.game.speed;

        this.timer += deltaTime;
        const t = Math.min(1, this.timer / this.duration);

        this.alpha = 1 - t;

        const time = this.timer / 60;

        for (let i = 0; i < this.bands.length; i++) {
            const band = this.bands[i];
            const f = i / this.bands.length;

            const noise = Math.sin(time * 0.9 + band.phase + f * 6);
            band.offsetX = noise * band.jitterStrength * (1 + t * 2);

            const noiseY = Math.cos(time * 1.3 + band.phase * 1.5);
            band.offsetY = noiseY * 1.3;

            band.currentAlpha =
                this.alpha *
                (0.3 +
                    band.flicker *
                    (0.7 + 0.3 * Math.sin(time * 3 + f * 10)));
        }

        if (this.timer >= this.duration) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        context.save();

        const centerX = this.x + this.width * 0.5;
        const centerY = this.y + this.height * 0.5;

        if (this.game.debug) {
            context.strokeRect(this.x, this.y, this.width, this.height);
        }

        context.translate(centerX, centerY);
        context.scale(this.inverted ? -1 : 1, 1);

        const baseSx = this.frameX * this.spriteWidth;

        const scaleY = this.height / this.spriteHeight;

        for (let i = 0; i < this.bands.length; i++) {
            const band = this.bands[i];
            const dyTop =
                -this.height / 2 +
                (band.sy - this.frameY * this.spriteHeight) * scaleY;
            const sh = band.sh;

            const destBandHeight = sh * scaleY;

            context.save();
            context.globalAlpha = band.currentAlpha;

            const dx = -this.width / 2 + band.offsetX;
            const dy = dyTop + band.offsetY;

            context.drawImage(
                this.image,
                baseSx,
                band.sy,
                this.spriteWidth,
                sh,
                dx,
                dy,
                this.width,
                destBandHeight
            );
            context.restore();

            context.save();
            context.globalAlpha = band.currentAlpha * 0.55;

            const dx2 = -this.width / 2 - band.offsetX * 0.7;
            const dy2 = dyTop - band.offsetY * 0.7;

            context.drawImage(
                this.image,
                baseSx,
                band.sy,
                this.spriteWidth,
                sh,
                dx2,
                dy2,
                this.width,
                destBandHeight
            );
            context.restore();
        }

        context.restore();
    }
}

export class HealingStar {
    constructor(game, anchorOrNull, offset, options = {}) {
        this.game = game;

        this.followTarget = options.followTarget ?? anchorOrNull ?? null;

        this.width = options.width ?? 100;
        this.height = options.height ?? 100;

        this.offsetX = offset.dx;
        this.offsetY = offset.dy;

        this.image = document.getElementById(options.imageId ?? "healingStar");
        this.maxFrame = options.maxFrame ?? 6;

        this.fps = options.fps ?? 14;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;

        this.frameX = 0;
        this.frameY = 0;

        this.fixed = (typeof options.x === "number" && typeof options.y === "number");
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;

        this.spawnedNext = false;
        this.markedForDeletion = false;
    }

    _centerFromTarget(t) {
        const cx = (t.x ?? 0) + (t.width ?? 0) / 2;
        const cy = (t.y ?? 0) + (t.height ?? 0) / 2;
        return { cx, cy };
    }

    update(deltaTime) {
        if (!this.fixed && this.followTarget && !this.followTarget.markedForDeletion) {
            const { cx, cy } = this._centerFromTarget(this.followTarget);
            this.x = cx - this.width / 2 + this.offsetX;
            this.y = cy - this.height / 2 + this.offsetY;
        }

        this.frameTimer += deltaTime;
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX += 1;
            else this.markedForDeletion = true;
        }
    }

    draw(context) {
        if (!this.image) return;
        context.drawImage(
            this.image,
            this.frameX * this.width,
            this.frameY * this.height,
            this.width,
            this.height,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}

export class HealingStarBurstCollision {
    static DEFAULT_OFFSETS = [
        { dx: 0, dy: 0 },
        { dx: -40, dy: 40 },
        { dx: -40, dy: -40 },
        { dx: 60, dy: 0 },
    ];

    constructor(game, anchorOrNull, options = {}) {
        this.game = game;

        this.followTarget = options.followTarget ?? anchorOrNull ?? null;

        this.x = options.x;
        this.y = options.y;
        this.useFixed = (typeof this.x === "number" && typeof this.y === "number");

        this.offsets = options.offsets || HealingStarBurstCollision.DEFAULT_OFFSETS;
        this.totalStars = this.offsets.length;

        this.stars = [];
        this.spawned = 0;

        this.started = false;
        this.finished = false;
        this.markedForDeletion = false;

        this.soundId = options.soundId ?? "healingStarSound";
        this.playSound = options.playSound ?? true;
    }

    start() {
        if (this.started) return;
        this.started = true;
        this.spawnNext();
    }

    spawnNext() {
        if (this.spawned >= this.totalStars) return;

        const offset = this.offsets[this.spawned] || { dx: 0, dy: 0 };

        if (this.spawned === 0 && this.playSound && this.soundId) {
            this.game.audioHandler.enemySFX.playSound(this.soundId, false, true);
        }

        const star = new HealingStar(
            this.game,
            this.followTarget,
            offset,
            this.useFixed
                ? { x: this.x, y: this.y }
                : { followTarget: this.followTarget }
        );

        this.stars.push(star);
        this.spawned++;
    }

    update(deltaTime) {
        if (!this.started || this.finished) return;

        for (const s of this.stars) s.update(deltaTime);

        for (const star of this.stars) {
            if (
                !star.spawnedNext &&
                this.spawned < this.totalStars &&
                star.frameX >= Math.floor(star.maxFrame / 2)
            ) {
                star.spawnedNext = true;
                this.spawnNext();
            }
        }

        this.stars = this.stars.filter(s => !s.markedForDeletion);

        if (this.spawned >= this.totalStars && this.stars.length === 0) {
            this.finished = true;
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        if (!this.started || this.finished) return;
        for (const s of this.stars) s.draw(context);
    }
}

export class BallParticleBurstCollision {
    constructor(game, x, y, options = {}) {
        this.game = game;

        this.x = x;
        this.y = y;

        this.followTarget = options.followTarget ?? null;

        this.color = options.color ?? "magenta";
        this.count = options.count ?? 24;
        this.minRadius = options.minRadius ?? 2;
        this.maxRadius = options.maxRadius ?? 6;

        this.duration = options.duration ?? 520; // ms
        this.timer = 0;
        this.markedForDeletion = false;

        this.scrollsWithWorld = options.scrollsWithWorld ?? true;

        this.minSpeed = options.minSpeed ?? 2.5;
        this.maxSpeed = options.maxSpeed ?? 7.5;

        this.gravity = options.gravity ?? 0.35;
        this.drag = options.drag ?? 0.985;

        this.angle = options.angle ?? (-Math.PI / 2);
        this.spread = options.spread ?? (Math.PI * 0.95);

        this.spawnJitter = options.spawnJitter ?? 3;

        this.fadeStart = options.fadeStart ?? 0.25;

        this.particles = [];
        for (let i = 0; i < this.count; i++) {
            const a =
                this.angle +
                (Math.random() - 0.5) * this.spread;

            const speed =
                this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);

            const r =
                this.minRadius + Math.random() * (this.maxRadius - this.minRadius);

            const jx = (Math.random() - 0.5) * this.spawnJitter;
            const jy = (Math.random() - 0.5) * this.spawnJitter;

            this.particles.push({
                x: jx,
                y: jy,
                vx: Math.cos(a) * speed,
                vy: Math.sin(a) * speed,
                r,
                baseAlpha: 0.85 + Math.random() * 0.15,
                drawAlpha: 1,
            });
        }
    }

    _centerFromTarget(t) {
        const cx = (t.x ?? 0) + (t.width ?? 0) * 0.5;
        const cy = (t.y ?? 0) + (t.height ?? 0) * 0.5;
        return { cx, cy };
    }

    update(deltaTime) {
        const dt = deltaTime / 16.6667;

        if (this.followTarget && !this.followTarget.markedForDeletion) {
            const { cx, cy } = this._centerFromTarget(this.followTarget);
            this.x = cx;
            this.y = cy;
        } else if (this.scrollsWithWorld) {
            this.x -= this.game.speed * dt;
        }

        this.timer += deltaTime;
        const t = Math.min(1, this.timer / this.duration);

        let fade = 1;
        if (t >= this.fadeStart) {
            const ft = (t - this.fadeStart) / (1 - this.fadeStart);
            fade = Math.max(0, 1 - ft);
        }

        for (const p of this.particles) {
            // physics
            p.vx *= Math.pow(this.drag, dt);
            p.vy *= Math.pow(this.drag, dt);
            p.vy += this.gravity * dt;

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            p.drawAlpha = p.baseAlpha * fade;
        }

        if (this.timer >= this.duration) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        if (!this.particles.length) return;

        context.save();
        context.translate(this.x, this.y);

        context.fillStyle = this.color;

        for (const p of this.particles) {
            if (p.drawAlpha <= 0) continue;

            context.globalAlpha = p.drawAlpha;
            context.beginPath();
            context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            context.fill();
        }

        context.restore();
    }
}
