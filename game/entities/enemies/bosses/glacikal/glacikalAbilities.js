import { ImmobileGroundEnemy, Projectile, FallingEnemy, BurrowingGroundEnemy } from "../../enemies.js";
import { normalizeDelta } from "../../../../config/constants.js";
import { IcyStormBallCollision, PointyIcicleShardCollision } from "../../../../animations/collisionAnimation/spriteCollisions.js";

export class IceTrail extends ImmobileGroundEnemy {
    constructor(game, x) {
        super(game, 32, 70, 0, "iceTrail");
        this.isSlowEnemy = true;

        this.x = x;
        this.y = this.game.height - this.height - this.game.groundMargin;

        this.speedX = 0;
        this.speedY = 0;
    }
}

export class PointyIcicleShard extends FallingEnemy {
    constructor(game) {
        super(game, 34, 130, 0, "pointyIcicleShard");

        this.isSlowEnemy = true;

        this.speedY = Math.random() * 4 + 9;
        this.speedX = 0;

        this.x = Math.random() * (this.game.width - this.width);
        this.y = -this.height - Math.random() * 80;
    }

    update(deltaTime) {
        const dt = normalizeDelta(deltaTime);
        this.y += this.speedY * dt;
        this.advanceFrame(deltaTime);

        const groundHitY = this.game.height - this.game.groundMargin - this.height;

        if (this.y >= groundHitY) {
            this.y = groundHitY;
            this.markedForDeletion = true;

            this.game.collisions.push(
                new PointyIcicleShardCollision(this.game, this.x + this.width * 0.5, this.y + this.height * 0.5)
            );
            this.game.audioHandler.collisionSFX.playSound("breakingIceNoDamageSound", false, true);
            return;
        }

        if (this.lives <= 0 || this.y > this.game.height + this.height) {
            this.markedForDeletion = true;
        }
    }
}

export class UndergroundIcicle extends BurrowingGroundEnemy {
    constructor(game, centerX) {
        super(game, 132, 400, 0, "undergroundIcicle", centerX, {
            baseWarningDuration: 1500,
            baseRiseDuration: 550,
            baseHoldDuration: 350,
            baseRetractDuration: 750,
            warningJitter: {
                warning: 300,
                rise: 150,
                hold: 120,
                retract: 200,
            },
            randomiseDurations: true,
            cyclesMax: 4,
            moveBetweenCycles: true,
            soundIds: {
                emerge: "undergroundIcicleSound",
            },
        });
        this.lives = 50;
        this.isSlowEnemy = true;
    }
}

export class IceSpider extends FallingEnemy {
    constructor(game, x = null) {
        super(game, 71.16666666666667, 60, 5, "iceSpider");

        this.x = x !== null ? x : Math.random() * (this.game.width - this.width);
        this.y = -this.height - Math.random() * 120;

        this.setFps(10);

        this.state = "falling";
        this.speedY = Math.random() * 2 + 8;
        this.chaseSpeed = 3.2;
        this.speedX = 0;

        this.shouldInvert = false;
        this.isSlowEnemy = true;

        this.soundId = "nightSpiderSound";
    }

    update(deltaTime) {
        const dt = normalizeDelta(deltaTime);
        const groundY = this.game.height - this.height - this.game.groundMargin;

        const spiderCenterX = this.x + this.width / 2;
        const playerCenterX = this.game.player.x + this.game.player.width / 2;

        if (this.game.gameOver) {
            if (this.state === "falling") {
                this.shouldInvert = playerCenterX > spiderCenterX;

                this.y += this.speedY * dt;
                if (this.y >= groundY) {
                    this.y = groundY;
                    this.speedY = 0;
                    this.state = "leaving";
                }
            } else {
                this.speedX = -this.chaseSpeed;
                this.x += this.speedX * dt;
                this.shouldInvert = false;
            }

            this.advanceFrame(deltaTime);

            if (this.x + this.width < 0 || this.lives <= 0) {
                this.markedForDeletion = true;
            }
            return;
        }

        if (this.state === "falling") {
            this.shouldInvert = playerCenterX > spiderCenterX;

            this.y += this.speedY * dt;

            if (this.y >= groundY) {
                this.y = groundY;
                this.speedY = 0;
                this.state = "chasing";
            }
        } else if (this.state === "chasing") {
            const dir = playerCenterX > spiderCenterX ? 1 : -1;
            this.speedX = dir * this.chaseSpeed;
            this.x += this.speedX * dt;

            this.shouldInvert = this.speedX > 0;
        }

        this.advanceFrame(deltaTime);

        const offLeft = this.x + this.width < 0;
        const offRight = this.x > this.game.width;
        const dead = this.lives <= 0;

        if (offLeft || offRight || dead) {
            this.markedForDeletion = true;
            if (this.soundId) {
                this.game.audioHandler.enemySFX.stopSound(this.soundId);
            }
        } else if (this.soundId) {
            this.playIfOnScreen(this.soundId);
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.scale(this.shouldInvert ? -1 : 1, 1);

        context.drawImage(
            this.image,
            this.frameX * this.width,
            0,
            this.width,
            this.height,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        context.restore();
    }
}

export class IcyStormBall extends FallingEnemy {
    constructor(game) {
        super(game, 33, 50, 2, "icyStormBall");

        this.isSlowEnemy = true;
        this.speedY = Math.random() * 3 + 7;
        this.x = Math.random() * (this.game.width - this.width);
    }

    update(deltaTime) {
        super.update(deltaTime);

        const groundHitY = this.game.height - this.game.groundMargin - (this.height - 7);

        if (this.y >= groundHitY) {
            this.markedForDeletion = true;
            this.game.collisions.push(
                new IcyStormBallCollision(this.game, this.x + this.width * 0.5, this.y + this.height * 0.5 - 12)
            );
        }
    }
}

export class IceSlash extends Projectile {
    constructor(game, x, y, speedX) {
        super(game, x, y, 136.6666666666667, 150, 2, "iceSlash", speedX, 18);

        this.isFrozenEnemy = true;
        this.lives = 1;
        this.frameTimer = 0;
    }

    update(deltaTime) {
        const dt = normalizeDelta(deltaTime);
        this.x += this.speedX * dt;
        this.advanceFrame(deltaTime);

        const offLeft = this.x + this.width < 0;
        const offRight = this.x > this.game.width;
        const dead = this.lives <= 0;

        if (offLeft || offRight || dead) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();
        context.shadowColor = "#00eaff";
        context.shadowBlur = 18;

        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        if (this.speedX > 0) context.scale(-1, 1);

        context.drawImage(
            this.image,
            this.frameX * this.width,
            0,
            this.width,
            this.height,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        context.restore();
    }
}

export class SpinningIceBalls extends Projectile {
    constructor(game, boss, index = 0, total = 2, directionRight = false) {
        super(game, boss.x, boss.y, 35, 35, 0, "spinningIceBalls", 0, 0);
        this.boss = boss;

        this.isSlowEnemy = true;

        this.directionRight = directionRight;

        this.phase = "emerge";

        this.minScale = 0.1;
        this.maxScale = 1;
        this.scale = this.minScale;

        this.emergeTimer = 0;
        this.emergeDuration = 220;

        const spacing = 75;
        const globalLift = -50;

        if (total === 2) {
            this.offsetY = (index === 0 ? 0 : spacing * 1.5) + globalLift;
        } else {
            const mid = (total - 1) / 2;
            this.offsetY = (index - mid) * spacing + globalLift;
        }

        const bodyC = this.getBodyCenter();
        const armC = this.getArmTipCenter();

        const startOutT = 0.22;
        this.startCenter = {
            x: bodyC.x + (armC.x - bodyC.x) * startOutT,
            y: bodyC.y + (armC.y - bodyC.y) * startOutT,
        };

        this.targetCenter = { x: armC.x, y: armC.y + this.offsetY };

        this.setPositionFromCenter(this.startCenter.x, this.startCenter.y);

        this.shotSpeed = 9.5;
        this.speedX = 0;
        this.speedY = 0;

        this.rotationAngle = 0;
        this.rotationSpeed = 0.26;

        this.soundId = "iceBallSound";
        this.throwSoundPlayed = false;
    }

    getBodyCenter() {
        const cx = this.boss.x + this.boss.width / 2;
        const cy = this.boss.y + this.boss.height * 0.55;
        return { x: cx, y: cy };
    }

    getArmTipCenter() {
        const facingRight = !!this.boss.shouldInvert;

        let cx = facingRight ? this.boss.x + this.boss.width - this.width * 0.6 : this.boss.x - this.width * 0.4;

        let cy = this.boss.y + this.boss.height * 0.55 - this.height / 2;

        cx = Math.max(0, Math.min(this.game.width - this.width, cx));
        cy = Math.max(0, Math.min(this.game.height - this.height, cy));

        return { x: cx, y: cy };
    }

    setPositionFromCenter(cx, cy) {
        const drawW = this.width * this.scale;
        const drawH = this.height * this.scale;

        this.x = cx - drawW / 2;
        this.y = cy - drawH / 2;

        this.x = Math.max(0, Math.min(this.game.width - drawW, this.x));
        this.y = Math.max(0, Math.min(this.game.height - drawH, this.y));
    }

    update(deltaTime) {
        if (!this.boss || this.boss.markedForDeletion || this.lives <= 0) {
            this.markedForDeletion = true;
            return;
        }

        const step = normalizeDelta(deltaTime);
        this.rotationAngle += this.rotationSpeed * step;

        if (this.phase === "emerge") {
            this.emergeTimer += deltaTime;
            let t = Math.min(1, this.emergeTimer / this.emergeDuration);
            t = t * t * (3 - 2 * t);

            this.scale = this.minScale + (this.maxScale - this.minScale) * t;

            const cx = this.startCenter.x + (this.targetCenter.x - this.startCenter.x) * t;
            const cy = this.startCenter.y + (this.targetCenter.y - this.startCenter.y) * t;

            this.setPositionFromCenter(cx, cy);

            if (t >= 1) {
                this.phase = "travel";
                this.scale = this.maxScale;

                const dirSign = this.directionRight ? 1 : -1;
                this.speedX = this.shotSpeed * dirSign;
                this.speedY = 0;

                if (!this.throwSoundPlayed) {
                    this.throwSoundPlayed = true;
                    this.game.audioHandler.enemySFX.playSound("iceBallSound", false, true);
                }
            }
        } else {
            this.x += this.speedX * step;
        }

        this.advanceFrame(deltaTime);

        const offLeft = this.x + this.width < 0;
        const offRight = this.x > this.game.width;
        const offBottom = this.y > this.game.height;
        const offTop = this.y + this.height < 0;

        if (offLeft || offRight || offBottom || offTop || this.lives <= 0) {
            this.markedForDeletion = true;
            this.game.audioHandler.enemySFX.stopSound(this.soundId);
        } else if (this.phase === "travel") {
            this.playIfOnScreen(this.soundId);
        }
    }

    draw(context) {
        const drawW = this.width * this.scale;
        const drawH = this.height * this.scale;

        if (this.game.debug) context.strokeRect(this.x, this.y, drawW, drawH);

        context.save();
        context.shadowColor = "blue";
        context.shadowBlur = 10;

        context.translate(this.x + drawW / 2, this.y + drawH / 2);
        context.rotate(this.rotationAngle);

        context.drawImage(
            this.image,
            this.frameX * this.width,
            0,
            this.width,
            this.height,
            -drawW / 2,
            -drawH / 2,
            drawW,
            drawH
        );

        context.restore();
    }
}
