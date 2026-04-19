import { Barrier, Projectile, GroundEnemy, FallingEnemy, ImmobileGroundEnemy } from "../../enemies.js";
import { normalizeDelta } from "../../../../config/constants.js";
import { MeteorExplosionCollision, PoisonDropGroundCollision } from "../../../../animations/collisionAnimation/spriteCollisions.js";

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
        const dt = normalizeDelta(deltaTime);
        this.x += this.incrementMovement * dt;
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
        const dt = normalizeDelta(deltaTime);

        this.rotationAngle += this.rotationSpeed * dt;

        this.y -= this.speedX * dt;
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
            this.x += deltaX * followSpeed * dt;
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
                this.player.x += (playerPushbackX - this.player.x) * 0.08 * dt;
            } else {
                this.player.x += (playerPushbackX - this.player.x) * 0.12 * dt;
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
        const dt = normalizeDelta(deltaTime);
        this.rotationAngle += this.rotationSpeed * dt;
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
        const dt = normalizeDelta(deltaTime);

        if (!this.soundPlayed) {
            this.game.audioHandler.enemySFX.playSound('elyvorg_ink_bomb_sound', false, true);
            this.soundPlayed = true;
        }

        if (this.scale < this.targetScale) {
            this.scale += this.scaleSpeed * dt;
        } else {
            this.scale = this.targetScale;
        }

        if (!this.stopMoving && this.y > this.stopY) {
            this.y -= this.verticalSpeed * dt;
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
        const dt = normalizeDelta(deltaTime);

        const sizeChange = this.size + this.growthRate * dt > this.maxSize
            ? this.maxSize - this.size
            : this.growthRate * dt;

        this.size += sizeChange;
        this.y -= sizeChange / 2;

        this.rotationAngle += this.rotationSpeed * dt;
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
        super(game, x, y, 155.625, 75, 7, imageId, speedX, speedY);

        this.initialSize = 10;
        this.size = this.initialSize;

        this.x = x;
        this.y = y;

        this.speedX = speedX;
        this.speedY = speedY;

        this.direction = direction;

        this.shadowColor = shadowColor;

        this.setFps(15);

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

        const dt = normalizeDelta(deltaTime);

        for (const p of this.particles) {
            p.age += deltaTime;

            p.wobble += p.wobbleSpeed * deltaTime;
            const wobbleX = Math.sin(p.wobble) * 0.35;

            p.x += (p.vx + wobbleX) * dt;
            p.y += p.vy * dt;

            const t = Math.min(1, p.age / p.life);
            p.a = 0.9 * (1 - t);

            if (t > 0.6) p.r *= 1 - 0.005 * dt;

            if (this.boss) {
                const dx = bossCx - p.x;
                const dy = bossCy - p.y;
                p.x += dx * 0.003 * dt;
                p.y += dy * 0.003 * dt;
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
        this.lives = 50;
        this.setFps(18);

        this.shouldInvert = Math.random() < 0.5;

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

            const gradient = context.createRadialGradient(0, 0, 0, 0, 0, glowWidth * 0.75);
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
            context.ellipse(0, 0, glowWidth * 0.5, glowHeight * 0.5, 0, 0, Math.PI * 2);
            context.fill();

            const coreT = Math.min(1, t * 1.15);
            const coreScale = 0.35 + 0.65 * coreT;

            const coreRadiusX = glowWidth * coreScale * 0.5;
            const coreRadiusY = glowHeight * coreScale * 0.5;

            context.globalAlpha = 0.7 + 0.3 * baseIntensity;
            context.shadowBlur = 25 + 45 * baseIntensity;
            context.shadowColor = "rgba(255, 255, 255, 1)";

            context.beginPath();
            context.ellipse(0, 0, coreRadiusX, coreRadiusY, 0, 0, Math.PI * 2);
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

        if (this.game.debug) {
            context.save();
            context.strokeStyle = "magenta";
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.restore();
        }
    }
}
