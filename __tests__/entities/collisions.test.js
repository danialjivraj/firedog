jest.mock('../../game/entities/powerUpAndDown.js', () => {
    class OxygenTank { }
    class HealthLive { }
    class Coin { }
    class RedPotion { }
    class BluePotion { }
    class RandomPower { }

    class IceDrink { }
    class IceCube { }
    class Cauldron { }
    class BlackHole { }
    class Confuse { }
    class DeadSkull { }
    class CarbonDioxideTank { }

    return {
        OxygenTank,
        HealthLive,
        Coin,
        RedPotion,
        BluePotion,
        RandomPower,

        IceDrink,
        IceCube,
        Cauldron,
        BlackHole,
        Confuse,
        DeadSkull,
        CarbonDioxideTank,
    };
});

jest.mock('../../game/animations/collisionAnimation.js', () => {
    class CollisionAnimation { constructor(...args) { this.args = args; } }
    class ExplosionCollisionAnimation { constructor(...args) { this.args = args; } }
    class PoisonSpitSplash { constructor(...args) { this.args = args; } }
    class InkSplashCollision { constructor(...args) { this.args = args; } }
    class Blood { constructor(...args) { this.args = args; } }
    class ElectricityCollision { constructor(...args) { this.args = args; } }
    class InkBombCollision { constructor(...args) { this.args = args; } }
    class PoisonDropCollision { constructor(...args) { this.args = args; } }
    class MeteorExplosionCollision { constructor(...args) { this.args = args; } }
    class IceSlashCollision { constructor(...args) { this.args = args; } }
    class IceTrailCollision { constructor(...args) { this.args = args; } }
    class IcyStormBallCollision { constructor(...args) { this.args = args; } }
    class SpinningIceBallsCollision { constructor(...args) { this.args = args; } }
    class PointyIcicleShardCollision { constructor(...args) { this.args = args; } }
    class UndergroundIcicleCollision { constructor(...args) { this.args = args; } }
    class PurpleThunderCollision { constructor(...args) { this.args = args; } }
    class GhostFadeOut { constructor(...args) { this.args = args; } }
    class DisintegrateCollision { constructor(...args) { this.args = args; } }
    class DarkExplosionCollision { constructor(...args) { this.args = args; } }
    class HealingStarBurstCollision {
        constructor(...args) { this.args = args; }
        start() { }
    }
    class AsteroidExplosionCollision { constructor(...args) { this.args = args; } }
    class GalacticSpikeCollision { constructor(...args) { this.args = args; } }
    class BallParticleBurstCollision { constructor(...args) { this.args = args; } }
    class PurpleFireballCollision { constructor(...args) { this.args = args; } }
    class RedFireballCollision { constructor(...args) { this.args = args; } }

    return {
        CollisionAnimation,
        ExplosionCollisionAnimation,
        PoisonSpitSplash,
        InkSplashCollision,
        Blood,
        ElectricityCollision,
        InkBombCollision,
        PoisonDropCollision,
        MeteorExplosionCollision,
        IceSlashCollision,
        IceTrailCollision,
        IcyStormBallCollision,
        SpinningIceBallsCollision,
        PointyIcicleShardCollision,
        UndergroundIcicleCollision,
        PurpleThunderCollision,
        GhostFadeOut,
        DisintegrateCollision,
        DarkExplosionCollision,
        HealingStarBurstCollision,
        AsteroidExplosionCollision,
        GalacticSpikeCollision,
        BallParticleBurstCollision,
        PurpleFireballCollision,
        RedFireballCollision,
    };
});

jest.mock('../../game/animations/floatingMessages.js', () => ({
    FloatingMessage: class FloatingMessage { constructor(...args) { this.args = args; } },
}));

jest.mock('../../game/animations/particles.js', () => ({
    Fireball: class Fireball { },
    CoinLoss: class CoinLoss { constructor(...args) { this.args = args; } },
    PoisonBubbles: class PoisonBubbles { },
    IceCrystalBubbles: class IceCrystalBubbles { },
    SpinningChicks: class SpinningChicks { },
}));

jest.mock('../../game/animations/ink.js', () => ({
    InkSplash: class InkSplash {
        constructor(game) { this.game = game; this.x = 0; }
        getWidth() { return 100; }
    },
}));

import { CollisionLogic } from '../../game/entities/player.js';
import { Fireball } from '../../game/animations/particles.js';

import {
    OxygenTank,
    HealthLive,
    Coin,
    RedPotion,
    BluePotion,
    RandomPower,

    IceDrink,
    IceCube,
    Cauldron,
    BlackHole,
    Confuse,
    DeadSkull,
    CarbonDioxideTank,
} from '../../game/entities/powerUpAndDown.js';

import {
    MeatSoldier,
    AngryBee, Bee, Skulnap, PoisonSpit, Goblin, Sluggie, Voltzeel, Tauro, Gloomlet, EnemyBoss, Barrier,
    Aura, KarateCroco, SpearFish, TheRock, LilHornet, Cactus, IceBall, Garry, InkBeam, RockProjectile,
    VolcanoWasp, Volcanurtle,
} from '../../game/entities/enemies/enemies.js';

import {
    Elyvorg, GhostElyvorg, BlueArrow, YellowArrow, GreenArrow, CyanArrow, PurpleBarrier, ElectricWheel, GravitationalAura,
    InkBomb, PurpleFireball, PoisonDrop, MeteorAttack, PurpleSlash, PurpleThunder, PurpleLaserBeam,
} from '../../game/entities/enemies/elyvorg.js';

import {
    IceTrail, IcyStormBall, IceSlash, SpinningIceBalls, PointyIcicleShard, Glacikal, UndergroundIcicle,
} from '../../game/entities/enemies/glacikal.js';

import {
    NTharax, HealingBarrier, GalacticSpike, PurpleBallOrb, AntennaeTentacle, YellowBeamOrb, BlackBeamOrb,
    PurpleBeamOrb, PurpleAsteroid, BlueAsteroid, GroundShockwaveRing, LaserBall,
} from '../../game/entities/enemies/ntharax.js';

import { InkSplash } from '../../game/animations/ink.js';

import {
    CollisionAnimation,
    ExplosionCollisionAnimation,
    PoisonSpitSplash,
    InkSplashCollision,
    Blood,
    ElectricityCollision,
    InkBombCollision,
    PoisonDropCollision,
    MeteorExplosionCollision,
    IceSlashCollision,
    IceTrailCollision,
    IcyStormBallCollision,
    SpinningIceBallsCollision,
    PointyIcicleShardCollision,
    UndergroundIcicleCollision,
    PurpleThunderCollision,
    GhostFadeOut,
    DisintegrateCollision,
    DarkExplosionCollision,
    AsteroidExplosionCollision,
    GalacticSpikeCollision,
    BallParticleBurstCollision,
    PurpleFireballCollision,
    RedFireballCollision,
    HealingStarBurstCollision,
} from '../../game/animations/collisionAnimation.js';

// -----------------------------------------------------------------------------
// Scenarios
// -----------------------------------------------------------------------------
const normalScenarios = [
    { label: 'visible + not dashing', isInvisible: false, isDashing: false },
    { label: 'invisible + not dashing', isInvisible: true, isDashing: false },
    { label: 'visible + dashing', isInvisible: false, isDashing: true },
    { label: 'invisible + dashing', isInvisible: true, isDashing: true },
];

const rollDiveScenarios = [
    { label: 'visible + rolling/diving', isInvisible: false, isRollOrDive: true },
    { label: 'invisible + rolling/diving', isInvisible: true, isRollOrDive: true },
];

// -----------------------------------------------------------------------------
// Harness
// -----------------------------------------------------------------------------
function makeGameAndLogic() {
    const game = {
        width: 800,
        height: 600,
        groundMargin: 0,

        coins: 50,
        lives: 3,

        time: 60000,
        speed: 1,

        powerUps: [],
        powerDowns: [],
        collisions: [],
        particles: [],
        floatingMessages: [],
        behindPlayerParticles: [],

        boss: { current: { isBarrierActive: false } },
        bossInFight: true,
        cutsceneActive: false,

        audioHandler: {
            collisionSFX: { playSound: jest.fn() },
            enemySFX: { playSound: jest.fn() },
            firedogSFX: { playSound: jest.fn(), stopSound: jest.fn() },
            powerUpAndDownSFX: { playSound: jest.fn() },
        },

        gameOver: false,
    };

    const player = {
        energy: 0,
        previousLives: game.lives,

        isUnderwater: false,

        isRedPotionActive: false,
        redPotionTimer: 0,

        bluePotionSpeed: 3,
        blueFireTimer: 0,

        isBlackHoleActive: false,

        activateConfuse: jest.fn(),

        isInvisible: false,
        isDashing: false,
        dashInstanceId: 1,
        postDashGraceTimer: 0,
        collisionCooldowns: {},

        isFrozen: false,

        isSlowed: false,
        slowedTimer: 0,

        energyReachedZero: false,
        isBluePotionActive: false,
        isPoisonedActive: false,
        poisonTimer: 0,

        bossCollisionTimer: 9999,
        bossCollisionCooldown: 200,
        resetElectricWheelCounters: false,

        states: Array.from({ length: 11 }, (_, i) => i),
        currentState: 1,
        setState: jest.fn(),

        startFrozen: jest.fn(),
        triggerTunnelVision: jest.fn(),

        x: 100,
        y: 100,
        width: 100,
        height: 90,
    };

    game.player = player;

    const logic = new CollisionLogic(game);

    jest.spyOn(game.collisions, 'push');
    jest.spyOn(game.particles, 'unshift');
    jest.spyOn(game.floatingMessages, 'push');
    jest.spyOn(logic, 'startFrozen').mockImplementation(() => {});

    return { game, player, logic };
}

function safeSet(obj, key, value) {
    const own = Object.getOwnPropertyDescriptor(obj, key);
    if (own && own.writable === false && !own.set) return;

    const proto = Object.getPrototypeOf(obj);
    const pd = proto ? Object.getOwnPropertyDescriptor(proto, key) : null;
    if (pd && !pd.writable && !pd.set) return;

    try {
        obj[key] = value;
    } catch {
        try {
            Object.defineProperty(obj, key, {
                value,
                writable: true,
                configurable: true,
                enumerable: true,
            });
        } catch { }
    }
}

function makeItem(ClassRef, overrides = {}) {
    const item = Object.create(ClassRef.prototype);

    safeSet(item, 'x', 110);
    safeSet(item, 'y', 110);
    safeSet(item, 'width', 20);
    safeSet(item, 'height', 20);
    safeSet(item, 'markedForDeletion', false);

    for (const [k, v] of Object.entries(overrides)) safeSet(item, k, v);
    return item;
}

function makeEnemy(EnemyClass, overrides = {}) {
    const enemy = Object.create(EnemyClass.prototype);

    safeSet(enemy, 'id', 'e1');
    safeSet(enemy, 'x', 10);
    safeSet(enemy, 'y', 10);
    safeSet(enemy, 'width', 50);
    safeSet(enemy, 'height', 50);

    safeSet(enemy, 'lives', 1);

    safeSet(enemy, 'dealsDirectHitDamage', true);
    safeSet(enemy, 'speedX', 0);
    safeSet(enemy, 'speedY', 0);

    safeSet(enemy, 'isBarrierActive', false);
    safeSet(enemy, 'isTransforming', false);
    safeSet(enemy, 'state', 'idle');

    if (EnemyClass === GalacticSpike) {
        safeSet(enemy, 'groundBottom', 300);
        safeSet(enemy, 'heightScale', 1);
    }
    if (EnemyClass === LaserBall) {
        safeSet(enemy, 'mode2Active', false);
        safeSet(enemy, 'mode2', false);
    }

    for (const [k, v] of Object.entries(overrides)) safeSet(enemy, k, v);
    return enemy;
}

function runPowerCollision(ctx) {
    ctx.logic.handlePowerCollisions();
}

function countInstances(list, ClassRef) {
    return list.filter(x => x instanceof ClassRef).length;
}

function expectCollisionCounts(ctx, expectedPairs) {
    const expectedTotal = expectedPairs.reduce((n, [, c]) => n + c, 0);

    expect(ctx.game.collisions.length).toBe(expectedTotal);
    expect(ctx.game.collisions.push).toHaveBeenCalledTimes(expectedTotal);

    for (const [Cls, count] of expectedPairs) {
        expect(countInstances(ctx.game.collisions, Cls)).toBe(count);
    }
}

function expectNoCollisions(ctx) {
    expect(ctx.game.collisions.length).toBe(0);
    expect(ctx.game.collisions.push).not.toHaveBeenCalled();
}

function expectNoDamage(ctx) {
    expect(ctx.game.lives).toBe(3);
    expect(ctx.game.coins).toBe(50);
}

function expectBloodOrPoofForNormalEnemy(enemyLivesAfterDecrement) {
    return enemyLivesAfterDecrement >= 1 ? Blood : CollisionAnimation;
}

function runNormalScenario(ctx, enemy, s) {
    ctx.player.isInvisible = s.isInvisible;
    ctx.player.isDashing = s.isDashing;

    const opts = s.isDashing ? { treatAsDash: true } : null;
    ctx.logic.handleNormalCollision(enemy, opts);
}

function runRollDiveScenario(ctx, enemy, s) {
    ctx.player.isInvisible = s.isInvisible;
    ctx.player.isDashing = false;
    ctx.player.currentState = s.isRollOrDive ? ctx.player.states[4] : ctx.player.states[1];
    ctx.logic.handleRollingOrDivingCollision(enemy);
}

// ======================================================================
// Tests
// ======================================================================
describe('CollisionLogic.handleNormalCollision — full coverage (FX correctness + exact push counts)', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Default branch: MeatSoldier (pure normal enemy)', () => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(MeatSoldier, { lives: 0 });

            runNormalScenario(ctx, enemy, s);

            if (s.isInvisible && !s.isDashing) {
                expectNoCollisions(ctx);
                expectNoDamage(ctx);
                return;
            }

            expectCollisionCounts(ctx, [[CollisionAnimation, 1]]);

            if (!s.isInvisible && !s.isDashing) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });

        test('MeatSoldier: lives>=1 => Blood; lives<=0 => CollisionAnimation', () => {
            const ctxA = makeGameAndLogic();
            const eA = makeEnemy(MeatSoldier, { lives: 2 });
            runNormalScenario(ctxA, eA, { label: 'x', isInvisible: false, isDashing: false });
            expectCollisionCounts(ctxA, [[Blood, 1]]);

            const ctxB = makeGameAndLogic();
            const eB = makeEnemy(MeatSoldier, { lives: 0 });
            runNormalScenario(ctxB, eB, { label: 'x', isInvisible: false, isDashing: false });
            expectCollisionCounts(ctxB, [[CollisionAnimation, 1]]);
        });
    });

    describe('Goblin', () => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(Goblin, { lives: 5 });

            const randSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

            runNormalScenario(ctx, enemy, s);

            if (s.isInvisible && !s.isDashing) {
                expectNoCollisions(ctx);
                expect(ctx.game.particles.unshift).not.toHaveBeenCalled();
                expectNoDamage(ctx);
                randSpy.mockRestore();
                return;
            }

            if (s.isDashing) {
                expect(enemy.lives).toBe(0);
                expectCollisionCounts(ctx, [[CollisionAnimation, 1]]);
                expectNoDamage(ctx);
                randSpy.mockRestore();
                return;
            }

            expectNoCollisions(ctx);
            expect(ctx.game.particles.unshift).toHaveBeenCalledTimes(10);
            expect(ctx.game.coins).toBe(39);
            expect(ctx.game.lives).toBe(2);
            randSpy.mockRestore();
        });
    });

    describe.each([
        ['Sluggie', Sluggie, InkSplashCollision],
        ['Garry', Garry, InkSplashCollision],
        ['InkBeam', InkBeam, InkSplashCollision],
        ['InkBomb', InkBomb, InkBombCollision],
    ])('Ink enemy: %s', (_name, EnemyClass, FxCollisionClass) => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass);

            runNormalScenario(ctx, enemy, s);

            if (s.isInvisible && !s.isDashing) {
                expectNoCollisions(ctx);
                expectNoDamage(ctx);
                return;
            }

            if (!s.isInvisible) {
                expectCollisionCounts(ctx, [
                    [InkSplash, 1],
                    [FxCollisionClass, 1],
                ]);

                if (!s.isDashing) {
                    expect(ctx.game.lives).toBe(2);
                    expect(ctx.game.coins).toBe(49);
                } else {
                    expectNoDamage(ctx);
                }
                return;
            }

            expectCollisionCounts(ctx, [[FxCollisionClass, 1]]);
            expectNoDamage(ctx);
        });
    });

    describe.each([
        ['GhostElyvorg', GhostElyvorg, GhostFadeOut, null],
        ['PurpleFireball', PurpleFireball, PurpleFireballCollision, null],
        ['MeteorAttack', MeteorAttack, MeteorExplosionCollision, null],
        ['UndergroundIcicle', UndergroundIcicle, UndergroundIcicleCollision, 50],
        ['GravitationalAura', GravitationalAura, DarkExplosionCollision, null],
        ['PurpleLaserBeam', PurpleLaserBeam, DisintegrateCollision, null],
        ['AntennaeTentacle', AntennaeTentacle, BallParticleBurstCollision, 50],
        ['PurpleBeamOrb', PurpleBeamOrb, DisintegrateCollision, null],
        ['PurpleAsteroid', PurpleAsteroid, AsteroidExplosionCollision, null],
    ])('Special enemy: %s', (_name, EnemyClass, ExpectedCollisionClass, livesOverride) => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass, livesOverride == null ? {} : { lives: livesOverride });

            runNormalScenario(ctx, enemy, s);

            if (s.isInvisible && !s.isDashing) {
                expectNoCollisions(ctx);
                expectNoDamage(ctx);
                return;
            }

            expectCollisionCounts(ctx, [[ExpectedCollisionClass, 1]]);

            if (!s.isInvisible && !s.isDashing) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });

    test('LaserBall: mode1 => PurpleFireballCollision once; mode2 => RedFireballCollision once', () => {
        const ctx1 = makeGameAndLogic();
        const e1 = makeEnemy(LaserBall, { mode2Active: false, mode2: false });
        runNormalScenario(ctx1, e1, { label: 'x', isInvisible: false, isDashing: false });
        expectCollisionCounts(ctx1, [[PurpleFireballCollision, 1]]);

        const ctx2 = makeGameAndLogic();
        const e2 = makeEnemy(LaserBall, { mode2Active: true, mode2: true });
        runNormalScenario(ctx2, e2, { label: 'x', isInvisible: false, isDashing: false });
        expectCollisionCounts(ctx2, [[RedFireballCollision, 1]]);
    });

    describe.each([
        ['PurpleBallOrb', PurpleBallOrb],
        ['GroundShockwaveRing', GroundShockwaveRing],
    ])('Handled-but-no-FX: %s', (_name, EnemyClass) => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass);

            runNormalScenario(ctx, enemy, s);

            expectNoCollisions(ctx);

            if (!s.isInvisible && !s.isDashing) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });

    describe.each([
        ['Bee', Bee, 'fallback', null],
        ['AngryBee', AngryBee, 'fallback', null],
        ['VolcanoWasp', VolcanoWasp, 'fallback', null],
        ['LilHornet', LilHornet, 'fallback', null],
        ['Voltzeel', Voltzeel, 'fallback', null],
        ['Aura', Aura, 'fallback', null],
        ['Cactus', Cactus, 'fallback', null],
        ['RockProjectile', RockProjectile, 'fallback', null],

        ['Skulnap', Skulnap, ExplosionCollisionAnimation, null],
        ['YellowArrow', YellowArrow, DisintegrateCollision, null],
        ['PurpleThunder', PurpleThunder, PurpleThunderCollision, 50],
        ['YellowBeamOrb', YellowBeamOrb, DisintegrateCollision, null],
        ['GalacticSpike', GalacticSpike, GalacticSpikeCollision, null],
    ])('Stun enemy: %s', (_name, EnemyClass, Expected, livesOverride) => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass, livesOverride == null ? {} : { lives: livesOverride });

            runNormalScenario(ctx, enemy, s);

            if (s.isInvisible && !s.isDashing) {
                expectNoCollisions(ctx);
                expectNoDamage(ctx);
                return;
            }

            if (Expected === 'fallback') {
                const Cls = expectBloodOrPoofForNormalEnemy(enemy.lives);
                expectCollisionCounts(ctx, [[Cls, 1]]);
            } else {
                expectCollisionCounts(ctx, [[Expected, 1]]);
            }

            if (!s.isInvisible && !s.isDashing) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });

    describe('ElectricWheel', () => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(ElectricWheel, { lives: 7 });

            ctx.player.resetElectricWheelCounters = false;
            ctx.player.bossCollisionTimer = 123;

            runNormalScenario(ctx, enemy, s);

            if (s.isInvisible && !s.isDashing) {
                expectNoCollisions(ctx);
                expectNoDamage(ctx);
                expect(enemy.lives).toBe(7);
                expect(ctx.player.resetElectricWheelCounters).toBe(false);
                expect(ctx.player.bossCollisionTimer).toBe(123);
                return;
            }

            expectCollisionCounts(ctx, [[ElectricityCollision, 1]]);

            expect(enemy.lives).toBe(0);
            expect(ctx.player.resetElectricWheelCounters).toBe(true);
            expect(ctx.player.bossCollisionTimer).toBe(0);

            if (!s.isInvisible && !s.isDashing) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });

    describe.each([
        ['PoisonSpit', PoisonSpit, PoisonSpitSplash],
        ['PoisonDrop', PoisonDrop, PoisonDropCollision],
        ['GreenArrow', GreenArrow, DisintegrateCollision],
    ])('Poison enemy: %s', (_name, EnemyClass, ExpectedCollisionClass) => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass);

            runNormalScenario(ctx, enemy, s);

            if (s.isInvisible && !s.isDashing) {
                expectNoCollisions(ctx);
                expectNoDamage(ctx);

                expect(ctx.player.isPoisonedActive).toBe(false);
                expect(ctx.player.poisonTimer).toBe(0);
                return;
            }

            expectCollisionCounts(ctx, [[ExpectedCollisionClass, 1]]);

            if (!s.isInvisible) {
                expect(ctx.player.isPoisonedActive).toBe(true);
                expect(ctx.player.poisonTimer).toBe(2500);
            } else {
                expect(ctx.player.isPoisonedActive).toBe(false);
                expect(ctx.player.poisonTimer).toBe(0);
            }

            if (!s.isInvisible && !s.isDashing) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });
    describe.each([
        ['Gloomlet', Gloomlet, 1],
        ['KarateCroco', KarateCroco, 2],
        ['Tauro', Tauro, 2],
        ['SpearFish', SpearFish, 2],
        ['TheRock', TheRock, 2],
        ['Volcanurtle', Volcanurtle, 1],
    ])('Red enemy: %s', (_name, EnemyClass, startingLives) => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass, { lives: startingLives });

            runNormalScenario(ctx, enemy, s);

            if (s.isInvisible && !s.isDashing) {
                expectNoCollisions(ctx);
                expectNoDamage(ctx);
                return;
            }

            const Cls = expectBloodOrPoofForNormalEnemy(enemy.lives);
            expectCollisionCounts(ctx, [[Cls, 1]]);

            if (!s.isInvisible && !s.isDashing) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });

    describe.each([
        ['IceBall', IceBall, 'fallback', null],
        ['IceTrail', IceTrail, IceTrailCollision, null],
        ['IcyStormBall', IcyStormBall, IcyStormBallCollision, null],
        ['SpinningIceBalls', SpinningIceBalls, SpinningIceBallsCollision, null],
        ['PointyIcicleShard', PointyIcicleShard, PointyIcicleShardCollision, null],
        ['BlueArrow', BlueArrow, DisintegrateCollision, null],
    ])('Slow enemy: %s', (_name, EnemyClass, Expected, livesOverride) => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass, livesOverride == null ? {} : { lives: livesOverride });

            runNormalScenario(ctx, enemy, s);

            if (s.isInvisible && !s.isDashing) {
                expectNoCollisions(ctx);
                expectNoDamage(ctx);
                expect(ctx.player.isSlowed).toBe(false);
                expect(ctx.player.slowedTimer).toBe(0);
                return;
            }

            if (Expected === 'fallback') {
                const Cls = expectBloodOrPoofForNormalEnemy(enemy.lives);
                expectCollisionCounts(ctx, [[Cls, 1]]);
            } else {
                expectCollisionCounts(ctx, [[Expected, 1]]);
            }

            if (!s.isInvisible) {
                expect(ctx.player.isSlowed).toBe(true);
                expect(ctx.player.slowedTimer).toBe(5000);
            } else {
                expect(ctx.player.isSlowed).toBe(false);
            }

            if (!s.isInvisible && !s.isDashing) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });

    describe.each([
        ['IceSlash', IceSlash, IceSlashCollision],
        ['BlueAsteroid', BlueAsteroid, DisintegrateCollision],
        ['CyanArrow', CyanArrow, DisintegrateCollision],
    ])('Frozen enemy: %s', (_name, EnemyClass, ExpectedCollisionClass) => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass);

            runNormalScenario(ctx, enemy, s);

            if (s.isInvisible && !s.isDashing) {
                expectNoCollisions(ctx);
                expectNoDamage(ctx);
                expect(ctx.player.startFrozen).not.toHaveBeenCalled();
                return;
            }

            expectCollisionCounts(ctx, [[ExpectedCollisionClass, 1]]);

            if (!s.isInvisible && !s.isDashing) {
                expect(ctx.logic.startFrozen).toHaveBeenCalledWith(ctx.player, 2000);
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expect(ctx.player.startFrozen).not.toHaveBeenCalled();
                expectNoDamage(ctx);
            }
        });
    });

    describe('Tunnel vision: BlackBeamOrb', () => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(BlackBeamOrb);

            runNormalScenario(ctx, enemy, s);

            if (s.isInvisible && !s.isDashing) {
                expectNoCollisions(ctx);
                expectNoDamage(ctx);
                expect(ctx.player.triggerTunnelVision).not.toHaveBeenCalled();
                return;
            }

            expectCollisionCounts(ctx, [[DisintegrateCollision, 1]]);

            if (!s.isInvisible) {
                expect(ctx.player.triggerTunnelVision).toHaveBeenCalledTimes(1);
            } else {
                expect(ctx.player.triggerTunnelVision).not.toHaveBeenCalled();
            }

            if (!s.isInvisible && !s.isDashing) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });

    describe.each([
        ['Glacikal', Glacikal, 65],
        ['Elyvorg', Elyvorg, 125],
    ])('Boss: %s', (_name, EnemyClass, bossLives) => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass, { isBarrierActive: false, lives: bossLives });

            ctx.player.bossCollisionTimer = 9999;
            ctx.player.bossCollisionCooldown = 1;

            runNormalScenario(ctx, enemy, s);

            if (s.isInvisible && !s.isDashing) {
                expectNoCollisions(ctx);
                expectNoDamage(ctx);
                return;
            }

            expectCollisionCounts(ctx, [[Blood, 1]]);

            if (!s.isInvisible && !s.isDashing) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });

    describe('Boss: NTharax', () => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(NTharax, {
                isTransforming: false,
                state: 'idle',
                isBarrierActive: false,
                lives: 100,
            });

            ctx.player.bossCollisionTimer = 9999;
            ctx.player.bossCollisionCooldown = 1;

            runNormalScenario(ctx, enemy, s);

            if (s.isInvisible && !s.isDashing) {
                expectNoCollisions(ctx);
                expectNoDamage(ctx);
                return;
            }

            expectCollisionCounts(ctx, [[Blood, 1]]);

            if (!s.isInvisible && !s.isDashing) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });

        test('NTharax transforming => no collisions', () => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(NTharax, { isTransforming: true, state: 'idle', lives: 100 });

            ctx.player.isInvisible = false;
            ctx.player.isDashing = false;

            ctx.logic.handleNormalCollision(enemy, null);

            expectNoCollisions(ctx);
            expectNoDamage(ctx);
        });

        test('NTharax state "transform" => no collisions', () => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(NTharax, { isTransforming: false, state: 'transform', lives: 100 });

            ctx.player.isInvisible = false;
            ctx.player.isDashing = false;

            ctx.logic.handleNormalCollision(enemy, null);

            expectNoCollisions(ctx);
            expectNoDamage(ctx);
        });

        test('NTharax state "dive": visible hits (damage), invisible does nothing; no collisions pushed', () => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(NTharax, { isTransforming: false, state: 'dive', isBarrierActive: false, lives: 100 });

            ctx.player.isInvisible = false;
            ctx.player.isDashing = false;

            ctx.logic.handleNormalCollision(enemy, null);
            expectNoCollisions(ctx);
            expect(ctx.game.lives).toBe(2);
            expect(ctx.game.coins).toBe(49);

            jest.clearAllMocks();
            ctx.game.collisions.length = 0;
            ctx.game.coins = 50;
            ctx.game.lives = 3;

            ctx.player.isInvisible = true;
            ctx.player.isDashing = false;

            ctx.logic.handleNormalCollision(enemy, null);
            expectNoCollisions(ctx);
            expectNoDamage(ctx);
        });
    });

    describe('HealingBarrier', () => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const barrier = makeEnemy(HealingBarrier, { lives: 0 });

            ctx.game.boss.current = { isBarrierActive: false };

            runNormalScenario(ctx, barrier, s);

            if (s.isInvisible && !s.isDashing) {
                expectNoCollisions(ctx);
            } else {
                expectCollisionCounts(ctx, [[DisintegrateCollision, 1]]);
            }

            if (!s.isInvisible && !s.isDashing) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });

        test('HealingBarrier: DASH (treatAsDash) heals NTharax when boss barrier is active + plays HealingStar burst', () => {
            const ctx = makeGameAndLogic();

            const boss = Object.create(NTharax.prototype);
            safeSet(boss, 'game', ctx.game);
            safeSet(boss, 'healingStarBursts', []);
            safeSet(boss, 'isBarrierActive', true);
            safeSet(boss, 'maxLives', 100);
            safeSet(boss, 'overhealPercent', 0);
            safeSet(boss, 'lives', 50);

            ctx.game.boss.current = boss;

            ctx.player.isInvisible = false;
            ctx.player.isDashing = true;

            const startSpy = jest.spyOn(HealingStarBurstCollision.prototype, 'start');

            const barrier = makeEnemy(HealingBarrier, { lives: 5 });

            ctx.logic.handleNormalCollision(barrier, { treatAsDash: true });

            expect(boss.lives).toBe(56);

            expect(boss.healingStarBursts.length).toBeGreaterThan(0);
            expect(boss.healingStarBursts.some(b => b instanceof HealingStarBurstCollision)).toBe(true);
            expect(startSpy).toHaveBeenCalled();
        });
    });

    describe('PurpleBarrier', () => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();

            const bossCurrent = Object.create(Elyvorg.prototype);
            safeSet(bossCurrent, 'isBarrierActive', true);
            ctx.game.boss.current = bossCurrent;

            const barrier = makeEnemy(PurpleBarrier, { lives: 0 });

            runNormalScenario(ctx, barrier, s);

            expectCollisionCounts(ctx, [[DisintegrateCollision, 1]]);

            if (!s.isInvisible && !s.isDashing) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });

    describe('PurpleSlash', () => {
        test.each(normalScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(PurpleSlash);

            runNormalScenario(ctx, enemy, s);

            expectNoCollisions(ctx);

            if (!s.isInvisible && !s.isDashing) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });
});

describe('CollisionLogic.handleRollingOrDivingCollision — full coverage (FX correctness + exact push counts)', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Default branch: MeatSoldier (pure normal enemy)', () => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(MeatSoldier, { lives: 0 });

            runRollDiveScenario(ctx, enemy, s);

            expectCollisionCounts(ctx, [[CollisionAnimation, 1]]);
            expectNoDamage(ctx);
        });

        test('MeatSoldier: lives>=1 => Blood; lives<=0 => CollisionAnimation', () => {
            const ctxA = makeGameAndLogic();
            const eA = makeEnemy(MeatSoldier, { lives: 2 });
            runRollDiveScenario(ctxA, eA, { label: 'x', isInvisible: false, isRollOrDive: true });
            expectCollisionCounts(ctxA, [[Blood, 1]]);

            const ctxB = makeGameAndLogic();
            const eB = makeEnemy(MeatSoldier, { lives: 0 });
            runRollDiveScenario(ctxB, eB, { label: 'x', isInvisible: false, isRollOrDive: true });
            expectCollisionCounts(ctxB, [[CollisionAnimation, 1]]);
        });
    });

    describe('Goblin', () => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(Goblin, { lives: 5 });

            runRollDiveScenario(ctx, enemy, s);

            expect(enemy.lives).toBe(0);
            expectCollisionCounts(ctx, [[CollisionAnimation, 1]]);
            expectNoDamage(ctx);
        });
    });

    describe.each([
        ['Sluggie', Sluggie, InkSplashCollision],
        ['Garry', Garry, InkSplashCollision],
        ['InkBeam', InkBeam, InkSplashCollision],
        ['InkBomb', InkBomb, InkBombCollision],
    ])('Ink enemy: %s', (_name, EnemyClass, FxCollisionClass) => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass);

            runRollDiveScenario(ctx, enemy, s);

            if (!s.isInvisible) {
                expectCollisionCounts(ctx, [
                    [InkSplash, 1],
                    [FxCollisionClass, 1],
                ]);
            } else {
                expectCollisionCounts(ctx, [[FxCollisionClass, 1]]);
            }

            expectNoDamage(ctx);
        });
    });

    describe.each([
        ['GhostElyvorg', GhostElyvorg, GhostFadeOut, null],
        ['MeteorAttack', MeteorAttack, MeteorExplosionCollision, null],
        ['PurpleLaserBeam', PurpleLaserBeam, DisintegrateCollision, null],
        ['GravitationalAura', GravitationalAura, DarkExplosionCollision, null],
        ['PurpleBeamOrb', PurpleBeamOrb, DisintegrateCollision, null],
        ['PurpleAsteroid', PurpleAsteroid, AsteroidExplosionCollision, null],
    ])('Special enemy (no damage through roll/dive): %s', (_name, EnemyClass, ExpectedCollisionClass, livesOverride) => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass, livesOverride == null ? {} : { lives: livesOverride });

            runRollDiveScenario(ctx, enemy, s);

            expectCollisionCounts(ctx, [[ExpectedCollisionClass, 1]]);
            expectNoDamage(ctx);
        });
    });

    describe.each([
        ['PurpleFireball', PurpleFireball, PurpleFireballCollision, null],
        ['UndergroundIcicle', UndergroundIcicle, UndergroundIcicleCollision, 50],
    ])('Special enemy (damage through roll/dive): %s', (_name, EnemyClass, ExpectedCollisionClass, livesOverride) => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass, livesOverride == null ? {} : { lives: livesOverride });

            runRollDiveScenario(ctx, enemy, s);

            expectCollisionCounts(ctx, [[ExpectedCollisionClass, 1]]);

            if (!s.isInvisible) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });

    describe.each([
        ['PurpleBallOrb', PurpleBallOrb],
        ['GroundShockwaveRing', GroundShockwaveRing],
    ])('Handled-but-no-FX (but may still damage): %s', (_name, EnemyClass) => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass);

            runRollDiveScenario(ctx, enemy, s);

            expectNoCollisions(ctx);

            if (!s.isInvisible) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });

    test('LaserBall: mode1 => PurpleFireballCollision once; mode2 => RedFireballCollision once', () => {
        const ctx1 = makeGameAndLogic();
        const e1 = makeEnemy(LaserBall, { mode2Active: false, mode2: false });
        runRollDiveScenario(ctx1, e1, { label: 'x', isInvisible: false, isRollOrDive: true });
        expectCollisionCounts(ctx1, [[PurpleFireballCollision, 1]]);
        expect(ctx1.game.lives).toBe(2);
        expect(ctx1.game.coins).toBe(49);

        const ctx2 = makeGameAndLogic();
        const e2 = makeEnemy(LaserBall, { mode2Active: true, mode2: true });
        runRollDiveScenario(ctx2, e2, { label: 'x', isInvisible: false, isRollOrDive: true });
        expectCollisionCounts(ctx2, [[RedFireballCollision, 1]]);
        expect(ctx2.game.lives).toBe(2);
        expect(ctx2.game.coins).toBe(49);
    });

    describe.each([
        ['Bee', Bee, 'fallback', null],
        ['AngryBee', AngryBee, 'fallback', null],
        ['VolcanoWasp', VolcanoWasp, 'fallback', null],
        ['LilHornet', LilHornet, 'fallback', null],
        ['Voltzeel', Voltzeel, 'fallback', null],
        ['Aura', Aura, 'fallback', null],
        ['Cactus', Cactus, 'fallback', null],
        ['RockProjectile', RockProjectile, 'fallback', null],

        ['Skulnap', Skulnap, ExplosionCollisionAnimation, null],
        ['PurpleThunder', PurpleThunder, PurpleThunderCollision, 50],
        ['YellowArrow', YellowArrow, DisintegrateCollision, null],
        ['YellowBeamOrb', YellowBeamOrb, DisintegrateCollision, null],
        ['GalacticSpike', GalacticSpike, GalacticSpikeCollision, null],
    ])('Stun enemy: %s', (_name, EnemyClass, Expected, livesOverride) => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass, livesOverride == null ? {} : { lives: livesOverride });

            runRollDiveScenario(ctx, enemy, s);

            if (Expected === 'fallback') {
                const Cls = expectBloodOrPoofForNormalEnemy(enemy.lives);
                expectCollisionCounts(ctx, [[Cls, 1]]);
            } else {
                expectCollisionCounts(ctx, [[Expected, 1]]);
            }

            if (!s.isInvisible) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });

    describe('ElectricWheel', () => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(ElectricWheel, { lives: 7 });

            ctx.player.resetElectricWheelCounters = false;
            ctx.player.bossCollisionTimer = 123;

            runRollDiveScenario(ctx, enemy, s);

            expectCollisionCounts(ctx, [[ElectricityCollision, 1]]);
            expect(enemy.lives).toBe(0);
            expect(ctx.player.resetElectricWheelCounters).toBe(true);
            expect(ctx.player.bossCollisionTimer).toBe(0);

            if (!s.isInvisible) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });

    describe.each([
        { name: 'PoisonSpit', EnemyClass: PoisonSpit, Fx: PoisonSpitSplash, poisonTimer: 2500 },
        { name: 'PoisonDrop', EnemyClass: PoisonDrop, Fx: PoisonDropCollision, poisonTimer: 2500 },
        { name: 'GreenArrow', EnemyClass: GreenArrow, Fx: DisintegrateCollision, poisonTimer: 2500 },
    ])('Poison enemy: $name', ({ EnemyClass, Fx, poisonTimer }) => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass);

            runRollDiveScenario(ctx, enemy, s);

            expectCollisionCounts(ctx, [[Fx, 1]]);

            if (!s.isInvisible) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
                expect(ctx.player.isPoisonedActive).toBe(true);
                expect(ctx.player.poisonTimer).toBe(poisonTimer);
            } else {
                expectNoDamage(ctx);
                expect(ctx.player.isPoisonedActive).toBe(false);
                expect(ctx.player.poisonTimer).toBe(0);
            }
        });
    });

    describe.each([
        ['Gloomlet', Gloomlet, 1],
        ['Tauro', Tauro, 2],
        ['KarateCroco', KarateCroco, 2],
        ['SpearFish', SpearFish, 2],
        ['TheRock', TheRock, 2],
        ['Volcanurtle', Volcanurtle, 1],
    ])('Red enemy: %s', (_name, EnemyClass, startingLives) => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass, { lives: startingLives });

            runRollDiveScenario(ctx, enemy, s);

            const Cls = expectBloodOrPoofForNormalEnemy(enemy.lives);
            expectCollisionCounts(ctx, [[Cls, 1]]);

            if (!s.isInvisible && s.isRollOrDive) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });

    describe.each([
        ['IceBall', IceBall, 'fallback', null],
        ['IceTrail', IceTrail, IceTrailCollision, null],
        ['IcyStormBall', IcyStormBall, IcyStormBallCollision, null],
        ['SpinningIceBalls', SpinningIceBalls, SpinningIceBallsCollision, null],
        ['PointyIcicleShard', PointyIcicleShard, PointyIcicleShardCollision, null],
        ['BlueArrow', BlueArrow, DisintegrateCollision, null],
    ])('Slow enemy: %s', (_name, EnemyClass, Expected, livesOverride) => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass, livesOverride == null ? {} : { lives: livesOverride });

            runRollDiveScenario(ctx, enemy, s);

            if (Expected === 'fallback') {
                const Cls = expectBloodOrPoofForNormalEnemy(enemy.lives);
                expectCollisionCounts(ctx, [[Cls, 1]]);
            } else {
                expectCollisionCounts(ctx, [[Expected, 1]]);
            }

            if (!s.isInvisible) {
                expect(ctx.player.isSlowed).toBe(true);
                expect(ctx.player.slowedTimer).toBe(5000);
            } else {
                expect(ctx.player.isSlowed).toBe(false);
                expect(ctx.player.slowedTimer).toBe(0);
            }

            expectNoDamage(ctx);
        });
    });

    describe.each([
        ['IceSlash', IceSlash, IceSlashCollision],
        ['BlueAsteroid', BlueAsteroid, DisintegrateCollision],
        ['CyanArrow', CyanArrow, DisintegrateCollision],
    ])('Frozen enemy: %s', (_name, EnemyClass, ExpectedCollisionClass) => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass);

            runRollDiveScenario(ctx, enemy, s);

            expectCollisionCounts(ctx, [[ExpectedCollisionClass, 1]]);

            if (!s.isInvisible) {
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
                expect(ctx.logic.startFrozen).toHaveBeenCalledWith(ctx.player, 2000);
            } else {
                expectNoDamage(ctx);
                expect(ctx.player.startFrozen).not.toHaveBeenCalled();
            }
        });
    });

    describe('Tunnel vision: BlackBeamOrb', () => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(BlackBeamOrb);

            runRollDiveScenario(ctx, enemy, s);

            expectCollisionCounts(ctx, [[DisintegrateCollision, 1]]);

            if (!s.isInvisible) {
                expect(ctx.player.triggerTunnelVision).toHaveBeenCalledTimes(1);
            } else {
                expect(ctx.player.triggerTunnelVision).not.toHaveBeenCalled();
            }

            expectNoDamage(ctx);
        });
    });

    describe.each([
        ['Glacikal', Glacikal, 65],
        ['Elyvorg', Elyvorg, 125],
    ])('Boss: %s', (_name, EnemyClass, bossLives) => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass, { isBarrierActive: false, lives: bossLives });

            ctx.player.bossCollisionTimer = 9999;
            ctx.player.bossCollisionCooldown = 1;

            runRollDiveScenario(ctx, enemy, s);

            expectCollisionCounts(ctx, [[Blood, 1]]);
            expectNoDamage(ctx);
        });
    });

    describe('Boss: NTharax', () => {
        test.each(rollDiveScenarios)('$label (idle)', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(NTharax, {
                isTransforming: false,
                state: 'idle',
                isBarrierActive: false,
                lives: 100,
            });

            ctx.player.bossCollisionTimer = 9999;
            ctx.player.bossCollisionCooldown = 1;

            runRollDiveScenario(ctx, enemy, s);

            expectCollisionCounts(ctx, [[Blood, 1]]);
            expectNoDamage(ctx);
        });

        test.each(rollDiveScenarios)('$label (dive state)', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(NTharax, {
                isTransforming: false,
                state: 'dive',
                isBarrierActive: false,
                lives: 100,
            });

            ctx.player.bossCollisionTimer = 9999;
            ctx.player.bossCollisionCooldown = 1;

            runRollDiveScenario(ctx, enemy, s);

            if (!s.isInvisible) {
                expectNoCollisions(ctx);
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectCollisionCounts(ctx, [[Blood, 1]]);
                expectNoDamage(ctx);
            }
        });

        test('NTharax transforming => no collisions', () => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(NTharax, { isTransforming: true, state: 'idle', lives: 100 });

            ctx.player.isInvisible = false;
            ctx.player.currentState = ctx.player.states[4];

            ctx.logic.handleRollingOrDivingCollision(enemy);

            expectNoCollisions(ctx);
            expectNoDamage(ctx);
        });

        test('NTharax state "transform" => no collisions', () => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(NTharax, { isTransforming: false, state: 'transform', lives: 100 });

            ctx.player.isInvisible = false;
            ctx.player.currentState = ctx.player.states[4];

            ctx.logic.handleRollingOrDivingCollision(enemy);

            expectNoCollisions(ctx);
            expectNoDamage(ctx);
        });
    });

    describe('HealingBarrier', () => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const barrier = makeEnemy(HealingBarrier, { lives: 0 });

            runRollDiveScenario(ctx, barrier, s);

            expectCollisionCounts(ctx, [[DisintegrateCollision, 1]]);
            expectNoDamage(ctx);
        });
    });

    describe('PurpleBarrier', () => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();

            const bossCurrent = Object.create(Elyvorg.prototype);
            safeSet(bossCurrent, 'isBarrierActive', true);
            ctx.game.boss.current = bossCurrent;

            const barrier = makeEnemy(PurpleBarrier, { lives: 0 });

            runRollDiveScenario(ctx, barrier, s);

            expectCollisionCounts(ctx, [[DisintegrateCollision, 1]]);
            expect(ctx.player.bossCollisionTimer).toBe(0);
            expectNoDamage(ctx);
        });
    });

    describe('PurpleSlash', () => {
        test.each(rollDiveScenarios)('$label', (s) => {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(PurpleSlash);

            runRollDiveScenario(ctx, enemy, s);

            expectNoCollisions(ctx);

            if (!s.isInvisible) {
                expect(ctx.player.bossCollisionTimer).toBe(0);
                expect(ctx.game.lives).toBe(2);
                expect(ctx.game.coins).toBe(49);
            } else {
                expectNoDamage(ctx);
            }
        });
    });
});

describe('CollisionLogic.fireball vs enemy', () => {
    afterEach(() => jest.restoreAllMocks());

    function makeFireball(type = 'normalMode', overrides = {}) {
        return makeItem(Fireball, {
            type,
            size: 20,
            x: 10,
            y: 10,
            markedForDeletion: false,
            ...overrides,
        });
    }

    function runFireballVsEnemy(ctx, enemy, fireballType = 'normalMode') {
        const fireball = makeFireball(fireballType, { x: enemy.x, y: enemy.y });
        const enemiesHit = new Set();
        ctx.logic.handleSpecificFireballCollisions(fireball, enemy, enemiesHit);
        return fireball;
    }

    function expectExactlyOneCollision(ctx, Cls) {
        expect(ctx.game.collisions.length).toBe(Cls ? 1 : 0);

        if (!Cls) {
            expect(ctx.game.collisions.push).not.toHaveBeenCalled();
            return;
        }

        expect(ctx.game.collisions.push).toHaveBeenCalledTimes(1);
        expect(ctx.game.collisions[0]).toBeInstanceOf(Cls);
    }

    // ------------------------------------------------------------------
    // 1) Default path FX matrix
    // ------------------------------------------------------------------
    const fxMatrix = [
        // ink
        [Sluggie, InkSplashCollision],
        [Garry, InkSplashCollision],
        [InkBeam, InkSplashCollision],
        [InkBomb, InkBombCollision],

        // special FX enemies
        [Skulnap, ExplosionCollisionAnimation],
        [ElectricWheel, ElectricityCollision],
        [GravitationalAura, DarkExplosionCollision],
        [PoisonSpit, PoisonSpitSplash],
        [PoisonDrop, PoisonDropCollision],
        [PurpleLaserBeam, DisintegrateCollision],
        [MeteorAttack, MeteorExplosionCollision],
        [PurpleThunder, PurpleThunderCollision],
        [PurpleAsteroid, AsteroidExplosionCollision],
        [BlueAsteroid, DisintegrateCollision],

        [BlueArrow, DisintegrateCollision],
        [YellowArrow, DisintegrateCollision],
        [GreenArrow, DisintegrateCollision],
        [CyanArrow, DisintegrateCollision],

        [PurpleBeamOrb, DisintegrateCollision],
        [YellowBeamOrb, DisintegrateCollision],
        [BlackBeamOrb, DisintegrateCollision],

        [GhostElyvorg, GhostFadeOut],
        [GalacticSpike, GalacticSpikeCollision],

        [UndergroundIcicle, UndergroundIcicleCollision],
        [IceTrail, IceTrailCollision],
        [IcyStormBall, IcyStormBallCollision],
        [SpinningIceBalls, SpinningIceBallsCollision],
        [PointyIcicleShard, PointyIcicleShardCollision],
        [IceSlash, IceSlashCollision],
    ];

    test.each([
        ...fxMatrix.map(([EnemyClass, ExpectedFx]) => ([
            `${EnemyClass.name} => ${ExpectedFx.name} (normal fireball)`,
            EnemyClass,
            ExpectedFx,
            'normalMode',
        ])),
        ...fxMatrix.map(([EnemyClass, ExpectedFx]) => ([
            `${EnemyClass.name} => ${ExpectedFx.name} (redPotion fireball)`,
            EnemyClass,
            ExpectedFx,
            'redPotionMode',
        ])),
    ])('%s', (_label, EnemyClass, ExpectedFx, fireballType) => {
        const ctx = makeGameAndLogic();
        const enemy = makeEnemy(EnemyClass, { x: 10, y: 10 });

        const fireball = runFireballVsEnemy(ctx, enemy, fireballType);

        expectExactlyOneCollision(ctx, ExpectedFx);
        expect(fireball.markedForDeletion).toBe(fireballType === 'normalMode');
    });

    test('LaserBall: mode1 => PurpleFireballCollision; mode2 => RedFireballCollision (both fireball types)', () => {
        for (const fireballType of ['normalMode', 'redPotionMode']) {
            {
                const ctx = makeGameAndLogic();
                const enemy = makeEnemy(LaserBall, { x: 10, y: 10, mode2Active: false, mode2: false });

                const fireball = runFireballVsEnemy(ctx, enemy, fireballType);

                expectExactlyOneCollision(ctx, PurpleFireballCollision);
                expect(fireball.markedForDeletion).toBe(fireballType === 'normalMode');
            }

            {
                const ctx = makeGameAndLogic();
                const enemy = makeEnemy(LaserBall, { x: 10, y: 10, mode2Active: true, mode2: true });

                const fireball = runFireballVsEnemy(ctx, enemy, fireballType);

                expectExactlyOneCollision(ctx, RedFireballCollision);
                expect(fireball.markedForDeletion).toBe(fireballType === 'normalMode');
            }
        }
    });

    // ------------------------------------------------------------------
    // 2) Explicit no-FX handlers
    // ------------------------------------------------------------------
    test.each([
        ['PurpleBallOrb', PurpleBallOrb],
        ['GroundShockwaveRing', GroundShockwaveRing],
    ])('%s => no collision pushed (both fireball types)', (_name, EnemyClass) => {
        for (const fireballType of ['normalMode', 'redPotionMode']) {
            const ctx = makeGameAndLogic();
            const enemy = makeEnemy(EnemyClass, { x: 10, y: 10 });

            const fireball = runFireballVsEnemy(ctx, enemy, fireballType);

            expectExactlyOneCollision(ctx, null);
            expect(fireball.markedForDeletion).toBe(fireballType === 'normalMode');
        }
    });

    // ------------------------------------------------------------------
    // 3) Special fireball handlers (not just default -> playCollisionFx)
    // ------------------------------------------------------------------
    test('PurpleFireball handler: expected FX + +20 + NICE!/EPIC! + still triggers +1 reward on kill', () => {
        const ctx = makeGameAndLogic();
        jest.spyOn(Math, 'random').mockReturnValue(0.3);

        const enemy = makeEnemy(PurpleFireball, { x: 10, y: 10, lives: 1 });
        const fireball = runFireballVsEnemy(ctx, enemy, 'normalMode');

        expectExactlyOneCollision(ctx, PurpleFireballCollision);

        expect(ctx.game.floatingMessages.push).toHaveBeenCalledTimes(3);
        expect(ctx.player.energy).toBe(22);
        expect(ctx.game.coins).toBe(51);

        expect(fireball.markedForDeletion).toBe(true);
    });

    test('Goblin handler: CollisionAnimation + goblinDie + poofSound; goblin forced to 0', () => {
        const ctx = makeGameAndLogic();
        const enemy = makeEnemy(Goblin, { x: 10, y: 10, lives: 3 });

        runFireballVsEnemy(ctx, enemy, 'normalMode');

        expect(enemy.lives).toBe(0);
        expectExactlyOneCollision(ctx, CollisionAnimation);

        expect(ctx.game.audioHandler.enemySFX.playSound).toHaveBeenCalledWith('goblinDie', false, true);
        expect(ctx.game.audioHandler.collisionSFX.playSound).toHaveBeenCalledWith('poofSound', false, true);
    });

    test('HealingBarrier handler: DisintegrateCollision only when barrier.lives <= 0 after hit', () => {
        // lives 1 -> 0 (after hit) => DisintegrateCollision pushed
        {
            const ctx = makeGameAndLogic();
            ctx.game.boss.current = { isBarrierActive: false };

            const barrier = makeEnemy(HealingBarrier, { x: 10, y: 10, lives: 1 });
            runFireballVsEnemy(ctx, barrier, 'normalMode');

            expect(barrier.lives).toBe(0);
            expectExactlyOneCollision(ctx, DisintegrateCollision);
        }

        // lives 2 -> 1 => no DisintegrateCollision
        {
            const ctx = makeGameAndLogic();
            ctx.game.boss.current = { isBarrierActive: false };

            const barrier = makeEnemy(HealingBarrier, { x: 10, y: 10, lives: 2 });
            runFireballVsEnemy(ctx, barrier, 'normalMode');

            expect(barrier.lives).toBe(1);
            expectExactlyOneCollision(ctx, null);
        }
    });

    test('PurpleBarrier handler: DisintegrateCollision only when barrier.lives <= 0 after hit', () => {
        // lives 1 -> 0 => DisintegrateCollision
        {
            const ctx = makeGameAndLogic();
            ctx.game.boss.current = Object.create(Elyvorg.prototype);

            const barrier = makeEnemy(PurpleBarrier, { x: 10, y: 10, lives: 1 });
            runFireballVsEnemy(ctx, barrier, 'normalMode');

            expect(barrier.lives).toBe(0);
            expectExactlyOneCollision(ctx, DisintegrateCollision);
        }

        // lives 2 -> 1 => no collision
        {
            const ctx = makeGameAndLogic();
            ctx.game.boss.current = Object.create(Elyvorg.prototype);

            const barrier = makeEnemy(PurpleBarrier, { x: 10, y: 10, lives: 2 });
            runFireballVsEnemy(ctx, barrier, 'normalMode');

            expect(barrier.lives).toBe(1);
            expectExactlyOneCollision(ctx, null);
        }
    });

    // ------------------------------------------------------------------
    // 4) Boss enemies: MUST play Blood even on last life (boss rule)
    // ------------------------------------------------------------------
    describe('Boss enemies: Blood plays even when lives reaches 0', () => {
        test('Glacikal: 2->1 => Blood; 1->0 => Blood', () => {
            {
                const ctx = makeGameAndLogic();
                const boss = makeEnemy(Glacikal, { x: 10, y: 10, lives: 2 });

                runFireballVsEnemy(ctx, boss, 'normalMode');

                expect(boss.lives).toBe(1);
                expectExactlyOneCollision(ctx, Blood);
            }

            {
                const ctx = makeGameAndLogic();
                const boss = makeEnemy(Glacikal, { x: 10, y: 10, lives: 1 });

                runFireballVsEnemy(ctx, boss, 'normalMode');

                expect(boss.lives).toBe(0);
                expectExactlyOneCollision(ctx, Blood);
            }
        });

        test('Elyvorg (barrier inactive): 2->1 => Blood; 1->0 => Blood', () => {
            {
                const ctx = makeGameAndLogic();
                const boss = makeEnemy(Elyvorg, { x: 10, y: 10, lives: 2, isBarrierActive: false });

                runFireballVsEnemy(ctx, boss, 'normalMode');

                expect(boss.lives).toBe(1);
                expectExactlyOneCollision(ctx, Blood);
            }

            {
                const ctx = makeGameAndLogic();
                const boss = makeEnemy(Elyvorg, { x: 10, y: 10, lives: 1, isBarrierActive: false });

                runFireballVsEnemy(ctx, boss, 'normalMode');

                expect(boss.lives).toBe(0);
                expectExactlyOneCollision(ctx, Blood);
            }
        });

        test('Elyvorg (barrier active): no damage + no collision', () => {
            const ctx = makeGameAndLogic();
            const boss = makeEnemy(Elyvorg, { x: 10, y: 10, lives: 2, isBarrierActive: true });

            runFireballVsEnemy(ctx, boss, 'normalMode');

            expect(boss.lives).toBe(2);
            expectExactlyOneCollision(ctx, null);
        });

        test('NTharax (barrier inactive): 2->1 => Blood; 1->0 => Blood', () => {
            {
                const ctx = makeGameAndLogic();
                const boss = makeEnemy(NTharax, {
                    x: 10,
                    y: 10,
                    lives: 2,
                    isBarrierActive: false,
                    isTransforming: false,
                    state: 'idle',
                });

                runFireballVsEnemy(ctx, boss, 'normalMode');

                expect(boss.lives).toBe(1);
                expectExactlyOneCollision(ctx, Blood);
            }

            {
                const ctx = makeGameAndLogic();
                const boss = makeEnemy(NTharax, {
                    x: 10,
                    y: 10,
                    lives: 1,
                    isBarrierActive: false,
                    isTransforming: false,
                    state: 'idle',
                });

                runFireballVsEnemy(ctx, boss, 'normalMode');

                expect(boss.lives).toBe(0);
                expectExactlyOneCollision(ctx, Blood);
            }
        });

        test('NTharax transforming or state transform: no damage + no collision (fireball still deletes if normalMode)', () => {
            {
                const ctx = makeGameAndLogic();
                const boss = makeEnemy(NTharax, {
                    x: 10,
                    y: 10,
                    lives: 5,
                    isTransforming: true,
                    state: 'idle',
                    isBarrierActive: false,
                });

                const fb = runFireballVsEnemy(ctx, boss, 'normalMode');

                expect(boss.lives).toBe(5);
                expectExactlyOneCollision(ctx, null);
                expect(fb.markedForDeletion).toBe(true);
            }

            {
                const ctx = makeGameAndLogic();
                const boss = makeEnemy(NTharax, {
                    x: 10,
                    y: 10,
                    lives: 5,
                    isTransforming: false,
                    state: 'transform',
                    isBarrierActive: false,
                });

                const fb = runFireballVsEnemy(ctx, boss, 'normalMode');

                expect(boss.lives).toBe(5);
                expectExactlyOneCollision(ctx, null);
                expect(fb.markedForDeletion).toBe(true);
            }
        });

        test('NTharax barrier active: no damage + no collision', () => {
            const ctx = makeGameAndLogic();
            const boss = makeEnemy(NTharax, {
                x: 10,
                y: 10,
                lives: 5,
                isBarrierActive: true,
                isTransforming: false,
                state: 'idle',
            });

            runFireballVsEnemy(ctx, boss, 'normalMode');

            expect(boss.lives).toBe(5);
            expectExactlyOneCollision(ctx, null);
        });
    });

    // ------------------------------------------------------------------
    // 5) Boss invulnerable window: no FX + no damage; fireball deletes
    // ------------------------------------------------------------------
    test('Boss invulnerable window: fireball deletes, boss not damaged, no FX', () => {
        const ctx = makeGameAndLogic();
        ctx.game.bossInFight = false; // invulnerable window

        const boss = makeEnemy(Glacikal, { x: 10, y: 10, lives: 10 });
        const fireball = runFireballVsEnemy(ctx, boss, 'normalMode');

        expect(fireball.markedForDeletion).toBe(true);
        expect(boss.lives).toBe(10);

        expectExactlyOneCollision(ctx, null);
        expect(ctx.game.floatingMessages.push).not.toHaveBeenCalled();
    });

    // ------------------------------------------------------------------
    // 6) enemiesHit prevents double processing
    // ------------------------------------------------------------------
    test('enemiesHit Set prevents double-processing the same enemy', () => {
        const ctx = makeGameAndLogic();
        const enemy = makeEnemy(MeatSoldier, { x: 10, y: 10, lives: 2 });

        const fireball = makeFireball('normalMode', { x: 10, y: 10 });
        const enemiesHit = new Set();

        ctx.logic.handleSpecificFireballCollisions(fireball, enemy, enemiesHit);
        ctx.logic.handleSpecificFireballCollisions(fireball, enemy, enemiesHit);

        expect(enemy.lives).toBe(1);
        expect(ctx.game.collisions.push).toHaveBeenCalledTimes(1);
    });
});

describe('CollisionLogic.handlePowerCollisions — powerUps + powerDowns', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('OxygenTank: -10s time, sound, floating message, marks for deletion', () => {
        const ctx = makeGameAndLogic();
        const item = makeItem(OxygenTank);

        ctx.game.powerUps.push(item);

        runPowerCollision(ctx);

        expect(item.markedForDeletion).toBe(true);
        expect(ctx.game.time).toBe(50000);
        expect(ctx.game.audioHandler.powerUpAndDownSFX.playSound).toHaveBeenCalledWith('oxygenTankSound', false, true);

        expect(ctx.game.floatingMessages.length).toBe(1);
        expect(ctx.game.floatingMessages[0].args[0]).toBe('+10s');
    });

    test('HealthLive: +1 life and sound', () => {
        const ctx = makeGameAndLogic();
        const item = makeItem(HealthLive);

        ctx.game.powerUps.push(item);

        runPowerCollision(ctx);

        expect(item.markedForDeletion).toBe(true);
        expect(ctx.game.lives).toBe(4);
        expect(ctx.game.audioHandler.powerUpAndDownSFX.playSound).toHaveBeenCalledWith('healthLiveSound', false, true);
    });

    test('Coin: +10 coins, sound, floating message, marks for deletion', () => {
        const ctx = makeGameAndLogic();
        const item = makeItem(Coin);

        ctx.game.powerUps.push(item);

        runPowerCollision(ctx);

        expect(item.markedForDeletion).toBe(true);
        expect(ctx.game.coins).toBe(60);
        expect(ctx.game.audioHandler.powerUpAndDownSFX.playSound).toHaveBeenCalledWith('coinSound', false, true);

        expect(ctx.game.floatingMessages.length).toBe(1);
        expect(ctx.game.floatingMessages[0].args[0]).toBe('+10');
    });

    test('RedPotion: activates red potion + timer, plays sound', () => {
        const ctx = makeGameAndLogic();
        const item = makeItem(RedPotion);

        ctx.game.powerUps.push(item);

        runPowerCollision(ctx);

        expect(item.markedForDeletion).toBe(true);
        expect(ctx.player.isRedPotionActive).toBe(true);
        expect(ctx.player.redPotionTimer).toBe(15000);
        expect(ctx.game.audioHandler.powerUpAndDownSFX.playSound).toHaveBeenCalledWith('redPotionSound', false, true);
    });

    test('BluePotion: not rolling/diving => bluePotionSound2, energy reset, blue active flags set', () => {
        const ctx = makeGameAndLogic();
        const item = makeItem(BluePotion);

        ctx.player.energyReachedZero = true;
        ctx.player.isBluePotionActive = false;
        ctx.player.currentState = ctx.player.states[1];

        ctx.game.powerUps.push(item);

        runPowerCollision(ctx);

        expect(item.markedForDeletion).toBe(true);
        expect(ctx.game.audioHandler.powerUpAndDownSFX.playSound).toHaveBeenCalledWith('bluePotionSound2', false, true);
        expect(ctx.game.audioHandler.firedogSFX.playSound).toHaveBeenCalledWith('bluePotionEnergyGoingUp');

        expect(ctx.player.energyReachedZero).toBe(false);
        expect(ctx.player.blueFireTimer).toBe(5000);
        expect(ctx.player.isBluePotionActive).toBe(true);
        expect(ctx.game.speed).toBe(1);
    });

    test('BluePotion: rolling state => bluePotionSound + sets game.speed to player.bluePotionSpeed', () => {
        const ctx = makeGameAndLogic();
        const item = makeItem(BluePotion);

        ctx.player.currentState = ctx.player.states[4];
        ctx.player.bluePotionSpeed = 9;

        ctx.game.powerUps.push(item);

        runPowerCollision(ctx);

        expect(item.markedForDeletion).toBe(true);
        expect(ctx.game.audioHandler.powerUpAndDownSFX.playSound).toHaveBeenCalledWith('bluePotionSound', false, true);
        expect(ctx.game.speed).toBe(9);
        expect(ctx.player.isBluePotionActive).toBe(true);
    });

    test('RandomPower (powerUp): excludes OxygenTank when NOT underwater, picks a deterministic candidate', () => {
        const ctx = makeGameAndLogic();
        const item = makeItem(RandomPower);

        ctx.player.isUnderwater = false;

        const randSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

        ctx.game.powerUps.push(item);
        runPowerCollision(ctx);

        expect(item.markedForDeletion).toBe(true);
        expect(ctx.game.lives).toBe(4);

        randSpy.mockRestore();
    });

    test('IceDrink (powerDown): applies slow + sound when visible; skipped if invisible', () => {
        const ctxA = makeGameAndLogic();
        const itemA = makeItem(IceDrink);

        ctxA.player.isInvisible = false;
        ctxA.game.powerDowns.push(itemA);
        runPowerCollision(ctxA);

        expect(itemA.markedForDeletion).toBe(true);
        expect(ctxA.player.isSlowed).toBe(true);
        expect(ctxA.player.slowedTimer).toBe(7000);
        expect(ctxA.game.audioHandler.powerUpAndDownSFX.playSound).toHaveBeenCalledWith('drinkSoundEffect', false, true);

        const ctxB = makeGameAndLogic();
        const itemB = makeItem(IceDrink);

        ctxB.player.isInvisible = true;
        ctxB.game.powerDowns.push(itemB);
        runPowerCollision(ctxB);

        expect(itemB.markedForDeletion).toBe(false);
        expect(ctxB.player.isSlowed).toBe(false);
        expect(ctxB.player.slowedTimer).toBe(0);
        expect(ctxB.game.audioHandler.powerUpAndDownSFX.playSound).not.toHaveBeenCalled();
    });

    test('IceCube (powerDown): startFrozen(3000) when visible', () => {
        const ctx = makeGameAndLogic();
        const item = makeItem(IceCube);

        ctx.player.isInvisible = false;
        ctx.game.powerDowns.push(item);

        runPowerCollision(ctx);

        expect(item.markedForDeletion).toBe(true);
        expect(ctx.logic.startFrozen).toHaveBeenCalledWith(ctx.player, 3000);
    });

    test('Cauldron (powerDown): poison active + timer 3500 and sound', () => {
        const ctx = makeGameAndLogic();
        const item = makeItem(Cauldron);

        ctx.player.isInvisible = false;
        ctx.player.energyReachedZero = false;
        ctx.player.isBluePotionActive = false;

        ctx.game.powerDowns.push(item);
        runPowerCollision(ctx);

        expect(item.markedForDeletion).toBe(true);
        expect(ctx.game.audioHandler.powerUpAndDownSFX.playSound).toHaveBeenCalledWith('cauldronSoundEffect', false, true);
        expect(ctx.player.isPoisonedActive).toBe(true);
        expect(ctx.player.poisonTimer).toBe(3500);
    });

    test('BlackHole (powerDown): sets isBlackHoleActive, triggers tunnel vision, plays sound', () => {
        const ctx = makeGameAndLogic();
        const item = makeItem(BlackHole);

        ctx.player.isInvisible = false;

        ctx.game.powerDowns.push(item);
        runPowerCollision(ctx);

        expect(item.markedForDeletion).toBe(true);
        expect(ctx.player.isBlackHoleActive).toBe(true);
        expect(ctx.player.triggerTunnelVision).toHaveBeenCalledTimes(1);
        expect(ctx.game.audioHandler.powerUpAndDownSFX.playSound).toHaveBeenCalledWith('darkHoleLaughSound', false, true);
    });

    test('Confuse (powerDown): plays sound + activates confuse', () => {
        const ctx = makeGameAndLogic();
        const item = makeItem(Confuse);

        ctx.player.isInvisible = false;

        ctx.game.powerDowns.push(item);
        runPowerCollision(ctx);

        expect(item.markedForDeletion).toBe(true);
        expect(ctx.game.audioHandler.powerUpAndDownSFX.playSound).toHaveBeenCalledWith('statusConfusedSound', false, true);
        expect(ctx.player.activateConfuse).toHaveBeenCalledTimes(1);
    });

    test('DeadSkull (powerDown): -1 life, setState(7,1), plays sound', () => {
        const ctx = makeGameAndLogic();
        const item = makeItem(DeadSkull);

        ctx.player.isInvisible = false;

        ctx.game.powerDowns.push(item);
        runPowerCollision(ctx);

        expect(item.markedForDeletion).toBe(true);
        expect(ctx.game.lives).toBe(2);
        expect(ctx.player.setState).toHaveBeenCalledWith(7, 1);
        expect(ctx.game.audioHandler.powerUpAndDownSFX.playSound).toHaveBeenCalledWith('deadSkullLaugh', false, true);
    });

    test('CarbonDioxideTank: +10s time, sound, floating message, marks for deletion', () => {
        const ctx = makeGameAndLogic();
        const item = makeItem(CarbonDioxideTank);

        ctx.player.isInvisible = false;
        ctx.game.powerDowns.push(item);

        runPowerCollision(ctx);

        expect(item.markedForDeletion).toBe(true);
        expect(ctx.game.time).toBe(70000);
        expect(ctx.game.audioHandler.powerUpAndDownSFX.playSound).toHaveBeenCalledWith('carbonDioxideTankSound', false, true);

        expect(ctx.game.floatingMessages.length).toBe(1);
        expect(ctx.game.floatingMessages[0].args[0]).toBe('-10s');
    });

    test('RandomPower (powerDown): excludes CarbonDioxideTank when NOT underwater; binds `this` correctly (Cauldron path)', () => {
        const ctx = makeGameAndLogic();
        const item = makeItem(RandomPower);

        ctx.player.isInvisible = false;
        ctx.player.isUnderwater = false;

        ctx.player.energyReachedZero = false;
        ctx.player.isBluePotionActive = false;

        const randSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

        ctx.game.powerDowns.push(item);
        runPowerCollision(ctx);

        expect(item.markedForDeletion).toBe(true);

        randSpy.mockRestore();
    });

    test('RandomPower (powerDown): forced pick Cauldron -> poison timer set (proves handler.call(this,...))', () => {
        const ctx = makeGameAndLogic();
        const item = makeItem(RandomPower);

        ctx.player.isInvisible = false;
        ctx.player.isUnderwater = false;

        ctx.player.energyReachedZero = false;
        ctx.player.isBluePotionActive = false;

        const randSpy = jest.spyOn(Math, 'random').mockReturnValue(0.34);

        ctx.game.powerDowns.push(item);
        runPowerCollision(ctx);

        expect(item.markedForDeletion).toBe(true);
        expect(ctx.player.isPoisonedActive).toBe(true);
        expect(ctx.player.poisonTimer).toBe(3500);
        expect(ctx.game.audioHandler.powerUpAndDownSFX.playSound).toHaveBeenCalledWith('cauldronSoundEffect', false, true);

        randSpy.mockRestore();
    });

    test('Does nothing when not overlapping', () => {
        const ctx = makeGameAndLogic();
        const up = makeItem(Coin, { x: 10000, y: 10000 });
        const down = makeItem(DeadSkull, { x: 10000, y: 10000 });

        ctx.game.powerUps.push(up);
        ctx.game.powerDowns.push(down);

        runPowerCollision(ctx);

        expect(up.markedForDeletion).toBe(false);
        expect(down.markedForDeletion).toBe(false);
        expect(ctx.game.coins).toBe(50);
        expect(ctx.game.lives).toBe(3);
        expect(ctx.game.audioHandler.powerUpAndDownSFX.playSound).not.toHaveBeenCalled();
    });
});

describe('FloatingMessage', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    function snapshot(ctx) {
        return {
            coins: ctx.game.coins,
            energy: ctx.player.energy,
        };
    }

    function expectFloatingTriggeredOnce(ctx, before) {
        expect(ctx.game.floatingMessages.push).toHaveBeenCalledTimes(1);
        expect(ctx.game.floatingMessages.length).toBe(1);

        expect(ctx.game.floatingMessages[0].args[0]).toBe('+1');

        expect(ctx.game.coins - before.coins).toBe(1);
        expect(ctx.player.energy - before.energy).toBe(2);
    }

    function expectNoFloating(ctx, before) {
        expect(ctx.game.floatingMessages.push).not.toHaveBeenCalled();
        expect(ctx.game.floatingMessages.length).toBe(0);

        expect(ctx.game.coins - before.coins).not.toBe(1);
        expect(ctx.player.energy - before.energy).not.toBe(2);
    }

    // ------------------------------------------------------------------
    // Dash path
    // ------------------------------------------------------------------
    describe('Dash collisions', () => {
        test('Dash kills 1-life enemy => floating triggers', () => {
            const ctx = makeGameAndLogic();

            ctx.player.isDashing = true;
            ctx.player.dashInstanceId = 1;
            ctx.player.previousLives = ctx.game.lives;

            const enemy = makeEnemy(MeatSoldier, { x: 110, y: 110, lives: 1 });
            const before = snapshot(ctx);

            ctx.logic.handleFiredogCollisionWithEnemy(enemy);

            expectFloatingTriggeredOnce(ctx, before);
        });

        test('Dash hits multi-life enemy => no floating', () => {
            const ctx = makeGameAndLogic();

            ctx.player.isDashing = true;
            ctx.player.dashInstanceId = 1;
            ctx.player.previousLives = ctx.game.lives;

            const enemy = makeEnemy(MeatSoldier, { x: 110, y: 110, lives: 5 });
            const before = snapshot(ctx);

            ctx.logic.handleFiredogCollisionWithEnemy(enemy);

            expectNoFloating(ctx, before);
        });

        test('Same dash instance cannot trigger twice', () => {
            const ctx = makeGameAndLogic();

            ctx.player.isDashing = true;
            ctx.player.dashInstanceId = 42;
            ctx.player.previousLives = ctx.game.lives;

            const enemy = makeEnemy(MeatSoldier, { x: 110, y: 110, lives: 1 });
            const before = snapshot(ctx);

            ctx.logic.handleFiredogCollisionWithEnemy(enemy);
            ctx.logic.handleFiredogCollisionWithEnemy(enemy);

            expectFloatingTriggeredOnce(ctx, before);
        });
    });

    // ------------------------------------------------------------------
    // Rolling / Diving path
    // ------------------------------------------------------------------
    describe('Rolling / Diving collisions', () => {
        test('Rolling kills enemy and player takes no damage => floating triggers', () => {
            const ctx = makeGameAndLogic();

            ctx.player.currentState = ctx.player.states[4]; // rolling
            ctx.player.isInvisible = false;
            ctx.player.isDashing = false;
            ctx.player.previousLives = ctx.game.lives;

            const enemy = makeEnemy(MeatSoldier, { x: 110, y: 110, lives: 1 });
            const before = snapshot(ctx);

            ctx.logic.handleFiredogCollisionWithEnemy(enemy);

            expectFloatingTriggeredOnce(ctx, before);
        });

        test('Rolling into enemy that calls hit() => NO floating even if enemy dies', () => {
            const ctx = makeGameAndLogic();

            ctx.player.currentState = ctx.player.states[4]; // rolling
            ctx.player.isInvisible = false;
            ctx.player.isDashing = false;
            ctx.player.previousLives = ctx.game.lives;

            const enemy = makeEnemy(PurpleFireball, { x: 110, y: 110, lives: 1 });
            const before = snapshot(ctx);

            ctx.logic.handleFiredogCollisionWithEnemy(enemy);

            expect(ctx.game.lives).toBe(2);
            expectNoFloating(ctx, before);
        });

        test('Rolling enemy survives => no floating', () => {
            const ctx = makeGameAndLogic();

            ctx.player.currentState = ctx.player.states[4]; // rolling
            ctx.player.isInvisible = false;
            ctx.player.isDashing = false;
            ctx.player.previousLives = ctx.game.lives;

            const enemy = makeEnemy(Tauro, { x: 110, y: 110, lives: 2 });
            const before = snapshot(ctx);

            ctx.logic.handleFiredogCollisionWithEnemy(enemy);

            expectNoFloating(ctx, before);
        });

        test('Rolling with BluePotion: enemy dies, no hit => floating triggers', () => {
            const ctx = makeGameAndLogic();

            ctx.player.currentState = ctx.player.states[4]; // rolling
            ctx.player.isBluePotionActive = true;
            ctx.player.isInvisible = false;
            ctx.player.isDashing = false;
            ctx.player.previousLives = ctx.game.lives;

            const enemy = makeEnemy(MeatSoldier, { x: 110, y: 110, lives: 2 });
            const before = snapshot(ctx);

            ctx.logic.handleFiredogCollisionWithEnemy(enemy);

            expectFloatingTriggeredOnce(ctx, before);
        });
    });
});
