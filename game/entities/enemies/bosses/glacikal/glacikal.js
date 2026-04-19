import { EnemyBoss } from "../../enemies.js";
import { normalizeDelta, BASE_FRAME_MS } from "../../../../config/constants.js";
export * from "./glacikalAbilities.js";
import {
    IceTrail, PointyIcicleShard, UndergroundIcicle, IceSpider,
    IcyStormBall, IceSlash, SpinningIceBalls
} from "./glacikalAbilities.js";

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
        this.runStateCounterLimit = 5 * BASE_FRAME_MS;
        this.runStopAtTheMiddle = false;
        this.iceTrailTimer = 0;
        this.iceTrailNextSpawn = 0;
        this.iceTrailCooldownMin = 250;
        this.iceTrailCooldownMax = 700;
        this.iceTrailSpawnChance = 0.35;
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
                battleThemeId: "glacikalBattleTheme",
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
        const scale = normalizeDelta(deltaTime);
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
        let current = 0;
        for (let i = 0; i < this.game.enemies.length; i++) {
            if (this.game.enemies[i].constructor === IcyStormBall) current++;
        }
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

        if (this.icyStormAnimation.frameX === this.icyStormAnimation.maxFrame) {
            if (this.canIcyStormAttack) {
                this.isIcyStormActive = true;
                this.canIcyStormAttack = false;

                this.icyStormTimer = 0;
                this.icyStormPassiveTimer = 0;

                this.spawnIcyStormBalls(3);
            }
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
        const dt = normalizeDelta(deltaTime);
        this.x += this.runningDirection * dt;

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
                    this._stopKneelShake();
                }
            } else if (this.currentKneelAbility === "undergroundIcicle") {
                const allDone =
                    this.kneelUndergroundIcicles.length === 0 ||
                    this.kneelUndergroundIcicles.every((ic) => !ic || ic.markedForDeletion);

                if (allDone) {
                    this.isKneelDownActive = false;
                    this.isKneelDownReversing = true;
                    this.kneelReverseTimer = 0;
                    this._stopKneelShake();
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
            this.stateRandomiser(deltaTime);
        }
    }

    stateRandomiser(deltaTime) {
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

        this.runStateCounter += deltaTime;

        this.shouldInvert = this.game.player.x + this.game.player.width / 2 > this.x + this.width / 2;

        if (
            (this.runStateCounter >= this.runStateCounterLimit && !this.isInTheMiddle) ||
            (this.runStateCounter >= this.runStateCounterLimit && this.isInTheMiddle && this.previousState !== "run")
        ) {
            this.runStopAtTheMiddle = false;
            this.runStateCounter = 0;
            this.runStateCounterLimit = (4 + Math.random() * 3) * BASE_FRAME_MS;

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

    _stopKneelShake() {
        this.game.stopShake();
        this.game.audioHandler.enemySFX.fadeOutAndStop("groundRumbleSound", 1200);
    }

    handleRunSound() {
        const sfx = this.game.audioHandler.enemySFX;
        if (!sfx) return;

        if (this.markedForDeletion || this.lives <= 0) {
            if (this.isRunSoundPlaying) {
                sfx.stopSound("glacikalRunSound");
                this.isRunSoundPlaying = false;
            }
            return;
        }

        if (this.state === "run" && !this.isRunSoundPlaying) {
            sfx.playSound("glacikalRunSound", false, true);
            this.isRunSoundPlaying = true;
        }

        if (this.state !== "run" && this.isRunSoundPlaying) {
            sfx.stopSound("glacikalRunSound");
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

            if (this.game.bossInFight && boss && boss.current === this && boss.id === "glacikal") {
                if (this.state === "idle") {
                    this.edgeConstraintLogic("glacikal");
                    if (this.frameX === this.maxFrame) {
                        this.stateRandomiser(deltaTime);
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
