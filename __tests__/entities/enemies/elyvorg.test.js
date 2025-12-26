import { jest } from "@jest/globals";

jest.mock("../../../game/animations/fading.js", () => ({
    fadeInAndOut: jest.fn((canvas, fadein, stay, fadeout, cb) => cb()),
}));

import {
    PurpleBarrier,
    MeteorAttack,
    PoisonDrop,
    GhostElyvorg,
    GravitationalAura,
    ElectricWheel,
    InkBomb,
    PurpleFireball,
    Arrow,
    PurpleSlash,
    PurpleThunder,
    PurpleLaserBeam,
    Elyvorg,
} from "../../../game/entities/enemies/elyvorg.js";

import {
    MeteorExplosionCollision,
    PoisonDropGroundCollision,
    DarkExplosionCollision,
} from "../../../game/animations/collisionAnimation.js";

import { EnemyBoss } from "../../../game/entities/enemies/enemies.js";
import { PurpleWarningIndicator } from "../../../game/animations/damageIndicator.js";
import { fadeInAndOut } from "../../../game/animations/fading.js";

describe("elyvorg.js entities – behavior coverage", () => {
    let mockGame, ctx;

    const imgIds = [
        "barrier", "barrier1", "barrier2",
        "meteorAttack", "poisonDrop", "elyvorgGhostRun",
        "gravitationalAura", "electricWheel", "inkBomb",
        "purpleFireball", "yellowArrow", "blueArrow", "greenArrow", "cyanArrow",
        "purpleSlash", "elyvorgIdle", "elyvorgRun", "elyvorgJump",
        "elyvorgRechargeIdle", "elyvorgPistolIdle", "elyvorgLaserIdle",
        "elyvorgMeteorIdle", "elyvorgPoisonIdle", "elyvorgGhostIdle",
        "elyvorgGravityIdle", "elyvorgInkIdle", "elyvorgIdleFireball",
        "elyvorg_laser_beam", "purpleThunder",
    ];

    beforeAll(() => {
        imgIds.forEach(id => {
            const img = document.createElement("img");
            img.id = id;
            document.body.appendChild(img);
        });
    });

    beforeEach(() => {
        ctx = {
            drawImage: jest.fn(),
            strokeRect: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            rotate: jest.fn(),
            shadowColor: null,
            shadowBlur: null,
            createRadialGradient: jest.fn(() => ({
                addColorStop: jest.fn(),
            })),
            beginPath: jest.fn(),
            ellipse: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            rect: jest.fn(),
            clip: jest.fn(),
        };

        mockGame = {
            width: 800,
            height: 600,
            groundMargin: 50,
            debug: false,
            collisions: [],
            enemies: [],
            speed: 0,
            cabin: { isFullyVisible: true },
            audioHandler: {
                collisionSFX: { playSound: jest.fn() },
                enemySFX: { playSound: jest.fn(), stopSound: jest.fn(), stopAllSounds: jest.fn() },
                mapSoundtrack: { fadeOutAndStop: jest.fn() },
            },
            player: {
                x: 100,
                y: 100,
                width: 50,
                height: 50,
                isSlowed: false,
                setState: jest.fn(),
                invisibleCooldown: 5000,
                resetElectricWheelCounters: false,
                bossCollisionTimer: 0,

                setToStandingOnce: false,
                vy: 0,
                vx: 0,
                isInvisible: false,
                invisibleTimer: 0,
                invisibleActiveCooldownTimer: 0,
            },
            behindPlayerParticles: [],
            gameOver: false,
            hiddenTime: 0,
            input: { keys: [] },
            background: { totalDistanceTraveled: 0 },
            maxDistance: 1000,
            canvas: {},

            isBossVisible: false,
            bossInFight: false,
            boss: {
                current: null,
                id: null,
                map: null,
                spawned: false,
                isVisible: false,
                talkToBoss: false,
                preFight: false,
                inFight: false,
                postFight: false,
                runAway: false,

                screenEffect: {
                    active: false,
                    rgb: [0, 0, 0],
                    fadeInSpeed: 0,
                },

                dialogueBeforeOnce: true,
                dialogueAfterOnce: false,
                dialogueAfterLeaving: false,
                startAfterDialogueWhenAnimEnds: false,
            },

            shakeActive: false,
            shakeTimer: 0,
            shakeDuration: 0,
            startShake: jest.fn(function (duration) {
                this.shakeActive = true;
                this.shakeTimer = 0;
                this.shakeDuration = duration;
            }),
            stopShake: jest.fn(function () {
                this.shakeActive = false;
                this.shakeTimer = 0;
                this.shakeDuration = 0;
            }),
        };

        mockGame.bossManager = {
            requestScreenEffect: jest.fn(),
            releaseScreenEffect: jest.fn(),
        };
    });

    // -----------------------------------------------------------------------
    // EnemyBoss & PurpleBarrier basics
    // -----------------------------------------------------------------------
    describe("EnemyBoss & PurpleBarrier basics", () => {
        it("EnemyBoss constructor positions boss at right edge on ground and loads sprite image", () => {
            const e = new EnemyBoss(mockGame, 100, 80, 5, "elyvorgIdle");
            expect(e.x).toBe(800);
            expect(e.y).toBe(600 - 80 - 50);
            expect(e.image.id).toBe("elyvorgIdle");
        });

        it("PurpleBarrier.draw chooses sprite based on lives with clamped index", () => {
            const b = new PurpleBarrier(mockGame, 10, 20);
            b.lives = 5;
            b.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                document.getElementById("barrier"),
                expect.any(Number),
                0,
                b.width,
                b.height,
                10,
                20,
                b.width,
                b.height
            );
            ctx.drawImage.mockClear();
            b.lives = -1;
            b.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                document.getElementById("barrier2"),
                expect.any(Number),
                0,
                b.width,
                b.height,
                10,
                20,
                b.width,
                b.height
            );
        });

        it("EnemyBoss.draw strokes hitbox when debug mode is enabled", () => {
            mockGame.debug = true;
            const e = new EnemyBoss(mockGame, 30, 40, 1, "elyvorgIdle");
            e.frameX = 0; e.frameY = 0; e.x = 5; e.y = 6;
            e.draw(ctx, false);
            expect(ctx.strokeRect).toHaveBeenCalledWith(5, 6, 30, 40);
        });

        it("PurpleBarrier.draw strokes hitbox when debug mode is enabled", () => {
            mockGame.debug = true;
            const b = new PurpleBarrier(mockGame, 10, 20);
            b.draw(ctx);
            expect(ctx.strokeRect).toHaveBeenCalledWith(10, 20, b.width, b.height);
        });
    });

    describe("MeteorAttack & PoisonDrop collision branches", () => {
        it("MeteorAttack explodes on ground impact and spawns MeteorExplosionCollision", () => {
            const m = new MeteorAttack(mockGame);
            mockGame.cabin.isFullyVisible = false;
            m.y = mockGame.height - mockGame.groundMargin - 190 + 1;
            m.update(0);
            expect(m.markedForDeletion).toBe(true);
            expect(mockGame.collisions[0]).toBeInstanceOf(MeteorExplosionCollision);
            expect(mockGame.audioHandler.collisionSFX.playSound)
                .toHaveBeenCalledWith("elyvorg_meteor_in_contact_with_ground_sound");
        });

        it("PoisonDrop creates PoisonDropGroundCollision when reaching ground", () => {
            const p = new PoisonDrop(mockGame);
            mockGame.cabin.isFullyVisible = false;
            p.y = mockGame.height - mockGame.groundMargin - 53 + 1;
            p.update(0);
            expect(p.markedForDeletion).toBe(true);
            expect(mockGame.collisions[0]).toBeInstanceOf(PoisonDropGroundCollision);
        });
    });

    // -----------------------------------------------------------------------
    // GhostElyvorg & GravitationalAura dynamics
    // -----------------------------------------------------------------------
    describe("GhostElyvorg & GravitationalAura dynamics", () => {
        it("GhostElyvorg.update moves horizontally by incrementMovement", () => {
            const g = new GhostElyvorg(mockGame);
            g.incrementMovement = 7;
            const start = g.x;
            g.update(0);
            expect(g.x).toBe(start + 7);
        });

        it("GhostElyvorg.draw flips sprite horizontally when moving right", () => {
            const g = new GhostElyvorg(mockGame);
            g.incrementMovement = 5;
            g.frameX = 0; g.frameY = 0; g.x = 10; g.y = 10;
            g.draw(ctx);
            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
        });

        it("GhostElyvorg.draw keeps orientation when incrementMovement <= 0", () => {
            const g = new GhostElyvorg(mockGame);
            g.incrementMovement = -3;
            g.frameX = 0; g.frameY = 0; g.x = 10; g.y = 10;
            g.draw(ctx);
            expect(ctx.scale).toHaveBeenCalledWith(1, 1);
        });

        it("GravitationalAura.update follows boss, clamps minimum y, and pushes player horizontally", () => {
            const bossStub = { x: 50, width: 100, reachedLeftEdge: true };
            const aura = new GravitationalAura(mockGame, 0, 20, mockGame.player, bossStub);
            aura.speedX = 0;
            mockGame.player.x = 200;
            mockGame.player.y = 200;
            mockGame.player.isSlowed = true;
            aura.update(0);
            expect(aura.y).toBe(100);
            expect(aura.rotationAngle).toBeGreaterThan(0);
            expect(mockGame.player.x).toBeLessThan(200);
        });

        it("GravitationalAura.draw applies rotation and renders image around center", () => {
            const bossStub = { x: 0, width: 10, reachedLeftEdge: false };
            const aura = new GravitationalAura(mockGame, 20, 30, mockGame.player, bossStub);
            aura.rotationAngle = 1.23;
            ctx.rotate.mockClear();
            ctx.drawImage.mockClear();
            aura.draw(ctx);
            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.rotate).toHaveBeenCalledWith(1.23);
            expect(ctx.drawImage).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // ElectricWheel, InkBomb, PurpleFireball
    // -----------------------------------------------------------------------
    describe("ElectricWheel, InkBomb, PurpleFireball", () => {
        it("ElectricWheel.draw adds yellow glow shadow around sprite", () => {
            const ew = new ElectricWheel(mockGame, 0, 0);
            ew.rotationAngle = 1.2;
            ew.draw(ctx);
            expect(ctx.shadowColor).toBe("yellow");
            expect(ctx.shadowBlur).toBe(10);
        });

        it("InkBomb.draw flips horizontally when direction is true", () => {
            const ib = new InkBomb(mockGame, 100, 100, 1, 50, 10, true);
            ib.scale = 1;
            ib.draw(ctx);
            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();
        });

        it("PurpleFireball.draw applies purple glow shadow", () => {
            const pf = new PurpleFireball(mockGame, 10, 10, 2, 2);
            pf.draw(ctx);
            expect(ctx.shadowColor).toBe("purple");
            expect(ctx.shadowBlur).toBe(20);
        });

        it("ElectricWheel.update increases rotationAngle by rotationSpeed each frame", () => {
            const ew = new ElectricWheel(mockGame, 0, 0);
            ew.rotationAngle = 0;
            const before = ew.rotationAngle;
            ew.update(0);
            expect(ew.rotationAngle).toBeCloseTo(before + ew.rotationSpeed);
        });
    });

    // -----------------------------------------------------------------------
    // Arrow, PurpleSlash & PurpleLaserBeam
    // -----------------------------------------------------------------------
    describe("Arrow, PurpleSlash & PurpleLaserBeam drawing", () => {
        it("Arrow.draw applies blue glow when using blueArrow sprite", () => {
            const arr = new Arrow(mockGame, 0, 0, 5, 5, false, "blueArrow");
            arr.draw(ctx);
            expect(ctx.shadowColor).toBe("blue");
            expect(ctx.shadowBlur).toBe(10);
        });

        it("Arrow.draw applies yellow glow when using yellowArrow sprite", () => {
            const arrY = new Arrow(mockGame, 0, 0, 5, 5, false, "yellowArrow");
            arrY.draw(ctx);
            expect(ctx.shadowColor).toBe("yellow");
            expect(ctx.shadowBlur).toBe(10);
        });

        it("PurpleSlash.draw flips when direction>0 and uses purple glow", () => {
            const ps = new PurpleSlash(mockGame, 0, 0, true);
            ps.draw(ctx);
            expect(ctx.shadowColor).toBe("purple");
            expect(ctx.shadowBlur).toBe(20);
            expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
        });

        it("PurpleSlash.update ends animation by marking for deletion when last frame reached", () => {
            const ps = new PurpleSlash(mockGame, 0, 0, false);
            ps.frameX = ps.maxFrame;
            ps.lives = 3;
            ps.markedForDeletion = false;
            ps.update(0);
            expect(ps.markedForDeletion).toBe(true);
            expect(ps.lives).toBe(0);
        });

        it("PurpleLaserBeam.draw rotates beam and stores collision info for right-facing beams", () => {
            const beam = new PurpleLaserBeam(mockGame, 10, 20, 5, 0);
            ctx.save.mockClear();
            ctx.scale.mockClear();
            ctx.rotate.mockClear();
            ctx.drawImage.mockClear();

            beam.draw(ctx);

            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.scale).toHaveBeenCalledWith(1, -1);
            expect(ctx.rotate).toHaveBeenCalledWith(expect.any(Number));
            expect(ctx.drawImage).toHaveBeenCalled();
            expect(beam.collisionDrawInfo.direction).toBe(false);
            expect(typeof beam.collisionDrawInfo.angle).toBe("number");
        });

        it("PurpleLaserBeam.draw mirrors beam and updates collision angle for left-facing beams", () => {
            const beam = new PurpleLaserBeam(mockGame, 10, 20, -5, 2);
            ctx.scale.mockClear();
            ctx.rotate.mockClear();

            beam.draw(ctx);

            expect(ctx.scale).toHaveBeenCalledWith(-1, -1);
            expect(beam.collisionDrawInfo.direction).toBe(true);

            const expectedAngle = Math.PI - Math.atan2(beam.speedY, beam.speedX);
            expect(beam.collisionDrawInfo.angle).toBeCloseTo(expectedAngle);
            expect(ctx.rotate).toHaveBeenCalledWith(expect.any(Number));
        });
    });

    describe("Elyvorg special-attack helpers", () => {
        let boss;
        beforeEach(() => {
            boss = new Elyvorg(mockGame);
            mockGame.boss.current = boss;
            mockGame.boss.id = "elyvorg";
        });

        it("cutsceneBackgroundChange triggers fade effect and sets transition flag", () => {
            boss.cutsceneBackgroundChange(1, 1, 1);
            expect(fadeInAndOut).toHaveBeenCalled();
            expect(mockGame.enterDuringBackgroundTransition).toBe(true);
        });

        it("backToIdleSetUp stores previous state, resets to idle, and zeroes frameX", () => {
            boss.state = "run";
            boss.previousState = "jump";
            boss.backToIdleSetUp();
            expect(boss.previousState).toBe("run");
            expect(boss.state).toBe("idle");
            expect(boss.frameX).toBe(0);
        });

        it("throwLaserBeam adds two PurpleLaserBeam projectiles in player-facing direction", () => {
            mockGame.player.x = boss.x - 100;
            boss.throwLaserBeam();
            const beams = mockGame.enemies.filter(e => e instanceof PurpleLaserBeam);
            expect(beams).toHaveLength(2);
            beams.forEach(b => expect(b.speedX).toBe(20));
        });

        it("throwFireballAttack spawns a PurpleFireball aimed toward the player", () => {
            mockGame.player.x = boss.x - 200;
            boss.throwFireballAttack();
            const fbs = mockGame.enemies.filter(e => e instanceof PurpleFireball);
            expect(fbs).toHaveLength(1);
            expect(fbs[0].speedX).toBe(15);
        });

        describe("throwArrowAttack image selection", () => {
            it("uses blueArrow when Math.random() < 0.25", () => {
                const rand = jest.spyOn(Math, "random").mockReturnValue(0.2);
                mockGame.enemies = [];
                boss.throwArrowAttack();
                expect(mockGame.enemies[0].image.id).toBe("blueArrow");
                rand.mockRestore();
            });

            it("uses yellowArrow when 0.25 <= Math.random() < 0.5", () => {
                const rand = jest.spyOn(Math, "random").mockReturnValue(0.3);
                mockGame.enemies = [];
                boss.throwArrowAttack();
                expect(mockGame.enemies[0].image.id).toBe("yellowArrow");
                rand.mockRestore();
            });

            it("uses greenArrow when 0.5 <= Math.random() < 0.75", () => {
                const rand = jest.spyOn(Math, "random").mockReturnValue(0.6);
                mockGame.enemies = [];
                boss.throwArrowAttack();
                expect(mockGame.enemies[0].image.id).toBe("greenArrow");
                rand.mockRestore();
            });

            it("uses cyanArrow when Math.random() >= 0.75", () => {
                const rand = jest.spyOn(Math, "random").mockReturnValue(0.9);
                mockGame.enemies = [];
                boss.throwArrowAttack();
                expect(mockGame.enemies[0].image.id).toBe("cyanArrow");
                rand.mockRestore();
            });
        });

        it("throwGravityAttack spawns GravitationalAura and marks spinner as active", () => {
            mockGame.player.x = boss.x + 200;
            boss.throwGravityAttack();
            expect(boss.isGravitySpinnerActive).toBe(true);
            expect(mockGame.enemies.filter(e => e instanceof GravitationalAura)).toHaveLength(1);
        });
    });

    describe("Elyvorg state-transition & logic methods", () => {
        let boss;
        beforeEach(() => {
            boss = new Elyvorg(mockGame);
            mockGame.boss.current = boss;
            mockGame.boss.id = "elyvorg";
        });

        it("fireballThrownWhileInIdle switches to jump when fireball is nearby", () => {
            boss.state = "idle";
            mockGame.behindPlayerParticles.push({
                x: boss.x,
                y: boss.y,
                maxSize: boss.height,
            });
            boss.fireballThrownWhileInIdle();
            expect(boss.state).toBe("jump");
        });

        it("edgeConstraintLogic clamps position at screen edges and tracks isInTheMiddle flag", () => {
            mockGame.boss.isVisible = true;
            mockGame.boss.current = boss;
            mockGame.boss.id = "elyvorg";

            boss.x = -10;
            boss.edgeConstraintLogic("elyvorg");
            expect(boss.x).toBe(1);
            expect(boss.reachedLeftEdge).toBe(true);

            boss.x = (mockGame.width / 2) - (boss.width / 2);
            boss.edgeConstraintLogic("elyvorg");
            expect(boss.isInTheMiddle).toBe(true);

            boss.x = mockGame.width + 10;
            boss.edgeConstraintLogic("elyvorg");
            expect(boss.x).toBe(mockGame.width - boss.width - 1);
            expect(boss.reachedRightEdge).toBe(true);
        });

        it("jumpLogic performs arc, fires arrows at midpoint, then returns to idle", () => {
            boss.state = "jump";
            boss.jumpAnimation.frameX = 0;
            boss.jumpLogic();
            expect(boss.jumpedBeforeDistanceLogic).toBe(true);

            boss.game.hiddenTime =
                boss.jumpStartTime + boss.jumpDuration * 500;
            boss.canJumpAttack = true;
            boss.jumpLogic();
            expect(mockGame.enemies.some(e => e instanceof Arrow)).toBe(true);

            boss.game.hiddenTime =
                boss.jumpStartTime + boss.jumpDuration * 1000 + 1;
            boss.jumpLogic();
            expect(boss.state).toBe("idle");
        });

        it("laserLogic fires up to three laser bursts then returns to idle", () => {
            boss.laserAnimation.frameX = 9;
            boss.canLaserAttack = true;
            boss.laserThrowCount = 0;
            boss.laserLogic();
            expect(boss.laserThrowCount).toBe(1);

            boss.laserThrowCount = 3;
            boss.laserAnimation.frameX = boss.laserAnimation.maxFrame;
            boss.laserLogic();
            expect(boss.state).toBe("idle");
        });

        it("meteorLogic plays attack sound then spawns 7 meteors on casting frame", () => {
            boss.meteorAnimation.frameX = 9;
            boss.meteorLogic();
            expect(mockGame.audioHandler.enemySFX.playSound)
                .toHaveBeenCalledWith("elyvorg_meteor_attack_sound");

            boss.meteorAnimation.frameX = boss.meteorAnimation.maxFrame;
            boss.canMeteorAttack = true;
            boss.meteorThrowCount = 0;
            boss.meteorLogic();
            expect(
                mockGame.enemies.filter(e => e instanceof MeteorAttack)
            ).toHaveLength(7);
        });

        it("poisonLogic triggers screen effect, sound, and initial poison rain", () => {
            boss.poisonAnimation.frameX = 0;
            boss.poisonLogic();
            expect(mockGame.bossManager.requestScreenEffect).toHaveBeenCalledWith(
                "elyvorg_poison",
                {
                    rgb: [0, 50, 0],
                    fadeInSpeed: 0.00298,
                }
            );

            boss.poisonAnimation.frameX = 17;
            boss.poisonLogic();
            expect(mockGame.audioHandler.enemySFX.playSound)
                .toHaveBeenCalledWith(
                    "elyvorg_poison_drop_rain_sound",
                    false,
                    true
                );

            boss.poisonAnimation.frameX = boss.poisonAnimation.maxFrame;
            boss.canPoisonAttack = true;
            boss.poisonLogic();
            expect(boss.isPoisonActive).toBe(true);
            expect(
                mockGame.enemies.filter(e => e instanceof PoisonDrop).length
            ).toBe(7);
        });

        it("poisonLogicTimer periodically spawns passive PoisonDrop rain while active", () => {
            const rand = jest.spyOn(Math, "random").mockReturnValue(0);
            boss.isPoisonActive = true;
            boss.state = "idle";
            mockGame.enemies = [];
            boss.passivePoisonCooldown = 0;
            boss.poisonCooldownTimer = 0;
            boss.poisonLogicTimer(1000);
            expect(
                mockGame.enemies.filter(e => e instanceof PoisonDrop)
            ).toHaveLength(1);
            rand.mockRestore();
        });

        it("gravityLogicTimer detonates gravitational aura on cooldown and stops sounds", () => {
            boss.isGravitySpinnerActive = true;
            boss.gravitationalAura = {
                lives: 1,
                x: 10,
                y: 10,
                width: 5,
                height: 5,
                markedForDeletion: false,
            };
            boss.gravityCooldownTimer = boss.gravityCooldown;
            boss.gravityLogicTimer(0);
            expect(boss.isGravitySpinnerActive).toBe(false);
            expect(
                mockGame.collisions.some(c => c instanceof DarkExplosionCollision)
            ).toBe(true);
        });

        it("pistolLogic returns to idle when animation completes or wheel is inactive", () => {
            boss.state = "pistol";
            boss.pistolAnimation.frameX = boss.pistolAnimation.maxFrame;
            boss.isElectricWheelActive = true;
            boss.pistolLogic();
            expect(boss.state).toBe("idle");
        });

        it("pistolLogic inverts electricWheel at frame 5 and marks it thrown at frame 17", () => {
            const invertSpy = jest.spyOn(boss.electricWheel, "shouldElectricWheelInvert");

            boss.pistolAnimation.frameX = 5;
            boss.pistolLogic();
            expect(invertSpy).toHaveBeenCalled();
            invertSpy.mockRestore();

            boss.electricWheelThrown = false;
            boss.pistolAnimation.frameX = 17;
            boss.pistolLogic();
            expect(boss.electricWheelThrown).toBe(true);
        });

        it("ghostLogic plays sound, spawns ghost(s), and then returns to idle", () => {
            boss.ghostAnimation.frameX = 0;
            boss.ghostLogic();
            expect(mockGame.audioHandler.enemySFX.playSound)
                .toHaveBeenCalledWith(
                    "elyvorg_ghost_attack_sound",
                    false,
                    true
                );

            boss.ghostAnimation.frameX = 17;
            boss.canGhostAttack = true;
            mockGame.enemies = [];
            jest.spyOn(Math, "random").mockReturnValue(0.4);
            boss.ghostLogic();
            const ghosts = mockGame.enemies.filter(
                e => e instanceof GhostElyvorg
            );
            expect(ghosts.length).toBe(2);
            Math.random.mockRestore();
        });

        it("inkLogic spawns exactly 5 InkBomb projectiles", () => {
            boss.inkAnimation.frameX = 1;
            boss.canInkAttack = true;
            mockGame.enemies = [];
            boss.inkLogic();
            expect(
                mockGame.enemies.filter(e => e instanceof InkBomb).length
            ).toBe(5);
        });

        it("fireballLogic spawns fireball at cast frame and returns to idle at end", () => {
            boss.fireballAnimation.frameX = 10;
            boss.canFireballAttack = true;
            mockGame.enemies = [];
            boss.fireballLogic();
            expect(
                mockGame.enemies.filter(e => e instanceof PurpleFireball)
            ).toHaveLength(1);
            expect(boss.canFireballAttack).toBe(false);

            boss.fireballAnimation.frameX = boss.fireballAnimation.maxFrame;
            boss.fireballLogic();
            expect(boss.state).toBe("idle");
        });

        it("barrier sound transitions (spawn + crack + break) are handled by Barrier.update()", () => {
            const playSpy = jest.spyOn(mockGame.audioHandler.enemySFX, "playSound");

            const b = new PurpleBarrier(mockGame, 0, 0);

            expect(playSpy).toHaveBeenCalledWith("elyvorg_shield_up_sound", false, true);

            b.update(0);

            b.lives = 2;
            b.update(0);
            expect(playSpy).toHaveBeenCalledWith("elyvorg_shield_crack_1_sound", false, true);

            b.lives = 1;
            b.update(0);
            expect(playSpy).toHaveBeenCalledWith("elyvorg_shield_crack_2_sound", false, true);

            b.lives = 0;
            b.update(0);
            expect(playSpy).toHaveBeenCalledWith("elyvorg_shield_crack_3_sound", false, true);
        });

        it("electricWheelLogic spawns initial ElectricWheel and starts looping sound", () => {
            boss.oneElectricWheel = true;
            mockGame.enemies = [];
            boss.isElectricWheelActive = false;
            boss.electricWheelLogic(0);
            expect(
                mockGame.enemies.filter(e => e instanceof ElectricWheel)
            ).toHaveLength(1);
            expect(boss.isElectricWheelActive).toBe(true);
            expect(mockGame.audioHandler.enemySFX.playSound)
                .toHaveBeenCalledWith(
                    "elyvorg_electricity_wheel_sound",
                    true
                );
        });

        it("checksBossIsFullyVisible marks boss visible and snaps x when fully onscreen", () => {
            boss.x = 0;
            mockGame.boss.current = boss;
            mockGame.boss.id = "elyvorg";
            mockGame.boss.isVisible = false;

            boss.checksBossIsFullyVisible("elyvorg");

            expect(mockGame.boss.isVisible).toBe(true);
            expect(boss.x).toBe(mockGame.width - boss.width);
        });

        it("stateRandomiser returns idle or run only when gameOver=true", () => {
            boss.isInTheMiddle = false;
            mockGame.gameOver = true;
            boss.stateRandomiser();
            expect(boss.state).toBe("idle");

            boss.isInTheMiddle = true;
            boss.stateRandomiser();
            expect(boss.state).toBe("run");
        });

        it("draw delegates to run animation when state is run, and uses base draw when idle", () => {
            boss.state = "run";
            boss.runningDirection = 5;
            const spy = jest.spyOn(boss.runAnimation, "draw");
            boss.draw(ctx);
            expect(spy).toHaveBeenCalledWith(ctx, true);
            spy.mockRestore();

            boss.state = "idle";
            ctx.scale.mockClear();
            boss.draw(ctx);
            expect(ctx.scale).toHaveBeenCalled();
        });

        it("checkIfDefeated triggers defeat sequence, cutscene flags, and boss repositioning", () => {
            boss.lives = 0;
            mockGame.boss.inFight = true;
            mockGame.boss.current = boss;

            jest.useFakeTimers();
            boss.checkIfDefeated();
            expect(mockGame.boss.inFight).toBe(false);

            jest.runAllTimers();

            expect(mockGame.boss.talkToBoss).toBe(true);
            expect(mockGame.player.setState).toHaveBeenCalledWith(8, 0);
            expect(boss.x).toBe(mockGame.width / 2);

            jest.useRealTimers();
        });

        it("runningAway moves Elyvorg offscreen and clears boss state when runAway=true", () => {
            mockGame.boss.current = boss;
            mockGame.boss.id = "elyvorg";
            mockGame.boss.runAway = true;
            mockGame.boss.isVisible = true;
            mockGame.boss.talkToBoss = true;

            boss.x = mockGame.width - 1;
            boss.runningAway(0, "elyvorg");

            expect(mockGame.background.totalDistanceTraveled)
                .toBe(mockGame.maxDistance - 6);
            expect(boss.markedForDeletion).toBe(true);
            expect(mockGame.boss.current).toBeNull();
            expect(mockGame.boss.isVisible).toBe(false);
            expect(mockGame.boss.talkToBoss).toBe(false);
            expect(mockGame.boss.runAway).toBe(false);
        });

        it("runLogic moves Elyvorg and spawns PurpleSlash when player is in range", () => {
            boss.runningDirection = 0;
            boss.slashAttackOnce = true;
            boss.x = mockGame.player.x;
            mockGame.enemies = [];
            boss.runLogic();
            expect(
                mockGame.enemies.some(e => e instanceof PurpleSlash)
            ).toBe(true);
        });

        it("rechargeLogic calls stateRandomiser once timer passes cooldown on last frame", () => {
            boss.state = "recharge";
            boss.rechargeAnimation.frameX = boss.rechargeAnimation.maxFrame;
            boss.stateRandomiserTimer = boss.stateRandomiserCooldown;
            jest.spyOn(boss, "stateRandomiser");
            boss.rechargeLogic(0);
            expect(boss.stateRandomiser).toHaveBeenCalled();
        });

        it("stateRandomiser prioritises run state when counters or wheel position demand it", () => {
            boss.previousState = "laser";
            boss.isGravitySpinnerActive = true;
            boss.isPoisonActive = true;
            boss.runStateCounter = boss.runStateCounterLimit + 1;
            boss.isInTheMiddle = false;
            boss.stateRandomiser();
            expect(boss.state).toBe("run");
        });

        it("jumpLogic plays arrow sound when reaching midpoint of jump", () => {
            boss.state = "jump";
            boss.jumpAnimation.frameX = 0;
            boss.jumpLogic();

            boss.game.hiddenTime =
                boss.jumpStartTime + boss.jumpDuration * 1000 * 0.5;
            boss.canJumpAttack = true;
            const spy = jest.spyOn(
                mockGame.audioHandler.enemySFX,
                "playSound"
            );
            boss.jumpLogic();
            expect(spy).toHaveBeenCalledWith(
                "elyvorg_arrow_attack_sound",
                false,
                true
            );
        });

        it("laserLogic re-enables canLaserAttack when animation reaches frame 20", () => {
            boss.canLaserAttack = false;
            boss.laserAnimation.frameX = 20;
            boss.laserLogic();
            expect(boss.canLaserAttack).toBe(true);
        });

        it("gravityLogic spawns aura with both sounds at cast frame, and resets on frame 23", () => {
            boss.gravityAnimation.frameX = 9;
            boss.canGravityAttack = true;
            const playSpy = jest.spyOn(
                mockGame.audioHandler.enemySFX,
                "playSound"
            );
            mockGame.enemies = [];
            boss.gravityLogic();
            expect(
                mockGame.enemies.some(e => e instanceof GravitationalAura)
            ).toBe(true);
            expect(playSpy).toHaveBeenCalledWith(
                "elyvorg_gravitational_aura_release_sound_effect"
            );
            expect(playSpy).toHaveBeenCalledWith(
                "elyvorg_gravitational_aura_sound_effect",
                true
            );
            expect(boss.canGravityAttack).toBe(false);

            boss.gravityAnimation.frameX = 23;
            boss.canGravityAttack = false;
            boss.backToIdleSetUp = jest.fn();
            boss.gravityLogic();
            expect(boss.backToIdleSetUp).toHaveBeenCalled();
            expect(boss.canGravityAttack).toBe(true);
        });

        it("meteorLogic spawns 7 meteors and falling sound at frame 23, and re-enables at frame 20", () => {
            boss.meteorAnimation.frameX = 23;
            boss.canMeteorAttack = true;
            mockGame.enemies = [];
            const playSpy = jest.spyOn(
                mockGame.audioHandler.enemySFX,
                "playSound"
            );
            boss.meteorLogic();
            expect(
                mockGame.enemies.filter(e => e instanceof MeteorAttack)
            ).toHaveLength(7);
            expect(playSpy).toHaveBeenCalledWith(
                "elyvorg_meteor_falling_sound",
                true
            );
            expect(boss.canMeteorAttack).toBe(false);

            boss.canMeteorAttack = false;
            boss.meteorAnimation.frameX = 20;
            boss.meteorLogic();
            expect(boss.canMeteorAttack).toBe(true);
        });

        it("barrierLogic sets player collision timer when barrier is destroyed", () => {
            boss.oneBarrier = false;
            boss.isBarrierActive = true;
            boss.barrierBreakingSetElyvorgTimer = true;
            boss.barrier = new PurpleBarrier(mockGame, 0, 0);
            boss.barrier.lives = 0;
            mockGame.player.bossCollisionTimer = 0;
            boss.barrierLogic(0);
            expect(boss.isBarrierActive).toBe(false);
            expect(boss.barrierBreakingSetElyvorgTimer).toBe(false);
            expect(mockGame.player.bossCollisionTimer).toBe(1000);
        });

        it("thunderLogic initialises thunder sequence and spawns opening PurpleThunder wave", () => {
            boss.state = "thunder";
            mockGame.enemies = [];
            boss.thunderSequenceInitialised = false;
            boss.isThunderSequenceActive = false;

            const playSpy = jest.spyOn(mockGame.audioHandler.enemySFX, "playSound");

            boss.thunderLogic(0);

            expect(boss.thunderSequenceInitialised).toBe(true);
            expect(boss.isThunderSequenceActive).toBe(true);

            const thunders = mockGame.enemies.filter(e => e instanceof PurpleThunder);
            expect(thunders.length).toBe(3);
            expect(boss.thunderGroup1Spawned).toBe(true);
            expect(boss.thunderTotalSpawned).toBe(3);

            expect(playSpy).toHaveBeenCalledWith("elyvorg_purple_thunder_sound_effect", true);
            expect(mockGame.startShake).toHaveBeenCalledWith(0);
        });

        it("beginTeleport sets up fade-out phase and target positions", () => {
            boss.teleportDuration = 10;
            boss.pickTeleportTargetX = jest.fn(() => {
                boss.teleportTargetX = boss.x + 100;
            });
            const ghostSpy = jest.spyOn(boss, "spawnTeleportGhostAt");
            const rand = jest.spyOn(Math, "random").mockReturnValue(0.9); // teleportAir = false

            boss.beginTeleport();

            expect(boss.teleportPhase).toBe("fadeOut");
            expect(boss.teleportTargetX).toBe(boss.x + 100);
            expect(boss.teleportTargetY).toBe(boss.originalY);
            expect(ghostSpy).toHaveBeenCalled();

            rand.mockRestore();
            ghostSpy.mockRestore();
        });

        it("teleportLogic moves boss to target and returns to idle after ground teleport", () => {
            boss.teleportDuration = 10;
            boss.pickTeleportTargetX = jest.fn(() => {
                boss.teleportTargetX = 300;
            });
            const rand = jest.spyOn(Math, "random").mockReturnValue(0.9); // ground teleport
            boss.beginTeleport();
            rand.mockRestore();

            boss.teleportTargetY = boss.originalY;
            boss.backToIdleSetUp = jest.fn();

            boss.teleportLogic(10); // complete fadeOut
            expect(boss.teleportPhase).toBe("fadeIn");
            expect(boss.x).toBe(300);
            expect(boss.y).toBe(boss.originalY);

            boss.teleportLogic(10); // complete fadeIn
            expect(boss.teleportPhase).toBe("none");
            expect(boss.previousState).toBe("teleport");
            expect(boss.backToIdleSetUp).toHaveBeenCalled();
        });

        it("teleport from air chains into jump state with isTeleportJump=true", () => {
            boss.teleportDuration = 10;
            boss.pickTeleportTargetX = jest.fn(() => {
                boss.teleportTargetX = 300;
            });
            const rand = jest.spyOn(Math, "random").mockReturnValue(0.0); // teleportAir = true
            boss.beginTeleport();
            rand.mockRestore();

            boss.teleportTargetY = boss.originalY - boss.jumpHeight;

            boss.teleportLogic(10); // fadeOut
            boss.teleportLogic(10); // fadeIn complete

            expect(boss.teleportPhase).toBe("none");
            expect(boss.state).toBe("jump");
            expect(boss.isTeleportJump).toBe(true);
        });
    });

    describe("Additional behaviors and edge cases", () => {
        describe("GravitationalAura extra", () => {
            it("update increments rotationAngle and toggles shouldInvert with player position", () => {
                const bossStub = { x: 50, width: 10, reachedLeftEdge: false };
                const aura = new GravitationalAura(
                    mockGame,
                    0,
                    150,
                    mockGame.player,
                    bossStub
                );
                aura.speedX = 0;
                mockGame.player.x = 300;
                bossStub.x = 0;

                const before = aura.rotationAngle;
                aura.update(16);
                expect(aura.rotationAngle).toBeCloseTo(
                    before + aura.rotationSpeed
                );
                expect(aura.shouldInvert).toBe(true);

                mockGame.player.x = 0;
                aura.update(16);
                expect(aura.shouldInvert).toBe(false);
            });
        });

        describe("ElectricWheel.shouldElectricWheelInvert()", () => {
            it("updates direction and incrementMovement based on player side", () => {
                const ew = new ElectricWheel(mockGame, 0, 0);
                mockGame.player.x = ew.x + 100;
                ew.shouldElectricWheelInvert();
                expect(ew.shouldInvert).toBe(true);
                expect(ew.incrementMovement).toBeGreaterThan(0);

                mockGame.player.x = ew.x - 100;
                ew.shouldElectricWheelInvert();
                expect(ew.shouldInvert).toBe(false);
                expect(ew.incrementMovement).toBeLessThan(0);
            });
        });

        describe("InkBomb scaling and sounds", () => {
            it("update grows scale to target, sets speedX when stopping, and plays both sounds once", () => {
                const ib = new InkBomb(mockGame, 100, 200, 5, 180, 20, false);
                const playSoundSpy = jest.spyOn(mockGame.audioHandler.enemySFX, "playSound");
                for (let i = 0; i < 200; i++) {
                    ib.update(16);
                }
                expect(playSoundSpy).toHaveBeenCalledWith("elyvorg_ink_bomb_sound", false, true);
                expect(playSoundSpy).toHaveBeenCalledWith("elyvorg_ink_bomb_throw_sound", false, true);
                expect(ib.scale).toBe(1);
                expect(ib.speedX).toBe(20);
            });
        });

        describe("PurpleFireball growth and rotation", () => {
            it("update grows size to maxSize, moves upwards, and increases rotationAngle", () => {
                const pf = new PurpleFireball(mockGame, 50, 300, 5, 0);
                const beforeAngle = pf.rotationAngle;
                for (let t = 0; t < 100; t++) {
                    pf.update(16);
                }
                expect(pf.size).toBe(pf.maxSize);
                expect(pf.y).toBeLessThan(300);
                expect(pf.rotationAngle).toBeGreaterThan(beforeAngle);
            });
        });

        describe("Arrow greenArrow behavior", () => {
            it("draw uses lime shadow for greenArrow and flips correctly when direction=true", () => {
                const arr = new Arrow(mockGame, 0, 0, 5, 0, true, "greenArrow");
                arr.draw(ctx);
                expect(ctx.shadowColor).toBe("lime");
                expect(ctx.shadowBlur).toBe(10);
                expect(ctx.scale).toHaveBeenCalledWith(-1, -1);
            });
        });

        describe("PurpleBarrier regeneration", () => {
            it("barrierLogic regenerates barrier after cooldown expires", () => {
                const boss = new Elyvorg(mockGame);
                mockGame.boss.current = boss;
                mockGame.boss.id = "elyvorg";

                boss.oneBarrier = false;
                boss.isBarrierActive = false;
                boss.barrierCooldown = 100;
                boss.barrierCooldownTimer = 100;
                mockGame.enemies = [];
                boss.barrierLogic(0);

                expect(
                    mockGame.enemies.some(e => e instanceof PurpleBarrier)
                ).toBe(true);

                expect(mockGame.audioHandler.enemySFX.playSound)
                    .toHaveBeenCalledWith("elyvorg_shield_up_sound", false, true);
            });
        });

        describe("ElectricWheel warning and teardown", () => {
            it("electricWheelLogic issues warning then cleans up when wheel dies", () => {
                const boss = new Elyvorg(mockGame);
                mockGame.boss.current = boss;
                mockGame.boss.id = "elyvorg";

                boss.oneElectricWheel = false;
                boss.isElectricWheelActive = false;
                boss.electricWheelStateCounter = boss.electricWheelStateCounterLimit;

                const playSpy = jest.spyOn(
                    mockGame.audioHandler.enemySFX,
                    "playSound"
                );
                boss.electricWheelLogic(0);
                expect(playSpy).toHaveBeenCalledWith(
                    "elyvorg_electricity_wheel_warning_sound"
                );
                expect(
                    mockGame.collisions.some(
                        c => c instanceof PurpleWarningIndicator
                    )
                ).toBe(true);

                boss.electricWheel.lives = 0;
                mockGame.player.resetElectricWheelCounters = true;
                boss.electricWheelLogic(0);
                expect(boss.isElectricWheelActive).toBe(false);
                expect(boss.electricWheel.markedForDeletion).toBe(true);
            });
        });

        describe("PoisonLogicTimer reset", () => {
            it("poisonLogicTimer disables poison effect and clears screenEffect after cooldown", () => {
                const boss = new Elyvorg(mockGame);
                mockGame.boss.current = boss;
                mockGame.boss.id = "elyvorg";

                boss.isPoisonActive = true;
                boss.poisonCooldown = 50;
                boss.poisonCooldownTimer = 51;

                boss.poisonLogicTimer(0);

                expect(boss.isPoisonActive).toBe(false);
                expect(mockGame.bossManager.releaseScreenEffect)
                    .toHaveBeenCalledWith("elyvorg_poison");
            });
        });

        describe("stateRandomiser previousState branch", () => {
            it("stateRandomiser sometimes reuses previousState when random<0.1 and no conflicting flags", () => {
                const boss = new Elyvorg(mockGame);
                boss.previousState = "meteor";
                boss.isGravitySpinnerActive = false;
                boss.isPoisonActive = false;
                jest.spyOn(Math, "random").mockReturnValue(0.05);
                boss.stateRandomiser();
                expect(boss.state).toBe("meteor");
                Math.random.mockRestore();
            });
        });

        describe("Elyvorg.draw for non-idle states", () => {
            let boss;
            beforeEach(() => {
                boss = new Elyvorg(mockGame);
                mockGame.boss.current = boss;
                mockGame.boss.id = "elyvorg";
            });

            it("draw calls ghostAnimation.draw when state is 'ghost'", () => {
                boss.state = "ghost";
                const spy = jest.spyOn(boss.ghostAnimation, "draw");
                boss.draw(ctx);
                expect(spy).toHaveBeenCalledWith(ctx, expect.any(Boolean));
                spy.mockRestore();
            });

            it("draw calls pistolAnimation.draw when state is 'pistol'", () => {
                boss.state = "pistol";
                const spy = jest.spyOn(boss.pistolAnimation, "draw");
                boss.draw(ctx);
                expect(spy).toHaveBeenCalledWith(ctx, expect.any(Boolean));
                spy.mockRestore();
            });
        });

        describe("Thunder helpers", () => {
            it("getActiveThunders returns only non-deleted PurpleThunder not in 'done' phase", () => {
                const boss = new Elyvorg(mockGame);
                const t1 = new PurpleThunder(mockGame, 100);
                const t2 = new PurpleThunder(mockGame, 200);
                const t3 = new PurpleThunder(mockGame, 300);

                t2.markedForDeletion = true;
                t3.phase = "done";

                mockGame.enemies = [t1, t2, t3];

                const active = boss.getActiveThunders();
                expect(active).toEqual([t1]);
            });

            it("isThunderLaneCoveringPlayer returns true when thunder overlaps player X", () => {
                const boss = new Elyvorg(mockGame);
                mockGame.player.x = 100;
                const t = new PurpleThunder(mockGame, 125);
                const result = boss.isThunderLaneCoveringPlayer([t]);
                expect(result).toBe(true);
            });

            it("PurpleThunder transitions from warning to strike after warningDuration", () => {
                const th = new PurpleThunder(mockGame, 120);

                expect(th.phase).toBe("warning");
                expect(th.dealsDirectHitDamage).toBe(false);

                th.update(th.warningDuration + 1);

                expect(th.phase).toBe("strike");
                expect(th.y).toBe(th.strikeY);
            });

            it("PurpleThunder completes strike animation and marks itself for deletion", () => {
                const th = new PurpleThunder(mockGame, 120);
                th.phase = "strike";
                th.frameX = th.maxFrame;
                th.dealsDirectHitDamage = true;
                th.frameTimer = th.frameInterval;

                th.update(0);

                expect(th.phase).toBe("done");
                expect(th.dealsDirectHitDamage).toBe(false);
                expect(th.markedForDeletion).toBe(true);
            });

            it("endThunderSequence stops thunder sound, clears shake, and transitions back to recharge", () => {
                const boss = new Elyvorg(mockGame);
                boss.isThunderSequenceActive = true;
                boss.thunderSequenceInitialised = true;

                mockGame.shakeActive = true;
                mockGame.shakeTimer = 10;
                mockGame.shakeDuration = 20;

                const stopSpy = jest.spyOn(mockGame.audioHandler.enemySFX, "stopSound");
                const releaseSpy = jest.spyOn(mockGame.bossManager, "releaseScreenEffect");
                boss.backToRechargeSetUp = jest.fn();

                boss.endThunderSequence();

                expect(boss.isThunderSequenceActive).toBe(false);
                expect(boss.thunderSequenceInitialised).toBe(false);
                expect(stopSpy).toHaveBeenCalledWith("elyvorg_purple_thunder_sound_effect");
                expect(releaseSpy).toHaveBeenCalledWith("elyvorg_thunder");

                expect(mockGame.stopShake).toHaveBeenCalled();
                expect(mockGame.shakeActive).toBe(false);
                expect(mockGame.shakeTimer).toBe(0);
                expect(mockGame.shakeDuration).toBe(0);

                expect(boss.previousState).toBe("thunder");
                expect(boss.backToRechargeSetUp).toHaveBeenCalled();
            });
        });

        describe("Meteor shake", () => {
            it("startMeteorShake enables camera shake with configured duration (currently hardcoded 1000 in Elyvorg)", () => {
                const boss = new Elyvorg(mockGame);

                boss.meteorShakeDuration = 1234;

                mockGame.shakeActive = false;
                mockGame.shakeTimer = 999;
                mockGame.shakeDuration = 0;

                boss.startMeteorShake();

                expect(boss.meteorShakeActive).toBe(true);
                expect(mockGame.startShake).toHaveBeenCalledWith(1000);
                expect(mockGame.shakeActive).toBe(true);
                expect(mockGame.shakeTimer).toBe(0);
                expect(mockGame.shakeDuration).toBe(1000);
            });

            it("updateMeteorShakeTimer stops shake when game shake has already ended (shakeActive=false) and not in thunder", () => {
                const boss = new Elyvorg(mockGame);
                boss.meteorShakeActive = true;

                mockGame.shakeActive = false;
                mockGame.shakeTimer = 900;
                mockGame.shakeDuration = 1000;

                boss.state = "meteor";
                boss.isThunderSequenceActive = false;

                boss.updateMeteorShakeTimer(200);

                expect(boss.meteorShakeActive).toBe(false);
            });

            it("updateMeteorShakeTimer cancels meteor shake immediately during thunder", () => {
                const boss = new Elyvorg(mockGame);
                boss.meteorShakeActive = true;
                mockGame.shakeActive = true;
                boss.state = "thunder";
                boss.isThunderSequenceActive = true;

                boss.updateMeteorShakeTimer(100);

                expect(boss.meteorShakeActive).toBe(false);
            });
        });

        describe("ElectricWheel layering", () => {
            it("ensureElectricWheelOnTop moves wheel to end of enemies array", () => {
                const boss = new Elyvorg(mockGame);
                const e1 = new MeteorAttack(mockGame);
                const e2 = new PoisonDrop(mockGame);
                boss.electricWheel = new ElectricWheel(mockGame, 0, 0);

                mockGame.enemies = [e1, boss.electricWheel, e2];

                boss.ensureElectricWheelOnTop();

                expect(mockGame.enemies[mockGame.enemies.length - 1]).toBe(boss.electricWheel);
            });
        });
    });
});
