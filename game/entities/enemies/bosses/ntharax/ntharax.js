import { EnemyBoss } from "../../enemies.js";
import { normalizeDelta, BASE_FRAME_MS } from "../../../../config/constants.js";
import { HealingStarBurstCollision } from "../../../../animations/collisionAnimation/spriteCollisions.js";
import { DisintegrateCollision } from "../../../../animations/collisionAnimation/proceduralCollisions.js";
export * from "./ntharaxAbilities.js";
export * from "./ntharaxKamehameha.js";
import {
    HealingBarrier, LaserBall, GalacticSpike, PurpleBallOrb, PurpleBallOrbAttack,
    PurpleBeamOrb, YellowBeamOrb, BlackBeamOrb, AntennaeTentacle,
    GroundShockwaveRing, PurpleAsteroid, BlueAsteroid,
} from "./ntharaxAbilities.js";
import { Kamehameha } from "./ntharaxKamehameha.js";

export class NTharax extends EnemyBoss {
    constructor(game) {
        super(game, 193.5, 240, 5, "ntharaxIdle");
        this.maxLives = 100;
        this.overhealPercent = 0.20;
        this.lives = this.maxLives;
        this._defeatTriggered = false;
        this.cutsceneDisintegrating = false;
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
        this.runStateCounterLimit = 5 * BASE_FRAME_MS;
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
        this.flyStateThreshold = (Math.random() * 6 + 15) * BASE_FRAME_MS; // 15 to 20

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
        this.healStateCounterLimit = (12 + Math.random() * 4) * BASE_FRAME_MS; // 12 to 15

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

    _beamOrbLogic(deltaTime, cfg) {
        if (!this[cfg.startedKey]) {
            this[cfg.startedKey] = true;
            this[cfg.frameTimerKey] = 0;

            const anim = this[cfg.animationKey];
            anim.frameX = 0;
            anim.x = this.x;
            anim.y = this.y;

            const screenDist = this.game.width;
            const { slowStartAt, splitAt } = this.getBeamTimings(screenDist);
            const bounceBonus = this.mode2Active ? 1 : 0;

            const orb = new cfg.OrbClass(this.game, this.x, this.y, 0, 0, {
                isCharging: true,
                chargeFollowBoss: this,
                getMode2Active: () => this.mode2Active,
                maxBounces: cfg.maxBounces + bounceBonus,
                launchSpeed: 1200,
                ...(cfg.fireSoundId ? { fireSoundId: cfg.fireSoundId } : {}),
                totalDistance: screenDist,
                slowStartAt,
                splitAt,
                minSpeed: 60,
                splitSpeed: 950,
                splitAngle: Math.PI / 8,
            });

            this.game.enemies.push(orb);
            this[cfg.orbKey] = orb;

            if (cfg.chargeSound) {
                this.game.audioHandler.enemySFX.playSound(cfg.chargeSound, false, true);
            }
        }

        this[cfg.frameTimerKey] += deltaTime;
        if (this[cfg.frameTimerKey] >= this[cfg.frameIntervalKey]) {
            this[cfg.frameTimerKey] = 0;
            const anim = this[cfg.animationKey];
            if (anim.frameX < anim.maxFrame) anim.frameX += 1;
        }

        const anim = this[cfg.animationKey];
        const animDone = anim.frameX >= anim.maxFrame;

        if (animDone && this[cfg.orbKey] && !this[cfg.orbKey].justFired) {
            this[cfg.orbKey].fireNow();
        }

        if (animDone) {
            this[cfg.startedKey] = false;
            this[cfg.orbKey] = null;
            this.backToIdleSetUp();
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
        this._beamOrbLogic(deltaTime, {
            OrbClass: PurpleBeamOrb,
            startedKey: 'purpleStarted',
            frameTimerKey: 'purpleFrameTimer',
            frameIntervalKey: 'purpleFrameInterval',
            animationKey: 'purpleAnimation',
            orbKey: 'purpleOrb',
            maxBounces: 5,
            fireSoundId: 'purpleFireSound',
            chargeSound: 'purpleChargeSound',
        });
    }

    yellowLogic(deltaTime) {
        this._beamOrbLogic(deltaTime, {
            OrbClass: YellowBeamOrb,
            startedKey: 'yellowStarted',
            frameTimerKey: 'yellowFrameTimer',
            frameIntervalKey: 'yellowFrameInterval',
            animationKey: 'yellowAnimation',
            orbKey: 'yellowOrb',
            maxBounces: 3,
            fireSoundId: 'purpleFireSound',
        });
    }

    blackLogic(deltaTime) {
        this._beamOrbLogic(deltaTime, {
            OrbClass: BlackBeamOrb,
            startedKey: 'blackStarted',
            frameTimerKey: 'blackFrameTimer',
            frameIntervalKey: 'blackFrameInterval',
            animationKey: 'blackAnimation',
            orbKey: 'blackOrb',
            maxBounces: 2,
        });
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
            this.game.audioHandler.enemySFX.fadeOutAndStop('elyvorg_meteor_falling_sound', 4000);
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

            if (this.distortionEffectTimer >= this.distortionNormalDuration) {
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

        if (this.healingPhase === "forward" || this.healingPhase === "pulseUp") {
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

        this.game.audioHandler.enemySFX.playSound("bossRunningSound", true, true, { playbackRate: rate });
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

    runLogic(deltaTime) {
        const dt = normalizeDelta(deltaTime);
        if (this.mode2RunToMiddle) {
            const tx = this.mode2MiddleTargetX;
            const step = this.runningDirection;

            this.x += step * dt;

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

        this.x += this.runningDirection * dt;

        if (this.runStopAtTheMiddle && this.isInTheMiddle) {
            this.stopRunSFX();
            this.backToIdleSetUp();
            this.runStopAtTheMiddle = false;
        }
    }

    stateRandomiser(deltaTime) {
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

        this.runStateCounter += deltaTime;
        this.flyStateCounter += deltaTime;
        this.healStateCounter += deltaTime;

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
            this.healStateCounterLimit = (12 + Math.random() * 4) * BASE_FRAME_MS; // 12 to 15

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
            this.flyStateThreshold = (Math.random() * 6 + 15) * BASE_FRAME_MS;

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
            this.runStateCounterLimit = (4 + Math.random() * 3) * BASE_FRAME_MS;

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
                        if (this.frameX === this.maxFrame) this.stateRandomiser(deltaTime);
                    } else if (this.state === "run") {
                        this.runAnimation.x = this.x;
                        this.runAnimation.y = this.y;
                        this.runAnimation.update(deltaTime);
                        if (!this.mode2RunToMiddle) {
                            this.edgeConstraintLogic("ntharax");
                        }
                        this.runLogic(deltaTime);
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
        if (this.cutsceneDisintegrating) return;
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

