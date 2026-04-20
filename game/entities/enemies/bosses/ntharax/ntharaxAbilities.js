import { Enemy, BurrowingGroundEnemy, Barrier, Projectile, FallingEnemy } from "../../enemies.js";
import { AsteroidExplosionCollision } from "../../../../animations/collisionAnimation/spriteCollisions.js";
import { DisintegrateCollision } from "../../../../animations/collisionAnimation/proceduralCollisions.js";

export class HealingBarrier extends Barrier {
    constructor(game, x, y, opts = {}) {
        super(
            game,
            x,
            y,
            260,
            260,
            ["healingBarrier4", "healingBarrier3", "healingBarrier2", "healingBarrier1", "healingBarrier"],
            5,
            {
                ...opts,
                sounds: {
                    crackSoundsByLives: {
                        4: "elyvorg_shield_crack_1_sound",
                        3: "elyvorg_shield_crack_2_sound",
                        2: "elyvorg_shield_crack_1_sound",
                        1: "elyvorg_shield_crack_2_sound",
                    },
                    breakSound: "elyvorg_shield_crack_3_sound",
                    spawnSound: "elyvorg_shield_up_sound",
                },
            }
        );

        this.isHealingBarrier = true;
    }
}

export class LaserBall extends Projectile {
    constructor(game, spawnX, spawnY, targetX, targetY, opts = {}) {
        const {
            width = 40,
            height = 40,
            maxFrame = 0,
            imageId = "slowLaserBall",
            fps = 0,
            speed = 1500,
            offscreenMargin = 220,

            rotateSpeed = Math.PI * 4,
            startAngle = 0,

            glowColor = "rgba(180, 80, 255, 0.95)",
            glowBlur = 22,
            glowAlpha = 0.9,
        } = opts;

        super(
            game,
            spawnX - width / 2,
            spawnY - height / 2,
            width,
            height,
            maxFrame,
            imageId,
            0,
            fps
        );

        this.offscreenMargin = offscreenMargin;

        let dx = targetX - spawnX;
        let dy = targetY - spawnY;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;

        this.vx = dx * speed;
        this.vy = dy * speed;

        this.angle = startAngle;
        this.rotateSpeed = rotateSpeed;

        this.glowColor = glowColor;
        this.glowBlur = glowBlur;
        this.glowAlpha = glowAlpha;
    }

    isOffscreen(m) {
        return (
            this.x + this.width < -m ||
            this.x > this.game.width + m ||
            this.y + this.height < -m ||
            this.y > this.game.height + m
        );
    }

    update(deltaTime) {
        if (this.lives <= 0) {
            this.markedForDeletion = true;
            return;
        }

        const dt = deltaTime / 1000;

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.angle += this.rotateSpeed * dt;

        this.advanceFrame(deltaTime);

        if (this.isOffscreen(this.offscreenMargin)) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        if (this.game.debug) {
            context.strokeRect(this.x, this.y, this.width, this.height);
        }

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const sx = (this.frameX || 0) * this.width;

        context.save();
        context.translate(cx, cy);
        context.rotate(this.angle);

        const drawSelf = () => {
            context.drawImage(
                this.image,
                sx,
                0,
                this.width,
                this.height,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        };

        context.globalCompositeOperation = "lighter";
        context.shadowColor = this.glowColor;
        context.shadowBlur = this.glowBlur;
        context.globalAlpha = this.glowAlpha;
        drawSelf();

        context.globalCompositeOperation = "source-over";
        context.shadowBlur = 0;
        context.globalAlpha = 1;
        drawSelf();

        context.restore();
    }
}

export class SlowLaserBall extends LaserBall {
    constructor(game, spawnX, spawnY, targetX, targetY, opts = {}) {
        super(game, spawnX, spawnY, targetX, targetY, {
            imageId: "slowLaserBall",
            glowColor: "rgba(80, 140, 255, 0.95)",
            ...opts,
        });
        this.isSlowEnemy = true;
    }
}

export class PoisonLaserBall extends LaserBall {
    constructor(game, spawnX, spawnY, targetX, targetY, opts = {}) {
        super(game, spawnX, spawnY, targetX, targetY, {
            imageId: "poisonLaserBall",
            glowColor: "rgba(80, 255, 80, 0.95)",
            ...opts,
        });
        this.isPoisonEnemy = true;
    }
}

export class RedLaserBall extends LaserBall {
    constructor(game, spawnX, spawnY, targetX, targetY, opts = {}) {
        super(game, spawnX, spawnY, targetX, targetY, {
            imageId: "redLaserBall",
            glowColor: "rgba(255, 90, 90, 0.95)",
            ...opts,
        });
        this.isRedEnemy = true;
    }
}

export class Asteroid extends FallingEnemy {
    constructor(
        game,
        width,
        height,
        points,
        imageId,
        {
            impactType = "explode",
            impactSoundId = "elyvorg_meteor_in_contact_with_ground_sound",
        } = {}
    ) {
        super(game, width, height, points, imageId);

        this.impactType = impactType;
        this.impactSoundId = impactSoundId;

        this.speedY = Math.random() * 5 + 2;
        this.x = Math.random() * (this.game.width - this.width);

        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed =
            (Math.random() * 1.2 + 0.6) * (Math.random() < 0.5 ? -1 : 1);
    }

    onGroundImpact() {
        this.markedForDeletion = true;

        const cx = this.x + this.width * 0.5;
        const cy = this.y + this.height * 0.5;

        switch (this.impactType) {
            case "disintegrate":
                this.game.collisions.push(
                    new DisintegrateCollision(this.game, this, {
                        x: cx,
                        y: cy,
                    })
                );
                break;

            case "explode":
            default:
                this.game.collisions.push(
                    new AsteroidExplosionCollision(this.game, cx, cy - 70)
                );
                break;
        }

        this.game.audioHandler.collisionSFX.playSound(this.impactSoundId, false, true);
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.rotation += this.rotationSpeed * (deltaTime / 1000);

        if (this.y >= this.game.height - this.game.groundMargin - 100) {
            this.onGroundImpact();
        }
    }

    draw(context) {
        context.save();

        if (this.isFrozenEnemy) {
            context.shadowColor = "#00eaff";
            context.shadowBlur = 18;
        } else {
            context.shadowColor = "transparent";
            context.shadowBlur = 0;
        }

        context.translate(
            this.x + this.width * 0.5,
            this.y + this.height * 0.5
        );
        context.rotate(this.rotation);

        context.drawImage(
            this.image,
            0,
            0,
            this.width,
            this.height,
            -this.width * 0.5,
            -this.height * 0.5,
            this.width,
            this.height
        );

        context.shadowColor = "transparent";
        context.shadowBlur = 0;

        context.restore();

        if (this.game.debug) {
            context.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}

export class PurpleAsteroid extends Asteroid {
    constructor(game) {
        super(game, 100, 98, 0, "purpleAsteroid", {
            impactType: "explode",
        });
    }
}

export class BlueAsteroid extends Asteroid {
    constructor(game) {
        super(game, 100, 98, 0, "blueAsteroid", {
            impactType: "disintegrate",
            impactSoundId: "breakingIceNoDamageSound",
        });

        this.isFrozenEnemy = true;
    }
}

export class GalacticSpike extends BurrowingGroundEnemy {
    constructor(game, x, opts = {}) {
        const mode2Active = !!opts.mode2Active;

        const width = 71;
        const height = 180;
        const centerX = x + width * 0.5;

        const warningMult = mode2Active ? 0.80 : 1;
        const riseMult = mode2Active ? 0.70 : 1;
        const heightMult = mode2Active ? 1.12 : 1;
        const holdMult = mode2Active ? 1.2 : 1;

        super(
            game,
            width,
            height,
            0,
            "galacticSpike",
            centerX,
            {
                baseWarningDuration: 2000 * warningMult,
                baseRiseDuration: 1500 * riseMult,
                baseHoldDuration: 3000 * holdMult,
                baseRetractDuration: 1500,
                warningJitter: null,
                randomiseDurations: false,
                cyclesMax: 1,
                moveBetweenCycles: false,
                soundIds: {
                    emerge: "galacticSpikeEmergingSound",
                    retract: "galacticSpikeRetractSound",
                },
            }
        );

        this.mode2Active = mode2Active;

        this.x = x;
        this.centerX = x + width * 0.5;

        this.isStunEnemy = true;

        const groundBottom = this.groundBottom;

        this.baseHeight = height;

        this.heightScale = (0.7 + Math.random() * 0.55) * heightMult;

        this.height = this.baseHeight * this.heightScale;

        this.visibleY = groundBottom - this.height;
        this.hiddenY = this.game.height + this.baseHeight;
        this.y = this.hiddenY;

        const totalRiseDistance = this.hiddenY - this.visibleY;
        const offscreenDistance = this.hiddenY - groundBottom;

        this.initialRiseProgress =
            totalRiseDistance > 0
                ? Math.min(1, Math.max(0, offscreenDistance / totalRiseDistance))
                : 0;

        this.emergeSoundPlayed = false;
        this.retractSoundPlayed = false;

        this.shakeAngle = 0;
        this.shakeTime = 0;
        this.shakeDir = Math.random() < 0.5 ? -1 : 1;
    }

    update(deltaTime) {
        if (this.autoRemoveOnZeroLives && this.lives <= 0) {
            this.markedForDeletion = true;
            return;
        }

        if (this.phase !== "emerge" && this.phase !== "retract") {
            this.shakeTime = 0;
            this.shakeAngle = 0;
        }

        super.update(deltaTime);
    }

    onEmergeStart() {
        this.timer = this.riseDuration * this.initialRiseProgress;

        const t = this.riseDuration > 0
            ? Math.min(1, this.timer / this.riseDuration)
            : 1;

        this.y = this.hiddenY - (this.hiddenY - this.visibleY) * t;

        if (
            !this.emergeSoundPlayed &&
            this.game &&
            this.game.audioHandler &&
            this.game.audioHandler.enemySFX
        ) {
            this.game.audioHandler.enemySFX.playSound("galacticSpikeEmergingSound", false, true);
            this.emergeSoundPlayed = true;
        }

        this.retractSoundPlayed = false;
    }

    onEmergeUpdate(t, deltaTime) {
        this.updateShake(t, deltaTime);
    }

    onRetractUpdate(t, deltaTime) {
        this.updateShake(t, deltaTime);
    }

    onRetractStart() {
        if (
            !this.retractSoundPlayed &&
            this.game &&
            this.game.audioHandler &&
            this.game.audioHandler.enemySFX
        ) {
            this.game.audioHandler.enemySFX.playSound("galacticSpikeRetractSound", false, true);
            this.retractSoundPlayed = true;
        }
    }

    updateShake(t, deltaTime) {
        if (this.phase !== "emerge" && this.phase !== "retract") return;

        this.shakeTime += deltaTime;
        const timeSeconds = this.shakeTime / 1000;
        const maxAmplitude = 0.25;
        const amplitude = maxAmplitude * (1 - t);
        this.shakeAngle = Math.sin(timeSeconds * 40) * amplitude * this.shakeDir;
    }

    drawWarning(context) {
        const groundBottom = this.groundBottom;
        const centerX = this.x + this.width * 0.5;

        const t = Math.max(0, Math.min(1, this.timer / this.warningDuration));

        const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 6);
        const baseIntensity = t;
        const globalAlpha = 0.4 + 0.6 * (baseIntensity * pulse);

        context.save();

        const glowWidth = this.width * 1.15;
        const glowHeight = 34;

        context.translate(centerX, groundBottom - 8);

        const innerAlpha = 0.6 + 0.4 * baseIntensity;
        const midAlpha = 0.4 + 0.4 * baseIntensity;

        const gradient = context.createRadialGradient(
            0, 0, 0,
            0, 0, glowWidth * 0.8
        );
        gradient.addColorStop(0, `rgba(255, 255, 220, ${innerAlpha})`);
        gradient.addColorStop(0.5, `rgba(255, 220, 120, ${midAlpha})`);
        gradient.addColorStop(1, "rgba(255, 180, 0, 0)");

        context.fillStyle = gradient;
        context.globalAlpha = globalAlpha;

        const blurBase = 25;
        const blurExtra = 25 * baseIntensity;
        context.shadowColor = "rgba(255, 220, 120, 1)";
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

        let coreT = t;
        coreT = coreT * coreT * (3 - 2 * coreT);

        const minScale = 0.2;
        const maxScale = 1.0;
        const coreScale = minScale + (maxScale - minScale) * coreT;

        const coreRadiusX = glowWidth * coreScale * 0.5;
        const coreRadiusY = glowHeight * coreScale * 0.5;

        context.globalAlpha = 0.75 + 0.25 * baseIntensity;
        context.shadowBlur = 30 + 30 * baseIntensity;
        context.shadowColor = "rgba(255, 255, 180, 1)";

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
        context.strokeStyle = `rgba(255, 255, 255, ${0.55 + 0.35 * pulse})`;
        context.lineWidth = 3 + 2 * baseIntensity;
        context.stroke();

        context.restore();
    }

    drawActivePhase(context) {
        const groundBottom = this.groundBottom;

        context.save();
        context.beginPath();
        context.rect(this.x, 0, this.width, groundBottom);
        context.clip();

        const drawW = this.width;
        const drawH = this.baseHeight * this.heightScale;

        const cx = this.x + drawW / 2;
        const cy = this.y + drawH / 2;

        context.translate(cx, cy);

        if (this.phase === "emerge" || this.phase === "retract") {
            context.rotate(this.shakeAngle);
        }

        context.shadowColor = "yellow";
        context.shadowBlur = 10;

        context.drawImage(
            this.image,
            0,
            0,
            this.width,
            this.baseHeight,
            -drawW / 2,
            -drawH / 2,
            drawW,
            drawH
        );

        context.restore();
    }
}

export class PurpleBallOrb extends Enemy {
    constructor(game, x, y, vx, vy, radius, opts = {}) {
        super();

        this.game = game;
        this.lives = 50;

        this.radius = radius;
        this.width = radius * 2;
        this.height = radius * 2;

        this.x = x - this.radius;
        this.y = y - this.radius;

        this.vx = vx;
        this.vy = vy;

        this.theme = opts.theme || "purple";
        this.palette = opts.palette || (this.theme === "red"
            ? {
                shadow: "rgba(255, 80, 80, 1)",
                g0: "rgba(255, 245, 245, 1)",
                g1: "rgba(255, 165, 165, 1)",
                g2: "rgba(220, 40, 40, 0.9)",
                g3: "rgba(80, 0, 0, 0)",
            }
            : {
                shadow: "rgba(255, 120, 255, 1)",
                g0: "rgba(255, 240, 255, 1)",
                g1: "rgba(255, 150, 255, 1)",
                g2: "rgba(160, 40, 220, 0.9)",
                g3: "rgba(50, 0, 80, 0)",
            }
        );
    }

    update(deltaTime) {
        const dt = deltaTime / 1000;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (
            this.x + this.width < -200 ||
            this.x > this.game.width + 200 ||
            this.y + this.height < -200 ||
            this.y > this.game.height + 200
        ) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        const cx = this.x + this.radius;
        const cy = this.y + this.radius;

        context.save();

        context.shadowColor = this.palette.shadow;
        context.shadowBlur = this.radius * 1.8;

        const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, this.radius);
        gradient.addColorStop(0, this.palette.g0);
        gradient.addColorStop(0.3, this.palette.g1);
        gradient.addColorStop(0.7, this.palette.g2);
        gradient.addColorStop(1, this.palette.g3);

        context.fillStyle = gradient;

        context.beginPath();
        context.arc(cx, cy, this.radius, 0, Math.PI * 2);
        context.fill();

        context.shadowBlur = 0;
        context.lineWidth = 2;
        context.strokeStyle = "rgba(255, 255, 255, 0.75)";
        context.beginPath();
        context.arc(cx, cy, this.radius * 0.82, 0, Math.PI * 2);
        context.stroke();

        context.restore();
    }
}

export class PurpleBallOrbAttack {
    constructor(game, boss) {
        this.game = game;
        this.boss = boss;

        this.started = false;
        this.phase = "idle";
        this.elapsed = 0;

        this.smallOrbs = [];
        this.bigOrb = null;

        this.spawnTimer = 0;
        this.spawnInterval = 80;

        this.gatherDuration = 1400;
        this.preLaunchDuration = 220;

        this.bigOrbTargetRadius = 18;
        this.minGatherRadius = 8;

        this.launchSpeed = 1700;

        this.justLaunched = false;
    }

    getSpeedMult() {
        return this.boss.mode2Active ? 1.65 : 1.0;
    }

    start() {
        if (this.started) return;
        this.started = true;
        this.phase = "gather";
        this.elapsed = 0;
        this.spawnTimer = 0;
        this.smallOrbs.length = 0;

        this.bigOrb = {
            x: 0,
            y: 0,
            radius: 6,
            alpha: 0.0,
        };

        this.bigOrbTargetRadius = 18;
        this.justLaunched = false;

        const rate = this.boss.mode2Active ? 1.35 : 1.0;
        this.game.audioHandler.enemySFX.playSound("purpleBallOrbStartSound", false, true, { playbackRate: rate });
    }

    getMouthPosition() {
        const facingRight = this.boss.shouldInvert;
        const baseX = this.boss.x + this.boss.width / 2;
        const baseY = this.boss.y + this.boss.height * 0.45 + 10;

        const offsetX = facingRight ? 30 : -30;
        const x = baseX + offsetX;
        const y = baseY;

        return { x, y };
    }

    spawnSmallOrb(mouthX, mouthY) {
        const speedMult = this.getSpeedMult();

        const angle = Math.random() * Math.PI * 2;
        const radius = 80 + Math.random() * 30;

        const orb = {
            angle,
            orbitRadius: radius,
            radialSpeed: (-70 - Math.random() * 40) * speedMult,
            angularSpeed: (3 + Math.random() * 2) * speedMult,
            size: 4 + Math.random() * 3,
            x: mouthX + Math.cos(angle) * radius,
            y: mouthY + Math.sin(angle) * radius,
        };

        this.smallOrbs.push(orb);
    }

    updateSmallOrbs(deltaTime, mouthX, mouthY) {
        const dt = deltaTime / 1000;

        for (let i = this.smallOrbs.length - 1; i >= 0; i--) {
            const orb = this.smallOrbs[i];

            orb.angle += orb.angularSpeed * dt;
            orb.orbitRadius += orb.radialSpeed * dt;

            if (orb.orbitRadius < this.minGatherRadius) {
                this.smallOrbs.splice(i, 1);
                if (this.bigOrb) {
                    this.bigOrbTargetRadius += orb.size * 0.9;
                    this.bigOrb.alpha = Math.min(1, this.bigOrb.alpha + 0.09);
                }
                continue;
            }

            orb.x = mouthX + Math.cos(orb.angle) * orb.orbitRadius;
            orb.y = mouthY + Math.sin(orb.angle) * orb.orbitRadius;
        }
    }

    updateBigOrb(deltaTime, mouthX, mouthY) {
        if (!this.bigOrb) return;

        this.bigOrb.x = mouthX;
        this.bigOrb.y = mouthY;

        const speedMult = this.getSpeedMult();
        const lerp = Math.min(0.45, 0.18 * speedMult);

        const r = this.bigOrb.radius;
        const target = this.bigOrbTargetRadius;
        this.bigOrb.radius = r + (target - r) * lerp;
    }

    launchProjectile(mouthX, mouthY) {
        const player = this.game.player;
        const targetX = player.x + player.width / 2;
        const targetY = player.y + player.height / 2;

        let dx = targetX - mouthX;
        let dy = targetY - mouthY;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;

        const speed = this.boss.mode2Active ? this.launchSpeed * 1.35 : this.launchSpeed;

        const vx = dx * speed;
        const vy = dy * speed;

        const radius = this.bigOrb ? this.bigOrb.radius : this.bigOrbTargetRadius;

        const theme = this.boss.mode2Active ? "red" : "purple";

        const proj = new PurpleBallOrb(this.game, mouthX, mouthY, vx, vy, radius, { theme });
        this.game.enemies.push(proj);

        const rate = this.boss.mode2Active ? 1.35 : 1.0;
        this.game.audioHandler.enemySFX.playSound("purpleBallOrbLaunchSound", false, true, { playbackRate: rate });

        this.justLaunched = true;

        this.smallOrbs.length = 0;
        this.bigOrb = null;

        this.phase = "done";
    }

    update(deltaTime) {
        if (!this.started || this.phase === "done") return;

        const speedMult = this.getSpeedMult();

        const gatherDuration = this.gatherDuration / speedMult;
        const preLaunchDuration = this.preLaunchDuration / speedMult;
        const spawnInterval = this.spawnInterval / speedMult;

        this.elapsed += deltaTime;

        const { x: mouthX, y: mouthY } = this.getMouthPosition();

        if (this.phase === "gather" || this.phase === "preLaunch") {
            if (this.phase === "gather") {
                this.spawnTimer += deltaTime;
                while (this.spawnTimer >= spawnInterval) {
                    this.spawnTimer -= spawnInterval;
                    this.spawnSmallOrb(mouthX, mouthY);
                }
            }

            this.updateSmallOrbs(deltaTime, mouthX, mouthY);
            this.updateBigOrb(deltaTime, mouthX, mouthY);

            if (this.phase === "gather" && this.elapsed >= gatherDuration) {
                this.phase = "preLaunch";
                this.preLaunchTimer = 0;
            } else if (this.phase === "preLaunch") {
                this.preLaunchTimer += deltaTime;

                if (this.preLaunchTimer >= preLaunchDuration) {
                    this.launchProjectile(mouthX, mouthY);
                }
            }
        }
    }

    drawSmallOrbs(context) {
        if (this.smallOrbs.length === 0) return;

        context.save();

        for (let i = 0; i < this.smallOrbs.length; i++) {
            const orb = this.smallOrbs[i];

            const gradient = context.createRadialGradient(
                orb.x,
                orb.y,
                0,
                orb.x,
                orb.y,
                orb.size
            );
            const isRed = this.boss.mode2Active;

            gradient.addColorStop(0, isRed ? "rgba(255, 230, 230, 1)" : "rgba(255, 210, 255, 1)");
            gradient.addColorStop(0.5, isRed ? "rgba(255, 120, 120, 0.9)" : "rgba(200, 120, 255, 0.9)");
            gradient.addColorStop(1, isRed ? "rgba(120, 0, 0, 0.0)" : "rgba(80, 0, 120, 0.0)");

            context.fillStyle = gradient;
            context.globalAlpha = 0.7;

            context.beginPath();
            context.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
            context.fill();
        }

        context.restore();
    }

    drawBigOrb(context) {
        if (!this.bigOrb || this.bigOrb.alpha <= 0) return;

        const orb = this.bigOrb;

        context.save();
        context.globalAlpha = orb.alpha;

        context.shadowColor = "rgba(255, 120, 255, 1)";
        context.shadowBlur = orb.radius * 1.8;

        const gradient = context.createRadialGradient(
            orb.x,
            orb.y,
            0,
            orb.x,
            orb.y,
            orb.radius
        );
        const isRed = this.boss.mode2Active;

        context.shadowColor = isRed ? "rgba(255, 80, 80, 1)" : "rgba(255, 120, 255, 1)";

        gradient.addColorStop(0, isRed ? "rgba(255, 245, 245, 1)" : "rgba(255, 240, 255, 1)");
        gradient.addColorStop(0.3, isRed ? "rgba(255, 165, 165, 1)" : "rgba(255, 150, 255, 1)");
        gradient.addColorStop(0.7, isRed ? "rgba(220, 40, 40, 0.9)" : "rgba(160, 40, 220, 0.9)");
        gradient.addColorStop(1, isRed ? "rgba(80, 0, 0, 0)" : "rgba(50, 0, 80, 0)");

        context.fillStyle = gradient;

        context.beginPath();
        context.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        context.fill();

        context.shadowBlur = 0;
        context.lineWidth = 2;
        context.strokeStyle = "rgba(255, 255, 255, 0.75)";
        context.beginPath();
        context.arc(orb.x, orb.y, orb.radius * 0.82, 0, Math.PI * 2);
        context.stroke();

        context.restore();
    }

    draw(context) {
        if (!this.started || this.phase === "done") return;
        this.drawSmallOrbs(context);
        this.drawBigOrb(context);
    }

    get isFinished() {
        return this.phase === "done";
    }
}

export class SplitBeamOrb extends Enemy {
    constructor(game, x, y, vx, vy, opts = {}) {
        super();
        this.game = game;

        this.radius = opts.radius ?? 14;
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        this.x = x - this.radius;
        this.y = y - this.radius;
        this.vx = vx;
        this.vy = vy;

        this.lives = 1;
        this.isEnemyStun = opts.isEnemyStun ?? false;

        this.travelled = 0;
        this.totalPlannedDistance = opts.totalDistance ?? 600;
        this.slowStartAt = opts.slowStartAt ?? this.totalPlannedDistance * 0.45;
        this.splitAt = opts.splitAt ?? this.totalPlannedDistance * 0.55;

        this.minSpeed = opts.minSpeed ?? 70;
        this.splitSpeed = opts.splitSpeed ?? 850;
        this.splitAngle = opts.splitAngle ?? Math.PI / 8;

        this.enableSplit = opts.enableSplit ?? true;

        this.generation = opts.generation ?? 0;
        this.maxGeneration = opts.maxGeneration ?? 3;
        this.maxOrbs = opts.maxOrbs ?? 8;
        this.familyTag = opts.familyTag ?? "ntharaxPurple";

        this.didSplit = false;

        this.bounces = 0;
        this.maxBounces = opts.maxBounces ?? null;

        this.trail = [];
        this.maxTrail = 14;

        this.colorProfile = opts.colorProfile ?? "purple";
        this.attackType = opts.attackType ?? "purpleOrb";
        this.isProjectile = true;

        this.isCharging = !!opts.isCharging;
        this.chargeFollowBoss = opts.chargeFollowBoss ?? null;

        this.chargeStartRadius = opts.chargeStartRadius ?? 5;
        this.chargeTargetRadius = opts.chargeTargetRadius ?? 16;
        this.chargeAlpha = 0;
        this.chargeRadius = this.isCharging ? this.chargeStartRadius : this.radius;

        this.launchSpeed = opts.launchSpeed ?? 1200;

        this.justFired = false;

        this.getMode2Active =
            typeof opts.getMode2Active === "function"
                ? opts.getMode2Active
                : () => false;

        this._mode2Applied = false;

        this.chargeStartSoundId = opts.chargeStartSoundId ?? null;
        this.releaseSoundId = opts.releaseSoundId ?? null;
        this.splitSoundId = opts.splitSoundId ?? null;
        this.burstSoundId = opts.burstSoundId ?? opts.fastSoundId ?? null;

        this._playedChargeStartSound = false;
        this._playedBurstSound = false;

        if (this.isCharging) {
            this.radius = this.chargeRadius;
            this.width = this.radius * 2;
            this.height = this.radius * 2;

            if (this.chargeStartSoundId && !this._playedChargeStartSound) {
                this.game.audioHandler.enemySFX.playSound(
                    this.chargeStartSoundId,
                    false,
                    true
                );
                this._playedChargeStartSound = true;
            }
        }
    }

    playSFX(id) {
        if (!id) return;
        this.game.audioHandler.enemySFX.playSound(id, false, true);
    }

    isDeadOrRemoved() {
        return this.lives <= 0 || this.markedForDeletion;
    }

    getBossEmitterPosition() {
        const boss = this.chargeFollowBoss;
        if (!boss) return { x: this.x + this.radius, y: this.y + this.radius };

        const baseX = boss.x + boss.width / 2;
        const baseY = boss.y + boss.height * 0.05;
        const offsetX = boss.shouldInvert ? 6 : -6;
        return { x: baseX + offsetX, y: baseY };
    }

    updateCharge(deltaTime) {
        const { x, y } = this.getBossEmitterPosition();

        this.chargeAlpha = Math.min(1, this.chargeAlpha + deltaTime / 250);
        this.chargeRadius =
            this.chargeRadius + (this.chargeTargetRadius - this.chargeRadius) * 0.12;

        this.radius = this.chargeRadius;
        this.width = this.radius * 2;
        this.height = this.radius * 2;

        this.x = x - this.radius;
        this.y = y - this.radius;

        const cx = this.x + this.radius;
        const cy = this.y + this.radius;
        this.trail.push({ x: cx, y: cy });
        if (this.trail.length > this.maxTrail) this.trail.shift();
    }

    fireNow() {
        if (!this.isCharging || this.justFired || this.isDeadOrRemoved()) return;

        const { x, y } = this.getBossEmitterPosition();
        const player = this.game.player;

        const targetX = player.x + player.width / 2;
        const targetY = this.game.height * 0.5;

        let dx = targetX - x;
        let dy = targetY - y;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;

        this.vx = dx * this.launchSpeed;
        this.vy = dy * this.launchSpeed;

        this.travelled = 0;
        this.didSplit = false;

        this.isCharging = false;
        this.chargeFollowBoss = null;

        this.justFired = true;

        if (this.isDeadOrRemoved()) return;

        this.playSFX(this.releaseSoundId);
    }

    countFamilyOrbs() {
        let n = 0;
        for (let i = 0; i < this.game.enemies.length; i++) {
            const e = this.game.enemies[i];
            if (
                e instanceof SplitBeamOrb &&
                !e.markedForDeletion &&
                e.familyTag === this.familyTag
            ) {
                n++;
            }
        }
        return n;
    }

    getColorStops() {
        if (this.colorProfile === "yellow") {
            return {
                trail: {
                    c0: "rgba(255, 255, 200, 1)",
                    c1: "rgba(255, 220, 80, 0.85)",
                    c2: "rgba(120, 80, 0, 0)",
                },
                core: {
                    shadow: "rgba(255, 230, 120, 1)",
                    c0: "rgba(255, 255, 240, 1)",
                    c1: "rgba(255, 235, 140, 1)",
                    c2: "rgba(255, 190, 40, 0.95)",
                    c3: "rgba(120, 70, 0, 0)",
                },
            };
        }

        if (this.colorProfile === "black") {
            return {
                trail: {
                    c0: "rgba(180, 180, 180, 1)",
                    c1: "rgba(70, 70, 70, 0.85)",
                    c2: "rgba(0, 0, 0, 0)",
                },
                core: {
                    shadow: "rgba(0, 0, 0, 1)",
                    c0: "rgba(230, 230, 230, 1)",
                    c1: "rgba(110, 110, 110, 1)",
                    c2: "rgba(20, 20, 20, 0.97)",
                    c3: "rgba(0, 0, 0, 0)",
                },
            };
        }

        return {
            trail: {
                c0: "rgba(255, 210, 255, 1)",
                c1: "rgba(190, 80, 255, 0.8)",
                c2: "rgba(60, 0, 90, 0)",
            },
            core: {
                shadow: "rgba(255, 140, 255, 1)",
                c0: "rgba(255, 245, 255, 1)",
                c1: "rgba(255, 150, 255, 1)",
                c2: "rgba(140, 30, 220, 0.95)",
                c3: "rgba(40, 0, 70, 0)",
            },
        };
    }

    bounceAgainstEdges() {
        let cx = this.x + this.radius;
        let cy = this.y + this.radius;

        const r = this.radius;

        const minX = r;
        const maxX = this.game.width - r;

        const minY = r;

        const groundMargin = this.game.groundMargin ?? 0;
        const floorY = this.game.height - groundMargin;
        const maxY = floorY - r;

        const minRebound = 120;

        let didBounce = false;

        if (cx <= minX) {
            cx = minX;
            this.vx = Math.abs(this.vx);
            if (Math.abs(this.vx) < minRebound) this.vx = minRebound;
            didBounce = true;
        } else if (cx >= maxX) {
            cx = maxX;
            this.vx = -Math.abs(this.vx);
            if (Math.abs(this.vx) < minRebound) this.vx = -minRebound;
            didBounce = true;
        }

        if (cy <= minY) {
            cy = minY;
            this.vy = Math.abs(this.vy);
            if (Math.abs(this.vy) < minRebound) this.vy = minRebound;
            didBounce = true;
        } else if (cy >= maxY) {
            cy = maxY;
            this.vy = -Math.abs(this.vy);
            if (Math.abs(this.vy) < minRebound) this.vy = -minRebound;
            didBounce = true;
        }

        this.x = cx - r;
        this.y = cy - r;

        if (didBounce) this.bounces += 1;
    }

    isOffscreen() {
        const cx = this.x + this.radius;
        const cy = this.y + this.radius;
        const r = this.radius;

        return (
            cx < -r ||
            cx > this.game.width + r ||
            cy < -r ||
            cy > this.game.height + r
        );
    }

    update(deltaTime) {
        if (this.lives <= 0) {
            this.markedForDeletion = true;

            this.isCharging = false;
            this.justFired = true;

            return;
        }

        if (this.isCharging) {
            this.updateCharge(deltaTime);
            return;
        }

        if (!this._mode2Applied && this.getMode2Active()) {
            const isTarget =
                this.attackType === "yellowBeam" ||
                this.attackType === "blackBeam" ||
                this.attackType === "purpleBeam";

            if (isTarget) {
                this._mode2Applied = true;

                if (this.maxBounces != null) {
                    this.maxBounces += 1;
                }

                const screenDist = this.totalPlannedDistance ?? 600;
                const splitAt = screenDist * 0.50;

                const baseSlowStartAt = screenDist * 0.42;
                const slowWindow = Math.max(1, splitAt - baseSlowStartAt);
                const mode2SlowStartAt = Math.min(
                    splitAt - 1,
                    splitAt - slowWindow * 0.5
                );

                this.slowStartAt = mode2SlowStartAt;
                this.splitAt = splitAt;
            }
        }

        const dt = deltaTime / 1000;

        const speed = Math.hypot(this.vx, this.vy) || 1;
        const dx = this.vx / speed;
        const dy = this.vy / speed;

        if (this.travelled >= this.slowStartAt) {
            const denom = Math.max(1, this.splitAt - this.slowStartAt);
            const t = Math.min(1, (this.travelled - this.slowStartAt) / denom);
            const eased = 1 - (1 - t) * (1 - t);

            const targetSpeed = speed + (this.minSpeed - speed) * eased;
            this.vx = dx * targetSpeed;
            this.vy = dy * targetSpeed;
        }

        const px = this.x + this.radius;
        const py = this.y + this.radius;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        const nx = this.x + this.radius;
        const ny = this.y + this.radius;

        this.travelled += Math.hypot(nx - px, ny - py);

        this.trail.push({ x: nx, y: ny });
        if (this.trail.length > this.maxTrail) this.trail.shift();

        if (this.travelled >= this.splitAt) {
            if (this.enableSplit) {
                if (!this.didSplit) {
                    this.didSplit = true;

                    const canSplitByGen = this.generation < this.maxGeneration;

                    if (!canSplitByGen) {
                        this.travelled = 0;
                        this.enableSplit = false;
                        this.vx = dx * this.splitSpeed;
                        this.vy = dy * this.splitSpeed;
                        this.playSFX(this.burstSoundId);
                    } else {
                        const canSplitByPop =
                            this.countFamilyOrbs() < this.maxOrbs;
                        if (canSplitByPop) {
                            this.spawnDuplicates(nx, ny, dx, dy);
                            this.markedForDeletion = true;
                            return;
                        }
                        this.travelled = 0;
                        this.didSplit = false;
                        this.vx = dx * this.splitSpeed;
                        this.vy = dy * this.splitSpeed;
                        this.playSFX(this.burstSoundId);
                    }
                }
            } else {
                this.travelled = 0;
                this.vx = dx * this.splitSpeed;
                this.vy = dy * this.splitSpeed;
                this.playSFX(this.burstSoundId);
            }
        }

        const limited = this.maxBounces != null;
        const hitLimit = limited && this.bounces >= this.maxBounces;

        if (!hitLimit) {
            this.bounceAgainstEdges();
        } else {
            if (this.isOffscreen()) {
                this.markedForDeletion = true;
            }
        }
    }

    spawnDuplicates(cx, cy, dx, dy) {
        const baseAngle = Math.atan2(dy, dx);
        const nextGen = this.generation + 1;

        const OrbClass = this.constructor;

        const spawn = (angle) => {
            const vx = Math.cos(angle) * this.splitSpeed;
            const vy = Math.sin(angle) * this.splitSpeed;

            const orb = new OrbClass(this.game, cx, cy, vx, vy, {
                radius: Math.max(10, this.radius * 0.9),

                generation: nextGen,
                maxGeneration: this.maxGeneration,
                maxOrbs: this.maxOrbs,
                familyTag: this.familyTag,

                totalDistance: this.totalPlannedDistance,
                slowStartAt: this.slowStartAt,
                splitAt: this.splitAt,
                minSpeed: this.minSpeed,
                splitSpeed: this.splitSpeed,
                splitAngle: this.splitAngle,

                enableSplit: true,
                maxBounces: this.maxBounces,
                colorProfile: this.colorProfile,
                isEnemyStun: this.isEnemyStun,

                attackType: this.attackType,

                isCharging: false,
                chargeFollowBoss: null,
                launchSpeed: this.launchSpeed,

                chargeStartSoundId: this.chargeStartSoundId,
                releaseSoundId: this.releaseSoundId,
                splitSoundId: this.splitSoundId,
                burstSoundId: this.burstSoundId,

                getMode2Active: this.getMode2Active,
            });

            this.game.enemies.push(orb);
        };

        spawn(baseAngle - this.splitAngle);
        spawn(baseAngle + this.splitAngle);

        this.playSFX(this.splitSoundId);
    }

    draw(context) {
        const cx = this.x + this.radius;
        const cy = this.y + this.radius;

        if (
            !Number.isFinite(cx) ||
            !Number.isFinite(cy) ||
            !Number.isFinite(this.radius) ||
            this.radius <= 0
        ) {
            return;
        }

        const colors = this.getColorStops();

        const composite =
            this.colorProfile === "black" ? "source-over" : "lighter";

        if (this.isCharging) {
            context.save();
            context.globalCompositeOperation = composite;
            context.globalAlpha = this.chargeAlpha;

            context.shadowColor = colors.core.shadow;
            context.shadowBlur =
                this.colorProfile === "black"
                    ? this.radius * 3.5
                    : this.radius * 2;

            const grad = context.createRadialGradient(
                cx,
                cy,
                0,
                cx,
                cy,
                this.radius
            );
            grad.addColorStop(0, colors.core.c0);
            grad.addColorStop(0.35, colors.core.c1);
            grad.addColorStop(1, colors.core.c3);

            context.fillStyle = grad;
            context.beginPath();
            context.arc(cx, cy, this.radius, 0, Math.PI * 2);
            context.fill();

            context.restore();
            return;
        }

        context.save();
        context.globalCompositeOperation = composite;

        for (let i = 0; i < this.trail.length; i++) {
            const p = this.trail[i];
            const t = i / Math.max(1, this.trail.length - 1);
            const r = this.radius * (0.35 + 0.65 * t);
            context.globalAlpha = 0.08 + 0.18 * t;

            const g = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
            g.addColorStop(0, colors.trail.c0);
            g.addColorStop(0.5, colors.trail.c1);
            g.addColorStop(1, colors.trail.c2);

            context.fillStyle = g;
            context.beginPath();
            context.arc(p.x, p.y, r, 0, Math.PI * 2);
            context.fill();
        }

        context.globalAlpha = 1;
        context.shadowColor = colors.core.shadow;
        context.shadowBlur =
            this.colorProfile === "black" ? this.radius * 3.5 : this.radius * 2;

        const grad = context.createRadialGradient(cx, cy, 0, cx, cy, this.radius);
        grad.addColorStop(0, colors.core.c0);
        grad.addColorStop(0.35, colors.core.c1);
        grad.addColorStop(0.75, colors.core.c2);
        grad.addColorStop(1, colors.core.c3);

        context.fillStyle = grad;
        context.beginPath();
        context.arc(cx, cy, this.radius, 0, Math.PI * 2);
        context.fill();

        context.restore();
    }
}

export class PurpleBeamOrb extends SplitBeamOrb {
    constructor(game, x, y, vx, vy, opts = {}) {
        super(game, x, y, vx, vy, {
            radius: 14,
            totalDistance: 600,
            slowStartAt: 600 * 0.42,
            splitAt: 600 * 0.50,
            minSpeed: 60,
            splitSpeed: 950,
            splitAngle: Math.PI / 8,

            enableSplit: true,
            generation: 0,
            maxGeneration: 3,
            maxOrbs: 8,
            familyTag: "ntharaxPurpleBeam",

            maxBounces: 4,
            colorProfile: "purple",
            isEnemyStun: false,
            attackType: "purpleBeam",

            launchSpeed: 1200,

            chargeStartSoundId: "purpleChargeSound",
            releaseSoundId: "purpleReleaseSound",
            splitSoundId: "purpleReleaseSound",
            fastSoundId: "purpleReleaseSound",

            ...opts,
        });
    }
}

export class YellowBeamOrb extends SplitBeamOrb {
    constructor(game, x, y, vx, vy, opts = {}) {
        super(game, x, y, vx, vy, {
            radius: 14,
            totalDistance: 600,
            slowStartAt: 600 * 0.42,
            splitAt: 600 * 0.50,
            minSpeed: 60,
            splitSpeed: 950,
            splitAngle: Math.PI / 8,

            enableSplit: true,
            generation: 0,
            maxGeneration: 1,
            maxOrbs: 2,
            familyTag: "ntharaxYellowBeam",

            maxBounces: 3,
            colorProfile: "yellow",
            isEnemyStun: true,
            attackType: "yellowBeam",

            launchSpeed: 1200,

            chargeStartSoundId: "yellowChargeSound",
            releaseSoundId: "yellowReleaseSound",
            splitSoundId: "yellowReleaseSound",
            fastSoundId: "yellowReleaseSound",

            ...opts,
        });
    }
}

export class BlackBeamOrb extends SplitBeamOrb {
    constructor(game, x, y, vx, vy, opts = {}) {
        super(game, x, y, vx, vy, {
            radius: 14,
            totalDistance: 600,
            slowStartAt: 600 * 0.42,
            splitAt: 600 * 0.50,
            minSpeed: 60,
            splitSpeed: 950,
            splitAngle: Math.PI / 8,

            enableSplit: false,
            maxBounces: 2,

            colorProfile: "black",
            isEnemyStun: true,
            attackType: "blackBeam",

            launchSpeed: 1200,

            chargeStartSoundId: "blackChargeSound",
            releaseSoundId: "blackReleaseSound",
            fastSoundId: "blackReleaseSound",

            ...opts,
        });
    }
}

export class AntennaeTentacle extends BurrowingGroundEnemy {
    constructor(game, centerX, opts = {}) {
        const mode2Active = !!opts.mode2Active;

        const mode2Config = {
            baseWarningDuration: 500,
            baseRiseDuration: 300,
            baseHoldDuration: 200,
            baseRetractDuration: 200,

            warningJitter: {
                warning: 0,
                rise: 150,
                hold: 120,
                retract: 200,
            },

            randomiseDurations: true,
            cyclesMax: 8,
            moveBetweenCycles: true,
            soundIds: {
                emerge: "tentacleEmergeSound",
                retract: "tentacleRetractSound",
            },
        };

        const normalConfig = {
            baseWarningDuration: 800,
            baseRiseDuration: 520,
            baseHoldDuration: 320,
            baseRetractDuration: 360,

            warningJitter: {
                warning: 0,
                rise: 180,
                hold: 140,
                retract: 220,
            },

            randomiseDurations: true,
            cyclesMax: 4,
            moveBetweenCycles: true,
            soundIds: {
                emerge: "tentacleEmergeSound",
                retract: "tentacleRetractSound",
            },
        };

        super(
            game,
            127,
            630,
            0,
            "antennaeTentacleUpward",
            centerX,
            mode2Active ? mode2Config : normalConfig
        );
        this.lives = 50;
        this.mode2Active = mode2Active;
        this.mode2Visual = opts.mode2Visual || null;
    }

    beginPowerVisual(context) {
        if (!this.mode2Active || !this.mode2Visual) return;

        const v = this.mode2Visual;

        context.save();
        context.filter = `hue-rotate(${v.hueDeg}deg) saturate(${v.saturate}) brightness(${v.brightness})`;
        context.shadowColor = v.glowColor;
        context.shadowBlur = v.glowBlur;
    }

    endPowerVisual(context) {
        if (!this.mode2Active || !this.mode2Visual) return;
        context.restore();
    }

    draw(context, ...args) {
        this.beginPowerVisual(context);
        super.draw(context, ...args);
        this.endPowerVisual(context);
    }
}

export class GroundShockwaveRing extends Enemy {
    constructor(game, centerX, groundY, dir, opts = {}) {
        super();

        this.game = game;
        this.lives = 50;

        this.cx = centerX;
        this.groundY = groundY;

        this.dir = dir >= 0 ? 1 : -1;
        this.speed = opts.speed ?? 900;

        this.life = 0;
        this.maxLife = opts.maxLife ?? 1200;

        this.startRadius = opts.startRadius ?? 10;
        this.endRadius = opts.endRadius ?? 110;
        this.thickness = opts.thickness ?? 10;

        this.height = Math.max(1, opts.hitHeight ?? 1);
        this.width = 4;

        this.x = this.cx - this.width * 0.5;
        this.y = this.groundY - this.height;

        this.offscreenMargin = opts.offscreenMargin ?? 250;

        this.mode2Active = !!opts.mode2Active;

        this._seed = (Math.random() * 100000) | 0;
    }

    update(deltaTime) {
        if (this.markedForDeletion) return;

        const dt = deltaTime / 1000;

        this.life += deltaTime;
        this.cx += this.dir * this.speed * dt;

        const t = Math.max(0, Math.min(1, this.life / this.maxLife));

        const easeOut = 1 - Math.pow(1 - t, 3);
        const r = this.startRadius + (this.endRadius - this.startRadius) * easeOut;

        const thick = this.thickness * (1.25 - 0.45 * t);

        const sx = 1.45;
        this.width = Math.max(4, (r * 2 + thick) * sx);

        this.x = this.cx - this.width * 0.5;

        this.y = this.groundY - this.height;

        if (this.life >= this.maxLife) {
            this.markedForDeletion = true;
            return;
        }

        if (
            this.cx < -this.offscreenMargin ||
            this.cx > this.game.width + this.offscreenMargin
        ) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        if (this.markedForDeletion) return;

        const t = Math.max(0, Math.min(1, this.life / this.maxLife));

        const easeOut = 1 - Math.pow(1 - t, 3);
        const r = this.startRadius + (this.endRadius - this.startRadius) * easeOut;

        const alpha = Math.max(0, Math.min(1, (1 - t) * 1.05));

        const time =
            (this.game.hiddenTime ??
                (typeof performance !== "undefined" ? performance.now() : 0)) / 1000;

        const jitter = Math.sin(time * 18.0 + this._seed * 0.01) * 0.8 * (1 - t);

        const thick = this.thickness * (1.25 - 0.45 * t);

        const sx = 1.45;
        const sy = 0.48;

        const P = this.mode2Active
            ? {
                hazeShadow: "rgba(80, 0, 0, 0.95)",
                hazeStroke: "rgba(160, 0, 0, 0.35)",
                gradA: "rgba(200, 30, 30, 0.30)",
                gradB: "rgba(255, 80, 80, 0.92)",
                glow: "rgba(255, 60, 60, 0.95)",
                core: "rgba(255, 245, 245, 0.95)",
                shimmer: "rgba(255, 170, 170, 0.90)",
                band1: "rgba(170, 0, 0, 0.55)",
                band2: "rgba(255, 220, 220, 0.35)",
            }
            : {
                hazeShadow: "rgba(40, 0, 80, 0.95)",
                hazeStroke: "rgba(80, 0, 140, 0.35)",
                gradA: "rgba(120, 40, 200, 0.30)",
                gradB: "rgba(210, 120, 255, 0.90)",
                glow: "rgba(210,120,255,0.95)",
                core: "rgba(255,255,255,0.92)",
                shimmer: "rgba(255, 190, 255, 0.85)",
                band1: "rgba(90, 0, 150, 0.55)",
                band2: "rgba(255, 255, 255, 0.35)",
            };

        ctx.save();
        ctx.translate(this.cx, this.groundY);
        ctx.scale(sx, sy);
        ctx.globalCompositeOperation = "lighter";

        // outer haze
        ctx.save();
        ctx.globalAlpha = alpha * 0.40;
        ctx.shadowColor = P.hazeShadow;
        ctx.shadowBlur = 34;
        ctx.lineWidth = thick * 2.6;
        ctx.strokeStyle = P.hazeStroke;
        ctx.beginPath();
        ctx.arc(jitter * 0.25, 0, r * 1.02, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // main ring
        const g = ctx.createLinearGradient(-r, 0, r, 0);
        g.addColorStop(0.0, P.gradA);
        g.addColorStop(0.35, P.gradB);
        g.addColorStop(0.5, "rgba(255,255,255,1)");
        g.addColorStop(0.65, P.gradB);
        g.addColorStop(1.0, P.gradA);

        ctx.save();
        ctx.globalAlpha = alpha * 0.95;
        ctx.shadowColor = P.glow;
        ctx.shadowBlur = 22;
        ctx.lineWidth = thick * 1.55;
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.arc(-jitter * 0.35, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // core
        ctx.save();
        ctx.globalAlpha = alpha * 0.95;
        ctx.shadowColor = P.core;
        ctx.shadowBlur = 14;
        ctx.lineWidth = Math.max(2, thick * 0.55);
        ctx.strokeStyle = P.core;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.985, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // shimmer
        const shimmer = 0.5 + 0.5 * Math.sin(time * 9.0 + this._seed * 0.02);
        ctx.save();
        ctx.globalAlpha = alpha * 0.22 * shimmer;
        ctx.lineWidth = Math.max(1.5, thick * 0.35);
        ctx.strokeStyle = P.shimmer;
        ctx.beginPath();
        const a0 = (time * 1.8 + this._seed * 0.001) % (Math.PI * 2);
        ctx.arc(0, 0, r * 0.90, a0, a0 + Math.PI * 0.75);
        ctx.stroke();
        ctx.restore();

        // ground band
        ctx.save();
        ctx.globalAlpha = alpha * 0.30;
        const bandW = 180 * (0.7 + 0.7 * easeOut);
        const bandH = 22;

        const bg = ctx.createLinearGradient(-bandW, 0, bandW, 0);
        bg.addColorStop(0.0, "rgba(0,0,0,0)");
        bg.addColorStop(0.25, P.band1);
        bg.addColorStop(0.5, P.band2);
        bg.addColorStop(0.75, P.band1);
        bg.addColorStop(1.0, "rgba(0,0,0,0)");

        ctx.fillStyle = bg;
        ctx.fillRect(-bandW, -bandH * 0.25, bandW * 2, bandH);
        ctx.restore();

        ctx.restore();

        if (this.game.debug) {
            ctx.save();
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }
    }
}

