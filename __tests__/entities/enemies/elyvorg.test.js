import { jest } from "@jest/globals";
jest.mock("../../../game/animations/fading.js", () => ({
    fadeInAndOut: jest.fn((canvas, fadein, stay, fadeout, cb) => cb()),
}));
import {
    GroundEnemyBoss,
    Barrier,
    MeteorAttack,
    PoisonDrop,
    GhostElyvorg,
    GravitationalAura,
    ElectricWheel,
    InkBomb,
    PurpleFireball,
    Arrow,
    PurpleSlash,
    Elyvorg,
} from "../../../game/entities/enemies/elyvorg.js";
import {
    MeteorExplosionCollision,
    PoisonDropGroundCollision,
    DarkExplosion,
} from "../../../game/animations/collisionAnimation.js";
import { LaserBeam } from "../../../game/entities/enemies/enemies.js";
import { PurpleWarningIndicator } from "../../../game/animations/damageIndicator.js";
import { fadeInAndOut } from "../../../game/animations/fading.js";

describe("elyvorg.js entities (thorough)", () => {
    let mockGame, ctx;
    const imgIds = [
        "barrier", "barrier1", "barrier2",
        "meteorAttack", "poisonDrop", "elyvorgGhostRun",
        "gravitationalAura", "electricWheel", "inkBomb",
        "purpleFireball", "yellowArrow", "blueArrow", "greenArrow",
        "purpleSlash", "elyvorgIdle", "elyvorgRun", "elyvorgJump",
        "elyvorgRechargeIdle", "elyvorgPistolIdle", "elyvorgLaserIdle",
        "elyvorgMeteorIdle", "elyvorgPoisonIdle", "elyvorgGhostIdle",
        "elyvorgGravityIdle", "elyvorgInkIdle", "elyvorgIdleFireball",
        "elyvorg_laser_beam",
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
                explosionSFX: { playSound: jest.fn() },
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
            },
            poisonScreen: false,
            behindPlayerParticles: [],
            isElyvorgFullyVisible: true,
            elyvorgInFight: true,
            gameOver: false,
            hiddenTime: 0,
            talkToElyvorg: false,
            elyvorgRunAway: false,
            input: { keys: [] },
            background: { totalDistanceTraveled: 0 },
            maxDistance: 1000,
            canvas: {},
        };
    });

    describe("GroundEnemyBoss & Barrier basics", () => {
        it("correctly sets position and image", () => {
            const e = new GroundEnemyBoss(mockGame, 100, 80, 5, "elyvorgIdle");
            expect(e.x).toBe(800);
            expect(e.y).toBe(600 - 80 - 50);
            expect(e.image.id).toBe("elyvorgIdle");
        });

        it("Barrier clamps image index with lives", () => {
            const b = new Barrier(mockGame, 10, 20);
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

        it("GroundEnemyBoss.draw strokes rect in debug mode", () => {
            mockGame.debug = true;
            const e = new GroundEnemyBoss(mockGame, 30, 40, 1, "elyvorgIdle");
            e.frameX = 0; e.frameY = 0; e.x = 5; e.y = 6;
            e.draw(ctx, false);
            expect(ctx.strokeRect).toHaveBeenCalledWith(5, 6, 30, 40);
        });

        it("Barrier.draw strokes rect in debug mode", () => {
            mockGame.debug = true;
            const b = new Barrier(mockGame, 10, 20);
            b.draw(ctx);
            expect(ctx.strokeRect).toHaveBeenCalledWith(10, 20, b.width, b.height);
        });
    });

    describe("MeteorAttack & PoisonDrop collision branches", () => {
        it("MeteorAttack falls then explodes", () => {
            const m = new MeteorAttack(mockGame);
            mockGame.cabin.isFullyVisible = false;
            m.y = mockGame.height - mockGame.groundMargin - 190 + 1;
            m.update(0);
            expect(m.markedForDeletion).toBe(true);
            expect(mockGame.collisions[0]).toBeInstanceOf(MeteorExplosionCollision);
            expect(mockGame.audioHandler.explosionSFX.playSound)
                .toHaveBeenCalledWith("elyvorg_meteor_in_contact_with_ground_sound");
        });

        it("PoisonDrop falls then collides", () => {
            const p = new PoisonDrop(mockGame);
            mockGame.cabin.isFullyVisible = false;
            p.y = mockGame.height - mockGame.groundMargin - 53 + 1;
            p.update(0);
            expect(p.markedForDeletion).toBe(true);
            expect(mockGame.collisions[0]).toBeInstanceOf(PoisonDropGroundCollision);
        });
    });

    describe("GhostElyvorg & GravitationalAura dynamics", () => {
        it("GhostElyvorg moves by incrementMovement", () => {
            const g = new GhostElyvorg(mockGame);
            g.incrementMovement = 7;
            const start = g.x;
            g.update(0);
            expect(g.x).toBe(start + 7);
        });

        it("GhostElyvorg.draw flips based on incrementMovement", () => {
            const g = new GhostElyvorg(mockGame);
            g.incrementMovement = 5;
            g.frameX = 0; g.frameY = 0; g.x = 10; g.y = 10;
            g.draw(ctx);
            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
        });

        it("GhostElyvorg.draw does not flip when incrementMovement <= 0", () => {
            const g = new GhostElyvorg(mockGame);
            g.incrementMovement = -3;
            g.frameX = 0; g.frameY = 0; g.x = 10; g.y = 10;
            g.draw(ctx);
            expect(ctx.scale).toHaveBeenCalledWith(1, 1);
        });

        it("GravitationalAura follows boss, clamps y, and pushes player", () => {
            const boss = { x: 50, width: 100, reachedLeftEdge: true };
            const aura = new GravitationalAura(mockGame, 0, 20, mockGame.player, boss);
            aura.speedX = 0;
            mockGame.player.x = 200;
            mockGame.player.y = 200;
            mockGame.player.isSlowed = true;
            aura.update(0);
            expect(aura.y).toBe(100);
            expect(aura.rotationAngle).toBeGreaterThan(0);
            expect(mockGame.player.x).toBeLessThan(200);
        });

        it("GravitationalAura.draw applies rotation and draws image", () => {
            const boss = { x: 0, width: 10, reachedLeftEdge: false };
            const aura = new GravitationalAura(mockGame, 20, 30, mockGame.player, boss);
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

    describe("ElectricWheel, InkBomb, PurpleFireball", () => {
        it("ElectricWheel rotate&shadow in draw", () => {
            const ew = new ElectricWheel(mockGame, 0, 0);
            ew.rotationAngle = 1.2;
            ew.draw(ctx);
            expect(ctx.shadowColor).toBe("yellow");
            expect(ctx.shadowBlur).toBe(10);
        });

        it("InkBomb draw flips when direction=true", () => {
            const ib = new InkBomb(mockGame, 100, 100, 1, 50, 10, true);
            ib.scale = 1;
            ib.draw(ctx);
            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();
        });

        it("PurpleFireball draw uses purple shadow", () => {
            const pf = new PurpleFireball(mockGame, 10, 10, 2, 2);
            pf.draw(ctx);
            expect(ctx.shadowColor).toBe("purple");
            expect(ctx.shadowBlur).toBe(20);
        });

        it("ElectricWheel.update increments rotationAngle by rotationSpeed", () => {
            const ew = new ElectricWheel(mockGame, 0, 0);
            ew.rotationAngle = 0;
            const before = ew.rotationAngle;
            ew.update(0);
            expect(ew.rotationAngle).toBeCloseTo(before + ew.rotationSpeed);
        });
    });

    describe("Arrow & PurpleSlash drawing", () => {
        it("Arrow applies blue shadow for blueArrow", () => {
            const arr = new Arrow(mockGame, 0, 0, 5, 5, false, "blueArrow");
            arr.draw(ctx);
            expect(ctx.shadowColor).toBe("blue");
            expect(ctx.shadowBlur).toBe(10);
        });

        it("Arrow applies yellow shadow for yellowArrow", () => {
            const arrY = new Arrow(mockGame, 0, 0, 5, 5, false, "yellowArrow");
            arrY.draw(ctx);
            expect(ctx.shadowColor).toBe("yellow");
            expect(ctx.shadowBlur).toBe(10);
        });

        it("PurpleSlash flips and uses purple shadow", () => {
            const ps = new PurpleSlash(mockGame, 0, 0, true);
            ps.draw(ctx);
            expect(ctx.shadowColor).toBe("purple");
            expect(ctx.shadowBlur).toBe(20);
            expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
        });

        it("PurpleSlash.update marks for deletion and zeroes lives when frameX >= maxFrame", () => {
            const ps = new PurpleSlash(mockGame, 0, 0, false);
            ps.frameX = ps.maxFrame;
            ps.lives = 3;
            ps.markedForDeletion = false;
            ps.update(0);
            expect(ps.markedForDeletion).toBe(true);
            expect(ps.lives).toBe(0);
        });
    });

    describe("Elyvorg special-attack helpers", () => {
        let boss;
        beforeEach(() => boss = new Elyvorg(mockGame));

        it("cutsceneBackgroundChange toggles enterDuringBackgroundTransition", () => {
            boss.cutsceneBackgroundChange(1, 1, 1);
            expect(fadeInAndOut).toHaveBeenCalled();
            expect(mockGame.enterDuringBackgroundTransition).toBe(true);
        });

        it("backToIdleSetUp resets state/frame/chooseStateOnce", () => {
            boss.state = "run";
            boss.previousState = "jump";
            boss.chooseStateOnce = false;
            boss.backToIdleSetUp();
            expect(boss.previousState).toBe("run");
            expect(boss.state).toBe("idle");
            expect(boss.frameX).toBe(0);
            expect(boss.chooseStateOnce).toBe(true);
        });

        it("throwLaserBeam pushes two LaserBeams", () => {
            mockGame.player.x = boss.x - 100;
            boss.throwLaserBeam();
            const beams = mockGame.enemies.filter(e => e instanceof LaserBeam);
            expect(beams).toHaveLength(2);
            beams.forEach(b => expect(b.speedX).toBe(20));
        });

        it("throwFireballAttack spawns a PurpleFireball", () => {
            mockGame.player.x = boss.x - 200;
            boss.throwFireballAttack();
            const fbs = mockGame.enemies.filter(e => e instanceof PurpleFireball);
            expect(fbs).toHaveLength(1);
            expect(fbs[0].speedX).toBe(15);
        });

        describe("throwArrowAttack image selection", () => {
            it("uses blueArrow when Math.random()<1/3", () => {
                const rand = jest.spyOn(Math, "random").mockReturnValue(0.2);
                mockGame.enemies = [];
                boss.throwArrowAttack();
                expect(mockGame.enemies[0].image.id).toBe("blueArrow");
                rand.mockRestore();
            });
            it("uses yellowArrow when first>=1/3 and second<2/3", () => {
                const rand = jest.spyOn(Math, "random")
                    .mockReturnValueOnce(0.5)
                    .mockReturnValueOnce(0.5);
                mockGame.enemies = [];
                boss.throwArrowAttack();
                expect(mockGame.enemies[0].image.id).toBe("yellowArrow");
                rand.mockRestore();
            });
            it("uses greenArrow when both>=2/3", () => {
                const rand = jest.spyOn(Math, "random")
                    .mockReturnValueOnce(0.5)
                    .mockReturnValueOnce(0.8);
                mockGame.enemies = [];
                boss.throwArrowAttack();
                expect(mockGame.enemies[0].image.id).toBe("greenArrow");
                rand.mockRestore();
            });
        });

        it("throwGravityAttack spawns GravitationalAura and sets flag", () => {
            mockGame.player.x = boss.x + 200;
            boss.throwGravityAttack();
            expect(boss.isGravitySpinnerActive).toBe(true);
            expect(mockGame.enemies.filter(e => e instanceof GravitationalAura)).toHaveLength(1);
        });
    });

    describe("Elyvorg state-transition & logic methods", () => {
        let boss;
        beforeEach(() => boss = new Elyvorg(mockGame));

        it("fireballThrownWhileInIdle → jump when fireball near", () => {
            boss.state = "idle";
            mockGame.behindPlayerParticles.push({ x: boss.x, y: boss.y, maxSize: boss.height });
            boss.fireballThrownWhileInIdle();
            expect(boss.state).toBe("jump");
        });

        it("edgeConstraintLogic handles edges and middle flag", () => {
            boss.x = -10; mockGame.isElyvorgFullyVisible = true;
            boss.edgeConstraintLogic();
            expect(boss.x).toBe(1);
            expect(boss.reachedLeftEdge).toBe(true);
            boss.runAnimation.x = mockGame.width / 2;
            boss.edgeConstraintLogic();
            expect(boss.isInTheMiddle).toBe(true);
            boss.x = mockGame.width + 10;
            boss.edgeConstraintLogic();
            expect(boss.reachedRightEdge).toBe(true);
        });

        it("jumpLogic performs arc, arrow at midpoint, then resets", () => {
            boss.state = "jump";
            boss.jumpAnimation.frameX = 0;
            boss.jumpLogic();
            expect(boss.jumpedBeforeDistanceLogic).toBe(true);
            boss.game.hiddenTime = boss.jumpStartTime + boss.jumpDuration * 500;
            boss.canJumpAttack = true;
            boss.jumpLogic();
            expect(mockGame.enemies.some(e => e instanceof Arrow)).toBe(true);
            boss.game.hiddenTime = boss.jumpStartTime + boss.jumpDuration * 1000 + 1;
            boss.jumpLogic();
            expect(boss.state).toBe("idle");
        });

        it("laserLogic fires 3 times then resets", () => {
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

        it("meteorLogic spawns 7 meteors and plays sound", () => {
            boss.meteorAnimation.frameX = 9;
            boss.meteorLogic();
            expect(mockGame.audioHandler.enemySFX.playSound)
                .toHaveBeenCalledWith("elyvorg_meteor_attack_sound");
            boss.meteorAnimation.frameX = boss.meteorAnimation.maxFrame;
            boss.canMeteorAttack = true;
            boss.meteorThrowCount = 0;
            boss.meteorLogic();
            expect(mockGame.enemies.filter(e => e instanceof MeteorAttack)).toHaveLength(7);
        });

        it("poisonLogic indicator, drops, and reset", () => {
            boss.poisonAnimation.frameX = 0;
            boss.poisonLogic();
            expect(mockGame.poisonScreen).toBe(true);
            boss.poisonAnimation.frameX = 17;
            boss.poisonLogic();
            expect(mockGame.audioHandler.enemySFX.playSound)
                .toHaveBeenCalledWith("elyvorg_poison_drop_rain_sound", false, true);
            boss.poisonAnimation.frameX = boss.poisonAnimation.maxFrame;
            boss.canPoisonAttack = true;
            boss.poisonLogic();
            expect(boss.isPoisonActive).toBe(true);
            expect(mockGame.enemies.filter(e => e instanceof PoisonDrop).length).toBe(7);
        });

        it("poisonLogicTimer spawns passive drops", () => {
            const rand = jest.spyOn(Math, "random").mockReturnValue(0);
            boss.isPoisonActive = true;
            boss.state = "idle";
            mockGame.enemies = [];
            boss.passivePoisonCooldown = 0;
            boss.poisonCooldownTimer = 0;
            boss.poisonLogicTimer(1000);
            expect(mockGame.enemies.filter(e => e instanceof PoisonDrop)).toHaveLength(1);
            rand.mockRestore();
        });

        it("gravityLogicTimer explodes aura after cooldown", () => {
            boss.isGravitySpinnerActive = true;
            boss.gravitationalAura = { lives: 1, x: 10, y: 10, width: 5, height: 5 };
            boss.gravityCooldownTimer = boss.gravityCooldown;
            boss.gravityLogicTimer(0);
            expect(boss.isGravitySpinnerActive).toBe(false);
            expect(mockGame.collisions.some(c => c instanceof DarkExplosion)).toBe(true);
        });

        it("pistolLogic toggles to recharge", () => {
            boss.pistolAnimation.frameX = 17;
            boss.isElectricWheelActive = false;
            boss.pistolLogic();
            expect(boss.state).toBe("recharge");
        });

        it("ghostLogic plays sound and spawns ghosts", () => {
            boss.ghostAnimation.frameX = 0;
            boss.ghostLogic();
            expect(mockGame.audioHandler.enemySFX.playSound)
                .toHaveBeenCalledWith("elyvorg_ghost_attack_sound", false, true);
            boss.ghostAnimation.frameX = 17;
            boss.canGhostAttack = true;
            mockGame.enemies = [];
            jest.spyOn(Math, "random").mockReturnValue(0.4);
            boss.ghostLogic();
            const ghosts = mockGame.enemies.filter(e => e instanceof GhostElyvorg);
            expect(ghosts.length).toBe(2);
            Math.random.mockRestore();
        });

        it("inkLogic spawns 5 InkBombs", () => {
            boss.inkAnimation.frameX = 1;
            boss.canInkAttack = true;
            mockGame.enemies = [];
            boss.inkLogic();
            expect(mockGame.enemies.filter(e => e instanceof InkBomb).length).toBe(5);
        });

        it("fireballLogic spawns fireball and resets state", () => {
            boss.fireballAnimation.frameX = 10;
            boss.canFireballAttack = true;
            mockGame.enemies = [];
            boss.fireballLogic();
            expect(mockGame.enemies.filter(e => e instanceof PurpleFireball)).toHaveLength(1);
            expect(boss.canFireballAttack).toBe(false);
            boss.fireballAnimation.frameX = boss.fireballAnimation.maxFrame;
            boss.fireballLogic();
            expect(boss.state).toBe("idle");
        });

        it("barrierLogic handles break, crack sounds, and regeneration", () => {
            boss.oneBarrier = false;
            boss.isBarrierActive = false;
            boss.barrier = new Barrier(mockGame, 0, 0);
            boss.barrier.lives = 2;
            boss.shieldCrackLives2SoundPlayed = false;
            boss.barrierLogic(0);
            expect(mockGame.audioHandler.enemySFX.playSound)
                .toHaveBeenCalledWith("elyvorg_shield_crack_1_sound");
            boss.barrier.lives = 1;
            boss.shieldCrackLives1SoundPlayed = false;
            boss.barrierLogic(0);
            expect(mockGame.audioHandler.enemySFX.playSound)
                .toHaveBeenCalledWith("elyvorg_shield_crack_2_sound");
            boss.barrier.lives = 0;
            boss.shieldCrackLives0SoundPlayed = false;
            boss.barrierLogic(0);
            expect(mockGame.audioHandler.enemySFX.playSound)
                .toHaveBeenCalledWith("elyvorg_shield_crack_3_sound");
        });

        it("electricWheelLogic initial spawn", () => {
            boss.oneElectricWheel = true;
            mockGame.enemies = [];
            boss.isElectricWheelActive = false;
            boss.electricWheelLogic(0);
            expect(mockGame.enemies.filter(e => e instanceof ElectricWheel)).toHaveLength(1);
            expect(boss.isElectricWheelActive).toBe(true);
            expect(mockGame.audioHandler.enemySFX.playSound)
                .toHaveBeenCalledWith("elyvorg_electricity_wheel_sound", true);
        });

        it("checksElyvorgIsFullyVisible toggles flag", () => {
            boss.x = 0;
            mockGame.isElyvorgFullyVisible = false;
            boss.checksElyvorgIsFullyVisible();
            expect(mockGame.isElyvorgFullyVisible).toBe(true);
        });

        it("stateRandomiser respects gameOver", () => {
            boss.isInTheMiddle = false;
            mockGame.gameOver = true;
            boss.stateRandomiser();
            expect(boss.state).toBe("idle");
            boss.isInTheMiddle = true;
            boss.stateRandomiser();
            expect(boss.state).toBe("run");
        });

        it("draw selects correct animation", () => {
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

        it("checkIfDefeated triggers cutscene and resets state", () => {
            boss.lives = boss.livesDefeatedAt;
            jest.useFakeTimers();
            boss.checkIfDefeated();
            expect(mockGame.elyvorgInFight).toBe(false);
            jest.runAllTimers();
            expect(mockGame.player.setState).toHaveBeenCalledWith(8, 0);
            expect(boss.x).toBe(mockGame.width / 2);
            jest.useRealTimers();
        });

        it("runningAway moves offscreen and marks deletion", () => {
            mockGame.elyvorgRunAway = true;
            boss.x = mockGame.width - 1;
            boss.runningAway(0);
            expect(boss.markedForDeletion).toBe(true);
            expect(mockGame.background.totalDistanceTraveled).toBe(mockGame.maxDistance - 6);
        });

        it("runLogic spawns slash when in range", () => {
            boss.runningDirection = 0;
            boss.slashAttackOnce = true;
            boss.x = mockGame.player.x;
            mockGame.enemies = [];
            boss.runLogic();
            expect(mockGame.enemies.some(e => e instanceof PurpleSlash)).toBe(true);
        });

        it("rechargeLogic triggers stateRandomiser", () => {
            boss.state = "recharge";
            boss.rechargeAnimation.frameX = boss.rechargeAnimation.maxFrame;
            boss.stateRandomiserTimer = boss.stateRandomiserCooldown;
            jest.spyOn(boss, "stateRandomiser");
            boss.rechargeLogic(0);
            expect(boss.stateRandomiser).toHaveBeenCalled();
        });

        it("stateRandomiser picks valid states and respects priorities", () => {
            boss.previousState = "laser";
            boss.isGravitySpinnerActive = true;
            boss.isPoisonActive = true;
            boss.runStateCounter = boss.runStateCounterLimit + 1;
            boss.isInTheMiddle = false;
            boss.stateRandomiser();
            expect(boss.state).toBe("run");
        });

        it("jumpLogic plays arrow sound at midpoint", () => {
            boss.state = "jump";
            boss.jumpAnimation.frameX = 0;
            boss.jumpLogic();
            boss.game.hiddenTime = boss.jumpStartTime + boss.jumpDuration * 1000 * 0.5;
            boss.canJumpAttack = true;
            const spy = jest.spyOn(mockGame.audioHandler.enemySFX, "playSound");
            boss.jumpLogic();
            expect(spy).toHaveBeenCalledWith("elyvorg_arrow_attack_sound", false, true);
        });

        it("laserLogic re-enables canLaserAttack on frameX 20", () => {
            boss.canLaserAttack = false;
            boss.laserAnimation.frameX = 20;
            boss.laserLogic();
            expect(boss.canLaserAttack).toBe(true);
        });

        it("gravityLogic spawns aura and plays both sounds, then resets on frame 23", () => {
            boss.gravityAnimation.frameX = 9;
            boss.canGravityAttack = true;
            const playSpy = jest.spyOn(mockGame.audioHandler.enemySFX, "playSound");
            mockGame.enemies = [];
            boss.gravityLogic();
            expect(mockGame.enemies.some(e => e instanceof GravitationalAura)).toBe(true);
            expect(playSpy).toHaveBeenCalledWith("elyvorg_gravitational_aura_release_sound_effect");
            expect(playSpy).toHaveBeenCalledWith("elyvorg_gravitational_aura_sound_effect", true);
            expect(boss.canGravityAttack).toBe(false);

            boss.gravityAnimation.frameX = 23;
            boss.canGravityAttack = false;
            boss.backToIdleSetUp = jest.fn();
            boss.gravityLogic();
            expect(boss.backToIdleSetUp).toHaveBeenCalled();
            expect(boss.canGravityAttack).toBe(true);
        });

        it("meteorLogic plays falling sound & spawns meteors on frameX 23, and re-enables on 20", () => {
            boss.meteorAnimation.frameX = 23;
            boss.canMeteorAttack = true;
            mockGame.enemies = [];
            const playSpy = jest.spyOn(mockGame.audioHandler.enemySFX, "playSound");
            boss.meteorLogic();
            expect(mockGame.enemies.filter(e => e instanceof MeteorAttack)).toHaveLength(7);
            expect(playSpy).toHaveBeenCalledWith("elyvorg_meteor_falling_sound", true);
            expect(boss.canMeteorAttack).toBe(false);

            boss.canMeteorAttack = false;
            boss.meteorAnimation.frameX = 20;
            boss.meteorLogic();
            expect(boss.canMeteorAttack).toBe(true);
        });

        it("barrierLogic sets player collision timer when barrier breaks", () => {
            boss.oneBarrier = false;
            boss.isBarrierActive = true;
            boss.barrierBreakingSetElyvorgTimer = true;
            boss.barrier = new Barrier(mockGame, 0, 0);
            boss.barrier.lives = 0;
            mockGame.player.elyvorgCollisionTimer = 0;
            boss.barrierLogic(0);
            expect(boss.isBarrierActive).toBe(false);
            expect(boss.barrierBreakingSetElyvorgTimer).toBe(false);
            expect(mockGame.player.elyvorgCollisionTimer).toBe(1000);
        });
    });

    describe("Some edge-cases, etc", () => {
        describe("GravitationalAura extra", () => {
            it("rotationAngle increments by rotationSpeed and shouldInvert flips with player position", () => {
                const boss = { x: 50, width: 10, reachedLeftEdge: false };
                const aura = new GravitationalAura(mockGame, 0, 150, mockGame.player, boss);
                aura.speedX = 0;
                mockGame.player.x = 300;
                boss.x = 0;
                const before = aura.rotationAngle;
                aura.update(16);
                expect(aura.rotationAngle).toBeCloseTo(before + aura.rotationSpeed);
                expect(aura.shouldInvert).toBe(true);

                mockGame.player.x = 0;
                aura.update(16);
                expect(aura.shouldInvert).toBe(false);
            });
        });

        describe("ElectricWheel.shouldElectricWheelInvert()", () => {
            it("toggles direction and speed correctly", () => {
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
            it("grows scale to target, sets speedX, and plays sounds once", () => {
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
            it("grows size until maxSize, moves y upward, and increments rotationAngle", () => {
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
            it("draw for greenArrow applies no shadow and flips when direction=true", () => {
                const arr = new Arrow(mockGame, 0, 0, 5, 0, true, "greenArrow");
                arr.draw(ctx);
                expect(ctx.shadowColor).toBeNull();
                expect(ctx.shadowBlur).toBeNull();
                expect(ctx.scale).toHaveBeenCalledWith(1, 1);
            });
        });

        describe("Barrier regeneration", () => {
            it("regenerates barrier after cooldown", () => {
                const boss = new Elyvorg(mockGame);
                boss.oneBarrier = false;
                boss.isBarrierActive = false;
                boss.barrierCooldown = 100;
                boss.barrierCooldownTimer = 100;
                mockGame.enemies = [];
                boss.barrierLogic(0);
                expect(mockGame.enemies.some(e => e instanceof Barrier)).toBe(true);
                expect(mockGame.audioHandler.enemySFX.playSound)
                    .toHaveBeenCalledWith("elyvorg_shield_up_sound");
            });
        });

        describe("ElectricWheel warning and teardown", () => {
            it("issues warning then cleans up when lives=0", () => {
                const boss = new Elyvorg(mockGame);
                boss.oneElectricWheel = false;
                boss.isElectricWheelActive = false;
                boss.electricWheelStateCounter = boss.electricWheelStateCounterLimit;
                const playSpy = jest.spyOn(mockGame.audioHandler.enemySFX, "playSound");
                boss.electricWheelLogic(0);
                expect(playSpy).toHaveBeenCalledWith("elyvorg_electricity_wheel_warning_sound");
                expect(mockGame.collisions.some(c => c instanceof PurpleWarningIndicator)).toBe(true);

                boss.electricWheel.lives = 0;
                mockGame.player.resetElectricWheelCounters = true;
                boss.electricWheelLogic(0);
                expect(boss.isElectricWheelActive).toBe(false);
                expect(boss.electricWheel.markedForDeletion).toBe(true);
            });
        });

        describe("PoisonLogicTimer reset", () => {
            it("turns poisonScreen off after cooldown", () => {
                const boss = new Elyvorg(mockGame);
                boss.isPoisonActive = true;
                boss.poisonCooldown = 50;
                boss.poisonCooldownTimer = 51;
                mockGame.poisonScreen = true;
                boss.poisonLogicTimer(0);
                expect(boss.isPoisonActive).toBe(false);
                expect(mockGame.poisonScreen).toBe(false);
            });
        });

        describe("stateRandomiser previousState branch", () => {
            it("picks previousState with ~10% chance", () => {
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
            beforeEach(() => boss = new Elyvorg(mockGame));

            it("calls ghostAnimation.draw when state is 'ghost'", () => {
                boss.state = "ghost";
                const spy = jest.spyOn(boss.ghostAnimation, "draw");
                boss.draw(ctx);
                expect(spy).toHaveBeenCalledWith(ctx, expect.any(Boolean));
                spy.mockRestore();
            });

            it("calls pistolAnimation.draw when state is 'pistol'", () => {
                boss.state = "pistol";
                const spy = jest.spyOn(boss.pistolAnimation, "draw");
                boss.draw(ctx);
                expect(spy).toHaveBeenCalledWith(ctx, expect.any(Boolean));
                spy.mockRestore();
            });
        });
    });
});
