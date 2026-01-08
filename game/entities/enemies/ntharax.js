import { Enemy, EnemyBoss, BurrowingGroundEnemy, Barrier, Projectile, FallingEnemy } from "./enemies.js";
import {
    DisintegrateCollision,
    HealingStarBurstCollision,
    AsteroidExplosionCollision,
} from "../../animations/collisionAnimation.js";

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
            imageId = "laserBall",
            fps = 0,
            speed = 1500,
            offscreenMargin = 220,

            rotateSpeed = Math.PI * 4,
            startAngle = 0,

            glowColor = "rgba(180, 80, 255, 0.95)",
            glowBlur = 22,
            glowAlpha = 0.9,
            mode2Active = false,
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

        this.mode2Active = mode2Active;
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
        this.game.audioHandler.enemySFX.playSound("purpleBallOrbStartSound", false, true, false, { playbackRate: rate });
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
        this.game.audioHandler.enemySFX.playSound("purpleBallOrbLaunchSound", false, true, false, { playbackRate: rate });

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

export class Kamehameha extends Enemy {
    constructor(
        game,
        boss,
        {
            // timings
            chargeMs = 950,
            burstGrowMs = 170,
            duration = 4200,
            fadeOutMs = 260,
            // geometry / render
            thickness = 56,
            coreThicknessMult = 0.3,
            auraThicknessMult = 1.55,
            bloomThicknessMult = 2.55,
            sourceAlphaMult = 1,
            // noise / feel
            turbulence = 1.15,
            flicker = 1.15,
            beamJaggedness = 1.0,
            beamSegmentPx = 36,
            // particles
            sparksPerSecond = 260,
            impactSparksPerSecond = 380,
            chargeSparksPerSecond = 420,
            chargeArcsPerSecond = 90,
            // sweep path + bounds
            startSide = null,
            edgeMargin = 90,
            topMargin = 40,
            groundMarginExtra = 10,
            endUpStop = 140,
            endUpBreathingRoom = 140,
            // override
            y = null,
            speed = null,
            // aim modes
            pattern = "sweep",
            fixedEndX = null,
            fixedEndY = null,
            targetPlayer = false,
            // mouth positioning smoothing
            mouthFlipSmoothMs = 50,
            // twin beams (fixed only)
            twinFixed = false,
            twinSeparationPx = null,
            // fixed-beam motion modes
            beamMotionMode = "none",
            followTurnRateRadPerSec = 0.35,
            followDeadzoneRad = 0.003,
            // alternate mode params
            alternateOscMs = 1400,
            alternateCloseFrac = 0.18,
            alternateOpenFrac = 0.18,
            alternateFullCloseIfOffsetBelowRad = 0.035,
            alternateOscAngleRad = 0.11,
            alternateMirrorMidX = null,
            alternateMirrorMidY = null,
        } = {}
    ) {
        super();
        this.game = game;
        this.boss = boss;
        this.isKamehameha = true;
        this._chargeSoundPlayed = false;
        this._attackSoundPlayed = false;
        // timings
        this.chargeMs = chargeMs;
        this.burstGrowMs = burstGrowMs;
        this.duration = duration;
        this.fadeOutMs = fadeOutMs;
        // geometry / render
        this.thickness = thickness;
        this.coreThicknessMult = coreThicknessMult;
        this.auraThicknessMult = auraThicknessMult;
        this.bloomThicknessMult = bloomThicknessMult;
        this.sourceAlphaMult = Number.isFinite(sourceAlphaMult) ? sourceAlphaMult : 1;
        // noise / feel
        this.turbulence = turbulence;
        this.flicker = flicker;
        this.beamJaggedness = beamJaggedness;
        this.beamSegmentPx = beamSegmentPx;
        // particles
        this.sparksPerSecond = sparksPerSecond;
        this.impactSparksPerSecond = impactSparksPerSecond;
        this.chargeSparksPerSecond = chargeSparksPerSecond;
        this.chargeArcsPerSecond = chargeArcsPerSecond;
        // twin beams
        this.twinFixed = !!twinFixed;
        this.twinSeparationPx = Number.isFinite(twinSeparationPx) ? twinSeparationPx : null;
        // sweep / bounds
        this.side = startSide ?? (Math.random() < 0.5 ? "left" : "right");
        this.edgeMargin = edgeMargin;
        this.topMargin = topMargin;
        this.groundMarginExtra = groundMarginExtra;
        this.endUpStop = endUpStop;
        this.endUpBreathingRoom = endUpBreathingRoom;
        // time
        this.elapsed = 0;
        this._seed = Math.random() * 10000;
        // overrides
        this._fixedBeamY = y;
        this._speedOverride = speed;
        this._durationComputed = false;
        // mode
        this.pattern = pattern === "fixed" ? "fixed" : "sweep";

        this._fixedAim = null;
        this._fixedEnd = null;
        if (this.pattern === "fixed") {
            let ax = Number.isFinite(fixedEndX) ? fixedEndX : null;
            let ay = Number.isFinite(fixedEndY) ? fixedEndY : null;

            if ((ax == null || ay == null) && targetPlayer && this.game.player) {
                const p = this.game.player;
                ax = (Number.isFinite(p.x) ? p.x : 0) + (Number.isFinite(p.width) ? p.width : 0) * 0.5;
                ay = (Number.isFinite(p.y) ? p.y : 0) + (Number.isFinite(p.height) ? p.height : 0) * 0.5;
            }
            if (ax != null && ay != null) this._fixedAim = { x: ax, y: ay };
        }

        // mouth
        this.mouthFlipSmoothMs = Math.max(1, mouthFlipSmoothMs);
        this._mouthSide = null;
        this.mouthX = 0;
        this.mouthY = 0;
        // beam end
        this.endX = 0;
        this.endY = 0;
        // aabb for collisions
        this.x = 0;
        this.y = 0;
        this.width = 1;
        this.height = 1;
        this._aabbDebug = null;
        // prevent Enemy auto-removal rules
        this.autoRemoveOnZeroLives = false;
        this.autoRemoveOffTop = false;
        this.lives = 9000;
        // particles containers
        this._sparks = [];
        this._sparkCarry = 0;
        this._impactCarry = 0;
        this._chargeCarry = 0;
        this._arcCarry = 0;
        this._rings = [];
        this._ringCarry = 0;
        // phases
        this._phase = "charge";
        this._phaseStart = 0;
        this._fadeStart = null;
        this._burstTarget = null;
        // fixed-beam motion
        this.beamMotionMode = beamMotionMode === "normal" || beamMotionMode === "alternate" ? beamMotionMode : "none";
        this.followTurnRateRadPerSec = Math.max(0.01, followTurnRateRadPerSec);
        this.followDeadzoneRad = Math.max(0, followDeadzoneRad);
        // alternate motion params
        this.alternateOscMs = Math.max(1, alternateOscMs);
        this.alternateOscAngleRad = Math.max(0, alternateOscAngleRad);
        this.alternateCloseFrac = Math.max(0, Math.min(0.95, alternateCloseFrac));
        this.alternateOpenFrac = Math.max(0, Math.min(0.95, alternateOpenFrac));
        this.alternateFullCloseIfOffsetBelowRad = Math.max(0, alternateFullCloseIfOffsetBelowRad);
        this.alternateMirrorMidX = Number.isFinite(alternateMirrorMidX) ? alternateMirrorMidX : null;
        this.alternateMirrorMidY = Number.isFinite(alternateMirrorMidY) ? alternateMirrorMidY : null;
        // angles
        this._fixedBaseAngle = null;
        this._dynAngle = null;
        this._altAngle = null;
        this._mirrorBaseOffset = null;
    }

    _getTwinHalfSep() {
        const sep = this.twinSeparationPx != null ? this.twinSeparationPx : this.thickness * 0.85;
        return Math.max(2, sep * 0.5);
    }

    _getBeamVariants(mx, my, ex, ey) {
        const useTwin = this.pattern === "fixed" && this.twinFixed;
        if (!useTwin) return [{ mx, my, ex, ey }];

        const dx = ex - mx,
            dy = ey - my;
        const len = Math.max(1, Math.hypot(dx, dy));
        const nx = -dy / len,
            ny = dx / len;

        const off = this._getTwinHalfSep();

        return [
            { mx: mx + nx * off, my: my + ny * off, ex: ex + nx * off, ey: ey + ny * off },
            { mx: mx - nx * off, my: my - ny * off, ex: ex - nx * off, ey: ey - ny * off },
        ];
    }

    _computeMouth(deltaTime = 16) {
        const b = this.boss;

        const bx = Number.isFinite(b.x) ? b.x : 0;
        const by = Number.isFinite(b.y) ? b.y : 0;
        const bw = Number.isFinite(b.width) ? b.width : 0;
        const bh = Number.isFinite(b.height) ? b.height : 0;

        this.mouthY = by + bh * 0.5;

        const invert = !!b.shouldInvert;
        const targetSide = invert ? 1 : -1;

        if (this._mouthSide == null) this._mouthSide = targetSide;

        const k = 1 - Math.exp(-deltaTime / this.mouthFlipSmoothMs);
        this._mouthSide += (targetSide - this._mouthSide) * k;

        const mouthOffset = bw * 0.28;
        this.mouthX = bx + bw * 0.5 + this._mouthSide * mouthOffset;

        if (Number.isFinite(this._fixedBeamY)) this.mouthY = this._fixedBeamY;
    }

    _getPlayerCenter() {
        const p = this.game && this.game.player;
        if (!p) return null;
        const px = (Number.isFinite(p.x) ? p.x : 0) + (Number.isFinite(p.width) ? p.width : 0) * 0.5;
        const py = (Number.isFinite(p.y) ? p.y : 0) + (Number.isFinite(p.height) ? p.height : 0) * 0.5;
        return { x: px, y: py };
    }

    _pointOnSweepPath(t) {
        const W = Number.isFinite(this.game.width) ? this.game.width : 0;
        const H = Number.isFinite(this.game.height) ? this.game.height : 0;
        const gm = Number.isFinite(this.game.groundMargin) ? this.game.groundMargin : 0;

        const G = H - gm - this.groundMarginExtra;

        const leftX = this.edgeMargin;
        const rightX = W - this.edgeMargin;

        const startX = this.side === "left" ? leftX : rightX;
        const otherX = this.side === "left" ? rightX : leftX;

        const targetUpY = Math.max(this.endUpStop, this.topMargin + this.endUpBreathingRoom);

        const L1 = Math.max(1, G - this.topMargin);
        const L2 = Math.max(1, Math.abs(otherX - startX));
        const L3 = Math.max(1, G - targetUpY);

        const total = L1 + L2 + L3;
        let d = t * total;

        if (d <= L1) return { x: startX, y: this.topMargin + d };
        d -= L1;

        if (d <= L2) {
            const u = d / L2;
            return { x: startX + (otherX - startX) * u, y: G };
        }
        d -= L2;

        const y = G - d;
        return { x: otherX, y: Math.max(targetUpY, y) };
    }

    _getBoundsRect() {
        const W = Number.isFinite(this.game.width) ? this.game.width : 0;
        const H = Number.isFinite(this.game.height) ? this.game.height : 0;
        const gm = Number.isFinite(this.game.groundMargin) ? this.game.groundMargin : 0;

        const bottom = H - gm - this.groundMarginExtra;

        return {
            left: this.edgeMargin,
            right: W - this.edgeMargin,
            top: this.topMargin,
            bottom,
        };
    }

    _computeFixedEndFromAim(mx, my) {
        if (!this._fixedAim) return null;

        const bounds = this._getBoundsRect();

        let dx = this._fixedAim.x - mx;
        let dy = this._fixedAim.y - my;

        const len = Math.hypot(dx, dy);
        if (len < 0.001) {
            dx = 1;
            dy = 0;
        } else {
            dx /= len;
            dy /= len;
        }

        return this._computeRayEndToBounds(
            mx,
            my,
            dx,
            dy,
            bounds.left,
            bounds.right,
            bounds.top,
            bounds.bottom,
            this._fixedAim
        );
    }

    _computeRayEndToBounds(mx, my, dx, dy, left, right, top, bottom, fallbackPoint = null) {
        const candidates = [];
        const pushIfValid = (t) => {
            if (!(t > 0)) return;
            const x = mx + dx * t;
            const y = my + dy * t;
            if (x >= left - 0.01 && x <= right + 0.01 && y >= top - 0.01 && y <= bottom + 0.01) {
                candidates.push({ t, x, y });
            }
        };

        if (Math.abs(dx) > 1e-6) {
            pushIfValid((left - mx) / dx);
            pushIfValid((right - mx) / dx);
        }
        if (Math.abs(dy) > 1e-6) {
            pushIfValid((top - my) / dy);
            pushIfValid((bottom - my) / dy);
        }

        if (!candidates.length) {
            if (fallbackPoint) {
                const cx = Math.max(left, Math.min(right, fallbackPoint.x));
                const cy = Math.max(top, Math.min(bottom, fallbackPoint.y));
                return { x: cx, y: cy };
            }
            return { x: mx + dx * 10, y: my + dy * 10 };
        }

        candidates.sort((a, b) => a.t - b.t);
        return { x: candidates[0].x, y: candidates[0].y };
    }

    _wrapAngle(a) {
        while (a > Math.PI) a -= Math.PI * 2;
        while (a < -Math.PI) a += Math.PI * 2;
        return a;
    }

    _pointOnPath(t) {
        if (this.pattern === "fixed" && this._fixedEnd) return { x: this._fixedEnd.x, y: this._fixedEnd.y };
        return this._pointOnSweepPath(t);
    }

    _spawnSpark(x, y, isImpact = false, opts = null) {
        const o = opts || {};
        const ang = o.ang != null ? o.ang : Math.random() * Math.PI * 2;
        const spdBase = isImpact ? 520 : 360;
        const spdJit = isImpact ? 980 : 560;
        const spd = o.spd != null ? o.spd : spdBase + Math.random() * spdJit;

        const vx = Math.cos(ang) * spd + (o.vx || 0);
        const vy = Math.sin(ang) * spd + (o.vy || 0);

        const lifeBase = isImpact ? 300 : 240;
        const lifeJit = isImpact ? 320 : 240;
        const life = o.life != null ? o.life : lifeBase + Math.random() * lifeJit;

        const sizeBase = isImpact ? 2.4 : 1.7;
        const sizeJit = isImpact ? 3.6 : 2.5;
        const size = o.size != null ? o.size : sizeBase + Math.random() * sizeJit;

        this._sparks.push({
            x,
            y,
            vx,
            vy,
            life: 0,
            maxLife: life,
            size,
            alpha: 1,
            kind: o.kind || "spark",
        });
    }

    _spawnRing(x, y, kind = "charge") {
        const maxLife = kind === "impact" ? 260 + Math.random() * 180 : 420 + Math.random() * 260;
        const r0 = kind === "impact" ? this.thickness * 0.5 : this.thickness * 0.8;
        const vr = kind === "impact" ? 820 + Math.random() * 520 : 520 + Math.random() * 420;

        this._rings.push({
            x,
            y,
            r: r0,
            vr,
            life: 0,
            maxLife,
            alpha: 1,
            kind,
        });
    }

    _updateSparks(deltaTime) {
        if (!this._sparks.length) return;
        const dt = deltaTime / 1000;

        for (let i = 0; i < this._sparks.length; i++) {
            const p = this._sparks[i];
            p.life += deltaTime;

            const t = p.life / p.maxLife;
            p.alpha = Math.max(0, 1 - t * 1.25);

            const drag = p.kind === "arc" ? 0.84 : 0.9;
            p.vx *= drag;
            p.vy *= drag;

            const grav = p.kind === "arc" ? -18 : -22;
            p.vy -= grav * dt;

            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }

        this._sparks = this._sparks.filter((p) => p.life < p.maxLife && p.alpha > 0.01);
    }

    _updateRings(deltaTime) {
        if (!this._rings.length) return;
        const dt = deltaTime / 1000;

        for (let i = 0; i < this._rings.length; i++) {
            const r = this._rings[i];
            r.life += deltaTime;

            const t = r.life / r.maxLife;
            r.alpha = Math.max(0, 1 - t);

            r.r += r.vr * dt;
            r.vr *= 0.92;
        }

        this._rings = this._rings.filter((r) => r.life < r.maxLife && r.alpha > 0.01);
    }

    _setAabb(mx, my, ex, ey, pad) {
        const minX = Math.min(mx, ex) - pad;
        const minY = Math.min(my, ey) - pad;
        const maxX = Math.max(mx, ex) + pad;
        const maxY = Math.max(my, ey) + pad;

        this._aabbDebug = {
            x: minX,
            y: minY,
            w: Math.max(1, maxX - minX),
            h: Math.max(1, maxY - minY),
        };

        this.x = minX;
        this.y = minY;
        this.width = this._aabbDebug.w;
        this.height = this._aabbDebug.h;
    }

    _fireBurst(mx, my) {
        this._spawnRing(mx, my, "impact");

        const burstCount = 34;
        for (let i = 0; i < burstCount; i++) {
            const ang = (i / burstCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.22;
            const spd = 420 + Math.random() * 1200;
            this._spawnSpark(mx, my, true, {
                ang,
                spd,
                life: 240 + Math.random() * 260,
                size: 2.3 + Math.random() * 4.2,
                kind: "spark",
            });
        }

        const arcCount = 18;
        for (let i = 0; i < arcCount; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 260 + Math.random() * 520;
            this._spawnSpark(mx, my, false, {
                ang,
                spd,
                life: 160 + Math.random() * 160,
                size: 1.4 + Math.random() * 2.2,
                kind: "arc",
            });
        }

        if (!this._attackSoundPlayed) {
            this._attackSoundPlayed = true;
            this.game.audioHandler.enemySFX.playSound("kamehamehaBeamAttackSound", false, true);
        }

        this.game.startShake(0);
    }

    update(deltaTime) {
        if (!this.boss || this.boss.markedForDeletion) {
            this.game.stopShake();
            this.markedForDeletion = true;
            return;
        }

        this.elapsed += deltaTime;
        this._computeMouth(deltaTime);

        // fixed endpoint setup
        if (this.pattern === "fixed" && !this._fixedEnd) {
            const end = this._computeFixedEndFromAim(this.mouthX, this.mouthY);
            if (end) this._fixedEnd = end;
        }

        // base angle once (fixed only)
        if (this.pattern === "fixed" && this._fixedEnd && this._fixedBaseAngle == null) {
            const dx = this._fixedEnd.x - this.mouthX;
            const dy = this._fixedEnd.y - this.mouthY;
            this._fixedBaseAngle = Math.atan2(dy, dx);
            this._dynAngle = this._fixedBaseAngle;
            this._altAngle = this._fixedBaseAngle;
        }

        // derive duration from speed (sweep only)
        if (this.pattern === "sweep" && this._speedOverride && !this._durationComputed) {
            const W = Number.isFinite(this.game.width) ? this.game.width : 0;
            const H = Number.isFinite(this.game.height) ? this.game.height : 0;
            const gm = Number.isFinite(this.game.groundMargin) ? this.game.groundMargin : 0;
            const G = H - gm - this.groundMarginExtra;

            const targetUpY = Math.max(this.endUpStop, this.topMargin + this.endUpBreathingRoom);

            const L1 = Math.max(1, G - this.topMargin);
            const L2 = Math.max(1, W - this.edgeMargin - this.edgeMargin);
            const L3 = Math.max(1, G - targetUpY);

            const total = L1 + L2 + L3;
            this.duration = (total / this._speedOverride) * 1000;
            this._durationComputed = true;
        }

        const mx = this.mouthX,
            my = this.mouthY;

        // charge
        if (this._phase === "charge") {
            this.endX = mx;
            this.endY = my;

            const dt = deltaTime / 1000;

            if (!this._chargeSoundPlayed) {
                this._chargeSoundPlayed = true;
                this.game.audioHandler.enemySFX.playSound("kamehamehaBeamChargeSound", false, true);
            }

            const chargeT = Math.min(1, this.elapsed / Math.max(1, this.chargeMs));
            this._ringCarry += (0.9 + 1.6 * chargeT) * dt;
            while (this._ringCarry >= 1) {
                this._ringCarry -= 1;
                this._spawnRing(mx + (Math.random() - 0.5) * 10, my + (Math.random() - 0.5) * 10, "charge");
            }

            this._chargeCarry += this.chargeSparksPerSecond * dt;
            while (this._chargeCarry >= 1) {
                this._chargeCarry -= 1;

                const r = this.thickness * 0.35 + Math.random() * (this.thickness * 1.1);
                const a = Math.random() * Math.PI * 2;
                const px = mx + Math.cos(a) * r;
                const py = my + Math.sin(a) * r;

                const tang = a + Math.PI / 2;
                const spd = 260 + Math.random() * 640;
                const vx = Math.cos(tang) * spd + (mx - px) * 6;
                const vy = Math.sin(tang) * spd + (my - py) * 6;

                this._spawnSpark(px, py, false, {
                    vx,
                    vy,
                    spd: 0,
                    life: 180 + Math.random() * 220,
                    size: 1.1 + Math.random() * 2.2,
                    kind: "spark",
                });
            }

            this._arcCarry += this.chargeArcsPerSecond * dt;
            while (this._arcCarry >= 1) {
                this._arcCarry -= 1;

                const a = Math.random() * Math.PI * 2;
                const r = this.thickness * 0.25 + Math.random() * (this.thickness * 0.95);
                const px = mx + Math.cos(a) * r;
                const py = my + Math.sin(a) * r;

                this._spawnSpark(px, py, false, {
                    ang: a + Math.PI,
                    spd: 120 + Math.random() * 420,
                    life: 90 + Math.random() * 140,
                    size: 0.9 + Math.random() * 1.8,
                    kind: "arc",
                });
            }

            this._updateSparks(deltaTime);
            this._updateRings(deltaTime);

            let pad = Math.max(16, this.thickness * 0.9);
            if (this.pattern === "fixed" && this.twinFixed) pad += this._getTwinHalfSep();
            this._setAabb(mx, my, mx, my, pad);

            if (this.elapsed >= this.chargeMs) {
                this._phase = "burst";
                this._phaseStart = this.elapsed;

                this._burstTarget = this._pointOnPath(0);
                this._fireBurst(mx, my);
            }

            return;
        }

        // burst
        if (this._phase === "burst") {
            const t = Math.min(1, (this.elapsed - this._phaseStart) / Math.max(1, this.burstGrowMs));
            const ease = 1 - Math.pow(1 - t, 3);

            const p0 = this._burstTarget || this._pointOnPath(0);

            const ox = p0.x - mx;
            const oy = p0.y - my;
            const overshoot = t < 1 ? 0.1 * Math.sin(t * Math.PI) * (0.6 + 0.4 * this.turbulence) : 0;

            this.endX = mx + ox * ease * (1 + overshoot);
            this.endY = my + oy * ease * (1 + overshoot);

            let pad = Math.max(10, this.thickness * 0.55);
            if (this.pattern === "fixed" && this.twinFixed) pad += this._getTwinHalfSep();
            this._setAabb(mx, my, this.endX, this.endY, pad);

            const dt = deltaTime / 1000;

            const dx = this.endX - mx,
                dy = this.endY - my;
            const segLen = Math.max(1, Math.hypot(dx, dy));
            const nx = -dy / segLen,
                ny = dx / segLen;

            this._sparkCarry += this.sparksPerSecond * 1.35 * dt;
            while (this._sparkCarry >= 1) {
                this._sparkCarry -= 1;
                const u = Math.random() * 0.9;
                const px = mx + dx * u;
                const py = my + dy * u;
                const spread = this.thickness * 0.55 * (0.3 + Math.random());
                this._spawnSpark(px + nx * (Math.random() - 0.5) * spread, py + ny * (Math.random() - 0.5) * spread, false);
            }

            this._updateSparks(deltaTime);
            this._updateRings(deltaTime);

            if (t >= 1) {
                this._phase = "beam";
                this._phaseStart = this.elapsed;
            }

            return;
        }

        // beam
        if (this._phase !== "beam") return;

        // fixed
        if (this.pattern === "fixed" && this._fixedEnd && this._fixedBaseAngle != null) {
            const bounds = this._getBoundsRect();
            const dtSec = deltaTime / 1000;

            // fade logic
            const beginFade = () => {
                if (!this._fadeStart) this._fadeStart = this.elapsed;
                if (this.elapsed - this._fadeStart >= this.fadeOutMs) {
                    this.game.audioHandler.enemySFX.fadeOutAndStop("kamehamehaBeamAttackSound", 100);
                    this.game.stopShake();
                    this.markedForDeletion = true;
                    return true;
                }
                return false;
            };

            if (this.beamMotionMode === "normal") {
                let desiredAngle = this._fixedBaseAngle;
                const pc = this._getPlayerCenter();
                if (pc) desiredAngle = Math.atan2(pc.y - my, pc.x - mx);

                if (this._dynAngle == null) this._dynAngle = this._fixedBaseAngle;

                let diff = this._wrapAngle(desiredAngle - this._dynAngle);
                if (Math.abs(diff) > this.followDeadzoneRad) {
                    const maxStep = this.followTurnRateRadPerSec * dtSec;
                    if (Math.abs(diff) <= maxStep) this._dynAngle = desiredAngle;
                    else this._dynAngle += Math.sign(diff) * maxStep;
                }

                const useAngle = this._dynAngle;
                const dx = Math.cos(useAngle);
                const dy = Math.sin(useAngle);

                const end = this._computeRayEndToBounds(mx, my, dx, dy, bounds.left, bounds.right, bounds.top, bounds.bottom, this._fixedEnd);
                this.endX = end.x;
                this.endY = end.y;

                const heldFor = this.elapsed - this._phaseStart;
                if (heldFor >= this.duration) {
                    if (beginFade()) return;
                }

                let pad = Math.max(10, this.thickness * 0.55);
                if (this.twinFixed) pad += this._getTwinHalfSep();
                this._setAabb(mx, my, this.endX, this.endY, pad);

                const variants = this._getBeamVariants(mx, my, this.endX, this.endY);
                for (const v of variants) {
                    const mx2 = v.mx, my2 = v.my, ex2 = v.ex, ey2 = v.ey;

                    const dx2 = ex2 - mx2, dy2 = ey2 - my2;
                    const segLen = Math.max(1, Math.hypot(dx2, dy2));
                    const nx = -dy2 / segLen, ny = dx2 / segLen;

                    this._sparkCarry += (this.sparksPerSecond / variants.length) * dtSec;
                    while (this._sparkCarry >= 1) {
                        this._sparkCarry -= 1;
                        const u = Math.random() * 0.94;
                        const px = mx2 + dx2 * u;
                        const py = my2 + dy2 * u;
                        const spread = this.thickness * 0.55 * (0.25 + Math.random());
                        this._spawnSpark(px + nx * (Math.random() - 0.5) * spread, py + ny * (Math.random() - 0.5) * spread, false);
                    }

                    this._impactCarry += (this.impactSparksPerSecond / variants.length) * dtSec;
                    while (this._impactCarry >= 1) {
                        this._impactCarry -= 1;
                        const jitter = this.thickness * 0.35;
                        this._spawnSpark(ex2 + (Math.random() - 0.5) * jitter, ey2 + (Math.random() - 0.5) * jitter, true);
                    }

                    if (Math.random() < 0.07 / variants.length) this._spawnRing(ex2, ey2, "impact");
                }

                this._updateSparks(deltaTime);
                this._updateRings(deltaTime);
                return;
            }

            if (this.beamMotionMode === "alternate") {
                const tOsc = (this.elapsed - this._phaseStart) / Math.max(1, this.alternateOscMs);

                // one oscillation then fade
                if (tOsc >= 1) {
                    if (beginFade()) return;
                }

                const wob = tOsc < 1 ? Math.sin(tOsc * Math.PI * 2) : 0;

                let desiredAngle = this._fixedBaseAngle;

                if (this.alternateMirrorMidX != null && this.alternateMirrorMidY != null) {
                    const midAngle = Math.atan2(this.alternateMirrorMidY - my, this.alternateMirrorMidX - mx);

                    if (this._mirrorBaseOffset == null) {
                        this._mirrorBaseOffset = this._wrapAngle(this._fixedBaseAngle - midAngle);
                    }

                    const baseOff = this._mirrorBaseOffset;
                    const baseAbs = Math.abs(baseOff);

                    let closeFrac = this.alternateCloseFrac;
                    const openFrac = this.alternateOpenFrac;

                    if (baseAbs <= this.alternateFullCloseIfOffsetBelowRad) {
                        const tt = baseAbs / Math.max(1e-6, this.alternateFullCloseIfOffsetBelowRad);
                        closeFrac = closeFrac + (1.0 - closeFrac) * (1.0 - tt);
                    }

                    const factor = wob >= 0 ? (1 - wob * closeFrac) : (1 + (-wob) * openFrac);

                    desiredAngle = midAngle + baseOff * factor;
                } else {
                    desiredAngle = this._fixedBaseAngle + wob * this.alternateOscAngleRad;
                }

                if (this._altAngle == null) this._altAngle = this._fixedBaseAngle;

                let diff = this._wrapAngle(desiredAngle - this._altAngle);
                if (Math.abs(diff) > this.followDeadzoneRad) {
                    const maxStep = this.followTurnRateRadPerSec * dtSec;
                    if (Math.abs(diff) <= maxStep) this._altAngle = desiredAngle;
                    else this._altAngle += Math.sign(diff) * maxStep;
                }

                const useAngle = this._altAngle;
                const dx = Math.cos(useAngle);
                const dy = Math.sin(useAngle);

                const end = this._computeRayEndToBounds(mx, my, dx, dy, bounds.left, bounds.right, bounds.top, bounds.bottom, this._fixedEnd);
                this.endX = end.x;
                this.endY = end.y;

                let pad = Math.max(10, this.thickness * 0.55);
                if (this.twinFixed) pad += this._getTwinHalfSep();
                this._setAabb(mx, my, this.endX, this.endY, pad);

                const variants = this._getBeamVariants(mx, my, this.endX, this.endY);
                for (const v of variants) {
                    const mx2 = v.mx, my2 = v.my, ex2 = v.ex, ey2 = v.ey;

                    const dx2 = ex2 - mx2, dy2 = ey2 - my2;
                    const segLen = Math.max(1, Math.hypot(dx2, dy2));
                    const nx = -dy2 / segLen, ny = dx2 / segLen;

                    this._sparkCarry += (this.sparksPerSecond / variants.length) * dtSec;
                    while (this._sparkCarry >= 1) {
                        this._sparkCarry -= 1;
                        const u = Math.random() * 0.94;
                        const px = mx2 + dx2 * u;
                        const py = my2 + dy2 * u;
                        const spread = this.thickness * 0.55 * (0.25 + Math.random());
                        this._spawnSpark(px + nx * (Math.random() - 0.5) * spread, py + ny * (Math.random() - 0.5) * spread, false);
                    }

                    this._impactCarry += (this.impactSparksPerSecond / variants.length) * dtSec;
                    while (this._impactCarry >= 1) {
                        this._impactCarry -= 1;
                        const jitter = this.thickness * 0.35;
                        this._spawnSpark(ex2 + (Math.random() - 0.5) * jitter, ey2 + (Math.random() - 0.5) * jitter, true);
                    }

                    if (Math.random() < 0.07 / variants.length) this._spawnRing(ex2, ey2, "impact");
                }

                this._updateSparks(deltaTime);
                this._updateRings(deltaTime);
                return;
            }

            // fixed, no motion
            this.endX = this._fixedEnd.x;
            this.endY = this._fixedEnd.y;

            const heldFor = this.elapsed - this._phaseStart;
            if (heldFor >= this.duration) {
                if (!this._fadeStart) this._fadeStart = this.elapsed;

                if (this.elapsed - this._fadeStart >= this.fadeOutMs) {
                    this.game.audioHandler.enemySFX.fadeOutAndStop("kamehamehaBeamAttackSound", 100);
                    this.game.stopShake();
                    this.markedForDeletion = true;
                    return;
                }
            }

            let pad = Math.max(10, this.thickness * 0.55);
            if (this.twinFixed) pad += this._getTwinHalfSep();
            this._setAabb(mx, my, this.endX, this.endY, pad);

            const variants = this._getBeamVariants(mx, my, this.endX, this.endY);
            for (const v of variants) {
                const mx2 = v.mx, my2 = v.my, ex2 = v.ex, ey2 = v.ey;

                const dx2 = ex2 - mx2, dy2 = ey2 - my2;
                const segLen = Math.max(1, Math.hypot(dx2, dy2));
                const nx = -dy2 / segLen, ny = dx2 / segLen;

                this._sparkCarry += (this.sparksPerSecond / variants.length) * dtSec;
                while (this._sparkCarry >= 1) {
                    this._sparkCarry -= 1;
                    const u = Math.random() * 0.94;
                    const px = mx2 + dx2 * u;
                    const py = my2 + dy2 * u;
                    const spread = this.thickness * 0.55 * (0.25 + Math.random());
                    this._spawnSpark(px + nx * (Math.random() - 0.5) * spread, py + ny * (Math.random() - 0.5) * spread, false);
                }

                this._impactCarry += (this.impactSparksPerSecond / variants.length) * dtSec;
                while (this._impactCarry >= 1) {
                    this._impactCarry -= 1;
                    const jitter = this.thickness * 0.35;
                    this._spawnSpark(ex2 + (Math.random() - 0.5) * jitter, ey2 + (Math.random() - 0.5) * jitter, true);
                }

                if (Math.random() < 0.07 / variants.length) this._spawnRing(ex2, ey2, "impact");
            }

            this._updateSparks(deltaTime);
            this._updateRings(deltaTime);
            return;
        }

        // sweep beam
        const t = Math.min(1, (this.elapsed - this._phaseStart) / Math.max(1, this.duration));
        const p = this._pointOnSweepPath(t);

        this.endX = p.x;
        this.endY = p.y;

        if (t >= 1) {
            if (!this._fadeStart) this._fadeStart = this.elapsed;

            if (this.elapsed - this._fadeStart >= this.fadeOutMs) {
                this.game.audioHandler.enemySFX.fadeOutAndStop("kamehamehaBeamAttackSound", 100);
                this.game.stopShake();
                this.markedForDeletion = true;
                return;
            }
        }

        const pad = Math.max(10, this.thickness * 0.55);
        this._setAabb(mx, my, this.endX, this.endY, pad);

        const dt2 = deltaTime / 1000;
        const ex = this.endX,
            ey = this.endY;

        const dx = ex - mx,
            dy = ey - my;
        const segLen = Math.max(1, Math.hypot(dx, dy));
        const nx = -dy / segLen,
            ny = dx / segLen;

        this._sparkCarry += this.sparksPerSecond * dt2;
        while (this._sparkCarry >= 1) {
            this._sparkCarry -= 1;
            const u = Math.random() * 0.94;
            const px = mx + dx * u;
            const py = my + dy * u;
            const spread = this.thickness * 0.55 * (0.25 + Math.random());
            this._spawnSpark(px + nx * (Math.random() - 0.5) * spread, py + ny * (Math.random() - 0.5) * spread, false);
        }

        this._impactCarry += this.impactSparksPerSecond * dt2;
        while (this._impactCarry >= 1) {
            this._impactCarry -= 1;
            const jitter = this.thickness * 0.35;
            this._spawnSpark(ex + (Math.random() - 0.5) * jitter, ey + (Math.random() - 0.5) * jitter, true);
        }

        if (Math.random() < 0.07) this._spawnRing(ex, ey, "impact");

        this._updateSparks(deltaTime);
        this._updateRings(deltaTime);
    }

    // telegraph helpers
    _fract(n) {
        return n - Math.floor(n);
    }
    _hash(n) {
        return this._fract(Math.sin(n) * 43758.5453123);
    }

    _buildBoltSegment(mx, my, tx, ty, u0, u1, ampPx, phase) {
        const dx = tx - mx,
            dy = ty - my;
        const len = Math.max(1, Math.hypot(dx, dy));
        const ux = dx / len,
            uy = dy / len;
        const nx = -uy,
            ny = ux;

        const a = Math.max(0, Math.min(1, u0));
        const b = Math.max(0, Math.min(1, u1));
        const s0 = a * len;
        const s1 = b * len;

        const segPx = 16;
        const steps = Math.max(4, Math.min(22, Math.floor(Math.abs(s1 - s0) / segPx)));

        const pts = [];
        const time = this.elapsed * 0.001;

        for (let i = 0; i <= steps; i++) {
            const t = steps === 0 ? 0 : i / steps;
            const s = s0 + (s1 - s0) * t;

            const px = mx + ux * s;
            const py = my + uy * s;

            const w1 = Math.sin(phase + time * 22.0 + t * 18.0);
            const w2 = Math.sin(phase * 0.73 + time * 31.0 + t * 37.0);
            const wob = w1 * 0.65 + w2 * 0.35;

            const mid = 1 - Math.abs(0.5 - t) * 2;
            const off = wob * ampPx * (0.25 + 0.75 * mid);

            pts.push({ x: px + nx * off, y: py + ny * off });
        }

        return pts;
    }

    _strokePolyline(ctx, pts) {
        if (!pts || pts.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
    }

    _drawSparkDisc(ctx, x, y, r, a) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.0);
        g.addColorStop(0, `rgba(255,255,255,${0.85 * a})`);
        g.addColorStop(0.25, `rgba(190,250,255,${0.45 * a})`);
        g.addColorStop(1, `rgba(0,160,255,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 3.0, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawTelegraphThreat(ctx, mx, my, tx, ty, tele, tCharge) {
        const dx = tx - mx,
            dy = ty - my;
        const len = Math.max(1, Math.hypot(dx, dy));
        const ux = dx / len,
            uy = dy / len;
        const nx = -uy,
            ny = ux;

        const time = this.elapsed * 0.001;

        const ramp = Math.pow(Math.min(1, Math.max(0, (tCharge - 0.05) / 0.95)), 1.35);
        const power = tele * (0.7 + 0.7 * ramp);

        // baseline glow
        {
            const g = ctx.createLinearGradient(mx, my, tx, ty);
            g.addColorStop(0.0, `rgba(180,245,255,${0.03 * power})`);
            g.addColorStop(0.55, `rgba(120,220,255,${0.07 * power})`);
            g.addColorStop(1.0, `rgba(255,255,255,${0.09 * power})`);
            ctx.strokeStyle = g;
            ctx.lineWidth = Math.max(8, this.thickness * (0.28 + 0.20 * ramp));
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(tx, ty);
            ctx.stroke();
        }

        // strands
        {
            const strands = 6;
            for (let s = 0; s < strands; s++) {
                const phase = this._seed * 9.7 + s * 123.4;
                const pts = this._buildBoltSegment(
                    mx,
                    my,
                    tx,
                    ty,
                    0.0,
                    1.0,
                    this.thickness * (0.10 + 0.05 * s) * (0.75 + 0.65 * ramp),
                    phase
                );

                ctx.lineWidth = Math.max(2.0, this.thickness * 0.055);
                ctx.strokeStyle = `rgba(170,245,255,${0.18 * power})`;
                this._strokePolyline(ctx, pts);
            }
        }

        // surges
        {
            const surges = 8;
            const speed = 1.7 + 1.2 * this.turbulence;
            const segU = Math.min(0.24, Math.max(0.11, 300 / Math.max(1, len)));

            for (let i = 0; i < surges; i++) {
                const uHead = this._fract(time * speed + i * 0.19 + this._seed * 0.11);
                const u0 = Math.max(0, uHead - segU);
                const u1 = Math.min(1, uHead);

                const amp =
                    this.thickness *
                    (0.16 + 0.26 * ramp) *
                    (0.75 + 0.35 * this._hash(i * 77.7 + Math.floor(time * 10)));

                const phase = this._seed * 50 + i * 777.7;
                const pts = this._buildBoltSegment(mx, my, tx, ty, u0, u1, amp, phase);

                const sHead = u1 * len;
                const hx = mx + ux * sHead;
                const hy = my + uy * sHead;

                const ax = pts[0].x,
                    ay = pts[0].y;
                const bx = pts[pts.length - 1].x,
                    by = pts[pts.length - 1].y;

                const pulse = 0.65 + 0.35 * Math.sin(phase + time * 14.0);
                const aCore = (0.35 + 0.65 * ramp) * power * (0.55 + 0.45 * pulse);

                {
                    const g = ctx.createLinearGradient(ax, ay, bx, by);
                    g.addColorStop(0.0, `rgba(120,220,255,0)`);
                    g.addColorStop(0.55, `rgba(140,235,255,${0.18 * aCore})`);
                    g.addColorStop(1.0, `rgba(255,255,255,${0.45 * aCore})`);
                    ctx.strokeStyle = g;
                    ctx.lineWidth = Math.max(4.0, this.thickness * (0.095 + 0.035 * ramp));
                    this._strokePolyline(ctx, pts);
                }

                {
                    const g = ctx.createLinearGradient(ax, ay, bx, by);
                    g.addColorStop(0.0, `rgba(255,255,255,0)`);
                    g.addColorStop(0.65, `rgba(210,255,255,${0.28 * aCore})`);
                    g.addColorStop(1.0, `rgba(255,255,255,${1.0 * aCore})`);
                    ctx.strokeStyle = g;
                    ctx.lineWidth = Math.max(2.2, this.thickness * (0.050 + 0.020 * ramp));
                    this._strokePolyline(ctx, pts);
                }

                this._drawSparkDisc(ctx, hx, hy, Math.max(2.2, this.thickness * 0.040), 0.95 * aCore);

                const crumbs = 8 + Math.floor(10 * ramp);
                for (let c = 0; c < crumbs; c++) {
                    const rr = this._hash(i * 999 + c * 37 + Math.floor(time * 18));
                    const uu = u0 + (u1 - u0) * rr;
                    const ss = uu * len;

                    const baseX = mx + ux * ss;
                    const baseY = my + uy * ss;

                    const side =
                        (this._hash(rr * 1000 + c * 13.1) - 0.5) *
                        this.thickness *
                        (0.45 + 0.75 * ramp);
                    const fore = (this._hash(rr * 2000 + c * 9.2) - 0.5) * 22;

                    const px = baseX + nx * side + ux * fore;
                    const py = baseY + ny * side + uy * fore;

                    const a = aCore * (0.20 + 0.35 * this._hash(c * 7.7 + i * 1.3));
                    const r =
                        Math.max(1.2, this.thickness * 0.014) *
                        (1.0 + 1.8 * this._hash(c * 44.4 + i * 2.2));

                    this._drawSparkDisc(ctx, px, py, r, a);
                }
            }
        }

        // impact crackle at target
        {
            const jitter = this.thickness * (0.40 + 0.55 * ramp);
            const crack = 0.42 * power * (0.35 + 0.65 * ramp);

            for (let k = 0; k < 5; k++) {
                const ang = (k / 5) * Math.PI * 2 + Math.sin(this._seed + time * 6) * 0.2;
                const r0 = jitter * (0.35 + 0.25 * this._hash(k * 9.1));
                const r1 = jitter * (1.05 + 0.45 * this._hash(k * 19.7));

                const ax = tx + Math.cos(ang) * r0;
                const ay = ty + Math.sin(ang) * r0;
                const bx = tx + Math.cos(ang) * r1;
                const by = ty + Math.sin(ang) * r1;

                ctx.lineWidth = Math.max(2.2, this.thickness * 0.042);
                ctx.strokeStyle = `rgba(255,255,255,${crack})`;
                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(bx, by);
                ctx.stroke();
            }

            this._drawSparkDisc(ctx, tx, ty, Math.max(3.6, this.thickness * 0.060), 1.0 * crack);
        }
    }

    _buildBeamPolyline(mx, my, ex, ey, intensity) {
        const dx = ex - mx,
            dy = ey - my;
        const len = Math.max(1, Math.hypot(dx, dy));

        const seg = Math.max(16, Math.min(64, Math.floor(len / Math.max(14, this.beamSegmentPx))));
        const nx = -dy / len,
            ny = dx / len;

        const pts = [];
        const time = this.elapsed;

        const ampBase =
            this.thickness *
            0.28 *
            (0.35 + 0.65 * this.turbulence) *
            (0.55 + 0.45 * this.beamJaggedness);

        for (let i = 0; i <= seg; i++) {
            const t = i / seg;

            const px = mx + dx * t;
            const py = my + dy * t;

            const w1 = Math.sin(this._seed * 0.7 + time * 0.02 + t * 10.5);
            const w2 = Math.sin(this._seed * 1.3 + time * 0.028 + t * 17.0);
            const w3 = Math.sin(this._seed * 2.1 + time * 0.016 + t * 6.0);

            const midBoost = 1 - Math.abs(0.5 - t) * 2;
            const amp = ampBase * (0.35 + 0.65 * midBoost) * (0.6 + 0.4 * intensity);

            const off = (w1 * 0.55 + w2 * 0.3 + w3 * 0.15) * amp;

            pts.push({ x: px + nx * off, y: py + ny * off });
        }

        return pts;
    }

    draw(ctx) {
        if (this.markedForDeletion) return;

        const mx = this.mouthX,
            my = this.mouthY;
        const ex = this.endX,
            ey = this.endY;
        if (![mx, my, ex, ey].every(Number.isFinite)) return;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        let fade = 1;
        if (this._fadeStart) {
            const t = (this.elapsed - this._fadeStart) / Math.max(1, this.fadeOutMs);
            fade = Math.max(0, 1 - t);
        }

        const flick = 0.82 + 0.18 * Math.sin((this._seed + this.elapsed) * 0.034 * (0.7 + this.flicker));

        const phaseBoost =
            this._phase === "charge"
                ? 0.25 + 0.75 * Math.min(1, this.elapsed / Math.max(1, this.chargeMs))
                : this._phase === "burst"
                    ? 1.15
                    : 1;

        const intensity = fade * flick * phaseBoost;

        // charge
        if (this._phase === "charge") {
            const t = Math.min(1, this.elapsed / Math.max(1, this.chargeMs));
            const pulse = 0.5 + 0.5 * Math.sin((this._seed + this.elapsed) * 0.025);
            const grow = (0.65 + 0.55 * t) * (0.82 + 0.18 * pulse);

            const rCore = this.thickness * (1.05 * grow);
            const rAura = this.thickness * (2.35 * grow);
            const rBloom = this.thickness * (3.65 * grow);

            // bloom
            {
                const g = ctx.createRadialGradient(mx, my, 0, mx, my, rBloom);
                g.addColorStop(0.0, `rgba(255,255,255,${0.22 * intensity})`);
                g.addColorStop(0.18, `rgba(160,240,255,${0.20 * intensity})`);
                g.addColorStop(0.45, `rgba(40,170,255,${0.16 * intensity})`);
                g.addColorStop(1.0, `rgba(0,120,255,0)`);
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(mx, my, rBloom, 0, Math.PI * 2);
                ctx.fill();
            }
            // aura
            {
                const g = ctx.createRadialGradient(mx, my, 0, mx, my, rAura);
                g.addColorStop(0.0, `rgba(255,255,255,${0.38 * intensity})`);
                g.addColorStop(0.22, `rgba(180,245,255,${0.30 * intensity})`);
                g.addColorStop(0.55, `rgba(40,170,255,${0.24 * intensity})`);
                g.addColorStop(1.0, `rgba(0,120,255,0)`);
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(mx, my, rAura, 0, Math.PI * 2);
                ctx.fill();
            }
            // core
            {
                const g = ctx.createRadialGradient(mx, my, 0, mx, my, rCore);
                g.addColorStop(0.0, `rgba(255,255,255,${0.98 * intensity})`);
                g.addColorStop(0.35, `rgba(220,252,255,${0.78 * intensity})`);
                g.addColorStop(0.75, `rgba(120,220,255,${0.55 * intensity})`);
                g.addColorStop(1.0, `rgba(0,140,255,0)`);
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(mx, my, rCore, 0, Math.PI * 2);
                ctx.fill();
            }
            // rings
            for (let i = 0; i < this._rings.length; i++) {
                const r = this._rings[i];
                if (r.kind !== "charge") continue;

                const a = r.alpha * intensity;
                if (a <= 0.01) continue;

                ctx.lineWidth = Math.max(2, this.thickness * 0.1);

                const ringG = ctx.createRadialGradient(r.x, r.y, Math.max(0, r.r * 0.6), r.x, r.y, r.r);
                ringG.addColorStop(0.0, `rgba(255,255,255,0)`);
                ringG.addColorStop(0.7, `rgba(180,245,255,${0.16 * a})`);
                ringG.addColorStop(1.0, `rgba(0,140,255,0)`);
                ctx.strokeStyle = ringG;

                ctx.beginPath();
                ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
                ctx.stroke();
            }
            // sparks
            for (let i = 0; i < this._sparks.length; i++) {
                const p = this._sparks[i];
                const a = p.alpha * intensity;
                if (a <= 0.01) continue;

                const rr = p.size;
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr * 2.4);

                if (p.kind === "arc") {
                    grad.addColorStop(0, `rgba(255,255,255,${0.65 * a})`);
                    grad.addColorStop(0.25, `rgba(190,250,255,${0.42 * a})`);
                    grad.addColorStop(1, `rgba(0,160,255,0)`);
                } else {
                    grad.addColorStop(0, `rgba(255,255,255,${0.85 * a})`);
                    grad.addColorStop(0.3, `rgba(160,240,255,${0.55 * a})`);
                    grad.addColorStop(1, `rgba(0,140,255,0)`);
                }

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, rr * 2.4, 0, Math.PI * 2);
                ctx.fill();
            }
            // telegraph
            {
                const p0 = this._pointOnPath(0);
                const tele = intensity * (t * t);
                if (tele > 0.02) {
                    const variants = this._getBeamVariants(mx, my, p0.x, p0.y);
                    for (const v of variants) {
                        this._drawTelegraphThreat(ctx, v.mx, v.my, v.ex, v.ey, tele, t);
                    }
                }
            }

            if (this.game.debug) {
                ctx.globalCompositeOperation = "source-over";
                if (this._aabbDebug) {
                    ctx.strokeStyle = "rgba(0,255,255,0.6)";
                    ctx.strokeRect(this._aabbDebug.x, this._aabbDebug.y, this._aabbDebug.w, this._aabbDebug.h);
                }
            }

            ctx.restore();
            return;
        }

        // beam/burst/fade
        const beamLen = Math.max(1, Math.hypot(ex - mx, ey - my));
        const sourceAtten = Math.min(1, beamLen / (this.thickness * 6));

        const auraW = this.thickness * this.auraThicknessMult;
        const bloomW = this.thickness * this.bloomThicknessMult;
        const coreW = Math.max(3, this.thickness * this.coreThicknessMult);

        const variants = this._getBeamVariants(mx, my, ex, ey);

        const variantNorm = 1 / Math.max(1, variants.length);

        const mouthIntensity =
            intensity *
            (0.25 + 0.75 * sourceAtten) *
            (this.sourceAlphaMult ?? 1) *
            variantNorm;

        for (const v of variants) {
            const mx2 = v.mx,
                my2 = v.my,
                ex2 = v.ex,
                ey2 = v.ey;

            const pts = this._buildBeamPolyline(mx2, my2, ex2, ey2, intensity);

            // bloom
            {
                const g = ctx.createLinearGradient(mx2, my2, ex2, ey2);
                g.addColorStop(0.0, `rgba(255,255,255,${0.10 * mouthIntensity})`);
                g.addColorStop(0.12, `rgba(150,235,255,${0.30 * intensity})`);
                g.addColorStop(0.55, `rgba(40,170,255,${0.26 * intensity})`);
                g.addColorStop(1.0, `rgba(0,120,255,${0.10 * intensity})`);
                ctx.strokeStyle = g;
                ctx.lineWidth = bloomW;
                this._strokePolyline(ctx, pts);
            }
            // aura
            {
                const g = ctx.createLinearGradient(mx2, my2, ex2, ey2);
                g.addColorStop(0.0, `rgba(255,255,255,${0.16 * mouthIntensity})`);
                g.addColorStop(0.18, `rgba(140,225,255,${0.48 * intensity})`);
                g.addColorStop(0.62, `rgba(20,155,255,${0.38 * intensity})`);
                g.addColorStop(1.0, `rgba(0,110,255,${0.20 * intensity})`);
                ctx.strokeStyle = g;
                ctx.lineWidth = auraW;
                this._strokePolyline(ctx, pts);
            }
            // strands
            {
                const strands = 7;
                for (let s = 0; s < strands; s++) {
                    const phase = this._seed + s * 199.9;

                    ctx.strokeStyle = `rgba(200,250,255,${0.11 * intensity})`;
                    ctx.lineWidth = Math.max(1.5, this.thickness * 0.08);

                    const strandPts = [];
                    for (let i = 0; i < pts.length; i++) {
                        const t = i / Math.max(1, pts.length - 1);

                        const p = pts[i];
                        const pPrev = pts[Math.max(0, i - 1)];
                        const pNext = pts[Math.min(pts.length - 1, i + 1)];

                        const dx = pNext.x - pPrev.x;
                        const dy = pNext.y - pPrev.y;
                        const L = Math.max(1, Math.hypot(dx, dy));
                        const nx = -dy / L,
                            ny = dx / L;

                        const w =
                            Math.sin(phase + this.elapsed * 0.03 + t * (10 + s * 0.8)) *
                            Math.sin(phase * 0.7 + this.elapsed * 0.02 + t * (6 + s * 0.6));

                        const midBoost = 1 - Math.abs(0.5 - t) * 2;
                        const amp =
                            this.thickness *
                            0.26 *
                            (0.25 + 0.75 * midBoost) *
                            (0.35 + 0.65 * this.turbulence);

                        const off = w * amp * (0.28 + 0.18 * s);
                        strandPts.push({ x: p.x + nx * off, y: p.y + ny * off });
                    }

                    this._strokePolyline(ctx, strandPts);
                }
            }
            // core
            {
                const g = ctx.createLinearGradient(mx2, my2, ex2, ey2);
                g.addColorStop(0.0, `rgba(255,255,255,${0.35 * mouthIntensity})`);
                g.addColorStop(0.20, `rgba(255,255,255,${0.98 * intensity})`);
                g.addColorStop(0.55, `rgba(215,250,255,${0.92 * intensity})`);
                g.addColorStop(0.80, `rgba(120,220,255,${0.78 * intensity})`);
                g.addColorStop(1.0, `rgba(255,255,255,${0.62 * intensity})`);
                ctx.strokeStyle = g;
                ctx.lineWidth = coreW;
                this._strokePolyline(ctx, pts);
            }
            // mouth flare
            {
                const pulse = 0.65 + 0.35 * Math.sin((this._seed + this.elapsed) * 0.03);

                const r1 = this.thickness * (1.05 + 0.18 * pulse);
                const flare = ctx.createRadialGradient(mx2, my2, 0, mx2, my2, r1 * 2.2);

                flare.addColorStop(0, `rgba(255,255,255,${0.45 * mouthIntensity})`);
                flare.addColorStop(0.18, `rgba(190,248,255,${0.32 * mouthIntensity})`);
                flare.addColorStop(0.52, `rgba(40,170,255,${0.22 * mouthIntensity})`);
                flare.addColorStop(1, `rgba(0,140,255,0)`);

                ctx.fillStyle = flare;
                ctx.beginPath();
                ctx.arc(mx2, my2, r1 * 2.2, 0, Math.PI * 2);
                ctx.fill();
            }
            // impact flare
            {
                const r2 = this.thickness * 1.25;
                const impact = ctx.createRadialGradient(ex2, ey2, 0, ex2, ey2, r2 * 4.2);
                impact.addColorStop(0, `rgba(255,255,255,${0.90 * intensity})`);
                impact.addColorStop(0.14, `rgba(190,250,255,${0.68 * intensity})`);
                impact.addColorStop(0.36, `rgba(70,210,255,${0.52 * intensity})`);
                impact.addColorStop(1.0, `rgba(0,120,255,0)`);
                ctx.fillStyle = impact;
                ctx.beginPath();
                ctx.arc(ex2, ey2, r2 * 4.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        // impact rings
        for (let i = 0; i < this._rings.length; i++) {
            const r = this._rings[i];
            if (r.kind !== "impact") continue;

            const a = r.alpha * intensity;
            if (a <= 0.01) continue;

            ctx.lineWidth = Math.max(2, this.thickness * 0.12);
            const ringG = ctx.createRadialGradient(r.x, r.y, Math.max(0, r.r * 0.5), r.x, r.y, r.r);
            ringG.addColorStop(0.0, `rgba(255,255,255,0)`);
            ringG.addColorStop(0.72, `rgba(200,250,255,${0.18 * a})`);
            ringG.addColorStop(1.0, `rgba(0,140,255,0)`);
            ctx.strokeStyle = ringG;

            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
            ctx.stroke();
        }
        // sparks
        for (let i = 0; i < this._sparks.length; i++) {
            const p = this._sparks[i];
            const a = p.alpha * intensity;
            if (a <= 0.01) continue;

            const rr = p.size;
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr * 2.25);
            grad.addColorStop(0, `rgba(255,255,255,${0.85 * a})`);
            grad.addColorStop(0.3, `rgba(160,240,255,${0.55 * a})`);
            grad.addColorStop(1, `rgba(0,140,255,0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, rr * 2.25, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.game.debug) {
            ctx.globalCompositeOperation = "source-over";
            if (this._aabbDebug) {
                ctx.strokeStyle = "rgba(0,255,255,0.6)";
                ctx.strokeRect(this._aabbDebug.x, this._aabbDebug.y, this._aabbDebug.w, this._aabbDebug.h);
            }
        }

        ctx.restore();
    }
}

export class NTharax extends EnemyBoss {
    constructor(game) {
        super(game, 193.5, 240, 5, "ntharaxIdle");
        this.maxLives = 100;
        this.overhealPercent = 0.20;
        this.lives = this.maxLives;
        this._defeatTriggered = false;

        // idle
        this.state = "idle";
        this.previousState = null;
        this.shouldInvert = false;
        this.isInTheMiddle = false;
        this.originalY = this.y;

        this.burrowStarted = false;
        this.burrowPhase = "idle";
        this.burrowTimer = 0;

        this.burrow = {
            downMs: 550,
            undergroundMs: 750,
            upMs: 550,
            sinkPx: this.height + 25,
            relocate: true,
            minX: 40,
            maxXMargin: 40,
        };
        this.burrowPendingX = null;

        const fpsToInterval = (fps) => (fps > 0 ? 1000 / fps : Infinity);

        this._base = {
            runStep: 10,

            flySpeed: 520,
            jumpDuration: 0.7,
            diveDuration: 0.5,

            windSpawnInterval: 50,
            windFadeDuration: 350,

            fps: {
                idle: 10,
                run: 14,
                fly: 15,
                distortion: 10,
                ball: 10,
                wing: 10,
                kneel: 10,
                yellow: 10,
                asteroid: 10,
                black: 10,
                purple: 10,
                slap: 10,
                tentacle: 10,
                healing: 8,
                dive: 0,
                laser: 10,
            },
        };

        this.setFps(this._base.fps.idle);

        // mode 2
        this.mode2 = false;
        this.mode2Triggered = false;
        this.mode2Pending = false;
        this.mode2Threshold = 0.5;
        this.isTransforming = false;
        this.transformPhase = "idle";
        this.transformTimer = 0;
        this._transformFpsBoosted = false;
        this.transformParticles = [];
        this.transformExplodeParticles = [];
        this.transformBall = { radius: 0, targetRadius: 0, alpha: 0 };
        this.transformFX = {
            gatherDuration: 2600,
            holdDuration: 1100,
            explodeDuration: 900,
            gatherCount: 220,
            explodeCount: 260,
            gatherRingMin: 260,
            gatherRingMax: 420,
            pullStrength: 38.0,
            swirlStrength: 22.0,
            damping: 0.90,
            absorbRadiusFrac: 0.18,
            explodeSpeedMin: 600,
            explodeSpeedMax: 1650,
            shakeOnStartMs: 150,
            shakeOnExplodeMs: 450,
        };
        this.transformBallVisual = {
            inner: "rgba(255,255,255,1)",
            mid: "rgba(255,255,255,0.85)",
            glow: "rgba(255,255,255,0.0)",
        };
        this.explodePush = { active: false, t: 0 };
        this._explodePushTriggered = false;

        // multipliers
        this.mode2FpsMult = 1.5;
        this.mode2SpeedMult = 1.3;
        this.mode2JumpMult = 1.3;
        this.mode2RunToMiddle = false;
        this.mode2MiddleTargetX = 0;
        this.mode2Visual = {
            hueDeg: 35,
            saturate: 1.35,
            brightness: 1.12,
            glowColor: "rgba(210,120,255,0.85)",
            glowBlur: 14,
        };
        this.transformVisual = {
            hueStart: 0,
            hueEnd: 55,
            satStart: 1.0,
            satEnd: 1.5,
            briStart: 1.0,
            briEnd: 1.15,
            glowColor: "rgba(255,255,255,0.95)",
            glowBlurStart: 6,
            glowBlurEnd: 22,
        };

        // barrier
        this.healingBarrier = null;
        this.isHealingBarrierActive = false;
        this.isBarrierActive = false;
        this.healingBarrierCooldown = 30000;
        this.healingBarrierNormalDuration = 10000;
        this.healingBarrierMode2Duration = 15000;
        this.healingBarrierCooldownTimer = 0;
        this.healingBarrierActiveTimer = 0;

        // run
        this.runAnimation = new EnemyBoss(game, 209.2857142857143, 240, 5, "ntharaxRun");
        this.runAnimation.frameX = 0;
        this.runAnimation.setFps(this._base.fps.run);

        this.runningDirection = 0;
        this.runStateCounter = 0;
        this.runStateCounterLimit = 5;
        this.runStopAtTheMiddle = false;
        this._runSfxPlaying = false;
        this._wasRunningLastFrame = false;

        // jump
        this.jumpAnimation = new EnemyBoss(game, 190, 280, 1, "ntharaxJump");
        this.jumpAnimation.frameX = 0;

        this.jumpHeight = 300;
        this.jumpDuration = this._base.jumpDuration;
        this.jumpStartTime = 0;
        this.canJumpAttack = true;
        this.jumpedBeforeDistanceLogic = false;
        this.isDiveJump = false;
        this.jumpPhase = null;
        this.jumpAscendDuration = 600;
        this.offscreenWaitDuration = 1500;
        this.offscreenTimer = 0;

        this.jumpStartX = this.x;
        this.jumpTargetX = this.x;

        this.jumpHorizontalSpeed = 260;
        this.jumpMinDurationMs = 950;
        this.jumpMaxDurationMs = 1750;
        this.jumpNormalDurationMs = 0;

        // dive
        this.diveAnimation = new EnemyBoss(game, 142, 240, 0, "ntharaxDive");
        this.diveAnimation.frameX = 0;
        this.diveAnimation.setFps(this._base.fps.dive);

        this.isDiving = false;
        this.diveStartTime = this.game.hiddenTime;
        this.diveDuration = this._base.diveDuration;
        this.diveTargetX = 0;
        this.diveStartY = 0;
        this.diveTargetY = this.originalY;
        this.diveImpactSpawned = false;
        this.diveImpactParticles = [];

        // fly
        this.flyAnimation = new EnemyBoss(game, 204, 240, 11, "ntharaxFly");
        this.flyAnimation.frameX = 0;
        this.flyAnimation.setFps(this._base.fps.fly);

        this.flyStarted = false;
        this.flyPhase = "idle";
        this.flyTargetX = 0;
        this.flyTargetY = 0;
        this.flySpeed = this._base.flySpeed;
        this.flyDescendTargetX = 0;
        this.flyLockedInvert = false;
        this._flyPrevFrameX = null;
        this._flyFlapPlayed2 = false;
        this._flyFlapPlayed7 = false;

        this.kamehameha = null;
        this.kamehameha2 = null;
        this.kameDirection = "right";
        this.kameHoldTimer = 0;
        this.kameHoldDuration = 650;

        this.flyStateCounter = 0;
        this.flyStateThreshold = Math.floor(Math.random() * 6) + 15; // 15 to 20

        // ball
        this.ballAnimation = new EnemyBoss(game, 189, 240, 6, "ntharaxBall");
        this.ballAnimation.frameX = 0;

        this.ballStarted = false;
        this.ballFrameTimer = 0;
        this.ballFrameInterval = fpsToInterval(this._base.fps.ball);
        this.ballPhase = "idle";
        this.ballAttack = null;
        this.BALL_HOLD_FRAME = 5;
        this.BALL_SHOT_FRAME = 6;

        // wing
        this.wingAnimation = new EnemyBoss(game, 190.25, 240, 3, "ntharaxWing");
        this.wingAnimation.frameX = 0;

        this.wingStarted = false;
        this.wingDirection = 1;
        this.wingCycleCount = 0;
        this.wingFrameTimer = 0;
        this.wingFrameInterval = fpsToInterval(this._base.fps.wing);

        this.wingWindActive = false;
        this.wingWindDirection = 0;
        this.secondWingFlapPushTriggered = false;

        this.windParticles = [];
        this.windSpawnTimer = 0;
        this.windSpawnInterval = this._base.windSpawnInterval;
        this.windEffectAlpha = 0;
        this.windFadeDuration = this._base.windFadeDuration;

        this._windGustStarted = false;
        this._windGustFading = false;

        // kneel
        this.kneelAnimation = new EnemyBoss(game, 242.2, 240, 6, "ntharaxKneel");
        this.kneelAnimation.frameX = 0;

        this.kneelStarted = false;
        this.kneelFrameTimer = 0;
        this.kneelFrameInterval = fpsToInterval(this._base.fps.kneel);

        this.kneelSpikeAttackInitialized = false;
        this.kneelSpikes = [];
        this.kneelPhase = "toMax";
        this._kneelHoldToggle = 0;

        // yellow
        this.yellowAnimation = new EnemyBoss(game, 196.6666666666667, 240, 11, "ntharaxYellow");
        this.yellowAnimation.frameX = 0;

        this.yellowStarted = false;
        this.yellowDirection = 1;
        this.yellowFrameTimer = 0;
        this.yellowFrameInterval = fpsToInterval(this._base.fps.yellow);
        this.yellowOrb = null;

        // asteroid
        this.asteroidAnimation = new EnemyBoss(game, 192.9, 240, 10, "ntharaxAsteroid");
        this.asteroidAnimation.frameX = 0;

        this.asteroidStarted = false;
        this.asteroidDirection = 1;
        this.asteroidFrameTimer = 0;
        this.asteroidFrameInterval = fpsToInterval(this._base.fps.asteroid);

        // black
        this.blackAnimation = new EnemyBoss(game, 196.6666666666667, 240, 11, "ntharaxBlack");
        this.blackAnimation.frameX = 0;

        this.blackStarted = false;
        this.blackDirection = 1;
        this.blackFrameTimer = 0;
        this.blackFrameInterval = fpsToInterval(this._base.fps.black);
        this.blackOrb = null;

        // purple
        this.purpleAnimation = new EnemyBoss(game, 196.6666666666667, 240, 11, "ntharaxPurple");
        this.purpleAnimation.frameX = 0;

        this.purpleStarted = false;
        this.purpleFrameTimer = 0;
        this.purpleFrameInterval = fpsToInterval(this._base.fps.purple);
        this.purpleOrb = null;

        // distortion
        this.ntharaxDistortionAnimation = new EnemyBoss(game, 196.6666666666667, 240, 11, "ntharaxDistortion");
        this.ntharaxDistortionAnimation.frameX = 0;
        this.ntharaxDistortionAnimation.setFps(this._base.fps.distortion);

        this.distortionEffectTimer = 0;
        this.distortionNormalDuration = 10000;
        this.distortionMode2Duration = 15000;

        // slap
        this.slapAnimation = new EnemyBoss(game, 204.1428571428571, 230, 6, "ntharaxSlap");
        this.slapAnimation.frameX = 0;
        this.slapStarted = false;
        this.slapReachedEnd = false;
        this.slapGoingBack = false;
        this.slapFrameTimer = 0;
        this.slapFrameInterval = fpsToInterval(this._base.fps.slap);
        this.slapHitsDone = 0;
        this.slapHitsTargetNormal = 5;
        this.slapHitsTargetMode2 = 7;
        this.slapWobbleToggle = 0;
        this.slapShockwave = {
            countPerSide: 1,
            countPerSideMode2: 1,
            speed: 950,
            speedMode2: 1200,
            maxLifeMs: 1250,
            maxLifeMsMode2: 1750,
            offscreenMargin: 250,
            offscreenMarginMode2: 520,
            startRadius: 10,
            endRadius: 120,
            thickness: 10,
            hitWidth: 90,
            hitHeight: 1,
            spacing: 24,
        };

        // laser
        this.laserAnimation = new EnemyBoss(game, 237.8, 245, 4, "ntharaxLaser");
        this.laserAnimation.frameX = 0;

        this.laserStarted = false;
        this.laserDir = 1;
        this.laserFrameTimer = 0;
        this.laserFrameInterval = fpsToInterval(this._base.fps.laser);

        // tentacle
        this.tentacleAnimation = new EnemyBoss(game, 211.2857142857143, 255, 6, "ntharaxTentacle");
        this.tentacleAnimation.frameX = 0;

        this.tentacleStarted = false;
        this.tentacleReachedEnd = false;
        this.tentacleGoingBack = false;
        this.tentacleFrameTimer = 0;
        this.tentacleFrameInterval = fpsToInterval(this._base.fps.tentacle);

        this.undergroundTentaclesSpawned = false;
        this.undergroundTentacleCount = 2;
        this.undergroundTentacles = [];
        this.undergroundRumbleStarted = false;

        // healing
        this.healingAnimation = new EnemyBoss(game, 211.25, 255, 11, "ntharaxHealing");
        this.healingAnimation.frameX = 0;

        this.healingStarted = false;

        this.healingPhase = "idle";
        this.healingBurstsDone = 0;
        this.healingBurstTarget = 0;

        this.healingFrameTimer = 0;
        this.healingFrameInterval = fpsToInterval(this._base.fps.healing);

        this.healingMaxHoldTimer = 0;
        this.healingMaxHoldDuration = 50;

        this.healingLoopStartFrame = 7;
        this.healingRewindStartFrame = 6;

        this.healingStarBursts = [];

        this.healStateCounter = 0;
        this.healStateCounterLimit = Math.floor(12 + Math.random() * 4); // 12 to 15

        // anchors
        this.stateAnchors = {
            idle: { x: 193.5 / 2, y: 240 },
            run: { x: 209.2857142857143 / 2, y: 240 },
            jump: { x: 196.5 / 2, y: 290 },
            dive: { x: 142 / 2, y: 240 },
            ball: { x: 189 / 2, y: 240 },
            wing: { x: 190.25 / 2, y: 240 },
            purple: { x: 196.6666666666667 / 2, y: 240 },
            yellow: { x: 196.6666666666667 / 2, y: 240 },
            black: { x: 196.6666666666667 / 2, y: 240 },
            asteroid: { x: 192.9 / 2, y: 240 + 2 },
            slap: { x: 204.1428571428571 / 2 + 3, y: 230 },
            tentacle: { x: 211.2857142857143 / 2 + 10, y: 255 - 13 },
            healing: { x: 211.25 / 2 + 10, y: 255 - 13 },
            distortion: { x: 196.6666666666667 / 2, y: 240 },
            kneel: { x: 242.2 / 2 + 10, y: 240 },
            fly: { x: 204 / 2, y: 240 },
            laser: { x: 237.8 / 2 + 20, y: 245 },
            transform: { x: 193.5 / 2, y: 240 },
        };

        this.applyMode2Tuning();
    }

    get mode2Active() {
        return !!this.mode2;
    }

    queueMode2IfThresholdCrossed() {
        if (this.mode2Triggered || this.mode2Pending || this.mode2) return;
        const thresholdLives = this.maxLives * this.mode2Threshold;
        if (this.lives <= thresholdLives) this.mode2Pending = true;
    }

    clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    rand(min, max) { return min + Math.random() * (max - min); }

    easeInOutCubic(t) {
        t = this.clamp(t, 0, 1);
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    easeOutCubic(t) {
        t = this.clamp(t, 0, 1);
        return 1 - Math.pow(1 - t, 3);
    }

    getBossCenter() {
        return {
            x: this.x + this.width * 0.5,
            y: this.y + this.height * 0.52,
        };
    }

    getMiddleTargetX() {
        return this.game.width / 2 - this.width / 2;
    }

    startMode2RunToMiddle() {
        this.mode2RunToMiddle = true;
        this.mode2MiddleTargetX = this.getMiddleTargetX();

        this.state = "run";
        this.startRunSFX();
        const step = this.getRunStep();
        this.runningDirection = (this.mode2MiddleTargetX >= this.x) ? step : -step;

        this.runAnimation.x = this.x;
        this.runAnimation.y = this.y;
        this.runAnimation.frameX = 0;

        this.runStopAtTheMiddle = false;
    }

    initTransformFX() {
        const c = this.getBossCenter();
        const fx = this.transformFX;

        this.transformParticles.length = 0;
        this.transformExplodeParticles.length = 0;

        const diag = Math.hypot(this.width, this.height);
        this.transformBall.radius = 0;

        this.transformBall.targetRadius = diag * 0.75;
        this.transformBall.alpha = 0;

        for (let i = 0; i < fx.gatherCount; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = this.rand(fx.gatherRingMin, fx.gatherRingMax);
            const jitter = this.rand(-18, 18);

            const px = c.x + Math.cos(a) * r + jitter;
            const py = c.y + Math.sin(a) * r + jitter;

            this.transformParticles.push({
                x: px,
                y: py,
                vx: 0,
                vy: 0,
                a,
                spin: this.rand(0.8, 1.35) * (Math.random() < 0.5 ? -1 : 1),
                size: this.rand(1.2, 3.2),
                alpha: this.rand(0.35, 0.95),
                absorbed: false,
            });
        }
    }

    getMode2ThresholdLives() {
        return this.maxLives * this.mode2Threshold;
    }

    startMode2Transform() {
        if (this.mode2Triggered || this.mode2) return;
        if (!this.mode2Pending) return;
        if (this.isTransforming) return;

        const thresholdLives = this.getMode2ThresholdLives();
        if (this.lives > thresholdLives) {
            this.mode2Pending = false;
            return;
        }

        if (this.isBarrierActive && this.healingBarrier) {
            this.healingBarrierActiveTimer = this.healingBarrierNormalDuration;
        }

        this.isTransforming = true;
        this.transformPhase = "gather";
        this.transformTimer = 0;
        this._transformFpsBoosted = false;

        this.initTransformFX();

        this.state = "transform";
        this._explodePushTriggered = false;

        this.game.audioHandler.enemySFX.playSound("mode2TranformationSound", false, true);
        this.game.startShake(this.transformFX.shakeOnStartMs);
    }

    finishMode2Transform() {
        this.isTransforming = false;
        this.mode2Pending = false;
        this.mode2Triggered = true;

        this.mode2 = true;

        this.backToIdleSetUp({ recordPreviousState: false });
        if (this.frameTimer != null) this.frameTimer = 0;

        this.applyMode2Tuning();
    }

    applyFpsOnlyMult(fpsMult) {
        const fps = this._base.fps;
        const fpsToInterval = (f) => (f > 0 ? 1000 / f : Infinity);
        const scaled = (k) => Math.max(0, Math.round(fps[k] * fpsMult));

        this.setFps(scaled("idle"));
        if (this.runAnimation) this.runAnimation.setFps(scaled("run"));
        if (this.flyAnimation) this.flyAnimation.setFps(scaled("fly"));
        if (this.ntharaxDistortionAnimation) this.ntharaxDistortionAnimation.setFps(scaled("distortion"));

        this.ballFrameInterval = fpsToInterval(fps.ball * fpsMult);
        this.wingFrameInterval = fpsToInterval(fps.wing * fpsMult);
        this.kneelFrameInterval = fpsToInterval(fps.kneel * fpsMult);
        this.yellowFrameInterval = fpsToInterval(fps.yellow * fpsMult);
        this.asteroidFrameInterval = fpsToInterval(fps.asteroid * fpsMult);
        this.blackFrameInterval = fpsToInterval(fps.black * fpsMult);
        this.purpleFrameInterval = fpsToInterval(fps.purple * fpsMult);
        this.slapFrameInterval = fpsToInterval(fps.slap * fpsMult);
        this.tentacleFrameInterval = fpsToInterval(fps.tentacle * fpsMult);
        this.healingFrameInterval = fpsToInterval(fps.healing * fpsMult);
        this.laserFrameInterval = fpsToInterval(fps.laser * fpsMult);

        const intervalMult = 1 / fpsMult;
        this.windSpawnInterval = Math.max(20, this._base.windSpawnInterval * intervalMult);
    }

    applyMode2Tuning() {
        const fpsMult = this.mode2Active ? this.mode2FpsMult : 1;
        const spdMult = this.mode2Active ? this.mode2SpeedMult : 1;
        const jumpMult = this.mode2Active ? this.mode2JumpMult : 1;

        this.applyFpsOnlyMult(fpsMult);

        this.flySpeed = this._base.flySpeed * spdMult;

        this.jumpDuration = this._base.jumpDuration / jumpMult;
        this.diveDuration = this._base.diveDuration / jumpMult;

        this.windFadeDuration = Math.max(
            180,
            this._base.windFadeDuration * (this.mode2Active ? 0.9 : 1)
        );
    }

    getRunStep() {
        const spdMult = this.mode2Active ? this.mode2SpeedMult : 1;
        return Math.round(this._base.runStep * spdMult);
    }

    beginPowerVisual(context) {
        if (!this.isTransforming && !this.mode2Active) return;

        context.save();

        if (this.isTransforming) {
            const fx = this.transformFX;

            const gatherEnd = fx.gatherDuration;
            const holdEnd = fx.gatherDuration + fx.holdDuration;
            const total = fx.gatherDuration + fx.holdDuration + fx.explodeDuration;

            const tAll = this.clamp(this.transformTimer / total, 0, 1);

            const targetHue = this.mode2Visual.hueDeg;
            const targetSat = this.mode2Visual.saturate;
            const targetBri = this.mode2Visual.brightness;
            const targetBlur = this.mode2Visual.glowBlur;
            const targetGlow = this.mode2Visual.glowColor;

            const v = this.transformVisual;

            let hue = v.hueStart + (targetHue - v.hueStart) * tAll;
            let sat = v.satStart + (targetSat - v.satStart) * tAll;
            let bri = v.briStart + (targetBri - v.briStart) * tAll;
            let blur = v.glowBlurStart + (targetBlur - v.glowBlurStart) * tAll;

            if (this.transformTimer >= holdEnd) {
                const tExplode = this.clamp((this.transformTimer - holdEnd) / fx.explodeDuration, 0, 1);
                const punch = 1 - tExplode;

                sat *= (1 + 0.35 * punch);
                bri *= (1 + 0.18 * punch);
                blur += 10 * punch;
            }

            context.filter = `hue-rotate(${hue}deg) saturate(${sat}) brightness(${bri})`;
            context.shadowColor = targetGlow;
            context.shadowBlur = blur;
            return;
        }

        const v = this.mode2Visual;
        context.filter = `hue-rotate(${v.hueDeg}deg) saturate(${v.saturate}) brightness(${v.brightness})`;
        context.shadowColor = v.glowColor;
        context.shadowBlur = v.glowBlur;
    }

    endPowerVisual(context) {
        if (!this.isTransforming && !this.mode2Active) return;
        context.restore();
    }

    startExplodePush() {
        const player = this.game.player;
        if (!player) return;

        this.explodePush.active = true;
        this.explodePush.t = 0;
    }

    updateExplodePush(deltaTime) {
        if (!this.explodePush.active) return;

        const player = this.game.player;
        if (!player) { this.explodePush.active = false; return; }

        const dt = deltaTime / 1000;
        this.explodePush.t += dt;

        const dir = this.shouldInvert ? 1 : -1;

        player.x += dir * 3400 * dt;

        const minX = 0;
        const maxX = this.game.width - player.width;

        if (dir > 0) {
            if (player.x >= maxX) { player.x = maxX; this.explodePush.active = false; }
        } else {
            if (player.x <= minX) { player.x = minX; this.explodePush.active = false; }
        }

        if (this.explodePush.t >= 0.28) {
            this.explodePush.active = false;
        }
    }

    updateTransformFX(deltaTime) {
        const fx = this.transformFX;
        const dt = deltaTime / 1000;

        this.transformTimer += deltaTime;

        const gatherEnd = fx.gatherDuration;
        const holdEnd = fx.gatherDuration + fx.holdDuration;
        const explodeEnd = fx.gatherDuration + fx.holdDuration + fx.explodeDuration;

        if (this.transformTimer < gatherEnd) this.transformPhase = "gather";
        else if (this.transformTimer < holdEnd) this.transformPhase = "hold";
        else if (this.transformTimer < explodeEnd) this.transformPhase = "explode";
        else this.transformPhase = "done";

        const c = this.getBossCenter();
        const absorbRadius = Math.max(
            10,
            this.transformBall.targetRadius * fx.absorbRadiusFrac
        );

        if (this.transformPhase === "gather") {
            const t = this.transformTimer / fx.gatherDuration;
            const e = this.easeInOutCubic(t);

            const holdBase = 1.08;
            this.transformBall.radius = this.transformBall.targetRadius * (holdBase * e);
            const maxCoverAlpha = 0.98;
            this.transformBall.alpha = maxCoverAlpha * this.clamp(e * 1.1, 0, 1);

            const pull = fx.pullStrength * (0.65 + 1.25 * e);
            const swirl = fx.swirlStrength * (0.55 + 1.35 * e);

            for (let i = 0; i < this.transformParticles.length; i++) {
                const p = this.transformParticles[i];
                if (p.absorbed) continue;

                p.a += p.spin * dt;

                const dx = c.x - p.x;
                const dy = c.y - p.y;
                const d = Math.hypot(dx, dy) || 1;

                const nx = dx / d;
                const ny = dy / d;

                const tx = -ny;
                const ty = nx;

                const ax = (nx * pull + tx * swirl) * 80;
                const ay = (ny * pull + ty * swirl) * 80;

                p.vx += ax * dt;
                p.vy += ay * dt;

                p.vx *= fx.damping;
                p.vy *= fx.damping;

                p.x += p.vx * dt;
                p.y += p.vy * dt;

                if (d <= absorbRadius) {
                    p.absorbed = true;
                } else {
                    const near = this.clamp(1 - d / (fx.gatherRingMax * 1.1), 0, 1);
                    p.alpha = this.clamp(0.25 + 0.75 * (1 - 0.55 * near), 0, 1);
                }
            }

            this.transformParticles = this.transformParticles.filter(p => !p.absorbed);

            return;
        }

        if (this.transformPhase === "hold") {
            if (!this._transformFpsBoosted) {
                this._transformFpsBoosted = true;
                this.applyFpsOnlyMult(this.mode2FpsMult);
                if (this.frameTimer != null) this.frameTimer = 0;
            }

            const holdBase = 1.08;
            const maxCoverAlpha = 0.98;

            this.transformBall.alpha = maxCoverAlpha;

            const tHold = (this.transformTimer - gatherEnd);
            const pulse = Math.sin(tHold * 0.008);
            const pulseAmt = 0.018;

            this.transformBall.radius =
                this.transformBall.targetRadius * holdBase * (1 + pulseAmt * pulse);

            this.transformParticles.length = 0;

            return;
        }

        if (this.transformPhase === "explode") {
            const t = (this.transformTimer - holdEnd) / fx.explodeDuration;
            const e = this.easeOutCubic(t);

            if (this.transformExplodeParticles.length === 0) {
                if (!this._explodePushTriggered) {
                    this._explodePushTriggered = true;
                    this.startExplodePush();
                }
                for (let i = 0; i < fx.explodeCount; i++) {
                    const a = Math.random() * Math.PI * 2;
                    const sp = this.rand(fx.explodeSpeedMin, fx.explodeSpeedMax);

                    this.transformExplodeParticles.push({
                        x: c.x,
                        y: c.y,
                        vx: Math.cos(a) * sp,
                        vy: Math.sin(a) * sp,
                        life: 0,
                        maxLife: this.rand(420, 980),
                        size: this.rand(1.2, 3.8),
                        alpha: this.rand(0.65, 1.0),
                    });
                }

                this.game.audioHandler.enemySFX.playSound("mode2ExplosionSound", false, true);
                this.game.startShake(fx.shakeOnExplodeMs);
            }

            this.transformBall.alpha = this.clamp(1 - e, 0, 1);
            this.transformBall.radius = this.transformBall.targetRadius * (1.08 + 0.55 * e);

            const gravity = 520;
            for (let i = 0; i < this.transformExplodeParticles.length; i++) {
                const p = this.transformExplodeParticles[i];
                p.life += deltaTime;

                p.vy += gravity * dt * 0.35;

                p.x += p.vx * dt;
                p.y += p.vy * dt;

                const lt = this.clamp(p.life / p.maxLife, 0, 1);
                p.alpha = (1 - lt) * 1.05;
            }

            this.transformExplodeParticles = this.transformExplodeParticles.filter(p =>
                p.life < p.maxLife && p.alpha > 0.02
            );

            return;
        }

        if (this.transformPhase === "done") {
            this.transformBall.alpha = 0;
            this.transformParticles.length = 0;
            this.transformExplodeParticles.length = 0;
            this.finishMode2Transform();
        }
    }

    drawTransformFX(context) {
        if (!this.isTransforming) return;

        const c = this.getBossCenter();

        if (this.transformParticles.length > 0) {
            context.save();
            context.globalCompositeOperation = "lighter";
            for (let i = 0; i < this.transformParticles.length; i++) {
                const p = this.transformParticles[i];
                const a = this.clamp(p.alpha, 0, 1);
                if (a <= 0) continue;

                context.fillStyle = `rgba(255,255,255,${0.55 * a})`;
                context.beginPath();
                context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                context.fill();
            }
            context.restore();
        }

        // glowy ball
        if (this.transformBall.alpha > 0.01 && this.transformBall.radius > 1) {
            const r = this.transformBall.radius;

            context.save();
            context.globalAlpha = this.transformBall.alpha;
            context.globalCompositeOperation = "source-over";

            // radial gradient circle
            const g = context.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
            g.addColorStop(0.0, this.transformBallVisual.inner);
            g.addColorStop(0.55, this.transformBallVisual.mid);
            g.addColorStop(1.0, this.transformBallVisual.glow);

            context.fillStyle = g;
            context.beginPath();
            context.arc(c.x, c.y, r, 0, Math.PI * 2);
            context.fill();

            context.restore();
        }

        // explosion particles
        if (this.transformExplodeParticles.length > 0) {
            context.save();
            context.globalCompositeOperation = "lighter";

            for (let i = 0; i < this.transformExplodeParticles.length; i++) {
                const p = this.transformExplodeParticles[i];
                const a = this.clamp(p.alpha, 0, 1);
                if (a <= 0) continue;

                context.fillStyle = `rgba(255,255,255,${a})`;
                context.beginPath();
                context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                context.fill();
            }

            context.restore();
        }
    }

    get isDistortionActive() {
        const stillFading = !!this.game.distortionEffect && this.game.distortionEffect.amount > 0.01;
        return !!this.game.distortionActive || stillFading;
    }

    updateFlyFacingFromDx(dx) {
        if (Math.abs(dx) > 1) this.flyLockedInvert = dx > 0;
    }

    updateFlyFacingFromBeam() {
        if (!this.kamehameha) return;
        const mx = this.kamehameha.mouthX ?? (this.x + this.width * 0.5);
        const ex = this.kamehameha.endX ?? mx;
        const beamDx = ex - mx;
        if (Math.abs(beamDx) < 1) return;
        this.kameDirection = beamDx >= 0 ? "right" : "left";
        this.flyLockedInvert = this.kameDirection === "right";
    }

    burrowLogic(deltaTime) {
        if (!this.burrowStarted) {
            this.burrowStarted = true;
            this.burrowPhase = "down";
            this.burrowTimer = 0;

            this.state = "burrow";
            this.frameX = 0;
            if (this.frameTimer != null) this.frameTimer = 0;

            this.originalY = this.originalY ?? this.y;

            this.game.audioHandler.enemySFX.playSound(
                "burrowInSound",
                false,
                true,
                false,
                { playbackRate: this.mode2Active ? 1.35 : 1 }
            );
        }

        this.burrowTimer += deltaTime;

        const speedMult = this.mode2Active ? 2 : 1;

        const downMs = this.burrow.downMs / speedMult;
        const underMs = this.burrow.undergroundMs / speedMult;
        const upMs = this.burrow.upMs / speedMult;

        const sinkPx = this.burrow.sinkPx;
        const baseY = this.originalY;

        const clamp01 = (t) => Math.max(0, Math.min(1, t));
        const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

        if (this.burrowPhase === "down") {
            const t = clamp01(this.burrowTimer / downMs);
            const e = easeInOut(t);
            this.y = baseY + sinkPx * e;

            if (t >= 1) {
                this.burrowPhase = "underground";
                this.burrowTimer = 0;

                if (this.burrow.relocate) {
                    const minX = this.burrow.minX;
                    const maxX = this.game.width - this.width - this.burrow.maxXMargin;

                    // 50% random or on player
                    let newX;
                    if (Math.random() < 0.5) {
                        const p = this.game.player;
                        const playerCenterX = p.x + p.width * 0.5;
                        newX = playerCenterX - this.width * 0.5;
                    } else {
                        newX = Math.random() * (maxX - minX) + minX;
                    }

                    newX = Math.max(minX, Math.min(maxX, newX));

                    this.burrowPendingX = newX;
                }
            }
            return;
        }

        if (this.burrowPhase === "underground") {
            this.y = baseY + sinkPx;

            if (this.burrowTimer >= underMs) {
                this.burrowPhase = "up";
                this.burrowTimer = 0;
                this.game.audioHandler.enemySFX.playSound(
                    "burrowOutSound",
                    false,
                    true,
                    false,
                    { playbackRate: this.mode2Active ? 1.35 : 1 }
                );
            }
            return;
        }

        if (this.burrowPhase === "up") {
            const t = clamp01(this.burrowTimer / upMs);
            if (this.burrowPendingX != null && t > 0.2) {
                this.x = this.burrowPendingX;
                this.burrowPendingX = null;
            }

            const e = easeInOut(t);
            this.y = baseY + sinkPx * (1 - e);

            if (t >= 1) {
                this.y = baseY;
                this.burrowStarted = false;
                this.burrowPhase = "idle";
                this.burrowTimer = 0;

                this.backToIdleSetUp();
            }
        }
    }

    flyLogic(deltaTime) {
        if (!this.flyStarted) {
            this.flyStarted = true;

            this.flyPhase = "moveToCenter";
            this.flyAnimation.frameX = 0;
            this.flyAnimation.x = this.x;
            this.flyAnimation.y = this.y;

            this.flyTargetX = this.game.width / 2 - this.width / 2;
            this.flyTargetY = 0;

            this.kamehameha = null;
            this.kamehameha2 = null;
            this.kameDirection = "right";
            this.kameHoldTimer = 0;

            this._flyTargetShotsDone = 0;
            this._flyTargetShotsTotal = this.mode2 ? 4 : 2;

            this._flySweepPassDone = 0;
            this._flySweepPassTotal = this.mode2 ? 2 : 1;
            this._flyLastSweepStartSide = null;

            this._flyPrevFrameX = null;
            this._flyFlapPlayed2 = false;
            this._flyFlapPlayed7 = false;
        }

        this.flyAnimation.update(deltaTime);

        const fx = this.flyAnimation.frameX;

        if (this._flyPrevFrameX == null || fx < this._flyPrevFrameX) {
            this._flyFlapPlayed2 = false;
            this._flyFlapPlayed7 = false;
        }

        if (fx !== this._flyPrevFrameX) {
            if (fx === 2 && !this._flyFlapPlayed2) {
                this.game.audioHandler.enemySFX.playSound("ntharaxWingFlapFly1Sound", false, true);
                this._flyFlapPlayed2 = true;
            }

            if (fx === 7 && !this._flyFlapPlayed7) {
                this.game.audioHandler.enemySFX.playSound("ntharaxWingFlapFly2Sound", false, true);
                this._flyFlapPlayed7 = true;
            }
        }

        this._flyPrevFrameX = fx;

        const dt = deltaTime / 1000;

        const moveToward = (tx, ty, speed) => {
            const dx = tx - this.x;
            const dy = ty - this.y;
            const d = Math.hypot(dx, dy);
            if (d < 1) return { done: true, dx, dy };
            const step = Math.min(d, speed * dt);
            this.x += (dx / d) * step;
            this.y += (dy / d) * step;
            return { done: d <= speed * dt + 0.001, dx, dy };
        };

        const getPlayerAimPoint = () => {
            const p = this.game.player;
            const W = this.game.width;
            const H = this.game.height;
            const m = 14;

            const px = p.x + p.width * 0.5;
            const py = p.y + p.height * 0.5;

            return {
                x: Math.max(m, Math.min(W - m, px)),
                y: Math.max(m, Math.min(H - m, py)),
            };
        };

        const spawnTargetBeam = () => {
            const aim1 = getPlayerAimPoint();

            const W = this.game.width;
            const H = this.game.height;
            const m = 14;

            const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
            const norm = (x, y) => {
                const L = Math.hypot(x, y);
                if (L < 1e-6) return { x: 1, y: 0 };
                return { x: x / L, y: y / L };
            };

            const base = { x: W * 0.5, y: H * 0.5 };
            const minSep = Math.min(520, Math.max(180, W * 0.28));

            let dir = norm(base.x - aim1.x, base.y - aim1.y);

            if (Math.hypot(base.x - aim1.x, base.y - aim1.y) < 40) {
                const toLeft = aim1.x;
                const toRight = W - aim1.x;
                dir = toRight > toLeft ? { x: 1, y: 0 } : { x: -1, y: 0 };
            }

            let aim2 = {
                x: aim1.x + dir.x * minSep,
                y: aim1.y + dir.y * minSep,
            };

            aim2.x = clamp(aim2.x, m, W - m);
            aim2.y = clamp(aim2.y, m, H - m);

            if (Math.hypot(aim2.x - aim1.x, aim2.y - aim1.y) < minSep * 0.75) {
                const perp = norm(-dir.y, dir.x);
                aim2 = {
                    x: clamp(aim1.x + perp.x * minSep, m, W - m),
                    y: clamp(aim1.y + perp.y * minSep, m, H - m),
                };
            }

            this.kameDirection = aim1.x >= this.x + this.width * 0.5 ? "right" : "left";
            this.flyLockedInvert = this.kameDirection === "right";
            this.shouldInvert = this.flyLockedInvert;

            const motionMode = this.mode2 ? "alternate" : "normal";

            const mirrorMid = this.mode2
                ? { x: (aim1.x + aim2.x) * 0.5, y: (aim1.y + aim2.y) * 0.5 }
                : null;

            const beamsCount = this.mode2 ? 2 : 1;

            const common = {
                pattern: "fixed",
                chargeMs: 650,
                burstGrowMs: 140,
                duration: this.mode2 ? 500 : 1200,
                fadeOutMs: 240,
                thickness: 52,
                endUpBreathingRoom: 180,
                edgeMargin: 10,

                beamMotionMode: motionMode,

                // normal
                followTurnRateRadPerSec: 0.35,
                followDeadzoneRad: 0.003,

                // mode2
                alternateOscMs: 1400,
                alternateCloseFrac: 0.18,
                alternateOpenFrac: 0.18,
                alternateFullCloseIfOffsetBelowRad: 0.035,
                sourceAlphaMult: 1 / beamsCount,
            };

            this.kamehameha = new Kamehameha(this.game, this, {
                ...common,
                fixedEndX: aim1.x,
                fixedEndY: aim1.y,
                ...(mirrorMid ? { alternateMirrorMidX: mirrorMid.x, alternateMirrorMidY: mirrorMid.y } : {}),
            });
            this.game.enemies.push(this.kamehameha);

            if (this.mode2) {
                this.kamehameha2 = new Kamehameha(this.game, this, {
                    ...common,
                    fixedEndX: aim2.x,
                    fixedEndY: aim2.y,
                    alternateMirrorMidX: mirrorMid.x,
                    alternateMirrorMidY: mirrorMid.y,
                });
                this.game.enemies.push(this.kamehameha2);
            } else {
                this.kamehameha2 = null;
            }

            this.kameHoldTimer = 0;
        };

        const spawnSweepBeam = (forcedStartSide = null) => {
            const startSide = forcedStartSide ?? (Math.random() < 0.5 ? "left" : "right");
            this._flyLastSweepStartSide = startSide;

            this.kameDirection = startSide === "right" ? "right" : "left";

            this.kamehameha = new Kamehameha(this.game, this, {
                startSide,
                thickness: 56,
                speed: 1200,
                endUpBreathingRoom: 180,
                edgeMargin: 10,

                beamMotionMode: this.mode2 ? "alternate" : "normal",
                followTurnRateRadPerSec: 0.35,
                followDeadzoneRad: 0.003,

                alternateOscMs: 1400,
                alternateCloseFrac: 0.18,
                alternateOpenFrac: 0.18,
                alternateFullCloseIfOffsetBelowRad: 0.035,
            });

            this.game.enemies.push(this.kamehameha);
            this.kamehameha2 = null;

            this.flyLockedInvert = this.kameDirection === "right";
            this.shouldInvert = this.flyLockedInvert;

            this.kameHoldTimer = 0;
        };

        if (this.flyPhase === "moveToCenter") {
            const res = moveToward(this.flyTargetX, this.flyTargetY, this.flySpeed);

            this.updateFlyFacingFromDx(res.dx);
            this.shouldInvert = this.flyLockedInvert;

            if (res.done) {
                this.x = this.flyTargetX;
                this.y = this.flyTargetY;

                this.flyPhase = "targetKame";
                this._flyTargetShotsDone = 0;
                this.kamehameha = null;
                this.kamehameha2 = null;
                this.kameHoldTimer = 0;

                spawnTargetBeam();
                this._flyTargetShotsDone = 1;
            }
            return;
        }

        if (this.flyPhase === "targetKame") {
            this.shouldInvert = this.flyLockedInvert;

            this.kameHoldTimer += deltaTime;

            const beamDone =
                (!this.kamehameha || this.kamehameha.markedForDeletion) &&
                (!this.kamehameha2 || this.kamehameha2.markedForDeletion);

            if (beamDone && this.kameHoldTimer >= this.kameHoldDuration) {
                if (this._flyTargetShotsDone < this._flyTargetShotsTotal) {
                    spawnTargetBeam();
                    this._flyTargetShotsDone += 1;
                    return;
                }

                this.flyPhase = "kamehameha";
                this._flySweepPassDone = 0;
                this._flySweepPassTotal = this.mode2 ? 2 : 1;
                this._flyLastSweepStartSide = null;

                spawnSweepBeam();
                this._flySweepPassDone = 1;
            }
            return;
        }

        if (this.flyPhase === "kamehameha") {
            this.updateFlyFacingFromBeam();
            this.shouldInvert = this.flyLockedInvert;

            this.kameHoldTimer += deltaTime;

            const beamDone = !this.kamehameha || this.kamehameha.markedForDeletion;

            if (beamDone && this.kameHoldTimer >= this.kameHoldDuration) {
                if (this._flySweepPassDone < this._flySweepPassTotal) {
                    const last = this._flyLastSweepStartSide;
                    const next = last === "left" ? "right" : "left";
                    spawnSweepBeam(next);
                    this._flySweepPassDone += 1;
                    return;
                }

                this.flyDescendTargetX = Math.random() * (this.game.width - this.width);
                this.flyPhase = "descend";
            }
            return;
        }

        if (this.flyPhase === "descend") {
            const res = moveToward(this.flyDescendTargetX, this.originalY, this.flySpeed);

            this.updateFlyFacingFromDx(res.dx);
            this.shouldInvert = this.flyLockedInvert;

            if (res.done) {
                this.x = this.flyDescendTargetX;
                this.y = this.originalY;

                this.flyStarted = false;
                this.flyPhase = "idle";
                this.kamehameha = null;
                this.kamehameha2 = null;

                this.backToIdleSetUp({ recordPreviousState: false });
            }
        }
    }

    laserLogic(deltaTime) {
        if (!this.laserStarted) {
            this.laserStarted = true;
            this.laserDir = 1;
            this.laserFrameTimer = 0;

            this.laserShotFired = false;
            this.laserSweepCount = 0;

            this.laserMaxSweeps = this.mode2Active ? 4 : 2;

            this.laserAnimation.frameX = 0;
            this.laserAnimation.x = this.x;
            this.laserAnimation.y = this.y;
        }

        this.laserFrameTimer += deltaTime;
        if (this.laserFrameTimer < this.laserFrameInterval) return;
        this.laserFrameTimer = 0;

        const max = this.laserAnimation.maxFrame;

        this.laserAnimation.frameX += this.laserDir;

        if (this.laserDir === 1 && this.laserAnimation.frameX >= max) {
            this.laserAnimation.frameX = max;

            if (!this.laserShotFired) {
                this.laserShotFired = true;

                const facingRight = this.shouldInvert;

                const spawnX =
                    this.x +
                    this.width / 2 +
                    (facingRight ? 55 : -55);

                const spawnY =
                    this.y +
                    this.height * 0.45 + 4;

                const player = this.game.player;
                const targetX = player.x + player.width / 2;
                const targetY = player.y + player.height / 2;

                const speed = this.mode2Active ? 1800 : 1500;

                const imageId = this.mode2Active ? "laserBallMode2" : "laserBall";

                const glowColor = this.mode2Active
                    ? "rgba(255, 90, 90, 0.95)"
                    : "rgba(180, 80, 255, 0.95)";

                this.game.enemies.push(
                    new LaserBall(
                        this.game,
                        spawnX,
                        spawnY,
                        targetX,
                        targetY,
                        {
                            speed,
                            width: 40,
                            height: 40,
                            maxFrame: 0,
                            imageId,
                            fps: 0,

                            glowColor,
                            glowBlur: 22,
                            glowAlpha: 0.9,
                            mode2Active: this.mode2Active,
                        }
                    )
                );

                this.game.audioHandler.enemySFX.playSound(
                    "laserBallSound",
                    false,
                    true
                );
            }

            this.laserDir = -1;
            return;
        }

        if (this.laserDir === -1 && this.laserAnimation.frameX <= 0) {
            this.laserAnimation.frameX = 0;

            this.laserSweepCount++;

            if (this.laserSweepCount < this.laserMaxSweeps) {
                this.laserDir = 1;
                this.laserShotFired = false;
                return;
            }

            this.laserStarted = false;
            this.laserDir = 1;
            this.laserFrameTimer = 0;

            this.backToIdleSetUp();
        }
    }

    updateWindParticles(deltaTime) {
        const dt = deltaTime / 1000;

        const targetAlpha = this.state === "wing" ? 1 : 0;
        const step = deltaTime / this.windFadeDuration;

        if (this.windEffectAlpha < targetAlpha) {
            this.windEffectAlpha = Math.min(this.windEffectAlpha + step, targetAlpha);
        } else if (this.windEffectAlpha > targetAlpha) {
            this.windEffectAlpha = Math.max(this.windEffectAlpha - step, targetAlpha);
        }

        if (this.state === "wing") {
            const dir = this.wingWindDirection || (this.shouldInvert ? 1 : -1);

            this.windSpawnTimer += deltaTime;
            while (this.windSpawnTimer >= this.windSpawnInterval) {
                this.windSpawnTimer -= this.windSpawnInterval;

                const spawnCount = 6;
                for (let i = 0; i < spawnCount; i++) {
                    const speed = 800;
                    const vx = dir * speed;
                    const vy = (Math.random() - 0.5) * 60;
                    const length = 60 + Math.random() * 60;

                    const x = -100 + Math.random() * (this.game.width + 200);
                    const y = Math.random() * this.game.height;

                    this.windParticles.push({
                        x,
                        y,
                        vx,
                        vy,
                        length,
                        life: 0,
                        maxLife: 700 + Math.random() * 400,
                        dir,
                    });
                }
            }
        } else {
            this.windSpawnTimer = 0;
        }

        if (this.windEffectAlpha <= 0 && this.windParticles.length === 0) return;

        for (let i = 0; i < this.windParticles.length; i++) {
            const p = this.windParticles[i];
            p.life += deltaTime;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }

        this.windParticles = this.windParticles.filter((p) => {
            if (p.life > p.maxLife) return false;
            if (p.x < -200 || p.x > this.game.width + 200) return false;
            if (p.y < -200 || p.y > this.game.height + 200) return false;
            return true;
        });

        if (this._windGustStarted && !this._windGustFading && this.state !== "wing") {
            this._windGustFading = true;
            this._windGustStarted = false;
            this.game.audioHandler.enemySFX.fadeOutAndStop("ntharaxWindGustSound", 200);
        }
    }

    drawWindParticles(context) {
        if (this.windEffectAlpha <= 0 || this.windParticles.length === 0) return;

        context.save();
        context.lineWidth = 2;

        for (let i = 0; i < this.windParticles.length; i++) {
            const p = this.windParticles[i];
            const t = p.life / p.maxLife;
            const lifeAlpha = 1 - t;

            let alpha = 0.15 + 0.55 * lifeAlpha;
            alpha *= this.windEffectAlpha;

            if (alpha <= 0) continue;

            context.globalAlpha = alpha;
            context.strokeStyle = "rgba(200, 230, 255, 1)";

            const tailX = p.x - (p.dir * p.length);
            const tailY = p.y;

            context.beginPath();
            context.moveTo(p.x, p.y);
            context.lineTo(tailX, tailY);
            context.stroke();
        }

        context.restore();
    }

    healingBarrierLogic(deltaTime) {
        if (
            this.healingBarrier &&
            (this.healingBarrier.markedForDeletion || this.healingBarrier.lives <= 0)
        ) {
            this.isHealingBarrierActive = false;
            this.isBarrierActive = false;

            this.healingBarrier = null;
            this.healingBarrierActiveTimer = 0;
            this.healingBarrierCooldownTimer = 0;

            this.game.player.bossCollisionTimer = 1000;
        }

        const barrierDuration = this.mode2Active
            ? this.healingBarrierMode2Duration
            : this.healingBarrierNormalDuration;

        if (this.isBarrierActive && this.healingBarrier) {
            this.healingBarrierActiveTimer += deltaTime;

            if (this.healingBarrierActiveTimer >= barrierDuration) {
                const barrier = this.healingBarrier;

                this.game.audioHandler.enemySFX.playSound(
                    "elyvorg_shield_crack_3_sound",
                    false,
                    true
                );

                barrier.markedForDeletion = true;
                this.game.collisions.push(
                    new DisintegrateCollision(this.game, barrier, { followTarget: this })
                );

                this.isHealingBarrierActive = false;
                this.isBarrierActive = false;

                this.healingBarrier = null;
                this.healingBarrierActiveTimer = 0;
                this.healingBarrierCooldownTimer = 0;
            }
            return;
        }

        if (this.isTransforming || this.state === "transform") return;

        this.healingBarrierCooldownTimer += deltaTime;

        if (this.healingBarrierCooldownTimer >= this.healingBarrierCooldown) {
            this.healingBarrierCooldownTimer = 0;
            this.healingBarrierActiveTimer = 0;

            this.healingBarrierCooldown =
                Math.floor(Math.random() * (45000 - 30000 + 1)) + 30000;

            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;

            const barrierW = 260;
            const barrierH = 260;

            const barrier = new HealingBarrier(
                this.game,
                centerX - barrierW / 2,
                centerY - barrierH / 2,
                { owner: this, followOwner: true, clipWithOwnerBurrow: true }
            );

            this.healingBarrier = barrier;
            this.game.enemies.push(barrier);

            this.isHealingBarrierActive = true;
            this.isBarrierActive = true;
        }
    }

    pickUndergroundTentacleCenterX() {
        const tentacleWidth = 86;
        const halfW = tentacleWidth * 0.5;
        const minCenter = halfW;
        const maxCenter = this.game.width - halfW;

        let cx;
        if (Math.random() < 0.5) {
            const playerCenterX = this.game.player.x + this.game.player.width / 2;
            const spread = 260;
            cx = playerCenterX + (Math.random() * spread - spread / 2);
        } else {
            cx = Math.random() * this.game.width;
        }

        return Math.max(minCenter, Math.min(maxCenter, cx));
    }

    spawnUndergroundTentacles() {
        if (this.undergroundTentaclesSpawned) return;
        this.undergroundTentaclesSpawned = true;

        const count = this.undergroundTentacleCount;
        const tentacleWidth = 86;
        const minGap = tentacleWidth + 10;

        const centers = [];

        const playerCenterX = this.game.player.x + this.game.player.width / 2;
        centers.push(this.pickUndergroundTentacleCenterX(playerCenterX));

        for (let i = 1; i < count; i++) {
            let cx;
            let attempts = 0;
            const maxAttempts = 18;

            do {
                cx = this.pickUndergroundTentacleCenterX();
                attempts++;
            } while (
                centers.some(existing => Math.abs(cx - existing) < minGap) &&
                attempts < maxAttempts
            );

            centers.push(cx);
        }

        this.undergroundTentacles = [];

        for (const cx of centers) {
            const tentacle = new AntennaeTentacle(this.game, cx, {
                mode2Active: this.mode2Active,
                mode2Visual: this.mode2Visual,
            });
            this.game.enemies.push(tentacle);
            this.undergroundTentacles.push(tentacle);
        }
    }

    jumpLogic(deltaTime) {
        if (!this.jumpedBeforeDistanceLogic) {
            this.jumpStartTime = this.game.hiddenTime;
            this.jumpedBeforeDistanceLogic = true;

            const player = this.game.player;

            const bossCenterX = this.x + this.width * 0.5;
            const playerCenterX = player.x + player.width * 0.5;
            const distX = Math.abs(playerCenterX - bossCenterX);

            const normalAllowed = distX >= (this.game.width * 0.5);

            const pickedNormal = normalAllowed && (Math.random() < 0.5);

            this.isDiveJump = !pickedNormal;
            this.jumpPhase = this.isDiveJump ? "ascend" : "normal";
            this.offscreenTimer = 0;
            this.game.audioHandler.enemySFX.playSound("bossJumpingSound", false, true);
            this.game.audioHandler.enemySFX.playSound("whileInAirSound", false, true);

            if (!this.isDiveJump) {
                this.jumpStartX = this.x;

                const desiredTopLeftX = playerCenterX - this.width * 0.5;

                const minX = 0;
                const maxX = this.game.width - this.width;

                this.jumpTargetX = Math.max(minX, Math.min(maxX, desiredTopLeftX));

                const dx = this.jumpTargetX - this.jumpStartX;
                const dist = Math.abs(dx);

                const mode2NormalJumpSpeedMult = this.mode2Active ? 2 : 1.0;

                const distMs = (dist / Math.max(1, this.jumpHorizontalSpeed)) * 1000;

                const minMs = this.jumpMinDurationMs / mode2NormalJumpSpeedMult;
                const maxMs = this.jumpMaxDurationMs / mode2NormalJumpSpeedMult;

                this.jumpNormalDurationMs = this.clamp(
                    distMs / mode2NormalJumpSpeedMult,
                    minMs,
                    maxMs
                );
            }
        }

        // dive
        if (this.isDiveJump) {
            if (this.jumpPhase === "ascend") {
                const elapsed = this.game.hiddenTime - this.jumpStartTime;
                const t = Math.min(1, elapsed / this.jumpAscendDuration);

                const startY = this.originalY;
                const apexY = -this.height - 10;
                this.y = startY + (apexY - startY) * t;

                this.jumpAnimation.frameX = t < 0.5 ? 0 : 1;

                if (t >= 1) {
                    this.y = apexY;
                    this.jumpPhase = "wait";
                    this.offscreenTimer = 0;
                }
            } else if (this.jumpPhase === "wait") {
                this.offscreenTimer += deltaTime;

                const waitDuration = this.mode2Active
                    ? this.offscreenWaitDuration * 0.5
                    : this.offscreenWaitDuration;

                if (this.offscreenTimer >= waitDuration) {
                    const playerCenterX = this.game.player.x + this.game.player.width / 2;
                    const halfWidth = this.width / 2;
                    const clampedCenterX = Math.max(
                        halfWidth,
                        Math.min(this.game.width - halfWidth, playerCenterX)
                    );

                    this.diveTargetX = clampedCenterX;
                    this.x = clampedCenterX - halfWidth;

                    this.isDiving = false;
                    this.diveImpactSpawned = false;

                    this.diveAnimation.frameX = 0;
                    this.diveAnimation.x = this.x;
                    this.diveAnimation.y = this.y;

                    this.state = "dive";

                    this.jumpedBeforeDistanceLogic = false;
                    this.canJumpAttack = true;
                    this.isDiveJump = false;
                    this.jumpPhase = null;
                }
            }

            return;
        }

        // jump
        const durationMs = Math.max(1, this.jumpNormalDurationMs || (this.jumpDuration * 1000));
        const elapsed = this.game.hiddenTime - this.jumpStartTime;

        const tRaw = elapsed / durationMs;
        const t = this.clamp(tRaw, 0, 1);

        if (t < 1) {
            this.x = this.jumpStartX + (this.jumpTargetX - this.jumpStartX) * t;

            this.y = this.originalY - (4 * this.jumpHeight * t * (1 - t));

            this.jumpAnimation.frameX = t < 0.5 ? 0 : 1;
        } else {
            this.x = this.jumpTargetX;
            this.y = this.originalY;

            this.game.audioHandler.enemySFX.playSound("bossLandingSound", false, true);

            this.backToIdleSetUp();
            this.canJumpAttack = true;
            this.jumpedBeforeDistanceLogic = false;
            this.jumpAnimation.frameX = 0;
            this.isDiveJump = false;
            this.jumpPhase = null;
            this.jumpNormalDurationMs = 0;
        }
    }

    diveLogic() {
        if (!this.isDiving) {
            this.isDiving = true;
            this.diveStartTime = this.game.hiddenTime;

            this.diveImpactSpawned = false;

            this.diveStartY = -this.height + 1;
            this.diveTargetY = this.originalY;

            this.y = this.diveStartY;

            this.diveAnimation.x = this.x;
            this.diveAnimation.y = this.y;
            this.diveAnimation.frameX = 0;

            this.game.audioHandler.enemySFX.playSound("diveFallingSound", false, true);
        }

        const elapsed = this.game.hiddenTime - this.diveStartTime;
        const durationMs = this.diveDuration * 1000;

        const tRaw = durationMs > 0 ? Math.max(0, Math.min(1, elapsed / durationMs)) : 1;
        const t = tRaw * tRaw;

        this.y = this.diveStartY + (this.diveTargetY - this.diveStartY) * t;

        if (this.diveAnimation.maxFrame != null && this.diveAnimation.maxFrame > 0) {
            this.diveAnimation.frameX = t < 0.5 ? 0 : 1;
        }

        if (tRaw >= 1) {
            this.y = this.diveTargetY;

            if (!this.diveImpactSpawned) {
                this.spawnDiveImpact();
                this.diveImpactSpawned = true;

                this.game.audioHandler.enemySFX.stopSound("diveFallingSound");

                this.game.audioHandler.enemySFX.playSound("diveImpactSound", false, true);
                this.game.startShake(600);
            }

            this.isDiving = false;
            this.jumpedBeforeDistanceLogic = false;
            this.backToIdleSetUp({ recordPreviousState: false });
            return;
        }
    }

    spawnDiveImpact() {
        const impactX = this.x + this.width / 2;
        const impactY = this.y + this.height;

        const count = 60;
        for (let i = 0; i < count; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
            const speed = 500 + Math.random() * 700;

            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            this.diveImpactParticles.push({
                x: impactX,
                y: impactY,
                vx,
                vy,
                life: 0,
                maxLife: 450 + Math.random() * 550,
                radius: 5 + Math.random() * 7,
                alpha: 1,
                kind: "spray",
                variant: Math.random() < 0.5 ? 0 : 1,
            });
        }

        const shockwaveCount = 22;
        for (let i = 0; i < shockwaveCount; i++) {
            const dir = (i / shockwaveCount) * Math.PI * 2;
            const speed = 350 + Math.random() * 400;

            this.diveImpactParticles.push({
                x: impactX,
                y: impactY + 4,
                vx: Math.cos(dir) * speed,
                vy: Math.sin(dir) * 90,
                life: 0,
                maxLife: 380 + Math.random() * 320,
                radius: 3 + Math.random() * 5,
                alpha: 1,
                kind: "ring",
                variant: Math.random() < 0.5 ? 0 : 1,
            });
        }
    }

    updateDiveImpactParticles(deltaTime) {
        if (!this.diveImpactParticles || this.diveImpactParticles.length === 0) return;

        const dt = deltaTime / 1000;

        for (let i = 0; i < this.diveImpactParticles.length; i++) {
            const p = this.diveImpactParticles[i];

            p.life += deltaTime;
            const lifeT = p.life / p.maxLife;

            const gravity = p.kind === "ring" ? 900 : 1400;
            p.vy += gravity * dt;

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            p.alpha = 1 - lifeT * 1.1;
        }

        this.diveImpactParticles = this.diveImpactParticles.filter(
            (p) => p.life < p.maxLife && p.alpha > 0 && p.y < this.game.height + 250
        );
    }

    drawDiveImpactParticles(context) {
        if (!this.diveImpactParticles || this.diveImpactParticles.length === 0) return;

        context.save();
        const previousComposite = context.globalCompositeOperation;
        context.globalCompositeOperation = "lighter";

        for (let i = 0; i < this.diveImpactParticles.length; i++) {
            const p = this.diveImpactParticles[i];
            const alpha = p.alpha != null ? p.alpha : 1;
            if (alpha <= 0) continue;

            const lifeT = p.life / p.maxLife;
            const radius = p.radius * (0.7 + 0.3 * (1 - lifeT));

            let inner, mid, outer;
            if (p.variant === 0) {
                inner = `rgba(255, 235, 255, ${alpha})`;
                mid = `rgba(230, 150, 255, ${0.9 * alpha})`;
                outer = `rgba(70, 20, 120, 0)`;
            } else {
                inner = `rgba(220, 245, 255, ${alpha})`;
                mid = `rgba(150, 210, 255, ${0.9 * alpha})`;
                outer = `rgba(20, 40, 90, 0)`;
            }

            const grad = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
            grad.addColorStop(0, inner);
            grad.addColorStop(0.45, mid);
            grad.addColorStop(1, outer);

            context.fillStyle = grad;

            if (p.kind === "ring") {
                context.save();
                context.translate(p.x, p.y);
                context.scale(1.5, 0.7);
                context.beginPath();
                context.arc(0, 0, radius, 0, Math.PI * 2);
                context.fill();
                context.restore();
            } else {
                context.beginPath();
                context.arc(p.x, p.y, radius, 0, Math.PI * 2);
                context.fill();
            }
        }

        context.globalCompositeOperation = previousComposite;
        context.restore();
    }

    ballLogic(deltaTime) {
        if (!this.ballStarted) {
            this.ballStarted = true;
            this.ballFrameTimer = 0;

            this.ballAnimation.frameX = 0;
            this.ballAnimation.x = this.x;
            this.ballAnimation.y = this.y;

            this.ballPhase = "opening";
            this._kameHoldDirection = -1;

            this.ballAttack = new PurpleBallOrbAttack(this.game, this);
            this.ballAttack.start();
        }

        if (this.ballAttack) {
            this.ballAttack.update(deltaTime);
        }

        this.ballFrameTimer += deltaTime;
        if (this.ballFrameTimer >= this.ballFrameInterval) {
            this.ballFrameTimer = 0;

            if (this.ballPhase === "opening") {
                if (this.ballAnimation.frameX < this.BALL_HOLD_FRAME) {
                    this.ballAnimation.frameX += 1;
                }

                if (this.ballAnimation.frameX >= this.BALL_HOLD_FRAME) {
                    this.ballAnimation.frameX = this.BALL_HOLD_FRAME;
                    this.ballPhase = "holding";
                    this._kameHoldDirection = -1;
                }
            } else if (this.ballPhase === "holding") {
                const minFrame = this.BALL_HOLD_FRAME - 1;
                const maxFrame = this.BALL_HOLD_FRAME;

                if (this._kameHoldDirection == null) this._kameHoldDirection = -1;

                this.ballAnimation.frameX += this._kameHoldDirection;

                if (this.ballAnimation.frameX <= minFrame) {
                    this.ballAnimation.frameX = minFrame;
                    this._kameHoldDirection = 1;
                } else if (this.ballAnimation.frameX >= maxFrame) {
                    this.ballAnimation.frameX = maxFrame;
                    this._kameHoldDirection = -1;
                }
            } else if (this.ballPhase === "shotAndClose") {
                if (this.ballAnimation.frameX < this.ballAnimation.maxFrame) {
                    this.ballAnimation.frameX += 1;
                } else {
                    this.ballPhase = "closing";
                }
            } else if (this.ballPhase === "closing") {
                if (this.ballAnimation.frameX > 0) {
                    this.ballAnimation.frameX -= 1;
                } else {
                    this.ballStarted = false;
                    this.ballPhase = "idle";
                    this.ballAttack = null;
                    this.backToIdleSetUp();
                }
            }
        }

        if (
            this.ballAttack &&
            this.ballAttack.justLaunched &&
            (this.ballPhase === "holding" || this.ballPhase === "opening")
        ) {
            this.ballAttack.justLaunched = false;
            this.ballPhase = "shotAndClose";

            if (this.ballAnimation.frameX < this.BALL_SHOT_FRAME) {
                this.ballAnimation.frameX = this.BALL_SHOT_FRAME;
            }
        }
    }

    wingLogic(deltaTime) {
        if (!this.wingStarted) {
            this.wingStarted = true;
            this.wingDirection = 1;
            this.wingCycleCount = 0;
            this.wingFrameTimer = 0;

            this.wingAnimation.frameX = 0;
            this.wingAnimation.x = this.x;
            this.wingAnimation.y = this.y;

            const facingRight = this.shouldInvert;
            this.wingWindDirection = facingRight ? 1 : -1;
            this.wingWindActive = true;

            this.secondWingFlapPushTriggered = false;

            this.windParticles.length = 0;
            this.windSpawnTimer = 0;

            this._windGustStarted = true;
            this._windGustFading = false;

            this.game.audioHandler.enemySFX.playSound("ntharaxWindGustSound", true, true);
        }

        if (this.wingWindActive) {
            const player = this.game.player;
            const pushPerUpdate = this.mode2Active ? 48 : 40;

            if (this.wingWindDirection > 0) {
                const targetX = this.game.width - player.width;
                player.x = Math.min(player.x + pushPerUpdate, targetX);

                if (player.x >= targetX) {
                    this.wingWindActive = false;
                }
            } else if (this.wingWindDirection < 0) {
                const targetX = 0;
                player.x = Math.max(player.x - pushPerUpdate, targetX);

                if (player.x <= targetX) {
                    this.wingWindActive = false;
                }
            }
        }

        this.wingFrameTimer += deltaTime;
        if (this.wingFrameTimer < this.wingFrameInterval) return;
        this.wingFrameTimer = 0;

        this.wingAnimation.frameX += this.wingDirection;

        const max = this.wingAnimation.maxFrame;

        if (this.wingAnimation.frameX >= max) {
            this.wingAnimation.frameX = max;
            this.wingDirection = -1;
            this.game.audioHandler.enemySFX.playSound("ntharaxWingFlapSound", false, true);
            return;
        }

        if (this.wingDirection === -1 && this.wingAnimation.frameX <= 0) {
            this.wingAnimation.frameX = 0;
            this.wingCycleCount += 1;

            if (this.wingCycleCount >= 3) {
                this.wingStarted = false;
                this.wingWindActive = false;
                this.backToIdleSetUp();
            } else {
                this.wingDirection = 1;

                if (this.wingCycleCount === 2 && !this.secondWingFlapPushTriggered) {
                    const facingRightNow = this.shouldInvert;
                    this.wingWindDirection = facingRightNow ? 1 : -1;
                    this.wingWindActive = true;
                    this.secondWingFlapPushTriggered = true;
                }
            }
        }
    }

    spawnGalacticSpikeField(targetArrayName = "kneelSpikes") {
        if (this[targetArrayName] && this[targetArrayName].length > 0) return;

        const spikeW = 71;
        const idealStep = 100;
        const W = this.game.width;

        const count = Math.floor((W - spikeW) / idealStep) + 1;

        const gaps = Math.max(1, count - 1);
        const exactStep = (W - spikeW) / gaps;

        this[targetArrayName] = [];
        for (let i = 0; i < count; i++) {
            const x = i * exactStep;

            const spike = new GalacticSpike(this.game, x, { mode2Active: this.mode2Active });

            this.game.enemies.push(spike);
            this[targetArrayName].push(spike);
        }
    }

    kneelLogic(deltaTime) {
        if (!this.kneelStarted) {
            this.kneelStarted = true;
            this.kneelFrameTimer = 0;

            this.kneelAnimation.frameX = 0;
            this.kneelAnimation.x = this.x;
            this.kneelAnimation.y = this.y;

            this.kneelSpikeAttackInitialized = false;
            this.kneelSpikes = [];

            this.kneelPhase = "toMax";
            this._kneelHoldToggle = 0;
        }

        const max = this.kneelAnimation.maxFrame;
        const last2 = Math.max(0, max - 1);

        if (this.kneelPhase === "toMax") {
            this.kneelFrameTimer += deltaTime;
            if (this.kneelFrameTimer < this.kneelFrameInterval) return;
            this.kneelFrameTimer = 0;

            this.kneelAnimation.frameX += 1;

            if (this.kneelAnimation.frameX >= max) {
                this.kneelAnimation.frameX = max;

                if (!this.kneelSpikeAttackInitialized) {
                    this.kneelSpikeAttackInitialized = true;
                    this.spawnGalacticSpikeField("kneelSpikes");
                }

                this.kneelPhase = "holding";
                this._kneelHoldToggle = 0;
            }
            return;
        }

        if (this.kneelPhase === "holding") {
            this.kneelFrameTimer += deltaTime;
            if (this.kneelFrameTimer >= this.kneelFrameInterval) {
                this.kneelFrameTimer = 0;
                this._kneelHoldToggle = 1 - this._kneelHoldToggle;
                this.kneelAnimation.frameX = this._kneelHoldToggle ? last2 : max;
            } else {
                if (this.kneelAnimation.frameX !== max && this.kneelAnimation.frameX !== last2) {
                    this.kneelAnimation.frameX = max;
                }
            }

            const activeSpikes =
                this.kneelSpikes &&
                this.kneelSpikes.filter(s => s && !s.markedForDeletion);

            if (!activeSpikes || activeSpikes.length === 0) {
                this.kneelPhase = "returning";
                this.kneelFrameTimer = 0;
                this.kneelAnimation.frameX = max;
                return;
            }

            const anyRetracting = activeSpikes.some(s => s.phase === "retract");

            if (anyRetracting) {
                this.kneelPhase = "returning";
                this.kneelFrameTimer = 0;
                this.kneelAnimation.frameX = max;
                return;
            }

            return;
        }

        if (this.kneelPhase === "returning") {
            this.kneelFrameTimer += deltaTime;
            if (this.kneelFrameTimer < this.kneelFrameInterval) return;
            this.kneelFrameTimer = 0;

            this.kneelAnimation.frameX -= 1;

            if (this.kneelAnimation.frameX <= 0) {
                this.kneelAnimation.frameX = 0;

                this.kneelStarted = false;
                this.kneelSpikeAttackInitialized = false;
                this.kneelSpikes = [];
                this.kneelPhase = "toMax";
                this._kneelHoldToggle = 0;

                this.backToIdleSetUp();
            }
        }
    }

    getBeamTimings(screenDist) {
        const splitAt = screenDist * 0.50;
        const baseSlowStartAt = screenDist * 0.42;

        if (!this.mode2Active) {
            return { slowStartAt: baseSlowStartAt, splitAt };
        }

        const slowWindow = Math.max(1, splitAt - baseSlowStartAt);
        const slowStartAt = splitAt - slowWindow * 0.5;

        return { slowStartAt: Math.min(splitAt - 1, slowStartAt), splitAt };
    }

    purpleLogic(deltaTime) {
        if (!this.purpleStarted) {
            this.purpleStarted = true;
            this.purpleFrameTimer = 0;

            this.purpleAnimation.frameX = 0;
            this.purpleAnimation.x = this.x;
            this.purpleAnimation.y = this.y;

            const screenDist = this.game.width;
            const { slowStartAt, splitAt } = this.getBeamTimings(screenDist);

            const bounceBonus = this.mode2Active ? 1 : 0;

            const orb = new PurpleBeamOrb(this.game, this.x, this.y, 0, 0, {
                isCharging: true,
                chargeFollowBoss: this,

                getMode2Active: () => this.mode2Active,

                maxBounces: 5 + bounceBonus,
                launchSpeed: 1200,
                fireSoundId: "purpleFireSound",

                totalDistance: screenDist,
                slowStartAt,
                splitAt,
                minSpeed: 60,
                splitSpeed: 950,
                splitAngle: Math.PI / 8,
            });

            this.game.enemies.push(orb);
            this.purpleOrb = orb;

            this.game.audioHandler.enemySFX.playSound("purpleChargeSound", false, true);
        }

        this.purpleFrameTimer += deltaTime;
        if (this.purpleFrameTimer >= this.purpleFrameInterval) {
            this.purpleFrameTimer = 0;

            if (this.purpleAnimation.frameX < this.purpleAnimation.maxFrame) {
                this.purpleAnimation.frameX += 1;
            }
        }

        const max = this.purpleAnimation.maxFrame;
        const animDone = this.purpleAnimation.frameX >= max;

        if (animDone && this.purpleOrb && !this.purpleOrb.justFired) {
            this.purpleOrb.fireNow();
        }

        if (animDone) {
            this.purpleStarted = false;
            this.purpleOrb = null;
            this.backToIdleSetUp();
        }
    }

    yellowLogic(deltaTime) {
        if (!this.yellowStarted) {
            this.yellowStarted = true;
            this.yellowFrameTimer = 0;

            this.yellowAnimation.frameX = 0;
            this.yellowAnimation.x = this.x;
            this.yellowAnimation.y = this.y;

            const screenDist = this.game.width;
            const { slowStartAt, splitAt } = this.getBeamTimings(screenDist);

            const bounceBonus = this.mode2Active ? 1 : 0;

            const orb = new YellowBeamOrb(this.game, this.x, this.y, 0, 0, {
                isCharging: true,
                chargeFollowBoss: this,

                getMode2Active: () => this.mode2Active,

                maxBounces: 3 + bounceBonus,
                launchSpeed: 1200,
                fireSoundId: "purpleFireSound",

                totalDistance: screenDist,
                slowStartAt,
                splitAt,
                minSpeed: 60,
                splitSpeed: 950,
                splitAngle: Math.PI / 8,
            });

            this.game.enemies.push(orb);
            this.yellowOrb = orb;
        }

        this.yellowFrameTimer += deltaTime;
        if (this.yellowFrameTimer >= this.yellowFrameInterval) {
            this.yellowFrameTimer = 0;

            if (this.yellowAnimation.frameX < this.yellowAnimation.maxFrame) {
                this.yellowAnimation.frameX += 1;
            }
        }

        const max = this.yellowAnimation.maxFrame;
        const animDone = this.yellowAnimation.frameX >= max;

        if (animDone && this.yellowOrb && !this.yellowOrb.justFired) {
            this.yellowOrb.fireNow();
        }

        if (animDone) {
            this.yellowStarted = false;
            this.yellowOrb = null;
            this.backToIdleSetUp();
        }
    }

    blackLogic(deltaTime) {
        if (!this.blackStarted) {
            this.blackStarted = true;
            this.blackFrameTimer = 0;

            this.blackAnimation.frameX = 0;
            this.blackAnimation.x = this.x;
            this.blackAnimation.y = this.y;

            const screenDist = this.game.width;
            const { slowStartAt, splitAt } = this.getBeamTimings(screenDist);

            const bounceBonus = this.mode2Active ? 1 : 0;

            const orb = new BlackBeamOrb(this.game, this.x, this.y, 0, 0, {
                isCharging: true,
                chargeFollowBoss: this,

                getMode2Active: () => this.mode2Active,

                maxBounces: 2 + bounceBonus,
                launchSpeed: 1200,

                totalDistance: screenDist,
                slowStartAt,
                splitAt,
                minSpeed: 60,
                splitSpeed: 950,
                splitAngle: Math.PI / 8,
            });

            this.game.enemies.push(orb);
            this.blackOrb = orb;
        }

        this.blackFrameTimer += deltaTime;
        if (this.blackFrameTimer >= this.blackFrameInterval) {
            this.blackFrameTimer = 0;

            if (this.blackAnimation.frameX < this.blackAnimation.maxFrame) {
                this.blackAnimation.frameX += 1;
            }
        }

        const max = this.blackAnimation.maxFrame;
        const animDone = this.blackAnimation.frameX >= max;

        if (animDone && this.blackOrb && !this.blackOrb.justFired) {
            this.blackOrb.fireNow();
        }

        if (animDone) {
            this.blackStarted = false;
            this.blackOrb = null;
            this.backToIdleSetUp();
        }
    }

    asteroidLogic(deltaTime) {
        if (!this.asteroidStarted) {
            this.asteroidStarted = true;
            this.asteroidDirection = 1;
            this.asteroidFrameTimer = 0;

            this.asteroidAnimation.frameX = 0;
            this.asteroidAnimation.x = this.x;
            this.asteroidAnimation.y = this.y;

            this._asteroidsSpawned = false;
        }

        this.asteroidFrameTimer += deltaTime;
        if (this.asteroidFrameTimer < this.asteroidFrameInterval) return;
        this.asteroidFrameTimer = 0;

        this.asteroidAnimation.frameX += this.asteroidDirection;

        const max = this.asteroidAnimation.maxFrame;

        if (
            this.asteroidDirection === 1 &&
            this.asteroidAnimation.frameX === max &&
            !this._asteroidsSpawned
        ) {
            this._asteroidsSpawned = true;

            if (this.mode2Active) {
                for (let i = 0; i < 8; i++) {
                    this.game.enemies.push(new PurpleAsteroid(this.game));
                }
                for (let i = 0; i < 2; i++) {
                    this.game.enemies.push(new BlueAsteroid(this.game));
                }
            } else {
                for (let i = 0; i < 10; i++) {
                    this.game.enemies.push(new PurpleAsteroid(this.game));
                }
            }

            this.game.audioHandler.enemySFX.playSound("elyvorg_meteor_falling_sound", true);

            this.game.startShake(450);
        }

        if (this.asteroidDirection === 1 && this.asteroidAnimation.frameX >= max) {
            this.asteroidAnimation.frameX = max;
            this.asteroidDirection = -1;
            return;
        }

        if (this.asteroidDirection === -1 && this.asteroidAnimation.frameX <= 0) {
            this.asteroidAnimation.frameX = 0;
            this.asteroidStarted = false;
            this._asteroidsSpawned = false;
            this.backToIdleSetUp();
        }
    }

    distortionLogic(deltaTime) {
        this.ntharaxDistortionAnimation.update(deltaTime);

        if (this.ntharaxDistortionAnimation.frameX === 0) {
            this.game.audioHandler.enemySFX.playSound("distortionChargeSound", false, true);
        }

        if (this.ntharaxDistortionAnimation.frameX >= this.ntharaxDistortionAnimation.maxFrame) {
            this.game.distortionActive = true;
            this.game.audioHandler.enemySFX.playSound("distortionStartSound", false, true);

            this.distortionEffectTimer = 0;

            this.ntharaxDistortionAnimation.frameX = 0;
            this.ntharaxDistortionAnimation.frameTimer = 0;

            this.backToIdleSetUp();
        }
    }

    updateDistortionEffect(deltaTime) {
        if (this.game.distortionActive) {
            this.distortionEffectTimer += deltaTime;

            const duration = this.mode2Active
                ? this.distortionMode2Duration
                : this.distortionNormalDuration;

            if (this.distortionEffectTimer >= duration) {
                this.game.distortionActive = false;
                this.game.audioHandler.enemySFX.playSound("distortionEndSound", false, true);
            }
        }

        if (!this.game.distortionActive) {
            const fadedOut = !this.game.distortionEffect || this.game.distortionEffect.amount <= 0.01;
            if (fadedOut) {
                this.distortionEffectTimer = 0;
            }
        }
    }

    spawnSlapShockwaves() {
        const cfg = this.slapShockwave;

        const groundY = this.originalY + this.height;
        const centerX = this.x + this.width * 0.5;

        const countPerSide = this.mode2Active ? cfg.countPerSideMode2 : cfg.countPerSide;
        const speed = this.mode2Active ? cfg.speedMode2 : cfg.speed;

        const maxLife =
            this.mode2Active
                ? (cfg.maxLifeMsMode2 ?? cfg.maxLifeMs)
                : cfg.maxLifeMs;

        const offscreenMargin =
            this.mode2Active
                ? (cfg.offscreenMarginMode2 ?? cfg.offscreenMargin)
                : cfg.offscreenMargin;

        const spacing = cfg.spacing;

        for (let i = 0; i < countPerSide; i++) {
            const offset = i * spacing;

            this.game.enemies.push(
                new GroundShockwaveRing(this.game, centerX - offset, groundY, -1, {
                    speed,
                    maxLife,
                    offscreenMargin,
                    startRadius: cfg.startRadius,
                    endRadius: cfg.endRadius,
                    thickness: cfg.thickness,
                    hitWidth: cfg.hitWidth,
                    hitHeight: cfg.hitHeight,

                    mode2Active: this.mode2Active,
                })
            );

            this.game.enemies.push(
                new GroundShockwaveRing(this.game, centerX + offset, groundY, 1, {
                    speed,
                    maxLife,
                    offscreenMargin,
                    startRadius: cfg.startRadius,
                    endRadius: cfg.endRadius,
                    thickness: cfg.thickness,
                    hitWidth: cfg.hitWidth,
                    hitHeight: cfg.hitHeight,

                    mode2Active: this.mode2Active,
                })
            );
        }

        this.game.startShake(this.mode2Active ? 520 : 380);
        this.game.audioHandler.enemySFX.playSound("slapGroundSound", false, true);
    }

    slapLogic(deltaTime) {
        if (!this.slapStarted) {
            this.slapStarted = true;

            this.slapReachedEnd = false;
            this.slapGoingBack = false;

            this.slapFrameTimer = 0;

            this.slapHitsDone = 0;
            this.slapWobbleToggle = 0;

            this.slapAnimation.frameX = 0;
            this.slapAnimation.x = this.x;
            this.slapAnimation.y = this.y;
        }

        const max = this.slapAnimation.maxFrame;

        const hitsTarget = this.mode2Active
            ? this.slapHitsTargetMode2
            : this.slapHitsTargetNormal;

        if (!this.slapReachedEnd && !this.slapGoingBack) {
            this.slapFrameTimer += deltaTime;
            if (this.slapFrameTimer < this.slapFrameInterval) return;
            this.slapFrameTimer = 0;

            this.slapAnimation.frameX += 1;

            if (this.slapAnimation.frameX >= max) {
                this.slapAnimation.frameX = max;
                this.slapReachedEnd = true;

                this.spawnSlapShockwaves();
                this.slapHitsDone = 1;

                if (this.slapHitsDone >= hitsTarget) {
                    this.slapGoingBack = true;
                    this.slapFrameTimer = 0;
                }
            }
            return;
        }

        if (this.slapReachedEnd && !this.slapGoingBack) {
            this.slapFrameTimer += deltaTime;
            if (this.slapFrameTimer < this.slapFrameInterval) return;
            this.slapFrameTimer = 0;

            if (this.slapWobbleToggle === 0) {
                this.slapAnimation.frameX = Math.max(0, max - 1);
                this.slapWobbleToggle = 1;
                return;
            }

            this.slapAnimation.frameX = max;
            this.slapWobbleToggle = 0;

            this.spawnSlapShockwaves();
            this.slapHitsDone += 1;

            if (this.slapHitsDone >= hitsTarget) {
                this.slapGoingBack = true;
                this.slapFrameTimer = 0;
            }
            return;
        }

        if (this.slapGoingBack) {
            this.slapFrameTimer += deltaTime;
            if (this.slapFrameTimer < this.slapFrameInterval) return;
            this.slapFrameTimer = 0;

            this.slapAnimation.frameX -= 1;

            if (this.slapAnimation.frameX <= 0) {
                this.slapAnimation.frameX = 0;

                this.slapStarted = false;
                this.slapReachedEnd = false;
                this.slapGoingBack = false;

                this.slapFrameTimer = 0;
                this.slapHitsDone = 0;
                this.slapWobbleToggle = 0;

                this.backToIdleSetUp();
            }
        }
    }

    tentacleLogic(deltaTime) {
        if (!this.tentacleStarted) {
            this.tentacleStarted = true;
            this.tentacleReachedEnd = false;
            this.tentacleGoingBack = false;
            this.tentacleFrameTimer = 0;

            this.tentacleAnimation.frameX = 0;
            this.tentacleAnimation.x = this.x;
            this.tentacleAnimation.y = this.y;

            this.undergroundTentaclesSpawned = false;
            this.undergroundTentacles = [];

            this.game.startShake(0);

            if (
                !this.undergroundRumbleStarted &&
                this.game.audioHandler &&
                this.game.audioHandler.enemySFX
            ) {
                this.undergroundRumbleStarted = true;
                this.game.audioHandler.enemySFX.playSound(
                    "groundRumbleSound",
                    false,
                    true
                );
            }
        }

        const max = this.tentacleAnimation.maxFrame;

        if (!this.tentacleReachedEnd && !this.tentacleGoingBack) {
            this.tentacleFrameTimer += deltaTime;
            if (this.tentacleFrameTimer < this.tentacleFrameInterval) return;

            this.tentacleFrameTimer = 0;
            this.tentacleAnimation.frameX += 1;

            if (this.tentacleAnimation.frameX >= max) {
                this.tentacleAnimation.frameX = max;
                this.tentacleReachedEnd = true;

                this.spawnUndergroundTentacles();
            }
            return;
        }

        if (this.tentacleReachedEnd && !this.tentacleGoingBack) {
            this.tentacleAnimation.frameX = max;

            const tentaclesStillActive =
                this.undergroundTentacles &&
                this.undergroundTentacles.length > 0;

            if (tentaclesStillActive) return;

            this.tentacleGoingBack = true;
            this.tentacleFrameTimer = 0;
        }

        if (this.tentacleGoingBack) {
            this.tentacleFrameTimer += deltaTime;
            if (this.tentacleFrameTimer < this.tentacleFrameInterval) return;

            this.tentacleFrameTimer = 0;
            this.tentacleAnimation.frameX -= 1;

            if (this.tentacleAnimation.frameX <= 0) {
                this.tentacleAnimation.frameX = 0;

                this.tentacleStarted = false;
                this.tentacleReachedEnd = false;
                this.tentacleGoingBack = false;
                this.tentacleFrameTimer = 0;

                this.game.stopShake();

                if (
                    this.undergroundRumbleStarted &&
                    this.game.audioHandler &&
                    this.game.audioHandler.enemySFX &&
                    this.game.audioHandler.enemySFX.fadeOutAndStop
                ) {
                    this.game.audioHandler.enemySFX.fadeOutAndStop(
                        "groundRumbleSound",
                        1200
                    );
                }
                this.undergroundRumbleStarted = false;

                this.backToIdleSetUp();
            }
        }
    }

    triggerHealingBurst() {
        const burst = new HealingStarBurstCollision(this.game, this, {
            followTarget: this,
            soundId: "healingStarSound",
            playSound: true,
        });
        burst.start();
        this.healingStarBursts.push(burst);

        const overhealCap = this.maxLives * (1 + (this.overhealPercent ?? 0));
        const healAmt = 3;
        this.lives = Math.min(this.lives + healAmt, overhealCap);

        if (this.mode2Pending && !this.mode2 && !this.mode2Triggered && !this.isTransforming) {
            const thresholdLives = this.getMode2ThresholdLives();
            if (this.lives > thresholdLives) this.mode2Pending = false;
        }
    }

    healingLogic(deltaTime) {
        if (!this.healingStarted) {
            this.healingStarted = true;

            this.healingPhase = "forward";
            this.healingFrameTimer = 0;

            this.healingAnimation.frameX = 0;
            this.healingAnimation.x = this.x;
            this.healingAnimation.y = this.y;

            this.healingStarBursts = [];

            this.healingBurstsDone = 0;
            this.healingBurstTarget = this.mode2Active ? 2 : 1;

            this.healingMaxHoldTimer = 0;
        }

        const max = this.healingAnimation.maxFrame;
        const loopStartFrame = Math.min(this.healingLoopStartFrame, max);
        const rewindStartFrame = Math.min(this.healingRewindStartFrame, max);

        if (this.healingPhase === "forward") {
            this.healingFrameTimer += deltaTime;
            if (this.healingFrameTimer < this.healingFrameInterval) return;
            this.healingFrameTimer = 0;

            this.healingAnimation.frameX += 1;

            if (this.healingAnimation.frameX >= max) {
                this.healingAnimation.frameX = max;

                this.triggerHealingBurst();
                this.healingBurstsDone += 1;

                if (this.healingBurstsDone >= this.healingBurstTarget) {
                    this.healingPhase = "rewind";
                    this.healingFrameTimer = 0;
                    this.healingAnimation.frameX = rewindStartFrame;
                } else {
                    this.healingPhase = "holdMax";
                    this.healingMaxHoldTimer = 0;
                }
            }
            return;
        }

        if (this.healingPhase === "holdMax") {
            this.healingAnimation.frameX = max;

            this.healingMaxHoldTimer += deltaTime;
            if (this.healingMaxHoldTimer < this.healingMaxHoldDuration) return;

            this.healingAnimation.frameX = loopStartFrame;
            this.healingFrameTimer = 0;
            this.healingPhase = "pulseUp";
            return;
        }

        if (this.healingPhase === "pulseUp") {
            this.healingFrameTimer += deltaTime;
            if (this.healingFrameTimer < this.healingFrameInterval) return;
            this.healingFrameTimer = 0;

            this.healingAnimation.frameX += 1;

            if (this.healingAnimation.frameX >= max) {
                this.healingAnimation.frameX = max;

                this.triggerHealingBurst();
                this.healingBurstsDone += 1;

                if (this.healingBurstsDone >= this.healingBurstTarget) {
                    this.healingPhase = "rewind";
                    this.healingFrameTimer = 0;
                    this.healingAnimation.frameX = rewindStartFrame;
                } else {
                    this.healingPhase = "holdMax";
                    this.healingMaxHoldTimer = 0;
                }
            }
            return;
        }

        if (this.healingPhase === "rewind") {
            this.healingFrameTimer += deltaTime;
            if (this.healingFrameTimer < this.healingFrameInterval) return;
            this.healingFrameTimer = 0;

            this.healingAnimation.frameX -= 1;

            if (this.healingAnimation.frameX <= 0) {
                this.healingAnimation.frameX = 0;

                this.healingStarted = false;
                this.healingPhase = "idle";

                this.healingFrameTimer = 0;
                this.healingBurstsDone = 0;
                this.healingBurstTarget = 0;
                this.healingMaxHoldTimer = 0;

                this.backToIdleSetUp();
            }
        }
    }

    checkIfDefeated() {
        if (this._defeatTriggered) return;
        if (this.lives <= 0) {
            this._defeatTriggered = true;
            this.state = "idle";
            this.flyStarted = false;
            this.flyPhase = "idle";
            this.kamehameha = null;
            this.kamehameha2 = null;

            this.defeatCommon({
                bossId: "ntharax",
                bossClass: NTharax,
                battleThemeId: "ntharaxBattleTheme",
                onBeforeClear: () => {
                    this.game.stopShake();
                    this.game.distortionActive = false;
                    if (this.game.distortionEffect.reset) this.game.distortionEffect.reset();

                    setTimeout(() => {
                        this.y = this.originalY;
                        this.mode2 = false;
                        this.mode2Triggered = false;
                        this.mode2Pending = false;
                        this.isTransforming = false;
                        this.transformPhase = "idle";
                        this.transformTimer = 0;
                        this.transformParticles.length = 0;
                        this.transformExplodeParticles.length = 0;
                        this.transformBall.radius = 0;
                        this.transformBall.targetRadius = 0;
                        this.transformBall.alpha = 0;
                        this.applyMode2Tuning();
                    }, 200);
                },
            });
        }
    }

    startRunSFX() {
        if (this._runSfxPlaying) return;
        this._runSfxPlaying = true;

        const rate = this.mode2Active ? this.mode2FpsMult : 1.2;

        this.game.audioHandler.enemySFX.playSound("bossRunningSound", true, true, false, { playbackRate: rate });
    }

    stopRunSFX() {
        if (!this._runSfxPlaying) return;
        this._runSfxPlaying = false;

        this.game.audioHandler.enemySFX.stopSound("bossRunningSound");
    }

    updateRunSFXEdge() {
        const runningNow = this.state === "run";

        if (runningNow && !this._wasRunningLastFrame) {
            this.startRunSFX();
        }

        if (!runningNow && this._wasRunningLastFrame) {
            this.stopRunSFX();
        }

        this._wasRunningLastFrame = runningNow;
    }

    runLogic() {
        if (this.mode2RunToMiddle) {
            const tx = this.mode2MiddleTargetX;
            const step = this.runningDirection;

            this.x += step;

            if ((step > 0 && this.x >= tx) || (step < 0 && this.x <= tx)) {
                this.x = tx;
                this.mode2RunToMiddle = false;
                this.runAnimation.x = this.x;
                this.runAnimation.y = this.y;

                this.stopRunSFX();
                this.backToIdleSetUp();
            }
            return;
        }

        this.x += this.runningDirection;

        if (this.runStopAtTheMiddle && this.isInTheMiddle) {
            this.stopRunSFX();
            this.backToIdleSetUp();
            this.runStopAtTheMiddle = false;
        }
    }

    stateRandomiser() {
        if (this.isTransforming || this.state === "transform") return;

        const allStates = [
            "run",
            "jump",
            "tentacle",
            "healing",
            "ball",
            "wing",
            "purple",
            "yellow",
            "black",
            "distortion",
            "kneel",
            "burrow",
            "laser",
            "asteroid",
            "slap",
        ];

        if (this.game.gameOver) {
            if (this.isInTheMiddle) {
                this.runningDirection = this.getRunStep();
                this.state = "run";
                this.startRunSFX();
            } else {
                this.state = "idle";
            }
            return;
        }

        this.runStateCounter++;
        this.flyStateCounter++;
        this.healStateCounter++;

        if (this.state !== "fly") {
            this.shouldInvert =
                this.game.player.x + this.game.player.width / 2 >
                this.x + this.width / 2;
        }

        if (
            this.healStateCounter >= this.healStateCounterLimit &&
            this.state !== "healing"
        ) {
            this.healStateCounter = 0;
            this.healStateCounterLimit = Math.floor(12 + Math.random() * 4); // 12 to 15

            this.state = "healing";
            this.healingStarted = false;
            this.healingPhase = "idle";
            this.healingFrameTimer = 0;
            this.healingBurstsDone = 0;
            this.healingBurstTarget = 0;
            this.healingMaxHoldTimer = 0;
            this.healingStarBursts = [];

            this.healingAnimation.frameX = 0;
            this.healingAnimation.frameTimer = 0;
            this.healingAnimation.x = this.x;
            this.healingAnimation.y = this.y;

            return;
        }

        if (this.flyStateCounter >= this.flyStateThreshold) {
            this.state = "fly";

            this.flyStateCounter = 0;
            this.flyStateThreshold = Math.floor(Math.random() * 6) + 15;

            this.flyStarted = false;
            this.flyPhase = "idle";
            this.flyLockedInvert = this.shouldInvert;

            this.kamehameha = null;
            this.kamehameha2 = null;
            this.kameDirection = "right";
            this.kameHoldTimer = 0;

            this.flyAnimation.frameX = 0;
            this.flyAnimation.frameTimer = 0;
            this.flyAnimation.x = this.x;
            this.flyAnimation.y = this.y;

            return;
        }

        if (
            (this.runStateCounter >= this.runStateCounterLimit && this.isInTheMiddle === false) ||
            (this.runStateCounter >= this.runStateCounterLimit &&
                this.isInTheMiddle &&
                this.previousState !== "run")
        ) {
            this.runStopAtTheMiddle = false;
            this.runStateCounter = 0;
            this.runStateCounterLimit = Math.floor(4 + Math.random() * 3);

            const step = this.getRunStep();
            this.runningDirection = this.shouldInvert ? step : -step;

            this.state = "run";
            this.startRunSFX();
            this.runAnimation.x = this.x;
            this.runAnimation.y = this.y;
            this.runAnimation.frameX = 0;

            return;
        }

        const distortionBlocked = this.isDistortionActive;

        let selectedState;

        if (
            Math.random() < 0.1 &&
            this.previousState &&
            this.previousState !== "distortion" &&
            !distortionBlocked
        ) {
            selectedState = this.previousState;
        } else {
            do {
                selectedState = allStates[Math.floor(Math.random() * allStates.length)];
            } while (
                selectedState === this.previousState ||
                (distortionBlocked && selectedState === "distortion")
            );
        }

        this.state = selectedState;

        const stateAnimations = {
            run: this.runAnimation,
            jump: this.jumpAnimation,
            dive: this.diveAnimation,
            ball: this.ballAnimation,
            wing: this.wingAnimation,
            purple: this.purpleAnimation,
            yellow: this.yellowAnimation,
            black: this.blackAnimation,
            asteroid: this.asteroidAnimation,
            slap: this.slapAnimation,
            tentacle: this.tentacleAnimation,
            healing: this.healingAnimation,
            distortion: this.ntharaxDistortionAnimation,
            kneel: this.kneelAnimation,
            fly: this.flyAnimation,
            laser: this.laserAnimation,
        };

        const animation = stateAnimations[this.state];
        if (animation) {
            if (this.state === "run") {
                const step = this.getRunStep();
                this.startRunSFX();
                this.runningDirection = this.shouldInvert ? step : -step;
            }

            animation.x = this.x;
            animation.y = this.y;
            animation.frameX = 0;

            if (this.state === "ball") {
                this.ballStarted = false;
                this.ballFrameTimer = 0;
                this.ballPhase = "idle";
                this.ballAttack = null;
            }

            if (this.state === "wing") {
                this.wingStarted = false;
                this.wingDirection = 1;
                this.wingCycleCount = 0;
                this.wingFrameTimer = 0;
                this.wingWindActive = false;
                this.wingWindDirection = 0;
                this.secondWingFlapPushTriggered = false;

                this.windParticles.length = 0;
                this.windSpawnTimer = 0;
            }

            if (this.state === "purple") {
                this.purpleStarted = false;
                this.purpleFrameTimer = 0;
                this.purpleOrb = null;
                this.purpleAnimation.frameX = 0;
                this.purpleAnimation.frameTimer = 0;
            }

            if (this.state === "yellow") {
                this.yellowStarted = false;
                this.yellowFrameTimer = 0;
                this.yellowOrb = null;
                this.yellowAnimation.frameX = 0;
                this.yellowAnimation.frameTimer = 0;
            }

            if (this.state === "black") {
                this.blackStarted = false;
                this.blackFrameTimer = 0;
                this.blackOrb = null;
                this.blackAnimation.frameX = 0;
                this.blackAnimation.frameTimer = 0;
            }

            if (this.state === "asteroid") {
                this.asteroidStarted = false;
                this.asteroidDirection = 1;
                this.asteroidFrameTimer = 0;
            }

            if (this.state === "slap") {
                this.slapStarted = false;
                this.slapReachedEnd = false;
                this.slapGoingBack = false;
                this.slapFrameTimer = 0;
                this.slapHitsDone = 0;
                this.slapWobbleToggle = 0;
            }

            if (this.state === "tentacle") {
                this.tentacleStarted = false;
                this.tentacleReachedEnd = false;
                this.tentacleGoingBack = false;
                this.tentacleFrameTimer = 0;

                this.undergroundTentaclesSpawned = false;
                this.undergroundTentacles = [];
                this.undergroundRumbleStarted = false;
            }

            if (this.state === "healing") {
                this.healingStarted = false;

                this.healingPhase = "idle";
                this.healingBurstsDone = 0;
                this.healingBurstTarget = 0;

                this.healingFrameTimer = 0;
                this.healingMaxHoldTimer = 0;

                this.healingStarBursts = [];
            }

            if (this.state === "kneel") {
                this.kneelStarted = false;
                this.kneelFrameTimer = 0;
                this.kneelSpikeAttackInitialized = false;
                this.kneelSpikes = [];
                this.kneelAnimation.frameX = 0;
                this.kneelPhase = "toMax";
                this._kneelHoldToggle = 0;
            }

            if (this.state === "distortion") {
                this.ntharaxDistortionAnimation.frameX = 0;
                this.ntharaxDistortionAnimation.frameTimer = 0;
            }

            if (this.state === "fly") {
                this.flyStateCounter = 0;
                this.flyStarted = false;
                this.flyPhase = "idle";
                this.flyLockedInvert = this.shouldInvert;
                this.kamehameha = null;
                this.kamehameha2 = null;
                this.kameDirection = "right";
                this.kameHoldTimer = 0;
                this.flyAnimation.frameX = 0;
                this.flyAnimation.frameTimer = 0;
            }

            if (this.state === "laser") {
                this.laserStarted = false;
                this.laserDir = 1;
                this.laserFrameTimer = 0;
            }
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.checksBossIsFullyVisible("ntharax");
        this.updateRunSFXEdge();
        this.queueMode2IfThresholdCrossed();

        const boss = this.game.boss;
        const isTalkingToBoss = boss && boss.talkToBoss;

        if (!isTalkingToBoss) {
            this.checkIfDefeated();

            if (this.game.bossInFight && boss && boss.current === this && boss.id === "ntharax") {
                this.healingBarrierLogic(deltaTime);

                if (this.isTransforming || this.state === "transform") {
                    this.y = this.originalY;

                    this.shouldInvert =
                        this.game.player.x + this.game.player.width / 2 >
                        this.x + this.width / 2;

                    this.updateTransformFX(deltaTime);
                } else {
                    if (this.state === "idle") {
                        if (this.mode2Pending && !this.mode2Triggered && !this.mode2) {
                            const targetX = this.getMiddleTargetX();
                            if (Math.abs(this.x - targetX) > 0.5) {
                                this.startMode2RunToMiddle();
                                return;
                            }
                            this.startMode2Transform();
                            return;
                        }
                        this.edgeConstraintLogic("ntharax");
                        if (this.frameX === this.maxFrame) this.stateRandomiser();
                    } else if (this.state === "run") {
                        this.runAnimation.x = this.x;
                        this.runAnimation.y = this.y;
                        this.runAnimation.update(deltaTime);
                        if (!this.mode2RunToMiddle) {
                            this.edgeConstraintLogic("ntharax");
                        }
                        this.runLogic();
                    } else if (this.state === "jump") {
                        this.jumpLogic(deltaTime);
                    } else if (this.state === "dive") {
                        this.diveLogic();
                    } else if (this.state === "ball") {
                        this.ballLogic(deltaTime);
                    } else if (this.state === "wing") {
                        this.wingLogic(deltaTime);
                    } else if (this.state === "purple") {
                        this.purpleLogic(deltaTime);
                    } else if (this.state === "yellow") {
                        this.yellowLogic(deltaTime);
                    } else if (this.state === "black") {
                        this.blackLogic(deltaTime);
                    } else if (this.state === "asteroid") {
                        this.asteroidLogic(deltaTime);
                    } else if (this.state === "slap") {
                        this.slapLogic(deltaTime);
                    } else if (this.state === "tentacle") {
                        this.tentacleLogic(deltaTime);
                    } else if (this.state === "healing") {
                        this.healingLogic(deltaTime);
                    } else if (this.state === "distortion") {
                        this.distortionLogic(deltaTime);
                    } else if (this.state === "kneel") {
                        this.kneelLogic(deltaTime);
                    } else if (this.state === "fly") {
                        this.flyLogic(deltaTime);
                    } else if (this.state === "laser") {
                        this.laserLogic(deltaTime);
                    } else if (this.state === "burrow") {
                        this.burrowLogic(deltaTime);
                    }

                    if (this.x + this.width < 0 || this.x >= this.game.width) {
                        if (boss.current === this && boss.id === "ntharax") boss.isVisible = false;
                    }
                }
            }
        }

        this.updateDistortionEffect(deltaTime);
        this.updateWindParticles(deltaTime);
        this.updateDiveImpactParticles(deltaTime);

        if (this.healingStarBursts && this.healingStarBursts.length > 0) {
            for (let i = 0; i < this.healingStarBursts.length; i++) {
                this.healingStarBursts[i].update(deltaTime);
            }
            this.healingStarBursts = this.healingStarBursts.filter((b) => !b.markedForDeletion);
        }

        if (this.undergroundTentacles && this.undergroundTentacles.length > 0) {
            this.undergroundTentacles = this.undergroundTentacles.filter((t) => !t.markedForDeletion);
        }

        this.updateExplodePush(deltaTime);
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

        if (this.state !== "fly") {
            this.shouldInvert =
                this.game.player.x + this.game.player.width / 2 >
                this.x + this.width / 2;
        }

        const stateAnimations = {
            run: this.runAnimation,
            jump: this.jumpAnimation,
            dive: this.diveAnimation,
            ball: this.ballAnimation,
            wing: this.wingAnimation,
            purple: this.purpleAnimation,
            yellow: this.yellowAnimation,
            black: this.blackAnimation,
            asteroid: this.asteroidAnimation,
            slap: this.slapAnimation,
            tentacle: this.tentacleAnimation,
            healing: this.healingAnimation,
            distortion: this.ntharaxDistortionAnimation,
            kneel: this.kneelAnimation,
            fly: this.flyAnimation,
            laser: this.laserAnimation,
            transform: null,
            burrow: null,
        };

        const isBurrowing = this.state === "burrow";
        const groundY = this.originalY + this.height;

        const drawPose = () => {
            this.beginPowerVisual(context);

            if (this.state === "idle" || this.state === "transform" || this.state === "burrow") {
                if (isBurrowing) {
                    context.save();
                    context.beginPath();
                    context.rect(0, 0, this.game.width, groundY);
                    context.clip();
                }

                super.draw(context, this.shouldInvert);

                if (isBurrowing) context.restore();
                this.endPowerVisual(context);
                return;
            }

            const animation = stateAnimations[this.state];
            if (!animation) {
                this.endPowerVisual(context);
                return;
            }

            let invertForState = this.shouldInvert;
            if (this.state === "run") invertForState = this.runningDirection > 0;
            if (this.state === "fly") invertForState = this.flyLockedInvert;

            const worldAnchorX = this.x + this.width / 2;
            const worldAnchorY = this.y + this.height;

            const a = this.stateAnchors[this.state] || this.stateAnchors.idle;
            const anchorX = invertForState ? animation.width - a.x : a.x;

            animation.x = worldAnchorX - anchorX;
            animation.y = worldAnchorY - a.y;

            if (isBurrowing) {
                context.save();
                context.beginPath();
                context.rect(0, 0, this.game.width, groundY);
                context.clip();
            }

            animation.draw(context, invertForState);

            if (isBurrowing) context.restore();
            this.endPowerVisual(context);
        };

        if (this.isTransforming || this.state === "transform") {
            drawPose();
            this.drawTransformFX(context);
        } else {
            drawPose();
        }

        if (this.healingStarBursts && this.healingStarBursts.length > 0) {
            for (let i = 0; i < this.healingStarBursts.length; i++) {
                this.healingStarBursts[i].draw(context);
            }
        }

        if (this.state === "ball" && this.ballAttack) this.ballAttack.draw(context);

        this.drawWindParticles(context);
        this.drawDiveImpactParticles(context);
    }
}
