jest.useFakeTimers();

jest.mock('../../../game/animations/fading.js', () => ({
    fadeInAndOut: jest.fn((canvas, fi, stay, fo, cb) => cb && cb()),
}));

jest.mock('../../../game/animations/collisionAnimation.js', () => {
    const mockIcyStormBallCollisionCtor = jest.fn();
    const mockPointyIcicleShardCollisionCtor = jest.fn();

    class IcyStormBallCollision {
        constructor(game, x, y) {
            mockIcyStormBallCollisionCtor(game, x, y);
            this.game = game;
            this.x = x;
            this.y = y;
        }
    }

    class PointyIcicleShardCollision {
        constructor(game, x, y) {
            mockPointyIcicleShardCollisionCtor(game, x, y);
            this.game = game;
            this.x = x;
            this.y = y;
        }
    }

    return {
        IcyStormBallCollision,
        PointyIcicleShardCollision,
        mockIcyStormBallCollisionCtor,
        mockPointyIcicleShardCollisionCtor,
    };
});

import {
    IceTrail,
    PointyIcicleShard,
    UndergroundIcicle,
    IceSpider,
    IcyStormBall,
    IceSlash,
    SpinningIceBalls,
    Glacikal,
} from '../../../game/entities/enemies/glacikal.js';

import {
    mockIcyStormBallCollisionCtor,
    mockPointyIcicleShardCollisionCtor,
} from '../../../game/animations/collisionAnimation.js';

const makeGame = () => ({
    width: 800,
    height: 400,
    groundMargin: 20,
    speed: 4,
    normalSpeed: 6,
    maxDistance: 999,
    cabin: { isFullyVisible: false },
    canvas: {},
    gameOver: false,
    bossInFight: true,
    background: { totalDistanceTraveled: 0 },
    enemies: [],
    collisions: [],
    behindPlayerParticles: [],
    player: {
        x: 100,
        y: 0,
        width: 100,
        height: 90,
        setState: jest.fn(),
        setToStandingOnce: false,
        isInvisible: false,
        invisibleTimer: 0,
        invisibleCooldown: 1000,
        invisibleActiveCooldownTimer: 0,
    },
    input: { keys: [] },
    boss: {
        id: 'glacikal',
        current: null,
        isVisible: false,
        talkToBoss: false,
        inFight: true,
        runAway: false,
        screenEffect: {
            active: false,
            rgb: [0, 50, 0],
            opacity: 0,
            fadeInSpeed: 0.00298,
        },
        dialogueAfterOnce: false,
        dialogueAfterLeaving: false,
        startAfterDialogueWhenAnimEnds: false,
    },
    audioHandler: {
        enemySFX: {
            playSound: jest.fn(),
            stopAllSounds: jest.fn(),
            fadeOutAndStop: jest.fn(),
            // stopSound is optional in code; not required for tests
        },
        collisionSFX: {
            playSound: jest.fn(),
        },
        mapSoundtrack: { fadeOutAndStop: jest.fn() },
    },
    debug: false,
    coins: 0,
    lives: 5,
    maxLives: 5,
});

beforeAll(() => {
    if (!global.document) global.document = {};
    global.document.getElementById = jest.fn((id) => ({ id }));
});

afterEach(() => {
    jest.clearAllMocks();
});

const withMockedRandom = (values, fn) => {
    const spy = jest.spyOn(Math, 'random');
    let i = 0;
    spy.mockImplementation(() => values[Math.min(i++, values.length - 1)]);
    try {
        fn();
    } finally {
        spy.mockRestore();
    }
};

const makeCtx = () => ({
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    drawImage: jest.fn(),
    strokeRect: jest.fn(),
});

describe('Helper enemies / projectiles', () => {
    test('IceTrail positions on ground and is slow enemy', () => {
        const game = makeGame();
        const trail = new IceTrail(game, 123);

        expect(trail.x).toBe(123);
        expect(trail.isSlowEnemy).toBe(true);
        expect(trail.y).toBe(game.height - trail.height - game.groundMargin);
    });

    test('PointyIcicleShard falls, hits ground, spawns collision & sound, then deletes', () => {
        const game = makeGame();
        const shard = new PointyIcicleShard(game);

        const groundHitY = game.height - game.groundMargin - shard.height;
        shard.y = groundHitY;
        shard.update(16);

        expect(shard.markedForDeletion).toBe(true);
        expect(game.collisions).toHaveLength(1);
        expect(mockPointyIcicleShardCollisionCtor).toHaveBeenCalledWith(
            game,
            expect.any(Number),
            expect.any(Number),
        );
        expect(game.audioHandler.collisionSFX.playSound).toHaveBeenCalledWith(
            'breakingIceNoDamageSound',
            false,
            true,
        );
    });

    test('PointyIcicleShard deletes when offscreen or dead', () => {
        const game = makeGame();
        const shard = new PointyIcicleShard(game);

        // y beyond bottom
        shard.y = game.height + shard.height + 1;
        shard.update(16);
        expect(shard.markedForDeletion).toBe(true);

        const shard2 = new PointyIcicleShard(game);
        shard2.lives = 0;
        shard2.update(16);
        expect(shard2.markedForDeletion).toBe(true);
    });

    test('IcyStormBall ground hit spawns collision and deletes', () => {
        const game = makeGame();
        const storm = new IcyStormBall(game);

        const groundHitY = game.height - game.groundMargin - (storm.height - 7);
        storm.y = groundHitY;
        storm.update(16);

        expect(storm.markedForDeletion).toBe(true);
        expect(game.collisions).toHaveLength(1);
        expect(mockIcyStormBallCollisionCtor).toHaveBeenCalledWith(
            game,
            expect.any(Number),
            expect.any(Number),
        );
    });

    test('IceSlash draw inverts when speedX > 0, not when speedX < 0', () => {
        const game = makeGame();
        const ctx = makeCtx();

        const rightSlash = new IceSlash(game, 100, 10, 10);
        rightSlash.draw(ctx);
        expect(ctx.scale).toHaveBeenCalledWith(-1, 1);

        const ctx2 = makeCtx();
        const leftSlash = new IceSlash(game, 100, 10, -10);
        leftSlash.draw(ctx2);
        expect(ctx2.scale).not.toHaveBeenCalledWith(-1, 1);
    });

    test('IceSlash deletes when offscreen or dead', () => {
        const game = makeGame();
        const slash = new IceSlash(game, 100, 10, 10);

        slash.x = game.width + 1;
        slash.update(16);
        expect(slash.markedForDeletion).toBe(true);

        const slash2 = new IceSlash(game, 100, 10, -10);
        slash2.lives = 0;
        slash2.update(16);
        expect(slash2.markedForDeletion).toBe(true);
    });

    test('IceSpider deletes when offscreen and plays stop sound', () => {
        const game = makeGame();
        const spider = new IceSpider(game);
        spider.state = 'chasing';
        spider.x = game.width + 5; // off-right

        spider.update(16);

        expect(spider.markedForDeletion).toBe(true);
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
            spider.soundId,
            false,
            true,
            true,
        );
    });

    test('SpinningIceBalls marks for deletion and stops sound when offscreen', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        const ball = new SpinningIceBalls(game, boss, 0, 2, true);

        ball.phase = 'travel';
        ball.x = game.width + 5;

        ball.update(16);

        expect(ball.markedForDeletion).toBe(true);
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
            ball.soundId,
            false,
            true,
            true,
        );
    });

    test('UndergroundIcicle clamps centerX inside bounds', () => {
        const game = makeGame();
        const tooLeft = new UndergroundIcicle(game, -999);
        const tooRight = new UndergroundIcicle(game, game.width + 999);

        expect(tooLeft.centerX).toBeGreaterThanOrEqual(tooLeft.width / 2);
        expect(tooRight.centerX).toBeLessThanOrEqual(
            game.width - tooRight.width / 2,
        );
    });
});

describe('Glacikal boss core', () => {
    test('checksBossIsFullyVisible marks boss visible when inside screen', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;
        boss.x = game.width - boss.width;

        boss.checksBossIsFullyVisible('glacikal');
        expect(game.boss.isVisible).toBe(true);
        expect(boss.x).toBe(game.width - boss.width);
    });

    test('edgeConstraintLogic snaps to left edge and resets to idle', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;
        game.boss.isVisible = true;
        game.isBossVisible = true;

        boss.state = 'run';
        boss.x = -5;

        withMockedRandom([0.9], () => boss.edgeConstraintLogic('glacikal'));

        expect(boss.x).toBe(1);
        expect(boss.reachedLeftEdge).toBe(true);
        expect(boss.state).toBe('idle');
        expect(boss.chooseStateOnce).toBe(true);
    });

    test('edgeConstraintLogic snaps to right edge and resets to idle', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;
        game.boss.isVisible = true;
        game.isBossVisible = true;

        boss.x = game.width - boss.width + 10;

        withMockedRandom([0.9], () => boss.edgeConstraintLogic('glacikal'));

        expect(boss.x).toBe(game.width - boss.width - 1);
        expect(boss.reachedRightEdge).toBe(true);
        expect(boss.state).toBe('idle');
    });

    test('trySpawnIceTrail respects min gap and chance', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;
        boss.x = 300;

        game.enemies.push(new IceTrail(game, boss.x + 10));
        withMockedRandom([0.0], () => boss.trySpawnIceTrail());
        expect(game.enemies.filter((e) => e instanceof IceTrail)).toHaveLength(1);

        game.enemies = [];
        withMockedRandom([0.1], () => boss.trySpawnIceTrail());
        expect(game.enemies.filter((e) => e instanceof IceTrail)).toHaveLength(1);
    });

    test('spawnIcyStormBalls respects max on screen', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        for (let i = 0; i < boss.icyStormMaxOnScreen; i++) {
            game.enemies.push(new IcyStormBall(game));
        }
        boss.spawnIcyStormBalls(3);
        expect(
            game.enemies.filter((e) => e instanceof IcyStormBall),
        ).toHaveLength(boss.icyStormMaxOnScreen);
    });
});

describe('Glacikal attack / IceSlash', () => {
    test('iceSlashAttackLogic throws IceSlash once on last frame', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;
        boss.state = 'iceSlashAttack';

        const spy = jest.spyOn(boss, 'throwIceSlash').mockImplementation(() => { });
        boss.iceSlashAttackAnimation.maxFrame = 5;
        boss.iceSlashAttackAnimation.frameX = 5;
        boss.canIceSlashAttack = true;

        boss.iceSlashAttackLogic();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(boss.canIceSlashAttack).toBe(false);
    });

    test('iceSlashAttackLogic returns to idle when animation resets', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        const idleSpy = jest.spyOn(boss, 'backToIdleSetUp');
        boss.canIceSlashAttack = false;
        boss.iceSlashAttackAnimation.frameX = 0;

        boss.iceSlashAttackLogic();
        expect(idleSpy).toHaveBeenCalled();
        expect(boss.state).toBe('idle');
    });

    test('throwIceSlash aims toward player side and spawns projectile', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;
        boss.x = 400;

        game.player.x = 700;
        boss.throwIceSlash();
        expect(game.enemies.at(-1)).toBeInstanceOf(IceSlash);
        expect(game.enemies.at(-1).speedX).toBeGreaterThan(0);

        game.enemies = [];
        game.player.x = 0;
        boss.throwIceSlash();
        expect(game.enemies.at(-1).speedX).toBeLessThan(0);
    });
});

describe('Glacikal jump attack', () => {
    test('ascend -> airborne when boss reaches offscreenY', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        boss.jumpPhase = 'ascend';
        boss.y = boss.offscreenY - 1;

        boss.jumpLogic(16);
        expect(boss.jumpPhase).toBe('airborne');
    });

    test('airborne fires IceSpiders based on timer', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        boss.jumpPhase = 'airborne';
        boss.iceSpiderDropsTarget = 2;
        boss.iceSpiderDropsFired = 0;

        boss.iceSpiderDropCooldownMin = 0;
        boss.iceSpiderDropCooldownMax = 0;

        boss.iceSpiderDropTimer = 9999;
        boss.iceSpiderNextDrop = 0;

        withMockedRandom([0.2, 0.2], () => {
            boss.jumpLogic(16);

            boss.iceSpiderDropTimer = 9999;
            boss.iceSpiderNextDrop = 0;
            boss.jumpLogic(16);
        });

        expect(
            game.enemies.filter((e) => e instanceof IceSpider),
        ).toHaveLength(2);
        expect(boss.iceSpiderDropsFired).toBe(2);
    });

    test('descend returns to idle at originalY', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        boss.jumpPhase = 'descend';
        boss.y = boss.originalY + 5;
        boss.state = 'jump';

        const idleSpy = jest.spyOn(boss, 'backToIdleSetUp');

        boss.jumpLogic(16);
        expect(boss.y).toBe(boss.originalY);
        expect(idleSpy).toHaveBeenCalled();
    });
});

describe('Glacikal icy storm full cycle', () => {
    test('icyStormLogic at frame 0 enables screenEffect and resets rain flag', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;
        boss.state = 'icyStorm';

        boss.icyStormAnimation.frameX = 0;
        boss.icyStormRainStarted = true;

        boss.icyStormLogic();

        expect(game.boss.screenEffect.active).toBe(true);
        expect(game.boss.screenEffect.rgb).toEqual([0, 60, 120]);
        expect(boss.icyStormRainStarted).toBe(false);
    });

    test('icyStormLogic activates on maxFrame when canIcyStormAttack is true, spawns balls, then returns idle', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;
        boss.state = 'icyStorm';

        boss.canIcyStormAttack = true;
        boss.icyStormAnimation.frameX = boss.icyStormAnimation.maxFrame;

        const idleSpy = jest.spyOn(boss, 'backToIdleSetUp');

        boss.icyStormLogic();

        expect(boss.isIcyStormActive).toBe(true);
        expect(boss.canIcyStormAttack).toBe(false);
        expect(
            game.enemies.filter((e) => e instanceof IcyStormBall),
        ).toHaveLength(boss.icyStormMaxOnScreen);
        expect(boss.state).toBe('idle');
        expect(idleSpy).toHaveBeenCalled();
    });

    test('icyStormLogicTimer spawns over time and ends after duration', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;

        boss.isIcyStormActive = true;
        boss.icyStormTimer = 0;
        boss.icyStormPassiveTimer = 1000;

        withMockedRandom([0.2], () => boss.icyStormLogicTimer(1000));
        expect(
            game.enemies.filter((e) => e instanceof IcyStormBall).length,
        ).toBeGreaterThan(0);

        boss.icyStormTimer = boss.icyStormDuration + 1;
        boss.icyStormLogicTimer(16);

        expect(boss.isIcyStormActive).toBe(false);
        expect(game.boss.screenEffect.active).toBe(false);
    });
});

describe('Glacikal kneel down full cycle', () => {
    test('startKneelDownAttack resets flags and ensures shake fields', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        delete game.shakeActive;
        boss.startKneelDownAttack();

        expect(boss.canKneelDownAttack).toBe(false);
        expect(boss.isKneelDownActive).toBe(false);
        expect(boss.isKneelDownReversing).toBe(false);
        expect(game.shakeActive).toBe(false);
        expect(game.shakeTimer).toBe(0);
        expect(game.shakeDuration).toBe(0);
    });

    test('kneelDownLogic forward anim locks, starts shake, and plays rumble once', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        boss.startKneelDownAttack();

        const anim = boss.glacikalKneelDownAnimation;
        anim.maxFrame = 2;
        anim.frameInterval = 1;

        boss.kneelDownLogic(5);
        boss.kneelDownLogic(5);
        boss.kneelDownLogic(5);

        expect(boss.kneelDownLocked).toBe(true);
        expect(boss.isKneelDownActive).toBe(true);
        expect(game.shakeActive).toBe(true);
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
            'groundRumbleSound',
            false,
            true,
        );
    });

    test('kneelDownLogic active (topIcicles) spawns PointyIcicleShard, then reverses after duration', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        boss.startKneelDownAttack();

        boss.currentKneelAbility = 'topIcicles';
        boss.kneelDownLocked = true;
        boss.isKneelDownActive = true;
        boss.kneelNextIcicle = 0;

        boss.kneelDownLogic(200);
        expect(
            game.enemies.some((e) => e instanceof PointyIcicleShard),
        ).toBe(true);

        boss.kneelDownTimer = boss.kneelDownDuration;
        boss.kneelDownLogic(16);

        expect(boss.isKneelDownActive).toBe(false);
        expect(boss.isKneelDownReversing).toBe(true);
        expect(game.shakeActive).toBe(false);
        expect(game.audioHandler.enemySFX.fadeOutAndStop).toHaveBeenCalledWith(
            'groundRumbleSound',
            1200,
        );
    });

    test('kneelDownLogic reverse transitions to glacikalRecharge and resets cooldown', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        boss.startKneelDownAttack();

        boss.kneelDownLocked = true;
        boss.isKneelDownActive = false;
        boss.isKneelDownReversing = true;

        const anim = boss.glacikalKneelDownAnimation;
        anim.frameX = 1;
        anim.frameInterval = 1;

        boss.kneelReverseTimer = anim.frameInterval;

        boss.kneelDownLogic(0);

        expect(anim.frameX).toBe(0);
        expect(boss.isKneelDownReversing).toBe(false);
        expect(boss.canKneelDownAttack).toBe(true);
        expect(boss.state).toBe('glacikalRecharge');
        expect(boss.previousState).toBe('kneelDown');
        expect(boss.rechargeLoops).toBe(0);
    });

    test('kneelDownLogic (undergroundIcicle) ends when all UndergroundIcicles are gone', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        boss.startKneelDownAttack();

        boss.currentKneelAbility = 'undergroundIcicle';

        // Simulate locked / active state with a finished set of icicles
        boss.kneelDownLocked = true;
        boss.isKneelDownActive = true;
        boss.kneelUndergroundIcicles = [
            new UndergroundIcicle(game, 100),
            new UndergroundIcicle(game, 300),
        ];
        boss.kneelUndergroundIcicles.forEach((ic) => (ic.markedForDeletion = true));

        boss.kneelDownLogic(16);

        expect(boss.isKneelDownActive).toBe(false);
        expect(boss.isKneelDownReversing).toBe(true);
        expect(game.shakeActive).toBe(false);
    });
});

describe('Glacikal spinning ice balls (extendedArm)', () => {
    test('startSpinningIceBallsAttack resets flags and prepares animation', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        boss.canSpinningIceBallsAttack = true;
        boss.spinningLocked = true;
        boss.isSpinningIceBallsActive = true;
        boss.isSpinningIceBallsReversing = true;

        boss.startSpinningIceBallsAttack();

        expect(boss.canSpinningIceBallsAttack).toBe(false);
        expect(boss.spinningLocked).toBe(false);
        expect(boss.isSpinningIceBallsActive).toBe(false);
        expect(boss.isSpinningIceBallsReversing).toBe(false);
        expect(boss.glacikalExtendedArmAnimation.frameX).toBe(0);
    });

    test('spinningIceBallsLogic forward anim locks and fires volley once', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;

        boss.spinningIceBallsCount = 2;
        boss.startSpinningIceBallsAttack();

        const anim = boss.glacikalExtendedArmAnimation;
        anim.maxFrame = 1;
        anim.frameInterval = 1;

        boss.spinningIceBallsLogic(5);

        expect(boss.spinningLocked).toBe(true);
        expect(boss.isSpinningIceBallsActive).toBe(true);
        expect(boss.spinningVolleyFired).toBe(true);
        expect(
            game.enemies.filter((e) => e instanceof SpinningIceBalls),
        ).toHaveLength(2);
    });

    test('spinningIceBallsLogic reverse returns to idle and re-enables attack', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        boss.spinningLocked = true;
        boss.isSpinningIceBallsActive = false;
        boss.isSpinningIceBallsReversing = true;
        boss.canSpinningIceBallsAttack = false;

        const anim = boss.glacikalExtendedArmAnimation;
        anim.frameX = 1;
        anim.frameInterval = 1;

        boss.spinningReverseTimer = anim.frameInterval;

        const idleSpy = jest.spyOn(boss, 'backToIdleSetUp');

        boss.spinningIceBallsLogic(0);

        expect(anim.frameX).toBe(0);
        expect(boss.isSpinningIceBallsReversing).toBe(false);
        expect(boss.spinningLocked).toBe(false);
        expect(boss.canSpinningIceBallsAttack).toBe(true);
        expect(idleSpy).toHaveBeenCalled();
    });

    test('fireSpinningVolley spawns balls toward player side', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;

        boss.spinningIceBallsCount = 3;
        boss.x = 200;
        boss.y = 100;
        boss.width = 100;

        // Player on the right
        game.player.x = 600;
        boss.fireSpinningVolley();

        const balls = game.enemies.filter((e) => e instanceof SpinningIceBalls);
        expect(balls).toHaveLength(3);
        balls.forEach((b) => expect(b.directionRight).toBe(true));

        // Player on the left
        game.enemies = [];
        game.player.x = 0;
        boss.fireSpinningVolley();

        const ballsLeft = game.enemies.filter((e) => e instanceof SpinningIceBalls);
        expect(ballsLeft).toHaveLength(3);
        ballsLeft.forEach((b) => expect(b.directionRight).toBe(false));
    });
});

describe('Glacikal stateRandomiser', () => {
    test('when gameOver, runs if in middle else idle', () => {
        const game = makeGame();
        game.gameOver = true;
        const boss = new Glacikal(game);

        boss.isInTheMiddle = true;
        boss.stateRandomiser();
        expect(boss.state).toBe('run');

        boss.isInTheMiddle = false;
        boss.stateRandomiser();
        expect(boss.state).toBe('idle');
    });

    test('runStateCounter exceeding limit forces run and direction based on shouldInvert', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        boss.runStateCounterLimit = 1;
        boss.runStateCounter = 1;
        boss.isInTheMiddle = false;
        game.player.x = 999;

        boss.stateRandomiser();
        expect(boss.state).toBe('run');
        expect(boss.runningDirection).toBe(10);
    });

    test('random selection does not repeat previousState and respects exclusions', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        boss.previousState = 'iceSlashAttack';
        boss.isIcyStormActive = true;
        boss.canKneelDownAttack = false;
        boss.runStateCounterLimit = 999;
        boss.isInTheMiddle = true;

        withMockedRandom(
            [
                0.5,   // skip "reuse previousState"
                2 / 5, // icyStorm (excluded because isIcyStormActive)
                4 / 5, // kneelDown (excluded because !canKneelDownAttack)
                1 / 5, // jump
            ],
            () => boss.stateRandomiser(),
        );

        expect(boss.state).toBe('jump');
    });
});

describe('Glacikal runningAway', () => {
    test('runningAway moves right and clears boss when offscreen', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;
        game.boss.runAway = true;

        boss.x = game.width + 5;
        boss.runningAway(16, 'glacikal');

        expect(boss.markedForDeletion).toBe(true);
        expect(game.boss.current).toBe(null);
        expect(game.boss.runAway).toBe(false);
        expect(game.boss.isVisible).toBe(false);
    });
});
