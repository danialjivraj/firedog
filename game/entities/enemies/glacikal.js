import { EnemyBoss, ImmobileGroundEnemy, Projectile, FallingEnemy, BurrowingGroundEnemy } from "./enemies.js";
import { IcyStormBallCollision, PointyIcicleShardCollision } from "../../animations/collisionAnimation.js";

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
        this.y += this.speedY;
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
        const groundY = this.game.height - this.height - this.game.groundMargin;

        const spiderCenterX = this.x + this.width / 2;
        const playerCenterX = this.game.player.x + this.game.player.width / 2;

        if (this.game.gameOver) {
            if (this.state === "falling") {
                this.shouldInvert = playerCenterX > spiderCenterX;

                this.y += this.speedY;
                if (this.y >= groundY) {
                    this.y = groundY;
                    this.speedY = 0;
                    this.state = "leaving";
                }
            } else {
                this.speedX = -this.chaseSpeed;
                this.x += this.speedX;
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

            this.y += this.speedY;

            if (this.y >= groundY) {
                this.y = groundY;
                this.speedY = 0;
                this.state = "chasing";
            }
        } else if (this.state === "chasing") {
            const dir = playerCenterX > spiderCenterX ? 1 : -1;
            this.speedX = dir * this.chaseSpeed;
            this.x += this.speedX;

            this.shouldInvert = this.speedX > 0;
        }

        this.advanceFrame(deltaTime);

        const offLeft = this.x + this.width < 0;
        const offRight = this.x > this.game.width;
        const dead = this.lives <= 0;

        if (offLeft || offRight || dead) {
            this.markedForDeletion = true;
            if (this.soundId) {
                this.game.audioHandler.enemySFX.playSound(this.soundId, false, true, true);
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
        this.x += this.speedX;
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

        const step = deltaTime / 16.6667;
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
            this.x += this.speedX;
        }

        this.advanceFrame(deltaTime);

        const offLeft = this.x + this.width < 0;
        const offRight = this.x > this.game.width;
        const offBottom = this.y > this.game.height;
        const offTop = this.y + this.height < 0;

        if (offLeft || offRight || offBottom || offTop || this.lives <= 0) {
            this.markedForDeletion = true;
            this.game.audioHandler.enemySFX.playSound(this.soundId, false, true, true);
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

// ------------------------------------------------------------------- Final Boss ------------------------------------------------------------------------
export class Glacikal extends EnemyBoss {
    constructor(game) {
        super(game, 116, 180, 5, "glacikalIdle");
        this.setFps(10);
        this.maxLives = 60;
        this.lives = this.maxLives;
        this.stateRandomiserTimer = 5000;
        this.stateRandomiserCooldown = 5000;
        this._defeatTriggered = false;

        // run
        this.runAnimation = new EnemyBoss(game, 142.8333333333333, 180, 5, "glacikalRunning");
        this.runAnimation.setFps(10);
        this.runningDirection = 0;
        this.runStateCounter = 0;
        this.runStateCounterLimit = 5;
        this.runStopAtTheMiddle = false;
        this.iceTrailTimer = 0;
        this.iceTrailNextSpawn = 0;
        this.iceTrailCooldownMin = 250;
        this.iceTrailCooldownMax = 700;
        this.iceTrailSpawnChance = 0.65;
        this.iceTrailMinGap = 60;

        // jump
        this.jumpAnimation = new EnemyBoss(game, 118.8333333333333, 180, 5, "glacikalJumping");
        this.jumpPhase = "ascend";
        this.jumpUpSpeed = 32;
        this.jumpDownSpeed = 22;
        this.offscreenY = -this.height - 60;
        this.jumpStartX = this.x;
        this.iceSpiderDropsTarget = 6;
        this.iceSpiderDropsFired = 0;
        this.iceSpiderDropTimer = 0;
        this.iceSpiderNextDrop = 0;
        this.iceSpiderDropCooldownMin = 240;
        this.iceSpiderDropCooldownMax = 520;
        this.postSpiderHangDuration = 1000;
        this.postSpiderHangTimer = 0;

        // ice slash
        this.iceSlashAttackAnimation = new EnemyBoss(game, 131.3333333333333, 180, 5, "glacikalAttacking");
        this.iceSlashAttackAnimation.setFps(10);
        this.canIceSlashAttack = true;

        // icy storm
        this.icyStormAnimation = new EnemyBoss(game, 116, 180, 23, "glacikalIcyStorm");
        this.canIcyStormAttack = true;
        this.isIcyStormActive = false;
        this.icyStormDuration = 15000;
        this.icyStormTimer = 0;
        this.icyStormPassiveTimer = 0;
        this.icyStormMaxOnScreen = 2;
        this.icyStormRainStarted = false;
        this.icyStormEffectRequested = false;

        // kneel down
        this.glacikalKneelDownAnimation = new EnemyBoss(game, 126.1666666666667, 180, 5, "glacikalKneelDown");
        this.glacikalKneelDownAnimation.setFps(10);
        this.canKneelDownAttack = true;
        this.isKneelDownActive = false;
        this.isKneelDownReversing = false;
        this.kneelDownLocked = false;
        this.kneelDownDuration = 7000;
        this.kneelDownTimer = 0;
        this.kneelIcicleTimer = 0;
        this.kneelNextIcicle = 0;
        this.kneelIcicleCooldownMin = 180;
        this.kneelIcicleCooldownMax = 220;
        this.kneelReverseTimer = 0;
        this.kneelRumbleStarted = false;
        this.kneelDownStateCooldown = 10;
        this.statesSinceKneelDown = 5;

        // kneel-down sub-abilities
        this.kneelAbilityTypes = ["topIcicles", "undergroundIcicle"];
        this.currentKneelAbility = "topIcicles";
        this.kneelUndergroundIcicles = [];

        // recharge
        this.glacikalRechargeAnimation = new EnemyBoss(game, 116, 180, 23, "glacikalRecharge");
        this.glacikalRechargeAnimation.setFps(10);
        this.rechargeLoops = 0;
        this.rechargeLoopsMax = 2;

        // extended arm / spinning ice balls
        this.glacikalExtendedArmAnimation = new EnemyBoss(game, 146, 180, 5, "glacikalExtendedArm");
        this.glacikalExtendedArmAnimation.setFps(10);
        this.canSpinningIceBallsAttack = true;
        this.isSpinningIceBallsActive = false;
        this.isSpinningIceBallsReversing = false;
        this.spinningLocked = false;
        this.spinningIceBallsCount = 2;
        this.spinningVolleyFired = false;
        this.spinningHoldTimer = 0;
        this.spinningHoldDuration = 450;
        this.spinningReverseTimer = 0;

        this.isRunSoundPlaying = false;
        this.canPlayJumpLandSound = false;

        // anchors
        this.stateAnchors = {
            idle: { x: 58, y: 180 },
            extendedArm: { x: 91, y: 180 },
            run: { x: 72, y: 180 },
            jump: { x: 60, y: 180 },
            icyStorm: { x: 58, y: 180 },
            iceSlashAttack: { x: 66, y: 180 },
            kneelDown: { x: 63, y: 180 },
            recharge: { x: 58, y: 180 },
        };
    }

    enterState(newState) {
        if (newState === "kneelDown") {
            this.statesSinceKneelDown = 0;
        } else if (newState !== "idle") {
            if (this.statesSinceKneelDown < 999999) {
                this.statesSinceKneelDown++;
            }
        }
        this.state = newState;
    }

    checkIfDefeated() {
        if (this._defeatTriggered) return;
        if (this.lives <= 0) {
            this._defeatTriggered = true;
            this.defeatCommon({
                bossId: "glacikal",
                bossClass: Glacikal,
                battleThemeId: "elyvorgBattleTheme",
                onBeforeClear: () => {
                    this.game.stopShake();
                    this.game.bossManager.releaseScreenEffect("glacikal_icy_storm");
                    this.icyStormEffectRequested = false;
                },
            });
        }
    }

    startSpinningIceBallsAttack() {
        this.canSpinningIceBallsAttack = false;

        this.spinningLocked = false;
        this.isSpinningIceBallsActive = false;
        this.isSpinningIceBallsReversing = false;

        this.spinningVolleyFired = false;
        this.spinningHoldTimer = 0;
        this.spinningReverseTimer = 0;

        const anim = this.glacikalExtendedArmAnimation;
        anim.frameX = 0;
        anim.frameTimer = 0;
        anim.x = this.x;
        anim.y = this.y;
    }

    fireSpinningVolley() {
        const playerCenterX = this.game.player.x + this.game.player.width / 2;
        const bossCenterX = this.x + this.width / 2;
        const directionRight = playerCenterX > bossCenterX;

        for (let i = 0; i < this.spinningIceBallsCount; i++) {
            const ball = new SpinningIceBalls(this.game, this, i, this.spinningIceBallsCount, directionRight);
            this.game.enemies.push(ball);
        }

        this.game.audioHandler.enemySFX.playSound("spinningIceBallsSound", false, true);
    }

    spinningIceBallsLogic(deltaTime) {
        const anim = this.glacikalExtendedArmAnimation;

        if (!this.spinningLocked && !this.isSpinningIceBallsReversing) {
            anim.frameTimer += deltaTime;
            if (anim.frameTimer >= anim.frameInterval) {
                anim.frameTimer = 0;
                if (anim.frameX < anim.maxFrame) anim.frameX++;

                if (anim.frameX >= anim.maxFrame) {
                    anim.frameX = anim.maxFrame;
                    this.spinningLocked = true;
                    this.isSpinningIceBallsActive = true;

                    if (!this.spinningVolleyFired) {
                        this.fireSpinningVolley();
                        this.spinningVolleyFired = true;
                    }

                    this.spinningHoldTimer = 0;
                }
            }
            return;
        }

        if (this.spinningLocked && !this.isSpinningIceBallsReversing) {
            anim.frameTimer += deltaTime;
            if (anim.frameTimer >= anim.frameInterval) {
                anim.frameTimer = 0;
                const max = anim.maxFrame;
                const min = Math.max(0, max - 1);
                anim.frameX = anim.frameX === max ? min : max;
            }
        }

        if (this.isSpinningIceBallsActive) {
            this.spinningHoldTimer += deltaTime;
            if (this.spinningHoldTimer >= this.spinningHoldDuration) {
                this.isSpinningIceBallsActive = false;
                this.isSpinningIceBallsReversing = true;
                this.spinningReverseTimer = 0;
            }
            return;
        }

        if (this.isSpinningIceBallsReversing) {
            this.spinningReverseTimer += deltaTime;
            if (this.spinningReverseTimer >= anim.frameInterval) {
                this.spinningReverseTimer = 0;
                anim.frameX--;

                if (anim.frameX <= 0) {
                    anim.frameX = 0;
                    this.isSpinningIceBallsReversing = false;
                    this.spinningLocked = false;
                    this.canSpinningIceBallsAttack = true;
                    this.backToIdleSetUp();
                }
            }
        }
    }

    throwIceSlash() {
        const playerIsOnRight = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2;

        const ICE_SLASH_SPEED = 13;
        const speedX = playerIsOnRight ? ICE_SLASH_SPEED : -ICE_SLASH_SPEED;

        const spawnX = playerIsOnRight ? this.x + this.width - 60 : this.x - 158 + 60;

        const spawnY = this.y + this.height * 0.5 - 75;

        this.game.enemies.push(new IceSlash(this.game, spawnX, spawnY, speedX));
        this.game.audioHandler.enemySFX.playSound("iceSlashSound", false, true);
    }

    iceSlashAttackLogic() {
        if (this.iceSlashAttackAnimation.frameX === this.iceSlashAttackAnimation.maxFrame && this.canIceSlashAttack) {
            this.canIceSlashAttack = false;
            this.throwIceSlash();
        }

        if (this.iceSlashAttackAnimation.frameX === 0 && !this.canIceSlashAttack) {
            this.backToIdleSetUp();
        }
    }

    resetIceSpiderDrops() {
        this.iceSpiderDropsFired = 0;
        this.iceSpiderDropTimer = 0;
        this.iceSpiderNextDrop =
            this.iceSpiderDropCooldownMin + Math.random() * (this.iceSpiderDropCooldownMax - this.iceSpiderDropCooldownMin);

        this.postSpiderHangTimer = 0;
    }

    startJumpAttack() {
        this.jumpPhase = "ascend";
        this.jumpStartX = this.x;
        this.resetIceSpiderDrops();

        this.game.audioHandler.enemySFX.playSound("glacikalJumpSound", false, true);
        this.canPlayJumpLandSound = true;
    }

    pickDifferentLandingX() {
        const pad = 20;
        const minX = pad;
        const maxX = this.game.width - this.width - pad;

        let newX = this.jumpStartX;
        for (let i = 0; i < 8; i++) {
            newX = minX + Math.random() * (maxX - minX);
            if (Math.abs(newX - this.jumpStartX) > this.width * 0.8) break;
        }
        this.x = newX;
    }

    spawnIceSpider() {
        const spiderWidth = 71.16666666666667;

        let spawnX;

        if (Math.random() < 0.5) {
            const playerCenterX = this.game.player.x + this.game.player.width / 2;
            const spread = 350;
            spawnX = playerCenterX + (Math.random() * spread - spread / 2);
        } else {
            spawnX = Math.random() * (this.game.width - spiderWidth);
        }

        spawnX = Math.max(0, Math.min(this.game.width - spiderWidth, spawnX));

        const spider = new IceSpider(this.game, spawnX);
        this.game.enemies.push(spider);
        this.game.audioHandler.enemySFX.playSound("iceSpiderSound", false, true);
    }

    jumpLogic(deltaTime) {
        const scale = deltaTime / 16.6667;
        this.speedY = 0;

        if (this.jumpPhase === "ascend") {
            this.y -= this.jumpUpSpeed * scale;
            if (this.y <= this.offscreenY) {
                this.y = this.offscreenY;
                this.jumpPhase = "airborne";
                this.resetIceSpiderDrops();
            }
        } else if (this.jumpPhase === "airborne") {
            this.iceSpiderDropTimer += deltaTime;

            if (this.iceSpiderDropsFired < this.iceSpiderDropsTarget && this.iceSpiderDropTimer >= this.iceSpiderNextDrop) {
                this.spawnIceSpider();
                this.iceSpiderDropsFired++;

                this.iceSpiderDropTimer = 0;
                this.iceSpiderNextDrop =
                    this.iceSpiderDropCooldownMin +
                    Math.random() * (this.iceSpiderDropCooldownMax - this.iceSpiderDropCooldownMin);
            }

            if (this.iceSpiderDropsFired >= this.iceSpiderDropsTarget) {
                this.postSpiderHangTimer += deltaTime;
                if (this.postSpiderHangTimer >= this.postSpiderHangDuration) {
                    this.pickDifferentLandingX();
                    this.jumpPhase = "descend";
                }
            }
        } else if (this.jumpPhase === "descend") {
            this.y += this.jumpDownSpeed * scale;

            if (this.y >= this.originalY) {
                this.y = this.originalY;

                if (this.canPlayJumpLandSound) {
                    this.game.audioHandler.enemySFX.playSound("glacikalJumpSound", false, true);
                    this.canPlayJumpLandSound = false;
                }

                this.jumpPhase = "ascend";
                this.backToIdleSetUp();
            }
        }
    }

    spawnIcyStormBalls(count) {
        const current = this.game.enemies.filter((e) => e instanceof IcyStormBall).length;
        const capacity = this.icyStormMaxOnScreen - current;
        if (capacity <= 0) return;

        const toSpawn = Math.min(capacity, count);
        for (let i = 0; i < toSpawn; i++) {
            this.game.enemies.push(new IcyStormBall(this.game));
        }
    }

    icyStormLogic() {
        const rainFrame = Math.max(1, Math.floor(this.icyStormAnimation.maxFrame * (17 / 23)));

        if (this.icyStormAnimation.frameX === 0 && !this.icyStormEffectRequested) {
            this.icyStormEffectRequested = true;

            this.game.bossManager.requestScreenEffect("glacikal_icy_storm", {
                rgb: [0, 60, 120],
                fadeInSpeed: 0.00298,
            });

            this.game.audioHandler.enemySFX.playSound("elyvorg_poison_drop_indicator_sound", false, true);
            this.game.audioHandler.enemySFX.playSound("glacikal_icy_storm_start", false, true);

            this.icyStormRainStarted = false;
        }

        if (this.icyStormAnimation.frameX === rainFrame && !this.icyStormRainStarted) {
            this.icyStormRainStarted = true;
            this.game.audioHandler.enemySFX.playSound("glacikal_icy_storm_rain", false, true);
        }

        if (this.icyStormAnimation.frameX === this.icyStormAnimation.maxFrame && this.canIcyStormAttack) {
            this.isIcyStormActive = true;
            this.canIcyStormAttack = false;

            this.icyStormTimer = 0;
            this.icyStormPassiveTimer = 0;

            this.spawnIcyStormBalls(3);
        }

        if (this.icyStormAnimation.frameX === this.icyStormAnimation.maxFrame) {
            this.backToIdleSetUp({ recordPreviousState: false });
        }
    }

    icyStormLogicTimer(deltaTime) {
        if (!this.isIcyStormActive) return;

        this.icyStormTimer += deltaTime;
        this.icyStormPassiveTimer += deltaTime;

        if (this.icyStormTimer <= this.icyStormDuration) {
            if (this.icyStormPassiveTimer >= 1000) {
                this.icyStormPassiveTimer -= 1000;

                const numDrops = Math.floor(Math.random() * 3) + 1;
                this.spawnIcyStormBalls(numDrops);

                this.game.audioHandler.enemySFX.playSound("glacikal_icy_storm_rain", false, true);
            }
        } else {
            this.isIcyStormActive = false;
            this.canIcyStormAttack = true;

            this.icyStormTimer = 0;
            this.icyStormPassiveTimer = 0;

            this.game.bossManager.releaseScreenEffect("glacikal_icy_storm");
            this.icyStormEffectRequested = false;
        }
    }

    trySpawnIceTrail() {
        const hasNearbyTrail = this.game.enemies.some((e) => e instanceof IceTrail && Math.abs(e.x - this.x) < this.iceTrailMinGap);
        if (hasNearbyTrail) return;

        if (Math.random() < this.iceTrailSpawnChance) {
            const spawnX = this.x + this.width / 2 - 16;
            this.game.enemies.push(new IceTrail(this.game, spawnX));
            this.game.audioHandler.enemySFX.playSound("iceTrailSound", false, true);
        }
    }

    runLogic(deltaTime) {
        this.x += this.runningDirection;

        if (this.runStopAtTheMiddle && this.isInTheMiddle) {
            this.backToIdleSetUp();
            this.runStopAtTheMiddle = false;
        }

        this.iceTrailTimer += deltaTime;
        if (this.iceTrailTimer > this.iceTrailNextSpawn) {
            this.trySpawnIceTrail();
            this.iceTrailTimer = 0;
            this.iceTrailNextSpawn = this.iceTrailCooldownMin + Math.random() * (this.iceTrailCooldownMax - this.iceTrailCooldownMin);
        }
    }

    pickUndergroundIcicleX() {
        const icicleWidth = 132;
        let spawnCenterX;

        if (Math.random() < 0.5) {
            const playerCenterX = this.game.player.x + this.game.player.width / 2;
            const spread = 260;
            spawnCenterX = playerCenterX + (Math.random() * spread - spread / 2);
        } else {
            spawnCenterX = Math.random() * this.game.width;
        }

        const halfW = icicleWidth * 0.5;
        spawnCenterX = Math.max(halfW, Math.min(this.game.width - halfW, spawnCenterX));
        return spawnCenterX;
    }

    startKneelDownAttack() {
        this.canKneelDownAttack = false;

        this.kneelDownLocked = false;
        this.isKneelDownActive = false;
        this.isKneelDownReversing = false;

        this.kneelDownTimer = 0;
        this.kneelIcicleTimer = 0;
        this.kneelNextIcicle = this.kneelIcicleCooldownMin + Math.random() * (this.kneelIcicleCooldownMax - this.kneelIcicleCooldownMin);

        this.kneelReverseTimer = 0;

        const anim = this.glacikalKneelDownAnimation;
        anim.frameX = 0;
        anim.frameTimer = 0;
        anim.x = this.x;
        anim.y = this.y;

        this.kneelRumbleStarted = false;

        this.currentKneelAbility = this.kneelAbilityTypes[Math.floor(Math.random() * this.kneelAbilityTypes.length)];
        this.kneelUndergroundIcicles = [];
    }

    kneelDownLogic(deltaTime) {
        const anim = this.glacikalKneelDownAnimation;

        if (!this.kneelDownLocked && !this.isKneelDownReversing) {
            anim.frameTimer += deltaTime;
            if (anim.frameTimer >= anim.frameInterval) {
                anim.frameTimer = 0;
                if (anim.frameX < anim.maxFrame) anim.frameX++;

                if (anim.frameX >= anim.maxFrame) {
                    anim.frameX = anim.maxFrame;
                    this.kneelDownLocked = true;

                    this.isKneelDownActive = true;
                    this.kneelDownTimer = 0;
                    this.kneelIcicleTimer = 0;

                    this.game.startShake();

                    if (!this.kneelRumbleStarted) {
                        this.kneelRumbleStarted = true;
                        this.game.audioHandler.enemySFX.playSound("groundRumbleSound", false, true);
                    }

                    if (this.currentKneelAbility === "undergroundIcicle") {
                        const spawnCenters = [];
                        const icicleWidth = 132;
                        const halfW = icicleWidth * 0.5;
                        const minGap = icicleWidth + 4;
                        const totalCount = 5;

                        let playerCenterX = this.game.player.x + this.game.player.width / 2;
                        playerCenterX = Math.max(halfW, Math.min(this.game.width - halfW, playerCenterX));
                        spawnCenters.push(playerCenterX);

                        for (let i = 1; i < totalCount; i++) {
                            let cx;
                            let attempts = 0;
                            const maxAttempts = 12;

                            do {
                                cx = this.pickUndergroundIcicleX();
                                attempts++;
                            } while (spawnCenters.some((existing) => Math.abs(cx - existing) < minGap) && attempts < maxAttempts);

                            spawnCenters.push(cx);
                        }

                        this.kneelUndergroundIcicles = [];
                        for (const cx of spawnCenters) {
                            const icicle = new UndergroundIcicle(this.game, cx);
                            this.kneelUndergroundIcicles.push(icicle);
                            this.game.enemies.push(icicle);
                        }
                    }
                }
            }
            return;
        }

        if (this.isKneelDownActive) {
            this.kneelDownTimer += deltaTime;
            this.kneelIcicleTimer += deltaTime;

            if (this.currentKneelAbility === "topIcicles") {
                if (this.kneelIcicleTimer > this.kneelNextIcicle) {
                    if (!this.isIcyStormActive) {
                        this.game.enemies.push(new PointyIcicleShard(this.game));
                    }
                    this.kneelIcicleTimer = 0;
                    this.kneelNextIcicle =
                        this.kneelIcicleCooldownMin + Math.random() * (this.kneelIcicleCooldownMax - this.kneelIcicleCooldownMin);
                }

                if (this.kneelDownTimer >= this.kneelDownDuration) {
                    this.isKneelDownActive = false;
                    this.isKneelDownReversing = true;
                    this.kneelReverseTimer = 0;

                    this.game.stopShake();
                    this.game.audioHandler.enemySFX.fadeOutAndStop("groundRumbleSound", 1200);
                }
            } else if (this.currentKneelAbility === "undergroundIcicle") {
                const allDone =
                    this.kneelUndergroundIcicles.length === 0 ||
                    this.kneelUndergroundIcicles.every((ic) => !ic || ic.markedForDeletion);

                if (allDone) {
                    this.isKneelDownActive = false;
                    this.isKneelDownReversing = true;
                    this.kneelReverseTimer = 0;

                    this.game.stopShake();
                    this.game.audioHandler.enemySFX.fadeOutAndStop("groundRumbleSound", 1200);
                }
            }

            return;
        }

        if (this.isKneelDownReversing) {
            this.kneelReverseTimer += deltaTime;
            if (this.kneelReverseTimer >= anim.frameInterval) {
                this.kneelReverseTimer = 0;
                anim.frameX--;

                if (anim.frameX <= 0) {
                    anim.frameX = 0;
                    this.isKneelDownReversing = false;
                    this.kneelDownLocked = false;
                    this.canKneelDownAttack = true;

                    this.previousState = "kneelDown";

                    this.backToRechargeSetUp();

                    const r = this.glacikalRechargeAnimation;
                    r.frameX = 0;
                    r.frameTimer = 0;
                    r.x = this.x;
                    r.y = this.y;

                    this.rechargeLoops = 0;
                }
            }
        }
    }

    rechargeLogic(deltaTime) {
        const anim = this.glacikalRechargeAnimation;
        anim.update(deltaTime);

        this.stateRandomiserTimer += deltaTime;

        if (
            this.stateRandomiserTimer >= this.stateRandomiserCooldown &&
            anim.frameX === anim.maxFrame
        ) {
            this.stateRandomiserTimer = 0;
            this.stateRandomiser();
        }
    }

    stateRandomiser() {
        const allStates = [
            "run",
            "jump",
            "icyStorm",
            "iceSlashAttack",
            "kneelDown",
            "extendedArm"
        ];
        if (this.game.gameOver) {
            if (this.isInTheMiddle) {
                this.runningDirection = 10;
                this.enterState("run");
            } else {
                this.state = "idle";
            }
            return;
        }

        this.runStateCounter++;

        this.shouldInvert = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2;

        if (
            (this.runStateCounter >= this.runStateCounterLimit && !this.isInTheMiddle) ||
            (this.runStateCounter >= this.runStateCounterLimit && this.isInTheMiddle && this.previousState !== "run")
        ) {
            this.runStopAtTheMiddle = false;
            this.runStateCounter = 0;
            this.runStateCounterLimit = Math.floor(4 + Math.random() * 3);

            this.runningDirection = this.shouldInvert ? 10 : -10;
            this.enterState("run");
            this.runAnimation.x = this.x;
            this.runAnimation.y = this.y;
            this.runAnimation.frameX = 0;
            return;
        }

        const shouldForceKneelDown =
            this.statesSinceKneelDown >= this.kneelDownStateCooldown && this.canKneelDownAttack && !this.isIcyStormActive;

        let selectedState;

        if (shouldForceKneelDown) {
            selectedState = "kneelDown";
        } else {
            if (Math.random() < 0.1 && this.previousState) {
                selectedState = this.previousState;
            } else {
                do {
                    selectedState = allStates[Math.floor(Math.random() * allStates.length)];
                } while (
                    selectedState === this.previousState ||
                    (this.isIcyStormActive && selectedState === "icyStorm") ||
                    (this.isIcyStormActive && selectedState === "kneelDown") ||
                    (!this.canKneelDownAttack && selectedState === "kneelDown") ||
                    (!this.canSpinningIceBallsAttack && selectedState === "extendedArm") ||
                    (selectedState === "kneelDown" && this.statesSinceKneelDown < this.kneelDownStateCooldown)
                );
            }
        }

        this.enterState(selectedState);

        const stateAnimations = {
            run: this.runAnimation,
            jump: this.jumpAnimation,
            icyStorm: this.icyStormAnimation,
            iceSlashAttack: this.iceSlashAttackAnimation,
            kneelDown: this.glacikalKneelDownAnimation,
            extendedArm: this.glacikalExtendedArmAnimation,
        };

        const animation = stateAnimations[this.state];
        if (animation) {
            if (this.state === "run") {
                this.runningDirection = this.shouldInvert ? 10 : -10;
            }
            if (this.state === "jump") {
                this.startJumpAttack();
            }
            if (this.state === "icyStorm") {
                this.icyStormRainStarted = false;
            }
            if (this.state === "iceSlashAttack") {
                this.canIceSlashAttack = true;
            }
            if (this.state === "kneelDown") {
                this.startKneelDownAttack();
            }
            if (this.state === "extendedArm") {
                this.startSpinningIceBallsAttack();
            }

            animation.x = this.x;
            animation.y = this.y;
            animation.frameX = 0;
        }
    }

    handleRunSound() {
        const sfx = this.game.audioHandler.enemySFX;
        if (!sfx) return;

        if (this.markedForDeletion || this.lives <= 0) {
            if (this.isRunSoundPlaying) {
                if (sfx.stopSound) sfx.stopSound("glacikalRunSound");
                else if (sfx.fadeOutAndStop) sfx.fadeOutAndStop("glacikalRunSound", 200);
                else sfx.playSound("glacikalRunSound", false, true, true);
                this.isRunSoundPlaying = false;
            }
            return;
        }

        if (this.state === "run" && !this.isRunSoundPlaying) {
            sfx.playSound("glacikalRunSound", false, true);
            this.isRunSoundPlaying = true;
        }

        if (this.state !== "run" && this.isRunSoundPlaying) {
            if (sfx.stopSound) sfx.stopSound("glacikalRunSound");
            else if (sfx.fadeOutAndStop) sfx.fadeOutAndStop("glacikalRunSound", 200);
            else sfx.playSound("glacikalRunSound", false, true, true);
            this.isRunSoundPlaying = false;
        }
    }

    update(deltaTime) {
        super.update(deltaTime);

        this.checksBossIsFullyVisible("glacikal");

        const boss = this.game.boss;
        const isTalkingToBoss = boss && boss.talkToBoss;

        if (!isTalkingToBoss) {
            this.checkIfDefeated();
            this.icyStormLogicTimer(deltaTime);

            if (boss && boss.runAway && boss.current === this && boss.id === "glacikal") {
                this.runningAway(deltaTime, "glacikal");
            } else if (this.game.bossInFight && boss && boss.current === this && boss.id === "glacikal") {
                if (this.state === "idle") {
                    this.edgeConstraintLogic("glacikal");
                    if (this.frameX === this.maxFrame) {
                        this.stateRandomiser();
                    }
                } else if (this.state === "run") {
                    this.runAnimation.update(deltaTime);
                    this.edgeConstraintLogic("glacikal");
                    this.runLogic(deltaTime);
                } else if (this.state === "jump") {
                    this.jumpAnimation.update(deltaTime);
                    this.jumpLogic(deltaTime);
                } else if (this.state === "icyStorm") {
                    this.icyStormAnimation.update(deltaTime);
                    this.icyStormLogic();
                } else if (this.state === "iceSlashAttack") {
                    this.iceSlashAttackAnimation.update(deltaTime);
                    this.iceSlashAttackLogic();
                } else if (this.state === "kneelDown") {
                    this.kneelDownLogic(deltaTime);
                } else if (this.state === "recharge") {
                    this.rechargeLogic(deltaTime);
                } else if (this.state === "extendedArm") {
                    this.spinningIceBallsLogic(deltaTime);
                }

                if (this.x + this.width < 0 || this.x >= this.game.width) {
                    if (boss.current === this && boss.id === "glacikal") {
                        boss.isVisible = false;
                    }
                }
            }
        }

        this.handleRunSound();
    }

    draw(context) {
        this.shouldInvert = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2;

        const stateAnimations = {
            run: this.runAnimation,
            jump: this.jumpAnimation,
            icyStorm: this.icyStormAnimation,
            iceSlashAttack: this.iceSlashAttackAnimation,
            kneelDown: this.glacikalKneelDownAnimation,
            recharge: this.glacikalRechargeAnimation,
            extendedArm: this.glacikalExtendedArmAnimation,
        };

        if (this.state === "idle") {
            super.draw(context, this.shouldInvert);
            return;
        }

        const animation = stateAnimations[this.state];
        if (!animation) return;

        let invertForState = this.shouldInvert;
        if (this.state === "run") {
            invertForState = this.runningDirection > 0;
        }

        const worldAnchorX = this.x + this.width / 2;
        const worldAnchorY = this.y + this.height;

        const a = this.stateAnchors[this.state] || this.stateAnchors.idle;
        const anchorX = invertForState ? animation.width - a.x : a.x;

        animation.x = worldAnchorX - anchorX;
        animation.y = worldAnchorY - a.y;

        animation.draw(context, invertForState);
    }
}
