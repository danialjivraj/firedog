import { EnemyBoss, Barrier, Projectile, GroundEnemy, FallingEnemy, ImmobileGroundEnemy } from "./enemies.js";
import { MeteorExplosionCollision, DarkExplosionCollision, PoisonDropGroundCollision, GhostFadeOut } from "../../animations/collisionAnimation.js";
import { PurpleWarningIndicator } from "../../animations/damageIndicator.js";

export class PurpleBarrier extends Barrier {
    constructor(game, x, y) {
        super(game, x, y, 170, 210,
            ['barrier2', 'barrier1', 'barrier'],
            3,
            {
                sounds: {
                    crackSoundsByLives: {
                        2: 'elyvorg_shield_crack_1_sound',
                        1: 'elyvorg_shield_crack_2_sound',
                    },
                    breakSound: 'elyvorg_shield_crack_3_sound',
                    spawnSound: 'elyvorg_shield_up_sound',
                },
            }
        );
    }
}

export class PurpleLaserBeam extends Projectile {
    constructor(game, x, y, speedX, speedY = 0) {
        super(game, x, y, 100, 57, 0, 'elyvorg_laser_beam', speedX, 20);
        this.speedY = speedY;

        this.direction = this.speedX < 0;

        this.collisionDrawInfo = {
            angle: 0,
            direction: this.direction,
        };
    }

    draw(context) {
        if (this.game.debug) {
            context.strokeRect(this.x, this.y, this.width, this.height);
        }

        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);

        let angle = Math.atan2(this.speedY, this.speedX);

        if (this.direction) {
            angle = Math.PI - angle;
            context.scale(-1, -1);
        } else {
            context.scale(1, -1);
        }

        this.collisionDrawInfo.angle = angle;
        this.collisionDrawInfo.direction = this.direction;

        context.rotate(angle);

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

export class MeteorAttack extends FallingEnemy {
    constructor(game) {
        super(game, 132.5, 250, 5, 'meteorAttack');
        this.speedY = Math.random() * 5 + 2;
        this.x = Math.random() * (this.game.width - this.width);
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.y >= this.game.height - this.game.groundMargin - 230) {
            this.markedForDeletion = true;
            this.game.collisions.push(new MeteorExplosionCollision(this.game, this.x + this.width * 0.5, this.y + this.height * 0.5 - 30));
            this.game.audioHandler.collisionSFX.playSound('elyvorg_meteor_in_contact_with_ground_sound');
        }
    }
}

export class PoisonDrop extends FallingEnemy {
    constructor(game) {
        super(game, 26, 60, 3, 'poisonDrop');
        this.dealsDirectHitDamage = false;
        this.isPoisonEnemy = true;
        this.speedY = Math.random() * 2 + 7;
        this.x = Math.random() * (this.game.width - this.width);
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.y >= this.game.height - this.game.groundMargin - 53) {
            this.markedForDeletion = true;
            this.game.collisions.push(new PoisonDropGroundCollision(this.game, this.x + this.width * 0.5, this.y + this.height * 0.5 - 12));
        }
    }
}

export class GhostElyvorg extends GroundEnemy {
    constructor(game) {
        super(game, 153.23076923076923076923076923077, 180, 12, 'elyvorgGhostRun');
        this.setFps(120);
        this.incrementMovement = 0;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.x += this.incrementMovement;
    }
    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);

        const shouldInvert = this.incrementMovement > 0;
        if (shouldInvert) {
            context.scale(-1, 1);
        } else {
            context.scale(1, 1);
        }

        context.drawImage(
            this.image,
            this.frameX * this.width,
            this.frameY * this.height,
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

export class GravitationalAura extends Projectile {
    constructor(game, x, y, player, elyvorg) {
        super(game, x, y, 75, 71, 0, 'gravitationalAura', 2, 30);
        this.player = player;
        this.elyvorg = elyvorg;
        this.rotationSpeed = 0.06;
        this.rotationAngle = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.rotationAngle += this.rotationSpeed;

        this.y -= this.speedX;
        this.shouldInvert = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2;

        if (this.elyvorg) {
            let targetX;
            if (this.elyvorg.reachedLeftEdge || this.elyvorg.x <= 10) {
                targetX = this.elyvorg.x + this.elyvorg.width / 2 + 20;
            } else {
                targetX = this.elyvorg.x + this.elyvorg.width / 2 - this.width / 2;
            }
            const deltaX = targetX - this.x;
            const followSpeed = 0.1;
            this.x += deltaX * followSpeed;
        }

        if (this.y <= 100) {
            this.y = 100;
        }

        // pushes player
        const deltaXPlayer = this.player.x - this.x;
        const deltaYPlayer = this.player.y - this.y;
        const distancePlayer = Math.sqrt(deltaXPlayer * deltaXPlayer + deltaYPlayer * deltaYPlayer);
        if (distancePlayer > 0.0001) {
            const directionXPlayer = deltaXPlayer / distancePlayer;
            const pushbackDistancePlayer = 50;
            const playerPushbackX = this.player.x - directionXPlayer * pushbackDistancePlayer;
            if (this.player.isSlowed) {
                this.player.x += (playerPushbackX - this.player.x) * 0.08;
            } else {
                this.player.x += (playerPushbackX - this.player.x) * 0.12;
            }
        }
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(this.rotationAngle);

        if (this.game.debug) context.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);

        context.restore();
    }
}

export class ElectricWheel extends Projectile {
    constructor(game, x, y) {
        super(game, x, y, 215, 200, 1, 'electricWheel', 0, 30);
        this.lives = 50;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.06;
        this.incrementMovement = 0;
        this.shouldElectricWheelInvert();
    }
    shouldElectricWheelInvert() {
        this.shouldInvert = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2;
        if (this.shouldInvert) {
            return this.incrementMovement = 12;
        } else {
            return this.incrementMovement = -12;
        }
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.rotationAngle += this.rotationSpeed;
    }

    draw(context) {
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(this.rotationAngle);

        context.shadowColor = 'yellow';
        context.shadowBlur = 10;

        if (this.game.debug) context.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);

        context.restore();
    }
}

export class InkBomb extends Projectile {
    constructor(game, x, y, verticalSpeed, stopY, incrementMovement, direction) {
        super(game, x, y, 49.5, 48, 1, 'inkBomb', 0, 4);
        this.incrementMovement = incrementMovement;
        this.scale = 0.1;
        this.targetScale = 1;
        this.scaleSpeed = 0.01;
        this.originalY = y;
        this.stopY = stopY;
        this.stopMoving = false;
        this.verticalSpeed = verticalSpeed;
        this.direction = direction;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (!this.soundPlayed) {
            this.game.audioHandler.enemySFX.playSound('elyvorg_ink_bomb_sound', false, true);
            this.soundPlayed = true;
        }

        if (this.scale < this.targetScale) {
            this.scale += this.scaleSpeed;
        } else {
            this.scale = this.targetScale;
        }

        if (!this.stopMoving && this.y > this.stopY) {
            this.y -= this.verticalSpeed;
        } else {
            if (!this.throwSoundPlayed) {
                this.throwSoundPlayed = true;
                this.game.audioHandler.enemySFX.playSound('elyvorg_ink_bomb_throw_sound', false, true);
            }
            this.stopMoving = true;
            this.speedX = this.incrementMovement;
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x - this.width * this.scale / 2, this.y - this.height * this.scale / 2, this.width * this.scale, this.height * this.scale);

        if (this.direction) {
            context.save();
            context.scale(-1, 1);
            context.drawImage(
                this.image,
                this.frameX * this.width, 0, this.width, this.height,
                -(this.x + this.width * this.scale / 2), this.y - this.height * this.scale / 2, this.width * this.scale, this.height * this.scale
            );
            context.restore();
        } else {
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x - this.width * this.scale / 2, this.y - this.height * this.scale / 2, this.width * this.scale, this.height * this.scale);
        }
    }
}

export class PurpleFireball extends Projectile {
    constructor(game, x, y, speedX, speedY) {
        super(game, x, y, 40, 40, 0, "purpleFireball", speedX, speedY);
        this.initialSize = 10;
        this.size = this.initialSize;
        this.maxSize = 40;
        this.growthRate = 1;
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.2;
    }

    update(deltaTime) {
        super.update(deltaTime);

        const sizeChange = this.size + this.growthRate > this.maxSize
            ? this.maxSize - this.size
            : this.growthRate;

        this.size += sizeChange;
        this.y -= sizeChange / 2;

        this.rotationAngle += this.rotationSpeed;
    }

    draw(context) {
        context.save();

        context.shadowColor = 'purple';
        context.shadowBlur = 20;

        context.translate(this.x + this.size / 2, this.y + this.size / 2);
        context.rotate(this.rotationAngle);

        if (this.game.debug) context.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
        context.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);

        context.restore();
    }
}

export class Arrow extends Projectile {
    constructor(game, x, y, speedX, speedY, direction, imageId, shadowColor = null) {
        super(game, x, y, 103.5, 40, 1, imageId, speedX, speedY);

        this.initialSize = 10;
        this.size = this.initialSize;

        this.x = x;
        this.y = y;

        this.speedX = speedX;
        this.speedY = speedY;

        this.direction = direction;

        this.shadowColor = shadowColor;

        this.setFps(7);

        this.collisionDrawInfo = {
            angle: 0,
            direction: this.direction,
        };
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();

        if (this.shadowColor) {
            context.shadowColor = this.shadowColor;
            context.shadowBlur = 10;
        }

        context.translate(this.x + this.width / 2, this.y + this.height / 2);

        let angle = Math.atan2(this.speedY, this.speedX);

        if (this.direction) {
            angle = Math.PI - angle;
            context.scale(-1, -1);
        } else {
            context.scale(1, -1);
        }

        this.collisionDrawInfo.angle = angle;
        this.collisionDrawInfo.direction = this.direction;

        context.rotate(angle);

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

export class BlueArrow extends Arrow {
    constructor(game, x, y, speedX, speedY, direction) {
        super(game, x, y, speedX, speedY, direction, "blueArrow", "blue");
    }
}

export class YellowArrow extends Arrow {
    constructor(game, x, y, speedX, speedY, direction) {
        super(game, x, y, speedX, speedY, direction, "yellowArrow", "yellow");
    }
}

export class GreenArrow extends Arrow {
    constructor(game, x, y, speedX, speedY, direction) {
        super(game, x, y, speedX, speedY, direction, "greenArrow", "lime");
    }
}

export class CyanArrow extends Arrow {
    constructor(game, x, y, speedX, speedY, direction) {
        super(game, x, y, speedX, speedY, direction, "cyanArrow", "cyan");
    }
}

export class ChargeIndicatorBalls {
    constructor(game, boss, options = {}) {
        this.game = game;
        this.boss = boss;

        this.markedForDeletion = false;

        this.spawnRate = 18;
        this.spawnAccumulator = 0;

        this.particles = [];
        this.maxParticles = 40;

        this.stopping = false;

        const defaultPalette = {
            shadowColor: "rgba(190, 80, 255, 1)",
            innerColor: "rgba(235, 210, 255, 1)",
            outerColor: "rgba(160, 40, 255, 1)",
            shadowBlur: 18,
        };

        this.palette = options.palette ?? defaultPalette;

        this.stopWhen =
            options.stopWhen ??
            (() => !!(this.boss && this.boss.isSlashActive));

        this.anchorOffsetX = options.anchorOffsetX ?? 0;
        this.facingOffsetX = options.facingOffsetX ?? 22;
    }

    spawnParticle() {
        if (!this.boss) return;

        const facingLeft = !this.boss.shouldInvert;
        const dir = facingLeft ? -1 : 1;

        const cx = this.boss.x + this.boss.width * 0.5
        + this.anchorOffsetX
        + dir * this.facingOffsetX;
        const cy = this.boss.y + this.boss.height * 0.35;

        const p = {
            x: cx + (Math.random() * 60 - 30),
            y: cy + (Math.random() * 40 - 10),
            vx: (Math.random() * 0.6 - 0.3),
            vy: -(1.2 + Math.random() * 1.4),
            r: 3 + Math.random() * 4.5,
            a: 0.9,
            life: 420 + Math.random() * 260,
            age: 0,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.03,
        };

        this.particles.push(p);
        if (this.particles.length > this.maxParticles) {
            this.particles.shift();
        }
    }

    update(deltaTime) {
        if (!this.boss) {
            this.stopping = true;
            this.spawnRate = 0;
        }

        if (!this.stopping && this.stopWhen()) {
            this.stopping = true;
            this.spawnRate = 0;
        }

        const facingLeft = this.boss ? !this.boss.shouldInvert : false;
        const dir = facingLeft ? -1 : 1;

        const bossCx = this.boss
        ? (this.boss.x + this.boss.width * 0.5 + this.anchorOffsetX + dir * this.facingOffsetX)
        : 0;
        const bossCy = this.boss ? (this.boss.y + this.boss.height * 0.35) : 0;

        if (!this.stopping && this.spawnRate > 0) {
            this.spawnAccumulator += deltaTime;
            const interval = 1000 / this.spawnRate;
            while (this.spawnAccumulator >= interval) {
                this.spawnAccumulator -= interval;
                this.spawnParticle();
            }
        }

        for (const p of this.particles) {
            p.age += deltaTime;

            p.wobble += p.wobbleSpeed * deltaTime;
            const wobbleX = Math.sin(p.wobble) * 0.35;

            p.x += p.vx + wobbleX;
            p.y += p.vy;

            const t = Math.min(1, p.age / p.life);
            p.a = 0.9 * (1 - t);

            if (t > 0.6) p.r *= 0.995;

            if (this.boss) {
                const dx = bossCx - p.x;
                const dy = bossCy - p.y;
                p.x += dx * 0.003;
                p.y += dy * 0.003;
            }
        }

        this.particles = this.particles.filter(p => p.age < p.life && p.a > 0.02);

        if (this.stopping && this.particles.length === 0) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        if (!this.boss) return;

        const { shadowColor, innerColor, outerColor, shadowBlur } = this.palette;

        context.save();

        context.shadowColor = shadowColor;
        context.shadowBlur = shadowBlur;

        for (const p of this.particles) {
            context.globalAlpha = p.a;

            context.fillStyle = innerColor;
            context.beginPath();
            context.arc(p.x, p.y, p.r * 0.55, 0, Math.PI * 2);
            context.fill();

            context.globalAlpha = p.a * 0.65;
            context.fillStyle = outerColor;
            context.beginPath();
            context.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            context.fill();
        }

        context.restore();
    }
}

export class PurpleSlash extends Projectile {
    constructor(game, x, y, direction) {
        super(game, x, y, 222, 267, 9, "purpleSlash", 0, 11);
        this.lives = 50;
        this.direction = direction;
    }
    update(deltaTime) {
        super.update(deltaTime);
        if (this.frameX >= this.maxFrame) {
            this.lives = 0;
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);

        context.shadowColor = 'purple';
        context.shadowBlur = 20;

        const shouldInvert = this.direction > 0;
        if (shouldInvert) {
            context.scale(-1, 1);
        } else {
            context.scale(1, 1);
        }

        context.drawImage(
            this.image,
            this.frameX * this.width,
            this.frameY * this.height,
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

export class PurpleThunder extends ImmobileGroundEnemy {
    constructor(game, centerX) {
        super(game, 182, 662, 5, "purpleThunder");

        this.game = game;
        this.lives = 50
        this.setFps(18);

        this.isSlowEnemy = true;

        this.dealsDirectHitDamage = false;

        const halfW = this.width * 0.5;
        const minCenter = halfW;
        const maxCenter = this.game.width - halfW;
        centerX = Math.max(minCenter, Math.min(maxCenter, centerX));

        this.centerX = centerX;
        this.x = centerX - halfW;

        this.groundBottom = this.game.height - this.game.groundMargin;

        this.warningY = -this.height + 1;
        this.strikeY = 0;

        this.y = this.warningY;

        this.speedX = 0;
        this.speedY = 0;

        this.phase = "warning";
        this.timer = 0;

        this.warningDuration = 2000;
    }

    update(deltaTime) {
        this.timer += deltaTime;

        if (this.phase === "warning") {
            this.y = this.warningY;
            this.dealsDirectHitDamage = false;

            if (this.timer >= this.warningDuration) {
                this.phase = "strike";
                this.timer = 0;
                this.frameX = 0;
                this.frameTimer = 0;

                this.y = this.strikeY;

                const soundId = Math.random() < 0.5
                    ? 'elyvorg_purple_thunder_attack_sound_effect_1'
                    : 'elyvorg_purple_thunder_attack_sound_effect_2';
                this.game.audioHandler.enemySFX.playSound(soundId, false, true);
            }
            return;
        }

        if (this.phase === "strike") {
            this.frameTimer += deltaTime;
            if (this.frameTimer >= this.frameInterval) {
                this.frameTimer = 0;
                if (this.frameX < this.maxFrame) {
                    this.frameX++;
                } else {
                    this.dealsDirectHitDamage = false;
                    this.markedForDeletion = true;
                    this.phase = "done";
                }
            }
        }
    }

    draw(context) {
        const groundBottom = this.groundBottom;

        if (this.phase === "warning") {
            const centerX = this.x + this.width * 0.5;

            if (this.game.debug) {
                context.save();
                context.strokeStyle = "rgba(0, 0, 0, 0.7)";
                context.strokeRect(this.x, this.y, this.width, this.height);
                context.restore();
            }

            const t = Math.max(0, Math.min(1, this.timer / this.warningDuration));

            const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 6);

            const baseIntensity = t;

            const globalAlpha = 0.5 + 0.5 * (baseIntensity * pulse);

            context.save();

            const glowWidth = this.width * 1.1;
            const glowHeight = 44;

            context.translate(centerX, groundBottom - 10);

            const innerAlpha = 0.75 + 0.25 * baseIntensity;
            const midAlpha = 0.5 + 0.35 * baseIntensity;

            const gradient = context.createRadialGradient(
                0, 0, 0,
                0, 0, glowWidth * 0.75
            );
            gradient.addColorStop(0, `rgba(250, 220, 255, ${innerAlpha})`);
            gradient.addColorStop(0.5, `rgba(210, 140, 255, ${midAlpha})`);
            gradient.addColorStop(1, "rgba(140, 0, 255, 0)");

            context.fillStyle = gradient;
            context.globalAlpha = globalAlpha;

            const blurBase = 40;
            const blurExtra = 40 * baseIntensity;
            context.shadowColor = "rgba(240, 200, 255, 1)";
            context.shadowBlur = blurBase + blurExtra;

            context.beginPath();
            context.ellipse(
                0,
                0,
                glowWidth * 0.5,
                glowHeight * 0.5,
                0,
                0,
                Math.PI * 2
            );
            context.fill();

            const coreT = Math.min(1, t * 1.15);
            const coreScale = 0.35 + 0.65 * coreT;

            const coreRadiusX = glowWidth * coreScale * 0.5;
            const coreRadiusY = glowHeight * coreScale * 0.5;

            context.globalAlpha = 0.7 + 0.3 * baseIntensity;
            context.shadowBlur = 25 + 45 * baseIntensity;
            context.shadowColor = "rgba(255, 255, 255, 1)";

            context.beginPath();
            context.ellipse(
                0,
                0,
                coreRadiusX,
                coreRadiusY,
                0,
                0,
                Math.PI * 2
            );
            context.strokeStyle = `rgba(255, 255, 255, ${0.65 + 0.35 * pulse})`;
            context.lineWidth = 3 + 3 * baseIntensity;
            context.stroke();

            context.restore();
            return;
        }

        if (this.phase === "strike") {
            context.save();

            context.beginPath();
            context.rect(this.x, 0, this.width, groundBottom);
            context.clip();

            context.shadowColor = "rgba(220,180,255,0.95)";
            context.shadowBlur = 24;

            context.drawImage(
                this.image,
                this.frameX * this.width,
                0,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );

            context.restore();
        }

        if (this.game.debug) {
            context.save();
            context.strokeStyle = "magenta";
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.restore();
        }
    }
}

// ------------------------------------------------------------------- Final Boss ------------------------------------------------------------------------
export class Elyvorg extends EnemyBoss {
    constructor(game) {
        super(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgIdle');
        this.state = "idle";
        this.previousState = null;
        this.shouldInvert = false;
        this.reachedRightEdge = false;
        this.reachedLeftEdge = false;
        this.isInTheMiddle = false;
        this.originalY = this.y;
        this.setFps(30);
        this.runSfxPlaying = false;
        this.wasRunningLastFrame = false;
        this.maxLives = 125;
        this.lives = this.maxLives;
        this._defeatTriggered = false;
        this.stateRandomiserTimer = 5000;
        this.stateRandomiserCooldown = 5000;
        // run
        this.runAnimation = new EnemyBoss(game, 153.23076923076923076923076923077, 180, 12, 'elyvorgRun');
        this.runAnimation.setFps(120);
        this.runAnimation.frameX = 0;
        this.runningDirection = 0; // switches between 10 and -10
        this.runStateCounter = 0;
        this.runStateCounterLimit = 5;
        this.runStopAtTheMiddle = false;
        this.isSlashActive = false;
        this.slashAttackOnce = false;
        this.slashAttackStateCounter = 15;
        this.slashAttackStateCounterLimit = 20;
        this.slashChargeWarned = false;
        // jump
        this.jumpAnimation = new EnemyBoss(game, 153.25, 180, 11, 'elyvorgJump');
        this.jumpAnimation.frameX = 0;
        this.jumpHeight = 300;
        this.jumpDuration = 0.7;
        this.jumpStartTime = 0;
        this.canJumpAttack = true;
        this.isTeleportJump = false;
        // barrier
        this.barrier = null;
        this.oneBarrier = true;
        this.barrierBreakingSetElyvorgTimer = true;
        this.barrierCooldown = Math.floor(Math.random() * (60000 - 35000 + 1)) + 35000;
        this.barrierCooldownTimer = 0;
        this.isBarrierActive = false;
        // electricWheel
        this.electricWheel = new ElectricWheel(this.game, this.x - 45, this.y - 20);
        this.oneElectricWheel = false;
        this.electricWheelThrown = false;
        this.isElectricWheelActive = false;
        this.playElectricWarningSoundOnce = true;
        this.electricWheelStateCounter = 9;
        this.electricWheelStateCounterLimit = 15;
        this.electricWheelActivateStateCounterDeltaTime = false;
        this.electricWheelStateCounterDeltaTime = 0;
        this.electricWheelStateCounterLimitDeltaTime = 2;
        this.electricWheelTimer = 0;
        this.electricWheelCooldown = Math.floor(Math.random() * 5001) + 5000; // 5 to 10 seconds
        // recharge
        this.rechargeAnimation = new EnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgRechargeIdle');
        this.rechargeAnimation.frameX = 0;
        // pistol
        this.pistolAnimation = new EnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgPistolIdle');
        this.pistolAnimation.frameX = 0;
        // laser
        this.laserAnimation = new EnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgLaserIdle');
        this.laserAnimation.frameX = 0;
        this.laserThrowCount = 0;
        this.canLaserAttack = true;
        // meteor
        this.meteorAnimation = new EnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgMeteorIdle');
        this.meteorAnimation.frameX = 0;
        this.meteorThrowCount = 0;
        this.meteorThrowTarget = Math.floor(Math.random() * 3) + 4; // 4 to 6
        this.canMeteorAttack = true;
        this.meteorShakeActive = false;
        // poison
        this.poisonAnimation = new EnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgPoisonIdle');
        this.poisonAnimation.frameX = 0;
        this.canPoisonAttack = true;
        this.isPoisonActive = false;
        this.poisonCooldown = 25000;
        this.poisonCooldownTimer = 0;
        this.passivePoisonCooldown = 0;
        // ghost
        this.ghostAnimation = new EnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgGhostIdle');
        this.ghostAnimation.frameX = 0;
        this.canGhostAttack = true;
        // gravity
        this.gravityAnimation = new EnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgGravityIdle');
        this.gravityAnimation.frameX = 0;
        this.isGravitySpinnerActive = false;
        this.canGravityAttack = true;
        this.gravityCooldown = 14000;
        this.gravityCooldownTimer = 0;
        this.gravityOffset = 0;
        // ink
        this.inkAnimation = new EnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgInkIdle');
        this.inkAnimation.frameX = 0;
        this.canInkAttack = true;
        // fireball
        this.fireballAnimation = new EnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgIdleFireball');
        this.fireballAnimation.frameX = 0;
        this.canFireballAttack = true;
        // thunder
        this.thunderAnimation = new EnemyBoss(game, 153.20833333333333333333333333333, 180, 23, 'elyvorgThunderIdle');
        this.thunderAnimation.frameX = 0;
        this.isThunderSequenceActive = false;
        this.thunderSequenceInitialised = false;
        this.thunderMaxActive = 4;
        this.thunderIterationsMax = 5;
        this.thunderTotalSpawned = 0;
        this.thunderMaxTotal = this.thunderMaxActive * this.thunderIterationsMax;
        this.thunderGroup1Spawned = false;
        this.thunderGroup2Spawned = false;
        this.thunderInitialWavesDone = false;
        this.thunderGroup2Delay = 1000;
        this.thunderGroup2Timer = 0;
        this.thunderStateCounter = 0;
        this.thunderStateCounterLimit = Math.floor(Math.random() * 6) + 15;
        // teleport
        this.teleportPhase = 'none';
        this.teleportTimer = 0;
        this.teleportDuration = 450;
        this.teleportMinDistance = 200;
        this.teleportTargetX = this.x;
        this.teleportTargetY = this.y;
        this.teleportAir = false;
        this.chainTeleportFromAir = false;
        this.postTeleportSafeDuration = 350;
        this.postTeleportSafeTimer = 0;

        this.jumpedBeforeDistanceLogic = false;
    }

    startRunSFX() {
        if (this.runSfxPlaying) return;
        this.runSfxPlaying = true;
        this.game.audioHandler.enemySFX.playSound("bossRunningSound", true, true, false, { playbackRate: 1.2 });
    }

    stopRunSFX() {
        if (!this.runSfxPlaying) return;
        this.runSfxPlaying = false;
        this.game.audioHandler.enemySFX.stopSound("bossRunningSound");
    }

    updateRunSFXEdge() {
        const runningNow = this.state === "run";
        if (runningNow && !this.wasRunningLastFrame) this.startRunSFX();
        if (!runningNow && this.wasRunningLastFrame) this.stopRunSFX();
        this.wasRunningLastFrame = runningNow;
    }

    throwLaserBeam() {
        const playerIsOnLeft =
            this.game.player.x + this.game.player.width / 2 <
            this.x + this.width / 2;

        const speedX = playerIsOnLeft ? 20 : -20;
        const laserX = playerIsOnLeft ? this.x - 70 : this.x + 110;

        const topY = this.y - 50 + this.height / 2 - 57 / 2;
        const bottomY = this.y + 50 + this.height / 2 - 57 / 2;

        const topBeam = new PurpleLaserBeam(this.game, laserX, topY, speedX, 0);
        const bottomBeam = new PurpleLaserBeam(this.game, laserX, bottomY, speedX, 0);

        this.game.enemies.push(topBeam);
        this.game.enemies.push(bottomBeam);
    }

    throwFireballAttack() {
        const playerIsOnLeft = this.game.player.x + this.game.player.width / 2 < this.x + this.width / 2;
        const horizontalSpeed = playerIsOnLeft ? 15 : -15;

        const playerCenterY = this.game.player.y + this.game.player.height / 2;
        const elyvorgCenterY = this.y + this.height / 2;
        const deltaY = playerCenterY - elyvorgCenterY;

        const angle = Math.atan2(deltaY, Math.abs(this.game.player.x - this.x));

        const verticalSpeed = Math.sin(angle) * 15;

        const fireballX = playerIsOnLeft ? this.x + 10 : this.x + 110;
        const fireball = new PurpleFireball(
            this.game,
            fireballX,
            this.y - 35 + this.height / 2 - 57 / 2,
            horizontalSpeed,
            verticalSpeed
        );
        this.game.enemies.push(fireball);
    }

    throwArrowAttack() {
        const playerIsOnLeft =
            this.game.player.x + this.game.player.width / 2 <
            this.x + this.width / 2;

        const horizontalSpeed = playerIsOnLeft ? 18 : -18;

        const playerCenterY = this.game.player.y + this.game.player.height / 2;
        const elyvorgCenterY = this.y + this.height / 2;
        const deltaY = playerCenterY - elyvorgCenterY;

        const angle = Math.atan2(deltaY, Math.abs(this.game.player.x - this.x));
        const verticalSpeed = Math.sin(angle) * 21;

        const r = Math.random();
        let ArrowClass;
        if (r < 1 / 4) ArrowClass = BlueArrow;
        else if (r < 2 / 4) ArrowClass = YellowArrow;
        else if (r < 3 / 4) ArrowClass = GreenArrow;
        else ArrowClass = CyanArrow;

        const arrowX = playerIsOnLeft ? this.x + 10 : this.x + 110;

        const arrow = new ArrowClass(
            this.game,
            arrowX,
            this.y - 35 + this.height / 2 - 57 / 2,
            horizontalSpeed,
            verticalSpeed,
            playerIsOnLeft
        );

        this.game.enemies.push(arrow);
    }

    throwGravityAttack() {
        const offsetX = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2 ? 70 : 10;
        this.gravityOffset = offsetX;
        this.gravitationalAura = new GravitationalAura(this.game, this.x + this.gravityOffset, this.y + 10, this.game.player, this);
        this.game.enemies.push(this.gravitationalAura);
        this.isGravitySpinnerActive = true;
    }

    getActiveThunders() {
        const list = [];
        for (const enemy of this.game.enemies) {
            if (enemy instanceof PurpleThunder && !enemy.markedForDeletion && enemy.phase !== "done") {
                list.push(enemy);
            }
        }
        return list;
    }

    startMeteorShake() {
        this.meteorShakeActive = true;
        this.game.startShake(1000);
    }

    updateMeteorShakeTimer() {
        if (!this.meteorShakeActive) return;

        if (this.state === 'thunder' || this.isThunderSequenceActive) {
            this.meteorShakeActive = false;
            return;
        }

        if (!this.game.shakeActive) {
            this.meteorShakeActive = false;
            return;
        }
    }

    findThunderLaneCenter(preferredCenterX = null) {
        const active = this.getActiveThunders();
        const thunderWidth = 182;
        const halfW = thunderWidth * 0.5;
        const minCenter = halfW;
        const maxCenter = this.game.width - halfW;
        const minGap = thunderWidth;

        let center = preferredCenterX != null ? preferredCenterX : (Math.random() * this.game.width);
        center = Math.max(minCenter, Math.min(maxCenter, center));

        const maxAttempts = 20;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const candidate = (attempt === 0)
                ? center
                : (minCenter + Math.random() * (maxCenter - minCenter));

            let ok = true;
            for (const th of active) {
                const thCenter = th.x + th.width * 0.5;
                if (Math.abs(candidate - thCenter) < minGap) {
                    ok = false;
                    break;
                }
            }

            if (ok) return candidate;
        }
        return center;
    }

    spawnThunderStrike(spawnAtPlayer) {
        let preferredCenter = null;
        if (spawnAtPlayer) {
            preferredCenter = this.game.player.x + this.game.player.width / 2;
        }

        const centerX = this.findThunderLaneCenter(preferredCenter);
        const thunder = new PurpleThunder(this.game, centerX);
        this.game.enemies.push(thunder);
        return thunder;
    }

    startThunderSequence() {
        if (this.thunderSequenceInitialised) return;

        this.thunderSequenceInitialised = true;
        this.isThunderSequenceActive = true;

        this.thunderTotalSpawned = 0;

        this.thunderGroup1Spawned = false;
        this.thunderGroup2Spawned = false;
        this.thunderInitialWavesDone = false;
        this.thunderGroup2Timer = 0;

        this.game.audioHandler.enemySFX.playSound('elyvorg_purple_thunder_sound_effect', true);

        this.game.startShake(0);

        this.game.bossManager.requestScreenEffect('elyvorg_thunder', {
            rgb: [0, 0, 0],
            fadeInSpeed: 0.0035,
        });
    }

    endThunderSequence() {
        this.isThunderSequenceActive = false;
        this.thunderSequenceInitialised = false;

        this.game.audioHandler.enemySFX.stopSound('elyvorg_purple_thunder_sound_effect');
        this.game.bossManager.releaseScreenEffect('elyvorg_thunder');

        this.game.stopShake();

        this.previousState = "thunder";

        this.backToRechargeSetUp();
    }

    isThunderLaneCoveringPlayer(thunders) {
        const playerCenterX = this.game.player.x + this.game.player.width / 2;
        return thunders.some(th => {
            const thCenter = th.x + th.width * 0.5;
            return Math.abs(thCenter - playerCenterX) < th.width * 0.4;
        });
    }

    fireballThrownWhileInIdle() {
        let isFireballInRange = false;
        for (const fireball of this.game.behindPlayerParticles) {
            const fireballDistance = Math.sqrt(
                Math.pow(fireball.x - this.x, 2) +
                Math.pow(fireball.y - this.y, 2)
            );
            if (fireballDistance <= 400 && fireball.y + fireball.maxSize > this.y) {
                isFireballInRange = true;
                break;
            }
        }
        if (isFireballInRange) {
            this.state = "jump";
            this.jumpAnimation.x = this.x;
            this.jumpAnimation.y = this.y;
            this.jumpAnimation.frameX = 0;
            this.jumpedBeforeDistanceLogic = false;
        }
    }

    fireJumpArrow() {
        if (!this.canJumpAttack) return;

        this.canJumpAttack = false;
        this.throwArrowAttack();
        this.game.audioHandler.enemySFX.playSound('elyvorg_arrow_attack_sound', false, true);
    }

    jumpLogic() {
        if (this.isTeleportJump) {
            if (!this.jumpedBeforeDistanceLogic) {
                this.jumpStartTime = this.game.hiddenTime;
                this.jumpedBeforeDistanceLogic = true;

                this.game.audioHandler.enemySFX.playSound("bossJumpingSound", false, true);

                this.fireJumpArrow();
            }

            const halfDurationMs = this.jumpDuration * 0.5 * 1000;
            let t = (this.game.hiddenTime - this.jumpStartTime) / halfDurationMs;
            t = Math.max(0, Math.min(1, t));

            const progress = 0.5 + 0.5 * t;
            this.y = this.originalY - this.jumpHeight * Math.sin(progress * Math.PI);

            if (t >= 1) {
                this.y = this.originalY;
                this.game.audioHandler.enemySFX.playSound("bossLandingSound", false, true);
                this.backToIdleSetUp();
                this.canJumpAttack = true;
                this.jumpedBeforeDistanceLogic = false;
                this.isTeleportJump = false;
            }
            return;
        }

        if (this.jumpAnimation.frameX === 0 && !this.jumpedBeforeDistanceLogic) {
            this.jumpStartTime = this.game.hiddenTime;
            this.jumpedBeforeDistanceLogic = true;
            this.game.audioHandler.enemySFX.playSound("bossJumpingSound", false, true);
        }

        const jumpProgress = (this.game.hiddenTime - this.jumpStartTime) / (this.jumpDuration * 1000);

        if (jumpProgress < 1) {
            this.y = this.originalY - this.jumpHeight * Math.sin(jumpProgress * Math.PI);

            if (Math.abs(jumpProgress - 0.5) < 0.05) {
                this.fireJumpArrow();
            }
        } else {
            this.y = this.originalY;
            this.game.audioHandler.enemySFX.playSound("bossLandingSound", false, true);
            this.backToIdleSetUp();
            this.canJumpAttack = true;
            this.jumpedBeforeDistanceLogic = false;
        }
    }

    laserLogic() {
        if (this.laserAnimation.frameX === 9 && this.canLaserAttack === true) {
            this.throwLaserBeam();
            this.game.audioHandler.enemySFX.playSound('elyvorg_laser_attack_sound');
            this.canLaserAttack = false;
            this.laserThrowCount++;
        }
        if (this.laserThrowCount >= 3 && this.laserAnimation.frameX === 23) {
            this.backToIdleSetUp();
            this.canLaserAttack = true;
            this.laserThrowCount = 0;
        }
        if (this.laserAnimation.frameX === 20) {
            this.canLaserAttack = true;
        }
    }

    gravityLogic() {
        if (this.gravityAnimation.frameX === 9 && this.canGravityAttack === true) {
            this.throwGravityAttack();
            this.game.audioHandler.enemySFX.playSound('elyvorg_gravitational_aura_release_sound_effect');
            this.game.audioHandler.enemySFX.playSound('elyvorg_gravitational_aura_sound_effect', true);
            this.canGravityAttack = false;
        }
        if (this.gravityAnimation.frameX === 23) {
            this.backToIdleSetUp();
            this.canGravityAttack = true;
        }
    }

    gravityLogicTimer(deltaTime) {
        if (!this.isGravitySpinnerActive) return;
        if (!this.gravitationalAura) return;
        if (this.gravitationalAura.lives <= 0 || this.gravitationalAura.markedForDeletion) {
            this.isGravitySpinnerActive = false;
            this.gravityCooldownTimer = 0;
            this.game.audioHandler.enemySFX.stopSound('elyvorg_gravitational_aura_sound_effect');
            return;
        }

        this.gravityCooldownTimer += deltaTime;

        if (this.gravityCooldownTimer >= this.gravityCooldown) {
            this.isGravitySpinnerActive = false;
            this.gravityCooldownTimer = 0;
            this.gravitationalAura.lives = 0;
            this.game.collisions.push(new DarkExplosionCollision(this.game, this.gravitationalAura.x + this.gravitationalAura.width * 0.5, this.gravitationalAura.y + this.gravitationalAura.height * 0.5 - 30));
            this.game.audioHandler.collisionSFX.playSound('darkExplosionCollisionSound', false, true);
            this.game.audioHandler.enemySFX.stopSound('elyvorg_gravitational_aura_sound_effect');
        }
    }

    meteorLogic() {
        if (this.meteorAnimation.frameX === 9) {
            this.game.audioHandler.enemySFX.playSound('elyvorg_meteor_attack_sound');
        }

        if (this.meteorAnimation.frameX === 23 && this.canMeteorAttack === true) {
            this.canMeteorAttack = false;
            this.meteorThrowCount++;

            for (let i = 0; i < 7; i++) {
                this.game.enemies.push(new MeteorAttack(this.game));
            }
            this.game.audioHandler.enemySFX.playSound('elyvorg_meteor_falling_sound', true);

            this.startMeteorShake();
        }

        if (this.meteorThrowCount >= this.meteorThrowTarget && this.meteorAnimation.frameX === 23) {
            this.backToIdleSetUp();
            this.meteorThrowCount = 0;
            this.meteorThrowTarget = Math.floor(Math.random() * 3) + 4; // 4 to 6
        }
        if (this.meteorAnimation.frameX === 20) {
            this.canMeteorAttack = true;
        }
    }

    poisonLogic() {
        if (this.poisonAnimation.frameX === 0) {
            this.game.bossManager.requestScreenEffect('elyvorg_poison', {
                rgb: [0, 50, 0],
                fadeInSpeed: 0.00298,
            });
            this.game.audioHandler.enemySFX.playSound('elyvorg_poison_drop_indicator_sound', false, true);
        }
        if (this.poisonAnimation.frameX === 17) {
            this.game.audioHandler.enemySFX.playSound('elyvorg_poison_drop_rain_sound', false, true);
        }
        if (this.poisonAnimation.frameX === 23 && this.canPoisonAttack === true) {
            this.isPoisonActive = true;
            this.canPoisonAttack = false;
            for (let i = 0; i < 7; i++) {
                this.game.enemies.push(new PoisonDrop(this.game));
            }
        }
        if (this.poisonAnimation.frameX === 23) {
            this.backToIdleSetUp();
        }
        if (this.poisonAnimation.frameX === 20) {
            this.canPoisonAttack = true;
        }
    }

    poisonLogicTimer(deltaTime) {
        if (this.isPoisonActive) {
            this.poisonCooldownTimer += deltaTime;
            this.passivePoisonCooldown += deltaTime;

            if (this.poisonCooldownTimer <= this.poisonCooldown) {
                const inBlockedState = this.state === 'meteor' || this.state === 'thunder';

                if (!inBlockedState) {
                    if (this.passivePoisonCooldown >= 1000) {
                        this.passivePoisonCooldown -= 1000;
                        const numDrops = Math.floor(Math.random() * 3) + 1; // 1 to 3
                        for (let i = 0; i < numDrops; i++) {
                            this.game.enemies.push(new PoisonDrop(this.game));
                        }
                    }
                } else {
                    this.passivePoisonCooldown = 0;
                }
            } else {
                this.game.bossManager.releaseScreenEffect('elyvorg_poison');
                this.isPoisonActive = false;
                this.poisonCooldownTimer = 0;
                this.passivePoisonCooldown = 0;
            }
        }
    }

    pistolLogic() {
        if (this.pistolAnimation.frameX === 5) {
            this.electricWheel.shouldElectricWheelInvert();
        }
        if (this.pistolAnimation.frameX === 17) {
            this.electricWheelThrown = true;
        }
        if (this.pistolAnimation.frameX === 23 || this.isElectricWheelActive === false) {
            this.backToIdleSetUp();
        }
    }

    ghostLogic() {
        if (this.ghostAnimation.frameX === 0) {
            this.game.audioHandler.enemySFX.playSound('elyvorg_ghost_attack_sound', false, true);
        }

        if (this.ghostAnimation.frameX === 17 && this.canGhostAttack === true) {
            this.canGhostAttack = false;
            this.ghostElyvorg = new GhostElyvorg(this.game);
            const playerIsOnLeft = this.game.player.x + this.game.player.width / 2 < this.x + this.width / 2;
            if (playerIsOnLeft) {
                this.ghostElyvorg.x = 0 - this.ghostElyvorg.width;
                this.ghostElyvorg.incrementMovement = 12;
            } else {
                this.ghostElyvorg.x = this.game.width;
                this.ghostElyvorg.incrementMovement = -12;
            }
            this.game.enemies.push(this.ghostElyvorg);

            if (Math.random() < 0.5) {
                this.ghostElyvorgOppositeSide = new GhostElyvorg(this.game);
                this.ghostElyvorgOppositeSide.x = this.ghostElyvorg.x === 0 - this.ghostElyvorg.width ? this.game.width : 0 - this.ghostElyvorgOppositeSide.width;
                this.ghostElyvorgOppositeSide.incrementMovement = -this.ghostElyvorg.incrementMovement;
                this.game.enemies.push(this.ghostElyvorgOppositeSide);
            }
        }
        if (this.ghostAnimation.frameX === 23) {
            this.backToIdleSetUp();
            this.canGhostAttack = true;
        }
    }

    inkLogic() {
        if (this.inkAnimation.frameX === 1 && this.canInkAttack === true) {
            this.canInkAttack = false;
            const playerIsOnLeft = this.game.player.x + this.game.player.width / 2 < this.x + this.width / 2;
            const laserBeamX = playerIsOnLeft ? this.x - 50 : this.x + 200;

            this.shouldInvert = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2;
            let speedOffsetValues = [0.239, 0.603, 0.97, 1.333, 1.697];
            let inkBombSpeeds = [];
            let inkBombSpeedX1, inkBombSpeedX2;
            if (this.shouldInvert) {
                inkBombSpeedX1 = -16;
                inkBombSpeedX2 = -8;
            } else {
                inkBombSpeedX1 = 16;
                inkBombSpeedX2 = 8;
            }
            for (let i = 0; i < 5; i++) {
                inkBombSpeeds.push(i % 2 === 0 ? inkBombSpeedX2 : inkBombSpeedX1);
            }
            for (let i = 0; i < 5; i++) {
                const speedOffset = speedOffsetValues[i];
                const inkBombSpeedX = inkBombSpeeds[i];
                const inkBomb = new InkBomb(this.game, laserBeamX, this.game.height - this.game.groundMargin, speedOffset,
                    (this.game.height - this.game.groundMargin - this.game.player.height / 2) - (i * 70), inkBombSpeedX, this.shouldInvert
                );
                this.game.enemies.push(inkBomb);
            }
        }
        if (this.inkAnimation.frameX === 23) {
            this.backToIdleSetUp();
            this.canInkAttack = true;
        }
    }

    fireballLogic() {
        if (this.fireballAnimation.frameX === 10 && this.canFireballAttack === true) {
            this.throwFireballAttack();
            this.game.audioHandler.enemySFX.playSound('elyvorg_purple_fireball_sound_effect', false, true);
            this.canFireballAttack = false;
        }

        if (this.fireballAnimation.frameX === 20) {
            this.canFireballAttack = true;
        }

        if (this.fireballAnimation.frameX === 23) {
            this.backToIdleSetUp();
            this.canFireballAttack = true;
        }
    }

    thunderLogic(deltaTime) {
        this.startThunderSequence();
        if (!this.isThunderSequenceActive) return;

        if (!this.thunderGroup1Spawned) {
            this.spawnThunderStrike(true);
            this.spawnThunderStrike(false);
            this.spawnThunderStrike(false);
            this.thunderTotalSpawned += 3;

            this.thunderGroup1Spawned = true;
            return;
        }

        if (!this.thunderGroup2Spawned) {
            this.thunderGroup2Timer += deltaTime;

            if (this.thunderGroup2Timer >= this.thunderGroup2Delay) {
                const currentThunders = this.getActiveThunders();
                const spawnAtPlayer = !this.isThunderLaneCoveringPlayer(currentThunders);

                this.spawnThunderStrike(spawnAtPlayer);
                this.spawnThunderStrike(false);
                this.thunderTotalSpawned += 2;

                this.thunderGroup2Spawned = true;
                this.thunderInitialWavesDone = true;
            }

            return;
        }

        if (this.thunderInitialWavesDone) {
            const sustainedThunders = this.getActiveThunders();
            let laneCovered = this.isThunderLaneCoveringPlayer(sustainedThunders);

            while (sustainedThunders.length < this.thunderMaxActive &&
                this.thunderTotalSpawned < this.thunderMaxTotal) {
                const spawnAtPlayer = !laneCovered;
                const thunder = this.spawnThunderStrike(spawnAtPlayer);
                sustainedThunders.push(thunder);
                this.thunderTotalSpawned++;

                if (spawnAtPlayer) laneCovered = true;
            }

            if (this.thunderTotalSpawned >= this.thunderMaxTotal && sustainedThunders.length === 0) {
                this.endThunderSequence();
            }
        }
    }

    pickTeleportTargetX() {
        const player = this.game.player;
        const margin = 30;
        const minDistance = this.teleportMinDistance;

        const minX = 0;
        const maxX = this.game.width - this.width;

        const forbiddenMin = player.x - this.width;
        const forbiddenMax = player.x + player.width;

        const intervalLeft = {
            start: minX,
            end: Math.min(forbiddenMin, maxX)
        };
        const intervalRight = {
            start: Math.max(forbiddenMax, minX),
            end: maxX
        };

        const sampleInInterval = (start, end, attempts = 10) => {
            let innerStart = Math.max(start + margin, minX);
            let innerEnd = Math.min(end - margin, maxX);

            if (innerEnd <= innerStart) return null;

            for (let i = 0; i < attempts; i++) {
                const x = innerStart + Math.random() * (innerEnd - innerStart);
                if (Math.abs(x - this.x) >= minDistance) return x;
            }

            const mid = (innerStart + innerEnd) / 2;
            if (Math.abs(mid - this.x) >= minDistance) return mid;

            return null;
        };

        const playerCenterX = player.x + player.width / 2;
        const bossCenterX = this.x + this.width / 2;

        let behindInterval;
        let frontInterval;

        if (bossCenterX < playerCenterX) {
            behindInterval = intervalRight;
            frontInterval = intervalLeft;
        } else {
            behindInterval = intervalLeft;
            frontInterval = intervalRight;
        }

        let chosenX = null;

        if (behindInterval && behindInterval.end - behindInterval.start > 2 * margin) {
            chosenX = sampleInInterval(behindInterval.start, behindInterval.end);
        }

        if (chosenX === null && frontInterval && frontInterval.end - frontInterval.start > 2 * margin) {
            const frontOffset = 60; // distance in front of the player
            let desiredX;

            if (bossCenterX < playerCenterX) {
                desiredX = player.x - this.width - frontOffset;
            } else {
                desiredX = player.x + player.width + frontOffset;
            }

            let innerStart = Math.max(frontInterval.start + margin, minX);
            let innerEnd = Math.min(frontInterval.end - margin, maxX);

            desiredX = Math.max(innerStart, Math.min(innerEnd, desiredX));

            if (Math.abs(desiredX - this.x) >= minDistance) {
                chosenX = desiredX;
            } else {
                const towardEdge = desiredX < this.x ? innerStart : innerEnd;
                if (Math.abs(towardEdge - this.x) >= minDistance) {
                    chosenX = towardEdge;
                } else {
                    chosenX = desiredX;
                }
            }
        }

        if (chosenX === null) {
            const midX = (minX + maxX) / 2;
            chosenX = this.x < midX ? maxX : minX;
        }

        this.teleportTargetX = chosenX;
    }

    spawnTeleportGhostAt(x, y, inverted) {
        const enemySnapshot = {
            image: document.getElementById('elyvorgIdle'),
            width: this.width,
            height: this.height,
            frameX: 0,
            frameY: 0,
            x: x,
            y: y,
            incrementMovement: inverted ? 1 : -1
        };
        this.game.collisions.push(new GhostFadeOut(this.game, enemySnapshot));
    }

    beginTeleport() {
        this.teleportPhase = 'fadeOut';
        this.teleportTimer = 0;
        this.game.audioHandler.enemySFX.playSound('elyvorg_teleport_sound_effect', false, true);

        this.teleportAir = Math.random() < 0.3;

        if (this.teleportAir) {
            this.chainTeleportFromAir = true;
        }

        this.pickTeleportTargetX();

        if (this.teleportAir) {
            this.teleportTargetY = this.originalY - this.jumpHeight;
        } else {
            this.teleportTargetY = this.originalY;
        }

        const playerCenterX = this.game.player.x + this.game.player.width / 2;
        const bossCenterX = this.x + this.width / 2;
        const invertedNow = playerCenterX > bossCenterX;
        this.spawnTeleportGhostAt(this.x, this.y, invertedNow);
    }

    teleportLogic(deltaTime) {
        this.teleportTimer += deltaTime;

        if (this.teleportPhase === 'fadeOut') {
            if (this.teleportTimer >= this.teleportDuration) {
                this.x = this.teleportTargetX;
                this.y = this.teleportTargetY;

                this.teleportTimer = 0;
                this.teleportPhase = 'fadeIn';

                const playerCenterX = this.game.player.x + this.game.player.width / 2;
                const bossCenterX = this.x + this.width / 2;
                const invertedNew = playerCenterX > bossCenterX;
                this.spawnTeleportGhostAt(this.x, this.y, invertedNew);
            }
        } else if (this.teleportPhase === 'fadeIn') {
            if (this.teleportTimer >= this.teleportDuration) {
                this.teleportPhase = 'none';
                this.previousState = 'teleport';

                this.postTeleportSafeTimer = this.postTeleportSafeDuration;

                if (this.teleportAir) {
                    this.teleportAir = false;
                    this.state = 'jump';
                    this.isTeleportJump = true;
                    this.jumpAnimation.x = this.x;
                    this.jumpAnimation.y = this.y;
                    this.jumpAnimation.frameX = 0;
                    this.jumpedBeforeDistanceLogic = false;
                } else {
                    this.backToIdleSetUp();
                }
            }
        }
    }

    barrierLogic(deltaTime) {
        if (this.oneBarrier) {
            this.barrier = new PurpleBarrier(this.game, this.x - 20, this.y - 20);
            this.game.enemies.push(this.barrier);

            this.oneBarrier = false;
            this.isBarrierActive = true;
            this.barrierBreakingSetElyvorgTimer = true;
            this.barrierCooldownTimer = 0;
        }

        if (!this.isBarrierActive) {
            this.barrierCooldownTimer += deltaTime;

            if (this.barrierCooldownTimer >= this.barrierCooldown) {
                this.barrierCooldownTimer = 0;
                this.barrierCooldown = Math.floor(Math.random() * (60000 - 35000 + 1)) + 35000;
                this.barrier = new PurpleBarrier(this.game, this.x - 20, this.y - 20);
                this.game.enemies.push(this.barrier);
                this.barrierBreakingSetElyvorgTimer = true;
                this.isBarrierActive = true;
            }
        }

        if (this.barrier && this.barrier.lives <= 0 && this.barrierBreakingSetElyvorgTimer) {
            this.barrierBreakingSetElyvorgTimer = false;
            this.isBarrierActive = false;
            this.game.player.bossCollisionTimer = 1000;
        }

        if (!this.barrier) return;

        if (this.runningDirection > 0) {
            if (this.state === 'run') {
                this.barrier.x = this.runAnimation.x + (this.runAnimation.width / 2) - (this.barrier.width / 2) + 10;
            } else {
                this.barrier.x = this.x + (this.width / 2) - (this.barrier.width / 2);
            }
            this.barrier.y = this.y - 20;
        } else {
            if (this.state === 'run') {
                this.barrier.x = this.runAnimation.x + (this.runAnimation.width / 2) - (this.barrier.width / 2) - 10;
            } else {
                this.barrier.x = this.x + (this.width / 2) - (this.barrier.width / 2);
            }
            this.barrier.y = this.y - 20;
        }
    }

    ensureElectricWheelOnTop() {
        if (!this.electricWheel) return;
        const enemies = this.game.enemies;
        const idx = enemies.indexOf(this.electricWheel);
        if (idx !== -1 && idx !== enemies.length - 1) {
            enemies.splice(idx, 1);
            enemies.push(this.electricWheel);
        }
    }

    electricWheelLogic(deltaTime) {
        if (this.oneElectricWheel) {
            this.electricWheel = new ElectricWheel(this.game, this.x - 45, this.y - 20);
            this.game.enemies.push(this.electricWheel);
            this.game.audioHandler.enemySFX.playSound('elyvorg_electricity_wheel_sound', true);
            this.isElectricWheelActive = true;
            this.oneElectricWheel = false;
            this.game.startShake(150, { ifNotActive: true });
        }

        if (this.electricWheelStateCounter >= this.electricWheelStateCounterLimit &&
            this.oneElectricWheel === false && this.isElectricWheelActive === false) {
            this.electricWheelTimer += deltaTime;
            if (this.electricWheelTimer >= this.electricWheelCooldown) {
                this.oneElectricWheel = true;
                this.electricWheelActivateStateCounterDeltaTime = true;
                this.electricWheelTimer = 0;
                this.electricWheelCooldown = Math.floor(Math.random() * 5001) + 5000; // 5 to 10 seconds
            }
            if (this.playElectricWarningSoundOnce) {
                this.game.audioHandler.enemySFX.playSound('elyvorg_electricity_wheel_warning_sound');
                this.game.collisions.push(new PurpleWarningIndicator(this.game));
                this.game.collisions.push(new ChargeIndicatorBalls(this.game, this, {
                    palette: {
                        shadowColor: "rgba(120, 170, 255, 1)",
                        innerColor: "rgba(220, 240, 255, 1)",
                        outerColor: "rgba(140, 120, 255, 1)",
                        shadowBlur: 18,
                    },
                    stopWhen: () => !!(this.isElectricWheelActive),
                }));
                this.playElectricWarningSoundOnce = false;
            }
        }

        if (this.electricWheel.lives <= 0 ||
            this.electricWheel.x + this.electricWheel.width <= 0 ||
            this.electricWheel.x >= this.game.width) {

            this.game.audioHandler.enemySFX.stopSound('elyvorg_electricity_wheel_sound');
            this.electricWheel.markedForDeletion = true;
            this.isElectricWheelActive = false;
            this.electricWheelThrown = false;

            if (this.game.player.resetElectricWheelCounters) {
                this.game.player.resetElectricWheelCounters = false;
                this.playElectricWarningSoundOnce = true;
                this.electricWheelStateCounter = 0;
                this.electricWheelStateCounterDeltaTime = 0;
                this.electricWheelActivateStateCounterDeltaTime = false;
            }
        }

        if (!this.electricWheelThrown && this.isElectricWheelActive) {
            this.shouldInvert = this.runningDirection > 0;
            if (this.shouldInvert) {
                if (this.state === 'run') {
                    this.electricWheel.x = this.runAnimation.x + (this.runAnimation.width / 2) - (this.electricWheel.width / 2) + 10;
                } else {
                    this.electricWheel.x = this.x + (this.width / 2) - (this.electricWheel.width / 2);
                }
                this.electricWheel.y = this.y - 20;
            } else {
                if (this.state === 'run') {
                    this.electricWheel.x = this.runAnimation.x + (this.runAnimation.width / 2) - (this.electricWheel.width / 2) - 10;
                } else {
                    this.electricWheel.x = this.x + (this.width / 2) - (this.electricWheel.width / 2);
                }
                this.electricWheel.y = this.y - 20;
            }
        } else if (this.electricWheelThrown && this.isElectricWheelActive) {
            this.electricWheel.x += this.electricWheel.incrementMovement;
        }

        if (this.isElectricWheelActive && !this.electricWheel.markedForDeletion) {
            this.ensureElectricWheelOnTop();
        }
    }

    checkIfDefeated() {
        if (this._defeatTriggered) return;
        if (this.lives <= 0) {
            this._defeatTriggered = true;
            this.stopRunSFX();

            this.defeatCommon({
                bossId: "elyvorg",
                bossClass: Elyvorg,
                battleThemeId: "elyvorgBattleTheme",
                onBeforeClear: () => {
                    this.game.stopShake();
                    this.game.bossManager.releaseScreenEffect("elyvorg_thunder");
                    this.game.bossManager.releaseScreenEffect("elyvorg_poison");
                }
            });
        }
    }

    runLogic() {
        this.x += this.runningDirection;
        if (this.runStopAtTheMiddle && this.isInTheMiddle) {
            this.backToIdleSetUp();
            this.runStopAtTheMiddle = false;
        }

        const distanceToPlayer = this.getDistanceToPlayer();

        if (distanceToPlayer <= 300 && this.slashAttackOnce) {
            this.shouldInvert = this.runningDirection > 0;
            this.game.audioHandler.enemySFX.playSound('elyvorg_slash_attack_sound');
            this.slashAttack = new PurpleSlash(this.game, this.x, this.y, this.shouldInvert);
            this.game.enemies.push(this.slashAttack);
            this.isSlashActive = true;
            this.slashAttackOnce = false;
            this.slashAttackStateCounter = 0;
            this.slashAttackStateCounterLimit = Math.floor(Math.random() * 6) + 20; // 20 to 25
            this.slashChargeWarned = false;
        }
        if (this.isSlashActive) {
            if (this.shouldInvert) {
                this.slashAttack.x = this.runAnimation.x + (this.runAnimation.width / 2) - (this.slashAttack.width / 2) + 70;
            } else {
                this.slashAttack.x = this.runAnimation.x + (this.runAnimation.width / 2) - (this.slashAttack.width / 2) - 70;
            }
            this.slashAttack.y = this.runAnimation.y + (this.runAnimation.height / 2) - (this.slashAttack.height / 2) - 30;
        }
        if (this.isSlashActive && this.slashAttack.markedForDeletion === true) {
            this.isSlashActive = false;
        }
    }

    rechargeLogic(deltaTime) {
        this.stateRandomiserTimer += deltaTime;
        if (this.stateRandomiserTimer >= this.stateRandomiserCooldown && this.rechargeAnimation.frameX === this.rechargeAnimation.maxFrame) {
            this.stateRandomiser();
            this.stateRandomiserTimer = 0;
        }
    }

    stateRandomiser() {
        const allStates = [
            'run',
            'jump',
            'laser',
            'meteor',
            'ghost',
            'gravity',
            'ink',
            'fireball',
            'poison',
            'teleport'
        ];

        if (this.game.gameOver) {
            if (this.isInTheMiddle) {
                this.runningDirection = 10;
                this.state = 'run';
                this.startRunSFX();
            } else {
                this.state = 'idle';
            }
            return;
        }

        this.runStateCounter++;
        this.electricWheelStateCounter++;
        this.slashAttackStateCounter++;
        this.thunderStateCounter++;
        if (this.electricWheelActivateStateCounterDeltaTime) {
            this.electricWheelStateCounterDeltaTime++;
        }
        if (this.slashAttackStateCounter === this.slashAttackStateCounterLimit - 1 && !this.slashChargeWarned) {
            this.game.collisions.push(new ChargeIndicatorBalls(this.game, this));
            this.slashChargeWarned = true;
            this.game.audioHandler.enemySFX.playSound('elyvorg_slash_warning_sound');
        }
        if (this.slashAttackStateCounter >= this.slashAttackStateCounterLimit) {
            this.slashAttackOnce = true;
        }

        if (this.chainTeleportFromAir) {
            this.chainTeleportFromAir = false;
            if (Math.random() < 0.5) {
                this.state = 'teleport';
                this.beginTeleport();
                return;
            }
        }

        this.shouldInvert = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2;
        // prioritised states for the following scenarios
        if ((this.runStateCounter >= this.runStateCounterLimit && this.isInTheMiddle === false) ||
            (this.runStateCounter >= this.runStateCounterLimit && this.isInTheMiddle && this.previousState !== 'run') ||
            (this.isElectricWheelActive && this.electricWheelThrown === false && this.isInTheMiddle && this.previousState !== 'run')) {
            this.runStopAtTheMiddle = false;
            this.runStateCounter = 0;
            this.runStateCounterLimit = Math.floor(4 + Math.random() * 3); // 4 to 6
            this.runningDirection = this.shouldInvert ? 10 : -10;
            this.state = 'run';
            this.startRunSFX();
            this.runAnimation.x = this.x;
            this.runAnimation.y = this.y;
            this.runAnimation.frameX = 0;
            return;
        } else if (this.electricWheelStateCounterDeltaTime >= this.electricWheelStateCounterLimitDeltaTime && this.isInTheMiddle === false) {
            this.electricWheelActivateStateCounterDeltaTime = false;
            this.electricWheelStateCounterDeltaTime = 0;
            this.electricWheelStateCounterLimitDeltaTime = Math.floor(Math.random() * 4) + 1; // 1 to 4
            this.playElectricWarningSoundOnce = true;
            this.electricWheelTimer = 0;
            this.electricWheelStateCounter = 0;
            this.state = "pistol";
            this.pistolAnimation.x = this.x;
            this.pistolAnimation.y = this.y;
            this.pistolAnimation.frameX = 0;
            return;
        } else if (this.thunderStateCounter >= this.thunderStateCounterLimit) {
            this.thunderStateCounter = 0;
            this.thunderStateCounterLimit = Math.floor(Math.random() * 6) + 15; // 15 to 20
            this.state = 'thunder';
            this.thunderAnimation.x = this.x;
            this.thunderAnimation.y = this.y;
            this.thunderAnimation.frameX = 0;
            return;
        }

        let selectedState;

        if (Math.random() < 0.1 &&
            this.previousState &&
            this.previousState !== 'thunder' &&
            !this.isGravitySpinnerActive &&
            !this.isPoisonActive) {
            selectedState = this.previousState;
        } else {
            do {
                selectedState = allStates[Math.floor(Math.random() * allStates.length)];
            } while (
                selectedState === this.previousState ||
                (this.isGravitySpinnerActive && selectedState === 'gravity') ||
                (this.isPoisonActive && selectedState === 'poison')
            );
        }

        this.state = selectedState;

        const stateAnimations = {
            'run': this.runAnimation,
            'laser': this.laserAnimation,
            'meteor': this.meteorAnimation,
            'ghost': this.ghostAnimation,
            'gravity': this.gravityAnimation,
            'ink': this.inkAnimation,
            'fireball': this.fireballAnimation,
            'poison': this.poisonAnimation,
            'jump': this.jumpAnimation,
            'thunder': this.thunderAnimation,
        };

        const animation = stateAnimations[this.state];
        if (animation) {
            if (this.state === 'run') {
                this.runningDirection = this.shouldInvert ? 10 : -10;
                this.startRunSFX();
            }
            animation.x = this.x;
            animation.y = this.y;
            animation.frameX = 0;
        }

        if (this.state === 'teleport') {
            this.beginTeleport();
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.checksBossIsFullyVisible("elyvorg");
        this.updateRunSFXEdge();

        if (this.postTeleportSafeTimer > 0) {
            this.postTeleportSafeTimer -= deltaTime;
            if (this.postTeleportSafeTimer < 0) this.postTeleportSafeTimer = 0;
        }

        const boss = this.game.boss;
        const isTalkingToBoss = boss && boss.talkToBoss;

        if (!isTalkingToBoss) {
            this.checkIfDefeated();

            if (boss && boss.runAway && boss.current === this && boss.id === 'elyvorg') {
                this.runningAway(deltaTime, "elyvorg");
            } else {
                if (this.game.bossInFight && boss && boss.current === this && boss.id === 'elyvorg') {
                    this.barrierLogic(deltaTime);
                    this.electricWheelLogic(deltaTime);
                    this.gravityLogicTimer(deltaTime);
                    this.poisonLogicTimer(deltaTime);
                    if (this.state === "idle") {
                        this.fireballThrownWhileInIdle();
                        this.edgeConstraintLogic("elyvorg");
                        this.stateRandomiser();
                    } else if (this.state === "recharge") {
                        this.rechargeAnimation.update(deltaTime);
                        this.rechargeLogic(deltaTime);
                    } else if (this.state === "run") {
                        this.runAnimation.update(deltaTime);
                        this.edgeConstraintLogic("elyvorg");
                        this.runLogic();
                    } else if (this.state === "jump") {
                        this.jumpAnimation.update(deltaTime);
                        this.jumpLogic();
                    } else if (this.state === "laser") {
                        this.laserAnimation.update(deltaTime);
                        this.laserLogic();
                    } else if (this.state === "meteor") {
                        this.meteorAnimation.update(deltaTime);
                        this.meteorLogic();
                    } else if (this.state === "pistol") {
                        this.pistolAnimation.update(deltaTime);
                        this.edgeConstraintLogic("elyvorg");
                        this.pistolLogic();
                    } else if (this.state === "ghost") {
                        this.ghostAnimation.update(deltaTime);
                        this.ghostLogic();
                    } else if (this.state === "gravity") {
                        this.gravityAnimation.update(deltaTime);
                        this.gravityLogic();
                    } else if (this.state === "ink") {
                        this.inkAnimation.update(deltaTime);
                        this.inkLogic();
                    } else if (this.state === "fireball") {
                        this.fireballAnimation.update(deltaTime);
                        this.fireballLogic();
                    } else if (this.state === "poison") {
                        this.poisonAnimation.update(deltaTime);
                        this.poisonLogic();
                    } else if (this.state === "thunder") {
                        this.thunderAnimation.update(deltaTime);
                        this.thunderLogic(deltaTime);
                    } else if (this.state === "teleport") {
                        this.teleportLogic(deltaTime);
                    }

                    this.updateMeteorShakeTimer();

                    if (this.x + this.width < 0 || this.x >= this.game.width) {
                        if (boss.current === this && boss.id === 'elyvorg') {
                            boss.isVisible = false;
                        }
                    }
                }
            }
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        this.shouldInvert = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2;

        const stateAnimations = {
            'recharge': 'rechargeAnimation',
            'run': 'runAnimation',
            'jump': 'jumpAnimation',
            'laser': 'laserAnimation',
            'meteor': 'meteorAnimation',
            'pistol': 'pistolAnimation',
            'ghost': 'ghostAnimation',
            'gravity': 'gravityAnimation',
            'ink': 'inkAnimation',
            'fireball': 'fireballAnimation',
            'poison': 'poisonAnimation',
            'thunder': 'thunderAnimation'
        };

        if (this.state === 'idle') {
            super.draw(context, this.shouldInvert);
        } else if (this.state === 'teleport') {
            // elyvorg invisible while teleport animation plays
            return;
        } else {
            const animationName = stateAnimations[this.state];
            if (animationName) {
                const animation = this[animationName];
                if (animation) {
                    animation.x = this.x;
                    animation.y = this.y;
                    if (this.state === 'run') {
                        this.shouldInvert = this.runningDirection > 0;
                    }
                    animation.draw(context, this.shouldInvert);
                }
            }
        }
    }
}
