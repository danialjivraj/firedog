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

const makeGame = () => {
    const game = {
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
        bossManager: {
            requestScreenEffect: jest.fn(),
            releaseScreenEffect: jest.fn(),
        },
        audioHandler: {
            enemySFX: {
                playSound: jest.fn(),
                stopAllSounds: jest.fn(),
                fadeOutAndStop: jest.fn(),
                stopSound: jest.fn(),
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

        shakeActive: false,
        shakeTimer: 0,
        shakeDuration: 0,
    };

    game.startShake = () => {
        game.shakeActive = true;
        game.shakeTimer = 0;
        game.shakeDuration = 0;
    };
    game.stopShake = () => {
        game.shakeActive = false;
    };

    return game;
};

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
    test('IceTrail spawns at given x on the ground and is marked as slow enemy', () => {
        const game = makeGame();
        const trail = new IceTrail(game, 123);

        expect(trail.x).toBe(123);
        expect(trail.isSlowEnemy).toBe(true);
        expect(trail.y).toBe(game.height - trail.height - game.groundMargin);
    });

    test('PointyIcicleShard reaching ground spawns collision, plays sound and deletes itself', () => {
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

    test('PointyIcicleShard is deleted when offscreen or when lives reach zero', () => {
        const game = makeGame();
        const shard = new PointyIcicleShard(game);

        shard.y = game.height + shard.height + 1;
        shard.update(16);
        expect(shard.markedForDeletion).toBe(true);

        const shard2 = new PointyIcicleShard(game);
        shard2.lives = 0;
        shard2.update(16);
        expect(shard2.markedForDeletion).toBe(true);
    });

    test('IcyStormBall reaching its ground hit point spawns collision and deletes itself', () => {
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

    test('IceSlash draw inverts horizontally when travelling right, not when travelling left', () => {
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

    test('IceSlash is deleted when offscreen or when lives reach zero', () => {
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

    test('IceSpider leaving viewport marks itself for deletion and plays stop sound', () => {
        const game = makeGame();
        const spider = new IceSpider(game);
        spider.state = 'chasing';
        spider.x = game.width + 5;

        spider.update(16);

        expect(spider.markedForDeletion).toBe(true);
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
            spider.soundId,
            false,
            true,
            true,
        );
    });

    test('SpinningIceBalls in travel phase delete offscreen and request sound stop', () => {
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

    test('SpinningIceBalls emerge phase grows ball, snaps to travel and fires throw sound once', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        const ball = new SpinningIceBalls(game, boss, 0, 2, true);

        expect(ball.phase).toBe('emerge');
        expect(ball.scale).toBeLessThan(ball.maxScale);

        const playSpy = game.audioHandler.enemySFX.playSound;

        ball.update(1000);

        expect(ball.phase).toBe('travel');
        expect(ball.scale).toBe(ball.maxScale);
        expect(ball.speedX).toBeGreaterThan(0);
        expect(ball.throwSoundPlayed).toBe(true);
        expect(playSpy).toHaveBeenCalledWith('iceBallSound', false, true);
    });

    test('UndergroundIcicle clamps initial centerX inside horizontal bounds', () => {
        const game = makeGame();
        const tooLeft = new UndergroundIcicle(game, -999);
        const tooRight = new UndergroundIcicle(game, game.width + 999);

        expect(tooLeft.centerX).toBeGreaterThanOrEqual(tooLeft.width / 2);
        expect(tooRight.centerX).toBeLessThanOrEqual(game.width - tooRight.width / 2);
    });

    test('UndergroundIcicle transitions from warning to emerge after warningDuration and plays sound', () => {
        const game = makeGame();
        const icicle = new UndergroundIcicle(game, 200);

        icicle.timer = icicle.warningDuration;
        const initialHiddenY = icicle.hiddenY;

        icicle.update(0);

        expect(icicle.phase).toBe('emerge');
        expect(icicle.timer).toBe(0);
        expect(icicle.y).toBe(initialHiddenY);
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
            'undergroundIcicleSound',
            false,
            true,
        );
    });
});

describe('Glacikal boss core', () => {
    test('checksBossIsFullyVisible marks boss visible once fully inside screen', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;
        boss.x = game.width - boss.width;

        boss.checksBossIsFullyVisible('glacikal');
        expect(game.boss.isVisible).toBe(true);
        expect(boss.x).toBe(game.width - boss.width);
    });

    test('edgeConstraintLogic hitting left edge snaps, sets reachedLeftEdge and returns to idle', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;
        game.boss.isVisible = true;

        boss.state = 'run';
        boss.x = -5;

        withMockedRandom([0.9], () => boss.edgeConstraintLogic('glacikal'));

        expect(boss.x).toBe(1);
        expect(boss.reachedLeftEdge).toBe(true);
        expect(boss.state).toBe('idle');
    });

    test('edgeConstraintLogic hitting right edge snaps, sets reachedRightEdge and returns to idle', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;
        game.boss.isVisible = true;

        boss.x = game.width - boss.width + 10;

        withMockedRandom([0.9], () => boss.edgeConstraintLogic('glacikal'));

        expect(boss.x).toBe(game.width - boss.width - 1);
        expect(boss.reachedRightEdge).toBe(true);
        expect(boss.state).toBe('idle');
    });

    test('trySpawnIceTrail enforces minimum gap and randomness-based spawn chance', () => {
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

    test('spawnIcyStormBalls never exceeds configured maximum concurrent IcyStormBall count', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        for (let i = 0; i < boss.icyStormMaxOnScreen; i++) {
            game.enemies.push(new IcyStormBall(game));
        }
        boss.spawnIcyStormBalls(3);
        expect(game.enemies.filter((e) => e instanceof IcyStormBall)).toHaveLength(boss.icyStormMaxOnScreen);
    });
});

describe('Glacikal ice slash attack', () => {
    test('iceSlashAttackLogic throws exactly one IceSlash when reaching last frame and flag is set', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;
        boss.state = 'iceSlashAttack';

        const spy = jest.spyOn(boss, 'throwIceSlash').mockImplementation(() => {});
        boss.iceSlashAttackAnimation.maxFrame = 5;
        boss.iceSlashAttackAnimation.frameX = 5;
        boss.canIceSlashAttack = true;

        boss.iceSlashAttackLogic();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(boss.canIceSlashAttack).toBe(false);
    });

    test('iceSlashAttackLogic goes back to idle when animation loops to frame 0 after attack', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        const idleSpy = jest.spyOn(boss, 'backToIdleSetUp');
        boss.canIceSlashAttack = false;
        boss.iceSlashAttackAnimation.frameX = 0;

        boss.iceSlashAttackLogic();
        expect(idleSpy).toHaveBeenCalled();
        expect(boss.state).toBe('idle');
    });

    test('throwIceSlash fires projectile toward player side and sets projectile direction accordingly', () => {
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
    test('jumpLogic from ascend phase switches to airborne once offscreenY is reached', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        boss.jumpPhase = 'ascend';
        boss.y = boss.offscreenY - 1;

        boss.jumpLogic(16);
        expect(boss.jumpPhase).toBe('airborne');
    });

    test('airborne phase drops IceSpiders according to timers until target count reached', () => {
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

        expect(game.enemies.filter((e) => e instanceof IceSpider)).toHaveLength(2);
        expect(boss.iceSpiderDropsFired).toBe(2);
    });

    test('descend phase lands at originalY and transitions back to idle', () => {
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

describe('Glacikal icy storm sequence', () => {
    test('icyStormLogic at frame 0 requests screen effect, plays start sounds and clears rain flag', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;
        boss.state = 'icyStorm';

        boss.icyStormAnimation.frameX = 0;
        boss.icyStormRainStarted = true;

        boss.icyStormLogic();

        expect(game.bossManager.requestScreenEffect).toHaveBeenCalledWith(
            'glacikal_icy_storm',
            { rgb: [0, 60, 120], fadeInSpeed: 0.00298 },
        );
        expect(boss.icyStormRainStarted).toBe(false);
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
            'elyvorg_poison_drop_indicator_sound',
            false,
            true,
        );
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
            'glacikal_icy_storm_start',
            false,
            true,
        );
    });

    test('icyStormLogic on rainFrame starts rain sound and sets rainStarted flag', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        const rainFrame = Math.max(1, Math.floor(boss.icyStormAnimation.maxFrame * (17 / 23)));

        boss.icyStormAnimation.frameX = rainFrame;
        boss.icyStormRainStarted = false;

        boss.icyStormLogic();

        expect(boss.icyStormRainStarted).toBe(true);
        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
            'glacikal_icy_storm_rain',
            false,
            true,
        );
    });

    test('icyStormLogic activates storm and spawns initial balls at max frame, then returns to idle', () => {
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
        expect(game.enemies.filter((e) => e instanceof IcyStormBall)).toHaveLength(boss.icyStormMaxOnScreen);
        expect(boss.state).toBe('idle');
        expect(idleSpy).toHaveBeenCalled();
    });

    test('icyStormLogicTimer ends after duration, re-enables canIcyStormAttack and clears screen effect', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;

        boss.isIcyStormActive = true;
        boss.canIcyStormAttack = false;

        boss.icyStormTimer = boss.icyStormDuration + 1;
        boss.icyStormLogicTimer(16);

        expect(boss.isIcyStormActive).toBe(false);
        expect(boss.canIcyStormAttack).toBe(true);
        expect(game.bossManager.releaseScreenEffect).toHaveBeenCalledWith('glacikal_icy_storm');
    });

    test('icyStormLogicTimer periodically spawns balls while active', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;

        boss.isIcyStormActive = true;
        boss.icyStormTimer = 0;
        boss.icyStormPassiveTimer = 1000;

        withMockedRandom([0.2], () => boss.icyStormLogicTimer(1000));
        expect(game.enemies.filter((e) => e instanceof IcyStormBall).length).toBeGreaterThan(0);
    });
});

describe('Glacikal kneel down full cycle', () => {
    test('startKneelDownAttack resets flags, timers and ensures shake bookkeeping fields exist', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        boss.startKneelDownAttack();

        expect(boss.canKneelDownAttack).toBe(false);
        expect(boss.isKneelDownActive).toBe(false);
        expect(boss.isKneelDownReversing).toBe(false);
        expect(game.shakeActive).toBe(false);
        expect(game.shakeTimer).toBe(0);
        expect(game.shakeDuration).toBe(0);
    });

    test('kneelDownLogic forward animation reaches lock, starts shake and plays rumble exactly once', () => {
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

    test('kneelDownLogic topIcicles mode spawns PointyIcicleShard and reverses after duration, stopping shake', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        boss.startKneelDownAttack();

        boss.currentKneelAbility = 'topIcicles';
        boss.kneelDownLocked = true;
        boss.isKneelDownActive = true;
        boss.kneelNextIcicle = 0;

        boss.kneelDownLogic(200);
        expect(game.enemies.some((e) => e instanceof PointyIcicleShard)).toBe(true);

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

    test('kneelDownLogic reverse phase transitions into recharge and resets kneel cooldown flags', () => {
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
        expect(boss.state).toBe('recharge');
        expect(boss.previousState).toBe('kneelDown');
        expect(boss.rechargeLoops).toBe(0);
    });

    test('kneelDownLogic undergroundIcicle mode ends once all spawned UndergroundIcicles are deleted', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        boss.startKneelDownAttack();

        boss.currentKneelAbility = 'undergroundIcicle';
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
    test('startSpinningIceBallsAttack resets spinning flags and reinitialises extended arm animation', () => {
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

    test('spinningIceBallsLogic forward phase locks animation, activates spinning and fires volley exactly once', () => {
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
        expect(game.enemies.filter((e) => e instanceof SpinningIceBalls)).toHaveLength(2);
    });

    test('spinningIceBallsLogic reverse phase returns to idle and re-enables extendedArm attack', () => {
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

    test('fireSpinningVolley spawns spinning balls toward the correct side of the player', () => {
        const game = makeGame();
        const boss = new Glacikal(game);
        game.boss.current = boss;

        boss.spinningIceBallsCount = 3;
        boss.x = 200;
        boss.y = 100;
        boss.width = 100;

        game.player.x = 600;
        boss.fireSpinningVolley();

        const balls = game.enemies.filter((e) => e instanceof SpinningIceBalls);
        expect(balls).toHaveLength(3);
        balls.forEach((b) => expect(b.directionRight).toBe(true));

        game.enemies = [];
        game.player.x = 0;
        boss.fireSpinningVolley();

        const ballsLeft = game.enemies.filter((e) => e instanceof SpinningIceBalls);
        expect(ballsLeft).toHaveLength(3);
        ballsLeft.forEach((b) => expect(b.directionRight).toBe(false));
    });
});

describe('Glacikal recharge & run sound handling', () => {
    test('rechargeLogic loops animation maxFrame and returns to idle after configured loops', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        const anim = boss.glacikalRechargeAnimation;
        boss.state = 'recharge';
        boss.rechargeLoopsMax = 2;

        const idleSpy = jest.spyOn(boss, 'backToIdleSetUp');
        anim.frameX = anim.maxFrame;
        boss.rechargeLoops = 0;

        boss.rechargeLogic(0);
        expect(idleSpy).not.toHaveBeenCalled();
    });

    test('handleRunSound plays run loop when entering run state', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        boss.state = 'run';
        boss.isRunSoundPlaying = false;

        boss.handleRunSound();

        expect(game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith(
            'glacikalRunSound',
            false,
            true,
        );
        expect(boss.isRunSoundPlaying).toBe(true);
    });

    test('handleRunSound stops run sound when leaving run state', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        boss.state = 'idle';
        boss.isRunSoundPlaying = true;

        boss.handleRunSound();

        expect(game.audioHandler.enemySFX.stopSound).toHaveBeenCalledWith('glacikalRunSound');
        expect(boss.isRunSoundPlaying).toBe(false);
    });

    test('handleRunSound also stops run sound when boss dies or is marked for deletion', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        boss.state = 'run';
        boss.isRunSoundPlaying = true;
        boss.lives = 0;

        boss.handleRunSound();

        expect(game.audioHandler.enemySFX.stopSound).toHaveBeenCalledWith('glacikalRunSound');
        expect(boss.isRunSoundPlaying).toBe(false);
    });
});

describe('Glacikal stateRandomiser', () => {
    test('when game is over, stateRandomiser chooses run if in middle, otherwise idle', () => {
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

    test('runStateCounter at or above limit forces run and runningDirection based on shouldInvert', () => {
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

    test('stateRandomiser can force kneelDown when cooldown reached and kneelDown is available', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        boss.statesSinceKneelDown = boss.kneelDownStateCooldown;
        boss.canKneelDownAttack = true;
        boss.isIcyStormActive = false;
        boss.runStateCounter = 0;
        boss.runStateCounterLimit = 999;

        const kneelSpy = jest.spyOn(boss, 'startKneelDownAttack');

        boss.stateRandomiser();

        expect(boss.state).toBe('kneelDown');
        expect(kneelSpy).toHaveBeenCalled();
    });

    test('random selection does not repeat previousState and respects state exclusions (no infinite loop)', () => {
        const game = makeGame();
        const boss = new Glacikal(game);

        boss.previousState = 'iceSlashAttack';
        boss.isIcyStormActive = true;
        boss.canKneelDownAttack = false;
        boss.runStateCounterLimit = 999;
        boss.isInTheMiddle = true;

        withMockedRandom(
            [
                0.5,
                0.4,
                0.2,
            ],
            () => boss.stateRandomiser(),
        );

        expect(boss.state).toBe('jump');
    });
});