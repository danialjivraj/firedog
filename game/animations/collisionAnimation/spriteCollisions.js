import { Skulnap } from "../../entities/enemies/enemies.js";
import { FloatingMessage } from "../floatingMessages.js";
import { normalizeDelta } from "../../config/constants.js";

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
        const dt = normalizeDelta(deltaTime);
        this.x -= this.game.speed * dt;

        if (this.clipRect) this.clipRect.x -= this.game.speed * dt;

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
        this._isBlood = true;
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
        if (!this.processed) {
            this.processed = true;

            this.game.enemies.forEach(enemy => {
                if (
                    enemy.x < this.x + this.width &&
                    enemy.x + enemy.width > this.x &&
                    enemy.y < this.y + this.height &&
                    enemy.y + enemy.height > this.y && !this.game.gameOver &&
                    !enemy.markedForDeletion
                ) {
                    enemy.markedForDeletion = true;
                    if (enemy instanceof Skulnap && enemy.id !== this.enemyId) {
                        this.game.collisions.push(new ExplosionCollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5, this.enemyId));
                        this.game.audioHandler.collisionSFX.playSound('explosionCollision', false, true);
                    } else if (!(enemy instanceof Skulnap)) {
                        this.game.collisions.push(new CollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                        this.game.audioHandler.collisionSFX.playSound('poofSound', false, true);
                    }
                    if (!(enemy instanceof Skulnap) || enemy.id !== this.enemyId) {
                        this.game.floatingMessages.push(new FloatingMessage('+1', enemy.x + enemy.width / 2, enemy.y, { fontSize: 30, ...this.game.UI.anchors.coins }));
                        this.game.coins++;
                    }
                }
            });

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
        }
        super.update(deltaTime);
    }
}

export class ElectricityCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'electricityCollision', 215.25, 200, 7, 20);
        this._isElectricityCollision = true;
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

export class RedFireballCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'redFireballCollision', 300.09523809523809523809523809524, 280, 20, 50);
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

export class PoisonousOrbCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'poisonousOrbCollision', 50, 50, 9, 30);
    }
}

export class InkSplashCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'blackInk', 278, 394, 6, 20);
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

export class DarkExplosionCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'darkExplosion', 300.09523809523809523809523809524, 279, 20, 50);
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

export class InkBombCollision extends Collision {
    constructor(game, x, y) {
        super(game, x, y, 'inkBombCollision', 212, 212, 7, 20);
    }
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

        let sw = 0;
        for (let si = 0; si < this.stars.length; si++) {
            if (!this.stars[si].markedForDeletion) {
                if (si !== sw) this.stars[sw] = this.stars[si];
                sw++;
            }
        }
        this.stars.length = sw;

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
